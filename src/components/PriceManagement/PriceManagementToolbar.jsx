import React, {
  memo,
  useEffect,
  useRef,
  useState,
} from "react";

const PriceManagementToolbar = ({
  search = "",
  onSearchChange,

  quickFilter = "all",
  onQuickFilterChange,

  changedCount = 0,
  totalCount = 0,

  columns = [],
  visibleColumns = [],
  onToggleColumn,

  onImport,
  onExport,
  onBulkEdit,

  onRefresh,
  onUndo,
  onRedo,

  canUndo = false,
  canRedo = false,

  saving = false,
  hasChanges = false,
  onSave,

  lastUpdated,
  syncStatus = "saved",

  searchInputRef,
}) => {
  const [openMenu, setOpenMenu] =
    useState(null);

  const menuRef = useRef(null);

  /* ==========================================================================
   * Close menus when clicking outside
   * ======================================================================== */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        !menuRef.current?.contains(
          event.target
        )
      ) {
        setOpenMenu(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* ==========================================================================
   * Escape closes open menu
   * ======================================================================== */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /* ==========================================================================
   * Menu toggle
   * ======================================================================== */

  const toggleMenu = (menu) => {
    setOpenMenu((current) =>
      current === menu
        ? null
        : menu
    );
  };

  /* ==========================================================================
   * Search keyboard
   * ======================================================================== */

  const handleSearchKeyDown = (event) => {
    if (event.key === "Escape") {
      onSearchChange?.("");
      event.currentTarget.blur();
    }
  };

  /* ==========================================================================
   * Updated time
   * ======================================================================== */

  const formatUpdated = () => {
    if (!lastUpdated) {
      return "Not synced";
    }

    if (lastUpdated instanceof Date) {
      return lastUpdated.toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    }

    return String(lastUpdated);
  };

  /* ==========================================================================
   * Column visibility
   *
   * Empty visibleColumns means:
   * all columns are visible.
   * ======================================================================== */

  const isColumnVisible = (key) => {
    // Array format support
    if (Array.isArray(visibleColumns)) {
      return (
        visibleColumns.length === 0 ||
        visibleColumns.includes(key)
      );
    }

    // Object / map format support
    if (
      visibleColumns &&
      typeof visibleColumns === "object"
    ) {
      // Empty object = all columns visible
      if (
        Object.keys(
          visibleColumns
        ).length === 0
      ) {
        return true;
      }

      // Explicit false = hidden
      return (
        visibleColumns[key] !== false
      );
    }

    // Safe fallback
    return true;
  };

  return (
    <div
      ref={menuRef}
      className="
        relative
        border-b
        border-slate-200
        bg-white
      "
    >
      {/* ====================================================================
       * Main Toolbar
       * ================================================================== */}

      <div
        className="
          flex
          min-h-[52px]
          items-center
          gap-2
          overflow-x-auto
          px-3
          scrollbar-thin
        "
      >
        {/* ------------------------------------------------------------------
         * Search
         * ---------------------------------------------------------------- */}

        <div className="relative min-w-[230px] max-w-[340px] flex-1">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              h-4
              w-4
              -translate-y-1/2
              text-slate-500
            "
          >
            <circle
              cx="11"
              cy="11"
              r="7"
            />

            <path d="m20 20-4-4" />
          </svg>

          <input
            ref={searchInputRef}
            value={search}
            onChange={(event) =>
              onSearchChange?.(
                event.target.value
              )
            }
            onKeyDown={
              handleSearchKeyDown
            }
            placeholder="Search products..."
            className="
              h-[34px]
              w-full
              border
              border-slate-300
              bg-slate-50
              pl-9
              pr-16
              text-[12px]
              font-medium
              text-slate-800
              placeholder:text-slate-400
              outline-none
              transition
              focus:border-blue-400
              focus:bg-white
            "
          />

          <span
            className="
              pointer-events-none
              absolute
              right-2
              top-1/2
              -translate-y-1/2
              border
              border-slate-300
              bg-white
              px-1.5
              py-0.5
              text-[9px]
              font-semibold
              text-slate-500
            "
          >
            Ctrl K
          </span>
        </div>

        {/* ------------------------------------------------------------------
         * Filter
         * ---------------------------------------------------------------- */}

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() =>
              toggleMenu("filter")
            }
            className={`
              flex
              h-[34px]
              items-center
              gap-1.5
              border
              px-3
              text-[11px]
              font-semibold
              transition
              ${
                openMenu === "filter"
                  ? "border-blue-300 bg-blue-50 text-blue-800"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }
            `}
          >
            <FilterIcon />

            Filter

            <ChevronIcon />
          </button>

          {openMenu === "filter" && (
            <div
              className="
                absolute
                left-0
                top-[40px]
                z-50
                w-[200px]
                border
                border-slate-300
                bg-white
                py-1
                shadow-lg
              "
            >
              <div className="border-b border-slate-200 px-3 py-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Filter Products
                </span>
              </div>

              <FilterOption
                active={
                  quickFilter ===
                  "all"
                }
                label={`All products (${totalCount})`}
                onClick={() => {
                  onQuickFilterChange?.(
                    "all"
                  );

                  setOpenMenu(null);
                }}
              />

              <FilterOption
                active={
                  quickFilter ===
                  "changed"
                }
                label={`Changed only (${changedCount})`}
                onClick={() => {
                  onQuickFilterChange?.(
                    "changed"
                  );

                  setOpenMenu(null);
                }}
              />

              <FilterOption
                active={
                  quickFilter ===
                  "missing"
                }
                label="No Sale Name"
                onClick={() => {
                  onQuickFilterChange?.(
                    "missing"
                  );

                  setOpenMenu(null);
                }}
              />
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------
         * Changed Only
         * ---------------------------------------------------------------- */}

        <button
          type="button"
          onClick={() =>
            onQuickFilterChange?.(
              quickFilter ===
                "changed"
                ? "all"
                : "changed"
            )
          }
          className={`
            flex
            h-[34px]
            shrink-0
            items-center
            gap-1.5
            border
            px-3
            text-[11px]
            font-semibold
            transition
            ${
              quickFilter ===
              "changed"
                ? "border-blue-300 bg-blue-50 text-blue-800"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }
          `}
        >
          Changed Only

          {changedCount > 0 && (
            <span
              className="
                min-w-[18px]
                bg-blue-100
                px-1
                py-0.5
                text-center
                text-[9px]
                font-bold
                text-blue-800
              "
            >
              {changedCount}
            </span>
          )}
        </button>

        {/* ------------------------------------------------------------------
         * No Sale Name
         * ---------------------------------------------------------------- */}

        <button
          type="button"
          onClick={() =>
            onQuickFilterChange?.(
              quickFilter ===
                "missing"
                ? "all"
                : "missing"
            )
          }
          className={`
            flex
            h-[34px]
            shrink-0
            items-center
            border
            px-3
            text-[11px]
            font-semibold
            transition
            ${
              quickFilter ===
              "missing"
                ? "border-amber-300 bg-amber-50 text-amber-800"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }
          `}
        >
          No Sale Name
        </button>

        <div className="mx-1 h-5 w-px shrink-0 bg-slate-200" />

        {/* ------------------------------------------------------------------
         * Columns
         * ---------------------------------------------------------------- */}

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() =>
              toggleMenu("columns")
            }
            className="
              flex
              h-[34px]
              items-center
              gap-1.5
              border
              border-slate-300
              bg-white
              px-3
              text-[11px]
              font-semibold
              text-slate-700
              transition
              hover:bg-slate-50
            "
          >
            <ColumnsIcon />

            Columns

            <ChevronIcon />
          </button>

          {openMenu ===
            "columns" && (
            <div
              className="
                absolute
                right-0
                top-[40px]
                z-50
                w-[200px]
                border
                border-slate-300
                bg-white
                py-1
                shadow-lg
              "
            >
              <div className="border-b border-slate-200 px-3 py-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Visible Columns
                </span>
              </div>

              {columns.map(
                (column) => {
                  const key =
                    column.key;

                  const checked =
                    isColumnVisible(
                      key
                    );

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        onToggleColumn?.(
                          key
                        )
                      }
                      className="
                        flex
                        w-full
                        items-center
                        gap-2
                        px-3
                        py-2
                        text-left
                        text-[11px]
                        font-medium
                        text-slate-700
                        hover:bg-slate-50
                      "
                    >
                      <span
                        className={`
                          flex
                          h-3.5
                          w-3.5
                          shrink-0
                          items-center
                          justify-center
                          border
                          text-[9px]
                          font-bold
                          ${
                            checked
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-300 bg-white"
                          }
                        `}
                      >
                        {checked &&
                          "✓"}
                      </span>

                      <span className="truncate">
                        {
                          column.label
                        }
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------
         * EXPORT
         *
         * Direct visible button.
         * Density removed completely.
         * ---------------------------------------------------------------- */}

        <button
          type="button"
          onClick={() => {
            setOpenMenu(null);
            onExport?.();
          }}
          className="
            flex
            h-[34px]
            shrink-0
            items-center
            gap-1.5
            border
            border-emerald-300
            bg-emerald-50
            px-3
            text-[11px]
            font-bold
            text-emerald-800
            transition
            hover:border-emerald-400
            hover:bg-emerald-100
            active:bg-emerald-200
          "
          title="Export all products category-wise to Excel"
        >
          <ExportIcon />

          Export
        </button>

        {/* ------------------------------------------------------------------
         * More
         *
         * Import + Bulk Edit remain here.
         * ---------------------------------------------------------------- */}

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() =>
              toggleMenu("more")
            }
            className="
              flex
              h-[34px]
              w-[34px]
              items-center
              justify-center
              border
              border-slate-300
              bg-white
              text-slate-600
              transition
              hover:bg-slate-50
              hover:text-slate-800
            "
            title="More actions"
          >
            <MoreIcon />
          </button>

          {openMenu ===
            "more" && (
            <div
              className="
                absolute
                right-0
                top-[40px]
                z-50
                w-[165px]
                border
                border-slate-300
                bg-white
                py-1
                shadow-lg
              "
            >
              <MenuButton
                label="Import"
                onClick={() => {
                  setOpenMenu(
                    null
                  );

                  onImport?.();
                }}
              />

              <MenuButton
                label="Bulk Edit"
                onClick={() => {
                  setOpenMenu(
                    null
                  );

                  onBulkEdit?.();
                }}
              />
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* ------------------------------------------------------------------
         * Undo
         * ---------------------------------------------------------------- */}

        <IconButton
          title="Undo"
          disabled={!canUndo}
          onClick={onUndo}
        >
          <UndoIcon />
        </IconButton>

        {/* ------------------------------------------------------------------
         * Redo
         * ---------------------------------------------------------------- */}

        <IconButton
          title="Redo"
          disabled={!canRedo}
          onClick={onRedo}
        >
          <RedoIcon />
        </IconButton>

        {/* ------------------------------------------------------------------
         * Refresh
         * ---------------------------------------------------------------- */}

        <IconButton
          title="Refresh"
          disabled={saving}
          onClick={onRefresh}
        >
          <RefreshIcon />
        </IconButton>

        {/* ------------------------------------------------------------------
         * Sync status
         * ---------------------------------------------------------------- */}

        <div
          className="
            hidden
            shrink-0
            items-center
            gap-2
            px-2
            lg:flex
          "
        >
          <span
            className={`
              h-1.5
              w-1.5
              ${
                syncStatus ===
                "saving"
                  ? "bg-amber-500"
                  : syncStatus ===
                    "error"
                  ? "bg-red-500"
                  : "bg-emerald-500"
              }
            `}
          />

          <div className="leading-none">
            <div className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
              {syncStatus ===
              "saving"
                ? "Saving"
                : syncStatus ===
                  "error"
                ? "Sync Error"
                : "Saved"}
            </div>

            <div className="mt-0.5 text-[9px] font-medium text-slate-500">
              {formatUpdated()}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------
         * Save
         * ---------------------------------------------------------------- */}

        <button
          type="button"
          disabled={
            !hasChanges ||
            saving
          }
          onClick={onSave}
          className="
            flex
            h-[34px]
            min-w-[108px]
            shrink-0
            items-center
            justify-center
            gap-2
            bg-blue-600
            px-4
            text-[11px]
            font-bold
            text-white
            transition
            hover:bg-blue-700
            active:bg-blue-800
            disabled:cursor-not-allowed
            disabled:bg-slate-200
            disabled:text-slate-400
          "
        >
          {saving ? (
            <>
              <span
                className="
                  h-3
                  w-3
                  animate-spin
                  border
                  border-white/40
                  border-t-white
                "
              />

              Saving...
            </>
          ) : (
            <>
              Save Changes

              {hasChanges && (
                <span
                  className="
                    min-w-[16px]
                    bg-white/15
                    px-1
                    py-0.5
                    text-[9px]
                  "
                >
                  {changedCount}
                </span>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

/* ============================================================================
 * Small components
 * ========================================================================== */

const MenuButton = ({
  label,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="
      w-full
      px-3
      py-2
      text-left
      text-[11px]
      font-medium
      text-slate-700
      hover:bg-slate-50
    "
  >
    {label}
  </button>
);

const FilterOption = ({
  label,
  active,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      flex
      w-full
      items-center
      justify-between
      px-3
      py-2
      text-left
      text-[11px]
      ${
        active
          ? "bg-blue-50 font-bold text-blue-800"
          : "font-medium text-slate-700 hover:bg-slate-50"
      }
    `}
  >
    {label}

    {active && (
      <span>✓</span>
    )}
  </button>
);

const IconButton = ({
  children,
  title,
  disabled,
  onClick,
}) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onClick={onClick}
    className="
      flex
      h-[32px]
      w-[32px]
      shrink-0
      items-center
      justify-center
      text-slate-600
      transition
      hover:bg-slate-100
      hover:text-slate-900
      disabled:pointer-events-none
      disabled:opacity-30
    "
  >
    {children}
  </button>
);

/* ============================================================================
 * Icons
 * ========================================================================== */

const ChevronIcon = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    className="h-3 w-3"
  >
    <path d="m5 7 5 5 5-5" />
  </svg>
);

const FilterIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    className="h-3.5 w-3.5"
  >
    <path d="M4 5h16M7 12h10M10 19h4" />
  </svg>
);

const ColumnsIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    className="h-3.5 w-3.5"
  >
    <rect
      x="4"
      y="4"
      width="6"
      height="16"
    />

    <rect
      x="14"
      y="4"
      width="6"
      height="16"
    />
  </svg>
);

const ExportIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-3.5 w-3.5"
  >
    <path d="M12 3v12" />
    <path d="m7 10 5 5 5-5" />
    <path d="M5 21h14" />
  </svg>
);

const MoreIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-4 w-4"
  >
    <circle
      cx="5"
      cy="12"
      r="1.5"
    />

    <circle
      cx="12"
      cy="12"
      r="1.5"
    />

    <circle
      cx="19"
      cy="12"
      r="1.5"
    />
  </svg>
);

const UndoIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4"
  >
    <path d="M9 7 4 12l5 5" />
    <path d="M5 12h9a5 5 0 0 1 5 5" />
  </svg>
);

const RedoIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4"
  >
    <path d="m15 7 5 5-5 5" />
    <path d="M19 12h-9a5 5 0 0 0-5 5" />
  </svg>
);

const RefreshIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4"
  >
    <path d="M20 11a8 8 0 0 0-14.9-3.9L3 10" />
    <path d="M3 5v5h5" />
    <path d="M4 13a8 8 0 0 0 14.9 3.9L21 14" />
    <path d="M21 19v-5h-5" />
  </svg>
);

export default memo(
  PriceManagementToolbar
);