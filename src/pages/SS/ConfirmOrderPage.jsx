// 📁 src/pages/ConfirmOrderPage.jsx
import { useState } from "react";
import { useSelectedProducts } from "../../hooks/useSelectedProducts";
import { useSchemes } from "../../hooks/useSchemes";
import { useAuth } from "../../context/AuthContext";
import { usePlaceOrder } from "../../hooks/usePlaceOrder";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaShoppingCart, FaBoxOpen, FaGift } from "react-icons/fa";
import MobilePageHeader from "../../components/MobilePageHeader";

export default function ConfirmOrderPage() {
  const { selectedProducts, setSelectedProducts } = useSelectedProducts();
  const { data: schemes = [] } = useSchemes();
  const { user } = useAuth();
  const navigate = useNavigate();

  const placeOrderMutation = usePlaceOrder();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false); // ✅ local state

  const checkSchemeEligibility = (scheme) =>
    scheme.conditions.every((cond) => {
      const matched = selectedProducts.find(
        (p) => p.id === cond.product || p.product_name === cond.product_name
      );
      return matched && matched.quantity >= cond.min_quantity;
    });

  const eligibleSchemes = schemes.filter(checkSchemeEligibility);

  const handlePlaceOrder = () => {
    setIsPlacingOrder(true); // ✅ start animation

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
        setIsPlacingOrder(false); // ✅ stop animation
        setSelectedProducts([]);
        setShowSuccess(data.order.order_id);
      },
      onError: (error) => {
        setIsPlacingOrder(false); // ✅ stop animation
        console.error("❌ Order failed:", error);
        alert("Order failed, please try again.");
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white  px-3 pb-16">
      {/* Header */}
      <MobilePageHeader title="Order Confirmation"/>
      

      {/* Products Table */}
      <div className="mb-6 sm:pt-0 pt-[60px]">
        {/* <h3 className="text-lg font-semibold my-3">📦 Ordered Products</h3> */}
        <table className="w-full border-collapse my-3 border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border p-2">No</th>
              <th className="border p-2">Product</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Price</th>
             
            </tr>
          </thead>
          <tbody>
            {selectedProducts.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{item.product_name}</td>
                <td className="border p-2">{item.quantity}</td>
                
                <td className="border p-2">
                  {(item.price || 0) * (item.quantity || 1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Eligible Schemes */}
      {eligibleSchemes.length > 0 && (
        <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
  <FaGift className="text-pink-500" /> Eligible Schemes
</h3>

          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-green-100 text-left">
                <th className="border p-2">Conditions</th>
                <th className="border p-2">Rewards</th>
              </tr>
            </thead>
            <tbody>
              {eligibleSchemes.map((scheme) => (
                <tr key={scheme.id}>
                  <td className="border p-2">
                    {scheme.conditions
                      .map(
                        (c) =>
                          `Buy ${c.min_quantity} ${c.product_name || c.product}`
                      )
                      .join(", ")}
                  </td>
                  <td className="border p-2">
                    {scheme.rewards
                      .map(
                        (r) =>
                          `Get ${r.quantity} ${r.product_name || r.product}`
                      )
                      .join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Total */}
      <div className="flex justify-end mb-6">
        <div className="text-right">
          <p className="text-lg font-semibold">
            Total: ₹
            {selectedProducts.reduce(
              (sum, p) => sum + (p.price || 0) * (p.quantity || 1),
              0
            )}
          </p>
        </div>
      </div>

      {/* Place Order Button */}
      <div className="text-right">
        <button
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder}
          className={`px-6 py-2 rounded-lg transition text-white ${
            isPlacingOrder
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isPlacingOrder ? "Placing Order..." : "✅ Confirm & Place Order"}
        </button>
      </div>

      {/* Loading Animation */}
      {isPlacingOrder && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50">
          <FaShoppingCart className="text-white text-6xl animate-bounce mb-4" />
          <p className="text-white text-lg animate-pulse">
            Placing your order, please wait...
          </p>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center animate-fadeIn">
            <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-green-600 mb-2">
              Order Placed Successfully!
            </h3>
            <p className="text-gray-700 mb-2">
              Order ID: <span className="font-mono">{showSuccess}</span>
            </p>
            <p className="text-gray-500 mb-6">
              You can track your order in the history section.
            </p>
            <button
              onClick={() => {
                setShowSuccess(false);
                navigate("/");
              }}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 mx-auto"
            >
              <FaBoxOpen /> Go to Orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
