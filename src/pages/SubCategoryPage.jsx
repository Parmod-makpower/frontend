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

// import { useParams, useNavigate } from "react-router-dom";
// import categories from "../data/categoryData";
// import MobilePageHeader from "../components/MobilePageHeader";
// import { useCachedProducts } from "../hooks/useCachedProducts";
// import { FaChevronRight, FaBoxOpen } from "react-icons/fa";
// import makpower_image from "../assets/images/makpower_image.webp";

// export default function SubCategoryPage() {
//   const { category } = useParams();
//   const navigate = useNavigate();

//   const { data: products = [], isLoading } = useCachedProducts();

//   const decodedCategory = decodeURIComponent(category || "");

//   // =========================================================
//   // FIND MAIN CATEGORY
//   // =========================================================

//   const mainCategory = categories.find(
//     (c) =>
//       String(c.keyword || "").toLowerCase() ===
//       decodedCategory.toLowerCase()
//   );

//   // =========================================================
//   // NO CATEGORY
//   // =========================================================

//   if (!mainCategory || !mainCategory.subcategories?.length) {
//     return (
//       <div className="p-4 text-center text-sm text-gray-500">
//         No Subcategories Found
//       </div>
//     );
//   }

//   // =========================================================
//   // EXISTING PRODUCT MAPPING
//   // DO NOT CHANGE
//   // =========================================================

//   const subCategoryProductMap = {
//     Bodyguard: 10001,
//     "Super X": 10002,
//     "UV Glass": 10003,
//     "Meibo Glass": 10004,
//     Soldier: 10005,
//     "New Soldier": 10007,
//   };

//   // =========================================================
//   // EXISTING FUNCTION
//   // =========================================================

//   const getProductForSub = (subLabel) => {
//     const productId = subCategoryProductMap[subLabel];

//     if (!productId) return null;

//     return products.find(
//       (p) => Number(p.product_id) === Number(productId)
//     );
//   };

//   // =========================================================
//   // NORMALIZE TEXT
//   //
//   // Example:
//   //
//   // "PARTY BOY"       → "partyboy"
//   // "Party Boy PCB"   → "partyboypcb"
//   // "SP 370"          → "sp370"
//   // "SP370 PCB"       → "sp370pcb"
//   //
//   // This makes matching much more reliable.
//   // =========================================================

//   const normalizeText = (value) => {
//     return String(value || "")
//       .toLowerCase()
//       .trim()
//       .replace(/[^a-z0-9]/g, "");
//   };

//   // =========================================================
//   // GET SPARE PART PRODUCTS
//   //
//   // IMPORTANT:
//   // We DO NOT depend on sub_category/product_type.
//   //
//   // We directly search product_name.
//   // =========================================================

//   // const getSparePartProducts = (keyword) => {
//   //   const normalizedKeyword = normalizeText(keyword);

//   //   if (!normalizedKeyword) {
//   //     return [];
//   //   }

//   //   return products
//   //     .filter((product) => {
//   //       // Only active products
//   //       if (product.is_active !== true) {
//   //         return false;
//   //       }

//   //       const productName = normalizeText(
//   //         product.product_name
//   //       );

//   //       if (!productName) {
//   //         return false;
//   //       }

//   //       return productName.includes(normalizedKeyword);
//   //     })
//   //     .sort((a, b) => {
//   //       const aName = normalizeText(a.product_name);
//   //       const bName = normalizeText(b.product_name);

//   //       // =====================================================
//   //       // Prefer product whose name starts with keyword
//   //       // =====================================================

//   //       const aStarts = aName.startsWith(normalizedKeyword);
//   //       const bStarts = bName.startsWith(normalizedKeyword);

//   //       if (aStarts && !bStarts) return -1;
//   //       if (!aStarts && bStarts) return 1;

//   //       return 0;
//   //     });
//   // };

//   const getSparePartProducts = (keyword) => {
//   const normalizedKeyword = normalizeText(keyword);

//   if (!normalizedKeyword) return [];

//   return products
//     .filter((product) => {
//       if (product.is_active !== true) return false;

//       const productName = normalizeText(product.product_name);

//       if (!productName) return false;

//       if (!productName.includes(normalizedKeyword)) {
//         return false;
//       }

//       // SP15 ko SP151 / SP152 se alag rakho
//       if (normalizedKeyword.startsWith("sp")) {
//         const index = productName.indexOf(normalizedKeyword);
//         const nextCharacter =
//           productName[index + normalizedKeyword.length];

//         // agar next character number hai,
//         // matlab longer model hai: SP151, SP152 etc.
//         if (/\d/.test(nextCharacter || "")) {
//           return false;
//         }
//       }

//       return true;
//     })
//     .sort((a, b) => {
//       const aName = normalizeText(a.product_name);
//       const bName = normalizeText(b.product_name);

//       const aStarts = aName.startsWith(normalizedKeyword);
//       const bStarts = bName.startsWith(normalizedKeyword);

//       if (aStarts && !bStarts) return -1;
//       if (!aStarts && bStarts) return 1;

//       return 0;
//     });
// };
//   // =========================================================
//   // GET BEST SPARE PART PRODUCT
//   //
//   // First matching product with image gets preference.
//   // =========================================================

//   const getSparePartProduct = (keyword) => {
//     const matchingProducts =
//       getSparePartProducts(keyword);

//     if (!matchingProducts.length) {
//       return null;
//     }

//     // Prefer product which has image
//     const productWithImage =
//       matchingProducts.find(
//         (product) => product?.image
//       );

//     return productWithImage || matchingProducts[0];
//   };

//   // =========================================================
//   // GET DYNAMIC SPARE PART IMAGE
//   // =========================================================

//   const getSparePartImage = (keyword) => {
//     const product =
//       getSparePartProduct(keyword);

//     // No matching product
//     if (!product) {
//       return makpower_image;
//     }

//     const image = String(
//       product.image || ""
//     ).trim();

//     // No image
//     if (!image) {
//       return makpower_image;
//     }

//     // =======================================================
//     // If backend already returns complete URL
//     // =======================================================

//     if (
//       image.startsWith("http://") ||
//       image.startsWith("https://")
//     ) {
//       return image;
//     }

//     // =======================================================
//     // Existing Cloudinary structure
//     // Same as ProductCard
//     // =======================================================

//     return `https://res.cloudinary.com/djyr368zj/${image}?f_auto,q_auto,w_400`;
//   };

//   // =========================================================
//   // GET SPARE PART COUNT
//   // =========================================================

//   const getSparePartsCount = (keyword) => {
//     if (mainCategory.type !== "spare-parts") {
//       return 0;
//     }

//     return getSparePartProducts(keyword).length;
//   };

//   // =========================================================
//   // CLICK HANDLER
//   // =========================================================

//   const handleSubCategoryClick = (sub) => {
//     const keyword = String(
//       sub.keyword || ""
//     ).toUpperCase();

//     // =======================================================
//     // 🔧 SPARE PARTS
//     // =======================================================

//     if (mainCategory.type === "spare-parts") {
//       navigate(
//         `/spare-parts/${encodeURIComponent(
//           sub.keyword
//         )}`
//       );

//       return;
//     }

//     // =======================================================
//     // BATTERY / POLYMER
//     // =======================================================

//     if (
//       keyword.includes("BATTERY") ||
//       keyword.includes("POLYMER")
//     ) {
//       navigate(
//         `/batteries/${encodeURIComponent(
//           sub.keyword
//         )}`
//       );

//       return;
//     }

//     // =======================================================
//     // TEMPERED
//     // =======================================================

//     if (keyword.includes("TEMPERED")) {
//       navigate(
//         `/tempered/${encodeURIComponent(
//           sub.keyword
//         )}`
//       );

//       return;
//     }

//     // =======================================================
//     // NORMAL CATEGORY
//     // =======================================================

//     navigate(
//       `/category/${encodeURIComponent(
//         sub.keyword
//       )}`
//     );
//   };

//   // =========================================================
//   // UI
//   // =========================================================

//   return (
//     <div className="min-h-screen bg-gray-50 px-3 sm:px-4 pb-20">

//       {/* =====================================================
//           HEADER
//       ===================================================== */}

//       <MobilePageHeader
//         title={mainCategory.label}
//       />

//       <div className="pt-[60px] sm:pt-0 mx-auto">

//         {/* ===================================================
//             LOADING
//         =================================================== */}

//         {isLoading ? (
//           <div className="flex items-center justify-center py-16">
//             <p className="text-xs text-gray-500">
//               Loading...
//             </p>
//           </div>
//         ) : (

//           /* =================================================
//              CATEGORY GRID
//           ================================================= */

//           <div
//             className="
//               grid
//               grid-cols-2
//               sm:grid-cols-3
//               md:grid-cols-4
//               lg:grid-cols-6
//               xl:grid-cols-7
//               gap-2
//               sm:gap-3
//             "
//           >

//             {mainCategory.subcategories.map(
//               (sub) => {

//                 // =================================================
//                 // SPARE PARTS ONLY
//                 // =================================================

//                 const isSpareParts =
//                   mainCategory.type ===
//                   "spare-parts";

//                 // Dynamic product
//                 const sparePartProduct =
//                   isSpareParts
//                     ? getSparePartProduct(
//                         sub.keyword
//                       )
//                     : null;

//                 // Dynamic image
//                 const sparePartImage =
//                   isSpareParts
//                     ? getSparePartImage(
//                         sub.keyword
//                       )
//                     : null;

//                 // Count
//                  const productCount =
//                   isSpareParts
//                     ? getSparePartsCount(sub.keyword)
//                     : 0;

//                 // =================================================
//                 // HIDE SPARE PARTS WITH NO PRODUCTS
//                 // =================================================

//                 if (isSpareParts && productCount === 1) {
//                   return null;
//                 }

//                 // =================================================
//                 // NON-SPARE EXISTING IMAGE
//                 // =================================================

//                 const cardImage =
//                   isSpareParts
//                     ? sparePartImage
//                     : sub.image;

//                 return (
//                   <div
//                     key={sub.label}
//                     onClick={() =>
//                       handleSubCategoryClick(
//                         sub
//                       )
//                     }
//                     className="
//                       group
//                       bg-white
//                       border
//                       border-gray-200
//                       rounded-lg
//                       overflow-hidden
//                       cursor-pointer
//                       transition-all
//                       duration-200
//                       hover:border-blue-300
//                       hover:shadow-md
//                       active:scale-[0.98]
//                     "
//                   >

//                     {/* =========================================
//                         IMAGE
//                     ========================================= */}

//                     <div
//                       className="
//                         w-full
//                         aspect-square
//                         bg-gray-50
//                         flex
//                         items-center
//                         justify-center
//                         overflow-hidden
//                       "
//                     >

//                       <img
//                         src={cardImage}
//                         alt={sub.label}
//                         loading="lazy"
//                         className="
//                           w-full
//                           h-full
//                           object-contain
//                           p-3
//                           transition-transform
//                           duration-200
//                           group-hover:scale-105
//                         "
//                         onError={(e) => {

//                           // =================================================
//                           // Spare Parts → fallback
//                           // =================================================

//                           if (isSpareParts) {
//                             e.currentTarget.onerror =
//                               null;

//                             e.currentTarget.src =
//                               makpower_image;
//                           }

//                           // =================================================
//                           // Other categories:
//                           // keep existing image behavior
//                           // =================================================
//                         }}
//                       />

//                     </div>

//                     {/* =========================================
//                         DETAILS
//                     ========================================= */}

//                     <div
//                       className="
//                         px-2.5
//                         py-2
//                         border-t
//                         border-gray-100
//                       "
//                     >

//                       {/* =======================================
//                           TITLE
//                       ======================================= */}

//                       <div
//                         className="
//                           flex
//                           items-center
//                           justify-between
//                           gap-1
//                         "
//                       >

//                         <h2
//                           className="
//                             text-[11px]
//                             sm:text-xs
//                             font-semibold
//                             text-gray-800
//                             truncate
//                           "
//                         >
//                           {sub.label}
//                         </h2>

//                         <FaChevronRight
//                           className="
//                             text-[9px]
//                             text-gray-400
//                             flex-shrink-0
//                           "
//                         />

//                       </div>

//                       {/* =======================================
//                           SPARE PART INFO
//                       ======================================= */}

//                       {isSpareParts && (
//                         <div
//                           className="
//                             flex
//                             items-center
//                             justify-between
//                             gap-1
//                             mt-1
//                           "
//                         >

//                           <div
//                             className="
//                               flex
//                               items-center
//                               gap-1
//                               min-w-0
//                             "
//                           >

//                             <FaBoxOpen
//                               className="
//                                 text-[9px]
//                                 text-gray-400
//                                 flex-shrink-0
//                               "
//                             />

//                             <span
//                               className="
//                                 text-[9px]
//                                 text-gray-500
//                                 truncate
//                               "
//                             >
//                              Spare Parts
//                             </span>

//                           </div>

//                           {/* =================================
//                               FIRST PRODUCT PRICE
//                           ================================= */}

                         

//                         </div>
//                       )}

//                       {/* =======================================
//                           EXISTING CATEGORY PRICE
//                           ONLY NON-SPARE
//                       ======================================= */}

//                       {!isSpareParts &&
//                         (() => {
//                           const product =
//                             getProductForSub(
//                               sub.label
//                             );

//                           return product ? (
//                             <div
//                               className="
//                                 text-[10px]
//                                 text-gray-500
//                                 mt-1
//                               "
//                             >
//                               ₹ {product.price}
//                             </div>
//                           ) : null;
//                         })()}

//                     </div>
//                   </div>
//                 );
//               }
//             )}

//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// import { useParams, useNavigate } from "react-router-dom";
// import { useMemo, useState } from "react";
// import categories from "../data/categoryData";
// import MobilePageHeader from "../components/MobilePageHeader";
// import { useCachedProducts } from "../hooks/useCachedProducts";
// import {
//   FaChevronRight,
//   FaBoxOpen,
//   FaSearch,
//   FaTimes,
// } from "react-icons/fa";
// import makpower_image from "../assets/images/makpower_image.webp";

// export default function SubCategoryPage() {
//   const { category } = useParams();
//   const navigate = useNavigate();

//   const { data: products = [], isLoading } =
//     useCachedProducts();

//   const [search, setSearch] = useState("");

//   const decodedCategory = decodeURIComponent(
//     category || ""
//   );

//   // =========================================================
//   // FIND MAIN CATEGORY
//   // =========================================================

//   const mainCategory = categories.find(
//     (c) =>
//       String(c.keyword || "").toLowerCase() ===
//       decodedCategory.toLowerCase()
//   );

//   // =========================================================
//   // NO CATEGORY
//   // =========================================================

//   if (
//     !mainCategory ||
//     !mainCategory.subcategories?.length
//   ) {
//     return (
//       <div className="p-4 text-center text-sm text-gray-500">
//         No Subcategories Found
//       </div>
//     );
//   }

//   // =========================================================
//   // EXISTING PRODUCT MAPPING
//   // DO NOT CHANGE
//   // =========================================================

//   const subCategoryProductMap = {
//     Bodyguard: 10001,
//     "Super X": 10002,
//     "UV Glass": 10003,
//     "Meibo Glass": 10004,
//     Soldier: 10005,
//     "New Soldier": 10007,
//   };

//   // =========================================================
//   // EXISTING FUNCTION
//   // =========================================================

//   const getProductForSub = (subLabel) => {
//     const productId =
//       subCategoryProductMap[subLabel];

//     if (!productId) return null;

//     return products.find(
//       (p) =>
//         Number(p.product_id) ===
//         Number(productId)
//     );
//   };

//   // =========================================================
//   // NORMALIZE TEXT
//   // =========================================================

//   const normalizeText = (value) => {
//     return String(value || "")
//       .toLowerCase()
//       .trim()
//       .replace(/[^a-z0-9]/g, "");
//   };

//   // =========================================================
//   // ONLY THESE THREE PRODUCTS ARE SPARE PARTS
//   //
//   // IMPORTANT:
//   // These products can NEVER be used as the model card
//   // image.
//   // =========================================================

//   const SPEAKER_SPARE_CATEGORIES = new Set([
//     "speaker pcb",
//     "speaker packing",
//     "speaker housing",
//   ]);

//   const isSpeakerSpareProduct = (product) => {
//     if (product?.is_active !== true) {
//       return false;
//     }

//     const category = String(
//       product.category || ""
//     )
//       .trim()
//       .toLowerCase();

//     const subCategory = String(
//       product.sub_category || ""
//     )
//       .trim()
//       .toLowerCase();

//     const productType = String(
//       product.product_type || ""
//     )
//       .trim()
//       .toLowerCase();

//     return (
//       SPEAKER_SPARE_CATEGORIES.has(category) ||
//       SPEAKER_SPARE_CATEGORIES.has(subCategory) ||
//       SPEAKER_SPARE_CATEGORIES.has(productType)
//     );
//   };

//   // =========================================================
//   // EXACT MODEL MATCH
//   //
//   // IMPORTANT CASES:
//   //
//   // SP15  → SP15 PCB       ✅
//   // SP15  → SP151 PCB      ❌
//   // SP15  → SP152 PCB      ❌
//   //
//   // SP151 → SP151 PCB      ✅
//   // SP151 → SP15 PCB       ❌
//   //
//   // RAFTAAR → RAFTAAR PCB  ✅
//   // RHYTHM  → RHYTHM PCB   ✅
//   //
//   // But these are used ONLY for spare-part matching.
//   // They are NOT used to select the model card image.
//   // =========================================================

//   const matchesSparePartModel = (
//     productName,
//     keyword
//   ) => {
//     const normalizedProduct =
//       normalizeText(productName);

//     const normalizedKeyword =
//       normalizeText(keyword);

//     if (
//       !normalizedProduct ||
//       !normalizedKeyword
//     ) {
//       return false;
//     }

//     const index =
//       normalizedProduct.indexOf(
//         normalizedKeyword
//       );

//     if (index === -1) {
//       return false;
//     }

//     const afterModel =
//       normalizedProduct[
//         index + normalizedKeyword.length
//       ] || "";

//     // =======================================================
//     // MODEL CODE PROTECTION
//     //
//     // SP15 must not match SP151 / SP152
//     // =======================================================

//     const keywordEndsWithNumber =
//       /\d$/.test(normalizedKeyword);

//     if (
//       keywordEndsWithNumber &&
//       /\d/.test(afterModel)
//     ) {
//       return false;
//     }

//     // =======================================================
//     // EXACT MODEL
//     // =======================================================

//     if (
//       normalizedProduct ===
//       normalizedKeyword
//     ) {
//       return true;
//     }

//     // =======================================================
//     // ALLOWED SPARE PART SUFFIXES
//     // =======================================================

//     const remaining =
//       normalizedProduct.slice(
//         index + normalizedKeyword.length
//       );

//     const validSuffixes = [
//       "pcb",
//       "packing",
//       "housing",
//       "speakerpcb",
//       "speakerpacking",
//       "speakerhousing",
//     ];

//     return validSuffixes.some(
//       (suffix) =>
//         remaining.startsWith(suffix)
//     );
//   };

//   // =========================================================
//   // GET SPARE PART PRODUCTS
//   //
//   // ONLY:
//   // SPEAKER PCB
//   // SPEAKER PACKING
//   // SPEAKER HOUSING
//   // =========================================================

//   const getSparePartProducts = (keyword) => {
//     const normalizedKeyword =
//       normalizeText(keyword);

//     if (!normalizedKeyword) {
//       return [];
//     }

//     return products
//       .filter((product) => {
//         // ---------------------------------------------------
//         // ACTIVE ONLY
//         // ---------------------------------------------------

//         if (product.is_active !== true) {
//           return false;
//         }

//         // ---------------------------------------------------
//         // ONLY THREE SPEAKER SPARE CATEGORIES
//         // ---------------------------------------------------

//         if (
//           !isSpeakerSpareProduct(product)
//         ) {
//           return false;
//         }

//         const productName = String(
//           product.product_name || ""
//         ).trim();

//         if (!productName) {
//           return false;
//         }

//         // ---------------------------------------------------
//         // EXACT MODEL MATCH
//         // ---------------------------------------------------

//         return matchesSparePartModel(
//           productName,
//           normalizedKeyword
//         );
//       })
//       .sort((a, b) => {
//         const aName =
//           normalizeText(
//             a.product_name
//           );

//         const bName =
//           normalizeText(
//             b.product_name
//           );

//         const aStarts =
//           aName.startsWith(
//             normalizedKeyword
//           );

//         const bStarts =
//           bName.startsWith(
//             normalizedKeyword
//           );

//         if (
//           aStarts &&
//           !bStarts
//         ) {
//           return -1;
//         }

//         if (
//           !aStarts &&
//           bStarts
//         ) {
//           return 1;
//         }

//         return 0;
//       });
//   };

//   // =========================================================
//   // GET ACTUAL SPEAKER / MODEL PRODUCT
//   //
//   // 🚨 VERY IMPORTANT:
//   //
//   // We explicitly EXCLUDE:
//   //
//   // SPEAKER PCB
//   // SPEAKER PACKING
//   // SPEAKER HOUSING
//   //
//   // Therefore PCB can NEVER become the model image.
//   // =========================================================

//   const getActualModelProduct = (
//     keyword
//   ) => {
//     const normalizedKeyword =
//       normalizeText(keyword);

//     if (!normalizedKeyword) {
//       return null;
//     }

//     const matchingProducts =
//       products.filter((product) => {
//         // ---------------------------------------------------
//         // ACTIVE ONLY
//         // ---------------------------------------------------

//         if (
//           product?.is_active !== true
//         ) {
//           return false;
//         }

//         // ---------------------------------------------------
//         // 🚨 NEVER USE SPARE PART PRODUCT
//         //
//         // This is the important fix for:
//         // RAFTAAR
//         // RHYTHM
//         // AUDIO PULSE
//         // etc.
//         // ---------------------------------------------------

//         if (
//           isSpeakerSpareProduct(
//             product
//           )
//         ) {
//           return false;
//         }

//         const productName =
//           String(
//             product.product_name || ""
//           )
//             .trim();

//         if (!productName) {
//           return false;
//         }

//         const normalizedProduct =
//           normalizeText(
//             productName
//           );

//         // ---------------------------------------------------
//         // MODEL MUST EXIST
//         // ---------------------------------------------------

//         if (
//           !normalizedProduct.includes(
//             normalizedKeyword
//           )
//         ) {
//           return false;
//         }

//         // ---------------------------------------------------
//         // PREVENT SP15 → SP151 / SP152
//         // ---------------------------------------------------

//         const index =
//           normalizedProduct.indexOf(
//             normalizedKeyword
//           );

//         const afterModel =
//           normalizedProduct[
//             index +
//               normalizedKeyword.length
//           ] || "";

//         if (
//           /\d$/.test(
//             normalizedKeyword
//           ) &&
//           /\d/.test(afterModel)
//         ) {
//           return false;
//         }

//         return true;
//       });

//     // -------------------------------------------------------
//     // Prefer product which actually has an image
//     // -------------------------------------------------------

//     return (
//       matchingProducts.find(
//         (product) =>
//           String(
//             product?.image || ""
//           ).trim()
//       ) || null
//     );
//   };

//   // =========================================================
//   // PRODUCT IMAGE URL
//   // =========================================================

//   const getProductImage = (
//     product
//   ) => {
//     if (!product) {
//       return makpower_image;
//     }

//     const image = String(
//       product.image || ""
//     ).trim();

//     if (!image) {
//       return makpower_image;
//     }

//     if (
//       image.startsWith(
//         "http://"
//       ) ||
//       image.startsWith(
//         "https://"
//       )
//     ) {
//       return image;
//     }

//     return `https://res.cloudinary.com/djyr368zj/${image}?f_auto,q_auto,w_400`;
//   };

//   // =========================================================
//   // GET MODEL CARD IMAGE
//   //
//   // 🚨 FINAL RULE:
//   //
//   // 1. Actual speaker image
//   // 2. Makpower fallback
//   //
//   // ❌ NEVER PCB
//   // ❌ NEVER PACKING
//   // ❌ NEVER HOUSING
//   //
//   // This condition applies to EVERY spare-part model.
//   // =========================================================

//   const getSparePartImage = (
//     keyword
//   ) => {
//     const actualModelProduct =
//       getActualModelProduct(
//         keyword
//       );

//     if (
//       actualModelProduct?.image
//     ) {
//       return getProductImage(
//         actualModelProduct
//       );
//     }

//     // 🚨 DO NOT FALL BACK TO SPARE PART IMAGE.
//     //
//     // Earlier code was doing:
//     //
//     // sparePartProduct → PCB image
//     //
//     // That caused the issue.
//     //
//     // Now if actual speaker image is not available,
//     // show Makpower fallback.
//     return makpower_image;
//   };

//   // =========================================================
//   // GET SPARE PART COUNT
//   // =========================================================

//   const getSparePartsCount = (
//     keyword
//   ) => {
//     if (
//       mainCategory.type !==
//       "spare-parts"
//     ) {
//       return 0;
//     }

//     return getSparePartProducts(
//       keyword
//     ).length;
//   };

//   // =========================================================
//   // SEARCH MODEL CARDS
//   //
//   // Search applies ONLY to Spare Parts.
//   //
//   // Example:
//   //
//   // Search "sp15"
//   // → SP15
//   // → SP151
//   // → SP152
//   //
//   // Search "rhythm"
//   // → RHYTHM
//   //
//   // Search "speaker"
//   // → Speaker-named models
//   // =========================================================

//   const normalizedSearch =
//     normalizeText(search);

//   const visibleSubcategories =
//     useMemo(() => {
//       if (
//         mainCategory.type !==
//         "spare-parts"
//       ) {
//         return mainCategory.subcategories;
//       }

//       if (!normalizedSearch) {
//         return mainCategory.subcategories;
//       }

//       return mainCategory.subcategories.filter(
//         (sub) => {
//           const label =
//             normalizeText(
//               sub.label
//             );

//           const keyword =
//             normalizeText(
//               sub.keyword
//             );

//           return (
//             label.includes(
//               normalizedSearch
//             ) ||
//             keyword.includes(
//               normalizedSearch
//             )
//           );
//         }
//       );
//     },
//     [
//       mainCategory,
//       normalizedSearch,
//     ]);

//   // =========================================================
//   // CLICK HANDLER
//   // =========================================================

//   const handleSubCategoryClick = (
//     sub
//   ) => {
//     const keyword = String(
//       sub.keyword || ""
//     ).toUpperCase();

//     // =======================================================
//     // SPARE PARTS
//     // =======================================================

//     if (
//       mainCategory.type ===
//       "spare-parts"
//     ) {
//       navigate(
//         `/spare-parts/${encodeURIComponent(
//           sub.keyword
//         )}`
//       );

//       return;
//     }

//     // =======================================================
//     // BATTERY / POLYMER
//     // =======================================================

//     if (
//       keyword.includes(
//         "BATTERY"
//       ) ||
//       keyword.includes(
//         "POLYMER"
//       )
//     ) {
//       navigate(
//         `/batteries/${encodeURIComponent(
//           sub.keyword
//         )}`
//       );

//       return;
//     }

//     // =======================================================
//     // TEMPERED
//     // =======================================================

//     if (
//       keyword.includes(
//         "TEMPERED"
//       )
//     ) {
//       navigate(
//         `/tempered/${encodeURIComponent(
//           sub.keyword
//         )}`
//       );

//       return;
//     }

//     // =======================================================
//     // NORMAL CATEGORY
//     // =======================================================

//     navigate(
//       `/category/${encodeURIComponent(
//         sub.keyword
//       )}`
//     );
//   };

//   // =========================================================
//   // UI
//   // =========================================================

//   return (
//     <div className="min-h-screen bg-gray-50 px-3 sm:px-4 pb-20">

//       <div className="pt-[20px] sm:pt-0 mx-auto">

//         {/* ===================================================
//             SPARE PART SEARCH BAR
//         =================================================== */}

//         {mainCategory.type ===
//           "spare-parts" && (
//           <div className="mb-3">

//             <div
//               className="
//                 relative
//                 bg-white
//                 border
//                 border-gray-200
//                 rounded-xl
//                 shadow-sm
//                 transition-all
//                 duration-200
//                 focus-within:border-blue-300
//                 focus-within:ring-2
//                 focus-within:ring-blue-100
//               "
//             >

//               <div
//                 className="
//                   flex
//                   items-center
//                   gap-2.5
//                   px-3.5
//                   py-2.5
//                 "
//               >

//                 <FaSearch
//                   className="
//                     text-gray-400
//                     text-sm
//                     flex-shrink-0
//                   "
//                 />

//                 <input
//                   type="text"
//                   value={search}
//                   onChange={(e) =>
//                     setSearch(
//                       e.target.value
//                     )
//                   }
//                   placeholder="Search speaker model..."
//                   className="
//                     flex-1
//                     min-w-0
//                     bg-transparent
//                     outline-none
//                     text-xs
//                     sm:text-sm
//                     text-gray-700
//                     placeholder:text-gray-400
//                   "
//                 />

//                 {search && (
//                   <button
//                     type="button"
//                     onClick={() =>
//                       setSearch("")
//                     }
//                     className="
//                       w-6
//                       h-6
//                       rounded-full
//                       flex
//                       items-center
//                       justify-center
//                       text-gray-400
//                       hover:text-gray-600
//                       hover:bg-gray-100
//                       transition-colors
//                     "
//                     aria-label="Clear search"
//                   >
//                     <FaTimes
//                       className="text-[10px]"
//                     />
//                   </button>
//                 )}

//               </div>

//             </div>

//             {/* =================================================
//                 SEARCH RESULT COUNT
//             ================================================= */}

//             {search && (
//               <div
//                 className="
//                   flex
//                   items-center
//                   justify-between
//                   px-1
//                   mt-1.5
//                 "
//               >

//                 <span
//                   className="
//                     text-[10px]
//                     text-gray-400
//                   "
//                 >
//                   {visibleSubcategories.length}{" "}
//                   model
//                   {visibleSubcategories.length !==
//                   1
//                     ? "s"
//                     : ""}{" "}
//                   found
//                 </span>

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setSearch("")
//                   }
//                   className="
//                     text-[10px]
//                     font-medium
//                     text-blue-500
//                     hover:text-blue-600
//                   "
//                 >
//                   Clear
//                 </button>

//               </div>
//             )}

//           </div>
//         )}

//         {/* ===================================================
//             LOADING
//         =================================================== */}

//         {isLoading ? (
//           <div className="flex items-center justify-center py-16">
//             <p className="text-xs text-gray-500">
//               Loading...
//             </p>
//           </div>
//         ) : visibleSubcategories.length ===
//           0 ? (

//           /* =================================================
//              NO SEARCH RESULTS
//           ================================================= */

//           <div
//             className="
//               bg-white
//               border
//               border-gray-200
//               rounded-xl
//               py-12
//               px-4
//               text-center
//             "
//           >

//             <FaSearch
//               className="
//                 mx-auto
//                 text-gray-300
//                 text-xl
//                 mb-2.5
//               "
//             />

//             <p
//               className="
//                 text-xs
//                 font-medium
//                 text-gray-600
//               "
//             >
//               No models found
//             </p>

//             <p
//               className="
//                 text-[10px]
//                 text-gray-400
//                 mt-1
//               "
//             >
//               Try another speaker model name
//             </p>

//             {search && (
//               <button
//                 type="button"
//                 onClick={() =>
//                   setSearch("")
//                 }
//                 className="
//                   mt-3
//                   px-3
//                   py-1.5
//                   rounded-lg
//                   bg-blue-50
//                   text-[10px]
//                   font-medium
//                   text-blue-600
//                   hover:bg-blue-100
//                   transition-colors
//                 "
//               >
//                 Show all models
//               </button>
//             )}

//           </div>

//         ) : (

//           /* =================================================
//              CATEGORY GRID
//           ================================================= */

//           <div
//             className="
//               grid
//               grid-cols-2
//               sm:grid-cols-3
//               md:grid-cols-4
//               lg:grid-cols-6
//               xl:grid-cols-7
//               gap-2
//               sm:gap-3
//             "
//           >

//             {visibleSubcategories.map(
//               (sub) => {

//                 const isSpareParts =
//                   mainCategory.type ===
//                   "spare-parts";

//                 // =================================================
//                 // SPARE PART COUNT
//                 // =================================================

//                 const productCount =
//                   isSpareParts
//                     ? getSparePartsCount(
//                         sub.keyword
//                       )
//                     : 0;

//                 // =================================================
//                 // HIDE ONLY IF ZERO SPARE PARTS
//                 // =================================================

//                 if (
//                   isSpareParts &&
//                   productCount === 0
//                 ) {
//                   return null;
//                 }

//                 // =================================================
//                 // IMAGE
//                 // =================================================

//                 const cardImage =
//                   isSpareParts
//                     ? getSparePartImage(
//                         sub.keyword
//                       )
//                     : sub.image;

//                 return (
//                   <div
//                     key={sub.label}
//                     onClick={() =>
//                       handleSubCategoryClick(
//                         sub
//                       )
//                     }
//                     className="
//                       group
//                       bg-white
//                       border
//                       border-gray-200
//                       rounded-xl
//                       overflow-hidden
//                       cursor-pointer
//                       transition-all
//                       duration-200
//                       hover:border-blue-300
//                       hover:shadow-md
//                       active:scale-[0.98]
//                     "
//                   >

//                     {/* =========================================
//                         IMAGE
//                     ========================================= */}

//                     <div
//                       className="
//                         w-full
//                         aspect-square
//                         bg-gray-50
//                         flex
//                         items-center
//                         justify-center
//                         overflow-hidden
//                       "
//                     >

//                       <img
//                         src={cardImage}
//                         alt={sub.label}
//                         loading="lazy"
//                         className="
//                           w-full
//                           h-full
//                           object-contain
//                           p-3
//                           transition-transform
//                           duration-200
//                           group-hover:scale-105
//                         "
//                         onError={(e) => {
//                           // -------------------------------------
//                           // IMPORTANT:
//                           // Never retry another spare-part image.
//                           // Always use safe fallback.
//                           // -------------------------------------

//                           e.currentTarget.onerror =
//                             null;

//                           e.currentTarget.src =
//                             makpower_image;
//                         }}
//                       />

//                     </div>

//                     {/* =========================================
//                         DETAILS
//                     ========================================= */}

//                     <div
//                       className="
//                         px-2.5
//                         py-2
//                         border-t
//                         border-gray-100
//                       "
//                     >

//                       {/* =======================================
//                           TITLE
//                       ======================================= */}

//                       <div
//                         className="
//                           flex
//                           items-center
//                           justify-between
//                           gap-1
//                         "
//                       >

//                         <h2
//                           className="
//                             text-[11px]
//                             sm:text-xs
//                             font-semibold
//                             text-gray-800
//                             truncate
//                           "
//                         >
//                           {sub.label}
//                         </h2>

//                         <FaChevronRight
//                           className="
//                             text-[9px]
//                             text-gray-400
//                             flex-shrink-0
//                           "
//                         />

//                       </div>

//                       {/* =======================================
//                           SPARE PART INFO
//                       ======================================= */}

//                       {isSpareParts && (
//                         <div
//                           className="
//                             flex
//                             items-center
//                             justify-between
//                             gap-1
//                             mt-1
//                           "
//                         >

//                           <div
//                             className="
//                               flex
//                               items-center
//                               gap-1
//                               min-w-0
//                             "
//                           >

//                             <FaBoxOpen
//                               className="
//                                 text-[9px]
//                                 text-gray-400
//                                 flex-shrink-0
//                               "
//                             />

//                             <span
//                               className="
//                                 text-[9px]
//                                 text-gray-500
//                                 truncate
//                               "
//                             >
//                               Spare Parts
//                             </span>

//                           </div>

//                         </div>
//                       )}

//                       {/* =======================================
//                           EXISTING CATEGORY PRICE
//                           ONLY NON-SPARE
//                       ======================================= */}

//                       {!isSpareParts &&
//                         (() => {
//                           const product =
//                             getProductForSub(
//                               sub.label
//                             );

//                           return product ? (
//                             <div
//                               className="
//                                 text-[10px]
//                                 text-gray-500
//                                 mt-1
//                               "
//                             >
//                               ₹ {product.price}
//                             </div>
//                           ) : null;
//                         })()}

//                     </div>
//                   </div>
//                 );
//               }
//             )}

//           </div>
//         )}
//       </div>
//     </div>
//   );
// }







// import { useEffect, useMemo, useRef, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import categories from "../data/categoryData";
// import { useCachedProducts } from "../hooks/useCachedProducts";

// import {
//   FaChevronRight,
//   FaBoxOpen,
//   FaSearch,
//   FaTimes,
// } from "react-icons/fa";

// import makpower_image from "../assets/images/makpower_image.webp";

// export default function SubCategoryPage() {
//   const { category } = useParams();
//   const navigate = useNavigate();

//   const {
//     data: products = [],
//     isLoading,
//   } = useCachedProducts();

//   const [search, setSearch] = useState("");

//   // =========================================================
//   // FAST SCROLL RENDER
//   // =========================================================

//   const INITIAL_VISIBLE = 24;
//   const LOAD_MORE = 24;

//   const [visibleCount, setVisibleCount] =
//     useState(INITIAL_VISIBLE);

//   const loadMoreRef = useRef(null);

//   // =========================================================
//   // DECODE CATEGORY
//   // =========================================================

//   const decodedCategory =
//     decodeURIComponent(category || "");

//   // =========================================================
//   // FIND MAIN CATEGORY
//   // =========================================================

//   const mainCategory = useMemo(() => {
//     return categories.find(
//       (c) =>
//         String(c.keyword || "").toLowerCase() ===
//         decodedCategory.toLowerCase()
//     );
//   }, [decodedCategory]);

//   // =========================================================
//   // EXISTING PRODUCT MAPPING
//   // DO NOT CHANGE
//   // =========================================================

//   const subCategoryProductMap = {
//     Bodyguard: 10001,
//     "Super X": 10002,
//     "UV Glass": 10003,
//     "Meibo Glass": 10004,
//     Soldier: 10005,
//     "New Soldier": 10007,
//   };

//   // =========================================================
//   // NORMALIZE
//   // =========================================================

//   const normalizeText = (value) =>
//     String(value ?? "")
//       .toLowerCase()
//       .trim()
//       .replace(/[^a-z0-9]/g, "");

//   // =========================================================
//   // ACTIVE PRODUCT
//   // =========================================================

//   const isActiveProduct = (product) => {
//     const value = product?.is_active;

//     return (
//       value === true ||
//       value === 1 ||
//       value === "1" ||
//       String(value).toLowerCase() === "true"
//     );
//   };

//   // =========================================================
//   // GET NORMAL CATEGORY PRODUCT
//   // =========================================================

//   const getProductForSub = (subLabel) => {
//     const productId =
//       subCategoryProductMap[subLabel];

//     if (!productId) return null;

//     return products.find(
//       (p) =>
//         Number(p.product_id) ===
//         Number(productId)
//     );
//   };

//   // =========================================================
//   // SPEAKER PRODUCTS
//   //
//   // ONLY:
//   // sub_category === SPEAKER
//   //
//   // These are MODEL PRODUCTS.
//   // =========================================================

//   const speakerProducts = useMemo(() => {
//     if (!products?.length) {
//       return [];
//     }

//     return products.filter(
//       (product) =>
//         isActiveProduct(product) &&
//         normalizeText(
//           product?.sub_category
//         ) === "speaker"
//     );
//   }, [products]);

//   // =========================================================
//   // MODEL NAME
//   // =========================================================

//   const getModelName = (product) => {
//     return String(
//       product?.product_name ||
//         product?.name ||
//         product?.sale_name ||
//         ""
//     ).trim();
//   };

//   // =========================================================
//   // MODEL VARIANTS
//   //
//   // SHARK SPEAKER
//   // ↓
//   // sharkspeaker
//   // shark
//   //
//   // SP15
//   // ↓
//   // sp15
//   // 15
//   //
//   // This makes matching flexible.
//   // =========================================================

//   const getModelVariants = (model) => {
//     const normalized =
//       normalizeText(model);

//     if (!normalized) {
//       return [];
//     }

//     const variants = new Set();

//     variants.add(normalized);

//     // ---------------------------------------------
//     // Remove trailing SPEAKER
//     // SHARK SPEAKER -> SHARK
//     // ---------------------------------------------

//     const withoutSpeaker =
//       normalized.replace(/speaker$/, "");

//     if (
//       withoutSpeaker &&
//       withoutSpeaker !== normalized
//     ) {
//       variants.add(withoutSpeaker);
//     }

//     // ---------------------------------------------
//     // SP SOUND BREAKER -> SOUND BREAKER
//     // Only remove SP when it is a textual prefix,
//     // not numeric model like SP15.
//     // ---------------------------------------------

//     const candidates = [
//       normalized,
//       withoutSpeaker,
//     ];

//     candidates.forEach((value) => {
//       if (
//         value.startsWith("sp") &&
//         value.length > 2 &&
//         !/\d/.test(
//           value.slice(2)
//         )
//       ) {
//         variants.add(
//           value.slice(2)
//         );
//       }
//     });

//     return [...variants].filter(Boolean);
//   };

//   // =========================================================
//   // SEARCHABLE PRODUCT TEXT
//   // =========================================================

//   const getProductSearchText = (product) => {
//     return normalizeText(
//       [
//         product?.product_name,
//         product?.name,
//         product?.sale_name,
//         product?.category,
//         product?.sub_category,
//         product?.product_type,
//         product?.description,
//       ]
//         .filter(Boolean)
//         .join(" ")
//     );
//   };

//   // =========================================================
//   // SPARE MARKERS
//   //
//   // Database product itself decides what spare it is.
//   // =========================================================

//   const spareMarkers = [
//     "pcb",
//     "packing",
//     "housing",
//     "spare",
//     "btpcb",
//     "bluetoothpcb",
//   ];

//   // =========================================================
//   // MATCH SPARE PRODUCT
//   // =========================================================

//   const matchesModel = (
//     productText,
//     modelVariants
//   ) => {
//     if (
//       !productText ||
//       !modelVariants.length
//     ) {
//       return false;
//     }

//     return modelVariants.some(
//       (model) => {
//         const index =
//           productText.indexOf(model);

//         if (index === -1) {
//           return false;
//         }

//         // -----------------------------------------
//         // Numeric protection
//         //
//         // SP15 should NOT match SP151
//         // SP15 should NOT match SP152
//         // -----------------------------------------

//         const afterModel =
//           productText[
//             index + model.length
//           ] || "";

//         if (
//           /\d$/.test(model) &&
//           /\d/.test(afterModel)
//         ) {
//           return false;
//         }

//         // -----------------------------------------
//         // Remaining text after model
//         // -----------------------------------------

//         const remaining =
//           productText.slice(
//             index + model.length
//           );

//         if (!remaining) {
//           return false;
//         }

//         // -----------------------------------------
//         // Must contain actual spare indicator
//         // -----------------------------------------

//         return spareMarkers.some(
//           (marker) =>
//             remaining.includes(marker)
//         );
//       }
//     );
//   };

//   // =========================================================
//   // ACTIVE SPARE PRODUCTS
//   //
//   // Build searchable text ONCE.
//   //
//   // This is faster than rebuilding all fields
//   // for every speaker model.
//   // =========================================================

//   const activeSpareProducts = useMemo(() => {
//     if (!products?.length) {
//       return [];
//     }

//     return products
//       .filter((product) => {
//         if (!isActiveProduct(product)) {
//           return false;
//         }

//         // Speaker itself is NOT spare.
//         return (
//           normalizeText(
//             product?.sub_category
//           ) !== "speaker"
//         );
//       })
//       .map((product) => ({
//         product,
//         searchText:
//           getProductSearchText(product),
//       }))
//       .filter(
//         (item) => item.searchText
//       );
//   }, [products]);

//   // =========================================================
//   // BUILD SPEAKER MODELS
//   //
//   // IMPORTANT:
//   //
//   // Speaker with ZERO spare items
//   // => completely hidden.
//   //
//   // Duplicate spare records are NOT removed.
//   // =========================================================

//   const speakerModels = useMemo(() => {
//     if (!speakerProducts.length) {
//       return [];
//     }

//     return speakerProducts
//       .map((speakerProduct) => {
//         const modelName =
//           getModelName(
//             speakerProduct
//           );

//         if (!modelName) {
//           return null;
//         }

//         const variants =
//           getModelVariants(
//             modelName
//           );

//         const spareProducts =
//           activeSpareProducts
//             .filter((item) =>
//               matchesModel(
//                 item.searchText,
//                 variants
//               )
//             )
//             .map(
//               (item) =>
//                 item.product
//             );

//         // -----------------------------------------
//         // NO SPARE = HIDE MODEL
//         // -----------------------------------------

//         if (
//           spareProducts.length === 0
//         ) {
//           return null;
//         }

//         return {
//           product: speakerProduct,
//           modelName,
//           spareProducts,
//           productCount:
//             spareProducts.length,
//         };
//       })
//       .filter(Boolean);
//   }, [
//     speakerProducts,
//     activeSpareProducts,
//   ]);

//   // =========================================================
//   // SEARCH
//   //
//   // Search only SPEAKER MODELS.
//   // =========================================================

//   const normalizedSearch =
//     normalizeText(search);

//   const visibleSpeakerModels =
//     useMemo(() => {
//       if (!normalizedSearch) {
//         return speakerModels;
//       }

//       return speakerModels.filter(
//         (item) =>
//           normalizeText(
//             item.modelName
//           ).includes(
//             normalizedSearch
//           )
//       );
//     }, [
//       speakerModels,
//       normalizedSearch,
//     ]);

//   // =========================================================
//   // RESET SCROLL PAGINATION
//   // =========================================================

//   useEffect(() => {
//     setVisibleCount(
//       INITIAL_VISIBLE
//     );
//   }, [
//     normalizedSearch,
//     decodedCategory,
//   ]);

//   // =========================================================
//   // FAST SCROLL LOAD
//   //
//   // No API call.
//   // Just renders next cards.
//   // =========================================================

//   useEffect(() => {
//     if (
//       mainCategory?.type !==
//       "spare-parts"
//     ) {
//       return;
//     }

//     const target =
//       loadMoreRef.current;

//     if (!target) {
//       return;
//     }

//     const observer =
//       new IntersectionObserver(
//         (entries) => {
//           const first =
//             entries[0];

//           if (
//             first.isIntersecting
//           ) {
//             setVisibleCount(
//               (current) => {
//                 if (
//                   current >=
//                   visibleSpeakerModels.length
//                 ) {
//                   return current;
//                 }

//                 return (
//                   current +
//                   LOAD_MORE
//                 );
//               }
//             );
//           }
//         },
//         {
//           rootMargin:
//             "500px 0px",
//         }
//       );

//     observer.observe(target);

//     return () => {
//       observer.disconnect();
//     };
//   }, [
//     visibleSpeakerModels.length,
//     mainCategory?.type,
//   ]);

//   // =========================================================
//   // PRODUCTS CURRENTLY RENDERED
//   // =========================================================

//   const renderedSpeakerModels =
//     useMemo(() => {
//       return visibleSpeakerModels.slice(
//         0,
//         visibleCount
//       );
//     }, [
//       visibleSpeakerModels,
//       visibleCount,
//     ]);

//   // =========================================================
//   // PRODUCT IMAGE
//   // =========================================================

//   const getProductImage = (
//     product
//   ) => {
//     if (!product) {
//       return makpower_image;
//     }

//     const image = String(
//       product?.image || ""
//     ).trim();

//     if (!image) {
//       return makpower_image;
//     }

//     if (
//       image.startsWith(
//         "http://"
//       ) ||
//       image.startsWith(
//         "https://"
//       )
//     ) {
//       return image;
//     }

//     return `https://res.cloudinary.com/djyr368zj/${image}?f_auto,q_auto,w_400`;
//   };

//   // =========================================================
//   // CLICK
//   // =========================================================

//   const handleSubCategoryClick = (
//     sub
//   ) => {
//     const keyword =
//       String(
//         sub?.keyword || ""
//       ).toUpperCase();

//     // =======================================================
//     // SPARE PARTS
//     // =======================================================

//     if (
//       mainCategory?.type ===
//       "spare-parts"
//     ) {
//       navigate(
//         `/spare-parts/${encodeURIComponent(
//           sub.modelName
//         )}`
//       );

//       return;
//     }

//     // =======================================================
//     // BATTERY / POLYMER
//     // =======================================================

//     if (
//       keyword.includes(
//         "BATTERY"
//       ) ||
//       keyword.includes(
//         "POLYMER"
//       )
//     ) {
//       navigate(
//         `/batteries/${encodeURIComponent(
//           sub.keyword
//         )}`
//       );

//       return;
//     }

//     // =======================================================
//     // TEMPERED
//     // =======================================================

//     if (
//       keyword.includes(
//         "TEMPERED"
//       )
//     ) {
//       navigate(
//         `/tempered/${encodeURIComponent(
//           sub.keyword
//         )}`
//       );

//       return;
//     }

//     // =======================================================
//     // NORMAL CATEGORY
//     // =======================================================

//     navigate(
//       `/category/${encodeURIComponent(
//         sub.keyword
//       )}`
//     );
//   };

//   // =========================================================
//   // NO CATEGORY
//   // =========================================================

//   if (
//     !mainCategory ||
//     !mainCategory.subcategories?.length
//   ) {
//     return (
//       <div className="p-4 text-center text-sm text-gray-500">
//         No Subcategories Found
//       </div>
//     );
//   }

//   // =========================================================
//   // UI
//   // =========================================================

//   return (
//     <div
//       className="
//         min-h-screen
//         bg-gray-50
//         px-3
//         sm:px-4
//         pb-20
//       "
//     >
//       <div
//         className="
//           pt-[20px]
//           sm:pt-0
//           mx-auto
//         "
//       >
//         {/* =================================================
//             SPARE PARTS HEADER
//         ================================================= */}

//         {mainCategory.type ===
//           "spare-parts" && (
//           <div className="mb-4">

//             {/* SEARCH + MODEL COUNT */}

//             <div
//               className="
//                 flex
//                 items-center
//                 gap-2
//               "
//             >

//               {/* SEARCH */}

//               <div
//                 className="
//                   flex-1
//                   relative
//                   bg-white
//                   border
//                   border-gray-200
//                   rounded-xl
//                   shadow-sm
//                   transition-all
//                   duration-200
//                   focus-within:border-blue-300
//                   focus-within:ring-2
//                   focus-within:ring-blue-100
//                 "
//               >
//                 <div
//                   className="
//                     flex
//                     items-center
//                     gap-2.5
//                     px-3.5
//                     py-2.5
//                   "
//                 >
//                   <FaSearch
//                     className="
//                       text-gray-400
//                       text-sm
//                       flex-shrink-0
//                     "
//                   />

//                   <input
//                     type="text"
//                     value={search}
//                     onChange={(e) =>
//                       setSearch(
//                         e.target.value
//                       )
//                     }
//                     placeholder="Search speaker model..."
//                     className="
//                       flex-1
//                       min-w-0
//                       bg-transparent
//                       outline-none
//                       text-xs
//                       sm:text-sm
//                       text-gray-700
//                       placeholder:text-gray-400
//                     "
//                   />

//                   {search && (
//                     <button
//                       type="button"
//                       onClick={() =>
//                         setSearch("")
//                       }
//                       className="
//                         w-6
//                         h-6
//                         rounded-full
//                         flex
//                         items-center
//                         justify-center
//                         text-gray-400
//                         hover:text-gray-600
//                         hover:bg-gray-100
//                         transition-colors
//                       "
//                     >
//                       <FaTimes className="text-[10px]" />
//                     </button>
//                   )}
//                 </div>
//               </div>

//               {/* MODEL COUNT */}

//               <div
//                 className="
//                   flex
//                   items-center
//                   gap-1.5
//                   whitespace-nowrap
//                   px-3
//                   py-2.5
//                   rounded-xl
//                   bg-blue-50
//                   border
//                   border-blue-100
//                 "
//               >
//                 <FaBoxOpen
//                   className="
//                     text-blue-500
//                     text-xs
//                   "
//                 />

//                 <span
//                   className="
//                     text-[11px]
//                     font-semibold
//                     text-blue-700
//                   "
//                 >
//                   {visibleSpeakerModels.length}
//                 </span>

//                 <span
//                   className="
//                     text-[10px]
//                     text-blue-500
//                     hidden
//                     sm:inline
//                   "
//                 >
//                   Models
//                 </span>
//               </div>
//             </div>

//             {/* SEARCH INFO */}

//             {search && (
//               <div
//                 className="
//                   flex
//                   items-center
//                   justify-between
//                   px-1
//                   mt-1.5
//                 "
//               >
//                 <span
//                   className="
//                     text-[10px]
//                     text-gray-400
//                   "
//                 >
//                   {visibleSpeakerModels.length}{" "}
//                   model
//                   {visibleSpeakerModels.length !==
//                   1
//                     ? "s"
//                     : ""}{" "}
//                   found
//                 </span>

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setSearch("")
//                   }
//                   className="
//                     text-[10px]
//                     font-medium
//                     text-blue-500
//                     hover:text-blue-600
//                   "
//                 >
//                   Clear
//                 </button>
//               </div>
//             )}
//           </div>
//         )}

//         {/* =================================================
//             LOADING
//         ================================================= */}

//         {isLoading ? (
//           <div
//             className="
//               grid
//               grid-cols-2
//               sm:grid-cols-3
//               md:grid-cols-4
//               lg:grid-cols-6
//               xl:grid-cols-7
//               gap-2
//               sm:gap-3
//             "
//           >
//             {Array.from({
//               length: 14,
//             }).map((_, index) => (
//               <div
//                 key={index}
//                 className="
//                   bg-white
//                   border
//                   border-gray-200
//                   rounded-xl
//                   overflow-hidden
//                   animate-pulse
//                 "
//               >
//                 <div
//                   className="
//                     aspect-square
//                     bg-gray-100
//                   "
//                 />

//                 <div className="p-2.5 space-y-2">
//                   <div className="h-3 bg-gray-100 rounded w-3/4" />
//                   <div className="h-2.5 bg-gray-100 rounded w-1/2" />
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : mainCategory.type ===
//           "spare-parts" ? (

//           /* =================================================
//              DYNAMIC SPEAKER MODELS
//           ================================================= */

//           visibleSpeakerModels.length ===
//           0 ? (

//             <div
//               className="
//                 bg-white
//                 border
//                 border-gray-200
//                 rounded-xl
//                 py-12
//                 px-4
//                 text-center
//                 animate-[fadeIn_.25s_ease-out]
//               "
//             >
//               <FaSearch
//                 className="
//                   mx-auto
//                   text-gray-300
//                   text-xl
//                   mb-2.5
//                 "
//               />

//               <p
//                 className="
//                   text-xs
//                   font-medium
//                   text-gray-600
//                 "
//               >
//                 No speaker models found
//               </p>

//               <p
//                 className="
//                   text-[10px]
//                   text-gray-400
//                   mt-1
//                 "
//               >
//                 Try another speaker model name
//               </p>

//               {search && (
//                 <button
//                   type="button"
//                   onClick={() =>
//                     setSearch("")
//                   }
//                   className="
//                     mt-3
//                     px-3
//                     py-1.5
//                     rounded-lg
//                     bg-blue-50
//                     text-[10px]
//                     font-medium
//                     text-blue-600
//                     hover:bg-blue-100
//                     transition-colors
//                   "
//                 >
//                   Show all models
//                 </button>
//               )}
//             </div>

//           ) : (

//             <>
//               <div
//                 className="
//                   grid
//                   grid-cols-2
//                   sm:grid-cols-3
//                   md:grid-cols-4
//                   lg:grid-cols-6
//                   xl:grid-cols-7
//                   gap-2
//                   sm:gap-3
//                 "
//               >

//                 {renderedSpeakerModels.map(
//                   (
//                     item,
//                     index
//                   ) => {

//                     const modelProduct =
//                       item.product;

//                     const modelName =
//                       item.modelName;

//                     const productCount =
//                       item.productCount;

//                     const uniqueId =
//                       modelProduct?.id ??
//                       modelProduct?.product_id ??
//                       `${modelName}-${index}`;

//                     return (
//                       <div
//                         key={uniqueId}
//                         onClick={() =>
//                           handleSubCategoryClick(
//                             {
//                               modelName,
//                               keyword:
//                                 modelName,
//                             }
//                           )
//                         }
//                         className="
//                           group
//                           bg-white
//                           border
//                           border-gray-200
//                           rounded-xl
//                           overflow-hidden
//                           cursor-pointer
//                           opacity-0
//                           animate-[cardIn_.35s_ease-out_forwards]
//                           hover:border-blue-300
//                           hover:shadow-lg
//                           hover:-translate-y-0.5
//                           active:scale-[0.98]
//                           transition-all
//                           duration-200
//                         "
//                         style={{
//                           animationDelay: `${Math.min(
//                             index * 25,
//                             250
//                           )}ms`,
//                         }}
//                       >

//                         {/* =================================
//                             IMAGE
//                         ================================= */}

//                         <div
//                           className="
//                             relative
//                             w-full
//                             aspect-square
//                             bg-gray-50
//                             flex
//                             items-center
//                             justify-center
//                             overflow-hidden
//                           "
//                         >
//                           <img
//                             src={getProductImage(
//                               modelProduct
//                             )}
//                             alt={modelName}
//                             loading="lazy"
//                             decoding="async"
//                             className="
//                               w-full
//                               h-full
//                               object-contain
//                               p-3
//                               transition-transform
//                               duration-300
//                               group-hover:scale-105
//                             "
//                             onError={(e) => {
//                               e.currentTarget.onerror =
//                                 null;

//                               e.currentTarget.src =
//                                 makpower_image;
//                             }}
//                           />

//                           {/* ITEM COUNT */}

//                           <span
//                             className="
//                               absolute
//                               top-1.5
//                               right-1.5
//                               px-1.5
//                               py-0.5
//                               rounded-md
//                               bg-white/95
//                               backdrop-blur-sm
//                               border
//                               border-blue-100
//                               text-[9px]
//                               font-bold
//                               text-blue-600
//                               shadow-sm
//                             "
//                           >
//                             {productCount}
//                           </span>
//                         </div>

//                         {/* =================================
//                             DETAILS
//                         ================================= */}

//                         <div
//                           className="
//                             px-2.5
//                             py-2
//                             border-t
//                             border-gray-100
//                           "
//                         >

//                           {/* MODEL NAME */}

//                           <div
//                             className="
//                               flex
//                               items-center
//                               justify-between
//                               gap-1
//                             "
//                           >
//                             <h2
//                               className="
//                                 text-[11px]
//                                 sm:text-xs
//                                 font-semibold
//                                 text-gray-800
//                                 truncate
//                               "
//                             >
//                               {modelName}
//                             </h2>

//                             <FaChevronRight
//                               className="
//                                 text-[9px]
//                                 text-gray-400
//                                 flex-shrink-0
//                                 transition-transform
//                                 duration-200
//                                 group-hover:translate-x-0.5
//                                 group-hover:text-blue-500
//                               "
//                             />
//                           </div>

//                           {/* SPARE COUNT */}

//                           <div
//                             className="
//                               flex
//                               items-center
//                               justify-between
//                               gap-1
//                               mt-1
//                             "
//                           >
//                             <div
//                               className="
//                                 flex
//                                 items-center
//                                 gap-1
//                                 min-w-0
//                               "
//                             >
//                               <FaBoxOpen
//                                 className="
//                                   text-[9px]
//                                   text-blue-400
//                                   flex-shrink-0
//                                 "
//                               />

//                               <span
//                                 className="
//                                   text-[9px]
//                                   text-gray-500
//                                 "
//                               >
//                                 Spare Parts
//                               </span>
//                             </div>

//                             <span
//                               className="
//                                 flex-shrink-0
//                                 px-1.5
//                                 py-0.5
//                                 rounded-md
//                                 bg-blue-50
//                                 text-[9px]
//                                 font-semibold
//                                 text-blue-600
//                               "
//                             >
//                               {productCount}{" "}
//                               {productCount ===
//                               1
//                                 ? "Item"
//                                 : "Items"}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   }
//                 )}
//               </div>

//               {/* =============================================
//                   SCROLL LOAD SENTINEL
//               ============================================= */}

//               {visibleCount <
//                 visibleSpeakerModels.length && (
//                 <div
//                   ref={loadMoreRef}
//                   className="
//                     flex
//                     items-center
//                     justify-center
//                     py-6
//                   "
//                 >
//                   <div
//                     className="
//                       flex
//                       items-center
//                       gap-2
//                       text-[10px]
//                       text-gray-400
//                     "
//                   >
//                     <span
//                       className="
//                         w-3
//                         h-3
//                         rounded-full
//                         border-2
//                         border-gray-300
//                         border-t-blue-500
//                         animate-spin
//                       "
//                     />

//                     Loading more models...
//                   </div>
//                 </div>
//               )}

//               {/* ALL LOADED */}

//               {visibleCount >=
//                 visibleSpeakerModels.length &&
//                 visibleSpeakerModels.length >
//                   INITIAL_VISIBLE && (
//                 <div
//                   className="
//                     text-center
//                     py-5
//                     text-[10px]
//                     text-gray-400
//                   "
//                 >
//                   All {visibleSpeakerModels.length}{" "}
//                   models loaded
//                 </div>
//               )}
//             </>
//           )

//         ) : (

//           /* =================================================
//              EXISTING NORMAL CATEGORY FLOW
//           ================================================= */

//           <div
//             className="
//               grid
//               grid-cols-2
//               sm:grid-cols-3
//               md:grid-cols-4
//               lg:grid-cols-6
//               xl:grid-cols-7
//               gap-2
//               sm:gap-3
//             "
//           >
//             {mainCategory.subcategories.map(
//               (sub, index) => {

//                 const keyword =
//                   String(
//                     sub.keyword || ""
//                   ).toUpperCase();

//                 const product =
//                   getProductForSub(
//                     sub.label
//                   );

//                 return (
//                   <div
//                     key={sub.label}
//                     onClick={() =>
//                       handleSubCategoryClick(
//                         sub
//                       )
//                     }
//                     className="
//                       group
//                       bg-white
//                       border
//                       border-gray-200
//                       rounded-xl
//                       overflow-hidden
//                       cursor-pointer
//                       opacity-0
//                       animate-[cardIn_.35s_ease-out_forwards]
//                       hover:border-blue-300
//                       hover:shadow-lg
//                       hover:-translate-y-0.5
//                       active:scale-[0.98]
//                       transition-all
//                       duration-200
//                     "
//                     style={{
//                       animationDelay: `${Math.min(
//                         index * 25,
//                         250
//                       )}ms`,
//                     }}
//                   >

//                     {/* IMAGE */}

//                     <div
//                       className="
//                         w-full
//                         aspect-square
//                         bg-gray-50
//                         flex
//                         items-center
//                         justify-center
//                         overflow-hidden
//                       "
//                     >
//                       <img
//                         src={
//                           sub.image ||
//                           makpower_image
//                         }
//                         alt={sub.label}
//                         loading="lazy"
//                         decoding="async"
//                         className="
//                           w-full
//                           h-full
//                           object-contain
//                           p-3
//                           transition-transform
//                           duration-300
//                           group-hover:scale-105
//                         "
//                         onError={(e) => {
//                           e.currentTarget.onerror =
//                             null;

//                           e.currentTarget.src =
//                             makpower_image;
//                         }}
//                       />
//                     </div>

//                     {/* DETAILS */}

//                     <div
//                       className="
//                         px-2.5
//                         py-2
//                         border-t
//                         border-gray-100
//                       "
//                     >
//                       <div
//                         className="
//                           flex
//                           items-center
//                           justify-between
//                           gap-1
//                         "
//                       >
//                         <h2
//                           className="
//                             text-[11px]
//                             sm:text-xs
//                             font-semibold
//                             text-gray-800
//                             truncate
//                           "
//                         >
//                           {sub.label}
//                         </h2>

//                         <FaChevronRight
//                           className="
//                             text-[9px]
//                             text-gray-400
//                             flex-shrink-0
//                             transition-transform
//                             duration-200
//                             group-hover:translate-x-0.5
//                             group-hover:text-blue-500
//                           "
//                         />
//                       </div>

//                       {product && (
//                         <div
//                           className="
//                             text-[10px]
//                             text-gray-500
//                             mt-1
//                           "
//                         >
//                           ₹ {product.price}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 );
//               }
//             )}
//           </div>
//         )}
//       </div>

//       {/* =====================================================
//           ANIMATIONS
//       ===================================================== */}

//       <style>
//         {`
//           @keyframes cardIn {
//             from {
//               opacity: 0;
//               transform: translateY(8px) scale(.985);
//             }

//             to {
//               opacity: 1;
//               transform: translateY(0) scale(1);
//             }
//           }

//           @keyframes fadeIn {
//             from {
//               opacity: 0;
//               transform: translateY(4px);
//             }

//             to {
//               opacity: 1;
//               transform: translateY(0);
//             }
//           }

//           @media (prefers-reduced-motion: reduce) {
//             *,
//             *::before,
//             *::after {
//               animation-duration: 0.01ms !important;
//               animation-iteration-count: 1 !important;
//               transition-duration: 0.01ms !important;
//             }
//           }
//         `}
//       </style>
//     </div>
//   );
// }





import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import categories from "../data/categoryData";
import { useCachedProducts } from "../hooks/useCachedProducts";

import {
  FaChevronRight,
  FaBoxOpen,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

import makpower_image from "../assets/images/makpower_image.webp";

export default function SubCategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();

  const {
    data: products = [],
    isLoading,
  } = useCachedProducts();

  const [search, setSearch] = useState("");

  // =========================================================
  // FAST SCROLL RENDER
  // =========================================================

  const INITIAL_VISIBLE = 24;
  const LOAD_MORE = 24;

  const [visibleCount, setVisibleCount] =
    useState(INITIAL_VISIBLE);

  const loadMoreRef = useRef(null);

  // =========================================================
  // DECODE CATEGORY
  // =========================================================

  const decodedCategory =
    decodeURIComponent(category || "");

  // =========================================================
  // FIND MAIN CATEGORY
  // =========================================================

  const mainCategory = useMemo(() => {
    return categories.find(
      (c) =>
        String(c.keyword || "").toLowerCase() ===
        decodedCategory.toLowerCase()
    );
  }, [decodedCategory]);

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
  // NORMALIZE
  // =========================================================

  const normalizeText = (value) =>
    String(value ?? "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "");

  // =========================================================
  // ACTIVE PRODUCT
  // =========================================================

  const isActiveProduct = (product) => {
    const value = product?.is_active;

    return (
      value === true ||
      value === 1 ||
      value === "1" ||
      String(value).toLowerCase() === "true"
    );
  };

  // =========================================================
  // GET NORMAL CATEGORY PRODUCT
  // =========================================================

  const getProductForSub = (subLabel) => {
    const productId =
      subCategoryProductMap[subLabel];

    if (!productId) return null;

    return products.find(
      (p) =>
        Number(p.product_id) ===
        Number(productId)
    );
  };

  // =========================================================
  // SPEAKER PRODUCTS
  //
  // ONLY ACTIVE SPEAKERS.
  //
  // IMPORTANT:
  // Inactive speaker is NOT shown here.
  //
  // Twister inactive case is handled separately below.
  // =========================================================

  const speakerProducts = useMemo(() => {
    if (!products?.length) {
      return [];
    }

    return products.filter(
      (product) =>
        isActiveProduct(product) &&
        normalizeText(
          product?.sub_category
        ) === "speaker"
    );
  }, [products]);

  // =========================================================
  // MODEL NAME
  // =========================================================

  const getModelName = (product) => {
    return String(
      product?.product_name ||
        product?.name ||
        product?.sale_name ||
        ""
    ).trim();
  };

  // =========================================================
  // MODEL VARIANTS
  //
  // SHARK SPEAKER
  // -> sharkspeaker
  // -> shark
  //
  // SP SOUND BREAKER
  // -> spsoundbreaker
  // -> soundbreaker
  // =========================================================

  const getModelVariants = (model) => {
    const normalized =
      normalizeText(model);

    if (!normalized) {
      return [];
    }

    const variants = new Set();

    variants.add(normalized);

    // Remove trailing SPEAKER
    const withoutSpeaker =
      normalized.replace(/speaker$/, "");

    if (
      withoutSpeaker &&
      withoutSpeaker !== normalized
    ) {
      variants.add(withoutSpeaker);
    }

    // Remove textual SP prefix
    const candidates = [
      normalized,
      withoutSpeaker,
    ];

    candidates.forEach((value) => {
      if (
        value.startsWith("sp") &&
        value.length > 2 &&
        !/\d/.test(
          value.slice(2)
        )
      ) {
        variants.add(
          value.slice(2)
        );
      }
    });

    return [...variants].filter(Boolean);
  };

  // =========================================================
  // SEARCHABLE PRODUCT TEXT
  // =========================================================

  const getProductSearchText = (product) => {
    return normalizeText(
      [
        product?.product_name,
        product?.name,
        product?.sale_name,
        product?.category,
        product?.sub_category,
        product?.product_type,
        product?.description,
      ]
        .filter(Boolean)
        .join(" ")
    );
  };

  // =========================================================
  // SPARE MARKERS
  // =========================================================

  const spareMarkers = [
    "pcb",
    "packing",
    "housing",
    "spare",
    "btpcb",
    "bluetoothpcb",
  ];

  // =========================================================
  // MATCH MODEL
  // =========================================================

  const matchesModel = (
    productText,
    modelVariants
  ) => {
    if (
      !productText ||
      !modelVariants.length
    ) {
      return false;
    }

    return modelVariants.some(
      (model) => {
        const index =
          productText.indexOf(model);

        if (index === -1) {
          return false;
        }

        // Numeric model protection
        //
        // SP15 -> SP151 ❌
        // SP15 -> SP152 ❌
        //

        const afterModel =
          productText[
            index + model.length
          ] || "";

        if (
          /\d$/.test(model) &&
          /\d/.test(afterModel)
        ) {
          return false;
        }

        const remaining =
          productText.slice(
            index + model.length
          );

        if (!remaining) {
          return false;
        }

        return spareMarkers.some(
          (marker) =>
            remaining.includes(marker)
        );
      }
    );
  };

  // =========================================================
  // ACTIVE SPARE PRODUCTS
  //
  // Search text is created ONCE.
  //
  // This keeps rendering/filtering fast.
  // =========================================================

  const activeSpareProducts = useMemo(() => {
    if (!products?.length) {
      return [];
    }

    return products
      .filter((product) => {
        if (!isActiveProduct(product)) {
          return false;
        }

        return (
          normalizeText(
            product?.sub_category
          ) !== "speaker"
        );
      })
      .map((product) => ({
        product,
        searchText:
          getProductSearchText(product),
      }))
      .filter(
        (item) => item.searchText
      );
  }, [products]);

  // =========================================================
  // BUILD NORMAL SPEAKER MODELS
  //
  // Speaker with ZERO spare:
  // HIDDEN
  //
  // Duplicate spare records:
  // KEPT
  // =========================================================

  const normalSpeakerModels = useMemo(() => {
    if (!speakerProducts.length) {
      return [];
    }

    return speakerProducts
      .map((speakerProduct) => {
        const modelName =
          getModelName(
            speakerProduct
          );

        if (!modelName) {
          return null;
        }

        const variants =
          getModelVariants(
            modelName
          );

        const spareProducts =
          activeSpareProducts
            .filter((item) =>
              matchesModel(
                item.searchText,
                variants
              )
            )
            .map(
              (item) =>
                item.product
            );

        // No spare = hide model
        if (
          spareProducts.length === 0
        ) {
          return null;
        }

        return {
          product: speakerProduct,
          modelName,
          spareProducts,
          productCount:
            spareProducts.length,
          isManualTwister: false,
        };
      })
      .filter(Boolean);
  }, [
    speakerProducts,
    activeSpareProducts,
  ]);

  // =========================================================
  // TWISTER SPECIAL FALLBACK
  //
  // IMPORTANT:
  //
  // ONLY FOR TWISTER.
  //
  // If active TWISTER speaker exists:
  // -> normal logic already handles it.
  //
  // If TWISTER speaker is inactive/missing:
  // -> find active Twister spare products.
  //
  // Example:
  //
  // Twister Speaker inactive
  //
  // TWISTER PCB active
  // TWISTER Packing active
  // TWISTER Housing active
  //
  // => Manual TWISTER card
  //
  // This does NOT affect any other speaker.
  // =========================================================

  const twisterFallbackModel =
    useMemo(() => {
      // ---------------------------------------------
      // Check if an ACTIVE Twister speaker already
      // exists.
      // ---------------------------------------------

      const activeTwisterSpeaker =
        speakerProducts.find(
          (product) => {
            const name =
              normalizeText(
                getModelName(product)
              );

            return (
              name === "twister" ||
              name === "twisterspeaker"
            );
          }
        );

      // ---------------------------------------------
      // If active Twister speaker exists,
      // normal speaker card handles it.
      // ---------------------------------------------

      if (activeTwisterSpeaker) {
        return null;
      }

      // ---------------------------------------------
      // Find active TWISTER spare products.
      //
      // IMPORTANT:
      // Only model name TWISTER is checked.
      //
      // So this special logic cannot affect
      // Shark / HT05 / Rhythm / etc.
      // ---------------------------------------------

      const twisterVariants = [
        "twister",
      ];

      const twisterSpareProducts =
        activeSpareProducts
          .filter((item) =>
            matchesModel(
              item.searchText,
              twisterVariants
            )
          )
          .map(
            (item) =>
              item.product
          );

      // ---------------------------------------------
      // No Twister spare = no manual card.
      // ---------------------------------------------

      if (
        twisterSpareProducts.length === 0
      ) {
        return null;
      }

      // ---------------------------------------------
      // Pick image from first spare if needed.
      // Main manual card does not require
      // speaker product to exist.
      // ---------------------------------------------

      const imageProduct =
        twisterSpareProducts.find(
          (product) =>
            String(
              product?.image || ""
            ).trim()
        ) ||
        twisterSpareProducts[0];

      return {
        product: imageProduct,
        modelName: "Twister",
        spareProducts:
          twisterSpareProducts,
        productCount:
          twisterSpareProducts.length,
        isManualTwister: true,
      };
    }, [
      speakerProducts,
      activeSpareProducts,
    ]);

  // =========================================================
  // FINAL SPEAKER MODELS
  //
  // Normal models +
  // Twister fallback ONLY when required.
  //
  // No spare-part total is calculated here.
  // =========================================================

  const speakerModels = useMemo(() => {
  const result = [
    ...normalSpeakerModels,
  ];

  if (twisterFallbackModel) {
    result.push(
      twisterFallbackModel
    );
  }

  // ✅ Alphabetical order: A → Z
  return result.sort((a, b) =>
    String(a.modelName || "").localeCompare(
      String(b.modelName || ""),
      undefined,
      {
        numeric: true,
        sensitivity: "base",
      }
    )
  );
}, [
  normalSpeakerModels,
  twisterFallbackModel,
]);

  // =========================================================
  // SEARCH SPEAKER MODELS
  // =========================================================

  const normalizedSearch =
    normalizeText(search);

  const visibleSpeakerModels =
    useMemo(() => {
      if (!normalizedSearch) {
        return speakerModels;
      }

      return speakerModels.filter(
        (item) =>
          normalizeText(
            item.modelName
          ).includes(
            normalizedSearch
          )
      );
    }, [
      speakerModels,
      normalizedSearch,
    ]);

  // =========================================================
  // RESET PAGINATION
  // =========================================================

  useEffect(() => {
    setVisibleCount(
      INITIAL_VISIBLE
    );
  }, [
    normalizedSearch,
    decodedCategory,
  ]);

  // =========================================================
  // FAST SCROLL LOAD
  //
  // IMPORTANT:
  // NO API CALL.
  //
  // Only more already-loaded cards are rendered.
  // =========================================================

  useEffect(() => {
    if (
      mainCategory?.type !==
      "spare-parts"
    ) {
      return;
    }

    const target =
      loadMoreRef.current;

    if (!target) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const first =
            entries[0];

          if (
            first.isIntersecting
          ) {
            setVisibleCount(
              (current) => {
                if (
                  current >=
                  visibleSpeakerModels.length
                ) {
                  return current;
                }

                return (
                  current +
                  LOAD_MORE
                );
              }
            );
          }
        },
        {
          rootMargin:
            "500px 0px",
        }
      );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [
    visibleSpeakerModels.length,
    mainCategory?.type,
  ]);

  // =========================================================
  // CURRENTLY RENDERED MODELS
  // =========================================================

  const renderedSpeakerModels =
    useMemo(() => {
      return visibleSpeakerModels.slice(
        0,
        visibleCount
      );
    }, [
      visibleSpeakerModels,
      visibleCount,
    ]);

  // =========================================================
  // PRODUCT IMAGE
  // =========================================================

  const getProductImage = (
    product
  ) => {
    if (!product) {
      return makpower_image;
    }

    const image = String(
      product?.image || ""
    ).trim();

    if (!image) {
      return makpower_image;
    }

    if (
      image.startsWith(
        "http://"
      ) ||
      image.startsWith(
        "https://"
      )
    ) {
      return image;
    }

    return `https://res.cloudinary.com/djyr368zj/${image}?f_auto,q_auto,w_400`;
  };

  // =========================================================
  // CLICK
  // =========================================================

  const handleSubCategoryClick = (
    sub
  ) => {
    const keyword =
      String(
        sub?.keyword || ""
      ).toUpperCase();

    // =======================================================
    // SPARE PARTS
    // =======================================================

    if (
      mainCategory?.type ===
      "spare-parts"
    ) {
      navigate(
        `/spare-parts/${encodeURIComponent(
          sub.modelName
        )}`
      );

      return;
    }

    // =======================================================
    // BATTERY / POLYMER
    // =======================================================

    if (
      keyword.includes(
        "BATTERY"
      ) ||
      keyword.includes(
        "POLYMER"
      )
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

    if (
      keyword.includes(
        "TEMPERED"
      )
    ) {
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
  // NO CATEGORY
  // =========================================================

  if (
    !mainCategory ||
    !mainCategory.subcategories?.length
  ) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        No Subcategories Found
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className="
        min-h-screen
        bg-gray-50
        px-3
        sm:px-4
        pb-20
      "
    >
      <div
        className="
          pt-[20px]
          sm:pt-0
          mx-auto
        "
      >

        {/* =================================================
            SPARE PARTS HEADER
        ================================================= */}

        {mainCategory.type ===
          "spare-parts" && (
          <div className="mb-4">

            {/* SEARCH + MODEL COUNT */}

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              {/* SEARCH */}

              <div
                className="
                  flex-1
                  relative
                  bg-white
                  border
                  border-gray-200
                  rounded-xl
                  shadow-sm
                  transition-all
                  duration-200
                  focus-within:border-blue-300
                  focus-within:ring-2
                  focus-within:ring-blue-100
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2.5
                    px-3.5
                    py-2.5
                  "
                >
                  <FaSearch
                    className="
                      text-gray-400
                      text-sm
                      flex-shrink-0
                    "
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search speaker model..."
                    className="
                      flex-1
                      min-w-0
                      bg-transparent
                      outline-none
                      text-xs
                      sm:text-sm
                      text-gray-700
                      placeholder:text-gray-400
                    "
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearch("")
                      }
                      className="
                        w-6
                        h-6
                        rounded-full
                        flex
                        items-center
                        justify-center
                        text-gray-400
                        hover:text-gray-600
                        hover:bg-gray-100
                        transition-colors
                      "
                    >
                      <FaTimes className="text-[10px]" />
                    </button>
                  )}
                </div>
              </div>

              {/* MODEL COUNT
                  ONLY MODELS
                  NO SPARE PART TOTAL
              */}

              <div
                className="
                  flex
                  items-center
                  gap-1.5
                  whitespace-nowrap
                  px-3
                  py-2.5
                  rounded-xl
                  bg-blue-50
                  border
                  border-blue-100
                "
              >
                <FaBoxOpen
                  className="
                    text-blue-500
                    text-xs
                  "
                />

                <span
                  className="
                    text-[11px]
                    font-semibold
                    text-blue-700
                  "
                >
                  {visibleSpeakerModels.length}
                </span>

                <span
                  className="
                    text-[10px]
                    text-blue-500
                    hidden
                    sm:inline
                  "
                >
                  Models
                </span>
              </div>
            </div>

            {/* SEARCH INFO */}

            {search && (
              <div
                className="
                  flex
                  items-center
                  justify-between
                  px-1
                  mt-1.5
                "
              >
                <span
                  className="
                    text-[10px]
                    text-gray-400
                  "
                >
                  {visibleSpeakerModels.length}{" "}
                  model
                  {visibleSpeakerModels.length !==
                  1
                    ? "s"
                    : ""}{" "}
                  found
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="
                    text-[10px]
                    font-medium
                    text-blue-500
                    hover:text-blue-600
                  "
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {isLoading ? (
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
            {Array.from({
              length: 14,
            }).map((_, index) => (
              <div
                key={index}
                className="
                  bg-white
                  border
                  border-gray-200
                  rounded-xl
                  overflow-hidden
                  animate-pulse
                "
              >
                <div
                  className="
                    aspect-square
                    bg-gray-100
                  "
                />

                <div className="p-2.5 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : mainCategory.type ===
          "spare-parts" ? (

          /* =================================================
             DYNAMIC SPEAKER MODELS
          ================================================= */

          visibleSpeakerModels.length ===
          0 ? (

            <div
              className="
                bg-white
                border
                border-gray-200
                rounded-xl
                py-12
                px-4
                text-center
                animate-[fadeIn_.25s_ease-out]
              "
            >
              <FaSearch
                className="
                  mx-auto
                  text-gray-300
                  text-xl
                  mb-2.5
                "
              />

              <p
                className="
                  text-xs
                  font-medium
                  text-gray-600
                "
              >
                No speaker models found
              </p>

              <p
                className="
                  text-[10px]
                  text-gray-400
                  mt-1
                "
              >
                Try another speaker model name
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="
                    mt-3
                    px-3
                    py-1.5
                    rounded-lg
                    bg-blue-50
                    text-[10px]
                    font-medium
                    text-blue-600
                    hover:bg-blue-100
                    transition-colors
                  "
                >
                  Show all models
                </button>
              )}
            </div>

          ) : (

            <>
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

                {renderedSpeakerModels.map(
                  (
                    item,
                    index
                  ) => {

                    const modelProduct =
                      item.product;

                    const modelName =
                      item.modelName;

                    const productCount =
                      item.productCount;

                    const uniqueId =
                      item.isManualTwister
                        ? "manual-twister"
                        : (
                            modelProduct?.id ??
                            modelProduct?.product_id ??
                            `${modelName}-${index}`
                          );

                    return (
                      <div
                        key={uniqueId}
                        onClick={() =>
                          handleSubCategoryClick(
                            {
                              modelName,
                              keyword:
                                modelName,
                            }
                          )
                        }
                        className="
                          group
                          bg-white
                          border
                          border-gray-200
                          rounded-xl
                          overflow-hidden
                          cursor-pointer
                          opacity-0
                          animate-[cardIn_.35s_ease-out_forwards]
                          hover:border-blue-300
                          hover:shadow-lg
                          hover:-translate-y-0.5
                          active:scale-[0.98]
                          transition-all
                          duration-200
                        "
                        style={{
                          animationDelay: `${Math.min(
                            index * 25,
                            250
                          )}ms`,
                        }}
                      >

                        {/* =================================
                            IMAGE
                        ================================= */}

                        <div
                          className="
                            relative
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
                            src={getProductImage(
                              modelProduct
                            )}
                            alt={modelName}
                            loading="lazy"
                            decoding="async"
                            className="
                              w-full
                              h-full
                              object-contain
                              p-3
                              transition-transform
                              duration-300
                              group-hover:scale-105
                            "
                            onError={(e) => {
                              e.currentTarget.onerror =
                                null;

                              e.currentTarget.src =
                                makpower_image;
                            }}
                          />
                        </div>

                        {/* =================================
                            DETAILS
                            
                            IMPORTANT:
                            Quantity/count ONLY ONE PLACE
                        ================================= */}

                        <div
                          className="
                            px-2.5
                            py-2
                            border-t
                            border-gray-100
                          "
                        >

                          {/* MODEL NAME */}

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
                              {modelName}
                            </h2>

                            <FaChevronRight
                              className="
                                text-[9px]
                                text-gray-400
                                flex-shrink-0
                                transition-transform
                                duration-200
                                group-hover:translate-x-0.5
                                group-hover:text-blue-500
                              "
                            />
                          </div>

                          {/* =================================
                              SPARE COUNT — ONLY HERE
                          ================================= */}

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
                                  text-blue-400
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
                                Spare Parts
                              </span>
                            </div>

                            <span
                              className="
                                flex-shrink-0
                                px-1.5
                                py-0.5
                                rounded-md
                                bg-blue-50
                                text-[9px]
                                font-semibold
                                text-blue-600
                              "
                            >
                              {productCount}{" "}
                              {productCount ===
                              1
                                ? "Item"
                                : "Items"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* =================================================
                  SCROLL LOAD SENTINEL
              ================================================= */}

              {visibleCount <
                visibleSpeakerModels.length && (
                <div
                  ref={loadMoreRef}
                  className="
                    flex
                    items-center
                    justify-center
                    py-6
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-[10px]
                      text-gray-400
                    "
                  >
                    <span
                      className="
                        w-3
                        h-3
                        rounded-full
                        border-2
                        border-gray-300
                        border-t-blue-500
                        animate-spin
                      "
                    />

                    Loading more models...
                  </div>
                </div>
              )}

              {/* =================================================
                  ALL LOADED
              ================================================= */}

              {visibleCount >=
                visibleSpeakerModels.length &&
                visibleSpeakerModels.length >
                  INITIAL_VISIBLE && (
                <div
                  className="
                    text-center
                    py-5
                    text-[10px]
                    text-gray-400
                  "
                >
                  All {visibleSpeakerModels.length}{" "}
                  models loaded
                </div>
              )}
            </>
          )

        ) : (

          /* =================================================
             EXISTING NORMAL CATEGORY FLOW
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
              (sub, index) => {

                const keyword =
                  String(
                    sub.keyword || ""
                  ).toUpperCase();

                const product =
                  getProductForSub(
                    sub.label
                  );

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
                      rounded-xl
                      overflow-hidden
                      cursor-pointer
                      opacity-0
                      animate-[cardIn_.35s_ease-out_forwards]
                      hover:border-blue-300
                      hover:shadow-lg
                      hover:-translate-y-0.5
                      active:scale-[0.98]
                      transition-all
                      duration-200
                    "
                    style={{
                      animationDelay: `${Math.min(
                        index * 25,
                        250
                      )}ms`,
                    }}
                  >

                    {/* IMAGE */}

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
                        src={
                          sub.image ||
                          makpower_image
                        }
                        alt={sub.label}
                        loading="lazy"
                        decoding="async"
                        className="
                          w-full
                          h-full
                          object-contain
                          p-3
                          transition-transform
                          duration-300
                          group-hover:scale-105
                        "
                        onError={(e) => {
                          e.currentTarget.onerror =
                            null;

                          e.currentTarget.src =
                            makpower_image;
                        }}
                      />
                    </div>

                    {/* DETAILS */}

                    <div
                      className="
                        px-2.5
                        py-2
                        border-t
                        border-gray-100
                      "
                    >
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
                            transition-transform
                            duration-200
                            group-hover:translate-x-0.5
                            group-hover:text-blue-500
                          "
                        />
                      </div>

                      {product && (
                        <div
                          className="
                            text-[10px]
                            text-gray-500
                            mt-1
                          "
                        >
                          ₹ {product.price}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          ANIMATIONS
      ===================================================== */}

      <style>
        {`
          @keyframes cardIn {
            from {
              opacity: 0;
              transform: translateY(8px) scale(.985);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(4px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>
    </div>
  );
}