import { useEffect, useState } from "react";
import {
  fetchSSUsers,
  createSSUser,
  updateSSUser,
  toggleSSStatus,
} from "../auth/useSS";
import ChangePasswordModal from "../components/ChangePasswordModal";
import UserForm from "../components/UserForm";
import UserTable from "../components/UserTable";

export default function CRMSSPage() {
  const [ssList, setSSList] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: "",
    mobile: "",
    password: "",
    email: "",
    party_name: "",
    dob: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadSS = async () => {
    const data = await fetchSSUsers();
    setSSList(data);
  };

  useEffect(() => {
    loadSS();
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
        await updateSSUser(form.id, payload);
      } else {
        await createSSUser(payload);
      }

      setForm({
        id: null,
        name: "",
        mobile: "",
        password: "",
        email: "",
        party_name: "",
        dob: "",
      });
      await loadSS();
    } catch (err) {
      setErrors(extractErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setForm({
      id: user.id,
      name: user.name || "",
      mobile: user.mobile || "",
      password: "",
      email: user.email || "",
      party_name: user.party_name || "",
      dob: user.dob || "",
    });
    setErrors({});
  };

  const handleToggle = async (id, currentStatus) => {
    await toggleSSStatus(id, !currentStatus);
    await loadSS();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Super Stockist Management</h2>

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
        list={ssList}
        onEdit={handleEdit}
        onToggleStatus={handleToggle}
        columns={[
          { label: "ID", key: "user_id" },
          { label: "Name", key: "name" },
          { label: "Mobile", key: "mobile" },
          { label: "Status", key: "is_active" }, // will display true/false, you can tweak UserTable to display Active/Inactive if you want
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
            await updateSSUser(selectedUser.id, { password: newPass });
            alert("Password updated successfully");
            setShowModal(false);
            await loadSS();
          } catch (err) {
            alert("Password update failed");
            console.error("Password Error:", JSON.stringify(err.response?.data, null, 2));
          }
        }}
      />
    </div>
  );
}
