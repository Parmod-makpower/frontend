// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// export default function DispatchPDF(
//   order,
//   enrichedItems,
//   orderCode,
//   dispatchLocation,
//   cargoDetails,
//   gstAmount,
//   gstPercentage,
// ) {
//   const doc = new jsPDF({ unit: "pt", format: "a4" });

//   const pageWidth = doc.internal.pageSize.getWidth();
//   const pageHeight = doc.internal.pageSize.getHeight();
//   const margin = 40;

//   // === PAGE BORDER ===
//   doc.setLineWidth(1);
//   doc.rect(margin / 2, margin / 2, pageWidth - margin, pageHeight - margin);

//   // === HEADER ===
//   const topMargin = 50;

//   doc.setFontSize(20);
//   doc.setFont("times", "bold");

//   doc.setTextColor(50, 50, 50);
//   doc.text("MAK", margin, topMargin);

//   doc.setTextColor(210, 0, 0);
//   doc.text("POWER", margin + doc.getTextWidth("MAK"), topMargin);

//   // === DATE INFO ===
//   doc.setFontSize(9);
//   doc.setFont("helvetica", "bold");
//   doc.setTextColor(70);

//   const rightX = pageWidth - margin;

//   doc.text(
//     `Order At: ${new Date(order.ss_order_created_at).toLocaleString(
//       "en-IN",
//       { timeZone: "Asia/Kolkata" }
//     )}`,
//     rightX,
//     topMargin,
//     { align: "right" }
//   );

//   doc.text(
//     `Verified At: ${new Date(order.verified_at).toLocaleString(
//       "en-IN",
//       { timeZone: "Asia/Kolkata" }
//     )}`,
//     rightX,
//     topMargin + 12,
//     { align: "right" }
//   );

//   // === TITLE ===
//   doc.setFontSize(16);
//   doc.setFont("helvetica", "bold");
//   doc.setTextColor(0);
//   doc.text("Order Copy", pageWidth / 2, 70, { align: "center" });

//   // === INFO BOX ===
//   const boxX = margin;
//   const boxY = 90;
//   const boxWidth = pageWidth - margin * 2;
//   const infoBoxHeight = 100;

//   doc.setFillColor(245, 245, 245);
//   doc.rect(boxX, boxY, boxWidth, infoBoxHeight, "F");

//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(9);
//   doc.setTextColor(40);

//   const lineHeight = 12;

//   const drawText = (label, value, x, y, maxWidth) => {
//     const text = `${label}: ${value || "-"}`;
//     const lines = doc.splitTextToSize(text, maxWidth);
//     doc.text(lines, x, y);
//     return y + lines.length * lineHeight;
//   };

//   // === LEFT SIDE ===
//   let leftY = boxY + 20;
//   const leftWidth = 220;

//   leftY = drawText("Order ID", orderCode, boxX + 10, leftY, leftWidth);
//   leftY = drawText("CRM Name", order.crm_name, boxX + 10, leftY, leftWidth);
//   leftY = drawText(
//     "Party Name",
//     order.ss_party_name,
//     boxX + 10,
//     leftY,
//     leftWidth
//   );
//   leftY = drawText(
//     "Location",
//     dispatchLocation,
//     boxX + 10,
//     leftY,
//     leftWidth
//   );
//    if (gstPercentage > 1) {
//   leftY = drawText(
//     `Billing ${gstPercentage} % GST`,
//     gstAmount.toFixed(1),
//     boxX + 10,
//     leftY,
//     leftWidth
//   );
// }
//   if (cargoDetails?.remarks) {
//   leftY = drawText(
//     "Remarks",
//     cargoDetails.remarks,
//     boxX + 10,
//     leftY,
//     leftWidth
//   );
// }

//   // === RIGHT SIDE ===
//   const hasCargo =
//     cargoDetails &&
//     (
//       cargoDetails.cargoParcel ||
//       cargoDetails.cargoName ||
//       cargoDetails.cargoMobile ||
//       cargoDetails.cargoLocation
//     );

//   if (hasCargo) {
//     let rightY = boxY + 20;
//     const rightXInfo = pageWidth - margin - 250;
//     const rightWidth = 220;

//     rightY = drawText(
//       "Parcel Size/KG",
//       cargoDetails.cargoParcel,
//       rightXInfo,
//       rightY,
//       rightWidth
//     );

//     rightY = drawText(
//       "Cargo Name",
//       cargoDetails.cargoName,
//       rightXInfo,
//       rightY,
//       rightWidth
//     );

//     rightY = drawText(
//       "Mobile No",
//       cargoDetails.cargoMobile,
//       rightXInfo,
//       rightY,
//       rightWidth
//     );

//     rightY = drawText(
//       "Location",
//       cargoDetails.cargoLocation,
//       rightXInfo,
//       rightY,
//       rightWidth
//     );
//   }

//   // === TABLE DATA ===
//   // const tableData = enrichedItems.map((item, idx) => [
//   //   idx + 1,
//   //   item.sub_category ?? "-",
//   //   item.product_name,
//   //   item.quantity,
//   //   item.rack_no ?? "-",
//   //   item.cartoon_size ?? "-",
//   //   dispatchLocation?.toLowerCase() === "mumbai"
//   //     ? item.mumbai_stock ?? "-"
//   //     : item.ss_virtual_stock ?? "-"
//   // ]);

// const tableData = enrichedItems.map((item, idx) => {
//   const subCategory = String(item.sub_category || "").trim();

//   // Sirf tab "New" add hoga jab sub_category NEW se start ho
//   const isNewProduct = /^NEW\b/i.test(subCategory);

//   const displayProductName = isNewProduct
//     ? `${item.product_name} New`
//     : item.product_name;

//   return [
//     idx + 1,
//     item.sub_category ?? "-",
//     displayProductName,
//     item.quantity,
//     item.rack_no ?? "-",
//     item.cartoon_size ?? "-",
//     dispatchLocation?.toLowerCase() === "mumbai"
//       ? item.mumbai_stock ?? "-"
//       : item.ss_virtual_stock ?? "-"
//   ];
// });


//   autoTable(doc, {
//     startY: boxY + infoBoxHeight + 20,
//     margin: { left: margin, right: margin },

//     head: [
//       ["S.N", "Category", "Product Name", "Qty", "Rack", "Carton", "Stock"]
//     ],

//     body: tableData,

//     theme: "grid",

//     styles: {
//       fontSize: 10,
//       cellPadding: 5,
//     },

//     headStyles: {
//       fillColor: [41, 128, 185],
//       textColor: [255, 255, 255],
//       fontStyle: "bold",
//       halign: "center",
//     },

//     alternateRowStyles: {
//       fillColor: [245, 245, 245],
//     },

//     columnStyles: {
//       0: { cellWidth: 35, halign: "center" },
//       1: { cellWidth: 90, halign: "center" },
//       2: { cellWidth: 160, halign: "center" },
//       3: { cellWidth: 60, halign: "center" },
//       4: { cellWidth: 60, halign: "center" },
//       5: { cellWidth: 60, halign: "center" },
//       6: { cellWidth: 60, halign: "center" },
//     },

//     didParseCell(data) {
//       if (data.row.section === "body") {
//         if (data.column.index === 3) {
//           data.cell.styles.fillColor = [200, 255, 200];
//         } else if (data.column.index === 5) {
//           data.cell.styles.fillColor = [255, 255, 200];
//         } else if (data.column.index === 6) {
//           data.cell.styles.fillColor = [255, 210, 210];
//         }
//       }
//     },
//   });

//   // === FOOTER ===
//   const currentTime = new Date().toLocaleString("en-IN", {
//     timeZone: "Asia/Kolkata",
//   });

//   const footerMargin = 30;

//   doc.setFontSize(10);
//   doc.setFont("helvetica", "italic");

//   doc.text(
//     `Generated On: ${currentTime}`,
//     pageWidth - margin,
//     pageHeight - footerMargin,
//     { align: "right" }
//   );

//   const pageCount = doc.internal.getNumberOfPages();

//   for (let i = 1; i <= pageCount; i++) {
//     doc.setPage(i);

//     doc.text(
//       `Page ${i} of ${pageCount}`,
//       pageWidth / 2,
//       pageHeight - footerMargin,
//       { align: "center" }
//     );
//   }

//   doc.save(`${orderCode}.pdf`);
// }




import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function DispatchPDF(
  order,
  enrichedItems,
  orderCode,
  dispatchLocation,
  cargoDetails,
  gstAmount,
  gstPercentage,
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  // === PAGE BORDER ===
  doc.setLineWidth(1);
  doc.rect(
    margin / 2,
    margin / 2,
    pageWidth - margin,
    pageHeight - margin
  );

  // === HEADER ===
  const topMargin = 50;

  doc.setFontSize(20);
  doc.setFont("times", "bold");

  doc.setTextColor(50, 50, 50);
  doc.text("MAK", margin, topMargin);

  doc.setTextColor(210, 0, 0);
  doc.text("POWER", margin + doc.getTextWidth("MAK"), topMargin);

  // === DATE INFO ===
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(70);

  const rightX = pageWidth - margin;

  const formatDateTime = value => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
  };

  doc.text(
    `Order At: ${formatDateTime(order.ss_order_created_at)}`,
    rightX,
    topMargin,
    { align: "right" }
  );

  doc.text(
    `Verified At: ${formatDateTime(order.verified_at)}`,
    rightX,
    topMargin + 12,
    { align: "right" }
  );

  // === TITLE ===
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);

  doc.text("Order Copy", pageWidth / 2, 70, {
    align: "center",
  });

  // === INFO BOX ===
  const boxX = margin;
  const boxY = 90;
  const boxWidth = pageWidth - margin * 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(40);

  const lineHeight = 12;

  const drawText = (label, value, x, y, maxWidth) => {
    const safeValue =
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
        ? String(value).trim()
        : "-";

    const text = `${label}: ${safeValue}`;
    const lines = doc.splitTextToSize(text, maxWidth);

    doc.text(lines, x, y);

    return y + lines.length * lineHeight;
  };

  // === LEFT SIDE DATA ===
  const leftItems = [
    ["Order ID", orderCode],
    ["CRM Name", order.crm_name],
    ["Party Name", order.ss_party_name],
    ["Location", dispatchLocation],
  ];

  if (gstPercentage > 1) {
    leftItems.push([
      `Billing ${gstPercentage} % GST`,
      Number(gstAmount || 0).toFixed(1),
    ]);
  }

  if (cargoDetails?.remarks) {
    leftItems.push(["Remarks", cargoDetails.remarks]);
  }

  // === RIGHT SIDE DATA ===
  const hasCargo =
    cargoDetails &&
    (
      cargoDetails.cargoParcel ||
      cargoDetails.cargoName ||
      cargoDetails.cargoMobile ||
      cargoDetails.cargoLocation
    );

  const rightItems = [];

  if (hasCargo) {
    rightItems.push(
      ["Parcel Size/KG", cargoDetails.cargoParcel],
      ["Cargo Name", cargoDetails.cargoName],
      ["Mobile No", cargoDetails.cargoMobile],
      ["Location", cargoDetails.cargoLocation]
    );
  }

  // === INFO BOX LAYOUT ===
  const contentPadding = 10;
  const columnGap = 20;
  const innerWidth = boxWidth - contentPadding * 2;

  const leftWidth = rightItems.length
    ? (innerWidth - columnGap) * 0.52
    : innerWidth;

  const rightWidth = rightItems.length
    ? innerWidth - columnGap - leftWidth
    : 0;

  const leftX = boxX + contentPadding;
  const rightXInfo = leftX + leftWidth + columnGap;
  const infoStartY = boxY + 20;

  const measureItemsHeight = (items, maxWidth) => {
    let height = 0;

    items.forEach(([label, value]) => {
      const safeValue =
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
          ? String(value).trim()
          : "-";

      const lines = doc.splitTextToSize(
        `${label}: ${safeValue}`,
        maxWidth
      );

      height += lines.length * lineHeight;
    });

    return height;
  };

  const leftContentHeight = measureItemsHeight(
    leftItems,
    leftWidth
  );

  const rightContentHeight = rightItems.length
    ? measureItemsHeight(rightItems, rightWidth)
    : 0;

  const infoBoxHeight =
    Math.max(leftContentHeight, rightContentHeight) + 30;

  doc.setFillColor(245, 245, 245);
  doc.rect(boxX, boxY, boxWidth, infoBoxHeight, "F");

  // === DRAW LEFT SIDE ===
  let leftY = infoStartY;

  leftItems.forEach(([label, value]) => {
    leftY = drawText(
      label,
      value,
      leftX,
      leftY,
      leftWidth
    );
  });

  // === DRAW RIGHT SIDE ===
  let rightY = infoStartY;

  rightItems.forEach(([label, value]) => {
    rightY = drawText(
      label,
      value,
      rightXInfo,
      rightY,
      rightWidth
    );
  });

  // === TABLE DATA ===
  const tableData = enrichedItems.map((item, idx) => {
    const subCategory = String(item.sub_category || "").trim();

    // Add "New" only when sub_category starts with NEW.
    const isNewProduct = /^NEW\b/i.test(subCategory);

    const displayProductName = isNewProduct
      ? `${item.product_name || "-"} New`
      : item.product_name || "-";

    return [
      idx + 1,
      subCategory || "-",
      displayProductName,
      item.quantity ?? "-",
      item.rack_no ?? "-",
      item.cartoon_size ?? "-",
      dispatchLocation?.toLowerCase() === "mumbai"
        ? item.mumbai_stock ?? "-"
        : item.ss_virtual_stock ?? "-",
    ];
  });

  // === TABLE WIDTH ===
  // Available width = A4 page width minus left and right margins.
  const tableWidth = pageWidth - margin * 2;

  // Column widths add up to the available table width.
  const columnWidths = {
    0: 35,
    1: 100,
    2: 188,
    3: 45,
    4: 55,
    5: 45,
    6: 47,
  };

  autoTable(doc, {
    startY: boxY + infoBoxHeight + 20,

    margin: {
      left: margin,
      right: margin,
      bottom: 45,
    },

    tableWidth,

    head: [
      [
        "S.N",
        "Category",
        "Product Name",
        "Qty",
        "Rack",
        "Carton",
        "Stock",
      ],
    ],

    body: tableData,

    theme: "grid",

    styles: {
      font: "helvetica",
      fontSize: 9,

      cellPadding: {
        top: 5,
        right: 3,
        bottom: 5,
        left: 3,
      },

      textColor: [60, 60, 60],
      lineColor: [190, 190, 190],
      lineWidth: 0.5,

      halign: "center",
      valign: "middle",

      overflow: "linebreak",
    },

    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      fontSize: 9,
      cellPadding: 6,
    },

    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },

    columnStyles: {
      0: {
        cellWidth: columnWidths[0],
        halign: "center",
        valign: "middle",
      },
      1: {
        cellWidth: columnWidths[1],
        halign: "center",
        valign: "middle",
      },
      2: {
        cellWidth: columnWidths[2],
        halign: "center",
        valign: "middle",
      },
      3: {
        cellWidth: columnWidths[3],
        halign: "center",
        valign: "middle",
      },
      4: {
        cellWidth: columnWidths[4],
        halign: "center",
        valign: "middle",
      },
      5: {
        cellWidth: columnWidths[5],
        halign: "center",
        valign: "middle",
      },
      6: {
        cellWidth: columnWidths[6],
        halign: "center",
        valign: "middle",
      },
    },

    didParseCell(data) {
      if (data.row.section === "body") {
        if (data.column.index === 3) {
          // Qty
          data.cell.styles.fillColor = [200, 255, 200];
        } else if (data.column.index === 5) {
          // Carton
          data.cell.styles.fillColor = [255, 255, 200];
        } else if (data.column.index === 6) {
          // Stock
          data.cell.styles.fillColor = [255, 210, 210];
        }
      }
    },

    rowPageBreak: "avoid",
    showHead: "everyPage",
  });

  // === FOOTER ===
  const currentTime = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  const footerMargin = 30;
  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(70);

    doc.text(
      `Generated On: ${currentTime}`,
      pageWidth - margin,
      pageHeight - footerMargin,
      { align: "right" }
    );

    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - footerMargin,
      { align: "center" }
    );
  }

  doc.save(`${orderCode}.pdf`);
}