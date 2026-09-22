import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { getSaleNamesByProduct } from "../../api/priceManagementApi";

import { useAdminAllProducts } from "../../hooks/useAdminAllProducts";
import {
  useSaveSaleName,
  useUpdateProductPrices,
} from "../../hooks/usePriceManagement";

import PriceManagementToolbar from "../../components/PriceManagement/PriceManagementToolbar";
import PriceManagementTable from "../../components/PriceManagement/PriceManagementTable";
import PriceManagementCategoryTabs from "../../components/PriceManagement/PriceManagementCategoryTabs";
import { exportPriceManagementExcel } from "../../utils/exportPriceManagementExcel";

const PRICE_FIELDS = [
  "price",
  "ds_price",
  "dlr_price",
];

const today = () =>
  new Date().toISOString().slice(0, 10);

const getProductId = (product) =>
  Number(
    product?.product_id ??
      product?.id ??
      0
  );

const getSaleNameText = (item) => {
  if (item == null) return "";

  if (typeof item === "string") {
    return item.trim();
  }

  if (typeof item === "object") {
    return String(
      item?.sale_name ??
        item?.name ??
        item?.title ??
        ""
    ).trim();
  }

  return String(item).trim();
};

const getSaleNames = (product) =>
  Array.isArray(product?.sale_names)
    ? product.sale_names
        .map(getSaleNameText)
        .filter(Boolean)
    : [];

const getSaleNameId = (item) =>
  item && typeof item === "object"
    ? item?.id ??
      item?.sale_name_id ??
      item?.pk ??
      null
    : null;

const getSaleRecords = (product) => {
  const source = Array.isArray(
    product?.sale_names
  )
    ? product.sale_names
    : [];

  const seen = new Set();

  return source.filter((item) => {
    const name = getSaleNameText(item);

    if (!name) return false;

    const id = getSaleNameId(item);

    const key =
      id != null
        ? `id:${id}`
        : `name:${name.toLowerCase()}`;

    if (seen.has(key)) return false;

    seen.add(key);

    return true;
  });
};

const getGuarantee = (product) =>
  String(
    product?.guarantee ??
      product?.guarantee_period ??
      product?.warranty ??
      product?.warranty_period ??
      ""
  ).trim();

const getCarton = (product) =>
  String(
    product?.cartoon_size ??
      product?.carton_size ??
      product?.carton ??
      ""
  ).trim();

const getMah = (product) =>
  String(
    product?.mah ??
      product?.mAh ??
      ""
  ).trim();

const normalizePrice = (value) => {
  if (value === "" || value == null) {
    return "";
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : value;
};

const priceChanged = (
  nextValue,
  originalValue
) => {
  if (
    nextValue === "" ||
    nextValue == null
  ) {
    return (
      String(originalValue ?? "") !== ""
    );
  }

  return (
    Number(nextValue) !==
    Number(originalValue ?? 0)
  );
};

const normalizeColumnKey = (key) => {
  const map = {
    sku: "sku",
    product_id: "sku",
    category: "category",
    sub_category: "category",
    product: "product",
    product_name: "product",
    saleName: "saleName",
    sale_names: "saleName",
    price: "price",
    dsPrice: "dsPrice",
    ds_price: "dsPrice",
    dlrPrice: "dlrPrice",
    dlr_price: "dlrPrice",
    guarantee: "guarantee",
    carton: "carton",
    mah: "mah",
    status: "status",
    updated: "updated",
    last_updated: "updated",
  };

  return map[key] ?? key;
};

const TABLE_COLUMNS = [
  {
    key: "sku",
    label: "ID",
    type: "number",
  },
  {
    key: "category",
    label: "CATEGORY",
    type: "text",
  },
  {
    key: "product",
    label: "PRODUCT",
    type: "text",
  },
  {
    key: "saleName",
    label: "SALE NAME",
    type: "text",
  },
  {
    key: "price",
    label: "SS PRICE",
    type: "price",
  },
  {
    key: "dsPrice",
    label: "DS PRICE",
    type: "price",
  },
  {
    key: "dlrPrice",
    label: "DLR PRICE",
    type: "price",
  },
  {
    key: "guarantee",
    label: "GUARANTEE",
    type: "text",
  },
  {
    key: "carton",
    label: "CARTON",
    type: "number",
  },
  {
    key: "mah",
    label: "MAH",
    type: "number",
  },
  {
    key: "status",
    label: "STATUS",
    type: "text",
  },
  {
    key: "updated",
    label: "LAST UPDATED",
    type: "text",
  },
];

const DEFAULT_VISIBLE_COLUMNS =
  Object.fromEntries(
    TABLE_COLUMNS.map(({ key }) => [
      key,
      true,
    ])
  );

const getColumnValue = (
  product,
  key,
  draft = {}
) => {
  if (!product) return "";

  switch (key) {
    case "sku":
      return (
        product?.product_id ??
        product?.id ??
        ""
      );

    case "category":
      return (
        product?.sub_category ?? ""
      );

    case "product":
      return (
        product?.product_name ?? ""
      );

    case "saleName":
      return getSaleNames(product).join(
        " "
      );

    case "price":
      return (
        draft.new_price ??
        product?.price ??
        ""
      );

    case "dsPrice":
      return (
        draft.new_ds_price ??
        product?.ds_price ??
        ""
      );

    case "dlrPrice":
      return (
        draft.new_dlr_price ??
        product?.dlr_price ??
        ""
      );

    case "guarantee":
      return getGuarantee(product);

    case "carton":
      return getCarton(product);

    case "mah":
      return getMah(product);

    case "status":
      return product?.is_active === false
        ? "Inactive"
        : "Active";

    case "updated":
      return (
        product?.updated_at ??
        product?.last_updated ??
        ""
      );

    default:
      return product?.[key] ?? "";
  }
};

const cloneDrafts = (value) =>
  JSON.parse(
    JSON.stringify(value || {})
  );

const parseCsv = (text) => {
  const rows = [];

  let row = [];
  let cell = "";
  let quoted = false;

  for (
    let i = 0;
    i < text.length;
    i += 1
  ) {
    const char = text[i];
    const next = text[i + 1];

    if (
      char === '"' &&
      quoted &&
      next === '"'
    ) {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (
      char === "," &&
      !quoted
    ) {
      row.push(cell.trim());
      cell = "";
    } else if (
      (char === "\n" ||
        char === "\r") &&
      !quoted
    ) {
      if (
        char === "\r" &&
        next === "\n"
      ) {
        i += 1;
      }

      row.push(cell.trim());

      if (row.some(Boolean)) {
        rows.push(row);
      }

      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());

  if (row.some(Boolean)) {
    rows.push(row);
  }

  if (!rows.length) {
    return [];
  }

  const headers = rows[0].map(
    (header) =>
      String(header)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
  );

  return rows
    .slice(1)
    .map((values) =>
      Object.fromEntries(
        headers.map(
          (header, index) => [
            header,
            values[index] ?? "",
          ]
        )
      )
    );
};

const PriceManagementPage = () => {
  const navigate = useNavigate();

  const {
    data: allProductsData,
    isLoading,
    isFetching,
    refetch,
  } = useAdminAllProducts();

  const updatePrices =
    useUpdateProductPrices();

  const saveSaleName =
    useSaveSaleName();

  const [search, setSearch] =
    useState("");

  const [quickFilter, setQuickFilter] =
    useState("all");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("ALL");

  const [sort, setSort] = useState({
    key: "sku",
    direction: "asc",
  });

  const [density, setDensity] =
    useState("compact");

  const [
    visibleColumns,
    setVisibleColumns,
  ] = useState(
    DEFAULT_VISIBLE_COLUMNS
  );

  const [
    columnFilters,
    setColumnFilters,
  ] = useState({});

  const [
    selectedRows,
    setSelectedRows,
  ] = useState([]);

  const [
    focusedCell,
    setFocusedCell,
  ] = useState(null);

  const [drafts, setDrafts] =
    useState({});

  const [
    applicableFrom,
    setApplicableFrom,
  ] = useState(today());

  const [reason, setReason] =
    useState("Price Update");

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState(new Date());

  const [bulkOpen, setBulkOpen] =
    useState(false);

  const [bulkField, setBulkField] =
    useState("price");

  const [bulkValue, setBulkValue] =
    useState("");

  const [undoStack, setUndoStack] =
    useState([]);

  const [redoStack, setRedoStack] =
    useState([]);

  const searchRef = useRef(null);
  const importRef = useRef(null);
  const historyEditKeyRef =
    useRef(null);

  const allProducts = useMemo(() => {
    if (Array.isArray(allProductsData)) {
      return allProductsData;
    }

    if (
      Array.isArray(
        allProductsData?.results
      )
    ) {
      return allProductsData.results;
    }

    return [];
  }, [allProductsData]);

  const products = useMemo(
    () =>
      allProducts.filter(
        (product) =>
          product?.is_active === true &&
          !String(
            product?.sub_category ?? ""
          )
            .trim()
            .toUpperCase()
            .startsWith("TEMPERED")
      ),
    [allProducts]
  );

  const productMap = useMemo(
    () =>
      new Map(
        products.map((product) => [
          getProductId(product),
          product,
        ])
      ),
    [products]
  );

  const categories = useMemo(() => {
    const set = new Set();

    products.forEach((product) => {
      set.add(
        String(
          product?.sub_category ?? ""
        ).trim() ||
          "UNCATEGORIZED"
      );
    });

    return [...set].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [products]);

  const categoryCounts = useMemo(() => {
    const counts = {
      ALL: products.length,
    };

    products.forEach((product) => {
      const category =
        String(
          product?.sub_category ?? ""
        ).trim() ||
        "UNCATEGORIZED";

      counts[category] =
        (counts[category] ?? 0) + 1;
    });

    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    const filterEntries =
      Object.entries(columnFilters);

    return products.filter((product) => {
      const productId =
        getProductId(product);

      const draft =
        drafts[productId] ?? {};

      if (query) {
        const searchable = [
          product?.product_id ?? "",
          product?.product_name ?? "",
          product?.sub_category ?? "",
          getSaleNames(product).join(" "),
          getGuarantee(product),
          getCarton(product),
          getMah(product),
        ]
          .join(" ")
          .toLowerCase();

        if (
          !searchable.includes(query)
        ) {
          return false;
        }
      }

      if (
        selectedCategory !== "ALL"
      ) {
        const category =
          String(
            product?.sub_category ?? ""
          ).trim() ||
          "UNCATEGORIZED";

        if (
          category !==
          selectedCategory
        ) {
          return false;
        }
      }

      if (
        quickFilter === "changed" &&
        !Object.keys(draft).length
      ) {
        return false;
      }

      if (
        quickFilter === "missing" &&
        getSaleNames(product).length
      ) {
        return false;
      }

      for (
        let index = 0;
        index < filterEntries.length;
        index += 1
      ) {
        const [
          rawKey,
          filterValue,
        ] = filterEntries[index];

        if (
          filterValue == null ||
          String(filterValue).trim() ===
            ""
        ) {
          continue;
        }

        const key =
          normalizeColumnKey(rawKey);

        const values = String(
          filterValue
        )
          .split("||")
          .map((value) =>
            value.trim().toLowerCase()
          )
          .filter(Boolean);

        const current = String(
          getColumnValue(
            product,
            key,
            draft
          ) ?? ""
        )
          .trim()
          .toLowerCase();

        if (
          !values.some((value) =>
            current.includes(value)
          )
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    products,
    drafts,
    search,
    selectedCategory,
    quickFilter,
    columnFilters,
  ]);

  const sortedProducts = useMemo(() => {
    const result = [
      ...filteredProducts,
    ];

    const key =
      normalizeColumnKey(sort.key);

    const multiplier =
      sort.direction === "desc"
        ? -1
        : 1;

    result.sort((a, b) => {
      const av = getColumnValue(
        a,
        key,
        drafts[getProductId(a)] ?? {}
      );

      const bv = getColumnValue(
        b,
        key,
        drafts[getProductId(b)] ?? {}
      );

      const an = Number(av);
      const bn = Number(bv);

      if (
        Number.isFinite(an) &&
        Number.isFinite(bn) &&
        av !== "" &&
        bv !== ""
      ) {
        return (
          (an - bn) * multiplier
        );
      }

      return (
        String(av ?? "").localeCompare(
          String(bv ?? ""),
          undefined,
          {
            numeric: true,
            sensitivity: "base",
          }
        ) * multiplier
      );
    });

    return result;
  }, [
    filteredProducts,
    drafts,
    sort,
  ]);

  const selectedProduct = useMemo(() => {
    if (!focusedCell) {
      return null;
    }

    return (
      productMap.get(
        Number(focusedCell.productId)
      ) ?? null
    );
  }, [
    focusedCell,
    productMap,
  ]);

  const changedItems = useMemo(
    () =>
      Object.entries(drafts).map(
        ([productId, draft]) => ({
          product_id:
            Number(productId),
          new_price:
            draft.new_price,
          new_ds_price:
            draft.new_ds_price,
          new_dlr_price:
            draft.new_dlr_price,
        })
      ),
    [drafts]
  );

  const changedCount =
    changedItems.length;

  const pushUndoSnapshot =
    useCallback((snapshot) => {
      setUndoStack((current) => {
        const next = [
          ...current,
          cloneDrafts(snapshot),
        ];

        return next.length > 30
          ? next.slice(-30)
          : next;
      });

      setRedoStack([]);
    }, []);

  const handlePriceChange =
    useCallback(
      (
        productId,
        field,
        value
      ) => {
        const product =
          productMap.get(
            Number(productId)
          );

        if (!product) {
          return;
        }

        const fields = {
          price: [
            "price",
            "new_price",
          ],
          ds_price: [
            "ds_price",
            "new_ds_price",
          ],
          dlr_price: [
            "dlr_price",
            "new_dlr_price",
          ],
        };

        const config =
          fields[field];

        if (!config) {
          return;
        }

        const [
          originalField,
          draftField,
        ] = config;

        const numericValue =
          normalizePrice(value);

        const editKey =
          `${productId}:${field}`;

        if (
          historyEditKeyRef.current !==
          editKey
        ) {
          pushUndoSnapshot(drafts);
          historyEditKeyRef.current =
            editKey;
        }

        setDrafts((current) => {
          const existing =
            current[productId] ?? {};

          const next = {
            ...existing,
          };

          if (
            priceChanged(
              numericValue,
              product[originalField]
            )
          ) {
            next[draftField] =
              numericValue;
          } else {
            delete next[draftField];
          }

          if (
            !Object.keys(next).length
          ) {
            const copy = {
              ...current,
            };

            delete copy[productId];

            return copy;
          }

          return {
            ...current,
            [productId]: next,
          };
        });
      },
      [
        productMap,
        drafts,
        pushUndoSnapshot,
      ]
    );

  const focusCell = useCallback(
    (payload) => {
      if (!payload) {
        return;
      }

      historyEditKeyRef.current =
        null;

      setFocusedCell({
        productId: Number(
          payload.productId
        ),
        field: payload.field,
      });

      requestAnimationFrame(() => {
        const element =
          document.querySelector(
            `[data-price-cell="${payload.productId}-${payload.field}"]`
          );

        element?.focus();
        element?.select?.();
      });
    },
    []
  );

  const handleUndo =
    useCallback(() => {
      setUndoStack((current) => {
        if (!current.length) {
          return current;
        }

        const previous =
          current[current.length - 1];

        setRedoStack((redo) => [
          ...redo,
          cloneDrafts(drafts),
        ]);

        setDrafts(
          cloneDrafts(previous)
        );

        historyEditKeyRef.current =
          null;

        return current.slice(0, -1);
      });
    }, [drafts]);

  const handleRedo =
    useCallback(() => {
      setRedoStack((current) => {
        if (!current.length) {
          return current;
        }

        const next =
          current[current.length - 1];

        setUndoStack((undo) => [
          ...undo,
          cloneDrafts(drafts),
        ]);

        setDrafts(
          cloneDrafts(next)
        );

        historyEditKeyRef.current =
          null;

        return current.slice(0, -1);
      });
    }, [drafts]);

  const handleColumnSort =
    useCallback(
      (key, direction) => {
        setSort({
          key: normalizeColumnKey(key),
          direction,
        });
      },
      []
    );

  const handleColumnFilter =
    useCallback(
      (key, value) => {
        setColumnFilters((current) => ({
          ...current,
          [key]: value,
        }));
      },
      []
    );

  const handleClearColumnFilter =
    useCallback((key) => {
      setColumnFilters((current) => {
        const next = {
          ...current,
        };

        delete next[key];

        return next;
      });
    }, []);

  const handleHideColumn =
    useCallback((key) => {
      setVisibleColumns((current) => {
        const visibleCount =
          Object.values(current).filter(
            Boolean
          ).length;

        if (visibleCount <= 1) {
          return current;
        }

        return {
          ...current,
          [key]: false,
        };
      });
    }, []);

  const handleSelectRow =
    useCallback(
      (
        productId,
        checked
      ) => {
        setSelectedRows((current) => {
          if (checked) {
            return current.includes(
              productId
            )
              ? current
              : [
                  ...current,
                  productId,
                ];
          }

          return current.filter(
            (id) => id !== productId
          );
        });
      },
      []
    );

  const handleSelectAll =
    useCallback(
      (checked) => {
        const ids =
          sortedProducts.map(
            getProductId
          );

        const idSet = new Set(ids);

        setSelectedRows((current) => {
          if (checked) {
            return Array.from(
              new Set([
                ...current,
                ...ids,
              ])
            );
          }

          return current.filter(
            (id) => !idSet.has(id)
          );
        });
      },
      [sortedProducts]
    );

  const handleAddSaleName =
    useCallback(
      async (
        product,
        saleName,
        saleRecord = null
      ) => {
        const productId =
          getProductId(product);

        const clean = String(
          saleName ?? ""
        ).trim();

        if (!productId || !clean) {
          return;
        }

        const records =
          getSaleRecords(product);

        const record =
          saleRecord ??
          records[0] ??
          null;

        const saleNameId =
          record?.id ??
          record?.sale_name_id ??
          record?.pk ??
          null;

        if (
          saleNameId !== null &&
          saleNameId !== undefined &&
          String(saleNameId).trim() !==
            ""
        ) {
          await saveSaleName.mutateAsync(
            {
              mode: "edit",
              product_id: productId,
              sale_name_id: saleNameId,
              sale_name: clean,
            }
          );

          return;
        }

        if (!records.length) {
          await saveSaleName.mutateAsync(
            {
              mode: "add",
              product_id: productId,
              sale_name: clean,
            }
          );

          return;
        }

        try {
          const freshRecords =
            await getSaleNamesByProduct(
              productId
            );

          const freshRecord =
            Array.isArray(freshRecords)
              ? freshRecords.find(
                  (item) => {
                    const name =
                      typeof item ===
                      "string"
                        ? item.trim()
                        : String(
                            item?.sale_name ??
                              item?.name ??
                              ""
                          ).trim();

                    return (
                      name.toLowerCase() ===
                      clean.toLowerCase()
                    );
                  }
                ) ??
                freshRecords[0] ??
                null
              : null;

          const freshSaleNameId =
            freshRecord?.id ??
            freshRecord?.sale_name_id ??
            freshRecord?.pk ??
            null;

          if (
            freshSaleNameId !== null &&
            freshSaleNameId !== undefined &&
            String(
              freshSaleNameId
            ).trim() !== ""
          ) {
            await saveSaleName.mutateAsync(
              {
                mode: "edit",
                product_id: productId,
                sale_name_id:
                  freshSaleNameId,
                sale_name: clean,
              }
            );
          }
        } catch (error) {
          console.error(
            "Failed to resolve Sale Name ID:",
            error
          );
        }
      },
      [saveSaleName]
    );

  const handleFillDown =
    useCallback(
      (productId, field) => {
        const sourceIndex =
          sortedProducts.findIndex(
            (product) =>
              getProductId(product) ===
              Number(productId)
          );

        if (sourceIndex < 0) {
          return;
        }

        const sourceProduct =
          sortedProducts[sourceIndex];

        const sourceDraft =
          drafts[productId] ?? {};

        const draftField =
          field === "price"
            ? "new_price"
            : field === "ds_price"
              ? "new_ds_price"
              : "new_dlr_price";

        const value =
          sourceDraft[draftField] ??
          sourceProduct[field] ??
          "";

        pushUndoSnapshot(drafts);

        setDrafts((current) => {
          const next = {
            ...current,
          };

          sortedProducts
            .slice(sourceIndex + 1)
            .forEach((product) => {
              const id =
                getProductId(product);

              const original =
                product[field] ?? "";

              const existing = {
                ...(next[id] ?? {}),
              };

              if (
                priceChanged(
                  value,
                  original
                )
              ) {
                existing[draftField] =
                  normalizePrice(value);
              } else {
                delete existing[draftField];
              }

              if (
                Object.keys(existing)
                  .length
              ) {
                next[id] = existing;
              } else {
                delete next[id];
              }
            });

          return next;
        });
      },
      [
        sortedProducts,
        drafts,
        pushUndoSnapshot,
      ]
    );

  const handlePaste =
    useCallback(
      ({
        productId,
        field,
        rows,
      }) => {
        const startIndex =
          sortedProducts.findIndex(
            (product) =>
              getProductId(product) ===
              Number(productId)
          );

        const startField =
          PRICE_FIELDS.indexOf(field);

        if (
          startIndex < 0 ||
          startField < 0 ||
          !rows?.length
        ) {
          return;
        }

        pushUndoSnapshot(drafts);

        setDrafts((current) => {
          const next = {
            ...current,
          };

          rows.forEach(
            (row, rowOffset) => {
              const product =
                sortedProducts[
                  startIndex + rowOffset
                ];

              if (!product) {
                return;
              }

              row.forEach(
                (
                  rawValue,
                  columnOffset
                ) => {
                  const priceField =
                    PRICE_FIELDS[
                      startField +
                        columnOffset
                    ];

                  if (
                    !priceField ||
                    String(
                      rawValue
                    ).trim() === ""
                  ) {
                    return;
                  }

                  const value =
                    normalizePrice(
                      String(
                        rawValue
                      ).trim()
                    );

                  if (value === "") {
                    return;
                  }

                  const id =
                    getProductId(
                      product
                    );

                  const draft = {
                    ...(next[id] ?? {}),
                  };

                  const draftField =
                    priceField ===
                    "price"
                      ? "new_price"
                      : priceField ===
                          "ds_price"
                        ? "new_ds_price"
                        : "new_dlr_price";

                  if (
                    priceChanged(
                      value,
                      product[
                        priceField
                      ] ?? ""
                    )
                  ) {
                    draft[draftField] =
                      value;
                  } else {
                    delete draft[
                      draftField
                    ];
                  }

                  if (
                    Object.keys(draft)
                      .length
                  ) {
                    next[id] = draft;
                  } else {
                    delete next[id];
                  }
                }
              );
            }
          );

          return next;
        });
      },
      [
        sortedProducts,
        drafts,
        pushUndoSnapshot,
      ]
    );

  const handleSave =
    useCallback(async () => {
      if (!changedItems.length) {
        return;
      }

      await updatePrices.mutateAsync({
        applicable_from:
          applicableFrom,
        reason: reason.trim(),
        items: changedItems,
      });

      setDrafts({});
      setUndoStack([]);
      setRedoStack([]);
      setSelectedRows([]);
      setFocusedCell(null);

      historyEditKeyRef.current = null;

      setLastUpdated(new Date());
    }, [
      changedItems,
      applicableFrom,
      reason,
      updatePrices,
    ]);

  const handleRefresh =
    useCallback(async () => {
      await refetch();
      setLastUpdated(new Date());
    }, [refetch]);

  const handleExport =
    useCallback(() => {
      exportPriceManagementExcel(
        sortedProducts
      );
    }, [sortedProducts]);

  const handleImportClick =
    useCallback(() => {
      importRef.current?.click();
    }, []);

  const handleImport =
    useCallback(
      async (event) => {
        const file =
          event.target.files?.[0];

        event.target.value = "";

        if (!file) {
          return;
        }

        const rows = parseCsv(
          await file.text()
        );

        if (!rows.length) {
          return;
        }

        const byId = new Map(
          products.map((product) => [
            String(
              getProductId(product)
            ),
            product,
          ])
        );

        const before =
          cloneDrafts(drafts);

        const nextDrafts = {
          ...drafts,
        };

        let imported = 0;

        rows.forEach((row) => {
          const id =
            row.product_id ||
            row.productid ||
            row.id ||
            row.sku;

          const product =
            byId.get(
              String(id ?? "").trim()
            );

          if (!product) {
            return;
          }

          const productId =
            getProductId(product);

          const next = {
            ...(nextDrafts[productId] ??
              {}),
          };

          const price =
            row.new_price ??
            row.price ??
            row.ss_price;

          const dsPrice =
            row.new_ds_price ??
            row.ds_price;

          const dlrPrice =
            row.new_dlr_price ??
            row.dlr_price;

          if (
            price !== undefined &&
            price !== ""
          ) {
            next.new_price =
              normalizePrice(price);
          }

          if (
            dsPrice !== undefined &&
            dsPrice !== ""
          ) {
            next.new_ds_price =
              normalizePrice(dsPrice);
          }

          if (
            dlrPrice !== undefined &&
            dlrPrice !== ""
          ) {
            next.new_dlr_price =
              normalizePrice(dlrPrice);
          }

          if (
            Object.keys(next).length
          ) {
            nextDrafts[productId] =
              next;

            imported += 1;
          }
        });

        if (!imported) {
          return;
        }

        setUndoStack((current) => [
          ...current.slice(-29),
          before,
        ]);

        setRedoStack([]);
        setDrafts(nextDrafts);
      },
      [products, drafts]
    );

  const handleBulkApply =
    useCallback(() => {
      if (
        !selectedRows.length ||
        bulkValue === ""
      ) {
        setBulkOpen(false);
        return;
      }

      const config = {
        price: [
          "price",
          "new_price",
        ],
        dsPrice: [
          "ds_price",
          "new_ds_price",
        ],
        dlrPrice: [
          "dlr_price",
          "new_dlr_price",
        ],
      }[bulkField];

      if (!config) {
        return;
      }

      const [
        originalField,
        draftField,
      ] = config;

      const numeric =
        normalizePrice(bulkValue);

      pushUndoSnapshot(drafts);

      setDrafts((current) => {
        const next = {
          ...current,
        };

        selectedRows.forEach(
          (productId) => {
            const product =
              productMap.get(
                Number(productId)
              );

            if (!product) {
              return;
            }

            const draft = {
              ...(next[productId] ??
                {}),
            };

            if (
              priceChanged(
                numeric,
                product[
                  originalField
                ]
              )
            ) {
              draft[draftField] =
                numeric;
            } else {
              delete draft[draftField];
            }

            if (
              Object.keys(draft).length
            ) {
              next[productId] =
                draft;
            } else {
              delete next[productId];
            }
          }
        );

        return next;
      });

      setBulkValue("");
      setBulkOpen(false);
    }, [
      selectedRows,
      bulkValue,
      bulkField,
      productMap,
      drafts,
      pushUndoSnapshot,
    ]);

  const handleRowAction =
    useCallback(
      (product, action) => {
        const id =
          getProductId(product);

        if (action === "copy") {
          navigator.clipboard?.writeText(
            String(id)
          );

          return;
        }

        if (action === "history") {
          navigate(
            `/price-history?product_id=${id}`
          );

          return;
        }

        if (action === "sale") {
          focusCell({
            productId: id,
            field: "price",
          });

          requestAnimationFrame(() => {
            document
              .querySelector(
                `[data-sale-name-edit="${id}"]`
              )
              ?.click();
          });
        }
      },
      [navigate, focusCell]
    );

  useEffect(() => {
    const handler = (event) => {
      const modifier =
        event.ctrlKey ||
        event.metaKey;

      const key =
        event.key.toLowerCase();

      if (
        modifier &&
        key === "k"
      ) {
        event.preventDefault();

        searchRef.current?.focus();
        searchRef.current?.select();
      }

      if (
        modifier &&
        key === "s" &&
        changedCount &&
        !updatePrices.isPending
      ) {
        event.preventDefault();
        handleSave();
      }
    };

    document.addEventListener(
      "keydown",
      handler
    );

    return () =>
      document.removeEventListener(
        "keydown",
        handler
      );
  }, [
    changedCount,
    handleSave,
    updatePrices.isPending,
  ]);

  const selectedRowSet = useMemo(
    () => new Set(selectedRows),
    [selectedRows]
  );

  const allPageSelected =
    sortedProducts.length > 0 &&
    sortedProducts.every((product) =>
      selectedRowSet.has(
        getProductId(product)
      )
    );

  return (
    <div
      className="
        flex
        h-full
        min-h-0
        w-full
        flex-col
        overflow-hidden
        bg-[#f8fafc]
        text-slate-800
      "
    >
      <section
        className="
          relative
          z-30
          shrink-0
          overflow-visible
          border-b
          border-slate-200
          bg-white
        "
      >
        <PriceManagementToolbar
          title="Price Management"
          subtitle="Manage SS & DS prices"
          search={search}
          onSearchChange={setSearch}
          quickFilter={quickFilter}
          onQuickFilterChange={
            setQuickFilter
          }
          changedCount={changedCount}
          totalCount={
            filteredProducts.length
          }
          density={density}
          onDensityChange={setDensity}
          onRefresh={handleRefresh}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={
            undoStack.length > 0
          }
          canRedo={
            redoStack.length > 0
          }
          saving={
            updatePrices.isPending
          }
          hasChanges={
            changedCount > 0
          }
          onSave={handleSave}
          lastUpdated={lastUpdated}
          syncStatus={
            updatePrices.isPending
              ? "saving"
              : changedCount > 0
                ? "unsaved"
                : "saved"
          }
          searchInputRef={searchRef}
          onImport={
            handleImportClick
          }
          onExport={handleExport}
          onBulkEdit={() =>
            setBulkOpen(true)
          }
          selectedCount={
            selectedRows.length
          }
          applicableFrom={
            applicableFrom
          }
          onApplicableFromChange={
            setApplicableFrom
          }
          reason={reason}
          onReasonChange={setReason}
        />
      </section>

      <main
        className="
          relative
          min-h-0
          flex-1
          overflow-hidden
          px-2
          pb-0
          pt-1.5
        "
      >
        <div
          className="
            h-full
            min-h-0
            w-full
            overflow-hidden
          "
        >
          <PriceManagementTable
            products={sortedProducts}
            allProducts={products}
            drafts={drafts}
            onPriceChange={
              handlePriceChange
            }
            onSaleNameChange={
              handleAddSaleName
            }
            onFillDown={
              handleFillDown
            }
            onPaste={handlePaste}
            onFocusCell={focusCell}
            columnFilters={
              columnFilters
            }
            selectedRows={
              selectedRows
            }
            onSelectRow={
              handleSelectRow
            }
            onSelectAll={
              handleSelectAll
            }
            allPageSelected={
              allPageSelected
            }
            onRowAction={
              handleRowAction
            }
            onColumnSort={
              handleColumnSort
            }
            onColumnFilter={
              handleColumnFilter
            }
            onClearColumnFilter={
              handleClearColumnFilter
            }
            onHideColumn={
              handleHideColumn
            }
            sort={sort}
            visibleColumns={
              visibleColumns
            }
            density={density}
            isLoading={isLoading}
            isFetching={isFetching}
          />
        </div>
      </main>

      <div className="min-h-0 w-full">
        <PriceManagementCategoryTabs
          categories={categories}
          selectedCategory={
            selectedCategory
          }
          onCategoryChange={
            setSelectedCategory
          }
          categoryCounts={
            categoryCounts
          }
        />
      </div>

      <input
        ref={importRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleImport}
      />

      {bulkOpen && (
        <div
          className="
            fixed
            inset-0
            z-[200]
            flex
            items-center
            justify-center
            bg-slate-900/25
            p-4
            backdrop-blur-[2px]
          "
        >
          <div
            className="
              w-full
              max-w-md
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-2xl
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900">
                  Bulk Edit
                </h2>

                <p className="mt-1 text-[11px] text-slate-500">
                  Update{" "}
                  {selectedRows.length}{" "}
                  selected product
                  {selectedRows.length ===
                  1
                    ? ""
                    : "s"}
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setBulkOpen(false)
                }
                className="
                  text-xl
                  text-slate-400
                  transition
                  hover:text-slate-700
                "
              >
                ×
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <label className="text-[11px] font-semibold text-slate-600">
                Price field

                <select
                  value={bulkField}
                  onChange={(event) =>
                    setBulkField(
                      event.target.value
                    )
                  }
                  className="
                    mt-1
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-slate-200
                    px-3
                    text-[12px]
                    outline-none
                    focus:border-blue-400
                  "
                >
                  <option value="price">
                    SS Price
                  </option>

                  <option value="dsPrice">
                    DS Price
                  </option>

                  <option value="dlrPrice">
                    DLR Price
                  </option>
                </select>
              </label>

              <label className="text-[11px] font-semibold text-slate-600">
                New value

                <input
                  value={bulkValue}
                  onChange={(event) =>
                    setBulkValue(
                      event.target.value
                    )
                  }
                  inputMode="decimal"
                  placeholder="e.g. 199"
                  className="
                    mt-1
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-slate-200
                    px-3
                    text-[12px]
                    outline-none
                    focus:border-blue-400
                  "
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setBulkOpen(false)
                }
                className="
                  h-9
                  rounded-lg
                  border
                  border-slate-200
                  px-4
                  text-[11px]
                  font-semibold
                  text-slate-600
                  transition
                  hover:bg-slate-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  !selectedRows.length ||
                  bulkValue === ""
                }
                onClick={
                  handleBulkApply
                }
                className="
                  h-9
                  rounded-lg
                  bg-blue-600
                  px-4
                  text-[11px]
                  font-semibold
                  text-white
                  transition
                  hover:bg-blue-700
                  disabled:opacity-40
                "
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceManagementPage;