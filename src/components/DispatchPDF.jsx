import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function DispatchPDF(order, enrichedItems, remarks, orderCode) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  doc.setLineWidth(1);
  doc.rect(margin / 2, margin / 2, pageWidth - margin, pageHeight - margin);

  const topMargin = 50;
  doc.setFontSize(20);
  doc.setFont("times", "bold");
  doc.setTextColor(50, 50, 50);
  doc.text("MAK", margin, topMargin);
  doc.setTextColor(210, 0, 0);
  doc.text("POWER", margin + doc.getTextWidth("MAK"), topMargin);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Order Dispatch Form", pageWidth / 2, 70, { align: "center" });

  // === Start of dynamic box ===
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  const startY = 90;
  const boxX = margin;
  const boxY = startY;
  const boxWidth = pageWidth - 2 * margin;

  const remarksText = remarks.trim() ? `Remarks: ${remarks.trim()}` : "";
  const wrappedRemarks = doc.splitTextToSize(remarksText, boxWidth - 20);
  const remarksLines = wrappedRemarks.length;
  const lineHeight = 14;

  const baseBoxHeight = 70;
  const extraHeight = remarksLines > 1 ? (remarksLines - 1) * lineHeight : 0;
  const totalBoxHeight = baseBoxHeight + extraHeight;

  doc.rect(boxX, boxY, boxWidth, totalBoxHeight);

  // Static fields
  doc.text(`Order ID: ${orderCode}`, boxX + 10, boxY + 20);
  doc.text(`CRM: ${order.crm_name}`, boxX + 10, boxY + 35);
  doc.text(`Party: ${order.ss_party_name}`, boxX + 10, boxY + 50);

  if (remarksText) {
    doc.text(wrappedRemarks, boxX + 10, boxY + 65);
  }

  doc.text(
    `Verified At: ${new Date(order.verified_at).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    })}`,
    pageWidth / 2 + 20,
    boxY + 20
  );

  // === Table ===
  const tableData = enrichedItems.map((item, idx) => [
    idx + 1,
    item.sub_category ?? "-",
    item.product_name,
    item.quantity,
    " ",
    item.cartoon_size ?? "-",
    item.ss_virtual_stock ?? "-",
  ]);

  autoTable(doc, {
    startY: boxY + totalBoxHeight + 20,
    margin: { left: margin, right: margin },
    head: [["S.N", "Category", "Product Name", "Quantity", "", "Carton", "Stock"]],
    body: tableData,
    theme: "grid",
    styles: { fontSize: 11, cellPadding: 6 },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 35, halign: "center" },
      1: { cellWidth: 90, halign: "left" },
      2: { cellWidth: 160, halign: "left" },
      3: { cellWidth: 60, halign: "center" },
      4: { cellWidth: 60, halign: "center" },
      5: { cellWidth: 60, halign: "center" },
      6: { cellWidth: 60, halign: "center" },
    },
    didParseCell: function (data) {
      if (data.row.section === "body") {
        if (data.column.index === 5) {
          data.cell.styles.fillColor = [255, 255, 200];
        } else if (data.column.index === 6) {
          data.cell.styles.fillColor = [255, 200, 200];
        }
      }
    },
  });

  // === Footer ===
  const currentTime = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  const footerMargin = 30;
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(0, 0, 0);
  doc.text(`Generated On: ${currentTime}`, pageWidth - margin, pageHeight - footerMargin, {
    align: "right",
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - footerMargin, {
      align: "center",
    });
  }

  doc.save(`${orderCode}.pdf`);
}
