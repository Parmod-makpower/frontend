import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import PriceManagementColumnFilter from "./PriceManagementColumnFilter";

/* =========================================================
   FILTER ICON
========================================================= */

const FilterIcon = ({ size = 15, active = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? "2.2" : "1.8"}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 5h16" />
    <path d="M7 12h10" />
    <path d="M10 19h4" />
  </svg>
);

/* =========================================================
   PRICE MANAGEMENT TABLE
========================================================= */

export default function PriceManagementTable({
  products = [],
  allProducts = [],
  drafts = {},
  onPriceChange,
  onSaleNameChange,
  onFillDown,
  onFocusCell,
  onMoveCell,
  onPaste,

  /* Column actions */
  onColumnSort,
  onColumnFilter,
  onColumnFilterChange,
  onColumnClearFilter,
  onClearColumnFilter,
  columnFilters = {},
  sort = null,

  /* Page-level visibility */
  visibleColumns: externalVisibleColumns = {},

  /* Optional */
  density = "comfortable",
}) {
  const [selectedCell, setSelectedCell] = useState(null);
  const [openColumnMenu, setOpenColumnMenu] = useState(null);

  /* =======================================================
     NORMALIZE COLUMN CALLBACKS
  ======================================================= */

  const handleFilterChange =
    onColumnFilterChange || onColumnFilter;

  const handleClearFilter =
    onColumnClearFilter || onClearColumnFilter;

  /* =======================================================
     COLUMN DEFINITIONS
  ======================================================= */

  const columns = useMemo(
    () => [
      {
        key: "sku",
        label: "ID",
        width: "82px",
        align: "left",
      },
      {
        key: "category",
        label: "CATEGORY",
        width: "145px",
        align: "left",
      },
      {
        key: "product",
        label: "PRODUCT",
        width: "230px",
        align: "left",
      },
      {
        key: "saleName",
        label: "SALE NAME",
        width: "235px",
        align: "left",
      },
      {
        key: "price",
        label: "SS PRICE",
        width: "135px",
        align: "right",
        priceColumn: true,
        accent: "blue",
        type: "price",
      },
      {
        key: "dsPrice",
        label: "DS PRICE",
        width: "135px",
        align: "right",
        priceColumn: true,
        accent: "violet",
        type: "price",
      },
      {
        key: "guarantee",
        label: "GUARANTEE",
        width: "110px",
        align: "center",
      },
      {
        key: "status",
        label: "STATUS",
        width: "100px",
        align: "center",
      },
      {
        key: "updated",
        label: "LAST UPDATED",
        width: "145px",
        align: "left",
      },
    ],
    []
  );

  /* =======================================================
     COLUMN VISIBILITY
  ======================================================= */

  const visibleColumns = useMemo(() => {
    const hasExternalVisibility =
      Object.keys(externalVisibleColumns || {}).length > 0;

    if (!hasExternalVisibility) {
      return {
        sku: true,
        category: true,
        product: true,
        saleName: true,
        price: true,
        dsPrice: true,
        guarantee: true,
        status: true,
        updated: true,
      };
    }

    return {
      sku: externalVisibleColumns.sku !== false,
      category: externalVisibleColumns.category !== false,
      product: externalVisibleColumns.product !== false,
      saleName: externalVisibleColumns.saleName !== false,
      price: externalVisibleColumns.price !== false,
      dsPrice: externalVisibleColumns.dsPrice !== false,
      guarantee: externalVisibleColumns.guarantee !== false,
      status: externalVisibleColumns.status !== false,
      updated: externalVisibleColumns.updated !== false,
    };
  }, [externalVisibleColumns]);

  /* =======================================================
     FILTER OPTIONS
  ======================================================= */

  const filterOptions = useMemo(() => {
    const options = {};

    const filterSource =
      Array.isArray(allProducts) && allProducts.length > 0
        ? allProducts
        : products;

    columns.forEach((column) => {
      const values = new Set();

      filterSource.forEach((product) => {
        const value = getColumnValue(
          product,
          column.key
        );

        if (Array.isArray(value)) {
          value.forEach((item) => {
            const text = getSaleNameText(item);

            if (text.trim()) {
              values.add(text);
            }
          });
        } else if (
          value !== undefined &&
          value !== null &&
          String(value).trim()
        ) {
          values.add(
            String(value).trim()
          );
        }
      });

      options[column.key] =
        Array.from(values).sort(
          (a, b) =>
            a.localeCompare(
              b,
              undefined,
              {
                numeric: true,
                sensitivity: "base",
              }
            )
        );
    });

    return options;
  }, [
    allProducts,
    products,
    columns,
  ]);

  /* =======================================================
     CELL FOCUS
  ======================================================= */

  const handleCellFocus = (payload) => {
    setSelectedCell(payload);
  };

  /* =======================================================
     MOVE CELL
  ======================================================= */

  const moveCell = ({
    direction,
    productId,
    field,
  }) => {
    if (onMoveCell) {
      onMoveCell({
        direction,
        productId,
        field,
      });

      return;
    }

    const currentIndex =
      products.findIndex(
        (item) =>
          Number(item?.product_id) ===
          Number(productId)
      );

    if (currentIndex === -1) {
      return;
    }

    let nextIndex = currentIndex;
    let nextField = field;

    /* UP */
    if (direction === "up") {
      nextIndex = Math.max(
        0,
        currentIndex - 1
      );
    }

    /* DOWN */
    if (direction === "down") {
      nextIndex = Math.min(
        products.length - 1,
        currentIndex + 1
      );
    }

    /* TAB */
    if (direction === "next") {
      if (field === "price") {
        nextField = "ds_price";
      } else {
        nextField = "price";

        nextIndex = Math.min(
          products.length - 1,
          currentIndex + 1
        );
      }
    }

    /* SHIFT + TAB */
    if (direction === "previous") {
      if (field === "ds_price") {
        nextField = "price";
      } else {
        nextField = "ds_price";

        nextIndex = Math.max(
          0,
          currentIndex - 1
        );
      }
    }

    const nextProduct =
      products[nextIndex];

    if (!nextProduct) {
      return;
    }

    const nextPayload = {
      productId:
        nextProduct.product_id,
      field: nextField,
    };

    setSelectedCell(nextPayload);
    onFocusCell?.(nextPayload);

    requestAnimationFrame(() => {
      const element =
        document.querySelector(
          `[data-price-cell="${nextProduct.product_id}-${nextField}"]`
        );

      if (element) {
        element.focus();
        element.select?.();
      }
    });
  };

  /* =======================================================
     ROW PADDING
  ======================================================= */

  const rowPadding =
    density === "compact"
      ? "py-1"
      : density === "spacious"
        ? "py-2"
        : "py-1";

  return (
    <div
      className="
        flex
        min-h-0
        w-full
        overflow-hidden
        border
        border-slate-300
        bg-white
      "
    >
      <div className="min-w-0 flex-1">
        <div
          onPaste={onPaste}
          className="
            relative
            h-full
            min-h-[520px]
            overflow-auto
            bg-white
            scrollbar-thin
            scrollbar-thumb-slate-300
            scrollbar-track-transparent
          "
        >
          <table
            className="
              w-full
              min-w-[1330px]
              border-collapse
              table-fixed
            "
          >
            {/* =================================================
                HEADER
            ================================================= */}

            <thead className="sticky top-0 z-30">
              <tr
                className="
                  h-9
                  border-b
                  border-slate-300
                  bg-[#f8fafc]
                  shadow-[0_1px_0_rgba(15,23,42,0.05)]
                "
              >
                {/* ROW NUMBER */}

                <th
                  className="
                    sticky
                    left-0
                    z-40
                    w-[42px]
                    border-r
                    border-slate-300
                    bg-[#f8fafc]
                    px-1
                    text-center
                  "
                >
                  <span className="text-[9px] font-bold text-slate-500">
                    #
                  </span>
                </th>

                {/* COLUMNS */}

                {columns.map((column) => {
                  if (
                    !visibleColumns[column.key]
                  ) {
                    return null;
                  }

                  return (
                    <SpreadsheetHeader
                      key={column.key}
                      column={column}
                      menuKey={column.key}
                      label={column.label}
                      width={column.width}
                      align={column.align}
                      priceColumn={
                        column.priceColumn
                      }
                      accent={column.accent}
                      openColumnMenu={
                        openColumnMenu
                      }
                      setOpenColumnMenu={
                        setOpenColumnMenu
                      }
                      filterValue={
                        columnFilters?.[
                          column.key
                        ] || ""
                      }
                      filterOptions={
                        filterOptions[
                          column.key
                        ] || []
                      }
                      onSort={
                        onColumnSort
                      }
                      onFilterChange={
                        handleFilterChange
                      }
                      onClearFilter={
                        handleClearFilter
                      }
                      currentSort={sort}
                    />
                  );
                })}
              </tr>
            </thead>

            {/* =================================================
                BODY
            ================================================= */}

            <tbody>
              {products.map(
                (product, index) => {
                  const draft =
                    drafts?.[
                      product.product_id
                    ] || {};

                  const changed =
                    Object.keys(
                      draft
                    ).length > 0;

                  return (
                    <PriceRow
                      key={
                        product.product_id
                      }
                      product={product}
                      index={index}
                      draft={draft}
                      changed={changed}
                      selectedCell={
                        selectedCell
                      }
                      visibleColumns={
                        visibleColumns
                      }
                      rowPadding={
                        rowPadding
                      }
                      onPriceChange={
                        onPriceChange
                      }
                      onSaleNameChange={
                        onSaleNameChange
                      }
                      onFillDown={
                        onFillDown
                      }
                      onFocus={
                        handleCellFocus
                      }
                      onMove={moveCell}
                    />
                  );
                }
              )}
            </tbody>
          </table>

          {products.length === 0 && (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   HEADER
========================================================= */

const SpreadsheetHeader = memo(
  function SpreadsheetHeader({
    column,
    label,
    width,
    menuKey,
    openColumnMenu,
    setOpenColumnMenu,
    priceColumn = false,
    accent,
    align = "left",
    filterValue = "",
    filterOptions = [],
    onSort,
    onFilterChange,
    onClearFilter,
    currentSort,
  }) {
    const menuOpen =
      openColumnMenu === menuKey;

    const filterText =
      Array.isArray(filterValue)
        ? filterValue.join("||")
        : String(
            filterValue || ""
          );

    const filtered =
      filterText.trim().length > 0;

    const sorted =
      currentSort?.key === menuKey;

    const active =
      menuOpen ||
      filtered ||
      sorted;

    return (
      <th
        style={{ width }}
        className={`
          relative
          border-r
          border-slate-300
          ${
            priceColumn
              ? accent === "blue"
                ? "bg-blue-50/70"
                : "bg-violet-50/70"
              : "bg-[#f8fafc]"
          }
        `}
      >
        <div
          className={`
            flex
            h-9
            items-center
            gap-1
            px-1.5
            ${
              align === "right"
                ? "justify-end"
                : align === "center"
                  ? "justify-center"
                  : "justify-between"
            }
          `}
        >
          <span
            className={`
              min-w-0
              truncate
              text-[9px]
              font-bold
              tracking-[0.04em]
              ${
                priceColumn
                  ? accent === "blue"
                    ? "text-blue-700"
                    : "text-violet-700"
                  : "text-slate-700"
              }
            `}
          >
            {label}
          </span>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();

              setOpenColumnMenu(
                menuOpen
                  ? null
                  : menuKey
              );
            }}
            className={`
              relative
              flex
              h-6
              w-6
              shrink-0
              cursor-pointer
              items-center
              justify-center
              transition
              ${
                active
                  ? "bg-blue-100 text-blue-700"
                  : "text-slate-500 hover:bg-slate-200 hover:text-slate-800"
              }
            `}
            title={`${label} filter & sort`}
            aria-label={`${label} filter & sort`}
          >
            <FilterIcon
              size={13}
              active={active}
            />

            {filtered && (
              <span
                className="
                  absolute
                  right-[3px]
                  top-[3px]
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-blue-600
                  ring-1
                  ring-white
                "
              />
            )}
          </button>
        </div>

        {menuOpen && (
          <PriceManagementColumnFilter
            column={column}
            filterValue={
              filterValue
            }
            filterOptions={
              filterOptions
            }
            currentSort={
              currentSort
            }
            onSort={onSort}
            onFilterChange={
              onFilterChange
            }
            onClearFilter={
              onClearFilter
            }
            close={() =>
              setOpenColumnMenu(
                null
              )
            }
          />
        )}
      </th>
    );
  }
);

/* =========================================================
   ROW
========================================================= */

const PriceRow = memo(
  function PriceRow({
    product,
    index,
    draft,
    changed,
    selectedCell,
    visibleColumns,
    rowPadding,
    onPriceChange,
    onSaleNameChange,
    onFillDown,
    onFocus,
    onMove,
  }) {
    const [
      editingSale,
      setEditingSale,
    ] = useState(false);

    const saleCellRef =
      useRef(null);

    const saleNames =
      Array.isArray(
        product.sale_names
      )
        ? product.sale_names
        : [];

    const saleName =
      getSaleNameText(
        saleNames[0]
      );

    const [
      saleValue,
      setSaleValue,
    ] = useState(
      saleName
    );

    const saleInputRef =
      useRef(null);

    /* =====================================================
       SALE NAME SYNC
    ===================================================== */

    useEffect(() => {
      setSaleValue(
        saleName
      );
    }, [saleName]);

    /* =====================================================
       SALE NAME FOCUS
    ===================================================== */

    useEffect(() => {
      if (!editingSale) {
        return;
      }

      requestAnimationFrame(() => {
        saleInputRef.current?.focus();
        saleInputRef.current?.select();
      });
    }, [editingSale]);

    /* =====================================================
       SALE NAME OUTSIDE CLICK

       Clicking anywhere outside the Sale Name cell
       closes edit mode.
    ===================================================== */

    useEffect(() => {
      if (!editingSale) {
        return;
      }

      const handleOutsideClick = (
        event
      ) => {
        if (
          saleCellRef.current &&
          !saleCellRef.current.contains(
            event.target
          )
        ) {
          setSaleValue(
            saleName
          );

          setEditingSale(
            false
          );
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
    }, [
      editingSale,
      saleName,
    ]);

    /* =====================================================
       SAVE SALE NAME
    ===================================================== */

    const saveSaleName = () => {
      const value =
        saleValue.trim();

      if (!value) {
        setSaleValue(
          saleName
        );

        setEditingSale(
          false
        );

        return;
      }

      /* Same value = nothing */

      if (
        value.toLowerCase() ===
        saleName
          .trim()
          .toLowerCase()
      ) {
        setEditingSale(
          false
        );

        return;
      }

      /* Duplicate protection */

      const duplicate =
        saleNames.some(
          (item) =>
            getSaleNameText(item)
              .trim()
              .toLowerCase() ===
            value.toLowerCase()
        );

      if (duplicate) {
        setSaleValue(
          saleName
        );

        setEditingSale(
          false
        );

        return;
      }

      /*
        Pass existing Sale Name record.
      */

      const existingSaleRecord =
        saleNames.length > 0
          ? saleNames[0]
          : null;

      onSaleNameChange?.(
        product,
        value,
        existingSaleRecord
      );

      setEditingSale(
        false
      );
    };

    return (
      <tr
        className={`
          group
          h-[43px]
          border-b
          border-slate-200
          transition-colors
          duration-75
          ${
            selectedCell?.productId ===
            product.product_id
              ? "bg-blue-50/40"
              : changed
                ? "bg-amber-50/20"
                : "bg-white"
          }
          hover:bg-slate-50
        `}
      >
        {/* =================================================
            ROW NUMBER
        ================================================= */}

        <td
          className={`
            sticky
            left-0
            z-10
            border-r
            border-slate-200
            bg-inherit
            px-1
            text-center
            ${rowPadding}
          `}
        >
          <span
            className={`
              text-[9px]
              font-semibold
              ${
                selectedCell?.productId ===
                product.product_id
                  ? "text-blue-600"
                  : "text-slate-500"
              }
            `}
          >
            {index + 1}
          </span>
        </td>

        {/* =================================================
            SKU
        ================================================= */}

        {visibleColumns.sku && (
          <td
            className={`
              border-r
              border-slate-200
              px-1.5
              transition
              hover:bg-slate-100
              ${rowPadding}
            `}
          >
            <span className="text-[10px] font-semibold text-slate-800">
              {product.product_id}
            </span>
          </td>
        )}

        {/* =================================================
            CATEGORY
        ================================================= */}

        {visibleColumns.category && (
          <td
            className={`
              border-r
              border-slate-200
              px-1.5
              transition
              hover:bg-slate-100
              ${rowPadding}
            `}
          >
            <span
              className="
                inline-block
                max-w-[125px]
                truncate
                text-[10px]
                font-medium
                text-slate-700
              "
              title={
                product.sub_category ||
                ""
              }
            >
              {product.sub_category ||
                "UNCATEGORIZED"}
            </span>
          </td>
        )}

        {/* =================================================
            PRODUCT
        ================================================= */}

        {visibleColumns.product && (
          <td
            className={`
              border-r
              border-slate-200
              px-1.5
              transition
              hover:bg-slate-100
              ${rowPadding}
            `}
          >
            <div className="min-w-0">
              <div
                className="
                  truncate
                  text-[11px]
                  font-semibold
                  text-slate-900
                "
                title={
                  product.product_name
                }
              >
                {product.product_name ||
                  "—"}
              </div>
            </div>
          </td>
        )}

        {/* =================================================
            SALE NAME
        ================================================= */}

        {visibleColumns.saleName && (
          <td
            ref={saleCellRef}
            className={`
              border-r
              border-slate-200
              px-1
              ${rowPadding}
            `}
          >
            {editingSale ? (
              <div
                className="
                  flex
                  h-[34px]
                  items-center
                  gap-1
                  border
                  border-blue-500
                  bg-blue-50
                  ring-2
                  ring-blue-100
                "
              >
                <input
                  ref={saleInputRef}
                  data-sale-name-edit={
                    product.product_id
                  }
                  value={saleValue}
                  onChange={(event) =>
                    setSaleValue(
                      event.target.value
                    )
                  }
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                  onMouseDown={(event) =>
                    event.stopPropagation()
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      event.preventDefault();
                      saveSaleName();
                    }

                    if (
                      event.key ===
                      "Escape"
                    ) {
                      event.preventDefault();

                      setSaleValue(
                        saleName
                      );

                      setEditingSale(
                        false
                      );
                    }
                  }}
                  className="
                    h-full
                    min-w-0
                    flex-1
                    cursor-text
                    bg-transparent
                    px-2
                    text-[11px]
                    font-semibold
                    text-slate-900
                    outline-none
                  "
                />

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    saveSaleName();
                  }}
                  className="
                    mr-1
                    flex
                    h-6
                    w-6
                    shrink-0
                    cursor-pointer
                    items-center
                    justify-center
                    bg-blue-600
                    text-[11px]
                    font-bold
                    text-white
                    transition
                    hover:bg-blue-700
                  "
                  title="Save Sale Name"
                >
                  ✓
                </button>
              </div>
            ) : saleNames.length > 0 ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();

                  setEditingSale(
                    true
                  );
                }}
                className="
                  group/sale
                  flex
                  h-[34px]
                  w-full
                  min-w-0
                  cursor-text
                  items-center
                  border
                  border-transparent
                  bg-white
                  px-2
                  text-left
                  transition-all
                  hover:border-slate-300
                  hover:bg-slate-50
                  focus:border-blue-500
                  focus:bg-blue-50/40
                  focus:outline-none
                "
                title="Click to edit Sale Name"
              >
                <span
                  className="
                    min-w-0
                    flex-1
                    truncate
                    text-[11px]
                    font-semibold
                    text-slate-800
                    group-hover/sale:text-blue-700
                  "
                  title={
                    saleName
                  }
                >
                  {saleName}
                </span>

                {saleNames.length >
                  1 && (
                    <span className="ml-1 shrink-0 text-[8px] font-bold text-slate-500">
                      +
                      {saleNames.length -
                        1}
                    </span>
                  )}

                <span
                  className="
                    ml-1
                    hidden
                    shrink-0
                    text-[10px]
                    text-slate-400
                    group-hover/sale:block
                  "
                >
                  ✎
                </span>
              </button>
            ) : (
              <button
                type="button"
                data-sale-name-edit={
                  product.product_id
                }
                onClick={(event) => {
                  event.stopPropagation();

                  setEditingSale(
                    true
                  );
                }}
                className="
                  flex
                  h-[34px]
                  w-full
                  cursor-text
                  items-center
                  border
                  border-dashed
                  border-slate-300
                  bg-white
                  px-2
                  text-left
                  text-[10px]
                  font-semibold
                  text-slate-500
                  transition
                  hover:border-blue-400
                  hover:bg-blue-50/40
                  hover:text-blue-700
                "
              >
                + Add Sale Name
              </button>
            )}
          </td>
        )}

        {/* =================================================
            SS PRICE
        ================================================= */}

        {visibleColumns.price && (
          <td
            className={`
              border-r
              border-slate-200
              bg-blue-50/20
              px-1
              ${rowPadding}
            `}
          >
            <PriceInput
              product={product}
              field="price"
              value={
                draft.new_price ??
                product.price ??
                ""
              }
              changed={
                draft.new_price !==
                undefined
              }
              selected={
                selectedCell?.productId ===
                  product.product_id &&
                selectedCell?.field ===
                  "price"
              }
              onChange={
                onPriceChange
              }
              onFocus={onFocus}
              onMove={onMove}
            />
          </td>
        )}

        {/* =================================================
            DS PRICE
        ================================================= */}

        {visibleColumns.dsPrice && (
          <td
            className={`
              border-r
              border-slate-200
              bg-violet-50/20
              px-1
              ${rowPadding}
            `}
          >
            <PriceInput
              product={product}
              field="ds_price"
              value={
                draft.new_ds_price ??
                product.ds_price ??
                ""
              }
              changed={
                draft.new_ds_price !==
                undefined
              }
              selected={
                selectedCell?.productId ===
                  product.product_id &&
                selectedCell?.field ===
                  "ds_price"
              }
              onChange={
                onPriceChange
              }
              onFocus={onFocus}
              onMove={onMove}
            />
          </td>
        )}

        {/* =================================================
            GUARANTEE
        ================================================= */}

        {visibleColumns.guarantee && (
          <td
            className={`
              border-r
              border-slate-200
              px-1.5
              text-center
              transition
              hover:bg-slate-100
              ${rowPadding}
            `}
          >
            <span
              className="
                text-[10px]
                font-semibold
                text-slate-800
              "
            >
              {getGuaranteeValue(
                product
              ) || "—"}
            </span>
          </td>
        )}

        {/* =================================================
            STATUS
        ================================================= */}

        {visibleColumns.status && (
          <td
            className={`
              border-r
              border-slate-200
              px-1.5
              text-center
              transition
              hover:bg-slate-100
              ${rowPadding}
            `}
          >
            {changed ? (
              <StatusBadge
                type="changed"
                text="CHANGED"
              />
            ) : (
              <StatusBadge
                type="active"
                text="ACTIVE"
              />
            )}
          </td>
        )}

        {/* =================================================
            LAST UPDATED
        ================================================= */}

        {visibleColumns.updated && (
          <td
            className={`
              border-r
              border-slate-200
              px-1.5
              transition
              hover:bg-slate-100
              ${rowPadding}
            `}
          >
            <div className="flex flex-col">
              <span className="text-[9px] font-medium text-slate-700">
                {formatUpdatedDate(
                  product.updated_at ||
                    product.last_updated
                )}
              </span>

              <span className="text-[8px] text-slate-400">
                {product.updated_by ||
                  "System"}
              </span>
            </div>
          </td>
        )}
      </tr>
    );
  }
);

/* =========================================================
   PRICE INPUT
========================================================= */

function PriceInput({
  product,
  field,
  value,
  changed,
  selected,
  onChange,
  onFocus,
  onMove,
}) {
  const inputRef =
    useRef(null);

  const [
    localValue,
    setLocalValue,
  ] = useState(
    value === null ||
      value === undefined
      ? ""
      : String(value)
  );

  const lastExternalValue =
    useRef(
      value === null ||
        value === undefined
        ? ""
        : String(value)
    );

  /* =======================================================
     SYNC EXTERNAL VALUE
  ======================================================= */

  useEffect(() => {
    const next =
      value === null ||
      value === undefined
        ? ""
        : String(value);

    if (
      next !==
      lastExternalValue.current
    ) {
      lastExternalValue.current =
        next;

      setLocalValue(
        next
      );
    }
  }, [value]);

  /* =======================================================
     VALUE CHANGE
  ======================================================= */

  const handleChange = (
    event
  ) => {
    const nextValue =
      event.target.value;

    if (
      nextValue !== "" &&
      !/^\d*\.?\d*$/.test(
        nextValue
      )
    ) {
      return;
    }

    setLocalValue(
      nextValue
    );

    lastExternalValue.current =
      nextValue;

    if (nextValue === "") {
      onChange?.(
        product.product_id,
        field,
        ""
      );

      return;
    }

    const numericValue =
      Number(
        nextValue
      );

    if (
      Number.isFinite(
        numericValue
      )
    ) {
      onChange?.(
        product.product_id,
        field,
        numericValue
      );
    }
  };

  /* =======================================================
     RESTORE ORIGINAL
  ======================================================= */

  const restoreOriginal =
    () => {
      const original =
        product[field] ?? "";

      const next =
        original === null ||
        original === undefined
          ? ""
          : String(
              original
            );

      setLocalValue(
        next
      );

      lastExternalValue.current =
        next;

      onChange?.(
        product.product_id,
        field,
        original
      );

      requestAnimationFrame(
        () => {
          inputRef.current?.focus();
          inputRef.current?.select();
        }
      );
    };

  /* =======================================================
     KEYBOARD
  ======================================================= */

  const handleKeyDown = (
    event
  ) => {
    /* ENTER */

    if (
      event.key ===
      "Enter"
    ) {
      event.preventDefault();

      onMove?.({
        direction:
          event.shiftKey
            ? "up"
            : "down",
        productId:
          product.product_id,
        field,
      });

      return;
    }

    /* TAB */

    if (
      event.key ===
      "Tab"
    ) {
      event.preventDefault();

      onMove?.({
        direction:
          event.shiftKey
            ? "previous"
            : "next",
        productId:
          product.product_id,
        field,
      });

      return;
    }

    /* DOWN */

    if (
      event.key ===
      "ArrowDown"
    ) {
      event.preventDefault();

      onMove?.({
        direction: "down",
        productId:
          product.product_id,
        field,
      });

      return;
    }

    /* UP */

    if (
      event.key ===
      "ArrowUp"
    ) {
      event.preventDefault();

      onMove?.({
        direction: "up",
        productId:
          product.product_id,
        field,
      });

      return;
    }

    /* ESCAPE */

    if (
      event.key ===
      "Escape"
    ) {
      event.preventDefault();

      restoreOriginal();
    }
  };

  return (
    <div
      className={`
        relative
        h-[34px]
        border
        transition-all
        duration-75
        ${
          selected
            ? field === "price"
              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
              : "border-violet-500 bg-violet-50 ring-2 ring-violet-100"
            : changed
              ? "border-amber-300 bg-amber-50/70"
              : "border-transparent bg-white hover:border-slate-300"
        }
      `}
    >
      <input
        ref={inputRef}
        data-price-cell={`${product.product_id}-${field}`}
        value={localValue}
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        onMouseDown={(
          event
        ) => {
          event.stopPropagation();

          onFocus?.({
            productId:
              product.product_id,
            field,
          });
        }}
        onClick={(
          event
        ) => {
          event.stopPropagation();
        }}
        onFocus={() => {
          onFocus?.({
            productId:
              product.product_id,
            field,
          });
        }}
        onChange={
          handleChange
        }
        onKeyDown={
          handleKeyDown
        }
        className={`
          h-full
          w-full
          cursor-text
          bg-transparent
          px-2
          text-right
          text-[11px]
          font-bold
          outline-none
          ${
            field === "price"
              ? "text-blue-900"
              : "text-violet-900"
          }
        `}
      />

      {changed && (
        <span
          className="
            pointer-events-none
            absolute
            right-1
            top-1
            h-1.5
            w-1.5
            rounded-full
            bg-amber-500
          "
        />
      )}
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({
  type,
  text,
}) {
  const changed =
    type === "changed";

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1
        px-1.5
        py-1
        text-[8px]
        font-bold
        ${
          changed
            ? "border border-amber-300 bg-amber-50 text-amber-800"
            : "border border-emerald-300 bg-emerald-50 text-emerald-700"
        }
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${
            changed
              ? "bg-amber-500"
              : "bg-emerald-500"
          }
        `}
      />

      {text}
    </span>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState() {
  return (
    <div
      className="
        flex
        min-h-[500px]
        items-center
        justify-center
      "
    >
      <div className="text-center">
        <div
          className="
            mx-auto
            mb-3
            flex
            h-10
            w-10
            items-center
            justify-center
            border
            border-slate-300
            bg-slate-50
            text-sm
            text-slate-500
          "
        >
          ⌕
        </div>

        <p className="text-[11px] font-bold text-slate-800">
          No products found
        </p>

        <p className="mt-1 text-[9px] text-slate-500">
          Try another search or filter.
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getSaleNameText(item) {
  if (
    item === null ||
    item === undefined
  ) {
    return "";
  }

  if (
    typeof item ===
    "string"
  ) {
    return item;
  }

  if (
    typeof item ===
    "number"
  ) {
    return String(
      item
    );
  }

  if (
    typeof item ===
    "object"
  ) {
    return String(
      item.sale_name ??
        item.name ??
        item.title ??
        ""
    );
  }

  return String(item);
}

/* =========================================================
   GUARANTEE VALUE
========================================================= */

function getGuaranteeValue(
  product
) {
  return (
    product?.guarantee ??
    product?.guarantee_period ??
    product?.warranty ??
    ""
  );
}

/* =========================================================
   COLUMN VALUE
========================================================= */

function getColumnValue(
  product,
  key
) {
  switch (key) {
    case "sku":
      return product.product_id;

    case "category":
      return (
        product.sub_category ||
        ""
      );

    case "product":
      return (
        product.product_name ||
        ""
      );

    case "saleName":
      return Array.isArray(
        product.sale_names
      )
        ? product.sale_names
        : [];

    case "price":
      return (
        product.price ??
        ""
      );

    case "dsPrice":
      return (
        product.ds_price ??
        ""
      );

    case "guarantee":
      return getGuaranteeValue(
        product
      );

    case "status":
      return (
        product.status ||
        ""
      );

    case "updated":
      return (
        product.updated_at ||
        product.last_updated ||
        ""
      );

    default:
      return "";
  }
}

/* =========================================================
   DATE
========================================================= */

function formatUpdatedDate(
  value
) {
  if (!value) {
    return "Not available";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}