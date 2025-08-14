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

  const loadCrm = async () => {
    const data = await fetchCRMUsers();
    setCrmList(data);
  };

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

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await createCRMUser({ mobile, password, name, email });
      resetForm();
      await loadCrm();
    } catch (err) {
      setErrors(extractErrors(err));
    } finally {
      setLoading(false);
    }
  };

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
      setErrors(extractErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    await toggleCRMStatus(id, !currentStatus);
    await loadCrm();
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setMobile(user.mobile);
    setName(user.name || "");
    setEmail(user.email || "");
    setPassword("");
    setErrors({});
  };

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
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">CRM User Management</h2>

      {errors.non_field_errors && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
          {errors.non_field_errors.map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white shadow-md rounded-lg p-5 mb-8">
        <h3 className="text-lg font-semibold mb-4">
          {editingUser ? "Edit CRM User" : "Add New CRM User"}
        </h3>

        <form
          onSubmit={editingUser ? handleUpdate : handleCreate}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <input
              type="text"
              placeholder="Full Name"
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
              placeholder="Mobile Number"
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
              placeholder="Email"
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
              {errors.password && <p className="text-red-600 text-sm">{errors.password[0]}</p>}
            </div>
          )}

          <div className="col-span-1 md:col-span-2 flex gap-3 mt-2">
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded text-white ${
                editingUser
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading
                ? editingUser
                  ? "Updating..."
                  : "Creating..."
                : editingUser
                ? "Update User"
                : "Add User"}
            </button>

            {editingUser && (
              <>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(editingUser);
                    setShowModal(true);
                  }}
                  className="px-5 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Change Password
                </button>
              </>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Mobile</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {crmList.map((crm, idx) => (
              <tr
                key={crm.id}
                className={`border-b hover:bg-gray-50 ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="p-3">{crm.user_id}</td>
                <td className="p-3">{crm.name || "-"}</td>
                <td className="p-3">{crm.mobile}</td>
                <td className="p-3">{crm.email || "-"}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm ${
                      crm.is_active ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {crm.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3 flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleEdit(crm)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggle(crm.id, crm.is_active)}
                    className={`px-3 py-1 rounded text-white ${
                      crm.is_active ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {crm.is_active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ChangePasswordModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={async (newPass) => {
          try {
            await updateCRMUser(selectedUser.id, { password: newPass });
            alert("Password updated successfully");
            setShowModal(false);
            await loadCrm();
          } catch {
            alert("Failed to update password");
          }
        }}
      />
    </div>
  );
}
