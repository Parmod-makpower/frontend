import { useNavigate } from "react-router-dom";
import MobilePageHeader from "../../components/MobilePageHeader";
import { FaCalendarAlt, FaIdBadge, FaShoppingBag } from "react-icons/fa";
import { useCRMOrders } from "../../hooks/useCRMOrders";

export default function CRMOrderListPage() {
  const navigate = useNavigate();
  const { data: orders = [], isLoading, isFetching } = useCRMOrders();

  if (isLoading) return <p className="p-4">Loading orders...</p>;

  return (
    <div className="p-2 max-w-5xl mx-auto pb-20">
      <MobilePageHeader title="My Orders" />
        {isFetching && (
        <p className="text-center text-sm text-gray-400 mt-2">
          🔄 Updating orders...
        </p>
      )}
      <div className="pt-[60px] sm:pt-0 space-y-4">
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center">No orders found.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              onClick={() =>
                navigate(`/crm/orders/${order.id}`, { state: { order } })
              }
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

              <div className="flex items-center gap-2 text-gray-700">
                <FaIdBadge className="text-green-600" /> {order.ss_party_name}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
