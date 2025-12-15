import { useState } from "react";
import { useSelectedProducts } from "../../hooks/useSelectedProducts";
import { useSchemes } from "../../hooks/useSchemes";
import { useAuth } from "../../context/AuthContext";
import { usePlaceOrderDS } from "../../hooks/usePlaceOrder";
import { useNavigate } from "react-router-dom";

import { FaCheckCircle, FaShoppingCart, FaBoxOpen, FaBan } from "react-icons/fa";
import { FaIndianRupeeSign } from "react-icons/fa6";

import ConfirmOrderPDFButton from "../../components/ConfirmOrderPDFButton";
import MobilePageHeader from "../../components/MobilePageHeader";

export default function ConfirmOrderPageDS() {
  const { selectedProducts, setSelectedProducts } = useSelectedProducts();
  const { data: schemes = [] } = useSchemes();
  const { user } = useAuth();
  const navigate = useNavigate();

  const placeOrderMutation = usePlaceOrderDS();

  const [showSuccess, setShowSuccess] = useState(null); // ✅ orderId string
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  /* ----------------------------------
     Scheme Helper Functions
  ---------------------------------- */

  const getSchemeMultiplier = (scheme) => {
    return Math.min(
      ...scheme.conditions.map((cond) => {
        const matched = selectedProducts.find(
          (p) =>
            p.id === cond.product ||
            p.product_name === cond.product_name
        );
        if (!matched) return 0;
        return Math.floor(matched.quantity / cond.min_quantity);
      })
    );
  };

  const mergeRewards = (eligibleSchemes) => {
    const rewardMap = {};

    eligibleSchemes.forEach((scheme) => {
      const multiplier = getSchemeMultiplier(scheme);

      scheme.rewards.forEach((r) => {
        const productId =
          typeof r.product === "object"
            ? r.product.id
            : r.product || r.product_id;

        const productName = r.product_name || r.product;
        const totalQty = r.quantity * multiplier;

        if (!rewardMap[productId]) {
          rewardMap[productId] = {
            product: productId,
            product_name: productName,
            quantity: totalQty,
          };
        } else {
          rewardMap[productId].quantity += totalQty;
        }
      });
    });

    return Object.values(rewardMap);
  };

  const eligibleSchemes = schemes.filter(
    (scheme) => getSchemeMultiplier(scheme) > 0
  );

  /* ----------------------------------
     Place Order
  ---------------------------------- */

  const handlePlaceOrder = () => {
    if (!selectedProducts.length) return;

    setIsPlacingOrder(true);

    const mergedRewards = mergeRewards(eligibleSchemes);

    const orderPayload = {
      user_id: user?.id,
      items: selectedProducts.map((p) => ({
        id: p.id,
        quantity: p.quantity,
        price: Number(p.price) || 0,
        ds_virtual_stock: p.virtual_stock || 0,
      })),
      eligibleSchemes: mergedRewards,
    };

    placeOrderMutation.mutate(orderPayload, {
      onSuccess: (data) => {
        setIsPlacingOrder(false);
        setSelectedProducts([]);

        // ✅ NEW BACKEND RESPONSE SUPPORT
        const orderId = data?.order?.order_id;

        if (orderId) {
          setShowSuccess(orderId);
        } else {
          console.warn("Unexpected response format:", data);
          alert("Order placed, but order ID not received.");
        }
      },

      onError: (error) => {
        setIsPlacingOrder(false);
        console.error("Order placement failed:", error);
        alert("Failed to place order. Please try again.");
      },
    });
  };

  /* ----------------------------------
     UI
  ---------------------------------- */

  return (
    <div className="max-w-4xl mx-auto px-3 pb-20">
      <MobilePageHeader title="Order Confirmation" />

      {/* Products Table */}
      <div className="my-6 pt-[60px] sm:pt-0">
        <div className="overflow-auto rounded-lg shadow">
          <div className="flex justify-center">
            <ConfirmOrderPDFButton
              selectedProducts={selectedProducts}
              eligibleSchemes={eligibleSchemes}
            />
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">No</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Product</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Qty</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {selectedProducts.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{item.product_name}</td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2">
                    {!isNaN(Number(item.price)) ? (
                      <span className="flex items-center gap-1">
                        <FaIndianRupeeSign />
                        {(item.price * item.quantity).toFixed(1)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 text-xs">
                        <FaBan /> Price
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-end mb-6">
        <p className="text-lg font-semibold">
          Total: ₹
          {selectedProducts
            .reduce(
              (sum, p) => sum + (Number(p.price) || 0) * p.quantity,
              0
            )
            .toFixed(1)}
        </p>
      </div>

      {/* Place Order Button */}
      <div className="text-center">
        <button
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold px-6 py-3 rounded-md shadow-md hover:from-green-500 hover:to-green-600 transition"
        >
          {isPlacingOrder ? "Placing Order..." : "Place Order"}
        </button>
      </div>

      {/* Loading Overlay */}
      {isPlacingOrder && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50">
          <FaShoppingCart className="text-white text-6xl animate-bounce mb-4" />
          <p className="text-white text-lg">Placing your order…</p>
        </div>
      )}

      {/* ✅ Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center">
            <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-600 mb-2">
              Order Placed Successfully!
            </h3>
            <p className="mb-4">
              Order ID: <span className="font-mono">{showSuccess}</span>
            </p>
            <button
              onClick={() => {
                setShowSuccess(null);
                navigate("/");
              }}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto"
            >
              <FaBoxOpen /> Go to Orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
