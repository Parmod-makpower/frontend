
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

  // ---------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------
  const handleLogout = () => {
    logout(() => {
      navigate("/login");
    });
  };

  // ---------------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------------
  const goTo = (path) => {
    navigate(path);
  };

  // ---------------------------------------------------------
  // ROLE-WISE OPTIONS
  // IMPORTANT:
  // Existing routes / labels / functionality preserved.
  // ---------------------------------------------------------
  const roleOptions = {
    ADMIN: [
      { label: "Dashboard", icon: <FaHome />, path: "/" },
      { label: "Products", icon: <FaBox />, path: "/products" },
      { label: "Inactive", icon: <FaBan />, path: "/inactive" },
      { label: "Sale Name", icon: <FaBox />, path: "/sale-name" },
      { label: "Schemes", icon: <FaGift />, path: "/schemes" },
      { label: "Users", icon: <FaUsers />, path: "/all-users/list" },
      { label: "All Orders", icon: <FaBox />, path: "/all/orders-history" },
      { label: "Dispatch", icon: <FaTruck />, path: "/dispatch-entries" },
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
      { label: "Dashboard", icon: <FaHome />, path: "/" },
      { label: "Schemes", icon: <FaGift />, path: "/user-schemes" },
      { label: "Users", icon: <FaUsers />, path: "/all-users/list" },
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

  // ---------------------------------------------------------
  // ICON STYLE
  // MAkPOWER ORANGE / RED BRANDING
  // ---------------------------------------------------------
  const getIconStyle = (label) => {
    const styles = {
      Dashboard: "bg-[#fff1ee] text-[#fc250c]",
      "ASM Dashboard": "bg-[#fff1ee] text-[#fc250c]",
      Products: "bg-[#fff7ed] text-[#ea580c]",
      Inactive: "bg-[#fff1f2] text-[#e11d48]",
      "Sale Name": "bg-[#fff7ed] text-[#ea580c]",
      Schemes: "bg-[#fff7ed] text-[#f97316]",
      Users: "bg-[#fff1ee] text-[#fc250c]",
      "All Orders": "bg-[#fff1ee] text-[#fc250c]",
      Dispatch: "bg-[#fff7ed] text-[#ea580c]",
      "Not In Stock": "bg-[#fff7ed] text-[#ea580c]",
      "Track Orders": "bg-[#fff1ee] text-[#fc250c]",
      "Goa Trip": "bg-[#fff7ed] text-[#f97316]",
      Catalogue: "bg-[#fff1ee] text-[#fc250c]",
      Settings: "bg-[#fef2f2] text-[#dc2626]",
      "ASM Management": "bg-[#fff1ee] text-[#fc250c]",
      "New Orders": "bg-[#fff1ee] text-[#fc250c]",
      Remarks: "bg-[#fff7ed] text-[#ea580c]",
      History: "bg-[#fff1ee] text-[#fc250c]",
      "Spare Parts": "bg-[#fff7ed] text-[#ea580c]",
      Categories: "bg-[#fff1ee] text-[#fc250c]",
      Orders: "bg-[#fff1ee] text-[#fc250c]",
      Cart: "bg-[#fff7ed] text-[#ea580c]",
    };

    return styles[label] || "bg-[#fff1ee] text-[#fc250c]";
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-[#172033]">
      {/* =====================================================
          MAIN MOBILE CONTAINER
      ====================================================== */}
      <div className="mx-auto w-full max-w-md px-3 pb-28 sm:px-4 md:max-w-2xl">
        {/* ===================================================
            HEADER
        ==================================================== */}
        <MobilePageHeader title="More Options" />

        {/* ===================================================
            PROFILE CARD
        ==================================================== */}
        <section className="mb-5 mt-5 pt-[58px] sm:pt-4">
          <div className="relative overflow-hidden rounded-[22px] border border-[#eceff3] bg-white shadow-[0_8px_28px_rgba(15,23,42,0.055)]">
            {/* Brand top line */}
            <div className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-[#fc250c] via-[#ff4b2b] to-[#ea580c]" />

            <div className="relative flex items-center gap-3.5 p-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="flex h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-[#fff1ee] text-[#fc250c] ring-1 ring-[#ffe0db]">
                  <FaUserCircle className="text-[43px]" />
                </div>

                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-[2px] border-white bg-emerald-500 shadow-sm" />
              </div>

              {/* User information */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-extrabold leading-tight text-[#172033]">
                  {user?.name || "User"}
                </p>

                <p className="mt-1 truncate text-[11px] font-medium text-[#64748b]">
                  {user?.mobile || "—"}
                </p>

                <div className="mt-2 flex min-w-0 items-center gap-2">
                  <span className="shrink-0 rounded-full border border-[#ffd9d2] bg-[#fff1ee] px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.08em] text-[#fc250c]">
                    {user?.role || "USER"}
                  </span>

                  <span className="min-w-0 truncate text-[9px] font-medium text-[#94a3b8]">
                    ID: {user?.user_id || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Small brand footer */}
            <div className="flex items-center justify-between border-t border-[#f1f3f5] bg-[#fffaf9] px-4 py-2">
              <span className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-[#fc250c]">
                MAkPOWER
              </span>

              <span className="text-[8px] font-medium text-[#94a3b8]">
                Account & Access
              </span>
            </div>
          </div>
        </section>

        {/* ===================================================
            MENU HEADER
        ==================================================== */}
        <section className="mb-3.5 px-1">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-4 w-[3px] rounded-full bg-[#fc250c]" />

                <p className="truncate text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#172033]">
                  {user?.role || "USER"} Menu
                </p>
              </div>

              <p className="mt-1 pl-[11px] text-[9px] font-medium text-[#94a3b8]">
                Available features & access
              </p>
            </div>

            {/* Option count */}
            <span className="shrink-0 rounded-full border border-[#eceff3] bg-white px-2.5 py-1.5 text-[9px] font-bold text-[#64748b] shadow-[0_2px_8px_rgba(15,23,42,0.035)]">
              <span className="text-[#fc250c]">{options.length}</span>{" "}
              options
            </span>
          </div>
        </section>

        {/* ===================================================
            OPTIONS GRID
        ==================================================== */}
        <section className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {options.map((item) => (
            <button
              key={`${item.label}-${item.path}`}
              type="button"
              onClick={() => goTo(item.path)}
              aria-label={item.label}
              className="group relative flex min-h-[94px] flex-col items-start justify-between overflow-hidden rounded-[19px] border border-[#e9edf1] bg-white p-3.5 text-left shadow-[0_5px_18px_rgba(15,23,42,0.035)] transition-all duration-200 active:scale-[0.96] hover:-translate-y-0.5 hover:border-[#ffcfc7] hover:shadow-[0_10px_28px_rgba(252,37,12,0.09)]"
            >
              {/* Icon */}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-[13px] transition-all duration-200 group-hover:scale-[1.04] ${getIconStyle(
                  item.label
                )}`}
              >
                <span className="text-[15px]">{item.icon}</span>
              </div>

              {/* Label + Arrow */}
              <div className="mt-3 flex w-full min-w-0 items-center justify-between gap-2">
                <span className="min-w-0 truncate text-[10px] font-extrabold leading-tight text-[#334155]">
                  {item.label}
                </span>

                <span className="shrink-0 text-[13px] font-medium text-[#cbd5e1] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#fc250c]">
                  →
                </span>
              </div>

              {/* Bottom brand line */}
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[#fc250c] to-[#ff6b4a] transition-all duration-200 group-hover:w-full" />
            </button>
          ))}
        </section>

        {/* ===================================================
            SUPPORT
        ==================================================== */}
        <section className="mt-7">
          <div className="mb-3 flex items-center gap-2 px-1">
            <span className="h-3 w-[3px] rounded-full bg-[#f97316]" />

            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#64748b]">
              Support
            </p>
          </div>

          <button
            type="button"
            onClick={() => alert("Phone: 7428828836")}
            className="group flex w-full items-center gap-3 rounded-[19px] border border-[#e9edf1] bg-white p-3.5 text-left shadow-[0_5px_18px_rgba(15,23,42,0.035)] transition-all duration-200 active:scale-[0.98] hover:border-[#ffd5cb] hover:bg-[#fffaf8]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#fff7ed] text-[#f97316] ring-1 ring-[#ffedd5] transition-transform duration-200 group-hover:scale-[1.04]">
              <FaInfoCircle size={16} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-extrabold text-[#334155]">
                Help / Info
              </p>

              <p className="mt-0.5 truncate text-[9px] font-medium text-[#94a3b8]">
                Contact support for assistance
              </p>
            </div>

            <span className="shrink-0 text-[13px] text-[#cbd5e1] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#fc250c]">
              →
            </span>
          </button>
        </section>

        {/* ===================================================
            LOGOUT
        ==================================================== */}
        <section className="mt-3">
          <button
            type="button"
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-[19px] border border-red-100 bg-red-50/70 p-3.5 text-left transition-all duration-200 active:scale-[0.98] hover:border-red-200 hover:bg-red-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-red-100 text-red-500 transition-transform duration-200 group-hover:scale-[1.04]">
              <FaSignOutAlt size={15} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-extrabold text-red-600">
                Logout
              </p>

              <p className="mt-0.5 truncate text-[9px] font-medium text-red-400">
                Sign out from your account
              </p>
            </div>

            <span className="shrink-0 text-[13px] text-red-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-red-500">
              →
            </span>
          </button>
        </section>

        {/* ===================================================
            BOTTOM BRANDING
        ==================================================== */}
        <div className="mt-6 flex items-center justify-center pb-2">
          <div className="flex items-center gap-2">
            <span className="h-px w-8 bg-[#e5e7eb]" />

            <span className="text-[8px] font-extrabold tracking-[0.2em] text-[#cbd5e1]">
              MAKPOWER
            </span>

            <span className="h-px w-8 bg-[#e5e7eb]" />
          </div>
        </div>
      </div>

      {/* =====================================================
          REDUCED MOTION
      ====================================================== */}
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
