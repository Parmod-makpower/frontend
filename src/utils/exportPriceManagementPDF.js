import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* =========================================================
   HELPERS
========================================================= */

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase();

const getProductId = (product) =>
  product?.product_id ??
  product?.id ??
  "";

const getCategory = (product) =>
  String(product?.sub_category ?? "").trim() ||
  "UNCATEGORIZED";

const getProductName = (product) =>
  product?.product_name ??
  product?.name ??
  product?.productName ??
  "";

const getGuarantee = (product) =>
  product?.guarantee_period ??
  product?.warranty_period ??
  product?.guarantee ??
  product?.warranty ??
  "";

const getCartonSize = (product) =>
  product?.cartoon_size ??
  product?.carton_size ??
  product?.carton ??
  "";

const getMah = (product) =>
  product?.mah ??
  product?.mAh ??
  "";

/* =========================================================
   DATA CABLE CATEGORY
   ONLY DATA CABLE CATEGORIES USE CONTINUOUS SERIAL NUMBER
========================================================= */

const isDataCableCategory = (category) =>
  normalize(category).includes("DATA CABLE");

/* =========================================================
   SPECIAL PAGE-BREAK CATEGORIES

   These categories ALWAYS start from a NEW PAGE.
========================================================= */

const NEW_PAGE_CATEGORIES = new Set([
  "CHARGER",
  "TWS EARBUDS",
  "NECKBAND",
  "SPEAKER",
]);

/* =========================================================
   PRICE-BLANK CATEGORIES

   Price must remain blank for these categories.
========================================================= */

const BLANK_PRICE_CATEGORIES = new Set([
  "MEMORY CARD",
  "PENDRIVE",
]);

const isNewPageCategory = (category) =>
  NEW_PAGE_CATEGORIES.has(
    normalize(category)
  );

const isBlankPriceCategory = (category) =>
  BLANK_PRICE_CATEGORIES.has(
    normalize(category)
  );

/* =========================================================
   SALE NAME
========================================================= */

const getSaleNameValue = (sale) => {
  if (typeof sale === "string") {
    return sale.trim();
  }

  if (!sale || typeof sale !== "object") {
    return "";
  }

  return String(
    sale.sale_name ??
      sale.name ??
      sale.title ??
      ""
  ).trim();
};

const getSaleNameId = (sale) => {
  if (!sale || typeof sale !== "object") {
    return "";
  }

  return (
    sale.id ??
    sale.sale_name_id ??
    sale.pk ??
    ""
  );
};

const getLatestActiveSaleName = (product) => {
  const saleNames = Array.isArray(
    product?.sale_names
  )
    ? product.sale_names
    : [];

  const active = saleNames.filter(
    (sale) => sale?.is_active !== false
  );

  if (!active.length) {
    return "";
  }

  const unique = [];
  const seen = new Set();

  active.forEach((sale) => {
    const name = getSaleNameValue(sale);

    if (!name) {
      return;
    }

    const id = getSaleNameId(sale);

    const key =
      id !== ""
        ? `id:${id}`
        : `name:${normalize(name)}`;

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    unique.push(name);
  });

  return (
    unique[unique.length - 1] ||
    unique[0] ||
    ""
  );
};

const getModel = (product) =>
  getLatestActiveSaleName(product) ||
  getProductName(product) ||
  String(getProductId(product));

/* =========================================================
   PRICE
========================================================= */

const getPriceField = (priceType) => {
  if (priceType === "DS") {
    return "ds_price";
  }

  if (priceType === "DLR") {
    return "dlr_price";
  }

  return "price";
};

const getPriceLabel = (priceType) => {
  if (priceType === "DS") {
    return "DISTRIBUTOR PRICE";
  }

  if (priceType === "DLR") {
    return "DEALER PRICE";
  }

  return "SS PRICE";
};

/* =========================================================
   PRICE SORTING

   IMPORTANT:
   - Category order is NOT changed.
   - Only products INSIDE the category are sorted.
   - Lowest price comes first.
   - Highest price comes last.
   - Empty / invalid prices go to bottom.
   - Same prices keep their original order.
========================================================= */

const getSortablePrice = (
  product,
  priceType
) => {
  const priceField =
    getPriceField(priceType);

  const rawValue =
    product?.[priceField];

  if (
    rawValue === null ||
    rawValue === undefined ||
    rawValue === ""
  ) {
    return Number.POSITIVE_INFINITY;
  }

  const cleanedValue = String(
    rawValue
  )
    .replace(/,/g, "")
    .replace(/[₹$€£]/g, "")
    .trim();

  const numericValue =
    Number(cleanedValue);

  return Number.isFinite(numericValue)
    ? numericValue
    : Number.POSITIVE_INFINITY;
};

const sortProductsByPrice = (
  products = [],
  priceType
) => {
  return products
    .map((product, index) => ({
      product,
      originalIndex: index,
      price: getSortablePrice(
        product,
        priceType
      ),
    }))
    .sort((a, b) => {
      if (a.price !== b.price) {
        return a.price - b.price;
      }

      return (
        a.originalIndex -
        b.originalIndex
      );
    })
    .map(
      ({ product }) => product
    );
};

/* =========================================================
   GUARANTEE
========================================================= */

const formatGuarantee = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  return String(value).trim();
};

const calculateGuarantee = (
  value,
  priceType
) => {
  const original =
    formatGuarantee(value);

  if (!original) {
    return original;
  }

  const match = original.match(
    /^\s*(\d+(?:\.\d+)?)\s*(months?|month|m)\s*$/i
  );

  if (!match) {
    return original;
  }

  const months = Number(match[1]);

  if (!Number.isFinite(months)) {
    return original;
  }

  let finalMonths = months;

  if (priceType === "DS") {
    finalMonths = Math.max(
      months - 3,
      3
    );
  }

  if (priceType === "DLR") {
    finalMonths = Math.max(
      months - 6,
      3
    );
  }

  return `${finalMonths} Months`;
};

/* =========================================================
   CATEGORY GROUP LOOKUP
========================================================= */

const createCategoryLookup = (
  combinedCategoryGroups = []
) => {
  const lookup = new Map();

  combinedCategoryGroups.forEach(
    ({ sheetName, sections = [] }) => {
      sections.forEach(
        ({
          title,
          aliases = [],
        }) => {
          [
            title,
            ...aliases,
          ].forEach((value) => {
            const key =
              normalize(value);

            if (key) {
              lookup.set(
                key,
                sheetName
              );
            }
          });
        }
      );
    }
  );

  return lookup;
};

const getCategoryGroupKey = (
  category,
  lookup
) => {
  const value = String(
    category ?? ""
  ).trim();

  if (!value) {
    return "UNCATEGORIZED";
  }

  return (
    lookup.get(
      normalize(value)
    ) || value
  );
};

/* =========================================================
   MAH GROUP
========================================================= */

const isMahGroup = (sheetName) => {
  return (
    normalize(sheetName) ===
      "ECO SERIES" ||
    normalize(sheetName) ===
      "POLYMER BATTERY"
  );
};

/* =========================================================
   POLYMER CATEGORY DISPLAY
   Removes only trailing "BATTERY"
========================================================= */

const getPolymerCategoryLabel = (
  category
) => {
  const value = String(
    category ?? ""
  ).trim();

  if (!value) {
    return "";
  }

  return value
    .replace(
      /\s+BATTERY\s*$/i,
      ""
    )
    .trim();
};

/* =========================================================
   DATE
========================================================= */

const getDateText = () => {
  const date = new Date();

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  red: [252, 37, 12],
  dark: [15, 23, 42],
  slate: [71, 85, 105],
  light: [248, 250, 252],
  border: [203, 213, 225],
  white: [255, 255, 255],
  row: [250, 250, 250],

  /* CATEGORY BAR */

  categoryYellow: [
    254,
    249,
    195,
  ],

  categoryYellowBorder: [
    234,
    179,
    8,
  ],

  categoryText: [
    51,
    65,
    85,
  ],

  /* PRICE CHANGE */

  priceUpText: [
    22,
    163,
    74,
  ],

  priceUpFill: [
    240,
    253,
    244,
  ],

  priceDownText: [
    220,
    38,
    38,
  ],

  priceDownFill: [
    254,
    242,
    242,
  ],
};

/* =========================================================
   PAGE HEADER
========================================================= */

const drawPageHeader = (
  doc,
  priceType,
  pageTitle
) => {
  const pageWidth =
    doc.internal.pageSize.getWidth();

  doc.setFillColor(
    ...COLORS.dark
  );

  doc.rect(
    0,
    0,
    pageWidth,
    13,
    "F"
  );

  doc.setTextColor(
    ...COLORS.white
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(10.5);

  /*
    MAKPOWER intentionally removed.
  */

  doc.setFontSize(6.5);

  doc.text(
    pageTitle,
    5,
    7
  );

  const typeLabel =
    priceType === "SS"
      ? "SS"
      : priceType === "DS"
        ? "DISTRIBUTOR"
        : "DEALER";

  doc.setFontSize(6.2);

  doc.text(
    typeLabel,
    pageWidth - 7,
    5.8,
    {
      align: "right",
    }
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(5.8);

  doc.text(
    getDateText(),
    pageWidth - 7,
    10.5,
    {
      align: "right",
    }
  );
};

/* =========================================================
   FOOTER
========================================================= */

const drawFooter = (doc) => {
  const pageCount =
    doc.internal.getNumberOfPages();

  const pageHeight =
    doc.internal.pageSize.getHeight();

  const pageWidth =
    doc.internal.pageSize.getWidth();

  for (
    let page = 1;
    page <= pageCount;
    page += 1
  ) {
    doc.setPage(page);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(5.5);

    doc.setTextColor(
      ...COLORS.slate
    );

    doc.text(
      "PRICE LIST",
      7,
      pageHeight - 4
    );

    doc.text(
      `Page ${page} of ${pageCount}`,
      pageWidth - 7,
      pageHeight - 4,
      {
        align: "right",
      }
    );
  }
};

/* =========================================================
   PAGE / HEADER CONTROLLER
========================================================= */

const createPageController = (
  doc,
  priceType,
  pageTitle
) => {
  const renderedHeaders =
    new Set();

  const drawHeaderOnce = () => {
    const pageNumber =
      doc.internal
        .getCurrentPageInfo()
        .pageNumber;

    if (
      renderedHeaders.has(
        pageNumber
      )
    ) {
      return;
    }

    drawPageHeader(
      doc,
      priceType,
      pageTitle
    );

    renderedHeaders.add(
      pageNumber
    );
  };

  const addPage = () => {
    doc.addPage();
    drawHeaderOnce();
  };

  return {
    drawHeaderOnce,
    addPage,
  };
};

/* =========================================================
   CATEGORY SECTION BAR
   ALL CATEGORIES USE THIS BAR
========================================================= */

const drawCategoryTitle = (
  doc,
  y,
  title,
  tableWidth,
  options = {}
) => {
  const {
    centered = true,
  } = options;

  const x = 7;
  const height = 7;

  doc.setFillColor(
    ...COLORS.categoryYellow
  );

  doc.setDrawColor(
    ...COLORS.categoryYellowBorder
  );

  doc.setLineWidth(0.25);

  doc.rect(
    x,
    y,
    tableWidth,
    height,
    "FD"
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(7.5);

  doc.setTextColor(
    ...COLORS.categoryText
  );

  if (centered) {
    doc.text(
      String(
        title || "CATEGORY"
      ),
      x + tableWidth / 2,
      y + 4.7,
      {
        align: "center",
      }
    );
  } else {
    doc.text(
      String(
        title || "CATEGORY"
      ),
      x + 2,
      y + 4.7
    );
  }

  return y + height;
};

/* =========================================================
   TABLE HEIGHT ESTIMATION
========================================================= */

const estimateSectionHeight = (
  rowCount,
  rowHeight = 6.1
) => {
  const titleHeight = 7;
  const tableHeaderHeight = 7;
  const bottomGap = 3;

  return (
    titleHeight +
    tableHeaderHeight +
    rowCount * rowHeight +
    bottomGap
  );
};

const getAvailableHeight = (
  doc,
  currentY
) => {
  const pageHeight =
    doc.internal.pageSize.getHeight();

  const footerReserve = 9;

  return (
    pageHeight -
    footerReserve -
    currentY
  );
};

const shouldMoveSectionToNextPage = ({
  doc,
  currentY,
  rowCount,
}) => {
  const available =
    getAvailableHeight(
      doc,
      currentY
    );

  const minimumRequired =
    estimateSectionHeight(
      1,
      6
    );

  if (
    available <
    minimumRequired
  ) {
    return true;
  }

  const estimated =
    estimateSectionHeight(
      rowCount
    );

  return (
    rowCount <= 28 &&
    estimated > available
  );
};

/* =========================================================
   PRICE HISTORY FIELDS
========================================================= */

const PRICE_HISTORY_FIELDS = {
  SS: {
    oldField: "old_price",
    newField: "new_price",
  },

  DS: {
    oldField: "old_ds_price",
    newField: "new_ds_price",
  },

  DLR: {
    oldField: "old_dlr_price",
    newField: "new_dlr_price",
  },
};

/* =========================================================
   APPLY PRICE HISTORY STYLE
========================================================= */

const applyPriceHistoryStyle = (
  data,
  products,
  priceType,
  priceHistoryMap
) => {
  if (
    data.section !== "body" ||
    data.column.index !==
      data.table.columns.length - 1 ||
    !priceHistoryMap
  ) {
    return;
  }

  const product =
    products[data.row.index];

  if (!product) {
    return;
  }

  /*
    MEMORY CARD / PENDRIVE
    have intentionally blank prices.
  */

  if (
    isBlankPriceCategory(
      getCategory(product)
    )
  ) {
    return;
  }

  const productId = String(
    getProductId(product)
  );

  const history =
    priceHistoryMap.get(
      productId
    );

  if (!history) {
    return;
  }

  const fields =
    PRICE_HISTORY_FIELDS[
      priceType
    ] ||
    PRICE_HISTORY_FIELDS.SS;

  const oldValue = Number(
    history?.[fields.oldField]
  );

  const newValue = Number(
    history?.[fields.newField]
  );

  if (
    !Number.isFinite(oldValue) ||
    !Number.isFinite(newValue)
  ) {
    return;
  }

  if (newValue > oldValue) {
    data.cell.styles.textColor =
      COLORS.priceUpText;

    data.cell.styles.fillColor =
      COLORS.priceUpFill;
  }

  if (newValue < oldValue) {
    data.cell.styles.textColor =
      COLORS.priceDownText;

    data.cell.styles.fillColor =
      COLORS.priceDownFill;
  }
};

/* =========================================================
   NORMAL CATEGORY SECTION
========================================================= */

const addCategorySection = ({
  doc,
  startY,
  title,
  products,
  priceType,
  useMah = false,
  priceHistoryMap,
  pageController,

  /*
    DATA CABLE SERIAL REF
    Only DATA CABLE categories use this
    continuous serial counter.
  */

  dataCableSerialRef = null,
}) => {
  if (!products.length) {
    return startY;
  }

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const tableWidth =
    pageWidth - 14;

  const priceField =
    getPriceField(priceType);

  const normalizedTitle =
    normalize(title);

  const dataCableCategory =
    isDataCableCategory(
      normalizedTitle
    );

  let y = startY;

  /* =======================================================
     SPECIAL CATEGORIES:
     CHARGER / TWS EARBUDS / NECKBAND / SPEAKER
     Always begin from a fresh page.
  ======================================================= */

  if (
    isNewPageCategory(
      normalizedTitle
    )
  ) {
    /*
      Do not add another blank page when
      this category is already starting
      at the top of a fresh page.
    */

    const pageTop = 16;

    if (
      y >
      pageTop + 0.5
    ) {
      pageController.addPage();
      y = pageTop;
    }
  } else if (
    shouldMoveSectionToNextPage({
      doc,
      currentY: y,
      rowCount:
        products.length,
    })
  ) {
    pageController.addPage();
    y = 16;
  }

  /*
    IMPORTANT:
    Sort products BEFORE creating rows.

    This fixes:
    - price order
    - serial order
    - price-history row mapping
  */

  const sortedProducts =
    sortProductsByPrice(
      products,
      priceType
    );

  /*
    rows is initialized BEFORE map callback
    and map uses sortedProducts.
  */

  const rows =
    sortedProducts.map(
      (product, index) => {
        const guarantee =
          calculateGuarantee(
            getGuarantee(
              product
            ),
            priceType
          );

        /*
          MEMORY CARD / PENDRIVE
          Price must remain blank.
        */

        const category =
          getCategory(product);

        const price =
          isBlankPriceCategory(
            category
          )
            ? ""
            : product?.[
                priceField
              ] ?? "";

        /*
          DATA CABLE:
          Continuous numbering across
          all DATA CABLE categories.

          Serial is assigned AFTER sorting.
        */

        let serialNumber;

        if (
          dataCableCategory &&
          dataCableSerialRef
        ) {
          serialNumber =
            dataCableSerialRef.current;

          dataCableSerialRef.current +=
            1;
        } else {
          serialNumber =
            index + 1;
        }

        return [
          serialNumber,
          getModel(product),
          useMah
            ? getMah(product)
            : getCartonSize(
                product
              ),
          guarantee,
          price,
        ];
      }
    );

  y = drawCategoryTitle(
    doc,
    y,
    title || "CATEGORY",
    tableWidth,
    {
      centered: true,
    }
  );

  y += 1;

  autoTable(doc, {
    startY: y,

    head: [
      [
        "SL. NO.",
        "MODEL",
        useMah
          ? "MAH"
          : "CARTON",
        "GUARANTEE",
        "PRICE",
      ],
    ],

    body: rows,

    theme: "grid",

    margin: {
      top: 16,
      right: 7,
      bottom: 8,
      left: 7,
    },

    tableWidth,

    pageBreak: "auto",

    showHead: "everyPage",

    rowPageBreak: "avoid",

    styles: {
      font: "helvetica",

      fontStyle: "bold",

      fontSize: 8,

      cellPadding: {
        top: 1.25,
        right: 1.5,
        bottom: 1.25,
        left: 1.5,
      },

      textColor:
        COLORS.dark,

      lineColor:
        COLORS.border,

      lineWidth: 0.2,

      valign: "middle",

      halign: "center",

      overflow:
        "linebreak",
    },

    headStyles: {
      fillColor:
        COLORS.red,

      textColor:
        COLORS.white,

      font:
        "helvetica",

      fontStyle:
        "bold",

      fontSize: 8,

      halign: "center",

      valign: "middle",

      cellPadding: {
        top: 1.5,
        right: 1.5,
        bottom: 1.5,
        left: 1.5,
      },
    },

    bodyStyles: {
      fillColor:
        COLORS.white,

      fontStyle:
        "bold",

      halign: "center",

      valign: "middle",
    },

    alternateRowStyles: {
      fillColor:
        COLORS.row,
    },

    columnStyles: {
      0: {
        cellWidth: 14,
        halign: "center",
      },

      1: {
        cellWidth: 82,
        halign: "center",
        fontStyle: "bold",
      },

      2: {
        cellWidth: 29,
        halign: "center",
      },

      3: {
        cellWidth: 33,
        halign: "center",
      },

      4: {
        cellWidth: 36,
        halign: "center",
      },
    },

    didParseCell: (data) => {
      if (
        data.section !==
          "body" ||
        data.column.index !== 4
      ) {
        return;
      }

      /*
        IMPORTANT:
        Use sortedProducts here,
        NOT original products.

        This keeps price-history color
        attached to the correct product
        after sorting.
      */

      const product =
        sortedProducts[
          data.row.index
        ];

      if (
        product &&
        isBlankPriceCategory(
          getCategory(product)
        )
      ) {
        data.cell.text = [""];
        data.cell.styles.textColor =
          COLORS.dark;

        data.cell.styles.fillColor =
          COLORS.white;

        return;
      }

      applyPriceHistoryStyle(
        data,
        sortedProducts,
        priceType,
        priceHistoryMap
      );
    },

    didDrawPage: () => {
      pageController.drawHeaderOnce();
    },
  });

  return (
    doc.lastAutoTable.finalY +
    3
  );
};

/* =========================================================
   POLYMER BATTERY

   ONE HEADING
   ONE TABLE
   CATEGORY COLUMN
   CONTINUOUS SERIAL NUMBER

   Category order remains unchanged.
   Products inside each category are
   sorted by price ascending.
========================================================= */

const addPolymerBatterySection = ({
  doc,
  startY,
  group,
  products,
  priceType,
  priceHistoryMap,
  pageController,
}) => {
  if (!products.length) {
    return startY;
  }

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const tableWidth =
    pageWidth - 14;

  let y = startY;

  /*
    Polymer is intentionally kept as one
    continuous table so serial numbers
    never reset.
  */

  if (
    shouldMoveSectionToNextPage({
      doc,
      currentY: y,
      rowCount:
        products.length,
    }) &&
    getAvailableHeight(
      doc,
      y
    ) <
      estimateSectionHeight(
        1,
        6
      )
  ) {
    pageController.addPage();
    y = 16;
  }

  /*
    Top Polymer heading.
    BATTERY word is not repeated in
    subcategory labels.
  */

  y = drawCategoryTitle(
    doc,
    y,
    "POLYMER BATTERY",
    tableWidth,
    {
      centered: true,
    }
  );

  y += 1;

  const rows = [];

  /*
    IMPORTANT:
    Keep product reference in exactly
    the same order as rows.

    This is required for correct
    price-history highlighting.
  */

  const rowProducts = [];

  let serial = 1;

  const sections =
    group.sections || [];

  const usedProductIds =
    new Set();

  /*
    Category order is controlled ONLY
    by sections.forEach().
  */

  sections.forEach(
    (section) => {
      const aliases = [
        section.title,
        ...(section.aliases || []),
      ];

      const sectionProducts =
        products.filter(
          (product) => {
            const productCategory =
              normalize(
                getCategory(
                  product
                )
              );

            return aliases.some(
              (alias) =>
                normalize(
                  alias
                ) ===
                productCategory
            );
          }
        );

      if (
        !sectionProducts.length
      ) {
        return;
      }

      /*
        IMPORTANT:
        Sort ONLY this category.

        Category order itself is untouched.
      */

      const sortedSectionProducts =
        sortProductsByPrice(
          sectionProducts,
          priceType
        );

      sortedSectionProducts.forEach(
        (product) => {
          const productId =
            String(
              getProductId(
                product
              )
            );

          /*
            Avoid accidental duplicate
            rows if aliases overlap.
          */

          if (
            usedProductIds.has(
              productId
            )
          ) {
            return;
          }

          usedProductIds.add(
            productId
          );

          /*
            Keep exact same order in
            rowProducts and rows.
          */

          rowProducts.push(
            product
          );

          rows.push([
            serial,

            getPolymerCategoryLabel(
              getCategory(
                product
              )
            ),

            getModel(product),

            getMah(product),

            calculateGuarantee(
              getGuarantee(
                product
              ),
              priceType
            ),

            /*
              MEMORY CARD / PENDRIVE
              are not normally part of Polymer,
              but keep the same safety rule.
            */

            isBlankPriceCategory(
              getCategory(
                product
              )
            )
              ? ""
              : product?.[
                  getPriceField(
                    priceType
                  )
                ] ?? "",
          ]);

          serial += 1;
        }
      );
    }
  );

  /*
    Any Polymer product not matched
    by configured sections is still included.

    Unmatched products are also sorted
    by price ascending.
  */

  const remainingProducts =
    products.filter(
      (product) => {
        const productId =
          String(
            getProductId(
              product
            )
          );

        return !usedProductIds.has(
          productId
        );
      }
    );

  if (
    remainingProducts.length
  ) {
    const sortedRemainingProducts =
      sortProductsByPrice(
        remainingProducts,
        priceType
      );

    sortedRemainingProducts.forEach(
      (product) => {
        const productId =
          String(
            getProductId(
              product
            )
          );

        if (
          usedProductIds.has(
            productId
          )
        ) {
          return;
        }

        usedProductIds.add(
          productId
        );

        rowProducts.push(
          product
        );

        rows.push([
          serial,

          getPolymerCategoryLabel(
            getCategory(
              product
            )
          ),

          getModel(product),

          getMah(product),

          calculateGuarantee(
            getGuarantee(
              product
            ),
            priceType
          ),

          isBlankPriceCategory(
            getCategory(
              product
            )
          )
            ? ""
            : product?.[
                getPriceField(
                  priceType
                )
              ] ?? "",
        ]);

        serial += 1;
      }
    );
  }

  autoTable(doc, {
    startY: y,

    head: [
      [
        "SL. NO.",
        "CATEGORY",
        "MODEL",
        "MAH",
        "GUARANTEE",
        "PRICE",
      ],
    ],

    body: rows,

    theme: "grid",

    margin: {
      top: 16,
      right: 7,
      bottom: 8,
      left: 7,
    },

    tableWidth,

    pageBreak: "auto",

    showHead: "everyPage",

    rowPageBreak: "avoid",

    styles: {
      font: "helvetica",

      fontStyle: "bold",

      fontSize: 8,

      cellPadding: {
        top: 1.25,
        right: 1.5,
        bottom: 1.25,
        left: 1.5,
      },

      textColor:
        COLORS.dark,

      lineColor:
        COLORS.border,

      lineWidth: 0.2,

      valign: "middle",

      halign: "center",

      overflow:
        "linebreak",
    },

    headStyles: {
      fillColor:
        COLORS.red,

      textColor:
        COLORS.white,

      font:
        "helvetica",

      fontStyle:
        "bold",

      fontSize: 8,

      halign: "center",

      valign: "middle",

      cellPadding: {
        top: 1.5,
        right: 1.5,
        bottom: 1.5,
        left: 1.5,
      },
    },

    bodyStyles: {
      fillColor:
        COLORS.white,

      fontStyle:
        "bold",

      halign: "center",

      valign: "middle",
    },

    alternateRowStyles: {
      fillColor:
        COLORS.row,
    },

    columnStyles: {
      /*
        Slightly wider CATEGORY column
        so names like POLYMER MOTOROLA
        remain clean.
      */

      0: {
        cellWidth: 13,
        halign: "center",
      },

      1: {
        cellWidth: 44,
        halign: "center",
        fontStyle: "bold",
      },

      2: {
        cellWidth: 60,
        halign: "center",
        fontStyle: "bold",
      },

      3: {
        cellWidth: 25,
        halign: "center",
      },

      4: {
        cellWidth: 27,
        halign: "center",
      },

      5: {
        cellWidth: 27,
        halign: "center",
      },
    },

    didParseCell: (data) => {
      /*
        PRICE is always the final
        column in Polymer table.
      */

      if (
        data.section !==
          "body" ||
        data.column.index !== 5
      ) {
        return;
      }

      /*
        IMPORTANT:
        Use rowProducts instead of
        original products.

        rowProducts is in exactly the
        same order as rows.
      */

      const product =
        rowProducts[
          data.row.index
        ];

      if (!product) {
        return;
      }

      /*
        MEMORY CARD / PENDRIVE:
        Price stays blank.
      */

      if (
        isBlankPriceCategory(
          getCategory(product)
        )
      ) {
        data.cell.text = [""];
        data.cell.styles.textColor =
          COLORS.dark;

        data.cell.styles.fillColor =
          COLORS.white;

        return;
      }

      applyPriceHistoryStyle(
        data,
        rowProducts,
        priceType,
        priceHistoryMap
      );
    },

    didDrawPage: () => {
      pageController.drawHeaderOnce();
    },
  });

  return (
    doc.lastAutoTable.finalY +
    3
  );
};

/* =========================================================
   COMBINED GROUP
========================================================= */

const addCombinedGroup = ({
  doc,
  startY,
  group,
  products,
  categoryLookup,
  priceType,
  priceHistoryMap,
  pageController,

  /*
    Shared DATA CABLE serial counter.
  */

  dataCableSerialRef = null,
}) => {
  let y = startY;

  /*
    Polymer Battery gets its own special
    continuous layout.
  */

  if (
    normalize(
      group.sheetName
    ) ===
    "POLYMER BATTERY"
  ) {
    return addPolymerBatterySection({
      doc,
      startY: y,
      group,
      products,
      priceType,
      priceHistoryMap,
      pageController,
    });
  }

  const useMah =
    isMahGroup(
      group.sheetName
    );

  const sections =
    group.sections || [];

  const usedCategories =
    new Set();

  /*
    IMPORTANT:
    sections.forEach() preserves
    the configured category order.
  */

  sections.forEach(
    (section) => {
      const aliases = [
        section.title,
        ...(section.aliases || []),
      ];

      aliases.forEach(
        (alias) => {
          usedCategories.add(
            normalize(alias)
          );
        }
      );

      const sectionProducts =
        products.filter(
          (product) => {
            const productCategory =
              normalize(
                getCategory(
                  product
                )
              );

            return aliases.some(
              (alias) =>
                normalize(
                  alias
                ) ===
                productCategory
            );
          }
        );

      if (
        !sectionProducts.length
      ) {
        return;
      }

      y = addCategorySection({
        doc,

        startY: y,

        title:
          section.title ||
          getCategory(
            sectionProducts[0]
          ),

        products:
          sectionProducts,

        priceType,

        useMah,

        priceHistoryMap,

        pageController,

        dataCableSerialRef,
      });
    }
  );

  /*
    Any category not matched by configured
    sections still appears under OTHER.
  */

  const remaining =
    products.filter(
      (product) =>
        !usedCategories.has(
          normalize(
            getCategory(
              product
            )
          )
        )
    );

  if (remaining.length) {
    y = addCategorySection({
      doc,

      startY: y,

      title: "OTHER",

      products: remaining,

      priceType,

      useMah,

      priceHistoryMap,

      pageController,

      dataCableSerialRef,
    });
  }

  return y;
};

/* =========================================================
   MAIN EXPORT
========================================================= */

export const exportPriceManagementPDF = (
  products = [],
  priceType = "SS",
  combinedCategoryGroups = [],
  priceHistory = []
) => {
  if (
    !Array.isArray(products) ||
    !products.length
  ) {
    return;
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const categoryLookup =
    createCategoryLookup(
      combinedCategoryGroups
    );

  /* =======================================================
     PRICE HISTORY MAP

     ONLY LAST 30 DAYS PRICE CHANGES
     ARE HIGHLIGHTED
  ======================================================= */

  const selectedFields =
    PRICE_HISTORY_FIELDS[
      priceType
    ] ||
    PRICE_HISTORY_FIELDS.SS;

  const historyMap =
    new Map();

  const now = Date.now();

  const ONE_MONTH_MS =
    30 *
    24 *
    60 *
    60 *
    1000;

  const lastMonthTimestamp =
    now - ONE_MONTH_MS;

  if (
    Array.isArray(
      priceHistory
    )
  ) {
    priceHistory.forEach(
      (item) => {
        const productId =
          String(
            item?.product_id ??
              ""
          );

        if (!productId) {
          return;
        }

        const oldValue =
          Number(
            item?.[
              selectedFields
                .oldField
            ]
          );

        const newValue =
          Number(
            item?.[
              selectedFields
                .newField
            ]
          );

        /*
          No actual price change
          = no highlight.
        */

        if (
          !Number.isFinite(
            oldValue
          ) ||
          !Number.isFinite(
            newValue
          ) ||
          oldValue === newValue
        ) {
          return;
        }

        /*
          changed_at is preferred.
          If changed_at is not available,
          applicable_from is used.
        */

        const timestamp =
          new Date(
            item?.changed_at ??
              item?.applicable_from ??
              0
          ).getTime() || 0;

        /*
          Ignore invalid dates.
        */

        if (!timestamp) {
          return;
        }

        /*
          Ignore every price change older
          than the last 30 days.
        */

        if (
          timestamp <
          lastMonthTimestamp
        ) {
          return;
        }

        /*
          Ignore future-dated records.
        */

        if (
          timestamp > now
        ) {
          return;
        }

        const existing =
          historyMap.get(
            productId
          );

        const existingTimestamp =
          existing?.__timestamp ??
          -1;

        /*
          If multiple price changes happened
          within the last 30 days, only the
          latest one is used.
        */

        if (
          !existing ||
          timestamp >=
            existingTimestamp
        ) {
          historyMap.set(
            productId,
            {
              ...item,
              __timestamp:
                timestamp,
            }
          );
        }
      }
    );
  }

  /* =======================================================
     GROUP PRODUCTS
  ======================================================= */

  const grouped =
    new Map();

  products.forEach(
    (product) => {
      const category =
        getCategory(product);

      const groupKey =
        getCategoryGroupKey(
          category,
          categoryLookup
        );

      if (
        !grouped.has(
          groupKey
        )
      ) {
        grouped.set(
          groupKey,
          []
        );
      }

      grouped
        .get(groupKey)
        .push(product);
    }
  );

  /* =======================================================
     CONFIGURED GROUPS
  ======================================================= */

  const configuredSheetNames =
    new Set(
      combinedCategoryGroups.map(
        (group) =>
          group.sheetName
      )
    );

  const pageTitle =
    `${getPriceLabel(
      priceType
    )} - PRICE LIST`;

  const pageController =
    createPageController(
      doc,
      priceType,
      pageTitle
    );

  /*
    First page starts immediately.
  */

  pageController.drawHeaderOnce();

  let currentY = 16;

  /* =======================================================
     DATA CABLE SERIAL COUNTER

     ONLY DATA CABLE categories share
     this continuous serial number.
  ======================================================= */

  const dataCableSerialRef = {
    current: 1,
  };

  /* =======================================================
     COMBINED CATEGORY GROUPS

     Continuous page flow.
     Category order stays exactly as
     combinedCategoryGroups.
  ======================================================= */

  combinedCategoryGroups.forEach(
    (group) => {
      const groupProducts =
        grouped.get(
          group.sheetName
        ) || [];

      if (
        !groupProducts.length
      ) {
        return;
      }

      currentY =
        addCombinedGroup({
          doc,

          startY:
            currentY,

          group,

          products:
            groupProducts,

          categoryLookup,

          priceType,

          priceHistoryMap:
            historyMap,

          pageController,

          /*
            Same DATA CABLE serial
            counter is shared.
          */

          dataCableSerialRef,
        });
    }
  );

  /* =======================================================
     NORMAL GROUPS

     Continuous page flow.

     CHARGER / TWS EARBUDS /
     NECKBAND / SPEAKER
     are handled inside addCategorySection
     and ALWAYS begin from a new page.

     MEMORY CARD / PENDRIVE
     are handled there with blank PRICE.

     DATA CABLE categories use one
     continuous serial number.

     Category order for normal groups
     remains the existing alphabetical
     group order.

     Products inside each category
     are sorted by price ascending.
  ======================================================= */

  const normalGroups =
    [
      ...grouped.entries(),
    ]
      .filter(
        ([groupKey]) =>
          !configuredSheetNames.has(
            groupKey
          )
      )
      .sort(
        ([a], [b]) =>
          String(a).localeCompare(
            String(b)
          )
      );

  normalGroups.forEach(
    ([category, categoryProducts]) => {
      if (
        !categoryProducts.length
      ) {
        return;
      }

      currentY =
        addCategorySection({
          doc,

          startY:
            currentY,

          title:
            category,

          products:
            categoryProducts,

          priceType,

          useMah: false,

          priceHistoryMap:
            historyMap,

          pageController,

          /*
            DATA CABLE serial remains
            continuous between categories.
          */

          dataCableSerialRef,
        });
    }
  );

  /* =======================================================
     FOOTER
  ======================================================= */

  drawFooter(doc);

  /* =======================================================
     FILE NAME
  ======================================================= */

  const filePrefix =
    priceType === "SS"
      ? "SS PRICE"
      : priceType === "DS"
        ? "DISTRIBUTOR PRICE"
        : "DEALER PRICE";

  doc.save(
    `${filePrefix} ${getDateText()}.pdf`
  );
};

export default exportPriceManagementPDF;