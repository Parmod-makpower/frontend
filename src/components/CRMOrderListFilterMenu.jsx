import { useState, useEffect, useRef } from "react";
import { FaEllipsisV, FaClock, FaPauseCircle, FaTimesCircle } from "react-icons/fa";

export default function CRMOrderListFilterMenu({ filterStatus, setFilterStatus }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // ✅ Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* 3-dot button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded-lg hover:bg-gray-200 transition cursor-pointer"
      >
        <FaEllipsisV size={18} />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white shadow-xl border rounded z-50 animate-fadeIn">
          <ul className="text-sm">
            {/* ✅ Pending */}
            <li className="p-2 hover:bg-gray-100 border-b cursor-pointer">
              <button
                onClick={() => {
                  setFilterStatus("PENDING");
                  setOpen(false);
                }}
                className="flex items-center gap-2 w-full text-left"
              >
                <FaClock className="text-blue-500" />
                Pending Orders
              </button>
            </li>

            {/* ✅ Hold */}
            <li className="p-2 hover:bg-gray-100 border-b cursor-pointer">
              <button
                onClick={() => {
                  setFilterStatus("HOLD");
                  setOpen(false);
                }}
                className="flex items-center gap-2 w-full text-left"
              >
                <FaPauseCircle className="text-yellow-500" />
                Hold Orders
              </button>
            </li>

            {/* ✅ Rejected */}
            <li className="p-2 hover:bg-gray-100 cursor-pointer">
              <button
                onClick={() => {
                  setFilterStatus("REJECTED");
                  setOpen(false);
                }}
                className="flex items-center gap-2 w-full text-left"
              >
                <FaTimesCircle className="text-red-500" />
                Rejected Orders
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
