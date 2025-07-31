// 📁 Updated: BottomNav.jsx
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaGift,
  FaShoppingCart,
  FaListUl,
  FaBox,
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

  const commonItems = [
    { path: "/", icon: <FaHome />, label: "Home" },
    { path: "/schemes", icon: <FaGift />, label: "Schemes" },
    {
      path: "/cart",
      icon: (
        <div className="relative">
          <FaShoppingCart />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {cartCount}
            </span>
          )}
        </div>
      ),
      label: "Cart",
    },
    { path: "/more", icon: <FaListUl />, label: "More" },
  ];

  const roleSpecific = {
    SS: { path: "/products", icon: <FaBox />, label: "Orders" },
    CRM: { path: "/crm/orders/verify", icon: <FaBox />, label: "Orders" },
    ADMIN: { path: "/admin/order-audit", icon: <FaBox />, label: "Orders" },
  };

  const allItems = [
    ...commonItems.slice(0, 2),
    roleSpecific[user?.role] || {},
    ...commonItems.slice(2),
  ];

  return (
    <div className="flex justify-around items-center py-2 px-3 bg-white">
      {allItems.map(
        (item, idx) =>
          item.path && (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center text-[11px] text-gray-600 hover:text-purple-600 transition-colors duration-150 ${
                  isActive ? "text-purple-600 font-semibold" : ""
                }`
              }
            >
              <div className="text-xl mb-0.5">{item.icon}</div>
              <span className="leading-none">{item.label}</span>
            </NavLink>
          )
      )}
    </div>
  );
}
