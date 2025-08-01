import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import { IoChevronBack } from "react-icons/io5";


export default function CRMOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    API.get(`/orders/crm-orders/${id}/detail/`)
      .then((res) => setOrder(res.data))
      .catch((err) => console.error("Failed to load order", err));
  }, [id]);

  if (!order) return <div className="p-6 text-center text-sm">Loading...</div>;

  const ssOrder = order.ss_order;

  const formatDateTime = (datetime) => {
    return new Date(datetime).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="  space-y-6">
        <div className="fixed top-0 left-0 right-0 z-50 bg-white p-3 border-b border-gray-200 shadow-sm sm:static sm:mx-4 sm:rounded-md sm:shadow-md sm:border transition-all duration-200 ease-in-out">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.history.back()}
                  className="text-gray-700 hover:text-blue-600 text-xl px-1 transition-transform hover:scale-105"
                  aria-label="Back"
                >
                  <IoChevronBack />
                </button>
                <span className="text-lg sm:text-xl font-semibold text-gray-800">
                  Details
                </span>
              </div>
            </div>
    <div className="pt-[60px]">
      {/* Order Summary */}
      <div className="bg-white shadow rounded p-5 space-y-2 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">🧾 {ssOrder.party_name}</h3>
        <div className="grid grid-cols-1 gap-0 text-sm">
          <div><span className="text-xs"> {ssOrder.order_id}</span></div>
          <div><span className="text-xs">{formatDateTime(ssOrder.placed_at)}</span> </div>
        </div>
      </div>

      {/* SS & CRM Items Side-by-Side */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* SS Ordered Items */}
  <div className="bg-white shadow rounded p-4 border border-gray-200">
    <h3 className="text-lg font-semibold mb-3 text-gray-700">📄 SS Ordered Items</h3>
    <table className="w-full text-sm border">
      <thead className="bg-gray-100 text-left">
        <tr>
          <th className="p-2 border">#</th>
          <th className="p-2 border">Product</th>
          <th className="p-2 border">Qty</th>
         
        </tr>
      </thead>
      <tbody>
        {ssOrder.items.map((item, i) => (
          <tr key={i} className="hover:bg-gray-50">
            <td className="p-2 border">{i + 1}</td>
            <td className="p-2 border">{item.sale_name}</td>
            <td className="p-2 border">{item.quantity}</td>
           
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* CRM Verified Items */}
  <div className="bg-white shadow rounded p-4 border border-gray-200">
    <h3 className="text-lg font-semibold mb-3 text-green-700">✅ CRM Verified Items</h3>
    <table className="w-full text-sm border">
      <thead className="bg-green-50 text-left">
        <tr>
          <th className="p-2 border">#</th>
          <th className="p-2 border">Product</th>
          <th className="p-2 border">Qty</th>
        
        </tr>
      </thead>
      <tbody>
        {order.items.map((item, i) => (
          <tr key={i} className="hover:bg-green-50">
            <td className="p-2 border">{i + 1}</td>
            <td className="p-2 border">{item.sale_name}</td>
            <td className="p-2 border">{item.quantity}</td>
          
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

{/* SS Applied Schemes */}
<div className="bg-white shadow rounded p-4 border border-gray-200">
  <h3 className="text-lg font-semibold mb-3 text-indigo-700">🎯 SS Applied Schemes</h3>
  {ssOrder.applied_schemes.length === 0 ? (
    <p className="text-sm text-gray-500">No schemes applied.</p>
  ) : (
    <table className="w-full text-sm border">
      <thead className="bg-indigo-50 text-left">
        <tr>
          <th className="p-2 border">#</th>
          <th className="p-2 border">Scheme Product</th>
          <th className="p-2 border">Quantity</th>
        </tr>
      </thead>
      <tbody>
        {ssOrder.applied_schemes.flatMap((scheme, i) =>
          scheme.rewards.map((reward, j) => (
            <tr key={`${i}-${j}`} className="hover:bg-indigo-50">
              <td className="p-2 border">{i + 1}.{j + 1}</td>
              <td className="p-2 border">{reward.sale_name}</td>
              <td className="p-2 border">{reward.quantity}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )}
</div>


      {/* Verified Schemes */}
      <div className="bg-white shadow rounded p-5 border border-gray-200">
        <h3 className="text-lg font-semibold mb-3 text-purple-700">🎁 Verified Schemes</h3>
        {order.verified_schemes.length === 0 ? (
          <p className="text-sm text-gray-500">No schemes applied.</p>
        ) : (
          <table className="w-full text-sm border">
            <thead className="bg-purple-50 text-left">
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">Scheme Product</th>
                <th className="p-2 border">Quantity</th>
              
              </tr>
            </thead>
            <tbody>
              {order.verified_schemes.map((s, i) => (
                <tr key={i} className="hover:bg-purple-50">
                  <td className="p-2 border">{i + 1}</td>
                  <td className="p-2 border">{s.sale_name}</td>
                  <td className="p-2 border">{s.quantity}</td>
                 
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Status Section */}
      <div className="bg-blue-50 border border-blue-200 rounded p-5">
        <h3 className="text-lg font-semibold mb-2 text-blue-700">📊 Verification Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium">Status:</span> {order.status}</div>
          <div><span className="font-medium">Verified By:</span> {order.verified_by}</div>
          <div><span className="font-medium">Verified At:</span> {formatDateTime(order.verified_at)}</div>
          <div><span className="font-medium">Notes:</span> {order.notes || "-"}</div>
        </div>
      </div>
      </div>
    </div>
  );
}
