// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import {
//   FaBoxOpen,
//   FaClipboardCheck,
//   FaShippingFast,
//   FaTimesCircle,
// } from "react-icons/fa";
// import API from "../../api/axios";
// import MobilePageHeader from "../../components/MobilePageHeader";
// import { useSchemes } from "../../hooks/useSchemes";

// export default function OrderTrackPage() {
//   const { orderId } = useParams();
//   const [orderData, setOrderData] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const { data: schemes = [] } = useSchemes();

//   useEffect(() => {
//     if (orderId) fetchOrder();
//   }, [orderId]);

//   const fetchOrder = async () => {
//     setLoading(true);
//     try {
//       const res = await API.get(`/track-order/${orderId}/`);
//       setOrderData(res.data);
//     } catch {
//       alert("Order not found");
//       setOrderData(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------------- STATUS & DATES ----------------

//   const status = orderData?.status?.toUpperCase() || "";
//   const dispatchCount = orderData?.dispatch_data?.length || 0;

//   const orderPlacedDate = orderData?.created_at || null;
//   const approvedDate = orderData?.crm_data?.verified_at || null;

//   const dispatchDate =
//     orderData?.dispatch_data?.length > 0
//       ? orderData.dispatch_data[0]?.order_packed_time
//       : null;

//   const steps =
//     status === "REJECTED" && dispatchCount === 0
//       ? [
//         { label: "Order Placed", icon: <FaBoxOpen /> },
//         {
//           label: "Order Rejected",
//           icon: <FaTimesCircle />,
//           color: "bg-red-600",
//         },
//       ]
//       : [
//         { label: "Order Placed", icon: <FaBoxOpen /> },
//         {
//           label:
//             status === "HOLD"
//               ? "Hold"
//               : status === "PENDING"
//                 ? "Pending"
//                 : "Approved",
//           icon: <FaClipboardCheck />,
//           color:
//             status === "HOLD"
//               ? "bg-yellow-400"
//               : status === "PENDING"
//                 ? "bg-gray-400"
//                 : "bg-blue-600",
//           textColor:
//             status === "HOLD"
//               ? "text-yellow-600"
//               : status === "PENDING"
//                 ? "text-gray-600"
//                 : "text-blue-600",
//         },
//         { label: "Dispatched", icon: <FaShippingFast /> },
//       ];

//   const getStatusStepIndex = (status) => {
//     const s = status?.toUpperCase();
//     switch (s) {
//       case "PLACED":
//       case "PENDING":
//         return 0;
//       case "HOLD":
//       case "APPROVED":
//         return 1;
//       case "DISPATCHED":
//         return 2;
//       case "REJECTED":
//         return 1;
//       default:
//         return 0;
//     }
//   };

//   const currentStep =
//     dispatchCount > 0 ? 2 : getStatusStepIndex(orderData?.status);

//   const isRejected = status === "REJECTED" && dispatchCount === 0;
 
//   const formatDate = (date) => {
//     return new Date(date).toLocaleString("en-IN",{day: "2-digit", month: "short",  // year: "2-digit",
//                           hour: "2-digit",  minute: "2-digit", hour12: true,
//                         });
//   };

//   // ---------------- JSX ----------------

//   return (
//     <div className="p-4 max-w-4xl mx-auto">
//       <MobilePageHeader title={orderId} />

//       {loading && (
//         <div className="flex items-center justify-center mt-50 mb-6">
//           <div className="flex flex-col items-center">
//             <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//             <p className="text-sm text-gray-600 mt-3 animate-pulse">
//               Loading, please wait...
//             </p>
//           </div>
//         </div>
//       )}

//       {orderData && (
//         <div className="pt-[60px] sm:pt-0">

//           {/* ---------------- PROGRESS BAR ---------------- */}

//           <div className="flex flex-wrap items-center justify-between gap-y-6 relative mb-10">
//             {steps.map((step, index) => {
//               const isCompleted = index <= currentStep;
//               const isCurrent = index === currentStep;

//               const circleColor =
//                 isRejected && index === 1
//                   ? "bg-red-600"
//                   : step.color
//                     ? step.color
//                     : isCompleted
//                       ? "bg-blue-600"
//                       : "bg-gray-300";

//               return (
//                 <div
//                   key={index}
//                   className="flex flex-col items-center text-center flex-1 min-w-[70px] relative z-10"
//                 >
//                   <div
//                     className={`flex items-center justify-center w-10 h-10 rounded-full text-white ${circleColor}`}
//                   >
//                     {step.icon}
//                   </div>

//                   <p
//                     className={`mt-2 text-xs sm:text-sm font-medium ${isCurrent
//                         ? step.textColor
//                           ? step.textColor
//                           : isRejected
//                             ? "text-red-600"
//                             : "text-blue-600"
//                         : "text-gray-500"
//                       }`}
//                   >
//                     {step.label}
//                   </p>

//                   {/* ORDER PLACED DATE */}
//                   {step.label === "Order Placed" &&
//                     orderPlacedDate &&
//                     currentStep >= 0 && (
//                       <p className="text-[11px] text-green-600 mt-1">
//                         {formatDate(orderPlacedDate)}

//                       </p>
//                     )}

//                   {/* APPROVED DATE */}
//                   {step.label === "Approved" &&
//                     approvedDate &&
//                     currentStep >= 1 && (
//                       <p className="text-[11px] text-green-600 mt-1">
//                         {formatDate(approvedDate)}
//                       </p>
//                     )}

//                   {/* DISPATCH DATE */}
//                   {step.label === "Dispatched" &&
//                     dispatchDate &&
//                     currentStep >= 2 && (
//                       <p className="text-[11px] text-green-600 mt-1">

//                         {new Date(dispatchDate).toLocaleString("en-GB", {
//                           timeZone: "UTC",
//                           day: "2-digit",
//                           month: "short",
//                           // year: "2-digit",
//                           hour: "2-digit",
//                           minute: "2-digit",
//                           hour12: true,
//                         })}
//                       </p>
//                     )}
//                 </div>
//               );
//             })}

//             {/* Progress Line */}
//             <div className="absolute top-5 left-[5%] right-[5%] h-1 bg-gray-200 z-0">
//               <div
//                 className={`h-1 ${isRejected ? "bg-red-600" : "bg-blue-600"
//                   } transition-all duration-500 ease-in-out`}
//                 style={{
//                   width: `${(currentStep / (steps.length - 1)) * 100}%`,
//                 }}
//               />
//             </div>
//           </div>

//           {/* ---------------- TABLE ---------------- */}

//         <div className="mb-20">
//   <div className="overflow-x-auto rounded border border-gray-400">
//     <table className="min-w-full text-[11px] sm:text-xs md:text-sm text-gray-700">
      
//       {/* ---------- TABLE HEADER ---------- */}
//       <thead className="bg-gradient-to-r from-gray-50 to-gray-300 text-gray-600 uppercase tracking-wider text-[10px] sm:text-xs sticky top-0 z-10">
//         <tr>
//           <th className="px-3 py-3 text-left font-semibold border">
//             Product
//           </th>
//           <th className="px-2 py-3 text-center font-semibold border">
//             Ord
//           </th>
//           <th className="px-2 py-3 text-center font-semibold border">
//             Apr
//           </th>
//           <th className="px-2 py-3 text-center font-semibold border">
//             Disp
//           </th>
//         </tr>
//       </thead>

//       {/* ---------- TABLE BODY ---------- */}
//       <tbody className="divide-y divide-gray-300 bg-white">
//         {(() => {
//           const ssItems = orderData.ss_items || [];
//           const crmItems = orderData.crm_data?.items || [];
//           const dispatchItems = orderData.dispatch_data || [];

//           const allProductNames = [
//             ...new Set([
//               ...ssItems.map((i) => i.product_name),
//               ...crmItems.map((i) => i.product_name),
//               ...dispatchItems.map((i) => i.product),
//             ]),
//           ];

//           return allProductNames.map((name, index) => {
//             const ssItem = ssItems.find((s) => s.product_name === name);
//             const crmItem = crmItems.find((c) => c.product_name === name);
//             const dispatchItem = dispatchItems.find(
//               (d) => d.product === name
//             );

//             return (
//               <tr
//                 key={index}
//                 className="hover:bg-blue-50/40 transition duration-150"
//               >
//                 {/* Product Name */}
//                 <td className="px-3 py-3 font-medium text-gray-800 whitespace-nowrap border border-gray-400">
//                   {name}
//                 </td>

//                 {/* Ordered Qty */}
//                 <td className="px-2 py-3 text-center border border-gray-400">
//                   <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 font-semibold text-[10px] sm:text-xs">
//                     {ssItem ? ssItem.quantity : "--"}
//                   </span>
//                 </td>

//                 {/* Approved Qty */}
//                 <td className="px-2 py-3 text-center border border-gray-400">
//                   <span className="px-2 py-1 rounded-md bg-yellow-50 text-yellow-600 font-semibold text-[10px] sm:text-xs">
//                     {crmItem ? crmItem.quantity : "--"}
//                   </span>
//                 </td>

//                 {/* Dispatched Qty */}
//                 <td className="px-2 py-3 text-center border border-gray-400">
//                   <span className="px-2 py-1 rounded-md bg-green-50 text-green-600 font-semibold text-[10px] sm:text-xs">
//                     {dispatchItem ? dispatchItem.quantity : "--"}
//                   </span>
//                 </td>
//               </tr>
//             );
//           });
//         })()}
//       </tbody>
//     </table>
//   </div>
// </div>
//         </div>
//       )}
//     </div>
//   );
// }



import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaBoxOpen,
  FaClipboardCheck,
  FaShippingFast,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";
import API from "../../api/axios";
import MobilePageHeader from "../../components/MobilePageHeader";

export default function OrderTrackPage() {
  const { orderId } = useParams();

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);

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

  // --------------------------------------------------
  // STATUS
  // --------------------------------------------------

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
          {
            label: "Order Placed",
            icon: <FaBoxOpen />,
          },
          {
            label: "Order Rejected",
            icon: <FaTimesCircle />,
            color: "bg-red-600",
          },
        ]
      : [
          {
            label: "Order Placed",
            icon: <FaBoxOpen />,
          },
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
          {
            label: "Dispatched",
            icon: <FaShippingFast />,
          },
        ];

  const getStatusStepIndex = (currentStatus) => {
    const s = currentStatus?.toUpperCase();

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

  // --------------------------------------------------
  // DATE
  // --------------------------------------------------

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // --------------------------------------------------
  // PRODUCTS
  // --------------------------------------------------

  const productRows = useMemo(() => {
    if (!orderData) return [];

    const ssItems = orderData.ss_items || [];
    const crmItems = orderData.crm_data?.items || [];
    const dispatchItems = orderData.dispatch_data || [];

    const allProductNames = [
      ...new Set([
        ...ssItems.map((item) => item.product_name),
        ...crmItems.map((item) => item.product_name),
        ...dispatchItems.map((item) => item.product),
      ]),
    ];

    return allProductNames.map((name) => {
      const ssItem = ssItems.find(
        (item) => item.product_name === name
      );

      const crmItem = crmItems.find(
        (item) => item.product_name === name
      );

      const dispatchItem = dispatchItems.find(
        (item) => item.product === name
      );

      return {
        name,
        ordered: ssItem?.quantity,
        approved: crmItem?.quantity,
        dispatched: dispatchItem?.quantity,
      };
    });
  }, [orderData]);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobilePageHeader title={orderId} />

        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="flex flex-col items-center">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100" />

              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-blue-600" />

              <FaBoxOpen className="text-xl text-blue-600 animate-pulse" />
            </div>

            <p className="mt-4 text-sm font-medium text-gray-600">
              Loading order...
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Please wait a moment
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // JSX
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50">
      <MobilePageHeader title={orderId} />

      {orderData && (
        <div className="mx-auto max-w-5xl px-3 pb-20 pt-[72px] sm:px-5 sm:pt-5">

          {/* ==================================================
              PROGRESS TRACKER
          ================================================== */}

          <div
            className="
              mb-6 rounded-2xl border border-gray-200 bg-white
              px-3 py-6 shadow-sm
              animate-[fadeUp_.5s_ease-out]
            "
          >
            <div className="relative flex items-start justify-between">

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
                        : "bg-gray-200";

                return (
                  <div
                    key={index}
                    className="
                      relative z-10 flex min-w-0 flex-1
                      flex-col items-center text-center
                    "
                    style={{
                      animation: "stepIn .45s ease-out both",
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    {/* Circle */}

                    <div
                      className={`
                        flex h-10 w-10 items-center justify-center
                        rounded-full text-sm text-white
                        shadow-sm transition-all duration-500
                        sm:h-11 sm:w-11
                        ${
                          isCurrent
                            ? "scale-110 shadow-md ring-4 ring-blue-50"
                            : ""
                        }
                        ${circleColor}
                      `}
                    >
                      {step.icon}
                    </div>

                    {/* Label */}

                    <p
                      className={`
                        mt-2 text-[10px] font-semibold sm:text-xs
                        ${
                          isCurrent
                            ? step.textColor ||
                              (isRejected
                                ? "text-red-600"
                                : "text-blue-600")
                            : "text-gray-500"
                        }
                      `}
                    >
                      {step.label}
                    </p>

                    {/* Date */}

                    {step.label === "Order Placed" &&
                      orderPlacedDate && (
                        <p className="mt-1 whitespace-nowrap text-[9px] text-gray-400 sm:text-[10px]">
                          {formatDate(orderPlacedDate)}
                        </p>
                      )}

                    {step.label === "Approved" &&
                      approvedDate &&
                      currentStep >= 1 && (
                        <p className="mt-1 whitespace-nowrap text-[9px] text-green-600 sm:text-[10px]">
                          {formatDate(approvedDate)}
                        </p>
                      )}

                    {step.label === "Dispatched" &&
                      dispatchDate &&
                      currentStep >= 2 && (
                        <p className="mt-1 whitespace-nowrap text-[9px] text-green-600 sm:text-[10px]">
                          {new Date(dispatchDate).toLocaleString(
                            "en-GB",
                            {
                              timeZone: "UTC",
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )}
                        </p>
                      )}
                  </div>
                );
              })}

              {/* Progress Line */}

              <div className="absolute left-[16%] right-[16%] top-5 h-1 overflow-hidden rounded-full bg-gray-100 sm:left-[17%] sm:right-[17%]">
                <div
                  className={`
                    h-full rounded-full
                    transition-all duration-1000 ease-out
                    ${isRejected ? "bg-red-500" : "bg-blue-600"}
                  `}
                  style={{
                    width: `${
                      (currentStep / (steps.length - 1)) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* ==================================================
              ITEMS HEADER
          ================================================== */}

          <div
            className="
              mb-3 flex items-center justify-between
              animate-[fadeUp_.55s_ease-out]
            "
          >
            <div>
              <h2 className="text-sm font-bold text-gray-900 sm:text-base">
                Order Items
              </h2>

              <p className="mt-0.5 text-[10px] text-gray-400 sm:text-xs">
                Ordered, approved and dispatched quantities
              </p>
            </div>

            <div className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-[10px] font-medium text-gray-500 shadow-sm ring-1 ring-gray-200">
              <FaBoxOpen className="text-blue-500" />
              {productRows.length} Items
            </div>
          </div>

          {/* ==================================================
              TABLE
          ================================================== */}

          <div
            className="
              overflow-hidden rounded-2xl border border-gray-200
              bg-white shadow-sm
              animate-[fadeUp_.6s_ease-out]
            "
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-[11px] sm:text-xs md:text-sm">

                {/* Header */}

                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-[9px] uppercase tracking-wider text-gray-500 sm:text-[10px]">
                    <th className="px-3 py-3 text-left font-bold sm:px-4">
                      Product
                    </th>

                    <th className="w-16 px-2 py-3 text-center font-bold">
                      Ord
                    </th>

                    <th className="w-16 px-2 py-3 text-center font-bold">
                      Apr
                    </th>

                    <th className="w-16 px-2 py-3 text-center font-bold">
                      Disp
                    </th>
                  </tr>
                </thead>

                {/* Body */}

                <tbody>
                  {productRows.length > 0 ? (
                    productRows.map((item, index) => (
                      <tr
                        key={`${item.name}-${index}`}
                        className="
                          border-b border-gray-100 last:border-0
                          transition-all duration-200
                          hover:bg-blue-50/40
                        "
                        style={{
                          animation: "rowIn .4s ease-out both",
                          animationDelay: `${Math.min(
                            index * 45,
                            500
                          )}ms`,
                        }}
                      >

                        {/* Product */}

                        <td className="px-3 py-3.5 sm:px-4">
                          <div className="flex items-center gap-2">

                            <div className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500 sm:flex">
                              <FaBoxOpen className="text-xs" />
                            </div>

                            <span className="max-w-[190px] truncate font-semibold text-gray-800 sm:max-w-none">
                              {item.name}
                            </span>
                          </div>
                        </td>

                        {/* Ordered */}

                        <td className="px-2 py-3 text-center">
                          {item.ordered != null ? (
                            <span className="inline-flex min-w-[30px] items-center justify-center rounded-lg bg-blue-50 px-2 py-1 font-bold text-blue-600">
                              {item.ordered}
                            </span>
                          ) : (
                            <span className="text-gray-300">--</span>
                          )}
                        </td>

                        {/* Approved */}

                        <td className="px-2 py-3 text-center">
                          {item.approved != null ? (
                            <span className="inline-flex min-w-[30px] items-center justify-center rounded-lg bg-yellow-50 px-2 py-1 font-bold text-yellow-600">
                              {item.approved}
                            </span>
                          ) : (
                            <span className="text-gray-300">--</span>
                          )}
                        </td>

                        {/* Dispatched */}

                        <td className="px-2 py-3 text-center">
                          {item.dispatched != null ? (
                            <span className="inline-flex min-w-[30px] items-center justify-center rounded-lg bg-green-50 px-2 py-1 font-bold text-green-600">
                              {item.dispatched}
                            </span>
                          ) : (
                            <span className="text-gray-300">--</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-12 text-center"
                      >
                        <FaBoxOpen className="mx-auto text-2xl text-gray-300" />

                        <p className="mt-2 text-xs font-medium text-gray-500">
                          No items found
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ==================================================
              SMALL STATUS FOOTER
          ================================================== */}

          <div
            className="
              mt-4 flex items-center gap-2 rounded-xl
              border border-gray-200 bg-white px-3 py-2.5
              text-[10px] text-gray-500 shadow-sm
              animate-[fadeUp_.7s_ease-out]
            "
          >
            <FaClock className="shrink-0 text-gray-400" />

            <span>
              Last updated from order tracking data
            </span>
          </div>
        </div>
      )}

      {/* ==================================================
          ANIMATIONS
      ================================================== */}

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes stepIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(.92);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes rowIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}