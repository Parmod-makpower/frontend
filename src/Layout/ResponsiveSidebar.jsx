// components/ResponsiveSidebar.js

import { FaHome, FaUsers, FaBox, FaList, FaGift, FaHistory, FaShoppingCart } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ResponsiveSidebar({ isOpen, setIsOpen }) {
  const { user } = useAuth();

  const navItems = [
    { label: "Dashboard", path: "/", icon: <FaHome /> },
    { label: "Schemes", path: "/schemes", icon: <FaGift /> },
   
    
  ];

  if (user.role === "ADMIN") {
    navItems.push({ label: "CRM", path: "/admin/crm", icon: <FaUsers /> },
       { label: "All Orders", path: "/admin/order-audit", icon: <FaBox /> },
    );
  }
  if (user.role === "CRM") {
    navItems.push({ label: "Super Stockist", path: "/crm/ss", icon: <FaUsers />  },
      { label: "New Orders", path: "/crm/orders/verify", icon: <FaBox />  },
      { label: "History", path: "/crm/orders/history", icon: <FaHistory /> },
    );
  }
  if (user.role === "SS") {
    navItems.push({ label: "Distributer", path: "/ss/ds", icon: <FaUsers /> },
       { label: "Cart", path: "/cart", icon: <FaShoppingCart /> },
       { label: "Orders", path: "/products", icon: <FaBox /> },
      { label: "Categories", path: "/categories", icon: <FaList /> },
    );
  }

  return (
    <div
      className={`fixed inset-y-0 left-0 z-40 bg-white w-64 shadow-md transform transition-transform duration-300 md:static md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="md:hidden flex justify-end px-4 py-3 border-b">
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-600 text-xl hover:text-red-500 cursor-pointer"
        >
          ✕
        </button>
      </div>

      <div className="pt-6 md:pt-10">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center py-3 px-6 text-gray-700 hover:bg-gray-100 hover:text-blue-600 cursor-pointer ${
                  isActive ? "bg-gray-200 font-semibold text-blue-600" : ""
                }`
              }
            >
              <span className="mr-3">{item.icon}</span> {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
