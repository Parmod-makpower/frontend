// pages/MoreOptionsPage.jsx
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt, FaInfoCircle, FaCogs } from "react-icons/fa";
import { IoChevronBack } from "react-icons/io5";

export default function MoreOptionsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="max-w-md mx-auto py-6 px-4">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white px-3 py-2 border-b border-gray-300 shadow-[0_2px_2px_-2px_rgba(0,0,0,0.2)] sm:static sm:mx-4 sm:rounded-md sm:shadow-md sm:border sm:border-gray-200 transition-all duration-200 ease-in-out">
  <div className="flex items-center gap-2">
    <button
      onClick={() => window.history.back()}
      className="text-gray-700 hover:text-blue-600 text-xl sm:text-xl font-bold px-1  transition-transform hover:scale-105"
      aria-label="Back"
    >
     <IoChevronBack  />
    </button>
    <span className="text-lg sm:text-xl font-semibold text-gray-800">Profile</span>
  </div>
</div>

 
      <div className="flex items-center gap-4 mb-6 pt-[60px] sm:pt-0 ">
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