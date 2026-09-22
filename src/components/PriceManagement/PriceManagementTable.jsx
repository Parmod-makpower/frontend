import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import PriceManagementColumnFilter from "./PriceManagementColumnFilter";

const PRICE_FIELDS = ["price", "ds_price", "dlr_price"];

const COLUMN_DEFS = [
  { key: "sku", label: "ID", width: 62, align: "center" },
  { key: "category", label: "CATEGORY", width: 145, align: "center" },
  { key: "product", label: "PRODUCT", width: 160, align: "center", autoWidth: true },
  { key: "saleName", label: "SALE NAME", width: 190, align: "center", autoWidth: true },
  {
    key: "price",
    label: "SS PRICE",
    width: 100,
    align: "center",
    priceColumn: true,
  },
  {
    key: "dsPrice",
    label: "DS PRICE",
    width: 100,
    align: "center",
    priceColumn: true,
  },
  {
    key: "dlrPrice",
    label: "DLR PRICE",
    width: 100,
    align: "center",
    priceColumn: true,
  },
  {
    key: "guarantee",
    label: "GUARANTEE",
    width: 115,
    align: "center",
  },
  {
    key: "carton",
    label: "CTN",
    width: 90,
    align: "center",
  },
  {
    key: "mah",
    label: "MAH",
    width: 85,
    align: "center",
  },
  {
    key: "status",
    label: "STATUS",
    width: 100,
    align: "center",
  },
];

const ROW_HEIGHT = {
  compact: 34,
  comfortable: 42,
  spacious: 48,
};

const HEADER_HEIGHT = 38;
const INDEX_WIDTH = 42;
const SELECT_WIDTH = 42;

const getProductId = (product) =>
  Number(product?.product_id ?? product?.id ?? 0);

const getSaleNameText = (value) => {
  if (value === null || value === undefined) return "";

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "object") {
    return String(
      value?.sale_name ??
        value?.name ??
        value?.title ??
        ""
    ).trim();
  }

  return String(value).trim();
};

const getSaleNames = (product) =>
  Array.isArray(product?.sale_names)
    ? product.sale_names
        .map(getSaleNameText)
        .filter(Boolean)
    : [];

const getGuaranteeValue = (product) =>
  String(
    product?.guarantee ??
      ""
  ).trim();

const getCartonValue = (product) =>
  String(
    product?.cartoon_size ??
      ""
  ).trim();

const getMahValue = (product) =>
  String(product?.mah ?? product?.mAh ?? "").trim();

const getColumnValue = (product, key) => {
  switch (key) {
    case "sku":
      return product?.product_id ?? product?.id ?? "";
    case "category":
      return product?.sub_category || "UNCATEGORIZED";
    case "product":
      return product?.product_name || "";
    case "saleName":
      return getSaleNames(product);
    case "price":
      return product?.price ?? "";
    case "dsPrice":
      return product?.ds_price ?? "";
    case "dlrPrice":
      return product?.dlr_price ?? "";
    case "guarantee":
      return getGuaranteeValue(product);
    case "carton":
      return getCartonValue(product);
    case "mah":
      return getMahValue(product);
    case "status":
      return product?.is_active === false ? "Inactive" : "Active";
    default:
      return "";
  }
};

const categoryTone = (category) => {
  const key = String(category || "").toUpperCase();

  if (key.includes("AUDIO"))
    return "bg-violet-50 text-violet-700 border-violet-100";
  if (key.includes("TWS"))
    return "bg-amber-50 text-amber-700 border-amber-100";
  if (key.includes("NECK"))
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (key.includes("SPEAKER"))
    return "bg-rose-50 text-rose-700 border-rose-100";
  if (key.includes("CABLE"))
    return "bg-sky-50 text-sky-700 border-sky-100";
  if (key.includes("BLUETOOTH"))
    return "bg-blue-50 text-blue-700 border-blue-100";
  if (key.includes("CAR"))
    return "bg-orange-50 text-orange-700 border-orange-100";

  return "bg-slate-50 text-slate-600 border-slate-400";
};

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
  onColumnSort,
  onColumnFilter,
  onColumnFilterChange,
  onColumnClearFilter,
  onClearColumnFilter,
  onHideColumn,
  onFreezeColumn,
  columnFilters = {},
  frozenColumns = [],
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  allPageSelected = false,
  sort = null,
  visibleColumns: externalVisibleColumns = {},
  density = "compact",
  isLoading = false,
  isFetching = false,
}) {
  const [selectedCell, setSelectedCell] = useState(null);
  const [openColumnMenu, setOpenColumnMenu] = useState(null);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const [columnWidths, setColumnWidths] = useState(() =>
    Object.fromEntries(
      COLUMN_DEFS.map((column) => [
        column.key,
        column.width,
      ])
    )
  );

  const scrollRef = useRef(null);
  const filterButtonRefs = useRef({});

  const rowHeight =
    ROW_HEIGHT[density] || ROW_HEIGHT.compact;

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    const updateWidth = () => {
      setContainerWidth(node.clientWidth);
    };

    updateWidth();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateWidth);
      observer.observe(node);

      return () => observer.disconnect();
    }

    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  const updateFilterPosition = useCallback(() => {
    if (!openColumnMenu) return;

    const button =
      filterButtonRefs.current[openColumnMenu];

    if (!button) return;

    const rect = button.getBoundingClientRect();
    const width = 248;
    const gap = 4;
    const viewportPadding = 8;

    const left = Math.max(
      viewportPadding,
      Math.min(
        rect.left,
        window.innerWidth -
          width -
          viewportPadding
      )
    );

    setFilterAnchor({
      top: rect.bottom + gap,
      left,
    });
  }, [openColumnMenu]);

  useEffect(() => {
    if (!openColumnMenu) {
      setFilterAnchor(null);
      return;
    }

    updateFilterPosition();

    const handlePositionUpdate = () => {
      updateFilterPosition();
    };

    window.addEventListener(
      "resize",
      handlePositionUpdate
    );

    const node = scrollRef.current;

    node?.addEventListener(
      "scroll",
      handlePositionUpdate,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "resize",
        handlePositionUpdate
      );

      node?.removeEventListener(
        "scroll",
        handlePositionUpdate
      );
    };
  }, [
    openColumnMenu,
    updateFilterPosition,
  ]);

  const closeColumnMenu = useCallback(() => {
    setOpenColumnMenu(null);
    setFilterAnchor(null);
  }, []);

  const toggleColumnMenu = useCallback(
    (columnKey, button) => {
      if (openColumnMenu === columnKey) {
        closeColumnMenu();
        return;
      }

      filterButtonRefs.current[columnKey] = button;
      setOpenColumnMenu(columnKey);

      requestAnimationFrame(() => {
        const rect = button.getBoundingClientRect();
        const width = 248;
        const padding = 8;

        const left = Math.max(
          padding,
          Math.min(
            rect.left,
            window.innerWidth -
              width -
              padding
          )
        );

        setFilterAnchor({
          top: rect.bottom + 4,
          left,
        });
      });
    },
    [openColumnMenu, closeColumnMenu]
  );

  const [virtualWindow, setVirtualWindow] =
    useState({
      start: 0,
      end: 30,
    });

  const updateVirtualWindow = useCallback(
    (scrollTop) => {
      const viewportHeight = 500;
      const overscan = 8;

      const start = Math.max(
        0,
        Math.floor(scrollTop / rowHeight) -
          overscan
      );

      const end = Math.min(
        products.length,
        Math.ceil(
          (scrollTop + viewportHeight) /
            rowHeight
        ) + overscan
      );

      setVirtualWindow((current) => {
        if (
          current.start === start &&
          current.end === end
        ) {
          return current;
        }

        return { start, end };
      });
    },
    [products.length, rowHeight]
  );

  const handleTableScroll = useCallback(
    (event) => {
      updateVirtualWindow(
        event.currentTarget.scrollTop
      );
    },
    [updateVirtualWindow]
  );

  useEffect(() => {
    const node = scrollRef.current;

    if (node) {
      updateVirtualWindow(node.scrollTop);
    }
  }, [
    products.length,
    rowHeight,
    updateVirtualWindow,
  ]);

  const visibleProducts = useMemo(
    () =>
      products.slice(
        virtualWindow.start,
        virtualWindow.end
      ),
    [
      products,
      virtualWindow.start,
      virtualWindow.end,
    ]
  );

  const topSpacerHeight =
    virtualWindow.start * rowHeight;

  const bottomSpacerHeight = Math.max(
    0,
    (products.length -
      virtualWindow.end) *
      rowHeight
  );

  const handleFilterChange =
    onColumnFilterChange || onColumnFilter;

  const handleClearFilter =
    onColumnClearFilter ||
    onClearColumnFilter;

  const visibleColumns = useMemo(() => {
    if (
      !externalVisibleColumns ||
      Object.keys(externalVisibleColumns).length === 0
    ) {
      return Object.fromEntries(
        COLUMN_DEFS.map((column) => [
          column.key,
          true,
        ])
      );
    }

    return Object.fromEntries(
      COLUMN_DEFS.map((column) => [
        column.key,
        externalVisibleColumns[column.key] !== false,
      ])
    );
  }, [externalVisibleColumns]);

  const visibleDefs = useMemo(
    () =>
      COLUMN_DEFS.filter(
        (column) =>
          visibleColumns[column.key]
      ),
    [visibleColumns]
  );

  const frozenSet = useMemo(
    () => new Set(frozenColumns || []),
    [frozenColumns]
  );

  const selectedSet = useMemo(
    () => new Set(selectedRows || []),
    [selectedRows]
  );

  const fixedTableWidth = useMemo(
    () =>
      INDEX_WIDTH +
      SELECT_WIDTH +
      visibleDefs.reduce(
        (total, column) =>
          total +
          (column.autoWidth
            ? 0
            : columnWidths[column.key] ??
              column.width),
        0
      ),
    [visibleDefs, columnWidths]
  );

  const autoWidthColumns = useMemo(
    () =>
      visibleDefs.filter(
        (column) => column.autoWidth
      ),
    [visibleDefs]
  );

  const minimumAutoWidth =
    autoWidthColumns.reduce(
      (total, column) =>
        total +
        (columnWidths[column.key] ??
          column.width),
      0
    );

  const minimumTableWidth =
    fixedTableWidth + minimumAutoWidth;

  const tableWidth = Math.max(
    containerWidth || 0,
    minimumTableWidth
  );

  const extraWidth = Math.max(
    0,
    tableWidth - minimumTableWidth
  );

  const autoColumnWidths = useMemo(() => {
    const result = {};

    if (!autoWidthColumns.length) {
      return result;
    }

    const extraPerColumn =
      extraWidth / autoWidthColumns.length;

    autoWidthColumns.forEach((column) => {
      result[column.key] =
        (columnWidths[column.key] ??
          column.width) +
        extraPerColumn;
    });

    return result;
  }, [
    autoWidthColumns,
    columnWidths,
    extraWidth,
  ]);

  const getColumnWidth = useCallback(
    (column) =>
      column.autoWidth
        ? autoColumnWidths[column.key] ??
          column.width
        : columnWidths[column.key] ??
          column.width,
    [autoColumnWidths, columnWidths]
  );

  const frozenOffsets = useMemo(() => {
    const offsets = {};
    let left = INDEX_WIDTH + SELECT_WIDTH;

    visibleDefs.forEach((column) => {
      if (frozenSet.has(column.key)) {
        offsets[column.key] = left;
        left += getColumnWidth(column);
      }
    });

    return offsets;
  }, [
    visibleDefs,
    frozenSet,
    getColumnWidth,
  ]);

  const filterOptions = useMemo(() => {
    const source =
      allProducts.length > 0
        ? allProducts
        : products;

    const result = {};

    COLUMN_DEFS.forEach((column) => {
      const map = new Map();

      source.forEach((product) => {
        const raw = getColumnValue(
          product,
          column.key
        );

        const values = Array.isArray(raw)
          ? raw
          : [raw];

        values.forEach((value) => {
          const text = String(
            value ?? ""
          ).trim();

          if (!text) return;

          map.set(
            text,
            (map.get(text) || 0) + 1
          );
        });
      });

      result[column.key] = Array.from(
        map.entries()
      )
        .sort(([a], [b]) =>
          a.localeCompare(
            b,
            undefined,
            {
              numeric: true,
              sensitivity: "base",
            }
          )
        )
        .slice(0, 500)
        .map(([value, count]) => ({
          value,
          label: value,
          count,
        }));
    });

    return result;
  }, [allProducts, products]);

  const handleCellFocus = useCallback(
    (payload) => {
      setSelectedCell(payload);
      onFocusCell?.(payload);
    },
    [onFocusCell]
  );

  const focusPriceCell = useCallback(
    (productId, field) => {
      const element =
        document.querySelector(
          `[data-price-cell="${productId}-${field}"]`
        );

      if (element) {
        element.focus();
        element.select?.();
        return;
      }

      requestAnimationFrame(() => {
        const retry =
          document.querySelector(
            `[data-price-cell="${productId}-${field}"]`
          );

        retry?.focus();
        retry?.select?.();
      });
    },
    []
  );

  const moveCell = useCallback(
    ({ direction, productId, field }) => {
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
            getProductId(item) ===
            Number(productId)
        );

      if (currentIndex < 0) return;

      let nextIndex = currentIndex;
      let nextField = field;

      if (direction === "up") {
        nextIndex = Math.max(
          0,
          currentIndex - 1
        );
      }

      if (direction === "down") {
        nextIndex = Math.min(
          products.length - 1,
          currentIndex + 1
        );
      }

      if (direction === "next") {
        if (field === "price") {
          nextField = "ds_price";
        } else if (field === "ds_price") {
          nextField = "dlr_price";
        } else {
          nextField = "price";
          nextIndex = Math.min(
            products.length - 1,
            currentIndex + 1
          );
        }
      }

      if (direction === "previous") {
        if (field === "dlr_price") {
          nextField = "ds_price";
        } else if (field === "ds_price") {
          nextField = "price";
        } else {
          nextField = "dlr_price";
          nextIndex = Math.max(
            0,
            currentIndex - 1
          );
        }
      }

      const nextProduct =
        products[nextIndex];

      if (!nextProduct) return;

      const payload = {
        productId:
          getProductId(nextProduct),
        field: nextField,
      };

      setSelectedCell(payload);
      onFocusCell?.(payload);

      if (
        nextIndex < virtualWindow.start ||
        nextIndex >= virtualWindow.end
      ) {
        const container =
          scrollRef.current;

        if (container) {
          container.scrollTop = Math.max(
            0,
            nextIndex * rowHeight -
              rowHeight * 4
          );
        }
      }

      requestAnimationFrame(() => {
        focusPriceCell(
          payload.productId,
          payload.field
        );
      });
    },
    [
      onMoveCell,
      products,
      onFocusCell,
      virtualWindow.start,
      virtualWindow.end,
      rowHeight,
      focusPriceCell,
    ]
  );

  const resizeColumn = useCallback(
    (key, width) => {
      setColumnWidths((current) => ({
        ...current,
        [key]: Math.max(
          68,
          Math.min(420, width)
        ),
      }));
    },
    []
  );

  const autoFitColumn = useCallback(
    (column) => {
      const source =
        allProducts.length > 0
          ? allProducts
          : products;

      const canvas =
        document.createElement("canvas");
      const context =
        canvas.getContext("2d");

      if (!context) return;

      context.font = "600 13px Arial";

      let width =
        context.measureText(
          column.label
        ).width + 42;

      const sample =
        source.length > 500
          ? source.slice(0, 500)
          : source;

      sample.forEach((product) => {
        const raw = getColumnValue(
          product,
          column.key
        );

        const values = Array.isArray(raw)
          ? raw
          : [raw];

        values.forEach((value) => {
          width = Math.max(
            width,
            context.measureText(
              String(value ?? "")
            ).width + 36
          );
        });
      });

      setColumnWidths((current) => ({
        ...current,
        [column.key]: Math.max(
          72,
          Math.min(360, Math.ceil(width))
        ),
      }));
    },
    [allProducts, products]
  );

  const handlePaste = useCallback(
    (event) => {
      if (!selectedCell) return;

      const text =
        event.clipboardData?.getData(
          "text/plain"
        );

      if (!text) return;

      const rows = text
        .replace(/\r/g, "")
        .split("\n")
        .map((row) => row.split("\t"))
        .filter((row) =>
          row.some(
            (value) => value !== ""
          )
        );

      if (!rows.length) return;

      event.preventDefault();

      if (onPaste) {
        onPaste({
          productId:
            selectedCell.productId,
          field: selectedCell.field,
          rows,
        });
        return;
      }

      const startFieldIndex =
        PRICE_FIELDS.indexOf(
          selectedCell.field
        );

      if (startFieldIndex < 0) return;

      const selectedIndex =
        products.findIndex(
          (product) =>
            getProductId(product) ===
            Number(
              selectedCell.productId
            )
        );

      if (selectedIndex < 0) return;

      rows.forEach(
        (row, rowOffset) => {
          const product =
            products[
              selectedIndex + rowOffset
            ];

          if (!product) return;

          row.forEach(
            (value, columnOffset) => {
              const field =
                PRICE_FIELDS[
                  startFieldIndex +
                    columnOffset
                ];

              if (!field || value === "") {
                return;
              }

              const number = Number(value);

              if (Number.isFinite(number)) {
                onPriceChange?.(
                  getProductId(product),
                  field,
                  number
                );
              }
            }
          );
        }
      );
    },
    [
      selectedCell,
      onPaste,
      products,
      onPriceChange,
    ]
  );

  const rowHeightClass =
    density === "spacious"
      ? "h-[48px]"
      : density === "comfortable"
        ? "h-[42px]"
        : "h-[34px]";

  const activeFilterColumn =
    openColumnMenu
      ? COLUMN_DEFS.find(
          (column) =>
            column.key === openColumnMenu
        )
      : null;

  return (
    <div className="relative z-0 flex h-full min-h-0 w-full flex-col overflow-hidden border border-slate-500 bg-white">
      <div
        ref={scrollRef}
        onScroll={handleTableScroll}
        onPaste={handlePaste}
        onClick={closeColumnMenu}
        className="
          relative
          z-0
          h-[500px]
          min-h-[470px]
          max-h-[470px]
          w-full
          min-w-0
          overflow-auto
          bg-white
          [scrollbar-width:thin]
          [scrollbar-color:#cbd5e1_transparent]
          [&::-webkit-scrollbar]:h-[7px]
          [&::-webkit-scrollbar]:w-[7px]
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-slate-300
          hover:[&::-webkit-scrollbar-thumb]:bg-slate-400
        "
      >
        <table
          className="table-fixed border-collapse"
          style={{
            width: `${tableWidth}px`,
            minWidth: `${minimumTableWidth}px`,
          }}
        >
          <colgroup>
            <col style={{ width: INDEX_WIDTH }} />
            <col style={{ width: SELECT_WIDTH }} />

            {visibleDefs.map((column) => (
              <col
                key={column.key}
                style={{
                  width: getColumnWidth(column),
                }}
              />
            ))}
          </colgroup>

          <thead className="sticky top-0 z-10">
            <tr
              style={{
                height: HEADER_HEIGHT,
              }}
              className="
                border-b
                border-slate-500
                bg-slate-50
              "
            >
              <th
                className="
                  sticky
                  left-0
                  z-20
                  border-r
                  border-slate-500
                  bg-slate-50
                  p-0
                  text-center
                  text-[11px]
                  font-bold
                  text-slate-500
                "
              >
                #
              </th>

              <th
                className="
                  sticky
                  left-[42px]
                  z-20
                  border-r
                  border-slate-500
                  bg-slate-50
                  p-0
                  text-center
                "
              >
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={(event) =>
                    onSelectAll?.(
                      event.target.checked
                    )
                  }
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                  className="
                    h-4
                    w-4
                    cursor-pointer
                    accent-blue-600
                  "
                />
              </th>

              {visibleDefs.map((column) => (
                <SpreadsheetHeader
                  key={column.key}
                  column={column}
                  width={getColumnWidth(column)}
                  menuKey={column.key}
                  openColumnMenu={
                    openColumnMenu
                  }
                  setOpenColumnMenu={
                    setOpenColumnMenu
                  }
                  toggleColumnMenu={
                    toggleColumnMenu
                  }
                  filterButtonRefs={
                    filterButtonRefs
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
                  onSort={onColumnSort}
                  onFilterChange={
                    handleFilterChange
                  }
                  onClearFilter={
                    handleClearFilter
                  }
                  onHideColumn={
                    onHideColumn
                  }
                  onFreezeColumn={
                    onFreezeColumn
                  }
                  isFrozen={frozenSet.has(
                    column.key
                  )}
                  currentSort={sort}
                  onResize={resizeColumn}
                  onAutoFit={autoFitColumn}
                  frozenOffset={
                    frozenOffsets[
                      column.key
                    ]
                  }
                  frozen={frozenSet.has(
                    column.key
                  )}
                />
              ))}
            </tr>
          </thead>

          <tbody>
            {topSpacerHeight > 0 && (
              <tr
                aria-hidden="true"
                style={{
                  height: topSpacerHeight,
                }}
              >
                <td
                  colSpan={
                    visibleDefs.length + 2
                  }
                />
              </tr>
            )}

            {visibleProducts.map(
              (product, localIndex) => {
                const index =
                  virtualWindow.start +
                  localIndex;

                const id =
                  getProductId(product);

                const draft =
                  drafts[id] || {};

                const changed =
                  Object.keys(draft).length >
                  0;

                return (
                  <PriceRow
                    key={id}
                    product={product}
                    index={index}
                    draft={draft}
                    changed={changed}
                    rowHeight={
                      rowHeightClass
                    }
                    visibleColumns={
                      visibleColumns
                    }
                    selectedPriceCell={
                      selectedCell
                    }
                    selected={selectedSet.has(
                      id
                    )}
                    frozenColumns={
                      frozenSet
                    }
                    frozenOffsets={
                      frozenOffsets
                    }
                    onSelect={onSelectRow}
                    onPriceChange={
                      onPriceChange
                    }
                    onSaleNameChange={
                      onSaleNameChange
                    }
                    onFillDown={onFillDown}
                    onFocus={
                      handleCellFocus
                    }
                    onMove={moveCell}
                  />
                );
              }
            )}

            {bottomSpacerHeight > 0 && (
              <tr
                aria-hidden="true"
                style={{
                  height:
                    bottomSpacerHeight,
                }}
              >
                <td
                  colSpan={
                    visibleDefs.length + 2
                  }
                />
              </tr>
            )}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="flex min-h-[360px] items-center justify-center">
            <div className="text-center">
              <div
                className="
                  mx-auto
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-slate-400
                  bg-slate-50
                  text-slate-400
                "
              >
                <SearchIcon />
              </div>

              <div className="mt-3 text-[12px] font-semibold text-black">
                No products found
              </div>

              <div className="mt-1 text-[12px] text-slate-400">
                Try another search or filter.
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              top-0
              z-[100]
              h-0.5
              overflow-hidden
              bg-blue-50
            "
          >
            <div
              className="
                h-full
                w-1/3
                animate-[pmSlide_1s_ease-in-out_infinite]
                bg-blue-500
              "
            />
          </div>
        )}

        {isFetching && !isLoading && (
          <div
            className="
              pointer-events-none
              fixed
              bottom-4
              right-4
              z-[100]
              rounded-full
              border
              border-slate-400
              bg-white
              px-3
              py-1.5
              text-[11px]
              font-medium
              text-slate-500
              shadow-lg
            "
          >
            Refreshing…
          </div>
        )}
      </div>

      {openColumnMenu &&
        filterAnchor &&
        activeFilterColumn &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed z-[100000]"
            style={{
              top: filterAnchor.top,
              left: filterAnchor.left,
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <PriceManagementColumnFilter
              column={activeFilterColumn}
              filterValue={
                columnFilters?.[
                  activeFilterColumn.key
                ] || ""
              }
              filterOptions={
                filterOptions[
                  activeFilterColumn.key
                ] || []
              }
              currentSort={sort}
              onSort={onColumnSort}
              onFilterChange={
                handleFilterChange
              }
              onClearFilter={
                handleClearFilter
              }
              onHideColumn={
                onHideColumn
              }
              onFreezeColumn={
                onFreezeColumn
              }
              isFrozen={frozenSet.has(
                activeFilterColumn.key
              )}
              close={closeColumnMenu}
            />
          </div>,
          document.body
        )}

      <style>{`
        @keyframes pmSlide {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(420%);
          }
        }
      `}</style>
    </div>
  );
}

const SpreadsheetHeader = memo(
  function SpreadsheetHeader({
    column,
    width,
    menuKey,
    openColumnMenu,
    toggleColumnMenu,
    filterButtonRefs,
    filterValue,
    filterOptions,
    onSort,
    onFilterChange,
    onClearFilter,
    onHideColumn,
    onFreezeColumn,
    isFrozen,
    currentSort,
    onResize,
    onAutoFit,
    frozen,
    frozenOffset,
  }) {
    const menuOpen =
      openColumnMenu === menuKey;

    const active =
      menuOpen ||
      Boolean(
        String(filterValue || "").trim()
      ) ||
      currentSort?.key === column.key;

    const startResize = useCallback(
      (event) => {
        event.preventDefault();
        event.stopPropagation();

        const startX = event.clientX;
        const startWidth = width;

        const move = (moveEvent) => {
          onResize?.(
            column.key,
            startWidth +
              moveEvent.clientX -
              startX
          );
        };

        const stop = () => {
          document.removeEventListener(
            "mousemove",
            move
          );
          document.removeEventListener(
            "mouseup",
            stop
          );
        };

        document.addEventListener(
          "mousemove",
          move
        );

        document.addEventListener(
          "mouseup",
          stop
        );
      },
      [column.key, width, onResize]
    );

    return (
      <th
        style={{
          width,
          minWidth: width,
          maxWidth: width,
          position: frozen
            ? "sticky"
            : undefined,
          left: frozen
            ? frozenOffset
            : undefined,
          zIndex: frozen ? 20 : 12,
          background: "#f8fafc",
        }}
        className="
          relative
          border-r
          border-slate-500
          bg-slate-50
          p-0
          text-center
        "
      >
        <div
          className="
            flex
            h-[38px]
            items-center
            justify-center
            gap-1
            px-2
          "
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <span
            className={`
              truncate
              text-[11px]
              font-bold
              tracking-wide
              ${
                active
                  ? "text-blue-700"
                  : "text-black"
              }
            `}
          >
            {column.label}
          </span>

          <button
            ref={(element) => {
              if (element) {
                filterButtonRefs.current[
                  menuKey
                ] = element;
              }
            }}
            type="button"
            onClick={(event) => {
              event.stopPropagation();

              toggleColumnMenu(
                menuKey,
                event.currentTarget
              );
            }}
            className={`
              flex
              h-6
              w-6
              shrink-0
              items-center
              justify-center
              rounded-md
              transition
              hover:bg-slate-200
              ${
                active
                  ? "text-blue-600"
                  : "text-slate-400"
              }
            `}
            title={`Filter ${column.label}`}
          >
            <FilterIcon />
          </button>
        </div>

        <div
          onMouseDown={startResize}
          onDoubleClick={() =>
            onAutoFit?.(column)
          }
          className="
            absolute
            right-0
            top-0
            z-30
            h-full
            w-1
            cursor-col-resize
            hover:bg-blue-300
          "
          title="Drag to resize / double-click to auto-fit"
        />
      </th>
    );
  }
);

const PriceRow = memo(
  function PriceRow({
    product,
    index,
    draft,
    changed,
    rowHeight,
    visibleColumns,
    selectedPriceCell,
    selected,
    frozenColumns,
    frozenOffsets,
    onSelect,
    onPriceChange,
    onSaleNameChange,
    onFillDown,
    onFocus,
    onMove,
  }) {
    const id = getProductId(product);

    const saleNames =
      getSaleNames(product);

    const saleName =
      saleNames[0] || "";

    const selectedPriceId =
      selectedPriceCell?.productId;

    const selectedPriceField =
      selectedPriceCell?.field;

    const [editingSale, setEditingSale] =
      useState(false);

    const [saleValue, setSaleValue] =
      useState(saleName);

    const saleInputRef =
      useRef(null);

    useEffect(() => {
      setSaleValue(saleName);
    }, [saleName]);

    useEffect(() => {
      if (!editingSale) return;

      requestAnimationFrame(() => {
        saleInputRef.current?.focus();
        saleInputRef.current?.select();
      });
    }, [editingSale]);

    const cellBase = `
      border-r
      border-b
      border-slate-400
      px-2
      align-middle
      whitespace-nowrap
      overflow-hidden
      text-center
    `;

    const frozenStyle = useCallback(
      (key, zIndex = 20) => ({
        position: "sticky",
        left: frozenOffsets[key],
        zIndex,
        background: selected
          ? "#eff6ff"
          : "#ffffff",
      }),
      [frozenOffsets, selected]
    );

    const saveSale = useCallback(() => {
      const clean = saleValue.trim();

      if (!clean) {
        setSaleValue(saleName);
        setEditingSale(false);
        return;
      }

      if (
        clean.toLowerCase() ===
        saleName.trim().toLowerCase()
      ) {
        setEditingSale(false);
        return;
      }

      const duplicate =
        saleNames.some(
          (item) =>
            getSaleNameText(
              item
            ).toLowerCase() ===
            clean.toLowerCase()
        );

      if (duplicate) {
        setSaleValue(saleName);
        setEditingSale(false);
        return;
      }

      const record =
        Array.isArray(
          product?.sale_names
        ) &&
        product.sale_names.length
          ? product.sale_names[0]
          : null;

      onSaleNameChange?.(
        product,
        clean,
        record
      );

      setEditingSale(false);
    }, [
      saleValue,
      saleName,
      saleNames,
      product,
      onSaleNameChange,
    ]);

    return (
      <tr
        data-price-row={id}
        className={`
          ${rowHeight}
          group
          ${
            selected
              ? "bg-blue-50"
              : changed
                ? "bg-amber-50/30"
                : "bg-white"
          }
          hover:bg-slate-50
        `}
      >
        <td
          className={`
            ${cellBase}
            sticky
            left-0
            z-10
            bg-white
            text-center
          `}
          style={{
            background: selected
              ? "#eff6ff"
              : "#fff",
          }}
        >
          <span className="text-[11px] font-semibold text-slate-500">
            {index + 1}
          </span>
        </td>

        <td
          className={`
            ${cellBase}
            sticky
            left-[42px]
            z-10
            bg-white
            text-center
          `}
          style={{
            background: selected
              ? "#eff6ff"
              : "#fff",
          }}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={(event) =>
              onSelect?.(
                id,
                event.target.checked
              )
            }
            onClick={(event) =>
              event.stopPropagation()
            }
            className="
              h-4
              w-4
              cursor-pointer
              accent-blue-600
            "
          />
        </td>

        {visibleColumns.sku && (
          <DataCell
            columnKey="sku"
            frozen={frozenColumns.has(
              "sku"
            )}
            frozenStyle={frozenStyle(
              "sku",
              9
            )}
            className={cellBase}
          >
            <span className="text-[13px] font-semibold text-slate-800">
              {id}
            </span>
          </DataCell>
        )}

        {visibleColumns.category && (
          <DataCell
            columnKey="category"
            frozen={frozenColumns.has(
              "category"
            )}
            frozenStyle={frozenStyle(
              "category",
              8
            )}
            className={cellBase}
          >
            <span
              className={`
                inline-flex
                max-w-full
                items-center
                justify-center
                rounded-md
                border
                px-2
                py-1
                text-center
                text-[11px]
                font-bold
                ${categoryTone(
                  product.sub_category
                )}
              `}
            >
              <span className="truncate text-center">
                {product.sub_category ||
                  "UNCATEGORIZED"}
              </span>
            </span>
          </DataCell>
        )}

        {visibleColumns.product && (
          <DataCell
            columnKey="product"
            frozen={frozenColumns.has(
              "product"
            )}
            frozenStyle={frozenStyle(
              "product",
              7
            )}
            className={cellBase}
          >
            <span
              className="
                block
                truncate
                text-center
                text-[13px]
                font-semibold
                text-slate-800
              "
              title={
                product.product_name
              }
            >
              {product.product_name ||
                "—"}
            </span>
          </DataCell>
        )}

        {visibleColumns.saleName && (
          <DataCell
            columnKey="saleName"
            frozen={frozenColumns.has(
              "saleName"
            )}
            frozenStyle={frozenStyle(
              "saleName",
              6
            )}
            className={`${cellBase} px-1`}
          >
            {editingSale ? (
              <div
                className="
                  flex
                  h-8
                  items-center
                  justify-center
                  rounded-md
                  bg-white
                "
              >
                <input
                  ref={saleInputRef}
                  data-sale-name-edit={id}
                  value={saleValue}
                  onChange={(event) =>
                    setSaleValue(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      event.preventDefault();
                      saveSale();
                    }

                    if (
                      event.key ===
                      "Escape"
                    ) {
                      event.preventDefault();
                      setSaleValue(
                        saleName
                      );
                      setEditingSale(false);
                    }
                  }}
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    px-2
                    text-center
                    text-[13px]
                    font-semibold
                    text-slate-800
                    outline-none
                  "
                />

                <button
                  type="button"
                  onClick={saveSale}
                  className="
                    mr-1
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-md
                    bg-emerald-50
                    text-sm
                    font-bold
                    text-emerald-600
                    hover:bg-emerald-100
                  "
                >
                  ✓
                </button>
              </div>
            ) : saleName ? (
              <button
                type="button"
                onClick={() =>
                  setEditingSale(true)
                }
                className="
                  flex
                  h-8
                  w-full
                  items-center
                  justify-center
                  rounded-md
                  px-2
                  text-center
                  text-[13px]
                  font-semibold
                  text-black
                  hover:bg-slate-50
                "
                title="Edit Sale Name"
              >
                <span className="truncate text-center">
                  {saleName}
                </span>

                {saleNames.length > 1 && (
                  <span className="ml-1 shrink-0 text-[10px] font-bold text-slate-400">
                    +{saleNames.length - 1}
                  </span>
                )}
              </button>
            ) : (
              <button
                type="button"
                data-sale-name-edit={id}
                onClick={() =>
                  setEditingSale(true)
                }
                className="
                  flex
                  h-8
                  w-full
                  items-center
                  justify-center
                  rounded-md
                  border
                  border-dashed
                  border-slate-500
                  text-center
                  text-[11px]
                  font-semibold
                  text-slate-400
                  hover:border-blue-300
                  hover:bg-blue-50
                  hover:text-blue-600
                "
              >
                + Add
              </button>
            )}
          </DataCell>
        )}

        {visibleColumns.price && (
          <PriceCell
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
              selectedPriceId === id &&
              selectedPriceField ===
                "price"
            }
            frozen={frozenColumns.has(
              "price"
            )}
            frozenStyle={frozenStyle(
              "price",
              5
            )}
            onChange={onPriceChange}
            onFocus={onFocus}
            onMove={onMove}
            onFillDown={onFillDown}
          />
        )}

        {visibleColumns.dsPrice && (
          <PriceCell
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
              selectedPriceId === id &&
              selectedPriceField ===
                "ds_price"
            }
            frozen={frozenColumns.has(
              "dsPrice"
            )}
            frozenStyle={frozenStyle(
              "dsPrice",
              4
            )}
            onChange={onPriceChange}
            onFocus={onFocus}
            onMove={onMove}
            onFillDown={onFillDown}
          />
        )}

        {visibleColumns.dlrPrice && (
          <PriceCell
            product={product}
            field="dlr_price"
            value={
              draft.new_dlr_price ??
              product.dlr_price ??
              ""
            }
            changed={
              draft.new_dlr_price !==
              undefined
            }
            selected={
              selectedPriceId === id &&
              selectedPriceField ===
                "dlr_price"
            }
            frozen={frozenColumns.has(
              "dlrPrice"
            )}
            frozenStyle={frozenStyle(
              "dlrPrice",
              3
            )}
            onChange={onPriceChange}
            onFocus={onFocus}
            onMove={onMove}
            onFillDown={onFillDown}
          />
        )}

        {visibleColumns.guarantee && (
          <DataCell
            columnKey="guarantee"
            frozen={frozenColumns.has(
              "guarantee"
            )}
            frozenStyle={frozenStyle(
              "guarantee",
              2
            )}
            className={cellBase}
          >
            <span className="block truncate text-center text-[12px] font-medium ">
              {getGuaranteeValue(
                product
              ) || "—"}
            </span>
          </DataCell>
        )}

        {visibleColumns.carton && (
          <DataCell
            columnKey="carton"
            frozen={frozenColumns.has(
              "carton"
            )}
            frozenStyle={frozenStyle(
              "carton",
              2
            )}
            className={cellBase}
          >
            <span className="text-center text-[13px] font-semibold text-black">
              {getCartonValue(
                product
              ) || "—"}
            </span>
          </DataCell>
        )}

        {visibleColumns.mah && (
          <DataCell
            columnKey="mah"
            frozen={frozenColumns.has(
              "mah"
            )}
            frozenStyle={frozenStyle(
              "mah",
              2
            )}
            className={cellBase}
          >
            <span className="text-center text-[13px] font-semibold text-black">
              {getMahValue(product) ||
                "—"}
            </span>
          </DataCell>
        )}

        {visibleColumns.status && (
          <DataCell
            columnKey="status"
            frozen={frozenColumns.has(
              "status"
            )}
            frozenStyle={frozenStyle(
              "status",
              2
            )}
            className={cellBase}
          >
            <span
              className={`
                inline-flex
                items-center
                justify-center
                gap-1.5
                rounded-full
                border
                px-2.5
                py-1
                text-center
                text-[10px]
                font-bold
                ${
                  changed
                    ? "border-amber-100 bg-amber-50 text-amber-700"
                    : product.is_active ===
                        false
                      ? "border-slate-400 bg-slate-50 text-slate-500"
                      : "border-emerald-100 bg-emerald-50 text-emerald-700"
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
                      : product.is_active ===
                          false
                        ? "bg-slate-400"
                        : "bg-emerald-500"
                  }
                `}
              />

              {changed
                ? "Changed"
                : product.is_active ===
                    false
                  ? "Inactive"
                  : "Active"}
            </span>
          </DataCell>
        )}
      </tr>
    );
  }
);

const DataCell = memo(
  function DataCell({
    className = "",
    frozen,
    frozenStyle,
    children,
  }) {
    return (
      <td
        className={className}
        style={
          frozen
            ? frozenStyle
            : undefined
        }
      >
        {children}
      </td>
    );
  }
);

const PriceCell = memo(
  function PriceCell({
    product,
    field,
    value,
    changed,
    selected,
    frozen,
    frozenStyle,
    onChange,
    onFocus,
    onMove,
    onFillDown,
  }) {
    const id = getProductId(product);
    const inputRef = useRef(null);

    const [localValue, setLocalValue] =
      useState(
        value === null ||
          value === undefined
          ? ""
          : String(value)
      );

    const externalValueRef =
      useRef(localValue);

    useEffect(() => {
      const next =
        value === null ||
        value === undefined
          ? ""
          : String(value);

      if (
        next !==
        externalValueRef.current
      ) {
        externalValueRef.current = next;
        setLocalValue(next);
      }
    }, [value]);

    const change = useCallback(
      (event) => {
        const next =
          event.target.value;

        if (
          next !== "" &&
          !/^\d*(\.\d*)?$/.test(next)
        ) {
          return;
        }

        setLocalValue(next);
        externalValueRef.current = next;

        if (next === "") {
          onChange?.(
            id,
            field,
            ""
          );
          return;
        }

        const number = Number(next);

        if (Number.isFinite(number)) {
          onChange?.(
            id,
            field,
            number
          );
        }
      },
      [id, field, onChange]
    );

    const restore = useCallback(() => {
      const original =
        product[field] ?? "";

      const restored =
        String(original);

      setLocalValue(restored);
      externalValueRef.current =
        restored;

      onChange?.(
        id,
        field,
        original
      );

      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }, [
      product,
      field,
      id,
      onChange,
    ]);

    const keyDown = useCallback(
      (event) => {
        if (
          (event.ctrlKey ||
            event.metaKey) &&
          event.key.toLowerCase() ===
            "d"
        ) {
          event.preventDefault();

          onFillDown?.(
            id,
            field
          );

          return;
        }

        if (event.key === "Enter") {
          event.preventDefault();

          onMove?.({
            direction:
              event.shiftKey
                ? "up"
                : "down",
            productId: id,
            field,
          });

          return;
        }

        if (event.key === "Tab") {
          event.preventDefault();

          onMove?.({
            direction:
              event.shiftKey
                ? "previous"
                : "next",
            productId: id,
            field,
          });

          return;
        }

        if (
          event.key ===
          "ArrowDown"
        ) {
          event.preventDefault();

          onMove?.({
            direction: "down",
            productId: id,
            field,
          });

          return;
        }

        if (
          event.key ===
          "ArrowUp"
        ) {
          event.preventDefault();

          onMove?.({
            direction: "up",
            productId: id,
            field,
          });

          return;
        }

        if (event.key === "Escape") {
          event.preventDefault();
          restore();
        }
      },
      [
        id,
        field,
        onFillDown,
        onMove,
        restore,
      ]
    );

    const theme =
      field === "price"
        ? {
            text: "text-blue-700",
            selected:
              "bg-blue-50/70",
            changed:
              "bg-amber-50/60",
          }
        : field === "ds_price"
          ? {
              text:
                "text-violet-700",
              selected:
                "bg-violet-50/70",
              changed:
                "bg-amber-50/60",
            }
          : {
              text: "text-black",
              selected:
                "bg-slate-50",
              changed:
                "bg-amber-50/60",
            };

    const cellBackground =
      selected
        ? theme.selected
        : changed
          ? theme.changed
          : "transparent";

    return (
      <td
        className="
          border-r
          border-b
          border-slate-400
          px-1
          align-middle
          text-center
        "
        style={{
          ...(frozen
            ? frozenStyle
            : {}),
          background:
            frozen
              ? frozenStyle?.background
              : undefined,
        }}
      >
        <div
          className="
            relative
            flex
            h-8
            w-full
            items-center
            justify-center
          "
          style={{
            background:
              cellBackground,
          }}
        >
          <input
            ref={inputRef}
            data-price-cell={`${id}-${field}`}
            value={localValue}
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            onFocus={() =>
              onFocus?.({
                productId: id,
                field,
              })
            }
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            onClick={(event) =>
              event.stopPropagation()
            }
            onChange={change}
            onKeyDown={keyDown}
            className={`
              h-full
              w-full
              bg-transparent
              px-2
              text-center
              text-[12px]
              font-bold
              outline-none
              focus:outline-none
              focus:ring-0
              ${theme.text}
            `}
          />

          {selected && (
            <span
              className="
                pointer-events-none
                absolute
                inset-x-0
                bottom-0
                h-[2px]
                bg-blue-500/70
              "
            />
          )}

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
      </td>
    );
  }
);

const FilterIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-3.5 w-3.5"
  >
    <path d="M4 5h16M7 12h10M10 19h4" />
  </svg>
);

const SearchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-5 w-5"
  >
    <circle
      cx="11"
      cy="11"
      r="7"
    />
    <path d="m20 20-3.5-3.5" />
  </svg>
);