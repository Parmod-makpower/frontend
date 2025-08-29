import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { Link, useNavigate } from "react-router-dom";
import { useSchemes } from "../hooks/useSchemes";
import {
  FaGift,
  FaCheckCircle,
  FaTimesCircle,
  FaTrashAlt,
  FaBan,   // ❗ नया icon for "Not Available"
} from "react-icons/fa";
import {FaIndianRupeeSign} from "react-icons/fa6"
import MobilePageHeader from "../components/MobilePageHeader";

export default function CartPage() {
  const { selectedProducts, updateQuantity, setSelectedProducts } = useSelectedProducts();
  const { data: schemes = [], isLoading: isSchemeLoading } = useSchemes();
  const navigate = useNavigate();

  // ✅ Total calculate करते समय सिर्फ valid prices add होंगे
  const total = selectedProducts.reduce((sum, p) => {
    const price = parseFloat(p.price);
    if (!isNaN(price)) {
      return sum + price * (p.quantity || 1);
    }
    return sum;
  }, 0);

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
    <div className="max-w-5xl mx-auto py-2 px-0  sm:p-6 space-y-6 mb-16 ">
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

          const price = parseFloat(item.price);

          return (
            <div className="shadow rounde border-b p-4" key={item.id}>
              <div className="flex flex-col flex-row gap-4 ">
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

                  {/* ✅ Price / Not Available */}
                  <p className="text-gray-600 flex items-center gap-1">
                    
                    {!isNaN(price) ? (
                      <><FaIndianRupeeSign className="text-gray-400" />{price}</>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 text-xs">
                        <FaBan /> Price
                      </span>
                    )}
                  </p>

                  <p className="text-xs text-gray-400">{item.sub_category}</p>

                  {/* Quantity */}
                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity === "" ? "" : Number(item.quantity)}
                      onChange={(e) => {
                        const val = e.target.value;
                        const parsed = parseInt(val);

                        if (!isNaN(parsed)) {
                          updateQuantity(item.id, Math.max(1, parsed));
                        } else if (val === "") {
                          updateQuantity(item.id, ""); // allow temporarily empty
                        }
                      }}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value);
                        if (isNaN(val) || val < 1) {
                          updateQuantity(item.id, 1);
                        }
                      }}
                      className="w-20 border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                  </div>
                </div>

                {/* Price & Remove */}
                <div className="flex flex-col justify-between items-end">
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-red-500 text-sm flex items-center gap-1 hover:text-red-700"
                  >
                    <FaTrashAlt />
                  </button>

                  {/* ✅ Show subtotal only if price valid */}
                  <p className="font-bold text-lg">
                    {!isNaN(price) ? `₹${(price * (item.quantity || 1)).toFixed(2)}` : "—"}
                  </p>
                </div>
              </div>

              {/* Schemes */}
              {relatedSchemes.length > 0 && (
                <div className="mt-4">
                  <div className="space-y-2">
                    {relatedSchemes.map((scheme) => {
                      const eligible = checkSchemeEligibility(scheme);
                      return (
                        <div key={scheme.id} className="flex items-center gap-2">
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
                          </span>
                          {eligible ? (
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
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition w-auto"
        >
          Proceed to Checkout →
        </button>
      </div>
    </div>
  );
}
