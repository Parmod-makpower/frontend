// 📁 src/pages/SSHistoryPage.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingBag, FaRupeeSign, FaCalendarAlt } from "react-icons/fa";

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

  return (
    <div className="p-2 max-w-5xl mx-auto pb-20">
      <MobilePageHeader title="My Orders" />

      <div className="pt-[60px] sm:pt-0 space-y-4">
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center">No orders found.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}/track` , { state: { order } })}
              className="rounded-xl shadow-sm p-4 bg-white hover:shadow-lg hover:scale-[1.01] transition cursor-pointer"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold flex items-center gap-2 text-gray-800">
                  <FaShoppingBag className="text-blue-500" /> {order.order_id}
                </h3>
                <span className="text-sm flex items-center gap-1 text-gray-500">
                  <FaCalendarAlt />{" "}
                  {new Date(order.created_at).toLocaleString()}
                </span>
              </div>

              {/* Total Amount */}
              <div className="flex items-center gap-1 text-gray-700">
                <FaRupeeSign className="text-green-600" /> {order.total_amount}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SSHistoryPage;
