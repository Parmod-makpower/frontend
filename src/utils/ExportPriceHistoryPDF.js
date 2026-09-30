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

  const sevenDaysAgo = new Date(todayStart);

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

const getLatestHistoryPerProduct = (history) => {
  const latestMap = new Map();

  history.forEach((item) => {
    if (!isWithinLast7Days(item?.changed_at)) {
      return;
    }

    const productKey = getProductKey(item);

    if (!productKey) {
      return;
    }

    const currentDate = getDateValue(
      item?.changed_at
    );

    const existing = latestMap.get(
      productKey
    );

    if (!existing) {
      latestMap.set(productKey, item);
      return;
    }

    const existingDate = getDateValue(
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
      latestMap.set(productKey, item);
    }
  });

  return Array.from(
    latestMap.values()
  );
};

/* =========================================================
   PRICE TYPE CONFIG
========================================================= */

const getPriceFields = (priceType) => {
  switch (priceType) {
    case "DISTRIBUTER":
      return {
        label: "Distributor",
        oldField: "old_ds_price",
        newField: "new_ds_price",
      };

    case "DEALER":
      return {
        label: "Dealer",
        oldField: "old_dlr_price",
        newField: "new_dlr_price",
      };

    case "SS":
    default:
      return {
        label: "SS",
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
    /* -------------------------------------------------------
       VALIDATION
    ------------------------------------------------------- */

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
      label,
      oldField,
      newField,
    } = getPriceFields(priceType);

    /* -------------------------------------------------------
       STEP 1:
       LAST 7 DAYS + LATEST RECORD PER PRODUCT
    ------------------------------------------------------- */

    const latestHistory =
      getLatestHistoryPerProduct(history);

    /* -------------------------------------------------------
       STEP 2:
       REMOVE PRODUCTS WHERE SELECTED PRICE
       DID NOT CHANGE
    ------------------------------------------------------- */

    const changedHistory =
      latestHistory.filter((item) => {
        const oldPrice = Number(
          item?.[oldField]
        );

        const newPrice = Number(
          item?.[newField]
        );

        if (
          Number.isNaN(oldPrice) ||
          Number.isNaN(newPrice)
        ) {
          return false;
        }

        return oldPrice !== newPrice;
      });

    /* -------------------------------------------------------
       NO DATA AFTER PRICE CHANGE FILTER
    ------------------------------------------------------- */

    if (!changedHistory.length) {
      window.alert(
        `No ${label} price changes found for the last 7 days.`
      );

      return;
    }

    /* -------------------------------------------------------
       STEP 3:
       PREPARE TABLE DATA
    ------------------------------------------------------- */

    const tableRows = changedHistory.map(
      (item, index) => {
        const oldPrice = Number(
          item?.[oldField]
        );

        const newPrice = Number(
          item?.[newField]
        );

        return [
          index + 1,

          item?.model ??
            item?.product_name ??
            item?.product_id ??
            item?.product_code ??
            "",

          oldPrice,

          newPrice,

          newPrice - oldPrice,
        ];
      }
    );

    /* -------------------------------------------------------
       STEP 4:
       CREATE PORTRAIT PDF
    ------------------------------------------------------- */

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    /* -------------------------------------------------------
       PAGE DIMENSIONS
    ------------------------------------------------------- */

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const pageHeight =
      doc.internal.pageSize.getHeight();

    const centerX = pageWidth / 2;

    /* -------------------------------------------------------
       BRAND COLORS
    ------------------------------------------------------- */

    const RED = [239, 68, 68];

    const DARK_RED = [185, 28, 28];

    const ORANGE = [249, 115, 22];

    const DARK_TEXT = [30, 41, 59];

    const MUTED_TEXT = [100, 116, 139];

    const LIGHT_BORDER = [226, 232, 240];

    const SOFT_RED = [254, 242, 242];

    const SOFT_ORANGE = [255, 247, 237];

    const WHITE = [255, 255, 255];

    /* -------------------------------------------------------
       TOP BRAND LINE
    ------------------------------------------------------- */

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

    /* -------------------------------------------------------
       TITLE
    ------------------------------------------------------- */

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
      `${label.toUpperCase()} PRICE DIFFERENCE REPORT`,
      centerX,
      15,
      {
        align: "center",
      }
    );

    /* -------------------------------------------------------
       REPORT INFO BADGE
    ------------------------------------------------------- */

    const infoText =
      `${changedHistory.length} ${
        changedHistory.length === 1
          ? "Product"
          : "Products"
      }`;

    const infoWidth = 34;

    const infoHeight = 7;

    const infoX =
      centerX - infoWidth / 2;

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

    /* -------------------------------------------------------
       TABLE
    ------------------------------------------------------- */

    autoTable(doc, {
      startY: 32,

      head: [
        [
          "SL",
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

        /* INCREASED TABLE FONT */

        fontSize: 9,

        cellPadding: {
          top: 3.2,
          right: 2.5,
          bottom: 3.2,
          left: 2.5,
        },

        lineWidth: 0.25,

        lineColor: LIGHT_BORDER,

        textColor: DARK_TEXT,

        valign: "middle",

        halign: "center",

        overflow: "linebreak",

        cellWidth: "auto",
      },

      headStyles: {
        font: "helvetica",

        fontStyle: "bold",

        fontSize: 9,

        textColor: WHITE,

        fillColor: RED,

        lineColor: DARK_RED,

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
        fontSize: 9,

        textColor: DARK_TEXT,

        halign: "center",

        valign: "middle",

        lineColor: LIGHT_BORDER,

        lineWidth: 0.2,
      },

      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },

      columnStyles: {
        /* SL */

        0: {
          cellWidth: 14,
          halign: "center",
        },

        /* MODEL */

        1: {
          cellWidth: 65,
          halign: "center",
          fontStyle: "bold",
        },

        /* OLD PRICE */

        2: {
          cellWidth: 32,
          halign: "center",
        },

        /* NEW PRICE */

        3: {
          cellWidth: 32,
          halign: "center",
        },

        /* DIFFERENCE */

        4: {
          cellWidth: 43,
          halign: "center",
          fontStyle: "bold",
        },
      },

      didParseCell: (data) => {
        /* ---------------------------------------------------
           DIFFERENCE COLUMN
        --------------------------------------------------- */

        if (
          data.section === "body" &&
          data.column.index === 4
        ) {
          const value = Number(
            data.cell.raw
          );

          if (value > 0) {
            data.cell.styles.textColor = [
              185,
              28,
              28,
            ];

            data.cell.styles.fillColor =
              SOFT_RED;
          }

          if (value < 0) {
            data.cell.styles.textColor = [
              194,
              65,
              12,
            ];

            data.cell.styles.fillColor =
              SOFT_ORANGE;
          }
        }

        /* ---------------------------------------------------
           SL COLUMN
        --------------------------------------------------- */

        if (
          data.section === "body" &&
          data.column.index === 0
        ) {
          data.cell.styles.textColor =
            MUTED_TEXT;
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

    /* -------------------------------------------------------
       FOOTER ON ALL PAGES
    ------------------------------------------------------- */

    const totalPages =
      doc.internal.getNumberOfPages();

    const today = new Date();

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

      /* Footer line */

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

      /* Left footer */

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

      doc.text(
        "MAKPOWER • Price Management",
        12,
        pageHeight - 8
      );

      /* Center footer */

      doc.text(
        `${label} Price Report`,
        centerX,
        pageHeight - 8,
        {
          align: "center",
        }
      );

      /* Right footer */

      doc.text(
        `Page ${page} of ${totalPages}`,
        pageWidth - 12,
        pageHeight - 8,
        {
          align: "right",
        }
      );
    }

    /* -------------------------------------------------------
       FILE NAME
    ------------------------------------------------------- */

    const fileName =
      `${label.toUpperCase()} PRICE DIFFERENCE LAST 7 DAYS ` +
      `${day}-${month}-${year}.pdf`;

    /* -------------------------------------------------------
       DOWNLOAD
    ------------------------------------------------------- */

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