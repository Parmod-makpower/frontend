// 📁 pages/MoreOptionsPage.jsx
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaInfoCircle,
  FaUsers,
  FaChartLine,
  FaBox,
  FaBan,
  FaHourglassHalf,
  FaRoute,
  FaBoxOpen,
} from "react-icons/fa";
import MobilePageHeader from "../components/MobilePageHeader";
import StockSelector from "../components/StockSelector";
import { FaWarehouse } from "react-icons/fa";


export default function MoreOptionsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
  logout(() => {
    navigate("/login");
  });
};


  // ✅ role आधारित options
  const options = [
    ...(user?.role === "CRM"
      ? [
          {
            label: "Users",
            icon: <FaUsers className="text-green-600" />,
            action: () => navigate("/all-users/list"),
          },
          {
            label: "Create Order",
            icon: <FaBoxOpen className="text-orange-600" />,
            action: () => navigate("/crm/create-order"),
          },
          {
            label: "Available Stock",
            icon: <FaChartLine className="text-orange-600" />,
            action: () => navigate("/not-in-stock-reports"),
          },
        ]
      : []),
    ...(user?.role === "ADMIN"
      ? [
        {
            label: "Pending Orders",
            icon: <FaHourglassHalf className="text-red-600" />,
            action: () => navigate("/admin/pending-orders"),
          },
        {
            label: "Track-Orders",
            icon: <FaRoute className="text-red-600" />,
            action: () => navigate("/orders-tracking"),
          },
         {
            label: "Products",
            icon: <FaBox className="text-green-600" />,
            action: () => navigate("/products"),
          },
          {
            label: "Inactive Products",
            icon: <FaBan className="text-red-600" />,
            action: () => navigate("/inactive"),
          },
          {
            label: "Sale Name",
            icon: <FaBox className="text-yellow-600" />,
            action: () => navigate("/sale-name"),
          },
          
        ]
      : []),
    ...(user?.role === "SS"
      ? [
          {
            label: "My Order",
            icon: <FaBox className="text-orange-600" />,
            action: () => navigate("/ss/history"),
          },
         
        ]
      : []),
    ...(user?.role === "DS"
      ? [
          {
            label: "My Order",
            icon: <FaBox className="text-orange-600" />,
            action: () => navigate("/ds/my-orders"),
          },
         
        ]
      : []),
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
    <div className="max-w-md mx-auto px-4 relative mb-50">
      {/* Header */}
      <MobilePageHeader title="More Options" />

      {/* Profile Section */}
      <div className="relative my-6 pt-[60px] sm:pt-4 ">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4">
          <div className="relative">
            <FaUserCircle className="text-6xl text-[#fc250c]" />
            <div className="absolute top-1 right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-800">{user?.name}</div>
            <div className="text-xs text-gray-700">{user?.mobile}</div>
            <div className="text-xs text-gray-400">ID {user?.user_id}</div>
          </div>
        </div>
      </div>
      {/* 🏬 Stock Selector */}
<div className="my-4">
  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
    <div className="flex items-center gap-3">
      <FaWarehouse className="text-blue-600 text-xl" />
      <div>
        <div className="text-sm font-semibold text-gray-800">
          Select Stock Type
        </div>
        <div className="text-xs text-gray-500">
          Order will be placed from selected stock
        </div>
      </div>
    </div>

    {/* Dropdown */}
    <div>
      <StockSelector />
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
                ? "bg-red-50 border-red-200 text-[#fc250c] hover:bg-red-100 active:bg-red-200"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100"
            }`}
          >
            {icon}
            <span className="text-base font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
