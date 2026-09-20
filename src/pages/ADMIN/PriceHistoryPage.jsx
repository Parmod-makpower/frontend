import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  History,
  RefreshCw,
  Search,
  User,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  usePriceHistory,
} from "../../hooks/usePriceManagement";

const ITEMS_PER_PAGE = 30;

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const displayPrice = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  return value;
};

const getPriceChangeType = (
  oldValue,
  newValue
) => {
  if (
    oldValue === null ||
    oldValue === undefined ||
    oldValue === ""
  ) {
    return "changed";
  }

  if (
    newValue === null ||
    newValue === undefined ||
    newValue === ""
  ) {
    return "changed";
  }

  const oldNumber = Number(oldValue);
  const newNumber = Number(newValue);

  if (
    Number.isFinite(oldNumber) &&
    Number.isFinite(newNumber)
  ) {
    if (newNumber > oldNumber) {
      return "increase";
    }

    if (newNumber < oldNumber) {
      return "decrease";
    }
  }

  return "changed";
};

/* =========================================================
   COMPONENT
========================================================= */

const PriceHistoryPage = () => {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [productFilter, setProductFilter] =
    useState("");

  const [dateFilter, setDateFilter] =
    useState("ALL");

  const [currentPage, setCurrentPage] =
    useState(1);

  const {
    data: history = [],
    isLoading,
    isFetching,
    refetch,
  } = usePriceHistory({
    product_id: productFilter,
    search,
  });

  /* =======================================================
     DATE FILTER
  ======================================================= */

  const filteredHistory = useMemo(() => {
    if (!Array.isArray(history)) {
      return [];
    }

    if (dateFilter === "ALL") {
      return history;
    }

    const now = new Date();

    let startDate = null;

    if (dateFilter === "TODAY") {
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
    }

    if (dateFilter === "7_DAYS") {
      startDate = new Date(
        now.getTime() -
          7 * 24 * 60 * 60 * 1000
      );
    }

    if (dateFilter === "30_DAYS") {
      startDate = new Date(
        now.getTime() -
          30 * 24 * 60 * 60 * 1000
      );
    }

    if (!startDate) {
      return history;
    }

    return history.filter((item) => {
      const value =
        item?.changed_at ||
        item?.applicable_from;

      if (!value) {
        return false;
      }

      const date = new Date(value);

      return date >= startDate;
    });
  }, [history, dateFilter]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.ceil(
    filteredHistory.length /
      ITEMS_PER_PAGE
  );

  const safeCurrentPage =
    totalPages === 0
      ? 1
      : Math.min(currentPage, totalPages);

  const paginatedHistory = useMemo(() => {
    const start =
      (safeCurrentPage - 1) *
      ITEMS_PER_PAGE;

    return filteredHistory.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [
    filteredHistory,
    safeCurrentPage,
  ]);

  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    setSearch(
      searchInput.trim()
    );

    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setCurrentPage(1);
  };

  const handleProductFilter = (event) => {
    setProductFilter(
      event.target.value
    );

    setCurrentPage(1);
  };

  const handleDateFilter = (event) => {
    setDateFilter(
      event.target.value
    );

    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);
  };

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const records =
      Array.isArray(filteredHistory)
        ? filteredHistory
        : [];

    const uniqueProducts =
      new Set(
        records.map(
          (item) =>
            item?.product_id
        )
      );

    const uniqueUsers =
      new Set(
        records
          .map(
            (item) =>
              item?.changed_by_user_id
          )
          .filter(Boolean)
      );

    const increases =
      records.filter(
        (item) =>
          getPriceChangeType(
            item?.old_price,
            item?.new_price
          ) === "increase" ||
          getPriceChangeType(
            item?.old_ds_price,
            item?.new_ds_price
          ) === "increase"
      ).length;

    const decreases =
      records.filter(
        (item) =>
          getPriceChangeType(
            item?.old_price,
            item?.new_price
          ) === "decrease" ||
          getPriceChangeType(
            item?.old_ds_price,
            item?.new_ds_price
          ) === "decrease"
      ).length;

    return {
      changes: records.length,
      products: uniqueProducts.size,
      users: uniqueUsers.size,
      increases,
      decreases,
    };
  }, [filteredHistory]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="w-full min-w-0 p-3 sm:p-4">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-3 rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/price-management"
                )
              }
              title="Back to Price Management"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
            >
              <ArrowLeft size={16} />
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <History size={17} />
            </div>

            <div>
              <h1 className="text-sm font-bold text-gray-900">
                Price History
              </h1>

              <p className="text-[10px] text-gray-500">
                Complete SKU price change timeline
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 transition-all hover:bg-gray-50 hover:text-blue-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 lg:self-auto"
          >
            <RefreshCw
              size={14}
              className={
                isFetching
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

        {/* ===================================================
            SEARCH BAR
        ==================================================== */}

        <div className="border-t border-gray-100 p-3">

          <div className="flex flex-col gap-2 xl:flex-row">

            {/* Search */}
            <form
              onSubmit={
                handleSearchSubmit
              }
              className="min-w-0 flex-1"
            >
              <div className="relative">

                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) =>
                    setSearchInput(
                      event.target.value
                    )
                  }
                  placeholder="Search product, SKU, user name or user ID..."
                  className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-20 text-xs text-gray-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-12 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-gray-400 transition hover:bg-gray-200 hover:text-gray-700"
                  >
                    <X size={14} />
                  </button>
                )}

                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md bg-blue-600 px-2.5 py-1.5 text-[10px] font-bold text-white transition hover:bg-blue-700 active:scale-95"
                >
                  Search
                </button>

              </div>
            </form>

            {/* Product ID */}
            <input
              type="number"
              value={productFilter}
              onChange={
                handleProductFilter
              }
              placeholder="SKU / Product ID"
              className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs text-gray-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 xl:w-[170px]"
            />

            {/* Date */}
            <select
              value={dateFilter}
              onChange={
                handleDateFilter
              }
              className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs font-medium text-gray-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 xl:w-[160px]"
            >
              <option value="ALL">
                All Time
              </option>

              <option value="TODAY">
                Today
              </option>

              <option value="7_DAYS">
                Last 7 Days
              </option>

              <option value="30_DAYS">
                Last 30 Days
              </option>
            </select>

          </div>

          {search && (
            <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-500">

              <span>
                Search:
              </span>

              <span className="rounded-full bg-blue-50 px-2 py-1 font-semibold text-blue-700">
                {search}
              </span>

              <button
                type="button"
                onClick={clearSearch}
                className="font-semibold text-gray-500 hover:text-gray-800"
              >
                Clear
              </button>

            </div>
          )}

        </div>
      </div>

      {/* =====================================================
          QUICK STATS
      ====================================================== */}

      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-5">

        <StatBox
          icon={<History size={14} />}
          label="Changes"
          value={stats.changes}
          className="blue"
        />

        <StatBox
          icon={<CalendarDays size={14} />}
          label="Products"
          value={stats.products}
          className="indigo"
        />

        <StatBox
          icon={<User size={14} />}
          label="Users"
          value={stats.users}
          className="slate"
        />

        <StatBox
          icon={<ArrowUp size={14} />}
          label="Increases"
          value={stats.increases}
          className="rose"
        />

        <StatBox
          icon={<ArrowDown size={14} />}
          label="Decreases"
          value={stats.decreases}
          className="green"
        />

      </div>

      {/* =====================================================
          HISTORY SHEET
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {/* Sheet Header */}

        <div className="flex flex-col gap-1 border-b border-gray-200 bg-gray-50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-xs font-bold text-gray-700">
              Change Timeline
            </p>

            <p className="text-[10px] text-gray-400">
              Applicable date = business effective date
              &nbsp;•&nbsp;
              Changed At = actual update time
            </p>
          </div>

          <div className="text-[10px] font-semibold text-gray-500">
            {filteredHistory.length} records
          </div>

        </div>

        {/* ===================================================
            LOADING
        ==================================================== */}

        {isLoading ? (
          <HistorySkeleton />
        ) : filteredHistory.length === 0 ? (
          <EmptyHistory />
        ) : (
          <div className="max-h-[calc(100vh-350px)] min-h-[400px] overflow-auto">

            <table className="w-full min-w-[1200px] border-collapse text-left text-xs">

              <thead className="sticky top-0 z-20">

                <tr className="border-b border-gray-200 bg-gray-100">

                  <th className="w-[250px] px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                    Product / SKU
                  </th>

                  <th className="w-[190px] bg-blue-50 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                    SS Price
                  </th>

                  <th className="w-[190px] bg-purple-50 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-purple-700">
                    DS Price
                  </th>

                  <th className="w-[155px] px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                    Applicable From
                  </th>

                  <th className="w-[175px] px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                    Changed At
                  </th>

                  <th className="w-[190px] px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                    Changed By
                  </th>

                  <th className="min-w-[220px] px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                    Reason
                  </th>

                </tr>

              </thead>

              <tbody>

                {paginatedHistory.map(
                  (item, index) => {
                    const ssChange =
                      getPriceChangeType(
                        item?.old_price,
                        item?.new_price
                      );

                    const dsChange =
                      getPriceChangeType(
                        item?.old_ds_price,
                        item?.new_ds_price
                      );

                    return (
                      <tr
                        key={
                          item?.id ??
                          `${item?.product_id}-${index}`
                        }
                        className="group border-b border-gray-100 transition-colors hover:bg-blue-50/30"
                      >

                        {/* PRODUCT */}

                        <td className="px-3 py-2.5">

                          <div className="flex items-start gap-2">

                            <span className="mt-0.5 rounded-md bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-500">
                              #{item?.product_id}
                            </span>

                            <div className="min-w-0">

                              <div
                                title={
                                  item?.product_name ||
                                  ""
                                }
                                className="max-w-[210px] truncate text-xs font-bold text-gray-800"
                              >
                                {item?.product_name ||
                                  "Unnamed Product"}
                              </div>

                              <div className="mt-0.5 text-[9px] text-gray-400">
                                Price record
                              </div>

                            </div>

                          </div>

                        </td>

                        {/* SS PRICE */}

                        <td className="bg-blue-50/30 px-3 py-2.5">
                          <PriceChange
                            oldValue={
                              item?.old_price
                            }
                            newValue={
                              item?.new_price
                            }
                            type={ssChange}
                          />
                        </td>

                        {/* DS PRICE */}

                        <td className="bg-purple-50/30 px-3 py-2.5">
                          <PriceChange
                            oldValue={
                              item?.old_ds_price
                            }
                            newValue={
                              item?.new_ds_price
                            }
                            type={dsChange}
                          />
                        </td>

                        {/* APPLICABLE DATE */}

                        <td className="px-3 py-2.5">

                          <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1.5 text-[10px] font-semibold text-blue-700">

                            <CalendarDays
                              size={12}
                            />

                            {formatDate(
                              item?.applicable_from
                            )}

                          </div>

                        </td>

                        {/* CHANGED AT */}

                        <td className="px-3 py-2.5">

                          <div className="flex items-start gap-1.5 text-[10px] text-gray-600">

                            <Clock3
                              size={12}
                              className="mt-0.5 shrink-0 text-gray-400"
                            />

                            <span className="whitespace-nowrap">
                              {formatDateTime(
                                item?.changed_at
                              )}
                            </span>

                          </div>

                        </td>

                        {/* USER */}

                        <td className="px-3 py-2.5">

                          <div className="min-w-[150px]">

                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700">

                              <User
                                size={12}
                                className="text-gray-400"
                              />

                              {item?.changed_by_name ||
                                "Unknown"}

                            </div>

                            <div className="mt-0.5 text-[9px] text-gray-400">

                              {item?.changed_by_role ||
                                "—"}

                              {item?.changed_by_user_id
                                ? ` • ${item.changed_by_user_id}`
                                : ""}

                            </div>

                          </div>

                        </td>

                        {/* REASON */}

                        <td className="px-3 py-2.5">

                          <div
                            title={
                              item?.reason ||
                              ""
                            }
                            className="max-w-[250px] truncate text-[10px] text-gray-500"
                          >
                            {item?.reason ||
                              "No reason provided"}
                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

        {/* ===================================================
            PAGINATION FOOTER
        ==================================================== */}

        {!isLoading &&
          filteredHistory.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-gray-200 bg-gray-50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">

              <div className="text-[10px] text-gray-500">

                Showing{" "}
                <b className="text-gray-700">
                  {(safeCurrentPage - 1) *
                    ITEMS_PER_PAGE +
                    1}
                </b>

                {" — "}

                <b className="text-gray-700">
                  {Math.min(
                    safeCurrentPage *
                      ITEMS_PER_PAGE,
                    filteredHistory.length
                  )}
                </b>

                {" of "}

                <b className="text-gray-700">
                  {filteredHistory.length}
                </b>

              </div>

              <div className="flex items-center gap-1">

                <button
                  type="button"
                  onClick={() =>
                    handlePageChange(
                      safeCurrentPage - 1
                    )
                  }
                  disabled={
                    safeCurrentPage === 1
                  }
                  className="flex h-7 items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={13} />
                  Prev
                </button>

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) =>
                    index + 1
                )
                  .filter((page) => {
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(
                        page -
                          safeCurrentPage
                      ) <= 1
                    );
                  })
                  .map(
                    (
                      page,
                      index,
                      pages
                    ) => (
                      <span
                        key={page}
                        className="flex items-center gap-1"
                      >

                        {index > 0 &&
                          page -
                            pages[
                              index - 1
                            ] >
                            1 && (
                            <span className="px-1 text-gray-400">
                              …
                            </span>
                          )}

                        <button
                          type="button"
                          onClick={() =>
                            handlePageChange(
                              page
                            )
                          }
                          className={`h-7 min-w-7 rounded-md px-2 text-[10px] font-bold transition ${
                            safeCurrentPage ===
                            page
                              ? "bg-blue-600 text-white shadow-sm"
                              : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>

                      </span>
                    )
                  )}

                <button
                  type="button"
                  onClick={() =>
                    handlePageChange(
                      safeCurrentPage + 1
                    )
                  }
                  disabled={
                    safeCurrentPage ===
                    totalPages
                  }
                  className="flex h-7 items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight
                    size={13}
                  />
                </button>

              </div>

            </div>
          )}

      </div>
    </div>
  );
};

/* =========================================================
   STAT BOX
========================================================= */

const StatBox = ({
  icon,
  label,
  value,
  className,
}) => {
  const styles = {
    blue: {
      wrapper:
        "border-blue-100 bg-blue-50/60",
      icon:
        "bg-blue-100 text-blue-600",
      value:
        "text-blue-800",
    },

    indigo: {
      wrapper:
        "border-indigo-100 bg-indigo-50/60",
      icon:
        "bg-indigo-100 text-indigo-600",
      value:
        "text-indigo-800",
    },

    slate: {
      wrapper:
        "border-gray-200 bg-gray-50/70",
      icon:
        "bg-gray-100 text-gray-500",
      value:
        "text-gray-800",
    },

    rose: {
      wrapper:
        "border-rose-100 bg-rose-50/60",
      icon:
        "bg-rose-100 text-rose-600",
      value:
        "text-rose-700",
    },

    green: {
      wrapper:
        "border-emerald-100 bg-emerald-50/60",
      icon:
        "bg-emerald-100 text-emerald-600",
      value:
        "text-emerald-700",
    },
  };

  const style =
    styles[className] ||
    styles.slate;

  return (
    <div
      className={`rounded-lg border p-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${style.wrapper}`}
    >
      <div className="flex items-center gap-2">

        <div
          className={`flex h-7 w-7 items-center justify-center rounded-md ${style.icon}`}
        >
          {icon}
        </div>

        <div className="min-w-0">

          <p className="truncate text-[9px] font-bold uppercase tracking-wide text-gray-500">
            {label}
          </p>

          <p
            className={`text-base font-bold ${style.value}`}
          >
            {value}
          </p>

        </div>

      </div>
    </div>
  );
};

/* =========================================================
   PRICE CHANGE
========================================================= */

const PriceChange = ({
  oldValue,
  newValue,
  type,
}) => {
  const hasOld =
    oldValue !== null &&
    oldValue !== undefined &&
    oldValue !== "";

  const hasNew =
    newValue !== null &&
    newValue !== undefined &&
    newValue !== "";

  if (
    hasOld &&
    hasNew &&
    String(oldValue) ===
      String(newValue)
  ) {
    return (
      <span className="text-[10px] text-gray-400">
        No change
      </span>
    );
  }

  const isIncrease =
    type === "increase";

  const isDecrease =
    type === "decrease";

  return (
    <div className="flex items-center gap-2">

      <div className="min-w-[42px]">
        <span className="text-[10px] text-gray-400 line-through">
          {displayPrice(oldValue)}
        </span>
      </div>

      <span className="text-gray-300">
        →
      </span>

      <div className="min-w-[48px]">
        <span
          className={`text-xs font-bold ${
            isIncrease
              ? "text-rose-600"
              : isDecrease
              ? "text-emerald-600"
              : "text-blue-600"
          }`}
        >
          {displayPrice(newValue)}
        </span>
      </div>

      {hasNew && (
        <span
          title={
            isIncrease
              ? "Price increased"
              : isDecrease
              ? "Price decreased"
              : "Price changed"
          }
          className={`flex h-5 w-5 items-center justify-center rounded-full ${
            isIncrease
              ? "bg-rose-50 text-rose-600"
              : isDecrease
              ? "bg-emerald-50 text-emerald-600"
              : "bg-blue-50 text-blue-600"
          }`}
        >
          {isIncrease ? (
            <ArrowUp size={11} />
          ) : isDecrease ? (
            <ArrowDown size={11} />
          ) : (
            <span className="text-[9px] font-bold">
              ↗
            </span>
          )}
        </span>
      )}

    </div>
  );
};

/* =========================================================
   LOADING SKELETON
========================================================= */

const HistorySkeleton = () => {
  return (
    <div className="animate-pulse">

      <div className="space-y-0">
        {Array.from(
          { length: 8 },
          (_, index) => (
            <div
              key={index}
              className="grid min-w-[1100px] grid-cols-7 gap-3 border-b border-gray-100 px-3 py-4"
            >
              <div className="h-7 rounded bg-gray-100" />
              <div className="h-7 rounded bg-blue-50" />
              <div className="h-7 rounded bg-purple-50" />
              <div className="h-7 rounded bg-gray-100" />
              <div className="h-7 rounded bg-gray-100" />
              <div className="h-7 rounded bg-gray-100" />
              <div className="h-7 rounded bg-gray-100" />
            </div>
          )
        )}
      </div>

    </div>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyHistory = () => {
  return (
    <div className="flex min-h-[400px] items-center justify-center px-6">

      <div className="text-center">

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
          <History size={21} />
        </div>

        <p className="mt-3 text-sm font-bold text-gray-700">
          No price history found
        </p>

        <p className="mt-1 text-[11px] text-gray-400">
          Try another SKU, search term or date filter.
        </p>

      </div>

    </div>
  );
};

export default PriceHistoryPage;