import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function generateNotInStockPDF(rows, stockMap) {
  const doc = new jsPDF("p", "pt", "a4");

  const marginY = 30;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  /* 🔲 PAGE BORDER */
  doc.setLineWidth(1);
  doc.rect(
    15,
    15,
    pageWidth - 30,
    pageHeight - 30
  );

  /* 🧠 UNIQUE PARTY LOGIC */
  const uniqueParties = [...new Set(rows.map(r => r.party_name).filter(Boolean))];
  const isSingleParty = uniqueParties.length === 1;

  /* 🟢 HEADER */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(
    isSingleParty ? uniqueParties[0] : "Not In Stock Report",
    pageWidth / 2,
    40,
    { align: "center" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    isSingleParty ? "Not In Stock Report" : "Multiple Parties",
    pageWidth / 2,
    55,
    { align: "center" }
  );

  /* 🟢 TABLE HEAD + BODY (NO SERIAL NO) */
  const tableHead = isSingleParty
    ? ["Order No", "Product", "Qty", "Stock"]
    : ["Party", "Order No", "Product", "Qty", "Stock"];

  const tableBody = rows.map(r =>
    isSingleParty
      ? [
          r.order_no,
          r.product,
          r.balance_qty,
          stockMap[r.product?.trim().toLowerCase()] ?? 0,
        ]
      : [
          r.party_name,
          r.order_no,
          r.product,
          r.balance_qty,
          stockMap[r.product?.trim().toLowerCase()] ?? 0,
        ]
  );

  /* 📐 CALCULATE TABLE WIDTH (FOR CENTER ALIGN) */
  const tableWidth = isSingleParty
    ? 110 + 230 + 60 + 60
    : 120 + 90 + 200 + 55 + 55;

  const centeredMarginX = (pageWidth - tableWidth) / 2;

  autoTable(doc, {
    startY: 75,
    margin: {
      left: centeredMarginX,
      right: centeredMarginX,
    },
    head: [tableHead],
    body: tableBody,
    theme: "grid",

    styles: {
      fontSize: 9,
      halign: "center",
      cellPadding: 4,
    },

    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },

    columnStyles: isSingleParty
      ? {
          0: { cellWidth: 110 }, // Order
          1: { cellWidth: 230 }, // Product
          2: { cellWidth: 60 },  // Qty
          3: { cellWidth: 60 },  // Stock
        }
      : {
          0: { cellWidth: 190 }, // Party
          1: { cellWidth: 70 },  // Order
          2: { cellWidth: 150 }, // Product
          3: { cellWidth: 55 },  // Qty
          4: { cellWidth: 55 },  // Stock
        },

    didParseCell(data) {
      if (
        data.section === "body" &&
        data.column.index === tableHead.length - 1
      ) {
        data.cell.styles.fillColor = [255, 210, 210]; // 🔴 Stock highlight
      }
    },
  });

  /* 🟢 FOOTER */
  const time = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  doc.setFontSize(8);
  doc.text(
    `Generated On: ${time}`,
    pageWidth - 20,
    pageHeight - 20,
    { align: "right" }
  );

  doc.save(
    isSingleParty
      ? `Not_In_Stock_${uniqueParties[0]}.pdf`
      : "Not_In_Stock_Multiple_Parties.pdf"
  );
}
