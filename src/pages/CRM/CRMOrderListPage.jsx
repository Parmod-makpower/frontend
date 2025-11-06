import { useNavigate } from "react-router-dom";
import MobilePageHeader from "../../components/MobilePageHeader";
import {
  FaCalendarAlt,
  FaIdBadge,
  FaShoppingBag,
} from "react-icons/fa";
import { useCRMOrders } from "../../hooks/useCRMOrders";

export default function CRMOrderListPage() {
  const navigate = useNavigate();
  const { data: orders = [], isLoading, isFetching } = useCRMOrders();

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        Loading orders...
      </div>
    );

  const getOrderBadge = (note) => {
    const n = (note || "").toLowerCase();  // ✅ Safe

    if (n.includes("battery"))
      return { label: "Battery", class: "bg-yellow-100 text-yellow-700" };

    if (n.includes("tempered"))
      return { label: "Tempered", class: "bg-red-100 text-red-700" };

    if (n.includes("accessor"))
      return { label: "Accessory", class: "bg-blue-100 text-blue-700" };

    return { label: "General", class: "bg-gray-100 text-gray-700" };
  };


  return (
    <div className="p-3 max-w-4xl mx-auto pb-24">
      <MobilePageHeader title="My Orders" />

      {isFetching && (
        <p className="text-center text-xs text-gray-500 mt-1 animate-pulse">
          Updating orders...
        </p>
      )}

      <div className="pt-[65px] sm:pt-6 space-y-4">
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center text-sm">No orders found.</p>
        ) : (
          orders.map((order) => {
            const badge = getOrderBadge(order.note);

            return (
              <div
                key={order.id}
                onClick={() =>
                  navigate(`/crm/orders/${order.id}`, { state: { order } })
                }
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 
                  hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer"
              >
                {/* Top Section */}
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-2">

                  {/* Order ID + Badge */}
                  <div className="flex items-center gap-3">
                    <h3 className="flex items-center font-bold gap-1 text-gray-800 text-base sm:text-lg">
                     <FaShoppingBag className="text-blue-500" /> {order.order_id}
                    </h3>

                    {order.note && (
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm whitespace-nowrap ${badge.class}`}
                      >
                        {badge.label}
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  <div className="flex items-center text-gray-500 text-xs sm:text-sm gap-1">
                    <FaCalendarAlt className="text-gray-400" />
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>

                {/* Party Name */}
                <div className="flex items-center gap-2 text-gray-700 text-sm">
                  <FaIdBadge className="text-green-600" />
                  <span className="font-medium">{order.ss_party_name}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
