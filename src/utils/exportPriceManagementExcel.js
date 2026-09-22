import * as XLSX from "xlsx-js-style";

/* ============================================================================
   HELPERS
============================================================================ */

const getProductId = (p) =>
  p?.product_id ?? p?.id ?? "";

const getCategory = (p) =>
  String(p?.sub_category ?? p?.category ?? "UNCATEGORIZED").trim() ||
  "UNCATEGORIZED";

const getProductName = (p) =>
  p?.product_name ?? p?.name ?? "";

const getGuarantee = (p) =>
  p?.guarantee ??
  p?.guarantee_period ??
  p?.warranty ??
  p?.warranty_period ??
  "";

const getCartonSize = (p) =>
  p?.cartoon_size ??
  p?.cartonSize ??
  p?.carton ??
  p?.carton_quantity ??
  p?.carton_qty ??
  "";

const normalizeCategory = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();

/* ============================================================================
   SALE NAME
   Latest active Sale Name only
============================================================================ */

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

const getSaleNameId = (item) =>
  item && typeof item === "object"
    ? item?.id ?? item?.sale_name_id ?? item?.pk ?? null
    : null;

const getSaleNameDate = (item) => {
  if (!item || typeof item !== "object") return 0;

  const value =
    item?.updated_at ??
    item?.updatedAt ??
    item?.created_at ??
    item?.createdAt ??
    item?.date ??
    item?.timestamp ??
    "";

  const time = value ? new Date(value).getTime() : 0;

  return Number.isFinite(time) ? time : 0;
};

const getLatestActiveSaleName = (product) => {
  const saleNames = product?.sale_names;

  if (!saleNames) return "";

  if (typeof saleNames === "string") {
    const names = saleNames
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    return names.at(-1) || "";
  }

  if (!Array.isArray(saleNames) || !saleNames.length) {
    return "";
  }

  const active = saleNames.filter(
    (item) =>
      !item ||
      typeof item !== "object" ||
      (item?.is_active !== false &&
        item?.active !== false)
  );

  const records = active.length ? active : saleNames;

  const objects = records.filter(
    (item) =>
      item &&
      typeof item === "object"
  );

  if (!objects.length) {
    return (
      records
        .map(getSaleNameText)
        .filter(Boolean)
        .at(-1) || ""
    );
  }

  return getSaleNameText(
    [...objects].sort((a, b) => {
      const dateDiff =
        getSaleNameDate(b) -
        getSaleNameDate(a);

      if (dateDiff) return dateDiff;

      const idA = Number(
        getSaleNameId(a) ?? 0
      );

      const idB = Number(
        getSaleNameId(b) ?? 0
      );

      if (
        Number.isFinite(idA) &&
        Number.isFinite(idB) &&
        idA !== idB
      ) {
        return idB - idA;
      }

      return (
        saleNames.indexOf(b) -
        saleNames.indexOf(a)
      );
    })[0]
  );
};

/* ============================================================================
   COMBINED CATEGORY GROUPS
============================================================================ */

const COMBINED_CATEGORY_GROUPS = [
  {
    sheetName: "P.B ,LED LIGHT & AUX CABLE",

    sections: [
      {
        title: "P.B",
        aliases: [
          "P.B",
          "PB",
          "P B",
          "P.B.",
        ],
      },
      {
        title: "LED LIGHT",
        aliases: [
          "LED LIGHT",
          "LED LIGHTS",
        ],
      },
      {
        title: "LED TORCH",
        aliases: [
          "LED TORCH",
          "TORCH",
          "LED TORCHES",
        ],
      },
      {
        title: "AUX CABLE",
        aliases: [
          "AUX CABLE",
          "AUX CABLES",
        ],
      },
      {
        title: "PORTABLE FAN",
        aliases: [
          "PORTABLE FAN",
          "PORTABLE FANS",
        ],
      },
      {
        title: "BT CELL",
        aliases: [
          "BT CELL",
          "BT CELLS",
          "BLUETOOTH CELL",
        ],
      },
    ],
  },
];

const findCombinedSection = (category) => {
  const normalized = normalizeCategory(category);

  for (const group of COMBINED_CATEGORY_GROUPS) {
    for (const section of group.sections) {
      if (
        section.aliases.some(
          (alias) =>
            normalizeCategory(alias) ===
            normalized
        )
      ) {
        return {
          group,
          section,
        };
      }
    }
  }

  return null;
};

/* ============================================================================
   SAFE SHEET NAME
============================================================================ */

const cleanSheetName = (name, usedNames) => {
  let sheetName = String(
    name || "UNCATEGORIZED"
  )
    .replace(/[\\/?*[\]:]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 31);

  if (!sheetName) {
    sheetName = "UNCATEGORIZED";
  }

  let finalName = sheetName;
  let counter = 1;

  while (usedNames.has(finalName)) {
    const suffix = ` (${counter})`;

    finalName =
      sheetName.substring(
        0,
        31 - suffix.length
      ) + suffix;

    counter++;
  }

  usedNames.add(finalName);

  return finalName;
};

/* ============================================================================
   EXCEL STYLES
============================================================================ */

const BORDER = {
  top: {
    style: "thin",
    color: { rgb: "000000" },
  },
  bottom: {
    style: "thin",
    color: { rgb: "000000" },
  },
  left: {
    style: "thin",
    color: { rgb: "000000" },
  },
  right: {
    style: "thin",
    color: { rgb: "000000" },
  },
};

const CATEGORY_TITLE_STYLE = {
  font: {
    bold: true,
    color: { rgb: "FFFFFF" },
    sz: 16,
  },

  fill: {
    fgColor: { rgb: "FF0000" },
  },

  alignment: {
    horizontal: "center",
    vertical: "center",
  },

  border: BORDER,
};

const HEADER_STYLE = {
  font: {
    bold: true,
    color: { rgb: "FF0000" },
    sz: 11,
  },

  fill: {
    fgColor: { rgb: "FFFFFF" },
  },

  alignment: {
    horizontal: "center",
    vertical: "center",
    wrapText: true,
  },

  border: BORDER,
};

const DATA_STYLE = {
  font: {
    bold: true,
    color: { rgb: "000000" },
    sz: 10,
  },

  alignment: {
    vertical: "center",
    horizontal: "center",
  },

  border: BORDER,
};

const DATA_LEFT_STYLE = {
  ...DATA_STYLE,

  alignment: {
    vertical: "center",
    horizontal: "left",
  },
};

/* ============================================================================
   ADD CATEGORY SECTION
============================================================================ */

const addCategorySection = (
  worksheet,
  startRow,
  categoryTitle,
  products
) => {
  /*
    Final Excel columns:

    SL. NO.
    MODEL
    GUARANTEE
    CARTON
    SS PRICE
    DS PRICE
    DLR PRICE

    Product ID and Sale Name are not exported.
  */

  const columns = [
    "SL. NO.",
    "MODEL",
    "GUARANTEE",
    "CARTON",
    "SS PRICE",
    "DS PRICE",
    "DLR PRICE",
  ];

  const titleRow = startRow;
  const headerRow = startRow + 1;
  const dataStartRow = startRow + 2;
  const columnCount = columns.length;

  /* CATEGORY TITLE */

  XLSX.utils.sheet_add_aoa(
    worksheet,
    [[categoryTitle]],
    {
      origin: {
        r: titleRow,
        c: 0,
      },
    }
  );

  worksheet["!merges"] =
    worksheet["!merges"] || [];

  worksheet["!merges"].push({
    s: {
      r: titleRow,
      c: 0,
    },
    e: {
      r: titleRow,
      c: columnCount - 1,
    },
  });

  const titleCell =
    XLSX.utils.encode_cell({
      r: titleRow,
      c: 0,
    });

  worksheet[titleCell].s =
    CATEGORY_TITLE_STYLE;

  /* HEADER */

  XLSX.utils.sheet_add_aoa(
    worksheet,
    [columns],
    {
      origin: {
        r: headerRow,
        c: 0,
      },
    }
  );

  columns.forEach((_, columnIndex) => {
    const cell =
      XLSX.utils.encode_cell({
        r: headerRow,
        c: columnIndex,
      });

    worksheet[cell].s =
      HEADER_STYLE;
  });

  /* DATA */

  const dataRows = products.map(
    (product, index) => [
      index + 1,
      getProductName(product),
      getGuarantee(product),
      getCartonSize(product),
      product?.price ?? "",
      product?.ds_price ?? "",
      product?.dlr_price ?? "",
    ]
  );

  if (dataRows.length) {
    XLSX.utils.sheet_add_aoa(
      worksheet,
      dataRows,
      {
        origin: {
          r: dataStartRow,
          c: 0,
        },
      }
    );

    dataRows.forEach(
      (row, rowIndex) => {
        row.forEach(
          (_, columnIndex) => {
            const cell =
              XLSX.utils.encode_cell({
                r:
                  dataStartRow +
                  rowIndex,
                c: columnIndex,
              });

            worksheet[cell].s =
              columnIndex === 1
                ? DATA_LEFT_STYLE
                : DATA_STYLE;
          }
        );
      }
    );
  }

  /* ROW HEIGHTS */

  worksheet["!rows"] =
    worksheet["!rows"] || [];

  worksheet["!rows"][titleRow] = {
    hpt: 25,
  };

  worksheet["!rows"][headerRow] = {
    hpt: 32,
  };

  for (
    let i = 0;
    i < dataRows.length;
    i++
  ) {
    worksheet["!rows"][
      dataStartRow + i
    ] = {
      hpt: 22,
    };
  }

  return (
    dataStartRow +
    dataRows.length +
    1
  );
};

/* ============================================================================
   CREATE COMBINED SHEET
============================================================================ */

const createCombinedCategorySheet = (
  workbook,
  group,
  products
) => {
  const worksheet =
    XLSX.utils.aoa_to_sheet([]);

  let currentRow = 0;

  group.sections.forEach(
    (section) => {
      const sectionProducts =
        products.filter((product) =>
          section.aliases.some(
            (alias) =>
              normalizeCategory(alias) ===
              normalizeCategory(
                getCategory(product)
              )
          )
        );

      if (!sectionProducts.length) {
        return;
      }

      currentRow =
        addCategorySection(
          worksheet,
          currentRow,
          section.title,
          sectionProducts
        );
    }
  );

  worksheet["!cols"] = [
    { wch: 10 }, // SL NO
    { wch: 34 }, // MODEL
    { wch: 20 }, // GUARANTEE
    { wch: 14 }, // CARTON
    { wch: 14 }, // SS PRICE
    { wch: 14 }, // DS PRICE
    { wch: 14 }, // DLR PRICE
  ];

  const sheetName =
    cleanSheetName(
      group.sheetName,
      new Set(workbook.SheetNames)
    );

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    sheetName
  );
};

/* ============================================================================
   CREATE NORMAL CATEGORY SHEET
============================================================================ */

const createNormalCategorySheet = (
  workbook,
  category,
  products
) => {
  const worksheet =
    XLSX.utils.aoa_to_sheet([]);

  addCategorySection(
    worksheet,
    0,
    category,
    products
  );

  worksheet["!cols"] = [
    { wch: 10 }, // SL NO
    { wch: 34 }, // MODEL
    { wch: 20 }, // GUARANTEE
    { wch: 14 }, // CARTON
    { wch: 14 }, // SS PRICE
    { wch: 14 }, // DS PRICE
    { wch: 14 }, // DLR PRICE
  ];

  const sheetName =
    cleanSheetName(
      category,
      new Set(workbook.SheetNames)
    );

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    sheetName
  );
};

/* ============================================================================
   MAIN EXPORT
============================================================================ */

export const exportPriceManagementExcel = (
  products = [],
  effectiveDate = "2026-09-01"
) => {
  if (
    !Array.isArray(products) ||
    !products.length
  ) {
    alert(
      "No product data available to export."
    );
    return;
  }

  const workbook =
    XLSX.utils.book_new();

  /* GROUP PRODUCTS BY CATEGORY */

  const categoryMap =
    products.reduce(
      (groups, product) => {
        const category =
          getCategory(product);

        const key =
          normalizeCategory(category);

        if (!groups[key]) {
          groups[key] = {
            category,
            products: [],
          };
        }

        groups[key].products.push(
          product
        );

        return groups;
      },
      {}
    );

  /* CATEGORIES INSIDE COMBINED SHEETS */

  const combinedCategoryKeys =
    new Set();

  COMBINED_CATEGORY_GROUPS.forEach(
    (group) =>
      group.sections.forEach(
        (section) =>
          section.aliases.forEach(
            (alias) =>
              combinedCategoryKeys.add(
                normalizeCategory(alias)
              )
          )
      )
  );

  /* COMBINED SHEETS */

  COMBINED_CATEGORY_GROUPS.forEach(
    (group) => {
      const groupProducts = [];

      group.sections.forEach(
        (section) => {
          section.aliases.forEach(
            (alias) => {
              const data =
                categoryMap[
                  normalizeCategory(alias)
                ];

              if (
                data?.products?.length
              ) {
                groupProducts.push(
                  ...data.products
                );
              }
            }
          );
        }
      );

      if (!groupProducts.length) {
        return;
      }

      /* Remove duplicate references */

      const uniqueProducts =
        Array.from(
          new Set(groupProducts)
        );

      createCombinedCategorySheet(
        workbook,
        group,
        uniqueProducts
      );
    }
  );

  /* NORMAL CATEGORY SHEETS */

  Object.entries(categoryMap)
    .sort(([, a], [, b]) =>
      a.category.localeCompare(
        b.category,
        undefined,
        {
          sensitivity: "base",
        }
      )
    )
    .forEach(([key, data]) => {
      if (
        combinedCategoryKeys.has(key)
      ) {
        return;
      }

      createNormalCategorySheet(
        workbook,
        data.category,
        data.products
      );
    });

  /* FILE NAME */

  let dateObject = new Date(
    `${effectiveDate}T00:00:00`
  );

  if (
    Number.isNaN(
      dateObject.getTime()
    )
  ) {
    dateObject = new Date();
  }

  const day = String(
    dateObject.getDate()
  ).padStart(2, "0");

  const month = String(
    dateObject.getMonth() + 1
  ).padStart(2, "0");

  const year =
    dateObject.getFullYear();

  XLSX.writeFile(
    workbook,
    `S.S PRICE ${day}-${month}-${year}.xlsx`
  );
};