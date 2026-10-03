
import {
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  FaUserCircle,
  FaSearch,
  FaHome,
  FaGift,
  FaUsers,
  FaBoxOpen,
  FaHistory,
  FaShoppingCart,
  FaList,
  FaPlus,
  FaSignOutAlt,
  FaChartLine,
  FaBan,
  FaRoute,
  FaCog,
  FaCommentDots,
  FaUserTie,
  FaTag,
  FaClipboardList,
  FaTruck,
  FaTools,
  FaBookOpen,
  FaUmbrellaBeach,
} from "react-icons/fa";

import {

  MoreVertical,
  Tags,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
} from "react";

import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSchemes } from "../hooks/useSchemes";
import useFuseSearch from "../hooks/useFuseSearch";

import collapsedLogo from "../assets/images/makpower_image.webp";
import expandedLogo from "../assets/images/sidebar_logo.webp";

import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useStock } from "../context/StockContext";
import InactiveStockNotification from "./InactiveStockNotification";

/* =========================================================
   CONSTANTS
========================================================= */

const EXCLUDED_CATEGORIES = new Set([
  "SPEAKER PCB",
  "SPEAKER PACKING",
  "SPEAKER HOUSING",
]);

const PRICE_MANAGEMENT_ALLOWED_USER_IDS = new Set([
  "CRM0002",
  "AD0001",
  "CRM0004",
]);

const SIDEBAR_COLLAPSED_WIDTH = 72;
const SIDEBAR_EXPANDED_WIDTH = 220;

/* =========================================================
   COMPONENT
========================================================= */

export default function Navbar({
  sidebarCollapsed,
  setSidebarCollapsed,
}) {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const { getStockValue } = useStock();

  /* =========================================================
     UI STATE
  ========================================================= */

  const [profileDropdownOpen, setProfileDropdownOpen] =
    useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [searchDropdownOpen, setSearchDropdownOpen] =
    useState(false);

  const [cartCount, setCartCount] = useState(0);

  const [sidebarReady, setSidebarReady] = useState(false);

  /* =========================================================
     REFS
  ========================================================= */

  const profileRef = useRef(null);
  const searchRef = useRef(null);

  /* =========================================================
     SELECTED PRODUCTS
  ========================================================= */

  const {
    selectedProducts,
    addProduct,
    updateQuantity,
    updateCartoon,
    cartoonSelection,
  } = useSelectedProducts();

  /* =========================================================
     PRODUCTS
  ========================================================= */

  const {
    data: allProductsRaw = [],
    isLoading,
  } = useCachedProducts();

  const { data: schemes = [] } = useSchemes();

  /* =========================================================
     SPECIAL EXPANDED PAGES
  ========================================================= */

  const isAlwaysExpandedPage = useMemo(
    () =>
      location.pathname === "/dashboard" ||
      location.pathname === "/crm/orders" ||
      location.pathname === "/user-schemes",
    [location.pathname]
  );

  /* =========================================================
     PRICE MANAGEMENT ACCESS
  ========================================================= */

  const canAccessPriceManagement = useMemo(() => {
    if (user?.role !== "CRM") {
      return true;
    }

    return PRICE_MANAGEMENT_ALLOWED_USER_IDS.has(
      String(user?.user_id || "").trim().toUpperCase()
    );
  }, [user?.role, user?.user_id]);

  /* =========================================================
     PRODUCTS
  ========================================================= */

  const allProducts = useMemo(() => {
    if (!Array.isArray(allProductsRaw)) {
      return [];
    }

    return allProductsRaw
      .map((product) => ({
        ...product,
        id: product.id ?? product.product_id,
      }))
      .filter((product) => product.is_active === true)
      .filter((product) => {
        const category = String(
          product.sub_category || ""
        )
          .trim()
          .toUpperCase();

        return !EXCLUDED_CATEGORIES.has(category);
      });
  }, [allProductsRaw]);

  /* =========================================================
     SEARCH
  ========================================================= */

  const fuseResults = useFuseSearch(
    allProducts,
    searchTerm,
    {
      keys: [
        "sub_category",
        "sale_names",
        "product_name",
      ],
      threshold: 0.3,
    }
  );

  const searchResults = useMemo(() => {
    const query = searchTerm.trim();

    if (!query) {
      return [];
    }

    const uniqueResults = new Map();
    const lowerSearch = query.toLowerCase();

    (fuseResults || []).forEach((product) => {
      const category = String(
        product.sub_category || ""
      )
        .trim()
        .toUpperCase();

      if (EXCLUDED_CATEGORIES.has(category)) {
        return;
      }

      const matchedSaleName = Array.isArray(
        product.sale_names
      )
        ? product.sale_names.find((name) =>
            String(name)
              .toLowerCase()
              .includes(lowerSearch)
          )
        : null;

      const productNameMatch =
        product.product_name
          ?.toLowerCase()
          .includes(lowerSearch);

      const categoryMatch =
        product.sub_category
          ?.toLowerCase()
          .includes(lowerSearch);

      const matchFound =
        productNameMatch ||
        categoryMatch ||
        !!matchedSaleName;

      if (matchFound) {
        uniqueResults.set(product.id, {
          ...product,
          _displayName:
            matchedSaleName ||
            product.product_name,
        });
      }
    });

    return Array.from(uniqueResults.values());
  }, [fuseResults, searchTerm]);

  const searchResultsLimited = useMemo(
    () => searchResults.slice(0, 6),
    [searchResults]
  );

  /* =========================================================
     HELPERS
  ========================================================= */

  const hasScheme = (productId) =>
    schemes.some(
      (scheme) =>
        Array.isArray(scheme.conditions) &&
        scheme.conditions.some(
          (condition) =>
            condition.product === productId
        )
    );

  const isAdded = (id) =>
    selectedProducts.some(
      (product) => product.id === id
    );

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    logout(() => {
      navigate("/login");
    });
  };

  /* =========================================================
     ADD PRODUCT
  ========================================================= */

  const handleAddProduct = (product) => {
    if (isAdded(product.id)) {
      return;
    }

    const isDS = user?.role === "DS";
    const moq = product.moq || 1;

    const initialQty = isDS
      ? 1
      : product.cartoon_size &&
        product.cartoon_size > 1
      ? product.cartoon_size
      : moq;

    addProduct({
      ...product,
      quantity: initialQty,
    });
  };

  /* =========================================================
     SIDEBAR ROUTE BEHAVIOR
  ========================================================= */

  useLayoutEffect(() => {
    if (isAlwaysExpandedPage) {
      if (sidebarCollapsed !== false) {
        setSidebarCollapsed(false);
      }
    } else {
      if (sidebarCollapsed !== true) {
        setSidebarCollapsed(true);
      }
    }

    setSidebarReady(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    location.pathname,
    isAlwaysExpandedPage,
    setSidebarCollapsed,
  ]);

  /* =========================================================
     MANUAL SIDEBAR TOGGLE
  ========================================================= */

  const handleSidebarToggle = () => {
    if (isAlwaysExpandedPage) {
      return;
    }

    setSidebarCollapsed(
      (current) => !current
    );
  };

  /* =========================================================
     CART COUNT
  ========================================================= */

  useEffect(() => {
    if (
      user?.role !== "SS" &&
      user?.role !== "DS"
    ) {
      return;
    }

    const updateCart = () => {
      try {
        const saved = localStorage.getItem(
          "selectedProducts"
        );

        const parsed = saved
          ? JSON.parse(saved)
          : [];

        setCartCount(
          Array.isArray(parsed)
            ? parsed.length
            : 0
        );
      } catch {
        setCartCount(0);
      }
    };

    updateCart();

    const interval = setInterval(
      updateCart,
      500
    );

    return () => {
      clearInterval(interval);
    };
  }, [user?.role]);

  /* =========================================================
     CLOSE DROPDOWNS
  ========================================================= */

  useEffect(() => {
    const handler = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {
        setProfileDropdownOpen(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target
        )
      ) {
        setSearchDropdownOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handler
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handler
      );
    };
  }, []);

  /* =========================================================
     ROLE NAVIGATION
  ========================================================= */

  const navItems = useMemo(() => {
    const items = [];

    /* =======================================================
       ADMIN
    ======================================================= */

    if (user?.role === "ADMIN") {
      items.push(
        {
          label: "Dashboard",
          path: "/",
          icon: <FaHome />,
        },
        {
          label: "Products",
          path: "/products",
          icon: <FaBoxOpen />,
        },
        {
          label: "Price Management",
          path: "/price-management",
          icon: <Tags />,
        },
       
        {
          label: "Sale Name",
          path: "/sale-name",
          icon: <FaTag />,
        },
        {
          label: "Schemes",
          path: "/schemes",
          icon: <FaGift />,
        },
        {
          label: "Users",
          path: "/all-users/list",
          icon: <FaUsers />,
        },
        {
          label: "All Orders",
          path: "/all/orders-history",
          icon: <FaClipboardList />,
        },
        {
          label: "Dispatch",
          path: "/dispatch-entries",
          icon: <FaTruck />,
        },
        {
          label: "Not In Stock",
          path: "/not-in-stock-reports",
          icon: <FaChartLine />,
        },
        {
          label: "Track Orders",
          path: "/orders-tracking",
          icon: <FaRoute />,
        },
        // {
        //   label: "Goa Trip",
        //   path: "/goa-couple-trip-schemes",
        //   icon: <FaUmbrellaBeach />,
        // },
        {
          label: "Catalogue",
          path: "/product-images-pdf",
          icon: <FaBookOpen />,
        }
      );
    }

    /* =======================================================
       CRM
    ======================================================= */

    if (user?.role === "CRM") {
      items.push(
        {
          label: "Dashboard",
          path: "/",
          icon: <FaHome />,
        },
        {
          label: "Schemes",
          path: "/user-schemes",
          icon: <FaGift />,
        },
        {
          label: "Users",
          path: "/all-users/list",
          icon: <FaUsers />,
        },
        {
          label: "ASM Management",
          path: "/asm-assignment",
          icon: <FaUserTie />,
        },
        {
          label: "New Orders",
          path: "/crm/orders",
          icon: <FaShoppingCart />,
        },
        {
          label: "Remarks",
          path: "/remarks",
          icon: <FaCommentDots />,
        },
        {
          label: "History",
          path: "/all/orders-history",
          icon: <FaHistory />,
        },
        {
          label: "Track Orders",
          path: "/order-records",
          icon: <FaRoute />,
        },
        {
          label: "Not In Stock",
          path: "/not-in-stock-reports",
          icon: <FaChartLine />,
        },
        // {
        //   label: "Goa Trip",
        //   path: "/goa-couple-trip-schemes",
        //   icon: <FaUmbrellaBeach />,
        // },
        {
          label: "Catalogue",
          path: "/product-images-pdf",
          icon: <FaBookOpen />,
        },
        {
          label: "Spare Parts",
          path: "/category/Spare%20parts/subcategories",
          icon: <FaTools />,
        }
      );

      /*
        Price Management:
        Only selected CRM user IDs can see it.
      */

      if (
        PRICE_MANAGEMENT_ALLOWED_USER_IDS.has(
          String(user?.user_id || "")
            .trim()
            .toUpperCase()
        )
      ) {
        items.push({
          label: "Price Management",
          path: "/price-management",
          icon: <Tags />,
        });
      }
    }

    /* =======================================================
       ASM
    ======================================================= */

    if (user?.role === "ASM") {
      items.push(
        {
          label: "ASM Dashboard",
          path: "/asm",
          icon: <FaHome />,
        },
        {
          label: "Schemes",
          path: "/user-schemes",
          icon: <FaGift />,
        },
        {
          label: "Categories",
          path: "/all-categories",
          icon: <FaList />,
        }
      );
    }

    /* =======================================================
       DS
    ======================================================= */

    if (user?.role === "DS") {
      items.push(
        {
          label: "Dashboard",
          path: "/",
          icon: <FaHome />,
        },
        {
          label: "Schemes",
          path: "/user-schemes",
          icon: <FaGift />,
        },
        {
          label: "Categories",
          path: "/all-categories",
          icon: <FaList />,
        },
        {
          label: "Orders",
          path: "/ds/my-orders",
          icon: <FaClipboardList />,
        }
      );
    }

    /* =======================================================
       SS
    ======================================================= */

    if (user?.role === "SS") {
      items.push(
        {
          label: "Dashboard",
          path: "/",
          icon: <FaHome />,
        },
        {
          label: "Schemes",
          path: "/user-schemes",
          icon: <FaGift />,
        },
        {
          label: "Orders",
          path: "/ss/history",
          icon: <FaClipboardList />,
        },
        {
          label: "Categories",
          path: "/all-categories",
          icon: <FaList />,
        }
      );
    }

    /* =======================================================
       HR
    ======================================================= */

    if (user?.role === "HR") {
      items.push(
        {
          label: "Dashboard",
          path: "/remarks",
          icon: <FaHome />,
        },
        {
          label: "Categories",
          path: "/all-categories",
          icon: <FaList />,
        }
      );
    }

    return items;
  }, [user?.role, user?.user_id]);

  /* =========================================================
     SIDEBAR DIMENSIONS
  ========================================================= */

  const sidebarWidth = sidebarCollapsed
    ? SIDEBAR_COLLAPSED_WIDTH
    : SIDEBAR_EXPANDED_WIDTH;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside
        className={`
          fixed
          left-0
          top-0
          bottom-0
          z-[90]

          hidden
          md:flex
          flex-col

          overflow-visible

          bg-[#0d1b2d]
          text-white

          shadow-[8px_0_30px_rgba(15,23,42,0.10)]

          ${
            sidebarReady
              ? "transition-[width] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[width]"
              : "transition-none"
          }
        `}
        style={{
          width: `${sidebarWidth}px`,
        }}
      >
        {/* ===================================================
            LOGO
        =================================================== */}

        <div
          className={`
            relative
            flex
            h-[64px]
            shrink-0
            items-center

            border-b
            border-white/[0.07]

            ${
              sidebarCollapsed
                ? "justify-center"
                : "px-5"
            }
          `}
        >
          <div
            className="
              absolute
              inset-x-0
              bottom-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-red-500/30
              to-transparent
            "
          />

          <img
            src={
              sidebarCollapsed
                ? collapsedLogo
                : expandedLogo
            }
            alt="MAKPOWER"
            onClick={() => navigate("/")}
            draggable="false"
            className={`
              cursor-pointer
              object-contain
              select-none

              transition-transform
              duration-200

              hover:scale-[1.02]

              ${
                sidebarCollapsed
                  ? "h-auto w-[40px]"
                  : "h-auto w-[136px]"
              }
            `}
          />
        </div>

        {/* ===================================================
            FLOATING COLLAPSE BUTTON
        =================================================== */}

        <button
          type="button"
          onClick={handleSidebarToggle}
          disabled={isAlwaysExpandedPage}
          aria-label={
            sidebarCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          title={
            isAlwaysExpandedPage
              ? "Sidebar is always expanded on this page"
              : sidebarCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
          }
          className={`
            group

            absolute
            right-[-19px]
            top-[44px]
            z-[150]

            flex
            h-[38px]
            w-[38px]
            items-center
            justify-center

            rounded-full

            border
            border-white/80

            bg-[#0d1b2d]
            text-white

            shadow-[0_6px_20px_rgba(15,23,42,0.30)]

            transition-all
            duration-200
            ease-out

            ${
              isAlwaysExpandedPage
                ? "cursor-not-allowed opacity-50"
                : `
                  cursor-pointer
                  hover:scale-105
                  hover:border-red-300
                  hover:bg-[#dc2626]
                  hover:shadow-[0_8px_22px_rgba(220,38,38,0.28)]
                  active:scale-95
                `
            }
          `}
        >
          <span
            className="
              flex
              items-center
              justify-center
              transition-transform
              duration-200
              group-hover:scale-105
            "
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen
                size={17}
                strokeWidth={2.2}
              />
            ) : (
              <PanelLeftClose
                size={17}
                strokeWidth={2.2}
              />
            )}
          </span>
        </button>

        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <div className="flex-1 overflow-y-auto px-2.5 py-5 scrollbar-thin">
          {!sidebarCollapsed && (
            <div className="mb-3 px-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Main Menu
              </p>
            </div>
          )}

          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                title={
                  sidebarCollapsed
                    ? item.label
                    : undefined
                }
                className={({ isActive }) =>
                  `
                    group
                    relative
                    flex
                    items-center
                    overflow-hidden
                    rounded-lg

                    transition-all
                    duration-150
                    ease-out

                    ${
                      sidebarCollapsed
                        ? "justify-center px-2 py-3"
                        : "gap-3 px-3 py-2.5"
                    }

                    ${
                      isActive
                        ? `
                          bg-gradient-to-r
                          from-red-500
                          to-orange-500
                          text-white

                          shadow-[0_6px_18px_rgba(239,68,68,0.20)]

                          before:absolute
                          before:left-0
                          before:top-1/2
                          before:h-6
                          before:w-[3px]
                          before:-translate-y-1/2
                          before:rounded-r-full
                          before:bg-white
                        `
                        : `
                          text-slate-300

                          hover:bg-white/[0.065]
                          hover:text-white

                          hover:translate-x-[1px]
                        `
                    }
                  `
                }
              >
                {/* Hover background glow */}
                <span
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    rounded-lg
                    bg-gradient-to-r
                    from-red-500/[0.07]
                    to-orange-400/[0.03]
                    opacity-0
                    transition-opacity
                    duration-150
                    group-hover:opacity-100
                  "
                />

                <span
                  className="
                    relative
                    z-10
                    flex
                    h-5
                    w-5
                    shrink-0
                    items-center
                    justify-center
                    text-[14px]

                    transition-transform
                    duration-150
                    ease-out

                    group-hover:scale-110
                    group-active:scale-95
                  "
                >
                  {item.icon}
                </span>

                {!sidebarCollapsed && (
                  <span
                    className="
                      relative
                      z-10
                      truncate
                      text-[11px]
                      font-semibold
                      tracking-[0.01em]
                    "
                  >
                    {item.label}
                  </span>
                )}

                {!sidebarCollapsed && (
                  <span
                    className="
                      pointer-events-none
                      absolute
                      right-3
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-white
                      opacity-0
                      transition-all
                      duration-150
                      group-hover:translate-x-0
                      group-hover:opacity-40
                    "
                  />
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </aside>

      {/* =====================================================
          DESKTOP TOP HEADER
      ===================================================== */}

      <header
        className={`
          fixed
          right-0
          top-0
          z-[80]

          hidden
          h-[64px]
          items-center

          border-b
          border-slate-200/80

          bg-white/95
          backdrop-blur-sm

          shadow-[0_2px_12px_rgba(15,23,42,0.035)]

          md:flex

          ${
            sidebarReady
              ? "transition-[left] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[left]"
              : "transition-none"
          }
        `}
        style={{
          left: `${sidebarWidth}px`,
        }}
      >
        {/* ===================================================
            SEARCH
        =================================================== */}

        <div
          ref={searchRef}
          className="
            relative
            ml-5
            min-w-0
            flex-1
            max-w-[620px]
          "
        >
          <div className="group relative">
            <FaSearch
              className="
                pointer-events-none
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2

                text-[11px]
                text-slate-400

                transition-all
                duration-150

                group-focus-within:scale-110
                group-focus-within:text-red-500
              "
            />

            <input
              type="text"
              value={searchTerm}
              maxLength={30}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSearchDropdownOpen(true);
              }}
              onFocus={() =>
                setSearchDropdownOpen(true)
              }
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSearchTerm("");
                  setSearchDropdownOpen(false);
                }
              }}
              placeholder="Search by product, category or sale name..."
              className="
                h-10
                w-full
                rounded-lg

                border
                border-slate-300

                bg-slate-50/70

                pl-10
                pr-20

                text-[11px]
                font-medium
                text-slate-700

                outline-none

                transition-all
                duration-150

                placeholder:text-slate-400

                hover:border-slate-300
                hover:bg-white

                focus:border-red-300
                focus:bg-white
                focus:ring-4
                focus:ring-red-500/[0.06]
              "
            />

            <span
              className="
                pointer-events-none
                absolute
                right-2.5
                top-1/2
                -translate-y-1/2

                rounded-md
                border
                border-slate-200
                bg-white

                px-2
                py-1

                text-[8px]
                font-bold
                text-slate-400

                shadow-sm
              "
            >
              Ctrl + K
            </span>
          </div>

          {/* =================================================
              SEARCH RESULTS
          ================================================= */}

          {searchDropdownOpen &&
            searchTerm.trim() && (
              <div
                className="
                  absolute
                  left-0
                  right-0
                  top-[48px]
                  z-[200]

                  max-h-[420px]
                  overflow-y-auto

                  rounded-xl

                  border
                  border-slate-200

                  bg-white

                  shadow-[0_20px_60px_rgba(15,23,42,0.13)]

                  animate-[searchDrop_.18s_ease-out]
                "
              >
                {isLoading ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Loading products...
                  </div>
                ) : searchResultsLimited.length ===
                  0 ? (
                  <div className="p-7 text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-400">
                      <FaSearch size={12} />
                    </div>

                    <p className="text-xs font-bold text-slate-700">
                      No products found
                    </p>

                    <p className="mt-1 text-[9px] text-slate-400">
                      Try product name or sale name
                    </p>
                  </div>
                ) : (
                  searchResultsLimited.map(
                    (product) => {
                      const currentStock =
                        getStockValue(product);

                      const outOfStock =
                        currentStock <=
                        (product.moq || 1);

                      return (
                        <div
                          key={
                            product.id +
                            product._displayName
                          }
                          className="
                            group
                            flex
                            items-center
                            justify-between
                            gap-3

                            border-b
                            border-slate-100

                            px-4
                            py-3

                            transition-all
                            duration-100

                            hover:bg-red-50/30
                            last:border-0
                          "
                        >
                          <button
                            type="button"
                            onClick={() => {
                              navigate(
                                `/product/${product.id}`
                              );

                              setSearchDropdownOpen(
                                false
                              );
                            }}
                            className="
                              min-w-0
                              flex-1
                              text-left
                            "
                          >
                            <div className="flex items-center gap-2">
                              <span className="truncate text-xs font-bold text-slate-800">
                                {product._displayName}
                              </span>

                              <span
                                className={`
                                  shrink-0
                                  rounded-full

                                  px-2
                                  py-0.5

                                  text-[8px]
                                  font-bold

                                  ${
                                    outOfStock
                                      ? "bg-red-50 text-red-600"
                                      : "bg-emerald-50 text-emerald-600"
                                  }
                                `}
                              >
                                {outOfStock
                                  ? "Out of Stock"
                                  : "In Stock"}
                              </span>

                              {hasScheme(
                                product.id
                              ) && (
                                <FaGift className="shrink-0 text-[10px] text-orange-500" />
                              )}
                            </div>

                            <p className="mt-1 truncate text-[9px] font-medium text-slate-400">
                              {product.product_name}
                              {" · "}
                              {product.sub_category}
                            </p>
                          </button>

                          {(user?.role === "SS" ||
                            user?.role === "DS") && (
                            <div className="shrink-0">
                              {isAdded(
                                product.id
                              ) ? (
                                product.quantity_type ===
                                  "CARTOON" &&
                                user?.role !== "DS" ? (
                                  <select
                                    value={
                                      cartoonSelection[
                                        product.id
                                      ] || 1
                                    }
                                    onChange={(e) =>
                                      updateCartoon(
                                        product.id,
                                        parseInt(
                                          e.target.value
                                        )
                                      )
                                    }
                                    className="
                                      rounded-lg
                                      border
                                      border-slate-200
                                      bg-white
                                      px-2
                                      py-1.5
                                      text-[9px]
                                      font-semibold
                                      outline-none

                                      focus:border-red-300
                                      focus:ring-2
                                      focus:ring-red-500/10
                                    "
                                  >
                                    {Array.from(
                                      {
                                        length: 100,
                                      },
                                      (_, index) =>
                                        index + 1
                                    ).map(
                                      (number) => (
                                        <option
                                          key={number}
                                          value={number}
                                        >
                                          {number} CTN
                                        </option>
                                      )
                                    )}
                                  </select>
                                ) : (
                                  <input
                                    type="number"
                                    min="1"
                                    value={
                                      selectedProducts.find(
                                        (item) =>
                                          item.id ===
                                          product.id
                                      )?.quantity ||
                                      ""
                                    }
                                    onChange={(e) => {
                                      const value =
                                        e.target.value;

                                      if (
                                        value === ""
                                      ) {
                                        updateQuantity(
                                          product.id,
                                          ""
                                        );
                                        return;
                                      }

                                      const parsed =
                                        parseInt(
                                          value
                                        );

                                      if (
                                        !isNaN(parsed)
                                      ) {
                                        updateQuantity(
                                          product.id,
                                          parsed
                                        );
                                      }
                                    }}
                                    className="
                                      w-16
                                      rounded-lg
                                      border
                                      border-slate-200
                                      px-2
                                      py-1.5
                                      text-[10px]
                                      font-semibold
                                      outline-none

                                      focus:border-red-300
                                      focus:ring-2
                                      focus:ring-red-500/10
                                    "
                                  />
                                )
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    handleAddProduct(
                                      product
                                    );
                                  }}
                                  className="
                                    flex
                                    h-8
                                    w-8
                                    items-center
                                    justify-center

                                    rounded-lg

                                    bg-red-50
                                    text-red-500

                                    transition-all
                                    duration-150

                                    hover:scale-105
                                    hover:bg-red-100
                                    hover:text-red-600
                                    active:scale-95
                                  "
                                >
                                  <FaPlus size={10} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }
                  )
                )}
              </div>
            )}
        </div>

        {/* ===================================================
            RIGHT SIDE
        =================================================== */}

        <div className="ml-auto flex items-center gap-1.5 px-4">
          {/* =================================================
              CART
          ================================================= */}

          {(user?.role === "SS" ||
            user?.role === "DS") && (
            <NavLink
              to="/cart"
              title="Cart"
              className="
                group
                relative

                flex
                h-10
                w-10
                items-center
                justify-center

                rounded-lg

                text-slate-500

                transition-all
                duration-150

                hover:bg-red-50
                hover:text-red-500
                active:scale-95
              "
            >
              <FaShoppingCart
                size={15}
                className="
                  transition-transform
                  duration-150
                  group-hover:scale-110
                "
              />

              {cartCount > 0 && (
                <span
                  className="
                    absolute
                    right-0.5
                    top-0.5

                    flex
                    h-4
                    min-w-4
                    items-center
                    justify-center

                    rounded-full

                    bg-red-500

                    px-1

                    text-[8px]
                    font-extrabold
                    text-white

                    shadow-sm

                    animate-[badgePop_.18s_ease-out]
                  "
                >
                  {cartCount}
                </span>
              )}
            </NavLink>
          )}

          {/* =================================================
              NOTIFICATION
          ================================================= */}

        <InactiveStockNotification user={user} />

          {/* =================================================
              PROFILE
          ================================================= */}

          <div
            ref={profileRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setProfileDropdownOpen(
                  (current) => !current
                )
              }
              className="
                group
                flex
                items-center
                gap-2

                rounded-xl

                border
                border-transparent

                px-2
                py-1.5

                transition-all
                duration-150

                hover:border-slate-200
                hover:bg-slate-50
                active:scale-[0.98]
              "
            >
              <div
                className="
                  flex
                  h-[30px]
                  w-[30px]
                  items-center
                  justify-center

                  rounded-full

                  bg-gradient-to-br
                  from-slate-700
                  to-slate-500

                  text-white

                  shadow-sm

                  transition-transform
                  duration-150

                  group-hover:scale-105
                "
              >
                <FaUserCircle className="text-[29px] text-white/90" />
              </div>

              <div className="hidden text-left lg:block">
                <p className="max-w-[130px] truncate text-[11px] font-bold text-slate-800">
                  {user?.name}
                </p>

                <p className="text-[8px] font-semibold text-slate-400">
                  {user?.role}
                </p>
              </div>
            </button>

            {profileDropdownOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-[50px]
                  z-[200]

                  w-56

                  overflow-hidden

                  rounded-xl

                  border
                  border-slate-200

                  bg-white

                  shadow-[0_20px_50px_rgba(15,23,42,0.14)]

                  animate-[searchDrop_.18s_ease-out]
                "
              >
                <div
                  className="
                    border-b
                    border-slate-100

                    bg-gradient-to-br
                    from-slate-50
                    to-white

                    px-4
                    py-4
                  "
                >
                  <p className="text-[11px] font-extrabold text-slate-800">
                    {user?.name}
                  </p>

                  <p className="mt-0.5 text-[9px] font-semibold text-slate-400">
                    {user?.role}
                  </p>

                  <p className="mt-1.5 text-[9px] text-slate-500">
                    ID: {user?.user_id}
                  </p>
                </div>

                {user?.role === "ADMIN" && (
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/setting");
                      setProfileDropdownOpen(
                        false
                      );
                    }}
                    className="
                      group
                      flex
                      w-full
                      items-center
                      gap-3

                      px-4
                      py-3

                      text-left

                      text-[10px]
                      font-semibold
                      text-slate-600

                      transition-all
                      duration-150

                      hover:bg-slate-50
                      hover:text-slate-900
                    "
                  >
                    <span
                      className="
                        transition-transform
                        duration-150
                        group-hover:rotate-45
                      "
                    >
                      <FaCog />
                    </span>

                    Settings
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="
                    group
                    flex
                    w-full
                    items-center
                    gap-3

                    border-t
                    border-slate-100

                    px-4
                    py-3

                    text-left

                    text-[10px]
                    font-bold
                    text-red-500

                    transition-all
                    duration-150

                    hover:bg-red-50
                    hover:text-red-600
                  "
                >
                  <FaSignOutAlt
                    className="
                      transition-transform
                      duration-150
                      group-hover:translate-x-0.5
                    "
                  />

                  Logout
                </button>
              </div>
            )}
          </div>

          {/* =================================================
              MORE
          ================================================= */}

          <button
            type="button"
            className="
              group
              flex
              h-9
              w-9
              items-center
              justify-center

              rounded-lg

              text-slate-400

              transition-all
              duration-150

              hover:bg-slate-50
              hover:text-slate-700
              active:scale-95
            "
          >
            <MoreVertical
              size={16}
              className="
                transition-transform
                duration-150
                group-hover:scale-110
              "
            />
          </button>
        </div>
      </header>

      {/* =====================================================
          GLOBAL NAVBAR ANIMATION
      ===================================================== */}

      <style>
        {`
          @keyframes searchDrop {
            from {
              opacity: 0;
              transform: translateY(-5px) scale(.99);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes badgePop {
            from {
              opacity: 0;
              transform: scale(.7);
            }

            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>
    </>
  );
}