// src/pages/CartPage.jsx
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { Link, useNavigate } from "react-router-dom";
import { useSchemes } from "../hooks/useSchemes";
import { FaGift, FaCheckCircle, FaArrowRight } from "react-icons/fa";
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
      <div className="p-6 text-center text-gray-500">
        🛒 आपका कार्ट खाली है।<br />
        <Link to="/" className="text-blue-600 hover:underline">🔙 प्रोडक्ट्स पर जाएं</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <MobilePageHeader title="Cart"/>
      {selectedProducts.map((item) => {
        const relatedSchemes = schemes.filter(
          (scheme) =>
            scheme.conditions.some((c) => c.product === item.id || c.product_name === item.product_name) ||
            scheme.rewards.some((r) => r.product === item.id || r.product_name === item.product_name)
        );

        return (
          <div
            key={item.id}
            className="flex items-center justify-between border-b py-4 pt-[60px]"
          >
            <div className="flex items-center gap-4">
              <img
                src={
                  item?.image
                    ? `https://res.cloudinary.com/djyr368zj/${item.image}`
                    : "https://phonokart.com/cdn/shop/files/Matttemp2.jpg?v=1697191459"
                }
                alt={item.product_name}
                className="w-24 h-24 object-contain bg-white border rounded"
              />
              <div>
                <h3 className="font-semibold text-lg">{item.product_name}</h3>
                <p className="text-sm text-gray-600">₹{item.price}</p>
                <p className="text-xs text-gray-400">{item.sub_category}</p>

                <div className="flex items-center gap-2 mt-2">
                  <label className="text-sm">Qty:</label>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, Math.max(1, parseInt(e.target.value)))
                    }
                    className="w-16 border rounded px-2 py-1 text-sm"
                  />
                </div>

                {/* 🎁 Scheme Display */}
                {relatedSchemes.length > 0 && (
                  <div className="bg-green-50 border border-green-300 text-green-800 px-3 py-2 rounded mt-3 text-sm">
                    <div className="flex items-center gap-2 font-medium mb-1">
                      <FaGift />
                      <span>Available Schemes:</span>
                    </div>
                    <ul className="list-disc ml-5 space-y-1">
                      {relatedSchemes.map((scheme) => {
                        const eligible = checkSchemeEligibility(scheme);
                        return (
                          <li key={scheme.id} className="flex items-start gap-2">
                            {eligible ? (
                              <FaCheckCircle className="text-green-600 mt-1" />
                            ) : (
                              <FaArrowRight className="text-yellow-600 mt-1" />
                            )}
                            <span>
                              {scheme.conditions
                                .map(
                                  (c) => `Buy ${c.min_quantity} ${c.product_name || c.product}`
                                )
                                .join(", ")}{" "}
                              →{" "}
                              {scheme.rewards
                                .map(
                                  (r) =>
                                    `Get ${r.quantity} ${r.product_name || r.product}`
                                )
                                .join(", ")}
                              {eligible ? " ✅" : " ❌"}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end">
              <p className="font-bold">₹{(item.price || 0) * item.quantity}</p>
              <button
                onClick={() => handleRemove(item.id)}
                className="text-red-500 text-sm mt-2"
              >
                हटाएं
              </button>
            </div>
          </div>
        );
      })}

      <div className="text-right text-xl font-semibold">
        कुल: ₹{total.toFixed(2)}
      </div>

      <div className="text-right">
        <button
          onClick={handleProceed}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Proceed to Checkout →
        </button>
      </div>
    </div>
  );
}
