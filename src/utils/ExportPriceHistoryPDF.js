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
    if (!Array.isArray(history) || !history.length) {
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
       STEP 1: LAST 7 DAYS + LATEST RECORD
    ------------------------------------------------------- */

    const latestHistory =
      getLatestHistoryPerProduct(history);

    /* -------------------------------------------------------
       STEP 2: REMOVE PRODUCTS WHERE SELECTED PRICE
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
       STEP 3: PREPARE TABLE DATA
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
       STEP 4: CREATE PDF
    ------------------------------------------------------- */

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    /* -------------------------------------------------------
       TITLE
    ------------------------------------------------------- */

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");

    doc.text(
      `${label} PRICE DIFFERENCE REPORT`,
      14,
      15
    );

    /* -------------------------------------------------------
       SUBTITLE
    ------------------------------------------------------- */

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    doc.text(
      "Last 7 Days",
      14,
      21
    );

    /* -------------------------------------------------------
       TABLE
    ------------------------------------------------------- */

    autoTable(doc, {
      startY: 27,

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

      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 2.5,
        lineWidth: 0.1,
        lineColor: [210, 214, 220],
        textColor: [31, 41, 55],
        valign: "middle",
      },

      headStyles: {
        fontStyle: "bold",
        fontSize: 8,
        textColor: [255, 255, 255],
        fillColor: [23, 105, 255],
        halign: "center",
        valign: "middle",
      },

      bodyStyles: {
        halign: "left",
      },

      columnStyles: {
        0: {
          cellWidth: 15,
          halign: "center",
        },

        1: {
          cellWidth: 75,
          halign: "left",
        },

        2: {
          cellWidth: 45,
          halign: "right",
        },

        3: {
          cellWidth: 45,
          halign: "right",
        },

        4: {
          cellWidth: 45,
          halign: "right",
        },
      },

      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },

      margin: {
        left: 14,
        right: 14,
      },
    });

    /* -------------------------------------------------------
       FILE NAME
    ------------------------------------------------------- */

    const today = new Date();

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const year = today.getFullYear();

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