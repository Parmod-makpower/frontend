import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { IoChevronBack } from "react-icons/io5";
import { FaFilter } from "react-icons/fa";

export default function AdminOrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [crmId, setCrmId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [crms, setCrms] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loader = useRef(null);
  const observerRef = useRef(null);
  const navigate = useNavigate();

  const formatDateTime = (datetime) =>
    new Date(datetime).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });

  const buildUrl = (pageNo = 1) => {
    let url = `/orders/admin-orders/history/?page=${pageNo}&`;
    if (status) url += `status=${status}&`;
    if (crmId) url += `crm=${crmId}&`;
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
      console.error("❌ Error fetching orders", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCrms = async () => {
    try {
      const res = await API.get("/accounts/crm-users/");
      setCrms(res.data);
    } catch (err) {
      console.error("❌ Error loading CRMs", err);
    }
  };

  useEffect(() => {
    fetchCrms();
  }, []);

  useEffect(() => {
    setOrders([]);
    setPage(1);
    fetchOrders(1, true);
  }, [status, crmId, start, end]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchOrders(page);
        }
      },
      { threshold: 1 }
    );
    if (loader.current) obs.observe(loader.current);
    observerRef.current = obs;
    return () => observerRef.current?.disconnect();
  }, [loader, hasMore, loading, page]);

  return (
   <div className="max-w-5xl mx-auto px-4 py-2 space-y-4 bg-gray-50 min-h-screen">
 {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white p-3 border-b border-gray-200 shadow-sm sm:static sm:mx-4 sm:rounded-md sm:shadow-md sm:border transition-all duration-200 ease-in-out">
        <div className="flex items-center justify-between">

          {/* Back Button + Title */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.history.back()}
              className="text-gray-700 hover:text-blue-600 text-xl px-1 transition-transform hover:scale-105"
              aria-label="Back"
            >
              <IoChevronBack />
            </button>
            <span className="text-lg sm:text-xl font-semibold text-gray-800">
              History
            </span>
          </div>

          {/* Filter Button (mobile only) */}
          <div className="md:hidden">
            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-1 text-sm px-3 py-1 border rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
            >
              <FaFilter className="text-sm" />
              Filters
            </button>
          </div>

        </div>
      </div>

 <div className="pt-[60px]">

  {/* 🧰 Desktop Filters */}
  <div className="hidden md:flex flex-wrap gap-3 items-center text-sm bg-white px-4 py-3 rounded border shadow-sm">
    <select value={status} onChange={(e) => setStatus(e.target.value)} className="border px-2 py-1 rounded">
      <option value="">All Status</option>
      <option value="APPROVED">✅ Approved</option>
      <option value="REJECTED">❌ Rejected</option>
    </select>

    <select value={crmId} onChange={(e) => setCrmId(e.target.value)} className="border px-2 py-1 rounded">
      <option value="">All CRMs</option>
      {crms.map((crm) => (
        <option key={crm.id} value={crm.id}>
          {crm.name || crm.mobile}
        </option>
      ))}
    </select>

    <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="border px-2 py-1 rounded" />
    <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="border px-2 py-1 rounded" />
  </div>

  {/* 📋 Order List */}
  {orders.length === 0 ? (
    <p className="text-center text-gray-500 text-sm">No orders found.</p>
  ) : (
    <ul className="space-y-2">
      {orders.map((order) => (
        <li
          key={`order-${order.id}`}
          onClick={() => navigate(`/admin/orders/${order.id}/detail`)}
          className="bg-white border rounded px-3 py-2 shadow hover:shadow-md cursor-pointer transition flex justify-between items-center"
        >
          <div className="space-y-0.5">
            <div className="text-sm font-medium text-gray-800">
              {order.ss_order.order_id} ·{" "}
              <span className="text-gray-600">{order.ss_order.party_name}</span>
            </div>
            <div className="text-xs text-gray-500">{formatDateTime(order.verified_at)}</div>
            <div className="text-xs text-gray-500">CRM: {order.verified_by?.name || "N/A"}</div>
          </div>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              order.status === "APPROVED"
                ? "bg-green-100 text-green-800"
                : order.status === "REJECTED"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {order.status}
          </span>
        </li>
      ))}
    </ul>
  )}

  {/* ⏳ Loader */}
  <div ref={loader} className="h-8" />
  {loading && (
    <div className="flex justify-center py-1">
      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )}

  {/* 📱 Mobile Filter Modal */}
  {showFilterModal && (
    <div className="fixed inset-0  bg-opacity-30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-md shadow-lg p-4 w-11/12 max-w-sm space-y-3">
        <h3 className="text-base font-semibold text-indigo-700">🔍 Filter Orders</h3>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border px-2 py-1 rounded text-sm">
          <option value="">All Status</option>
          <option value="APPROVED">✅ Approved</option>
          <option value="REJECTED">❌ Rejected</option>
        </select>

        <select value={crmId} onChange={(e) => setCrmId(e.target.value)} className="w-full border px-2 py-1 rounded text-sm">
          <option value="">All CRMs</option>
          {crms.map((crm) => (
            <option key={crm.id} value={crm.id}>
              {crm.name || crm.mobile}
            </option>
          ))}
        </select>

        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-full border px-2 py-1 rounded text-sm" />
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full border px-2 py-1 rounded text-sm" />

        <div className="flex justify-between text-sm pt-1">
          <button
            className="px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={() => setShowFilterModal(false)}
          >
            Apply
          </button>
          <button
            className="px-4 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            onClick={() => setShowFilterModal(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )}
  </div>
</div>

  );
}
