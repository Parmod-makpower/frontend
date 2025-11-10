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
        <div className="mt-6 space-y-6">

          {/* SS ORDER */}
          <div className="border p-4 rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold mb-3">🟦 SS Order</h2>

            <p><strong>Order ID:</strong> {orderData.order_id}</p>
            <p><strong>SS User:</strong> {orderData.ss_user}</p>
            <p><strong>Total:</strong> {orderData.total_amount}</p>

            <h3 className="font-semibold mt-2">Items:</h3>
            {orderData.ss_items.map((i, idx) => (
              <p key={idx}>
                ✅ {i.product_name} — {i.quantity}
              </p>
            ))}
          </div>

          {/* CRM SECTION */}
          {orderData.crm_data ? (
            <div className="border p-4 rounded-lg bg-blue-50">
              <h2 className="text-xl font-semibold mb-3">🟧 CRM Verification</h2>

              <p><strong>Status:</strong> {orderData.crm_data.status}</p>
              <p><strong>CRM:</strong> {orderData.crm_data.crm_user}</p>
              <p><strong>Notes:</strong> {orderData.crm_data.notes}</p>

              <h3 className="font-semibold mt-2">CRM Items:</h3>
              {orderData.crm_data.items.map((i, idx) => (
                <p key={idx}>
                  {i.product_name} — {i.quantity} 
                  {i.is_rejected && " ❌ (Rejected)"}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">CRM verification pending...</p>
          )}

          {/* DISPATCH */}
          <div className="border p-4 rounded-lg bg-green-50">
            <h2 className="text-xl font-semibold mb-3">🟩 Dispatch</h2>

            {orderData.dispatch_data.length > 0 ? (
              orderData.dispatch_data.map((d, idx) => (
                <p key={idx}>✅ {d.product} — {d.quantity}</p>
              ))
            ) : (
              <p>No dispatch yet.</p>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
