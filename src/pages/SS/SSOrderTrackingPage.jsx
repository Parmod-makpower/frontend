// 📁 src/pages/SSOrderTrackingPage.jsx
import { useState, useEffect } from "react";
import API from "../../api/axios";
import { useParams } from "react-router-dom";
import {
  FaBoxOpen,
  FaRupeeSign,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaTruck,
  FaClipboardList,
  FaUser,
} from "react-icons/fa";

export default function SSOrderTrackingPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/ss-orders/${orderId}/track/`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading)
    return (
      <p className="p-4 text-center text-gray-500 text-sm animate-pulse">
        ⏳ Loading order details...
      </p>
    );

  if (!order)
    return (
      <p className="p-4 text-center text-red-500 text-sm">❌ Order not found</p>
    );

  const latestCRMStatus =
    order.crm_history && order.crm_history.length > 0
      ? order.crm_history[order.crm_history.length - 1].status.toLowerCase()
      : "pending";

  const steps = ["pending", "approved", "dispatch", "delivered"];

  let currentStepIndex = steps.indexOf(latestCRMStatus);
  if (currentStepIndex === -1) currentStepIndex = 0;
  const progressWidth =
    currentStepIndex === 0 ? 5 : (currentStepIndex / (steps.length - 1)) * 100;

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <FaCheckCircle className="text-green-500" />;
      case "rejected":
        return <FaTimesCircle className="text-red-500" />;
      case "pending":
        return <FaClock className="text-yellow-500" />;
      case "dispatch":
        return <FaTruck className="text-blue-500" />;
      case "delivered":
        return <FaCheckCircle className="text-green-600" />;
      default:
        return <FaClock className="text-gray-400" />;
    }
  };

  const getVerificationIcon = (status) =>
    status?.toLowerCase() === "rejected" ? (
      <FaTimesCircle className="text-red-500" />
    ) : (
      <FaCheckCircle className="text-green-500" />
    );

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6 text-xs sm:text-sm">
      {/* Order Header */}
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
        <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2 mb-1">
          <FaBoxOpen className="text-blue-500" /> {order.order_id}
        </h1>
        <p className="flex items-center gap-1 text-gray-700 font-medium">
          <FaRupeeSign className="text-green-600" /> {order.total_amount}
        </p>
      </div>

      {/* Progress Bar */}
      <div className=" ">
        <div className="flex justify-between mb-2 text-[10px] sm:text-xs font-medium text-gray-600">
          {steps.map((step) => (
            <div key={step} className="flex-1 text-center capitalize">
              {step}
            </div>
          ))}
        </div>
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute h-2 bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
            style={{ width: `${progressWidth}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1">
          {steps.map((step, index) => (
            <div key={step} className="flex-1 flex justify-center">
              {index <= currentStepIndex
                ? getStatusIcon(step)
                : getStatusIcon("pending")}
            </div>
          ))}
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
          📦 Items
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-[11px] sm:text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="border px-3 py-2 text-left">Product</th>
                <th className="border px-3 py-2 text-center">Qty</th>
                <th className="border px-3 py-2 text-center">Scheme</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => (
                <tr key={it.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{it.product_name}</td>
                  <td className="border px-3 py-2 text-center">{it.quantity}</td>
                  <td className="border px-3 py-2 text-center">
                    {it.is_scheme_item ? (
                      <span className="text-green-600 font-medium">Yes</span>
                    ) : (
                      "No"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

     {/* Verification History Timeline */}

  {(!order.crm_history || order.crm_history.length === 0) ? (
    <p className="text-gray-500">No verification yet</p>
  ) : (
    <div className="relative ">
      {order.crm_history.map((v) => (
        <div key={v.id} className="mb-6 relative ">
        
          <div className="p-3 sm:p-4 bg-gray-50 rounded-lg shadow-sm">
            {/* Header */}
            <p className="font-semibold flex items-center gap-1 text-sm">
              {getVerificationIcon(v.status)}
              {v.status.toUpperCase()}
            </p>
            <p className="text-[11px] sm:text-xs flex items-center gap-1 text-gray-600">
              <FaUser className="text-gray-500" /> {v.crm_name}
            </p>
            <p className="text-[10px] text-gray-500">
              {new Date(v.verified_at).toLocaleString()}
            </p>
            <p className="mt-2 text-xs">
              <strong>Notes:</strong> {v.notes || "-"}
            </p>

            {/* Items Table */}
            {v.items && v.items.length > 0 && (
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-[11px] sm:text-xs">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-2 py-1 text-left">Product</th>
                      <th className="border px-2 py-1 text-center">Quantity</th>
                      <th className="border px-2 py-1 text-center">Scheme</th>
                    </tr>
                  </thead>
                  <tbody>
                    {v.items.map((it) => (
                      <tr key={it.id} className="hover:bg-gray-50">
                        <td className="border px-2 py-1">{it.product_name}</td>
                        <td className="border px-2 py-1 text-center">
                          {it.quantity}
                        </td>
                        <td className="border px-2 py-1 text-center">
                          {it.is_scheme_item ? (
                            <span className="text-green-600 font-medium">Yes</span>
                          ) : (
                            "No"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</div>

   
  );
}
