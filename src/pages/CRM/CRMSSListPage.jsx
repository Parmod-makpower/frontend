import { useState } from "react";
import { useCachedSSUsers, toggleSSStatus, deleteSSUser, updateSSUser } from "../../auth/useSS";
import UserTable from "../../components/UserTable";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa";
import MobilePageHeader from "../../components/MobilePageHeader";

export default function CRMSSListPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  // ✅ useQuery से users लाना
  const { data: ssList = [], isLoading, error, refetch } = useCachedSSUsers();

  const handleEdit = (user) => {
    navigate("/crm-ss/add", { state: { editData: user } });
  };

  const handleToggle = async (id, currentStatus) => {
    await toggleSSStatus(id, !currentStatus);
    toast.success(currentStatus ? "User deactivated" : "User activated");
    refetch(); // ✅ cache invalidate कर दो
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteSSUser(id);
      toast.success("User deleted");
      refetch(); // ✅ दुबारा लोड करो
    }
  };

  if (isLoading) return <p className="p-4">Loading users...</p>;
  if (error) return <p className="p-4 text-red-500">Failed to load users</p>;

  return (
    <div className="p-4">
      <MobilePageHeader title="Super Stockist"/>
      <div className="flex justify-between items-center mb-4 sm:pt-0 pt-[60px]">
        <button
          onClick={() => navigate("/crm-ss/add")}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          <FaPlus /> Add User
        </button>
      </div>

      <UserTable
        list={ssList}
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
