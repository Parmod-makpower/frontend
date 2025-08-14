// src/pages/AdminCRMVerifiedOrdersPage.jsx
import { useEffect, useState } from "react";
import API from "../api/axios";

export default function AdminCRMVerifiedOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewData, setViewData] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [crmId, setCrmId] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (crmId) params.append("crm_id", crmId);

      const res = await API.get(`/crm/verified-orders/?${params.toString()}`);
      setOrders(res.data.results || res.data);
      if (res.data.count) {
        setTotalPages(Math.ceil(res.data.count / 10)); // Assuming PAGE_SIZE = 10
      }
    } finally {
      setLoading(false);
    }
  };

  const openCompare = async (id) => {
    const res = await API.get(`/crm/verified-orders/${id}/detail/`);
    setViewData(res.data);
  };

  useEffect(() => {
    fetchOrders();
  }, [page, startDate, endDate, crmId]);

  return (
    <div className="p-4">

      {/* Filters */}
      <div className="mb-4 flex gap-3 flex-wrap">
        <div>
          <label className="block text-sm">Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border px-2 py-1 rounded" />
        </div>
        <div>
          <label className="block text-sm">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border px-2 py-1 rounded" />
        </div>
        <div>
          <label className="block text-sm">CRM ID</label>
          <input type="number" value={crmId} onChange={e => setCrmId(e.target.value)} className="border px-2 py-1 rounded" />
        </div>
        <button onClick={() => setPage(1)} className="bg-blue-600 text-white px-3 py-1 rounded self-end">Apply</button>
      </div>

      {/* Orders Table */}
      {loading ? <p>Loading...</p> : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-50">
              <th className="border px-4 py-2">Order ID</th>
              <th className="border px-4 py-2">Party Name</th>
              <th className="border px-4 py-2">CRM</th>
              <th className="border px-4 py-2">Date/Time</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{o.order_id}</td>
                <td className="border px-4 py-2">{o.party_name}</td>
                <td className="border px-4 py-2">{o.crm_name}</td>
                <td className="border px-4 py-2">
                  {new Date(o.verified_at).toLocaleString("en-GB", {
                    day: "2-digit", month: "2-digit", year: "numeric",
                    hour: "2-digit", minute: "2-digit", second: "2-digit",
                  })}
                </td>
                <td className="border px-4 py-2">
                  <button className="bg-indigo-600 text-white px-2 py-1 rounded" onClick={() => openCompare(o.id)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination controls */}
      <div className="mt-4 flex justify-center gap-2">
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded">Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded">Next</button>
      </div>

      {/* Compare View Modal */}
      {viewData && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-100">
          <div className="bg-white p-4 rounded w-[900px] max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between mb-3">
              <h2 className="text-lg font-bold">Order Compare</h2>
              <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => setViewData(null)}>Close</button>
            </div>

            {/* Comparison Blocks */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border rounded p-3">
                <h3 className="font-semibold mb-2">SS Original Order</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><span className="font-medium">Order ID:</span> {viewData?.original_order_detail?.id}</div>
                  <div><span className="font-medium">SS Name:</span> {viewData?.original_order_detail?.ss_user_name}</div>
                  <div><span className="font-medium">Created:</span> {new Date(viewData?.original_order_detail?.created_at).toLocaleString()}</div>
                  <div><span className="font-medium">Total:</span> ₹{viewData?.original_order_detail?.total_amount}</div>
                </div>
              </div>
              <div className="border rounded p-3">
                <h3 className="font-semibold mb-2">CRM Verified Order</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><span className="font-medium">Verified ID:</span> {viewData?.verified_order_detail?.id}</div>
                  <div><span className="font-medium">CRM:</span> {viewData?.verified_order_detail?.crm_name}</div>
                  <div><span className="font-medium">Status:</span> {viewData?.verified_order_detail?.status}</div>
                  <div><span className="font-medium">Verified:</span> {viewData?.verified_order_detail?.verified_at ? new Date(viewData?.verified_order_detail?.verified_at).toLocaleString() : "-"}</div>
                  <div><span className="font-medium">Notes:</span> {viewData?.verified_order_detail?.notes || "-"}</div>
                  <div><span className="font-medium">Total:</span> ₹{viewData?.verified_order_detail?.total_amount}</div>
                </div>
              </div>
            </div>

            {/* Product-wise Comparison Table */}
            <div className="border rounded">
              <div className="px-3 py-2 font-semibold bg-gray-50 border-b">Product-wise Comparison</div>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border px-3 py-2 text-left">Product</th>
                    <th className="border px-3 py-2 text-right">SS Qty</th>
                    <th className="border px-3 py-2 text-right">CRM Qty</th>
                    <th className="border px-3 py-2 text-right">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {viewData?.compare?.map((row) => (
                    <tr key={row.product} className="hover:bg-gray-50">
                      <td className="border px-3 py-2">{row.product_name}</td>
                      <td className="border px-3 py-2 text-right">{row.ss_qty}</td>
                      <td className="border px-3 py-2 text-right">{row.crm_qty}</td>
                      <td className={`border px-3 py-2 text-right ${row.delta > 0 ? "text-green-600" : row.delta < 0 ? "text-red-600" : ""}`}>
                        {row.delta}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
