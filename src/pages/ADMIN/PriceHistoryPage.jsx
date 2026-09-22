import {
  useMemo,
  useState,
} from "react";

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  FileSpreadsheet,
  Filter,
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

import exportPriceHistoryExcel from "../../utils/ExportPriceHistoryExcel";

import exportPriceHistoryPDF from "../../utils/ExportPriceHistoryPDF";


/* =========================================================
   CONSTANTS
========================================================= */

const ITEMS_PER_PAGE = 10;


/* =========================================================
   HELPERS
========================================================= */

const formatPrice = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return number.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};


const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


/* =========================================================
   PRICE FIELD HELPERS
========================================================= */

const PRICE_FIELDS = {
  SS: {
    oldField: "old_price",
    newField: "new_price",
  },

  DS: {
    oldField: "old_ds_price",
    newField: "new_ds_price",
  },

  DLR: {
    oldField: "old_dlr_price",
    newField: "new_dlr_price",
  },
};


const getPriceChangeDirection = (
  item,
  priceType
) => {
  const fields =
    PRICE_FIELDS[priceType];

  if (!fields) {
    return "same";
  }

  const oldValue =
    Number(item?.[fields.oldField]);

  const newValue =
    Number(item?.[fields.newField]);

  if (
    Number.isNaN(oldValue) ||
    Number.isNaN(newValue)
  ) {
    return "same";
  }

  if (newValue > oldValue) {
    return "up";
  }

  if (newValue < oldValue) {
    return "down";
  }

  return "same";
};


const hasPriceChange = (
  item,
  priceType
) => {
  const fields =
    PRICE_FIELDS[priceType];

  if (!fields) {
    return false;
  }

  const oldValue =
    Number(item?.[fields.oldField]);

  const newValue =
    Number(item?.[fields.newField]);

  if (
    Number.isNaN(oldValue) ||
    Number.isNaN(newValue)
  ) {
    return false;
  }

  return oldValue !== newValue;
};


/* =========================================================
   PRICE CHANGE COMPONENT
========================================================= */

const PriceChange = ({
  oldValue,
  newValue,
}) => {
  const oldNumber =
    Number(oldValue);

  const newNumber =
    Number(newValue);

  const valid =
    !Number.isNaN(oldNumber) &&
    !Number.isNaN(newNumber);

  let direction = "same";

  if (valid) {
    if (newNumber > oldNumber) {
      direction = "up";
    } else if (newNumber < oldNumber) {
      direction = "down";
    }
  }

  return (
    <div className="flex min-w-0 items-center justify-end gap-1.5 whitespace-nowrap">

      <span className="text-[10px] text-slate-400">
        ₹{formatPrice(oldValue)}
      </span>

      <span className="text-slate-300">
        →
      </span>

      <span
        className={
          direction === "up"
            ? "font-semibold text-emerald-600"
            : direction === "down"
            ? "font-semibold text-red-600"
            : "font-semibold text-slate-700"
        }
      >
        ₹{formatPrice(newValue)}
      </span>

      {direction === "up" && (
        <ArrowUp
          size={12}
          strokeWidth={2.5}
          className="text-emerald-500"
        />
      )}

      {direction === "down" && (
        <ArrowDown
          size={12}
          strokeWidth={2.5}
          className="text-red-500"
        />
      )}

    </div>
  );
};


/* =========================================================
   SMALL FILTER SELECT
========================================================= */

const FilterSelect = ({
  value,
  onChange,
  children,
  className = "",
}) => {
  return (
    <div
      className={`
        relative
        h-9
        min-w-[125px]
        ${className}
      `}
    >

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="
          h-full
          w-full
          appearance-none
          rounded-lg
          border
          border-slate-300
          bg-white
          px-3
          pr-8
          text-[11px]
          font-semibold
          text-slate-600
          outline-none
          transition-all
          hover:border-slate-300
          focus:border-blue-300
          focus:ring-2
          focus:ring-blue-50
        "
      >
        {children}
      </select>

      <ChevronDown
        size={13}
        className="
          pointer-events-none
          absolute
          right-2.5
          top-1/2
          -translate-y-1/2
          text-slate-400
        "
      />

    </div>
  );
};


/* =========================================================
   MAIN
========================================================= */

export default function PriceHistoryPage() {
  const navigate =
    useNavigate();

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = usePriceHistory({
    product_id: "",
    search: "",
  });


  /* =======================================================
     STATE
  ======================================================= */

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    productFilter,
    setProductFilter,
  ] = useState("");

  const [
    dateFilter,
    setDateFilter,
  ] = useState("ALL");

  const [
    priceFilter,
    setPriceFilter,
  ] = useState("ALL");

  const [
    changeFilter,
    setChangeFilter,
  ] = useState("ALL");

  const [
    sortField,
    setSortField,
  ] = useState("changed_at");

  const [
    sortDirection,
    setSortDirection,
  ] = useState("desc");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);


  /* =======================================================
     EXPORT PRICE TYPE
  ======================================================= */

  const [
    exportPriceType,
    setExportPriceType,
  ] = useState("SS");


  /* =======================================================
     NORMALIZE DATA
  ======================================================= */

  const history =
    useMemo(() => {
      if (Array.isArray(data)) {
        return data;
      }

      if (
        Array.isArray(
          data?.results
        )
      ) {
        return data.results;
      }

      if (
        Array.isArray(
          data?.data
        )
      ) {
        return data.data;
      }

      return [];
    }, [data]);


  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const filteredHistory =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      const productValue =
        productFilter
          .trim()
          .toLowerCase();

      let result =
        history.filter(
          (item) => {

            /* ---------------------------------------------
               GLOBAL SEARCH
            --------------------------------------------- */

            if (searchValue) {
              const searchable = [
                item?.product_id,
                item?.product,
                item?.product_name,
                item?.name,
                item?.changed_by_name,
                item?.changed_by,
                item?.changed_by_role,
                item?.role,
                item?.reason,
              ]
                .filter(
                  (value) =>
                    value !== null &&
                    value !== undefined
                )
                .join(" ")
                .toLowerCase();

              if (
                !searchable.includes(
                  searchValue
                )
              ) {
                return false;
              }
            }


            /* ---------------------------------------------
               PRODUCT FILTER
            --------------------------------------------- */

            if (productValue) {
              const productId =
                String(
                  item?.product_id ??
                    item?.product ??
                    ""
                ).toLowerCase();

              const productName =
                String(
                  item?.product_name ??
                    item?.name ??
                    ""
                ).toLowerCase();

              if (
                !productId.includes(
                  productValue
                ) &&
                !productName.includes(
                  productValue
                )
              ) {
                return false;
              }
            }


            /* ---------------------------------------------
               PRICE TYPE FILTER
            --------------------------------------------- */

            if (
              priceFilter !== "ALL"
            ) {
              if (
                !hasPriceChange(
                  item,
                  priceFilter
                )
              ) {
                return false;
              }
            }


            /* ---------------------------------------------
               CHANGE DIRECTION
            --------------------------------------------- */

            if (
              changeFilter !== "ALL"
            ) {
              const direction =
                getPriceChangeDirection(
                  item,
                  priceFilter === "ALL"
                    ? "SS"
                    : priceFilter
                );

              /*
               * When price filter is ALL,
               * check all 3 prices.
               */
              if (
                priceFilter === "ALL"
              ) {
                const directions = [
                  getPriceChangeDirection(
                    item,
                    "SS"
                  ),
                  getPriceChangeDirection(
                    item,
                    "DS"
                  ),
                  getPriceChangeDirection(
                    item,
                    "DLR"
                  ),
                ];

                if (
                  changeFilter ===
                  "UP" &&
                  !directions.includes(
                    "up"
                  )
                ) {
                  return false;
                }

                if (
                  changeFilter ===
                  "DOWN" &&
                  !directions.includes(
                    "down"
                  )
                ) {
                  return false;
                }
              } else {
                if (
                  changeFilter === "UP" &&
                  direction !== "up"
                ) {
                  return false;
                }

                if (
                  changeFilter === "DOWN" &&
                  direction !== "down"
                ) {
                  return false;
                }
              }
            }


            /* ---------------------------------------------
               DATE FILTER
            --------------------------------------------- */

            if (
              dateFilter !== "ALL"
            ) {
              const changedDate =
                new Date(
                  item?.changed_at
                );

              if (
                Number.isNaN(
                  changedDate.getTime()
                )
              ) {
                return false;
              }

              const now =
                new Date();

              const todayStart =
                new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  now.getDate()
                );


              if (
                dateFilter ===
                "TODAY"
              ) {
                const tomorrow =
                  new Date(
                    todayStart
                  );

                tomorrow.setDate(
                  tomorrow.getDate() + 1
                );

                if (
                  !(
                    changedDate >=
                      todayStart &&
                    changedDate <
                      tomorrow
                  )
                ) {
                  return false;
                }
              }


              if (
                dateFilter ===
                "7_DAYS"
              ) {
                const sevenDaysAgo =
                  new Date(
                    todayStart
                  );

                sevenDaysAgo.setDate(
                  sevenDaysAgo.getDate() - 6
                );

                if (
                  changedDate <
                  sevenDaysAgo
                ) {
                  return false;
                }
              }


              if (
                dateFilter ===
                "30_DAYS"
              ) {
                const thirtyDaysAgo =
                  new Date(
                    todayStart
                  );

                thirtyDaysAgo.setDate(
                  thirtyDaysAgo.getDate() - 29
                );

                if (
                  changedDate <
                  thirtyDaysAgo
                ) {
                  return false;
                }
              }
            }

            return true;
          }
        );


      /* =====================================================
         SORT
      ===================================================== */

      result.sort(
        (a, b) => {
          let valueA;
          let valueB;


          if (
            sortField ===
            "product_id"
          ) {
            valueA =
              Number(
                a?.product_id ??
                  a?.product ??
                  0
              );

            valueB =
              Number(
                b?.product_id ??
                  b?.product ??
                  0
              );
          }


          else if (
            sortField ===
            "product_name"
          ) {
            valueA =
              String(
                a?.product_name ??
                  a?.name ??
                  ""
              ).toLowerCase();

            valueB =
              String(
                b?.product_name ??
                  b?.name ??
                  ""
              ).toLowerCase();
          }


          else {
            valueA =
              new Date(
                a?.changed_at
              ).getTime();

            valueB =
              new Date(
                b?.changed_at
              ).getTime();
          }


          if (
            valueA < valueB
          ) {
            return sortDirection ===
              "asc"
              ? -1
              : 1;
          }


          if (
            valueA > valueB
          ) {
            return sortDirection ===
              "asc"
              ? 1
              : -1;
          }


          return 0;
        }
      );


      return result;
    }, [
      history,
      search,
      productFilter,
      priceFilter,
      changeFilter,
      dateFilter,
      sortField,
      sortDirection,
    ]);


  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredHistory.length /
          ITEMS_PER_PAGE
      )
    );


  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );


  const paginatedHistory =
    useMemo(() => {
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
     FILTER HANDLERS
  ======================================================= */

  const handleSearchChange =
    (value) => {
      setSearch(value);
      setCurrentPage(1);
    };


  const handleProductFilterChange =
    (value) => {
      setProductFilter(value);
      setCurrentPage(1);
    };


  const handlePriceFilterChange =
    (value) => {
      setPriceFilter(value);
      setCurrentPage(1);
    };


  const handleChangeFilterChange =
    (value) => {
      setChangeFilter(value);
      setCurrentPage(1);
    };


  const handleDateFilterChange =
    (value) => {
      setDateFilter(value);
      setCurrentPage(1);
    };


  /* =======================================================
     SORT
  ======================================================= */

  const handleSort = (
    field
  ) => {
    if (
      sortField === field
    ) {
      setSortDirection(
        (previous) =>
          previous === "asc"
            ? "desc"
            : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };


  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters =
    () => {
      setSearch("");
      setProductFilter("");
      setPriceFilter("ALL");
      setChangeFilter("ALL");
      setDateFilter("ALL");
      setCurrentPage(1);
    };


  const hasFilters =
    Boolean(
      search.trim() ||
        productFilter.trim() ||
        priceFilter !== "ALL" ||
        changeFilter !== "ALL" ||
        dateFilter !== "ALL"
    );


  /* =======================================================
     STATS
  ======================================================= */

  const stats =
    useMemo(() => {
      const total =
        filteredHistory.length;

      const ssChanges =
        filteredHistory.filter(
          (item) =>
            hasPriceChange(
              item,
              "SS"
            )
        ).length;

      const dsChanges =
        filteredHistory.filter(
          (item) =>
            hasPriceChange(
              item,
              "DS"
            )
        ).length;

      const dlrChanges =
        filteredHistory.filter(
          (item) =>
            hasPriceChange(
              item,
              "DLR"
            )
        ).length;

      return {
        total,
        ssChanges,
        dsChanges,
        dlrChanges,
      };
    }, [
      filteredHistory,
    ]);


  /* =======================================================
     EXPORT
  ======================================================= */

  const handleDownloadExcel =
    () => {
      exportPriceHistoryExcel(
        filteredHistory,
        exportPriceType
      );
    };


  const handleDownloadPDF =
    () => {
      exportPriceHistoryPDF(
        filteredHistory,
        exportPriceType
      );
    };


  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50">

        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">

          <RefreshCw
            size={16}
            className="animate-spin"
          />

          Loading price history...

        </div>

      </div>
    );
  }


  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className=" bg-gray-50">

      {/* =================================================
          MAIN HEADER CARD
      ================================================= */}

      <div className=" overflow-hidden rounded border border-slate-300 bg-white mb-3 shadow-sm">

        {/* =================================================
            TOP HEADER
        ================================================= */}

        <div className="flex flex-col gap-3 px-3 py-3 lg:flex-row lg:items-center lg:justify-between">

          {/* ---------------------------------------------
              LEFT SIDE
          --------------------------------------------- */}

          <div className="flex min-w-0 items-center gap-2.5">

            {/* BACK */}

            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              title="Back"
              className="
                inline-flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-slate-300
                bg-white
                text-slate-500
                transition-all
                hover:border-blue-200
                hover:bg-blue-50
                hover:text-blue-600
                active:scale-[0.97]
              "
            >
              <ArrowLeft
                size={16}
                strokeWidth={2}
              />
            </button>


            {/* ICON */}

            <div className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-blue-50
              text-blue-600
            ">
              <History
                size={17}
                strokeWidth={2}
              />
            </div>


            {/* TITLE */}

            <div className="min-w-0">

              <h1 className="
                truncate
                text-sm
                font-bold
                leading-tight
                text-slate-800
                md:text-[15px]
              ">
                Price History
              </h1>

              <p className="
                mt-0.5
                truncate
                text-[9px]
                font-medium
                text-slate-400
              ">
                Track product price changes
              </p>

            </div>


            {/* -----------------------------------------
                COMPACT STATS
            ----------------------------------------- */}

            <div className="
              ml-1
              hidden
              items-center
              gap-1.5
              md:flex
            ">

              {/* TOTAL */}

              <div className="
                inline-flex
                h-8
                items-center
                gap-1.5
                rounded-md
                bg-slate-50
                px-2.5
              ">

                <span className="text-[9px] font-medium text-slate-400">
                  Total
                </span>

                <span className="text-[11px] font-bold text-slate-700">
                  {stats.total}
                </span>

              </div>


              {/* SS */}

              <div className="
                inline-flex
                h-8
                items-center
                gap-1.5
                rounded-md
                bg-emerald-50
                px-2.5
              ">

                <span className="text-[9px] font-bold text-emerald-500">
                  SS
                </span>

                <span className="text-[11px] font-bold text-emerald-700">
                  {stats.ssChanges}
                </span>

              </div>


              {/* DS */}

              <div className="
                inline-flex
                h-8
                items-center
                gap-1.5
                rounded-md
                bg-purple-50
                px-2.5
              ">

                <span className="text-[9px] font-bold text-purple-500">
                  DS
                </span>

                <span className="text-[11px] font-bold text-purple-700">
                  {stats.dsChanges}
                </span>

              </div>


              {/* DLR */}

              <div className="
                inline-flex
                h-8
                items-center
                gap-1.5
                rounded-md
                bg-orange-50
                px-2.5
              ">

                <span className="text-[9px] font-bold text-orange-500">
                  DLR
                </span>

                <span className="text-[11px] font-bold text-orange-700">
                  {stats.dlrChanges}
                </span>

              </div>

            </div>

          </div>


          {/* ---------------------------------------------
              RIGHT ACTIONS
          --------------------------------------------- */}

          <div className="flex flex-wrap items-center gap-1.5">

            {/* EXPORT TYPE */}

            <div className="
              flex
              h-9
              items-center
              overflow-hidden
              rounded-lg
              border
              border-slate-300
              bg-white
            ">

              <span className="
                hidden
                px-2
                text-[9px]
                font-semibold
                text-slate-400
                sm:inline
              ">
                Export
              </span>

              <select
                value={
                  exportPriceType
                }
                onChange={(event) =>
                  setExportPriceType(
                    event.target.value
                  )
                }
                className="
                  h-full
                  min-w-[112px]
                  border-0
                  bg-transparent
                  px-2
                  text-[11px]
                  font-semibold
                  text-slate-600
                  outline-none
                  focus:ring-0
                "
              >

                <option value="SS">
                  SS Price
                </option>

                <option value="DISTRIBUTER">
                  Distributor Price
                </option>

                <option value="DEALER">
                  Dealer Price
                </option>

              </select>

            </div>


            {/* EXCEL */}

            <button
              type="button"
              onClick={
                handleDownloadExcel
              }
              disabled={
                filteredHistory.length === 0
              }
              title="Download Excel"
              className="
                inline-flex
                h-9
                items-center
                justify-center
                gap-1.5
                rounded-lg
                border
                border-emerald-200
                bg-emerald-50
                px-2.5
                text-[10px]
                font-bold
                text-emerald-700
                transition-all
                hover:bg-emerald-100
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >

              <FileSpreadsheet
                size={13}
              />

              <span className="hidden sm:inline">
                Excel
              </span>

            </button>


            {/* PDF */}

            <button
              type="button"
              onClick={
                handleDownloadPDF
              }
              disabled={
                filteredHistory.length === 0
              }
              title="Download PDF"
              className="
                inline-flex
                h-9
                items-center
                justify-center
                gap-1.5
                rounded-lg
                border
                border-red-200
                bg-red-50
                px-2.5
                text-[10px]
                font-bold
                text-red-600
                transition-all
                hover:bg-red-100
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >

              <Download
                size={13}
              />

              <span className="hidden sm:inline">
                PDF
              </span>

            </button>


            {/* REFRESH */}

            <button
              type="button"
              onClick={() =>
                refetch()
              }
              disabled={isFetching}
              title="Refresh"
              className="
                inline-flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-slate-300
                bg-white
                text-slate-500
                transition-all
                hover:border-blue-200
                hover:bg-blue-50
                hover:text-blue-600
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              <RefreshCw
                size={14}
                className={
                  isFetching
                    ? "animate-spin"
                    : ""
                }
              />

            </button>

          </div>

        </div>


        {/* =================================================
            FILTER BAR
        ================================================= */}

        <div className="
          border-t
          border-slate-300
          bg-slate-50/50
          px-3
          py-2.5
        ">

          <div className="
            flex
            flex-col
            gap-2
            xl:flex-row
            xl:items-center
          ">

            {/* FILTER LABEL */}

            <div className="
              hidden
              shrink-0
              items-center
              gap-1.5
              text-[9px]
              font-bold
              uppercase
              tracking-wide
              text-slate-400
              xl:flex
            ">

              <Filter
                size={12}
              />

              Filters

            </div>


            {/* SEARCH */}

            <div className="
              relative
              min-w-0
              flex-1
            ">

              <Search
                size={14}
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  handleSearchChange(
                    event.target.value
                  )
                }
                placeholder="Search product, ID, user or reason..."
                className="
                  h-9
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  pl-9
                  pr-9
                  text-[11px]
                  font-medium
                  text-slate-700
                  outline-none
                  transition-all
                  placeholder:text-slate-400
                  hover:border-slate-300
                  focus:border-blue-300
                  focus:ring-2
                  focus:ring-blue-50
                "
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    handleSearchChange("")
                  }
                  className="
                    absolute
                    right-2
                    top-1/2
                    flex
                    h-6
                    w-6
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-md
                    text-slate-400
                    transition
                    hover:bg-slate-100
                    hover:text-slate-700
                  "
                >
                  <X
                    size={12}
                  />
                </button>
              )}

            </div>


            {/* PRODUCT */}

            <div className="
              relative
              w-full
              xl:w-[165px]
            ">

              <input
                type="text"
                value={
                  productFilter
                }
                onChange={(event) =>
                  handleProductFilterChange(
                    event.target.value
                  )
                }
                placeholder="Product ID / Name"
                className="
                  h-9
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  px-3
                  text-[11px]
                  font-medium
                  text-slate-700
                  outline-none
                  transition-all
                  placeholder:text-slate-400
                  hover:border-slate-300
                  focus:border-blue-300
                  focus:ring-2
                  focus:ring-blue-50
                "
              />

            </div>


            {/* PRICE FILTER */}

            <FilterSelect
              value={priceFilter}
              onChange={
                handlePriceFilterChange
              }
              className="w-full xl:w-[125px]"
            >

              <option value="ALL">
                All Prices
              </option>

              <option value="SS">
                SS Price
              </option>

              <option value="DS">
                DS Price
              </option>

              <option value="DLR">
                Dealer Price
              </option>

            </FilterSelect>


            {/* CHANGE FILTER */}

            <FilterSelect
              value={changeFilter}
              onChange={
                handleChangeFilterChange
              }
              className="w-full xl:w-[125px]"
            >

              <option value="ALL">
                All Changes
              </option>

              <option value="UP">
                Price Increased
              </option>

              <option value="DOWN">
                Price Decreased
              </option>

            </FilterSelect>


            {/* DATE */}

            <div className="
              relative
              w-full
              xl:w-[135px]
            ">

              <CalendarDays
                size={13}
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <select
                value={dateFilter}
                onChange={(event) =>
                  handleDateFilterChange(
                    event.target.value
                  )
                }
                className="
                  h-9
                  w-full
                  appearance-none
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  pl-8
                  pr-8
                  text-[11px]
                  font-semibold
                  text-slate-600
                  outline-none
                  transition-all
                  hover:border-slate-300
                  focus:border-blue-300
                  focus:ring-2
                  focus:ring-blue-50
                "
              >

                <option value="ALL">
                  All Dates
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

              <ChevronDown
                size={12}
                className="
                  pointer-events-none
                  absolute
                  right-2.5
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

            </div>


            {/* CLEAR */}

            {hasFilters && (
              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="
                  inline-flex
                  h-9
                  shrink-0
                  items-center
                  justify-center
                  gap-1.5
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  px-3
                  text-[10px]
                  font-bold
                  text-slate-500
                  transition-all
                  hover:border-red-200
                  hover:bg-red-50
                  hover:text-red-600
                "
              >

                <X
                  size={12}
                />

                Clear

              </button>
            )}

          </div>

        </div>

      </div>


      {/* =================================================
          MOBILE STATS
      ================================================= */}

      <div className="
        mb-3
        grid
        grid-cols-4
        gap-1.5
        md:hidden
      ">

        <div className="
          rounded-lg
          border
          border-slate-300
          bg-white
          px-2
          py-2
        ">
          <div className="text-[8px] font-bold uppercase text-slate-400">
            Total
          </div>
          <div className="mt-0.5 text-sm font-bold text-slate-700">
            {stats.total}
          </div>
        </div>


        <div className="
          rounded-lg
          border
          border-emerald-100
          bg-emerald-50
          px-2
          py-2
        ">
          <div className="text-[8px] font-bold uppercase text-emerald-500">
            SS
          </div>
          <div className="mt-0.5 text-sm font-bold text-emerald-700">
            {stats.ssChanges}
          </div>
        </div>


        <div className="
          rounded-lg
          border
          border-purple-100
          bg-purple-50
          px-2
          py-2
        ">
          <div className="text-[8px] font-bold uppercase text-purple-500">
            DS
          </div>
          <div className="mt-0.5 text-sm font-bold text-purple-700">
            {stats.dsChanges}
          </div>
        </div>


        <div className="
          rounded-lg
          border
          border-orange-100
          bg-orange-50
          px-2
          py-2
        ">
          <div className="text-[8px] font-bold uppercase text-orange-500">
            DLR
          </div>
          <div className="mt-0.5 text-sm font-bold text-orange-700">
            {stats.dlrChanges}
          </div>
        </div>

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="
        overflow-hidden
        rounded
        border
        border-slate-300
        bg-white
        shadow-sm
      ">

        <div className="w-full overflow-x-auto">

          <table className="
            w-full
            min-w-[1250px]
            border-collapse
            text-left
          ">

            <thead className="bg-slate-50">

              <tr className="border-b border-slate-300">

                <th className="
                  border-r
                  border-slate-300
                  px-3
                  py-2.5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-500
                ">
                  #
                </th>


                <th className="
                  border-r
                  border-slate-300
                  px-3
                  py-2.5
                ">

                  <button
                    type="button"
                    onClick={() =>
                      handleSort(
                        "product_id"
                      )
                    }
                    className="
                      flex
                      items-center
                      gap-1
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wide
                      text-slate-500
                      transition
                      hover:text-blue-600
                    "
                  >

                    Product

                    {sortField ===
                      "product_id" &&
                      (
                        sortDirection ===
                        "asc"
                          ? (
                            <ArrowUp
                              size={11}
                            />
                          )
                          : (
                            <ArrowDown
                              size={11}
                            />
                          )
                      )}

                  </button>

                </th>


                <th className="
                  border-r
                  border-slate-300
                  px-3
                  py-2.5
                  text-right
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-500
                ">
                  SS Price
                </th>


                <th className="
                  border-r
                  border-slate-300
                  px-3
                  py-2.5
                  text-right
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-500
                ">
                  DS Price
                </th>


                <th className="
                  border-r
                  border-slate-300
                  px-3
                  py-2.5
                  text-right
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-500
                ">
                  DLR Price
                </th>


                <th className="
                  border-r
                  border-slate-300
                  px-3
                  py-2.5
                  text-center
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-500
                ">
                  Applicable From
                </th>


                <th className="
                  border-r
                  border-slate-300
                  px-3
                  py-2.5
                  text-center
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-500
                ">
                  Changed At
                </th>


                <th className="
                  border-r
                  border-slate-300
                  px-3
                  py-2.5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-500
                ">
                  Changed By
                </th>


                <th className="
                  px-3
                  py-2.5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-500
                ">
                  Reason
                </th>

              </tr>

            </thead>


            <tbody>

              {paginatedHistory.length === 0 ? (
                <tr>

                  <td
                    colSpan={9}
                    className="px-4 py-16 text-center"
                  >

                    <div className="
                      mx-auto
                      flex
                      max-w-xs
                      flex-col
                      items-center
                    ">

                      <div className="
                        mb-3
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-full
                        bg-slate-100
                      ">

                        <History
                          size={20}
                          className="text-slate-400"
                        />

                      </div>

                      <p className="
                        text-sm
                        font-semibold
                        text-slate-600
                      ">
                        No price history found
                      </p>

                      <p className="
                        mt-1
                        text-[11px]
                        text-slate-400
                      ">
                        Try changing your search or filters.
                      </p>

                    </div>

                  </td>

                </tr>
              ) : (
                paginatedHistory.map(
                  (
                    item,
                    index
                  ) => {

                    const actualIndex =
                      (safeCurrentPage - 1) *
                        ITEMS_PER_PAGE +
                      index +
                      1;


                    return (
                      <tr
                        key={
                          item?.id ??
                          `${item?.product_id}-${item?.changed_at}-${index}`
                        }
                        className="
                          border-b
                          border-slate-300
                          transition-colors
                          hover:bg-slate-50
                        "
                      >

                        {/* # */}

                        <td className="
                          border-r
                          border-slate-300
                          px-3
                          py-1
                          text-[10px]
                          font-medium
                          text-slate-400
                        ">
                          {actualIndex}
                        </td>


                        {/* PRODUCT */}

                        <td className="
                          border-r
                          border-slate-300
                          px-3
                          py-1
                        ">

                          <div className="min-w-[190px]">

                            <div className="
                              text-[11px]
                              font-bold
                              text-slate-700
                            ">
                              {item?.product_name ||
                                item?.name ||
                                "Unnamed Product"}
                            </div>

                            <div className="
                              mt-0.5
                              text-[9px]
                              font-medium
                              text-slate-400
                            ">
                              ID:{" "}
                              {item?.product_id ??
                                item?.product ??
                                "—"}
                            </div>

                          </div>

                        </td>


                        {/* SS */}

                        <td className="
                          border-r
                          border-slate-300
                          px-3
                          py-1
                        ">

                          <PriceChange
                            oldValue={
                              item?.old_price
                            }
                            newValue={
                              item?.new_price
                            }
                          />

                        </td>


                        {/* DS */}

                        <td className="
                          border-r
                          border-slate-300
                          px-3
                          py-1
                        ">

                          <PriceChange
                            oldValue={
                              item?.old_ds_price
                            }
                            newValue={
                              item?.new_ds_price
                            }
                          />

                        </td>


                        {/* DLR */}

                        <td className="
                          border-r
                          border-slate-300
                          px-3
                          py-1
                        ">

                          <PriceChange
                            oldValue={
                              item?.old_dlr_price
                            }
                            newValue={
                              item?.new_dlr_price
                            }
                          />

                        </td>


                        {/* APPLICABLE */}

                        <td className="
                          border-r
                          border-slate-300
                          px-3
                          py-1
                          text-center
                          text-[10px]
                          font-medium
                          text-slate-600
                        ">
                          {formatDate(
                            item?.applicable_from
                          )}
                        </td>


                        {/* CHANGED AT */}

                        <td className="
                          border-r
                          border-slate-300
                          px-3
                          py-1
                          text-center
                        ">

                          <div className="
                            flex
                            min-w-[130px]
                            items-center
                            justify-center
                            gap-1.5
                            text-[10px]
                            font-medium
                            text-slate-600
                          ">

                            <Clock3
                              size={11}
                              className="
                                shrink-0
                                text-slate-400
                              "
                            />

                            {formatDateTime(
                              item?.changed_at
                            )}

                          </div>

                        </td>


                        {/* CHANGED BY */}

                        <td className="
                          border-r
                          border-slate-300
                          px-3
                          py-1
                        ">

                          <div className="
                            flex
                            min-w-[130px]
                            items-center
                            gap-2
                          ">

                            <div className="
                              flex
                              h-6
                              w-6
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-blue-50
                              text-blue-600
                            ">

                              <User
                                size={11}
                              />

                            </div>


                            <div className="min-w-0">

                              <div className="
                                truncate
                                text-[10px]
                                font-semibold
                                text-slate-600
                              ">
                                {item?.changed_by_name ||
                                  item?.changed_by ||
                                  "Unknown"}
                              </div>


                              {(item?.changed_by_role ||
                                item?.role) && (
                                <div className="
                                  text-[9px]
                                  text-slate-400
                                ">
                                  {item?.changed_by_role ||
                                    item?.role}
                                </div>
                              )}

                            </div>

                          </div>

                        </td>


                        {/* REASON */}

                        <td className="px-3 py-2.5">

                          <div
                            className="
                              max-w-[240px]
                              truncate
                              text-[10px]
                              font-medium
                              text-slate-500
                            "
                            title={
                              item?.reason || ""
                            }
                          >
                            {item?.reason || "—"}
                          </div>

                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>


        {/* =================================================
            PAGINATION
        ================================================= */}

        {filteredHistory.length > 0 && (
          <div className="
            flex
            flex-col
            gap-2
            border-t
            border-slate-300
            bg-slate-50
            px-3
            py-2.5
            sm:flex-row
            sm:items-center
            sm:justify-between
          ">

            {/* RANGE */}

            <div className="
              text-[10px]
              font-medium
              text-slate-400
            ">

              Showing{" "}

              <span className="font-semibold text-slate-600">
                {(safeCurrentPage - 1) *
                  ITEMS_PER_PAGE +
                  1}
              </span>

              {" – "}

              <span className="font-semibold text-slate-600">
                {Math.min(
                  safeCurrentPage *
                    ITEMS_PER_PAGE,
                  filteredHistory.length
                )}
              </span>

              {" of "}

              <span className="font-semibold text-slate-600">
                {filteredHistory.length}
              </span>

            </div>


            {/* PAGINATION */}

            <div className="flex items-center gap-1">

              {/* PREVIOUS */}

              <button
                type="button"
                disabled={
                  safeCurrentPage <= 1
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }
                className="
                  inline-flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-md
                  border
                  border-slate-300
                  bg-white
                  text-slate-500
                  transition
                  hover:bg-slate-100
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >

                <ChevronLeft
                  size={13}
                />

              </button>


              {/* PAGE */}

              <div className="
                min-w-[58px]
                px-2
                text-center
                text-[10px]
                font-semibold
                text-slate-500
              ">
                {safeCurrentPage}
                {" / "}
                {totalPages}
              </div>


              {/* NEXT */}

              <button
                type="button"
                disabled={
                  safeCurrentPage >=
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
                }
                className="
                  inline-flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-md
                  border
                  border-slate-300
                  bg-white
                  text-slate-500
                  transition
                  hover:bg-slate-100
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >

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
}