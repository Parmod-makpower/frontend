import React, {
  memo,
  useEffect,
  useRef,
  useState,
} from "react";

const PriceManagementToolbar = ({
  title = "Price Management",
  subtitle = "Manage product pricing and sale names",
  totalCount = 0,
  changedCount = 0,

  applicableFrom,
  onApplicableFromChange,

  reason = "",
  onReasonChange,

  search = "",
  onSearchChange,

  quickFilter = "all",
  onQuickFilterChange,

  density = "compact",
  onDensityChange,

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
  selectedCount = 0,
}) => {
  const [openMenu, setOpenMenu] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    const handleClick = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    const handleKey = (event) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const updatedText = lastUpdated
    ? lastUpdated instanceof Date
      ? lastUpdated.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : String(lastUpdated)
    : "Not saved";

  const sync =
    {
      saved: {
        label: "Saved",
        dot: "bg-emerald-500",
        text: "text-emerald-600",
        bg: "bg-emerald-50",
      },
      saving: {
        label: "Saving...",
        dot: "bg-blue-500 animate-pulse",
        text: "text-blue-600",
        bg: "bg-blue-50",
      },
      unsaved: {
        label: "Unsaved",
        dot: "bg-amber-500",
        text: "text-amber-600",
        bg: "bg-amber-50",
      },
      error: {
        label: "Sync error",
        dot: "bg-red-500",
        text: "text-red-600",
        bg: "bg-red-50",
      },
    }[syncStatus] || {
      label: "Saved",
      dot: "bg-emerald-500",
      text: "text-emerald-600",
      bg: "bg-emerald-50",
    };

  const dateValue =
    applicableFrom instanceof Date
      ? applicableFrom.toISOString().slice(0, 10)
      : applicableFrom || "";

  const toggleMenu = (menu) => {
    setOpenMenu((current) =>
      current === menu ? null : menu
    );
  };

  return (
    <div
      ref={rootRef}
      className="
        relative
        z-[500]
        border-b
        border-slate-200
        bg-white
      "
    >
      <div
        className="
          border-b
          border-slate-100
          px-3
          py-2.5
        "
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                border
                border-slate-200
                bg-slate-900
                text-white
              "
            >
              <PriceIcon />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1
                  className="
                    truncate
                    text-[15px]
                    font-bold
                    tracking-tight
                    text-slate-900
                  "
                >
                  {title}
                </h1>

                {hasChanges && (
                  <span
                    className="
                      border
                      border-amber-200
                      bg-amber-50
                      px-1.5
                      py-0.5
                      text-[8px]
                      font-bold
                      text-amber-700
                    "
                  >
                    UNSAVED
                  </span>
                )}
              </div>

              <p className="mt-0.5 text-[9px] font-medium text-slate-400">
                {subtitle}
              </p>
            </div>

            <div className="hidden items-center gap-1.5 lg:flex">
              <StatBadge
                label="Products"
                value={totalCount}
              />

              <StatBadge
                label="Changed"
                value={changedCount}
                tone={
                  changedCount ? "amber" : "slate"
                }
              />

              {selectedCount > 0 && (
                <StatBadge
                  label="Selected"
                  value={selectedCount}
                  tone="blue"
                />
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <div
              className="
                flex
                h-[34px]
                items-center
                gap-1.5
                border
                border-slate-200
                bg-slate-50
                px-2
              "
            >
              <CalendarIcon />

              <div className="leading-none">
                <div className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
                  Applicable From
                </div>

                <input
                  type="date"
                  value={dateValue}
                  onChange={(e) =>
                    onApplicableFromChange?.(
                      e.target.value
                    )
                  }
                  className="
                    mt-0.5
                    w-[105px]
                    border-0
                    bg-transparent
                    p-0
                    text-[10px]
                    font-semibold
                    text-slate-700
                    outline-none
                  "
                />
              </div>
            </div>

            <div
              className="
                flex
                h-[34px]
                w-[190px]
                items-center
                gap-1.5
                border
                border-slate-200
                bg-white
                px-2
              "
            >
              <ReasonIcon />

              <input
                value={reason}
                onChange={(e) =>
                  onReasonChange?.(e.target.value)
                }
                placeholder="Reason for price change..."
                className="
                  min-w-0
                  flex-1
                  border-0
                  bg-transparent
                  p-0
                  text-[10px]
                  font-medium
                  text-slate-700
                  outline-none
                  placeholder:text-slate-400
                "
              />
            </div>

            <div
              className={`
                flex
                h-[34px]
                items-center
                gap-1.5
                px-2
                ${sync.bg}
              `}
            >
              <span
                className={`
                  h-1.5
                  w-1.5
                  rounded-full
                  ${sync.dot}
                `}
              />

              <div className="leading-none">
                <div
                  className={`text-[9px] font-bold ${sync.text}`}
                >
                  {sync.label}
                </div>

                <div className="mt-0.5 text-[7px] font-medium text-slate-400">
                  {updatedText}
                </div>
              </div>
            </div>

            <IconButton
              title="Refresh"
              disabled={saving}
              onClick={onRefresh}
            >
              <RefreshIcon />
            </IconButton>

            <IconButton
              title="Undo"
              disabled={!canUndo || saving}
              onClick={onUndo}
            >
              <UndoIcon />
            </IconButton>

            <IconButton
              title="Redo"
              disabled={!canRedo || saving}
              onClick={onRedo}
            >
              <RedoIcon />
            </IconButton>
          </div>
        </div>
      </div>

      <div
        className="
          relative
          flex
          min-h-[48px]
          items-center
          gap-1.5
          px-3
          py-1.5
        "
      >
        <div className="relative w-[250px] shrink-0">
          <SearchIcon />

          <input
            ref={searchInputRef}
            value={search}
            onChange={(e) =>
              onSearchChange?.(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onSearchChange?.("");
                e.currentTarget.blur();
              }
            }}
            placeholder="Search products..."
            className="
              h-[32px]
              w-full
              border
              border-slate-300
              bg-white
              pl-8
              pr-12
              text-[10px]
              font-medium
              text-slate-700
              outline-none
              focus:border-blue-500
              focus:ring-1
              focus:ring-blue-100
            "
          />

          <span
            className="
              pointer-events-none
              absolute
              right-1.5
              top-1/2
              -translate-y-1/2
              border
              border-slate-200
              bg-slate-50
              px-1
              py-0.5
              text-[8px]
              font-semibold
              text-slate-400
            "
          >
            Ctrl K
          </span>
        </div>

        <Menu
          open={openMenu === "filter"}
          onClick={() => toggleMenu("filter")}
          icon={<FilterIcon />}
          label="Filter"
          chevron
        >
          <DropdownTitle>
            Filter Products
          </DropdownTitle>

          <Choice
            active={quickFilter === "all"}
            label={`All products (${totalCount})`}
            onClick={() => {
              onQuickFilterChange?.("all");
              setOpenMenu(null);
            }}
          />

          <Choice
            active={quickFilter === "changed"}
            label={`Changed only (${changedCount})`}
            onClick={() => {
              onQuickFilterChange?.("changed");
              setOpenMenu(null);
            }}
          />

          <Choice
            active={quickFilter === "missing"}
            label="No Sale Name"
            onClick={() => {
              onQuickFilterChange?.("missing");
              setOpenMenu(null);
            }}
          />
        </Menu>

        <ToolbarButton
          active={quickFilter === "changed"}
          onClick={() =>
            onQuickFilterChange?.(
              quickFilter === "changed"
                ? "all"
                : "changed"
            )
          }
          icon={<ChangedOnlyIcon />}
        >
          Changed
          {changedCount > 0 && (
            <Badge>{changedCount}</Badge>
          )}
        </ToolbarButton>

        <ToolbarButton
          active={quickFilter === "missing"}
          onClick={() =>
            onQuickFilterChange?.(
              quickFilter === "missing"
                ? "all"
                : "missing"
            )
          }
        >
          No Sale Name
        </ToolbarButton>

        <Menu
          open={openMenu === "density"}
          onClick={() => toggleMenu("density")}
          icon={<DensityIcon />}
          label="Density"
          chevron
        >
          <DropdownTitle>
            Row Density
          </DropdownTitle>

          {[
            ["compact", "Compact"],
            ["comfortable", "Comfortable"],
            ["spacious", "Spacious"],
          ].map(([value, label]) => (
            <Choice
              key={value}
              active={density === value}
              label={label}
              onClick={() => {
                onDensityChange?.(value);
                setOpenMenu(null);
              }}
            />
          ))}
        </Menu>

        <ToolbarButton
          onClick={onImport}
          icon={<ImportIcon />}
          tone="blue"
        >
          Import
        </ToolbarButton>

        <ToolbarButton
          onClick={onExport}
          icon={<ExportIcon />}
          tone="green"
        >
          Export
        </ToolbarButton>

        <ToolbarButton
          onClick={onBulkEdit}
          icon={<BulkIcon />}
          tone="purple"
        >
          Bulk Edit

          {selectedCount > 0 && (
            <Badge>{selectedCount}</Badge>
          )}
        </ToolbarButton>

        <div className="flex-1" />

        <button
          type="button"
          disabled={!hasChanges || saving}
          onClick={onSave}
          className="
            flex
            h-[32px]
            min-w-[145px]
            shrink-0
            items-center
            justify-center
            gap-1.5
            border
            border-emerald-600
            bg-emerald-600
            px-3
            text-[10px]
            font-bold
            text-white
            hover:bg-emerald-700
            disabled:cursor-not-allowed
            disabled:border-slate-200
            disabled:bg-slate-100
            disabled:text-slate-400
          "
        >
          {saving ? <Spinner /> : <SaveIcon />}

          {saving
            ? "Saving..."
            : "Save Changes"}

          {hasChanges && !saving && (
            <span className="bg-white/15 px-1.5 py-0.5 text-[8px]">
              {changedCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

const Menu = ({
  open,
  onClick,
  icon,
  label,
  chevron,
  children,
}) => (
  <div className="relative z-[1000] shrink-0">
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        h-[32px]
        items-center
        gap-1.5
        border
        px-2.5
        text-[10px]
        font-semibold
        ${
          open
            ? "border-blue-500 bg-blue-50 text-blue-700"
            : "border-slate-300 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700"
        }
      `}
    >
      {icon}

      <span>{label}</span>

      {chevron && <ChevronDown />}
    </button>

    {open && (
      <div
        className="
          absolute
          left-0
          top-[35px]
          z-[999999]
          w-[205px]
          overflow-hidden
          border
          border-slate-300
          bg-white
          py-0.5
          shadow-[0_10px_28px_rgba(15,23,42,0.16)]
        "
      >
        {children}
      </div>
    )}
  </div>
);

const ToolbarButton = ({
  children,
  onClick,
  icon,
  active = false,
  tone = "default",
}) => {
  const tones = {
    default: active
      ? "border-blue-500 bg-blue-50 text-blue-700"
      : "border-slate-300 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50/40",

    blue:
      "border-blue-200 bg-blue-50/50 text-blue-600 hover:bg-blue-50",

    green:
      "border-emerald-200 bg-emerald-50/50 text-emerald-600 hover:bg-emerald-50",

    purple:
      "border-violet-200 bg-violet-50/50 text-violet-700 hover:bg-violet-50",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        h-[32px]
        shrink-0
        items-center
        gap-1.5
        border
        px-2.5
        text-[10px]
        font-semibold
        ${tones[tone]}
      `}
    >
      {icon}
      {children}
    </button>
  );
};

const DropdownTitle = ({ children }) => (
  <div
    className="
      border-b
      border-slate-200
      bg-slate-50
      px-2.5
      py-1.5
      text-[9px]
      font-bold
      uppercase
      tracking-wide
      text-slate-500
    "
  >
    {children}
  </div>
);

const Choice = ({
  active,
  label,
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
      px-2.5
      py-1.5
      text-left
      text-[10px]
      ${
        active
          ? "bg-blue-50 font-semibold text-blue-700"
          : "text-slate-600 hover:bg-slate-50"
      }
    `}
  >
    <span className="truncate">
      {label}
    </span>

    {active && (
      <span className="ml-2 shrink-0 text-blue-600">
        ✓
      </span>
    )}
  </button>
);

const StatBadge = ({
  label,
  value,
  tone = "slate",
}) => {
  const styles = {
    slate:
      "bg-slate-50 text-slate-600 border-slate-200",
    blue:
      "bg-blue-50 text-blue-700 border-blue-100",
    amber:
      "bg-amber-50 text-amber-700 border-amber-100",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1
        border
        px-1.5
        py-0.5
        text-[8px]
        font-semibold
        ${styles[tone]}
      `}
    >
      <span className="opacity-60">
        {label}
      </span>

      <span>{value}</span>
    </span>
  );
};

const Badge = ({ children }) => (
  <span className="bg-blue-100 px-1.5 py-0.5 text-[8px] font-bold text-blue-700">
    {children}
  </span>
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
      h-[30px]
      w-[30px]
      items-center
      justify-center
      border
      border-transparent
      text-slate-400
      hover:border-slate-200
      hover:bg-slate-50
      hover:text-slate-700
      disabled:cursor-not-allowed
      disabled:opacity-25
    "
  >
    {children}
  </button>
);

const Icon = ({
  children,
  className = "h-3.5 w-3.5",
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const SearchIcon = () => (
  <Icon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);

const PriceIcon = () => (
  <Icon className="h-4.5 w-4.5">
    <path d="M4 7.5 12 3l8 4.5-8 4.5-8-4.5Z" />
    <path d="M4 12.5 12 17l8-4.5" />
    <path d="M4 17 12 21l8-4" />
  </Icon>
);

const CalendarIcon = () => (
  <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400">
    <rect
      x="3"
      y="5"
      width="18"
      height="16"
      rx="2"
    />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </Icon>
);

const ReasonIcon = () => (
  <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400">
    <path d="M4 5h16v14H4z" />
    <path d="M8 9h8M8 13h6" />
  </Icon>
);

const FilterIcon = () => (
  <Icon>
    <path d="M4 5h16M7 12h10M10 19h4" />
  </Icon>
);

const DensityIcon = () => (
  <Icon>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);

const ChangedOnlyIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="8" />
    <path d="m9 12 2 2 4-5" />
  </Icon>
);

const ImportIcon = () => (
  <Icon>
    <path d="M12 3v12" />
    <path d="m7 10 5 5 5-5" />
    <path d="M5 21h14" />
  </Icon>
);

const ExportIcon = () => (
  <Icon>
    <path d="M12 21V9" />
    <path d="m7 14 5-5 5 5" />
    <path d="M5 3h14" />
  </Icon>
);

const BulkIcon = () => (
  <Icon>
    <path d="M4 6h16M4 12h16M4 18h16" />
    <circle
      cx="8"
      cy="6"
      r="1"
      fill="currentColor"
    />
    <circle
      cx="14"
      cy="12"
      r="1"
      fill="currentColor"
    />
    <circle
      cx="10"
      cy="18"
      r="1"
      fill="currentColor"
    />
  </Icon>
);

const SaveIcon = () => (
  <Icon>
    <path d="M5 4h12l2 2v14H5z" />
    <path d="M8 4v6h8V4" />
    <path d="M8 20v-6h8v6" />
  </Icon>
);

const UndoIcon = () => (
  <Icon>
    <path d="M9 7 4 12l5 5" />
    <path d="M5 12h9a5 5 0 0 1 5 5" />
  </Icon>
);

const RedoIcon = () => (
  <Icon>
    <path d="m15 7 5 5-5 5" />
    <path d="M19 12h-9a5 5 0 0 0-5 5" />
  </Icon>
);

const RefreshIcon = () => (
  <Icon>
    <path d="M20 11a8 8 0 0 0-14.9-3.9L3 10" />
    <path d="M3 5v5h5" />
    <path d="M4 13a8 8 0 0 0 14.9 3.9L21 14" />
    <path d="M21 19v-5h-5" />
  </Icon>
);

const ChevronDown = () => (
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

const Spinner = () => (
  <span
    className="
      h-3.5
      w-3.5
      animate-spin
      rounded-full
      border-2
      border-white/40
      border-t-white
    "
  />
);

export default memo(PriceManagementToolbar);