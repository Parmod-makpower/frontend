// 📁 src/pages/SearchBarPage.jsx
import { useEffect, useState, useRef, useMemo } from "react";
import { IoChevronBack } from "react-icons/io5";
import { FaPlus, FaGift, FaCheck } from "react-icons/fa";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSchemes } from "../hooks/useSchemes";
import { FixedSizeList as List } from "react-window";
import useFuseSearch from "../hooks/useFuseSearch";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Loader() {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="w-6 h-6 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
    </div>
  );
}

const normalizeProduct = (product) => ({
  ...product,
  id: product.id ?? product.product_id,
});

export default function SearchBarPage() {
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState(() => {
    const saved = localStorage.getItem("selectedProducts");
    return saved ? JSON.parse(saved) : [];
  });

  const searchRef = useRef();
  const navigate = useNavigate();
  const { data: allProductsRaw = [], isLoading } = useCachedProducts();
  const { data: schemes = [] } = useSchemes();

  // localStorage में cart save करना
  useEffect(() => {
    localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
  }, [selectedProducts]);

  // auto focus on search
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const allProducts = useMemo(
    () => allProductsRaw.map(normalizeProduct),
    [allProductsRaw]
  );

  // 🔍 Debounced Fuse search
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


  const hasScheme = (productId) =>
    schemes.some(
      (scheme) =>
        Array.isArray(scheme.conditions) &&
        scheme.conditions.some((cond) => cond.product === productId)
    );

  const isAdded = (id) => selectedProducts.some((p) => p.id === id);

  const addProduct = (product) => {
    if (!selectedProducts.some((p) => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  const Row = ({ index, style }) => {
    const p = normalizeProduct(searchResults[index]);

    return (
      <div
        key={`${p.id}-${p._displayName}`}
        style={style}
        className="flex items-center justify-between px-3 py-2 border-b border-gray-300 hover:bg-gray-100 transition-all"
      >
        <div
          onClick={() => {
            if (p?.id) {
              navigate(`/product/${p.id}`);
            } else {
              console.error("Product ID missing in clicked item", p);
            }
          }}
          className="flex-grow flex flex-col gap-1 text-xs sm:text-sm text-gray-700 cursor-pointer"
        >
          <div className="flex items-center gap-2 font-medium truncate text-gray-800">
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
          </div>

          <div className="flex items-center gap-4 text-gray-500 text-[11px] sm:text-xs">
            <span className="truncate text-gray-400 font-medium">
              Product: {p.product_name}
            </span>
            <span className="truncate text-gray-400 font-medium">
              {p.sub_category}
            </span>
          </div>
        </div>

        {user?.role === "SS" && (
          <button
            onClick={() => addProduct(p)}
            disabled={p.virtual_stock <= p.moq} // 🔹 disable if out of stock
            className={`ml-3 py-2 px-4 transition-transform duration-150 ${p.virtual_stock <= p.moq
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:text-blue-800 hover:scale-110"
              }`}
            title={p.virtual_stock <= p.moq ? "Out of Stock" : "Add to cart"}
          >
            {isAdded(p.id) ? (
              <FaCheck className="text-green-600 text-sm" />
            ) : (
              <FaPlus className="text-sm" />
            )}
          </button>

        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* 🔍 Fixed Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white p-3 border-b border-gray-300 shadow sm:static sm:mx-4 sm:rounded-md sm:shadow-md sm:border sm:border-gray-200 transition-all duration-200 ease-in-out flex items-center gap-2">
        <button
          onClick={() => window.history.back()}
          className="text-gray-700 hover:text-blue-600 text-2xl sm:text-xl font-bold px-1 transition-transform hover:scale-105"
          aria-label="Back"
        >
          <IoChevronBack />
        </button>
        <input
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          maxLength={20}
          placeholder="Search by product or category..."
          className="flex-1 bg-transparent text-sm sm:text-base focus:outline-none placeholder-gray-400"
        />
      </div>

      {/* 🔍 Scrollable Results */}
      <div className="flex-1 pt-[60px] sm:pt-4 overflow-y-auto px-1 sm:px-2">
        {isLoading ? (
          <Loader />
        ) : searchTerm.trim().length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            Search to see results
          </p>
        ) : searchResults.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No matching products found.
          </p>
        ) : (
          <List
            height={window.innerHeight - 100}
            itemCount={searchResults.length}
            itemSize={80}
            width={"100%"}
          >
            {Row}
          </List>
        )}
      </div>
    </div>
  );
}
