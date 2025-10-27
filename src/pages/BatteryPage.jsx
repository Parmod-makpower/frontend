// 📁 src/pages/BatteryPage.jsx
import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSchemes } from "../hooks/useSchemes";
import useFuseSearch from "../hooks/useFuseSearch";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useAuth } from "../context/AuthContext";
import { FaPlus, FaGift } from "react-icons/fa";
import { IoChevronBack } from "react-icons/io5";
import { Search as SearchIcon } from "lucide-react";

export default function BatteryPage() {
  const { user } = useAuth();
  const { categoryKeyword } = useParams();
  const navigate = useNavigate();
  const searchRef = useRef();

  const { data: allProductsRaw = [], isLoading } = useCachedProducts();
  const { data: schemes = [] } = useSchemes();
  const { selectedProducts, addProduct, updateQuantity, updateCartoon, cartoonSelection } = useSelectedProducts();

  const [search, setSearch] = useState("");
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
    if (!isAdded(product.id)) {
      const moq = product.moq || 1;
      const initialQty = product.cartoon_size && product.cartoon_size > 1
        ? product.cartoon_size
        : moq;
      addProduct({ ...product, quantity: initialQty });
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-white">
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
          onChange={(e) => setSearch(e.target.value)}
          maxLength={20}
          placeholder={`Search ${categoryKeyword} only...`}
          className="flex-1 bg-transparent text-sm sm:text-base focus:outline-none placeholder-gray-400"
        />
      </div>


      {/* Products Section */}
      <main className="flex-1 pt-[60px]  overflow-y-auto px-2  pb-30">
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

              const selectedItem = selectedProducts.find((p) => p.id === prodId);
              const hasCartoon = selectedItem?.cartoon_size && selectedItem.cartoon_size > 1;

              return (
                <div
                  key={prodId}
                  className="flex items-center justify-between px-3 py-2 border-b border-gray-300 hover:bg-gray-100 transition-all rounded-md"
                >
                  {/* 👈 Left Side: Product Info */}
                  <div
                    onClick={() => navigate(`/product/${prodId}`)}
                    className="flex flex-col flex-grow gap-1 cursor-pointer"
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
                        <FaGift
                          title="Scheme Available"
                          className="text-pink-500 text-xs animate-pulse"
                        />
                      )}
                    </div>

                    <p className="text-[11px] sm:text-xs">{prod.sub_category}</p>

                    <p className="text-[12px] sm:text-xs flex items-center font-medium ">
                      {prod.guarantee ? (
                        <span className="text-orange-600 text-[10px] ">
                          Guarantee : {prod.guarantee}
                        </span>
                      ) : null}
                    </p>

                    <p className="text-[12px] sm:text-xs flex items-center gap-2 font-medium ">
                      &#8377;{prod.price}
                    </p>
                  </div>

                  {/* 👉 Right Side: Add/Quantity Control */}
                  {user?.role === "SS" && (
                    <div className="ml-3 flex items-center">
                      {isAdded(prodId) ? (
                        <>
                          {hasCartoon ? (
                            <>
                              <select
                                value={cartoonSelection[selectedItem.id] || 1}
                                onChange={(e) =>
                                  updateCartoon(selectedItem.id, parseInt(e.target.value))
                                }
                                className="border rounded py-1 px-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                              >
                                {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => (
                                  <option key={n} value={n}>
                                    {n} CTN
                                  </option>
                                ))}

                              </select>
                              {/* <input
                                type="number"
                                value={selectedItem.quantity || 0}
                                readOnly
                                className="w-20 border rounded px-2 py-1 text-sm bg-gray-100"
                              /> */}
                            </>
                          ) : (
                            <input
                              type="number"
                              min={1}
                              value={selectedItem.quantity === "" ? "" : selectedItem.quantity}
                              onChange={(e) => {
                                const val = e.target.value;

                                // User को typing allow करो (empty भी)
                                if (val === "") {
                                  updateQuantity(selectedItem.id, "");
                                  selectedItem.showMoqError = true;
                                  return;
                                }

                                const parsed = parseInt(val);
                                if (!isNaN(parsed)) {
                                  updateQuantity(selectedItem.id, parsed); // Just type करने दो
                                  selectedItem.showMoqError = parsed < (selectedItem.moq || 1);
                                }
                              }}
                              onBlur={(e) => {
                                const val = parseInt(e.target.value);
                                const moq = selectedItem.moq || 1;

                                // Blur पर check करो और fix करो
                                if (isNaN(val) || val < moq) {
                                  updateQuantity(selectedItem.id, moq);
                                  selectedItem.showMoqError = false;
                                }
                              }}
                              className={`w-20 border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none ${selectedItem.showMoqError ? "border-red-400" : ""
                                }`}
                            />

                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => handleAddProduct(prod)}
                          className="bg-blue-100 p-3  rounded-full text-blue-600 hover:bg-blue-200 transition-all"
                        >
                          <FaPlus className="text-sm" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
