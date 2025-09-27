import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FaBoxOpen,
  FaRupeeSign,
  FaClipboardCheck,
  FaShippingFast,
  FaTimesCircle,
  FaCalendarAlt,
} from "react-icons/fa";
import API from "../../api/axios"; // <-- आपके axios instance का path सही रखें

export default function SSOrderTrackingPage() {
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);

  const [dispatchOrders, setDispatchOrders] = useState([]);
  const [loadingDispatch, setLoadingDispatch] = useState(true);
  const [error, setError] = useState(null);
const [showReason, setShowReason] = useState(false);
const [activeStep, setActiveStep] = useState(null);
  const dispatchMap = dispatchOrders.reduce((acc, item) => {
    acc[item.product] = (acc[item.product] || 0) + item.quantity;
    return acc;
  }, {});


  useEffect(() => {
    if (!order?.order_id) return;

    const fetchDispatchOrders = async () => {
      try {
        setLoadingDispatch(true);
        const res = await API.get(`dispatch-orders/${order.order_id}/`);
        setDispatchOrders(res.data);
      } catch (err) {
        console.error(err);
        setError("Dispatch orders not found or failed to load.");
      } finally {
        setLoadingDispatch(false);
      }
    };

    fetchDispatchOrders();
  }, [order]);

  // Define steps including rejected
  // steps को थोड़ा बदलें
 // steps बनाते समय pending handle करें
const steps =
  (order?.status?.toUpperCase() === "REJECTED" && dispatchOrders.length === 0)
    ? [
        { label: "Order Placed", icon: <FaBoxOpen /> },
        { label: "Order Rejected", icon: <FaTimesCircle />, color: "bg-red-600" },
      ]
    : [
        { label: "Order Placed", icon: <FaBoxOpen /> },
        {
          label:
            order?.status?.toUpperCase() === "HOLD"
              ? "Hold"
              : order?.status?.toUpperCase() === "PENDING"
              ? "Pending"
              : "Approved",
          icon: <FaClipboardCheck />,
          color:
            order?.status?.toUpperCase() === "HOLD"
              ? "bg-yellow-400"
              : order?.status?.toUpperCase() === "PENDING"
              ? "bg-gray-400"
              : "bg-blue-600",
          textColor:
            order?.status?.toUpperCase() === "HOLD"
              ? "text-yellow-600"
              : order?.status?.toUpperCase() === "PENDING"
              ? "text-gray-600"
              : "text-blue-600",
        },
        { label: "Dispatched", icon: <FaShippingFast /> },
      ];

// getStatusStepIndex में pending handle करें
const getStatusStepIndex = (status) => {
  const statusUpper = status?.toUpperCase();
  switch (statusUpper) {
    case "PLACED":
    case "PENDING": // 👈 Pending को placed जैसा ही treat करो
      return 0;
    case "HOLD":
    case "APPROVED":
      return 1;
    case "DISPATCHED":
      return 2;
    case "DELIVERED":
      return 3;
    case "REJECTED":
      return 1;
    default:
      return 0;
  }
};


  // Prefer dispatch status for progress bar if available
  const currentStep = dispatchOrders.length > 0
    ? 2 // Dispatched step
    : getStatusStepIndex(order?.status);


  const isRejected =
    order?.status?.toUpperCase() === "REJECTED" && dispatchOrders.length === 0;

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6 text-xs sm:text-sm pb-20">
      {/* Order Header */}
      <div className="p-4 border-b">
        <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2 mb-1">
          <FaBoxOpen className="text-blue-500" /> {order?.order_id}
        </h1>
        <p className="flex items-center gap-1 text-gray-700 font-medium">
          <FaRupeeSign className="text-green-600" /> {order?.total_amount}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="flex flex-wrap items-center justify-between gap-y-6 relative mb-10">
        {steps.map((step, index) => {
          const isCompleted = index <= currentStep;
          const isCurrent = index === currentStep;
          const circleColor =
            isRejected && index === 1
              ? "bg-red-600"
              : step.color // 👈 अगर step में color है तो वही लो
                ? step.color
                : isCompleted
                  ? "bg-blue-600"
                  : "bg-gray-300";


          return (
            <div
              key={index}
              className="flex flex-col items-center text-center flex-1 min-w-[70px] relative z-10"
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full text-white ${circleColor}`}
              >
                {step.icon} 
              </div>
             
              <p
                className={`mt-2 text-xs sm:text-sm font-medium ${isCurrent
                    ? step.textColor
                      ? step.textColor
                      : isRejected
                        ? "text-red-600"
                        : "text-blue-600"
                    : "text-gray-500"
                  }`}
              >
                {step.label}
              </p>

            </div>
          );
        })}

        {/* Progress Line */}
        <div className="absolute top-5 left-[5%] right-[5%] h-1 bg-gray-200 z-0">
          <div
            className={`h-1 ${isRejected ? "bg-red-600" : "bg-blue-600"
              } transition-all duration-500 ease-in-out`}
            style={{
              width: `${(currentStep / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>
      </div>

     <p className="text-red-500">{order.notes}</p>
      {/* Order Items Table */}
      <h2 className="text-base sm:text-lg font-semibold my-3 flex items-center gap-2">
        📦 Order Items
      </h2>

      {/* Loader सिर्फ dispatch fetch होते समय दिखेगा */}
      {loadingDispatch && (
        <div className="text-center py-2">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-500 mt-1 text-xs">Loading dispatch orders...</p>
        </div>
      )}

      {/* Table हमेशा दिखेगा */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-[11px] sm:text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="border px-3 py-2 text-left">Product</th>
              <th className="border px-3 py-2 text-center">Qty</th>
              <th className="border px-3 py-2 text-center">Dispatch</th>
            </tr>
          </thead>
          <tbody>
            {/* Order Items with Dispatch Qty */}
            {order?.items?.map((it) => {
              const dispatchQty = dispatchMap[it.product_name] || 0;
              const notDispatched = dispatchQty === 0;

              return (
                <tr key={it.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">
                    {it.product_name}
                    {it.is_scheme_item && (
                      <span className="ml-2 text-green-600 font-medium">
                        (Scheme)
                      </span>
                    )}
                  </td>
                  <td className="border px-3 py-2 text-center">{it.quantity}</td>
                  <td
                    className={`border px-3 py-2 text-center font-semibold ${notDispatched ? "bg-red-100 text-red-600" : ""
                      }`}
                  >
                    {dispatchQty}
                  </td>
                </tr>
              );
            })}

            {/* Extra Dispatch Items */}
            {dispatchOrders
              .filter(
                (d) => !order.items.some((o) => o.product_name === d.product)
              )
              .map((extra, idx) => (
                <tr
                  key={`extra-${idx}`}
                  className="bg-yellow-100 text-yellow-800 font-medium"
                >
                  <td className="border px-3 py-2">
                    {extra.product}
                  </td>
                  <td className="border px-3 py-2 text-center">--</td>
                  <td className="border px-3 py-2 text-center">
                    {extra.quantity}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>


    </div>
  );
}
