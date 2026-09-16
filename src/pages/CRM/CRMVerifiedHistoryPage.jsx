import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce, useVerifiedOrders } from "../../hooks/useVerifiedOrders";
import CustomLoader from "../../components/CustomLoader";
import VerifiedOrdersFilter from "../../components/AfterVerified/VerifiedOrdersFilter";
import { FaCheckCircle, FaClock, FaFilter } from "react-icons/fa";


export default function CRMVerifiedHistoryPage() {
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);

  // ✅ SINGLE SOURCE OF TRUTH
  const STORAGE_KEY = "verified_orders_filters";

  // ✅ INIT from localStorage
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : {
        q: "",
        party: "",
        fromDate: "",
        toDate: "",
        punched: false,
      };
  });

  // 🔥 API ke liye separate state
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const debouncedQ = useDebounce(appliedFilters.q, 500);
  const finalQ = debouncedQ.length >= 3 ? debouncedQ : "";

  const { data, isLoading, isError, isFetching } =
    useVerifiedOrders({
      ...appliedFilters,
      q: finalQ,
    });

  const results = data || [];

  const handleApply = (customFilters) => {
    const finalFilters = customFilters || filters;

    setAppliedFilters(finalFilters);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalFilters));
  };

  const crmMapping = {
    "Ankita Dhingra": "AD-AP",
    "Prince Gupta": "PG-AP",
    "Ajit Mishra": "AM-AP",
    "Harish Sharma": "HS-AP",
    "Simran Khanna": "SK-AP",
    "Rahul Kumar": "RK-AP",
    "Vivek Sharma": "VS-AP",
    "Aarti Singh": "AS-AP",
    "Kanak Maurya": "KM-AP",
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  if (isLoading) {
    return <CustomLoader fullScreen text="Loading orders..." />;
  }

  return (
    <div>
      {/* ✅ MOBILE HEADER */}
      <div className="fixed sm:hidden top-0 left-0 right-0 z-50 bg-white p-3 border-b shadow flex justify-between">
        <h2 className="text-sm font-semibold">
          Orders ({results.length})
        </h2>

        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 text-blue-600"
        >
          <FaFilter /> Filter
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4 pt-[60px] sm:pt-0">

        {/* ✅ TABLE */}
        <div className="col-span-12 md:col-span-10">
          <div className="h-[75vh] overflow-y-auto">
            <table className="w-full border-t text-xs text-center">
              <thead className="bg-gray-200 sticky top-0">
                <tr>
                  <th className="border-b border-x border-gray-400 p-2">#</th>
                  <th className="border-b border-x border-gray-400 p-2">Order ID</th>
                  <th className="border-b border-x border-gray-400 p-2">Code</th>
                  <th className="border-b border-x border-gray-400 p-2">Party</th>
                  <th className="border-b border-x border-gray-400 p-2">CRM</th>
                  <th className="border-b border-x border-gray-400 p-2">Order</th>
                  <th className="border-b border-x border-gray-400 p-2">Verified</th>
                  <th className="border-b border-x border-gray-400 p-2">
                    <label className="flex items-center justify-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.punched === true}
                        onChange={(e) => {
                          const updated = {
                            ...filters,
                            punched: e.target.checked ? true : false,
                          };

                          setFilters(updated);
                          setAppliedFilters(updated); // 🔥 instant API call
                        }}
                      />
                    </label>
                  </th>
                  <th className="border-b border-x border-gray-400 p-2">Track</th>
                </tr>
              </thead>

              <tbody>
                {isFetching ? (
                  <tr>
                    <td colSpan={7}>
                      <CustomLoader text="Searching..." />
                    </td>
                  </tr>
                ) : results.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  results.map((row, i) => {
                    const orderCode = crmMapping[row.crm_name]
                      ? `${crmMapping[row.crm_name]}${row.id}`
                      : `${row.crm_name}-${row.id}`;

                    return (
                      <tr
                        key={row.id}
                        onClick={() =>
                          navigate(`/order/${row.id}/details`)
                        }
                        className={`cursor-pointer`}
                      >
                        <td className="border-b border-x border-gray-400 p-2">{i + 1}</td>
                        <td className="border-b border-x border-gray-400 p-2">{row.order_id}</td>
                        <td className="border-b border-x border-gray-400 p-2 font-semibold">
                          {orderCode}
                        </td>
                        <td className="border-b border-x border-gray-400 p-2">
                          {row.ss_party_name}
                        </td>
                        <td className="border-b border-x border-gray-400 p-2">{row.crm_name}</td>

                        <td className="border-b border-x border-gray-400 p-2 text-xs">
                          {new Date(
                            row.ss_order_created_at
                          ).toLocaleString("en-IN")}
                        </td>

                        <td className="border-b border-x border-gray-400 p-2 text-xs">
                          {new Date(row.verified_at).toLocaleString(
                            "en-IN"
                          )}
                        </td>


                        <td className="border-b border-x border-gray-400 p-2 text-center">
                          {row.punched ? (
                            <span className="inline-flex items-center gap-1 px-2 py-[2px] text-xs rounded-full bg-green-50 text-green-600">
                              <FaCheckCircle className="text-xs" />
                              Punched
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-[2px] text-xs rounded-full bg-gray-100 text-gray-500">
                              <FaClock className="text-xs" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td
                          className="border-b border-x border-gray-400 p-2 text-blue-600 underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/orders-tracking/${row.order_id}`
                            );
                          }}
                        >
                          Track
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ✅ DESKTOP FILTER */}
        <div className="hidden md:block col-span-2">
          <VerifiedOrdersFilter
            inline={true}
            filters={filters}
            setFilters={setFilters}
            onApply={handleApply}
          />

        </div>
      </div>

      {/* ✅ MOBILE DRAWER */}
      <VerifiedOrdersFilter
        open={drawerOpen}
        setOpen={setDrawerOpen}
        filters={filters}
        setFilters={setFilters}
        onApply={handleApply}
      />
    </div>
  );
}


// import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   useDebounce,
//   useVerifiedOrders,
// } from "../../hooks/useVerifiedOrders";
// import CustomLoader from "../../components/CustomLoader";
// import VerifiedOrdersFilter from "../../components/AfterVerified/VerifiedOrdersFilter";

// import {
//   FaCheckCircle,
//   FaClock,
//   FaFilter,
//   FaSyncAlt,
//   FaBoxOpen,
//   FaSearch,
//   FaExternalLinkAlt,
// } from "react-icons/fa";

// export default function CRMVerifiedHistoryPage() {
//   const navigate = useNavigate();

//   const STORAGE_KEY = "verified_orders_filters";

//   const [drawerOpen, setDrawerOpen] = useState(false);

//   // ---------------------------------------------------------
//   // FILTER STATE
//   // ---------------------------------------------------------

//   const [filters, setFilters] = useState(() => {
//     try {
//       const saved = localStorage.getItem(STORAGE_KEY);

//       return saved
//         ? JSON.parse(saved)
//         : {
//             q: "",
//             party: "",
//             fromDate: "",
//             toDate: "",
//             punched: false,
//           };
//     } catch {
//       return {
//         q: "",
//         party: "",
//         fromDate: "",
//         toDate: "",
//         punched: false,
//       };
//     }
//   });

//   const [appliedFilters, setAppliedFilters] = useState(filters);

//   // ---------------------------------------------------------
//   // SEARCH
//   // ---------------------------------------------------------

//   const debouncedQ = useDebounce(appliedFilters.q, 500);

//   const finalQ =
//     debouncedQ && debouncedQ.length >= 3
//       ? debouncedQ
//       : "";

//   // ---------------------------------------------------------
//   // API
//   // ---------------------------------------------------------

//   const {
//     data,
//     isLoading,
//     isError,
//     isFetching,
//     refetch,
//   } = useVerifiedOrders({
//     ...appliedFilters,
//     q: finalQ,
//   });

//   const results = data || [];

//   // ---------------------------------------------------------
//   // CRM MAPPING
//   // ---------------------------------------------------------

//   const crmMapping = {
//     "Ankita Dhingra": "AD-AP",
//     "Prince Gupta": "PG-AP",
//     "Ajit Mishra": "AM-AP",
//     "Harish Sharma": "HS-AP",
//     "Simran Khanna": "SK-AP",
//     "Rahul Kumar": "RK-AP",
//     "Vivek Sharma": "VS-AP",
//     "Aarti Singh": "AS-AP",
//     "Kanak Maurya": "KM-AP",
//   };

//   // ---------------------------------------------------------
//   // LOCAL STORAGE
//   // ---------------------------------------------------------

//   useEffect(() => {
//     localStorage.setItem(
//       STORAGE_KEY,
//       JSON.stringify(filters)
//     );
//   }, [filters]);

//   // ---------------------------------------------------------
//   // APPLY FILTER
//   // ---------------------------------------------------------

//   const handleApply = (customFilters) => {
//     const finalFilters = customFilters || filters;

//     setFilters(finalFilters);
//     setAppliedFilters(finalFilters);

//     localStorage.setItem(
//       STORAGE_KEY,
//       JSON.stringify(finalFilters)
//     );
//   };

//   // ---------------------------------------------------------
//   // PUNCHED QUICK FILTER
//   // ---------------------------------------------------------

//   const handlePunchedToggle = () => {
//     const updated = {
//       ...filters,
//       punched: !filters.punched,
//     };

//     setFilters(updated);
//     setAppliedFilters(updated);

//     localStorage.setItem(
//       STORAGE_KEY,
//       JSON.stringify(updated)
//     );
//   };

//   // ---------------------------------------------------------
//   // STATS
//   // ---------------------------------------------------------

//   const stats = useMemo(() => {
//     const total = results.length;

//     const punched = results.filter(
//       (row) => row.punched
//     ).length;

//     const pending = total - punched;

//     return {
//       total,
//       punched,
//       pending,
//     };
//   }, [results]);

//   // ---------------------------------------------------------
//   // LOADING
//   // ---------------------------------------------------------

//   if (isLoading) {
//     return (
//       <CustomLoader
//         fullScreen
//         text="Loading verified orders..."
//       />
//     );
//   }

//   return (
//     <div className="min-h-full bg-[#f6f8fc]">
//       {/* =====================================================
//           MOBILE TOP HEADER
//       ====================================================== */}

//       <div className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/95 px-3 py-2.5 backdrop-blur-md md:hidden">
//         <div className="flex items-center justify-between">
//           <div className="min-w-0">
//             <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
//               Order History
//             </p>

//             <h1 className="truncate text-sm font-bold text-gray-900">
//               Verified Orders
//             </h1>
//           </div>

//           <button
//             type="button"
//             onClick={() => setDrawerOpen(true)}
//             className="group flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition-all duration-200 hover:bg-blue-700 active:scale-95"
//           >
//             <FaFilter className="text-[10px] transition-transform duration-200 group-hover:rotate-12" />
//             Filters
//           </button>
//         </div>
//       </div>

//       {/* =====================================================
//           MAIN CONTAINER
//       ====================================================== */}

//       <div className="mx-auto w-full max-w-[1800px] p-3 sm:p-4 lg:p-5">
//         {/* ===================================================
//             HERO HEADER
//         ==================================================== */}

//         <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
//           <div className="relative px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
//             {/* subtle animated background */}
//             <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-100/50 blur-3xl" />

//             <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//               {/* LEFT */}
//               <div className="flex min-w-0 items-center gap-3">
//                 <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
//                   <FaBoxOpen size={18} />

//                   <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full border-2 border-white bg-green-500" />
//                 </div>

//                 <div className="min-w-0">
//                   <div className="flex flex-wrap items-center gap-2">
//                     <h1 className="text-base font-bold text-gray-900 sm:text-lg">
//                       Verified Orders
//                     </h1>

//                     <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-blue-600">
//                       History
//                     </span>
//                   </div>

//                   <p className="mt-0.5 text-[10px] text-gray-400 sm:text-xs">
//                     Track verified orders, punching status and order activity
//                   </p>
//                 </div>
//               </div>

//               {/* STATS */}
//               <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-2.5">
//                 {/* TOTAL */}
//                 <div className="min-w-[75px] rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
//                   <div className="flex items-center gap-1.5">
//                     <FaBoxOpen className="text-[9px] text-blue-500" />
//                     <span className="text-[8px] font-semibold uppercase tracking-wide text-gray-400">
//                       Total
//                     </span>
//                   </div>

//                   <p className="mt-1 text-base font-bold text-gray-900">
//                     {stats.total}
//                   </p>
//                 </div>

//                 {/* PUNCHED */}
//                 <div className="min-w-[75px] rounded-xl border border-green-100 bg-green-50/70 px-3 py-2">
//                   <div className="flex items-center gap-1.5">
//                     <FaCheckCircle className="text-[9px] text-green-500" />
//                     <span className="text-[8px] font-semibold uppercase tracking-wide text-green-600">
//                       Punched
//                     </span>
//                   </div>

//                   <p className="mt-1 text-base font-bold text-green-700">
//                     {stats.punched}
//                   </p>
//                 </div>

//                 {/* PENDING */}
//                 <div className="min-w-[75px] rounded-xl border border-amber-100 bg-amber-50/70 px-3 py-2">
//                   <div className="flex items-center gap-1.5">
//                     <FaClock className="text-[9px] text-amber-500" />
//                     <span className="text-[8px] font-semibold uppercase tracking-wide text-amber-600">
//                       Pending
//                     </span>
//                   </div>

//                   <p className="mt-1 text-base font-bold text-amber-700">
//                     {stats.pending}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* =================================================
//               DESKTOP FILTER
//               IMPORTANT: ALWAYS VISIBLE
//           ================================================== */}

//           <div className="hidden border-t border-gray-100 bg-gray-50/70 md:block">
//             <VerifiedOrdersFilter
//               inline={true}
//               filters={filters}
//               setFilters={setFilters}
//               onApply={handleApply}
//             />
//           </div>

//           {/* =================================================
//               MOBILE SEARCH / QUICK ACTIONS
//           ================================================== */}

//           <div className="border-t border-gray-100 px-3 py-2.5 md:hidden">
//             <div className="flex items-center gap-2">
//               <div className="relative min-w-0 flex-1">
//                 <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400" />

//                 <input
//                   value={filters.q}
//                   onChange={(e) =>
//                     setFilters((prev) => ({
//                       ...prev,
//                       q: e.target.value,
//                     }))
//                   }
//                   placeholder="Search Order ID / Code..."
//                   className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-8 pr-3 text-[11px] text-gray-800 outline-none transition-all duration-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
//                 />
//               </div>

//               <button
//                 type="button"
//                 onClick={() => refetch()}
//                 className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-all duration-200 hover:border-blue-200 hover:text-blue-600 active:scale-90"
//                 title="Refresh"
//               >
//                 <FaSyncAlt
//                   className={
//                     isFetching
//                       ? "animate-spin"
//                       : ""
//                   }
//                   size={11}
//                 />
//               </button>
//             </div>
//           </div>
//         </section>

//         {/* ===================================================
//             CONTENT CARD
//         ==================================================== */}

//         <section className="mt-4 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
//           {/* SECTION HEADER */}
//           <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
//             <div>
//               <h2 className="text-sm font-bold text-gray-900">
//                 Order Records
//               </h2>

//               <p className="mt-0.5 text-[9px] text-gray-400">
//                 {stats.total} verified{" "}
//                 {stats.total === 1
//                   ? "order"
//                   : "orders"}{" "}
//                 found
//               </p>
//             </div>

//             <div className="flex items-center gap-2">
//               {/* PUNCHED QUICK TOGGLE */}
//               <button
//                 type="button"
//                 onClick={handlePunchedToggle}
//                 className={`group flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[9px] font-semibold transition-all duration-200 active:scale-95 ${
//                   filters.punched
//                     ? "border-green-200 bg-green-50 text-green-700 shadow-sm"
//                     : "border-gray-200 bg-white text-gray-500 hover:border-green-200 hover:bg-green-50 hover:text-green-700"
//                 }`}
//               >
//                 <span
//                   className={`h-2 w-2 rounded-full transition-all duration-200 ${
//                     filters.punched
//                       ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)]"
//                       : "bg-gray-300"
//                   }`}
//                 />

//                 {filters.punched
//                   ? "Punched Only"
//                   : "All Orders"}
//               </button>

//               {/* REFRESH */}
//               <button
//                 type="button"
//                 onClick={() => refetch()}
//                 className="hidden items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-[9px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-600 hover:shadow-md active:scale-95 sm:flex"
//               >
//                 <FaSyncAlt
//                   className={
//                     isFetching
//                       ? "animate-spin"
//                       : ""
//                   }
//                   size={9}
//                 />
//                 Refresh
//               </button>

//               {/* LIVE */}
//               <div className="hidden items-center gap-1.5 sm:flex">
//                 <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
//                 <span className="text-[8px] font-medium text-gray-400">
//                   Live data
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* =================================================
//               TABLE
//           ================================================== */}

//           <div className="relative overflow-x-auto">
//             <table className="w-full min-w-[1050px] border-collapse">
//               <thead>
//                 <tr className="border-b border-gray-100 bg-gray-50/80">
//                   <th className="w-12 px-3 py-3 text-center text-[8px] font-bold uppercase tracking-wider text-gray-400">
//                     #
//                   </th>

//                   <th className="px-3 py-3 text-left text-[8px] font-bold uppercase tracking-wider text-gray-400">
//                     Order
//                   </th>

//                   <th className="px-3 py-3 text-left text-[8px] font-bold uppercase tracking-wider text-gray-400">
//                     Code
//                   </th>

//                   <th className="px-3 py-3 text-left text-[8px] font-bold uppercase tracking-wider text-gray-400">
//                     Party
//                   </th>

//                   <th className="px-3 py-3 text-left text-[8px] font-bold uppercase tracking-wider text-gray-400">
//                     CRM
//                   </th>

//                   <th className="px-3 py-3 text-left text-[8px] font-bold uppercase tracking-wider text-gray-400">
//                     Order Date
//                   </th>

//                   <th className="px-3 py-3 text-left text-[8px] font-bold uppercase tracking-wider text-gray-400">
//                     Verified
//                   </th>

//                   <th className="px-3 py-3 text-center text-[8px] font-bold uppercase tracking-wider text-gray-400">
//                     <button
//                       type="button"
//                       onClick={handlePunchedToggle}
//                       className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-600"
//                       title="Toggle punched filter"
//                     >
//                       <span
//                         className={`flex h-3.5 w-3.5 items-center justify-center rounded border transition-all duration-200 ${
//                           filters.punched
//                             ? "border-blue-500 bg-blue-600"
//                             : "border-gray-300 bg-white"
//                         }`}
//                       >
//                         {filters.punched && (
//                           <FaCheckCircle className="text-[7px] text-white" />
//                         )}
//                       </span>
//                       Status
//                     </button>
//                   </th>

//                   <th className="px-3 py-3 text-center text-[8px] font-bold uppercase tracking-wider text-gray-400">
//                     Track
//                   </th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {/* FETCHING */}
//                 {isFetching ? (
//                   <tr>
//                     <td colSpan={9} className="px-4 py-14">
//                       <div className="flex flex-col items-center justify-center">
//                         <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
//                           <FaSyncAlt className="animate-spin text-blue-600" size={15} />
//                         </div>

//                         <p className="mt-3 text-xs font-semibold text-gray-600">
//                           Searching orders...
//                         </p>

//                         <p className="mt-1 text-[9px] text-gray-400">
//                           Please wait
//                         </p>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : isError ? (
//                   /* ERROR */
//                   <tr>
//                     <td colSpan={9} className="px-4 py-14">
//                       <div className="flex flex-col items-center justify-center">
//                         <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
//                           !
//                         </div>

//                         <p className="mt-3 text-xs font-semibold text-gray-700">
//                           Unable to load orders
//                         </p>

//                         <button
//                           type="button"
//                           onClick={() => refetch()}
//                           className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-[10px] font-semibold text-white transition-all hover:bg-blue-700 active:scale-95"
//                         >
//                           Try Again
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : results.length === 0 ? (
//                   /* EMPTY */
//                   <tr>
//                     <td colSpan={9} className="px-4 py-16">
//                       <div className="flex flex-col items-center justify-center">
//                         <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
//                           <FaSearch size={17} />
//                         </div>

//                         <p className="mt-3 text-sm font-semibold text-gray-700">
//                           No orders found
//                         </p>

//                         <p className="mt-1 max-w-xs text-center text-[10px] text-gray-400">
//                           Try changing the search or filter conditions.
//                         </p>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   /* DATA */
//                   results.map((row, i) => {
//                     const orderCode = crmMapping[
//                       row.crm_name
//                     ]
//                       ? `${crmMapping[row.crm_name]}${row.id}`
//                       : `${row.crm_name}-${row.id}`;

//                     return (
//                       <tr
//                         key={row.id}
//                         onClick={() =>
//                           navigate(
//                             `/order/${row.id}/details`
//                           )
//                         }
//                         className="group cursor-pointer border-b border-gray-100 bg-white transition-all duration-200 hover:bg-blue-50/40"
//                       >
//                         {/* NUMBER */}
//                         <td className="px-3 py-3 text-center">
//                           <span className="text-[9px] font-semibold text-gray-400">
//                             {i + 1}
//                           </span>
//                         </td>

//                         {/* ORDER */}
//                         <td className="px-3 py-3">
//                           <div className="flex items-center gap-2">
//                             <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-all duration-200 group-hover:scale-105 group-hover:bg-blue-100">
//                               <FaBoxOpen size={11} />
//                             </div>

//                             <div className="min-w-0">
//                               <p className="truncate text-[10px] font-bold text-gray-900">
//                                 {row.order_id}
//                               </p>

//                               <p className="mt-0.5 text-[8px] text-gray-400">
//                                 ID #{row.id}
//                               </p>
//                             </div>
//                           </div>
//                         </td>

//                         {/* CODE */}
//                         <td className="px-3 py-3">
//                           <span className="inline-flex rounded-lg bg-indigo-50 px-2 py-1 text-[9px] font-bold text-indigo-600">
//                             {orderCode}
//                           </span>
//                         </td>

//                         {/* PARTY */}
//                         <td className="max-w-[260px] px-3 py-3">
//                           <p
//                             className="truncate text-[10px] font-semibold text-gray-700"
//                             title={row.ss_party_name}
//                           >
//                             {row.ss_party_name}
//                           </p>
//                         </td>

//                         {/* CRM */}
//                         <td className="px-3 py-3">
//                           <span className="text-[10px] font-medium text-gray-600">
//                             {row.crm_name}
//                           </span>
//                         </td>

//                         {/* ORDER DATE */}
//                         <td className="px-3 py-3">
//                           <span className="whitespace-nowrap text-[9px] text-gray-500">
//                             {new Date(
//                               row.ss_order_created_at
//                             ).toLocaleString("en-IN")}
//                           </span>
//                         </td>

//                         {/* VERIFIED */}
//                         <td className="px-3 py-3">
//                           <span className="whitespace-nowrap text-[9px] text-gray-500">
//                             {new Date(
//                               row.verified_at
//                             ).toLocaleString("en-IN")}
//                           </span>
//                         </td>

//                         {/* STATUS */}
//                         <td className="px-3 py-3 text-center">
//                           {row.punched ? (
//                             <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[8px] font-bold text-green-700 transition-all duration-200 group-hover:shadow-sm">
//                               <FaCheckCircle className="text-[8px]" />
//                               Punched
//                             </span>
//                           ) : (
//                             <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[8px] font-bold text-amber-700 transition-all duration-200 group-hover:shadow-sm">
//                               <FaClock className="text-[8px]" />
//                               Pending
//                             </span>
//                           )}
//                         </td>

//                         {/* TRACK */}
//                         <td className="px-3 py-3 text-center">
//                           <button
//                             type="button"
//                             onClick={(e) => {
//                               e.stopPropagation();

//                               navigate(
//                                 `/orders-tracking/${row.order_id}`
//                               );
//                             }}
//                             className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-[8px] font-bold text-blue-600 transition-all duration-200 hover:bg-blue-600 hover:text-white hover:shadow-md active:scale-95"
//                           >
//                             Track
//                             <FaExternalLinkAlt size={7} />
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* MOBILE COUNT FOOTER */}
//           <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-2.5 md:hidden">
//             <div className="flex items-center justify-between">
//               <span className="text-[9px] text-gray-400">
//                 Showing
//               </span>

//               <span className="text-[10px] font-bold text-gray-700">
//                 {results.length} orders
//               </span>
//             </div>
//           </div>
//         </section>
//       </div>

//       {/* =====================================================
//           MOBILE FILTER DRAWER
//       ====================================================== */}

//       <VerifiedOrdersFilter
//         open={drawerOpen}
//         setOpen={setDrawerOpen}
//         filters={filters}
//         setFilters={setFilters}
//         onApply={handleApply}
//       />
//     </div>
//   );
// }