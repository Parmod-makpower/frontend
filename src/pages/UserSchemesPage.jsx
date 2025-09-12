// 📁 src/pages/UserSchemesPage.jsx
import { useSchemes } from "../hooks/useSchemes";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  FaShoppingCart,
  FaCheckCircle,
  FaTimesCircle,
  FaPlus,
  FaMinus,
  FaGift,
} from "react-icons/fa";
import makpower_image from "../assets/images/makpower_image.webp"
import MobilePageHeader from "../components/MobilePageHeader";

export default function UserSchemesPage() {
  const { data: schemes = [], isLoading } = useSchemes();
  const { data: allProducts = [] } = useCachedProducts();
  const { selectedProducts, addProduct, updateQuantity } = useSelectedProducts();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (isLoading) return <div className="p-4">Loading schemes...</div>;

  const getProduct = (id) => allProducts.find((p) => p.product_id === id);

  return (
    <div className="p-2 pb-20">
      <MobilePageHeader title="Available Schemes" />

      <div className="pt-[60px] sm:pt-0">
        {schemes.length === 0 ? (
          <p className="text-gray-500 text-center">No schemes available.</p>
        ) : (
          <div className="grid gap-2 sm:gap-6 grid-cols-2 lg:grid-cols-5">
            {schemes.map((scheme) => (
              <div
                key={scheme.id}
                className="borde shadow rounded transition border bg-white p-0 flex flex-col"
              >


                {/* Conditions */}
                <div className="mt-2 ">

                  <div className="grid gap-2 ">
                    {scheme.conditions.map((c) => {
                      const prod = getProduct(c.product);
                      const prodId = prod?.id ?? prod?.product_id;
                      const isInCart = selectedProducts.some((p) => p.id === prodId);
                      const existing = selectedProducts.find((p) => p.id === prodId);
                      const quantity = existing?.quantity || 1;

                      const handleAddToCart = () => {
                        addProduct({ ...prod, id: prodId }, 1);
                      };
                      const handleDecrease = () => {
                        updateQuantity(prodId, Math.max(1, quantity - 1));
                      };
                      const handleIncrease = () => {
                        updateQuantity(prodId, quantity + 1);
                      };
                      const handleManualInput = (e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        updateQuantity(prodId, val);
                      };

                      return (
                        <div
                          key={c.id}
                          onClick={() => navigate(`/product/${c.product}`)}
                          className="bg-gray-100 rounded overflow-hidden flex flex-col group cursor-pointer transition"
                        >
                          {/* Product Image */}
                          <div className="relative w-full bg-white  overflow-hidden">
                            <img
                              src={
                                prod?.image
                                  ? `https://res.cloudinary.com/djyr368zj/${prod.image}`
                                  : makpower_image
                              }
                              alt={prod?.product_name || "Product"}
                              className="w-full object-cover transform group-hover:scale-105 transition duration-300"
                            />
                            <span className="absolute top-2 left-2 bg-black/70 text-white px-2 py-0.5 rounded text-[10px] font-semibold shadow">
                              Buy {c.min_quantity}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex flex-col p-2 px-3 flex-1 ">
                            <h3 className="text-xs font-bold truncate">
                              {prod?.product_name || `Product #${c.product}`}
                            </h3>

                            <div className="flex items-center gap-1 mt-1">
                              {prod?.live_stock > 1 ? (
                                <span className="flex items-center gap-1 text-[#16a34a] text-[10px] font-semibold">
                                  <FaCheckCircle /> In Stock
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[#dc2626] text-[10px] font-semibold">
                                  <FaTimesCircle /> Out
                                </span>
                              )}
                            </div>

                            <p className="text-[#2563eb] font-semibold text-xs mt-1">
                              ₹{prod?.price || 0}
                            </p>

                            {/* Cart */}
                            {user?.role === "SS" && (
                              <div className="mt-auto">
                                {isInCart ? (
                                  <div className="flex items-center justify-center gap-1 mt-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDecrease();
                                      }}
                                      className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 text-[10px]"
                                    >
                                      <FaMinus />
                                    </button>
                                    <input
                                      type="number"
                                      value={quantity}
                                      onChange={handleManualInput}
                                      className="w-8 text-center border rounded-md text-[10px] py-0.5"
                                      min={1}
                                    />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleIncrease();
                                      }}
                                      className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 text-[10px]"
                                    >
                                      <FaPlus />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddToCart();
                                    }}
                                    className="w-full mt-2 flex items-center justify-center gap-2 
                                    bg-gradient-to-r from-orange-500 via-red-500 to-pink-600
                                    hover:from-pink-600 hover:via-red-500 hover:to-orange-500
                                    text-white text-[11px] md:text-sm font-semibold 
                                    py-1 md:py-2 rounded-xl shadow-lg 
                                    transition-all duration-500 ease-in-out 
                                    transform hover:scale-105 hover:shadow-2xl cursor-pointer"
                                  >
                                    <FaShoppingCart /> Add
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rewards */}
                <div className="mt-0 ">

                  <div className="grid gap-3">
                    {scheme.rewards.map((r) => {
                      const prod = getProduct(r.product);
                      return (
                        <div
                          key={r.id}
                          className="flex items-center gap-2 bg-green-50 rounded p-2"
                        >
                          
                            <FaGift className="text-pink-500"/>
                          
                          <span className="text-xs">
                            Get <b>{r.quantity}</b> of{" "}
                            {prod?.product_name || `Product #${r.product}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
