import { useState } from "react";
import API from "../../api/axios";

export default function OrderTrackPage() {
  const [orderId, setOrderId] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOrder = async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      const res = await API.get(`/track-order/${orderId}/`);
      setOrderData(res.data);
    } catch {
      alert("Order not found");
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Order Tracking</h1>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter Order ID"
          className="border p-2 flex-1 rounded"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
        <button
          onClick={fetchOrder}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Track
        </button>
      </div>

      {loading && <p className="mt-4">Loading...</p>}
{orderData && (
  <div className="mt-8">
    
    {/* Header Info */}
    <div className="mb-6 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-2">Order Details</h2>
      <p><strong>Order ID:</strong> {orderData.order_id}</p>
      <p><strong>SS User:</strong> {orderData.ss_user}</p>
      <p><strong>Status:</strong> {orderData.status}</p>
      <p><strong>Total Amount:</strong> ₹{orderData.total_amount}</p>
    </div>

    {/* Comparison Table */}
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border rounded-lg shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2 text-left">Product</th>
            <th className="border px-3 py-2 text-center">SS Qty</th>
            <th className="border px-3 py-2 text-center">CRM Qty</th>
            <th className="border px-3 py-2 text-center">CRM Status</th>
            <th className="border px-3 py-2 text-center">Dispatch Qty</th>
          </tr>
        </thead>

        <tbody>

          {orderData.ss_items.map((ssItem, index) => {
            const crmItem = orderData.crm_data?.items.find(
              (ci) => ci.product_id === ssItem.product_id
            );

            const dispatchItem = orderData.dispatch_data.find(
              (di) => di.product === ssItem.product_name
            );

            return (
              <tr key={index} className="hover:bg-gray-50">

                {/* Product */}
                <td className="border px-3 py-2 font-medium">
                  {ssItem.product_name}
                </td>

                {/* SS Qty */}
                <td className="border px-3 py-2 text-center bg-blue-50">
                  {ssItem.quantity}
                </td>

                {/* CRM Qty */}
                <td className="border px-3 py-2 text-center bg-yellow-50">
                  {crmItem ? crmItem.quantity : "--"}
                </td>

                {/* CRM Status */}
                <td className="border px-3 py-2 text-center">
                  {!crmItem ? (
                    <span className="text-gray-500">PENDING</span>
                  ) : crmItem.is_rejected ? (
                    <span className="text-red-600 font-semibold">REJECTED</span>
                  ) : (
                    <span className="text-green-600 font-semibold">APPROVED</span>
                  )}
                </td>

                {/* Dispatch Qty */}
                <td className="border px-3 py-2 text-center bg-green-50">
                  {dispatchItem ? dispatchItem.quantity : "--"}
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {/* CRM Notes */}
    {orderData.crm_data && (
      <div className="mt-4 p-3 bg-blue-50 border rounded">
        <strong>CRM Notes:</strong> {orderData.crm_data.notes || "No notes"}
      </div>
    )}

  </div>
)}

    </div>
  );
}
