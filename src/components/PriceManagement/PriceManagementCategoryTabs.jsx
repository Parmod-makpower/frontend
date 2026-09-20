import React, {
  memo,
  useEffect,
  useRef,
} from "react";

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

  const allCount =
    categoryCounts.ALL ??
    categoryCounts.all ??
    0;

  const tabs = [
    {
      key: "ALL",
      label: "All Products",
      count: allCount,
    },
    ...categories
      .filter(
        (category) =>
          category &&
          category !== "ALL" &&
          category !== "all"
      )
      .map((category) => ({
        key:
          typeof category === "string"
            ? category
            : category.key,
        label:
          typeof category === "string"
            ? category
            : category.label ?? category.key,
        count:
          typeof category === "string"
            ? categoryCounts[category] ?? 0
            : category.count ??
              categoryCounts[category.key] ??
              0,
      })),
  ];

  const scrollTabs = (direction) => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -240 : 240,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (!scrollRef.current) return;

    const activeTab = scrollRef.current.querySelector(
      '[data-active-category="true"]'
    );

    activeTab?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [selectedCategory]);

  return (
    <div
      className="
        flex
        h-[42px]
        items-stretch
        border-x
        border-b
        border-gray-200
        bg-white
      "
    >
      {/* Left navigation */}
      <button
        type="button"
        onClick={() => scrollTabs("left")}
        disabled={disabled}
        className="
          flex
          w-[34px]
          shrink-0
          items-center
          justify-center
          border-r
          border-gray-200
          text-gray-400
          transition
          hover:bg-gray-50
          hover:text-gray-700
          disabled:pointer-events-none
          disabled:opacity-30
        "
        title="Scroll categories left"
      >
        <ChevronLeftIcon />
      </button>

      {/* Category tabs */}
      <div
        ref={scrollRef}
        className="
          flex
          min-w-0
          flex-1
          items-stretch
          overflow-x-auto
          overflow-y-hidden
          scrollbar-thin
        "
      >
        {tabs.map((tab) => {
          const active =
            selectedCategory === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              data-active-category={active}
              disabled={disabled}
              onClick={() =>
                onCategoryChange?.(tab.key)
              }
              className={`
                relative
                flex
                min-w-max
                shrink-0
                items-center
                gap-2
                border-r
                border-gray-200
                px-4
                text-[11px]
                transition
                ${
                  active
                    ? "bg-white font-semibold text-blue-700"
                    : "bg-gray-50/40 text-black hover:bg-gray-50 hover:text-gray-800"
                }
              `}
            >
              <span className="whitespace-nowrap">
                {tab.label}
              </span>

              <span
                className={`
                  min-w-[18px]
                  px-1
                  text-center
                  text-[9px]
                  font-medium
                  ${
                    active
                      ? "bg-blue-50 text-blue-600"
                      : "bg-gray-100 text-gray-400"
                  }
                `}
              >
                {tab.count}
              </span>

              {active && (
                <span
                  className="
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

      {/* Right navigation */}
      <button
        type="button"
        onClick={() => scrollTabs("right")}
        disabled={disabled}
        className="
          flex
          w-[34px]
          shrink-0
          items-center
          justify-center
          border-l
          border-gray-200
          text-gray-400
          transition
          hover:bg-gray-50
          hover:text-gray-700
          disabled:pointer-events-none
          disabled:opacity-30
        "
        title="Scroll categories right"
      >
        <ChevronRightIcon />
      </button>

      {/* New category / tab action */}
      <div className="flex shrink-0 items-center border-l border-gray-200">
        <button
          type="button"
          disabled={disabled}
          onClick={onAddCategory}
          title="Add category"
          className="
            flex
            h-full
            w-[38px]
            items-center
            justify-center
            text-gray-400
            transition
            hover:bg-gray-50
            hover:text-blue-600
            disabled:pointer-events-none
            disabled:opacity-30
          "
        >
          <PlusIcon />
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onCategoryMenu}
          title="Category options"
          className="
            flex
            h-full
            w-[32px]
            items-center
            justify-center
            text-gray-400
            transition
            hover:bg-gray-50
            hover:text-gray-700
            disabled:pointer-events-none
            disabled:opacity-30
          "
        >
          <MoreIcon />
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

const ChevronLeftIcon = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    className="h-4 w-4"
  >
    <path d="m12 4-6 6 6 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    className="h-4 w-4"
  >
    <path d="m8 4 6 6-6 6" />
  </svg>
);

const PlusIcon = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4"
  >
    <path d="M10 4v12M4 10h12" />
  </svg>
);

const MoreIcon = () => (
  <svg
    viewBox="0 0 20 20"
    fill="currentColor"
    className="h-4 w-4"
  >
    <circle cx="4" cy="10" r="1.3" />
    <circle cx="10" cy="10" r="1.3" />
    <circle cx="16" cy="10" r="1.3" />
  </svg>
);

export default memo(PriceManagementCategoryTabs);