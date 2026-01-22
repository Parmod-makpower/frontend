import { useState, useMemo, useEffect } from "react";
import {
  useCachedSSUsers,
  toggleSSStatus,
  updateSSUser,
} from "../../auth/useSS";
import UserTable from "../../components/UserTable";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import MobilePageHeader from "../../components/MobilePageHeader";
import { useAuth } from "../../context/AuthContext";

const ROLE_OPTIONS = ["ALL", "SS", "DS", "ASM", "CRM"];
const ROLE_STORAGE_KEY = "users_selected_role";

export default function AllUsersList() {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedRole, setSelectedRole] = useState(() => {
    return localStorage.getItem(ROLE_STORAGE_KEY) || "ALL";
  });

  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: ssList = [],
    isLoading,
    error,
    refetch,
  } = useCachedSSUsers();

  useEffect(() => {
    localStorage.setItem(ROLE_STORAGE_KEY, selectedRole);
  }, [selectedRole]);

  // ✅ Search + Role Filter
 const filteredList = useMemo(() => {
  const term = searchTerm.toLowerCase();

  return ssList
    .filter((u) => {
      const roleMatch =
        selectedRole === "ALL" || u.role === selectedRole;

      const partyName = u.party_name?.toLowerCase() || "";
      const mobile = u.mobile?.toString() || "";
      const user_id = u.user_id?.toString() || "";

      const searchMatch =
        !term ||
        partyName.includes(term) ||
        mobile.includes(searchTerm) ||
        user_id.includes(searchTerm);

      return roleMatch && searchMatch;
    })
    .sort((a, b) => {
      const nameA = a.party_name?.toLowerCase() || "";
      const nameB = b.party_name?.toLowerCase() || "";
      return nameA.localeCompare(nameB);
    });
}, [searchTerm, selectedRole, ssList]);


  const handleEdit = (user) => {
    navigate("/add-new-user", { state: { editData: user } });
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await toggleSSStatus(id, !currentStatus);
      toast.success(
        currentStatus ? "User deactivated" : "User activated"
      );
      refetch();
    } catch {
      toast.error("Failed to toggle status");
    }
  };


  if (isLoading) return <p className="p-4 text-sm">Loading users...</p>;
  if (error)
    return (
      <p className="p-4 text-sm text-red-500">
        Failed to load users
      </p>
    );

  return (
    <div className="p-3 sm:p-4">
      <MobilePageHeader title="Super Stockist" />

      {/* 🔍 Toolbar */}
      <div className="sm:pt-0 pt-[60px] mb-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Search Party / Mobile"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-2 rounded text-sm w-full sm:w-1/2 focus:outline-none focus:ring-1 focus:ring-green-500"
          />

          {/* Role Select */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border px-3 py-2 rounded text-sm bg-white cursor-pointer w-full sm:w-32"
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          {/* Add Button */}
          {user?.role === "ADMIN" && (<button
            onClick={() => navigate("/add-new-user")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm flex items-center justify-center w-full sm:w-auto"
          >
            + Add User
          </button>)}
          
        </div>
      </div>

      {/* Users Table */}
      <UserTable
        user={user}
        list={filteredList}
        onEdit={handleEdit}
        onToggleStatus={handleToggle}
        onChangePassword={(user) => {
          setSelectedUser(user);
          setShowModal(true);
        }}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={async (newPass) => {
          try {
            await updateSSUser(selectedUser.id, {
              password: newPass,
            });
            toast.success("Password updated");
            setShowModal(false);
            refetch();
          } catch {
            toast.error("Password update failed");
          }
        }}
      />
    </div>
  );
}
