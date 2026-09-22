import * as XLSX from "xlsx-js-style";

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
  sevenDaysAgo.setDate(todayStart.getDate() - 6);

  const todayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  return date >= sevenDaysAgo && date <= todayEnd;
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

    const currentDate = getDateValue(item?.changed_at);

    const existing = latestMap.get(productKey);

    if (!existing) {
      latestMap.set(productKey, item);
      return;
    }

    const existingDate = getDateValue(existing?.changed_at);

    if (
      currentDate &&
      (!existingDate || currentDate.getTime() > existingDate.getTime())
    ) {
      latestMap.set(productKey, item);
    }
  });

  return Array.from(latestMap.values());
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

export const exportPriceHistoryExcel = (
  history = [],
  priceType = "SS"
) => {
  try {
    if (!Array.isArray(history) || !history.length) {
      window.alert("No price history available for export.");
      return;
    }

    const { label, oldField, newField } =
      getPriceFields(priceType);

    /* -------------------------------------------------------
       STEP 1: LAST 7 DAYS
    ------------------------------------------------------- */

    const latestHistory =
      getLatestHistoryPerProduct(history);

    /* -------------------------------------------------------
       STEP 2: REMOVE PRODUCTS WHERE SELECTED PRICE
       DID NOT CHANGE
    ------------------------------------------------------- */

    const changedHistory = latestHistory.filter((item) => {
      const oldPrice = Number(item?.[oldField]);
      const newPrice = Number(item?.[newField]);

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
       STEP 3: CREATE ONLY REQUIRED REPORT COLUMNS
    ------------------------------------------------------- */

    const rows = changedHistory.map((item, index) => {
      const oldPrice = Number(item?.[oldField]);
      const newPrice = Number(item?.[newField]);

      return {
        SL: index + 1,

        MODEL:
          item?.model ??
          item?.product_name ??
          item?.product_id ??
          item?.product_code ??
          "",

        "OLD PRICE": oldPrice,

        "NEW PRICE": newPrice,

        DIFFERENCE: newPrice - oldPrice,
      };
    });

    /* -------------------------------------------------------
       STEP 4: CREATE WORKSHEET
    ------------------------------------------------------- */

    const worksheet = XLSX.utils.json_to_sheet(rows);

    /* -------------------------------------------------------
       HEADER STYLE
    ------------------------------------------------------- */

    const headerStyle = {
      font: {
        bold: true,
        color: {
          rgb: "FFFFFF",
        },
        sz: 11,
      },

      fill: {
        fgColor: {
          rgb: "1769FF",
        },
      },

      alignment: {
        horizontal: "center",
        vertical: "center",
      },

      border: {
        top: {
          style: "thin",
          color: {
            rgb: "D1D5DB",
          },
        },

        bottom: {
          style: "thin",
          color: {
            rgb: "D1D5DB",
          },
        },

        left: {
          style: "thin",
          color: {
            rgb: "D1D5DB",
          },
        },

        right: {
          style: "thin",
          color: {
            rgb: "D1D5DB",
          },
        },
      },
    };

    /* -------------------------------------------------------
       BODY STYLE
    ------------------------------------------------------- */

    const bodyStyle = {
      font: {
        sz: 10,
        color: {
          rgb: "1F2937",
        },
      },

      alignment: {
        vertical: "center",
      },

      border: {
        top: {
          style: "thin",
          color: {
            rgb: "E5E7EB",
          },
        },

        bottom: {
          style: "thin",
          color: {
            rgb: "E5E7EB",
          },
        },

        left: {
          style: "thin",
          color: {
            rgb: "E5E7EB",
          },
        },

        right: {
          style: "thin",
          color: {
            rgb: "E5E7EB",
          },
        },
      },
    };

    /* -------------------------------------------------------
       APPLY CELL STYLES
    ------------------------------------------------------- */

    const range = XLSX.utils.decode_range(
      worksheet["!ref"]
    );

    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({
          r: row,
          c: col,
        });

        const cell = worksheet[cellAddress];

        if (!cell) continue;

        if (row === 0) {
          cell.s = headerStyle;
        } else {
          cell.s = bodyStyle;

          /* Center SL */
          if (col === 0) {
            cell.s = {
              ...bodyStyle,
              alignment: {
                horizontal: "center",
                vertical: "center",
              },
            };
          }

          /* Price columns */
          if (col >= 2) {
            cell.s = {
              ...cell.s,
              alignment: {
                horizontal: "right",
                vertical: "center",
              },
            };
          }
        }
      }
    }

    /* -------------------------------------------------------
       COLUMN WIDTHS
    ------------------------------------------------------- */

    worksheet["!cols"] = [
      {
        wch: 8,
      },
      {
        wch: 24,
      },
      {
        wch: 16,
      },
      {
        wch: 16,
      },
      {
        wch: 16,
      },
    ];

    /* -------------------------------------------------------
       AUTO FILTER
    ------------------------------------------------------- */

    worksheet["!autofilter"] = {
      ref: worksheet["!ref"],
    };

    /* -------------------------------------------------------
       FREEZE HEADER
    ------------------------------------------------------- */

    worksheet["!freeze"] = {
      xSplit: 0,
      ySplit: 1,
    };

    /* -------------------------------------------------------
       WORKBOOK
    ------------------------------------------------------- */

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Price Difference"
    );

    /* -------------------------------------------------------
       FILE NAME
    ------------------------------------------------------- */

    const today = new Date();

    const day = String(today.getDate()).padStart(2, "0");

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const year = today.getFullYear();

    const fileName =
      `${label.toUpperCase()} PRICE DIFFERENCE LAST 7 DAYS ` +
      `${day}-${month}-${year}.xlsx`;

    /* -------------------------------------------------------
       DOWNLOAD
    ------------------------------------------------------- */

    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    console.error(
      "Price History Excel Export Error:",
      error
    );

    window.alert(
      "Unable to export price history to Excel."
    );
  }
};

export default exportPriceHistoryExcel;