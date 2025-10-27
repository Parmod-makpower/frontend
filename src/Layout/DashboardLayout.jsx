// 📁 src/layouts/DashboardLayout.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BottomNav from "./BottomNav";
import {
  FaUserCircle, FaSearch,
  FaHome,
  FaGift,
  FaUsers,
  FaBox,
  FaHistory,
  FaShoppingCart,
  FaList,
  FaPlus,
  FaCheck,FaBoxOpen,
  FaSignOutAlt,FaChartLine, 
  FaHourglassHalf
} from "react-icons/fa";
import { useState, useRef, useEffect, useMemo } from "react";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSchemes } from "../hooks/useSchemes";
import useFuseSearch from "../hooks/useFuseSearch";
import logo from "../assets/images/logo.png"



export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Profile Dropdown State
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  const [selectedProducts, setSelectedProducts] = useState(() => {
    const saved = localStorage.getItem("selectedProducts");
    return saved ? JSON.parse(saved) : [];
  });

  const { data: allProductsRaw = [], isLoading } = useCachedProducts();
  const { data: schemes = [] } = useSchemes();

  useEffect(() => {
    localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
  }, [selectedProducts]);

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
    return fuseResults.flatMap((product) => {
      const matchedSaleNames =
        product.sale_names?.filter((name) =>
          name.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];

      const results = [];

      // अगर sale_name मिले तो उन्हें अलग से जोड़ें
      if (matchedSaleNames.length > 0) {
        matchedSaleNames.forEach((sale_name) => {
          results.push({
            ...product,
            _matchType: "sale_name",
            _displayName: sale_name,
          });
        });
      } else {
        // वरना product_name या sub_category के मैच को दिखाएं
        results.push({
          ...product,
          _matchType: "product_or_category",
          _displayName: product.product_name,
        });
      }

      return results;
    });
  }, [fuseResults, searchTerm]);


  // Limit results
  const searchResultsLimited = searchResults.slice(0, 6);

  const hasScheme = (productId) =>
    schemes.some(
      (scheme) =>
        Array.isArray(scheme.conditions) &&
        scheme.conditions.some((cond) => cond.product === productId)
    );

  const isAdded = (id) => selectedProducts.some((p) => p.id === id);

  const addProduct = (product) => {
    if (!isAdded(product.id)) {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
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
      { label: "Sale Name", path: "/sale-name", icon: <FaBox /> },
      { label: "Schemes", path: "/schemes", icon: <FaGift /> },
      { label: "CRM", path: "/admin/crm", icon: <FaUsers /> },
      { label: "Pending Orders", path: "/admin/pending-orders", icon: <FaHourglassHalf/> },
      { label: "All Orders", path: "/all/orders-history", icon: <FaBox /> }
    );
  }
  if (user.role === "CRM") {
    navItems.push(
      { label: "Home", path: "/", icon: <FaHome /> },
      { label: "Schemes", path: "/user-schemes", icon: <FaGift /> },
      { label: "Super Stockist", path: "/crm-ss/list", icon: <FaUsers /> },
      // { label: "Create Orders", path: "/crm/create-order", icon: <FaBoxOpen /> },
      { label: "New Orders", path: "/crm/orders", icon: <FaBox /> },
      { label: "History", path: "/all/orders-history", icon: <FaHistory /> },
      { label: "Stock", path: "/available-stock", icon: <FaChartLine  /> }
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
      <header className="hidden md:flex justify-between items-center bg-white shadow-md px-4 py-4 sticky top-0 z-50">
        {/* Logo */}
        <h1 className="text-xl md:text-2xl font-bold text-blue-600">
          <img
            src={logo}
            className="w-35"
          />
        </h1>

        {/* 🔍 Search */}
        <div className="relative flex-1 mx-5  " ref={searchRef}>
          <input
            type="text"
            placeholder="Search by product or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setSearchDropdownOpen(true)}
            maxLength={20}
            className="w-full  sm:p-3  rounded-full border text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#fc250c] hover:text-blue-800" >
            <FaSearch />
          </button>


          {searchDropdownOpen && searchTerm.trim() && (
            <div className="absolute top-full left-0 w-full bg-white rounded-md shadow-lg mt-3  overflow-auto z-50">
              {isLoading ? (
                <p className="p-3 text-gray-500">Loading...</p>
              ) : searchResultsLimited.length === 0 ? (
                <p className="p-3 text-gray-500">No products found.</p>
              ) : (
                <>
                  {searchResultsLimited.map((p) => (
                    <div
                      key={p.id + p._displayName}
                      onClick={() => {
                        navigate(`/product/${p.id}`);
                        setSearchDropdownOpen(false);
                      }}
                      className="flex items-center justify-between px-3 py-4 hover:bg-gray-100 cursor-pointer"
                    >
                      <div

                        className="flex flex-col text-sm"
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
                      {user?.role === "SS" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addProduct(p);
                          }}
                          className="ml-3 text-blue-600 hover:text-blue-800"
                          title="Add to cart"
                        >
                          {isAdded(p.id) ? (
                            <FaCheck className="text-green-600 text-sm" />
                          ) : (
                            <FaPlus className="text-sm" />
                          )}
                        </button>
                      )}

                    </div>
                  ))}
                  {/* {searchResults.length > 6 && (
                    <div
                      className="p-2 text-blue-600 text-center text-sm cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/search?query=${searchTerm}`)}
                    >
                      View all results
                    </div>
                  )} */}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {user.role === "SS" && (
            <NavLink to="/cart" className="relative text-gray-700 hover:text-blue-600">
              <FaShoppingCart className="text-2xl" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
                  {cartCount}
                </span>
              )}
            </NavLink>
          )}

          {/* Logout button directly in header */}


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
                    onClick={logout}
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
      <nav className="hidden md:flex bg-white shadow-sm px-4 py-2 gap-3 sticky top-[72px] z-40 border-b">
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

      {/* Page Content */}
      <main className="flex-1 p-0 lg:p-4 overflow-y-auto">
        <Outlet />
      </main>

      {/* 📱 Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-inner z-50">
        <BottomNav />
      </div>
    </div>
  );
}
