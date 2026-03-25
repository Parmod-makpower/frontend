import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function DispatchPDF(order, enrichedItems, orderCode, dispatchLocation, cargoDetails) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  // === PAGE BORDER ===
  doc.setLineWidth(1);
  doc.rect(margin / 2, margin / 2, pageWidth - margin, pageHeight - margin);

  // === HEADER (MAK POWER) ===
  const topMargin = 50;
  doc.setFontSize(20);
  doc.setFont("times", "bold");

  doc.setTextColor(50, 50, 50);
  doc.text("MAK", margin, topMargin);

  doc.setTextColor(210, 0, 0);
  doc.text("POWER", margin + doc.getTextWidth("MAK"), topMargin);

  // === ORDER & VERIFY DATE ===
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(70);

  const rightX = pageWidth - margin;

  doc.text(
    `Order At: ${new Date(order.ss_order_created_at).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    })}`,
    rightX,
    topMargin,
    { align: "right" }
  );

  doc.text(
    `Verified At: ${new Date(order.verified_at).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    })}`,
    rightX,
    topMargin + 12,
    { align: "right" }
  );

  // === TITLE ===
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Order Copy", pageWidth / 2, 70, { align: "center" });

  // === INFO BOX ===
  const boxX = margin;
  const boxY = 90;
  const boxWidth = pageWidth - 2 * margin;

  doc.setFillColor(245, 245, 245);
  doc.rect(boxX, boxY, boxWidth, 100, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(40);

  const lineHeight = 12;

  // 🔥 helper (auto wrap fix)
  const drawText = (label, value, x, y, maxWidth) => {
    const text = `${label}: ${value || "-"}`;
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * lineHeight;
  };

  // === LEFT SIDE ===
  let leftY = boxY + 20;
  const leftWidth = 220;

  leftY = drawText("Order ID", orderCode, boxX + 10, leftY, leftWidth);
  leftY = drawText("CRM Name", order.crm_name, boxX + 10, leftY, leftWidth);
  leftY = drawText("Party Name", order.ss_party_name, boxX + 10, leftY, leftWidth);
  leftY = drawText("Location", dispatchLocation, boxX + 10, leftY, leftWidth);

  // === RIGHT SIDE (CARGO) ===
  const hasCargo =
    cargoDetails &&
    (cargoDetails.cargoParcel ||
      cargoDetails.cargoName ||
      cargoDetails.cargoMobile ||
      cargoDetails.cargoLocation);

  if (hasCargo) {
    let rightY = boxY + 20;
    const rightXInfo = pageWidth - margin - 250;
    const rightWidth = 220;

    rightY = drawText("Parcel Size/KG", cargoDetails.cargoParcel, rightXInfo, rightY, rightWidth);
    rightY = drawText("Cargo Name", cargoDetails.cargoName, rightXInfo, rightY, rightWidth);
    rightY = drawText("Mobile No", cargoDetails.cargoMobile, rightXInfo, rightY, rightWidth);
    rightY = drawText("Location", cargoDetails.cargoLocation, rightXInfo, rightY, rightWidth);
  }

  // === PRODUCT TABLE (UNCHANGED ✅) ===
  const tableData = enrichedItems.map((item, idx) => [
    idx + 1,
    item.sub_category ?? "-",
    item.product_name,
    item.quantity,
    item.rack_no ?? "-",
    item.cartoon_size ?? "-",
    dispatchLocation?.toLowerCase() === "mumbai"
      ? item.mumbai_stock ?? "-"
      : item.ss_virtual_stock ?? "-"
  ]);

  autoTable(doc, {
    startY: boxY + 130,
    margin: { left: margin, right: margin },
    head: [["S.N", "Category", "Product Name", "Qty", "Rack", "Carton", "Stock"]],
    body: tableData,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 5 },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 35, halign: "center" },
      1: { cellWidth: 90, halign: "center" },
      2: { cellWidth: 160, halign: "center" },
      3: { cellWidth: 60, halign: "center" },
      4: { cellWidth: 60, halign: "center" },
      5: { cellWidth: 60, halign: "center" },
      6: { cellWidth: 60, halign: "center" },
    },

    didParseCell: function (data) {
      if (data.row.section === "body") {
        if (data.column.index === 3) {
          data.cell.styles.fillColor = [200, 255, 200];
        } else if (data.column.index === 5) {
          data.cell.styles.fillColor = [255, 255, 200];
        } else if (data.column.index === 6) {
          data.cell.styles.fillColor = [255, 210, 210];
        }
      }
    },
  });

  // === FOOTER ===
  const currentTime = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  const footerMargin = 30;

  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");

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