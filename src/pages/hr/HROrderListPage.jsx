// import { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import { useHROrders } from "../../hooks/HR/useHROrders";

// import HROrderFilter from "../../components/hr/HROrderFilter";
// import HROrderTableRow from "../../components/hr/HROrderTableRow";

// export default function HROrderListPage() {
//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem("user"));

//   const [search, setSearch] = useState("");
//   const [status, setStatus] = useState("ALL");
//   const [crm, setCrm] = useState("ALL");

//   const {
//     data: orders = [],
//     isLoading,
//     isFetching,
//     refetch,
//   } = useHROrders();

//   const crmList = useMemo(() => {
//     return [
//       ...new Set(
//         orders
//           .map((o) => o.crm_name)
//           .filter(Boolean)
//       ),
//     ];
//   }, [orders]);

//   // -----------------------------
//   // Local Search
//   // -----------------------------
//  const filteredOrders = useMemo(() => {
//   return orders
//     .filter((order) => {
//       const term = search.toLowerCase();

//       const matchSearch =
//         !search ||
//         order.order_id?.toLowerCase().includes(term) ||
//         order.ss_party_name?.toLowerCase().includes(term) ||
//         order.crm_name?.toLowerCase().includes(term);

//       const matchStatus =
//         status === "ALL" || order.status === status;

//       const matchCRM =
//         crm === "ALL" || order.crm_name === crm;

//       return matchSearch && matchStatus && matchCRM;
//     })
//     .sort(
//       (a, b) =>
//         new Date(b.created_at) -
//         new Date(a.created_at)
//     );
// }, [orders, search, status, crm]);

  

//   const Section = ({ title }) => (
//     <h2 className="mt-5 mb-2 text-sm font-semibold text-gray-700">
//       {title}
//     </h2>
//   );

//   const renderTable = (list) => (
//     <div className="overflow-hidden rounded border border-gray-200 ">
//     <div className=" overflow-x-auto max-h-[65vh]">
//         <table className="w-full min-w-[1200px] border-separate border-spacing-0 ">
//           <thead className="sticky top-0 z-10 bg-slate-200 border">
//            <tr className="text-xs uppercase tracking-wide text-gray-600">
//               <th className="px-4 py-3">Order ID</th>

//               <th className="px-4 py-3 text-left">Party Name</th>

//               <th className="px-4 py-3">CRM</th>

//               <th className="px-4 py-3">Date</th>

//               <th className="px-4 py-3">Status</th>

//               <th className="px-4 py-3 text-left">Remarks</th>
//             </tr>
//           </thead>

//           <tbody >
//             {list.map((order) => (
//               <HROrderTableRow
//                 key={order.id}
//                 order={order}
//                 onClick={() =>
//                   navigate(`/hr/orders/${order.id}`, {
//                     state: {
//                       order,
//                     },
//                   })
//                 }
//               />
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );

//   if (isLoading) {
//     return (
//       <div className="flex h-64 items-center justify-center">
//         <p className="animate-pulse text-sm text-gray-500">
//           Loading Orders...
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div
//       className={
//         user?.role === "CRM"
//           ? "w-full p-3 pb-20"
//           : "mx-auto max-w-[1900px] p-3 pb-20"
//       }
//     >
//       {isFetching && (
//         <div className="mb-2 animate-pulse text-center text-xs text-blue-600">
//           Updating Orders...
//         </div>
//       )}

//       <div
//         className={
//           user?.role === "CRM"
//             ? "grid grid-cols-1"
//             : "grid grid-cols-1 gap-4 items-start xl:grid-cols-[minmax(0,1fr)_300px]"
//         }
//       >
//         {/* LEFT SIDE ORDERS */}
//         <div>
//           {filteredOrders.length === 0 && (
//             <div className="py-20 text-center">
//               <img
//                 src="https://cdn-icons-png.flaticon.com/512/7486/7486740.png"
//                 alt="No Orders"
//                 className="mx-auto w-24 opacity-50"
//               />

//               <h3 className="mt-4 text-sm font-semibold">
//                 No Orders Found
//               </h3>

//               <p className="mt-1 text-xs text-gray-500">
//                 Try changing filters.
//               </p>
//             </div>
//           )}


//          {filteredOrders.length > 0 && renderTable(filteredOrders)}
//         </div>

//         {/* RIGHT FILTER */}
//         {user?.role !== "CRM" && (
//           <div className="xl:sticky xl:top-4">
//             <HROrderFilter
//               search={search}
//               setSearch={setSearch}
//               status={status}
//               setStatus={setStatus}
//               crm={crm}
//               setCrm={setCrm}
//               crmList={crmList}
//               onRefresh={refetch}
//               isFetching={isFetching}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaClipboardList,
  FaClock,
  FaPauseCircle,
  FaCheckCircle,
  FaSyncAlt,
  FaChevronDown,
  FaTimes,
  FaSearch,
} from "react-icons/fa";

import { useHROrders } from "../../hooks/HR/useHROrders";

import HROrderFilter from "../../components/hr/HROrderFilter";
import {
  HROrderTableRow,
  HROrderMobileCard,
} from "../../components/hr/HROrderTableRow";

export default function HROrderListPage() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [crm, setCrm] = useState("ALL");
  const [showFilters, setShowFilters] = useState(true);

  const {
    data: orders = [],
    isLoading,
    isFetching,
    refetch,
  } = useHROrders();

  /* =========================================================
     CRM LIST
  ========================================================= */

  const crmList = useMemo(() => {
    return [
      ...new Set(
        orders
          .map((order) => order.crm_name)
          .filter(Boolean)
      ),
    ].sort();
  }, [orders]);

  /* =========================================================
     FILTERED ORDERS
  ========================================================= */

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders
      .filter((order) => {
        const matchSearch =
          !term ||
          order.order_id?.toLowerCase().includes(term) ||
          order.ss_party_name?.toLowerCase().includes(term) ||
          order.crm_name?.toLowerCase().includes(term);

        const matchStatus =
          status === "ALL" || order.status === status;

        const matchCRM =
          crm === "ALL" || order.crm_name === crm;

        return (
          matchSearch &&
          matchStatus &&
          matchCRM
        );
      })
      .sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      );
  }, [
    orders,
    search,
    status,
    crm,
  ]);

  /* =========================================================
     DASHBOARD STATS
  ========================================================= */

  const stats = useMemo(() => {
    const today = new Date();

    const isToday = (dateValue) => {
      const date = new Date(dateValue);

      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    };

    return {
      total: orders.length,

      pending: orders.filter(
        (order) =>
          order.status === "PENDING"
      ).length,

      hold: orders.filter(
        (order) =>
          order.status === "HOLD"
      ).length,

      today: orders.filter((order) =>
        isToday(order.created_at)
      ).length,
    };
  }, [orders]);

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const openOrder = (order) => {
    navigate(`/crm/orders/${order.id}`, {
      state: {
        order,
      },
    });
  };

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearFilters = () => {
    setSearch("");
    setStatus("ALL");
    setCrm("ALL");
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    status !== "ALL" ||
    crm !== "ALL";

  /* =========================================================
     LOADING
  ========================================================= */

  if (isLoading) {
    return (
      <div className="min-h-[70vh] bg-[#f6f8fb] px-4 py-6">
        <div className="mx-auto max-w-[1800px]">

          <div className="mb-6 h-8 w-52 animate-pulse rounded-lg bg-slate-200" />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>

          <div className="mt-5 h-[500px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f6f8fb] px-3 pb-24 pt-4 sm:px-5 sm:pt-5 lg:px-6">

      <div className="mx-auto max-w-[1800px]">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="min-w-0">
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.22)]">
                <FaClipboardList size={17} />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  HR Orders
                </h1>

                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                  Monitor incoming orders, remarks and order status.
                </p>
              </div>

            </div>
          </div>

          <div className="flex items-center gap-2">

            {isFetching && (
              <div className="hidden items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-600 sm:flex">
                <FaSyncAlt className="animate-spin" size={10} />
                Updating
              </div>
            )}

            {user?.role !== "CRM" && (
              <button
                type="button"
                onClick={() =>
                  setShowFilters((value) => !value)
                }
                className="
                  inline-flex
                  h-10
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3.5
                  text-xs
                  font-semibold
                  text-slate-700
                  shadow-sm
                  transition-all
                  hover:border-blue-200
                  hover:bg-blue-50
                  active:scale-[0.98]
                "
              >
                <FaSearch
                  size={11}
                  className="text-blue-600"
                />

                <span className="hidden sm:inline">
                  Filters
                </span>

                <FaChevronDown
                  size={9}
                  className={`transition-transform ${
                    showFilters
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>
            )}

            <button
              type="button"
              onClick={refetch}
              disabled={isFetching}
              className="
                inline-flex
                h-10
                items-center
                gap-2
                rounded-xl
                bg-blue-600
                px-4
                text-xs
                font-bold
                text-white
                shadow-[0_7px_18px_rgba(37,99,235,0.20)]
                transition-all
                hover:-translate-y-0.5
                hover:bg-blue-700
                hover:shadow-[0_10px_24px_rgba(37,99,235,0.25)]
                active:translate-y-0
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <FaSyncAlt
                size={11}
                className={
                  isFetching
                    ? "animate-spin"
                    : ""
                }
              />

              <span>Refresh</span>
            </button>

          </div>
        </div>

        {/* =====================================================
            KPI CARDS
        ===================================================== */}

        <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">

          {/* Total */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_3px_15px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Total Orders
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  {stats.total}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform duration-200 group-hover:scale-110">
                <FaClipboardList size={15} />
              </div>

            </div>

            <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-full rounded-full bg-blue-500" />
            </div>

          </div>

          {/* Pending */}
          <div className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-white p-4 shadow-[0_3px_15px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Pending
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight text-amber-600">
                  {stats.pending}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500 transition-transform duration-200 group-hover:scale-110">
                <FaClock size={15} />
              </div>

            </div>

            <div className="mt-3 h-1 overflow-hidden rounded-full bg-amber-50">
              <div
                className="h-full rounded-full bg-amber-400 transition-all duration-500"
                style={{
                  width:
                    stats.total > 0
                      ? `${Math.min(
                          100,
                          (stats.pending /
                            stats.total) *
                            100
                        )}%`
                      : "0%",
                }}
              />
            </div>

          </div>

          {/* Hold */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_3px_15px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  On Hold
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-700">
                  {stats.hold}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-transform duration-200 group-hover:scale-110">
                <FaPauseCircle size={15} />
              </div>

            </div>

            <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-400 transition-all duration-500"
                style={{
                  width:
                    stats.total > 0
                      ? `${Math.min(
                          100,
                          (stats.hold /
                            stats.total) *
                            100
                        )}%`
                      : "0%",
                }}
              />
            </div>

          </div>

          {/* Today */}
          <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_3px_15px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Today
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-600">
                  {stats.today}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform duration-200 group-hover:scale-110">
                <FaCheckCircle size={15} />
              </div>

            </div>

            <div className="mt-3 h-1 overflow-hidden rounded-full bg-emerald-50">
              <div className="h-full w-full rounded-full bg-emerald-400" />
            </div>

          </div>

        </div>

        {/* =====================================================
            FILTER AREA
        ===================================================== */}

        {user?.role !== "CRM" && showFilters && (
          <div className="mb-5 animate-[fadeDown_0.2s_ease-out]">
            <HROrderFilter
              search={search}
              setSearch={setSearch}
              status={status}
              setStatus={setStatus}
              crm={crm}
              setCrm={setCrm}
              crmList={crmList}
              onRefresh={refetch}
              isFetching={isFetching}
            />
          </div>
        )}

        {/* =====================================================
            RESULT BAR
        ===================================================== */}

        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">

          <div className="flex items-center gap-2">

            <span className="text-sm font-bold text-slate-800">
              Orders
            </span>

            <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
              {filteredOrders.length}
            </span>

            {hasActiveFilters && (
              <span className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-600">
                Filtered
              </span>
            )}

          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                px-2.5
                py-1.5
                text-[10px]
                font-bold
                text-slate-500
                transition-colors
                hover:bg-red-50
                hover:text-red-500
              "
            >
              <FaTimes size={9} />
              Clear filters
            </button>
          )}

        </div>

        {/* =====================================================
            ORDERS
        ===================================================== */}

        {filteredOrders.length === 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]">

            <div className="flex min-h-[390px] flex-col items-center justify-center px-5 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <FaClipboardList size={25} />
              </div>

              <h3 className="mt-5 text-sm font-bold text-slate-800">
                No orders found
              </h3>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                No orders match the current search or filters.
                Try clearing the filters and check again.
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    mt-5
                    rounded-xl
                    bg-blue-600
                    px-4
                    py-2.5
                    text-xs
                    font-bold
                    text-white
                    shadow-sm
                    transition-all
                    hover:bg-blue-700
                    active:scale-[0.98]
                  "
                >
                  Clear Filters
                </button>
              )}

            </div>
          </div>
        ) : (
          <>
            {/* DESKTOP */}

            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_22px_rgba(15,23,42,0.05)] md:block">

              <div className="max-h-[calc(100vh-390px)] min-h-[350px] overflow-auto">

                <table className="w-full min-w-[1050px] border-separate border-spacing-0">

                  <thead className="sticky top-0 z-20">
                    <tr className="bg-[#eef3f9]">

                      <th className="w-[150px] border-b border-slate-200 px-5 py-3.5 text-left text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                        Order
                      </th>

                      <th className="min-w-[270px] border-b border-slate-200 px-4 py-3.5 text-left text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                        Party
                      </th>

                      <th className="w-[190px] border-b border-slate-200 px-4 py-3.5 text-left text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                        CRM
                      </th>

                      <th className="w-[145px] border-b border-slate-200 px-4 py-3.5 text-left text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                        Created
                      </th>

                      <th className="w-[130px] border-b border-slate-200 px-4 py-3.5 text-left text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                        Status
                      </th>

                      <th className="min-w-[330px] border-b border-slate-200 px-4 py-3.5 text-left text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                        Remarks
                      </th>

                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.map((order) => (
                      <HROrderTableRow
                        key={order.id}
                        order={order}
                        onClick={() =>
                          openOrder(order)
                        }
                      />
                    ))}
                  </tbody>

                </table>
              </div>
            </div>

            {/* MOBILE */}

            <div className="space-y-3 md:hidden">

              {filteredOrders.map((order) => (
                <HROrderMobileCard
                  key={order.id}
                  order={order}
                  onClick={() =>
                    openOrder(order)
                  }
                />
              ))}

            </div>
          </>
        )}

      </div>

      {/* =====================================================
          SMALL GLOBAL ANIMATION
      ===================================================== */}

      <style>{`
        @keyframes fadeDown {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

    </div>
  );
}