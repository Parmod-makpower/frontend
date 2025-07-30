import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function CRMOrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loader = useRef(null);
  const observerRef = useRef(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const navigate = useNavigate();

  const formatDateTime = (datetime) =>
    new Date(datetime).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });

  const buildUrl = (pageNo = 1) => {
    let url = `/orders/crm-orders/history/?page=${pageNo}&`;
    if (status) url += `status=${status}&`;
    if (start) url += `start=${start}&`;
    if (end) url += `end=${end}&`;
    return url;
  };

  const fetchOrders = async (pageNo = 1, replace = false) => {
    setLoading(true);
    try {
      const res = await API.get(buildUrl(pageNo));
      const newData = res.data.results || [];

      setOrders((prev) => {
        const combined = replace ? newData : [...prev, ...newData];
        const uniqueMap = new Map();
        combined.forEach((order) => uniqueMap.set(order.id, order));
        return Array.from(uniqueMap.values());
      });

      setHasMore(Boolean(res.data.next));
      setPage(pageNo + 1);
    } catch (err) {
      console.error("❌ Error fetching CRM orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Filter change: reset page and orders
  useEffect(() => {
    setOrders([]);
    setPage(1);
    fetchOrders(1, true); // replace = true
  }, [status, start, end]);

  // 👁️ Infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchOrders(page); // replace = false
        }
      },
      { threshold: 1 }
    );

    if (loader.current) obs.observe(loader.current);
    observerRef.current = obs;

    return () => observerRef.current?.disconnect();
  }, [loader, hasMore, loading, page]);

  return (
    <div className="min-h-screen mx-auto p-4 space-y-6">
      {/* <h2 className="text-xl font-bold text-center text-blue-700">📋 CRM Verified Order History</h2> */}

      {/* 🔍 Filter Toggle (Mobile) */}
      <div className="md:hidden flex justify-end">
        <button
          onClick={() => setShowFilterModal(true)}
          className="text-sm px-3 py-1 border rounded bg-blue-50 text-blue-700"
        >
          🔍 Filters
        </button>
      </div>

      {/* 🧰 Desktop Filter */}
      <div className="hidden md:flex flex-wrap gap-3 text-sm justify-center">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border px-2 py-1 rounded">
          <option value="">All Status</option>
          <option value="APPROVED">✅ Approved</option>
          <option value="REJECTED">❌ Rejected</option>
          <option value="FORWARDED">📤 Forwarded</option>
        </select>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="border px-2 py-1 rounded" />
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="border px-2 py-1 rounded" />
      </div>

      {/* 📦 Orders List */}
      {orders.length === 0 ? (
        <p className="text-sm text-center text-gray-500">No orders found.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li
              key={`order-${order.id}`} // ✅ Fix: stable unique key
              onClick={() => navigate(`/crm-orders/${order.id}/detail`)}
              className="borde rounded p-3 flex justify-between items-center bg-white hover:bg-gray-50 cursor-pointer shadow-sm"
            >
              <div>
                <div className="font-semibold text-xs">
                  {order.ss_order.order_id} |{" "}
                  <span className="text-gray-600">{order.ss_order.party_name}</span>
                </div>
                <div className="text-xs text-gray-500">{formatDateTime(order.verified_at)}</div>
              </div>
              <div
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  order.status === "APPROVED"
                    ? "bg-green-100 text-green-800"
                    : order.status === "REJECTED"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {order.status}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ⏳ Infinite Scroll Loader */}
      <div ref={loader} className="h-10" />
      {loading && (
        <div className="flex justify-center py-2">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 📱 Filter Modal (Mobile) */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-md shadow-lg p-5 w-11/12 max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-blue-700">🔍 Filter Orders</h3>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            >
              <option value="">All Status</option>
              <option value="APPROVED">✅ Approved</option>
              <option value="REJECTED">❌ Rejected</option>
              <option value="FORWARDED">📤 Forwarded</option>
            </select>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            />
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            />
            <div className="flex justify-between text-sm pt-2">
              <button
                className="px-4 py-1 bg-blue-600 text-white rounded"
                onClick={() => setShowFilterModal(false)}
              >
                Apply
              </button>
              <button
                className="px-4 py-1 bg-gray-300 text-gray-800 rounded"
                onClick={() => setShowFilterModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
