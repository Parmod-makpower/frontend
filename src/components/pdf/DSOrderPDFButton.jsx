import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf } from "react-icons/fa";

export default function DSOrderPDFButton({ order }) {
  const downloadPDF = () => {
    const doc = new jsPDF();

    // 🔹 Header
    doc.setFontSize(16);
    doc.text("Order Invoice", 14, 15);

    doc.setFontSize(10);
    doc.text(`Order ID: ${order.order_id}`, 14, 25);
    doc.text(
      `Date: ${new Date(order.created_at).toLocaleString()}`,
      14,
      32
    );

    // 🔹 Table
    const tableData = order.items.map((item, index) => [
      index + 1,
      item.product_name,
      item.quantity,
      item.is_scheme_item ? "FREE" : `${item.price}`,
      item.is_scheme_item
        ? "0"
        : `${(item.price * item.quantity).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["No", "Product", "Qty", "Price", "Total"]],
      body: tableData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    // 🔹 Grand Total
    const finalY = doc.lastAutoTable.finalY || 50;
    doc.setFontSize(12);
    doc.text(
      `Grand Total: ${order.total_amount}`,
      14,
      finalY + 10
    );

    doc.save(`${order.order_id}.pdf`);
  };

  return (
    <button
      onClick={downloadPDF}
      className="flex items-center gap-1 text-red-600 text-sm hover:underline"
    >
      <FaFilePdf />
      PDF
    </button>
  );
}
