// 📁 src/components/BottomNav.jsx
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaGift,
  FaShoppingCart,
  FaListUl,
  FaBox,
  FaUsers,
  FaHistory,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem("selectedProducts");
      const parsed = saved ? JSON.parse(saved) : [];
      setCartCount(parsed.length);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const isAdmin = user?.role === "ADMIN";
  const isCrm = user?.role === "CRM";
  const isSs = user?.role === "SS";
  const isDs = user?.role === "DS";

  // Common items sabko milेंगे
  const baseItems = [
    { path: "/home", icon: <FaHome />, label: "Home" },
    
    { path: "/more", icon: <FaListUl />, label: "More" },
  ];

  // Cart सिर्फ SS को (Admin & CRM को नहीं)
  const cartItem =
    (isSs || isDs) && {
      path: "/cart",
      icon: (
        <div className="relative">
          <FaShoppingCart />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {cartCount}
            </span>
          )}
        </div>
      ),
      label: "Cart",
    };

  // Role-specific items
  const roleItems = {
    SS: [
      { path: "/user-schemes", icon: <FaGift />, label: "Schemes" },
      { path: "/all-categories", icon: <FaBox />, label: "Category" },
      cartItem,
    ],
    DS: [
      { path: "/user-schemes", icon: <FaGift />, label: "Schemes" },
      { path: "/all-categories", icon: <FaBox />, label: "Category" },
      cartItem,
    ],
    CRM: [
       { path: "/user-schemes", icon: <FaGift />, label: "Schemes" },
      { path: "/crm/orders", icon: <FaBox />, label: "Orders" },
      { path: "/all/orders-history", icon: <FaHistory />, label: "History" },
    ],
    ADMIN: [
      { path: "/schemes", icon: <FaGift />, label: "Schemes" },
      { path: "/all/orders-history", icon: <FaBox />, label: "Orders" },
      { path: "/admin/crm", icon: <FaUsers />, label: "Users" },
    ],
  };

  // Final items = base + role-specific
  const finalMenu = [
    baseItems[0], // Home
    ...(roleItems[user?.role] || []),
    ...baseItems.slice(1), // Schemes + More
  ].filter(Boolean);

  return (
    <div className="flex justify-around items-center mb-0 py-4 rounded-t-2xl px-3 bg-white  shadow-[0_-4px_6px_rgba(0,0,0,0.1)]">
      {finalMenu.map((item, idx) => (
        <NavLink
          key={idx}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center text-[11px] text-gray-600 hover:text-purple-600 transition-colors duration-150 ${
              isActive ? "text-red-500 font-semibold" : ""
            }`
          }
        >
          <div className="text-2xl mb-0.5">{item.icon}</div>
          <span className="leading-none">{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
