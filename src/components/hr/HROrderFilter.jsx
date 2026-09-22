import {
  FaSearch,
  FaSyncAlt,
  FaFileExcel,
  FaTimes,
} from "react-icons/fa";

export default function HROrderFilter({
  search,
  setSearch,
  status,
  setStatus,
  crm,
  setCrm,
  crmList = [],
  onRefresh,
  isFetching,
}) {
  const hasFilters =
    search.trim() !== "" ||
    status !== "ALL" ||
    crm !== "ALL";

  /* =========================================================
     CLEAR ALL
  ========================================================= */

  const clearAll = () => {
    setSearch("");
    setStatus("ALL");
    setCrm("ALL");
  };

  return (
    <div className="
      overflow-hidden
      border
      border-slate-200
      bg-white
    ">

      {/* =====================================================
          FILTER TOOLBAR
      ===================================================== */}

      <div className="
        grid
        gap-2
        p-2.5
        sm:grid-cols-2
        lg:grid-cols-[minmax(260px,1.7fr)_minmax(210px,1fr)_minmax(180px,.9fr)_auto_auto_auto]
      ">

        {/* ===================================================
            SEARCH
        =================================================== */}

        <div className="relative">

          <FaSearch
            size={10}
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
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search order, party or CRM..."
            className="
              h-9
              w-full
              border
              border-slate-200
              bg-slate-50
              pl-8
              pr-3
              text-[12px]
              font-medium
              text-slate-700
              outline-none
              transition-colors
              placeholder:text-slate-400
              hover:border-slate-300
              focus:border-blue-400
              focus:bg-white
              focus:ring-2
              focus:ring-blue-500/[0.06]
            "
          />

        </div>

        {/* ===================================================
            STATUS
        =================================================== */}

        <div className="
          grid
          h-9
          grid-cols-3
          border
          border-slate-200
          bg-slate-50
          p-1
        ">

          {[
            {
              value: "ALL",
              label: "All",
            },
            {
              value: "PENDING",
              label: "Pending",
            },
            {
              value: "HOLD",
              label: "Hold",
            },
          ].map((item) => {
            const active =
              status === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() =>
                  setStatus(item.value)
                }
                className={`
                  text-[12px]
                  font-semibold
                  transition-colors
                  ${
                    active
                      ? "border border-slate-200 bg-white text-[#1769ff]"
                      : "text-slate-400 hover:text-slate-700"
                  }
                `}
              >
                {item.label}
              </button>
            );
          })}

        </div>

        {/* ===================================================
            CRM
        =================================================== */}

        <div className="relative">

          <select
            value={crm}
            onChange={(e) =>
              setCrm(e.target.value)
            }
            className="
              h-9
              w-full
              appearance-none
              border
              border-slate-200
              bg-slate-50
              px-3
              pr-8
              text-[12px]
              font-medium
              text-slate-700
              outline-none
              transition-colors
              hover:border-slate-300
              focus:border-blue-400
              focus:bg-white
              focus:ring-2
              focus:ring-blue-500/[0.06]
            "
          >

            <option value="ALL">
              All CRM
            </option>

            {crmList.map((crmName) => (
              <option
                key={crmName}
                value={crmName}
              >
                {crmName}
              </option>
            ))}

          </select>

          <span className="
            pointer-events-none
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-[8px]
            text-slate-400
          ">
            ▼
          </span>

        </div>

        {/* ===================================================
            REFRESH
        =================================================== */}

        <button
          type="button"
          onClick={onRefresh}
          disabled={isFetching}
          className="
            flex
            h-9
            items-center
            justify-center
            gap-1.5
            bg-[#1769ff]
            px-4
            text-[12px]
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
              isFetching
                ? "animate-spin"
                : ""
            }
          />

          Refresh

        </button>

        {/* ===================================================
            EXPORT
        =================================================== */}

        <button
          type="button"
          className="
            flex
            h-9
            items-center
            justify-center
            gap-1.5
            border
            border-slate-200
            bg-white
            px-4
            text-[12px]
            font-semibold
            text-slate-600
            transition-colors
            hover:border-emerald-200
            hover:bg-emerald-50
            hover:text-emerald-600
            active:scale-[0.98]
          "
        >

          <FaFileExcel
            size={10}
            className="text-emerald-600"
          />

          Export

        </button>

        {/* ===================================================
            CLEAR
        =================================================== */}

        {hasFilters ? (
          <button
            type="button"
            onClick={clearAll}
            className="
              flex
              h-9
              items-center
              justify-center
              gap-1.5
              border
              border-red-100
              bg-red-50
              px-3
              text-[12px]
              font-semibold
              text-red-500
              transition-colors
              hover:bg-red-100
              active:scale-[0.98]
            "
          >

            <FaTimes size={8} />

            Clear

          </button>
        ) : (
          <div className="hidden lg:block" />
        )}

      </div>

      {/* =====================================================
          ACTIVE FILTERS
      ===================================================== */}

      {hasFilters && (
        <div className="
          flex
          flex-wrap
          items-center
          gap-1.5
          border-t
          border-slate-100
          bg-slate-50/70
          px-3
          py-1.5
        ">

          <span className="
            mr-0.5
            text-[8px]
            font-semibold
            uppercase
            tracking-[0.1em]
            text-slate-400
          ">
            Active
          </span>

          {/* SEARCH FILTER */}

          {search.trim() && (
            <span className="
              max-w-[220px]
              truncate
              border
              border-blue-100
              bg-blue-50
              px-2
              py-1
              text-[8px]
              font-semibold
              text-blue-600
            ">
              Search: {search}
            </span>
          )}

          {/* STATUS FILTER */}

          {status !== "ALL" && (
            <span className="
              border
              border-amber-100
              bg-amber-50
              px-2
              py-1
              text-[8px]
              font-semibold
              text-amber-700
            ">
              Status: {status}
            </span>
          )}

          {/* CRM FILTER */}

          {crm !== "ALL" && (
            <span className="
              max-w-[160px]
              truncate
              border
              border-purple-100
              bg-purple-50
              px-2
              py-1
              text-[8px]
              font-semibold
              text-purple-600
            ">
              CRM: {crm}
            </span>
          )}

        </div>
      )}

    </div>
  );
}