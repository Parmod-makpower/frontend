import { useNavigate } from "react-router-dom";
import { useState } from "react";
import MobilePageHeader from "../../components/MobilePageHeader";
import { useCRMOrders } from "../../hooks/useCRMOrders";

export default function SSPendingOrders() {
  const navigate = useNavigate();
  const { data: orders = [], isLoading, isFetching } = useCRMOrders();

  const [searchTerm, setSearchTerm] = useState("");

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

      <div className="border rounded shadow-sm pt-[60px] sm:pt-0">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-gray-900 text-sm font-semibold">
            <tr>
              <th className="p-3 border w-12 text-center">S.No.</th>
              <th className="p-3 border">Order ID</th>
              <th className="p-3 border">Party Name</th>
              <th className="p-3 border">CRM Name</th>
              <th className="p-3 border">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center text-gray-500 py-4 italic"
                >
                  No matching orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order, index) => (
                <tr
                  key={order.id}
                  onClick={() =>
                    navigate(`/admin/pending-orders/${order.id}`, {
                      state: { order },
                    })
                  }
                  className="border-t hover:bg-yellow-50 cursor-pointer"
                >
                  <td className="p-3 border text-center font-medium">
                    {index + 1}
                  </td>
                  <td className="p-3 border font-medium">{order.order_id}</td>
                  <td className="p-3 border">{order.ss_party_name}</td>
                  <td className="p-3 border">{order.crm_name}</td>
                  <td className="p-3 border">
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
