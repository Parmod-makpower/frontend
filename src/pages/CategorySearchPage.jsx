import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSchemes } from "../hooks/useSchemes";
import useFuseSearch from "../hooks/useFuseSearch";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useAuth } from "../context/AuthContext";
import { useStock } from "../context/StockContext";
import categories from "../data/categoryData";
import MobilePageHeader from "../components/MobilePageHeader";
import ProductCard from "../components/ProductCard";

import {
  ChevronDown,
  ChevronRight,
  Search,
  Package,
  X,
  ArrowDownUp,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import BackButton from "../Layout/BackButton";

const INITIAL_VISIBLE = 24;
const LOAD_MORE = 24;

export default function CategoryProductListPage() {
  const { user } = useAuth();
  const { categoryKeyword } = useParams();
  const navigate = useNavigate();

  const { data: allProducts = [], isLoading } = useCachedProducts();
  const { data: schemes = [] } = useSchemes();
  const { getStockValue } = useStock();

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

  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("price-low");

  const loadMoreRef = useRef(null);

  const currentCategory = useMemo(
    () => (categoryKeyword || "").trim().toLowerCase(),
    [categoryKeyword]
  );

  /* =========================================================
     RESET
  ========================================================= */
  useEffect(() => {
    setSearch("");
    setStockFilter("all");
    setSortBy("price-low");
    setVisibleCount(INITIAL_VISIBLE);
    setOpenCategory(null);
  }, [categoryKeyword]);

  /* =========================================================
     CATEGORY PRODUCTS
  ========================================================= */
  const filteredByCategory = useMemo(
    () =>
      allProducts.filter(
        (p) =>
          p?.is_active === true &&
          p?.sub_category?.trim().toLowerCase() === currentCategory
      ),
    [allProducts, currentCategory]
  );

  /* =========================================================
     SEARCH
  ========================================================= */
  const searchedProducts = useFuseSearch(
    filteredByCategory,
    search,
    {
      keys: ["product_name", "sub_category", "product_id"],
      threshold: 0.3,
    }
  );

  /* =========================================================
     STOCK FILTER
     Same logic as ProductCard
  ========================================================= */
  const stockFilteredProducts = useMemo(() => {
    const source = search ? searchedProducts : filteredByCategory;

    if (stockFilter === "all") return source;

    return source.filter((product) => {
      const stock = Number(getStockValue(product) || 0);
      const moq = Number(product?.moq || 1);

      const outOfStock = stock <= moq;

      return stockFilter === "out"
        ? outOfStock
        : !outOfStock;
    });
  }, [
    search,
    searchedProducts,
    filteredByCategory,
    stockFilter,
    getStockValue,
  ]);

  /* =========================================================
     SORT
  ========================================================= */
  const sortedProducts = useMemo(() => {
    return [...stockFilteredProducts].sort((a, b) => {
      if (sortBy === "price-high") {
        return Number(b?.price || 0) - Number(a?.price || 0);
      }

      if (sortBy === "name-az") {
        return String(a?.product_name || "").localeCompare(
          String(b?.product_name || ""),
          undefined,
          {
            sensitivity: "base",
            numeric: true,
          }
        );
      }

      if (sortBy === "name-za") {
        return String(b?.product_name || "").localeCompare(
          String(a?.product_name || ""),
          undefined,
          {
            sensitivity: "base",
            numeric: true,
          }
        );
      }

      return Number(a?.price || 0) - Number(b?.price || 0);
    });
  }, [stockFilteredProducts, sortBy]);

  /* =========================================================
     PAGINATION
  ========================================================= */
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [search, stockFilter, sortBy]);

  const visibleProducts = useMemo(
    () => sortedProducts.slice(0, visibleCount),
    [sortedProducts, visibleCount]
  );

  const hasMore = visibleCount < sortedProducts.length;

  /* =========================================================
     LOAD MORE
  ========================================================= */
  useEffect(() => {
    if (!hasMore || isLoading || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(prev + LOAD_MORE, sortedProducts.length)
          );
        }
      },
      {
        rootMargin: "400px",
      }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasMore, isLoading, sortedProducts.length]);

  /* =========================================================
     SCHEME
  ========================================================= */
  const hasScheme = (productId) =>
    schemes.some(
      (scheme) =>
        Array.isArray(scheme.conditions) &&
        scheme.conditions.some(
          (condition) => condition.product === productId
        )
    );

  /* =========================================================
     CURRENT CATEGORY
  ========================================================= */
  const currentCategoryData = useMemo(
    () =>
      categories.find(
        (cat) =>
          cat?.keyword?.trim().toLowerCase() === currentCategory
      ),
    [currentCategory]
  );

  /* =========================================================
     CATEGORY CLICK
  ========================================================= */
  const handleCategoryClick = (cat) => {
    if (
      cat?.keyword?.trim().toLowerCase() ===
      "spare parts"
    ) {
      navigate("/category/Spare%20parts/subcategories");
      return;
    }

    if (
      Array.isArray(cat.subcategories) &&
      cat.subcategories.length
    ) {
      setOpenCategory((prev) =>
        prev === cat.keyword ? null : cat.keyword
      );
      return;
    }

    navigate(
      `/category/${encodeURIComponent(cat.keyword)}`
    );
  };

  /* =========================================================
     FILTER BUTTON
  ========================================================= */
  const FilterButton = ({ value, label, icon }) => {
    const active = stockFilter === value;

    const activeStyle =
      value === "all"
        ? "border-[#d8e5ff] bg-[#edf4ff] text-[#1769ff]"
        : value === "in"
        ? "border-[#ccefdc] bg-[#effbf4] text-[#159447]"
        : "border-[#ffd6d6] bg-[#fff2f2] text-[#e53935]";

    const iconColor =
      value === "in"
        ? "text-[#16a34a]"
        : value === "out"
        ? "text-[#ef233c]"
        : "";

    return (
      <button
        type="button"
        onClick={() => setStockFilter(value)}
        className={`
          flex h-9 shrink-0 items-center gap-1.5
          rounded-full border px-3
          text-[11px] font-semibold
          transition-all duration-200
          active:scale-[0.97]
          ${
            active
              ? activeStyle
              : "border-[#e7edf5] bg-white text-[#64748b] hover:border-[#dbe5f3] hover:bg-[#f8fafc]"
          }
        `}
      >
        {icon && (
          <span className={iconColor}>
            {icon}
          </span>
        )}

        {label}
      </button>
    );
  };

  return (
    <>
      <style>{`
        @keyframes pageIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-[#f5f7fb]">
        <MobilePageHeader title={categoryKeyword} />

        {/* =====================================================
            DESKTOP CATEGORY BAR
        ===================================================== */}
        <div className="sticky top-0 z-30 hidden px-4 pt-3 md:block">
          <div className="mx-auto max-w-[1800px] rounded border border-[#e7edf5] bg-white shadow-sm">

            <div className="flex items-center gap-4 px-4 py-3">

 <div className="hidden shrink-0 lg:block">
    <BackButton fallback="/" />
  </div>
              {/* CATEGORY TITLE */}
              <div className="flex min-w-[190px] items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1769ff]">
                  <Package size={18} />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-sm font-bold text-[#0f172a]">
                    {currentCategoryData?.label ||
                      categoryKeyword}
                  </h1>

                  <p className="text-[10px] text-[#94a3b8]">
                    {sortedProducts.length} products
                  </p>
                </div>
              </div>

              {/* CATEGORY NAVIGATION */}
              <div className="min-w-0 flex-1">
                <div className="hide-scrollbar flex gap-2 overflow-x-auto">

                  {categories.map((cat) => {
                    const active =
                      cat?.keyword?.trim().toLowerCase() ===
                      currentCategory;

                    const hasSubcategories =
                      Array.isArray(cat.subcategories) &&
                      cat.subcategories.length > 0;

                    const isOpen =
                      openCategory === cat.keyword;

                    return (
                      <button
                        key={cat.keyword || cat.label}
                        type="button"
                        onClick={() =>
                          handleCategoryClick(cat)
                        }
                        className={`
                          flex h-10 shrink-0 items-center gap-2
                          rounded-xl border px-2.5 pr-3
                          transition-all
                          ${
                            active
                              ? "border-[#1769ff] bg-[#1769ff] text-white"
                              : "border-[#e7edf5] bg-[#f8fafc] text-[#475569] hover:border-blue-200 hover:bg-blue-50 hover:text-[#1769ff]"
                          }
                        `}
                      >
                        <span
                          className={`
                            flex h-7 w-7 overflow-hidden rounded-lg
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
                            className="h-full w-full object-cover"
                          />
                        </span>

                        <span className="max-w-[105px] truncate text-[11px] font-semibold">
                          {cat.label}
                        </span>

                        {hasSubcategories &&
                          (isOpen ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronRight size={14} />
                          ))}
                      </button>
                    );
                  })}

                </div>
              </div>

              {/* SEARCH */}
              <div className="relative hidden w-[250px] lg:block">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search products..."
                  className="
                    h-10 w-full rounded-xl
                    border border-[#e2e8f0]
                    bg-[#f8fafc]
                    pl-9 pr-9
                    text-xs
                    text-[#0f172a]
                    outline-none
                    transition-all
                    placeholder:text-[#94a3b8]
                    focus:border-[#1769ff]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-blue-50
                  "
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="
                      absolute right-2 top-1/2
                      flex h-6 w-6
                      -translate-y-1/2
                      items-center justify-center
                      rounded-lg
                      text-[#94a3b8]
                      transition
                      hover:bg-slate-100
                      hover:text-slate-700
                    "
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* SUBCATEGORIES */}
            {openCategory &&
              (() => {
                const selected = categories.find(
                  (cat) => cat.keyword === openCategory
                );

                if (!selected?.subcategories?.length)
                  return null;

                return (
                  <div className="border-t border-[#eef2f7] px-4 py-2.5">
                    <div className="hide-scrollbar flex gap-2 overflow-x-auto">

                      <span className="mr-1 self-center text-[10px] font-semibold uppercase text-[#94a3b8]">
                        Subcategories
                      </span>

                      {selected.subcategories.map((sub) => {
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
            CONTENT
        ===================================================== */}
        <main
          className="
            mx-auto w-full max-w-[1800px]
            px-3 pb-24 pt-16
            sm:px-4
            md:px-5 md:pt-4
            lg:px-6
          "
        >

          {/* MOBILE INFO */}
          <div className="mb-3 flex items-center justify-between md:hidden">
            {/* <span className="text-[10px] text-[#94a3b8]">
              {sortedProducts.length} products
            </span> */}

            {search && (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-[#1769ff]">
                {sortedProducts.length} found
              </span>
            )}
          </div>

          {/* ===================================================
              FILTER BAR
          =================================================== */}
          <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">

            <FilterButton
              value="all"
              label="All"
            />

            <FilterButton
              value="in"
              label="In Stock"
              icon={<CheckCircle2 size={12} />}
            />

            <FilterButton
              value="out"
              label="Out of Stock"
              icon={<XCircle size={12} />}
            />

            {/* SORT */}
            <div className="relative ml-auto shrink-0">

              <ArrowDownUp
                size={13}
                className="
                  pointer-events-none
                  absolute left-3 top-1/2
                  -translate-y-1/2
                  text-[#64748b]
                "
              />

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                className="
                  h-9
                  appearance-none
                  rounded-full
                  border border-[#e7edf5]
                  bg-white
                  pl-8 pr-8
                  text-[11px]
                  font-semibold
                  text-[#475569]
                  shadow-sm
                  outline-none
                  transition-all duration-200
                  hover:border-[#dbe5f3]
                  focus:border-[#b9d1ff]
                  focus:ring-4
                  focus:ring-blue-50
                "
              >
                <option value="price-low">
                  Price: Low
                </option>

                <option value="price-high">
                  Price: High
                </option>

                <option value="name-az">
                  Name: A-Z
                </option>

                <option value="name-za">
                  Name: Z-A
                </option>
              </select>

              <ChevronDown
                size={13}
                className="
                  pointer-events-none
                  absolute right-3 top-1/2
                  -translate-y-1/2
                  text-[#64748b]
                "
              />

            </div>
          </div>

          {/* ===================================================
              LOADING
          =================================================== */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">

              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="
                    overflow-hidden
                    rounded-2xl
                    border border-[#e7edf5]
                    bg-white
                  "
                >
                  <div className="aspect-square animate-pulse bg-slate-100" />

                  <div className="space-y-2 p-3">
                    <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />

                    <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />

                    <div className="h-8 animate-pulse rounded-xl bg-slate-100" />
                  </div>
                </div>
              ))}

            </div>
          ) : visibleProducts.length === 0 ? (

            /* =================================================
               EMPTY
            ================================================== */
            <div className="rounded-2xl border border-[#e7edf5] bg-white px-5 py-14 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Search size={24} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-[#0f172a]">
                No matching products
              </h3>

              <p className="mt-1 text-xs text-[#94a3b8]">
                {search
                  ? `No products found for "${search}".`
                  : "No products found with this filter."}
              </p>

              {(search || stockFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStockFilter("all");
                  }}
                  className="
                    mt-4 rounded-xl
                    bg-[#1769ff]
                    px-4 py-2
                    text-xs font-semibold
                    text-white
                    transition
                    hover:bg-blue-700
                    active:scale-[0.98]
                  "
                >
                  Clear Filters
                </button>
              )}

            </div>
          ) : (

            <>
              {/* =================================================
                  PRODUCTS
              ================================================== */}
              <div className="grid grid-cols-2 items-stretch gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">

                {visibleProducts.map((prod, index) => {
                  const prodId =
                    prod.id ?? prod.product_id;

                  return (
                    <div
                      key={prodId}
                      className="h-full"
                      style={{
                        animation:
                          "cardIn .35s ease-out both",
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
                  <div className="
                    rounded-full
                    border border-[#e7edf5]
                    bg-white
                    px-4 py-2
                    text-[11px]
                    text-[#64748b]
                    shadow-sm
                  ">
                    Loading more products...
                  </div>
                </div>
              )}

              {/* =================================================
                  END
              ================================================== */}
              {!hasMore && (
                <div className="py-6 text-center">
                  <span className="text-[10px] text-[#94a3b8]">
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