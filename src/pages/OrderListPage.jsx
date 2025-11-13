import { useOrders } from "../hooks/useOrders";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import MobilePageHeader from "../components/MobilePageHeader";
import {
  FaBolt,
  FaMobileAlt,
  FaHeadphonesAlt,
  FaBoxOpen,
  FaCalendarAlt,
} from "react-icons/fa";

const OrderListPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: orders = [], isLoading, isError } = useOrders();

  if (isLoading)
    return <p className="text-center mt-10 text-gray-600">Loading orders...</p>;
  if (isError)
    return (
      <p className="text-center mt-10 text-red-500">
        Failed to load orders 😕
      </p>
    );

  // ✅ Status color logic
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ✅ Badge logic
  const getOrderBadge = (note) => {
    const n = (note || "").toLowerCase();

    if (n.includes("battery"))
      return {
        label: "Battery",
        class: "text-yellow-700",
        icon: <FaBolt className="text-yellow-600" />,
      };

    if (n.includes("tempered"))
      return {
        label: "Tempered",
        class: "text-blue-700",
        icon: <FaMobileAlt className="text-blue-600" />,
      };

    if (n.includes("accessorie"))
      return {
        label: "Accessories",
        class: "text-purple-700",
        icon: <FaHeadphonesAlt className="text-purple-600" />,
      };

    return {
      label: "General",
      class: "text-gray-600",
      icon: <FaBoxOpen className="text-gray-500" />,
    };
  };

  // ✅ Group orders by Today / Yesterday / Older
  const today = [];
  const yesterday = [];
  const older = [];

  orders.forEach((order) => {
    const orderDate = new Date(order.created_at);
    const now = new Date();

    const isToday =
      orderDate.getDate() === now.getDate() &&
      orderDate.getMonth() === now.getMonth() &&
      orderDate.getFullYear() === now.getFullYear();

    const yest = new Date();
    yest.setDate(now.getDate() - 1);

    const isYesterday =
      orderDate.getDate() === yest.getDate() &&
      orderDate.getMonth() === yest.getMonth() &&
      orderDate.getFullYear() === yest.getFullYear();

    if (isToday) today.push(order);
    else if (isYesterday) yesterday.push(order);
    else older.push(order);
  });

  // ✅ Section title component
  const SectionTitle = ({ title }) => (
    <p className="text-xs font-semibold text-gray-500 ml-1 mt-3 mb-1">{title}</p>
  );

  // ✅ Order Card component
  const renderOrderCard = (order) => {
    const badge = getOrderBadge(order.note);

    return (
      <div
        key={order.id}
        onClick={() => navigate(`/orders-tracking/${order.order_id}`)}
        className="bg-white rounded-xl shadow p-4 border border-gray-200 hover:shadow-md active:scale-[0.99] transition-transform duration-150 cursor-pointer relative"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-base font-semibold">{order.order_id}</h2>
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
              order.status
            )}`}
          >
            {order.status || ""}
          </span>
        </div>

        {/* Body */}
        <div className="text-sm text-gray-700 space-y-1">
          <div className="flex items-center gap-1 mt-1">
            <span
              className={`flex items-center gap-1 text-xs font-semibold ${badge.class}`}
            >
              {badge.icon}
              {badge.label}
            </span>
          </div>
        </div>

        {/* Time */}
        <div className="absolute bottom-2 right-3 flex items-center gap-1 text-gray-700 opacity-70 text-[10px]">
          <FaCalendarAlt className="text-gray-400 text-[10px]" />
          {new Date(order.created_at).toLocaleString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour12: true,
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <MobilePageHeader title="My Orders" />

      <div className="space-y-4 pt-[60px] sm:pt-0">
        {orders.length === 0 ? (
          <p className="text-center text-gray-500 italic mt-4">
            No orders found
          </p>
        ) : (
          <>
            {today.length > 0 && <SectionTitle title="Today" />}
            {today.map((order) => renderOrderCard(order))}

            {yesterday.length > 0 && <SectionTitle title="Yesterday" />}
            {yesterday.map((order) => renderOrderCard(order))}

            {older.length > 0 && <SectionTitle title="Older Orders" />}
            {older.map((order) => renderOrderCard(order))}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderListPage;
