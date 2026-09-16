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




// import { useMemo, useState } from "react";
// import jsPDF from "jspdf";
// import { useCachedProducts } from "../../hooks/useCachedProducts";
// import MobilePageHeader from "../../components/MobilePageHeader";

// import {
//   FaDownload,
//   FaImages,
//   FaCheckCircle,
//   FaBoxOpen,
//   FaSpinner,
//   FaFileImage,
//   FaCheckSquare,
//   FaTimes,
//   FaLayerGroup,
//   FaChevronRight,
// } from "react-icons/fa";

// /* =========================================================
//    HIDDEN SUB CATEGORIES
// ========================================================= */

// const HIDDEN_SUB_CATEGORIES = [
//   "POUCH BATTERY",
//   "ECO BATTERY",
//   "POLYMER",
//   "TEMPERED",
//   "UV TEMPERED",
//   "NEW SOLDIER",
//   "PROMOTIONAL",
//   "MEMORY CARD",
//   "PENDRIVE",
//   "FAN",
//   "GLASS",
//   "SMART",
//   "LAMINATION",
// ];

// /* =========================================================
//    CATEGORY GROUPS
// ========================================================= */

// const CATEGORY_GROUPS = {
//   "DATA CABLE": [
//     "DATA CABLE",
//     "DATA CABLE I PHONE",
//     "DATA CABLE TYPE-C",
//     "DATA CABLE TYPE C",
//     "DATA CABLE C TO C",
//     "DATA CABLE V8",
//     "DATA CABLE PD",
//     "DATA CABLE PB",
//     "DATA CABLE 3 IN 1",
//     "DATA CABLE C TO I",
//   ],

//   BATTERY: [
//     "BATTERY",
//     "MOBILE BATTERY",
//     "PHONE BATTERY",
//   ],

//   SPEAKER: [
//     "SPEAKER",
//     "BLUETOOTH SPEAKER",
//     "PORTABLE SPEAKER",
//   ],
// };

// /* =========================================================
//    CATEGORY HELPERS
// ========================================================= */

// const normalizeCategory = (value) => {
//   return String(value || "")
//     .trim()
//     .replace(/\s+/g, " ")
//     .toUpperCase();
// };

// const getDisplayCategory = (category) => {
//   const normalized = normalizeCategory(category);

//   if (!normalized) return "";

//   for (const [groupName, members] of Object.entries(
//     CATEGORY_GROUPS
//   )) {
//     const normalizedMembers = members.map(normalizeCategory);

//     if (normalizedMembers.includes(normalized)) {
//       return groupName;
//     }
//   }

//   return normalized;
// };

// const isCategoryHidden = (category) => {
//   const normalized = normalizeCategory(category);

//   if (!normalized) return false;

//   return HIDDEN_SUB_CATEGORIES.some((hiddenCategory) => {
//     const hidden = normalizeCategory(hiddenCategory);

//     return (
//       normalized === hidden ||
//       normalized.startsWith(`${hidden} `)
//     );
//   });
// };

// /* =========================================================
//    COMPONENT
// ========================================================= */

// export default function ProductImagesPDF() {
//   const {
//     data: allProducts = [],
//     isLoading,
//   } = useCachedProducts();

//   const [selectedCategories, setSelectedCategories] =
//     useState([]);

//   const [isDownloading, setIsDownloading] =
//     useState(false);

//   const [isPosterDownloading, setIsPosterDownloading] =
//     useState(false);

//   const CLOUDINARY_BASE =
//     "https://res.cloudinary.com/djyr368zj/";

//   /* =======================================================
//      ACTIVE PRODUCTS
//   ======================================================= */

//   const products = useMemo(() => {
//     return allProducts.filter(
//       (product) => product.is_active === true
//     );
//   }, [allProducts]);

//   /* =======================================================
//      VISIBLE PRODUCTS
//   ======================================================= */

//   const visibleProducts = useMemo(() => {
//     return products.filter(
//       (product) =>
//         !isCategoryHidden(product.sub_category)
//     );
//   }, [products]);

//   /* =======================================================
//      CATEGORIES
//   ======================================================= */

//   const categories = useMemo(() => {
//     const categorySet = new Set();

//     visibleProducts.forEach((product) => {
//       const displayCategory = getDisplayCategory(
//         product.sub_category
//       );

//       if (displayCategory) {
//         categorySet.add(displayCategory);
//       }
//     });

//     return Array.from(categorySet).sort((a, b) =>
//       a.localeCompare(b)
//     );
//   }, [visibleProducts]);

//   /* =======================================================
//      CATEGORY COUNTS
//   ======================================================= */

//   const categoryCounts = useMemo(() => {
//     const counts = {};

//     categories.forEach((category) => {
//       counts[category] = visibleProducts.filter(
//         (product) =>
//           normalizeCategory(
//             getDisplayCategory(product.sub_category)
//           ) === normalizeCategory(category)
//       ).length;
//     });

//     return counts;
//   }, [categories, visibleProducts]);

//   /* =======================================================
//      SELECTED PRODUCTS
//   ======================================================= */

//   const selectedProducts = useMemo(() => {
//     if (!selectedCategories.length) return [];

//     const selectedSet = new Set(
//       selectedCategories.map(normalizeCategory)
//     );

//     return visibleProducts.filter((product) =>
//       selectedSet.has(
//         normalizeCategory(
//           getDisplayCategory(product.sub_category)
//         )
//       )
//     );
//   }, [visibleProducts, selectedCategories]);

//   const totalSelectedProducts =
//     selectedProducts.length;

//   /* =======================================================
//      SELECTION HELPERS
//   ======================================================= */

//   const isBusy =
//     isDownloading || isPosterDownloading;

//   const isCategorySelected = (category) => {
//     return selectedCategories.some(
//       (selected) =>
//         normalizeCategory(selected) ===
//         normalizeCategory(category)
//     );
//   };

//   const toggleCategory = (category) => {
//     if (isBusy) return;

//     setSelectedCategories((previous) => {
//       const exists = previous.some(
//         (item) =>
//           normalizeCategory(item) ===
//           normalizeCategory(category)
//       );

//       if (exists) {
//         return previous.filter(
//           (item) =>
//             normalizeCategory(item) !==
//             normalizeCategory(category)
//         );
//       }

//       return [...previous, category];
//     });
//   };

//   const selectAllCategories = () => {
//     if (isBusy) return;
//     setSelectedCategories([...categories]);
//   };

//   const clearAllCategories = () => {
//     if (isBusy) return;
//     setSelectedCategories([]);
//   };

//   /* =======================================================
//      CLOUDINARY
//   ======================================================= */

//   const getCloudinaryUrl = (image) => {
//     if (!image || typeof image !== "string") {
//       return null;
//     }

//     const cleanImage = image.trim();

//     if (!cleanImage) return null;

//     if (
//       cleanImage.startsWith("http://") ||
//       cleanImage.startsWith("https://")
//     ) {
//       return cleanImage;
//     }

//     if (cleanImage.startsWith("image/upload/")) {
//       return `${CLOUDINARY_BASE}${cleanImage}`;
//     }

//     if (cleanImage.startsWith("upload/")) {
//       return `${CLOUDINARY_BASE}image/${cleanImage}`;
//     }

//     return `${CLOUDINARY_BASE}image/upload/${cleanImage}`;
//   };

//   /* =======================================================
//      PRODUCT IMAGE
//   ======================================================= */

//   const getProductImage = (product) => {
//     const image =
//       product.image ||
//       product.image_url ||
//       product.product_image ||
//       product.imageUrl ||
//       null;

//     return getCloudinaryUrl(image);
//   };

//   /* =======================================================
//      POSTER IMAGE
//   ======================================================= */

//   const getPosterImage = (product) => {
//     return getCloudinaryUrl(product?.image2);
//   };

//   /* =======================================================
//      IMAGE -> JPEG
//   ======================================================= */

//   const imageToJPEG = async (
//     url,
//     maxSize = 1200
//   ) => {
//     if (!url) return null;

//     return new Promise((resolve) => {
//       const img = new Image();

//       img.crossOrigin = "anonymous";

//       img.onload = () => {
//         try {
//           const canvas =
//             document.createElement("canvas");

//           let width = img.naturalWidth;
//           let height = img.naturalHeight;

//           if (!width || !height) {
//             resolve(null);
//             return;
//           }

//           if (
//             width > maxSize ||
//             height > maxSize
//           ) {
//             const ratio = Math.min(
//               maxSize / width,
//               maxSize / height
//             );

//             width = Math.round(width * ratio);
//             height = Math.round(height * ratio);
//           }

//           canvas.width = width;
//           canvas.height = height;

//           const ctx = canvas.getContext("2d");

//           if (!ctx) {
//             resolve(null);
//             return;
//           }

//           ctx.fillStyle = "#ffffff";

//           ctx.fillRect(
//             0,
//             0,
//             width,
//             height
//           );

//           ctx.drawImage(
//             img,
//             0,
//             0,
//             width,
//             height
//           );

//           resolve(
//             canvas.toDataURL(
//               "image/jpeg",
//               0.92
//             )
//           );
//         } catch (error) {
//           console.error(
//             "Canvas conversion failed:",
//             url,
//             error
//           );

//           resolve(null);
//         }
//       };

//       img.onerror = (error) => {
//         console.error(
//           "Image loading failed:",
//           url,
//           error
//         );

//         resolve(null);
//       };

//       img.src = url;
//     });
//   };

//   /* =======================================================
//      SAFE FILE NAME
//   ======================================================= */

//   const getSafeFileName = (name) => {
//     return (
//       String(name || "Products")
//         .replace(
//           /[^a-zA-Z0-9-_ ]/g,
//           ""
//         )
//         .replace(/\s+/g, "_")
//         .trim() || "Products"
//     );
//   };

//   const getSelectedCategoryFileName = () => {
//     if (!selectedCategories.length) {
//       return "Products";
//     }

//     if (selectedCategories.length === 1) {
//       return getSafeFileName(
//         selectedCategories[0]
//       );
//     }

//     return `${selectedCategories.length}_Categories`;
//   };

//   /* =======================================================
//      PRODUCT PDF
//   ======================================================= */

//   const downloadPDF = async () => {
//     if (
//       !selectedCategories.length ||
//       !selectedProducts.length
//     ) {
//       return;
//     }

//     setIsDownloading(true);

//     try {
//       const doc = new jsPDF({
//         orientation: "portrait",
//         unit: "mm",
//         format: "a4",
//         compress: true,
//       });

//       const pageWidth =
//         doc.internal.pageSize.getWidth();

//       const pageHeight =
//         doc.internal.pageSize.getHeight();

//       const margin = 12;

//       doc.setFont(
//         "helvetica",
//         "bold"
//       );

//       doc.setFontSize(18);

//       doc.setTextColor(
//         30,
//         41,
//         59
//       );

//       doc.text(
//         "MAKPOWER",
//         margin,
//         18
//       );

//       doc.setFontSize(11);

//       doc.setTextColor(
//         71,
//         85,
//         105
//       );

//       const categoryTitle =
//         selectedCategories.join(" + ");

//       const titleLines =
//         doc.splitTextToSize(
//           `${categoryTitle} - Product Catalogue`,
//           pageWidth - margin * 2
//         );

//       doc.text(
//         titleLines,
//         margin,
//         27
//       );

//       doc.setFont(
//         "helvetica",
//         "normal"
//       );

//       doc.setFontSize(9);

//       doc.text(
//         `Categories: ${selectedCategories.length}`,
//         pageWidth - margin,
//         18,
//         { align: "right" }
//       );

//       doc.text(
//         `Total Products: ${selectedProducts.length}`,
//         pageWidth - margin,
//         24,
//         { align: "right" }
//       );

//       doc.setDrawColor(
//         200,
//         200,
//         200
//       );

//       doc.line(
//         margin,
//         36,
//         pageWidth - margin,
//         36
//       );

//       let y = 46;

//       for (
//         let i = 0;
//         i < selectedProducts.length;
//         i++
//       ) {
//         const product =
//           selectedProducts[i];

//         const image =
//           getProductImage(product);

//         if (
//           y >
//           pageHeight - 65
//         ) {
//           doc.addPage();

//           y = 20;

//           doc.setFont(
//             "helvetica",
//             "bold"
//           );

//           doc.setFontSize(10);

//           doc.setTextColor(
//             71,
//             85,
//             105
//           );

//           doc.text(
//             "MAKPOWER - Product Catalogue",
//             margin,
//             y
//           );

//           y += 14;
//         }

//         const cardX = margin;

//         const cardWidth =
//           pageWidth - margin * 2;

//         const cardHeight = 55;

//         doc.setDrawColor(
//           220,
//           220,
//           220
//         );

//         doc.setFillColor(
//           250,
//           250,
//           250
//         );

//         doc.roundedRect(
//           cardX,
//           y,
//           cardWidth,
//           cardHeight,
//           3,
//           3,
//           "FD"
//         );

//         doc.setFont(
//           "helvetica",
//           "bold"
//         );

//         doc.setFontSize(9);

//         doc.setTextColor(
//           100,
//           100,
//           100
//         );

//         doc.text(
//           `${i + 1}`,
//           cardX + 5,
//           y + 8
//         );

//         if (image) {
//           try {
//             const base64 =
//               await imageToJPEG(
//                 image,
//                 1200
//               );

//             if (base64) {
//               doc.addImage(
//                 base64,
//                 "JPEG",
//                 cardX + 18,
//                 y + 5,
//                 45,
//                 45,
//                 undefined,
//                 "FAST"
//               );
//             }
//           } catch (error) {
//             console.error(
//               "PDF image error:",
//               product.product_name,
//               error
//             );
//           }
//         }

//         const textX =
//           cardX + 70;

//         doc.setFont(
//           "helvetica",
//           "bold"
//         );

//         doc.setFontSize(11);

//         doc.setTextColor(
//           30,
//           41,
//           59
//         );

//         const productName =
//           product.product_name ||
//           "Unnamed Product";

//         const productLines =
//           doc.splitTextToSize(
//             productName,
//             cardWidth - 85
//           );

//         doc.text(
//           productLines,
//           textX,
//           y + 15
//         );

//         doc.setFont(
//           "helvetica",
//           "normal"
//         );

//         doc.setFontSize(9);

//         doc.setTextColor(
//           100,
//           100,
//           100
//         );

//         doc.text(
//           `Price: ${product.price ?? "-"}`,
//           textX,
//           y + 22
//         );

//         doc.text(
//           `Guarantee: ${product.guarantee ?? "-"}`,
//           textX,
//           y + 32
//         );

//         if (product.sub_category) {
//           const categoryLines =
//             doc.splitTextToSize(
//               `Category: ${product.sub_category}`,
//               cardWidth - 85
//             );

//           doc.text(
//             categoryLines,
//             textX,
//             y + 42
//           );
//         }

//         y +=
//           cardHeight + 7;
//       }

//       const pageCount =
//         doc.internal.getNumberOfPages();

//       for (
//         let i = 1;
//         i <= pageCount;
//         i++
//       ) {
//         doc.setPage(i);

//         doc.setFont(
//           "helvetica",
//           "normal"
//         );

//         doc.setFontSize(8);

//         doc.setTextColor(
//           120,
//           120,
//           120
//         );

//         doc.text(
//           "MAKPOWER | Product Catalogue",
//           margin,
//           pageHeight - 8
//         );

//         doc.text(
//           `Page ${i} of ${pageCount}`,
//           pageWidth - margin,
//           pageHeight - 8,
//           { align: "right" }
//         );
//       }

//       const safeName =
//         getSelectedCategoryFileName();

//       doc.save(
//         `${safeName}_Products.pdf`
//       );
//     } catch (error) {
//       console.error(
//         "PDF generation error:",
//         error
//       );

//       alert(
//         "PDF generate nahi ho saka."
//       );
//     } finally {
//       setIsDownloading(false);
//     }
//   };

//   /* =======================================================
//      POSTER PDF
//   ======================================================= */

//   const downloadAllPosters = async () => {
//     if (
//       !selectedCategories.length ||
//       !selectedProducts.length
//     ) {
//       return;
//     }

//     setIsPosterDownloading(true);

//     try {
//       const doc = new jsPDF({
//         orientation: "portrait",
//         unit: "mm",
//         format: "a4",
//         compress: true,
//       });

//       const pageWidth =
//         doc.internal.pageSize.getWidth();

//       const pageHeight =
//         doc.internal.pageSize.getHeight();

//       let addedPages = 0;

//       for (
//         let i = 0;
//         i < selectedProducts.length;
//         i++
//       ) {
//         const product =
//           selectedProducts[i];

//         const image =
//           getPosterImage(product);

//         if (!image) {
//           console.warn(
//             "Poster image2 not available:",
//             product?.product_name
//           );

//           continue;
//         }

//         const base64 =
//           await imageToJPEG(
//             image,
//             2200
//           );

//         if (!base64) {
//           console.warn(
//             "Poster could not be converted:",
//             product?.product_name
//           );

//           continue;
//         }

//         const imgProps =
//           doc.getImageProperties(
//             base64
//           );

//         const imgWidth =
//           imgProps.width;

//         const imgHeight =
//           imgProps.height;

//         if (
//           !imgWidth ||
//           !imgHeight
//         ) {
//           continue;
//         }

//         if (addedPages > 0) {
//           doc.addPage();
//         }

//         const imgRatio =
//           imgWidth / imgHeight;

//         const pageRatio =
//           pageWidth / pageHeight;

//         let renderWidth;
//         let renderHeight;
//         let x;
//         let y;

//         if (
//           imgRatio > pageRatio
//         ) {
//           renderHeight =
//             pageHeight;

//           renderWidth =
//             renderHeight *
//             imgRatio;

//           x =
//             (pageWidth -
//               renderWidth) / 2;

//           y = 0;
//         } else {
//           renderWidth =
//             pageWidth;

//           renderHeight =
//             renderWidth /
//             imgRatio;

//           x = 0;

//           y =
//             (pageHeight -
//               renderHeight) / 2;
//         }

//         doc.addImage(
//           base64,
//           "JPEG",
//           x,
//           y,
//           renderWidth,
//           renderHeight,
//           undefined,
//           "FAST"
//         );

//         addedPages++;
//       }

//       if (addedPages === 0) {
//         alert(
//           "Selected categories mein kisi bhi product ka valid Image 2 / Poster nahi mila."
//         );

//         return;
//       }

//       const safeName =
//         getSelectedCategoryFileName();

//       doc.save(
//         `${safeName}_Posters.pdf`
//       );
//     } catch (error) {
//       console.error(
//         "All Poster PDF error:",
//         error
//       );

//       alert(
//         "Poster PDF generate nahi ho saka."
//       );
//     } finally {
//       setIsPosterDownloading(false);
//     }
//   };

//   /* =======================================================
//      LOADING
//   ======================================================= */

//   if (isLoading) {
//     return (
//       <div className="min-h-full bg-slate-50">
//         <MobilePageHeader
//           title="Product Image PDF"
//         />

//         <div className="flex min-h-[70vh] items-center justify-center">
//           <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-medium text-slate-500 shadow-sm">
//             <FaSpinner className="animate-spin text-blue-600" />
//             Loading products...
//           </div>
//         </div>
//       </div>
//     );
//   }

//   /* =======================================================
//      MAIN UI
//   ======================================================= */

//   return (
//     <div className="min-h-full bg-[#f6f8fc] pb-28 sm:pb-24">
//       <MobilePageHeader
//         title="Product Image PDF"
//       />

//       <div className="mx-auto w-full max-w-[1500px] px-3 pt-16 sm:px-5 sm:pt-5 lg:px-6">
//         {/* =================================================
//             TOP CONTROL BAR
//         ================================================= */}

//         <div className="animate-[fadeIn_.25s_ease-out] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
//           <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
//             {/* LEFT */}

//             <div className="flex min-w-0 items-center gap-3">
//               <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_6px_14px_rgba(37,99,235,0.22)]">
//                 <FaImages size={15} />
//               </div>

//               <div className="min-w-0">
//                 <div className="flex items-center gap-2">
//                   <h1 className="truncate text-sm font-bold text-slate-800 sm:text-base">
//                     Product Catalogue
//                   </h1>

//                   <span className="hidden rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 sm:inline">
//                     PDF
//                   </span>
//                 </div>

//                 <p className="mt-0.5 text-[10px] text-slate-400 sm:text-[11px]">
//                   Select categories to generate product posters
//                 </p>
//               </div>
//             </div>

//             {/* RIGHT STATS */}

//             <div className="flex items-center gap-1.5 sm:gap-2">
//               <div className="flex min-w-[72px] items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2">
//                 <FaLayerGroup className="text-[11px] text-slate-400" />

//                 <div>
//                   <p className="text-[8px] uppercase tracking-wide text-slate-400">
//                     Categories
//                   </p>

//                   <p className="text-xs font-bold text-slate-700">
//                     {categories.length}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex min-w-[72px] items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/60 px-2.5 py-2">
//                 <FaBoxOpen className="text-[11px] text-blue-500" />

//                 <div>
//                   <p className="text-[8px] uppercase tracking-wide text-blue-400">
//                     Selected
//                   </p>

//                   <p className="text-xs font-bold text-blue-700">
//                     {totalSelectedProducts}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* =================================================
//               ACTION STRIP
//           ================================================= */}

//           <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-3 py-2">
//             <div className="flex min-w-0 items-center gap-2">
//               <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
//                 Selection
//               </span>

//               <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold text-white">
//                 {selectedCategories.length}
//               </span>

//               {selectedCategories.length > 0 && (
//                 <span className="truncate text-[9px] text-slate-400">
//                   {selectedCategories.join(" • ")}
//                 </span>
//               )}
//             </div>

//             <div className="flex shrink-0 items-center gap-1.5">
//               <button
//                 type="button"
//                 onClick={selectAllCategories}
//                 disabled={
//                   !categories.length || isBusy
//                 }
//                 className="group flex items-center gap-1.5 rounded-lg border border-blue-100 bg-white px-2.5 py-1.5 text-[9px] font-bold text-blue-600 transition-all duration-200 hover:-translate-y-px hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
//               >
//                 <FaCheckSquare className="transition-transform duration-200 group-hover:scale-110" />
//                 Select All
//               </button>

//               {selectedCategories.length > 0 && (
//                 <button
//                   type="button"
//                   onClick={clearAllCategories}
//                   disabled={isBusy}
//                   className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[9px] font-bold text-slate-500 transition-all duration-200 hover:-translate-y-px hover:border-red-100 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
//                 >
//                   <FaTimes />
//                   Clear
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* =================================================
//             SELECTED CATEGORY CHIPS
//         ================================================= */}

//         {selectedCategories.length > 0 && (
//           <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
//             {selectedCategories.map((category) => (
//               <button
//                 key={category}
//                 type="button"
//                 disabled={isBusy}
//                 onClick={() =>
//                   toggleCategory(category)
//                 }
//                 className="group flex shrink-0 animate-[chipIn_.2s_ease-out] items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-[9px] font-bold text-blue-700 transition-all duration-200 hover:border-blue-200 hover:bg-blue-100 disabled:opacity-60"
//               >
//                 <FaCheckCircle className="text-[9px] text-blue-500" />

//                 <span>
//                   {category}
//                 </span>

//                 <FaTimes className="text-[8px] text-blue-400 transition-transform duration-200 group-hover:rotate-90" />
//               </button>
//             ))}
//           </div>
//         )}

//         {/* =================================================
//             CATEGORY WORKSPACE
//         ================================================= */}

//         <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
//           {/* HEADER */}

//           <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
//             <div className="flex items-center gap-2">
//               <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
//                 <FaBoxOpen size={12} />
//               </div>

//               <div>
//                 <p className="text-[11px] font-bold text-slate-700">
//                   Categories
//                 </p>

//                 <p className="text-[9px] text-slate-400">
//                   Tap a category to include its products
//                 </p>
//               </div>
//             </div>

//             <div className="hidden items-center gap-1.5 sm:flex">
//               <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />

//               <span className="text-[9px] font-medium text-slate-400">
//                 {categories.length} available
//               </span>
//             </div>
//           </div>

//           {/* CATEGORY LIST */}

//           {categories.length > 0 ? (
//             <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
//               {categories.map(
//                 (category, index) => {
//                   const selected =
//                     isCategorySelected(
//                       category
//                     );

//                   const count =
//                     categoryCounts[
//                       category
//                     ] || 0;

//                   return (
//                     <button
//                       key={category}
//                       type="button"
//                       disabled={isBusy}
//                       onClick={() =>
//                         toggleCategory(
//                           category
//                         )
//                       }
//                       style={{
//                         animationDelay: `${Math.min(
//                           index * 18,
//                           180
//                         )}ms`,
//                       }}
//                       className={`
//                         group relative flex min-h-[66px] items-center gap-2.5
//                         bg-white px-3 py-2.5 text-left
//                         transition-all duration-200
//                         animate-[itemIn_.3s_ease-out_both]
//                         hover:z-10
//                         hover:-translate-y-[1px]
//                         hover:shadow-[0_5px_16px_rgba(15,23,42,0.08)]
//                         active:scale-[0.985]
//                         disabled:cursor-not-allowed
//                         disabled:opacity-60

//                         ${
//                           selected
//                             ? "bg-blue-50/80"
//                             : "hover:bg-slate-50"
//                         }
//                       `}
//                     >
//                       {/* ACTIVE INDICATOR */}

//                       <span
//                         className={`
//                           absolute left-0 top-0 h-full w-[3px]
//                           origin-left rounded-r-full
//                           transition-all duration-300
//                           ${
//                             selected
//                               ? "scale-y-100 bg-blue-600"
//                               : "scale-y-0 bg-transparent"
//                           }
//                         `}
//                       />

//                       {/* ICON */}

//                       <span
//                         className={`
//                           flex h-8 w-8 shrink-0 items-center justify-center
//                           rounded-lg border
//                           transition-all duration-200
//                           ${
//                             selected
//                               ? "border-blue-100 bg-blue-600 text-white shadow-[0_4px_10px_rgba(37,99,235,0.2)]"
//                               : "border-slate-100 bg-slate-50 text-slate-400 group-hover:border-blue-100 group-hover:bg-blue-50 group-hover:text-blue-500"
//                           }
//                         `}
//                       >
//                         {selected ? (
//                           <FaCheckCircle
//                             size={12}
//                             className="animate-[pop_.2s_ease-out]"
//                           />
//                         ) : (
//                           <FaLayerGroup
//                             size={11}
//                           />
//                         )}
//                       </span>

//                       {/* NAME */}

//                       <span className="min-w-0 flex-1">
//                         <span
//                           className={`
//                             block truncate text-[10px] font-bold
//                             transition-colors duration-200 sm:text-[11px]
//                             ${
//                               selected
//                                 ? "text-blue-700"
//                                 : "text-slate-700 group-hover:text-blue-700"
//                             }
//                           `}
//                         >
//                           {category}
//                         </span>

//                         <span
//                           className={`
//                             mt-0.5 block text-[8px] font-medium
//                             transition-colors duration-200
//                             ${
//                               selected
//                                 ? "text-blue-400"
//                                 : "text-slate-400"
//                             }
//                           `}
//                         >
//                           {count} products
//                         </span>
//                       </span>

//                       {/* ARROW */}

//                       <FaChevronRight
//                         className={`
//                           shrink-0 text-[8px]
//                           transition-all duration-200
//                           ${
//                             selected
//                               ? "translate-x-0 text-blue-400"
//                               : "-translate-x-1 text-slate-300 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
//                           }
//                         `}
//                       />
//                     </button>
//                   );
//                 }
//               )}
//             </div>
//           ) : (
//             <div className="flex min-h-[220px] flex-col items-center justify-center px-4 text-center">
//               <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
//                 <FaBoxOpen size={17} />
//               </div>

//               <p className="text-xs font-bold text-slate-600">
//                 No categories found
//               </p>

//               <p className="mt-1 text-[9px] text-slate-400">
//                 Active product categories will appear here.
//               </p>
//             </div>
//           )}

//           {/* =================================================
//               SELECTED PRODUCTS SUMMARY
//           ================================================= */}

//           <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/60 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
//             <div className="flex items-center gap-2">
//               <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-500">
//                 <FaImages size={10} />
//               </div>

//               <div>
//                 <p className="text-[9px] font-bold text-slate-600">
//                   Ready for export
//                 </p>

//                 <p className="text-[8px] text-slate-400">
//                   {selectedCategories.length} categories
//                   {" • "}
//                   {totalSelectedProducts} products
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-1.5">
//               {selectedCategories.length > 0 && (
//                 <span className="rounded-md bg-blue-100 px-2 py-1 text-[8px] font-bold text-blue-600">
//                   Selection active
//                 </span>
//               )}

//               {selectedCategories.length === 0 && (
//                 <span className="rounded-md bg-slate-100 px-2 py-1 text-[8px] font-medium text-slate-400">
//                   Select category
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* =====================================================
//           STICKY EXPORT BAR
//       ===================================================== */}

//       <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/95 shadow-[0_-8px_25px_rgba(15,23,42,0.08)] backdrop-blur-xl md:bottom-0">
//         <div className="mx-auto flex w-full max-w-[1500px] items-center gap-2 px-3 py-2.5 sm:px-5 lg:px-6">
//           {/* DESKTOP SUMMARY */}

//           <div className="hidden min-w-0 flex-1 items-center gap-3 sm:flex">
//             <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
//               <FaImages size={13} />
//             </div>

//             <div className="min-w-0">
//               <p className="text-[10px] font-bold text-slate-700">
//                 Export Selection
//               </p>

//               <p className="truncate text-[9px] text-slate-400">
//                 {selectedCategories.length} categories
//                 {" • "}
//                 {totalSelectedProducts} products
//               </p>
//             </div>
//           </div>

//           {/* MOBILE SUMMARY */}

//           <div className="flex min-w-[65px] flex-col items-center sm:hidden">
//             <span className="text-sm font-extrabold leading-none text-slate-800">
//               {totalSelectedProducts}
//             </span>

//             <span className="mt-0.5 text-[8px] font-medium text-slate-400">
//               products
//             </span>
//           </div>

//           {/* PRODUCT PDF */}

//           {/* Keep disabled/commented exactly as current workflow */}
//           {/*
//           <button
//             type="button"
//             onClick={downloadPDF}
//             disabled={
//               isBusy ||
//               selectedProducts.length === 0
//             }
//             className="..."
//           >
//             Product PDF
//           </button>
//           */}

//           {/* POSTER PDF */}

//           <button
//             type="button"
//             onClick={downloadAllPosters}
//             disabled={
//               isBusy ||
//               selectedProducts.length === 0
//             }
//             className="
//               group flex min-w-0 flex-1 items-center justify-center
//               gap-2 rounded-xl
//               bg-gradient-to-r from-indigo-600 to-violet-600
//               px-3 py-2.5
//               text-[10px] font-bold text-white
//               shadow-[0_6px_16px_rgba(79,70,229,0.22)]
//               transition-all duration-200
//               hover:-translate-y-[1px]
//               hover:shadow-[0_9px_22px_rgba(79,70,229,0.28)]
//               active:scale-[0.985]
//               disabled:cursor-not-allowed
//               disabled:opacity-40
//               sm:flex-none sm:min-w-[185px]
//               sm:px-5 sm:py-2.5
//               sm:text-xs
//             "
//           >
//             {isPosterDownloading ? (
//               <>
//                 <FaSpinner className="animate-spin" />
//                 <span>Creating Poster PDF...</span>
//               </>
//             ) : (
//               <>
//                 <FaFileImage className="transition-transform duration-200 group-hover:scale-110" />
//                 <span>Poster PDF</span>
//               </>
//             )}
//           </button>
//         </div>
//       </div>

//       {/* =====================================================
//           SMALL ANIMATION KEYFRAMES
//       ===================================================== */}

//       <style>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(4px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         @keyframes itemIn {
//           from {
//             opacity: 0;
//             transform: translateY(5px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         @keyframes chipIn {
//           from {
//             opacity: 0;
//             transform: scale(.94) translateY(2px);
//           }
//           to {
//             opacity: 1;
//             transform: scale(1) translateY(0);
//           }
//         }

//         @keyframes pop {
//           from {
//             opacity: 0;
//             transform: scale(.5);
//           }
//           to {
//             opacity: 1;
//             transform: scale(1);
//           }
//         }
//       `}</style>
//     </div>
//   );
// }