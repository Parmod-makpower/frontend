// // 📁 pages/MoreOptionsPage.jsx
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import {
//   FaUserCircle,
//   FaSignOutAlt,
//   FaInfoCircle,
//   FaUsers,
//   FaChartLine,
//   FaBox,
//   FaBan,
//   FaRoute,
// } from "react-icons/fa";
// import MobilePageHeader from "../components/MobilePageHeader";



// export default function MoreOptionsPage() {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//   logout(() => {
//     navigate("/login");
//   });
// };


//   // ✅ role आधारित options
//   const options = [
//     ...(user?.role === "CRM"
//       ? [
//           {
//             label: "Users",
//             icon: <FaUsers className="text-green-600" />,
//             action: () => navigate("/all-users/list"),
//           },
          
//           {
//             label: "Not In Stock",
//             icon: <FaChartLine className="text-orange-600" />,
//             action: () => navigate("/not-in-stock-reports"),
//           },
//         ]
//       : []),
//     ...(user?.role === "ADMIN"
//       ? [
//         {
//             label: "Track-Orders",
//             icon: <FaRoute className="text-red-600" />,
//             action: () => navigate("/orders-tracking"),
//           },
//          {
//             label: "Products",
//             icon: <FaBox className="text-green-600" />,
//             action: () => navigate("/products"),
//           },
//           {
//             label: "Inactive Products",
//             icon: <FaBan className="text-red-600" />,
//             action: () => navigate("/inactive"),
//           },
//           {
//             label: "Sale Name",
//             icon: <FaBox className="text-yellow-600" />,
//             action: () => navigate("/sale-name"),
//           },
//           {
//             label: "DS Orders",
//             icon: <FaBox className="text-blue-600" />,
//             action: () => navigate("/ds/orders"),
//           },
          
//         ]
//       : []),
//     ...(user?.role === "SS"
//       ? [
//           {
//             label: "My Order",
//             icon: <FaBox className="text-orange-600" />,
//             action: () => navigate("/ss/history"),
//           },
         
//         ]
//       : []),
      
//     // ...(user?.role === "DS"
//     //   ? [
//     //       {
//     //         label: "My Order",
//     //         icon: <FaBox className="text-orange-600" />,
//     //         action: () => navigate("/ds/my-orders"),
//     //       },
         
//     //     ]
//     //   : []),
//     {
//       label: "Help / Info",
//       icon: <FaInfoCircle className="text-yellow-500" />,
//       action: () => alert("Phone: 7428828836"),
//     },
//     {
//       label: "Logout",
//       icon: <FaSignOutAlt className="text-red-500" />,
//       action: handleLogout,
//       danger: true,
//     },
//   ];

//   return (
//     <div className="max-w-md mx-auto px-4 relative mb-50">
//       {/* Header */}
//       <MobilePageHeader title="More Options" />

//       {/* Profile Section */}
//       <div className="relative my-6 pt-[60px] sm:pt-4 ">
//         <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4">
//           <div className="relative">
//             <FaUserCircle className="text-6xl text-[#fc250c]" />
//             <div className="absolute top-1 right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white" />
//           </div>
//           <div>
//             <div className="text-sm font-bold text-gray-800">{user?.name}</div>
//             <div className="text-xs text-gray-700">{user?.mobile}</div>
//             <div className="text-xs text-gray-400">ID {user?.user_id}</div>
//           </div>
//         </div>
//       </div>

//       {/* Options */}
//       <div className="space-y-3">
//         {options.map(({ label, icon, action, danger }, idx) => (
//           <button
//             key={idx}
//             onClick={action}
//             className={`w-full flex items-center gap-4 p-4 rounded-lg border shadow-sm transition-all duration-150 ${
//               danger
//                 ? "bg-red-50 border-red-200 text-[#fc250c] hover:bg-red-100 active:bg-red-200"
//                 : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100"
//             }`}
//           >
//             {icon}
//             <span className="text-base font-medium">{label}</span>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }



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
  FaRoute,
  FaHome,
  FaGift,
  FaList,
  FaCog,
  FaComment,
  FaUserTie,
  FaShoppingCart,
  FaHistory,
  FaTruck,
} from "react-icons/fa";

import MobilePageHeader from "../components/MobilePageHeader";

export default function MoreOptionsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(() => {
      navigate("/login");
    });
  };

  const goTo = (path) => {
    navigate(path);
  };

  /* =========================================================
     ROLE BASED OPTIONS
     EXACTLY MATCHING NAVBAR ACCESS
  ========================================================= */

  const roleOptions = {
    ADMIN: [
      {
        label: "Dashboard",
        icon: <FaHome />,
        path: "/",
      },
      {
        label: "Products",
        icon: <FaBox />,
        path: "/products",
      },
      {
        label: "Inactive",
        icon: <FaBan />,
        path: "/inactive",
      },
      {
        label: "Sale Name",
        icon: <FaBox />,
        path: "/sale-name",
      },
      {
        label: "Schemes",
        icon: <FaGift />,
        path: "/schemes",
      },
      {
        label: "Users",
        icon: <FaUsers />,
        path: "/all-users/list",
      },
      {
        label: "All Orders",
        icon: <FaBox />,
        path: "/all/orders-history",
      },
      {
        label: "Dispatch",
        icon: <FaTruck />,
        path: "/dispatch-entries",
      },
      {
        label: "Not In Stock",
        icon: <FaChartLine />,
        path: "/not-in-stock-reports",
      },
      {
        label: "Track Orders",
        icon: <FaRoute />,
        path: "/orders-tracking",
      },
      {
        label: "Goa Trip",
        icon: <FaGift />,
        path: "/goa-couple-trip-schemes",
      },
      {
        label: "Catalogue",
        icon: <FaBox />,
        path: "/product-images-pdf",
      },
      {
        label: "Settings",
        icon: <FaCog />,
        path: "/setting",
      },
    ],

    CRM: [
      {
        label: "Dashboard",
        icon: <FaHome />,
        path: "/",
      },
      {
        label: "Schemes",
        icon: <FaGift />,
        path: "/user-schemes",
      },
      {
        label: "Users",
        icon: <FaUsers />,
        path: "/all-users/list",
      },
      {
        label: "ASM Management",
        icon: <FaUserTie />,
        path: "/asm-assignment",
      },
      {
        label: "New Orders",
        icon: <FaBox />,
        path: "/crm/orders",
      },
      {
        label: "Remarks",
        icon: <FaComment />,
        path: "/remarks",
      },
      {
        label: "History",
        icon: <FaHistory />,
        path: "/all/orders-history",
      },
      {
        label: "Not In Stock",
        icon: <FaChartLine />,
        path: "/not-in-stock-reports",
      },
      {
        label: "Goa Trip",
        icon: <FaGift />,
        path: "/goa-couple-trip-schemes",
      },
      {
        label: "Catalogue",
        icon: <FaBox />,
        path: "/product-images-pdf",
      },
      {
        label: "Spare Parts",
        icon: <FaBox />,
        path: "/category/Spare%20parts/subcategories",
      },
    ],

    ASM: [
      {
        label: "ASM Dashboard",
        icon: <FaHome />,
        path: "/asm",
      },
      {
        label: "Schemes",
        icon: <FaGift />,
        path: "/user-schemes",
      },
      {
        label: "Categories",
        icon: <FaList />,
        path: "/all-categories",
      },
    ],

    DS: [
      {
        label: "Dashboard",
        icon: <FaHome />,
        path: "/",
      },
      {
        label: "Schemes",
        icon: <FaGift />,
        path: "/user-schemes",
      },
      {
        label: "Categories",
        icon: <FaList />,
        path: "/all-categories",
      },
      {
        label: "Orders",
        icon: <FaBox />,
        path: "/ds/my-orders",
      },
      {
        label: "Cart",
        icon: <FaShoppingCart />,
        path: "/cart",
      },
    ],

    SS: [
      {
        label: "Dashboard",
        icon: <FaHome />,
        path: "/",
      },
      {
        label: "Schemes",
        icon: <FaGift />,
        path: "/user-schemes",
      },
      {
        label: "Orders",
        icon: <FaBox />,
        path: "/ss/history",
      },
      {
        label: "Categories",
        icon: <FaList />,
        path: "/all-categories",
      },
      {
        label: "Cart",
        icon: <FaShoppingCart />,
        path: "/cart",
      },
    ],

    HR: [
      {
        label: "Dashboard",
        icon: <FaHome />,
        path: "/remarks",
      },
      {
        label: "Categories",
        icon: <FaList />,
        path: "/all-categories",
      },
    ],
  };

  const options = roleOptions[user?.role] || [];

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="mx-auto w-full max-w-md px-4 pb-28 md:max-w-2xl">

        {/* HEADER */}
        <MobilePageHeader title="More Options" />

        {/* =====================================================
            PROFILE
        ===================================================== */}

        <div className="mb-6 mt-5 my-6 pt-[60px] sm:pt-4">
          <div className="relative overflow-hidden rounded-2xl border border-[#e7edf5] bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">

            {/* small blue top accent */}
            <div className="absolute left-0 right-0 top-0 h-1 bg-[#1769ff]" />

            <div className="flex items-center gap-4 pt-1">

              {/* AVATAR */}
              <div className="relative shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1769ff]">
                  <FaUserCircle className="text-[42px]" />
                </div>

                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>

              {/* USER INFO */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-extrabold text-[#0f172a]">
                  {user?.name || "User"}
                </p>

                <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                  {user?.mobile || "—"}
                </p>

                <div className="mt-1.5 flex items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-[#1769ff]">
                    {user?.role || "USER"}
                  </span>

                  <span className="truncate text-[9px] font-medium text-slate-400">
                    ID: {user?.user_id || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            ROLE ACCESS
        ===================================================== */}

        <div className="mb-3 flex items-center justify-between px-1">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#0f172a]">
              {user?.role} Menu
            </p>

            <p className="mt-0.5 text-[9px] font-medium text-slate-400">
              Available features & access
            </p>
          </div>

          <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-slate-400 shadow-sm ring-1 ring-slate-100">
            {options.length} options
          </span>
        </div>

        {/* MENU GRID */}
        <div className="grid grid-cols-2 gap-3">
          {options.map((item) => (
            <button
              key={`${item.label}-${item.path}`}
              type="button"
              onClick={() => goTo(item.path)}
              className="
                group
                relative
                flex
                min-h-[86px]
                flex-col
                items-start
                justify-between
                overflow-hidden
                rounded-2xl
                border
                border-[#e7edf5]
                bg-white
                p-4
                text-left
                shadow-[0_6px_24px_rgba(15,23,42,0.04)]
                transition-all
                duration-200
                active:scale-[0.97]
                hover:-translate-y-0.5
                hover:border-blue-200
                hover:shadow-[0_10px_30px_rgba(23,105,255,0.10)]
              "
            >
              {/* ICON */}
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-50
                  text-[#1769ff]
                  transition-all
                  duration-200
                  group-hover:scale-105
                  group-hover:bg-[#1769ff]
                  group-hover:text-white
                "
              >
                <span className="text-[15px]">
                  {item.icon}
                </span>
              </div>

              {/* LABEL */}
              <div className="mt-3 flex w-full items-center justify-between gap-2">
                <span className="truncate text-[10px] font-extrabold text-[#334155]">
                  {item.label}
                </span>

                <span className="text-[12px] text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#1769ff]">
                  →
                </span>
              </div>

              {/* HOVER ACCENT */}
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#1769ff] transition-all duration-200 group-hover:w-full" />
            </button>
          ))}
        </div>

        {/* =====================================================
            HELP / INFO
        ===================================================== */}

        <div className="mt-7">
          <p className="mb-3 px-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
            Support
          </p>

          <button
            type="button"
            onClick={() => alert("Phone: 7428828836")}
            className="
              group
              flex
              w-full
              items-center
              gap-3
              rounded-2xl
              border
              border-[#e7edf5]
              bg-white
              p-4
              text-left
              shadow-[0_6px_24px_rgba(15,23,42,0.04)]
              transition-all
              duration-200
              active:scale-[0.98]
              hover:border-blue-200
              hover:bg-blue-50/30
            "
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500 transition-transform duration-200 group-hover:scale-105">
              <FaInfoCircle size={16} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-extrabold text-slate-700">
                Help / Info
              </p>

              <p className="mt-0.5 text-[9px] font-medium text-slate-400">
                Contact support for assistance
              </p>
            </div>

            <span className="text-slate-300 group-hover:text-[#1769ff]">
              →
            </span>
          </button>
        </div>

        {/* =====================================================
            LOGOUT
        ===================================================== */}

        <div className="mt-3">
          <button
            type="button"
            onClick={handleLogout}
            className="
              group
              flex
              w-full
              items-center
              gap-3
              rounded-2xl
              border
              border-red-100
              bg-red-50/70
              p-4
              text-left
              transition-all
              duration-200
              active:scale-[0.98]
              hover:border-red-200
              hover:bg-red-50
            "
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-500 transition-transform duration-200 group-hover:scale-105">
              <FaSignOutAlt size={15} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-extrabold text-red-600">
                Logout
              </p>

              <p className="mt-0.5 text-[9px] font-medium text-red-400">
                Sign out from your account
              </p>
            </div>

            <span className="text-red-300 transition-transform group-hover:translate-x-0.5 group-hover:text-red-500">
              →
            </span>
          </button>
        </div>

      </div>

      {/* =====================================================
          ANIMATION
      ===================================================== */}

      <style>
        {`
          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
          }
        `}
      </style>
    </div>
  );
}