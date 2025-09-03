import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  FaBoxOpen,
  FaRupeeSign,
  FaClipboardCheck,
  FaShippingFast,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

export default function SSOrderTrackingPage() {
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);

  // Define steps including rejected
  const steps = order?.status?.toUpperCase() === "REJECTED"
    ? [
        { label: "Order Placed", icon: <FaBoxOpen /> },
        { label: "Order Rejected", icon: <FaTimesCircle />, color: "bg-red-600" },
      ]
    : [
        { label: "Order Placed", icon: <FaBoxOpen /> },
        { label: "Verified", icon: <FaClipboardCheck /> },
        { label: "Dispatched", icon: <FaShippingFast /> },
        { label: "Delivered", icon: <FaCheckCircle /> },
      ];

  // Map status to step index
  const getStatusStepIndex = (status) => {
    switch (status?.toUpperCase()) {
      case "PLACED":
        return 0;
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

  const currentStep = getStatusStepIndex(order?.status);
  const isRejected = order?.status?.toUpperCase() === "REJECTED";

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6 text-xs sm:text-sm pb-20 ">
      {/* Order Header */}
      <div className=" p-4  border-b">
        <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2 mb-1">
          <FaBoxOpen className="text-blue-500" /> {order?.order_id}
        </h1>
        <p className="flex items-center gap-1 text-gray-700 font-medium">
          <FaRupeeSign className="text-green-600" /> {order?.total_amount}
        </p>
      </div>

      {/* Order Tracking Progress Bar */}
     
        <div className="flex flex-wrap items-center justify-between gap-y-6 relative mb-10 ">
          {steps.map((step, index) => {
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;
            const circleColor = isRejected && index === 1
              ? "bg-red-600"
              : isCompleted
              ? "bg-blue-600"
              : "bg-gray-300";

            return (
              <div key={index} className="flex flex-col items-center text-center flex-1 min-w-[70px] relative z-10">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-white ${circleColor}`}
                >
                  {step.icon}
                </div>
                <p
                  className={`mt-2 text-xs sm:text-sm font-medium ${
                    isCurrent
                      ? isRejected
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
              className={`h-1 ${
                isRejected ? "bg-red-600" : "bg-blue-600"
              } transition-all duration-500 ease-in-out`}
              style={{
                width: `${(currentStep / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>
     

      {/* Items Table */}
      
        <h2 className="text-base sm:text-lg font-semibold my-3  flex items-center gap-2">
          📦 Order Items
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
              {order?.items?.map((it) => (
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
  
  );
}
