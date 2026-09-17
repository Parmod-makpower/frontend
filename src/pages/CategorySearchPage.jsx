// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useCachedProducts } from "../hooks/useCachedProducts";
// import { useSchemes } from "../hooks/useSchemes";
// import useFuseSearch from "../hooks/useFuseSearch";
// import { useSelectedProducts } from "../hooks/useSelectedProducts";
// import categories from "../data/categoryData";
// import MobilePageHeader from "../components/MobilePageHeader";
// import { useAuth } from "../context/AuthContext";
// import ProductCard from "../components/ProductCard";
// import { ChevronDown, ChevronRight } from "lucide-react";

// export default function CategoryProductListPage() {
//   const { user } = useAuth();
//   const { categoryKeyword } = useParams();
//   const navigate = useNavigate();
//   const { data: allProducts = [], isLoading } = useCachedProducts();
//   const { data: schemes = [] } = useSchemes();
//   const { selectedProducts, addProduct, updateQuantity, updateCartoon, cartoonSelection } = useSelectedProducts();


//   const [search, setSearch] = useState("");

//   const filteredByCategory = allProducts.filter((product) =>
//   product.is_active === true &&
//   product.sub_category?.trim().toLowerCase() ===
//     categoryKeyword.trim().toLowerCase()
// );

//   const filteredProducts = useFuseSearch(filteredByCategory, search, {
//     keys: ["product_name", "sub_category", "product_id"],
//     threshold: 0.3,
//   });

//   const productsToShow = search ? filteredProducts : filteredByCategory;
//   const sortedProducts = [...productsToShow].sort((a, b) => {
//   return (a.price || 0) - (b.price || 0);
// });

//   useEffect(() => {
//     setSearch("");
//   }, [categoryKeyword]);

//   const hasScheme = (productId) =>
//     schemes.some(
//       (scheme) =>
//         Array.isArray(scheme.conditions) &&
//         scheme.conditions.some((cond) => cond.product === productId)
//     );

//   return (
//     <div className="p-4 mx-auto grid grid-cols-1 gap-4 bg-white">
//       {/* Sidebar */}

//       <aside className="hidden md:block fixed top-[130px] left-0 h-[calc(100vh-130px)] w-70 bg-white shadow-lg p-3 overflow-y-auto">
//         <h2 className="text-lg font-bold mb-4">All Categories</h2>
//         <div className="flex flex-col gap-2">
//           {categories.map((cat) => {
//             const [open, setOpen] = useState(false);

//             return (
//               <div key={cat.label}>
//                 {/* Parent Category */}
//                 <div
//                   onClick={() => {
//                     if (cat.subcategories && cat.subcategories.length > 0) {
//                       setOpen(!open);
//                     } else {
//                       navigate(`/category/${encodeURIComponent(cat.keyword)}`);
//                     }
//                   }}
//                   className={`flex items-center justify-between gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition
//               ${cat.keyword.toLowerCase() === categoryKeyword.toLowerCase()
//                       ? "bg-blue-100"
//                       : ""
//                     }`}
//                 >
//                   <div className="flex items-center gap-2">
//                     <div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden">
//                       <img src={cat.image} alt={cat.label} className="w-full h-full object-cover" />
//                     </div>
//                     <span className="text-sm font-medium text-gray-700 truncate">
//                       {cat.label}
//                     </span>
//                   </div>
//                   {cat.subcategories && cat.subcategories.length > 0 && (
//                     open ? <ChevronDown size={18} /> : <ChevronRight size={18} />
//                   )}
//                 </div>

//                 {/* Subcategories */}
//                 {open && cat.subcategories && cat.subcategories.length > 0 && (
//                   <div className="ml-10 mt-1 flex flex-col gap-1">
//                     {cat.subcategories.map((sub) => (
//                       <div
//                         key={sub.label}
//                         onClick={() =>
//                           navigate(`/category/${encodeURIComponent(sub.keyword)}`)
//                         }
//                         className={`p-1 text-sm text-gray-600 cursor-pointer rounded hover:bg-gray-100
//                     ${sub.keyword.toLowerCase() === categoryKeyword.toLowerCase()
//                             ? "bg-blue-50 font-medium text-blue-600"
//                             : ""
//                           }`}
//                       >
//                         {sub.label}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </aside>


//       <MobilePageHeader title={categoryKeyword} />

//       {/* Products Section */}
//       <main className="md:col-span-3 md:ml-70 pt-[60px] sm:pt-0 pb-20">
       
//         {/* Product List */}
//         {isLoading ? (
//           <p>Loading...</p>
//         ) : productsToShow.length === 0 ? (
//           <p className="text-center text-gray-500 py-8">
//             No matching products found.
//           </p>
//         ) : (
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
//            {sortedProducts.map((prod) => {
//               const prodId = prod.id ?? prod.product_id;
//               const existing = selectedProducts.find((p) => p.id === prodId);

//               return (
//                 <ProductCard
//                   key={prodId}
//                   prod={prod}
//                   hasScheme={hasScheme}
//                   user={user}
//                   selectedProducts={selectedProducts}
//                   addProduct={addProduct}
//                   updateQuantity={updateQuantity}
//                   updateCartoon={updateCartoon}       // ✅ add
//                   cartoonSelection={cartoonSelection} // ✅ add
//                   cardWidth="w-full"
//                 />
//               );
//             })}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }



import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSchemes } from "../hooks/useSchemes";
import useFuseSearch from "../hooks/useFuseSearch";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import categories from "../data/categoryData";
import MobilePageHeader from "../components/MobilePageHeader";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Package,
  X,
} from "lucide-react";

const INITIAL_VISIBLE = 24;
const LOAD_MORE = 24;

export default function CategoryProductListPage() {
  const { user } = useAuth();
  const { categoryKeyword } = useParams();
  const navigate = useNavigate();

  const { data: allProducts = [], isLoading } = useCachedProducts();
  const { data: schemes = [] } = useSchemes();

  const {
    selectedProducts,
    addProduct,
    updateQuantity,
    updateCartoon,
    cartoonSelection,
  } = useSelectedProducts();

  const [search, setSearch] = useState("");
  const [openCategory, setOpenCategory] = useState(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const loadMoreRef = useRef(null);

  const currentCategory = useMemo(
    () => (categoryKeyword || "").trim().toLowerCase(),
    [categoryKeyword]
  );

  /* ---------------------------------------------------------
     RESET WHEN CATEGORY CHANGES
  --------------------------------------------------------- */
  useEffect(() => {
    setSearch("");
    setVisibleCount(INITIAL_VISIBLE);
    setOpenCategory(null);
  }, [categoryKeyword]);

  /* ---------------------------------------------------------
     CATEGORY PRODUCTS
  --------------------------------------------------------- */
  const filteredByCategory = useMemo(() => {
    return allProducts.filter(
      (product) =>
        product?.is_active === true &&
        product?.sub_category?.trim().toLowerCase() === currentCategory
    );
  }, [allProducts, currentCategory]);

  /* ---------------------------------------------------------
     SEARCH
  --------------------------------------------------------- */
  const filteredProducts = useFuseSearch(filteredByCategory, search, {
    keys: ["product_name", "sub_category", "product_id"],
    threshold: 0.3,
  });

  const productsToShow = search ? filteredProducts : filteredByCategory;

  /* ---------------------------------------------------------
     SORT
  --------------------------------------------------------- */
  const sortedProducts = useMemo(() => {
    return [...productsToShow].sort(
      (a, b) => (a?.price || 0) - (b?.price || 0)
    );
  }, [productsToShow]);

  /* ---------------------------------------------------------
     VISIBLE PRODUCTS
  --------------------------------------------------------- */
  const visibleProducts = useMemo(() => {
    return sortedProducts.slice(0, visibleCount);
  }, [sortedProducts, visibleCount]);

  const hasMore = visibleCount < sortedProducts.length;

  /* ---------------------------------------------------------
     RESET VISIBLE COUNT ON SEARCH
  --------------------------------------------------------- */
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [search]);

  /* ---------------------------------------------------------
     FAST LOAD MORE
  --------------------------------------------------------- */
  useEffect(() => {
    if (!hasMore || isLoading) return;

    const node = loadMoreRef.current;

    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(prev + LOAD_MORE, sortedProducts.length)
          );
        }
      },
      {
        rootMargin: "500px 0px",
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasMore, isLoading, sortedProducts.length]);

  /* ---------------------------------------------------------
     SCHEME
  --------------------------------------------------------- */
  const hasScheme = (productId) =>
    schemes.some(
      (scheme) =>
        Array.isArray(scheme.conditions) &&
        scheme.conditions.some((cond) => cond.product === productId)
    );

  /* ---------------------------------------------------------
     CURRENT CATEGORY
  --------------------------------------------------------- */
  const currentCategoryData = useMemo(() => {
    return categories.find(
      (cat) => cat?.keyword?.trim().toLowerCase() === currentCategory
    );
  }, [currentCategory]);

  /* ---------------------------------------------------------
     CATEGORY CLICK
  --------------------------------------------------------- */
 /* ---------------------------------------------------------
   CATEGORY CLICK
--------------------------------------------------------- */
const handleCategoryClick = (cat) => {
  // ✅ Spare Parts → directly subcategories page
  if (cat?.keyword?.trim().toLowerCase() === "spare parts") {
    navigate("/category/Spare%20parts/subcategories");
    return;
  }

  const hasSubcategories =
    Array.isArray(cat.subcategories) && cat.subcategories.length > 0;

  if (hasSubcategories) {
    setOpenCategory((prev) =>
      prev === cat.keyword ? null : cat.keyword
    );
    return;
  }

  navigate(`/category/${encodeURIComponent(cat.keyword)}`);
};

  /* ---------------------------------------------------------
     ANIMATIONS
  --------------------------------------------------------- */
  const animationStyles = `
    @keyframes categoryPageIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes productCardIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
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

    .hide-scrollbar {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
  `;

  return (
    <>
      <style>{animationStyles}</style>

      <div className="min-h-screen bg-[#f5f7fb]">

        {/* =====================================================
            MOBILE HEADER
        ====================================================== */}
        <MobilePageHeader title={categoryKeyword} />

        {/* =====================================================
            DESKTOP CATEGORY NAVIGATION
        ====================================================== */}
        <div className="hidden md:block sticky top-0 z-30 px-4 pt-3">

          <div
            className="mx-auto max-w-[1800px] rounded-2xl border border-[#e7edf5] bg-white shadow-sm"
            style={{
              animation: "categoryPageIn .3s ease-out both",
            }}
          >

            {/* TOP ROW */}
            <div className="flex items-center gap-4 px-4 py-3">

              {/* CATEGORY TITLE */}
              <div className="flex min-w-[190px] items-center gap-2">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1769ff]">
                  <Package size={18} />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-sm font-bold text-[#0f172a]">
                    {currentCategoryData?.label || categoryKeyword}
                  </h1>

                  <p className="text-[10px] text-[#94a3b8]">
                    {sortedProducts.length} product
                    {sortedProducts.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              {/* CATEGORY LINE */}
              <div className="min-w-0 flex-1">

                <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto">

                  {categories.map((cat) => {
                    const active =
                      cat?.keyword?.trim().toLowerCase() ===
                      currentCategory;

                    const hasSubcategories =
                      Array.isArray(cat.subcategories) &&
                      cat.subcategories.length > 0;

                    const isOpen = openCategory === cat.keyword;

                    return (
                      <button
                        key={cat.keyword || cat.label}
                        type="button"
                        onClick={() => handleCategoryClick(cat)}
                        className={`
                          group flex h-10 shrink-0 items-center gap-2
                          rounded-xl border px-2.5 pr-3
                          transition-all duration-200
                          ${
                            active
                              ? "border-[#1769ff] bg-[#1769ff] text-white shadow-sm shadow-blue-100"
                              : "border-[#e7edf5] bg-[#f8fafc] text-[#475569] hover:border-blue-200 hover:bg-blue-50 hover:text-[#1769ff]"
                          }
                        `}
                      >
                        <span
                          className={`
                            flex h-7 w-7 shrink-0 overflow-hidden rounded-lg
                            ${
                              active
                                ? "bg-white/15"
                                : "bg-white"
                            }
                          `}
                        >
                          <img
                            src={cat.image}
                            alt={cat.label}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </span>

                        <span className="max-w-[105px] truncate text-[11px] font-semibold">
                          {cat.label}
                        </span>

                        {hasSubcategories && (
                          <span className="shrink-0">
                            {isOpen ? (
                              <ChevronDown size={14} />
                            ) : (
                              <ChevronRight size={14} />
                            )}
                          </span>
                        )}
                      </button>
                    );
                  })}

                </div>
              </div>

              {/* SEARCH */}
              <div className="relative hidden w-[250px] shrink-0 lg:block">

                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="
                    h-10 w-full rounded-xl
                    border border-[#e2e8f0]
                    bg-[#f8fafc]
                    pl-9 pr-9
                    text-xs text-[#0f172a]
                    outline-none
                    transition-all
                    placeholder:text-[#94a3b8]
                    focus:border-[#1769ff]
                    focus:bg-white
                    focus:ring-4 focus:ring-blue-50
                  "
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg text-[#94a3b8] hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* =================================================
                SUBCATEGORY ROW
            ================================================== */}
            {openCategory &&
              (() => {
                const selectedCategory = categories.find(
                  (cat) => cat.keyword === openCategory
                );

                if (
                  !selectedCategory?.subcategories ||
                  selectedCategory.subcategories.length === 0
                ) {
                  return null;
                }

                return (
                  <div
                    className="border-t border-[#eef2f7] px-4 py-2.5"
                    style={{
                      animation: "categoryPageIn .2s ease-out both",
                    }}
                  >
                    <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto">

                      <span className="mr-1 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                        Subcategories
                      </span>

                      {selectedCategory.subcategories.map((sub) => {
                        const active =
                          sub?.keyword?.trim().toLowerCase() ===
                          currentCategory;

                        return (
                          <button
                            key={sub.keyword || sub.label}
                            type="button"
                            onClick={() =>
                              navigate(
                                `/category/${encodeURIComponent(
                                  sub.keyword
                                )}`
                              )
                            }
                            className={`
                              shrink-0 rounded-lg border px-3 py-1.5
                              text-[11px] font-medium
                              transition-all duration-200
                              ${
                                active
                                  ? "border-[#1769ff] bg-blue-50 text-[#1769ff]"
                                  : "border-[#e7edf5] bg-white text-[#64748b] hover:border-blue-200 hover:text-[#1769ff]"
                              }
                            `}
                          >
                            {sub.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
          </div>
        </div>

        {/* =====================================================
            MOBILE SEARCH
        ====================================================== */}
      

        {/* =====================================================
            PRODUCT AREA
        ====================================================== */}
        <main
          className="
            mx-auto w-full max-w-[1800px]
            px-3 sm:px-4 md:px-5 lg:px-6
            pb-24
            pt-16 md:pt-4
          "
        >

          {/* MOBILE CATEGORY INFO */}
          <div className="mb-3 flex items-center justify-between md:hidden">

            <div>
              

              <p className="text-[10px] text-[#94a3b8]">
                {sortedProducts.length} product
                {sortedProducts.length === 1 ? "" : "s"}
              </p>
            </div>

            {search && (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-[#1769ff]">
                {sortedProducts.length} found
              </span>
            )}
          </div>

          {/* DESKTOP SEARCH RESULT */}
          {search && !isLoading && (
            <div className="mb-3 hidden items-center justify-between rounded-xl border border-[#e7edf5] bg-white px-3 py-2 md:flex">
              <p className="text-xs text-[#64748b]">
                Search results for{" "}
                <span className="font-semibold text-[#0f172a]">
                  “{search}”
                </span>
              </p>

              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-[#1769ff]">
                {sortedProducts.length} found
              </span>
            </div>
          )}

          {/* ===================================================
              LOADING
          ==================================================== */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">

              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-[#e7edf5] bg-white"
                >
                  <div className="aspect-square animate-pulse bg-slate-100" />

                  <div className="space-y-2 p-3">
                    <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                    <div className="h-8 w-full animate-pulse rounded-xl bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : visibleProducts.length === 0 ? (
            /* =================================================
               EMPTY
            ================================================== */
            <div
              className="rounded-2xl border border-[#e7edf5] bg-white px-5 py-14 text-center shadow-sm"
              style={{
                animation: "categoryPageIn .3s ease-out both",
              }}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Search size={24} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-[#0f172a]">
                No matching products
              </h3>

              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-[#94a3b8]">
                {search
                  ? `No products found for "${search}".`
                  : "There are currently no active products in this category."}
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-4 rounded-xl bg-[#1769ff] px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              {/* =================================================
                  PRODUCT GRID
                  h-full + items-stretch = SAME CARD HEIGHT
              ================================================== */}
              <div className="grid grid-cols-2 items-stretch gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">

                {visibleProducts.map((prod, index) => {
                  const prodId = prod.id ?? prod.product_id;

                  return (
                    <div
                      key={prodId}
                      className="h-full"
                      style={{
                        animation: "productCardIn .35s ease-out both",
                        animationDelay: `${Math.min(
                          index * 30,
                          300
                        )}ms`,
                      }}
                    >
                      <ProductCard
                        prod={prod}
                        hasScheme={hasScheme}
                        user={user}
                        selectedProducts={selectedProducts}
                        addProduct={addProduct}
                        updateQuantity={updateQuantity}
                        updateCartoon={updateCartoon}
                        cartoonSelection={cartoonSelection}
                        cardWidth="w-full h-full"
                      />
                    </div>
                  );
                })}
              </div>

              {/* =================================================
                  LOAD MORE
              ================================================== */}
              {hasMore && (
                <div
                  ref={loadMoreRef}
                  className="flex justify-center py-8"
                >
                  <div className="flex items-center gap-2 rounded-full border border-[#e7edf5] bg-white px-4 py-2 text-[11px] font-medium text-[#64748b] shadow-sm">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#1769ff]" />
                    Loading more products...
                  </div>
                </div>
              )}

              {/* =================================================
                  END
              ================================================== */}
              {!hasMore && visibleProducts.length > 0 && (
                <div className="py-6 text-center">
                  <span className="text-[10px] font-medium text-[#94a3b8]">
                    Showing all {sortedProducts.length} products
                  </span>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}