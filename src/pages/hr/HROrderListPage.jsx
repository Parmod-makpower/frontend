import { useMemo, useState } from "react";
import {
  FaClipboardList,
  FaClock,
  FaPauseCircle,
  FaCheckCircle,
  FaSyncAlt,
  FaChevronDown,
  FaTimes,
  FaFilter,
} from "react-icons/fa";

import { useHROrders } from "../../hooks/HR/useHROrders";

import HROrderFilter from "../../components/hr/HROrderFilter";
import {
  HROrderTableRow,
  HROrderMobileCard,
} from "../../components/hr/HROrderTableRow";

import BackButton from "../../Layout/BackButton";

export default function HROrderListPage() {
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
          status === "ALL" ||
          order.status === status;

        const matchCRM =
          crm === "ALL" ||
          order.crm_name === crm;

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
  }, [orders, search, status, crm]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats = useMemo(() => {
    const today = new Date();

    const isToday = (value) => {
      const date = new Date(value);

      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    };

    return {
      total: orders.length,

      pending: orders.filter(
        (order) => order.status === "PENDING"
      ).length,

      hold: orders.filter(
        (order) => order.status === "HOLD"
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
    // Existing navigation intentionally preserved.
    // navigate(`/crm/orders/${order.id}`, {
    //   state: { order },
    // });
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
      <div className="min-h-full bg-[#f5f7fb] px-3 py-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-[1800px]">

          <div className="mb-4 h-10 animate-pulse border border-slate-200 bg-white" />

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-[78px] animate-pulse border border-slate-200 bg-white"
              />
            ))}
          </div>

          <div className="mt-3 h-[500px] animate-pulse border border-slate-200 bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f5f7fb] px-3 pb-24 pt-3 sm:px-5 sm:pt-4 lg:px-6 lg:pb-6">

      <div className="mx-auto max-w-[1800px]">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="mb-3 flex min-h-[46px] items-center justify-between gap-3">

          <div className="flex min-w-0 items-center gap-3">

            {/* DESKTOP BACK */}
            <div className="hidden md:block">
              <BackButton />
            </div>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-blue-100 bg-blue-50 text-blue-600">
              <FaClipboardList size={14} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-[17px] font-bold tracking-tight text-slate-900">
                HR Orders
              </h1>

              <p className="hidden text-[10px] font-medium text-slate-400 sm:block">
                Monitor incoming orders, remarks and order status.
              </p>
            </div>

          </div>

          <div className="flex shrink-0 items-center gap-2">

            {isFetching && (
              <div className="hidden items-center gap-1.5 border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-[9px] font-semibold text-blue-600 sm:flex">
                <FaSyncAlt
                  size={8}
                  className="animate-spin"
                />
                Updating
              </div>
            )}

            {user?.role !== "CRM" && (
              <button
                type="button"
                onClick={() =>
                  setShowFilters((value) => !value)
                }
                className={`
                  flex
                  h-8
                  items-center
                  gap-1.5
                  border
                  px-2.5
                  text-[10px]
                  font-semibold
                  transition-colors
                  active:scale-[0.98]
                  ${
                    showFilters
                      ? "border-blue-200 bg-blue-50 text-blue-600"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }
                `}
              >
                <FaFilter size={9} />

                <span className="hidden sm:inline">
                  Filters
                </span>

                <FaChevronDown
                  size={8}
                  className={`transition-transform duration-150 ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}

            <button
              type="button"
              onClick={refetch}
              disabled={isFetching}
              className="
                flex
                h-8
                items-center
                gap-1.5
                bg-[#1769ff]
                px-3
                text-[10px]
                font-semibold
                text-white
                transition-colors
                hover:bg-blue-700
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <FaSyncAlt
                size={9}
                className={
                  isFetching ? "animate-spin" : ""
                }
              />

              <span>Refresh</span>
            </button>

          </div>
        </div>

        {/* =====================================================
            KPI
        ===================================================== */}

        <div className="mb-3 grid grid-cols-2 gap-3 xl:grid-cols-4">

          {/* TOTAL */}
          <div className="border border-slate-200 bg-white px-3.5 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.025)]">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Total Orders
                </p>

                <p className="mt-1 text-lg font-bold text-slate-900">
                  {stats.total}
                </p>
              </div>

              <div className="flex h-8 w-8 items-center justify-center border border-blue-100 bg-blue-50 text-blue-600">
                <FaClipboardList size={12} />
              </div>

            </div>

            <div className="mt-2 h-[2px] bg-blue-50">
              <div className="h-full w-full bg-[#1769ff]" />
            </div>
          </div>

          {/* PENDING */}
          <div className="border border-amber-100 bg-white px-3.5 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.025)]">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Pending
                </p>

                <p className="mt-1 text-lg font-bold text-amber-600">
                  {stats.pending}
                </p>
              </div>

              <div className="flex h-8 w-8 items-center justify-center border border-amber-100 bg-amber-50 text-amber-500">
                <FaClock size={12} />
              </div>

            </div>

            <div className="mt-2 h-[2px] bg-amber-50">
              <div
                className="h-full bg-amber-400"
                style={{
                  width:
                    stats.total > 0
                      ? `${Math.min(
                          100,
                          (stats.pending / stats.total) * 100
                        )}%`
                      : "0%",
                }}
              />
            </div>
          </div>

          {/* HOLD */}
          <div className="border border-slate-200 bg-white px-3.5 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.025)]">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  On Hold
                </p>

                <p className="mt-1 text-lg font-bold text-slate-700">
                  {stats.hold}
                </p>
              </div>

              <div className="flex h-8 w-8 items-center justify-center border border-slate-200 bg-slate-50 text-slate-500">
                <FaPauseCircle size={12} />
              </div>

            </div>

            <div className="mt-2 h-[2px] bg-slate-100">
              <div
                className="h-full bg-slate-400"
                style={{
                  width:
                    stats.total > 0
                      ? `${Math.min(
                          100,
                          (stats.hold / stats.total) * 100
                        )}%`
                      : "0%",
                }}
              />
            </div>
          </div>

          {/* TODAY */}
          <div className="border border-emerald-100 bg-white px-3.5 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.025)]">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Today
                </p>

                <p className="mt-1 text-lg font-bold text-emerald-600">
                  {stats.today}
                </p>
              </div>

              <div className="flex h-8 w-8 items-center justify-center border border-emerald-100 bg-emerald-50 text-emerald-600">
                <FaCheckCircle size={12} />
              </div>

            </div>

            <div className="mt-2 h-[2px] bg-emerald-50">
              <div className="h-full w-full bg-emerald-400" />
            </div>
          </div>

        </div>

        {/* =====================================================
            FILTERS
        ===================================================== */}

        {user?.role !== "CRM" && showFilters && (
          <div className="mb-3 animate-[fadeDown_.15s_ease-out]">
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

        <div className="mb-2 flex min-h-[30px] items-center justify-between gap-2">

          <div className="flex items-center gap-2">

            <span className="text-xs font-bold text-slate-800">
              Orders
            </span>

            <span className="border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-slate-500">
              {filteredOrders.length}
            </span>

            {hasActiveFilters && (
              <span className="border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
                Filtered
              </span>
            )}

          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="
                flex
                items-center
                gap-1
                px-2
                py-1
                text-[9px]
                font-semibold
                text-slate-400
                transition-colors
                hover:bg-red-50
                hover:text-red-500
              "
            >
              <FaTimes size={8} />
              Clear
            </button>
          )}

        </div>

        {/* =====================================================
            EMPTY
        ===================================================== */}

        {filteredOrders.length === 0 ? (
          <div className="
            flex
            min-h-[300px]
            flex-col
            items-center
            justify-center
            border
            border-slate-200
            bg-white
            px-5
            text-center
            shadow-[0_2px_12px_rgba(15,23,42,0.025)]
          ">

            <div className="flex h-12 w-12 items-center justify-center border border-slate-200 bg-slate-50 text-slate-400">
              <FaClipboardList size={19} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-800">
              No orders found
            </h3>

            <p className="mt-1 max-w-sm text-[10px] leading-5 text-slate-400">
              No orders match the current search or filters.
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 bg-[#1769ff] px-4 py-2 text-[10px] font-semibold text-white"
              >
                Clear Filters
              </button>
            )}

          </div>
        ) : (
          <>
            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="
              hidden
              overflow-x-auto
              border
              border-slate-200
              bg-white
              shadow-[0_2px_12px_rgba(15,23,42,0.025)]
              md:block
            ">

              <table className="
                w-full
                min-w-[1120px]
                border-separate
                border-spacing-0
              ">

                <thead>
                  <tr className="bg-[#eef3f9]">

                    <th className="
                      w-[155px]
                      border-b
                      border-slate-200
                      px-5
                      py-3
                      text-left
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-slate-500
                    ">
                      Order
                    </th>

                    <th className="
                      min-w-[270px]
                      border-b
                      border-slate-200
                      px-4
                      py-3
                      text-left
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-slate-500
                    ">
                      Party
                    </th>

                    <th className="
                      w-[190px]
                      border-b
                      border-slate-200
                      px-4
                      py-3
                      text-left
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-slate-500
                    ">
                      CRM
                    </th>

                    <th className="
                      w-[145px]
                      border-b
                      border-slate-200
                      px-4
                      py-3
                      text-left
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-slate-500
                    ">
                      Created
                    </th>

                    <th className="
                      w-[125px]
                      border-b
                      border-slate-200
                      px-4
                      py-3
                      text-left
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-slate-500
                    ">
                      Status
                    </th>

                    <th className="
                      min-w-[360px]
                      border-b
                      border-slate-200
                      px-4
                      py-3
                      text-left
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-slate-500
                    ">
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

            {/* =================================================
                MOBILE
            ================================================= */}

            <div className="space-y-2.5 md:hidden">
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

      <style>{`
        @keyframes fadeDown {
          from {
            opacity: 0;
            transform: translateY(-3px);
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