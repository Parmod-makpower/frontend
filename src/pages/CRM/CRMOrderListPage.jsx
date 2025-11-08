import { useState } from "react";
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

  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        Loading orders...
      </div>
    );

  // ✅ Badge logic
  const getOrderBadge = (note) => {
    const n = (note || "").toLowerCase();

    if (n.includes("battery"))
      return { label: "Battery", class: "bg-yellow-100 text-yellow-700" };

    if (n.includes("non") || n.includes("accessor"))
      return { label: "Accessory", class: "bg-blue-100 text-blue-700" };

    if (n.includes("tempered"))
      return { label: "Tempered", class: "bg-red-100 text-red-700" };

    return { label: "General", class: "bg-gray-100 text-gray-700" };
  };

  // ✅ Search filter
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    return (
      order.order_id.toLowerCase().includes(term) ||
      order.ss_party_name.toLowerCase().includes(term)
    );
  });

  // ✅ GROUPING LOGIC — Today / Yesterday / Older
  const today = [];
  const yesterday = [];
  const older = [];

  filteredOrders.forEach((order) => {
    const orderDate = new Date(order.created_at);
    const now = new Date();

    const isToday =
      orderDate.getDate() === now.getDate() &&
      orderDate.getMonth() === now.getMonth() &&
      orderDate.getFullYear() === now.getFullYear();

    const yesterdayDate = new Date();
    yesterdayDate.setDate(now.getDate() - 1);

    const isYesterday =
      orderDate.getDate() === yesterdayDate.getDate() &&
      orderDate.getMonth() === yesterdayDate.getMonth() &&
      orderDate.getFullYear() === yesterdayDate.getFullYear();

    if (isToday) today.push(order);
    else if (isYesterday) yesterday.push(order);
    else older.push(order);
  });

  // ✅ Section Label Component
  const SectionLabel = ({ title }) => (
    <p className="text-xs font-semibold text-gray-500 ml-1 mt-3 mb-1">
      {title}
    </p>
  );

  // ✅ Render Order Card (Reusable)
  const renderOrderCard = (order) => {
    const badge = getOrderBadge(order.note);

    return (
      <div
        key={order.id}
        onClick={() =>
          navigate(`/crm/orders/${order.id}`, { state: { order } })
        }
        className="relative bg-white p-4 rounded-2xl shadow-sm border border-gray-100 
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
        </div>

        {/* Party Name */}
        <div className="flex items-center gap-2 pb-2 text-gray-700 text-sm">
          <FaIdBadge className="text-green-600" />
          <span className="font-medium">{order.ss_party_name}</span>
        </div>

        {/* ✅ Bottom Right Time */}
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

  // ✅ FINAL RENDER
  return (
    <div className="p-3 max-w-4xl mx-auto pb-24">
      <MobilePageHeader title="My Orders" />

      {isFetching && (
        <p className="text-center text-xs text-gray-500 mt-1 animate-pulse">
          Updating orders...
        </p>
      )}

      {/* ✅ Search Bar */}
      <div className="pt-[65px] sm:pt-6 mb-4">
        <input
          type="text"
          placeholder="Search by Order ID or Party Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <p className="text-gray-500 text-center text-sm">
            No matching orders found.
          </p>
        ) : (
          <>
            {today.length > 0 && <SectionLabel title="Today" />}
            {today.map((order) => renderOrderCard(order))}

            {yesterday.length > 0 && <SectionLabel title="Yesterday" />}
            {yesterday.map((order) => renderOrderCard(order))}

            {older.length > 0 && <SectionLabel title="Older Orders" />}
            {older.map((order) => renderOrderCard(order))}
          </>
        )}
      </div>
    </div>
  );
}
