import * as XLSX from "xlsx-js-style";

/* ============================================================================
 * BASIC HELPERS
 * ========================================================================== */

const getProductId = (product) =>
  product?.product_id ??
  product?.id ??
  "";

const getCategory = (product) =>
  String(
    product?.sub_category ??
      product?.category ??
      "UNCATEGORIZED"
  ).trim() || "UNCATEGORIZED";

const getProductName = (product) =>
  product?.product_name ??
  product?.name ??
  "";

const getGuarantee = (product) =>
  product?.guarantee ??
  product?.guarantee_period ??
  product?.warranty ??
  product?.warranty_period ??
  "";

/* ============================================================================
 * SALE NAME
 *
 * Only ONE Sale Name:
 * Active + latest
 * ========================================================================== */

const getSaleNameText = (item) => {
  if (
    item === null ||
    item === undefined
  ) {
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
  if (
    item &&
    typeof item === "object"
  ) {
    return (
      item?.id ??
      item?.sale_name_id ??
      item?.pk ??
      null
    );
  }

  return null;
};

const getSaleNameDate = (item) => {
  if (
    !item ||
    typeof item !== "object"
  ) {
    return 0;
  }

  const value =
    item?.updated_at ??
    item?.updatedAt ??
    item?.created_at ??
    item?.createdAt ??
    item?.date ??
    item?.timestamp ??
    "";

  if (!value) {
    return 0;
  }

  const time =
    new Date(value).getTime();

  return Number.isFinite(time)
    ? time
    : 0;
};

const getLatestActiveSaleName = (
  product
) => {
  const saleNames =
    product?.sale_names;

  if (!saleNames) {
    return "";
  }

  if (typeof saleNames === "string") {
    const names = saleNames
      .split(",")
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);

    return names.length
      ? names[names.length - 1]
      : "";
  }

  if (!Array.isArray(saleNames)) {
    return "";
  }

  if (saleNames.length === 0) {
    return "";
  }

  const activeRecords =
    saleNames.filter((item) => {
      if (
        !item ||
        typeof item !== "object"
      ) {
        return true;
      }

      return (
        item?.is_active !== false &&
        item?.active !== false
      );
    });

  const records =
    activeRecords.length
      ? activeRecords
      : saleNames;

  const objectRecords =
    records.filter(
      (item) =>
        item &&
        typeof item === "object"
    );

  if (
    objectRecords.length === 0
  ) {
    const names = records
      .map(getSaleNameText)
      .filter(Boolean);

    return names.length
      ? names[names.length - 1]
      : "";
  }

  const sortedRecords = [
    ...objectRecords,
  ].sort((a, b) => {
    const dateA =
      getSaleNameDate(a);

    const dateB =
      getSaleNameDate(b);

    if (dateA !== dateB) {
      return dateB - dateA;
    }

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
  });

  return getSaleNameText(
    sortedRecords[0]
  );
};

/* ============================================================================
 * CATEGORY NORMALIZATION
 * ========================================================================== */

const normalizeCategory = (
  value
) =>
  String(
    value ?? ""
  )
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();

/* ============================================================================
 * COMBINED CATEGORY GROUPS
 *
 * IMPORTANT:
 *
 * Actual backend category:
 *     LED TORCH
 *
 * Previous code had:
 *     TORCH
 *
 * That is why LED TORCH was creating a separate sheet.
 *
 * Ab aliases bhi diye gaye hain so future naming variation
 * se category separate sheet mein nahi niklegi.
 * ========================================================================== */

const COMBINED_CATEGORY_GROUPS = [
  {
    sheetName:
      "P.B ,LED LIGHT & AUX CABLE",

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

/* ============================================================================
 * FIND SECTION FOR CATEGORY
 * ========================================================================== */

const findCombinedSection = (
  category
) => {
  const normalized =
    normalizeCategory(
      category
    );

  for (
    const group of COMBINED_CATEGORY_GROUPS
  ) {
    for (
      const section of group.sections
    ) {
      const found =
        section.aliases.some(
          (alias) =>
            normalizeCategory(
              alias
            ) === normalized
        );

      if (found) {
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
 * SAFE SHEET NAME
 * ========================================================================== */

const cleanSheetName = (
  name,
  usedNames
) => {
  let sheetName = String(
    name ||
      "UNCATEGORIZED"
  )
    .replace(
      /[\\/?*[\]:]/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

  if (!sheetName) {
    sheetName =
      "UNCATEGORIZED";
  }

  sheetName =
    sheetName.substring(
      0,
      31
    );

  let finalName =
    sheetName;

  let counter = 1;

  while (
    usedNames.has(
      finalName
    )
  ) {
    const suffix =
      ` (${counter})`;

    finalName =
      sheetName.substring(
        0,
        31 -
          suffix.length
      ) + suffix;

    counter++;
  }

  usedNames.add(
    finalName
  );

  return finalName;
};

/* ============================================================================
 * EXCEL STYLES
 * ========================================================================== */

const BORDER = {
  top: {
    style: "thin",
    color: {
      rgb: "000000",
    },
  },

  bottom: {
    style: "thin",
    color: {
      rgb: "000000",
    },
  },

  left: {
    style: "thin",
    color: {
      rgb: "000000",
    },
  },

  right: {
    style: "thin",
    color: {
      rgb: "000000",
    },
  },
};

const CATEGORY_TITLE_STYLE = {
  font: {
    bold: true,
    color: {
      rgb: "FFFFFF",
    },
    sz: 16,
  },

  fill: {
    fgColor: {
      rgb: "FF0000",
    },
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
    color: {
      rgb: "FF0000",
    },
    sz: 11,
  },

  fill: {
    fgColor: {
      rgb: "FFFFFF",
    },
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
    color: {
      rgb: "000000",
    },
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
 * ADD CATEGORY SECTION
 * ========================================================================== */

const addCategorySection = (
  worksheet,
  startRow,
  categoryTitle,
  products
) => {
  /*
   * Current export layout.
   *
   * SALE NAME is intentionally not made a separate column,
   * because screenshot/reference catalogue layout uses:
   *
   * SL NO.
   * PRODUCT ID
   * MODEL
   * GUARANTEE
   * SS PRICE
   * DS PRICE
   */

  const columns = [
    "SL. NO.",
    "PRODUCT ID",
    "MODEL",
    "GUARANTEE",
    "SS PRICE",
    "DS PRICE",
  ];

  const columnCount =
    columns.length;

  const titleRow =
    startRow;

  const headerRow =
    startRow + 1;

  const dataStartRow =
    startRow + 2;

  /* ------------------------------------------------------------------------ */
  /* RED CATEGORY TITLE                                                        */
  /* ------------------------------------------------------------------------ */

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
      c:
        columnCount - 1,
    },
  });

  const titleCell =
    XLSX.utils.encode_cell({
      r: titleRow,
      c: 0,
    });

  worksheet[titleCell].s =
    CATEGORY_TITLE_STYLE;

  worksheet[titleCell].v =
    categoryTitle;

  /* ------------------------------------------------------------------------ */
  /* HEADER                                                                    */
  /* ------------------------------------------------------------------------ */

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

  columns.forEach(
    (_, columnIndex) => {
      const cell =
        XLSX.utils.encode_cell({
          r: headerRow,
          c: columnIndex,
        });

      worksheet[cell].s =
        HEADER_STYLE;
    }
  );

  /* ------------------------------------------------------------------------ */
  /* DATA                                                                      */
  /* ------------------------------------------------------------------------ */

  const dataRows =
    products.map(
      (product, index) => [
        index + 1,

        getProductId(
          product
        ),

        getProductName(
          product
        ),

        getGuarantee(
          product
        ),

        product?.price ??
          "",

        product?.ds_price ??
          "",
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
              XLSX.utils.encode_cell(
                {
                  r:
                    dataStartRow +
                    rowIndex,

                  c: columnIndex,
                }
              );

            worksheet[cell].s =
              columnIndex === 2
                ? DATA_LEFT_STYLE
                : DATA_STYLE;
          }
        );
      }
    );
  }

  /* ------------------------------------------------------------------------ */
  /* ROW HEIGHTS                                                               */
  /* ------------------------------------------------------------------------ */

  worksheet["!rows"] =
    worksheet["!rows"] || [];

  worksheet["!rows"][
    titleRow
  ] = {
    hpt: 25,
  };

  worksheet["!rows"][
    headerRow
  ] = {
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

  /*
   * One blank row between sections.
   *
   * This is what makes:
   *
   * TORCH
   * AUX CABLE
   * PORTABLE FAN
   * BT CELL
   *
   * look like screenshot 3.
   */

  return (
    dataStartRow +
    dataRows.length +
    1
  );
};

/* ============================================================================
 * CREATE COMBINED SHEET
 * ========================================================================== */

const createCombinedCategorySheet =
  (
    workbook,
    group,
    products
  ) => {
    const worksheet =
      XLSX.utils.aoa_to_sheet(
        []
      );

    let currentRow = 0;

    /*
     * IMPORTANT:
     * Section order is fixed from COMBINED_CATEGORY_GROUPS.
     *
     * It does NOT depend on alphabetical order.
     */

    group.sections.forEach(
      (section) => {
        const sectionProducts =
          products.filter(
            (product) => {
              const category =
                getCategory(
                  product
                );

              return section.aliases.some(
                (alias) =>
                  normalizeCategory(
                    alias
                  ) ===
                  normalizeCategory(
                    category
                  )
              );
            }
          );

        if (
          sectionProducts.length ===
          0
        ) {
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

    /* ---------------------------------------------------------------------- */
    /* COLUMN WIDTHS                                                           */
    /* ---------------------------------------------------------------------- */

    worksheet["!cols"] = [
      {
        wch: 10,
      },

      {
        wch: 14,
      },

      {
        wch: 32,
      },

      {
        wch: 20,
      },

      {
        wch: 14,
      },

      {
        wch: 14,
      },
    ];

    const sheetName =
      cleanSheetName(
        group.sheetName,
        new Set(
          workbook.SheetNames
        )
      );

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      sheetName
    );
  };

/* ============================================================================
 * CREATE NORMAL CATEGORY SHEET
 * ========================================================================== */

const createNormalCategorySheet =
  (
    workbook,
    category,
    products
  ) => {
    const worksheet =
      XLSX.utils.aoa_to_sheet(
        []
      );

    addCategorySection(
      worksheet,
      0,
      category,
      products
    );

    worksheet["!cols"] = [
      {
        wch: 10,
      },

      {
        wch: 14,
      },

      {
        wch: 32,
      },

      {
        wch: 20,
      },

      {
        wch: 14,
      },

      {
        wch: 14,
      },
    ];

    const usedNames =
      new Set(
        workbook.SheetNames
      );

    const sheetName =
      cleanSheetName(
        category,
        usedNames
      );

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      sheetName
    );
  };

/* ============================================================================
 * MAIN EXPORT
 *
 * Filename:
 * S.S PRICE 01-09-2026.xlsx
 * ========================================================================== */

export const exportPriceManagementExcel =
  (
    products = [],
    effectiveDate = "2026-09-01"
  ) => {
    if (
      !Array.isArray(
        products
      ) ||
      products.length === 0
    ) {
      alert(
        "No product data available to export."
      );

      return;
    }

    const workbook =
      XLSX.utils.book_new();

    /* ---------------------------------------------------------------------- */
    /* GROUP PRODUCTS BY CATEGORY                                              */
    /* ---------------------------------------------------------------------- */

    const categoryMap =
      products.reduce(
        (groups, product) => {
          const category =
            getCategory(
              product
            );

          const key =
            normalizeCategory(
              category
            );

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

    /* ---------------------------------------------------------------------- */
    /* TRACK CATEGORIES THAT ARE INSIDE COMBINED SHEET                         */
    /* ---------------------------------------------------------------------- */

    const combinedCategoryKeys =
      new Set();

    COMBINED_CATEGORY_GROUPS.forEach(
      (group) => {
        group.sections.forEach(
          (section) => {
            section.aliases.forEach(
              (alias) => {
                combinedCategoryKeys.add(
                  normalizeCategory(
                    alias
                  )
                );
              }
            );
          }
        );
      }
    );

    /* ---------------------------------------------------------------------- */
    /* BUILD COMBINED SHEETS                                                  */
    /* ---------------------------------------------------------------------- */

    COMBINED_CATEGORY_GROUPS.forEach(
      (group) => {
        const groupProducts =
          [];

        group.sections.forEach(
          (section) => {
            section.aliases.forEach(
              (alias) => {
                const key =
                  normalizeCategory(
                    alias
                  );

                const categoryData =
                  categoryMap[key];

                if (
                  categoryData?.products
                    ?.length
                ) {
                  groupProducts.push(
                    ...categoryData.products
                  );
                }
              }
            );
          }
        );

        if (
          groupProducts.length ===
          0
        ) {
          return;
        }

        /*
         * Remove duplicate products in case
         * aliases point to same normalized category.
         */

        const uniqueProducts =
          Array.from(
            new Map(
              groupProducts.map(
                (product, index) => [
                  `${getProductId(product)}-${index}`,
                  product,
                ]
              )
            ).values()
          );

        createCombinedCategorySheet(
          workbook,
          group,
          uniqueProducts
        );
      }
    );

    /* ---------------------------------------------------------------------- */
    /* BUILD ALL OTHER NORMAL SHEETS                                           */
    /* ---------------------------------------------------------------------- */

    Object.entries(
      categoryMap
    )
      .sort(
        ([, a], [, b]) =>
          a.category.localeCompare(
            b.category,
            undefined,
            {
              sensitivity:
                "base",
            }
          )
      )
      .forEach(
        ([key, data]) => {
          /*
           * IMPORTANT:
           * Combined group ka koi bhi category
           * dobara separate sheet nahi banayegi.
           */

          if (
            combinedCategoryKeys.has(
              key
            )
          ) {
            return;
          }

          createNormalCategorySheet(
            workbook,
            data.category,
            data.products
          );
        }
      );

    /* ---------------------------------------------------------------------- */
    /* FILE NAME                                                               */
    /* ---------------------------------------------------------------------- */

    let dateObject =
      new Date(
        `${effectiveDate}T00:00:00`
      );

    if (
      Number.isNaN(
        dateObject.getTime()
      )
    ) {
      dateObject =
        new Date();
    }

    const day =
      String(
        dateObject.getDate()
      ).padStart(2, "0");

    const month =
      String(
        dateObject.getMonth() + 1
      ).padStart(2, "0");

    const year =
      dateObject.getFullYear();

    const datePart =
      `${day}-${month}-${year}`;

    XLSX.writeFile(
      workbook,
      `S.S PRICE ${datePart}.xlsx`
    );
  };