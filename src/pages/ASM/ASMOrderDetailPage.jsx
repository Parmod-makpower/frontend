// import React, { useMemo } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   FaArrowLeft,
//   FaBoxOpen,
//   FaCheckCircle,
//   FaClock,
//   FaMapMarkerAlt,
//   FaPhone,
//   FaShoppingCart,
//   FaTruck,
//   FaUser,
//   FaTimesCircle,
//   FaMoneyBillWave,
//   FaExclamationTriangle,
// } from "react-icons/fa";
// import { useASMOrderDetail, useASMHardRefresh } from "../../auth/useASM";


// // --------------------------------------------------
// // HELPERS
// // --------------------------------------------------

// const formatDateTime = (value) => {
//   if (!value) return "—";

//   try {
//     return new Date(value).toLocaleString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   } catch {
//     return "—";
//   }
// };

// const formatShortDate = (value) => {
//   if (!value) return "—";

//   try {
//     return new Date(value).toLocaleString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   } catch {
//     return "—";
//   }
// };

// const formatCurrency = (value) => {
//   const amount = Number(value || 0);

//   return amount.toLocaleString("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 0,
//   });
// };

// const getStatusClass = (status) => {
//   const value = String(status || "").toUpperCase();

//   if (value === "APPROVED") {
//     return "bg-green-50 text-green-700 border-green-200";
//   }

//   if (value === "REJECTED") {
//     return "bg-red-50 text-red-700 border-red-200";
//   }

//   if (value === "HOLD") {
//     return "bg-amber-50 text-amber-700 border-amber-200";
//   }

//   return "bg-slate-50 text-slate-600 border-slate-200";
// };


// // --------------------------------------------------
// // SMALL COMPONENTS
// // --------------------------------------------------

// const StatusBadge = ({ status }) => {
//   const value = String(status || "PENDING").toUpperCase();

//   let classes =
//     "bg-slate-50 text-slate-600 border-slate-200";

//   if (value === "APPROVED") {
//     classes = "bg-green-50 text-green-700 border-green-200";
//   } else if (value === "REJECTED") {
//     classes = "bg-red-50 text-red-700 border-red-200";
//   } else if (value === "HOLD") {
//     classes = "bg-amber-50 text-amber-700 border-amber-200";
//   }

//   return (
//     <span
//       className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${classes}`}
//     >
//       {value}
//     </span>
//   );
// };


// const InfoCard = ({ icon, title, children }) => (
//   <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
//     <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
//       <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//         {icon}
//       </div>

//       <h3 className="text-sm font-bold text-slate-800">
//         {title}
//       </h3>
//     </div>

//     <div className="p-4">
//       {children}
//     </div>
//   </div>
// );


// const InfoRow = ({ label, value }) => (
//   <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
//     <span className="text-xs text-slate-500">
//       {label}
//     </span>

//     <span className="text-right text-sm font-semibold text-slate-800">
//       {value || "—"}
//     </span>
//   </div>
// );


// const StatCard = ({ icon, label, value, sub }) => (
//   <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
//     <div className="flex items-start justify-between gap-3">
//       <div>
//         <p className="text-xs font-medium text-slate-500">
//           {label}
//         </p>

//         <p className="mt-1 text-xl font-bold text-slate-900">
//           {value}
//         </p>

//         {sub && (
//           <p className="mt-1 text-[11px] text-slate-400">
//             {sub}
//           </p>
//         )}
//       </div>

//       <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//         {icon}
//       </div>
//     </div>
//   </div>
// );


// const LoadingState = () => (
//   <div className="min-h-screen bg-slate-50 p-4">
//     <div className="mx-auto max-w-7xl animate-pulse space-y-4">
//       <div className="h-12 rounded-2xl bg-slate-200" />
//       <div className="h-32 rounded-2xl bg-slate-200" />
//       <div className="h-80 rounded-2xl bg-slate-200" />
//     </div>
//   </div>
// );


// // --------------------------------------------------
// // MAIN PAGE
// // --------------------------------------------------

// export default function ASMOrderDetailPage() {
//   const navigate = useNavigate();
//   const { orderId } = useParams();

//   const {
//     data,
//     isLoading,
//     isError,
//     refetch,
//     isFetching,
//   } = useASMOrderDetail(orderId);

//   const {
//     hardRefreshOrderDetail,
//   } = useASMHardRefresh();


//   // ------------------------------------------------
//   // DATA
//   // ------------------------------------------------

//   const order = data?.order || {};

//   const ss = order.ss || {};

//   const items = Array.isArray(order.items)
//     ? order.items
//     : [];

//   const crmHistory = Array.isArray(order.crm_history)
//     ? order.crm_history
//     : [];


//   // Latest CRM verification
//   const latestCRM = crmHistory.length
//     ? [...crmHistory].sort(
//         (a, b) =>
//           new Date(b.verified_at || 0) -
//           new Date(a.verified_at || 0)
//       )[0]
//     : null;


//   // ------------------------------------------------
//   // PRODUCT RECONCILIATION
//   //
//   // ORDERED
//   // CRM APPROVED
//   // DISPATCHED
//   // ------------------------------------------------

//   const reconciliation = useMemo(() => {
//     const map = new Map();


//     // -----------------------------
//     // 1. SS ORDERED
//     // -----------------------------

//     items.forEach((item) => {
//       const productId =
//         item.product_id ??
//         item.product ??
//         item.id;

//       const key = String(productId);

//       map.set(key, {
//         key,
//         productId,
//         productName:
//           item.product_name ||
//           item.product ||
//           "Unknown Product",

//         ordered: Number(item.quantity || 0),

//         approved: 0,
//         dispatched: 0,

//         price: Number(item.price || 0),

//         isScheme:
//           Boolean(item.is_scheme_item),
//       });
//     });


//     // -----------------------------
//     // 2. CRM APPROVED
//     //
//     // Latest CRM version only
//     // -----------------------------

//     const approvedItems =
//       latestCRM?.items || [];

//     approvedItems.forEach((item) => {
//       const productId =
//         item.product_id ??
//         item.product ??
//         item.id;

//       const key = String(productId);

//       if (!map.has(key)) {
//         map.set(key, {
//           key,
//           productId,
//           productName:
//             item.product_name ||
//             item.product ||
//             "Unknown Product",

//           ordered: 0,
//           approved: 0,
//           dispatched: 0,

//           price: 0,
//           isScheme: false,
//         });
//       }

//       const row = map.get(key);

//       row.approved += Number(
//         item.quantity || 0
//       );

//       if (
//         item.product_name &&
//         (!row.productName ||
//           row.productName === "Unknown Product")
//       ) {
//         row.productName = item.product_name;
//       }
//     });


//     // -----------------------------
//     // 3. DISPATCHED
//     //
//     // Latest CRM dispatch
//     // -----------------------------

//     const dispatchItems =
//       latestCRM?.dispatch || [];

//     dispatchItems.forEach((item) => {
//       const productName =
//         item.product ||
//         item.product_name ||
//         "Unknown Product";

//       const productId =
//         item.product_id ??
//         item.id ??
//         productName;

//       const key = String(productId);

//       // First try product ID
//       let row = map.get(key);

//       // Otherwise match product name
//       if (!row) {
//         row = [...map.values()].find(
//           (r) =>
//             String(r.productName)
//               .toLowerCase() ===
//             String(productName)
//               .toLowerCase()
//         );
//       }

//       if (!row) {
//         row = {
//           key,
//           productId,
//           productName,

//           ordered: 0,
//           approved: 0,
//           dispatched: 0,

//           price: 0,
//           isScheme: false,
//         };

//         map.set(key, row);
//       }

//       row.dispatched += Number(
//         item.quantity || 0
//       );
//     });


//     return [...map.values()];
//   }, [items, latestCRM]);


//   // ------------------------------------------------
//   // TOTALS
//   // ------------------------------------------------

//   const totals = useMemo(() => {
//     const ordered = reconciliation.reduce(
//       (sum, item) =>
//         sum + Number(item.ordered || 0),
//       0
//     );

//     const approved = reconciliation.reduce(
//       (sum, item) =>
//         sum + Number(item.approved || 0),
//       0
//     );

//     const dispatched = reconciliation.reduce(
//       (sum, item) =>
//         sum + Number(item.dispatched || 0),
//       0
//     );

//     const approvedPending =
//       Math.max(ordered - approved, 0);

//     const dispatchPending =
//       Math.max(approved - dispatched, 0);

//     return {
//       ordered,
//       approved,
//       dispatched,
//       approvedPending,
//       dispatchPending,
//     };
//   }, [reconciliation]);


//   // ------------------------------------------------
//   // ORDER STATUS
//   // ------------------------------------------------

//   const hasCRM =
//     Boolean(latestCRM);

//   const isApproved =
//     String(latestCRM?.status || "")
//       .toUpperCase() === "APPROVED";

//   const hasDispatch =
//     totals.dispatched > 0;

//   const fullyDispatched =
//     totals.approved > 0 &&
//     totals.dispatched >= totals.approved;


//   // ------------------------------------------------
//   // DISPATCH LAST TIME
//   // ------------------------------------------------

//   const lastDispatchTime = useMemo(() => {
//     const dispatch =
//       latestCRM?.dispatch || [];

//     if (!dispatch.length) return null;

//     return [...dispatch]
//       .sort(
//         (a, b) =>
//           new Date(
//             b.order_packed_time || 0
//           ) -
//           new Date(
//             a.order_packed_time || 0
//           )
//       )[0]?.order_packed_time;
//   }, [latestCRM]);


//   // ------------------------------------------------
//   // LOADING / ERROR
//   // ------------------------------------------------

//   if (isLoading) {
//     return <LoadingState />;
//   }

//   if (isError || !data?.order) {
//     return (
//       <div className="min-h-screen bg-slate-50 p-4">
//         <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
//           <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
//             <FaTimesCircle size={22} />
//           </div>

//           <h2 className="mt-4 text-lg font-bold text-slate-800">
//             Order not found
//           </h2>

//           <p className="mt-1 text-sm text-slate-500">
//             Unable to load this ASM order.
//           </p>

//           <button
//             onClick={() => navigate(-1)}
//             className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }


//   // ------------------------------------------------
//   // UI
//   // ------------------------------------------------

//   return (
//     <div className="min-h-screen bg-slate-50 pb-24">


//       {/* ==================================================
//           HEADER
//       ================================================== */}

//       <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
//         <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-5 lg:px-6">

//           <div className="flex min-w-0 items-center gap-3">

//             <button
//               onClick={() => navigate(-1)}
//               className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
//             >
//               <FaArrowLeft />
//             </button>

//             <div className="min-w-0">
//               <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
//                 ASM Order
//               </p>

//               <h1 className="truncate text-lg font-bold text-slate-900">
//                 {order.order_id || "Order"}
//               </h1>
//             </div>

//           </div>


//           <div className="flex items-center gap-2">

//             <StatusBadge
//               status={
//                 order.status ||
//                 latestCRM?.status ||
//                 "PENDING"
//               }
//             />

//             <button
//               onClick={() => refetch()}
//               disabled={isFetching}
//               className="hidden rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 sm:block"
//             >
//               {isFetching
//                 ? "Refreshing..."
//                 : "Refresh"}
//             </button>

//             <button
//               onClick={() =>
//                 hardRefreshOrderDetail(orderId)
//               }
//               disabled={isFetching}
//               className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
//             >
//               Hard Refresh
//             </button>

//           </div>
//         </div>
//       </div>


//       <main className="mx-auto max-w-7xl space-y-5 px-3 py-4 sm:px-5 lg:px-6">


//         {/* ==================================================
//             ORDER + SS SUMMARY
//         ================================================== */}

//         <div className="grid gap-4 lg:grid-cols-2">

//           <InfoCard
//             icon={<FaShoppingCart />}
//             title="Order Information"
//           >
//             <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">

//               <InfoRow
//                 label="Order ID"
//                 value={order.order_id}
//               />

//               <InfoRow
//                 label="Order Date"
//                 value={formatDateTime(order.created_at)}
//               />

//               <InfoRow
//                 label="Order Status"
//                 value={
//                   <StatusBadge
//                     status={order.status}
//                   />
//                 }
//               />

//               <InfoRow
//                 label="Order Value"
//                 value={formatCurrency(order.total_amount)}
//               />

//             </div>
//           </InfoCard>


//           <InfoCard
//             icon={<FaUser />}
//             title="Super Stockist"
//           >
//             <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">

//               <InfoRow
//                 label="Party Name"
//                 value={
//                   ss.party_name ||
//                   ss.name ||
//                   "—"
//                 }
//               />

//               <InfoRow
//                 label="SS Name"
//                 value={ss.name}
//               />

//               <InfoRow
//                 label="SS ID"
//                 value={ss.user_id}
//               />

//               <InfoRow
//                 label="Mobile"
//                 value={
//                   ss.mobile ? (
//                     <a
//                       href={`tel:${ss.mobile}`}
//                       className="inline-flex items-center gap-1 text-blue-600"
//                     >
//                       <FaPhone size={11} />
//                       {ss.mobile}
//                     </a>
//                   ) : (
//                     "—"
//                   )
//                 }
//               />

//             </div>
//           </InfoCard>

//         </div>


//         {/* ==================================================
//             LIFECYCLE
//         ================================================== */}

//         <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

//           <div className="mb-5">
//             <h2 className="text-base font-bold text-slate-900">
//               Order Lifecycle
//             </h2>

//             <p className="mt-1 text-xs text-slate-500">
//               Track what SS ordered, what CRM approved and what was actually dispatched.
//             </p>
//           </div>


//           <div className="relative">

//             {/* desktop connecting line */}
//             <div className="absolute left-[16.66%] right-[16.66%] top-5 hidden h-1 rounded-full bg-slate-200 sm:block" />

//             <div
//               className={`absolute left-[16.66%] top-5 hidden h-1 rounded-full bg-blue-600 transition-all sm:block ${
//                 fullyDispatched
//                   ? "right-[16.66%]"
//                   : hasDispatch
//                   ? "right-[50%]"
//                   : isApproved
//                   ? "right-[50%]"
//                   : "right-[66.66%]"
//               }`}
//             />


//             <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-2">


//               {/* ORDER PLACED */}

//               <div className="relative text-center">

//                 <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
//                   <FaShoppingCart size={15} />
//                 </div>

//                 <h3 className="mt-3 text-sm font-bold text-slate-800">
//                   Order Placed
//                 </h3>

//                 <p className="mt-1 text-xs text-green-600">
//                   {formatDateTime(order.created_at)}
//                 </p>

//                 <span className="mt-2 inline-block rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
//                   {totals.ordered} Qty Ordered
//                 </span>

//               </div>


//               {/* CRM */}

//               <div className="relative text-center">

//                 <div
//                   className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-white shadow-sm ${
//                     isApproved
//                       ? "bg-green-600"
//                       : hasCRM
//                       ? "bg-amber-500"
//                       : "bg-slate-300"
//                   }`}
//                 >
//                   {isApproved ? (
//                     <FaCheckCircle size={16} />
//                   ) : (
//                     <FaClock size={16} />
//                   )}
//                 </div>

//                 <h3 className="mt-3 text-sm font-bold text-slate-800">
//                   CRM Approval
//                 </h3>

//                 <p
//                   className={`mt-1 text-xs ${
//                     hasCRM
//                       ? "text-green-600"
//                       : "text-slate-400"
//                   }`}
//                 >
//                   {latestCRM
//                     ? formatDateTime(
//                         latestCRM.verified_at
//                       )
//                     : "Pending"}
//                 </p>

//                 {latestCRM && (
//                   <div className="mt-2 flex flex-wrap justify-center gap-1.5">

//                     <StatusBadge
//                       status={latestCRM.status}
//                     />

//                     <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
//                       {totals.approved} Approved
//                     </span>

//                   </div>
//                 )}

//               </div>


//               {/* DISPATCH */}

//               <div className="relative text-center">

//                 <div
//                   className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-white shadow-sm ${
//                     fullyDispatched
//                       ? "bg-green-600"
//                       : hasDispatch
//                       ? "bg-amber-500"
//                       : "bg-slate-300"
//                   }`}
//                 >
//                   {fullyDispatched ? (
//                     <FaTruck size={16} />
//                   ) : (
//                     <FaClock size={16} />
//                   )}
//                 </div>

//                 <h3 className="mt-3 text-sm font-bold text-slate-800">
//                   Dispatch
//                 </h3>

//                 <p
//                   className={`mt-1 text-xs ${
//                     hasDispatch
//                       ? "text-green-600"
//                       : "text-slate-400"
//                   }`}
//                 >
//                   {lastDispatchTime
//                     ? formatDateTime(lastDispatchTime)
//                     : "Pending"}
//                 </p>

//                 <span
//                   className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold ${
//                     fullyDispatched
//                       ? "bg-green-50 text-green-700"
//                       : hasDispatch
//                       ? "bg-amber-50 text-amber-700"
//                       : "bg-slate-100 text-slate-500"
//                   }`}
//                 >
//                   {hasDispatch
//                     ? `${totals.dispatched} Dispatched`
//                     : "No Dispatch"}
//                 </span>

//               </div>

//             </div>
//           </div>
//         </section>


//         {/* ==================================================
//             TOP RECONCILIATION STATS
//         ================================================== */}

//         <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">

//           <StatCard
//             icon={<FaShoppingCart />}
//             label="Ordered"
//             value={totals.ordered}
//             sub="SS order quantity"
//           />

//           <StatCard
//             icon={<FaCheckCircle />}
//             label="CRM Approved"
//             value={totals.approved}
//             sub="Latest CRM approval"
//           />

//           <StatCard
//             icon={<FaTruck />}
//             label="Dispatched"
//             value={totals.dispatched}
//             sub="Actual dispatch"
//           />

//           <StatCard
//             icon={<FaClock />}
//             label="Approval Pending"
//             value={totals.approvedPending}
//             sub="Not approved by CRM"
//           />

//           <StatCard
//             icon={<FaExclamationTriangle />}
//             label="Dispatch Pending"
//             value={totals.dispatchPending}
//             sub="Approved but not dispatched"
//           />

//         </div>


//         {/* ==================================================
//             PRODUCT RECONCILIATION
//         ================================================== */}

//         <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

//           <div className="border-b border-slate-200 px-4 py-4 sm:px-5">

//             <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

//               <div>
//                 <h2 className="text-base font-bold text-slate-900">
//                   Product Reconciliation
//                 </h2>

//                 <p className="text-xs text-slate-500">
//                   Ordered vs CRM Approved vs Actually Dispatched
//                 </p>
//               </div>

//               <div className="text-xs text-slate-400">
//                 {reconciliation.length} Products
//               </div>

//             </div>
//           </div>


//           {/* ----------------------------------------------
//               DESKTOP TABLE
//           ---------------------------------------------- */}

//           <div className="hidden overflow-x-auto md:block">

//             <table className="w-full min-w-[760px] border-collapse">

//               <thead>
//                 <tr className="bg-slate-50 text-left">

//                   <th className="border-b border-slate-200 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
//                     Product
//                   </th>

//                   <th className="border-b border-slate-200 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-blue-600">
//                     Ordered
//                   </th>

//                   <th className="border-b border-slate-200 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-amber-600">
//                     CRM Approved
//                   </th>

//                   <th className="border-b border-slate-200 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-green-600">
//                     Dispatched
//                   </th>

//                   <th className="border-b border-slate-200 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
//                     Balance
//                   </th>

//                   <th className="border-b border-slate-200 px-5 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
//                     Status
//                   </th>

//                 </tr>
//               </thead>


//               <tbody>

//                 {reconciliation.map((item) => {

//                   const balance =
//                     item.approved -
//                     item.dispatched;

//                   const approvalGap =
//                     item.ordered -
//                     item.approved;

//                   let status = "Complete";

//                   if (item.approved === 0) {
//                     status = "Not Approved";
//                   } else if (
//                     item.dispatched <
//                     item.approved
//                   ) {
//                     status = "Dispatch Pending";
//                   } else if (
//                     item.dispatched >=
//                     item.approved
//                   ) {
//                     status = "Dispatched";
//                   }

//                   return (
//                     <tr
//                       key={item.key}
//                       className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
//                     >

//                       <td className="px-5 py-3">

//                         <div className="flex items-center gap-2">

//                           <span className="font-semibold text-slate-800">
//                             {item.productName}
//                           </span>

//                           {item.isScheme && (
//                             <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-600">
//                               Scheme
//                             </span>
//                           )}

//                         </div>

//                         {approvalGap > 0 && (
//                           <p className="mt-0.5 text-[10px] text-red-500">
//                             {approvalGap} not approved
//                           </p>
//                         )}

//                       </td>


//                       <td className="px-4 py-3 text-center">

//                         <span className="inline-flex min-w-[42px] justify-center rounded-lg bg-blue-50 px-2.5 py-1.5 text-sm font-bold text-blue-700">
//                           {item.ordered}
//                         </span>

//                       </td>


//                       <td className="px-4 py-3 text-center">

//                         <span className="inline-flex min-w-[42px] justify-center rounded-lg bg-amber-50 px-2.5 py-1.5 text-sm font-bold text-amber-700">
//                           {item.approved}
//                         </span>

//                       </td>


//                       <td className="px-4 py-3 text-center">

//                         <span
//                           className={`inline-flex min-w-[42px] justify-center rounded-lg px-2.5 py-1.5 text-sm font-bold ${
//                             item.dispatched > 0
//                               ? "bg-green-50 text-green-700"
//                               : "bg-slate-100 text-slate-400"
//                           }`}
//                         >
//                           {item.dispatched || "—"}
//                         </span>

//                       </td>


//                       <td className="px-4 py-3 text-center">

//                         <span
//                           className={`font-bold ${
//                             balance > 0
//                               ? "text-red-600"
//                               : balance < 0
//                               ? "text-purple-600"
//                               : "text-green-600"
//                           }`}
//                         >
//                           {balance > 0
//                             ? balance
//                             : balance < 0
//                             ? `+${Math.abs(balance)}`
//                             : "0"}
//                         </span>

//                       </td>


//                       <td className="px-5 py-3 text-center">

//                         <span
//                           className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
//                             status === "Dispatched"
//                               ? "border-green-200 bg-green-50 text-green-700"
//                               : status ===
//                                 "Dispatch Pending"
//                               ? "border-amber-200 bg-amber-50 text-amber-700"
//                               : "border-red-200 bg-red-50 text-red-600"
//                           }`}
//                         >
//                           {status}
//                         </span>

//                       </td>

//                     </tr>
//                   );
//                 })}

//               </tbody>

//             </table>

//           </div>


//           {/* ----------------------------------------------
//               MOBILE CARDS
//           ---------------------------------------------- */}

//           <div className="space-y-3 p-3 md:hidden">

//             {reconciliation.map((item) => {

//               const balance =
//                 item.approved -
//                 item.dispatched;

//               const approvalGap =
//                 item.ordered -
//                 item.approved;

//               let status = "Complete";

//               if (item.approved === 0) {
//                 status = "Not Approved";
//               } else if (
//                 item.dispatched <
//                 item.approved
//               ) {
//                 status = "Dispatch Pending";
//               } else {
//                 status = "Dispatched";
//               }

//               return (
//                 <div
//                   key={item.key}
//                   className="rounded-xl border border-slate-200 bg-slate-50 p-3"
//                 >

//                   <div className="flex items-start justify-between gap-3">

//                     <div className="min-w-0">

//                       <p className="truncate text-sm font-bold text-slate-800">
//                         {item.productName}
//                       </p>

//                       {item.isScheme && (
//                         <span className="mt-1 inline-block rounded-full bg-purple-50 px-2 py-0.5 text-[9px] font-semibold text-purple-600">
//                           Scheme
//                         </span>
//                       )}

//                     </div>

//                     <span
//                       className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-semibold ${
//                         status === "Dispatched"
//                           ? "border-green-200 bg-green-50 text-green-700"
//                           : status ===
//                             "Dispatch Pending"
//                           ? "border-amber-200 bg-amber-50 text-amber-700"
//                           : "border-red-200 bg-red-50 text-red-600"
//                       }`}
//                     >
//                       {status}
//                     </span>

//                   </div>


//                   <div className="mt-3 grid grid-cols-3 gap-2">

//                     <div className="rounded-lg bg-blue-50 p-2 text-center">
//                       <p className="text-[9px] font-medium text-blue-500">
//                         Ordered
//                       </p>

//                       <p className="mt-0.5 text-sm font-bold text-blue-700">
//                         {item.ordered}
//                       </p>
//                     </div>


//                     <div className="rounded-lg bg-amber-50 p-2 text-center">
//                       <p className="text-[9px] font-medium text-amber-500">
//                         Approved
//                       </p>

//                       <p className="mt-0.5 text-sm font-bold text-amber-700">
//                         {item.approved}
//                       </p>
//                     </div>


//                     <div className="rounded-lg bg-green-50 p-2 text-center">
//                       <p className="text-[9px] font-medium text-green-500">
//                         Dispatch
//                       </p>

//                       <p className="mt-0.5 text-sm font-bold text-green-700">
//                         {item.dispatched || "—"}
//                       </p>
//                     </div>

//                   </div>


//                   <div className="mt-2 flex items-center justify-between text-[10px]">

//                     <span className="text-slate-400">
//                       Balance
//                     </span>

//                     <span
//                       className={`font-bold ${
//                         balance > 0
//                           ? "text-red-600"
//                           : balance < 0
//                           ? "text-purple-600"
//                           : "text-green-600"
//                       }`}
//                     >
//                       {balance > 0
//                         ? `${balance} pending`
//                         : balance < 0
//                         ? `${Math.abs(balance)} extra`
//                         : "Complete"}
//                     </span>

//                   </div>


//                   {approvalGap > 0 && (
//                     <div className="mt-2 rounded-lg bg-red-50 px-2.5 py-2 text-[10px] font-medium text-red-600">
//                       {approvalGap} quantity was ordered but not approved by CRM.
//                     </div>
//                   )}

//                 </div>
//               );
//             })}

//           </div>

//         </section>


//         {/* ==================================================
//             CRM INFORMATION
//         ================================================== */}

//         <div className="grid gap-4 lg:grid-cols-2">


//           <InfoCard
//             icon={<FaCheckCircle />}
//             title="CRM Verification"
//           >

//             {latestCRM ? (
//               <div>

//                 <InfoRow
//                   label="CRM"
//                   value={
//                     latestCRM.crm_name ||
//                     "—"
//                   }
//                 />

//                 <InfoRow
//                   label="Verification Time"
//                   value={formatDateTime(
//                     latestCRM.verified_at
//                   )}
//                 />

//                 <InfoRow
//                   label="Status"
//                   value={
//                     <StatusBadge
//                       status={
//                         latestCRM.status
//                       }
//                     />
//                   }
//                 />

//                 <InfoRow
//                   label="Punched"
//                   value={
//                     latestCRM.punched
//                       ? "Yes"
//                       : "No"
//                   }
//                 />

//               </div>
//             ) : (
//               <div className="rounded-xl bg-amber-50 p-4 text-center">

//                 <FaClock className="mx-auto text-amber-500" />

//                 <p className="mt-2 text-sm font-semibold text-amber-700">
//                   CRM verification pending
//                 </p>

//                 <p className="mt-1 text-xs text-amber-600">
//                   This order has not been verified by CRM yet.
//                 </p>

//               </div>
//             )}

//           </InfoCard>


//           <InfoCard
//             icon={<FaTruck />}
//             title="Dispatch Information"
//           >

//             {latestCRM ? (
//               <div>

//                 <InfoRow
//                   label="Dispatch Location"
//                   value={
//                     latestCRM.dispatch_location ||
//                     "—"
//                   }
//                 />

//                 <InfoRow
//                   label="Dispatch Time"
//                   value={
//                     lastDispatchTime
//                       ? formatDateTime(
//                           lastDispatchTime
//                         )
//                       : "Not dispatched"
//                   }
//                 />

//                 <InfoRow
//                   label="Dispatched Quantity"
//                   value={
//                     totals.dispatched
//                   }
//                 />

//                 <InfoRow
//                   label="Dispatch Status"
//                   value={
//                     fullyDispatched
//                       ? "Fully Dispatched"
//                       : hasDispatch
//                       ? "Partially Dispatched"
//                       : "Pending"
//                   }
//                 />

//               </div>
//             ) : (
//               <div className="rounded-xl bg-slate-50 p-4 text-center">

//                 <FaTruck className="mx-auto text-slate-300" />

//                 <p className="mt-2 text-sm font-semibold text-slate-600">
//                   Dispatch not available
//                 </p>

//               </div>
//             )}

//           </InfoCard>

//         </div>


//         {/* ==================================================
//             CRM HISTORY
//         ================================================== */}

//         {crmHistory.length > 0 && (
//           <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

//             <div className="border-b border-slate-200 px-4 py-4 sm:px-5">

//               <h2 className="text-base font-bold text-slate-900">
//                 CRM Verification History
//               </h2>

//               <p className="mt-1 text-xs text-slate-500">
//                 All verification records for this order.
//               </p>

//             </div>


//             <div className="divide-y divide-slate-100">

//               {crmHistory.map((crm, index) => (

//                 <div
//                   key={crm.id || index}
//                   className="p-4 sm:px-5"
//                 >

//                   <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

//                     <div>

//                       <div className="flex flex-wrap items-center gap-2">

//                         <span className="text-sm font-bold text-slate-800">
//                           {crm.crm_name ||
//                             "CRM"}
//                         </span>

//                         <StatusBadge
//                           status={crm.status}
//                         />

//                       </div>

//                       <p className="mt-1 text-xs text-slate-400">
//                         {formatDateTime(
//                           crm.verified_at
//                         )}
//                       </p>

//                     </div>


//                     <div className="flex flex-wrap gap-2 text-[10px]">

//                       <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
//                         Approved:{" "}
//                         {(crm.items || []).reduce(
//                           (sum, item) =>
//                             sum +
//                             Number(
//                               item.quantity || 0
//                             ),
//                           0
//                         )}
//                       </span>

//                       <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
//                         Punched:{" "}
//                         {crm.punched
//                           ? "Yes"
//                           : "No"}
//                       </span>

//                     </div>

//                   </div>

//                 </div>

//               ))}

//             </div>

//           </section>
//         )}

//       </main>


//       {/* ==================================================
//           MOBILE / BOTTOM SUMMARY
//       ================================================== */}

//       <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 shadow-lg backdrop-blur">

//         <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-5 lg:px-6">

//           <div className="min-w-0">

//             <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
//               Order Summary
//             </p>

//             <div className="flex items-center gap-3">

//               <span className="text-sm font-bold text-slate-800">
//                 {formatCurrency(
//                   order.total_amount
//                 )}
//               </span>

//               <span className="text-xs text-slate-400">
//                 {totals.ordered} Qty
//               </span>

//             </div>

//           </div>


//           <div className="flex items-center gap-2">

//             <div className="hidden text-right sm:block">

//               <p className="text-[10px] text-slate-400">
//                 Dispatch
//               </p>

//               <p
//                 className={`text-xs font-bold ${
//                   fullyDispatched
//                     ? "text-green-600"
//                     : hasDispatch
//                     ? "text-amber-600"
//                     : "text-slate-500"
//                 }`}
//               >
//                 {fullyDispatched
//                   ? "Completed"
//                   : hasDispatch
//                   ? "Partial"
//                   : "Pending"}
//               </p>

//             </div>

//             <button
//               onClick={() =>
//                 hardRefreshOrderDetail(
//                   orderId
//                 )
//               }
//               className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
//             >
//               <FaMoneyBillWave />
//               Refresh Data
//             </button>

//           </div>

//         </div>

//       </div>

//     </div>
//   );
// }


import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBoxOpen,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaShoppingCart,
  FaTruck,
  FaUser,
  FaTimesCircle,
  FaChevronDown,
  FaChevronUp,
  FaSyncAlt,
} from "react-icons/fa";
import {
  useASMOrderDetail,
  useASMHardRefresh,
} from "../../auth/useASM";


// ======================================================
// HELPERS
// ======================================================

const formatDate = (value) => {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};


const formatFullDate = (value) => {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};


const currency = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });


const StatusBadge = ({ status }) => {
  const s = String(status || "PENDING").toUpperCase();

  const cls =
    s === "APPROVED"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : s === "REJECTED"
      ? "bg-red-50 text-red-700 border-red-200"
      : s === "HOLD"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${cls}`}
    >
      {s}
    </span>
  );
};


// ======================================================
// SMALL COMPONENTS
// ======================================================

const MiniStat = ({ label, value, type }) => {
  const styles = {
    ordered: "bg-blue-50 text-blue-700",
    approved: "bg-amber-50 text-amber-700",
    dispatched: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="min-w-0 flex-1 rounded-xl bg-slate-50 px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium text-slate-500">
          {label}
        </span>

        <span
          className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${styles[type]}`}
        >
          {type === "ordered"
            ? "ORD"
            : type === "approved"
            ? "APR"
            : "DSP"}
        </span>
      </div>

      <p className="mt-0.5 text-lg font-bold leading-none text-slate-900">
        {value}
      </p>
    </div>
  );
};


const InfoLine = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-0">
    <span className="text-[11px] text-slate-500">{label}</span>

    <span className="text-right text-xs font-semibold text-slate-800">
      {value || "—"}
    </span>
  </div>
);


const Section = ({ title, icon, right, children }) => (
  <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </div>

        <h2 className="text-sm font-bold text-slate-900">
          {title}
        </h2>
      </div>

      {right}
    </div>

    {children}
  </section>
);


// ======================================================
// LOADING
// ======================================================

const Loading = () => (
  <div className="min-h-screen bg-slate-50 p-3">
    <div className="mx-auto max-w-7xl animate-pulse space-y-3">
      <div className="h-12 rounded-xl bg-slate-200" />
      <div className="h-24 rounded-xl bg-slate-200" />
      <div className="h-14 rounded-xl bg-slate-200" />
      <div className="h-72 rounded-xl bg-slate-200" />
    </div>
  </div>
);


// ======================================================
// MAIN
// ======================================================

export default function ASMOrderDetailPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useASMOrderDetail(orderId);

  const { hardRefreshOrderDetail } =
    useASMHardRefresh();

  const [showCRM, setShowCRM] = useState(false);
  const [showDispatch, setShowDispatch] =
    useState(false);


  // ====================================================
  // DATA
  // ====================================================

  const order = data?.order || {};
  const ss = order.ss || {};

  const items = Array.isArray(order.items)
    ? order.items
    : [];

  const crmHistory = Array.isArray(order.crm_history)
    ? order.crm_history
    : [];


  const latestCRM = useMemo(() => {
    if (!crmHistory.length) return null;

    return [...crmHistory].sort(
      (a, b) =>
        new Date(b.verified_at || 0) -
        new Date(a.verified_at || 0)
    )[0];
  }, [crmHistory]);


  // ====================================================
  // RECONCILIATION
  // ====================================================

  const rows = useMemo(() => {
    const map = new Map();

    // -------------------------------
    // ORDERED
    // -------------------------------

    items.forEach((item) => {
      const id =
        item.product_id ??
        item.product ??
        item.id;

      const key = String(id);

      map.set(key, {
        key,
        productId: id,
        productName:
          item.product_name ||
          item.product ||
          "Unknown Product",
        ordered: Number(item.quantity || 0),
        approved: 0,
        dispatched: 0,
        price: Number(item.price || 0),
        isScheme: Boolean(item.is_scheme_item),
      });
    });


    // -------------------------------
    // APPROVED
    // -------------------------------

    const approvedItems =
      latestCRM?.items || [];

    approvedItems.forEach((item) => {
      const id =
        item.product_id ??
        item.product ??
        item.id;

      const name =
        item.product_name ||
        item.product ||
        "Unknown Product";

      let row = map.get(String(id));

      // fallback name matching
      if (!row) {
        row = [...map.values()].find(
          (r) =>
            String(r.productName).toLowerCase() ===
            String(name).toLowerCase()
        );
      }

      if (!row) {
        row = {
          key: String(id),
          productId: id,
          productName: name,
          ordered: 0,
          approved: 0,
          dispatched: 0,
          price: 0,
          isScheme: false,
        };

        map.set(row.key, row);
      }

      row.approved += Number(
        item.quantity || 0
      );
    });


    // -------------------------------
    // DISPATCH
    // -------------------------------

    const dispatchItems =
      latestCRM?.dispatch || [];

    dispatchItems.forEach((item) => {
      const name =
        item.product ||
        item.product_name ||
        "Unknown Product";

      const id =
        item.product_id ??
        item.id;

      let row = id
        ? map.get(String(id))
        : null;

      if (!row) {
        row = [...map.values()].find(
          (r) =>
            String(r.productName).toLowerCase() ===
            String(name).toLowerCase()
        );
      }

      if (!row) {
        row = {
          key: `dispatch-${name}`,
          productId: id,
          productName: name,
          ordered: 0,
          approved: 0,
          dispatched: 0,
          price: 0,
          isScheme: false,
        };

        map.set(row.key, row);
      }

      row.dispatched += Number(
        item.quantity || 0
      );
    });


    return [...map.values()];
  }, [items, latestCRM]);


  // ====================================================
  // TOTALS
  // ====================================================

  const totals = useMemo(() => {
    const ordered = rows.reduce(
      (sum, r) => sum + r.ordered,
      0
    );

    const approved = rows.reduce(
      (sum, r) => sum + r.approved,
      0
    );

    const dispatched = rows.reduce(
      (sum, r) => sum + r.dispatched,
      0
    );

    return {
      ordered,
      approved,
      dispatched,
      approvalPending: Math.max(
        ordered - approved,
        0
      ),
      dispatchPending: Math.max(
        approved - dispatched,
        0
      ),
    };
  }, [rows]);


  // ====================================================
  // LIFECYCLE
  // ====================================================

  const crmApproved =
    String(latestCRM?.status || "")
      .toUpperCase() === "APPROVED";

  const hasDispatch =
    totals.dispatched > 0;

  const fullyDispatched =
    totals.approved > 0 &&
    totals.dispatched >= totals.approved;


  const dispatchTime = useMemo(() => {
    const list =
      latestCRM?.dispatch || [];

    if (!list.length) return null;

    return [...list].sort(
      (a, b) =>
        new Date(
          b.order_packed_time || 0
        ) -
        new Date(
          a.order_packed_time || 0
        )
    )[0]?.order_packed_time;
  }, [latestCRM]);


  // ====================================================
  // ERROR
  // ====================================================

  if (isLoading) return <Loading />;

  if (isError || !data?.order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-sm">
          <FaTimesCircle
            className="mx-auto text-3xl text-red-500"
          />

          <h2 className="mt-3 font-bold text-slate-900">
            Order not found
          </h2>

          <button
            onClick={() => navigate(-1)}
            className="mt-4 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }


  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="min-h-screen bg-slate-50 pb-16">


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:px-5">

          <div className="flex min-w-0 items-center gap-2.5">

            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <FaArrowLeft size={13} />
            </button>

            <div className="min-w-0">

              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                ASM Order
              </p>

              <h1 className="truncate text-sm font-bold text-slate-900 sm:text-base">
                {order.order_id}
              </h1>

            </div>

          </div>


          <div className="flex items-center gap-1.5">

            <StatusBadge
              status={
                order.status ||
                latestCRM?.status
              }
            />

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <FaSyncAlt
                size={11}
                className={
                  isFetching
                    ? "animate-spin"
                    : ""
                }
              />
            </button>

            <button
              onClick={() =>
                hardRefreshOrderDetail(
                  orderId
                )
              }
              className="hidden rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-bold text-white sm:block"
            >
              Hard Refresh
            </button>

          </div>

        </div>
      </header>


      <main className="mx-auto max-w-7xl space-y-3 px-2.5 py-3 sm:px-5 sm:py-4">


        {/* =================================================
            COMPACT ORDER / SS HEADER
        ================================================= */}

        <section className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">

          {/* ORDER */}

          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] font-medium text-slate-400">
                  ORDER PLACED
                </p>

                <p className="mt-0.5 text-xs font-bold text-slate-800">
                  {formatFullDate(
                    order.created_at
                  )}
                </p>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <FaShoppingCart size={13} />
              </div>

            </div>

            <div className="mt-3 flex gap-2">

              <MiniStat
                label="Ordered"
                value={totals.ordered}
                type="ordered"
              />

              <MiniStat
                label="Approved"
                value={totals.approved}
                type="approved"
              />

              <MiniStat
                label="Dispatch"
                value={totals.dispatched}
                type="dispatched"
              />

            </div>

          </div>


          {/* SS */}

          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">

            <div className="flex items-center justify-between">

              <div className="min-w-0">

                <p className="text-[10px] font-medium text-slate-400">
                  SUPER STOCKIST
                </p>

                <p className="truncate text-sm font-bold text-slate-900">
                  {ss.party_name ||
                    ss.name ||
                    "—"}
                </p>

              </div>

              {ss.mobile && (
                <a
                  href={`tel:${ss.mobile}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"
                >
                  <FaPhone size={12} />
                </a>
              )}

            </div>

            <div className="mt-2 grid grid-cols-3 gap-x-4">

              <InfoLine
                label="SS Name"
                value={ss.name}
              />

              <InfoLine
                label="SS ID"
                value={ss.user_id}
              />

              <InfoLine
                label="Mobile"
                value={ss.mobile}
              />

            </div>

          </div>

        </section>


        {/* =================================================
            LIFECYCLE
        ================================================= */}

        <Section
          title="Order Lifecycle"
          icon={<FaTruck size={12} />}
          right={
            <span className="hidden text-[10px] text-slate-400 sm:block">
              Order → Approval → Dispatch
            </span>
          }
        >

          <div className="px-3 py-4 sm:px-5">

            <div className="relative">

              {/* line */}

              <div className="absolute left-[16%] right-[16%] top-4 hidden h-0.5 bg-slate-200 sm:block" />

              <div
                className={`absolute left-[16%] top-4 hidden h-0.5 bg-blue-600 sm:block ${
                  fullyDispatched
                    ? "right-[16%]"
                    : crmApproved
                    ? "right-[50%]"
                    : "right-[66%]"
                }`}
              />


              <div className="grid grid-cols-3 gap-1">


                {/* ORDER */}

                <div className="relative text-center">

                  <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white ring-4 ring-white">
                    <FaShoppingCart size={11} />
                  </div>

                  <p className="mt-2 text-[10px] font-bold text-slate-800 sm:text-xs">
                    Order Placed
                  </p>

                  <p className="mt-0.5 text-[9px] text-green-600">
                    {formatDate(
                      order.created_at
                    )}
                  </p>

                  <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[8px] font-bold text-blue-700">
                    {totals.ordered} Qty
                  </span>

                </div>


                {/* APPROVAL */}

                <div className="relative text-center">

                  <div
                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-white ring-4 ring-white ${
                      crmApproved
                        ? "bg-emerald-600"
                        : latestCRM
                        ? "bg-amber-500"
                        : "bg-slate-300"
                    }`}
                  >
                    {crmApproved ? (
                      <FaCheckCircle size={12} />
                    ) : (
                      <FaClock size={12} />
                    )}
                  </div>

                  <p className="mt-2 text-[10px] font-bold text-slate-800 sm:text-xs">
                    Approved
                  </p>

                  <p
                    className={`mt-0.5 text-[9px] ${
                      latestCRM
                        ? "text-green-600"
                        : "text-slate-400"
                    }`}
                  >
                    {latestCRM
                      ? formatDate(
                          latestCRM.verified_at
                        )
                      : "Pending"}
                  </p>

                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[8px] font-bold ${
                      crmApproved
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {latestCRM
                      ? totals.approved
                      : "Pending"}
                  </span>

                </div>


                {/* DISPATCH */}

                <div className="relative text-center">

                  <div
                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-white ring-4 ring-white ${
                      fullyDispatched
                        ? "bg-emerald-600"
                        : hasDispatch
                        ? "bg-amber-500"
                        : "bg-slate-300"
                    }`}
                  >
                    {hasDispatch ? (
                      <FaTruck size={12} />
                    ) : (
                      <FaClock size={12} />
                    )}
                  </div>

                  <p className="mt-2 text-[10px] font-bold text-slate-800 sm:text-xs">
                    Dispatched
                  </p>

                  <p
                    className={`mt-0.5 text-[9px] ${
                      hasDispatch
                        ? "text-green-600"
                        : "text-slate-400"
                    }`}
                  >
                    {dispatchTime
                      ? formatDate(
                          dispatchTime
                        )
                      : "Pending"}
                  </p>

                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[8px] font-bold ${
                      fullyDispatched
                        ? "bg-emerald-50 text-emerald-700"
                        : hasDispatch
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {hasDispatch
                      ? totals.dispatched
                      : "—"}
                  </span>

                </div>

              </div>
            </div>

          </div>

        </Section>


        {/* =================================================
            PRODUCT RECONCILIATION
        ================================================= */}

        <Section
          title="Products"
          icon={<FaBoxOpen size={12} />}
          right={
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">
              {rows.length} Items
            </span>
          }
        >

          {/* DESKTOP */}

          <div className="hidden md:block">

            <table className="w-full table-fixed">

              <thead>
                <tr className="bg-slate-50">

                  <th className="w-[38%] px-4 py-2.5 text-left text-[10px] font-bold uppercase text-slate-500">
                    Product
                  </th>

                  <th className="w-[12%] px-2 py-2.5 text-center text-[10px] font-bold uppercase text-blue-600">
                    ORD
                  </th>

                  <th className="w-[14%] px-2 py-2.5 text-center text-[10px] font-bold uppercase text-amber-600">
                    APR
                  </th>

                  <th className="w-[14%] px-2 py-2.5 text-center text-[10px] font-bold uppercase text-emerald-600">
                    DSP
                  </th>

                  <th className="w-[12%] px-2 py-2.5 text-center text-[10px] font-bold uppercase text-slate-500">
                    BAL
                  </th>

                  <th className="w-[10%] px-3 py-2.5 text-center text-[10px] font-bold uppercase text-slate-500">
                    STATUS
                  </th>

                </tr>
              </thead>


              <tbody>

                {rows.map((row) => {

                  const balance =
                    row.approved -
                    row.dispatched;

                  const notApproved =
                    row.ordered -
                    row.approved;

                  const status =
                    row.approved === 0
                      ? "Not Approved"
                      : row.dispatched <
                        row.approved
                      ? "Pending"
                      : "Complete";

                  return (
                    <tr
                      key={row.key}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >

                      <td className="px-4 py-2.5">

                        <div className="flex items-center gap-2">

                          <span className="truncate text-xs font-semibold text-slate-800">
                            {row.productName}
                          </span>

                          {row.isScheme && (
                            <span className="shrink-0 rounded bg-purple-50 px-1.5 py-0.5 text-[8px] font-bold text-purple-600">
                              Scheme
                            </span>
                          )}

                        </div>

                        {notApproved > 0 && (
                          <p className="mt-0.5 text-[9px] text-red-500">
                            {notApproved} not approved
                          </p>
                        )}

                      </td>


                      <td className="px-2 py-2 text-center">

                        <span className="inline-flex min-w-[34px] justify-center rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                          {row.ordered}
                        </span>

                      </td>


                      <td className="px-2 py-2 text-center">

                        <span className="inline-flex min-w-[34px] justify-center rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
                          {row.approved || "—"}
                        </span>

                      </td>


                      <td className="px-2 py-2 text-center">

                        <span
                          className={`inline-flex min-w-[34px] justify-center rounded-md px-2 py-1 text-xs font-bold ${
                            row.dispatched
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {row.dispatched || "—"}
                        </span>

                      </td>


                      <td className="px-2 py-2 text-center">

                        <span
                          className={`text-xs font-bold ${
                            balance > 0
                              ? "text-red-600"
                              : balance < 0
                              ? "text-purple-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {balance > 0
                            ? balance
                            : balance < 0
                            ? `+${Math.abs(
                                balance
                              )}`
                            : "0"}
                        </span>

                      </td>


                      <td className="px-3 py-2 text-center">

                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold ${
                            status === "Complete"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : status === "Pending"
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-red-200 bg-red-50 text-red-600"
                          }`}
                        >
                          {status}
                        </span>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>


          {/* MOBILE */}

          <div className="divide-y divide-slate-100 md:hidden">

            {rows.map((row) => {

              const balance =
                row.approved -
                row.dispatched;

              const notApproved =
                row.ordered -
                row.approved;

              const status =
                row.approved === 0
                  ? "Not Approved"
                  : row.dispatched <
                    row.approved
                  ? "Pending"
                  : "Complete";

              return (
                <div
                  key={row.key}
                  className="px-3 py-2.5"
                >

                  <div className="flex items-center justify-between gap-2">

                    <div className="flex min-w-0 items-center gap-1.5">

                      <span className="truncate text-[11px] font-bold text-slate-800">
                        {row.productName}
                      </span>

                      {row.isScheme && (
                        <span className="shrink-0 rounded bg-purple-50 px-1 py-0.5 text-[7px] font-bold text-purple-600">
                          S
                        </span>
                      )}

                    </div>

                    <span
                      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[7px] font-bold ${
                        status === "Complete"
                          ? "bg-emerald-50 text-emerald-700"
                          : status === "Pending"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {status}
                    </span>

                  </div>


                  <div className="mt-1.5 grid grid-cols-4 gap-1.5">

                    <div>
                      <p className="text-[7px] font-semibold uppercase text-slate-400">
                        ORD
                      </p>
                      <p className="text-[11px] font-bold text-blue-700">
                        {row.ordered}
                      </p>
                    </div>

                    <div>
                      <p className="text-[7px] font-semibold uppercase text-slate-400">
                        APR
                      </p>
                      <p className="text-[11px] font-bold text-amber-600">
                        {row.approved || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[7px] font-semibold uppercase text-slate-400">
                        DSP
                      </p>
                      <p className="text-[11px] font-bold text-emerald-600">
                        {row.dispatched || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[7px] font-semibold uppercase text-slate-400">
                        BAL
                      </p>
                      <p
                        className={`text-[11px] font-bold ${
                          balance > 0
                            ? "text-red-600"
                            : balance < 0
                            ? "text-purple-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {balance > 0
                          ? balance
                          : balance < 0
                          ? `+${Math.abs(
                              balance
                            )}`
                          : "0"}
                      </p>
                    </div>

                  </div>


                  {notApproved > 0 && (
                    <p className="mt-1 text-[8px] font-medium text-red-500">
                      {notApproved} qty not approved by CRM
                    </p>
                  )}

                </div>
              );
            })}

          </div>

        </Section>


        {/* =================================================
            COMPACT STATUS SUMMARY
        ================================================= */}

        <div className="grid grid-cols-3 gap-2">

          <div className="rounded-xl border border-blue-100 bg-blue-50 px-2.5 py-2.5">
            <p className="text-[9px] text-blue-500">
              Ordered
            </p>
            <p className="text-base font-bold text-blue-800">
              {totals.ordered}
            </p>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50 px-2.5 py-2.5">
            <p className="text-[9px] text-amber-500">
              Approval Pending
            </p>
            <p className="text-base font-bold text-amber-800">
              {totals.approvalPending}
            </p>
          </div>

          <div className="rounded-xl border border-red-100 bg-red-50 px-2.5 py-2.5">
            <p className="text-[9px] text-red-500">
              Dispatch Pending
            </p>
            <p className="text-base font-bold text-red-700">
              {totals.dispatchPending}
            </p>
          </div>

        </div>


        {/* =================================================
            CRM + DISPATCH
        ================================================= */}

        <div className="grid gap-2.5 lg:grid-cols-2">


          {/* CRM */}

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <button
              onClick={() =>
                setShowCRM((v) => !v)
              }
              className="flex w-full items-center justify-between px-3.5 py-3 text-left"
            >

              <div className="flex items-center gap-2.5">

                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <FaCheckCircle size={12} />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900">
                    CRM Verification
                  </p>

                  <p className="text-[9px] text-slate-400">
                    {latestCRM
                      ? `${latestCRM.crm_name || "CRM"} • ${formatDate(
                          latestCRM.verified_at
                        )}`
                      : "Verification pending"}
                  </p>
                </div>

              </div>

              {showCRM ? (
                <FaChevronUp size={11} />
              ) : (
                <FaChevronDown size={11} />
              )}

            </button>


            {showCRM && (
              <div className="border-t border-slate-100 px-3.5 pb-3">

                {latestCRM ? (
                  <>
                    <InfoLine
                      label="Status"
                      value={
                        <StatusBadge
                          status={
                            latestCRM.status
                          }
                        />
                      }
                    />

                    <InfoLine
                      label="CRM"
                      value={
                        latestCRM.crm_name
                      }
                    />

                    <InfoLine
                      label="Verified"
                      value={formatFullDate(
                        latestCRM.verified_at
                      )}
                    />

                    <InfoLine
                      label="Punched"
                      value={
                        latestCRM.punched
                          ? "Yes"
                          : "No"
                      }
                    />
                  </>
                ) : (
                  <div className="py-4 text-center text-xs text-amber-600">
                    CRM approval is pending.
                  </div>
                )}

              </div>
            )}

          </section>


          {/* DISPATCH */}

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <button
              onClick={() =>
                setShowDispatch((v) => !v)
              }
              className="flex w-full items-center justify-between px-3.5 py-3 text-left"
            >

              <div className="flex items-center gap-2.5">

                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <FaTruck size={12} />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Dispatch Details
                  </p>

                  <p className="text-[9px] text-slate-400">
                    {hasDispatch
                      ? `${totals.dispatched} qty • ${
                          latestCRM?.dispatch_location ||
                          "Location unavailable"
                        }`
                      : "Dispatch pending"}
                  </p>
                </div>

              </div>

              {showDispatch ? (
                <FaChevronUp size={11} />
              ) : (
                <FaChevronDown size={11} />
              )}

            </button>


            {showDispatch && (
              <div className="border-t border-slate-100 px-3.5 pb-3">

                <InfoLine
                  label="Location"
                  value={
                    latestCRM?.dispatch_location
                  }
                />

                <InfoLine
                  label="Dispatch Qty"
                  value={totals.dispatched}
                />

                <InfoLine
                  label="Dispatch Time"
                  value={
                    dispatchTime
                      ? formatFullDate(
                          dispatchTime
                        )
                      : "Not dispatched"
                  }
                />

                <InfoLine
                  label="Status"
                  value={
                    fullyDispatched
                      ? "Fully Dispatched"
                      : hasDispatch
                      ? "Partially Dispatched"
                      : "Pending"
                  }
                />

              </div>
            )}

          </section>

        </div>


        {/* =================================================
            ORDER VALUE
        ================================================= */}

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm">

          <div>
            <p className="text-[9px] font-medium uppercase text-slate-400">
              Order Value
            </p>

            <p className="text-base font-bold text-slate-900">
              {currency(order.total_amount)}
            </p>
          </div>

          <div className="text-right">

            <p className="text-[9px] text-slate-400">
              Dispatch Status
            </p>

            <p
              className={`text-xs font-bold ${
                fullyDispatched
                  ? "text-emerald-600"
                  : hasDispatch
                  ? "text-amber-600"
                  : "text-slate-500"
              }`}
            >
              {fullyDispatched
                ? "Completed"
                : hasDispatch
                ? "Partial"
                : "Pending"}
            </p>

          </div>

        </div>

      </main>


      {/* =================================================
          MOBILE QUICK ACTION
      ================================================= */}

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur sm:hidden">

        <div className="flex items-center justify-between gap-2">

          <div className="min-w-0">

            <p className="truncate text-[9px] text-slate-400">
              {order.order_id}
            </p>

            <p className="text-xs font-bold text-slate-800">
              {totals.ordered} Ordered
              <span className="mx-1 text-slate-300">
                •
              </span>
              {totals.dispatched} Dispatched
            </p>

          </div>

          <button
            onClick={() =>
              hardRefreshOrderDetail(
                orderId
              )
            }
            disabled={isFetching}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-bold text-white disabled:opacity-60"
          >
            <FaSyncAlt
              size={9}
              className={
                isFetching
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>

        </div>

      </div>

    </div>
  );
}