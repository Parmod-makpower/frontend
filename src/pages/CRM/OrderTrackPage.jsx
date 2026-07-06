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

        <div className="mb-20">
  <div className="overflow-x-auto rounded border border-gray-400">
    <table className="min-w-full text-[11px] sm:text-xs md:text-sm text-gray-700">
      
      {/* ---------- TABLE HEADER ---------- */}
      <thead className="bg-gradient-to-r from-gray-50 to-gray-300 text-gray-600 uppercase tracking-wider text-[10px] sm:text-xs sticky top-0 z-10">
        <tr>
          <th className="px-3 py-3 text-left font-semibold border">
            Product
          </th>
          <th className="px-2 py-3 text-center font-semibold border">
            Ord
          </th>
          <th className="px-2 py-3 text-center font-semibold border">
            Apr
          </th>
          <th className="px-2 py-3 text-center font-semibold border">
            Disp
          </th>
        </tr>
      </thead>

      {/* ---------- TABLE BODY ---------- */}
      <tbody className="divide-y divide-gray-300 bg-white">
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
              <tr
                key={index}
                className="hover:bg-blue-50/40 transition duration-150"
              >
                {/* Product Name */}
                <td className="px-3 py-3 font-medium text-gray-800 whitespace-nowrap border border-gray-400">
                  {name}
                </td>

                {/* Ordered Qty */}
                <td className="px-2 py-3 text-center border border-gray-400">
                  <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 font-semibold text-[10px] sm:text-xs">
                    {ssItem ? ssItem.quantity : "--"}
                  </span>
                </td>

                {/* Approved Qty */}
                <td className="px-2 py-3 text-center border border-gray-400">
                  <span className="px-2 py-1 rounded-md bg-yellow-50 text-yellow-600 font-semibold text-[10px] sm:text-xs">
                    {crmItem ? crmItem.quantity : "--"}
                  </span>
                </td>

                {/* Dispatched Qty */}
                <td className="px-2 py-3 text-center border border-gray-400">
                  <span className="px-2 py-1 rounded-md bg-green-50 text-green-600 font-semibold text-[10px] sm:text-xs">
                    {dispatchItem ? dispatchItem.quantity : "--"}
                  </span>
                </td>
              </tr>
            );
          });
        })()}
      </tbody>
    </table>
  </div>
</div>
        </div>
      )}
    </div>
  );
}