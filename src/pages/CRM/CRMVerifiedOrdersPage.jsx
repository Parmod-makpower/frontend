// 📁 src/pages/CRMVerifiedOrdersPage.jsx
import { useState, useEffect } from "react";
import API from "../../api/axios";

export default function CRMVerifiedOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Date filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Edit
  const [editOrder, setEditOrder] = useState(null);
  const [updatedNotes, setUpdatedNotes] = useState("");
  const [updatedItems, setUpdatedItems] = useState([]);

  // Compare
  const [viewData, setViewData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, page_size: pageSize };
      if (startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      const res = await API.get("/crm/verified-orders/", { params });
      setOrders(res.data.results);
      setTotalPages(Math.ceil(res.data.count / pageSize));
    } catch (error) {
      console.error("Error fetching verified orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCompare = async (orderId) => {
    setViewLoading(true);
    try {
      const res = await API.get(`/crm/verified-orders/${orderId}/detail/`);
      setViewData(res.data);
    } catch (e) {
      console.error("Compare detail load failed:", e);
    } finally {
      setViewLoading(false);
    }
  };

  const closeCompare = () => setViewData(null);

  const handleEditClick = (order) => {
    setEditOrder(order);
    setUpdatedNotes(order.notes || "");
    setUpdatedItems(order.items.map((item) => ({ ...item })));
  };

  const handleQuantityChange = (itemId, value) => {
    setUpdatedItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: Number(value) } : item
      )
    );
  };

  const handleUpdateOrder = async () => {
    try {
      await API.patch(`/crm/verified-orders/${editOrder.id}/update/`, {
        notes: updatedNotes,
        items: updatedItems.map((i) => ({
          id: i.id,
          quantity: i.quantity,
        })),
      });
      setEditOrder(null);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, startDate, endDate]);

  if (loading) return <p className="p-4">Loading verified orders...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">CRM Verified Orders History</h1>

      {/* Date Filter */}
      <div className="flex gap-2 mb-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border px-2 py-1"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border px-2 py-1"
        />
        <button
          className="bg-indigo-600 text-white px-3 py-1 rounded"
          onClick={() => setPage(1)} // refresh with new filter
        >
          Apply Filter
        </button>
        <button
          className="bg-gray-400 text-white px-3 py-1 rounded"
          onClick={() => {
            setStartDate("");
            setEndDate("");
            setPage(1);
          }}
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-50">
            <th className="border px-4 py-2">Order ID</th>
            <th className="border px-4 py-2">Party Name</th>
            <th className="border px-4 py-2">Date/Time</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{order.order_id}</td>
              <td className="border px-4 py-2">{order.party_name}</td>
              <td className="border px-4 py-2">
                {new Date(order.verified_at).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </td>
              <td className="border px-4 py-2 space-x-2">
                <button
                  className="bg-indigo-600 text-white px-2 py-1 rounded"
                  onClick={() => openCompare(order.id)}
                >
                  View
                </button>
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => handleEditClick(order)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Compare Modal */}
      {viewData && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded w-[900px] max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-lg font-bold">Order Compare</h2>
              <button
                className="px-3 py-1 bg-gray-200 rounded"
                onClick={closeCompare}
              >
                Close
              </button>
            </div>

            {viewLoading ? (
              <p>Loading details...</p>
            ) : (
              <div> {/* आपका पुराना compare वाला code यहाँ रहेगा */} </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded w-96 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Edit Verified Order</h2>

            {updatedItems.map((item) => (
              <div key={item.id} className="mb-4">
                <label className="block font-semibold">{item.product_name}</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(item.id, e.target.value)
                  }
                  className="border px-2 py-1 w-full"
                />
              </div>
            ))}

            <label className="block mb-2">Notes</label>
            <textarea
              value={updatedNotes}
              onChange={(e) => setUpdatedNotes(e.target.value)}
              className="border px-2 py-1 w-full mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-400 text-white px-3 py-1 rounded"
                onClick={() => setEditOrder(null)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-3 py-1 rounded"
                onClick={handleUpdateOrder}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
