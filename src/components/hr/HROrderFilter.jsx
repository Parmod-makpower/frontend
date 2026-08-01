import {
  FaSearch,
  FaSyncAlt,
  FaCalendarAlt,
  FaFileExcel,
  FaPrint,
} from "react-icons/fa";

export default function HROrderFilter({
  search,
  setSearch,
  status,
  setStatus,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  onRefresh,
  isFetching,
}) {
  return (
    <div
      className="
        bg-white
        border
        border-gray-200
        rounded-lg
        shadow-sm
        p-4
        w-full
      "
    >
      <h3
        className="
          text-sm
          font-semibold
          text-gray-700
          mb-4
        "
      >
        Filter Orders
      </h3>

      {/* Status */}
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="
          w-full
          h-9
          mb-3
          text-xs
          border
          rounded-md
          px-2
          outline-none
        "
      >
        <option value="ALL">All Status</option>
        <option value="PENDING">Pending</option>
        <option value="VERIFIED">Verified</option>
        <option value="REJECTED">Rejected</option>
        <option value="DISPATCH">Dispatch</option>
        <option value="HOLD">Hold</option>
      </select>

      {/* From Date */}
      <div className="relative mb-3">
        <FaCalendarAlt
          className="
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            text-gray-400
            text-xs
          "
        />

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="
            w-full
            h-9
            text-xs
            border
            rounded-md
            pl-8
            pr-2
          "
        />
      </div>

      {/* To Date */}
      <div className="relative mb-4">
        <FaCalendarAlt
          className="
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            text-gray-400
            text-xs
          "
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="
            w-full
            h-9
            text-xs
            border
            rounded-md
            pl-8
            pr-2
          "
        />
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onRefresh}
          disabled={isFetching}
          className="
            h-9
            bg-blue-600
            text-white
            rounded-md
            text-xs
            flex
            items-center
            justify-center
            gap-1
          "
        >
          <FaSyncAlt
            className={
              isFetching
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>

        <button
          className="
            h-9
            border
            rounded-md
            text-xs
            flex
            items-center
            justify-center
            gap-1
          "
        >
          <FaFileExcel className="text-green-600" />
          Export
        </button>
      </div>
    </div>
  );
}