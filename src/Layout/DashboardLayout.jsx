
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ResponsiveSidebar from "./ResponsiveSidebar";
import BottomNav from "./BottomNav";
import { FaUserCircle, FaBars } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar for Desktop */}
      <ResponsiveSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 flex flex-col">
        {/* Top NavBar for Desktop Only */}
        {/* <header className="hidden md:flex justify-between items-center bg-white shadow-md px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              className="text-2xl text-gray-700 cursor-pointer md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FaBars />
            </button>
            <h1 className="text-2xl font-bold text-blue-600">MAKPOWER</h1>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 cursor-pointer"
            >
              <FaUserCircle className="text-2xl" />
              <span className="font-medium">{user?.role}</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50 animate-fade-in-down">
                <div className="px-4 py-2 text-sm text-gray-800 border-b">
                  ID: {user?.user_id}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header> */}

        {/* Page Content */}
        <div className="flex-1 p-0 pb-20 md:pb-6 overflow-y-auto">
          <Outlet />
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-inner border-t z-50">
          <BottomNav />
        </div>
      </main>
    </div>
  );
}
