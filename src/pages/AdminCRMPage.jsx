import { useEffect, useState } from "react";
import {
  fetchCRMUsers,
  createCRMUser,
  toggleCRMStatus,
  updateCRMUser,
} from "../auth/useCRM";
import ChangePasswordModal from "../components/ChangePasswordModal";

export default function AdminCRMPage() {
  const [crmList, setCrmList] = useState([]);
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [editingUser, setEditingUser] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // ✅ सभी CRM यूज़र्स लाना
  const loadCrm = async () => {
    const data = await fetchCRMUsers();
    setCrmList(data);
  };

  // ✅ Error format करने का helper
  const extractErrors = (err) => {
    const response = err.response?.data;
    if (!response) return { non_field_errors: ["Unknown error occurred."] };

    const formatted = {};
    for (let key in response) {
      formatted[key] = Array.isArray(response[key])
        ? response[key]
        : [String(response[key])];
    }
    return formatted;
  };

  // ✅ नया CRM यूज़र बनाना
  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await createCRMUser({ mobile, password, name, email });
      resetForm();
      await loadCrm();
    } catch (err) {
      console.error("Error creating CRM user:", err.response?.data);
      setErrors(extractErrors(err));
    } finally {
      setLoading(false);
    }
  };

  // ✅ CRM यूज़र अपडेट करना
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await updateCRMUser(editingUser.id, {
        mobile,
        name,
        email,
        password: password || undefined,
      });
      resetForm();
      await loadCrm();
    } catch (err) {
      console.error("Error updating CRM user:", err.response?.data);
      setErrors(extractErrors(err));
    } finally {
      setLoading(false);
    }
  };

  // ✅ स्टेटस बदलना
  const handleToggle = async (id, currentStatus) => {
    await toggleCRMStatus(id, !currentStatus);
    await loadCrm();
  };

  // ✅ एडिट मोड में फॉर्म भरना
  const handleEdit = (user) => {
    setEditingUser(user);
    setMobile(user.mobile);
    setName(user.name || "");
    setEmail(user.email || "");
    setPassword("");
    setErrors({});
  };

  // ✅ फॉर्म रीसेट करना
  const resetForm = () => {
    setMobile("");
    setName("");
    setEmail("");
    setPassword("");
    setEditingUser(null);
    setErrors({});
  };

  useEffect(() => {
    loadCrm();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">CRM User Management (Admin Panel)</h2>

      {/* ✅ Non-field errors show करना */}
      {errors.non_field_errors && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
          {errors.non_field_errors.map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </div>
      )}

      {/* ✅ Create / Update Form */}
      <form
        onSubmit={editingUser ? handleUpdate : handleCreate}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-w-2xl"
      >
        <div>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
          {errors.name && <p className="text-red-600 text-sm">{errors.name[0]}</p>}
        </div>

        <div>
          <input
            type="text"
            placeholder="Mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
          {errors.mobile && <p className="text-red-600 text-sm">{errors.mobile[0]}</p>}
        </div>

        <div>
          <input
            type="email"
            placeholder="Email (Optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
          {errors.email && <p className="text-red-600 text-sm">{errors.email[0]}</p>}
        </div>

      {!editingUser && (
  <div>
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="border p-2 rounded w-full"
      required
    />
    {errors.password && (
      <p className="text-red-600 text-sm">{errors.password[0]}</p>
    )}
  </div>
)}



        <div className="col-span-2 flex gap-4">
          <button
            type="submit"
            className={`${editingUser
                ? "bg-yellow-600 hover:bg-yellow-700"
                : "bg-blue-600 hover:bg-blue-700"
              } text-white px-4 py-2 rounded`}
            disabled={loading}
          >
            {loading
              ? editingUser
                ? "Updating..."
                : "Creating..."
              : editingUser
                ? "Update CRM"
                : "Add CRM"}
          </button>
          {editingUser && (

            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            
          )}
          {editingUser && (
 <button
  type="button"
  onClick={() => {
    setSelectedUser(editingUser);
    setShowModal(true);
  }}
  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
>
  Change Password
</button>

)}

        </div>
      </form>

      {/* ✅ CRM User List */}
      <table className="w-full text-left border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Mobile</th>
            <th className="p-2">Email</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
           
          </tr>
        </thead>
        <tbody>
          {crmList.map((crm) => (
            <tr key={crm.id} className="border-t">
              <td className="p-2">{crm.user_id}</td>
              <td className="p-2">{crm.name || "-"}</td>
              <td className="p-2">{crm.mobile}</td>
              <td className="p-2">{crm.email || "-"}</td>
              <td className="p-2">{crm.is_active ? "Active" : "Inactive"}</td>
              <td className="p-2 flex gap-2">
                <button
                  onClick={() => handleEdit(crm)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggle(crm.id, crm.is_active)}
                  className={`px-3 py-1 rounded ${crm.is_active ? "bg-red-500" : "bg-green-600"
                    } text-white`}
                >
                  {crm.is_active ? "Deactivate" : "Activate"}
                </button>
                
              </td>
             
            </tr>
          ))}
        </tbody>
      </table>
      <ChangePasswordModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSave={async (newPass) => {
    try {
      await updateCRMUser(selectedUser.id, { password: newPass });
      alert("Password updated successfully");
      setShowModal(false);
      await loadCrm();
    } catch (err) {
      alert("Failed to update password");
      console.error(err);
    }
  }}
/>

    </div>
  );
}
