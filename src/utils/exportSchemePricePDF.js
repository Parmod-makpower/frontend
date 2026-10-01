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

const getFilePrefix = (priceType) => {
  if (priceType === "DS") {
    return "DISTRIBUTOR SCHEME PRICE";
  }

  if (priceType === "DLR") {
    return "DEALER SCHEME PRICE";
  }

  return "SS SCHEME PRICE";
};

/* =========================================================
   BLANK PRICE CATEGORIES
========================================================= */

const BLANK_PRICE_CATEGORIES = new Set([
  "MEMORY CARD",
  "PENDRIVE",
]);

const shouldHidePrice = (product) => {
  return BLANK_PRICE_CATEGORIES.has(
    normalize(getCategory(product))
  );
};

/* =========================================================
   IMPORTANT:
   SS PRICE RESTORE

   useCachedProducts formats SS price:

   62  -> 6.2
   66  -> 6.6
   70  -> 7.0

   PDF mein SS ke liye original value wapas:
   6.2 -> 62
   6.6 -> 66
   7.0 -> 70

   DS / DLR ko touch nahi kiya gaya.
========================================================= */

const restoreSSPrice = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return value;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return value;
  }

  const restoredValue =
    numericValue * 10;

  /*
   * Agar whole number hai to decimal
   * remove kar do.
   *
   * 62.0 -> 62
   * 66.0 -> 66
   * 70.0 -> 70
   */

  if (
    Number.isInteger(restoredValue)
  ) {
    return String(restoredValue);
  }

  return String(restoredValue);
};

const getPdfPriceValue = (
  product,
  priceType
) => {
  if (shouldHidePrice(product)) {
    return "";
  }

  const field =
    getPriceField(priceType);

  const value =
    product?.[field] ?? "";

  /*
   * ONLY SS
   */
  if (priceType === "SS") {
    return restoreSSPrice(value);
  }

  /*
   * DS / DLR EXACTLY AS BEFORE
   */
  return value;
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

  border: [203, 213, 225],

  white: [255, 255, 255],

  row: [250, 250, 250],

  categoryYellow: [254, 249, 195],

  categoryYellowBorder: [234, 179, 8],

  categoryText: [51, 65, 85],
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

  /*
   * DARK HEADER
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

  /*
   * TITLE
   */

  doc.setTextColor(
    ...COLORS.white
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(8);

  doc.text(
    pageTitle,
    7,
    7
  );

  /*
   * PRICE TYPE
   */

  const typeLabel =
    priceType === "SS"
      ? "SS"
      : priceType === "DS"
      ? "DISTRIBUTOR"
      : "DEALER";

  doc.setFontSize(6.8);

  doc.text(
    typeLabel,
    pageWidth - 7,
    5.8,
    {
      align: "right",
    }
  );

  /*
   * DATE
   */

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(6.2);

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

    doc.setFontSize(5.8);

    doc.setTextColor(
      ...COLORS.slate
    );

    doc.text(
      "INTERNATIONAL TRIP SCHEME PRICE LIST",
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
   PAGE CONTROLLER
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
      renderedHeaders.has(pageNumber)
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
   CATEGORY ORDER
========================================================= */

const CATEGORY_PRIORITY = {
  "DATA CABLE V8": 1,
  "DATA CABLE TYPE-C": 2,
  "DATA CABLE I PHONE": 3,
};

const getCategorySortValue = (
  category
) => {
  const normalized =
    normalize(category);

  return (
    CATEGORY_PRIORITY[
      normalized
    ] ?? 1000
  );
};

/* =========================================================
   NEW PAGE CATEGORY
========================================================= */

const NEW_PAGE_CATEGORIES = new Set([
  "TWS",
]);

const isNewPageCategory = (
  category
) => {
  return NEW_PAGE_CATEGORIES.has(
    normalize(category)
  );
};

/* =========================================================
   CATEGORY TITLE
========================================================= */

const drawCategoryTitle = (
  doc,
  y,
  title,
  tableWidth
) => {
  const x = 7;

  const height = 7.5;

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

  doc.setFontSize(8.2);

  doc.setTextColor(
    ...COLORS.categoryText
  );

  doc.text(
    String(
      title || "CATEGORY"
    ),
    x + tableWidth / 2,
    y + 5,
    {
      align: "center",
    }
  );

  return y + height;
};

/* =========================================================
   PRICE SORT
========================================================= */

const getNumericPrice = (
  product,
  priceType
) => {
  if (shouldHidePrice(product)) {
    return Number.POSITIVE_INFINITY;
  }

  const value = Number(
    getPdfPriceValue(
      product,
      priceType
    )
  );

  return Number.isFinite(value)
    ? value
    : Number.POSITIVE_INFINITY;
};

const sortProductsByPrice = (
  products,
  priceType
) => {
  return [...products].sort(
    (a, b) => {
      const priceA =
        getNumericPrice(
          a,
          priceType
        );

      const priceB =
        getNumericPrice(
          b,
          priceType
        );

      if (priceA !== priceB) {
        return (
          priceA - priceB
        );
      }

      return String(
        getModel(a)
      ).localeCompare(
        String(getModel(b)),
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        }
      );
    }
  );
};

/* =========================================================
   CATEGORY GROUPING
========================================================= */

const groupProductsByCategory = (
  products,
  priceType
) => {
  const grouped = new Map();

  products.forEach(
    (product) => {
      const category =
        getCategory(product);

      const key =
        normalize(category);

      if (!grouped.has(key)) {
        grouped.set(key, {
          category,
          products: [],
        });
      }

      grouped
        .get(key)
        .products.push(product);
    }
  );

  return [...grouped.values()]
    .sort((a, b) => {
      const priorityA =
        getCategorySortValue(
          a.category
        );

      const priorityB =
        getCategorySortValue(
          b.category
        );

      if (
        priorityA !== priorityB
      ) {
        return (
          priorityA - priorityB
        );
      }

      return String(
        a.category
      ).localeCompare(
        String(b.category),
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        }
      );
    })
    .map((group) => ({
      ...group,

      products:
        sortProductsByPrice(
          group.products,
          priceType
        ),
    }));
};

/* =========================================================
   CATEGORY SECTION

   IMPORTANT:
   serialNumberRef keeps serial continuous
   across ALL categories.
========================================================= */

const addCategorySection = ({
  doc,
  startY,
  category,
  products,
  priceType,
  pageController,
  serialNumberRef,
}) => {
  if (!products.length) {
    return startY;
  }

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const tableWidth =
    pageWidth - 14;

  let y = startY;

  /* =======================================================
     TWS NEW PAGE
  ======================================================= */

  if (
    isNewPageCategory(category) &&
    y > 16.1
  ) {
    pageController.addPage();

    y = 16;
  }

  /* =======================================================
     GLOBAL SERIAL NUMBER
  ======================================================= */

  const rows =
    products.map(
      (product) => {
        const currentSerial =
          serialNumberRef.current;

        serialNumberRef.current += 1;

        return [
          currentSerial,

          getCategory(product),

          getModel(product),

          calculateGuarantee(
            getGuarantee(product),
            priceType
          ),

          getPdfPriceValue(
            product,
            priceType
          ),
        ];
      }
    );

  /* =======================================================
     CATEGORY HEADER
  ======================================================= */

  y = drawCategoryTitle(
    doc,
    y,
    category,
    tableWidth
  );

  y += 1;

  /* =======================================================
     TABLE
  ======================================================= */

  autoTable(doc, {
    startY: y,

    head: [[
      "SL. NO.",
      "CATEGORY",
      "ITEM",
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

    rowPageBreak: "avoid",

    styles: {
      font: "helvetica",

      fontStyle: "bold",

      fontSize: 8.5,

      cellPadding: {
        top: 1.35,
        right: 1.5,
        bottom: 1.35,
        left: 1.5,
      },

      textColor:
        COLORS.dark,

      lineColor:
        COLORS.border,

      lineWidth: 0.2,

      valign: "middle",

      halign: "center",

      overflow: "linebreak",
    },

    headStyles: {
      fillColor:
        COLORS.red,

      textColor:
        COLORS.white,

      font: "helvetica",

      fontStyle: "bold",

      fontSize: 8.6,

      halign: "center",

      valign: "middle",

      cellPadding: {
        top: 1.6,
        right: 1.5,
        bottom: 1.6,
        left: 1.5,
      },
    },

    bodyStyles: {
      fillColor:
        COLORS.white,

      fontStyle: "bold",

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
        cellWidth: 42,
        halign: "center",
        fontStyle: "bold",
      },

      2: {
        cellWidth: 72,
        halign: "center",
        fontStyle: "bold",
      },

      3: {
        cellWidth: 32,
        halign: "center",
      },

      4: {
        cellWidth: 36,
        halign: "center",
        fontStyle: "bold",
      },
    },

    didDrawPage: () => {
      pageController.drawHeaderOnce();
    },
  });

  return (
    doc.lastAutoTable.finalY + 3
  );
};

/* =========================================================
   MAIN EXPORT
========================================================= */

export const exportSchemePricePDF = ({
  products = [],
  priceType = "SS",
  filePrefix,
} = {}) => {
  if (!Array.isArray(products)) {
    return;
  }

  if (!products.length) {
    window.alert(
      "No scheme products available for PDF."
    );

    return;
  }

  /* =======================================================
     PDF
  ======================================================= */

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  /* =======================================================
     PAGE TITLE
  ======================================================= */

  const pageTitle =
    "INTERNATIONAL TRIP SCHEME PRICE LIST";

  const pageController =
    createPageController(
      doc,
      priceType,
      pageTitle
    );

  pageController.drawHeaderOnce();

  let currentY = 16;

  /* =======================================================
     DATE RANGE - CENTER + HIGHLIGHT
  ======================================================= */

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const dateText =
    "1st October 2026 to 31st December 2026";

  const dateBoxWidth = 82;

  const dateBoxHeight = 7;

  const dateBoxX =
    (pageWidth - dateBoxWidth) / 2;

  const dateBoxY =
    currentY - 1;

  /*
   * Light yellow highlighted box
   */

  doc.setFillColor(
    ...COLORS.categoryYellow
  );

  doc.setDrawColor(
    ...COLORS.categoryYellowBorder
  );

  doc.setLineWidth(0.25);

  doc.roundedRect(
    dateBoxX,
    dateBoxY,
    dateBoxWidth,
    dateBoxHeight,
    1.5,
    1.5,
    "FD"
  );

  /*
   * Center text
   */

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(7);

  doc.setTextColor(
    ...COLORS.categoryText
  );

  doc.text(
    dateText,
    pageWidth / 2,
    dateBoxY + 4.7,
    {
      align: "center",
    }
  );

  currentY += 10;

  /* =======================================================
     GLOBAL SERIAL COUNTER

     1 -> first product
     2 -> second product
     ...
     LAST -> last product
  ======================================================= */

  const serialNumberRef = {
    current: 1,
  };

  /* =======================================================
     CATEGORY GROUPING
  ======================================================= */

  const groupedCategories =
    groupProductsByCategory(
      products,
      priceType
    );

  /* =======================================================
     RENDER ALL CATEGORIES
  ======================================================= */

  groupedCategories.forEach(
    (group) => {
      if (!group.products.length) {
        return;
      }

      currentY =
        addCategorySection({
          doc,

          startY:
            currentY,

          category:
            group.category,

          products:
            group.products,

          priceType,

          pageController,

          serialNumberRef,
        });
    }
  );

  /* =======================================================
     FOOTER
  ======================================================= */

  drawFooter(doc);

  /* =======================================================
     SAVE
  ======================================================= */

  const prefix =
    filePrefix ||
    getFilePrefix(priceType);

  doc.save(
    `${prefix} ${getDateText()}.pdf`
  );
};

export default exportSchemePricePDF;