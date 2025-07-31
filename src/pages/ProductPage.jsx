import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchFilteredProducts } from "../auth/useProducts";
import { fetchSchemes } from "../auth/useSchemes";
import { IoChevronBack } from "react-icons/io5";
import {
  FaPlus,
  FaShoppingCart,
  FaGift,
  FaCheckCircle,
  FaTimesCircle,
  FaCheck,
} from "react-icons/fa";
import debounce from "lodash.debounce";

// ✅ Loader Component
function Loader() {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="w-6 h-6 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
    </div>
  );
}

export default function ProductPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(() => {
    const saved = localStorage.getItem("selectedProducts");
    return saved ? JSON.parse(saved) : [];
  });

  const [schemes, setSchemes] = useState(() => {
    const saved = localStorage.getItem("activeSchemes");
    return saved ? JSON.parse(saved) : [];
  });

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false); // ✅ loader state
  const observer = useRef();
  const searchRef = useRef();

  useEffect(() => {
    localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
  }, [selectedProducts]);

  useEffect(() => {
    const loadSchemes = async () => {
      try {
        const data = await fetchSchemes();
        const active = data.filter((s) => s.is_active);
        setSchemes(active);
        localStorage.setItem("activeSchemes", JSON.stringify(active));
      } catch (error) {
        console.error("Failed to fetch schemes", error);
      }
    };
    loadSchemes();
  }, []);

  useEffect(() => {
    if (initialSearch.trim()) {
      debouncedSearch(initialSearch.trim(), 1);
    }
    searchRef.current?.focus();
  }, [initialSearch]);

  const debouncedSearch = debounce(async (term, page = 1) => {
    if (term.trim().length < 1) {
      setFilteredProducts([]);
      return;
    }
    try {
      setLoading(true); // ✅ start loading
      const data = await fetchFilteredProducts(term.trim(), page, 10);
      if (page === 1) {
        setFilteredProducts(data.results);
      } else {
        setFilteredProducts((prev) => [...prev, ...data.results]);
      }
      setHasMore(!!data.next);
      setPage(page);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false); // ✅ stop loading
    }
  }, 400);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setPage(1);
    debouncedSearch(term, 1);
  };

  const lastProductRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          debouncedSearch(searchTerm, page + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore, searchTerm, page]
  );

  const addProduct = (product) => {
    if (!selectedProducts.some((p) => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  const hasScheme = (productId) => {
    return schemes.some(
      (scheme) =>
        Array.isArray(scheme.conditions) &&
        scheme.conditions.some((cond) => cond.product_id === productId)
    );
  };

  const isAdded = (id) => {
    return selectedProducts.some((p) => p.id === id);
  };

  return (
    <div className="sm:p-6 max-w-5xl mx-auto pb-24 sm:pb-8">
      {/* Search bar */}
      <div className="flex items-center gap-2 mb-4 px-3 py-2 border-b border-gray-300 shadow-[0_2px_2px_-2px_rgba(0,0,0,0.2)] bg-white sm:mx-4 sm:rounded-md sm:shadow-md sm:border sm:border-gray-200 transition-all duration-200 ease-in-out">
        <button
          onClick={() => window.history.back()}
          className="text-gray-700 hover:text-blue-600 text-2xl sm:text-xl font-bold px-1 transition-transform hover:scale-105"
          aria-label="Back"
        >
          <IoChevronBack  />
        </button>
        <input
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search by product or category..."
          className="flex-1 bg-transparent text-sm sm:text-base focus:outline-none placeholder-gray-400"
        />
      </div>

      {/* ✅ Loader shown while loading */}
      {loading && <Loader />}

      {filteredProducts.length > 0 && (
        <div className="space-y-1">
          {filteredProducts.map((p, index) => {
            const isLast = index === filteredProducts.length - 1;
            return (
              <div
                key={`${p.id}-${p.product_id}-${p.sale_name}`}
                ref={isLast ? lastProductRef : null}
                className="flex items-center justify-between px-3 py-2 border-b border-gray-300 hover:bg-gray-100 transition-all"
              >
                <div className="flex-grow flex flex-col gap-1 text-xs sm:text-sm text-gray-700">
                  <div className="flex items-center gap-2 font-medium truncate text-gray-800">
                    {p.sale_name}
                    {hasScheme(p.product_id) && (
                      <FaGift
                        title="Scheme Available"
                        className="text-pink-500 text-xs animate-pulse"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-gray-500 text-[11px] sm:text-xs">
                    <span className="truncate text-gray-400 font-medium">
                      {p.category}
                    </span>
                    <span className="flex items-center gap-1">
                      {p.live_stock > 0 ? (
                        <>
                          <FaCheckCircle className="text-green-500 text-[10px]" />
                          <span className="text-green-600">In Stock</span>
                        </>
                      ) : (
                        <>
                          <FaTimesCircle className="text-red-500 text-[10px]" />
                          <span className="text-red-600">Out of Stock</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => addProduct(p)}
                  className="ml-3 text-blue-600 hover:text-blue-800 pe-3 transition-transform duration-150 hover:scale-110"
                  title="Add to cart"
                >
                  {isAdded(p.id) ? (
                    <FaCheck className="text-green-600 text-sm" />
                  ) : (
                    <FaPlus className="text-sm" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
