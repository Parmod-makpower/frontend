import React, { memo, useEffect, useMemo, useRef } from "react";

/* =========================================================
   PRICE MANAGEMENT CATEGORY TABS
   - Lightweight
   - Proper borders
   - Spreadsheet-style compact UI
   - Horizontal scroll
   - Active category clearly visible
   - No unnecessary re-renders
========================================================= */

const PriceManagementCategoryTabs = ({
  categories = [],
  selectedCategory = "ALL",
  onCategoryChange,
  categoryCounts = {},
  onAddCategory,
  onCategoryMenu,
  disabled = false,
}) => {
  const scrollRef = useRef(null);

  /* =========================================================
     BUILD TABS
  ========================================================= */
  const tabs = useMemo(() => {
    const normalizedCategories = categories
      .map((category) => {
        const key =
          typeof category === "string"
            ? category
            : category?.key;

        if (!key || key.toUpperCase() === "ALL") {
          return null;
        }

        return {
          key,
          label:
            typeof category === "string"
              ? category
              : category.label ?? key,
          count:
            typeof category === "string"
              ? categoryCounts[key] ?? 0
              : category.count ??
                categoryCounts[key] ??
                0,
        };
      })
      .filter(Boolean);

    return [
      {
        key: "ALL",
        label: "All Products",
        count:
          categoryCounts.ALL ??
          categoryCounts.all ??
          0,
      },
      ...normalizedCategories,
    ];
  }, [categories, categoryCounts]);

  /* =========================================================
     KEEP ACTIVE CATEGORY IN VIEW
  ========================================================= */
  useEffect(() => {
    const container = scrollRef.current;

    if (!container) return;

    const active = container.querySelector(
      '[data-active-category="true"]'
    );

    if (!active) return;

    active.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [selectedCategory]);

  /* =========================================================
     HORIZONTAL SCROLL
  ========================================================= */
  const scrollTabs = (amount) => {
    scrollRef.current?.scrollBy({
      left: amount,
      behavior: "smooth",
    });
  };

  return (
    <div
      className="
        relative
        flex
        h-[42px]
        min-h-[42px]
        w-full
        items-center
        border-y
        border-slate-300
        bg-white
        px-1
      "
    >
      {/* =====================================================
          LEFT SCROLL
      ===================================================== */}
      <ScrollButton
        direction="left"
        disabled={disabled}
        onClick={() => scrollTabs(-220)}
        title="Previous categories"
      />

      {/* =====================================================
          CATEGORY AREA
      ===================================================== */}
      <div
        ref={scrollRef}
        className="
          flex
          h-full
          min-w-0
          flex-1
          items-stretch
          overflow-x-auto
          overflow-y-hidden
          scrollbar-thin
          scrollbar-track-transparent
          scrollbar-thumb-slate-300
        "
        style={{
          scrollbarWidth: "thin",
        }}
      >
        {tabs.map((tab) => {
          const active =
            selectedCategory === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              disabled={disabled}
              data-active-category={active}
              onClick={() =>
                onCategoryChange?.(tab.key)
              }
              className={`
                relative
                flex
                h-full
                shrink-0
                items-center
                gap-2
                border-r
                border-slate-200
                px-3
                text-[11px]
                whitespace-nowrap
                outline-none
                transition-colors
                duration-100

                ${
                  active
                    ? `
                      bg-blue-50/70
                      font-semibold
                      text-blue-700
                    `
                    : `
                      bg-white
                      font-medium
                      text-slate-600
                      hover:bg-slate-50
                      hover:text-blue-600
                    `
                }

                disabled:cursor-not-allowed
                disabled:opacity-40
              `}
            >
              {/* =================================================
                  LABEL
              ================================================= */}
              <span className="leading-none">
                {tab.label}
              </span>

              {/* =================================================
                  COUNT
              ================================================= */}
              <span
                className={`
                  flex
                  min-w-[20px]
                  h-[18px]
                  items-center
                  justify-center
                  rounded-[3px]
                  border
                  px-1
                  text-[9px]
                  leading-none
                  font-semibold

                  ${
                    active
                      ? `
                        border-blue-200
                        bg-white
                        text-blue-700
                      `
                      : `
                        border-slate-200
                        bg-slate-100
                        text-slate-500
                      `
                  }
                `}
              >
                {tab.count}
              </span>

              {/* =================================================
                  ACTIVE INDICATOR
              ================================================= */}
              {active && (
                <span
                  className="
                    pointer-events-none
                    absolute
                    bottom-0
                    left-0
                    right-0
                    h-[2px]
                    bg-blue-600
                  "
                />
              )}
            </button>
          );
        })}
      </div>

      {/* =====================================================
          RIGHT SCROLL
      ===================================================== */}
      <ScrollButton
        direction="right"
        disabled={disabled}
        onClick={() => scrollTabs(220)}
        title="Next categories"
      />

      {/* =====================================================
          ACTIONS
      ===================================================== */}
      {(onAddCategory || onCategoryMenu) && (
        <div
          className="
            ml-1
            flex
            h-[30px]
            shrink-0
            items-center
            border-l
            border-slate-300
            pl-1
          "
        >
          {/* ADD CATEGORY */}
          {onAddCategory && (
            <button
              type="button"
              disabled={disabled}
              onClick={onAddCategory}
              title="Add category"
              className="
                flex
                h-[28px]
                w-[28px]
                items-center
                justify-center
                rounded-[3px]
                border
                border-transparent
                text-[17px]
                leading-none
                text-slate-500
                transition-colors
                hover:border-blue-200
                hover:bg-blue-50
                hover:text-blue-600
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              +
            </button>
          )}

          {/* CATEGORY MENU */}
          {onCategoryMenu && (
            <button
              type="button"
              disabled={disabled}
              onClick={onCategoryMenu}
              title="Category menu"
              className="
                flex
                h-[28px]
                w-[28px]
                items-center
                justify-center
                rounded-[3px]
                border
                border-transparent
                text-[15px]
                leading-none
                text-slate-500
                transition-colors
                hover:border-slate-200
                hover:bg-slate-50
                hover:text-slate-700
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              ⋮
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* =========================================================
   SCROLL BUTTON
========================================================= */

const ScrollButton = memo(
  ({ direction, disabled, onClick, title }) => {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        title={title}
        className="
          flex
          h-[29px]
          w-[27px]
          shrink-0
          items-center
          justify-center
          rounded-[3px]
          border
          border-transparent
          text-slate-500
          transition-colors
          hover:border-slate-200
          hover:bg-slate-50
          hover:text-blue-600
          disabled:cursor-not-allowed
          disabled:opacity-25
        "
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={
              direction === "left"
                ? "m12 4-6 6 6 6"
                : "m8 4 6 6-6 6"
            }
          />
        </svg>
      </button>
    );
  }
);

ScrollButton.displayName = "ScrollButton";

/* =========================================================
   EXPORT
========================================================= */

export default memo(PriceManagementCategoryTabs);