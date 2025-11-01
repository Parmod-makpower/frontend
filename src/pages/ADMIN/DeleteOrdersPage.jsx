import { useNavigate } from "react-router-dom";
import { useState } from "react";
import MobilePageHeader from "../../components/MobilePageHeader";
import { useDeleteOrders, useDeleteOrder } from "../../hooks/useDeleteOrders";
import { FaTrash } from "react-icons/fa";

export default function DeleteOrdersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isFetching } = useDeleteOrders(page);
  const { mutate: deleteOrder } = useDeleteOrder();

  const orders = data?.results || [];
  const totalPages = Math.ceil(data?.count / 10) || 1;

  if (isLoading) return <p className="p-4">Loading orders...</p>;

  // 🔍 Filter logic
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    return (
      order.order_id?.toLowerCase().includes(term) ||
      order.ss_party_name?.toLowerCase().includes(term) ||
      order.crm_name?.toLowerCase().includes(term)
    );
  });

  const handleDelete = (orderId) => {
    const confirmDelete = window.confirm(
      `Do you want to delete this Order ID: ${orderId}?`
    );
    if (confirmDelete) {
      deleteOrder(orderId);
    }
  };

  return (
    <div className="p-2 pb-20">
      <MobilePageHeader title="My Orders" />

      {isFetching && (
        <p className="text-center text-sm text-gray-400 mt-2">
          🔄 Updating orders...
        </p>
      )}

      {/* 🔍 Search Bar */}
      <div className="mb-4 mt-2">
        <input
          type="text"
          placeholder="Search by Order ID, Party or CRM..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full text-sm focus:outline-none"
        />
      </div>

      <div className="border rounded shadow-sm pt-[60px] sm:pt-0 overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-gray-900 text-sm font-semibold">
            <tr>
              <th className="p-3 border w-12 text-center">S.No.</th>
              <th className="p-3 border">Order ID</th>
              <th className="p-3 border">Party Name</th>
              <th className="p-3 border">CRM Name</th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border text-center w-16">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center text-gray-500 py-4 italic"
                >
                  No matching orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order, index) => (
                <tr
                  key={order.id}
                  className="border-t hover:bg-yellow-50"
                >
                  <td className="p-3 border text-center font-medium">
                    {(page - 1) * 10 + index + 1}
                  </td>
                  <td
                    className="p-3 border font-medium cursor-pointer"
                    onClick={() =>
                      navigate(`/admin/pending-orders/${order.id}`, {
                        state: { order },
                      })
                    }
                  >
                    {order.order_id}
                  </td>
                  <td className="p-3 border">{order.ss_party_name}</td>
                  <td className="p-3 border">{order.crm_name}</td>
                  <td className="p-3 border">
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                  <td className="p-3 border text-center">
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination Controls */}
      <div className="flex justify-center mt-4 gap-4 text-sm">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="font-medium">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
