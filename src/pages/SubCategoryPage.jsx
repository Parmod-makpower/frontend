// // 📁 src/pages/SubCategoryPage.jsx
// import { useParams, useNavigate } from "react-router-dom";
// import categories from "../data/categoryData";
// import MobilePageHeader from "../components/MobilePageHeader";
// import { useCachedProducts } from "../hooks/useCachedProducts";

// export default function SubCategoryPage() {
//   const { category } = useParams();
//   const navigate = useNavigate();

//   const { data: products = [] } = useCachedProducts();

//   const mainCategory = categories.find(
//     (c) => c.keyword === decodeURIComponent(category)
//   );

//   if (!mainCategory || !mainCategory.subcategories?.length) {
//     return <div>No Subcategories Found</div>;
//   }

//   // ✅ 🔥 Perfect Mapping (IMPORTANT)
//   const subCategoryProductMap = {
//     "Bodyguard": 10001,
//     "Super X": 10002,
//     "UV Glass": 10003,
//     "Meibo Glass": 10004,
//     "Soldier": 10005,
//     "New Soldier": 10007,
//   };

//   // ✅ Get product by subcategory
//   const getProductForSub = (subLabel) => {
//     const productId = subCategoryProductMap[subLabel];
//     if (!productId) return null;

//     return products.find(
//       (p) => Number(p.product_id) === Number(productId)
//     );
//   };

//   const handleSubCategoryClick = (sub) => {
//     const keyword = sub.keyword.toUpperCase();

//     if (keyword.includes("BATTERY") || keyword.includes("POLYMER")) {
//       navigate(`/batteries/${encodeURIComponent(sub.keyword)}`);
//     } else if (keyword.includes("TEMPERED")) {
//       navigate(`/tempered/${encodeURIComponent(sub.keyword)}`);
//     } else {
//       navigate(`/category/${encodeURIComponent(sub.keyword)}`);
//     }
//   };

//   return (
//     <div className="p-4 pb-20">
//       <MobilePageHeader title={mainCategory.label} />

//       <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:pt-0 pt-[60px]">
//         {mainCategory.subcategories.map((sub) => {
//           const product = getProductForSub(sub.label);

//           return (
//             <div
//               key={sub.label}
//               onClick={() => handleSubCategoryClick(sub)}
//               className="cursor-pointer flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 shadow"
//             >
//               <img
//                 src={sub.image}
//                 alt={sub.label}
//                 className="w-20 h-20 object-cover rounded-lg"
//               />

//               <span className="text-center mt-2 text-sm">
//                 {sub.label}
//               </span>

//               {/* ✅ 🔥 Exact price mapping */}
//               {product && (
//                 <div className="text-xs text-gray-600 mt-1">
//                   ₹ {product.price}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
// 📁 src/pages/SubCategoryPage.jsx

import { useParams, useNavigate } from "react-router-dom";
import categories from "../data/categoryData";
import MobilePageHeader from "../components/MobilePageHeader";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { FaChevronRight, FaBoxOpen } from "react-icons/fa";
import makpower_image from "../assets/images/makpower_image.webp";

export default function SubCategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();

  const { data: products = [], isLoading } = useCachedProducts();

  const decodedCategory = decodeURIComponent(category || "");

  // =========================================================
  // FIND MAIN CATEGORY
  // =========================================================

  const mainCategory = categories.find(
    (c) =>
      String(c.keyword || "").toLowerCase() ===
      decodedCategory.toLowerCase()
  );

  // =========================================================
  // NO CATEGORY
  // =========================================================

  if (!mainCategory || !mainCategory.subcategories?.length) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        No Subcategories Found
      </div>
    );
  }

  // =========================================================
  // EXISTING PRODUCT MAPPING
  // DO NOT CHANGE
  // =========================================================

  const subCategoryProductMap = {
    Bodyguard: 10001,
    "Super X": 10002,
    "UV Glass": 10003,
    "Meibo Glass": 10004,
    Soldier: 10005,
    "New Soldier": 10007,
  };

  // =========================================================
  // EXISTING FUNCTION
  // =========================================================

  const getProductForSub = (subLabel) => {
    const productId = subCategoryProductMap[subLabel];

    if (!productId) return null;

    return products.find(
      (p) => Number(p.product_id) === Number(productId)
    );
  };

  // =========================================================
  // NORMALIZE TEXT
  //
  // Example:
  //
  // "PARTY BOY"       → "partyboy"
  // "Party Boy PCB"   → "partyboypcb"
  // "SP 370"          → "sp370"
  // "SP370 PCB"       → "sp370pcb"
  //
  // This makes matching much more reliable.
  // =========================================================

  const normalizeText = (value) => {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "");
  };

  // =========================================================
  // GET SPARE PART PRODUCTS
  //
  // IMPORTANT:
  // We DO NOT depend on sub_category/product_type.
  //
  // We directly search product_name.
  // =========================================================

  const getSparePartProducts = (keyword) => {
    const normalizedKeyword = normalizeText(keyword);

    if (!normalizedKeyword) {
      return [];
    }

    return products
      .filter((product) => {
        // Only active products
        if (product.is_active !== true) {
          return false;
        }

        const productName = normalizeText(
          product.product_name
        );

        if (!productName) {
          return false;
        }

        return productName.includes(normalizedKeyword);
      })
      .sort((a, b) => {
        const aName = normalizeText(a.product_name);
        const bName = normalizeText(b.product_name);

        // =====================================================
        // Prefer product whose name starts with keyword
        // =====================================================

        const aStarts = aName.startsWith(normalizedKeyword);
        const bStarts = bName.startsWith(normalizedKeyword);

        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        return 0;
      });
  };

  // =========================================================
  // GET BEST SPARE PART PRODUCT
  //
  // First matching product with image gets preference.
  // =========================================================

  const getSparePartProduct = (keyword) => {
    const matchingProducts =
      getSparePartProducts(keyword);

    if (!matchingProducts.length) {
      return null;
    }

    // Prefer product which has image
    const productWithImage =
      matchingProducts.find(
        (product) => product?.image
      );

    return productWithImage || matchingProducts[0];
  };

  // =========================================================
  // GET DYNAMIC SPARE PART IMAGE
  // =========================================================

  const getSparePartImage = (keyword) => {
    const product =
      getSparePartProduct(keyword);

    // No matching product
    if (!product) {
      return makpower_image;
    }

    const image = String(
      product.image || ""
    ).trim();

    // No image
    if (!image) {
      return makpower_image;
    }

    // =======================================================
    // If backend already returns complete URL
    // =======================================================

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    // =======================================================
    // Existing Cloudinary structure
    // Same as ProductCard
    // =======================================================

    return `https://res.cloudinary.com/djyr368zj/${image}?f_auto,q_auto,w_400`;
  };

  // =========================================================
  // GET SPARE PART COUNT
  // =========================================================

  const getSparePartsCount = (keyword) => {
    if (mainCategory.type !== "spare-parts") {
      return 0;
    }

    return getSparePartProducts(keyword).length;
  };

  // =========================================================
  // CLICK HANDLER
  // =========================================================

  const handleSubCategoryClick = (sub) => {
    const keyword = String(
      sub.keyword || ""
    ).toUpperCase();

    // =======================================================
    // 🔧 SPARE PARTS
    // =======================================================

    if (mainCategory.type === "spare-parts") {
      navigate(
        `/spare-parts/${encodeURIComponent(
          sub.keyword
        )}`
      );

      return;
    }

    // =======================================================
    // BATTERY / POLYMER
    // =======================================================

    if (
      keyword.includes("BATTERY") ||
      keyword.includes("POLYMER")
    ) {
      navigate(
        `/batteries/${encodeURIComponent(
          sub.keyword
        )}`
      );

      return;
    }

    // =======================================================
    // TEMPERED
    // =======================================================

    if (keyword.includes("TEMPERED")) {
      navigate(
        `/tempered/${encodeURIComponent(
          sub.keyword
        )}`
      );

      return;
    }

    // =======================================================
    // NORMAL CATEGORY
    // =======================================================

    navigate(
      `/category/${encodeURIComponent(
        sub.keyword
      )}`
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50 px-3 sm:px-4 pb-20">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <MobilePageHeader
        title={mainCategory.label}
      />

      <div className="pt-[60px] sm:pt-0 mx-auto">

        {/* ===================================================
            LOADING
        =================================================== */}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-xs text-gray-500">
              Loading...
            </p>
          </div>
        ) : (

          /* =================================================
             CATEGORY GRID
          ================================================= */

          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-6
              xl:grid-cols-7
              gap-2
              sm:gap-3
            "
          >

            {mainCategory.subcategories.map(
              (sub) => {

                // =================================================
                // SPARE PARTS ONLY
                // =================================================

                const isSpareParts =
                  mainCategory.type ===
                  "spare-parts";

                // Dynamic product
                const sparePartProduct =
                  isSpareParts
                    ? getSparePartProduct(
                        sub.keyword
                      )
                    : null;

                // Dynamic image
                const sparePartImage =
                  isSpareParts
                    ? getSparePartImage(
                        sub.keyword
                      )
                    : null;

                // Count
                const productCount =
                  isSpareParts
                    ? getSparePartsCount(
                        sub.keyword
                      )
                    : 0;

                // =================================================
                // NON-SPARE EXISTING IMAGE
                // =================================================

                const cardImage =
                  isSpareParts
                    ? sparePartImage
                    : sub.image;

                return (
                  <div
                    key={sub.label}
                    onClick={() =>
                      handleSubCategoryClick(
                        sub
                      )
                    }
                    className="
                      group
                      bg-white
                      border
                      border-gray-200
                      rounded-lg
                      overflow-hidden
                      cursor-pointer
                      transition-all
                      duration-200
                      hover:border-blue-300
                      hover:shadow-md
                      active:scale-[0.98]
                    "
                  >

                    {/* =========================================
                        IMAGE
                    ========================================= */}

                    <div
                      className="
                        w-full
                        aspect-square
                        bg-gray-50
                        flex
                        items-center
                        justify-center
                        overflow-hidden
                      "
                    >

                      <img
                        src={cardImage}
                        alt={sub.label}
                        loading="lazy"
                        className="
                          w-full
                          h-full
                          object-contain
                          p-3
                          transition-transform
                          duration-200
                          group-hover:scale-105
                        "
                        onError={(e) => {

                          // =================================================
                          // Spare Parts → fallback
                          // =================================================

                          if (isSpareParts) {
                            e.currentTarget.onerror =
                              null;

                            e.currentTarget.src =
                              makpower_image;
                          }

                          // =================================================
                          // Other categories:
                          // keep existing image behavior
                          // =================================================
                        }}
                      />

                    </div>

                    {/* =========================================
                        DETAILS
                    ========================================= */}

                    <div
                      className="
                        px-2.5
                        py-2
                        border-t
                        border-gray-100
                      "
                    >

                      {/* =======================================
                          TITLE
                      ======================================= */}

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-1
                        "
                      >

                        <h2
                          className="
                            text-[11px]
                            sm:text-xs
                            font-semibold
                            text-gray-800
                            truncate
                          "
                        >
                          {sub.label}
                        </h2>

                        <FaChevronRight
                          className="
                            text-[9px]
                            text-gray-400
                            flex-shrink-0
                          "
                        />

                      </div>

                      {/* =======================================
                          SPARE PART INFO
                      ======================================= */}

                      {isSpareParts && (
                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            gap-1
                            mt-1
                          "
                        >

                          <div
                            className="
                              flex
                              items-center
                              gap-1
                              min-w-0
                            "
                          >

                            <FaBoxOpen
                              className="
                                text-[9px]
                                text-gray-400
                                flex-shrink-0
                              "
                            />

                            <span
                              className="
                                text-[9px]
                                text-gray-500
                                truncate
                              "
                            >
                              {productCount}{" "}
                              {productCount === 1
                                ? "part"
                                : "parts"}
                            </span>

                          </div>

                          {/* =================================
                              FIRST PRODUCT PRICE
                          ================================= */}

                         

                        </div>
                      )}

                      {/* =======================================
                          EXISTING CATEGORY PRICE
                          ONLY NON-SPARE
                      ======================================= */}

                      {!isSpareParts &&
                        (() => {
                          const product =
                            getProductForSub(
                              sub.label
                            );

                          return product ? (
                            <div
                              className="
                                text-[10px]
                                text-gray-500
                                mt-1
                              "
                            >
                              ₹ {product.price}
                            </div>
                          ) : null;
                        })()}

                    </div>
                  </div>
                );
              }
            )}

          </div>
        )}
      </div>
    </div>
  );
}