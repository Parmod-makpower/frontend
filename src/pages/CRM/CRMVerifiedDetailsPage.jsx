import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";  // ✅ PDF table
import MobilePageHeader from "../../components/MobilePageHeader";
import { punchOrderToSheet } from "../../api/punchApi";

function ConfirmationModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-[90%] max-w-md animate-fadeIn">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Confirm Order Punch
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to punch this order? <br /> This Order will be sent to the Backend.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function Table({ title, items }) {
  return (
    <div className="border rounded shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b font-semibold">
        <span>{title}</span>
      </div>
      <div className="overflow-x-auto select-none">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">Product</th>
              <th className="p-2 text-right">Qty</th>
            </tr>
          </thead>
          <tbody>
            {items?.length ? (
              items.map((r, idx) => (
                <tr
                  key={idx}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="p-2">{r.product_name}</td>
                  <td className="p-2 text-right">{r.quantity}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-3 text-gray-500" colSpan={2}>
                  No items
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CRMVerifiedDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const order = location.state?.order;

  const crmMapping = {
    "Ankita Dhingra": "AD-AP",
    "Prince Gupta": "PG-AP",
    "Ajit Mishra": "AM-AP",
    "Harish Sharma": "HS-AP",
    "Simran Khanna": "SK-AP",
    "Rahul Kumar": "RK-AP",
    "Vivek Sharma": "VS-AP",
    "Aarti Singh": "AS-AP",
    "Kanak Maurya": "KM-AP"
  };

  const orderCode = crmMapping[order?.crm_name]
    ? `${crmMapping[order.crm_name]}${order.id}`
    : `${order?.crm_name} ${order?.id}`;

const handleDownloadPDF = () => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40; // page margin

  // -------- PAGE BORDER ----------
  doc.setLineWidth(1);
  doc.rect(margin / 2, margin / 2, pageWidth - margin, pageHeight - margin);


const topMargin = 50;

// Company Name Text (MAKPOWER with colors)
doc.setFontSize(20);
doc.setFont("times", "bold"); // better font than helvetica
doc.setTextColor(50, 50, 50);// Gray for POWER
doc.text("MAK", margin, topMargin);

doc.setTextColor(210, 0, 0); // Red for MAK 
doc.text("POWER", margin + doc.getTextWidth("MAK"), topMargin);

// Title below company name
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Order Dispatch Form", pageWidth / 2, 70, { align: "center" });

  // Order Info Box
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const startY = 90;
  doc.rect(margin, startY, pageWidth - 2 * margin, 70); // box around order info
  doc.text(`Order ID: ${orderCode}`, margin + 10, startY + 20);
  doc.text(`CRM: ${order.crm_name}`, margin + 10, startY + 35);
  doc.text(`Party: ${order.ss_party_name}`, margin + 10, startY + 50);
  doc.text(
    `Verified At: ${new Date(order.verified_at).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    })}`,
    pageWidth / 2 + 20,
    startY + 20
  );
  
  // -------- ITEMS TABLE ----------
  const tableData = order.items.map((item, idx) => [
    idx + 1,
    item.product_name,
    item.quantity,
  ]);

  autoTable(doc, {
    startY: startY + 90,
    margin: { left: margin, right: margin }, // full width like order info box
    head: [["S.No", "Product Name", "Quantity"]],
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
      0: { cellWidth: 40, halign: "center" },
      1: { cellWidth: pageWidth - margin * 2 - 120, halign: "left" }, // remaining width
      2: { cellWidth: 80, halign: "center" },
    },
  });

  // -------- FOOTER ----------
  const currentTime = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  const footerMargin = 30; // distance from bottom
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(0, 0, 0);
  doc.text(
    `Generated On: ${currentTime}`,
    pageWidth - margin,
    pageHeight - footerMargin,
    { align: "right" }
  );

  // Page Number (center bottom)
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - footerMargin, {
      align: "center",
    });
  }

  // -------- SAVE PDF ----------
  doc.save(`${orderCode}.pdf`);
};


  const handleOrderPunch = () => {
    if (!order?.items?.length) {
      alert("No items to punch!");
      return;
    }
    setIsModalOpen(true);
  };

  const confirmOrderPunch = async () => {
    setLoading(true);
    setIsModalOpen(false);
    try {
      const data = await punchOrderToSheet(order);
      if (data.success) {
        navigate("/all/orders-history");
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while punching order");
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return (
      <div className="p-6 text-red-600">
        No order data provided. Please go back.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4 pb-20">
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmOrderPunch}
      />

      <MobilePageHeader title={order.order_id} />
      <div className="hidden sm:flex items-center justify-between w-full">
        <div className="font-semibold"></div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 px-3 py-1 rounded border hover:bg-gray-200 transition cursor-pointer"
          >
            <FiArrowLeft /> Back
          </button>

          {/* ✅ PDF Download Button */}
         {order.punched && (
    <button
      onClick={handleDownloadPDF}
      className="flex items-center gap-1 px-3 py-1 rounded border bg-green-600 text-white hover:bg-green-700 transition cursor-pointer"
    >
      Download PDF
    </button>
  )}
        </div>
      </div>

      {/* Order Info */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-2 sm:gap-4 sm:pt-0 pt-[60px]">
        <div className="border rounded p-4 bg-white shadow-sm">
          <div className="font-semibold mb-2">SS Order</div>
          <div className="text-sm font-bold text-gray-600">{order.order_id}</div>
          <div className="text-sm text-gray-600">Name: {order.ss_user_name}</div>
          <div className="text-sm text-gray-600">Party: {order.ss_party_name}</div>
        </div>

        <div className="border rounded p-4 bg-white shadow-sm">
          <div className="font-semibold mb-2">CRM Verification</div>
          <div className="text-sm font-bold text-gray-600">{orderCode}</div>
          <div className="text-sm text-gray-600">CRM: {order.crm_name}</div>
          <div className="text-sm text-gray-600">
            {new Date(order.verified_at).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            })}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="grid grid-cols-1 gap-4">
        <Table title="CRM — Verified Items" items={order.items || []} />
      </div>

      {/* Order Punch Button */}
      <button
        onClick={handleOrderPunch}
        disabled={order.punched || loading}
        className={`px-6 py-2 rounded-lg shadow transition
    ${order.punched || loading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"}
  `}
      >
        {loading && (
          <svg
            className="animate-spin h-5 w-5 mr-2 inline-block text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        )}
        {order.punched
          ? "Already Punched"
          : loading
            ? "Processing..."
            : "Order Punch"}
      </button>
    </div>
  );
}
