// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { Download } from "lucide-react";

// export default function SSPDF({ order, items = [], manualAvailabilityMap, allProducts, selectedCity }) {

//   // -------------------------------
//   // ✅ SAME AVAILABILITY LOGIC AS TABLE
//   // -------------------------------
//   const getAvailability = (product, item, city) => {
//     if (!product) return false;
//     const qty = Number(item.quantity) || 0;

//     if (city === "Mumbai") {
//       return (product.mumbai_stock ?? 0) >= qty;
//     }
//     return (item.ss_virtual_stock ?? 0) >= qty;
//   };

//   const getFinalAvailability = (item) => {
//     const productData = allProducts.find((p) => p.product_id === item.product);
//     if (manualAvailabilityMap[item.product]) {
//       return manualAvailabilityMap[item.product];
//     }
//     return getAvailability(productData, item, selectedCity) ? "Available" : "Not Available";
//   };

//   // -------------------------------
//   // PDF DOWNLOAD
//   // -------------------------------
//   const handleDownloadPDF = () => {
//     if (!order || !items.length) {
//       alert("Order data or items missing!");
//       return;
//     }

//     const doc = new jsPDF({ unit: "pt", format: "a4" });
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();
//     const margin = 40;

//     // === BORDER ===
//     doc.setLineWidth(1);
//     doc.rect(margin / 2, margin / 2, pageWidth - margin, pageHeight - margin);

//     // === HEADER ===
//     doc.setFontSize(20);
//     doc.setFont("times", "bold");
//     doc.setTextColor(50, 50, 50);
//     doc.text("MAK", margin, 50);
//     doc.setTextColor(210, 0, 0);
//     doc.text("POWER", margin + doc.getTextWidth("MAK"), 50);

//     doc.setFontSize(16);
//     doc.setFont("helvetica", "bold");
//     doc.setTextColor(0, 0, 0);
//     doc.text("CRM Verified Order", pageWidth / 2, 70, { align: "center" });

//     // === ORDER INFO BOX ===
//     const startY = 90;
//     const boxX = margin;
//     const boxWidth = pageWidth - 2 * margin;
//     doc.rect(boxX, startY, boxWidth, 60);

//     doc.setFontSize(11);
//     doc.setFont("helvetica", "normal");
//     doc.text(`Order ID: ${order.order_id}`, boxX + 10, startY + 20);
//     doc.text(`CRM: ${order.crm_name || "-"}`, boxX + 10, startY + 35);
//     doc.text(`Party: ${order.ss_party_name || "-"}`, boxX + 10, startY + 50);

//     // === TABLE DATA ===
//     const tableData = items.map((item, idx) => {
//       const productData = allProducts.find((p) => p.product_id === item.product);
//       const finalAvail = getFinalAvailability(item);
//       const total = finalAvail === "Available"
//         ? (Number(item.quantity) || 0) * (Number(productData?.price) || 0)
//         : 0;

//       return [
//         idx + 1,
//         item.product_name,
//         item.quantity,
//         finalAvail,
//         total.toFixed(1)
//       ];
//     });

//     const grandTotal = items.reduce((sum, item) => {
//       const product = allProducts.find((p) => p.product_id === item.product);
//       const finalAvail = getFinalAvailability(item);
//       if (finalAvail !== "Available") return sum;
//       return sum + (Number(item.quantity) || 0) * (Number(product?.price) || 0);
//     }, 0);

//     // === TABLE ===
//     autoTable(doc, {
//       startY: startY + 80,
//       margin: { left: margin, right: margin },
//       head: [["S.No", "Product Name", "Qty", "Availability", "Total"]],
//       body: tableData,
//       theme: "grid",
//       styles: { fontSize: 11, cellPadding: 6 },
//       headStyles: {
//         fillColor: [41, 128, 185],
//         textColor: [255, 255, 255],
//         fontStyle: "bold",
//         halign: "center",
//       },
//       columnStyles: {
//         0: { cellWidth: 40, halign: "center" },
//         1: { halign: "left" },
//         2: { cellWidth: 70, halign: "center" },
//         3: { cellWidth: 100, halign: "center" },
//         4: { cellWidth: 80, halign: "center" },
//       },
//       didParseCell(data) {
//         if (data.section === "body" && data.column.index === 3) {
//           const text = data.cell.text[0];
//           if (text === "Available") {
//             data.cell.styles.textColor = [0, 150, 0];
//             data.cell.styles.fillColor = [220, 255, 220];
//           }
//           if (text === "Not Available") {
//             data.cell.styles.textColor = [255, 0, 0];
//             data.cell.styles.fillColor = [255, 220, 220];
//           }
//         }
//       },
//     });

//     // === GRAND TOTAL ===
//     const finalY = doc.lastAutoTable.finalY + 25;
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(12);
//     doc.text(`Estimate Total: ${grandTotal.toFixed(1)}`, pageWidth - margin - 150, finalY);

//     // === FOOTER ===
//     const footerMargin = 30;
//     const pageCount = doc.internal.getNumberOfPages();
//     for (let i = 1; i <= pageCount; i++) {
//       doc.setPage(i);
//       doc.setFontSize(10);
//       doc.setFont("helvetica", "italic");

//       doc.text(
//         `Generated On: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`,
//         pageWidth - margin,
//         pageHeight - footerMargin,
//         { align: "right" }
//       );

//       doc.text(
//         `Page ${i} of ${pageCount}`,
//         pageWidth / 2,
//         pageHeight - footerMargin,
//         { align: "center" }
//       );
//     }

//     doc.save(`${order.order_id}_crm_verified.pdf`);
//   };

//   return (
//  <button
//       onClick={handleDownloadPDF}
//       className="flex gap-2 justify-center items-center cursor-pointer"
//     >
     
//      <div className="min-w-0 flex-1">
//                 <p className="text-[12px] font-semibold text-gray-700">
//                   Download PDF
//                 </p>
                

//                 <p className="text-[10px] text-gray-400">
//                   Generate order document
//                 </p>
//               </div>
//     </button>
//   );
// }



import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";

export default function SSPDF({
  order,
  items = [],
  manualAvailabilityMap,
  allProducts = [],
  selectedCity,
}) {
  /* =========================================================
     PRODUCT LOOKUP
  ========================================================= */

  const productMap = new Map(
    allProducts.map((product) => [
      product.product_id,
      product,
    ])
  );

  /* =========================================================
     SAME AVAILABILITY LOGIC AS TABLE
  ========================================================= */

  const getAvailability = (
    product,
    item,
    city
  ) => {
    if (!product) return false;

    const qty =
      Number(item.quantity) || 0;

    if (city === "Mumbai") {
      return (
        (product.mumbai_stock ?? 0) >= qty
      );
    }

    return (
      (item.ss_virtual_stock ?? 0) >= qty
    );
  };

  const getFinalAvailability = (item) => {
    const productData =
      productMap.get(item.product);

    if (
      manualAvailabilityMap?.[item.product]
    ) {
      return manualAvailabilityMap[
        item.product
      ];
    }

    return getAvailability(
      productData,
      item,
      selectedCity
    )
      ? "Available"
      : "Not Available";
  };

  /* =========================================================
     DOWNLOAD PDF
  ========================================================= */

  const handleDownloadPDF = () => {
    if (!order || !items.length) {
      alert("Order data or items missing!");
      return;
    }

    const doc = new jsPDF({
      unit: "pt",
      format: "a4",
    });

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const pageHeight =
      doc.internal.pageSize.getHeight();

    const margin = 42;

    const contentWidth =
      pageWidth - margin * 2;

    /* =======================================================
       COLORS
    ======================================================= */

    const dark = [31, 41, 55];
    const blue = [37, 99, 235];
    const gray = [100, 116, 139];
    const border = [226, 232, 240];
    const light = [248, 250, 252];

    const green = [22, 163, 74];
    const greenBg = [220, 252, 231];

    const red = [220, 38, 38];
    const redBg = [254, 226, 226];

    /* =======================================================
       TABLE DATA
    ======================================================= */

    const tableData = items.map(
      (item, index) => {
        const product =
          productMap.get(item.product);

        const availability =
          getFinalAvailability(item);

        const total =
          availability === "Available"
            ? (Number(item.quantity) || 0) *
              (Number(product?.price) || 0)
            : 0;

        return [
          index + 1,
          item.product_name || "-",
          item.quantity ?? "",
          availability,

          // IMPORTANT:
          // Do NOT put ₹ here.
          // Default jsPDF Helvetica can render
          // the ₹ glyph incorrectly.
          total.toFixed(1),
        ];
      }
    );

    /* =======================================================
       GRAND TOTAL
    ======================================================= */

    const grandTotal =
      items.reduce(
        (sum, item) => {
          const product =
            productMap.get(item.product);

          const availability =
            getFinalAvailability(item);

          if (
            availability !== "Available"
          ) {
            return sum;
          }

          return (
            sum +
            (Number(item.quantity) || 0) *
              (Number(product?.price) || 0)
          );
        },
        0
      );

    /* =======================================================
       HEADER
    ======================================================= */

    let startY = 38;

    // Top accent
    doc.setFillColor(...blue);

    doc.roundedRect(
      margin,
      startY,
      contentWidth,
      3,
      1.5,
      1.5,
      "F"
    );

    startY += 25;

    /* MAKPOWER */

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(20);

    doc.setTextColor(
      51,
      65,
      85
    );

    const makWidth =
      doc.getTextWidth("MAK");

    doc.text(
      "MAK",
      margin,
      startY
    );

    doc.setTextColor(
      220,
      38,
      38
    );

    doc.text(
      "POWER",
      margin + makWidth,
      startY
    );

    /* TITLE */

    doc.setFontSize(14);

    doc.setTextColor(...dark);

    doc.text(
      "CRM VERIFIED ORDER",
      pageWidth - margin,
      startY - 1,
      {
        align: "right",
      }
    );

    doc.setFontSize(7.5);

    doc.setTextColor(...gray);

    doc.text(
      "ORDER VERIFICATION",
      pageWidth - margin,
      startY + 11,
      {
        align: "right",
      }
    );

    /* Divider */

    startY += 16;

    doc.setDrawColor(...border);

    doc.setLineWidth(0.7);

    doc.line(
      margin,
      startY,
      pageWidth - margin,
      startY
    );

    /* =======================================================
       ORDER INFORMATION
    ======================================================= */

    startY += 16;

    const infoHeight = 48;

    doc.setFillColor(...light);

    doc.setDrawColor(...border);

    doc.roundedRect(
      margin,
      startY,
      contentWidth,
      infoHeight,
      6,
      6,
      "FD"
    );

    const infoY =
      startY + 18;

    /* ORDER ID */

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(8);

    doc.setTextColor(...gray);

    doc.text(
      "ORDER ID",
      margin + 12,
      infoY
    );

    doc.setFontSize(9.5);

    doc.setTextColor(...dark);

    doc.text(
      order.order_id || "-",
      margin + 12,
      infoY + 14
    );

    /* Divider */

    const divider1 =
      margin + 150;

    doc.setDrawColor(...border);

    doc.line(
      divider1,
      startY + 9,
      divider1,
      startY + infoHeight - 9
    );

    /* CRM */

    doc.setFontSize(8);

    doc.setTextColor(...gray);

    doc.text(
      "CRM",
      divider1 + 15,
      infoY
    );

    doc.setFontSize(9.5);

    doc.setTextColor(...dark);

    doc.text(
      order.crm_name || "-",
      divider1 + 15,
      infoY + 14
    );

    /* Divider */

    const divider2 =
      margin + 285;

    doc.setDrawColor(...border);

    doc.line(
      divider2,
      startY + 9,
      divider2,
      startY + infoHeight - 9
    );

    /* PARTY */

    doc.setFontSize(8);

    doc.setTextColor(...gray);

    doc.text(
      "PARTY",
      divider2 + 15,
      infoY
    );

    doc.setFontSize(9.5);

    doc.setTextColor(...dark);

    const partyName =
      order.ss_party_name || "-";

    const partyText =
      doc.splitTextToSize(
        partyName,
        contentWidth - 330
      );

    doc.text(
      partyText.slice(0, 2),
      divider2 + 15,
      infoY + 14
    );

    startY +=
      infoHeight + 18;

    /* =======================================================
       TABLE TITLE
    ======================================================= */

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(10);

    doc.setTextColor(...dark);

    doc.text(
      "ORDER ITEMS",
      margin,
      startY
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(7.5);

    doc.setTextColor(...gray);

    doc.text(
      `${items.length} item${
        items.length === 1
          ? ""
          : "s"
      }`,
      pageWidth - margin,
      startY,
      {
        align: "right",
      }
    );

    startY += 9;

    /* =======================================================
       TABLE
    ======================================================= */

    autoTable(doc, {
      startY,

      margin: {
        left: margin,
        right: margin,
        bottom: 48,
      },

      head: [
        [
          "S.No",
          "Product Name",
          "Qty",
          "Availability",
          "Total",
        ],
      ],

      body: tableData,

      theme: "grid",

      styles: {
        font: "helvetica",
        fontSize: 9,

        textColor: dark,

        cellPadding: {
          top: 6,
          right: 7,
          bottom: 6,
          left: 7,
        },

        lineColor: border,
        lineWidth: 0.5,

        valign: "middle",
      },

      headStyles: {
        fillColor: dark,
        textColor: [255, 255, 255],

        fontStyle: "bold",
        fontSize: 8.5,

        halign: "center",
        valign: "middle",

        cellPadding: 7,

        lineColor: dark,
        lineWidth: 0.5,
      },

      alternateRowStyles: {
        fillColor: [
          249,
          250,
          251,
        ],
      },

      columnStyles: {
        0: {
          cellWidth: 42,
          halign: "center",
        },

        1: {
          halign: "left",
        },

        2: {
          cellWidth: 52,
          halign: "center",
        },

        3: {
          cellWidth: 100,
          halign: "center",
        },

        4: {
          cellWidth: 82,
          halign: "right",
        },
      },

      didParseCell(data) {
        /* Availability */

        if (
          data.section === "body" &&
          data.column.index === 3
        ) {
          const status =
            data.cell.text?.[0];

          if (
            status === "Available"
          ) {
            data.cell.styles.textColor =
              green;

            data.cell.styles.fillColor =
              greenBg;

            data.cell.styles.fontStyle =
              "bold";
          }

          if (
            status === "Not Available"
          ) {
            data.cell.styles.textColor =
              red;

            data.cell.styles.fillColor =
              redBg;

            data.cell.styles.fontStyle =
              "bold";
          }
        }

        /* Total */

        if (
          data.section === "body" &&
          data.column.index === 4
        ) {
          data.cell.styles.fontStyle =
            "bold";

          data.cell.styles.textColor =
            dark;

          data.cell.styles.halign =
            "right";
        }
      },
    });

    /* =======================================================
       GRAND TOTAL
    ======================================================= */

    let totalY =
      doc.lastAutoTable.finalY + 18;

    const totalWidth = 190;
    const totalHeight = 46;

    const totalX =
      pageWidth -
      margin -
      totalWidth;

    if (
      totalY >
      pageHeight - 80
    ) {
      doc.addPage();
      totalY = 50;
    }

    doc.setFillColor(
      239,
      246,
      255
    );

    doc.setDrawColor(
      191,
      219,
      254
    );

    doc.roundedRect(
      totalX,
      totalY,
      totalWidth,
      totalHeight,
      7,
      7,
      "FD"
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(8);

    doc.setTextColor(...gray);

    doc.text(
      "ESTIMATE TOTAL",
      totalX + 12,
      totalY + 17
    );

    doc.setFontSize(15);

    doc.setTextColor(...blue);

    // Use "Rs." instead of ₹ to avoid
    // default Helvetica glyph issues.
    doc.text(
      `Rs. ${grandTotal.toFixed(1)}`,
      totalX + 12,
      totalY + 36
    );

    /* =======================================================
       FOOTER
    ======================================================= */

    const pageCount =
      doc.internal.getNumberOfPages();

    const generatedOn =
      new Date().toLocaleString(
        "en-IN",
        {
          timeZone:
            "Asia/Kolkata",

          day: "2-digit",

          month: "short",

          year: "numeric",

          hour: "2-digit",

          minute: "2-digit",

          hour12: true,
        }
      );

    for (
      let page = 1;
      page <= pageCount;
      page++
    ) {
      doc.setPage(page);

      doc.setDrawColor(...border);

      doc.setLineWidth(0.5);

      doc.line(
        margin,
        pageHeight - 35,
        pageWidth - margin,
        pageHeight - 35
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(7);

      doc.setTextColor(...gray);

      doc.text(
        `Generated ${generatedOn}`,
        margin,
        pageHeight - 21
      );

      doc.text(
        `Page ${page} of ${pageCount}`,
        pageWidth - margin,
        pageHeight - 21,
        {
          align: "right",
        }
      );
    }

    /* =======================================================
       SAVE
    ======================================================= */

    doc.save(
      `${order.order_id}_crm_verified.pdf`
    );
  };

  /* =========================================================
     DOWNLOAD BUTTON
  ========================================================= */

  return (
    <button
      type="button"
      onClick={handleDownloadPDF}
      className="
        flex
        w-full
        items-center
        gap-2
        cursor-pointer
        rounded-md
        px-2
        py-1.5
        hover:bg-gray-50
        transition
      "
    >
      <Download
        size={16}
        className="text-orange-600 shrink-0"
      />

      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-gray-700">
          Download PDF
        </p>

        <p className="text-[10px] text-gray-400">
          Generate order document
        </p>
      </div>
    </button>
  );
}