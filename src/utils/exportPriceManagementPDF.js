import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* =========================================================
   HELPERS
========================================================= */

const normalize = (value) =>
  String(value ?? "").trim().toUpperCase();

const getProductId = (product) =>
  product?.product_id ?? product?.id ?? "";

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

  /*
   * Only numeric month guarantees
   * are modified.
   *
   * SS:
   * 12 -> 12
   * 6  -> 6
   *
   * DS:
   * 12 -> 9
   * 6  -> 3
   * 3  -> 3
   *
   * DLR:
   * 12 -> 6
   * 6  -> 3
   * 3  -> 3
   *
   * Counter / No Guarantee /
   * Lifetime / other text:
   * unchanged
   */

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
  const value =
    String(category ?? "").trim();

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
   IMPORTANT
   SAME MAH LOGIC AS EXCEL
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

  const year =
    date.getFullYear();

  return `${day}-${month}-${year}`;
};

/* =========================================================
   COLORS
   SAME CLEAN MAKPOWER STYLE
========================================================= */

const COLORS = {
  red: [252, 37, 12],
  dark: [15, 23, 42],
  slate: [71, 85, 105],
  light: [248, 250, 252],
  border: [203, 213, 225],
  white: [255, 255, 255],
  row: [250, 250, 250],
};

/* =========================================================
   PAGE HEADER
   A4 PORTRAIT
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
    18,
    "F"
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(12);

  doc.setTextColor(
    ...COLORS.white
  );

  doc.text(
    "MAKPOWER",
    8,
    8
  );

  doc.setFontSize(7.5);

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.text(
    pageTitle,
    8,
    14
  );

  const typeLabel =
    priceType === "SS"
      ? "SS"
      : priceType === "DS"
      ? "DISTRIBUTOR"
      : "DEALER";

  doc.setFontSize(7);

  doc.text(
    typeLabel,
    pageWidth - 8,
    8,
    {
      align: "right",
    }
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.text(
    getDateText(),
    pageWidth - 8,
    14,
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

    doc.setFontSize(6.5);

    doc.setTextColor(
      ...COLORS.slate
    );

    doc.text(
      "MAKPOWER PRICE LIST",
      8,
      pageHeight - 6
    );

    doc.text(
      `Page ${page} of ${pageCount}`,
      pageWidth - 8,
      pageHeight - 6,
      {
        align: "right",
      }
    );
  }
};

/* =========================================================
   CATEGORY SECTION
========================================================= */

const addCategorySection = ({
  doc,
  startY,
  title,
  products,
  priceType,
  useMah = false,
}) => {
  if (!products.length) {
    return startY;
  }

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const tableWidth =
    pageWidth - 16;

  const priceField =
    getPriceField(priceType);

  const rows = products.map(
    (product, index) => {
      const guarantee =
        calculateGuarantee(
          getGuarantee(product),
          priceType
        );

      return [
        index + 1,
        getModel(product),
        useMah
          ? getMah(product)
          : getCartonSize(product),
        guarantee,
        product?.[priceField] ?? "",
      ];
    }
  );

  let y = startY;

  /*
   * Keep enough space for section title.
   */

  if (y > 270) {
    doc.addPage();
    y = 24;
  }

  /* =======================================================
     CATEGORY TITLE
  ======================================================= */

  doc.setFillColor(
    ...COLORS.light
  );

  doc.setDrawColor(
    ...COLORS.border
  );

  doc.setLineWidth(0.25);

  doc.rect(
    8,
    y,
    tableWidth,
    7,
    "FD"
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(9);

  doc.setTextColor(
    ...COLORS.dark
  );

  doc.text(
    title || "CATEGORY",
    11,
    y + 4.7
  );

  y += 8;

  /* =======================================================
     TABLE
  ======================================================= */

  autoTable(doc, {
    startY: y,

    head: [[
      "SL. NO.",
      "MODEL",
      useMah
        ? "MAH"
        : "CARTON",
      "GUARANTEE",
      "PRICE",
    ]],

    body: rows,

    theme: "grid",

    margin: {
      top: 23,
      right: 8,
      bottom: 12,
      left: 8,
    },

    tableWidth,

    pageBreak: "auto",

    showHead: "everyPage",

    styles: {
      font: "helvetica",
      fontStyle: "bold",

      /*
       * Increased from 7.2
       * to make PDF text clearer.
       */
      fontSize: 8,

      cellPadding: {
        top: 2.5,
        right: 2,
        bottom: 2.5,
        left: 2,
      },

      textColor:
        COLORS.dark,

      lineColor:
        COLORS.border,

      lineWidth: 0.25,

      valign: "middle",

      /*
       * ALL TABLE BODY TEXT
       * CENTER HORIZONTALLY
       */
      halign: "center",
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

      /*
       * Slightly bigger header.
       */
      fontSize: 8,

      /*
       * ALL HEADER TEXT CENTER
       */
      halign: "center",

      valign: "middle",

      cellPadding: {
        top: 2.7,
        right: 2,
        bottom: 2.7,
        left: 2,
      },
    },

    bodyStyles: {
      fillColor:
        COLORS.white,

      fontStyle:
        "bold",

      /*
       * Explicitly center all
       * body text horizontally.
       */
      halign: "center",

      valign: "middle",
    },

    alternateRowStyles: {
      fillColor:
        COLORS.row,
    },

    columnStyles: {
      0: {
        cellWidth: 16,
        halign: "center",
      },

      1: {
        cellWidth: 76,

        /*
         * MODEL ALSO CENTER
         */
        halign: "center",

        fontStyle: "bold",
      },

      2: {
        cellWidth: 32,
        halign: "center",
      },

      3: {
        cellWidth: 34,
        halign: "center",
      },

      4: {
        cellWidth: 36,

        /*
         * PRICE ALSO CENTER
         */
        halign: "center",
      },
    },

    didDrawPage: () => {
      drawPageHeader(
        doc,
        priceType,
        `${getPriceLabel(
          priceType
        )} - PRICE LIST`
      );
    },
  });

  return (
    doc.lastAutoTable.finalY + 5
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
}) => {
  let y = startY;

  const useMah =
    isMahGroup(
      group.sheetName
    );

  /*
   * IMPORTANT:
   *
   * useMah is based on the SHEET,
   * exactly like Excel.
   *
   * Therefore:
   *
   * ECO SERIES
   * POUCH BATTERY
   *
   * AND ALL:
   *
   * POLYMER MI
   * POLYMER OPPO
   * POLYMER VIVO
   * POLYMER SAMSUNG
   * etc.
   *
   * get MAH.
   */

  const sections =
    group.sections || [];

  const usedCategories =
    new Set();

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
                getCategory(product)
              );

            return aliases.some(
              (alias) =>
                normalize(alias) ===
                productCategory
            );
          }
        );

      if (!sectionProducts.length) {
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
      });
    }
  );

  /*
   * Keep unexpected products from
   * getting lost.
   */

  const remaining =
    products.filter(
      (product) =>
        !usedCategories.has(
          normalize(
            getCategory(product)
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
  combinedCategoryGroups = []
) => {
  if (
    !Array.isArray(products) ||
    !products.length
  ) {
    return;
  }

  /*
   * PORTRAIT / VERTICAL A4
   */

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

  /*
   * Group products exactly like
   * Price Management Excel.
   */

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

      if (!grouped.has(groupKey)) {
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

  let firstGroup = true;

  /* =======================================================
     COMBINED GROUPS
  ======================================================= */

  combinedCategoryGroups.forEach(
    (group) => {
      const groupProducts =
        grouped.get(
          group.sheetName
        ) || [];

      if (!groupProducts.length) {
        return;
      }

      if (!firstGroup) {
        doc.addPage();
      }

      firstGroup = false;

      drawPageHeader(
        doc,
        priceType,
        pageTitle
      );

      addCombinedGroup({
        doc,
        startY: 24,
        group,
        products:
          groupProducts,
        categoryLookup,
        priceType,
      });
    }
  );

  /* =======================================================
     NORMAL CATEGORIES
  ======================================================= */

  const normalGroups = [
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
      if (!firstGroup) {
        doc.addPage();
      }

      firstGroup = false;

      drawPageHeader(
        doc,
        priceType,
        pageTitle
      );

      addCategorySection({
        doc,
        startY: 24,
        title: category,
        products:
          categoryProducts,
        priceType,
        useMah: false,
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