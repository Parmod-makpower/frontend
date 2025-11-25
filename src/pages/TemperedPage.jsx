

// 📁 src/pages/TemperedPage.jsx
import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSchemes } from "../hooks/useSchemes";
import useFuseSearch from "../hooks/useFuseSearch";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useAuth } from "../context/AuthContext";
import { FaPlus, FaGift, FaCheck } from "react-icons/fa";
import { Search as SearchIcon } from "lucide-react";

export default function TemperedPage() {
  const { user } = useAuth();
  const { categoryKeyword } = useParams();
  const navigate = useNavigate();
  const searchRef = useRef();

  const { data: allProductsRaw = [], isLoading } = useCachedProducts();
  const { data: schemes = [] } = useSchemes();
  const { selectedProducts, addProduct, updateQuantity, updateCartoon, cartoonSelection } = useSelectedProducts();


  const [search, setSearch] = useState("");
  // Track showAll state per product
  const [showAllMap, setShowAllMap] = useState({}); // { [productId]: true/false }

  // Normalize products
  const allProducts = useMemo(
    () => allProductsRaw.map((p) => ({ ...p, id: p.id ?? p.product_id })),
    [allProductsRaw]
  );

  const filteredByCategory = allProducts.filter((product) =>
    product.sub_category?.toLowerCase().includes(categoryKeyword.toLowerCase())
  );

  const filteredProducts = useFuseSearch(filteredByCategory, search, {
    keys: ["product_name", "sub_category", "sale_names"],
    threshold: 0.3,
  });

  const productsToShow = search ? filteredProducts : filteredByCategory;

  useEffect(() => {
    setSearch("");
    searchRef.current?.focus();
  }, [categoryKeyword]);

  const hasScheme = (productId) =>
    schemes.some(
      (scheme) =>
        Array.isArray(scheme.conditions) &&
        scheme.conditions.some((cond) => cond.product === productId)
    );

  const isAdded = (id) => selectedProducts.some((p) => p.id === id);

  const handleAddProduct = (product) => {
    if (!selectedProducts.some((p) => p.id === product.id)) {
      const moq = product.moq || 1;
      const initialQty = product.cartoon_size && product.cartoon_size > 1
        ? product.cartoon_size
        : moq;
      addProduct({ ...product, quantity: initialQty });
    }
  };


  const toggleShowAll = (productId) => {
    setShowAllMap((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-white">
      {/* 🔍 Fixed Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white p-3 border-b border-gray-300 shadow flex items-center gap-2">
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${categoryKeyword} only...`}
          className="flex-1 pl-10 pr-4 py-2 border rounded-full shadow-sm focus:outline-none  text-sm md:text-base"
        />
        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      </div>

      {/* Products Section */}
      <main className="flex-1 pt-[70px] sm:pt-24 overflow-y-auto px-2 sm:px-4 pb-30">
        {isLoading ? (
          <p className="text-center py-8">Loading...</p>
        ) : productsToShow.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No matching products found.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {productsToShow.map((prod) => {
              const prodId = prod.id;
              const saleArray = Array.isArray(prod.sale_names)
                ? prod.sale_names
                : prod.sale_names?.split?.(",") || [];
              const showAll = showAllMap[prodId] || false;
              const displayArray = showAll ? saleArray : saleArray.slice(0, 10);

              return (
                <div
                  key={prodId}
                  className="flex items-center justify-between px-3 py-2 border-b border-gray-300 hover:bg-gray-100 transition-all rounded-md"
                >
                  <div
                    className="flex flex-col flex-grow gap-1 cursor-pointer"
                  // onClick={() => navigate(`/product/${prodId}`)}
                  >
                    <div className="flex items-center gap-2 font-medium truncate text-gray-800">
                      {prod.product_name}
                      {prod.virtual_stock > (prod.moq ?? 0) ? (
                        <span className="bg-blue-100 text-blue-600 text-[10px] px-1 py-[1px] rounded">
                          In Stock
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-600 text-[10px] px-1 py-[1px] rounded">
                          Out of Stock
                        </span>
                      )}
                      {hasScheme(prodId) && (
                        <FaGift title="Scheme Available" className="text-pink-500 text-xs animate-pulse" />
                      )}
                    </div>

                    <div className="flex justify-between gap-4 text-gray-500 text-[11px] sm:text-xs">
                      <span className="truncate font-medium">Category: {prod.sub_category}</span>

                      {(user?.role === "SS" || user?.role === "DS") && (
                        <div className="ml-3 flex items-center">
                          {selectedProducts.some((p) => p.id === prodId) ? (
                            <>
                              {selectedProducts.find((p) => p.id === prodId)?.quantity_type == "CARTOON" ? (
                                <select
                                  value={cartoonSelection[prodId] || 1}
                                  onChange={(e) => updateCartoon(prodId, parseInt(e.target.value))}
                                  className="border rounded py-1 px-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                                >
                                  {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => (
                                    <option key={n} value={n}>
                                      {n} CTN
                                    </option>
                                  ))}

                                </select>
                              ) : (
                                <input
                                  type="number"
                                  min={1}
                                  value={selectedProducts.find((p) => p.id === prodId)?.quantity || ""}
                                  onChange={(e) => updateQuantity(prodId, parseInt(e.target.value))}
                                  className="w-20 border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                                />
                              )}
                            </>
                          ) : (
                            <button
                              onClick={() => handleAddProduct(prod)}
                              className="ml-3 px-4 text-blue-600 transition-transform duration-150 hover:scale-110"
                            >
                              <FaPlus className="text-sm" />
                            </button>
                          )}
                        </div>
                      )}


                    </div>


                    {/* Sale Names with Show More/Less */}
                    {saleArray.length > 0 && (
                      <div className="flex flex-col text-gray-600 text-[11px] sm:text-xs mt-1">
                        <span className="font-medium">Used in:</span>
                        <ul className="list-disc list-inside ml-3">
                          {displayArray
                            .slice()
                            .sort((a, b) => {
                              // ✅ bring matching sale name on top
                              const searchLower = search.toLowerCase();
                              const aMatch = a.toLowerCase().includes(searchLower) ? -1 : 1;
                              const bMatch = b.toLowerCase().includes(searchLower) ? -1 : 1;
                              return aMatch - bMatch;
                            })
                            .map((name, index) => {
                              const idx = name.toLowerCase().indexOf(search.toLowerCase());
                              if (idx !== -1 && search.trim() !== "") {
                                // ✅ Highlight matched part
                                const before = name.slice(0, idx);
                                const match = name.slice(idx, idx + search.length);
                                const after = name.slice(idx + search.length);
                                return (
                                  <li key={index} className="truncate">
                                    {before}
                                    <span className="bg-yellow-200">{match}</span>
                                    {after}
                                  </li>
                                );
                              }
                              return <li key={index} className="truncate">{name.trim()}</li>;
                            })}
                          {saleArray.length > 10 && (
                            <li
                              className="text-blue-600 cursor-pointer hover:underline"
                              onClick={() => toggleShowAll(prodId)}
                            >
                              {showAll ? "Show Less" : `Show More (${saleArray.length - 10} more)`}
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                  </div>



                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
