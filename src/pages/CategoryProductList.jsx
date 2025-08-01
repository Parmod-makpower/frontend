// src/pages/CategoryProductList.jsx
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { fetchFilteredProducts } from "../auth/useProducts";
import { fetchSchemes } from "../auth/useSchemes";
import { FaPlus, FaGift, FaCheckCircle, FaTimesCircle, FaCheck } from "react-icons/fa";
import { IoChevronBack } from "react-icons/io5";
import debounce from "lodash.debounce";

export default function CategoryProductList() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [addedProductIds, setAddedProductIds] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ loading state added

  const observer = useRef();

  const lastProductRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadProducts(category, page + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore, category, page]
  );

  useEffect(() => {
    setProducts([]);
    setPage(1);
    loadProducts(category, 1);
  }, [category]);

  useEffect(() => {
    fetchSchemes()
      .then((data) => setSchemes(data.filter((s) => s.is_active)))
      .catch(console.error);
  }, []);

  const loadProducts = debounce(async (term, currentPage) => {
    try {
      setLoading(true); // ✅ show spinner
      const res = await fetchFilteredProducts(term, currentPage);
      if (currentPage === 1) {
        setProducts(res.results);
      } else {
        setProducts((prev) => [...prev, ...res.results]);
      }
      setPage(currentPage);
      setHasMore(!!res.next);
    } catch (err) {
      console.error("Error loading category products:", err);
    } finally {
      setLoading(false); // ✅ hide spinner
    }
  }, 300);

  const addProduct = (productId) => {
    const selected = products.find((p) => p.id === productId);
    const saved = JSON.parse(localStorage.getItem("selectedProducts") || "[]");
    const updated = [...saved, { ...selected, quantity: 1 }];
    localStorage.setItem("selectedProducts", JSON.stringify(updated));
    setAddedProductIds((prev) => [...prev, productId]);
  };

  const hasScheme = (productId) =>
    schemes.some(
      (s) =>
        Array.isArray(s.conditions) &&
        s.conditions.some((c) => c.product_id === productId)
    );

  return (
    <div className="">
      {/* 🔙 Top Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white p-3 border-b border-gray-300 shadow-[0_2px_2px_-2px_rgba(0,0,0,0.2)] sm:static sm:mx-4 sm:rounded-md sm:shadow-md sm:border sm:border-gray-200 transition-all duration-200 ease-in-out">
  <div className="flex items-center gap-2">
    <button
      onClick={() => window.history.back()}
      className="text-gray-700 hover:text-blue-600 text-xl sm:text-xl font-bold px-1  transition-transform hover:scale-105"
      aria-label="Back"
    >
     <IoChevronBack  />
    </button>
    <span className="text-lg sm:text-xl font-semibold text-gray-800">{category}</span>
  </div>
</div>

      {/* 📦 Product List */}
      <div className="pt-[60px] sm:pt-0 space-y-2 px-1">
        {products.map((p, index) => {
          const isLast = index === products.length - 1;
          const isAdded = addedProductIds.includes(p.id);
          return (
            <div
              key={p.id}
              ref={isLast ? lastProductRef : null}
              className="flex items-center justify-between px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all text-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-grow gap-1 sm:gap-4 text-gray-800 w-full">
                <div className="truncate font-medium flex items-center gap-1">
                  {p.sale_name}
                  {hasScheme(p.product_id) && (
                    <FaGift
                      title="Scheme Available"
                      className="text-pink-500 text-xs animate-pulse"
                    />
                  )}
                </div>

                <div className="flex gap-4 text-gray-500 text-[11px] sm:text-xs">
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
                onClick={() => addProduct(p.id)}
                disabled={isAdded}
                className="ml-2 text-blue-600 hover:text-blue-800 p-1 pe-2 rounded-full transition-all duration-200 active:scale-95"
                title={isAdded ? "Added" : "Add to cart"}
              >
                {isAdded ? (
                  <FaCheck className="text-green-500 animate-scaleIn" />
                ) : (
                  <FaPlus className="text-sm" />
                )}
              </button>
            </div>
          );
        })}

        {/* 🌀 Spinner when loading */}
        {loading && (
          <div className="flex justify-center items-center py-6">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
}
