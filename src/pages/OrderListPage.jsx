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
  FaFilter,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import OrderFilterDrawer from "../components/OrderFilterDrawer";
import { IoChevronBack } from "react-icons/io5";


const OrderListPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [filters, setFilters] = useState({
    order_id: "",
    party_name: "",
    from_date: "",
    to_date: "",
  });
  const { data: orders = [], isLoading, isError, refetch } = useOrders(filters);

  useEffect(() => {
    const timer = setTimeout(() => {
      refetch();
    }, 200); // 200ms delay safe kar deta hai

    return () => clearTimeout(timer);
  }, []);



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
          {/* <p>{order.ss_name}</p> */}
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
    <div className="px-4">

      <div className="fixed sm:hidden top-0 left-0 right-0 z-50 bg-white p-3 border-b border-gray-300 shadow flex items-center justify-between">

        <button
          onClick={() => window.history.back()}
          className="text-gray-700 hover:text-blue-600 text-2xl font-bold px-1 transition-transform hover:scale-105"
        >
          <IoChevronBack />
        </button>
        <div className="text-sm text-gray-700 ps-3">
          Filter Orders: <span className="font-semibold">{orders.length}</span>
        </div>

        <button
          onClick={() => setDrawerOpen(true)}
          className="px-3 py-2 text-blue-800 text-sm flex items-center gap-2"
        >
          <FaFilter /> Filters
        </button>
      </div>

      {/* 🔥 ORDER COUNT for mobile */}


      <div className="hidden sm:flex justify-between items-center mb-3 bg-red-300 px-3 py-1 rounded">
        <p className="text-sm ">
          Filter Orders: <span className="font-semibold">{orders.length}</span>
        </p>

        <button
          onClick={() => setDrawerOpen(true)}
          className="px-3 py-1 text-blue-800 text-sm flex items-center gap-2 border border-blue rounded cursor-pointer hover:bg-blue-800 hover:text-white"
        >
          <FaFilter /> Filters
        </button>
      </div>


      <div className="space-y-4 pt-[60px] sm:pt-0 mb-20">
        {orders.length === 0 ? (
          <p className="text-center text-gray-500 italic mt-4">
            No orders found
          </p>
        ) : (
          <>
            {today.length > 0 && <SectionTitle title="Today" />}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {today.map((order) => renderOrderCard(order))}
            </div>

            {yesterday.length > 0 && <SectionTitle title="Yesterday" />}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {yesterday.map((order) => renderOrderCard(order))}
            </div>

            {older.length > 0 && <SectionTitle title="Older Orders" />}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {older.map((order) => renderOrderCard(order))}
            </div>

          </>
        )}
      </div>
      <OrderFilterDrawer
        open={drawerOpen}
        setOpen={setDrawerOpen}
        filters={filters}
        setFilters={setFilters}
        onApply={() => refetch()}   // 🔥 Only Apply → API
      />


    </div>
  );
};

export default OrderListPage;
