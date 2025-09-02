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
import MobilePageHeader from "../components/MobilePageHeader";
import makpower_image from "../assets/images/makpower_image.png"

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

  const getSchemeMultiplier = (scheme) => {
    return Math.min(
      ...scheme.conditions.map((cond) => {
        const matched = selectedProducts.find(
          (p) => p.id === cond.product || p.product_name === cond.product_name
        );
        if (!matched) return 0;
        return Math.floor(matched.quantity / cond.min_quantity);
      })
    );
  };


  return (
    <div className="max-w-5xl mx-auto py-2 px-0  sm:p-6 space-y-6 mb-25 ">
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
                      : makpower_image
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
                      <>&#8377;{price}</>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 text-xs">
                        <FaBan /> Price
                      </span>
                    )}
                  </p>

                  <p className="text-xs text-gray-400">{item.sub_category}</p>
                  {item.cartoon_size > 1 && (
                    <p className="text-xs text-gray-400">1 Cartoon - {item.cartoon_size} piece</p>
                  )}

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
                  <p className="font-bold">
                    {!isNaN(price) ? `₹${(price * (item.quantity || 1)).toFixed(1)}` : "—"}
                  </p>
                </div>
              </div>

              {/* Schemes */}
              {relatedSchemes.map((scheme) => {
                const multiplier = getSchemeMultiplier(scheme);
                const eligible = multiplier > 0;

                return (
                  <div key={scheme.id} className="flex items-center gap-2 mt-4">
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

                    {/* ✅ सिर्फ यहाँ multiplier badge दिखेगा */}
                    {eligible && (
                      <span className="ml-2 px-2 py-0.5 text-[10px] rounded bg-green-100 text-green-700 font-semibold">
                        x
                        {scheme.rewards.reduce(
                          (sum, r) => sum + r.quantity * multiplier,
                          0
                        )}
                      </span>
                    )}



                    {eligible ? (
                      <FaCheckCircle className="text-green-600" />
                    ) : (
                      <FaTimesCircle className="text-yellow-600" />
                    )}
                  </div>
                );
              })}


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
