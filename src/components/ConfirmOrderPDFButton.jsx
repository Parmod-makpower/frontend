// 📁 src/components/ConfirmOrderPDFButton.jsx
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaDownload } from "react-icons/fa";

export default function ConfirmOrderPDFButton({ selectedProducts = [], eligibleSchemes = [] }) {
  const handleDownloadPDF = () => {
    if (!selectedProducts.length) {
      alert("No products to download!");
      return;
    }

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;

    // === Header ===
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Card Order", pageWidth / 2, 50, { align: "center" });

    // === Products Table ===
    const tableBody = selectedProducts.map((item, idx) => [
      idx + 1,
      item.product_name || "Unnamed",
      item.quantity,
      Number(item.price || 0).toFixed(1),
      ((Number(item.price) || 0) * (item.quantity || 1)).toFixed(1),
    ]);

    autoTable(doc, {
      startY: 80,
      head: [["#", "Product", "Quantity", "Price", "Total"]],
      body: tableBody,
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
        1: { halign: "center" },
        2: { cellWidth: 80, halign: "center" },
        3: { cellWidth: 80, halign: "center" },
        4: { cellWidth: 80, halign: "center" },
      },
    });

    // === Schemes Table (if available) ===
    if (eligibleSchemes.length > 0) {
      const schemeY = doc.lastAutoTable.finalY + 30;
      const schemeTableBody = eligibleSchemes.flatMap((scheme) => {
        const multiplier = Math.min(
          ...scheme.conditions.map((cond) => {
            const matched = selectedProducts.find(
              (p) => p.id === cond.product || p.product_name === cond.product_name
            );
            if (!matched) return 0;
            return Math.floor(matched.quantity / cond.min_quantity);
          })
        );

        return scheme.rewards.map((r) => {
          const totalQty = r.quantity * multiplier;
          return [
            scheme.conditions?.[0]?.product_name || "Unnamed Product",
            `${totalQty} ${r.product_name || r.product} Free`,
          ];
        });
      });

      autoTable(doc, {
        startY: schemeY,
        head: [["Scheme", "Rewards"]],
        body: schemeTableBody,
        theme: "grid",
        styles: { fontSize: 11, cellPadding: 6 },
        headStyles: {
          fillColor: [255, 87, 34],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        // ✅ Center align both columns
    columnStyles: {
      0: { halign: "center" },
      1: { halign: "center" },
    },
      });
    }

    // === Total ===
    const total =
      selectedProducts.reduce(
        (sum, p) => sum + (Number(p.price) || 0) * (p.quantity || 1),
        0
      ) || 0;

    const finalY = doc.lastAutoTable.finalY + 25;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Total: ${total.toFixed(1)}`, pageWidth - margin - 150, finalY);

    // === Footer ===
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text(
        `Generated on: ${new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        })}`,
        margin,
        pageHeight - 20
      );
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 20, {
        align: "right",
      });
    }

    doc.save(`Order_Confirmation_${Date.now()}.pdf`);
  };

  return (
    

<button
  onClick={handleDownloadPDF}
  className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-md text-sm shadow-sm transition-all mx-auto mb-3"
>
  <FaDownload className="text-blue-600 text-sm" />
  <span>Download PDF</span>
</button>

  );
}
