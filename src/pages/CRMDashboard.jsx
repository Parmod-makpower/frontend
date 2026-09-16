// import { FaUsers, FaLayerGroup, FaChartLine, FaCubes, FaBoxOpen, FaHistory, FaSearch, FaBell } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import { useState } from "react";
// import logo from "../assets/images/logo.png";

// export default function CRMDashboard() {
//   const navigate = useNavigate();
//    const [searchText, setSearchText] = useState("");
  
//     const handleRedirect = () => {
//       navigate(`/search?search=${encodeURIComponent(searchText.trim())}`);
//     };
  

//   const cards = [
//     {
//       title: "Super Stockist",
//       desc: "Add user, manage their team.",
//       icon: <FaUsers className="text-3xl text-blue-500" />,
//       url: "/all-users/list",
//     },
    
//     {
//       title: "New Orders",
//       desc: "Check and verify incoming orders.",
//       icon: <FaBoxOpen className="text-3xl text-teal-500" />,
//       url: "/crm/orders",
//     },
//     {
//       title: "History",
//       desc: "View verified, rejected & dispatched orders.",
//       icon: <FaHistory className="text-3xl text-gray-500" />,
//       url: "/all/orders-history",
//     },
//     {
//       title: "Not-In-Stock",
//       desc: "Track live stock updates.",
//       icon: <FaChartLine className="text-3xl text-cyan-600" />,
//       url: "/not-in-stock-reports",
//     },
//     {
//       title: "Category",
//       desc: "Add, edit or delete categories.",
//       icon: <FaLayerGroup className="text-3xl text-lime-600" />,
//       url: "/all-categories",
//     },
//     {
//       title: "Scheme",
//       desc: "Manage discount & combo schemes.",
//       icon: <FaCubes className="text-3xl text-pink-500" />,
//       url: "/user-schemes",
//     },
//   ];

//   return (
//     <div className="p-4 mb-25">
//        <div className="md:hidden flex justify-between items-center mb-4">
//               <img
//                 src={logo}
//                 className="w-40"
//                 alt="MakPower Logo"
//               />
//               <div className="block sm:hidden text-xl text-[var(--primary-color)]">
//                 <FaBell />
//               </div>
//             </div>
      
//             {/* 🔍 Search */}
//             <div className="md:hidden relative mb-6 ">
//               <input
//                 type="text"
//                 value={searchText}
//                 onChange={(e) => setSearchText(e.target.value)}
//                 onClick={handleRedirect}
//                 placeholder="Search for products..."
//                 className="w-full p-2.5 sm:p-3 pl-4 pr-10 rounded-full border text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//               <button
//                 onClick={handleRedirect}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] hover:text-blue-800"
//               >
//                 <FaSearch />
//               </button>
//             </div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         {cards.map((card, idx) => (
//           <div
//             key={idx}
//             onClick={() => navigate(card.url)} 
//             className="p-6 sm:py-12 border rounded hover:bg-gray-200 transition bg-white flex flex-col items-center text-center cursor-pointer"
//           >
//             {card.icon}
//             <h2 className="text-lg font-semibold mt-4">{card.title}</h2>
//             <p className="text-sm text-gray-500 mt-1">{card.desc}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }




import {
  FaUsers,
  FaChartLine,
  FaBoxOpen,
  FaHistory,
  FaSearch,
  FaBell,
  FaGift,
  FaArrowRight,
  FaPlus,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaPauseCircle,
  FaBoxes,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/images/logo.png";

export default function CRMDashboard() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");

  const handleRedirect = () => {
    if (!searchText.trim()) return;

    navigate(
      `/search?search=${encodeURIComponent(
        searchText.trim()
      )}`
    );
  };

  // =========================================================
  // KPI CARDS
  // =========================================================

  const stats = [
    {
      title: "Total Orders",
      value: "—",
      subtitle: "All customer orders",
      icon: FaBoxOpen,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      border: "border-blue-100",
      bg: "from-blue-50/80 to-white",
      url: "/crm/orders",
    },
    {
      title: "Pending",
      value: "—",
      subtitle: "Waiting for verification",
      icon: FaClock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      border: "border-amber-100",
      bg: "from-amber-50/80 to-white",
      url: "/crm/orders",
    },
    {
      title: "Approved",
      value: "—",
      subtitle: "Verified orders",
      icon: FaCheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      border: "border-green-100",
      bg: "from-green-50/80 to-white",
      url: "/all/orders-history",
    },
    {
      title: "Rejected",
      value: "—",
      subtitle: "Rejected orders",
      icon: FaTimesCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      border: "border-red-100",
      bg: "from-red-50/80 to-white",
      url: "/all/orders-history",
    },
  ];

  // =========================================================
  // QUICK ACTIONS
  // =========================================================

  const quickActions = [
    {
      title: "Create New Order",
      desc: "Create an order for customer",
      shortcut: "Ctrl + N",
      icon: FaPlus,
      color: "blue",
      url: "/crm/orders",
    },
    {
      title: "Pending Orders",
      desc: "Review orders waiting for action",
      shortcut: "Ctrl + P",
      icon: FaClock,
      color: "amber",
      url: "/crm/orders",
    },
    {
      title: "Hold Orders",
      desc: "View orders currently on hold",
      shortcut: "Ctrl + H",
      icon: FaPauseCircle,
      color: "orange",
      url: "/all/orders-history",
    },
    {
      title: "Approved Orders",
      desc: "View verified orders",
      shortcut: "Ctrl + A",
      icon: FaCheckCircle,
      color: "green",
      url: "/all/orders-history",
    },
    {
      title: "Rejected Orders",
      desc: "View rejected orders",
      shortcut: "Ctrl + R",
      icon: FaTimesCircle,
      color: "red",
      url: "/all/orders-history",
    },
  ];

  // =========================================================
  // MAIN WORKSPACE
  // =========================================================

  const workspace = [
    {
      title: "Super Stockists",
      desc: "Manage customers and party details",
      icon: FaUsers,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      hover: "hover:border-blue-200 hover:bg-blue-50/40",
      url: "/all-users/list",
      label: "Manage Users",
    },
    {
      title: "New Orders",
      desc: "Check and verify incoming orders",
      icon: FaBoxOpen,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      hover: "hover:border-green-200 hover:bg-green-50/40",
      url: "/crm/orders",
      label: "Open Orders",
    },
    {
      title: "Order History",
      desc: "Verified, rejected and dispatched orders",
      icon: FaHistory,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      hover: "hover:border-purple-200 hover:bg-purple-50/40",
      url: "/all/orders-history",
      label: "View History",
    },
    {
      title: "Not-In-Stock",
      desc: "Track products that need attention",
      icon: FaChartLine,
      iconBg: "bg-cyan-50",
      iconColor: "text-cyan-600",
      hover: "hover:border-cyan-200 hover:bg-cyan-50/40",
      url: "/not-in-stock-reports",
      label: "Check Stock",
    },
    {
      title: "Schemes",
      desc: "View available discount and combo schemes",
      icon: FaGift,
      iconBg: "bg-pink-50",
      iconColor: "text-pink-600",
      hover: "hover:border-pink-200 hover:bg-pink-50/40",
      url: "/user-schemes",
      label: "View Schemes",
    },
    {
      title: "Catalogue",
      desc: "Browse product catalogue and details",
      icon: FaBoxes,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      hover: "hover:border-indigo-200 hover:bg-indigo-50/40",
      url: "/product-images-pdf",
      label: "Open Catalogue",
    },
  ];

  // =========================================================
  // RECENT ACTIVITY
  // =========================================================

  const activities = [
    {
      text: "New order activity",
      desc: "Check your latest incoming orders",
      icon: FaBoxOpen,
      color: "bg-blue-500",
      url: "/crm/orders",
    },
    {
      text: "Pending verification",
      desc: "Orders may require your action",
      icon: FaClock,
      color: "bg-amber-500",
      url: "/crm/orders",
    },
    {
      text: "Order history",
      desc: "Review previously processed orders",
      icon: FaHistory,
      color: "bg-purple-500",
      url: "/all/orders-history",
    },
    {
      text: "Stock monitoring",
      desc: "Check products with low availability",
      icon: FaChartLine,
      color: "bg-cyan-500",
      url: "/not-in-stock-reports",
    },
  ];

  return (
    <div className="min-h-full bg-gray-50 pb-24">

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <div className="mb-3 px-3 pt-3 md:hidden">

        <div className="mb-3 flex items-center justify-between">

          <img
            src={logo}
            alt="MakPower"
            className="w-36 cursor-pointer"
            onClick={() => navigate("/")}
          />

          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition hover:text-blue-600 active:scale-95"
          >
            <FaBell size={15} />

            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

        </div>

        {/* MOBILE SEARCH */}

        <div className="relative">

          <input
            type="text"
            value={searchText}
            onChange={(e) =>
              setSearchText(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRedirect();
              }
            }}
            placeholder="Search products, orders, party..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-4 pr-11 text-xs text-gray-700 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
          />

          <button
            type="button"
            onClick={handleRedirect}
            className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 active:scale-95"
          >
            <FaSearch size={11} />
          </button>

        </div>
      </div>

      {/* =====================================================
          DESKTOP PAGE TITLE
      ===================================================== */}

      <div className="mb-4 hidden items-center justify-between md:flex">

        <div>

          <div className="flex items-center gap-2">

            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              CRM Dashboard
            </h1>

            <span className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-bold text-blue-600">
              CRM
            </span>

          </div>

          <p className="mt-1 text-xs text-gray-500">
            Manage orders, customers and daily CRM activities
          </p>

        </div>

        <button
          type="button"
          onClick={() => navigate("/crm/orders")}
          className="group flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition duration-200 hover:bg-blue-700 hover:shadow-md active:scale-95"
        >
          <FaPlus size={10} />

          Create Order

          <span className="ml-1 rounded bg-white/15 px-1.5 py-0.5 text-[8px]">
            Ctrl + N
          </span>
        </button>

      </div>

      {/* =====================================================
          KPI STATS
      ===================================================== */}

      <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">

        {stats.map((stat, index) => {

          const Icon = stat.icon;

          return (
            <button
              key={stat.title}
              type="button"
              onClick={() => navigate(stat.url)}
              style={{
                animationDelay: `${index * 70}ms`,
              }}
              className={`group relative overflow-hidden rounded-xl border ${stat.border} bg-gradient-to-br ${stat.bg} p-3 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md active:scale-[0.98] animate-[fadeInUp_0.45s_ease-out_both]`}
            >

              {/* Decorative circle */}

              <div className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-white/40 transition duration-500 group-hover:scale-150" />

              <div className="relative flex items-start justify-between">

                <div>

                  <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                    {stat.title}
                  </p>

                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {stat.value}
                  </p>

                  <p className="mt-0.5 text-[9px] text-gray-400">
                    {stat.subtitle}
                  </p>

                </div>

                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${stat.iconBg} ${stat.iconColor} transition duration-300 group-hover:rotate-6 group-hover:scale-110`}
                >
                  <Icon size={14} />
                </div>

              </div>

            </button>
          );
        })}

      </div>

      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">

        {/* ===================================================
            WORKSPACE
        =================================================== */}

        <div className="min-w-0">

          <div className="mb-2.5 flex items-center justify-between">

            <div>

              <h2 className="text-sm font-bold text-gray-900">
                CRM Workspace
              </h2>

              <p className="mt-0.5 text-[10px] text-gray-400">
                Frequently used modules
              </p>

            </div>

            <span className="rounded-md bg-white px-2 py-1 text-[9px] font-semibold text-gray-400 shadow-sm">
              6 Modules
            </span>

          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">

            {workspace.map((item, index) => {

              const Icon = item.icon;

              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => navigate(item.url)}
                  style={{
                    animationDelay: `${index * 60}ms`,
                  }}
                  className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3.5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${item.hover} animate-[fadeInUp_0.45s_ease-out_both]`}
                >

                  <div className="flex items-start gap-3">

                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor} transition duration-300 group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <Icon size={17} />
                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex items-center justify-between gap-2">

                        <h3 className="truncate text-xs font-bold text-gray-800">
                          {item.title}
                        </h3>

                        <FaArrowRight
                          size={9}
                          className="shrink-0 text-gray-300 transition duration-300 group-hover:translate-x-1 group-hover:text-blue-500"
                        />

                      </div>

                      <p className="mt-1 line-clamp-2 text-[9px] leading-relaxed text-gray-400">
                        {item.desc}
                      </p>

                    </div>

                  </div>

                  <div className="mt-3 border-t border-gray-100 pt-2">

                    <span className="text-[9px] font-semibold text-blue-600 transition group-hover:text-blue-700">
                      {item.label}
                    </span>

                  </div>

                </button>
              );
            })}

          </div>

        </div>

        {/* ===================================================
            QUICK ACTIONS + ACTIVITY
        =================================================== */}

        <div className="space-y-3">

          {/* QUICK ACTIONS */}

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

            <div className="border-b border-gray-100 bg-gray-50 px-3 py-2.5">

              <h2 className="text-xs font-bold text-gray-800">
                Quick Actions
              </h2>

              <p className="mt-0.5 text-[9px] text-gray-400">
                Fast access to CRM tasks
              </p>

            </div>

            <div className="divide-y divide-gray-100">

              {quickActions.map((action, index) => {

                const Icon = action.icon;

                const colorMap = {
                  blue: {
                    bg: "bg-blue-50",
                    text: "text-blue-600",
                  },
                  amber: {
                    bg: "bg-amber-50",
                    text: "text-amber-600",
                  },
                  orange: {
                    bg: "bg-orange-50",
                    text: "text-orange-600",
                  },
                  green: {
                    bg: "bg-green-50",
                    text: "text-green-600",
                  },
                  red: {
                    bg: "bg-red-50",
                    text: "text-red-600",
                  },
                };

                const colors =
                  colorMap[action.color];

                return (
                  <button
                    key={action.title}
                    type="button"
                    onClick={() => navigate(action.url)}
                    style={{
                      animationDelay: `${index * 60}ms`,
                    }}
                    className="group flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition hover:bg-gray-50 animate-[fadeIn_0.4s_ease-out_both]"
                  >

                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${colors.bg} ${colors.text} transition duration-200 group-hover:scale-110`}
                    >
                      <Icon size={12} />
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-[10px] font-semibold text-gray-700">
                        {action.title}
                      </p>

                      <p className="truncate text-[8px] text-gray-400">
                        {action.desc}
                      </p>

                    </div>

                    <span className="hidden shrink-0 rounded bg-gray-100 px-1.5 py-1 text-[7px] font-semibold text-gray-400 sm:block">
                      {action.shortcut}
                    </span>

                  </button>
                );
              })}

            </div>

          </div>

          {/* RECENT ACTIVITY */}

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-3 py-2.5">

              <div>

                <h2 className="text-xs font-bold text-gray-800">
                  Recent Activity
                </h2>

                <p className="mt-0.5 text-[9px] text-gray-400">
                  CRM workspace activity
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/all/orders-history")
                }
                className="text-[8px] font-semibold text-blue-600 hover:text-blue-700"
              >
                View All
              </button>

            </div>

            <div className="p-3">

              {activities.map((activity, index) => {

                const Icon = activity.icon;

                return (
                  <button
                    key={activity.text}
                    type="button"
                    onClick={() =>
                      navigate(activity.url)
                    }
                    className="group relative flex w-full gap-2.5 pb-3 text-left last:pb-0"
                  >

                    {index !== activities.length - 1 && (
                      <span className="absolute left-[5px] top-4 h-full w-px bg-gray-100" />
                    )}

                    <span
                      className={`relative z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${activity.color} ring-4 ring-white transition group-hover:scale-125`}
                    />

                    <div className="min-w-0">

                      <p className="truncate text-[9px] font-semibold text-gray-700 group-hover:text-blue-600">
                        {activity.text}
                      </p>

                      <p className="mt-0.5 text-[8px] text-gray-400">
                        {activity.desc}
                      </p>

                    </div>

                    <Icon
                      size={9}
                      className="ml-auto mt-1 shrink-0 text-gray-300 transition group-hover:text-blue-500"
                    />

                  </button>
                );
              })}

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          MOBILE BOTTOM SPACE
      ===================================================== */}

      <div className="h-4 md:hidden" />

      {/* =====================================================
          ANIMATION
      ===================================================== */}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>

    </div>
  );
}