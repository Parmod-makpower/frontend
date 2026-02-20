import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaBoxOpen,
  FaClipboardCheck,
  FaShippingFast,
  FaTimesCircle,
} from "react-icons/fa";
import API from "../../api/axios";
import MobilePageHeader from "../../components/MobilePageHeader";
import { useSchemes } from "../../hooks/useSchemes";

export default function OrderTrackPage() {
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: schemes = [] } = useSchemes();

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
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

  // ---------------- STATUS & DATES ----------------

  const status = orderData?.status?.toUpperCase() || "";
  const dispatchCount = orderData?.dispatch_data?.length || 0;

  const orderPlacedDate = orderData?.created_at || null;
  const approvedDate = orderData?.crm_data?.verified_at || null;

  const dispatchDate =
    orderData?.dispatch_data?.length > 0
      ? orderData.dispatch_data[0]?.order_packed_time
      : null;

  const steps =
    status === "REJECTED" && dispatchCount === 0
      ? [
        { label: "Order Placed", icon: <FaBoxOpen /> },
        {
          label: "Order Rejected",
          icon: <FaTimesCircle />,
          color: "bg-red-600",
        },
      ]
      : [
        { label: "Order Placed", icon: <FaBoxOpen /> },
        {
          label:
            status === "HOLD"
              ? "Hold"
              : status === "PENDING"
                ? "Pending"
                : "Approved",
          icon: <FaClipboardCheck />,
          color:
            status === "HOLD"
              ? "bg-yellow-400"
              : status === "PENDING"
                ? "bg-gray-400"
                : "bg-blue-600",
          textColor:
            status === "HOLD"
              ? "text-yellow-600"
              : status === "PENDING"
                ? "text-gray-600"
                : "text-blue-600",
        },
        { label: "Dispatched", icon: <FaShippingFast /> },
      ];

  const getStatusStepIndex = (status) => {
    const s = status?.toUpperCase();
    switch (s) {
      case "PLACED":
      case "PENDING":
        return 0;
      case "HOLD":
      case "APPROVED":
        return 1;
      case "DISPATCHED":
        return 2;
      case "REJECTED":
        return 1;
      default:
        return 0;
    }
  };

  const currentStep =
    dispatchCount > 0 ? 2 : getStatusStepIndex(orderData?.status);

  const isRejected = status === "REJECTED" && dispatchCount === 0;
 
  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN",{day: "2-digit", month: "short",  // year: "2-digit",
                          hour: "2-digit",  minute: "2-digit", hour12: true,
                        });
  };

  // ---------------- JSX ----------------

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <MobilePageHeader title={orderId} />

      {loading && (
        <div className="flex items-center justify-center mt-50 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600 mt-3 animate-pulse">
              Loading, please wait...
            </p>
          </div>
        </div>
      )}

      {orderData && (
        <div className="pt-[60px] sm:pt-0">

          {/* ---------------- PROGRESS BAR ---------------- */}

          <div className="flex flex-wrap items-center justify-between gap-y-6 relative mb-10">
            {steps.map((step, index) => {
              const isCompleted = index <= currentStep;
              const isCurrent = index === currentStep;

              const circleColor =
                isRejected && index === 1
                  ? "bg-red-600"
                  : step.color
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

                  {/* ORDER PLACED DATE */}
                  {step.label === "Order Placed" &&
                    orderPlacedDate &&
                    currentStep >= 0 && (
                      <p className="text-[11px] text-green-600 mt-1">
                        {formatDate(orderPlacedDate)}

                      </p>
                    )}

                  {/* APPROVED DATE */}
                  {step.label === "Approved" &&
                    approvedDate &&
                    currentStep >= 1 && (
                      <p className="text-[11px] text-green-600 mt-1">
                        {formatDate(approvedDate)}
                      </p>
                    )}

                  {/* DISPATCH DATE */}
                  {step.label === "Dispatched" &&
                    dispatchDate &&
                    currentStep >= 2 && (
                      <p className="text-[11px] text-green-600 mt-1">

                        {new Date(dispatchDate).toLocaleString("en-GB", {
                          timeZone: "UTC",
                          day: "2-digit",
                          month: "short",
                          // year: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    )}
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

          {/* ---------------- TABLE ---------------- */}

          <div className="overflow-x-auto mb-20">
            <table className="min-w-full text-sm border rounded-lg shadow">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2 text-left">Product</th>
                  <th className="border px-3 py-2 text-center">SS Qty</th>
                  <th className="border px-3 py-2 text-center">CRM Qty</th>
                  <th className="border px-3 py-2 text-center">Dispatch Qty</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const ssItems = orderData.ss_items || [];
                  const crmItems = orderData.crm_data?.items || [];
                  const dispatchItems = orderData.dispatch_data || [];

                  const allProductNames = [
                    ...new Set([
                      ...ssItems.map((i) => i.product_name),
                      ...crmItems.map((i) => i.product_name),
                      ...dispatchItems.map((i) => i.product),
                    ]),
                  ];

                  return allProductNames.map((name, index) => {
                    const ssItem = ssItems.find((s) => s.product_name === name);
                    const crmItem = crmItems.find((c) => c.product_name === name);
                    const dispatchItem = dispatchItems.find(
                      (d) => d.product === name
                    );

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border px-3 py-2 font-medium">{name}</td>

                        <td className="border px-3 py-2 text-center bg-blue-50">
                          {ssItem ? ssItem.quantity : "--"}
                        </td>

                        <td className="border px-3 py-2 text-center bg-yellow-50">
                          {crmItem ? crmItem.quantity : "--"}
                        </td>

                        <td className="border px-3 py-2 text-center bg-green-50">
                          {dispatchItem ? dispatchItem.quantity : "--"}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}