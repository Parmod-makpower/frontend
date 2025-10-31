import { useState, useMemo } from "react";
import { useCachedSSUsers, toggleSSStatus, deleteSSUser, updateSSUser } from "../../auth/useSS";
import UserTable from "../../components/UserTable";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa";
import MobilePageHeader from "../../components/MobilePageHeader";
import { useAuth } from "../../context/AuthContext";

export default function CRMSSListPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  // ✅ useQuery से users लाना
  const { data: ssList = [], isLoading, error, refetch } = useCachedSSUsers();

  // ✅ Search filter (party name OR mobile)
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return ssList;
    return ssList.filter(user =>
      user.party_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobile.includes(searchTerm)
    );
  }, [searchTerm, ssList]);

  const handleEdit = (user) => {
    navigate("/crm-ss/add", { state: { editData: user } });
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await toggleSSStatus(id, !currentStatus);
      toast.success(currentStatus ? "User deactivated" : "User activated");
      refetch(); // ✅ cache invalidate
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteSSUser(id);
        toast.success("User deleted");
        refetch(); // ✅ refresh list
      } catch {
        toast.error("Failed to delete user");
      }
    }
  };

  if (isLoading) return <p className="p-4">Loading users...</p>;
  if (error) return <p className="p-4 text-red-500">Failed to load users</p>;

  return (
    <div className="p-4">
      <MobilePageHeader title="Super Stockist" />
      {/* <button
        onClick={() => navigate("/crm-ss/add")}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 mb-2 rounded"
      >
        <FaPlus /> Add User
      </button> */}
      {/* Search Input */}
      <div className="sm:pt-0 pt-[60px] mb-4">
        <input
          type="text"
          placeholder="Search by Party Name or Mobile"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>



      {/* Users Table */}
      <UserTable
        user={user}
        list={filteredList}
        onEdit={handleEdit}
        onToggleStatus={handleToggle}
        onDelete={handleDelete}
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
            await updateSSUser(selectedUser.id, { password: newPass });
            toast.success("Password updated");
            setShowModal(false);
            refetch(); // ✅ fresh data
          } catch {
            toast.error("Password update failed");
          }
        }}
      />
    </div>
  );
}
