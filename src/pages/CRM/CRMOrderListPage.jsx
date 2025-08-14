import { useState, useEffect } from "react";
import { getCRMOrders } from "../../hooks/useCRMOrders";
import { useNavigate } from "react-router-dom";

export default function CRMOrderListPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getCRMOrders();
      setOrders(data);
    } catch (error) {
      console.error("❌ Error fetching CRM orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p className="p-4">Loading orders...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">CRM Orders</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Order ID</th>
            <th className="border p-2">Party Name</th>
            <th className="border p-2">Total Amount</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="border p-2">{order.order_id}</td>
              <td className="border p-2">{order.ss_party_name}</td>
              <td className="border p-2">{order.total_amount}</td>
              <td className="border p-2">
                <button
                  onClick={() => navigate(`/crm/orders/${order.id}`)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Verify
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
