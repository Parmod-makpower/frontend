import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import { useCachedProducts } from "../../hooks/useCachedProducts";
import MobilePageHeader from "../../components/MobilePageHeader";

import {
  FaDownload,
  FaImages,
  FaCheckCircle,
  FaBoxOpen,
  FaImage,
  FaSpinner,
  FaFileImage,
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
   =========================================================

   Example:

   DATA CABLE
   DATA CABLE V8
   DATA CABLE TYPE-C
   DATA CABLE PD
   DATA CABLE C TO C

   => DATA CABLE
*/

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
   NORMALIZE CATEGORY
   ========================================================= */

const normalizeCategory = (value) => {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
};

/* =========================================================
   GET DISPLAY CATEGORY
   =========================================================

   Agar category kisi group mein hai,
   to group ka naam return hoga.

   DATA CABLE V8
        ↓
   DATA CABLE

   DATA CABLE TYPE-C
        ↓
   DATA CABLE

   DATA CABLE PD
        ↓
   DATA CABLE

   Agar group mein nahi hai,
   to original normalized category return hogi.
   ========================================================= */

const getDisplayCategory = (category) => {
  const normalized = normalizeCategory(category);

  if (!normalized) return "";

  for (const [groupName, members] of Object.entries(
    CATEGORY_GROUPS
  )) {
    const normalizedMembers = members.map(normalizeCategory);

    if (normalizedMembers.includes(normalized)) {
      return groupName;
    }
  }

  return normalized;
};

/* =========================================================
   CHECK HIDDEN CATEGORY
   =========================================================

   Prefix based hiding.

   Example:

   HIDDEN:
   POLYMER

   Then:

   POLYMER
   POLYMER MI BATTERY
   POLYMER OPPO BATTERY
   POLYMER VIVO BATTERY

   sab hide honge.
   ========================================================= */

const isCategoryHidden = (category) => {
  const normalized = normalizeCategory(category);

  if (!normalized) return false;

  return HIDDEN_SUB_CATEGORIES.some((hiddenCategory) => {
    const hidden = normalizeCategory(hiddenCategory);

    if (!hidden) return false;

    return (
      normalized === hidden ||
      normalized.startsWith(`${hidden} `)
    );
  });
};

export default function ProductImagesPDF() {
  const {
    data: allProducts = [],
    isLoading,
  } = useCachedProducts();

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [isDownloading, setIsDownloading] =
    useState(false);

  const [isPosterDownloading, setIsPosterDownloading] =
    useState(false);

  /* =========================================================
     CLOUDINARY CONFIG
     ========================================================= */

  const CLOUDINARY_BASE =
    "https://res.cloudinary.com/djyr368zj/";

  /* =========================================================
     ACTIVE PRODUCTS
     ========================================================= */

  const products = useMemo(() => {
    return allProducts.filter(
      (product) => product.is_active === true
    );
  }, [allProducts]);

  /* =========================================================
     VISIBLE PRODUCTS
     =========================================================

     Hidden categories ke products yaha se remove honge.
     ========================================================= */

  const visibleProducts = useMemo(() => {
    return products.filter(
      (product) =>
        !isCategoryHidden(product.sub_category)
    );
  }, [products]);

  /* =========================================================
     ALL DISPLAY CATEGORIES
     ========================================================= */

  const categories = useMemo(() => {
    const categorySet = new Set();

    visibleProducts.forEach((product) => {
      const originalCategory =
        product.sub_category;

      if (!originalCategory) return;

      const displayCategory =
        getDisplayCategory(originalCategory);

      if (!displayCategory) return;

      categorySet.add(displayCategory);
    });

    return Array.from(categorySet).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [visibleProducts]);

  /* =========================================================
     SELECTED PRODUCTS
     =========================================================

     Agar DATA CABLE select hai:

     DATA CABLE
     DATA CABLE V8
     DATA CABLE TYPE-C
     DATA CABLE PD
     DATA CABLE C TO C

     sab products aayenge.
     ========================================================= */

  const selectedProducts = useMemo(() => {
    if (!selectedCategory) return [];

    const selected =
      normalizeCategory(selectedCategory);

    return visibleProducts.filter((product) => {
      const productCategory =
        getDisplayCategory(product.sub_category);

      return (
        normalizeCategory(productCategory) ===
        selected
      );
    });
  }, [
    visibleProducts,
    selectedCategory,
  ]);

  /* =========================================================
     CLOUDINARY URL
     ========================================================= */

  const getCloudinaryUrl = (image) => {
    if (!image) return null;

    if (typeof image !== "string") {
      return null;
    }

    const cleanImage = image.trim();

    if (!cleanImage) return null;

    /* Already complete URL */

    if (
      cleanImage.startsWith("http://") ||
      cleanImage.startsWith("https://")
    ) {
      return cleanImage;
    }

    /* image/upload/... */

    if (
      cleanImage.startsWith("image/upload/")
    ) {
      return `${CLOUDINARY_BASE}${cleanImage}`;
    }

    /* upload/... */

    if (
      cleanImage.startsWith("upload/")
    ) {
      return `${CLOUDINARY_BASE}image/${cleanImage}`;
    }

    /* Normal CloudinaryField */

    return `${CLOUDINARY_BASE}image/upload/${cleanImage}`;
  };

  /* =========================================================
     GET PRODUCT IMAGE
     ========================================================= */

  const getProductImage = (product) => {
    const image =
      product.image ||
      product.image_url ||
      product.product_image ||
      product.imageUrl ||
      null;

    return getCloudinaryUrl(image);
  };

  /* =========================================================
     GET POSTER IMAGE
     =========================================================

     Poster ke liye IMAGE 2 use hoga.
     ========================================================= */

  const getPosterImage = (product) => {
    return getCloudinaryUrl(product?.image2);
  };

  /* =========================================================
     IMAGE -> JPEG BASE64
     ========================================================= */

  const imageToJPEG = async (url, maxSize = 1200) => {
    if (!url) return null;

    return new Promise((resolve) => {
      const img = new Image();

      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          const canvas =
            document.createElement("canvas");

          let width = img.naturalWidth;
          let height = img.naturalHeight;

          if (!width || !height) {
            resolve(null);
            return;
          }

          if (
            width > maxSize ||
            height > maxSize
          ) {
            const ratio = Math.min(
              maxSize / width,
              maxSize / height
            );

            width = Math.round(
              width * ratio
            );

            height = Math.round(
              height * ratio
            );
          }

          canvas.width = width;
          canvas.height = height;

          const ctx =
            canvas.getContext("2d");

          if (!ctx) {
            resolve(null);
            return;
          }

          /* White background */

          ctx.fillStyle = "#ffffff";

          ctx.fillRect(
            0,
            0,
            width,
            height
          );

          ctx.drawImage(
            img,
            0,
            0,
            width,
            height
          );

          const base64 =
            canvas.toDataURL(
              "image/jpeg",
              0.92
            );

          resolve(base64);
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

  /* =========================================================
     SAFE FILE NAME
     ========================================================= */

  const getSafeFileName = (name) => {
    return (
      String(name || "Products")
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .replace(/\s+/g, "_")
        .trim() || "Products"
    );
  };

  /* =========================================================
     DOWNLOAD PRODUCT IMAGE PDF
     ========================================================= */

  const downloadPDF = async () => {
    if (
      !selectedCategory ||
      selectedProducts.length === 0
    ) {
      return;
    }

    setIsDownloading(true);

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth =
        doc.internal.pageSize.getWidth();

      const pageHeight =
        doc.internal.pageSize.getHeight();

      const margin = 12;

      /* =====================================================
         HEADER
         ===================================================== */

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(18);

      doc.setTextColor(
        30,
        41,
        59
      );

      doc.text(
        "MAKPOWER",
        margin,
        18
      );

      doc.setFontSize(12);

      doc.setTextColor(
        71,
        85,
        105
      );

      doc.text(
        `${selectedCategory} - Product Catalogue`,
        margin,
        27
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(9);

      doc.text(
        `Total Products: ${selectedProducts.length}`,
        pageWidth - margin,
        18,
        {
          align: "right",
        }
      );

      doc.setDrawColor(
        200,
        200,
        200
      );

      doc.line(
        margin,
        32,
        pageWidth - margin,
        32
      );

      let y = 42;

      /* =====================================================
         PRODUCTS
         ===================================================== */

      for (
        let i = 0;
        i < selectedProducts.length;
        i++
      ) {
        const product =
          selectedProducts[i];

        const image =
          getProductImage(product);

        /* ===================================================
           NEW PAGE
           =================================================== */

        if (
          y >
          pageHeight - 65
        ) {
          doc.addPage();

          y = 20;

          doc.setFont(
            "helvetica",
            "bold"
          );

          doc.setFontSize(11);

          doc.setTextColor(
            71,
            85,
            105
          );

          doc.text(
            `${selectedCategory} - Product Catalogue`,
            margin,
            y
          );

          y += 15;
        }

        /* ===================================================
           CARD
           =================================================== */

        const cardX = margin;

        const cardWidth =
          pageWidth -
          margin * 2;

        const cardHeight = 55;

        doc.setDrawColor(
          220,
          220,
          220
        );

        doc.setFillColor(
          250,
          250,
          250
        );

        doc.roundedRect(
          cardX,
          y,
          cardWidth,
          cardHeight,
          3,
          3,
          "FD"
        );

        /* ===================================================
           SERIAL
           =================================================== */

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(9);

        doc.setTextColor(
          100,
          100,
          100
        );

        doc.text(
          `${i + 1}`,
          cardX + 5,
          y + 8
        );

        /* ===================================================
           IMAGE
           =================================================== */

        if (image) {
          try {
            const base64 =
              await imageToJPEG(
                image,
                1200
              );

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

        /* ===================================================
           PRODUCT DETAILS
           =================================================== */

        const textX =
          cardX + 70;

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(11);

        doc.setTextColor(
          30,
          41,
          59
        );

        const productName =
          product.product_name ||
          "Unnamed Product";

        const productLines =
          doc.splitTextToSize(
            productName,
            cardWidth - 85
          );

        doc.text(
          productLines,
          textX,
          y + 15
        );

        /* Product ID */

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.setFontSize(9);

        doc.setTextColor(
          100,
          100,
          100
        );

        doc.text(
          `Price: ${
            product.price ?? "-"
          }`,
          textX,
          y + 22
        );

        doc.text(
          `Guarantee: ${
            product.guarantee ?? "-"
          }`,
          textX,
          y + 32
        );

        /* Original Sub Category */

        if (
          product.sub_category
        ) {
          doc.text(
            `Category: ${product.sub_category}`,
            textX,
            y + 42
          );
        }

        y +=
          cardHeight + 7;
      }

      /* =====================================================
         FOOTER
         ===================================================== */

      const pageCount =
        doc.internal.getNumberOfPages();

      for (
        let i = 1;
        i <= pageCount;
        i++
      ) {
        doc.setPage(i);

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.setFontSize(8);

        doc.setTextColor(
          120,
          120,
          120
        );

        doc.text(
          `MAKPOWER | ${selectedCategory}`,
          margin,
          pageHeight - 8
        );

        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - margin,
          pageHeight - 8,
          {
            align: "right",
          }
        );
      }

      /* =====================================================
         SAVE
         ===================================================== */

      const safeCategory =
        getSafeFileName(
          selectedCategory
        );

      const fileName =
        `${safeCategory}_Products.pdf`;

      doc.save(fileName);
    } catch (error) {
      console.error(
        "PDF generation error:",
        error
      );

      alert(
        "PDF generate nahi ho saka."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  /* =========================================================
     DOWNLOAD ALL POSTERS
     =========================================================

     IMPORTANT:

     Ab koi second page/component nahi hai.

     First page ke "Poster Download" button par click karte hi
     Image 2 se PDF generate hoga aur download hoga.

     ONE PRODUCT = ONE A4 PAGE
     ========================================================= */

  const downloadAllPosters = async () => {
    if (
      !selectedCategory ||
      selectedProducts.length === 0
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

      const pageWidth =
        doc.internal.pageSize.getWidth();

      const pageHeight =
        doc.internal.pageSize.getHeight();

      let addedPages = 0;

      /* =====================================================
         LOOP ALL PRODUCTS
         ===================================================== */

      for (
        let i = 0;
        i < selectedProducts.length;
        i++
      ) {
        const product =
          selectedProducts[i];

        /* ONLY IMAGE 2 */

        const image =
          getPosterImage(product);

        console.log(
          `Poster ${i + 1}/${selectedProducts.length}:`,
          product?.product_name,
          image
        );

        /* ===================================================
           NO IMAGE 2
           =================================================== */

        if (!image) {
          console.warn(
            "Poster image2 not available:",
            product?.product_name
          );

          continue;
        }

        /* ===================================================
           CONVERT IMAGE
           =================================================== */

        const base64 =
          await imageToJPEG(
            image,
            2200
          );

        if (!base64) {
          console.warn(
            "Poster could not be converted:",
            product?.product_name
          );

          continue;
        }

        /* ===================================================
           IMAGE DIMENSIONS
           =================================================== */

        const imgProps =
          doc.getImageProperties(
            base64
          );

        const imgWidth =
          imgProps.width;

        const imgHeight =
          imgProps.height;

        if (
          !imgWidth ||
          !imgHeight
        ) {
          console.warn(
            "Invalid poster dimensions:",
            product?.product_name
          );

          continue;
        }

        /* ===================================================
           NEW PAGE

           First valid poster uses first PDF page.
           Every next poster gets a new page.
           =================================================== */

        if (addedPages > 0) {
          doc.addPage();
        }

        const imgRatio =
          imgWidth / imgHeight;

        const pageRatio =
          pageWidth / pageHeight;

        let renderWidth;
        let renderHeight;
        let x;
        let y;

        /* ===================================================
           FULL A4 COVER

           Aspect ratio maintain rahega.
           Agar image A4 ratio se different hai,
           thoda crop hoga.
           =================================================== */

        if (imgRatio > pageRatio) {
          /* Image wider hai */

          renderHeight = pageHeight;

          renderWidth =
            renderHeight * imgRatio;

          x =
            (pageWidth -
              renderWidth) /
            2;

          y = 0;
        } else {
          /* Image taller hai */

          renderWidth = pageWidth;

          renderHeight =
            renderWidth / imgRatio;

          x = 0;

          y =
            (pageHeight -
              renderHeight) /
            2;
        }

        /* ===================================================
           ADD POSTER FULL PAGE
           =================================================== */

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

        console.log(
          `Poster page added: ${addedPages}`,
          product?.product_name
        );
      }

      /* =====================================================
         NO VALID POSTERS
         ===================================================== */

      if (addedPages === 0) {
        alert(
          "Is category mein kisi bhi product ka valid Image 2 / Poster nahi mila."
        );

        return;
      }

      /* =====================================================
         FILE NAME
         ===================================================== */

      const safeCategory =
        getSafeFileName(
          selectedCategory
        );

      const fileName =
        `${safeCategory}_Posters.pdf`;

      /* =====================================================
         SAVE PDF
         ===================================================== */

      doc.save(fileName);

      console.log(
        `Poster PDF generated successfully: ${addedPages} pages`
      );
    } catch (error) {
      console.error(
        "All Poster PDF error:",
        error
      );

      alert(
        "Poster PDF generate nahi ho saka."
      );
    } finally {
      setIsPosterDownloading(false);
    }
  };

  /* =========================================================
     LOADING
     ========================================================= */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">

        <MobilePageHeader
          title="Product Image PDF"
        />

        <div className="pt-24 flex justify-center">

          <div className="flex items-center gap-2 text-gray-500">

            <FaSpinner className="animate-spin" />

            Loading products...

          </div>

        </div>

      </div>
    );
  }

  /* =========================================================
     MAIN UI
     ========================================================= */

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      <MobilePageHeader
        title="Product Image PDF"
      />

      <div className="mx-auto px-3 sm:px-6 pt-[70px] sm:pt-6">

        {/* =================================================
            HEADER CARD
        ================================================= */}

        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">

          <div className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-5 py-5 border-b border-gray-200">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">

                <FaImages className="text-xl" />

              </div>

              <div>

                <h1 className="text-lg sm:text-xl font-bold text-gray-800">

                  Product Image Catalogue

                </h1>

                <p className="text-xs sm:text-sm text-gray-500 mt-1">

                  Select a category and download
                  all product images in PDF.

                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              CATEGORY SECTION
          ================================================= */}

          <div className="p-4 sm:p-6">

            <div className="flex items-center gap-2 mb-4">

              <FaBoxOpen className="text-blue-600" />

              <h2 className="font-semibold text-gray-800">

                Select Category

              </h2>

            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">

              {categories.map(
                (category) => {

                  const isSelected =
                    normalizeCategory(
                      selectedCategory
                    ) ===
                    normalizeCategory(
                      category
                    );

                  const count =
                    visibleProducts.filter(
                      (product) => {

                        const productCategory =
                          getDisplayCategory(
                            product.sub_category
                          );

                        return (
                          normalizeCategory(
                            productCategory
                          ) ===
                          normalizeCategory(
                            category
                          )
                        );
                      }
                    ).length;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        setSelectedCategory(
                          category
                        )
                      }
                      className={`
                        relative text-left p-4 rounded-xl cursor-pointer border
                        transition-all duration-200
                        ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                        }
                      `}
                    >

                      {isSelected && (
                        <FaCheckCircle
                          className="
                            absolute top-2 right-2
                            text-blue-600 text-sm
                          "
                        />
                      )}

                      <div className="font-semibold text-sm text-gray-800 pr-4">

                        {category}

                      </div>

                      <div className="text-xs text-gray-500 mt-1">

                        {count} Products

                      </div>

                    </button>
                  );
                }
              )}

            </div>

          </div>

        </div>

        {/* =================================================
            SELECTED CATEGORY
        ================================================= */}

        {selectedCategory && (
          <div className="mt-5 bg-white rounded-2xl border border-gray-200 shadow-sm">

            {/* =================================================
                CATEGORY HEADER + BUTTONS
            ================================================= */}

            <div className="p-4 sm:p-5 border-b border-gray-200">

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                <div>

                  <h2 className="font-bold text-gray-800">

                    {selectedCategory}

                  </h2>

                  <p className="text-xs text-gray-500 mt-1">

                    {selectedProducts.length}{" "}

                    active products found

                  </p>

                </div>

                {/* BUTTONS */}

                <div className="flex flex-col sm:flex-row gap-2">

                  {/* =================================================
                      PRODUCT PDF
                  ================================================= */}

                  <button
                    type="button"
                    onClick={downloadPDF}
                    disabled={
                      isDownloading ||
                      isPosterDownloading ||
                      selectedProducts.length ===
                        0
                    }
                    className="
                      flex items-center justify-center gap-2
                      bg-gradient-to-r from-blue-600 to-indigo-600
                      hover:from-blue-700 hover:to-indigo-700
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                      text-white
                      px-5 py-2.5
                      rounded-xl
                      text-sm font-semibold
                      shadow-md
                      transition-all
                    "
                  >

                    {isDownloading ? (
                      <>
                        <FaSpinner className="animate-spin" />

                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <FaDownload />

                        Download PDF
                      </>
                    )}

                  </button>

                  {/* =================================================
                      POSTER PDF

                      IMPORTANT:
                      Directly yahi se download hoga.
                      Koi next page nahi.
                  ================================================= */}

                  <button
                    type="button"
                    onClick={downloadAllPosters}
                    disabled={
                      isDownloading ||
                      isPosterDownloading ||
                      selectedProducts.length ===
                        0
                    }
                    className="
                      flex items-center justify-center gap-2
                      bg-gradient-to-r from-purple-600 to-pink-600
                      hover:from-purple-700 hover:to-pink-700
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                      text-white
                      px-5 py-2.5
                      rounded-xl
                      text-sm font-semibold
                      shadow-md
                      transition-all
                    "
                  >

                    {isPosterDownloading ? (
                      <>
                        <FaSpinner className="animate-spin" />

                        Generating Posters...
                      </>
                    ) : (
                      <>
                        <FaFileImage />

                        Poster Download
                      </>
                    )}

                  </button>

                </div>

              </div>

            </div>

            {/* =================================================
                PRODUCT PREVIEW
            ================================================= */}

            <div className="p-4 sm:p-5">

              {selectedProducts.length === 0 ? (

                <div className="py-10 text-center text-gray-500">

                  No active products found.

                </div>

              ) : (

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">

                  {selectedProducts.map(
                    (product) => {

                      const image =
                        getProductImage(
                          product
                        );

                      return (
                        <div
                          key={
                            product.product_id
                          }
                          className="
                            border border-gray-200
                            rounded-xl
                            overflow-hidden
                            bg-white
                            hover:shadow-md
                            transition
                          "
                        >

                          {/* =================================================
                              IMAGE
                          ================================================= */}

                          <div className="aspect-square bg-gray-50 flex items-center justify-center">

                            {image ? (

                              <img
                                src={image}
                                alt={
                                  product.product_name
                                }
                                className="
                                  w-full h-full
                                  object-contain
                                  p-3
                                "
                                loading="lazy"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                  console.error(
                                    "Preview image failed:",
                                    image
                                  );

                                  e.currentTarget.style.display =
                                    "none";
                                }}
                              />

                            ) : (

                              <div className="flex flex-col items-center justify-center text-gray-400">

                                <FaImage className="text-3xl mb-2" />

                                <span className="text-xs">

                                  No Image

                                </span>

                              </div>

                            )}

                          </div>

                          {/* =================================================
                              DETAILS
                          ================================================= */}

                          <div className="p-2">

                            <p className="text-xs font-semibold text-gray-700 line-clamp-2">

                              {
                                product.product_name
                              }

                            </p>

                            <p className="text-[10px] text-gray-400 mt-1">

                              ID:{" "}

                              {
                                product.product_id
                              }

                            </p>

                            {/* ORIGINAL CATEGORY */}

                            {product.sub_category && (
                              <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">

                                Category:{" "}

                                {
                                  product.sub_category
                                }

                              </p>
                            )}

                            {/* DEBUG IMAGE URL */}

                            <p className="text-[9px] text-gray-300 mt-1 truncate">

                              {image ||
                                "No image"}

                            </p>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              )}

            </div>

          </div>
        )}

      </div>

    </div>
  );
}