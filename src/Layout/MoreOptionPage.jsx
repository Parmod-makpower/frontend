// pages/MoreOptionsPage.jsx
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaInfoCircle,
  FaCogs,
  FaHistory,
  FaUsers,
} from "react-icons/fa";
import { IoChevronBack } from "react-icons/io5";
import InstallButtons from "../components/InstallButtons";

export default function MoreOptionsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const options = [
    {
      label: "Settings",
      icon: <FaCogs className="text-blue-500" />,
      action: () => navigate("/settings"),
    },
    {
      label: "History",
      icon: <FaHistory className="text-purple-500" />,
      action: () => navigate("/history"),
    },
    {
      label: "Users",
      icon: <FaUsers className="text-green-600" />,
      action: () => navigate("/users"),
    },
    {
      label: "Help / Info",
      icon: <FaInfoCircle className="text-yellow-500" />,
      action: () => alert("Help section coming soon"),
    },
    {
      label: "Logout",
      icon: <FaSignOutAlt className="text-red-500" />,
      action: handleLogout,
      danger: true,
    },
  ];

  return (
    <div className="max-w-md mx-auto  px-4 relative">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white p-3 border-b border-gray-200 shadow-sm sm:static sm:mx-4 sm:rounded-md sm:shadow-md sm:border transition-all duration-200 ease-in-out">
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.history.back()}
            className="text-gray-700 hover:text-blue-600 text-xl px-1 transition-transform hover:scale-105"
            aria-label="Back"
          >
            <IoChevronBack />
          </button>
          <span className="text-lg sm:text-xl font-semibold text-gray-800">
            More Options
          </span>
        </div>
      </div>


      {/* User Info */}
     {/* Profile Section */}
<div className="relative mb-6 pt-[60px] sm:pt-4 ">
  
  <div className="bg-white border border-gray-200 rounded-xl  p-4 flex items-start gap-4">
    <div className="relative">
      <FaUserCircle className="text-6xl text-purple-600" />
      {/* Optional badge or edit icon */}
      <div className="absolute top-1 right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white" />
    </div>
    <div className="">
      <div className="text-lg font-bold text-gray-800">{user?.name}</div>
      <div className="text-sm text-gray-700"> {user?.mobile}</div>
      {/* <div className="text-sm text-gray-600">✉️ {user?.email}</div> */}
      <div className="text-xs text-gray-400">ID {user?.user_id}</div>
    </div>
  </div>
</div>


      {/* Options */}
      <div className="space-y-3">
       {options.map(({ label, icon, action, danger }, idx) => (
  <button
    key={idx}
    onClick={action}
    className={`w-full flex items-center gap-4 p-4 rounded-lg border shadow-sm transition-all duration-150 ${
      danger
        ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100 active:bg-red-200"
        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100"
    }`}
  >
    {icon}
    <span className="text-base font-medium">{label}</span>
  </button>
))}

      <InstallButtons />

      </div>
    </div>
  );
}
