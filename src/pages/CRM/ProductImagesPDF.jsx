import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import { useCachedProducts } from "../../hooks/useCachedProducts";
import MobilePageHeader from "../../components/MobilePageHeader";

import {
  FaDownload,
  FaImages,
  FaCheckCircle,
  FaBoxOpen,
  FaSpinner,
  FaFileImage,
  FaCheckSquare,
  FaSquare,
  FaTimes,
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

/* =========================================================
   COMPONENT
========================================================= */

export default function ProductImagesPDF() {
  const {
    data: allProducts = [],
    isLoading,
  } = useCachedProducts();

  /* =======================================================
     STATE
  ======================================================= */

  const [selectedCategories, setSelectedCategories] =
    useState([]);

  const [isDownloading, setIsDownloading] =
    useState(false);

  const [isPosterDownloading, setIsPosterDownloading] =
    useState(false);

  /* =======================================================
     CLOUDINARY CONFIG
  ======================================================= */

  const CLOUDINARY_BASE =
    "https://res.cloudinary.com/djyr368zj/";

  /* =======================================================
     ACTIVE PRODUCTS
  ======================================================= */

  const products = useMemo(() => {
    return allProducts.filter(
      (product) => product.is_active === true
    );
  }, [allProducts]);

  /* =======================================================
     VISIBLE PRODUCTS
  ======================================================= */

  const visibleProducts = useMemo(() => {
    return products.filter(
      (product) =>
        !isCategoryHidden(product.sub_category)
    );
  }, [products]);

  /* =======================================================
     ALL DISPLAY CATEGORIES
  ======================================================= */

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

  /* =======================================================
     CATEGORY PRODUCT COUNT
  ======================================================= */

  const categoryCounts = useMemo(() => {
    const counts = {};

    categories.forEach((category) => {
      counts[category] = visibleProducts.filter(
        (product) => {
          const productCategory =
            getDisplayCategory(
              product.sub_category
            );

          return (
            normalizeCategory(productCategory) ===
            normalizeCategory(category)
          );
        }
      ).length;
    });

    return counts;
  }, [categories, visibleProducts]);

  /* =======================================================
     SELECTED PRODUCTS
     
     Multiple categories ke products combine honge.
  ======================================================= */

  const selectedProducts = useMemo(() => {
    if (selectedCategories.length === 0) {
      return [];
    }

    const selectedSet = new Set(
      selectedCategories.map(normalizeCategory)
    );

    return visibleProducts.filter((product) => {
      const productCategory =
        getDisplayCategory(
          product.sub_category
        );

      return selectedSet.has(
        normalizeCategory(productCategory)
      );
    });
  }, [
    visibleProducts,
    selectedCategories,
  ]);

  /* =======================================================
     TOTAL SELECTED PRODUCTS
  ======================================================= */

  const totalSelectedProducts =
    selectedProducts.length;

  /* =======================================================
     CHECK CATEGORY SELECTED
  ======================================================= */

  const isCategorySelected = (category) => {
    return selectedCategories.some(
      (selected) =>
        normalizeCategory(selected) ===
        normalizeCategory(category)
    );
  };

  /* =======================================================
     TOGGLE CATEGORY
  ======================================================= */

  const toggleCategory = (category) => {
    if (
      isDownloading ||
      isPosterDownloading
    ) {
      return;
    }

    setSelectedCategories((previous) => {
      const exists = previous.some(
        (item) =>
          normalizeCategory(item) ===
          normalizeCategory(category)
      );

      if (exists) {
        return previous.filter(
          (item) =>
            normalizeCategory(item) !==
            normalizeCategory(category)
        );
      }

      return [...previous, category];
    });
  };

  /* =======================================================
     SELECT ALL
  ======================================================= */

  const selectAllCategories = () => {
    if (
      isDownloading ||
      isPosterDownloading
    ) {
      return;
    }

    setSelectedCategories([...categories]);
  };

  /* =======================================================
     CLEAR ALL
  ======================================================= */

  const clearAllCategories = () => {
    if (
      isDownloading ||
      isPosterDownloading
    ) {
      return;
    }

    setSelectedCategories([]);
  };

  /* =======================================================
     CLOUDINARY URL
  ======================================================= */

  const getCloudinaryUrl = (image) => {
    if (!image) return null;

    if (typeof image !== "string") {
      return null;
    }

    const cleanImage = image.trim();

    if (!cleanImage) {
      return null;
    }

    /* Already complete URL */

    if (
      cleanImage.startsWith("http://") ||
      cleanImage.startsWith("https://")
    ) {
      return cleanImage;
    }

    /* image/upload/... */

    if (
      cleanImage.startsWith(
        "image/upload/"
      )
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

  /* =======================================================
     GET PRODUCT IMAGE
  ======================================================= */

  const getProductImage = (product) => {
    const image =
      product.image ||
      product.image_url ||
      product.product_image ||
      product.imageUrl ||
      null;

    return getCloudinaryUrl(image);
  };

  /* =======================================================
     GET POSTER IMAGE
     
     IMAGE 2
  ======================================================= */

  const getPosterImage = (product) => {
    return getCloudinaryUrl(
      product?.image2
    );
  };

  /* =======================================================
     IMAGE -> JPEG BASE64
  ======================================================= */

  const imageToJPEG = async (
    url,
    maxSize = 1200
  ) => {
    if (!url) return null;

    return new Promise((resolve) => {
      const img = new Image();

      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          const canvas =
            document.createElement(
              "canvas"
            );

          let width =
            img.naturalWidth;

          let height =
            img.naturalHeight;

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

  /* =======================================================
     SAFE FILE NAME
  ======================================================= */

  const getSafeFileName = (name) => {
    return (
      String(name || "Products")
        .replace(
          /[^a-zA-Z0-9-_ ]/g,
          ""
        )
        .replace(
          /\s+/g,
          "_"
        )
        .trim() || "Products"
    );
  };

  /* =======================================================
     CATEGORY FILE NAME
  ======================================================= */

  const getSelectedCategoryFileName = () => {
    if (selectedCategories.length === 0) {
      return "Products";
    }

    if (selectedCategories.length === 1) {
      return getSafeFileName(
        selectedCategories[0]
      );
    }

    return `${selectedCategories.length}_Categories`;
  };

  /* =======================================================
     DOWNLOAD PRODUCT IMAGE PDF
     
     MULTIPLE CATEGORY SUPPORT
  ======================================================= */

  const downloadPDF = async () => {
    if (
      selectedCategories.length === 0 ||
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
        compress: true,
      });

      const pageWidth =
        doc.internal.pageSize.getWidth();

      const pageHeight =
        doc.internal.pageSize.getHeight();

      const margin = 12;

      /* ===================================================
         PDF HEADER
      =================================================== */

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

      doc.setFontSize(11);

      doc.setTextColor(
        71,
        85,
        105
      );

      const categoryTitle =
        selectedCategories.join(
          " + "
        );

      const titleLines =
        doc.splitTextToSize(
          `${categoryTitle} - Product Catalogue`,
          pageWidth - margin * 2
        );

      doc.text(
        titleLines,
        margin,
        27
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(9);

      doc.text(
        `Categories: ${selectedCategories.length}`,
        pageWidth - margin,
        18,
        {
          align: "right",
        }
      );

      doc.text(
        `Total Products: ${selectedProducts.length}`,
        pageWidth - margin,
        24,
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
        36,
        pageWidth - margin,
        36
      );

      let y = 46;

      /* ===================================================
         PRODUCTS
      =================================================== */

      for (
        let i = 0;
        i < selectedProducts.length;
        i++
      ) {
        const product =
          selectedProducts[i];

        const image =
          getProductImage(product);

        /* =================================================
           NEW PAGE
        ================================================= */

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

          doc.setFontSize(10);

          doc.setTextColor(
            71,
            85,
            105
          );

          doc.text(
            "MAKPOWER - Product Catalogue",
            margin,
            y
          );

          y += 14;
        }

        /* =================================================
           CARD
        ================================================= */

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

        /* =================================================
           SERIAL
        ================================================= */

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

        /* =================================================
           IMAGE
        ================================================= */

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

        /* =================================================
           PRODUCT DETAILS
        ================================================= */

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

        /* Price */

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
          `Price: ${product.price ?? "-"
          }`,
          textX,
          y + 22
        );

        /* Guarantee */

        doc.text(
          `Guarantee: ${product.guarantee ?? "-"
          }`,
          textX,
          y + 32
        );

        /* Category */

        if (
          product.sub_category
        ) {
          const categoryLines =
            doc.splitTextToSize(
              `Category: ${product.sub_category}`,
              cardWidth - 85
            );

          doc.text(
            categoryLines,
            textX,
            y + 42
          );
        }

        y +=
          cardHeight + 7;
      }

      /* ===================================================
         FOOTER
      =================================================== */

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
          "MAKPOWER | Product Catalogue",
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

      /* ===================================================
         SAVE
      =================================================== */

      const safeName =
        getSelectedCategoryFileName();

      doc.save(
        `${safeName}_Products.pdf`
      );
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

  /* =======================================================
     DOWNLOAD ALL POSTERS
     
     MULTIPLE CATEGORY SUPPORT
     
     IMAGE 2
     
     ONE PRODUCT = ONE A4 PAGE
  ======================================================= */

  const downloadAllPosters = async () => {
    if (
      selectedCategories.length === 0 ||
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

      /* ===================================================
         LOOP PRODUCTS
      =================================================== */

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

        if (!image) {
          console.warn(
            "Poster image2 not available:",
            product?.product_name
          );

          continue;
        }

        /* =================================================
           CONVERT IMAGE
        ================================================= */

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

        /* =================================================
           IMAGE DIMENSIONS
        ================================================= */

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
          continue;
        }

        /* =================================================
           NEW PAGE
        ================================================= */

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

        /* =================================================
           FULL A4 COVER
        ================================================= */

        if (
          imgRatio > pageRatio
        ) {
          renderHeight =
            pageHeight;

          renderWidth =
            renderHeight *
            imgRatio;

          x =
            (pageWidth -
              renderWidth) /
            2;

          y = 0;
        } else {
          renderWidth =
            pageWidth;

          renderHeight =
            renderWidth /
            imgRatio;

          x = 0;

          y =
            (pageHeight -
              renderHeight) /
            2;
        }

        /* =================================================
           ADD POSTER
        ================================================= */

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

      /* ===================================================
         NO VALID POSTERS
      =================================================== */

      if (addedPages === 0) {
        alert(
          "Selected categories mein kisi bhi product ka valid Image 2 / Poster nahi mila."
        );

        return;
      }

      /* ===================================================
         SAVE
      =================================================== */

      const safeName =
        getSelectedCategoryFileName();

      doc.save(
        `${safeName}_Posters.pdf`
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

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">

        <MobilePageHeader
          title="Product Image PDF"
        />

        <div className="pt-24 flex justify-center">

          <div className="flex items-center gap-2 text-gray-500 text-sm">

            <FaSpinner className="animate-spin" />

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
    <div className=" bg-slate-50 pb-28 sm:pb-0 bg-red-200">

      <div className="mx-auto w-full sm:px-5 lg:px-6 pt-[68px] sm:pt-6">

        <div className="
          
          sm:mt-5
          sm:bg-white
          sm:border
          border-slate-200
          rounded
          sm:shadow-sm
          overflow-hidden
        ">

          {/* Section header */}

          <div className="
            px-4 py-3
            sm:px-5 sm:py-4
            border-b border-slate-100
          ">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2 min-w-0">

                <FaBoxOpen className="text-blue-500 shrink-0" />

                <div className="min-w-0">

                  <p className="
                  text-xs
                  sm:text-sm
                  font-semibold
                  text-slate-700
                ">
                    Categories
                  </p>

                  <p className="
                  text-[10px]
                  sm:text-xs
                  text-slate-400
                ">
                    {selectedCategories.length} selected
                    {" • "}
                    {totalSelectedProducts} products
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-2 shrink-0">

                <button
                  type="button"
                  onClick={selectAllCategories}
                  disabled={
                    categories.length === 0 ||
                    isDownloading ||
                    isPosterDownloading
                  }
                  className="
                  flex items-center gap-1.5
                  px-2.5 py-1.5
                  sm:px-3 sm:py-2
                  rounded-lg
                  bg-blue-50
                  text-blue-600
                  text-[10px]
                  sm:text-xs
                  font-semibold
                  hover:bg-blue-100
                  disabled:opacity-50
                  transition
                "
                >
                  <FaCheckSquare />
                  All
                </button>

                {selectedCategories.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllCategories}
                    disabled={
                      isDownloading ||
                      isPosterDownloading
                    }
                    className="
                    flex items-center gap-1.5
                    px-2.5 py-1.5
                    sm:px-3 sm:py-2
                    rounded-lg
                    bg-slate-100
                    text-slate-600
                    text-[10px]
                    sm:text-xs
                    font-semibold
                    hover:bg-slate-200
                    disabled:opacity-50
                    transition
                  "
                  >
                    <FaTimes />
                    Clear
                  </button>
                )}

              </div>

            </div>

          </div>

          {/* Category cards */}

          <div className="
            p-3
            sm:p-5
            grid
            grid-cols-2
            sm:grid-cols-3
            md:grid-cols-4
            lg:grid-cols-5
            xl:grid-cols-8
            gap-2
            sm:gap-3
          ">

            {categories.map(
              (category) => {

                const selected =
                  isCategorySelected(
                    category
                  );

                const count =
                  categoryCounts[
                  category
                  ] || 0;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      toggleCategory(
                        category
                      )
                    }
                    disabled={
                      isDownloading ||
                      isPosterDownloading
                    }
                    className={`
                      relative
                      w-full
                      min-h-[68px]
                      sm:min-h-[82px]
                      text-left
                      rounded-xl
                      border
                      px-3
                      py-2.5
                      sm:px-3.5
                      sm:py-3
                      transition-all
                      duration-150
                      active:scale-[0.98]
                      disabled:opacity-60
                      disabled:cursor-not-allowed

                      ${selected
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40"
                      }
                    `}
                  >

                    {/* Checkbox */}

                    <div className="
                      absolute
                      top-2
                      right-2
                    ">

                      {selected ? (
                        <FaCheckCircle className="
                          text-blue-600
                          text-sm
                          sm:text-base
                        " />
                      ) : (
                        <FaSquare className="
                          text-slate-200
                          text-sm
                          sm:text-base
                        " />
                      )}

                    </div>

                    {/* Category name */}

                    <div className="
                      pr-5
                      text-[11px]
                      sm:text-xs
                      font-bold
                      leading-tight
                      text-slate-700
                      line-clamp-2
                    ">
                      {category}
                    </div>

                    {/* Product count */}

                    <div className="
                      mt-2
                      text-[9px]
                      sm:text-[10px]
                      text-slate-400
                    ">
                      {count} products
                    </div>

                  </button>
                );
              }
            )}

          </div>

          {/* No category */}

          {categories.length === 0 && (
            <div className="
              px-4
              py-12
              text-center
              text-sm
              text-slate-400
            ">
              No categories found.
            </div>
          )}

        </div>

      </div>


      <div className="
  fixed
  left-0
  right-0
  top-0
  md:top-auto
  md:bottom-0
  z-50
  bg-white/95
  backdrop-blur-md
  border-t
  border-slate-200
  shadow-[0_-4px_20px_rgba(0,0,0,0.08)]
">

        <div className="
          mx-auto
          w-full
          max-w-7xl
          px-3
          py-2.5
          sm:px-5
          sm:py-3
          lg:px-6
        ">

          <div className="
            flex
            items-center
            gap-2
            sm:gap-3
          ">

            {/* Selected summary */}

            <div className="
              hidden
              sm:flex
              flex-1
              min-w-0
              items-center
              gap-2
            ">

              <div className="
                w-9
                h-9
                rounded-lg
                bg-slate-100
                flex
                items-center
                justify-center
                text-slate-500
              ">
                <FaImages />
              </div>

              <div className="min-w-0">

                <p className="
                  text-xs
                  font-bold
                  text-slate-700
                ">
                  {selectedCategories.length} categories
                </p>

                <p className="
                  text-[10px]
                  text-slate-400
                ">
                  {totalSelectedProducts} products selected
                </p>

              </div>

            </div>

            {/* Mobile selected count */}

            <div className="
              flex
              sm:hidden
              flex-col
              items-center
              justify-center
              min-w-[48px]
            ">

              <span className="
                text-sm
                font-bold
                text-slate-700
              ">
                {totalSelectedProducts}
              </span>

              <span className="
                text-[8px]
                text-slate-400
              ">
                products
              </span>

            </div>

            {/* Product PDF */}

            {/* <button
              type="button"
              onClick={downloadPDF}
              disabled={
                isDownloading ||
                isPosterDownloading ||
                selectedProducts.length === 0
              }
              className="
                flex-1
                sm:flex-none
                sm:min-w-[165px]
                flex
                items-center
                justify-center
                gap-1.5
                sm:gap-2
                bg-gradient-to-r
                from-blue-600
                to-indigo-600
                hover:from-blue-700
                hover:to-indigo-700
                disabled:opacity-50
                disabled:cursor-not-allowed
                text-white
                px-3
                sm:px-5
                py-2.5
                sm:py-3
                rounded-xl
                text-[10px]
                sm:text-sm
                font-bold
                shadow-sm
                transition
                active:scale-[0.98]
                whitespace-nowrap
              "
            >

              {isDownloading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FaDownload />
                  <span>Product PDF</span>
                </>
              )}

            </button> */}

            {/* Poster PDF */}

            <button
              type="button"
              onClick={
                downloadAllPosters
              }
              disabled={
                isDownloading ||
                isPosterDownloading ||
                selectedProducts.length === 0
              }
              className="
  flex-none
  w-[100px]
  sm:w-auto
  sm:min-w-[165px]
  flex
  items-center
  justify-center
  gap-1.5
  sm:gap-2
  bg-gradient-to-r
  from-purple-600
  to-pink-600
  hover:from-purple-700
  hover:to-pink-700
  disabled:opacity-50
  disabled:cursor-not-allowed
  text-white
  px-3
  sm:px-5
  py-2.5
  sm:py-3
  rounded
  text-[10px]
  sm:text-sm
  font-bold
  shadow-sm
  transition
  active:scale-[0.98]
  whitespace-nowrap
  ms-50
"
            >

              {isPosterDownloading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FaFileImage />
                  <span>Poster PDF</span>
                </>
              )}

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}