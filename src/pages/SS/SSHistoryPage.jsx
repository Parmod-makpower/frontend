// 📁 src/pages/SSHistoryPage.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShoppingBag,
  FaRupeeSign,
  FaCalendarAlt,
  FaMobileAlt,
  FaBolt,
  FaHeadphonesAlt,
  FaBoxOpen,
} from "react-icons/fa";

import MobilePageHeader from "../../components/MobilePageHeader";
import Loader from "../../components/Loader";
import { useSSOrderHistory } from "../../hooks/useSSOrderHistory";

const SSHistoryPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useSSOrderHistory();

  useEffect(() => {
    document.title = "My Order History";
  }, []);

  if (isLoading) return <Loader message="Loading your orders..." />;

  if (isError)
    return (
      <div className="p-4 text-center text-red-500">
        ❌ Error: {error?.message || "Failed to load order history."}
      </div>
    );

  const orders = data?.results ?? [];

  // Badge function (same style as CRM)
  const getOrderBadge = (note) => {
    const n = (note || "").toLowerCase();

    if (n.includes("battery"))
      return { label: "Battery", class: "bg-yellow-100 text-yellow-700", icon: <FaBolt className="text-yellow-600" /> };

    if (n.includes("tempered"))
      return { label: "Tempered", class: "bg-blue-100 text-blue-700", icon: <FaMobileAlt className="text-blue-600" /> };

    if (n.includes("accessorie"))
      return { label: "Accessories", class: "bg-purple-100 text-purple-700", icon: <FaHeadphonesAlt className="text-purple-600" /> };

    return { label: "General", class: "bg-gray-100 text-gray-600", icon: <FaBoxOpen className="text-gray-500" /> };
  };

  return (
    <div className="p-3 max-w-4xl mx-auto pb-24">
      <MobilePageHeader title="My Orders" />

      <div className="pt-[60px] sm:pt-6 space-y-4">
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center text-sm">No orders found.</p>
        ) : (
          orders.map((order) => {
            const badge = getOrderBadge(order.note);

            return (
              <div
                key={order.id}
                onClick={() =>
                  navigate(`/orders/${order.id}/track`, { state: { order } })
                }
                className="
                  bg-white p-4 rounded-2xl
                  shadow-sm border border-gray-100
                  hover:shadow-md hover:scale-[1.01]
                  transition-all cursor-pointer
                "
              >
                {/* Top Section */}
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-2">
                  
                  {/* Order ID + Badge */}
                  <div className="flex items-center gap-3">
                    <h3 className="flex items-center font-bold gap-1 text-gray-800 text-base sm:text-lg">
                      <FaShoppingBag className="text-blue-500" /> {order.order_id}
                    </h3>

                    <span
                      className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm whitespace-nowrap ${badge.class}`}
                    >
                      {badge.icon}
                      {badge.label}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center text-gray-500 text-xs sm:text-sm gap-1">
                    <FaCalendarAlt className="text-gray-400" />
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>

                {/* Total Amount */}
                <div className="flex items-center gap-2 text-gray-700 text-sm font-medium">
                  <FaRupeeSign className="text-green-600" /> {order.total_amount}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SSHistoryPage;
