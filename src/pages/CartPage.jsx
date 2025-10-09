import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { Link, useNavigate } from "react-router-dom";
import { useSchemes } from "../hooks/useSchemes";
import { useState } from "react";
import {
  FaGift,
  FaCheckCircle,
  FaTimesCircle,
  FaTrashAlt,
  FaBan,
  FaShoppingCart,
} from "react-icons/fa";
import MobilePageHeader from "../components/MobilePageHeader";
import makpower_image from "../assets/images/makpower_image.webp";
import { useEffect } from "react";

export default function CartPage() {
  const {
    selectedProducts,
    updateQuantity,
    setSelectedProducts,
    cartoonSelection,
    updateCartoon,
  } = useSelectedProducts();

  const { data: schemes = [] } = useSchemes();
  const navigate = useNavigate();

  // ✅ Initialize only missing cartoon selections on mount
useEffect(() => {
  selectedProducts.forEach((p) => {
    if (p.cartoon_size && p.cartoon_size > 1) {
      if (!cartoonSelection[p.id]) {
        updateCartoon(p.id, 1); // default 1 cartoon
      } else {
        updateQuantity(p.id, cartoonSelection[p.id] * p.cartoon_size); // sync qty
      }
    } else {
  const defaultQty = p.moq || 1; // ✅ default moq quantity
  updateQuantity(p.id, defaultQty); // p.quantity check हटाओ, हमेशा defaultQty use करो

}

  });
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
  };

  const handleProceed = () => {
    navigate("/confirm-order");
  };

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
    <div className="max-w-5xl mx-auto py-2 sm:px-6 space-y-6 mb-35">
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
            <div className="border-b p-4" key={item.id}>
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
                    <p className="text-xs text-gray-400 mb-3">{item.sub_category}</p>

                    <p className="text-gray-600 flex items-center gap-1">
                      {!isNaN(price) ? (
                        <>&#8377;{item.price}</>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500 text-xs">
                          <FaBan /> Price
                        </span>
                      )}
                    </p>

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
          onChange={(e) => updateCartoon(item.id, parseInt(e.target.value))}
          className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none w-32"
        >
          {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
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
      <div className="flex flex-col items-start">
        <input
          type="number"
          min={item.moq || 1}
          value={item.quantity === "" ? "" : Number(item.quantity)}
          onChange={(e) => {
            const val = e.target.value;
            const parsed = parseInt(val);
            const moq = item.moq || 1;

            if (!isNaN(parsed)) {
              updateQuantity(item.id, parsed);
              item.showMoqError = parsed < moq;
            } else if (val === "") {
              updateQuantity(item.id, "");
              item.showMoqError = true;
            }
          }}
          onBlur={(e) => {
            const val = parseInt(e.target.value);
            const moq = item.moq || 1;
            if (isNaN(val) || val < moq) {
              updateQuantity(item.id, moq);
              item.showMoqError = false;
            }
          }}
          className={`w-20 border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none ${
            item.showMoqError ? "border-red-400" : ""
          }`}
        />
        {item.showMoqError && (
          <p className="text-xs text-red-500 mt-1">
            Minimum quantity: {item.moq}
          </p>
        )}
      </div>
    )}
  </div>

  <div className="font-bold">
    {!isNaN(price)
      ? `₹${(price * (item.quantity || 1)).toFixed(1)}`
      : "—"}
  </div>
</div>

              </div>

              {/* Schemes */}
              {relatedSchemes.map((scheme) => {
                const multiplier = getSchemeMultiplier(scheme);
                const eligible = multiplier > 0;
                return (
                  <div
                    key={scheme.id}
                    className="flex items-center gap-2 mt-4 flex-wrap"
                  >
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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4">
        <p className="text-xl font-bold text-gray-800">
          <u className="text-red-600">₹ {total.toFixed(2)}</u>
        </p>

        <button
          onClick={handleProceed}
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-semibold px-6 py-3 rounded-md shadow-md hover:from-green-500 hover:to-green-600 hover:shadow-lg transition-all duration-300 ease-in-out"
        >
          <FaShoppingCart className="text-lg" />
          Buy Now
        </button>
      </div>
    </div>
  );
}
