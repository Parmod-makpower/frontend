// src/pages/ConfirmOrderPage.jsx
import { useState } from "react";
import { useSelectedProducts } from "../../hooks/useSelectedProducts";
import { useSchemes } from "../../hooks/useSchemes";
import { useAuth } from "../../context/AuthContext";
import { usePlaceOrder } from "../../hooks/usePlaceOrder";
import { useNavigate } from "react-router-dom";

export default function ConfirmOrderPage() {
  const { selectedProducts, setSelectedProducts } = useSelectedProducts();
  const { data: schemes = [] } = useSchemes();
  const { user } = useAuth();
  const navigate = useNavigate();

  const placeOrderMutation = usePlaceOrder();

  const [showSuccess, setShowSuccess] = useState(false);

  const checkSchemeEligibility = (scheme) => {
    return scheme.conditions.every((cond) => {
      const matched = selectedProducts.find(
        (p) => p.id === cond.product || p.product_name === cond.product_name
      );
      return matched && matched.quantity >= cond.min_quantity;
    });
  };

  const eligibleSchemes = schemes.filter(checkSchemeEligibility);

  const handlePlaceOrder = () => {
    const order = {
      user_id: user?.id,
      crm_id: user?.crm,
      items: selectedProducts.map((p) => ({
        id: p.id,
        quantity: p.quantity,
        price: p.price || 0,
      })),
      eligibleSchemes: eligibleSchemes.map((scheme) => ({
        ...scheme,
        rewards: scheme.rewards.map((r) => ({
          product:
            typeof r.product === "object"
              ? r.product.id
              : r.product || r.product_id,
          quantity: r.quantity,
        })),
      })),
      total: selectedProducts.reduce(
        (sum, p) => sum + (p.price || 0) * (p.quantity || 1),
        0
      ),
    };

    placeOrderMutation.mutate(order, {
     onSuccess: (data) => {
  setSelectedProducts([]);
  setShowSuccess(data.order.order_id); // order_id save
},
      onError: (error) => {
        console.error("❌ Order failed:", error);
        alert("Order failed, please try again.");
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">🧾 Confirm Your Order</h2>

      <div className="border p-4 rounded bg-gray-50">
        <h3 className="font-semibold mb-2">📦 Products:</h3>
        <ul className="list-disc ml-6 space-y-1">
          {selectedProducts.map((item) => (
            <li key={item.id}>
              {item.product_name} × {item.quantity} @ ₹{item.price} = ₹
              {(item.price || 0) * item.quantity}
            </li>
          ))}
        </ul>
      </div>

      {eligibleSchemes.length > 0 && (
        <div className="border p-4 rounded bg-green-50 text-green-800">
          <h3 className="font-semibold mb-2">🎁 Eligible Schemes:</h3>
          <ul className="list-disc ml-6 space-y-1">
            {eligibleSchemes.map((scheme) => (
              <li key={scheme.id}>
                {scheme.conditions
                  .map(
                    (c) =>
                      `Buy ${c.min_quantity} ${c.product_name || c.product}`
                  )
                  .join(", ")}{" "}
                →{" "}
                {scheme.rewards
                  .map(
                    (r) => `Get ${r.quantity} ${r.product_name || r.product}`
                  )
                  .join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-right">
        <button
          onClick={handlePlaceOrder}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          ✅ Place Order
        </button>
      </div>

     {showSuccess && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
      <h3 className="text-lg font-semibold text-green-600 mb-2">
        🎉 Order Placed Successfully!
      </h3>
      <p className="text-gray-600 mb-2">
        Order ID: <span className="font-mono">{showSuccess}</span>
      </p>
      <p className="text-gray-600 mb-4">
        You can track it in your order history.
      </p>
      <button
        onClick={() => {
          setShowSuccess(false);
          navigate("/ss/history");
        }}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
        OK
      </button>
    </div>
  </div>
)}

    </div>
  );
}
