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
   COMPACT A4 PORTRAIT
========================================================= */

const drawPageHeader = (
  doc,
  priceType,
  pageTitle
) => {
  const pageWidth =
    doc.internal.pageSize.getWidth();

  /*
   * Compact header:
   * Old: 18mm
   * New: 13mm
   */
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

  /*
   * Brand
   */
  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(9.5);

  doc.text(
    "MAKPOWER",
    7,
    6
  );

  /*
   * Price list title
   */
  doc.setFontSize(6);

  doc.text(
    pageTitle,
    7,
    10.5
  );

  /*
   * Type
   */
  const typeLabel =
    priceType === "SS"
      ? "SS"
      : priceType === "DS"
      ? "DISTRIBUTOR"
      : "DEALER";

  doc.setFontSize(5.8);

  doc.text(
    typeLabel,
    pageWidth - 7,
    5.8,
    {
      align: "right",
    }
  );

  /*
   * Date
   */
  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(5.5);

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

    doc.setFontSize(5.2);

    doc.setTextColor(
      ...COLORS.slate
    );

    doc.text(
      "MAKPOWER PRICE LIST",
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
    pageWidth - 14;

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
   * Only create a new page when
   * there is genuinely not enough
   * space for the section.
   */
  if (y > 276) {
    doc.addPage();
    y = 16;
  }

  /* =======================================================
     COMPACT CATEGORY TITLE
  ======================================================= */

  doc.setFillColor(
    ...COLORS.light
  );

  doc.setDrawColor(
    ...COLORS.border
  );

  doc.setLineWidth(0.2);

  /*
   * Compact title height.
   */
  doc.rect(
    7,
    y,
    tableWidth,
    5.5,
    "FD"
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(7.5);

  doc.setTextColor(
    ...COLORS.dark
  );

  doc.text(
    title || "CATEGORY",
    9,
    y + 3.7
  );

  y += 6;

  /* =======================================================
     COMPACT TABLE
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
      top: 16,
      right: 7,
      bottom: 8,
      left: 7,
    },

    tableWidth,

    pageBreak: "auto",

    showHead: "everyPage",

    /*
     * Prevent unnecessary large
     * empty spaces.
     */
    rowPageBreak: "avoid",

    styles: {
      font: "helvetica",

      fontStyle: "bold",

      /*
       * Slightly smaller than the
       * previous 8px, but still
       * clearly readable.
       */
      fontSize: 7,

      /*
       * Main page-count reduction.
       */
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

      /*
       * ALL BODY TEXT CENTER
       */
      halign: "center",

      overflow: "linebreak",
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

      fontSize: 7,

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
       * SL NO.
       */
      0: {
        cellWidth: 14,
        halign: "center",
      },

      /*
       * MODEL
       */
      1: {
        cellWidth: 82,
        halign: "center",
        fontStyle: "bold",
      },

      /*
       * MAH / CARTON
       */
      2: {
        cellWidth: 29,
        halign: "center",
      },

      /*
       * GUARANTEE
       */
      3: {
        cellWidth: 33,
        halign: "center",
      },

      /*
       * PRICE
       */
      4: {
        cellWidth: 36,
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

  /*
   * Small gap between sections.
   * This is intentionally compact
   * so multiple sections can fit
   * on one page.
   */
  return (
    doc.lastAutoTable.finalY + 2.5
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

  /*
   * SAME EXCEL LOGIC:
   *
   * ECO SERIES
   * Polymer Battery
   *
   * all sections use MAH.
   */
  const useMah =
    isMahGroup(
      group.sheetName
    );

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
   * Keep unexpected products.
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

      products:
        remaining,

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

  /* =======================================================
     A4 PORTRAIT
  ======================================================= */

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  /* =======================================================
     CATEGORY LOOKUP
  ======================================================= */

  const categoryLookup =
    createCategoryLookup(
      combinedCategoryGroups
    );

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

  /* =======================================================
     CONFIGURED SHEETS
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

      /*
       * Start combined group on
       * a new page, but sections
       * INSIDE the group use all
       * remaining available space.
       */
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

        /*
         * Compact header ends at
         * approximately 13mm.
         */
        startY: 16,

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
      /*
       * Keep category flow compact.
       */
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

        startY: 16,

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