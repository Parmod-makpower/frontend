import React, {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* =========================================================
   ICONS
========================================================= */

const FilterIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 5h16" />
    <path d="M7 12h10" />
    <path d="M10 19h4" />
  </svg>
);

const SearchIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const CheckIcon = ({ size = 13 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m5 12 4 4L19 6" />
  </svg>
);

const SortAscIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 17V5" />
    <path d="m4 9 4-4 4 4" />
    <path d="M14 7h6" />
    <path d="M14 12h4" />
    <path d="M14 17h2" />
  </svg>
);

const SortDescIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 7v12" />
    <path d="m4 15 4 4 4-4" />
    <path d="M14 7h6" />
    <path d="M14 12h4" />
    <path d="M14 17h2" />
  </svg>
);

/* =========================================================
   COMPONENT
========================================================= */

const PriceManagementColumnFilter = ({
  column,
  filterValue = "",
  filterOptions = [],
  currentSort = null,
  onSort,
  onFilterChange,
  onClearFilter,
  onHideColumn,
  onFreezeColumn,
  isFrozen = false,
  close,
}) => {
  const menuRef = useRef(null);

  const [searchText, setSearchText] = useState("");
  const [selectedValues, setSelectedValues] = useState([]);

  /* =======================================================
     NORMALIZE OPTIONS
  ======================================================= */

  const options = useMemo(() => {
    if (!Array.isArray(filterOptions)) {
      return [];
    }

    const map = new Map();

    filterOptions.forEach((option) => {
      if (
        option === null ||
        option === undefined
      ) {
        return;
      }

      let value;
      let label;
      let count;

      if (
        typeof option === "object" &&
        option !== null
      ) {
        value = option.value;
        label =
          option.label ??
          option.value;
        count = option.count;
      } else {
        value = option;
        label = String(option);
      }

      if (
        value === null ||
        value === undefined
      ) {
        return;
      }

      const labelText = String(label).trim();

      if (!labelText) {
        return;
      }

      const key = String(value);

      if (!map.has(key)) {
        map.set(key, {
          value,
          label: labelText,
          count,
        });
      }
    });

    return Array.from(map.values());
  }, [filterOptions]);

  /* =======================================================
     INITIAL SELECTION
  ======================================================= */

  useEffect(() => {
    if (Array.isArray(filterValue)) {
      setSelectedValues(
        filterValue.map(String)
      );
      return;
    }

    if (
      typeof filterValue === "string" &&
      filterValue.trim()
    ) {
      const values = filterValue
        .split("||")
        .map((item) => item.trim())
        .filter(Boolean);

      setSelectedValues(values);
      return;
    }

    setSelectedValues([]);
  }, [filterValue]);

  /* =======================================================
     OUTSIDE CLICK
  ======================================================= */

  useEffect(() => {
    const handleOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        close?.();
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      );
    };
  }, [close]);

  /* =======================================================
     SEARCH OPTIONS
  ======================================================= */

  const filteredOptions = useMemo(() => {
    const search = searchText
      .trim()
      .toLowerCase();

    if (!search) {
      return options.slice(0, 200);
    }

    return options
      .filter((option) =>
        option.label
          .toLowerCase()
          .includes(search)
      )
      .slice(0, 200);
  }, [options, searchText]);

  /* =======================================================
     SELECTION STATE
  ======================================================= */

  const allSelected =
    options.length > 0 &&
    selectedValues.length ===
      options.length;

  /* =======================================================
     TOGGLE VALUE
  ======================================================= */

  const toggleValue = (value) => {
    const stringValue = String(value);

    setSelectedValues((previous) => {
      if (
        previous.includes(stringValue)
      ) {
        return previous.filter(
          (item) =>
            item !== stringValue
        );
      }

      return [
        ...previous,
        stringValue,
      ];
    });
  };

  /* =======================================================
     SELECT ALL
  ======================================================= */

  const handleSelectAll = () => {
    setSelectedValues(
      options.map((option) =>
        String(option.value)
      )
    );
  };

  /* =======================================================
     CLEAR ALL
  ======================================================= */

 const handleClearAll = () => {
  setSelectedValues([]);
};

  /* =======================================================
     APPLY FILTER
  ======================================================= */

 const handleApply = () => {
  const key = column?.key;

  if (!key) {
    close?.();
    return;
  }

  if (selectedValues.length === 0) {
    onClearFilter?.(key);
    close?.();
    return;
  }

  const value =
    selectedValues.length === 1
      ? selectedValues[0]
      : selectedValues.join("||");

  onFilterChange?.(key, value);
  close?.();
};

  /* =======================================================
     CANCEL
  ======================================================= */

  const handleCancel = () => {
    close?.();
  };

  /* =======================================================
     SORT
  ======================================================= */

  const handleSort = (direction) => {
    onSort?.(
      column?.key,
      direction
    );

    close?.();
  };

  /* =======================================================
     COLUMN INFO
  ======================================================= */

  const title =
    column?.label ||
    column?.header ||
    column?.key ||
    "Column";

  const isNumeric =
    column?.type === "number" ||
    column?.type === "price" ||
    column?.type === "currency" ||
    column?.key === "price" ||
    column?.key === "dsPrice";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      ref={menuRef}
      className="
        absolute
        right-0
        top-[calc(100%+2px)]
        z-[200]
        w-[270px]
        overflow-hidden
        border
        border-slate-200
        bg-white
        shadow-[0_8px_24px_rgba(15,23,42,0.14)]
      "
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="border-b border-slate-200 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-slate-600">
              <FilterIcon size={15} />
            </span>

            <span className="truncate text-[12px] font-semibold uppercase tracking-wide text-slate-800">
              {title}
            </span>
          </div>

          {selectedValues.length > 0 &&
            selectedValues.length <
              options.length && (
              <span className="shrink-0 text-[10px] font-medium text-blue-600">
                {selectedValues.length}
              </span>
            )}
        </div>
      </div>

      {/* =================================================
          SORT
      ================================================= */}

      <div className="border-b border-slate-200 py-0.5">
        <button
          type="button"
          onClick={() =>
            handleSort("asc")
          }
          className="
            flex
            h-[34px]
            w-full
            items-center
            gap-2.5
            px-3
            text-left
            text-[12px]
            font-medium
            text-slate-700
            hover:bg-slate-50
          "
        >
          <span className="text-slate-500">
            <SortAscIcon />
          </span>

          <span>
            {isNumeric
              ? "Sort low → high"
              : "Sort A to Z"}
          </span>

          {currentSort?.key ===
            column?.key &&
            currentSort?.direction ===
              "asc" && (
              <span className="ml-auto text-[12px] font-bold text-blue-600">
                ✓
              </span>
            )}
        </button>

        <button
          type="button"
          onClick={() =>
            handleSort("desc")
          }
          className="
            flex
            h-[34px]
            w-full
            items-center
            gap-2.5
            px-3
            text-left
            text-[12px]
            font-medium
            text-slate-700
            hover:bg-slate-50
          "
        >
          <span className="text-slate-500">
            <SortDescIcon />
          </span>

          <span>
            {isNumeric
              ? "Sort high → low"
              : "Sort Z to A"}
          </span>

          {currentSort?.key ===
            column?.key &&
            currentSort?.direction ===
              "desc" && (
              <span className="ml-auto text-[12px] font-bold text-blue-600">
                ✓
              </span>
            )}
        </button>
      </div>

      {/* =================================================
          FILTER TITLE
      ================================================= */}

      <div className="px-3 pb-1.5 pt-2.5">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Filter by values
        </div>
      </div>

      {/* =================================================
          SELECT / CLEAR
      ================================================= */}

      <div className="flex items-center justify-between px-3 pb-1.5">
        <div className="flex items-center gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={
              handleSelectAll
            }
            className="
              font-medium
              text-blue-600
              hover:text-blue-800
              hover:underline
            "
          >
            Select all
          </button>

          <span className="text-slate-300">
            •
          </span>

          <button
            type="button"
            onClick={
              handleClearAll
            }
            className="
              font-medium
              text-blue-600
              hover:text-blue-800
              hover:underline
            "
          >
            Clear all
          </button>
        </div>

        <span className="text-[10px] text-slate-500">
          {selectedValues.length}/
          {options.length}
        </span>
      </div>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="px-3 pb-2">
        <div
          className="
            flex
            h-[32px]
            items-center
            border
            border-slate-300
            bg-white
            focus-within:border-blue-500
            focus-within:ring-1
            focus-within:ring-blue-500
          "
        >
          <input
            type="text"
            value={searchText}
            onChange={(event) =>
              setSearchText(
                event.target.value
              )
            }
            placeholder="Search values"
            className="
              min-w-0
              flex-1
              bg-transparent
              px-2.5
              text-[11px]
              text-slate-800
              outline-none
              placeholder:text-slate-400
            "
          />

          <div className="pr-2 text-slate-500">
            <SearchIcon size={15} />
          </div>
        </div>
      </div>

      {/* =================================================
          VALUE LIST
      ================================================= */}

      <div
        className="
          mx-3
          max-h-[180px]
          overflow-y-auto
          border-t
          border-slate-100
          pb-1
        "
      >
        {filteredOptions.length ===
        0 ? (
          <div className="px-2 py-5 text-center text-[11px] text-slate-500">
            No matching values
          </div>
        ) : (
          filteredOptions.map(
            (option) => {
              const value = String(
                option.value
              );

              const checked =
                selectedValues.includes(
                  value
                );

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    toggleValue(value)
                  }
                  className="
                    flex
                    min-h-[30px]
                    w-full
                    items-center
                    gap-2
                    px-1.5
                    text-left
                    hover:bg-slate-50
                  "
                >
                  {/* Checkbox */}

                  <span
                    className={`
                      flex
                      h-[15px]
                      w-[15px]
                      shrink-0
                      items-center
                      justify-center
                      border
                      ${
                        checked
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-400 bg-white text-transparent"
                      }
                    `}
                  >
                    <CheckIcon size={11} />
                  </span>

                  {/* Value */}

                  <span
                    className="
                      min-w-0
                      flex-1
                      truncate
                      text-[11px]
                      text-slate-700
                    "
                    title={
                      option.label
                    }
                  >
                    {option.label}
                  </span>

                  {/* Count */}

                  {option.count !==
                    undefined &&
                    option.count !==
                      null && (
                      <span className="text-[10px] text-slate-400">
                        {
                          option.count
                        }
                      </span>
                    )}
                </button>
              );
            }
          )
        )}
      </div>

      {/* =================================================
          FREEZE / HIDE
      ================================================= */}

      {(onFreezeColumn ||
        onHideColumn) && (
        <div className="border-t border-slate-200 py-0.5">
          {onFreezeColumn && (
            <button
              type="button"
              onClick={() => {
                onFreezeColumn?.(
                  column?.key
                );
                close?.();
              }}
              className="
                flex
                h-[32px]
                w-full
                items-center
                justify-between
                px-3
                text-left
                text-[11px]
                text-slate-700
                hover:bg-slate-50
              "
            >
              <span>
                {isFrozen
                  ? "Unfreeze column"
                  : "Freeze column"}
              </span>
            </button>
          )}

          {onHideColumn && (
            <button
              type="button"
              onClick={() => {
                onHideColumn?.(
                  column?.key
                );
                close?.();
              }}
              className="
                flex
                h-[32px]
                w-full
                items-center
                px-3
                text-left
                text-[11px]
                text-slate-700
                hover:bg-slate-50
              "
            >
              Hide column
            </button>
          )}
        </div>
      )}

      {/* =================================================
          FOOTER
      ================================================= */}

      <div
        className="
          flex
          items-center
          justify-end
          gap-1.5
          border-t
          border-slate-200
          bg-slate-50
          px-3
          py-2
        "
      >
        <button
          type="button"
          onClick={
            handleCancel
          }
          className="
            h-[30px]
            min-w-[62px]
            border
            border-slate-300
            bg-white
            px-3
            text-[11px]
            font-medium
            text-slate-700
            hover:bg-slate-100
          "
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={
            handleApply
          }
          className="
            h-[30px]
            min-w-[62px]
            bg-blue-600
            px-3
            text-[11px]
            font-semibold
            text-white
            hover:bg-blue-700
          "
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default memo(
  PriceManagementColumnFilter
);