// 📁 src/pages/CartPage.jsx
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { Link, useNavigate } from "react-router-dom";
import { useSchemes } from "../hooks/useSchemes";
import {
  FaGift,
  FaCheckCircle,
  FaTimesCircle,
  FaTrashAlt,
  FaTag,
} from "react-icons/fa";
import MobilePageHeader from "../components/MobilePageHeader";

export default function CartPage() {
  const { selectedProducts, updateQuantity, setSelectedProducts } = useSelectedProducts();
  const { data: schemes = [], isLoading: isSchemeLoading } = useSchemes();
  const navigate = useNavigate();

  const total = selectedProducts.reduce(
    (sum, p) => sum + (p.price || 0) * (p.quantity || 1),
    0
  );

  const handleRemove = (id) => {
    const updated = selectedProducts.filter((p) => p.id !== id);
    setSelectedProducts(updated);
  };

  const checkSchemeEligibility = (scheme) => {
    return scheme.conditions.every((cond) => {
      const matched = selectedProducts.find(
        (p) => p.id === cond.product || p.product_name === cond.product_name
      );
      return matched && matched.quantity >= cond.min_quantity;
    });
  };

  const handleProceed = () => {
    navigate("/confirm-order");
  };

  if (selectedProducts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-2xl mb-3">🛒 Your cart is empty</p>
        <Link to="/" className="text-blue-600 hover:underline">
          ← Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 mb-16">
      <MobilePageHeader title="Cart" />

      {/* Cart Items */}
      <div className="space-y-4 pt-[60px] sm:pt-0">
        {selectedProducts.map((item) => {
          const relatedSchemes = schemes.filter(
            (scheme) =>
              scheme.conditions.some(
                (c) => c.product === item.id || c.product_name === item.product_name
              ) ||
              scheme.rewards.some(
                (r) => r.product === item.id || r.product_name === item.product_name
              )
          );

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md p-4 flex flex-col sm:flex-row gap-4 border"
            >
              {/* Product Image */}
              <img
                src={
                  item?.image
                    ? `https://res.cloudinary.com/djyr368zj/${item.image}`
                    : "https://ovista.in/cdn/shop/files/WhatsApp_Image_2025-01-20_at_6.06.21_PM_1.jpg?v=1737377240"
                }
                alt={item.product_name}
                className="w-28 h-28 object-contain bg-gray-50 rounded-lg border self-center"
              />

              {/* Product Details */}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.product_name}</h3>
                <p className="text-gray-600 flex items-center gap-1">
                  <FaTag className="text-gray-400" /> ₹{item.price}
                </p>
                <p className="text-xs text-gray-400">{item.sub_category}</p>

                {/* Quantity */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-sm font-medium">Quantity:</span>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, Math.max(1, parseInt(e.target.value)))
                    }
                    className="w-20 border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>

                {/* Schemes */}
                {relatedSchemes.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 font-medium text-green-700 mb-2">
                      
                    </div>
                    <div className="space-y-2">
                      {relatedSchemes.map((scheme) => {
                        const eligible = checkSchemeEligibility(scheme);
                        return (
                          <div
                            key={scheme.id}
                            className={`flex items-center gap-2   `}
                          >
                            {eligible ? (
                              <FaGift className="text-pink-600" />
                            ) : (
                              <FaGift className="text-gray-600" />
                            )}
                            <span className="text-xs">
                              {scheme.conditions
                                .map(
                                  (c) =>
                                    `Buy ${c.min_quantity} ${c.product_name || c.product}`
                                )
                                .join(", ")}{" "}
                              →{" "}
                              {scheme.rewards
                                .map(
                                  (r) =>
                                    `Get ${r.quantity} ${r.product_name || r.product}`
                                )
                                .join(", ")}
                            </span>{eligible ? (
                              <FaCheckCircle className="text-green-600" />
                            ) : (
                              <FaTimesCircle className="text-yellow-600" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Price & Remove */}
              <div className="flex flex-col justify-between items-end">
                <p className="font-bold text-lg">
                  ₹{(item.price || 0) * item.quantity}
                </p>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-red-500 text-sm flex items-center gap-1 hover:text-red-700"
                >
                  <FaTrashAlt /> Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total & Proceed */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xl font-semibold">
          Total: <span className="text-green-700">₹{total.toFixed(2)}</span>
        </p>
        <button
          onClick={handleProceed}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition w-full sm:w-auto"
        >
          Proceed to Checkout →
        </button>
      </div>
    </div>
  );
}
