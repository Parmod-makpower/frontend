import { useEffect, useState } from "react";
import { fetchSSUsers, toggleSSStatus, deleteSSUser, updateSSUser } from "../../auth/useSS";
import UserTable from "../../components/UserTable";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa";
import MobilePageHeader from "../../components/MobilePageHeader";

export default function CRMSSListPage() {
  const [ssList, setSSList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  const loadSS = async () => {
    const data = await fetchSSUsers();
    setSSList(data);
  };

  useEffect(() => {
    loadSS();
  }, []);

  const handleEdit = (user) => {
    navigate("/crm-ss/add", { state: { editData: user } });
  };

  const handleToggle = async (id, currentStatus) => {
    await toggleSSStatus(id, !currentStatus);
    toast.success(currentStatus ? "User deactivated" : "User activated");
    loadSS();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteSSUser(id);
      toast.success("User deleted");
      loadSS();
    }
  };

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
            loadSS();
          } catch {
            toast.error("Password update failed");
          }
        }}
      />
    </div>
  );
}
