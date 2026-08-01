import {
  FaSearch,
  FaSyncAlt,
  FaFileExcel,
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

      {/* Search */}

      <div className="relative mb-3">
        <FaSearch
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
          type="text"
          placeholder="Search Order / Party / CRM"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="
            w-full
            h-9
            border
            rounded-md
            pl-8
            pr-2
            text-xs
          "
        />
      </div>

      {/* Status */}

      <select
        value={status}
        onChange={(e) =>
          setStatus(e.target.value)
        }
        className="
          w-full
          h-9
          mb-3
          text-xs
          border
          rounded-md
          px-2
        "
      >
        <option value="ALL">All Status</option>
        <option value="PENDING">Pending</option>
        <option value="HOLD">Hold</option>
      </select>

      {/* CRM */}

      <select
        value={crm}
        onChange={(e) =>
          setCrm(e.target.value)
        }
        className="
          w-full
          h-9
          mb-4
          text-xs
          border
          rounded-md
          px-2
        "
      >
        <option value="ALL">
          All CRM
        </option>

        {crmList.length > 0 &&
          crmList.map((crmName) => (
            <option
              key={crmName}
              value={crmName}
            >
              {crmName}
            </option>
          ))}
      </select>

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