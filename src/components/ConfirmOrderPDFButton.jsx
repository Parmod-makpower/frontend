import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  FaDownload,
  FaShareAlt,
  FaCheckCircle,
  FaFilePdf,
  FaWhatsapp,
} from "react-icons/fa";

/* =========================================================
   HELPERS
========================================================= */

const getMultiplier = (
  scheme,
  selectedProducts
) => {
  if (!scheme?.conditions?.length) return 0;

  return Math.min(
    ...scheme.conditions.map((cond) => {
      const matched = selectedProducts.find(
        (p) =>
          p.id === cond.product ||
          p.product_name ===
            cond.product_name
      );

      if (!matched) return 0;

      return Math.floor(
        Number(matched.quantity || 0) /
          Number(cond.min_quantity || 1)
      );
    })
  );
};

/* =========================================================
   PDF GENERATOR
========================================================= */

const createPDF = ({
  selectedProducts,
  eligibleSchemes,
}) => {
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
    compress: true,
  });

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const pageHeight =
    doc.internal.pageSize.getHeight();

  const margin = 36;

  const orange = [252, 37, 12];
  const dark = [23, 32, 51];
  const muted = [100, 116, 139];
  const light = [248, 250, 252];
  const border = [226, 232, 240];
  const green = [16, 185, 129];

  /* =======================================================
     HEADER
  ======================================================= */

  doc.setFillColor(
    orange[0],
    orange[1],
    orange[2]
  );

  doc.roundedRect(
    margin,
    28,
    pageWidth - margin * 2,
    66,
    10,
    10,
    "F"
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(20);

  doc.setTextColor(255, 255, 255);

  doc.text(
    "ORDER CONFIRMATION",
    margin + 18,
    55
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(9);

  doc.text(
    "Distributor Order",
    margin + 18,
    75
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(8);

  doc.text(
    new Date().toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ),
    pageWidth - margin - 18,
    57,
    {
      align: "right",
    }
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.text(
    "MAKPOWER",
    pageWidth - margin - 18,
    74,
    {
      align: "right",
    }
  );

  /* =======================================================
     ORDER INFO
  ======================================================= */

  doc.setFillColor(
    light[0],
    light[1],
    light[2]
  );

  doc.roundedRect(
    margin,
    108,
    pageWidth - margin * 2,
    42,
    8,
    8,
    "F"
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(9);

  doc.setTextColor(
    dark[0],
    dark[1],
    dark[2]
  );

  doc.text(
    `${selectedProducts.length} Product${
      selectedProducts.length !== 1
        ? "s"
        : ""
    }`,
    margin + 14,
    126
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setTextColor(
    muted[0],
    muted[1],
    muted[2]
  );

  doc.text(
    "Order review & confirmation",
    margin + 14,
    139
  );

  doc.setTextColor(
    green[0],
    green[1],
    green[2]
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.text(
    "READY",
    pageWidth - margin - 14,
    132,
    {
      align: "right",
    }
  );

  /* =======================================================
     PRODUCTS
  ======================================================= */

  const tableBody =
    selectedProducts.map(
      (item, index) => {
        const quantity =
          Number(item.quantity || 1);

        const price =
          Number(item.price) || 0;

        const total =
          price * quantity;

        return [
          String(index + 1),
          item.product_name ||
            "Unnamed Product",
          String(quantity),
          `${price.toFixed(1)}`,
          `${total.toFixed(1)}`,
        ];
      }
    );

  autoTable(doc, {
    startY: 168,

    margin: {
      left: margin,
      right: margin,
    },

    head: [
      [
        "#",
        "Product",
        "Qty",
        "Price",
        "Total",
      ],
    ],

    body: tableBody,

    theme: "grid",

    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 6,
      lineColor: border,
      lineWidth: 0.5,
      textColor: dark,
      valign: "middle",
    },

    headStyles: {
      fillColor: orange,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
      cellPadding: 7,
    },

    alternateRowStyles: {
      fillColor: [255, 250, 248],
    },

    columnStyles: {
      0: {
        cellWidth: 30,
        halign: "center",
      },

      1: {
        cellWidth: "auto",
        halign: "left",
      },

      2: {
        cellWidth: 55,
        halign: "center",
      },

      3: {
        cellWidth: 70,
        halign: "right",
      },

      4: {
        cellWidth: 78,
        halign: "right",
        fontStyle: "bold",
      },
    },

    didDrawPage: (data) => {
      doc.setFontSize(7);
      doc.setTextColor(
        muted[0],
        muted[1],
        muted[2]
      );

      doc.text(
        "MAKPOWER • Distributor Order Confirmation",
        margin,
        pageHeight - 18
      );
    },
  });

  /* =======================================================
     SCHEMES
  ======================================================= */

  if (eligibleSchemes.length > 0) {
    const schemeBody = [];

    eligibleSchemes.forEach(
      (scheme) => {
        const multiplier =
          getMultiplier(
            scheme,
            selectedProducts
          );

        if (multiplier <= 0) return;

        const schemeName = (
          scheme.conditions || []
        )
          .map(
            (c) =>
              c.product_name ||
              c.product
          )
          .join(", ");

        const rewards = (
          scheme.rewards || []
        )
          .map((r) => {
            const qty =
              Number(r.quantity || 0) *
              multiplier;

            return `${qty} ${
              r.product_name ||
              r.product
            } Free`;
          })
          .join(", ");

        schemeBody.push([
          schemeName ||
            "Eligible Scheme",
          rewards || "-",
        ]);
      }
    );

    if (schemeBody.length) {
      const schemeY =
        doc.lastAutoTable.finalY + 24;

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(10);

      doc.setTextColor(
        dark[0],
        dark[1],
        dark[2]
      );

      doc.text(
        "ELIGIBLE SCHEMES",
        margin,
        schemeY
      );

      autoTable(doc, {
        startY: schemeY + 8,

        margin: {
          left: margin,
          right: margin,
        },

        head: [
          [
            "Scheme",
            "Free Reward",
          ],
        ],

        body: schemeBody,

        theme: "grid",

        styles: {
          font: "helvetica",
          fontSize: 8.5,
          cellPadding: 6,
          lineColor: border,
          lineWidth: 0.5,
          textColor: dark,
          valign: "middle",
        },

        headStyles: {
          fillColor: [249, 115, 22],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },

        columnStyles: {
          0: {
            cellWidth: "auto",
          },

          1: {
            cellWidth: 190,
          },
        },
      });
    }
  }

  /* =======================================================
     TOTAL
  ======================================================= */

  const total =
    selectedProducts.reduce(
      (sum, p) =>
        sum +
        (Number(p.price) || 0) *
          Number(p.quantity || 1),
      0
    );

  const totalY =
    doc.lastAutoTable.finalY + 24;

  const boxWidth = 190;
  const boxX =
    pageWidth - margin - boxWidth;

  doc.setFillColor(
    255,
    247,
    245
  );

  doc.roundedRect(
    boxX,
    totalY,
    boxWidth,
    48,
    8,
    8,
    "F"
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(8);

  doc.setTextColor(
    muted[0],
    muted[1],
    muted[2]
  );

  doc.text(
    "TOTAL AMOUNT",
    boxX + 12,
    totalY + 17
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(15);

  doc.setTextColor(
    dark[0],
    dark[1],
    dark[2]
  );

  doc.text(
    `${total.toFixed(1)}`,
    boxX + 12,
    totalY + 37
  );

  /* =======================================================
     FOOTER
  ======================================================= */

  const pageCount =
    doc.internal.getNumberOfPages();

  for (
    let i = 1;
    i <= pageCount;
    i++
  ) {
    doc.setPage(i);

    doc.setDrawColor(
      border[0],
      border[1],
      border[2]
    );

    doc.line(
      margin,
      pageHeight - 32,
      pageWidth - margin,
      pageHeight - 32
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(7);

    doc.setTextColor(
      muted[0],
      muted[1],
      muted[2]
    );

    doc.text(
      `Generated: ${new Date().toLocaleString(
        "en-IN",
        {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      )}`,
      margin,
      pageHeight - 18
    );

    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - margin,
      pageHeight - 18,
      {
        align: "right",
      }
    );
  }

  return doc;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function ConfirmOrderPDFButton({
  selectedProducts = [],
  eligibleSchemes = [],
}) {
  const [busy, setBusy] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const clearMessage = () => {
    setTimeout(
      () => setMessage(""),
      2200
    );
  };

  /* =======================================================
     FILE
  ======================================================= */

  const buildFile = () => {
    const doc = createPDF({
      selectedProducts,
      eligibleSchemes,
    });

    const blob =
      doc.output("blob");

    return {
      doc,
      blob,
      file: new File(
        [blob],
        `MAKPOWER_Order_${Date.now()}.pdf`,
        {
          type: "application/pdf",
        }
      ),
    };
  };

  /* =======================================================
     DOWNLOAD
  ======================================================= */

  const downloadPDF = async () => {
    if (!selectedProducts.length) {
      setMessage(
        "No products to download."
      );

      clearMessage();
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const { doc, blob } =
        buildFile();

      const fileName = `MAKPOWER_Order_${Date.now()}.pdf`;

      /*
       * Blob URL download is more reliable
       * than relying only on doc.save().
       */
      const url =
        URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = url;
      anchor.download = fileName;
      anchor.rel = "noopener";

      document.body.appendChild(
        anchor
      );

      anchor.click();

      anchor.remove();

      setTimeout(
        () => URL.revokeObjectURL(url),
        1500
      );

      /*
       * Small fallback for unusual browsers.
       */
      if (!anchor) {
        doc.save(fileName);
      }

      setMessage(
        "PDF downloaded successfully."
      );
    } catch (error) {
      console.error(
        "PDF download failed:",
        error
      );

      setMessage(
        "Download failed. Please use Share PDF."
      );
    } finally {
      setBusy(false);
      clearMessage();
    }
  };

  /* =======================================================
     SHARE
  ======================================================= */

  const sharePDF = async () => {
    if (!selectedProducts.length) {
      setMessage(
        "No products to share."
      );

      clearMessage();
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const { file } =
        buildFile();

      /*
       * Mobile browsers that support Web Share
       * will show native share sheet.
       *
       * WhatsApp will normally appear here
       * if installed.
       */
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [file],
        })
      ) {
        await navigator.share({
          title:
            "MAKPOWER Order Confirmation",

          text:
            "MAKPOWER Distributor Order Confirmation",

          files: [file],
        });

        setMessage(
          "Share sheet opened."
        );

        return;
      }

      /*
       * Some browsers expose share()
       * without canShare().
       */
      if (
        navigator.share &&
        !navigator.canShare
      ) {
        try {
          await navigator.share({
            title:
              "MAKPOWER Order Confirmation",

            text:
              "MAKPOWER Distributor Order Confirmation",
          });

          setMessage(
            "Share sheet opened."
          );

          return;
        } catch {}
      }

      /*
       * Browser does not support file sharing.
       * Use reliable download instead.
       */
      await downloadPDF();
    } catch (error) {
      /*
       * User cancelling share is not an error.
       */
      if (
        error?.name ===
        "AbortError"
      ) {
        setMessage("");
        return;
      }

      console.error(
        "PDF share failed:",
        error
      );

      /*
       * Final fallback.
       */
      await downloadPDF();
    } finally {
      setBusy(false);
      clearMessage();
    }
  };

  return (
    <div className="w-full">

      {/* =================================================
          ACTIONS
      ================================================= */}

      <div className="grid grid-cols-2 gap-2">

        {/* SHARE */}

        <button
          type="button"
          onClick={sharePDF}
          disabled={busy}
          className="
            group
            relative
            flex
            min-h-[46px]
            items-center
            justify-center
            gap-2
            overflow-hidden
            rounded-[14px]
            bg-gradient-to-r
            from-[#fc250c]
            to-[#ea580c]
            px-3
            text-[10px]
            font-extrabold
            text-white
            shadow-[0_7px_18px_rgba(252,37,12,.16)]
            transition-all
            duration-200
            active:scale-[.98]
            disabled:cursor-wait
            disabled:opacity-70
          "
        >
          {!busy && (
            <span className="absolute inset-y-0 -left-16 w-12 -skew-x-12 bg-white/20 animate-pdf-shine" />
          )}

          {busy ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <>
              <FaShareAlt className="text-[13px]" />

              <span>
                Share PDF
              </span>

              <FaWhatsapp className="text-[12px] opacity-80" />
            </>
          )}
        </button>

        {/* DOWNLOAD */}

        <button
          type="button"
          onClick={downloadPDF}
          disabled={busy}
          className="
            flex
            min-h-[46px]
            items-center
            justify-center
            gap-2
            rounded-[14px]
            border
            border-[#e2e8f0]
            bg-[#f8fafc]
            px-3
            text-[10px]
            font-extrabold
            text-[#475569]
            transition-all
            duration-200
            hover:border-[#cbd5e1]
            hover:bg-white
            active:scale-[.98]
            disabled:cursor-wait
            disabled:opacity-60
          "
        >
          <FaDownload className="text-[12px] text-[#64748b]" />

          <span>
            Download
          </span>
        </button>
      </div>

      {/* =================================================
          HELP TEXT
      ================================================= */}

      <div className="mt-2 flex items-center justify-center gap-1.5">
        <FaFilePdf className="text-[9px] text-red-500" />

        <p className="text-center text-[8px] font-medium text-[#94a3b8]">
          Share PDF opens your phone's share menu.
          WhatsApp can be selected directly.
        </p>
      </div>

      {/* =================================================
          STATUS
      ================================================= */}

      {message && (
        <div className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-[8px] font-bold text-emerald-600 animate-pdf-message">
          <FaCheckCircle />

          {message}
        </div>
      )}

      {/* =================================================
          ANIMATIONS
      ================================================= */}

      <style>
        {`
          @keyframes pdfShine {
            0% {
              transform: translateX(-90px) skewX(-12deg);
            }

            100% {
              transform: translateX(360px) skewX(-12deg);
            }
          }

          @keyframes pdfMessage {
            from {
              opacity: 0;
              transform: translateY(3px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-pdf-shine {
            animation: pdfShine 2.7s ease-in-out infinite;
          }

          .animate-pdf-message {
            animation: pdfMessage 180ms ease-out;
          }

          @media (prefers-reduced-motion: reduce) {
            .animate-pdf-shine,
            .animate-pdf-message {
              animation: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}