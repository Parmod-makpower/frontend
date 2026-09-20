import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { useAdminAllProducts } from "../../hooks/useAdminAllProducts";

import {
  useUpdateProductPrices,
  useSaveSaleName,
} from "../../hooks/usePriceManagement";

import PriceManagementToolbar from "../../components/PriceManagement/PriceManagementToolbar";
import PriceManagementTable from "../../components/PriceManagement/PriceManagementTable";
import PriceManagementCategoryTabs from "../../components/PriceManagement/PriceManagementCategoryTabs";
import { exportPriceManagementExcel} from "../../utils/exportPriceManagementExcel";

const PAGE_SIZE = 12;

const today = () => {
  const date = new Date();
  return date.toISOString().slice(0, 10);
};

/* ============================================================================
 * Helpers
 * ========================================================================== */

const getProductId = (product) =>
  Number(product?.product_id ?? product?.id ?? 0);

const getSaleNames = (product) => {
  if (!Array.isArray(product?.sale_names)) {
    return [];
  }

  return product.sale_names
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      return String(
        item?.sale_name ??
          item?.name ??
          item?.title ??
          ""
      ).trim();
    })
    .filter(Boolean);
};

/* -------------------------------------------------------------------------- */
/* Sale Name helpers                                                          */
/* -------------------------------------------------------------------------- */

const getSaleNameText = (item) => {
  if (item === null || item === undefined) {
    return "";
  }

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

const getSaleNameId = (item) => {
  if (item && typeof item === "object") {
    return (
      item?.id ??
      item?.sale_name_id ??
      item?.pk ??
      null
    );
  }

  return null;
};

const getProductSaleNameRecords = (product) => {
  const productNames = Array.isArray(product?.sale_names)
    ? product.sale_names
    : [];

  const result = [];
  const seenIds = new Set();
  const seenNames = new Set();

  productNames.forEach((item) => {
    const name = getSaleNameText(item);

    if (!name) {
      return;
    }

    const id = getSaleNameId(item);

    if (
      id !== null &&
      id !== undefined &&
      String(id).trim() !== ""
    ) {
      const idKey = String(id);

      if (seenIds.has(idKey)) {
        return;
      }

      seenIds.add(idKey);
      result.push(item);
      return;
    }

    const nameKey = name.toLowerCase();

    if (seenNames.has(nameKey)) {
      return;
    }

    seenNames.add(nameKey);
    result.push(item);
  });

  return result;
};

/* -------------------------------------------------------------------------- */
/* Price helpers                                                              */
/* -------------------------------------------------------------------------- */

const getOriginalPrice = (product) =>
  product?.price ?? "";

const getOriginalDsPrice = (product) =>
  product?.ds_price ?? "";

const isPriceDifferent = (
  nextValue,
  originalValue
) => {
  if (
    nextValue === "" ||
    nextValue === null ||
    nextValue === undefined
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

const normalizePrice = (value) => {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return "";
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : value;
};

/* -------------------------------------------------------------------------- */
/* Guarantee helper                                                           */
/* -------------------------------------------------------------------------- */

const getGuaranteeValue = (product) => {
  return String(
    product?.guarantee ??
      product?.guarantee_period ??
      product?.warranty ??
      product?.warranty_period ??
      ""
  ).trim();
};

/* ============================================================================
 * Table UI key -> Product data key
 * ========================================================================== */

const COLUMN_KEY_MAP = {
  sku: "product_id",
  product_id: "product_id",

  category: "sub_category",
  sub_category: "sub_category",

  product: "product_name",
  product_name: "product_name",

  saleName: "sale_names",
  sale_names: "sale_names",

  guarantee: "guarantee",

  price: "price",
  dsPrice: "ds_price",
  ds_price: "ds_price",

  status: "status",

  updated: "last_updated",
  last_updated: "last_updated",
};

const normalizeColumnKey = (key) =>
  COLUMN_KEY_MAP[key] ?? key;

/* ============================================================================
 * CSV / Excel helper
 * ========================================================================== */

const escapeCsvValue = (value) => {
  const text = String(value ?? "");

  return `"${text.replace(/"/g, '""')}"`;
};

/* ============================================================================
 * Price Management Page
 * ========================================================================== */

const PriceManagementPage = () => {
  const navigate = useNavigate();

  const {
    data: allProductsData,
    isLoading,
    isFetching,
    refetch,
  } = useAdminAllProducts();

  const updatePrices = useUpdateProductPrices();
  const saveSaleName = useSaveSaleName();

  /* ==========================================================================
   * Base products
   * ======================================================================== */

  const allProducts = useMemo(() => {
    if (Array.isArray(allProductsData)) {
      return allProductsData;
    }

    if (Array.isArray(allProductsData?.results)) {
      return allProductsData.results;
    }

    return [];
  }, [allProductsData]);

  const products = useMemo(() => {
    return allProducts.filter(
      (product) =>
        product?.is_active === true &&
        !String(
          product?.sub_category ?? ""
        )
          .trim()
          .toUpperCase()
          .startsWith("TEMPERED")
    );
  }, [allProducts]);

  /* ==========================================================================
   * UI state
   * ======================================================================== */

  const [search, setSearch] = useState("");

  const [quickFilter, setQuickFilter] =
    useState("all");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("ALL");

  const [sort, setSort] = useState({
    key: "product_id",
    direction: "asc",
  });

  const [page, setPage] = useState(1);

  const [density, setDensity] =
    useState("compact");

  const [
    visibleColumns,
    setVisibleColumns,
  ] = useState([]);

  const [
    columnFilters,
    setColumnFilters,
  ] = useState({});

  const [
    frozenColumns,
    setFrozenColumns,
  ] = useState([]);

  const [
    selectedProductId,
    setSelectedProductId,
  ] = useState(null);

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
    useState("");

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState(new Date());

  const searchRef = useRef(null);

  /* ==========================================================================
   * Selected product
   * ======================================================================== */

  const selectedProduct = useMemo(() => {
    if (
      selectedProductId === null ||
      selectedProductId === undefined
    ) {
      return null;
    }

    return (
      products.find(
        (product) =>
          getProductId(product) ===
          Number(selectedProductId)
      ) ?? null
    );
  }, [
    products,
    selectedProductId,
  ]);

  /* ==========================================================================
   * Categories
   * ======================================================================== */

  const categories = useMemo(() => {
    const values = new Set();

    products.forEach((product) => {
      const category = String(
        product?.sub_category ?? ""
      ).trim();

      values.add(
        category || "UNCATEGORIZED"
      );
    });

    return Array.from(values).sort(
      (a, b) =>
        a.localeCompare(b)
    );
  }, [products]);

  const categoryCounts = useMemo(() => {
    const counts = {
      ALL: products.length,
    };

    products.forEach((product) => {
      const category = String(
        product?.sub_category ?? ""
      ).trim();

      const key =
        category || "UNCATEGORIZED";

      counts[key] =
        (counts[key] ?? 0) + 1;
    });

    return counts;
  }, [products]);

  /* ==========================================================================
   * Search
   * ======================================================================== */

  const searchFilteredProducts = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => {
      const productId = String(
        product?.product_id ??
          product?.id ??
          ""
      );

      const productName = String(
        product?.product_name ?? ""
      );

      const category = String(
        product?.sub_category ?? ""
      );

      const saleNames =
        getSaleNames(product).join(" ");

      const guarantee =
        getGuaranteeValue(product);

      return [
        productId,
        productName,
        category,
        saleNames,
        guarantee,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [
    products,
    search,
  ]);

  /* ==========================================================================
   * Category + filters
   * ======================================================================== */

  const filteredProducts = useMemo(() => {
    let result = searchFilteredProducts;

    if (selectedCategory !== "ALL") {
      result = result.filter((product) => {
        const category =
          String(
            product?.sub_category ?? ""
          ).trim() ||
          "UNCATEGORIZED";

        return (
          category === selectedCategory
        );
      });
    }

    if (quickFilter === "changed") {
      result = result.filter((product) =>
        Boolean(
          drafts[
            getProductId(product)
          ]
        )
      );
    }

    if (quickFilter === "missing") {
      result = result.filter(
        (product) =>
          getSaleNames(product)
            .length === 0
      );
    }

    Object.entries(
      columnFilters
    ).forEach(
      ([uiKey, filterValue]) => {
        if (
          filterValue === null ||
          filterValue === undefined ||
          String(filterValue).trim() === ""
        ) {
          return;
        }

        const key =
          normalizeColumnKey(uiKey);

        const selectedValues =
          String(filterValue)
            .split("||")
            .map((item) =>
              item.trim().toLowerCase()
            )
            .filter(Boolean);

        if (
          selectedValues.length === 0
        ) {
          return;
        }

        result = result.filter(
          (product) => {
            let value = "";

            switch (key) {
              case "product_id":
                value = String(
                  product?.product_id ??
                    product?.id ??
                    ""
                );
                break;

              case "sub_category":
                value = String(
                  product?.sub_category ??
                    ""
                );
                break;

              case "product_name":
                value = String(
                  product?.product_name ??
                    ""
                );
                break;

              case "guarantee":
                value =
                  getGuaranteeValue(
                    product
                  );
                break;

              case "sale_names":
                value =
                  getSaleNames(
                    product
                  ).join(" ");
                break;

              case "price": {
                const productId =
                  getProductId(
                    product
                  );

                const draft =
                  drafts[productId] ??
                  {};

                value = String(
                  draft.new_price ??
                    product?.price ??
                    ""
                );

                break;
              }

              case "ds_price": {
                const productId =
                  getProductId(
                    product
                  );

                const draft =
                  drafts[productId] ??
                  {};

                value = String(
                  draft.new_ds_price ??
                    product?.ds_price ??
                    ""
                );

                break;
              }

              case "status":
                value = String(
                  product?.status ??
                    (product?.is_active
                      ? "Active"
                      : "Inactive")
                );
                break;

              case "last_updated":
                value = String(
                  product?.last_updated ??
                    product?.updated_at ??
                    ""
                );
                break;

              default:
                value = String(
                  product?.[key] ?? ""
                );
            }

            const normalizedValue =
              value
                .trim()
                .toLowerCase();

            return selectedValues.some(
              (selectedValue) =>
                normalizedValue.includes(
                  selectedValue
                )
            );
          }
        );
      }
    );

    return result;
  }, [
    searchFilteredProducts,
    selectedCategory,
    quickFilter,
    drafts,
    columnFilters,
  ]);

  /* ==========================================================================
   * Sorting
   * ======================================================================== */

  const sortedProducts = useMemo(() => {
    const result = [
      ...filteredProducts,
    ];

    const normalizedSortKey =
      normalizeColumnKey(sort.key);

    const {
      direction,
    } = sort;

    const multiplier =
      direction === "desc"
        ? -1
        : 1;

    result.sort((a, b) => {
      const aId = getProductId(a);
      const bId = getProductId(b);

      const aDraft =
        drafts[aId] ?? {};

      const bDraft =
        drafts[bId] ?? {};

      let aValue;
      let bValue;

      if (
        normalizedSortKey ===
        "product_id"
      ) {
        aValue =
          a?.product_id ??
          a?.id ??
          "";

        bValue =
          b?.product_id ??
          b?.id ??
          "";
      } else if (
        normalizedSortKey ===
        "sub_category"
      ) {
        aValue =
          a?.sub_category ?? "";

        bValue =
          b?.sub_category ?? "";
      } else if (
        normalizedSortKey ===
        "product_name"
      ) {
        aValue =
          a?.product_name ?? "";

        bValue =
          b?.product_name ?? "";
      } else if (
        normalizedSortKey ===
        "guarantee"
      ) {
        aValue =
          getGuaranteeValue(a);

        bValue =
          getGuaranteeValue(b);
      } else if (
        normalizedSortKey ===
        "price"
      ) {
        aValue =
          aDraft.new_price ??
          a.price ??
          0;

        bValue =
          bDraft.new_price ??
          b.price ??
          0;
      } else if (
        normalizedSortKey ===
        "ds_price"
      ) {
        aValue =
          aDraft.new_ds_price ??
          a.ds_price ??
          0;

        bValue =
          bDraft.new_ds_price ??
          b.ds_price ??
          0;
      } else if (
        normalizedSortKey ===
        "sale_names"
      ) {
        aValue =
          getSaleNames(a)[0] ??
          "";

        bValue =
          getSaleNames(b)[0] ??
          "";
      } else if (
        normalizedSortKey ===
        "status"
      ) {
        aValue = String(
          a?.status ??
            (a?.is_active
              ? "Active"
              : "Inactive")
        );

        bValue = String(
          b?.status ??
            (b?.is_active
              ? "Active"
              : "Inactive")
        );
      } else if (
        normalizedSortKey ===
        "last_updated"
      ) {
        aValue =
          a?.last_updated ??
          a?.updated_at ??
          "";

        bValue =
          b?.last_updated ??
          b?.updated_at ??
          "";
      } else {
        aValue =
          a?.[normalizedSortKey] ??
          "";

        bValue =
          b?.[normalizedSortKey] ??
          "";
      }

      const aNumber = Number(aValue);
      const bNumber = Number(bValue);

      if (
        Number.isFinite(aNumber) &&
        Number.isFinite(bNumber) &&
        aValue !== "" &&
        bValue !== ""
      ) {
        return (
          (aNumber - bNumber) *
          multiplier
        );
      }

      return (
        String(aValue).localeCompare(
          String(bValue),
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
    sort,
    drafts,
  ]);

  /* ==========================================================================
   * Pagination
   * ======================================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedProducts.length /
        PAGE_SIZE
    )
  );

  const paginatedProducts =
    useMemo(() => {
      const start =
        (page - 1) *
        PAGE_SIZE;

      return sortedProducts.slice(
        start,
        start + PAGE_SIZE
      );
    }, [
      sortedProducts,
      page,
    ]);

  /* ==========================================================================
   * Changed items
   * ======================================================================== */

  const changedItems =
    useMemo(() => {
      return Object.entries(
        drafts
      ).map(
        ([productId, draft]) => ({
          product_id:
            Number(productId),
          new_price:
            draft.new_price,
          new_ds_price:
            draft.new_ds_price,
        })
      );
    }, [drafts]);

  /* ==========================================================================
   * Price editing
   * ======================================================================== */

  const handlePriceChange =
    useCallback(
      (
        productId,
        field,
        value
      ) => {
        const numericValue =
          normalizePrice(value);

        setDrafts((current) => {
          const product =
            products.find(
              (item) =>
                getProductId(item) ===
                Number(productId)
            );

          if (!product) {
            return current;
          }

          const original =
            field === "price"
              ? getOriginalPrice(
                  product
                )
              : getOriginalDsPrice(
                  product
                );

          const existing =
            current[productId] ?? {};

          const next = {
            ...existing,
          };

          const draftField =
            field === "price"
              ? "new_price"
              : "new_ds_price";

          if (
            !isPriceDifferent(
              numericValue,
              original
            )
          ) {
            delete next[draftField];
          } else {
            next[draftField] =
              numericValue;
          }

          if (
            Object.keys(next)
              .length === 0
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
      [products]
    );

  /* ==========================================================================
   * Focus cell
   * ======================================================================== */

  const focusCell = useCallback(
    (
      productId,
      field
    ) => {
      setFocusedCell({
        productId:
          Number(productId),
        field,
      });

      requestAnimationFrame(() => {
        const element =
          document.querySelector(
            `[data-price-cell="${productId}-${field}"]`
          );

        if (element) {
          element.focus();
          element.select?.();
        }
      });
    },
    []
  );

  /* ==========================================================================
   * Formula bar value
   * ======================================================================== */

  const formulaValue =
    useMemo(() => {
      if (!focusedCell) {
        return "";
      }

      const product =
        products.find(
          (item) =>
            getProductId(item) ===
            Number(
              focusedCell.productId
            )
        );

      if (!product) {
        return "";
      }

      const draft =
        drafts[
          focusedCell.productId
        ] ?? {};

      if (
        focusedCell.field ===
        "price"
      ) {
        return (
          draft.new_price ??
          product.price ??
          ""
        );
      }

      if (
        focusedCell.field ===
        "ds_price"
      ) {
        return (
          draft.new_ds_price ??
          product.ds_price ??
          ""
        );
      }

      return "";
    }, [
      focusedCell,
      products,
      drafts,
    ]);

  const handleFormulaChange =
    useCallback(
      (value) => {
        if (!focusedCell) {
          return;
        }

        handlePriceChange(
          focusedCell.productId,
          focusedCell.field,
          value
        );
      },
      [
        focusedCell,
        handlePriceChange,
      ]
    );

  const handleFormulaConfirm =
    useCallback(() => {
      if (!focusedCell) {
        return;
      }

      focusCell(
        focusedCell.productId,
        focusedCell.field
      );
    }, [
      focusedCell,
      focusCell,
    ]);

  /* ==========================================================================
   * Column controls
   * ======================================================================== */

  const handleColumnSort =
    useCallback(
      (key, direction) => {
        const normalizedKey =
          normalizeColumnKey(key);

        setSort({
          key: normalizedKey,
          direction,
        });

        setPage(1);
      },
      []
    );

  const handleColumnFilter =
    useCallback(
      (key, value) => {
        setColumnFilters(
          (current) => ({
            ...current,
            [key]: value,
          })
        );

        setPage(1);
      },
      []
    );

  const handleClearColumnFilter =
    useCallback((key) => {
      setColumnFilters(
        (current) => {
          const next = {
            ...current,
          };

          delete next[key];

          return next;
        }
      );

      setPage(1);
    }, []);

  const handleHideColumn =
    useCallback((key) => {
      setVisibleColumns(
        (current) => {
          const existing =
            current.length > 0
              ? current
              : TABLE_COLUMNS.map(
                  (item) =>
                    item.key
                );

          const normalizedKey =
            normalizeColumnKey(key);

          return existing.filter(
            (item) =>
              normalizeColumnKey(
                item
              ) !== normalizedKey
          );
        }
      );
    }, []);

  const handleToggleColumn =
    useCallback((key) => {
      setVisibleColumns(
        (current) => {
          const allKeys =
            TABLE_COLUMNS.map(
              (item) =>
                item.key
            );

          const normalizedKey =
            normalizeColumnKey(key);

          const existing =
            current.length > 0
              ? current
              : allKeys;

          const hasColumn =
            existing.some(
              (item) =>
                normalizeColumnKey(
                  item
                ) ===
                normalizedKey
            );

          if (hasColumn) {
            if (
              existing.length ===
              1
            ) {
              return existing;
            }

            return existing.filter(
              (item) =>
                normalizeColumnKey(
                  item
                ) !==
                normalizedKey
            );
          }

          if (
            allKeys.includes(
              normalizedKey
            )
          ) {
            return [
              ...existing,
              normalizedKey,
            ];
          }

          return existing;
        }
      );
    }, []);

  const handleFreezeColumn =
    useCallback((key) => {
      const normalizedKey =
        normalizeColumnKey(key);

      setFrozenColumns(
        (current) =>
          current.includes(
            normalizedKey
          )
            ? current.filter(
                (item) =>
                  item !==
                  normalizedKey
              )
            : [
                ...current,
                normalizedKey,
              ]
      );
    }, []);

  /* ==========================================================================
   * SALE NAME
   *
   * Rule:
   * - No Sale Name -> ADD / POST
   * - Existing Sale Name with ID -> EDIT / PATCH
   * - Existing Sale Name without ID -> POST blocked
   *
   * This version does NOT import getSaleNamesByProduct directly.
   * ======================================================================== */

  const handleAddSaleName =
    useCallback(
      async (
        productOrId,
        saleName,
        saleRecord = null
      ) => {
        let productId = null;
        let finalSaleName =
          saleName;

        /* ------------------------------------------------------------------ */
        /* Resolve Product ID                                                  */
        /* ------------------------------------------------------------------ */

        if (
          productOrId !== null &&
          productOrId !== undefined &&
          (
            typeof productOrId ===
              "number" ||
            typeof productOrId ===
              "string"
          )
        ) {
          productId =
            Number(productOrId);
        } else if (
          productOrId &&
          typeof productOrId ===
            "object"
        ) {
          productId =
            getProductId(
              productOrId
            );
        }

        if (
          finalSaleName ===
            undefined &&
          typeof productOrId ===
            "string"
        ) {
          finalSaleName =
            productOrId;

          productId =
            selectedProductId;
        }

        if (
          !Number.isFinite(
            Number(productId)
          ) ||
          Number(productId) <= 0
        ) {
          productId =
            selectedProductId;
        }

        const cleanSaleName =
          String(
            finalSaleName ?? ""
          ).trim();

        if (
          !Number.isFinite(
            Number(productId)
          ) ||
          Number(productId) <= 0
        ) {
          console.warn(
            "Sale Name skipped: Product ID missing."
          );
          return;
        }

        if (!cleanSaleName) {
          return;
        }

        /* ------------------------------------------------------------------ */
        /* Current product                                                      */
        /* ------------------------------------------------------------------ */

        const currentProduct =
          products.find(
            (product) =>
              getProductId(
                product
              ) ===
              Number(productId)
          ) ??
          (
            selectedProduct &&
            getProductId(
              selectedProduct
            ) ===
              Number(productId)
              ? selectedProduct
              : null
          );

        const existingRecords =
          getProductSaleNameRecords(
            currentProduct
          );

        /* ------------------------------------------------------------------ */
        /* Resolve direct Sale Name record ID                                  */
        /* ------------------------------------------------------------------ */

        let directSaleNameId =
          getSaleNameId(
            saleRecord
          );

        /*
         * Agar table ne record nahi diya,
         * product.sale_names ke object se ID lene ki koshish.
         */
        if (
          directSaleNameId === null ||
          directSaleNameId === undefined ||
          String(
            directSaleNameId
          ).trim() === ""
        ) {
          if (
            existingRecords.length >
            0
          ) {
            directSaleNameId =
              getSaleNameId(
                existingRecords[0]
              );
          }
        }

        /* ------------------------------------------------------------------ */
        /* Existing record -> PATCH                                            */
        /* ------------------------------------------------------------------ */

        if (
          directSaleNameId !== null &&
          directSaleNameId !== undefined &&
          String(
            directSaleNameId
          ).trim() !== ""
        ) {
          await saveSaleName.mutateAsync({
            mode: "edit",
            product_id:
              Number(productId),
            sale_name_id:
              directSaleNameId,
            sale_name:
              cleanSaleName,
          });

          return;
        }

        /* ------------------------------------------------------------------ */
        /* Existing Sale Name but no ID -> block duplicate POST                */
        /* ------------------------------------------------------------------ */

        if (
          existingRecords.length >
          0
        ) {
          console.warn(
            "Sale Name already exists, but Sale Name ID is unavailable. POST blocked."
          );

          return;
        }

        /* ------------------------------------------------------------------ */
        /* No Sale Name -> POST                                                 */
        /* ------------------------------------------------------------------ */

        await saveSaleName.mutateAsync({
          mode: "add",
          product_id:
            Number(productId),
          sale_name:
            cleanSaleName,
        });
      },
      [
        products,
        selectedProduct,
        selectedProductId,
        saveSaleName,
      ]
    );

  /* ==========================================================================
   * Product selection
   * ======================================================================== */

  const handleProductSelect =
    useCallback((product) => {
      if (!product) {
        setSelectedProductId(null);
        return;
      }

      setSelectedProductId(
        getProductId(product)
      );
    }, []);

  /* ==========================================================================
   * Product history
   * ======================================================================== */

  const handleViewProductHistory =
    useCallback(() => {
      if (!selectedProduct) {
        return;
      }

      const productId =
        getProductId(
          selectedProduct
        );

      if (
        !Number.isFinite(productId) ||
        productId <= 0
      ) {
        return;
      }

      navigate(
        `/price-history?product_id=${productId}`
      );
    }, [
      selectedProduct,
      navigate,
    ]);

  /* ==========================================================================
   * Copy SKU
   * ======================================================================== */

  const handleCopySku =
    useCallback(async (sku) => {
      const value = String(
        sku ?? ""
      ).trim();

      if (!value) {
        return;
      }

      try {
        if (
          navigator.clipboard?.writeText
        ) {
          await navigator.clipboard.writeText(
            value
          );

          return;
        }

        const textarea =
          document.createElement(
            "textarea"
          );

        textarea.value = value;
        textarea.style.position =
          "fixed";
        textarea.style.opacity =
          "0";

        document.body.appendChild(
          textarea
        );

        textarea.focus();
        textarea.select();

        document.execCommand(
          "copy"
        );

        textarea.remove();
      } catch (error) {
        console.error(
          "Failed to copy SKU:",
          error
        );
      }
    }, []);

  /* ==========================================================================
   * EXPORT
   *
   * CSV file Excel mein directly open hoti hai.
   * Current filtered products export honge.
   * ======================================================================== */

const handleExportProduct = useCallback(() => {
  exportPriceManagementExcel(sortedProducts);
}, [sortedProducts]);

  /* ==========================================================================
   * Save prices
   * ======================================================================== */

  const saveChanges =
    useCallback(async () => {
      if (
        changedItems.length ===
        0
      ) {
        return;
      }

      await updatePrices.mutateAsync({
        applicable_from:
          applicableFrom,
        reason:
          reason.trim(),
        items:
          changedItems,
      });

      setDrafts({});
      setFocusedCell(null);

      setLastUpdated(
        new Date()
      );
    }, [
      changedItems,
      applicableFrom,
      reason,
      updatePrices,
    ]);

  /* ==========================================================================
   * Refresh
   * ======================================================================== */

  const handleRefresh =
    useCallback(async () => {
      await refetch();

      setLastUpdated(
        new Date()
      );
    }, [refetch]);

  /* ==========================================================================
   * Keyboard shortcuts
   * ======================================================================== */

  useEffect(() => {
    const handleKeyDown =
      (event) => {
        if (
          (event.ctrlKey ||
            event.metaKey) &&
          event.key.toLowerCase() ===
            "k"
        ) {
          event.preventDefault();

          searchRef.current?.focus();
          searchRef.current?.select();
        }

        if (
          (event.ctrlKey ||
            event.metaKey) &&
          event.key.toLowerCase() ===
            "s"
        ) {
          event.preventDefault();

          if (
            changedItems.length > 0 &&
            !updatePrices.isPending
          ) {
            saveChanges();
          }
        }
      };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [
    changedItems.length,
    updatePrices.isPending,
    saveChanges,
  ]);

  /* ==========================================================================
   * Reset page
   * ======================================================================== */

  useEffect(() => {
    setPage(1);
  }, [
    search,
    quickFilter,
    selectedCategory,
    columnFilters,
  ]);

  const changedCount =
    changedItems.length;

  /* ==========================================================================
   * Render
   * ======================================================================== */

  return (
    <div className="flex h-full min-h-0 flex-col bg-gray-50">
      {/* ================================================================== */}
      {/* Header                                                             */}
      {/* ================================================================== */}

      <div className="shrink-0 border-b border-gray-200 bg-white">
        <div className="flex h-[58px] items-center justify-between px-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[16px] font-semibold text-gray-800">
                Price Management
              </h1>

              <span className="text-[10px] text-gray-400">
                {products.length.toLocaleString(
                  "en-IN"
                )}{" "}
                products
              </span>

              {changedCount > 0 && (
                <span className="bg-blue-50 px-2 py-1 text-[9px] font-semibold text-blue-600">
                  {changedCount} changed
                </span>
              )}
            </div>

            <div className="mt-0.5 text-[10px] text-gray-400">
              Manage SS & DS prices
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400">
                Applicable from
              </span>

              <input
                type="date"
                value={
                  applicableFrom
                }
                onChange={(event) =>
                  setApplicableFrom(
                    event.target.value
                  )
                }
                className="h-[30px] border border-gray-200 bg-white px-2 text-[10px] text-gray-600 outline-none focus:border-blue-400"
              />
            </label>

            <label className="hidden items-center gap-2 xl:flex">
              <span className="text-[10px] text-gray-400">
                Reason
              </span>

              <input
                value={reason}
                onChange={(event) =>
                  setReason(
                    event.target.value
                  )
                }
                placeholder="Optional"
                className="h-[30px] w-[150px] border border-gray-200 bg-white px-2 text-[10px] outline-none focus:border-blue-400"
              />
            </label>
          </div>
        </div>

        <PriceManagementToolbar
          search={search}
          onSearchChange={
            setSearch
          }
          quickFilter={
            quickFilter
          }
          onQuickFilterChange={
            setQuickFilter
          }
          changedCount={
            changedCount
          }
          totalCount={
            filteredProducts.length
          }
          columns={
            TABLE_COLUMNS
          }
          visibleColumns={
            visibleColumns
          }
          onToggleColumn={
            handleToggleColumn
          }
          density={density}
          onDensityChange={
            setDensity
          }
          onRefresh={
            handleRefresh
          }
          saving={
            updatePrices.isPending
          }
          hasChanges={
            changedCount > 0
          }
          onSave={
            saveChanges
          }
          lastUpdated={
            lastUpdated
          }
          syncStatus={
            updatePrices.isPending
              ? "saving"
              : "saved"
          }
          searchInputRef={
            searchRef
          }

          /* Extra supported actions */
          onExport={
            handleExportProduct
          }
          onCopySku={
            handleCopySku
          }
        />
      </div>

      {/* ================================================================== */}
      {/* Main                                                               */}
      {/* ================================================================== */}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-hidden">
            <PriceManagementTable
              products={
                paginatedProducts
              }
              allProducts={
                products
              }
              drafts={drafts}
              onPriceChange={
                handlePriceChange
              }
              focusedCell={
                focusedCell
              }
              onFocusCell={
                focusCell
              }
              onProductSelect={
                handleProductSelect
              }
              selectedProduct={
                selectedProduct
              }
              density={density}
              visibleColumns={
                visibleColumns
              }
              columnFilters={
                columnFilters
              }
              frozenColumns={
                frozenColumns
              }
              sort={sort}
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
              onFreezeColumn={
                handleFreezeColumn
              }
              onSaleNameChange={
                handleAddSaleName
              }
              isLoading={
                isLoading
              }
              isFetching={
                isFetching
              }
            />
          </div>

          {/* ============================================================ */}
          {/* Category Tabs                                                 */}
          {/* ============================================================ */}

          <PriceManagementCategoryTabs
            categories={
              categories
            }
            selectedCategory={
              selectedCategory
            }
            onCategoryChange={(
              category
            ) => {
              setSelectedCategory(
                category
              );

              setPage(1);
            }}
            categoryCounts={
              categoryCounts
            }
          />
        </div>
      </div>

      {/* ================================================================== */}
      {/* Bottom Pagination                                                  */}
      {/* ================================================================== */}

      <div className="flex h-[38px] shrink-0 items-center justify-between border-t border-gray-200 bg-white px-4">
        <span className="text-[10px] text-gray-400">
          Showing{" "}
          {sortedProducts.length ===
          0
            ? 0
            : (page - 1) *
                PAGE_SIZE +
              1}{" "}
          –{" "}
          {Math.min(
            page * PAGE_SIZE,
            sortedProducts.length
          )}{" "}
          of{" "}
          {sortedProducts.length}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() =>
              setPage(
                (current) =>
                  Math.max(
                    1,
                    current - 1
                  )
              )
            }
            className="flex h-[26px] w-[26px] items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
          >
            ‹
          </button>

          <span className="px-2 text-[10px] text-gray-500">
            {page} /{" "}
            {totalPages}
          </span>

          <button
            type="button"
            disabled={
              page >= totalPages
            }
            onClick={() =>
              setPage(
                (current) =>
                  Math.min(
                    totalPages,
                    current + 1
                  )
              )
            }
            className="flex h-[26px] w-[26px] items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * Table Columns
 * ========================================================================== */

const TABLE_COLUMNS = [
  {
    key: "product_id",
    label: "SKU",
    type: "number",
  },
  {
    key: "sub_category",
    label: "Category",
    type: "text",
  },
  {
    key: "product_name",
    label: "Product",
    type: "text",
  },
  {
    key: "guarantee",
    label: "Guarantee",
    type: "text",
  },
  {
    key: "sale_names",
    label: "Sale Name",
    type: "text",
  },
  {
    key: "price",
    label: "SS Price",
    type: "price",
  },
  {
    key: "ds_price",
    label: "DS Price",
    type: "price",
  },
  {
    key: "status",
    label: "Status",
    type: "text",
  },
  {
    key: "last_updated",
    label: "Last Updated",
    type: "text",
  },
];

export default PriceManagementPage;