// src/pages/crm/CRMASMListPage.jsx
import { useState, useMemo } from "react";
import { useCachedASMUsers, toggleASMStatus, deleteASMUser, updateASMUser } from "../../auth/useASM";
import UserTable from "../../components/UserTable";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa";
import MobilePageHeader from "../../components/MobilePageHeader";
import { useAuth } from "../../context/AuthContext";
import AsmTable from "../../components/ASM/AsmTable";

export default function CRMASMListPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: asmList = [], isLoading, error, refetch } = useCachedASMUsers();

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return asmList;
    return asmList.filter(u =>
      (u.party_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.mobile || "").includes(searchTerm)
    );
  }, [searchTerm, asmList]);

  const handleEdit = (user) => {
    navigate("/crm-asm/add", { state: { editData: user } });
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await toggleASMStatus(id, !currentStatus);
      toast.success(currentStatus ? "ASM deactivated" : "ASM activated");
      refetch();
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this ASM?")) {
      try {
        await deleteASMUser(id);
        toast.success("ASM deleted");
        refetch();
      } catch {
        toast.error("Failed to delete ASM");
      }
    }
  };

  if (isLoading) return <p className="p-4">Loading ASMs...</p>;
  if (error) return <p className="p-4 text-red-500">Failed to load ASMs</p>;

  return (
    <div className="p-4">
      <MobilePageHeader title="Area Sales Managers" />
      {/* Uncomment add button if needed */}
      <button onClick={() => navigate("/crm-asm/add")} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 mb-2 rounded">
        <FaPlus /> Add ASM
      </button>

      <div className="sm:pt-0 pt-[60px] mb-4">
        <input
          type="text"
          placeholder="Search by Party Name or Mobile"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      <AsmTable
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

      <ChangePasswordModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={async (newPass) => {
          try {
            await updateASMUser(selectedUser.id, { password: newPass });
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
