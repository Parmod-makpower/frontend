import { useState, useEffect, useRef, useCallback } from "react";
import { fetchFilteredProducts } from "../auth/useProducts";
import { fetchSchemes } from "../auth/useSchemes";
import {
  FaChargingStation,
  FaHeadphones,
  FaMobileAlt,
  FaMusic,
  FaBatteryThreeQuarters,
  FaBluetooth,
  FaUsb,
  FaAssistiveListeningSystems,
  FaMobile,
  FaGripHorizontal,
  FaPlus,
  FaCheckCircle,
  FaTimesCircle,
  FaGift,
} from "react-icons/fa";

import debounce from "lodash.debounce";

// 🔘 Extended Category List
const categories = [
  { label: "Charger", icon: <FaChargingStation />, keyword: "charger" },
  { label: "Earbuds", icon: <FaHeadphones />, keyword: "earbuds" },
  { label: "Tempered", icon: <FaMobileAlt />, keyword: "tempered" },
  { label: "Speaker", icon: <FaMusic />, keyword: "speaker" },
  { label: "Battery", icon: <FaBatteryThreeQuarters />, keyword: "battery" },
  { label: "Bluetooth", icon: <FaBluetooth />, keyword: "bluetooth" },
  { label: "Pendrive", icon: <FaUsb />, keyword: "pendrive" },
  { label: "Handsfree", icon: <FaAssistiveListeningSystems />, keyword: "handsfree" },
  { label: "Mobile Holder", icon: <FaMobile />, keyword: "mobile holder" },
  { label: "Data Cable", icon: <FaGripHorizontal />, keyword: "data cable" },
];

export default function CategoryPage() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState(() => {
    const saved = localStorage.getItem("selectedProducts");
    return saved ? JSON.parse(saved) : [];
  });

  const observer = useRef();

  // ✅ Infinite Scroll
  const lastProductRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadProducts(selectedCategory, page + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore, selectedCategory, page]
  );

  useEffect(() => {
    localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
  }, [selectedProducts]);

  useEffect(() => {
    if (selectedCategory) {
      setProducts([]);
      setPage(1);
      loadProducts(selectedCategory, 1);
    }
  }, [selectedCategory]);

  useEffect(() => {
    const loadSchemes = async () => {
      try {
        const data = await fetchSchemes();
        const active = data.filter((s) => s.is_active);
        setSchemes(active);
      } catch (error) {
        console.error("Failed to fetch schemes:", error);
      }
    };
    loadSchemes();
  }, []);

  const loadProducts = debounce(async (searchTerm, currentPage) => {
    try {
      const res = await fetchFilteredProducts(searchTerm, currentPage);
      if (currentPage === 1) {
        setProducts(res.results);
      } else {
        setProducts((prev) => [...prev, ...res.results]);
      }
      setPage(currentPage);
      setHasMore(!!res.next);
    } catch (err) {
      console.error("Error loading category products:", err);
    }
  }, 300);

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
    <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center text-blue-700">
        📦 Browse by Category
      </h2>

      {/* 🔘 Category Buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-4 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setSelectedCategory(cat.keyword)}
            className={`flex flex-col items-center justify-center px-2 py-3 rounded-lg shadow-sm text-xs font-medium transition ${
              selectedCategory === cat.keyword
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <div className="text-lg sm:text-xl">{cat.icon}</div>
            <span className="mt-1 text-center">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* 🧾 Product List */}
      {products.length > 0 && (
        <div className="space-y-1">
          {products.map((p, index) => {
            const isLast = index === products.length - 1;
            return (
              <div
                key={`${p.id}-${p.product_id}`}
                ref={isLast ? lastProductRef : null}
                className="flex items-center justify-between px-3 py-2 bg-white rounded-md hover:bg-gray-50 transition border border-gray-100 text-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 flex-grow text-gray-700 truncate">
                  <div className="truncate font-medium text-gray-800 flex items-center gap-1">
                    {p.sale_name}
                    {hasScheme(p.product_id) && (
                      <FaGift
                        title="Scheme Available"
                        className="text-pink-500 text-xs animate-pulse"
                      />
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{p.category}</div>
                  <div className="flex items-center gap-1 text-xs">
                    {p.live_stock > 0 ? (
                      <FaCheckCircle className="text-green-500" title="In Stock" />
                    ) : (
                      <FaTimesCircle className="text-red-500" title="Out of Stock" />
                    )}
                  </div>
                </div>

                <button
                  onClick={() => addProduct(p)}
                  className="ml-2 text-blue-600 hover:text-blue-800 p-1"
                  title="Add to cart"
                >
                  <FaPlus className="text-sm" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
