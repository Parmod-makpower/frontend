import { useState } from "react";
import { FaLock, FaTimes, FaSave } from "react-icons/fa";

export default function ChangePasswordModal({ isOpen, onClose, onSave }) {
  const [newPassword, setNewPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPassword) return alert("Please enter a new password");
    onSave(newPassword);
    setNewPassword("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <FaTimes />
        </button>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaLock /> Change Password
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <FaSave /> Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
