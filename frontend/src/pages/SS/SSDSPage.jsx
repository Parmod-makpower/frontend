import { useEffect, useState } from "react";
import {
  fetchDSUsers,
  createDSUser,
  updateDSUser,
  toggleDSStatus,
} from "../../auth/useDS";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import UserForm from "../../components/UserForm";
import UserTable from "../../components/UserTable";

export default function SSDSPage() {
  const [dsList, setDSList] = useState([]);
  const [form, setForm] = useState({
    id: null,
    mobile: "",
    password: "",
    name: "",
    email: "",
    party_name: "",
    dob: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadDS = async () => {
    const data = await fetchDSUsers();
    setDSList(data);
  };

  useEffect(() => {
    loadDS();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const extractErrors = (err) => {
    const response = err.response?.data;
    if (!response) return { non_field_errors: ["Something went wrong."] };

    const formatted = {};
    for (let key in response) {
      formatted[key] = Array.isArray(response[key])
        ? response[key]
        : [String(response[key])];
    }
    return formatted;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      let payload = { ...form };
      if (!payload.password?.trim()) delete payload.password;

      if (form.id) {
        await updateDSUser(form.id, payload);
      } else {
        await createDSUser(payload);
      }

      setForm({
        id: null,
        mobile: "",
        password: "",
        name: "",
        email: "",
        party_name: "",
        dob: "",
      });
      await loadDS();
    } catch (err) {
      setErrors(extractErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setForm({
      id: user.id,
      mobile: user.mobile,
      password: "",
      name: user.name || "",
      email: user.email || "",
      party_name: user.party_name || "",
      dob: user.dob || "",
    });
    setErrors({});
  };

  const handleToggle = async (id, currentStatus) => {
    await toggleDSStatus(id, !currentStatus);
    await loadDS();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Distributor Management</h2>

      {errors.non_field_errors && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4 max-w-3xl">
          {errors.non_field_errors.map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </div>
      )}

      <UserForm
        form={form}
        errors={errors}
        loading={loading}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isEditMode={Boolean(form.id)}
        onOpenChangePassword={() => {
          setSelectedUser(form);
          setShowModal(true);
        }}
      />

      <UserTable
        list={dsList}
        onEdit={handleEdit}
        onToggleStatus={handleToggle}
        columns={[
          { label: "ID", key: "user_id" },
          { label: "Mobile", key: "mobile" },
          { label: "Name", key: "name" },
          { label: "Party Name", key: "party_name" },
          { label: "Status", key: "is_active" },
        ]}
        idKey="id"
        userIdKey="user_id"
        isActiveKey="is_active"
      />

      <ChangePasswordModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={async (newPass) => {
          try {
            if (!newPass.trim()) {
              alert("Password cannot be empty.");
              return;
            }
            await updateDSUser(selectedUser.id, { password: newPass });
            alert("Password updated successfully");
            setShowModal(false);
            await loadDS();
          } catch (err) {
            alert("Password update failed");
          }
        }}
      />
    </div>
  );
}
