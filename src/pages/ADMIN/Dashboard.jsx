import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  FaGift,
  FaTags,
  FaUsers,
  FaUserTie,
  FaShoppingCart,
  FaCommentDots,
  FaHistory,
  FaRoute,
  FaUmbrellaBeach,
  FaBookOpen,
  FaTools,
  FaLayerGroup,

  /* ADMIN ICONS */
  FaBoxOpen,
  FaBan,
  FaTag,
  FaClipboardList,
  FaTruck,
  FaChartLine,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/* =========================================================
   PRICE MANAGEMENT ACCESS

   ONLY:
   AD0001
   CRM0001
========================================================= */

const PRICE_MANAGEMENT_ALLOWED_USERS = new Set([
  "AD0001",
  "CRM0002",
]);

/* =========================================================
   DASHBOARD CARD
========================================================= */

const DashboardCard = memo(
  ({
    title,
    desc,
    icon,
    url,
    accent = "red",
    disabled = false,
  }) => {
    const navigate = useNavigate();

    /* =====================================================
       ACCENT THEME
    ===================================================== */

    const accentStyle =
      accent === "orange"
        ? {
            line: "bg-orange-500",

            icon:
              "border-orange-100 bg-gradient-to-br from-orange-50 to-red-50 text-orange-600",

            iconHover:
              "group-hover:border-orange-200 group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-red-500 group-hover:text-white",

            border:
              "hover:border-orange-200",

            title:
              "group-hover:text-orange-600",

            arrow:
              "group-hover:text-orange-500",
          }
        : {
            line: "bg-red-500",

            icon:
              "border-red-100 bg-gradient-to-br from-red-50 to-orange-50 text-red-600",

            iconHover:
              "group-hover:border-red-200 group-hover:bg-gradient-to-br group-hover:from-red-500 group-hover:to-orange-500 group-hover:text-white",

            border:
              "hover:border-red-200",

            title:
              "group-hover:text-red-600",

            arrow:
              "group-hover:text-red-500",
          };

    /* =====================================================
       CLICK
    ===================================================== */

    const handleClick = () => {
      if (disabled) return;

      navigate(url);
    };

    return (
      <button
        type="button"
        disabled={disabled}
        onClick={handleClick}
        aria-disabled={disabled}
        className={`
          group
          relative
          w-full
          min-h-[145px]
          overflow-hidden
          rounded-xl
          border
          border-slate-200
          bg-white
          p-4
          text-left

          shadow-[0_2px_8px_rgba(15,23,42,0.035)]

          transition-[transform,box-shadow,border-color]
          duration-200
          ease-out

          ${
            disabled
              ? `
                cursor-not-allowed
                opacity-50
              `
              : `
                cursor-pointer
                hover:-translate-y-[3px]
                hover:shadow-[0_12px_28px_rgba(15,23,42,0.09)]
                ${accentStyle.border}
                active:translate-y-0
                active:shadow-[0_4px_12px_rgba(15,23,42,0.06)]
              `
          }

          focus:outline-none

          ${
            disabled
              ? ""
              : "focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-1"
          }
        `}
      >
        {/* =================================================
            SUBTLE HOVER SHINE
        ================================================= */}

        {!disabled && (
          <span
            className="
              pointer-events-none
              absolute
              -right-20
              -top-20
              h-36
              w-36
              rounded-full
              bg-gradient-to-br
              from-white
              via-white/40
              to-transparent
              opacity-0
              blur-xl
              transition-all
              duration-500
              group-hover:right-[-35px]
              group-hover:top-[-35px]
              group-hover:opacity-70
            "
          />
        )}

        {/* =================================================
            LEFT ACCENT
        ================================================= */}

        <span
          className={`
            absolute
            left-0
            top-0
            h-full
            w-[3px]
            ${
              disabled
                ? "bg-slate-300"
                : accentStyle.line
            }
          `}
        />

        {/* =================================================
            TOP
        ================================================= */}

        <div className="relative flex items-start justify-between gap-3">
          {/* ICON */}

          <div
            className={`
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              text-[17px]

              transition-[transform,background-color,border-color,color]
              duration-200
              ease-out

              ${
                disabled
                  ? `
                    border-slate-200
                    bg-slate-50
                    text-slate-400
                  `
                  : `
                    ${accentStyle.icon}
                    ${accentStyle.iconHover}
                    group-hover:scale-[1.06]
                    group-hover:-rotate-2
                  `
              }
            `}
          >
            {icon}
          </div>

          {/* ARROW */}

          <span
            className={`
              mt-0.5
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-full
              text-[17px]
              font-medium

              transition-[transform,color,background-color]
              duration-200
              ease-out

              ${
                disabled
                  ? `
                    text-slate-300
                  `
                  : `
                    text-slate-300
                    group-hover:translate-x-1
                    group-hover:bg-slate-50
                    ${accentStyle.arrow}
                  `
              }
            `}
          >
            {disabled ? "—" : "→"}
          </span>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="relative mt-4">
          <div className="flex items-center gap-2">
            <h2
              className={`
                text-[14px]
                font-bold
                leading-tight
                text-slate-900

                transition-colors
                duration-200

                ${
                  disabled
                    ? ""
                    : accentStyle.title
                }
              `}
            >
              {title}
            </h2>

            {disabled && (
              <span
                className="
                  rounded-full
                  border
                  border-slate-200
                  bg-slate-50
                  px-1.5
                  py-0.5
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-400
                "
              >
                Restricted
              </span>
            )}
          </div>

          <p
            className={`
              mt-1.5
              line-clamp-2
              text-[11.5px]
              leading-[18px]

              transition-colors
              duration-200

              ${
                disabled
                  ? "text-slate-400"
                  : "text-slate-500"
              }
            `}
          >
            {desc}
          </p>
        </div>

        {/* =================================================
            BOTTOM MICRO ACCENT
        ================================================= */}

        {!disabled && (
          <span
            className={`
              pointer-events-none
              absolute
              bottom-0
              left-4
              h-[2px]
              w-0
              rounded-full

              transition-all
              duration-300
              ease-out

              group-hover:w-12

              ${
                accent === "orange"
                  ? "bg-orange-400"
                  : "bg-red-500"
              }
            `}
          />
        )}
      </button>
    );
  }
);

DashboardCard.displayName = "DashboardCard";

/* =========================================================
   CRM DASHBOARD
========================================================= */

export default function CRMDashboard() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const [searchText, setSearchText] =
    useState("");

  /* =======================================================
     ROLE
  ======================================================= */

  const userRole = useMemo(() => {
    return String(user?.role ?? "")
      .trim()
      .toUpperCase();
  }, [user?.role]);

  /* =======================================================
     USER ID
  ======================================================= */

  const userId = useMemo(() => {
    return String(user?.user_id ?? "")
      .trim()
      .toUpperCase();
  }, [user?.user_id]);

  /* =======================================================
     PRICE MANAGEMENT ACCESS

     ONLY:
     AD0001
     CRM0001
  ======================================================= */

  const canAccessPriceManagement =
    useMemo(() => {
      return PRICE_MANAGEMENT_ALLOWED_USERS.has(
        userId
      );
    }, [userId]);

  /* =======================================================
     SEARCH
  ======================================================= */

  const handleRedirect = useCallback(() => {
    const query =
      searchText.trim();

    if (!query) {
      navigate("/search");
      return;
    }

    navigate(
      `/search?search=${encodeURIComponent(
        query
      )}`
    );
  }, [
    navigate,
    searchText,
  ]);

  const handleSearchKeyDown =
    useCallback(
      (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          handleRedirect();
        }
      },
      [handleRedirect]
    );

  /* =======================================================
     CRM OPTIONS

     EXACT SAME CRM UI / OPTIONS
  ======================================================= */

  const crmCards = useMemo(
    () => {
      const baseCards = [
        {
          title: "Schemes",
          desc: "View and manage available schemes.",
          icon: <FaGift />,
          url: "/user-schemes",
          accent: "orange",
        },

        {
          title: "Category",
          desc: "Browse product categories and subcategories.",
          icon: <FaLayerGroup />,
          url: "/all-categories",
          accent: "red",
        },

        {
          title: "Users",
          desc: "View users and manage user information.",
          icon: <FaUsers />,
          url: "/all-users/list",
          accent: "orange",
        },

        {
          title: "ASM Management",
          desc: "Manage ASM assignments and teams.",
          icon: <FaUserTie />,
          url: "/asm-assignment",
          accent: "red",
        },

        {
          title: "New Orders",
          desc: "Check and verify incoming orders.",
          icon: <FaShoppingCart />,
          url: "/crm/orders",
          accent: "orange",
        },

        {
          title: "Remarks",
          desc: "View and manage order remarks.",
          icon: <FaCommentDots />,
          url: "/remarks",
          accent: "red",
        },

        {
          title: "History",
          desc: "View verified, rejected and dispatched orders.",
          icon: <FaHistory />,
          url: "/all/orders-history",
          accent: "orange",
        },

        {
          title: "Track Orders",
          desc: "Track order progress and dispatch status.",
          icon: <FaRoute />,
          url: "/order-records",
          accent: "red",
        },

        {
          title: "Goa Trip",
          desc: "View Goa couple trip scheme progress.",
          icon: <FaUmbrellaBeach />,
          url: "/goa-couple-trip-schemes",
          accent: "orange",
        },

        {
          title: "Catalogue",
          desc: "Open product catalogue and PDFs.",
          icon: <FaBookOpen />,
          url: "/product-images-pdf",
          accent: "red",
        },

        {
          title: "Spare Parts",
          desc: "Browse spare parts and categories.",
          icon: <FaTools />,
          url: "/category/Spare%20parts/subcategories",
          accent: "orange",
        },
      ];

      /*
       * Price Management is added ONLY
       * for AD0001 and CRM0001.
       */

      if (canAccessPriceManagement) {
        baseCards.push({
          title: "Price Management",
          desc: "Manage SS, distributor and dealer prices.",
          icon: <FaTags />,
          url: "/price-management",
          accent: "red",
        });
      }

      return baseCards;
    },
    [canAccessPriceManagement]
  );

  /* =======================================================
     ADMIN OPTIONS

     SAME LINKS AS ADMIN NAVBAR
     
     Dashboard itself is not added because this
     component IS the dashboard.
  ======================================================= */

  const adminCards = useMemo(
    () => {
      const baseCards = [
        {
          title: "Products",
          desc: "Manage products and product information.",
          icon: <FaBoxOpen />,
          url: "/products",
          accent: "orange",
        },

        {
          title: "Inactive",
          desc: "View and manage inactive products.",
          icon: <FaBan />,
          url: "/inactive",
          accent: "red",
        },

        {
          title: "Sale Name",
          desc: "Manage product sale names.",
          icon: <FaTag />,
          url: "/sale-name",
          accent: "orange",
        },

        {
          title: "Schemes",
          desc: "View and manage product schemes.",
          icon: <FaGift />,
          url: "/schemes",
          accent: "red",
        },

        {
          title: "Users",
          desc: "View users and manage user information.",
          icon: <FaUsers />,
          url: "/all-users/list",
          accent: "orange",
        },

        {
          title: "All Orders",
          desc: "View verified, rejected and dispatched orders.",
          icon: <FaClipboardList />,
          url: "/all/orders-history",
          accent: "red",
        },

        {
          title: "Dispatch",
          desc: "Manage dispatch entries and dispatch data.",
          icon: <FaTruck />,
          url: "/dispatch-entries",
          accent: "orange",
        },

        {
          title: "Not In Stock",
          desc: "View products and orders reported as not in stock.",
          icon: <FaChartLine />,
          url: "/not-in-stock-reports",
          accent: "red",
        },

        {
          title: "Track Orders",
          desc: "Track order progress and dispatch status.",
          icon: <FaRoute />,
          url: "/orders-tracking",
          accent: "orange",
        },

        {
          title: "Goa Trip",
          desc: "View Goa couple trip scheme progress.",
          icon: <FaUmbrellaBeach />,
          url: "/goa-couple-trip-schemes",
          accent: "red",
        },

        {
          title: "Catalogue",
          desc: "Open product catalogue and PDFs.",
          icon: <FaBookOpen />,
          url: "/product-images-pdf",
          accent: "orange",
        },
      ];

      /*
       * Price Management:
       *
       * ONLY AD0001
       * AND CRM0001
       *
       * can see this card.
       */

      if (canAccessPriceManagement) {
        baseCards.splice(1, 0, {
          title: "Price Management",
          desc: "Manage SS, distributor and dealer prices.",
          icon: <FaTags />,
          url: "/price-management",
          accent: "red",
        });
      }

      return baseCards;
    },
    [canAccessPriceManagement]
  );

  /* =======================================================
     FINAL CARDS BASED ON ROLE
  ======================================================= */

  const cards = useMemo(() => {
    if (userRole === "ADMIN") {
      return adminCards;
    }

    if (userRole === "CRM") {
      return crmCards;
    }

    return [];
  }, [
    userRole,
    adminCards,
    crmCards,
  ]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="
        min-h-full
        px-3
        pb-15
        pt-3
        sm:px-5
        sm:pt-5
        lg:px-6
      "
    >
      <div className="mx-auto w-full max-w-[1500px]">

        {/* =================================================
            PAGE TITLE
        ================================================= */}

        <div
          className="
            mb-3
            flex
            items-center
            justify-between
          "
        >
          <div>
            <h1
              className="
                text-[16px]
                font-bold
                tracking-tight
                text-slate-900
              "
            >
              Quick Access
            </h1>

            <p
              className="
                mt-0.5
                text-[11px]
                text-slate-500
              "
            >
              {userRole === "ADMIN"
                ? "Admin tools & management"
                : "CRM tools & management"}
            </p>
          </div>

          <span
            className="
              rounded-full
              border
              border-red-100
              bg-gradient-to-r
              from-red-50
              to-orange-50
              px-2.5
              py-1
              text-[10px]
              font-bold
              text-red-600
            "
          >
            {cards.length} OPTIONS
          </span>
        </div>

        {/* =================================================
            CARDS
        ================================================= */}

        <div
          className="
            grid
            grid-cols-2
            gap-3

            sm:grid-cols-2
            sm:gap-4

            lg:grid-cols-3

            xl:grid-cols-4
          "
        >
          {cards.map((card) => (
            <DashboardCard
              key={card.title}
              title={card.title}
              desc={card.desc}
              icon={card.icon}
              url={card.url}
              accent={card.accent}
              disabled={card.disabled}
            />
          ))}
        </div>
      </div>
    </div>
  );
}