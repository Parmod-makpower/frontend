import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";

export default function PDFDownloadButton({ order, items = [] }) {
  const handleDownloadPDF = () => {
    if (!order || !items.length) {
      alert("Order data or items missing!");
      return;
    }

    const enrichedItems = items.map((item) => ({
      ...item,
      price: item.price ?? 0,
      product_name: item.product_name ?? "Unnamed Product",
    }));

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;

    // === Border ===
    doc.setLineWidth(1);
    doc.rect(margin / 2, margin / 2, pageWidth - margin, pageHeight - margin);

    // === Header ===
    doc.setFontSize(20);
    doc.setFont("times", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text("MAK", margin, 50);
    doc.setTextColor(210, 0, 0);
    doc.text("POWER", margin + doc.getTextWidth("MAK"), 50);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("CRM Verified Order", pageWidth / 2, 70, { align: "center" });

    // === Order Info Box ===
    const startY = 90;
    const boxX = margin;
    const boxWidth = pageWidth - 2 * margin;
    doc.rect(boxX, startY, boxWidth, 60);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Order ID: ${order.order_id}`, boxX + 10, startY + 20);
    doc.text(`CRM: ${order.crm_name || "-"}`, boxX + 10, startY + 35);
    doc.text(`Party: ${order.ss_party_name || "-"}`, boxX + 10, startY + 50);

    // === Table Data ===
    const tableData = enrichedItems.map((item, idx) => {
      const total = Number(item.quantity) * Number(item.price || 0);
      return [
        idx + 1,
        item.product_name,
        item.quantity,
        `${total.toFixed(1)}`,
      ];
    });

    // === Grand Total ===
    const grandTotal = enrichedItems.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.price || 0),
      0
    );

    // === Table ===
    autoTable(doc, {
      startY: startY + 80,
      margin: { left: margin, right: margin },
      head: [["S.No", "Product Name", "Quantity", "Total"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 11, cellPadding: 6 },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 40, halign: "center" },
        1: { halign: "left" },
        2: { cellWidth: 80, halign: "center" },
        3: { cellWidth: 80, halign: "center" },
      },
      didParseCell: function (data) {
        if (data.section === "body" && data.column.index === 2) {
          data.cell.styles.fillColor = [255, 255, 204]; // light yellow
        }
      },
    });

    // === Grand Total on LAST PAGE only ===
    const finalY = doc.lastAutoTable.finalY + 25;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(
      `Grand Total: ${grandTotal.toFixed(1)}`,
      pageWidth - margin - 150,
      finalY
    );

    // === Footer ===
    const footerMargin = 30;
    const pageCount = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");

      // Footer text
      doc.text(
        `Generated On: ${new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        })}`,
        pageWidth - margin,
        pageHeight - footerMargin,
        { align: "right" }
      );

      // Page numbers
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - footerMargin,
        { align: "center" }
      );
    }

    // === Save PDF ===
    doc.save(`${order.order_id}_crm_verified.pdf`);
  };

  return (
    <button
      onClick={handleDownloadPDF}
      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 cursor-pointer text-white px-4 py-2 rounded shadow-md transition-all"
    >
      <Download size={18} />
      Download PDF
    </button>
  );
}
