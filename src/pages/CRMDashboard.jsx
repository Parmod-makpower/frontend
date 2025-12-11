import { FaUsers, FaLayerGroup, FaChartLine, FaCubes, FaBoxOpen, FaHistory, FaSearch, FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/images/logo.png";

export default function CRMDashboard() {
  const navigate = useNavigate();
   const [searchText, setSearchText] = useState("");
  
    const handleRedirect = () => {
      navigate(`/search?search=${encodeURIComponent(searchText.trim())}`);
    };
  

  const cards = [
    {
      title: "Super Stockist",
      desc: "Add user, manage their team.",
      icon: <FaUsers className="text-3xl text-blue-500" />,
      url: "/all-users/list",
    },
    {
      title: "Create Order",  // ✅ नया कार्ड
      desc: "Place a new customer order.",
      icon: <FaBoxOpen className="text-3xl text-orange-600" />,
      url: "/crm/create-order",
    },
    {
      title: "New Orders",
      desc: "Check and verify incoming orders.",
      icon: <FaBoxOpen className="text-3xl text-teal-500" />,
      url: "/crm/orders",
    },
    {
      title: "History",
      desc: "View verified, rejected & dispatched orders.",
      icon: <FaHistory className="text-3xl text-gray-500" />,
      url: "/all/orders-history",
    },
    {
      title: "Stock",
      desc: "Track live stock updates.",
      icon: <FaChartLine className="text-3xl text-cyan-600" />,
      url: "/available-stock",
    },
    {
      title: "Category",
      desc: "Add, edit or delete categories.",
      icon: <FaLayerGroup className="text-3xl text-lime-600" />,
      url: "/all-categories",
    },
    {
      title: "Scheme",
      desc: "Manage discount & combo schemes.",
      icon: <FaCubes className="text-3xl text-pink-500" />,
      url: "/user-schemes",
    },
  ];

  return (
    <div className="p-4 mb-25">
       <div className="md:hidden flex justify-between items-center mb-4">
              <img
                src={logo}
                className="w-40"
                alt="MakPower Logo"
              />
              <div className="block sm:hidden text-xl text-[var(--primary-color)]">
                <FaBell />
              </div>
            </div>
      
            {/* 🔍 Search */}
            <div className="md:hidden relative mb-6 ">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onClick={handleRedirect}
                placeholder="Search for products..."
                className="w-full p-2.5 sm:p-3 pl-4 pr-10 rounded-full border text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleRedirect}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] hover:text-blue-800"
              >
                <FaSearch />
              </button>
            </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => navigate(card.url)} 
            className="p-6 sm:py-12 border rounded hover:bg-gray-200 transition bg-white flex flex-col items-center text-center cursor-pointer"
          >
            {card.icon}
            <h2 className="text-lg font-semibold mt-4">{card.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
