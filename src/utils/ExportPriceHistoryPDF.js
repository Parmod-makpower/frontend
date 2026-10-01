import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/* =========================================================
   HELPERS
========================================================= */

const getDateValue = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const getProductKey = (item) => {
  return (
    item?.product_id ??
    item?.product ??
    item?.product_code ??
    item?.model ??
    item?.product_name ??
    item?.id ??
    ""
  )
    .toString()
    .trim()
    .toLowerCase();
};

/* =========================================================
   CATEGORY HELPERS
========================================================= */

const normalizeCategory = (value) => {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
};

const getProductCategory = (item) => {
  return (
    item?.sub_category ??
    item?.subcategory ??
    item?.subCategory ??
    item?.category ??
    item?.product_category ??
    item?.productCategory ??
    ""
  )
    .toString()
    .trim();
};

const getCategoryKey = (item) => {
  return normalizeCategory(
    getProductCategory(item)
  );
};

/* =========================================================
   CATEGORY PRIORITY

   1. SPEAKER
   2. NECKBAND
   3. ALL OTHER CATEGORIES
========================================================= */

const getCategoryPriority = (category) => {
  const normalized =
    normalizeCategory(category);

  if (
    normalized === "SPEAKER" ||
    normalized.startsWith("SPEAKER ")
  ) {
    return 0;
  }

  if (
    normalized === "NECKBAND" ||
    normalized.startsWith("NECKBAND ")
  ) {
    return 1;
  }

  return 2;
};

/* =========================================================
   CHANGE DIRECTION

   INCREASE = 0
   DECREASE = 1
========================================================= */

const getPriceChangePriority = (
  item,
  oldField,
  newField
) => {
  const oldPrice = Number(
    item?.[oldField]
  );

  const newPrice = Number(
    item?.[newField]
  );

  if (
    !Number.isFinite(oldPrice) ||
    !Number.isFinite(newPrice)
  ) {
    return 2;
  }

  if (newPrice > oldPrice) {
    return 0;
  }

  if (newPrice < oldPrice) {
    return 1;
  }

  return 2;
};

/* =========================================================
   ORDER PRICE HISTORY

   CATEGORY ORDER:
   SPEAKER
   ↓
   NECKBAND
   ↓
   OTHER CATEGORIES

   INSIDE EACH CATEGORY:
   PRICE INCREASE
   ↓
   PRICE DECREASE

   Same category + same direction:
   original order preserved.
========================================================= */

const sortPriceHistoryForPDF = (
  history,
  oldField,
  newField
) => {
  if (!Array.isArray(history)) {
    return [];
  }

  /*
    Keep first appearance order of
    normal categories.

    Other categories are NOT
    alphabetically sorted.
  */

  const categoryOrder =
    new Map();

  history.forEach((item) => {
    const category =
      getCategoryKey(item);

    if (
      !categoryOrder.has(category)
    ) {
      categoryOrder.set(
        category,
        categoryOrder.size
      );
    }
  });

  return history
    .map((item, index) => {
      const category =
        getCategoryKey(item);

      const categoryPriority =
        getCategoryPriority(
          category
        );

      const changePriority =
        getPriceChangePriority(
          item,
          oldField,
          newField
        );

      return {
        item,
        originalIndex: index,
        category,
        categoryPriority,
        changePriority,
        categoryOriginalOrder:
          categoryOrder.get(
            category
          ) ?? 999999,
      };
    })
    .sort((a, b) => {
      /* -----------------------------------------------
         SPEAKER -> NECKBAND -> OTHER
      ----------------------------------------------- */

      if (
        a.categoryPriority !==
        b.categoryPriority
      ) {
        return (
          a.categoryPriority -
          b.categoryPriority
        );
      }

      /* -----------------------------------------------
         OTHER CATEGORIES:
         preserve first appearance order
      ----------------------------------------------- */

      if (
        a.categoryPriority === 2 &&
        a.categoryOriginalOrder !==
          b.categoryOriginalOrder
      ) {
        return (
          a.categoryOriginalOrder -
          b.categoryOriginalOrder
        );
      }

      /* -----------------------------------------------
         SAME CATEGORY:
         INCREASE -> DECREASE
      ----------------------------------------------- */

      if (
        a.changePriority !==
        b.changePriority
      ) {
        return (
          a.changePriority -
          b.changePriority
        );
      }

      /* -----------------------------------------------
         SAME CATEGORY + SAME DIRECTION
      ----------------------------------------------- */

      return (
        a.originalIndex -
        b.originalIndex
      );
    })
    .map(
      ({ item }) => item
    );
};

/* =========================================================
   LAST 7 DAYS
========================================================= */

const isWithinLast7Days = (value) => {
  const date = getDateValue(value);

  if (!date) return false;

  const now = new Date();

  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );

  const sevenDaysAgo =
    new Date(todayStart);

  sevenDaysAgo.setDate(
    todayStart.getDate() - 6
  );

  const todayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  return (
    date >= sevenDaysAgo &&
    date <= todayEnd
  );
};

/* =========================================================
   GET LATEST RECORD PER PRODUCT
========================================================= */

const getLatestHistoryPerProduct = (
  history
) => {
  const latestMap = new Map();

  history.forEach((item) => {
    if (
      !isWithinLast7Days(
        item?.changed_at
      )
    ) {
      return;
    }

    const productKey =
      getProductKey(item);

    if (!productKey) {
      return;
    }

    const currentDate =
      getDateValue(
        item?.changed_at
      );

    const existing =
      latestMap.get(productKey);

    if (!existing) {
      latestMap.set(
        productKey,
        item
      );

      return;
    }

    const existingDate =
      getDateValue(
        existing?.changed_at
      );

    if (
      currentDate &&
      (
        !existingDate ||
        currentDate.getTime() >
          existingDate.getTime()
      )
    ) {
      latestMap.set(
        productKey,
        item
      );
    }
  });

  return Array.from(
    latestMap.values()
  );
};

/* =========================================================
   PRICE TYPE CONFIG

   IMPORTANT:
   Price type is still used internally to select
   the correct old/new price fields.

   It is NOT displayed in the PDF title,
   footer or filename.
========================================================= */

const getPriceFields = (
  priceType
) => {
  switch (priceType) {
    case "DISTRIBUTER":
      return {
        oldField: "old_ds_price",
        newField: "new_ds_price",
      };

    case "DEALER":
      return {
        oldField: "old_dlr_price",
        newField: "new_dlr_price",
      };

    case "SS":
    default:
      return {
        oldField: "old_price",
        newField: "new_price",
      };
  }
};

/* =========================================================
   MAIN EXPORT FUNCTION
========================================================= */

export const exportPriceHistoryPDF = (
  history = [],
  priceType = "SS"
) => {
  try {
    /* =====================================================
       VALIDATION
    ===================================================== */

    if (
      !Array.isArray(history) ||
      !history.length
    ) {
      window.alert(
        "No price history available for export."
      );

      return;
    }

    const {
      oldField,
      newField,
    } = getPriceFields(
      priceType
    );

    /* =====================================================
       STEP 1:
       LAST 7 DAYS + LATEST RECORD PER PRODUCT
    ===================================================== */

    const latestHistory =
      getLatestHistoryPerProduct(
        history
      );

    /* =====================================================
       STEP 2:
       ONLY PRODUCTS WHERE PRICE CHANGED
    ===================================================== */

    const changedHistory =
      latestHistory.filter(
        (item) => {
          const oldPrice =
            Number(
              item?.[oldField]
            );

          const newPrice =
            Number(
              item?.[newField]
            );

          if (
            Number.isNaN(
              oldPrice
            ) ||
            Number.isNaN(
              newPrice
            )
          ) {
            return false;
          }

          return (
            oldPrice !==
            newPrice
          );
        }
      );

    /* =====================================================
       NO DATA
    ===================================================== */

    if (
      !changedHistory.length
    ) {
      window.alert(
        "No price changes found for the last 7 days."
      );

      return;
    }

    /* =====================================================
       STEP 3:
       SORT DATA

       SPEAKER
       ↓
       NECKBAND
       ↓
       OTHER

       INSIDE CATEGORY:

       INCREASE
       ↓
       DECREASE
    ===================================================== */

    const orderedHistory =
      sortPriceHistoryForPDF(
        changedHistory,
        oldField,
        newField
      );

    /* =====================================================
       STEP 4:
       TABLE DATA

       SL
       CATEGORY
       MODEL
       OLD PRICE
       NEW PRICE
       DIFFERENCE
    ===================================================== */

    const tableRows =
      orderedHistory.map(
        (item, index) => {
          const oldPrice =
            Number(
              item?.[oldField]
            );

          const newPrice =
            Number(
              item?.[newField]
            );

          const category =
            getProductCategory(
              item
            ) || "OTHER";

          const model =
            item?.model ??
            item?.product_name ??
            item?.product_id ??
            item?.product_code ??
            "";

          return [
            index + 1,
            category,
            model,
            oldPrice,
            newPrice,
            newPrice -
              oldPrice,
          ];
        }
      );

    /* =====================================================
       STEP 5:
       CREATE PDF
    ===================================================== */

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    /* =====================================================
       PAGE DIMENSIONS
    ===================================================== */

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const pageHeight =
      doc.internal.pageSize.getHeight();

    const centerX =
      pageWidth / 2;

    /* =====================================================
       COLORS
    ===================================================== */

    const RED = [
      239,
      68,
      68,
    ];

    const DARK_RED = [
      185,
      28,
      28,
    ];

    /* GREEN:
       PRICE INCREASE
    */

    const GREEN = [
      22,
      163,
      74,
    ];

    const DARK_GREEN = [
      21,
      128,
      61,
    ];

    /* RED:
       PRICE DECREASE
    */

    const DECREASE_RED = [
      220,
      38,
      38,
    ];

    const DARK_TEXT = [
      30,
      41,
      59,
    ];

    const MUTED_TEXT = [
      100,
      116,
      139,
    ];

    const LIGHT_BORDER = [
      226,
      232,
      240,
    ];

    /* GREEN BACKGROUND */

    const SOFT_GREEN = [
      240,
      253,
      244,
    ];

    /* RED BACKGROUND */

    const SOFT_RED = [
      254,
      242,
      242,
    ];

    const WHITE = [
      255,
      255,
      255,
    ];

    /* =====================================================
       TOP BRAND LINE
    ===================================================== */

    doc.setFillColor(
      RED[0],
      RED[1],
      RED[2]
    );

    doc.rect(
      0,
      0,
      pageWidth,
      2.5,
      "F"
    );

    /* =====================================================
       TITLE

       ONLY:
       PRICE DIFFERENCE REPORT
    ===================================================== */

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(15);

    doc.setTextColor(
      DARK_TEXT[0],
      DARK_TEXT[1],
      DARK_TEXT[2]
    );

    doc.text(
      "PRICE DIFFERENCE",
      centerX,
      15,
      {
        align: "center",
      }
    );

    /* =====================================================
       REPORT INFO BADGE
    ===================================================== */

    const infoText =
      `${orderedHistory.length} ${
        orderedHistory.length === 1
          ? "Product"
          : "Products"
      }`;

    const infoWidth = 34;

    const infoHeight = 7;

    const infoX =
      centerX -
      infoWidth / 2;

    const infoY = 20;

    doc.setFillColor(
      SOFT_RED[0],
      SOFT_RED[1],
      SOFT_RED[2]
    );

    doc.setDrawColor(
      RED[0],
      RED[1],
      RED[2]
    );

    doc.setLineWidth(0.25);

    doc.roundedRect(
      infoX,
      infoY,
      infoWidth,
      infoHeight,
      3,
      3,
      "FD"
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(7);

    doc.setTextColor(
      DARK_RED[0],
      DARK_RED[1],
      DARK_RED[2]
    );

    doc.text(
      infoText,
      centerX,
      infoY + 4.7,
      {
        align: "center",
      }
    );

    /* =====================================================
       TABLE

       TOTAL WIDTH:
       10 + 45 + 35 + 30 + 30 + 36 = 186mm

       A4 usable width:
       210 - 24 = 186mm
    ===================================================== */

    autoTable(doc, {
      startY: 32,

      head: [
        [
          "SL",
          "CATEGORY",
          "MODEL",
          "OLD PRICE",
          "NEW PRICE",
          "DIFFERENCE",
        ],
      ],

      body: tableRows,

      theme: "grid",

      tableWidth: "auto",

      styles: {
        font: "helvetica",

        fontSize: 8.5,

        cellPadding: {
          top: 3,
          right: 2,
          bottom: 3,
          left: 2,
        },

        lineWidth: 0.25,

        lineColor:
          LIGHT_BORDER,

        textColor:
          DARK_TEXT,

        valign: "middle",

        halign: "center",

        overflow:
          "linebreak",

        cellWidth: "auto",
      },

      headStyles: {
        font: "helvetica",

        fontStyle:
          "bold",

        fontSize: 8.5,

        textColor:
          WHITE,

        fillColor:
          RED,

        lineColor:
          DARK_RED,

        lineWidth: 0.35,

        halign: "center",

        valign: "middle",

        cellPadding: {
          top: 3.5,
          right: 2,
          bottom: 3.5,
          left: 2,
        },
      },

      bodyStyles: {
        fontSize: 8.5,

        textColor:
          DARK_TEXT,

        halign: "center",

        valign: "middle",

        lineColor:
          LIGHT_BORDER,

        lineWidth: 0.2,
      },

      alternateRowStyles: {
        fillColor: [
          248,
          250,
          252,
        ],
      },

      columnStyles: {
        /* ---------------------------------------------
           SL
        --------------------------------------------- */

        0: {
          cellWidth: 10,
          halign: "center",
        },

        /* ---------------------------------------------
           CATEGORY
        --------------------------------------------- */

        1: {
          cellWidth: 45,
          halign: "left",
          fontStyle: "bold",
        },

        /* ---------------------------------------------
           MODEL
        --------------------------------------------- */

        2: {
          cellWidth: 35,
          halign: "left",
          fontStyle: "bold",
        },

        /* ---------------------------------------------
           OLD PRICE
        --------------------------------------------- */

        3: {
          cellWidth: 30,
          halign: "center",
        },

        /* ---------------------------------------------
           NEW PRICE
        --------------------------------------------- */

        4: {
          cellWidth: 30,
          halign: "center",
        },

        /* ---------------------------------------------
           DIFFERENCE
        --------------------------------------------- */

        5: {
          cellWidth: 36,
          halign: "center",
          fontStyle: "bold",
        },
      },

      /* =================================================
         CELL FORMATTING
      ================================================= */

      didParseCell: (data) => {
        /* ===============================================
           DIFFERENCE COLUMN
        =============================================== */

        if (
          data.section ===
            "body" &&
          data.column.index === 5
        ) {
          const value =
            Number(
              data.cell.raw
            );

          /* ---------------------------------------------
             PRICE INCREASE = GREEN
          --------------------------------------------- */

          if (value > 0) {
            data.cell.styles.textColor =
              DARK_GREEN;

            data.cell.styles.fillColor =
              SOFT_GREEN;

            data.cell.styles.fontStyle =
              "bold";
          }

          /* ---------------------------------------------
             PRICE DECREASE = RED
          --------------------------------------------- */

          if (value < 0) {
            data.cell.styles.textColor =
              DECREASE_RED;

            data.cell.styles.fillColor =
              SOFT_RED;

            data.cell.styles.fontStyle =
              "bold";
          }
        }

        /* ===============================================
           SL COLUMN
        =============================================== */

        if (
          data.section ===
            "body" &&
          data.column.index === 0
        ) {
          data.cell.styles.textColor =
            MUTED_TEXT;
        }

        /* ===============================================
           CATEGORY COLUMN
        =============================================== */

        if (
          data.section ===
            "body" &&
          data.column.index === 1
        ) {
          data.cell.styles.textColor = [
            71,
            85,
            105,
          ];

          data.cell.styles.fontStyle =
            "bold";
        }
      },

      margin: {
        left: 12,
        right: 12,
        top: 32,
        bottom: 18,
      },

      pageBreak: "auto",

      showHead: "everyPage",
    });

    /* =====================================================
       FOOTER ON ALL PAGES
    ===================================================== */

    const totalPages =
      doc.internal.getNumberOfPages();

    const today =
      new Date();

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const year =
      today.getFullYear();

    for (
      let page = 1;
      page <= totalPages;
      page++
    ) {
      doc.setPage(page);

      /* -----------------------------------------------
         FOOTER LINE
      ----------------------------------------------- */

      doc.setDrawColor(
        LIGHT_BORDER[0],
        LIGHT_BORDER[1],
        LIGHT_BORDER[2]
      );

      doc.setLineWidth(0.25);

      doc.line(
        12,
        pageHeight - 13,
        pageWidth - 12,
        pageHeight - 13
      );

      /* -----------------------------------------------
         FOOTER TEXT
      ----------------------------------------------- */

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(7);

      doc.setTextColor(
        MUTED_TEXT[0],
        MUTED_TEXT[1],
        MUTED_TEXT[2]
      );

      /* LEFT */

      doc.text(
        "MAKPOWER • Price Management",
        12,
        pageHeight - 8
      );

      /* CENTER */

      doc.text(
        "Price Difference Report",
        centerX,
        pageHeight - 8,
        {
          align: "center",
        }
      );

      /* RIGHT */

      doc.text(
        `Page ${page} of ${totalPages}`,
        pageWidth - 12,
        pageHeight - 8,
        {
          align: "right",
        }
      );
    }

    /* =====================================================
       FILE NAME

       NO SS / DS / DEALER
    ===================================================== */

    const fileName =
      `PRICE DIFFERENCE ` +
      `${day}-${month}-${year}.pdf`;

    /* =====================================================
       DOWNLOAD
    ===================================================== */

    doc.save(fileName);
  } catch (error) {
    console.error(
      "Price History PDF Export Error:",
      error
    );

    window.alert(
      "Unable to export price history to PDF."
    );
  }
};

export default exportPriceHistoryPDF;