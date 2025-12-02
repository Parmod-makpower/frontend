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
  FaGift,
} from "react-icons/fa";
import makpower_image from "../assets/images/makpower_image.webp";
import MobilePageHeader from "../components/MobilePageHeader";

export default function UserSchemesPage() {
  const { data: schemes = [], isLoading } = useSchemes();
  const { data: allProducts = [] } = useCachedProducts();
  const { selectedProducts, addProduct } = useSelectedProducts();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (isLoading) return <div className="p-4">Loading schemes...</div>;

  const getProduct = (id) => allProducts.find((p) => p.product_id === id);

  return (
    <div className="p-2 pb-20">
      <MobilePageHeader title="Available Schemes" />

     
      <div className="pt-[60px] sm:pt-0">
         {/* TWS vali Scheme Hatana K liya bs Is block ko remove kr dana  */}
        {/* ⭐ SPECIAL COMBINED SCHEME CARD ⭐ */}
        <div className="mb-4 shadow-lg rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4">
          <h2 className="text-sm font-bold flex items-center gap-2 mb-1">
            <FaGift className="text-lg" /> Special Combined Scheme
          </h2>

          <p className="text-[12px] leading-5">
            TW01 + TW15 + TW16 ka <b>total 150 quantity</b> purchase karne par
            <span className="font-bold"> 1 Suitcase FREE</span> milega.
          </p>

          <p className="text-[11px] mt-2 opacity-90">
            (Sirf in 3 items ke total qty par scheme apply hogi – mixed quantity allowed)
          </p>

          <div className="mt-3 flex gap-2">
            <span className="px-2 py-1 rounded bg-white/20 text-[10px]">TW01</span>
            <span className="px-2 py-1 rounded bg-white/20 text-[10px]">TW15</span>
            <span className="px-2 py-1 rounded bg-white/20 text-[10px]">TW16</span>
          </div>
        </div> {/* TWS vali Scheme Hatana K liya bs Is block ko remove kr dana  */}

        {schemes.length === 0 ? (
          <p className="text-gray-500 text-center">No schemes available.</p>
        ) : (
          <div className="grid gap-2 sm:gap-6 grid-cols-2 lg:grid-cols-5">
            {schemes.map((scheme) => (
              <div
                key={scheme.id}
                className="shadow rounded border bg-white flex flex-col"
              >
                {/* Conditions */}
                <div className="mt-2">
                  <div className="grid gap-2">
                    {scheme.conditions.map((c) => {
                      const prod = getProduct(c.product);
                      if (!prod) return null;

                      const prodId = prod.id ?? prod.product_id;
                      const isInCart = selectedProducts.some((p) => p.id === prodId);
                      const outOfStock = prod.virtual_stock <= prod.moq;

                      const handleAddToCart = (e) => {
                        e.stopPropagation();
                        if (outOfStock || isInCart) return;
                        addProduct({ ...prod, id: prodId }, 1);
                      };

                      return (
                        <div
                          key={c.id}
                          onClick={() => navigate(`/product/${c.product}`)}
                          className="bg-gray-100 rounded overflow-hidden flex flex-col group cursor-pointer transition"
                        >
                          {/* Product Image */}
                          <div className="relative w-full bg-white overflow-hidden">
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
                          <div className="flex flex-col p-2 px-3 flex-1">
                            <h3 className="text-xs font-bold truncate">
                              {prod.product_name}
                            </h3>

                            {/* Stock Status */}
                            <div className="flex items-center gap-1 mt-1">
                              {outOfStock ? (
                                <span className="flex items-center gap-1 text-[#dc2626] text-[10px] font-semibold">
                                  <FaTimesCircle /> Out
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[#16a34a] text-[10px] font-semibold">
                                  <FaCheckCircle /> In Stock
                                </span>
                              )}
                            </div>

                            {/* Price */}
                            <p className="text-[#2563eb] font-semibold text-xs mt-1">
                              ₹{prod.price || 0}
                            </p>

                            {/* Cart Button - ✅ ProductCard style */}
                            {(user?.role === "SS" || user?.role === "DS") && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isInCart) return; // सिर्फ already added check रखें
                                  addProduct({ ...prod, id: prodId }, 1);
                                }}
                                className={`w-full mt-2 flex items-center justify-center gap-2 
                                ${isInCart ? "bg-gray-600" : "bg-gradient-to-r from-orange-500 via-red-500 to-pink-600"}
                                hover:opacity-90 text-white text-[11px] md:text-sm font-semibold 
                                py-1 md:py-2 rounded-xl shadow-lg transition-all duration-300
                                cursor-pointer
                              `}
                              >
                                {isInCart ? (
                                  <>
                                    <FaCheckCircle className="text-sm md:text-base " />
                                    Added
                                  </>
                                ) : (
                                  <>
                                    <FaShoppingCart className="text-sm md:text-base animate-bounce" />
                                    Add to Cart
                                  </>
                                )}
                              </button>
                            )}

                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rewards */}
                <div className="mt-0">
                  <div className="grid gap-3">
                    {scheme.rewards.map((r) => {
                      const prod = getProduct(r.product);
                      return (
                        <div
                          key={r.id}
                          className="flex items-center gap-2 bg-green-50 rounded p-2"
                        >
                          <FaGift className="text-pink-500" />
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
