import { useEffect, useState, useRef, useCallback } from "react";
import { fetchFilteredProducts } from "../auth/useProducts";
import { fetchSchemes } from "../auth/useSchemes";
import {
  FaPlus,
  FaShoppingCart,
  FaGift,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import debounce from "lodash.debounce";

export default function ProductPage() {
  const [searchTerm, setSearchTerm] = useState("");
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
  const observer = useRef();

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

  const debouncedSearch = debounce(async (term, page = 1) => {
    if (term.trim().length < 1) {
      setFilteredProducts([]);
      return;
    }

    try {
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
    }
  }, 400);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setPage(1);
    debouncedSearch(term, 1);
  };

  // 👇 Infinite Scroll Observer
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

  return (
    <div className="p-3 sm:p-6 max-w-5xl mx-auto pb-24 sm:pb-8">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center text-gray-700 flex items-center justify-center gap-2">
        <FaShoppingCart className="text-blue-600" />
        Product Order
      </h2>

      {/* 🔍 Search Input */}
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search by product name or category..."
        className="w-full mb-4 px-4 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
      />

      {filteredProducts.length > 0 && (
        <div className="space-y-1">
          {filteredProducts.map((p, index) => {
            const isLast = index === filteredProducts.length - 1;
            return (
              <div
                key={`${p.id}-${p.product_id}-${p.sale_name}`}
                ref={isLast ? lastProductRef : null}
                className="flex items-center justify-between px-3 py-2 bg-white rounded-md hover:bg-gray-50 transition-all border border-gray-200"
              >
                {/* Product Info */}
                <div className="flex-grow flex flex-col gap-1 text-xs sm:text-sm text-gray-700">
                  <div className="flex items-center gap-2 font-medium text-gray-800 truncate">
                    {p.sale_name}
                    {hasScheme(p.product_id) && (
                      <FaGift
                        title="Scheme Available"
                        className="text-pink-500 text-xs animate-pulse"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-gray-500 text-[11px] sm:text-xs">
                    <span className="truncate text-gray-400 font-medium">{p.category}</span>
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

                {/* Add Button */}
                <button
                  onClick={() => addProduct(p)}
                  className="ml-3 text-blue-600 hover:text-blue-800 p-1"
                  title="Add to cart"
                >
                  <FaPlus className="text-sm" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 🛒 Floating Cart */}
      <NavLink
        to="/cart"
        className="fixed bottom-5 right-5 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
        title="Go to Cart"
      >
        <FaShoppingCart />
        {selectedProducts.length > 0 && (
          <span className="ml-1 text-xs bg-red-500 rounded-full px-2 py-0.5 text-white absolute -top-2 -right-2">
            {selectedProducts.length}
          </span>
        )}
      </NavLink>
    </div>
  );
}
