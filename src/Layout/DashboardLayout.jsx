import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BottomNav from "./BottomNav";
import { FaUserCircle, FaSearch, FaHome, FaGift, FaUsers, FaBox, FaHistory, FaShoppingCart, FaList, FaPlus, FaSignOutAlt, FaChartLine, FaHourglassHalf, FaBan, FaRoute, FaBoxOpen } from "react-icons/fa";
import { useState, useRef, useEffect, useMemo } from "react";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSchemes } from "../hooks/useSchemes";
import useFuseSearch from "../hooks/useFuseSearch";
import logo from "../assets/images/logo.png";
import { useSelectedProducts } from "../hooks/useSelectedProducts";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Profile Dropdown State
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef(null);
  const navRef = useRef(null);
  const [isNavFixed, setIsNavFixed] = useState(false);
  const [navOffsetTop, setNavOffsetTop] = useState(0);
  const handleLogout = () => {
  logout(() => {
    navigate("/login");
  });
};

  useEffect(() => {
    if (navRef.current) {
      setNavOffsetTop(navRef.current.offsetTop);
    }
  }, []);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= navOffsetTop) {
        setIsNavFixed(true);
      } else {
        setIsNavFixed(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navOffsetTop]);



  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  const { selectedProducts, addProduct, updateQuantity, updateCartoon, cartoonSelection } = useSelectedProducts();

  const { data: allProductsRaw = [], isLoading } = useCachedProducts();
  const { data: schemes = [] } = useSchemes();

  const normalizeProduct = (product) => ({
    ...product,
    id: product.id ?? product.product_id,
  });

  const allProducts = allProductsRaw.map(normalizeProduct);

  const fuseResults = useFuseSearch(allProducts, searchTerm, {
    keys: ["sub_category", "sale_names", "product_name"],
    threshold: 0.3,
  });

  const searchResults = useMemo(() => {
    const uniqueResults = new Map();
    const lowerSearch = searchTerm.toLowerCase();

    fuseResults.forEach((product) => {
      const matchedSaleName = product.sale_names?.find((name) =>
        name.toLowerCase().includes(lowerSearch)
      );

      const matchFound =
        product.product_name?.toLowerCase().includes(lowerSearch) ||
        product.sub_category?.toLowerCase().includes(lowerSearch) ||
        !!matchedSaleName;

      if (matchFound) {
        uniqueResults.set(product.id, {
          ...product,
          _displayName: matchedSaleName || product.product_name,
        });
      }
    });

    return Array.from(uniqueResults.values());
  }, [fuseResults, searchTerm]);

  const searchResultsLimited = searchResults.slice(0, 6);

  const hasScheme = (productId) =>
    schemes.some(
      (scheme) =>
        Array.isArray(scheme.conditions) &&
        scheme.conditions.some((cond) => cond.product === productId)
    );

  const isAdded = (id) => selectedProducts.some((p) => p.id === id);

  const handleAddProduct = (product) => {
    if (!isAdded(product.id)) {
      const moq = product.moq || 1;
      const initialQty =
        product.cartoon_size && product.cartoon_size > 1
          ? product.cartoon_size
          : moq;
      addProduct({ ...product, quantity: initialQty });
    }
  };

  // Cart count for SS role
  const [cartCount, setCartCount] = useState(0);
  useEffect(() => {
    if (user?.role === "SS") {
      const interval = setInterval(() => {
        const saved = localStorage.getItem("selectedProducts");
        const parsed = saved ? JSON.parse(saved) : [];
        setCartCount(parsed.length);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [user?.role]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 🧭 Nav items
  const navItems = [];
  if (user.role === "ADMIN") {
    navItems.push(
      { label: "Home", path: "/", icon: <FaHome /> },
      { label: "Products", path: "/products", icon: <FaBox /> },
      { label: "Inactive", path: "/inactive", icon: <FaBan /> },
      { label: "Sale Name", path: "/sale-name", icon: <FaBox /> },
      { label: "Schemes", path: "/schemes", icon: <FaGift /> },
      { label: "Users", path: "/all-users/list", icon: <FaUsers /> },
      { label: "Pending Orders", path: "/admin/pending-orders", icon: <FaHourglassHalf /> },
      { label: "All Orders", path: "/all/orders-history", icon: <FaBox /> },
      { label: "Track-Orders", path: "/orders-tracking", icon: <FaRoute /> }
    );
  }
  if (user.role === "CRM") {
    navItems.push(
      { label: "Home", path: "/", icon: <FaHome /> },
      { label: "Schemes", path: "/user-schemes", icon: <FaGift /> },
      { label: "Users", path: "/all-users/list", icon: <FaUsers /> },
      { label: "Create Orders", path: "/crm/create-order", icon: <FaBoxOpen /> },
      { label: "New Orders", path: "/crm/orders", icon: <FaBox /> },
      { label: "History", path: "/all/orders-history", icon: <FaHistory /> },
      { label: "Not-In-Stock", path: "/not-in-stock-reports", icon: <FaChartLine /> },
      { label: "Track-Orders", path: "/orders-tracking", icon: <FaRoute /> }
    );
  }
  if (user.role === "ASM") {
    navItems.push(
      { label: "Home", path: "/", icon: <FaHome /> },
      { label: "Schemes", path: "/user-schemes", icon: <FaGift /> },
      { label: "Categories", path: "/all-categories", icon: <FaList /> }
    );
  }
  if (user.role === "DS") {
    navItems.push(
      { label: "Home", path: "/", icon: <FaHome /> },
      { label: "Schemes", path: "/user-schemes", icon: <FaGift /> },
      { label: "Categories", path: "/all-categories", icon: <FaList /> }
    );
  }
  if (user.role === "SS") {
    navItems.push(
      { label: "Home", path: "/", icon: <FaHome /> },
      { label: "Schemes", path: "/user-schemes", icon: <FaGift /> },
      { label: "Orders", path: "/ss/history", icon: <FaBox /> },
      { label: "Categories", path: "/all-categories", icon: <FaList /> }
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* ✅ Top NavBar */}
      <header className="hidden md:flex justify-between items-center bg-white shadow-md px-4 py-4">
        <h1 className="text-xl md:text-2xl font-bold text-blue-600">
          <img src={logo} className="w-35" />
        </h1>

        {/* 🔍 Search */}
        <div className="relative flex-1 mx-5" ref={searchRef}>
          <input
            type="text"
            placeholder="Search by product or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setSearchDropdownOpen(true)}
            maxLength={20}
            className="w-full sm:p-3 rounded-full border text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#fc250c] hover:text-blue-800">
            <FaSearch />
          </button>

          {searchDropdownOpen && searchTerm.trim() && (
            <div className="absolute top-full left-0 w-full bg-white rounded-md shadow-lg mt-3 overflow-auto z-50">
              {isLoading ? (
                <p className="p-3 text-gray-500">Loading...</p>
              ) : searchResultsLimited.length === 0 ? (
                <p className="p-3 text-gray-500">No products found.</p>
              ) : (
                <>
                  {searchResultsLimited.map((p) => (
                    <div
                      key={p.id + p._displayName}

                      className="flex items-center justify-between px-3 py-4 hover:bg-gray-100 cursor-pointer"
                    >
                      <div className="flex flex-col text-sm"
                        onClick={() => {
                          navigate(`/product/${p.id}`);
                          setSearchDropdownOpen(false);
                        }}
                      >
                        <span className="font-medium flex items-center gap-2">
                          {p._displayName}
                          {p.virtual_stock > p.moq ? (
                            <span className="bg-blue-100 text-blue-600 text-[10px] px-1 py-[1px] rounded">
                              In Stock
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-600 text-[10px] px-1 py-[1px] rounded">
                              Out of Stock
                            </span>
                          )}
                          {hasScheme(p.id) && (
                            <FaGift
                              title="Scheme Available"
                              className="text-pink-500 text-xs animate-pulse"
                            />
                          )}
                        </span>
                        <span className="text-xs text-gray-500">
                          {p.product_name} — {p.sub_category}
                        </span>
                      </div>

                      {(user?.role === "SS" || user?.role === "DS") && (
                        <div className="ml-3 flex items-center">
                          {isAdded(p.id) ? (
                            <>
                              {/* अगर product.quantity_type === "CARTOON" है तो select दिखाओ */}
                              {p.quantity_type === "CARTOON" ? (
                                <select
                                  value={cartoonSelection[p.id] || 1}
                                  onChange={(e) =>
                                    updateCartoon(p.id, parseInt(e.target.value))
                                  }
                                  className="border rounded py-1 px-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                                >
                                  {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => (
                                    <option key={n} value={n}>
                                      {n} CTN = {n * (p.cartoon_size || 1)} Pcs
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="number"
                                  min={1}
                                  value={
                                    selectedProducts.find((x) => x.id === p.id)?.quantity || ""
                                  }
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "") {
                                      updateQuantity(p.id, "");
                                      return;
                                    }
                                    const parsed = parseInt(val);
                                    if (!isNaN(parsed)) updateQuantity(p.id, parsed);
                                  }}
                                  onBlur={() => {
                                    const selectedItem = selectedProducts.find((x) => x.id === p.id);
                                    const val = parseInt(selectedItem?.quantity);
                                    const moq = p.moq || 1;
                                    if (isNaN(val) || val < moq) updateQuantity(p.id, moq);
                                  }}
                                  className="w-20 border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                                />
                              )}
                            </>
                          ) : (
                            !isAdded(p.id) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddProduct(p);
                                }}
                                className="bg-blue-100 p-3 rounded-full text-blue-600 hover:bg-blue-200 transition-all"
                              >
                                <FaPlus className="text-sm" />
                              </button>
                            )
                          )}

                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {(user.role === "SS" || user?.role === "DS") && (
            <NavLink to="/cart" className="relative text-gray-700 hover:text-blue-600">
              <FaShoppingCart className="text-2xl" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
                  {cartCount}
                </span>
              )}
            </NavLink>
          )}

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
            >
              <FaUserCircle className="text-2xl" />
              <span className="font-medium hidden md:inline cursor-pointer">{user?.name}</span>
            </button>
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50 animate-fade-in-down">
                <div className="px-4 py-2 text-sm text-gray-800 border-b">
                  ID: {user?.user_id}
                </div>
                <div className="px-4 py-2 text-sm text-gray-800 border-b">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800 cursor-pointer"
                    title="Logout"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 🧭 Desktop Menu */}
      <nav
        ref={navRef}
        className={
          `hidden md:flex bg-white shadow-sm px-4 py-2 gap-3 border-b z-40 transition-all
     ${isNavFixed ? "fixed top-0 left-0 right-0 shadow-md" : ""}
`
        }
      >

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded text-sm font-medium ${isActive
                ? "bg-gray-100 text-[var(--primary-color)]"
                : "text-gray-600 hover:text-[var(--primary-color)] hover:bg-gray-100"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 p-0 lg:p-4 overflow-y-auto">
        <Outlet />
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-inner z-50">
        <BottomNav />
      </div>
    </div>
  );
}
