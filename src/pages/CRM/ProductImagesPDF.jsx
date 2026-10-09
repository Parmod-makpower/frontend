
import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import { useCachedProducts } from "../../hooks/useCachedProducts";
import MobilePageHeader from "../../components/MobilePageHeader";

import {
  FaImages,
  FaCheckCircle,
  FaBoxOpen,
  FaSpinner,
  FaFileImage,
  FaCheckSquare,
  FaTimes,
  FaLayerGroup,
  FaChevronRight,
} from "react-icons/fa";

/* =========================================================
   HIDDEN SUB CATEGORIES
========================================================= */

const HIDDEN_SUB_CATEGORIES = [
  "POUCH BATTERY",
  "ECO BATTERY",
  "POLYMER",
  "TEMPERED",
  "UV TEMPERED",
  "NEW SOLDIER",
  "PROMOTIONAL",
  "MEMORY CARD",
  "PENDRIVE",
  "FAN",
  "GLASS",
  "SMART",
  "LAMINATION",
];

/* =========================================================
   CATEGORY GROUPS
========================================================= */

const CATEGORY_GROUPS = {
  "DATA CABLE": [
    "DATA CABLE",
    "DATA CABLE I PHONE",
    "DATA CABLE TYPE-C",
    "DATA CABLE TYPE C",
    "DATA CABLE C TO C",
    "DATA CABLE V8",
    "DATA CABLE PD",
    "DATA CABLE PB",
    "DATA CABLE 3 IN 1",
    "DATA CABLE C TO I",
  ],

  BATTERY: [
    "BATTERY",
    "MOBILE BATTERY",
    "PHONE BATTERY",
  ],

  SPEAKER: [
    "SPEAKER",
    "BLUETOOTH SPEAKER",
    "PORTABLE SPEAKER",
  ],
};

/* =========================================================
   CATEGORY HELPERS
========================================================= */

const normalizeCategory = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();

const NORMALIZED_CATEGORY_GROUPS = Object.entries(
  CATEGORY_GROUPS
).map(([groupName, members]) => [
  groupName,
  new Set(members.map(normalizeCategory)),
]);

const NORMALIZED_HIDDEN_CATEGORIES =
  HIDDEN_SUB_CATEGORIES.map(normalizeCategory);

const getDisplayCategory = (category) => {
  const normalized = normalizeCategory(category);

  if (!normalized) return "";

  for (const [groupName, members] of NORMALIZED_CATEGORY_GROUPS) {
    if (members.has(normalized)) {
      return groupName;
    }
  }

  return normalized;
};

const isCategoryHidden = (category) => {
  const normalized = normalizeCategory(category);

  if (!normalized) return false;

  return NORMALIZED_HIDDEN_CATEGORIES.some(
    (hidden) =>
      normalized === hidden ||
      normalized.startsWith(`${hidden} `)
  );
};

/* =========================================================
   COMPONENT
========================================================= */

export default function ProductImagesPDF() {
  const {
    data: allProducts = [],
    isLoading,
  } = useCachedProducts();

  const [selectedCategories, setSelectedCategories] =
    useState([]);

  const [isDownloading, setIsDownloading] =
    useState(false);

  const [isPosterDownloading, setIsPosterDownloading] =
    useState(false);

  const CLOUDINARY_BASE =
    "https://res.cloudinary.com/djyr368zj/";

  /* =======================================================
     ACTIVE PRODUCTS
  ======================================================= */

  const products = useMemo(
    () =>
      allProducts.filter(
        (product) => product.is_active === true
      ),
    [allProducts]
  );

  /* =======================================================
     VISIBLE PRODUCTS
  ======================================================= */

  const visibleProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          !isCategoryHidden(product.sub_category)
      ),
    [products]
  );

  /* =======================================================
     CATEGORY LOOKUP
  ======================================================= */

  const productsByCategory = useMemo(() => {
    const grouped = new Map();

    visibleProducts.forEach((product) => {
      const category = getDisplayCategory(
        product.sub_category
      );

      if (!category) return;

      if (!grouped.has(category)) {
        grouped.set(category, []);
      }

      grouped.get(category).push(product);
    });

    return grouped;
  }, [visibleProducts]);

  /* =======================================================
     CATEGORIES AND COUNTS
  ======================================================= */

  const categories = useMemo(
    () => Array.from(productsByCategory.keys()).sort(
      (a, b) => a.localeCompare(b)
    ),
    [productsByCategory]
  );

  const categoryCounts = useMemo(() => {
    const counts = {};

    productsByCategory.forEach((items, category) => {
      counts[category] = items.length;
    });

    return counts;
  }, [productsByCategory]);

  /* =======================================================
     SELECTED PRODUCTS
  ======================================================= */

  const selectedProducts = useMemo(() => {
    if (!selectedCategories.length) return [];

    return selectedCategories.flatMap(
      (category) =>
        productsByCategory.get(category) || []
    );
  }, [selectedCategories, productsByCategory]);

  const totalSelectedProducts =
    selectedProducts.length;

  /* =======================================================
     SELECTION HELPERS
  ======================================================= */

  const isBusy =
    isDownloading || isPosterDownloading;

  const isCategorySelected = (category) =>
    selectedCategories.includes(category);

  const toggleCategory = (category) => {
    if (isBusy) return;

    setSelectedCategories((previous) =>
      previous.includes(category)
        ? previous.filter((item) => item !== category)
        : [...previous, category]
    );
  };

  const selectAllCategories = () => {
    if (isBusy) return;

    setSelectedCategories([...categories]);
  };

  const clearAllCategories = () => {
    if (isBusy) return;

    setSelectedCategories([]);
  };

  /* =======================================================
     CLOUDINARY URL
  ======================================================= */

  const getCloudinaryUrl = (image) => {
    if (!image || typeof image !== "string") {
      return null;
    }

    const cleanImage = image.trim();

    if (!cleanImage) return null;

    if (
      cleanImage.startsWith("http://") ||
      cleanImage.startsWith("https://")
    ) {
      return cleanImage;
    }

    if (cleanImage.startsWith("image/upload/")) {
      return `${CLOUDINARY_BASE}${cleanImage}`;
    }

    if (cleanImage.startsWith("upload/")) {
      return `${CLOUDINARY_BASE}image/${cleanImage}`;
    }

    return `${CLOUDINARY_BASE}image/upload/${cleanImage}`;
  };

  /* =======================================================
     PRODUCT AND POSTER IMAGES
  ======================================================= */

  const getProductImage = (product) =>
    getCloudinaryUrl(
      product.image ||
      product.image_url ||
      product.product_image ||
      product.imageUrl ||
      null
    );

  const getPosterImage = (product) =>
    getCloudinaryUrl(product?.image2);

  /* =======================================================
     IMAGE TO JPEG
  ======================================================= */

  const imageToJPEG = async (url, maxSize = 1200) => {
    if (!url) return null;

    return new Promise((resolve) => {
      const img = new Image();

      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");

          let width = img.naturalWidth;
          let height = img.naturalHeight;

          if (!width || !height) {
            resolve(null);
            return;
          }

          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(
              maxSize / width,
              maxSize / height
            );

            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve(null);
            return;
          }

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);

          ctx.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL("image/jpeg", 0.92));
        } catch (error) {
          console.error(
            "Canvas conversion failed:",
            url,
            error
          );

          resolve(null);
        }
      };

      img.onerror = (error) => {
        console.error(
          "Image loading failed:",
          url,
          error
        );

        resolve(null);
      };

      img.src = url;
    });
  };

  /* =======================================================
     SAFE FILE NAME
  ======================================================= */

  const getSafeFileName = (name) =>
    String(name || "Products")
      .replace(/[^a-zA-Z0-9-_ ]/g, "")
      .replace(/\s+/g, "_")
      .trim() || "Products";

  const getSelectedCategoryFileName = () => {
    if (!selectedCategories.length) {
      return "Products";
    }

    if (selectedCategories.length === 1) {
      return getSafeFileName(selectedCategories[0]);
    }

    return `${selectedCategories.length}_Categories`;
  };

  /* =======================================================
     PRODUCT CATALOGUE PDF
     Kept available; button remains disabled in the UI.
  ======================================================= */

  const downloadPDF = async () => {
    if (
      !selectedCategories.length ||
      !selectedProducts.length
    ) {
      return;
    }

    setIsDownloading(true);

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 12;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59);
      doc.text("MAKPOWER", margin, 18);

      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);

      const categoryTitle = selectedCategories.join(" + ");

      const titleLines = doc.splitTextToSize(
        `${categoryTitle} - Product Catalogue`,
        pageWidth - margin * 2
      );

      doc.text(titleLines, margin, 27);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      doc.text(
        `Categories: ${selectedCategories.length}`,
        pageWidth - margin,
        18,
        { align: "right" }
      );

      doc.text(
        `Total Products: ${selectedProducts.length}`,
        pageWidth - margin,
        24,
        { align: "right" }
      );

      doc.setDrawColor(200, 200, 200);
      doc.line(margin, 36, pageWidth - margin, 36);

      let y = 46;

      for (let i = 0; i < selectedProducts.length; i++) {
        const product = selectedProducts[i];
        const image = getProductImage(product);

        if (y > pageHeight - 65) {
          doc.addPage();
          y = 20;

          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(71, 85, 105);

          doc.text(
            "MAKPOWER - Product Catalogue",
            margin,
            y
          );

          y += 14;
        }

        const cardX = margin;
        const cardWidth = pageWidth - margin * 2;
        const cardHeight = 55;

        doc.setDrawColor(220, 220, 220);
        doc.setFillColor(250, 250, 250);

        doc.roundedRect(
          cardX,
          y,
          cardWidth,
          cardHeight,
          3,
          3,
          "FD"
        );

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`${i + 1}`, cardX + 5, y + 8);

        if (image) {
          try {
            const base64 = await imageToJPEG(image, 1200);

            if (base64) {
              doc.addImage(
                base64,
                "JPEG",
                cardX + 18,
                y + 5,
                45,
                45,
                undefined,
                "FAST"
              );
            }
          } catch (error) {
            console.error(
              "PDF image error:",
              product.product_name,
              error
            );
          }
        }

        const textX = cardX + 70;
        const textWidth = cardWidth - 85;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);

        const productLines = doc.splitTextToSize(
          product.product_name || "Unnamed Product",
          textWidth
        );

        doc.text(productLines, textX, y + 15);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);

        doc.text(
          `Price: ${product.price ?? "-"}`,
          textX,
          y + 22
        );

        doc.text(
          `Guarantee: ${product.guarantee ?? "-"}`,
          textX,
          y + 32
        );

        if (product.sub_category) {
          const categoryLines = doc.splitTextToSize(
            `Category: ${product.sub_category}`,
            textWidth
          );

          doc.text(categoryLines, textX, y + 42);
        }

        y += cardHeight + 7;
      }

      const pageCount = doc.internal.getNumberOfPages();

      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);

        doc.text(
          "MAKPOWER | Product Catalogue",
          margin,
          pageHeight - 8
        );

        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - margin,
          pageHeight - 8,
          { align: "right" }
        );
      }

      doc.save(
        `${getSelectedCategoryFileName()}_Products.pdf`
      );
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("PDF generate nahi ho saka.");
    } finally {
      setIsDownloading(false);
    }
  };

  /* =======================================================
     POSTER PDF
  ======================================================= */

  const downloadAllPosters = async () => {
    if (
      !selectedCategories.length ||
      !selectedProducts.length
    ) {
      return;
    }

    setIsPosterDownloading(true);

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      let addedPages = 0;

      for (let i = 0; i < selectedProducts.length; i++) {
        const product = selectedProducts[i];
        const image = getPosterImage(product);

        if (!image) {
          console.warn(
            "Poster image2 not available:",
            product?.product_name
          );

          continue;
        }

        const base64 = await imageToJPEG(image, 2200);

        if (!base64) {
          console.warn(
            "Poster could not be converted:",
            product?.product_name
          );

          continue;
        }

        const imgProps = doc.getImageProperties(base64);
        const imgWidth = imgProps.width;
        const imgHeight = imgProps.height;

        if (!imgWidth || !imgHeight) continue;

        if (addedPages > 0) {
          doc.addPage();
        }

        const imgRatio = imgWidth / imgHeight;
        const pageRatio = pageWidth / pageHeight;

        let renderWidth;
        let renderHeight;
        let x;
        let y;

        if (imgRatio > pageRatio) {
          renderHeight = pageHeight;
          renderWidth = renderHeight * imgRatio;
          x = (pageWidth - renderWidth) / 2;
          y = 0;
        } else {
          renderWidth = pageWidth;
          renderHeight = renderWidth / imgRatio;
          x = 0;
          y = (pageHeight - renderHeight) / 2;
        }

        doc.addImage(
          base64,
          "JPEG",
          x,
          y,
          renderWidth,
          renderHeight,
          undefined,
          "FAST"
        );

        addedPages++;
      }

      if (addedPages === 0) {
        alert(
          "Selected categories mein kisi bhi product ka valid Image 2 / Poster nahi mila."
        );

        return;
      }

      doc.save(
        `${getSelectedCategoryFileName()}_Posters.pdf`
      );
    } catch (error) {
      console.error("All Poster PDF error:", error);
      alert("Poster PDF generate nahi ho saka.");
    } finally {
      setIsPosterDownloading(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return (
      <div className="min-h-full bg-slate-50">
        <MobilePageHeader title="Product Image PDF" />

        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-medium text-slate-500 shadow-sm">
            <FaSpinner className="animate-spin text-blue-600" />
            Loading products...
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f6f8fc] pb-40 sm:pb-28">
      <MobilePageHeader title="Product Image PDF" />

      <main className="mx-auto w-full max-w-[1500px] px-3 pt-16 sm:px-5 sm:pt-5 lg:px-6">
        {/* TOP CONTROL BAR */}

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-3 px-3 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_6px_14px_rgba(37,99,235,0.22)]">
                <FaImages size={15} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-sm font-bold text-slate-800 sm:text-base">
                    Product Catalogue
                  </h1>

                  <span className="hidden rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 sm:inline">
                    PDF
                  </span>
                </div>

                <p className="mt-0.5 text-[10px] text-slate-400 sm:text-[11px]">
                  Select categories to generate product posters
                </p>
              </div>
            </div>

            {/* STATS */}

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2">
                <FaLayerGroup className="text-[11px] text-slate-400" />

                <div>
                  <p className="text-[8px] uppercase tracking-wide text-slate-400">
                    Categories
                  </p>

                  <p className="text-xs font-bold text-slate-700">
                    {categories.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/60 px-2.5 py-2">
                <FaBoxOpen className="text-[11px] text-blue-500" />

                <div>
                  <p className="text-[8px] uppercase tracking-wide text-blue-400">
                    Selected
                  </p>

                  <p className="text-xs font-bold text-blue-700">
                    {totalSelectedProducts}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION STRIP */}

          <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                Selection
              </span>

              <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold text-white">
                {selectedCategories.length}
              </span>

              {selectedCategories.length > 0 && (
                <span className="truncate text-[9px] text-slate-400">
                  {selectedCategories.join(" • ")}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllCategories}
                disabled={!categories.length || isBusy}
                className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-blue-100 bg-white px-3 py-2 text-[10px] font-bold text-blue-600 transition-colors hover:bg-blue-50 active:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
              >
                <FaCheckSquare />
                Select All
              </button>

              {selectedCategories.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllCategories}
                  disabled={isBusy}
                  className="flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-500 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-500 active:bg-red-100 disabled:opacity-40"
                >
                  <FaTimes />
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>

        {/* SELECTED CATEGORY CHIPS */}

      
        {/* CATEGORY WORKSPACE */}

        <section className="mt-3 overflow-hidden rounded border border-slate-200/80 bg-whte sdow-[0_4px_18px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-3 sm:px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <FaBoxOpen size={12} />
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-700">
                  Categories
                </p>

                <p className="text-[9px] text-slate-400">
                  Tap a category to include its products
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-1.5 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />

              <span className="text-[9px] font-medium text-slate-400">
                {categories.length} available
              </span>
            </div>
          </div>

          {/* CATEGORY GRID */}

          {categories.length > 0 ? (
            <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {categories.map((category) => {
                const selected = isCategorySelected(category);
                const count = categoryCounts[category] || 0;

                return (
                  <button
                    key={category}
                    type="button"
                    disabled={isBusy}
                    onClick={() => toggleCategory(category)}
                    aria-pressed={selected}
                    className={`
                      group relative flex min-h-[76px] items-center gap-2
                      bg-white px-2.5 py-3 text-left
                      transition-colors duration-150
                      active:bg-blue-50
                      disabled:cursor-not-allowed disabled:opacity-60
                      sm:min-h-[72px] sm:gap-2.5 sm:px-3

                      ${
                        selected
                          ? "bg-blue-50/80"
                          : "hover:bg-slate-50"
                      }
                    `}
                  >
                    <span
                      className={`
                        absolute bottom-0 left-0 top-0 w-[3px] rounded-r-full
                        ${
                          selected
                            ? "bg-blue-600"
                            : "bg-transparent"
                        }
                      `}
                    />

                    <span
                      className={`
                        flex h-8 w-8 shrink-0 items-center justify-center
                        rounded-lg border
                        ${
                          selected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-100 bg-slate-50 text-slate-400 group-hover:border-blue-100 group-hover:bg-blue-50 group-hover:text-blue-500"
                        }
                      `}
                    >
                      {selected ? (
                        <FaCheckCircle size={12} />
                      ) : (
                        <FaLayerGroup size={11} />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className={`
                          block break-words text-[10px] font-bold leading-snug
                          sm:text-[11px]
                          ${
                            selected
                              ? "text-blue-700"
                              : "text-slate-700 group-hover:text-blue-700"
                          }
                        `}
                      >
                        {category}
                      </span>

                      <span
                        className={`
                          mt-1 block text-[9px] font-medium
                          ${
                            selected
                              ? "text-blue-500"
                              : "text-slate-400"
                          }
                        `}
                      >
                        {count} products
                      </span>
                    </span>

                    <FaChevronRight
                      className={`
                        shrink-0 text-[8px]
                        ${
                          selected
                            ? "text-blue-400"
                            : "text-slate-300 sm:opacity-0 sm:group-hover:opacity-100"
                        }
                      `}
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-[220px] flex-col items-center justify-center px-4 text-center">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <FaBoxOpen size={17} />
              </div>

              <p className="text-xs font-bold text-slate-600">
                No categories found
              </p>

              <p className="mt-1 text-[9px] text-slate-400">
                Active product categories will appear here.
              </p>
            </div>
          )}

          {/* SELECTED PRODUCTS SUMMARY */}

          <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/60 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-500">
                <FaImages size={10} />
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-600">
                  Ready for export
                </p>

                <p className="text-[9px] text-slate-400">
                  {selectedCategories.length} categories
                  {" • "}
                  {totalSelectedProducts} products
                </p>
              </div>
            </div>

            <span
              className={`
                w-fit rounded-md px-2 py-1 text-[9px] font-bold
                ${
                  selectedCategories.length > 0
                    ? "bg-blue-100 text-blue-600"
                    : "bg-slate-100 text-slate-400"
                }
              `}
            >
              {selectedCategories.length > 0
                ? "Selection active"
                : "Select category"}
            </span>
          </div>
        </section>
      </main>

      {/* =====================================================
          MOBILE + DESKTOP STICKY EXPORT BAR

          Mobile bottom offset leaves room for common
          fixed bottom navigation. Desktop stays at bottom.
      ===================================================== */}

      <div
        className="
          fixed inset-x-0 bottom-16 z-[100]
          border-t border-slate-200
          bg-white/95 shadow-[0_-8px_25px_rgba(15,23,42,0.10)]
          backdrop-blur-lg
          [padding-bottom:env(safe-area-inset-bottom)]
          md:bottom-0
        "
      >
        <div className="mx-auto flex w-full max-w-[1500px] items-center gap-2 px-3 py-2.5 sm:px-5 sm:py-3 lg:px-6">
          {/* DESKTOP SUMMARY */}

          <div className="hidden min-w-0 flex-1 items-center gap-3 sm:flex">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <FaImages size={13} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-700">
                Export Selection
              </p>

              <p className="truncate text-[9px] text-slate-400">
                {selectedCategories.length} categories
                {" • "}
                {totalSelectedProducts} products
              </p>
            </div>
          </div>

          {/* MOBILE SUMMARY */}

          <div className="flex min-w-[54px] shrink-0 flex-col items-center justify-center sm:hidden">
            <span className="text-sm font-extrabold leading-none text-slate-800">
              {totalSelectedProducts}
            </span>

            <span className="mt-1 text-[8px] font-medium text-slate-400">
              products
            </span>
          </div>

         
          {/* POSTER PDF */}

          <button
            type="button"
            onClick={downloadAllPosters}
            disabled={isBusy || selectedProducts.length === 0}
            className="
              flex min-h-11 min-w-0 flex-1 items-center justify-center
              gap-2 rounded
              bg-gradient-to-r from-indigo-600 to-violet-600
              px-3 py-2.5
              text-[11px] font-bold text-white
              shadow-[0_5px_14px_rgba(79,70,229,0.22)]
              transition-colors duration-150
              hover:from-indigo-700 hover:to-violet-700
              active:scale-[0.99]
              disabled:cursor-not-allowed disabled:opacity-40
              sm:min-h-11 sm:flex-none sm:min-w-[185px]
              sm:px-5 sm:text-xs
            "
          >
            {isPosterDownloading ? (
              <>
                <FaSpinner className="shrink-0 animate-spin" />
                <span className="truncate">
                  Creating Poster PDF...
                </span>
              </>
            ) : (
              <>
                <FaFileImage className="shrink-0" />
                <span className="truncate">
                  Poster PDF
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}