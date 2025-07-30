// pages/MoreOptionsPage.js

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaHistory,
  FaUsers,
  FaSignOutAlt,
} from "react-icons/fa";

export default function MoreOptionsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="py-4">
      <h2 className="text-xl font-semibold mb-4">More Options</h2>

      <div className="space-y-3">
        <button
          onClick={() => navigate("/history")}
          className="w-full flex items-center gap-3 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          <FaHistory /> Order History
        </button>

        {user.role === "ADMIN" && (
          <button
            onClick={() => navigate("/admin/crm")}
            className="w-full flex items-center gap-3 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            <FaUsers /> CRM
          </button>
        )}
        {user.role === "CRM" && (
          <button
            onClick={() => navigate("/crm/ss")}
            className="w-full flex items-center gap-3 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            <FaUsers /> Super Stockist
          </button>
        )}
        {user.role === "SS" && (
          <button
            onClick={() => navigate("/ss/ds")}
            className="w-full flex items-center gap-3 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            <FaUsers /> Distributer
          </button>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
}
