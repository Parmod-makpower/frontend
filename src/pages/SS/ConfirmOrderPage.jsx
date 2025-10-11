// 📁 src/pages/ConfirmOrderPage.jsx
import { useState } from "react";
import { useSelectedProducts } from "../../hooks/useSelectedProducts";
import { useSchemes } from "../../hooks/useSchemes";
import { useAuth } from "../../context/AuthContext";
import { usePlaceOrder } from "../../hooks/usePlaceOrder";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaShoppingCart, FaBoxOpen, FaBan } from "react-icons/fa";
import { FaIndianRupeeSign } from "react-icons/fa6";
import MobilePageHeader from "../../components/MobilePageHeader";

export default function ConfirmOrderPage() {
  const { selectedProducts, setSelectedProducts } = useSelectedProducts();
  const { data: schemes = [] } = useSchemes();
  const { user } = useAuth();
  const navigate = useNavigate();

  const placeOrderMutation = usePlaceOrder();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // 🔹 Helper: Get scheme multiplier
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

  // 🔹 Merge all rewards before sending to backend
  const mergeRewards = (eligibleSchemes) => {
    const rewardMap = {};

    eligibleSchemes.forEach((scheme) => {
      const multiplier = getSchemeMultiplier(scheme);

      scheme.rewards.forEach((r) => {
        const productId =
          typeof r.product === "object" ? r.product.id : r.product || r.product_id;
        const productName = r.product_name || r.product;
        const totalQty = r.quantity * multiplier;

        if (rewardMap[productId]) {
          rewardMap[productId].quantity += totalQty;
        } else {
          rewardMap[productId] = {
            product: productId,
            product_name: productName,
            quantity: totalQty,
          };
        }
      });
    });

    return Object.values(rewardMap);
  };

  // 🔹 Eligible schemes filter
  const eligibleSchemes = schemes.filter((scheme) => getSchemeMultiplier(scheme) > 0);

  // 🔹 Place order function
  const handlePlaceOrder = () => {
    setIsPlacingOrder(true);

    const mergedRewards = mergeRewards(eligibleSchemes);

    const order = {
      user_id: user?.id,
      crm_id: user?.crm,
      items: selectedProducts.map((p) => ({
        id: p.id,
        quantity: p.quantity,
        price: Number(p.price) || 0,
        ss_virtual_stock: p.virtual_stock || 0, // ✅ Added: Send virtual stock
      })),
      eligibleSchemes: mergedRewards,
      total: selectedProducts.reduce(
        (sum, p) => sum + (Number(p.price) || 0) * (p.quantity || 1),
        0
      ),
    };

    placeOrderMutation.mutate(order, {
      onSuccess: (data) => {
        setIsPlacingOrder(false);
        setSelectedProducts([]);
        setShowSuccess(data.order.order_id);
      },
      onError: (error) => {
        setIsPlacingOrder(false);
        console.error("❌ Order failed:", error);
        alert("Order failed, please try again.");
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-3 pb-20">
      {/* Header */}
      <MobilePageHeader title="Order Confirmation" />

      {/* Products Table */}
      <div className="my-6 pt-[60px] sm:pt-0">
        <div className="overflow-auto rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">No</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Product</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Quantity</th>
            
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {selectedProducts.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2 text-sm text-gray-700">{index + 1}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">{item.product_name}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{item.quantity}</td>
                  
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {!isNaN(Number(item.price)) ? (
                      <span className="flex items-center gap-1 text-gray-700">
                        <FaIndianRupeeSign className="text-gray-400" />
                        {(Number(item.price) || 0) * (item.quantity || 1)}
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

      {/* Eligible Schemes */}
      {eligibleSchemes.length > 0 && (
        <div className="mb-6">
          <div className="overflow-auto rounded-lg shadow">
            <table className="min-w-full divide-y divide-green-200">
              <thead className="bg-pink-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Schemes</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Rewards</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-100 bg-white">
                {eligibleSchemes.map((scheme) => (
                  <tr key={scheme.id} className="hover:bg-green-50 transition">
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {scheme.conditions
                        .map((c) => `${c.product_name || c.product}`)
                        .join(", ")}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {scheme.rewards
                        .map((r) => {
                          const multiplier = getSchemeMultiplier(scheme);
                          const totalQty = r.quantity * multiplier;
                          return `${totalQty} ${r.product_name || r.product} Free`;
                        })
                        .join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Total */}
      <div className="flex justify-end mb-6">
        <div className="text-right">
          <p className="text-lg font-semibold">
            Total: ₹
            {selectedProducts
              .reduce(
                (sum, p) => sum + (Number(p.price) || 0) * (p.quantity || 1),
                0
              )
              .toFixed(2)}
          </p>
        </div>
      </div>

      {/* Place Order Button */}
      <div className="text-center">
        <button
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder}
          className={`bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold px-6 py-3 rounded-md shadow-md hover:from-green-500 hover:to-green-600 hover:shadow-lg transition-all duration-300 ease-in-out`}
        >
          {isPlacingOrder ? "Placing Order..." : "Place Order"}
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
