import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobilePageHeader from "../../components/MobilePageHeader";
import {
  FaCalendarAlt,
  FaHeadphonesAlt,
  FaIdBadge,
  FaMobileAlt,
  FaShoppingBag,
} from "react-icons/fa";
import { useCRMOrders } from "../../hooks/useCRMOrders";
import CRMOrderListFilterMenu from "../../components/CRMOrderListFilterMenu";
import { IoChevronBack } from "react-icons/io5";

export default function CRMOrderListPage() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState("PENDING");
  const { data: orders = [], isLoading, isFetching } = useCRMOrders(filterStatus);


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
      return { label: "Accessories", class: "text-purple-700", icon: <FaHeadphonesAlt className="text-purple-600" />, };

    if (n.includes("tempered"))
      return { label: "Tempered", class: "text-blue-700", icon: <FaMobileAlt className="text-blue-600" />, };

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
    <p className="text-xs font-semibold text-gray-500 ml-1 mt-3 mb-1 ">
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
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
          {/* Order ID + Badge */}
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold"> {order.order_id} </h2>
          </div>
          <span
            className={`flex items-center gap-1 text-xs font-semibold ${badge.class}`}
          >
            {badge.icon}
            {badge.label}
          </span>
          
        </div>

        {/* Party Name */}
        <span className="text-xs">{order.ss_party_name}</span>

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
    <div className="p-3  pb-24">
      {/* <MobilePageHeader title="My Orders" /> */}

      {isFetching && (
        <p className="text-center text-xs text-gray-500 mt-1 animate-pulse">
          Updating orders...
        </p>
      )}

      <div className="fixed sm:static top-0 left-0 right-0 z-50 bg-white p-3 border-b border-gray-300 shadow flex items-center gap-2 sm:rounded  sm:border sm:border-black sm:py-2 ">
        <button
          onClick={() => window.history.back()}
          className="sm:hidden text-gray-700 hover:text-blue-600 text-2xl font-bold px-1 transition-transform hover:scale-105"
        >
          <IoChevronBack />
        </button>

        <input
          type="text"
          placeholder="Search by Order ID or Party Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent text-sm sm:text-base focus:outline-none placeholder-gray-400 "
        />
        <CRMOrderListFilterMenu
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />
      </div>




      <div className="space-y-4 pt-[60px] sm:pt-5">
        {filteredOrders.length === 0 ? (
          <p className="text-gray-500 text-center text-sm">
            No matching orders found.
          </p>
        ) : (
          <>
            {today.length > 0 && <SectionLabel title="Today" />}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {today.map((order) => renderOrderCard(order))}
            </div>

            {yesterday.length > 0 && <SectionLabel title="Yesterday" />}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {yesterday.map((order) => renderOrderCard(order))}
            </div>

            {older.length > 0 && <SectionLabel title="Older Orders" />}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {older.map((order) => renderOrderCard(order))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
