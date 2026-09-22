import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const FilterIcon = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 5h16" />
    <path d="M7 12h10" />
    <path d="M10 19h4" />
  </svg>
);

const SearchIcon = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const CheckIcon = ({ size = 11 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m5 12 4 4L19 6" />
  </svg>
);

const SortIcon = ({ desc = false }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {desc ? (
      <>
        <path d="M8 5v14" />
        <path d="m4 15 4 4 4-4" />
      </>
    ) : (
      <>
        <path d="M8 19V5" />
        <path d="m4 9 4-4 4 4" />
      </>
    )}

    <path d="M14 7h6" />
    <path d="M14 12h4" />
    <path d="M14 17h2" />
  </svg>
);

const PriceManagementColumnFilter = ({
  column,
  filterValue = "",
  filterOptions = [],
  currentSort = null,
  onSort,
  onFilterChange,
  onClearFilter,
  onHideColumn,
  close,
}) => {
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const [searchText, setSearchText] = useState("");
  const [selectedValues, setSelectedValues] = useState([]);

  const options = useMemo(() => {
    if (!Array.isArray(filterOptions) || !filterOptions.length) {
      return [];
    }

    const unique = new Map();

    for (const option of filterOptions) {
      if (option == null) continue;

      const isObject =
        typeof option === "object" &&
        option !== null;

      const value = isObject
        ? option.value
        : option;

      if (value == null) continue;

      const label = String(
        isObject
          ? option.label ?? value
          : value
      ).trim();

      if (!label) continue;

      const key = String(value);

      if (!unique.has(key)) {
        unique.set(key, {
          value,
          label,
          count: isObject
            ? option.count
            : undefined,
        });
      }
    }

    return Array.from(unique.values());
  }, [filterOptions]);

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
      setSelectedValues(
        filterValue
          .split("||")
          .map((value) => value.trim())
          .filter(Boolean)
      );

      return;
    }

    setSelectedValues([]);
  }, [filterValue]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      searchRef.current?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        close?.();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;

      event.preventDefault();
      close?.();
    };

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [close]);

  const filteredOptions = useMemo(() => {
    const query = searchText
      .trim()
      .toLowerCase();

    if (!query) {
      return options.slice(0, 200);
    }

    const result = [];

    for (const option of options) {
      if (
        option.label
          .toLowerCase()
          .includes(query)
      ) {
        result.push(option);

        if (result.length >= 200) {
          break;
        }
      }
    }

    return result;
  }, [options, searchText]);

  const title =
    column?.label ||
    column?.header ||
    column?.key ||
    "Column";

  const columnKey = column?.key;

  const isNumeric =
    column?.type === "number" ||
    column?.type === "price" ||
    column?.type === "currency" ||
    columnKey === "price" ||
    columnKey === "ds_price" ||
    columnKey === "dlr_price" ||
    columnKey === "dsPrice" ||
    columnKey === "dlrPrice";

  const allSelected =
    filteredOptions.length > 0 &&
    filteredOptions.every((option) =>
      selectedValues.includes(
        String(option.value)
      )
    );

  const hasFilter =
    selectedValues.length > 0 &&
    selectedValues.length < options.length;

  const toggleValue = useCallback((value) => {
    const key = String(value);

    setSelectedValues((current) => {
      if (current.includes(key)) {
        return current.filter(
          (item) => item !== key
        );
      }

      return [...current, key];
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const visibleValues = filteredOptions.map(
      (option) => String(option.value)
    );

    if (!visibleValues.length) return;

    setSelectedValues((current) => {
      const selected = new Set(current);

      visibleValues.forEach((value) => {
        selected.add(value);
      });

      return Array.from(selected);
    });
  }, [filteredOptions]);

  const handleClearAll = useCallback(() => {
    setSelectedValues([]);
  }, []);

  const handleApply = useCallback(() => {
    if (!columnKey) {
      close?.();
      return;
    }

    if (!selectedValues.length) {
      onClearFilter?.(columnKey);
    } else {
      onFilterChange?.(
        columnKey,
        selectedValues.length === 1
          ? selectedValues[0]
          : selectedValues.join("||")
      );
    }

    close?.();
  }, [
    columnKey,
    selectedValues,
    onClearFilter,
    onFilterChange,
    close,
  ]);

  const handleSort = useCallback(
    (direction) => {
      if (columnKey) {
        onSort?.(
          columnKey,
          direction
        );
      }

      close?.();
    },
    [columnKey, onSort, close]
  );

  const isSortActive = useCallback(
    (direction) =>
      currentSort?.key === columnKey &&
      currentSort?.direction === direction,
    [currentSort, columnKey]
  );

  const handleSearchKeyDown = useCallback(
    (event) => {
      if (event.key !== "Enter") return;

      event.preventDefault();
      handleApply();
    },
    [handleApply]
  );

  return (
    <div
      ref={menuRef}
      onClick={(event) =>
        event.stopPropagation()
      }
      onMouseDown={(event) =>
        event.stopPropagation()
      }
      className="
        absolute
        left-0
        top-full
        z-[9999]
        mt-[3px]
        w-[248px]
        max-w-[calc(100vw-16px)]
        overflow-hidden
        border
        border-[#B8C1CC]
        bg-white
        text-[#172033]
        shadow-[0_10px_28px_rgba(15,23,42,0.18)]
      "
    >
      <div
        className="
          flex
          h-[36px]
          items-center
          justify-between
          gap-2
          border-b
          border-[#D7DCE3]
          bg-[#F7F9FC]
          px-2.5
        "
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="shrink-0 text-blue-600">
            <FilterIcon size={14} />
          </span>

          <span
            title={title}
            className="
              truncate
              text-[11px]
              font-bold
              uppercase
              tracking-wide
              text-[#172033]
            "
          >
            {title}
          </span>
        </div>

        {hasFilter && (
          <span
            className="
              shrink-0
              rounded-[2px]
              bg-blue-50
              px-1.5
              py-0.5
              text-[9px]
              font-bold
              text-blue-700
            "
          >
            {selectedValues.length}
          </span>
        )}
      </div>

      <div className="border-b border-[#D7DCE3] py-0.5">
        <FilterAction
          icon={<SortIcon />}
          label={
            isNumeric
              ? "Sort low → high"
              : "Sort A → Z"
          }
          active={isSortActive("asc")}
          onClick={() =>
            handleSort("asc")
          }
        />

        <FilterAction
          icon={<SortIcon desc />}
          label={
            isNumeric
              ? "Sort high → low"
              : "Sort Z → A"
          }
          active={isSortActive("desc")}
          onClick={() =>
            handleSort("desc")
          }
        />
      </div>

      <div className="px-2.5 pb-1 pt-2">
        <div className="flex items-center justify-between">
          <span
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-[0.06em]
              text-[#4B5563]
            "
          >
            Filter by values
          </span>

          <span className="text-[9px] text-[#6B7280]">
            {selectedValues.length}/
            {options.length}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 px-2.5 pb-1.5">
        <button
          type="button"
          onClick={handleSelectAll}
          disabled={
            !filteredOptions.length ||
            allSelected
          }
          className="
            text-[10px]
            font-semibold
            text-blue-700
            hover:text-blue-900
            disabled:cursor-default
            disabled:text-[#9CA3AF]
          "
        >
          Select all
        </button>

        <span className="text-[9px] text-[#9CA3AF]">
          |
        </span>

        <button
          type="button"
          onClick={handleClearAll}
          disabled={!selectedValues.length}
          className="
            text-[10px]
            font-semibold
            text-blue-700
            hover:text-blue-900
            disabled:cursor-default
            disabled:text-[#9CA3AF]
          "
        >
          Clear
        </button>
      </div>

      <div className="px-2.5 pb-1.5">
        <div
          className="
            flex
            h-[29px]
            items-center
            border
            border-[#B8C1CC]
            bg-white
            focus-within:border-blue-500
          "
        >
          <span className="pl-2 text-[#6B7280]">
            <SearchIcon size={13} />
          </span>

          <input
            ref={searchRef}
            type="text"
            value={searchText}
            onChange={(event) =>
              setSearchText(
                event.target.value
              )
            }
            onKeyDown={
              handleSearchKeyDown
            }
            placeholder="Search values..."
            spellCheck={false}
            autoComplete="off"
            className="
              min-w-0
              flex-1
              bg-transparent
              px-1.5
              text-[11px]
              text-[#172033]
              outline-none
              placeholder:text-[#9CA3AF]
            "
          />

          {searchText && (
            <button
              type="button"
              onClick={() =>
                setSearchText("")
              }
              className="
                mr-1
                flex
                h-5
                w-5
                items-center
                justify-center
                text-[12px]
                text-[#6B7280]
                hover:text-[#172033]
              "
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div
        className="
          mx-2.5
          max-h-[172px]
          overflow-y-auto
          border-y
          border-[#E5E7EB]
          py-0.5
        "
        style={{
          scrollbarWidth: "thin",
        }}
      >
        {filteredOptions.length === 0 ? (
          <div
            className="
              flex
              h-[70px]
              items-center
              justify-center
              text-[10px]
              text-[#6B7280]
            "
          >
            No matching values
          </div>
        ) : (
          filteredOptions.map((option) => {
            const value = String(
              option.value
            );

            const checked =
              selectedValues.includes(value);

            return (
              <FilterValue
                key={value}
                option={option}
                checked={checked}
                onToggle={toggleValue}
              />
            );
          })
        )}
      </div>

      {onHideColumn && (
        <div className="border-b border-[#D7DCE3] py-0.5">
          <MenuButton
            label="Hide column"
            onClick={() => {
              onHideColumn(columnKey);
              close?.();
            }}
          />
        </div>
      )}

      <div
        className="
          flex
          h-[40px]
          items-center
          justify-end
          gap-1.5
          bg-[#F7F9FC]
          px-2.5
        "
      >
        <button
          type="button"
          onClick={() =>
            close?.()
          }
          className="
            h-[27px]
            min-w-[58px]
            border
            border-[#B8C1CC]
            bg-white
            px-2.5
            text-[10px]
            font-semibold
            text-[#374151]
            hover:bg-[#F3F4F6]
          "
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleApply}
          className="
            h-[27px]
            min-w-[58px]
            border
            border-blue-600
            bg-blue-600
            px-2.5
            text-[10px]
            font-bold
            text-white
            hover:bg-blue-700
          "
        >
          Apply
        </button>
      </div>
    </div>
  );
};

const FilterAction = memo(
  ({
    icon,
    label,
    active,
    onClick,
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        h-[29px]
        w-full
        items-center
        gap-2
        px-2.5
        text-left
        text-[10px]
        font-semibold
        text-[#374151]
        hover:bg-blue-50
        hover:text-blue-700
      "
    >
      <span
        className="
          flex
          w-[15px]
          shrink-0
          items-center
          justify-center
          text-[#6B7280]
        "
      >
        {icon}
      </span>

      <span className="truncate">
        {label}
      </span>

      {active && (
        <span
          className="
            ml-auto
            text-[11px]
            font-bold
            text-blue-600
          "
        >
          ✓
        </span>
      )}
    </button>
  )
);

FilterAction.displayName = "FilterAction";

const FilterValue = memo(
  ({
    option,
    checked,
    onToggle,
  }) => (
    <button
      type="button"
      onClick={() =>
        onToggle(option.value)
      }
      className="
        flex
        min-h-[27px]
        w-full
        items-center
        gap-1.5
        px-1
        text-left
        hover:bg-blue-50
      "
    >
      <span
        className={`
          flex
          h-[14px]
          w-[14px]
          shrink-0
          items-center
          justify-center
          border
          ${
            checked
              ? `
                border-blue-600
                bg-blue-600
                text-white
              `
              : `
                border-[#B8C1CC]
                bg-white
                text-transparent
              `
          }
        `}
      >
        <CheckIcon size={10} />
      </span>

      <span
        title={option.label}
        className="
          min-w-0
          flex-1
          truncate
          text-[10px]
          font-medium
          text-[#374151]
        "
      >
        {option.label}
      </span>

      {option.count != null && (
        <span
          className="
            min-w-[18px]
            shrink-0
            text-right
            text-[9px]
            font-medium
            text-[#6B7280]
          "
        >
          {option.count}
        </span>
      )}
    </button>
  )
);

FilterValue.displayName = "FilterValue";

const MenuButton = memo(
  ({ label, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        h-[28px]
        w-full
        items-center
        px-2.5
        text-left
        text-[10px]
        font-medium
        text-[#374151]
        hover:bg-blue-50
        hover:text-blue-700
      "
    >
      {label}
    </button>
  )
);

MenuButton.displayName = "MenuButton";

export default memo(
  PriceManagementColumnFilter
);