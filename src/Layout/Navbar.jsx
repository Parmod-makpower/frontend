// // import { NavLink, useNavigate } from "react-router-dom";
// // import { useAuth } from "../context/AuthContext";
// // import {
// //   FaUserCircle,
// //   FaSearch,
// //   FaHome,
// //   FaGift,
// //   FaUsers,
// //   FaBox,
// //   FaHistory,
// //   FaShoppingCart,
// //   FaList,
// //   FaPlus,
// //   FaSignOutAlt,
// //   FaChartLine,
// //   FaBan,
// //   FaRoute,
// //   FaCog,
// // } from "react-icons/fa";
// // import { useState, useRef, useEffect, useMemo } from "react";
// // import { useCachedProducts } from "../hooks/useCachedProducts";
// // import { useSchemes } from "../hooks/useSchemes";
// // import useFuseSearch from "../hooks/useFuseSearch";
// // import logo from "../assets/images/logo.png";
// // import { useSelectedProducts } from "../hooks/useSelectedProducts";
// // import { useStock } from "../context/StockContext";

// // const EXCLUDED_CATEGORIES = new Set([
// //  "SPEAKER PCB", "SPEAKER PACKING", "SPEAKER HOUSING"
// // ]);

// // export default function Navbar() {
// //   const { user, logout } = useAuth();
// //   const navigate = useNavigate();
// //   const { getStockValue } = useStock();

// //   // Navbar states
// //   const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
// //   const [isNavFixed, setIsNavFixed] = useState(false);
// //   const [navOffsetTop, setNavOffsetTop] = useState(0);
// //   const [cartCount, setCartCount] = useState(0);

// //   const profileRef = useRef(null);
// //   const searchRef = useRef(null);
// //   const navRef = useRef(null);

// //   const {
// //     selectedProducts,
// //     addProduct,
// //     updateQuantity,
// //     updateCartoon,
// //     cartoonSelection,
// //   } = useSelectedProducts();

// //   const { data: allProductsRaw = [], isLoading } = useCachedProducts();
// //   const { data: schemes = [] } = useSchemes();

// //   const normalizeProduct = (product) => ({
// //     ...product,
// //     id: product.id ?? product.product_id,
// //   });

// //   // Search se excluded categories remove
// //   const allProducts = useMemo(() => {
// //     return allProductsRaw
// //       .map(normalizeProduct)
// //       .filter((product) => product.is_active === true)
// //       .filter((product) => {
// //         const category = String(product.sub_category || "")
// //           .trim()
// //           .toLowerCase();

// //         return !EXCLUDED_CATEGORIES.has(category);
// //       });
// //   }, [allProductsRaw]);

// //   const fuseResults = useFuseSearch(allProducts, searchTerm, {
// //     keys: ["sub_category", "sale_names", "product_name"],
// //     threshold: 0.3,
// //   });

// //   const searchResults = useMemo(() => {
// //     const uniqueResults = new Map();
// //     const lowerSearch = searchTerm.toLowerCase();

// //     fuseResults.forEach((product) => {
// //       const category = String(product.sub_category || "")
// //         .trim()
// //         .toLowerCase();

// //       if (EXCLUDED_CATEGORIES.has(category)) return;

// //       const matchedSaleName = product.sale_names?.find((name) =>
// //         name.toLowerCase().includes(lowerSearch)
// //       );

// //       const matchFound =
// //         product.product_name?.toLowerCase().includes(lowerSearch) ||
// //         product.sub_category?.toLowerCase().includes(lowerSearch) ||
// //         !!matchedSaleName;

// //       if (matchFound) {
// //         uniqueResults.set(product.id, {
// //           ...product,
// //           _displayName: matchedSaleName || product.product_name,
// //         });
// //       }
// //     });

// //     return Array.from(uniqueResults.values());
// //   }, [fuseResults, searchTerm]);

// //   const searchResultsLimited = searchResults.slice(0, 6);

// //   const hasScheme = (productId) =>
// //     schemes.some(
// //       (scheme) =>
// //         Array.isArray(scheme.conditions) &&
// //         scheme.conditions.some((condition) => condition.product === productId)
// //     );

// //   const isAdded = (id) =>
// //     selectedProducts.some((product) => product.id === id);

// //   const handleLogout = () => {
// //     logout(() => {
// //       navigate("/login");
// //     });
// //   };

// //   const handleAddProduct = (product) => {
// //     if (!isAdded(product.id)) {
// //       const isDS = user?.role === "DS";
// //       const moq = product.moq || 1;

// //       const initialQty = isDS
// //         ? 1
// //         : product.cartoon_size && product.cartoon_size > 1
// //         ? product.cartoon_size
// //         : moq;

// //       addProduct({
// //         ...product,
// //         quantity: initialQty,
// //       });
// //     }
// //   };

// //   // Navbar fixed on scroll
// //   useEffect(() => {
// //     if (navRef.current) {
// //       setNavOffsetTop(navRef.current.offsetTop);
// //     }
// //   }, []);

// //   useEffect(() => {
// //     const handleScroll = () => {
// //       if (window.scrollY >= navOffsetTop) {
// //         setIsNavFixed(true);
// //       } else {
// //         setIsNavFixed(false);
// //       }
// //     };

// //     window.addEventListener("scroll", handleScroll);

// //     return () => {
// //       window.removeEventListener("scroll", handleScroll);
// //     };
// //   }, [navOffsetTop]);

// //   // Cart count for SS
// //   useEffect(() => {
// //     if (user?.role === "SS") {
// //       const interval = setInterval(() => {
// //         const saved = localStorage.getItem("selectedProducts");
// //         const parsed = saved ? JSON.parse(saved) : [];

// //         setCartCount(parsed.length);
// //       }, 500);

// //       return () => clearInterval(interval);
// //     }
// //   }, [user?.role]);

// //   // Close dropdowns outside click
// //   useEffect(() => {
// //     const handler = (event) => {
// //       if (
// //         profileRef.current &&
// //         !profileRef.current.contains(event.target)
// //       ) {
// //         setProfileDropdownOpen(false);
// //       }

// //       if (
// //         searchRef.current &&
// //         !searchRef.current.contains(event.target)
// //       ) {
// //         setSearchDropdownOpen(false);
// //       }
// //     };

// //     document.addEventListener("mousedown", handler);

// //     return () => {
// //       document.removeEventListener("mousedown", handler);
// //     };
// //   }, []);

// //   // Role-wise navbar items
// //   const navItems = [];

// //   if (user?.role === "ADMIN") {
// //     navItems.push(
// //       { label: "Home", path: "/", icon: <FaHome /> },
// //       { label: "Products", path: "/products", icon: <FaBox /> },
// //       { label: "Inactive", path: "/inactive", icon: <FaBan /> },
// //       { label: "Sale Name", path: "/sale-name", icon: <FaBox /> },
// //       { label: "Schemes", path: "/schemes", icon: <FaGift /> },
// //       { label: "Users", path: "/all-users/list", icon: <FaUsers /> },
// //       { label: "All Orders", path: "/all/orders-history", icon: <FaBox /> },
// //       { label: "Dispatch", path: "/dispatch-entries", icon: <FaBox /> },
// //       {
// //         label: "Not-In-Stock",
// //         path: "/not-in-stock-reports",
// //         icon: <FaChartLine />,
// //       },
// //       {
// //         label: "Track-Orders",
// //         path: "/orders-tracking",
// //         icon: <FaRoute />,
// //       },
// //       {
// //         label: "Goa Trip",
// //         path: "/goa-couple-trip-schemes",
// //         icon: <FaGift />,
// //       },
// //       {
// //         label: "Catalogue",
// //         path: "/product-images-pdf",
// //         icon: <FaBox />,
// //       }
// //     );
// //   }

// //   if (user?.role === "CRM") {
// //     navItems.push(
// //       { label: "Home", path: "/", icon: <FaHome /> },
// //       { label: "Schemes", path: "/user-schemes", icon: <FaGift /> },
// //       { label: "Users", path: "/all-users/list", icon: <FaUsers /> },
// //       { label: "New Orders", path: "/crm/orders", icon: <FaBox /> },
// //       {
// //         label: "History",
// //         path: "/all/orders-history",
// //         icon: <FaHistory />,
// //       },
// //       {
// //         label: "Not-In-Stock",
// //         path: "/not-in-stock-reports",
// //         icon: <FaChartLine />,
// //       },
// //       {
// //         label: "Goa Trip",
// //         path: "/goa-couple-trip-schemes",
// //         icon: <FaGift />,
// //       },
// //       {
// //         label: "Catalogue",
// //         path: "/product-images-pdf",
// //         icon: <FaBox />,
// //       }
// //     );
// //   }

// //   if (user?.role === "ASM") {
// //     navItems.push(
// //       { label: "Home", path: "/", icon: <FaHome /> },
// //       { label: "Schemes", path: "/user-schemes", icon: <FaGift /> },
// //       {
// //         label: "Categories",
// //         path: "/all-categories",
// //         icon: <FaList />,
// //       }
// //     );
// //   }

// //   if (user?.role === "DS") {
// //     navItems.push(
// //       { label: "Home", path: "/", icon: <FaHome /> },
// //       { label: "Schemes", path: "/user-schemes", icon: <FaGift /> },
// //       {
// //         label: "Categories",
// //         path: "/all-categories",
// //         icon: <FaList />,
// //       },
// //       { label: "Orders", path: "/ds/my-orders", icon: <FaBox /> }
// //     );
// //   }

// //   if (user?.role === "SS") {
// //     navItems.push(
// //       { label: "Home", path: "/", icon: <FaHome /> },
// //       { label: "Schemes", path: "/user-schemes", icon: <FaGift /> },
// //       { label: "Orders", path: "/ss/history", icon: <FaBox /> },
// //       {
// //         label: "Categories",
// //         path: "/all-categories",
// //         icon: <FaList />,
// //       }
// //     );
// //   }

// //   return (
// //     <>
// //       {/* ================= TOP NAVBAR ================= */}
// //       <header className="hidden md:flex justify-between items-center bg-white shadow-md px-4 py-4">
// //         {/* Logo */}
// //         <h1 className="text-xl md:text-2xl font-bold text-blue-600">
// //           <img
// //             src={logo}
// //             alt="Logo"
// //             className="w-35 cursor-pointer"
// //             onClick={() => navigate("/")}
// //           />
// //         </h1>

// //         {/* Search */}
// //         <div className="relative flex-1 mx-5" ref={searchRef}>
// //           <input
// //             type="text"
// //             placeholder="Search by product or category..."
// //             value={searchTerm}
// //             onChange={(event) => setSearchTerm(event.target.value)}
// //             onFocus={() => setSearchDropdownOpen(true)}
// //             maxLength={20}
// //             className="w-full sm:p-3 rounded-full border text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
// //           />

// //           <button
// //             type="button"
// //             className="absolute right-3 top-1/2 -translate-y-1/2 text-[#fc250c] hover:text-blue-800"
// //           >
// //             <FaSearch />
// //           </button>

// //           {/* Search Dropdown */}
// //           {searchDropdownOpen && searchTerm.trim() && (
// //             <div className="absolute top-full left-0 w-full bg-white rounded-md shadow-lg mt-3 overflow-auto z-50">
// //               {isLoading ? (
// //                 <p className="p-3 text-gray-500">Loading...</p>
// //               ) : searchResultsLimited.length === 0 ? (
// //                 <p className="p-3 text-gray-500">No products found.</p>
// //               ) : (
// //                 <>
// //                   {searchResultsLimited.map((product) => {
// //                     const currentStock = getStockValue(product);
// //                     const outOfStock =
// //                       currentStock <= (product.moq || 1);

// //                     return (
// //                       <div
// //                         key={product.id + product._displayName}
// //                         className="flex items-center justify-between px-3 py-4 hover:bg-gray-100 cursor-pointer"
// //                       >
// //                         <div
// //                           className="flex flex-col text-sm"
// //                           onClick={() => {
// //                             navigate(`/product/${product.id}`);
// //                             setSearchDropdownOpen(false);
// //                           }}
// //                         >
// //                           <span className="font-medium flex items-center gap-2">
// //                             {product._displayName}

// //                             {user?.role !== "DS" && (
// //                               <div>
// //                                 {!outOfStock ? (
// //                                   <span className="bg-blue-100 text-blue-600 text-[10px] px-1 py-[1px] rounded">
// //                                     In Stock
// //                                   </span>
// //                                 ) : (
// //                                   <span className="bg-red-100 text-red-600 text-[10px] px-1 py-[1px] rounded">
// //                                     Out of Stock
// //                                   </span>
// //                                 )}
// //                               </div>
// //                             )}

// //                             {hasScheme(product.id) && (
// //                               <FaGift
// //                                 title="Scheme Available"
// //                                 className="text-pink-500 text-xs animate-pulse"
// //                               />
// //                             )}
// //                           </span>

// //                           <span className="text-xs text-gray-500">
// //                             {product.product_name} —{" "}
// //                             {product.sub_category}
// //                           </span>
// //                         </div>

// //                         {/* Add Product / Quantity */}
// //                         {(user?.role === "SS" ||
// //                           user?.role === "DS") && (
// //                           <div className="ml-3 flex items-center">
// //                             {isAdded(product.id) ? (
// //                               <>
// //                                 {(() => {
// //                                   const isDS = user?.role === "DS";
// //                                   const selectedItem =
// //                                     selectedProducts.find(
// //                                       (item) => item.id === product.id
// //                                     );
// //                                   const moq = product.moq || 1;

// //                                   // SS cartoon dropdown
// //                                   if (
// //                                     product.quantity_type === "CARTOON" &&
// //                                     !isDS
// //                                   ) {
// //                                     return (
// //                                       <select
// //                                         value={
// //                                           cartoonSelection[product.id] || 1
// //                                         }
// //                                         onChange={(event) =>
// //                                           updateCartoon(
// //                                             product.id,
// //                                             parseInt(event.target.value)
// //                                           )
// //                                         }
// //                                         className="border rounded py-1 px-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
// //                                       >
// //                                         {Array.from(
// //                                           { length: 100 },
// //                                           (_, index) => index + 1
// //                                         ).map((number) => (
// //                                           <option
// //                                             key={number}
// //                                             value={number}
// //                                           >
// //                                             {number} CTN ={" "}
// //                                             {number *
// //                                               (product.cartoon_size || 1)}{" "}
// //                                             Pcs
// //                                           </option>
// //                                         ))}
// //                                       </select>
// //                                     );
// //                                   }

// //                                   // DS + SS quantity input
// //                                   return (
// //                                     <input
// //                                       type="number"
// //                                       min={1}
// //                                       value={selectedItem?.quantity || ""}
// //                                       onChange={(event) => {
// //                                         const value = event.target.value;

// //                                         if (value === "") {
// //                                           updateQuantity(product.id, "");
// //                                           return;
// //                                         }

// //                                         const parsed = parseInt(value);

// //                                         if (!isNaN(parsed)) {
// //                                           updateQuantity(product.id, parsed);
// //                                         }
// //                                       }}
// //                                       onBlur={() => {
// //                                         if (isDS) return;

// //                                         const value = parseInt(
// //                                           selectedItem?.quantity
// //                                         );

// //                                         if (isNaN(value) || value < moq) {
// //                                           updateQuantity(product.id, moq);
// //                                         }
// //                                       }}
// //                                       className="w-20 border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
// //                                     />
// //                                   );
// //                                 })()}
// //                               </>
// //                             ) : (
// //                               !isAdded(product.id) && (
// //                                 <button
// //                                   type="button"
// //                                   onClick={(event) => {
// //                                     event.stopPropagation();
// //                                     handleAddProduct(product);
// //                                   }}
// //                                   className="bg-blue-100 p-3 rounded-full text-blue-600 hover:bg-blue-200 transition-all"
// //                                 >
// //                                   <FaPlus className="text-sm" />
// //                                 </button>
// //                               )
// //                             )}
// //                           </div>
// //                         )}
// //                       </div>
// //                     );
// //                   })}
// //                 </>
// //               )}
// //             </div>
// //           )}
// //         </div>

// //         {/* Right Side */}
// //         <div className="flex items-center gap-4">
// //           {(user?.role === "SS" || user?.role === "DS") && (
// //             <NavLink
// //               to="/cart"
// //               className="relative text-gray-700 hover:text-blue-600"
// //             >
// //               <FaShoppingCart className="text-2xl" />

// //               {cartCount > 0 && (
// //                 <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
// //                   {cartCount}
// //                 </span>
// //               )}
// //             </NavLink>
// //           )}

// //           {/* Profile Dropdown */}
// //           <div className="relative" ref={profileRef}>
// //             <button
// //               type="button"
// //               onClick={() =>
// //                 setProfileDropdownOpen(!profileDropdownOpen)
// //               }
// //               className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
// //             >
// //               <FaUserCircle className="text-2xl" />

// //               <span className="font-medium hidden md:inline cursor-pointer">
// //                 {user?.name}
// //               </span>
// //             </button>

// //             {profileDropdownOpen && (
// //               <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50 animate-fade-in-down">
// //                 <div className="px-4 py-2 text-sm text-gray-800 border-b">
// //                   ID: {user?.user_id}
// //                 </div>

// //                 {user?.role === "ADMIN" && (
// //                   <div className="px-4 py-2 text-sm text-gray-800 border-b">
// //                     <button
// //                       type="button"
// //                       className="flex items-center gap-1 cursor-pointer"
// //                       onClick={() => {
// //                         navigate("/setting");
// //                         setProfileDropdownOpen(false);
// //                       }}
// //                     >
// //                       <FaCog className="text-sm" />
// //                       <p className="font-medium">Settings</p>
// //                     </button>
// //                   </div>
// //                 )}

// //                 <div className="px-4 py-2 text-sm text-gray-800 border-b">
// //                   <button
// //                     type="button"
// //                     onClick={handleLogout}
// //                     className="flex items-center gap-1 text-red-600 hover:text-red-800 cursor-pointer"
// //                     title="Logout"
// //                   >
// //                     <FaSignOutAlt />
// //                     Logout
// //                   </button>
// //                 </div>
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       </header>

// //       {/* ================= DESKTOP MENU ================= */}
// //       <nav
// //         ref={navRef}
// //         className={`hidden md:flex bg-white shadow-sm px-4 py-2 gap-3 border-b z-40 transition-all ${
// //           isNavFixed
// //             ? "fixed top-0 left-0 right-0 shadow-md"
// //             : ""
// //         }`}
// //       >
// //         {navItems.map((item) => (
// //           <NavLink
// //             key={item.path}
// //             to={item.path}
// //             className={({ isActive }) =>
// //               `flex items-center gap-2 px-3 py-2 rounded text-sm font-medium ${
// //                 isActive
// //                   ? "bg-gray-100 text-[var(--primary-color)]"
// //                   : "text-gray-600 hover:text-[var(--primary-color)] hover:bg-gray-100"
// //               }`
// //             }
// //           >
// //             {item.icon}
// //             {item.label}
// //           </NavLink>
// //         ))}
// //       </nav>
// //     </>
// //   );
// // }




// import { NavLink, useNavigate , useLocation} from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// import {
//   FaUserCircle,
//   FaSearch,
//   FaHome,
//   FaGift,
//   FaUsers,
//   FaBox,
//   FaHistory,
//   FaShoppingCart,
//   FaList,
//   FaPlus,
//   FaSignOutAlt,
//   FaChartLine,
//   FaBan,
//   FaRoute,
//   FaCog,
//   FaChevronLeft,
//   FaChevronRight,
//   FaComment,
//   FaUserTie,
// } from "react-icons/fa";

// import {
//   Bell,
//   MoreVertical,
//   Tags,
// } from "lucide-react";

// import {
//   useState,
//   useRef,
//   useEffect,
//   useMemo,
// } from "react";

// import { useCachedProducts } from "../hooks/useCachedProducts";
// import { useSchemes } from "../hooks/useSchemes";
// import useFuseSearch from "../hooks/useFuseSearch";
// import logo from "../assets/images/logo.png";
// import { useSelectedProducts } from "../hooks/useSelectedProducts";
// import { useStock } from "../context/StockContext";

// const EXCLUDED_CATEGORIES = new Set([
//   "SPEAKER PCB",
//   "SPEAKER PACKING",
//   "SPEAKER HOUSING",
// ]);

// export default function Navbar({
//   sidebarCollapsed,
//   setSidebarCollapsed,
// }) {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { getStockValue } = useStock();

//   const [profileDropdownOpen, setProfileDropdownOpen] =
//     useState(false);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchDropdownOpen, setSearchDropdownOpen] =
//     useState(false);

//   const [cartCount, setCartCount] = useState(0);

//   const profileRef = useRef(null);
//   const searchRef = useRef(null);

//   const {
//     selectedProducts,
//     addProduct,
//     updateQuantity,
//     updateCartoon,
//     cartoonSelection,
//   } = useSelectedProducts();

//   const {
//     data: allProductsRaw = [],
//     isLoading,
//   } = useCachedProducts();

//   const { data: schemes = [] } = useSchemes();

//   /* =========================================================
//      PRODUCTS
//   ========================================================= */

//   const normalizeProduct = (product) => ({
//     ...product,
//     id: product.id ?? product.product_id,
//   });

//   const allProducts = useMemo(() => {
//     return allProductsRaw
//       .map(normalizeProduct)
//       .filter((product) => product.is_active === true)
//       .filter((product) => {
//         const category = String(product.sub_category || "")
//           .trim()
//           .toUpperCase();

//         return !EXCLUDED_CATEGORIES.has(category);
//       });
//   }, [allProductsRaw]);

//   /* =========================================================
//      SEARCH
//   ========================================================= */

//   const fuseResults = useFuseSearch(
//     allProducts,
//     searchTerm,
//     {
//       keys: [
//         "sub_category",
//         "sale_names",
//         "product_name",
//       ],
//       threshold: 0.3,
//     }
//   );

//   const searchResults = useMemo(() => {
//     if (!searchTerm.trim()) return [];

//     const uniqueResults = new Map();

//     const lowerSearch = searchTerm.toLowerCase();

//     (fuseResults || []).forEach((product) => {
//       const category = String(
//         product.sub_category || ""
//       )
//         .trim()
//         .toUpperCase();

//       if (EXCLUDED_CATEGORIES.has(category)) return;

//       const matchedSaleName =
//         Array.isArray(product.sale_names)
//           ? product.sale_names.find((name) =>
//               String(name)
//                 .toLowerCase()
//                 .includes(lowerSearch)
//             )
//           : null;

//       const matchFound =
//         product.product_name
//           ?.toLowerCase()
//           .includes(lowerSearch) ||
//         product.sub_category
//           ?.toLowerCase()
//           .includes(lowerSearch) ||
//         !!matchedSaleName;

//       if (matchFound) {
//         uniqueResults.set(product.id, {
//           ...product,
//           _displayName:
//             matchedSaleName ||
//             product.product_name,
//         });
//       }
//     });

//     return Array.from(uniqueResults.values());
//   }, [fuseResults, searchTerm]);

//   const searchResultsLimited =
//     searchResults.slice(0, 6);

//   /* =========================================================
//      HELPERS
//   ========================================================= */

//   const hasScheme = (productId) =>
//     schemes.some(
//       (scheme) =>
//         Array.isArray(scheme.conditions) &&
//         scheme.conditions.some(
//           (condition) =>
//             condition.product === productId
//         )
//     );

//   const isAdded = (id) =>
//     selectedProducts.some(
//       (product) => product.id === id
//     );

//   const handleLogout = () => {
//     logout(() => {
//       navigate("/login");
//     });
//   };

//   const handleAddProduct = (product) => {
//     if (isAdded(product.id)) return;

//     const isDS = user?.role === "DS";
//     const moq = product.moq || 1;

//     const initialQty = isDS
//       ? 1
//       : product.cartoon_size &&
//         product.cartoon_size > 1
//       ? product.cartoon_size
//       : moq;

//     addProduct({
//       ...product,
//       quantity: initialQty,
//     });
//   };

// useEffect(() => {
//   const expandedPages = ["/CRMDashboard", "/user-schemes"];

//   const shouldExpand = expandedPages.includes(location.pathname);

//   setSidebarCollapsed(!shouldExpand);
// }, [location.pathname, setSidebarCollapsed]);

//   /* =========================================================
//      CART COUNT
//   ========================================================= */

//   useEffect(() => {
//     if (
//       user?.role !== "SS" &&
//       user?.role !== "DS"
//     ) {
//       return;
//     }

//     const updateCart = () => {
//       try {
//         const saved =
//           localStorage.getItem(
//             "selectedProducts"
//           );

//         const parsed = saved
//           ? JSON.parse(saved)
//           : [];

//         setCartCount(
//           Array.isArray(parsed)
//             ? parsed.length
//             : 0
//         );
//       } catch {
//         setCartCount(0);
//       }
//     };

//     updateCart();

//     const interval = setInterval(
//       updateCart,
//       500
//     );

//     return () =>
//       clearInterval(interval);
//   }, [user?.role]);

//   /* =========================================================
//      CLOSE DROPDOWNS
//   ========================================================= */

//   useEffect(() => {
//     const handler = (event) => {
//       if (
//         profileRef.current &&
//         !profileRef.current.contains(
//           event.target
//         )
//       ) {
//         setProfileDropdownOpen(false);
//       }

//       if (
//         searchRef.current &&
//         !searchRef.current.contains(
//           event.target
//         )
//       ) {
//         setSearchDropdownOpen(false);
//       }
//     };

//     document.addEventListener(
//       "mousedown",
//       handler
//     );

//     return () =>
//       document.removeEventListener(
//         "mousedown",
//         handler
//       );
//   }, []);

//   /* =========================================================
//      ROLE NAVIGATION
//   ========================================================= */

//   const navItems = [];

//   if (user?.role === "ADMIN") {
//     navItems.push(
//       { label: "Dashboard", path: "/", icon: <FaHome /> },
//       { label: "Products", path: "/products", icon: <FaBox /> },
//       { label: "Price Management", path: "/price-management", icon: <Tags/>,},
//       { label: "Inactive", path: "/inactive", icon: <FaBan /> },
//       { label: "Sale Name", path: "/sale-name", icon: <FaBox /> },
//       { label: "Schemes", path: "/schemes", icon: <FaGift /> },
//       { label: "Users", path: "/all-users/list", icon: <FaUsers /> },
//       { label: "All Orders", path: "/all/orders-history", icon: <FaBox /> },
//       { label: "Dispatch", path: "/dispatch-entries", icon: <FaBox /> },
//       {
//         label: "Not In Stock",
//         path: "/not-in-stock-reports",
//         icon: <FaChartLine />,
//       },
//       {
//         label: "Track Orders",
//         path: "/orders-tracking",
//         icon: <FaRoute />,
//       },
//       {
//         label: "Goa Trip",
//         path: "/goa-couple-trip-schemes",
//         icon: <FaGift />,
//       },
//       {
//         label: "Catalogue",
//         path: "/product-images-pdf",
//         icon: <FaBox />,
//       }
//     );
//   }

//   if (user?.role === "CRM") {
//     navItems.push(
//       { label: "Dashboard", path: "/", icon: <FaHome /> },
//       {
//         label: "Schemes",
//         path: "/user-schemes",
//         icon: <FaGift />,
//       },
//       {
//         label: "Users",
//         path: "/all-users/list",
//         icon: <FaUsers />,
//       },
//       // { label: "Price Management", path: "/price-management", icon: <Tags/>,},
//       {
//         label: "ASM Management",
//         path: "/asm-assignment",
//         icon: <FaUserTie />,
//       },
//       {
//         label: "New Orders",
//         path: "/crm/orders",
//         icon: <FaBox />,
//       },
//       {
//         label: "Remarks",
//         path: "/remarks",
//         icon: <FaComment />,
//       },
//       {
//         label: "History",
//         path: "/all/orders-history",
//         icon: <FaHistory />,
//       },
//       {
//         label: "Not In Stock",
//         path: "/not-in-stock-reports",
//         icon: <FaChartLine />,
//       },
//       {
//         label: "Goa Trip",
//         path: "/goa-couple-trip-schemes",
//         icon: <FaGift />,
//       },
//       {
//         label: "Catalogue",
//         path: "/product-images-pdf",
//         icon: <FaBox />,
//       },
//       {
//         label: "Spare Parts",
//         path: "/category/Spare%20parts/subcategories",
//         icon: <FaBox />,
//       }
//     );
//   }

//   if (user?.role === "ASM") {
//     navItems.push(
//       {
//         label: "ASM Dashboard",
//         path: "/asm",
//         icon: <FaHome />,
//       },
//       {
//         label: "Schemes",
//         path: "/user-schemes",
//         icon: <FaGift />,
//       },
//       {
//         label: "Categories",
//         path: "/all-categories",
//         icon: <FaList />,
//       }
//     );
//   }

//   if (user?.role === "DS") {
//     navItems.push(
//       { label: "Dashboard", path: "/", icon: <FaHome /> },
//       {
//         label: "Schemes",
//         path: "/user-schemes",
//         icon: <FaGift />,
//       },
//       {
//         label: "Categories",
//         path: "/all-categories",
//         icon: <FaList />,
//       },
//       {
//         label: "Orders",
//         path: "/ds/my-orders",
//         icon: <FaBox />,
//       }
//     );
//   }

//   if (user?.role === "SS") {
//     navItems.push(
//       { label: "Dashboard", path: "/", icon: <FaHome /> },
//       {
//         label: "Schemes",
//         path: "/user-schemes",
//         icon: <FaGift />,
//       },
//       {
//         label: "Orders",
//         path: "/ss/history",
//         icon: <FaBox />,
//       },
//       {
//         label: "Categories",
//         path: "/all-categories",
//         icon: <FaList />,
//       }
//     );
//   }
//   if (user?.role === "HR") {
//     navItems.push(
//       { label: "Dashboard", path: "/remarks", icon: <FaHome /> },      
//       {
//         label: "Categories",
//         path: "/all-categories",
//         icon: <FaList />,
//       }
//     );
//   }

//   /* =========================================================
//      RENDER
//   ========================================================= */

//   return (
//     <>
//       {/* =====================================================
//           DESKTOP SIDEBAR
//       ===================================================== */}

//       <aside
//         className={`
//           fixed
//           left-0
//           top-0
//           bottom-0
//           z-[90]
//           hidden
//           md:flex
//           flex-col
//           overflow-hidden
//           bg-[#101f33]
//           text-white
//           shadow-[8px_0_30px_rgba(15,23,42,0.08)]
//           transition-[width]
//           duration-300
//           ease-out
//           ${
//             sidebarCollapsed
//               ? "w-[72px]"
//               : "w-[220px]"
//           }
//         `}
//       >
//         {/* LOGO */}

//         <div
//           className={`
//             relative
//             flex
//             h-[64px]
//             shrink-0
//             items-center
//             border-b
//             bg-gray-100
//             border-white/[0.07]
//             ${
//               sidebarCollapsed
//                 ? "justify-center"
//                 : "px-5"
//             }
//           `}
//         >
//           <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

//           <img
//             src={logo}
//             alt="MAKPOWER"
//             onClick={() => navigate("/")}
//             className={`
//               cursor-pointer
//               object-contain
//               transition-all
//               duration-300
//               ${
//                 sidebarCollapsed
//                   ? "w-[40px]"
//                   : "w-[136px]"
//               }
//             `}
//           />
//         </div>

//         {/* NAVIGATION */}

//         <div className="flex-1 overflow-y-auto px-2.5 py-5 scrollbar-thin">
//           {!sidebarCollapsed && (
//             <div className="mb-3 px-3">
//               <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
//                 Main Menu
//               </p>
//             </div>
//           )}

//           <div className="space-y-1">
//             {navItems.map((item) => (
//               <NavLink
//                 key={item.path}
//                 to={item.path}
//                 title={
//                   sidebarCollapsed
//                     ? item.label
//                     : undefined
//                 }
//                 className={({ isActive }) =>
//                   `
//                   group
//                   relative
//                   flex
//                   items-center
//                   overflow-hidden
//                   rounded-xl
//                   transition-all
//                   duration-200
//                   ${
//                     sidebarCollapsed
//                       ? "justify-center px-2 py-3"
//                       : "gap-3 px-3 py-2.5"
//                   }
//                   ${
//                     isActive
//                       ? `
//                         bg-[#1769ff]
//                         text-white
//                         shadow-[0_5px_18px_rgba(23,105,255,0.25)]
//                       `
//                       : `
//                         text-slate-300
//                         hover:bg-white/[0.06]
//                         hover:text-white
//                       `
//                   }
//                 `
//                 }
//               >
//                 <span
//                   className="
//                     flex
//                     h-5
//                     w-5
//                     shrink-0
//                     items-center
//                     justify-center
//                     text-[14px]
//                     transition-transform
//                     duration-200
//                     group-hover:scale-110
//                   "
//                 >
//                   {item.icon}
//                 </span>

//                 {!sidebarCollapsed && (
//                   <span className="truncate text-[11px] font-semibold tracking-[0.01em]">
//                     {item.label}
//                   </span>
//                 )}

//                 {!sidebarCollapsed && (
//                   <span className="pointer-events-none absolute right-3 h-1.5 w-1.5 rounded-full bg-white opacity-0 transition-opacity group-[.active]:opacity-100" />
//                 )}
//               </NavLink>
//             ))}
//           </div>
//         </div>

//         {/* COLLAPSE */}

//         <div className="border-t border-white/[0.07] p-3">
//           <button
//             type="button"
//             onClick={() =>
//               setSidebarCollapsed(
//                 !sidebarCollapsed
//               )
//             }
//             className={`
//               group
//               flex
//               w-full
//               items-center
//               rounded-xl
//               text-slate-400
//               transition-all
//               duration-200
//               hover:bg-white/[0.06]
//               hover:text-white
//               ${
//                 sidebarCollapsed
//                   ? "justify-center py-2.5"
//                   : "gap-3 px-3 py-2.5"
//               }
//             `}
//             title={
//               sidebarCollapsed
//                 ? "Expand"
//                 : "Collapse"
//             }
//           >
//             <span className="transition-transform duration-200 group-hover:scale-110">
//               {sidebarCollapsed ? (
//                 <FaChevronRight size={11} />
//               ) : (
//                 <FaChevronLeft size={11} />
//               )}
//             </span>

//             {!sidebarCollapsed && (
//               <span className="text-[10px] font-semibold">
//                 Collapse
//               </span>
//             )}
//           </button>
//         </div>
//       </aside>

//       {/* =====================================================
//           DESKTOP TOP HEADER
//       ===================================================== */}

//       <header
//         className={`
//           fixed
//           right-0
//           top-0
//           z-[80]
//           hidden
//           h-[64px]
//           items-center
//           border-b
//           border-slate-200/80
//           bg-white/95
//           backdrop-blur-xl
//           md:flex
//           transition-[left]
//           duration-300
//           ease-out
//           ${
//             sidebarCollapsed
//               ? "left-[72px]"
//               : "left-[220px]"
//           }
//         `}
//       >
//         {/* SEARCH */}

//         <div
//           ref={searchRef}
//           className="
//             relative
//             ml-5
//             min-w-0
//             flex-1
//             max-w-[620px]
//           "
//         >
//           <div className="group relative">
//             <FaSearch
//               className="
//                 pointer-events-none
//                 absolute
//                 left-3.5
//                 top-1/2
//                 -translate-y-1/2
//                 text-[11px]
//                 text-slate-400
//                 transition-colors
//                 group-focus-within:text-[#1769ff]
//               "
//             />

//             <input
//               type="text"
//               value={searchTerm}
//               maxLength={30}
//               onChange={(e) => {
//                 setSearchTerm(e.target.value);
//                 setSearchDropdownOpen(true);
//               }}
//               onFocus={() =>
//                 setSearchDropdownOpen(true)
//               }
//               onKeyDown={(e) => {
//                 if (e.key === "Escape") {
//                   setSearchTerm("");
//                   setSearchDropdownOpen(false);
//                 }
//               }}
//               placeholder="Search by product, category or sale name..."
//               className="
//                 h-10
//                 w-full
//                 rounded-xl
//                 border
//                 border-slate-200
//                 bg-slate-50
//                 pl-10
//                 pr-20
//                 text-[11px]
//                 font-medium
//                 text-slate-700
//                 outline-none
//                 transition-all
//                 duration-200
//                 placeholder:text-slate-400
//                 hover:border-slate-300
//                 focus:border-blue-400
//                 focus:bg-white
//                 focus:ring-4
//                 focus:ring-blue-500/[0.07]
//               "
//             />

//             <span
//               className="
//                 pointer-events-none
//                 absolute
//                 right-2.5
//                 top-1/2
//                 -translate-y-1/2
//                 rounded-lg
//                 border
//                 border-slate-200
//                 bg-white
//                 px-2
//                 py-1
//                 text-[8px]
//                 font-bold
//                 text-slate-400
//               "
//             >
//               Ctrl + K
//             </span>
//           </div>

//           {/* SEARCH RESULTS */}

//           {searchDropdownOpen &&
//             searchTerm.trim() && (
//               <div
//                 className="
//                   absolute
//                   left-0
//                   right-0
//                   top-[48px]
//                   z-[200]
//                   max-h-[420px]
//                   overflow-y-auto
//                   rounded-2xl
//                   border
//                   border-slate-200
//                   bg-white
//                   shadow-[0_20px_60px_rgba(15,23,42,0.15)]
//                   animate-[searchDrop_.18s_ease-out]
//                 "
//               >
//                 {isLoading ? (
//                   <div className="p-6 text-center text-xs text-slate-400">
//                     Loading products...
//                   </div>
//                 ) : searchResultsLimited.length ===
//                   0 ? (
//                   <div className="p-7 text-center">
//                     <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
//                       <FaSearch size={12} />
//                     </div>

//                     <p className="text-xs font-bold text-slate-700">
//                       No products found
//                     </p>

//                     <p className="mt-1 text-[9px] text-slate-400">
//                       Try product name or sale name
//                     </p>
//                   </div>
//                 ) : (
//                   searchResultsLimited.map(
//                     (product) => {
//                       const currentStock =
//                         getStockValue(product);

//                       const outOfStock =
//                         currentStock <=
//                         (product.moq || 1);

//                       return (
//                         <div
//                           key={
//                             product.id +
//                             product._displayName
//                           }
//                           className="
//                             group
//                             flex
//                             items-center
//                             justify-between
//                             gap-3
//                             border-b
//                             border-slate-100
//                             px-4
//                             py-3
//                             transition-colors
//                             hover:bg-slate-50
//                             last:border-0
//                           "
//                         >
//                           <button
//                             type="button"
//                             onClick={() => {
//                               navigate(
//                                 `/product/${product.id}`
//                               );
//                               setSearchDropdownOpen(false);
//                             }}
//                             className="min-w-0 flex-1 text-left"
//                           >
//                             <div className="flex items-center gap-2">
//                               <span className="truncate text-xs font-bold text-slate-800">
//                                 {product._displayName}
//                               </span>

                              
//                                 <span
//                                   className={`
//                                     shrink-0
//                                     rounded-full
//                                     px-2
//                                     py-0.5
//                                     text-[8px]
//                                     font-bold
//                                     ${
//                                       outOfStock
//                                         ? "bg-red-50 text-red-600"
//                                         : "bg-emerald-50 text-emerald-600"
//                                     }
//                                   `}
//                                 >
//                                   {outOfStock
//                                     ? "Out of Stock"
//                                     : "In Stock"}
//                                 </span>
                              

//                               {hasScheme(product.id) && (
//                                 <FaGift className="shrink-0 text-[10px] text-pink-500" />
//                               )}
//                             </div>

//                             <p className="mt-1 truncate text-[9px] font-medium text-slate-400">
//                               {product.product_name}
//                               {" · "}
//                               {product.sub_category}
//                             </p>
//                           </button>

//                           {(user?.role === "SS" ||
//                             user?.role === "DS") && (
//                             <div className="shrink-0">
//                               {isAdded(product.id) ? (
//                                 product.quantity_type ===
//                                   "CARTOON" &&
//                                 user?.role !== "DS" ? (
//                                   <select
//                                     value={
//                                       cartoonSelection[
//                                         product.id
//                                       ] || 1
//                                     }
//                                     onChange={(e) =>
//                                       updateCartoon(
//                                         product.id,
//                                         parseInt(
//                                           e.target.value
//                                         )
//                                       )
//                                     }
//                                     className="
//                                       rounded-lg
//                                       border
//                                       border-slate-200
//                                       bg-white
//                                       px-2
//                                       py-1.5
//                                       text-[9px]
//                                       font-semibold
//                                       outline-none
//                                       focus:border-blue-400
//                                     "
//                                   >
//                                     {Array.from(
//                                       {
//                                         length: 100,
//                                       },
//                                       (_, index) =>
//                                         index + 1
//                                     ).map((number) => (
//                                       <option
//                                         key={number}
//                                         value={number}
//                                       >
//                                         {number} CTN
//                                       </option>
//                                     ))}
//                                   </select>
//                                 ) : (
//                                   <input
//                                     type="number"
//                                     min="1"
//                                     value={
//                                       selectedProducts.find(
//                                         (item) =>
//                                           item.id ===
//                                           product.id
//                                       )?.quantity || ""
//                                     }
//                                     onChange={(e) => {
//                                       const value =
//                                         e.target.value;

//                                       if (value === "") {
//                                         updateQuantity(
//                                           product.id,
//                                           ""
//                                         );
//                                         return;
//                                       }

//                                       const parsed =
//                                         parseInt(value);

//                                       if (
//                                         !isNaN(parsed)
//                                       ) {
//                                         updateQuantity(
//                                           product.id,
//                                           parsed
//                                         );
//                                       }
//                                     }}
//                                     className="
//                                       w-16
//                                       rounded-lg
//                                       border
//                                       border-slate-200
//                                       px-2
//                                       py-1.5
//                                       text-[10px]
//                                       font-semibold
//                                       outline-none
//                                       focus:border-blue-400
//                                       focus:ring-2
//                                       focus:ring-blue-500/10
//                                     "
//                                   />
//                                 )
//                               ) : (
//                                 <button
//                                   type="button"
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     handleAddProduct(product);
//                                   }}
//                                   className="
//                                     flex
//                                     h-8
//                                     w-8
//                                     items-center
//                                     justify-center
//                                     rounded-xl
//                                     bg-blue-50
//                                     text-[#1769ff]
//                                     transition-all
//                                     duration-200
//                                     hover:scale-105
//                                     hover:bg-blue-100
//                                     active:scale-95
//                                   "
//                                 >
//                                   <FaPlus size={10} />
//                                 </button>
//                               )}
//                             </div>
//                           )}
//                         </div>
//                       );
//                     }
//                   )
//                 )}
//               </div>
//             )}
//         </div>

//         {/* RIGHT SIDE */}

//         <div className="ml-auto flex items-center gap-1.5 px-4">
//           {/* CART */}

//           {(user?.role === "SS" ||
//             user?.role === "DS") && (
//             <NavLink
//               to="/cart"
//               title="Cart"
//               className="
//                 relative
//                 flex
//                 h-10
//                 w-10
//                 items-center
//                 justify-center
//                 rounded-xl
//                 text-slate-500
//                 transition-all
//                 duration-200
//                 hover:bg-blue-50
//                 hover:text-[#1769ff]
//               "
//             >
//               <FaShoppingCart size={15} />

//               {cartCount > 0 && (
//                 <span className="
//                   absolute
//                   right-0.5
//                   top-0.5
//                   flex
//                   h-4
//                   min-w-4
//                   items-center
//                   justify-center
//                   rounded-full
//                   bg-red-500
//                   px-1
//                   text-[8px]
//                   font-extrabold
//                   text-white
//                   shadow-sm
//                 ">
//                   {cartCount}
//                 </span>
//               )}
//             </NavLink>
//           )}

//           {/* NOTIFICATION */}

//           <button
//             type="button"
//             className="
//               relative
//               flex
//               h-10
//               w-10
//               items-center
//               justify-center
//               rounded-xl
//               text-slate-500
//               transition-all
//               duration-200
//               hover:bg-slate-50
//               hover:text-[#1769ff]
//             "
//           >
//             <Bell size={17} />

//             <span className="
//               absolute
//               right-2
//               top-2
//               h-1.5
//               w-1.5
//               rounded-full
//               bg-red-500
//               ring-2
//               ring-white
//             " />
//           </button>

//           {/* PROFILE */}

//           <div
//             ref={profileRef}
//             className="relative"
//           >
//             <button
//               type="button"
//               onClick={() =>
//                 setProfileDropdownOpen(
//                   !profileDropdownOpen
//                 )
//               }
//               className="
//                 flex
//                 items-center
//                 gap-2
//                 rounded-xl
//                 px-2
//                 py-1.5
//                 transition-all
//                 duration-200
//                 hover:bg-slate-50
//               "
//             >
//               <FaUserCircle className="text-[29px] text-slate-500" />

//               <div className="hidden text-left lg:block">
//                 <p className="max-w-[130px] truncate text-[11px] font-bold text-slate-800">
//                   {user?.name}
//                 </p>

//                 <p className="text-[8px] font-medium text-slate-400">
//                   {user?.role}
//                 </p>
//               </div>
//             </button>

//             {profileDropdownOpen && (
//               <div
//                 className="
//                   absolute
//                   right-0
//                   top-[50px]
//                   z-[200]
//                   w-56
//                   overflow-hidden
//                   rounded-2xl
//                   border
//                   border-slate-200
//                   bg-white
//                   shadow-[0_20px_50px_rgba(15,23,42,0.15)]
//                   animate-[searchDrop_.18s_ease-out]
//                 "
//               >
//                 <div className="border-b border-slate-100 bg-slate-50 px-4 py-4">
//                   <p className="text-[11px] font-extrabold text-slate-800">
//                     {user?.name}
//                   </p>

//                   <p className="mt-0.5 text-[9px] font-semibold text-slate-400">
//                     {user?.role}
//                   </p>

//                   <p className="mt-1.5 text-[9px] text-slate-500">
//                     ID: {user?.user_id}
//                   </p>
//                 </div>

//                 {user?.role === "ADMIN" && (
//                   <button
//                     type="button"
//                     onClick={() => {
//                       navigate("/setting");
//                       setProfileDropdownOpen(false);
//                     }}
//                     className="
//                       flex
//                       w-full
//                       items-center
//                       gap-3
//                       px-4
//                       py-3
//                       text-left
//                       text-[10px]
//                       font-semibold
//                       text-slate-600
//                       transition-colors
//                       hover:bg-slate-50
//                     "
//                   >
//                     <FaCog />
//                     Settings
//                   </button>
//                 )}

//                 <button
//                   type="button"
//                   onClick={handleLogout}
//                   className="
//                     flex
//                     w-full
//                     items-center
//                     gap-3
//                     border-t
//                     border-slate-100
//                     px-4
//                     py-3
//                     text-left
//                     text-[10px]
//                     font-bold
//                     text-red-500
//                     transition-colors
//                     hover:bg-red-50
//                   "
//                 >
//                   <FaSignOutAlt />
//                   Logout
//                 </button>
//               </div>
//             )}
//           </div>

//           <button
//             type="button"
//             className="
//               flex
//               h-9
//               w-9
//               items-center
//               justify-center
//               rounded-xl
//               text-slate-400
//               transition-all
//               hover:bg-slate-50
//               hover:text-slate-600
//             "
//           >
//             <MoreVertical size={16} />
//           </button>
//         </div>
//       </header>

//       {/* GLOBAL NAVBAR ANIMATION */}

//       <style>
//         {`
//           @keyframes searchDrop {
//             from {
//               opacity: 0;
//               transform: translateY(-5px) scale(.99);
//             }
//             to {
//               opacity: 1;
//               transform: translateY(0) scale(1);
//             }
//           }

//           @media (prefers-reduced-motion: reduce) {
//             *,
//             *::before,
//             *::after {
//               animation-duration: 0.01ms !important;
//               animation-iteration-count: 1 !important;
//               transition-duration: 0.01ms !important;
//             }
//           }
//         `}
//       </style>
//     </>
//   );
// }



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
  Bell,
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
import logo from "../assets/images/logo.png";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useStock } from "../context/StockContext";

const EXCLUDED_CATEGORIES = new Set([
  "SPEAKER PCB",
  "SPEAKER PACKING",
  "SPEAKER HOUSING",
]);

export default function Navbar({
  sidebarCollapsed,
  setSidebarCollapsed,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { getStockValue } = useStock();

  const [profileDropdownOpen, setProfileDropdownOpen] =
    useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchDropdownOpen, setSearchDropdownOpen] =
    useState(false);

  const [cartCount, setCartCount] = useState(0);

  /*
    =========================================================
    SIDEBAR TRANSITION CONTROL
    =========================================================

    Refresh ke time correct collapsed/expanded state
    browser paint se pehle set karne ke liye.
  */

  const [sidebarReady, setSidebarReady] = useState(false);

  const profileRef = useRef(null);
  const searchRef = useRef(null);

  const {
    selectedProducts,
    addProduct,
    updateQuantity,
    updateCartoon,
    cartoonSelection,
  } = useSelectedProducts();

  const {
    data: allProductsRaw = [],
    isLoading,
  } = useCachedProducts();

  const { data: schemes = [] } = useSchemes();

  /* =========================================================
     SPECIAL EXPANDED PAGES
  ========================================================= */

  const isAlwaysExpandedPage = useMemo(() => {
    return (
      location.pathname === "/CRMDashboard" ||
      location.pathname === "/user-schemes"
    );
  }, [location.pathname]);

  /* =========================================================
     PRODUCTS
  ========================================================= */

  const normalizeProduct = (product) => ({
    ...product,
    id: product.id ?? product.product_id,
  });

  const allProducts = useMemo(() => {
    return allProductsRaw
      .map(normalizeProduct)
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
    if (!searchTerm.trim()) return [];

    const uniqueResults = new Map();

    const lowerSearch = searchTerm.toLowerCase();

    (fuseResults || []).forEach((product) => {
      const category = String(
        product.sub_category || ""
      )
        .trim()
        .toUpperCase();

      if (EXCLUDED_CATEGORIES.has(category)) return;

      const matchedSaleName =
        Array.isArray(product.sale_names)
          ? product.sale_names.find((name) =>
              String(name)
                .toLowerCase()
                .includes(lowerSearch)
            )
          : null;

      const matchFound =
        product.product_name
          ?.toLowerCase()
          .includes(lowerSearch) ||
        product.sub_category
          ?.toLowerCase()
          .includes(lowerSearch) ||
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

  const searchResultsLimited =
    searchResults.slice(0, 6);

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

  const handleLogout = () => {
    logout(() => {
      navigate("/login");
    });
  };

  const handleAddProduct = (product) => {
    if (isAdded(product.id)) return;

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
  =========================================================

     /CRMDashboard
     /user-schemes
        ↓
     ALWAYS EXPANDED

     Other pages
        ↓
     DEFAULT COLLAPSED

     Important:
     Is effect mein sidebarCollapsed dependency nahi hai.
     Isliye manual button se kiya hua toggle immediately
     overwrite nahi hoga.
  ========================================================= */

  useLayoutEffect(() => {
    if (isAlwaysExpandedPage) {
      if (sidebarCollapsed !== false) {
        setSidebarCollapsed(false);
      }
    } else {
      /*
        Normal pages ka default state collapsed hai.

        Ye layout effect browser paint se pehle run hota hai,
        isliye refresh par expanded → collapsed flash nahi hoga.
      */
      if (sidebarCollapsed !== true) {
        setSidebarCollapsed(true);
      }
    }

    setSidebarReady(true);

    // Intentionally only pathname/special-page state par run.
    // sidebarCollapsed ko dependency mein nahi rakhna hai,
    // warna manual toggle overwrite ho jayega.
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
    /*
      Special pages par collapse allowed nahi hai.
    */
    if (isAlwaysExpandedPage) {
      return;
    }

    setSidebarCollapsed((current) => !current);
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
        const saved =
          localStorage.getItem(
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

    return () =>
      clearInterval(interval);
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

    return () =>
      document.removeEventListener(
        "mousedown",
        handler
      );
  }, []);

  /* =========================================================
     ROLE NAVIGATION
  ========================================================= */

  const navItems = [];

  /* =========================================================
     ADMIN
  ========================================================= */

  if (user?.role === "ADMIN") {
    navItems.push(
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
        label: "Inactive",
        path: "/inactive",
        icon: <FaBan />,
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
      {
        label: "Goa Trip",
        path: "/goa-couple-trip-schemes",
        icon: <FaUmbrellaBeach />,
      },
      {
        label: "Catalogue",
        path: "/product-images-pdf",
        icon: <FaBookOpen />,
      }
    );
  }

  /* =========================================================
     CRM
  ========================================================= */

  if (user?.role === "CRM") {
    navItems.push(
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
        label: "Not In Stock",
        path: "/not-in-stock-reports",
        icon: <FaChartLine />,
      },
      {
        label: "Goa Trip",
        path: "/goa-couple-trip-schemes",
        icon: <FaUmbrellaBeach />,
      },
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
  }

  /* =========================================================
     ASM
  ========================================================= */

  if (user?.role === "ASM") {
    navItems.push(
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

  /* =========================================================
     DS
  ========================================================= */

  if (user?.role === "DS") {
    navItems.push(
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

  /* =========================================================
     SS
  ========================================================= */

  if (user?.role === "SS") {
    navItems.push(
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

  /* =========================================================
     HR
  ========================================================= */

  if (user?.role === "HR") {
    navItems.push(
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
          bg-[#101f33]
          text-white
          shadow-[8px_0_30px_rgba(15,23,42,0.08)]

          ${
            sidebarReady
              ? "transition-[width] duration-300 ease-out"
              : "transition-none"
          }

          ${
            sidebarCollapsed
              ? "w-[72px]"
              : "w-[220px]"
          }
        `}
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
            bg-gray-100
            border-white/[0.07]

            ${
              sidebarCollapsed
                ? "justify-center"
                : "px-5"
            }
          `}
        >
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

          <img
            src={logo}
            alt="MAKPOWER"
            onClick={() => navigate("/")}
            className={`
              cursor-pointer
              object-contain
              transition-all
              duration-300

              ${
                sidebarCollapsed
                  ? "w-[40px]"
                  : "w-[136px]"
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
            border-slate-200
            bg-white

            text-slate-800

            shadow-[0_5px_20px_rgba(15,23,42,0.14)]

            transition-all
            duration-200

            ${
              isAlwaysExpandedPage
                ? "cursor-not-allowed opacity-60"
                : `
                  cursor-pointer
                  hover:scale-105
                  hover:border-blue-200
                  hover:bg-blue-50
                  hover:text-[#1769ff]
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
              group-hover:scale-110
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
                  rounded-xl
                  transition-all
                  duration-200

                  ${
                    sidebarCollapsed
                      ? "justify-center px-2 py-3"
                      : "gap-3 px-3 py-2.5"
                  }

                  ${
                    isActive
                      ? `
                        bg-[#1769ff]
                        text-white
                        shadow-[0_5px_18px_rgba(23,105,255,0.25)]
                      `
                      : `
                        text-slate-300
                        hover:bg-white/[0.06]
                        hover:text-white
                      `
                  }
                `
                }
              >
                <span
                  className="
                    flex
                    h-5
                    w-5
                    shrink-0
                    items-center
                    justify-center
                    text-[14px]
                    transition-transform
                    duration-200
                    group-hover:scale-110
                  "
                >
                  {item.icon}
                </span>

                {!sidebarCollapsed && (
                  <span className="truncate text-[11px] font-semibold tracking-[0.01em]">
                    {item.label}
                  </span>
                )}

                {!sidebarCollapsed && (
                  <span className="pointer-events-none absolute right-3 h-1.5 w-1.5 rounded-full bg-white opacity-0 transition-opacity group-[.active]:opacity-100" />
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
          backdrop-blur-xl
          md:flex

          ${
            sidebarReady
              ? "transition-[left] duration-300 ease-out"
              : "transition-none"
          }

          ${
            sidebarCollapsed
              ? "left-[72px]"
              : "left-[220px]"
          }
        `}
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
                transition-colors
                group-focus-within:text-[#1769ff]
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
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                pl-10
                pr-20
                text-[11px]
                font-medium
                text-slate-700
                outline-none
                transition-all
                duration-200
                placeholder:text-slate-400
                hover:border-slate-300
                focus:border-blue-400
                focus:bg-white
                focus:ring-4
                focus:ring-blue-500/[0.07]
              "
            />

            <span
              className="
                pointer-events-none
                absolute
                right-2.5
                top-1/2
                -translate-y-1/2
                rounded-lg
                border
                border-slate-200
                bg-white
                px-2
                py-1
                text-[8px]
                font-bold
                text-slate-400
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
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-[0_20px_60px_rgba(15,23,42,0.15)]
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
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
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
                            transition-colors
                            hover:bg-slate-50
                            last:border-0
                          "
                        >
                          <button
                            type="button"
                            onClick={() => {
                              navigate(
                                `/product/${product.id}`
                              );
                              setSearchDropdownOpen(false);
                            }}
                            className="min-w-0 flex-1 text-left"
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

                              {hasScheme(product.id) && (
                                <FaGift className="shrink-0 text-[10px] text-pink-500" />
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
                              {isAdded(product.id) ? (
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
                                      focus:border-blue-400
                                    "
                                  >
                                    {Array.from(
                                      {
                                        length: 100,
                                      },
                                      (_, index) =>
                                        index + 1
                                    ).map((number) => (
                                      <option
                                        key={number}
                                        value={number}
                                      >
                                        {number} CTN
                                      </option>
                                    ))}
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
                                      )?.quantity || ""
                                    }
                                    onChange={(e) => {
                                      const value =
                                        e.target.value;

                                      if (value === "") {
                                        updateQuantity(
                                          product.id,
                                          ""
                                        );
                                        return;
                                      }

                                      const parsed =
                                        parseInt(value);

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
                                      focus:border-blue-400
                                      focus:ring-2
                                      focus:ring-blue-500/10
                                    "
                                  />
                                )
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddProduct(product);
                                  }}
                                  className="
                                    flex
                                    h-8
                                    w-8
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-blue-50
                                    text-[#1769ff]
                                    transition-all
                                    duration-200
                                    hover:scale-105
                                    hover:bg-blue-100
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
          {/* CART */}

          {(user?.role === "SS" ||
            user?.role === "DS") && (
            <NavLink
              to="/cart"
              title="Cart"
              className="
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                text-slate-500
                transition-all
                duration-200
                hover:bg-blue-50
                hover:text-[#1769ff]
              "
            >
              <FaShoppingCart size={15} />

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
                  "
                >
                  {cartCount}
                </span>
              )}
            </NavLink>
          )}

          {/* NOTIFICATION */}

          <button
            type="button"
            className="
              relative
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              text-slate-500
              transition-all
              duration-200
              hover:bg-slate-50
              hover:text-[#1769ff]
            "
          >
            <Bell size={17} />

            <span
              className="
                absolute
                right-2
                top-2
                h-1.5
                w-1.5
                rounded-full
                bg-red-500
                ring-2
                ring-white
              "
            />
          </button>

          {/* PROFILE */}

          <div
            ref={profileRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setProfileDropdownOpen(
                  !profileDropdownOpen
                )
              }
              className="
                flex
                items-center
                gap-2
                rounded-xl
                px-2
                py-1.5
                transition-all
                duration-200
                hover:bg-slate-50
              "
            >
              <FaUserCircle className="text-[29px] text-slate-500" />

              <div className="hidden text-left lg:block">
                <p className="max-w-[130px] truncate text-[11px] font-bold text-slate-800">
                  {user?.name}
                </p>

                <p className="text-[8px] font-medium text-slate-400">
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
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-[0_20px_50px_rgba(15,23,42,0.15)]
                  animate-[searchDrop_.18s_ease-out]
                "
              >
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-4">
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
                      setProfileDropdownOpen(false);
                    }}
                    className="
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
                      transition-colors
                      hover:bg-slate-50
                    "
                  >
                    <FaCog />
                    Settings
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="
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
                    transition-colors
                    hover:bg-red-50
                  "
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              text-slate-400
              transition-all
              hover:bg-slate-50
              hover:text-slate-600
            "
          >
            <MoreVertical size={16} />
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