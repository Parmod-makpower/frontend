// pages/MoreOptionsPage.jsx
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt, FaInfoCircle, FaCogs } from "react-icons/fa";

export default function MoreOptionsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="max-w-md mx-auto py-6 px-4">
      <div className="flex items-center gap-4 mb-6">
        <FaUserCircle className="text-4xl text-blue-600" />
        <div>
          <div className="text-lg font-semibold">Role: {user?.role}</div>
          <div className="text-sm text-gray-600">User ID: {user?.user_id}</div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          className="w-full flex items-center gap-3 p-4 rounded bg-white border hover:bg-gray-50 text-gray-700 shadow"
          onClick={() => alert("Feature coming soon")}
        >
          <FaCogs className="text-lg" /> Settings
        </button>

        <button
          className="w-full flex items-center gap-3 p-4 rounded bg-white border hover:bg-gray-50 text-gray-700 shadow"
          onClick={() => alert("Help section coming soon")}
        >
          <FaInfoCircle className="text-lg" /> Help / Info
        </button>

        <button
          className="w-full flex items-center gap-3 p-4 rounded bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 shadow"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="text-lg" /> Logout
        </button>
      </div>
    </div>
  );
}