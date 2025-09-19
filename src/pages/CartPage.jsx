import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { Link, useNavigate } from "react-router-dom";
import { useSchemes } from "../hooks/useSchemes";
import {
  FaGift,
  FaCheckCircle,
  FaTimesCircle,
  FaTrashAlt,
  FaBan,
} from "react-icons/fa";
import MobilePageHeader from "../components/MobilePageHeader";
import makpower_image from "../assets/images/makpower_image.webp";
import { useState, useEffect } from "react";

export default function CartPage() {
  const { selectedProducts, updateQuantity, setSelectedProducts } = useSelectedProducts();
  const { data: schemes = [] } = useSchemes();
  const navigate = useNavigate();

  const [cartoonSelection, setCartoonSelection] = useState({}); // id -> selected cartoon

  // ✅ Initialize default cartoon/quantity on first render
  // ✅ Initialize default cartoon/quantity only on mount
useEffect(() => {
  const defaults = {};
  selectedProducts.forEach((p) => {
    if (p.cartoon_size > 1) {
      defaults[p.id] = 1;
      updateQuantity(p.id, p.cartoon_size); // 1 cartoon default
    } else {
      updateQuantity(p.id, p.quantity || 1); // default quantity 1
    }
  });
  setCartoonSelection(defaults);
  // ⚠️ only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  const total = selectedProducts.reduce((sum, p) => {
    const price = parseFloat(p.price);
    if (!isNaN(price)) return sum + price * (p.quantity || 1);
    return sum;
  }, 0);

  const handleRemove = (id) => {
    const updated = selectedProducts.filter((p) => p.id !== id);
    setSelectedProducts(updated);
    setCartoonSelection((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
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

  const handleCartoonChange = (productId, selectedCartoon) => {
    setCartoonSelection((prev) => ({ ...prev, [productId]: selectedCartoon }));
    const product = selectedProducts.find((p) => p.id === productId);
    if (product) {
      updateQuantity(productId, selectedCartoon * product.cartoon_size);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-2  sm:px-6 space-y-6 mb-25">
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
          const hasCartoon = item.cartoon_size && item.cartoon_size > 1;

          return (
            <div className=" border-b p-4" key={item.id}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-row flex-wrap gap-4 items-start">
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

<div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.product_name}</h3>

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
                  {hasCartoon && (
                    <p className="text-xs text-gray-400">
                      1 Cartoon = {item.cartoon_size} piece
                    </p>
                  )}
</div>
 <div className="flex flex-col justify-between items-end mt-2 sm:mt-0">
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-red-500 text-sm flex items-center gap-1 hover:text-red-700"
                  >
                    <FaTrashAlt />
                  </button>
                  
                </div>
</div>
                {/* Product Details */}
              <div className="flex flex-row items-center justify-between mt-3">
  <div className="flex flex-row items-center gap-2">
    {hasCartoon ? (
      <>
        <select
          value={cartoonSelection[item.id] || 1}
          onChange={(e) =>
            handleCartoonChange(item.id, parseInt(e.target.value))
          }
          className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none w-32"
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} Cartoon{n > 1 ? "s" : ""}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={item.quantity || 0}
          readOnly
          className="w-20 border rounded px-2 py-1 text-sm bg-gray-100"
        />
      </>
    ) : (
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
            updateQuantity(item.id, "");
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
    )}
  </div>

  <div className="font-bold">
    {!isNaN(price) ? `₹${(price * (item.quantity || 1)).toFixed(1)}` : "—"}
  </div>
</div>


                
                    </div>

              {/* Schemes */}
              {relatedSchemes.map((scheme) => {
                const multiplier = getSchemeMultiplier(scheme);
                const eligible = multiplier > 0;
                return (
                  <div key={scheme.id} className="flex items-center gap-2 mt-4 flex-wrap">
                    {eligible ? (
                      <FaGift className="text-pink-600" />
                    ) : (
                      <FaGift className="text-gray-600" />
                    )}
                    <span className="text-xs flex-1">
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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
        <p className="text-xl font-semibold">
          Total: <span className="text-green-700">₹{total.toFixed(2)}</span>
        </p>
        <button
          onClick={handleProceed}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition w-full sm:w-auto"
        >
          Proceed to Checkout →
        </button>
      </div>
    </div>
  );
}
