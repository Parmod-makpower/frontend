// // 📁 src/pages/SparePartsProductPage.jsx

// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";

// import { useCachedProducts } from "../hooks/useCachedProducts";
// import { useSchemes } from "../hooks/useSchemes";
// import { useSelectedProducts } from "../hooks/useSelectedProducts";
// import { useAuth } from "../context/AuthContext";

// import ProductCard from "../components/ProductCard";
// import MobilePageHeader from "../components/MobilePageHeader";

// import { Search, PackageOpen } from "lucide-react";

// export default function SparePartsProductPage() {

//   const { partGroup } = useParams();

//   const { user } = useAuth();

//   const {
//     data: allProducts = [],
//     isLoading,
//   } = useCachedProducts();

//   const {
//     data: schemes = [],
//   } = useSchemes();

//   const {
//     selectedProducts,
//     addProduct,
//     updateQuantity,
//     updateCartoon,
//     cartoonSelection,
//   } = useSelectedProducts();

//   const [search, setSearch] = useState("");

//   const decodedGroup =
//     decodeURIComponent(partGroup);

//   // =========================================================
//   // FILTER SPARE PARTS
//   // =========================================================

//   const spareParts = allProducts.filter((product) => {

//     // Only active products
//     if (product.is_active !== true) {
//       return false;
//     }

//     const productName =
//       String(
//         product.product_name || ""
//       ).toLowerCase();

//     const subCategory =
//       String(
//         product.sub_category || ""
//       ).toLowerCase();

//     const productType =
//       String(
//         product.product_type || ""
//       ).toLowerCase();

//     const group =
//       decodedGroup.toLowerCase();

//     // -------------------------------------------------------
//     // Must be Spare Parts
//     // -------------------------------------------------------

//     const isSparePart =
//       subCategory.includes("spare") ||
//       productType.includes("spare");

//     if (!isSparePart) {
//       return false;
//     }

//     // -------------------------------------------------------
//     // Must belong to selected speaker/model
//     // -------------------------------------------------------

//     return productName.includes(group);
//   });

//   // =========================================================
//   // SEARCH
//   // =========================================================

//   const searchText =
//     search.trim().toLowerCase();

//   const filteredProducts =
//     searchText
//       ? spareParts.filter((product) => {

//           const name =
//             String(
//               product.product_name || ""
//             ).toLowerCase();

//           const type =
//             String(
//               product.product_type || ""
//             ).toLowerCase();

//           return (
//             name.includes(searchText) ||
//             type.includes(searchText)
//           );
//         })
//       : spareParts;

//   // =========================================================
//   // SORT
//   // =========================================================

//   const sortedProducts = [
//     ...filteredProducts,
//   ].sort((a, b) => {

//     const priceA =
//       Number(a.price) || 0;

//     const priceB =
//       Number(b.price) || 0;

//     return priceA - priceB;
//   });

//   // =========================================================
//   // RESET SEARCH WHEN GROUP CHANGES
//   // =========================================================

//   useEffect(() => {
//     setSearch("");
//   }, [partGroup]);

//   // =========================================================
//   // SCHEME
//   // =========================================================

//   const hasScheme = (productId) => {

//     return schemes.some(
//       (scheme) => {

//         if (
//           !Array.isArray(
//             scheme.conditions
//           )
//         ) {
//           return false;
//         }

//         return scheme.conditions.some(
//           (condition) =>
//             Number(condition.product) ===
//             Number(productId)
//         );
//       }
//     );
//   };

//   // =========================================================
//   // LOADING
//   // =========================================================

//   if (isLoading) {

//     return (
//       <div className="min-h-screen bg-gray-50">

//         <MobilePageHeader
//           title={decodedGroup}
//         />

//         <div className="
//           pt-[70px]
//           sm:pt-5
//           flex
//           justify-center
//           items-center
//           h-60
//         ">

//           <p className="text-xs text-gray-500">
//             Loading spare parts...
//           </p>

//         </div>

//       </div>
//     );
//   }

//   // =========================================================
//   // UI
//   // =========================================================

//   return (
//     <div className="
//       min-h-screen
//       bg-gray-50
//       px-2
//       sm:px-4
//       pb-20
//     ">

//       <MobilePageHeader
//         title={decodedGroup}
//       />

//       <main className="
        
//         mx-auto
//         pt-[60px]
//         sm:pt-4
//       ">

       
//         {/* ===================================================
//             PRODUCTS
//         =================================================== */}

//         {sortedProducts.length === 0 ? (

//           <div className="
//             bg-white
//             border
//             border-gray-200
//             rounded-lg
//             py-12
//             px-4
//             text-center
//           ">

//             <PackageOpen
//               size={32}
//               className="
//                 mx-auto
//                 text-gray-300
//                 mb-2
//               "
//             />

//             <p className="
//               text-xs
//               font-medium
//               text-gray-600
//             ">
//               No spare parts found
//             </p>

//             <p className="
//               text-[10px]
//               text-gray-400
//               mt-1
//             ">
//               No parts available for {decodedGroup}
//             </p>

//           </div>

//         ) : (

//           <div className="
//             grid
//             grid-cols-2
//             sm:grid-cols-3
//             md:grid-cols-4
//             lg:grid-cols-5
            
//             gap-2
//             sm:gap-3
//           ">

//             {sortedProducts.map((prod) => {

//               const prodId =
//                 prod.id ??
//                 prod.product_id;

//               return (
//                 <ProductCard
//                   key={prodId}
//                   prod={prod}
//                   hasScheme={hasScheme}
//                   user={user}
//                   selectedProducts={
//                     selectedProducts
//                   }
//                   addProduct={addProduct}
//                   updateQuantity={
//                     updateQuantity
//                   }
//                   updateCartoon={
//                     updateCartoon
//                   }
//                   cartoonSelection={
//                     cartoonSelection
//                   }
//                   cardWidth="w-full"
//                 />
//               );

//             })}

//           </div>

//         )}

//       </main>

//     </div>
//   );
// }

// 📁 src/pages/SparePartsProductPage.jsx

// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";

// import { useCachedProducts } from "../hooks/useCachedProducts";
// import { useSchemes } from "../hooks/useSchemes";
// import { useSelectedProducts } from "../hooks/useSelectedProducts";
// import { useAuth } from "../context/AuthContext";

// import ProductCard from "../components/ProductCard";
// import MobilePageHeader from "../components/MobilePageHeader";

// import { Search, PackageOpen } from "lucide-react";

// export default function SparePartsProductPage() {
//   const { partGroup } = useParams();

//   const { user } = useAuth();

//   const {
//     data: allProducts = [],
//     isLoading,
//   } = useCachedProducts();

//   const {
//     data: schemes = [],
//   } = useSchemes();

//   const {
//     selectedProducts,
//     addProduct,
//     updateQuantity,
//     updateCartoon,
//     cartoonSelection,
//   } = useSelectedProducts();

//   const [search, setSearch] = useState("");

//   // =========================================================
//   // DECODE SELECTED SPEAKER / MODEL
//   // =========================================================

//   const decodedGroup = decodeURIComponent(partGroup || "");

//   // =========================================================
//   // NORMALIZE TEXT
//   // =========================================================

//   const normalizeText = (value) => {
//     return String(value ?? "")
//       .trim()
//       .toLowerCase();
//   };

//   // =========================================================
//   // NEW SPEAKER SPARE PART CATEGORIES
//   // =========================================================

//   const SPEAKER_SPARE_CATEGORIES = [
//     "speaker pcb",
//     "speaker packing",
//     "speaker housing",
//   ];

//   // =========================================================
//   // FILTER SPEAKER SPARE PARTS
//   // =========================================================

//   const spareParts = allProducts.filter((product) => {

//     // -------------------------------------------------------
//     // ONLY ACTIVE PRODUCTS
//     // -------------------------------------------------------

//     if (product.is_active !== true) {
//       return false;
//     }

//     // -------------------------------------------------------
//     // PRODUCT NAME
//     // -------------------------------------------------------

//     const productName = normalizeText(
//       product.product_name
//     );

//     if (!productName) {
//       return false;
//     }

//     // -------------------------------------------------------
//     // SELECTED SPEAKER / MODEL
//     //
//     // Example:
//     // DHURANDHAR
//     // SHARK SPEAKER
//     // AVATAR
//     // SP370
//     // etc.
//     // -------------------------------------------------------

//     const group = normalizeText(
//       decodedGroup
//     );

//     if (!group) {
//       return false;
//     }

//     // -------------------------------------------------------
//     // NEW CATEGORY
//     //
//     // Normally this should be:
//     //
//     // product.category
//     //
//     // SPEAKER PCB
//     // SPEAKER PACKING
//     // SPEAKER HOUSING
//     // -------------------------------------------------------

//     const category = normalizeText(
//       product.category
//     );

//     // -------------------------------------------------------
//     // BACKUP FIELDS
//     //
//     // These are kept only for compatibility with
//     // existing API/product structures.
//     // -------------------------------------------------------

//     const subCategory = normalizeText(
//       product.sub_category
//     );

//     const productType = normalizeText(
//       product.product_type
//     );

//     // -------------------------------------------------------
//     // CHECK NEW SPEAKER SPARE CATEGORY
//     //
//     // Primary:
//     // category
//     //
//     // Backup:
//     // sub_category
//     // product_type
//     // -------------------------------------------------------

//     const isSpeakerSparePart =
//       SPEAKER_SPARE_CATEGORIES.includes(category) ||
//       SPEAKER_SPARE_CATEGORIES.includes(subCategory) ||
//       SPEAKER_SPARE_CATEGORIES.includes(productType);

//     // -------------------------------------------------------
//     // NOT SPEAKER PCB / PACKING / HOUSING
//     // -------------------------------------------------------

//     if (!isSpeakerSparePart) {
//       return false;
//     }

//     // -------------------------------------------------------
//     // MUST BELONG TO SELECTED MODEL
//     //
//     // Example:
//     //
//     // URL = /spare-parts/DHURANDHAR
//     //
//     // Matches:
//     //
//     // DHURANDHAR PCB
//     // DHURANDHAR PACKING
//     // DHURANDHAR HOUSING
//     //
//     // Does NOT match:
//     //
//     // SHARK SPEAKER PCB
//     // AVATAR PCB
//     // etc.
//     // -------------------------------------------------------

//     return productName.includes(group);
//   });

//   // =========================================================
//   // SEARCH
//   // =========================================================

//   const searchText = search
//     .trim()
//     .toLowerCase();

//   const filteredProducts = searchText
//     ? spareParts.filter((product) => {

//         const name = normalizeText(
//           product.product_name
//         );

//         const type = normalizeText(
//           product.product_type
//         );

//         return (
//           name.includes(searchText) ||
//           type.includes(searchText)
//         );
//       })
//     : spareParts;

//   // =========================================================
//   // SORT BY PRICE
//   // =========================================================

//   const sortedProducts = [
//     ...filteredProducts,
//   ].sort((a, b) => {

//     const priceA =
//       Number(a.price) || 0;

//     const priceB =
//       Number(b.price) || 0;

//     return priceA - priceB;
//   });

//   // =========================================================
//   // RESET SEARCH WHEN GROUP CHANGES
//   // =========================================================

//   useEffect(() => {
//     setSearch("");
//   }, [partGroup]);

//   // =========================================================
//   // CHECK SCHEME
//   // =========================================================

//   const hasScheme = (productId) => {

//     return schemes.some((scheme) => {

//       if (
//         !Array.isArray(
//           scheme.conditions
//         )
//       ) {
//         return false;
//       }

//       return scheme.conditions.some(
//         (condition) =>
//           Number(condition.product) ===
//           Number(productId)
//       );
//     });
//   };

//   // =========================================================
//   // LOADING
//   // =========================================================

//   if (isLoading) {

//     return (
//       <div className="min-h-screen bg-gray-50">

//         <MobilePageHeader
//           title={decodedGroup}
//         />

//         <div
//           className="
//             pt-[70px]
//             sm:pt-5
//             flex
//             justify-center
//             items-center
//             h-60
//           "
//         >

//           <p className="text-xs text-gray-500">
//             Loading spare parts...
//           </p>

//         </div>

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
//         px-2
//         sm:px-4
//         pb-20
//       "
//     >

//       {/* =====================================================
//           MOBILE HEADER
//       ===================================================== */}

//       <MobilePageHeader
//         title={decodedGroup}
//       />

//       <main
//         className="
//           mx-auto
//           pt-[60px]
//           sm:pt-4
//         "
//       >

//         {/* ===================================================
//             PRODUCTS
//         =================================================== */}

//         {sortedProducts.length === 0 ? (

//           <div
//             className="
//               bg-white
//               border
//               border-gray-200
//               rounded-lg
//               py-12
//               px-4
//               text-center
//             "
//           >

//             <PackageOpen
//               size={32}
//               className="
//                 mx-auto
//                 text-gray-300
//                 mb-2
//               "
//             />

//             <p
//               className="
//                 text-xs
//                 font-medium
//                 text-gray-600
//               "
//             >
//               No spare parts found
//             </p>

//             <p
//               className="
//                 text-[10px]
//                 text-gray-400
//                 mt-1
//               "
//             >
//               No parts available for{" "}
//               {decodedGroup}
//             </p>

//           </div>

//         ) : (

//           <div
//             className="
//               grid
//               grid-cols-2
//               sm:grid-cols-3
//               md:grid-cols-4
//               lg:grid-cols-5
//               gap-2
//               sm:gap-3
//             "
//           >

//             {sortedProducts.map((prod) => {

//               const prodId =
//                 prod.id ??
//                 prod.product_id;

//               return (
//                 <ProductCard
//                   key={prodId}
//                   prod={prod}
//                   hasScheme={hasScheme}
//                   user={user}
//                   selectedProducts={
//                     selectedProducts
//                   }
//                   addProduct={addProduct}
//                   updateQuantity={
//                     updateQuantity
//                   }
//                   updateCartoon={
//                     updateCartoon
//                   }
//                   cartoonSelection={
//                     cartoonSelection
//                   }
//                   cardWidth="w-full"
//                 />
//               );

//             })}

//           </div>

//         )}

//       </main>

//     </div>
//   );
// }



// import { useEffect, useMemo, useState } from "react";
// import { useParams } from "react-router-dom";

// import { useCachedProducts } from "../hooks/useCachedProducts";
// import { useSchemes } from "../hooks/useSchemes";
// import { useSelectedProducts } from "../hooks/useSelectedProducts";
// import { useAuth } from "../context/AuthContext";

// import ProductCard from "../components/ProductCard";
// import MobilePageHeader from "../components/MobilePageHeader";

// import { Search, PackageOpen } from "lucide-react";

// export default function SparePartsProductPage() {
//   const { partGroup } = useParams();

//   const { user } = useAuth();

//   const {
//     data: allProducts = [],
//     isLoading,
//   } = useCachedProducts();

//   const {
//     data: schemes = [],
//   } = useSchemes();

//   const {
//     selectedProducts,
//     addProduct,
//     updateQuantity,
//     updateCartoon,
//     cartoonSelection,
//   } = useSelectedProducts();

//   const [search, setSearch] = useState("");

//   // =========================================================
//   // DECODE SELECTED SPEAKER / MODEL
//   // =========================================================

//   const decodedGroup = decodeURIComponent(
//     partGroup || ""
//   );

//   // =========================================================
//   // NORMALIZE TEXT
//   //
//   // Used for model matching.
//   //
//   // SP 15       -> sp15
//   // SP15 PCB    -> sp15pcb
//   // Party Boy   -> partyboy
//   // =========================================================

//   const normalizeText = (value) => {
//     return String(value ?? "")
//       .trim()
//       .toLowerCase()
//       .replace(/[^a-z0-9]/g, "");
//   };

//   // =========================================================
//   // ONLY THESE THREE TYPES ARE SPEAKER SPARE PARTS
//   // =========================================================

//   const SPEAKER_SPARE_CATEGORIES = useMemo(
//     () =>
//       new Set([
//         "speaker pcb",
//         "speaker packing",
//         "speaker housing",
//       ]),
//     []
//   );

//   // =========================================================
//   // CHECK WHETHER PRODUCT IS A SPEAKER SPARE PART
//   //
//   // We check category first, then keep sub_category and
//   // product_type as compatibility fallbacks.
//   // =========================================================

//   const isSpeakerSparePart = (product) => {
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
//   // CHECK WHETHER PRODUCT BELONGS TO SELECTED MODEL
//   //
//   // IMPORTANT:
//   //
//   // SP15  -> SP15 PCB       ✅
//   // SP15  -> SP151 PCB      ❌
//   // SP15  -> SP152 PCB      ❌
//   //
//   // SP151 -> SP151 PCB      ✅
//   // SP151 -> SP15 PCB       ❌
//   //
//   // SP370 -> SP370 PCB      ✅
//   //
//   // For normal names:
//   //
//   // DHURANDHAR -> DHURANDHAR PCB       ✅
//   // DHURANDHAR -> SHARK PCB            ❌
//   //
//   // We allow the model name followed by known spare-part
//   // suffixes.
//   // =========================================================

//   const matchesSelectedModel = (
//     productName,
//     selectedModel
//   ) => {
//     const product = normalizeText(productName);
//     const model = normalizeText(selectedModel);

//     if (!product || !model) {
//       return false;
//     }

//     // =======================================================
//     // MODEL MUST EXIST IN PRODUCT NAME
//     // =======================================================

//     const index = product.indexOf(model);

//     if (index === -1) {
//       return false;
//     }

//     // =======================================================
//     // CHECK CHARACTER AFTER MODEL
//     // =======================================================

//     const afterModel =
//       product[index + model.length] || "";

//     // =======================================================
//     // MOST IMPORTANT CASE:
//     //
//     // SP15 inside SP151 / SP152
//     //
//     // If model ends with number and next character is
//     // another number, it is a different model.
//     // =======================================================

//     const modelEndsWithNumber =
//       /\d$/.test(model);

//     if (
//       modelEndsWithNumber &&
//       /\d/.test(afterModel)
//     ) {
//       return false;
//     }

//     // =======================================================
//     // EXACT MODEL
//     //
//     // Product name can be exactly the model.
//     // =======================================================

//     if (product === model) {
//       return true;
//     }

//     // =======================================================
//     // KNOWN SPARE PART SUFFIXES
//     //
//     // Examples:
//     //
//     // SP15PCB
//     // SP15PACKING
//     // SP15HOUSING
//     //
//     // SP370PCB
//     // DHURANDHARPCB
//     // PARTYBOYSPEAKERHOUSING
//     // =======================================================

//     const remaining =
//       product.slice(index + model.length);

//     const validSuffixes = [
//       "pcb",
//       "packing",
//       "housing",
//       "speakerpcb",
//       "speakerpacking",
//       "speakerhousing",
//     ];

//     if (
//       validSuffixes.some((suffix) =>
//         remaining.startsWith(suffix)
//       )
//     ) {
//       return true;
//     }

//     // =======================================================
//     // If something else is directly attached to the model,
//     // do NOT assume it belongs to this model.
//     //
//     // This prevents broad includes() matching.
//     // =======================================================

//     return false;
//   };

//   // =========================================================
//   // FILTER SPEAKER SPARE PARTS
//   // =========================================================

//   const spareParts = useMemo(() => {
//     const group = normalizeText(decodedGroup);

//     if (!group) {
//       return [];
//     }

//     return allProducts.filter((product) => {
//       // -----------------------------------------------------
//       // ACTIVE ONLY
//       // -----------------------------------------------------

//       if (product.is_active !== true) {
//         return false;
//       }

//       // -----------------------------------------------------
//       // ONLY SPEAKER PCB / PACKING / HOUSING
//       // -----------------------------------------------------

//       if (!isSpeakerSparePart(product)) {
//         return false;
//       }

//       // -----------------------------------------------------
//       // PRODUCT NAME
//       // -----------------------------------------------------

//       const productName = String(
//         product.product_name || ""
//       ).trim();

//       if (!productName) {
//         return false;
//       }

//       // -----------------------------------------------------
//       // EXACT MODEL MATCH
//       // -----------------------------------------------------

//       return matchesSelectedModel(
//         productName,
//         group
//       );
//     });
//   }, [
//     allProducts,
//     decodedGroup,
//     SPEAKER_SPARE_CATEGORIES,
//   ]);

//   // =========================================================
//   // SEARCH
//   //
//   // Search stays inside the already selected model.
//   //
//   // Example:
//   // /spare-parts/SP15
//   //
//   // Search "pcb" -> only SP15 PCB
//   // Search "housing" -> only SP15 Housing
//   //
//   // It can NEVER bring SP151/SP152 into this page.
//   // =========================================================

//   const searchText = search
//     .trim()
//     .toLowerCase();

//   const filteredProducts = useMemo(() => {
//     if (!searchText) {
//       return spareParts;
//     }

//     return spareParts.filter((product) => {
//       const name = String(
//         product.product_name || ""
//       ).toLowerCase();

//       const type = String(
//         product.product_type || ""
//       ).toLowerCase();

//       const category = String(
//         product.category || ""
//       ).toLowerCase();

//       const subCategory = String(
//         product.sub_category || ""
//       ).toLowerCase();

//       return (
//         name.includes(searchText) ||
//         type.includes(searchText) ||
//         category.includes(searchText) ||
//         subCategory.includes(searchText)
//       );
//     });
//   }, [
//     spareParts,
//     searchText,
//   ]);

//   // =========================================================
//   // SORT BY PRICE
//   // =========================================================

//   const sortedProducts = useMemo(() => {
//     return [...filteredProducts].sort(
//       (a, b) => {
//         const priceA =
//           Number(a.price) || 0;

//         const priceB =
//           Number(b.price) || 0;

//         return priceA - priceB;
//       }
//     );
//   }, [filteredProducts]);

//   // =========================================================
//   // RESET SEARCH WHEN MODEL CHANGES
//   // =========================================================

//   useEffect(() => {
//     setSearch("");
//   }, [partGroup]);

//   // =========================================================
//   // CHECK SCHEME
//   // =========================================================

//   const hasScheme = (productId) => {
//     return schemes.some((scheme) => {
//       if (
//         !Array.isArray(
//           scheme.conditions
//         )
//       ) {
//         return false;
//       }

//       return scheme.conditions.some(
//         (condition) =>
//           Number(condition.product) ===
//           Number(productId)
//       );
//     });
//   };

//   // =========================================================
//   // LOADING
//   // =========================================================

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50">

//         <MobilePageHeader
//           title={decodedGroup}
//         />

//         <div
//           className="
//             pt-[70px]
//             sm:pt-5
//             flex
//             justify-center
//             items-center
//             h-60
//           "
//         >
//           <p className="text-xs text-gray-500">
//             Loading spare parts...
//           </p>
//         </div>

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
//         px-2
//         sm:px-4
//         pb-20
//       "
//     >

//       {/* =====================================================
//           MOBILE HEADER
//       ===================================================== */}

//       <MobilePageHeader
//         title={decodedGroup}
//       />

//       <main
//         className="
//           mx-auto
//           pt-[60px]
//           sm:pt-4
//         "
//       >

//         {/* ===================================================
//             SEARCH
//         =================================================== */}

//         {spareParts.length > 0 && (
//           <div
//             className="
//               mb-3
//               bg-white
//               border
//               border-gray-200
//               rounded-lg
//               px-3
//               py-2
//               flex
//               items-center
//               gap-2
//             "
//           >

//             <Search
//               size={15}
//               className="text-gray-400 flex-shrink-0"
//             />

//             <input
//               type="text"
//               value={search}
//               onChange={(e) =>
//                 setSearch(e.target.value)
//               }
//               placeholder="Search spare parts..."
//               className="
//                 w-full
//                 bg-transparent
//                 outline-none
//                 text-xs
//                 text-gray-700
//                 placeholder:text-gray-400
//               "
//             />

//             {search && (
//               <button
//                 type="button"
//                 onClick={() =>
//                   setSearch("")
//                 }
//                 className="
//                   text-[10px]
//                   text-gray-400
//                   hover:text-gray-600
//                   flex-shrink-0
//                 "
//               >
//                 Clear
//               </button>
//             )}

//           </div>
//         )}

//         {/* ===================================================
//             PRODUCTS
//         =================================================== */}

//         {sortedProducts.length === 0 ? (

//           <div
//             className="
//               bg-white
//               border
//               border-gray-200
//               rounded-lg
//               py-12
//               px-4
//               text-center
//             "
//           >

//             <PackageOpen
//               size={32}
//               className="
//                 mx-auto
//                 text-gray-300
//                 mb-2
//               "
//             />

//             <p
//               className="
//                 text-xs
//                 font-medium
//                 text-gray-600
//               "
//             >
//               {search
//                 ? "No matching spare parts"
//                 : "No spare parts found"}
//             </p>

//             <p
//               className="
//                 text-[10px]
//                 text-gray-400
//                 mt-1
//               "
//             >
//               {search
//                 ? `No results for "${search}"`
//                 : `No parts available for ${decodedGroup}`}
//             </p>

//             {search && (
//               <button
//                 type="button"
//                 onClick={() =>
//                   setSearch("")
//                 }
//                 className="
//                   mt-3
//                   text-[10px]
//                   font-medium
//                   text-blue-600
//                   hover:text-blue-700
//                 "
//               >
//                 Clear search
//               </button>
//             )}

//           </div>

//         ) : (

//           <div
//             className="
//               grid
//               grid-cols-2
//               sm:grid-cols-3
//               md:grid-cols-4
//               lg:grid-cols-5
//               gap-2
//               sm:gap-3
//             "
//           >

//             {sortedProducts.map((prod) => {

//               const prodId =
//                 prod.id ??
//                 prod.product_id;

//               return (
//                 <ProductCard
//                   key={prodId}
//                   prod={prod}
//                   hasScheme={hasScheme}
//                   user={user}
//                   selectedProducts={
//                     selectedProducts
//                   }
//                   addProduct={
//                     addProduct
//                   }
//                   updateQuantity={
//                     updateQuantity
//                   }
//                   updateCartoon={
//                     updateCartoon
//                   }
//                   cartoonSelection={
//                     cartoonSelection
//                   }
//                   cardWidth="w-full"
//                 />
//               );
//             })}

//           </div>
//         )}

//       </main>
//     </div>
//   );
// }




import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSchemes } from "../hooks/useSchemes";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useAuth } from "../context/AuthContext";

import ProductCard from "../components/ProductCard";
import MobilePageHeader from "../components/MobilePageHeader";

import { Search, PackageOpen } from "lucide-react";

export default function SparePartsProductPage() {
  const { partGroup } = useParams();

  const { user } = useAuth();

  const {
    data: allProducts = [],
    isLoading,
  } = useCachedProducts();

  const {
    data: schemes = [],
  } = useSchemes();

  const {
    selectedProducts,
    addProduct,
    updateQuantity,
    updateCartoon,
    cartoonSelection,
  } = useSelectedProducts();

  const [search, setSearch] = useState("");

  // =========================================================
  // DECODE MODEL
  // =========================================================

  const decodedGroup = decodeURIComponent(
    partGroup || ""
  );

  // =========================================================
  // NORMALIZE
  // =========================================================

  const normalizeText = (value) => {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  };

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
  // GET PRODUCT SEARCH TEXT
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
  // GET MODEL VARIANTS
  //
  // Shark Speaker
  // ↓
  // sharkspeaker
  // shark
  //
  // SP Sound Breaker
  // ↓
  // spsoundbreaker
  // soundbreaker
  //
  // SP15
  // ↓
  // sp15
  //
  // Numeric models remain protected.
  // =========================================================

  const getModelVariants = (model) => {
    const normalized = normalizeText(model);

    if (!normalized) {
      return [];
    }

    const variants = new Set();

    variants.add(normalized);

    // -------------------------------------------------------
    // Remove leading SP for text models
    //
    // SP SOUND BREAKER → SOUND BREAKER
    //
    // But SP15 → DON'T create "15"
    // -------------------------------------------------------

    if (
      normalized.startsWith("sp") &&
      normalized.length > 2 &&
      !/\d/.test(normalized.slice(2))
    ) {
      variants.add(
        normalized.slice(2)
      );
    }

    // -------------------------------------------------------
    // IMPORTANT FIX:
    //
    // SHARK SPEAKER
    // ↓
    // SHARK
    //
    // PARTY BOY SPEAKER
    // ↓
    // PARTY BOY
    //
    // RAFTAAR SPEAKER
    // ↓
    // RAFTAAR
    // -------------------------------------------------------

    const withoutSpeaker =
      normalized.replace(
        /speaker$/,
        ""
      );

    if (
      withoutSpeaker &&
      withoutSpeaker !== normalized
    ) {
      variants.add(
        withoutSpeaker
      );
    }

    // -------------------------------------------------------
    // If SP + SPEAKER model:
    //
    // SP SHARK SPEAKER
    // ↓
    // SHARK
    // -------------------------------------------------------

    if (
      withoutSpeaker.startsWith("sp") &&
      withoutSpeaker.length > 2 &&
      !/\d/.test(
        withoutSpeaker.slice(2)
      )
    ) {
      variants.add(
        withoutSpeaker.slice(2)
      );
    }

    return [
      ...variants,
    ].filter(Boolean);
  };

  // =========================================================
  // MODEL MATCH
  //
  // Examples:
  //
  // Shark Speaker
  // → SHARK PCB       ✅
  // → SHARK Packing   ✅
  // → SHARK Housing   ✅
  // → SHARK BT PCB    ✅
  //
  // HT05
  // → HT05 PCB        ✅
  // → HT05 PCB        ✅
  // → HT05 Housing    ✅
  //
  // SP15
  // → SP15 PCB        ✅
  // → SP151 PCB       ❌
  // =========================================================

  const matchesSelectedModel = (
    product,
    selectedModel
  ) => {
    const productText =
      getProductSearchText(product);

    if (!productText) {
      return false;
    }

    const variants =
      getModelVariants(
        selectedModel
      );

    if (!variants.length) {
      return false;
    }

    return variants.some(
      (model) => {

        const index =
          productText.indexOf(model);

        if (index === -1) {
          return false;
        }

        // ---------------------------------------------------
        // NUMERIC MODEL PROTECTION
        //
        // SP15 ≠ SP151
        // ---------------------------------------------------

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

        // ---------------------------------------------------
        // TEXT AFTER MODEL
        // ---------------------------------------------------

        const remaining =
          productText.slice(
            index + model.length
          );

        if (!remaining) {
          return false;
        }

        // ---------------------------------------------------
        // SPARE PART INDICATORS
        //
        // We don't restrict to only 3 types.
        //
        // Future:
        // Display PCB
        // Charging PCB
        // Mic PCB
        // BT PCB
        // etc.
        // ---------------------------------------------------

        const spareMarkers = [
          "pcb",
          "packing",
          "housing",
          "spare",
          "btpcb",
          "bluetoothpcb",
        ];

        return spareMarkers.some(
          (marker) =>
            remaining.includes(marker)
        );
      }
    );
  };

  // =========================================================
  // FIND ALL SPARE PARTS
  // =========================================================

  const spareParts = useMemo(() => {
    const group =
      decodedGroup.trim();

    if (!group) {
      return [];
    }

    return allProducts.filter(
      (product) => {

        // ---------------------------------------------------
        // ACTIVE
        // ---------------------------------------------------

        if (
          !isActiveProduct(product)
        ) {
          return false;
        }

        // ---------------------------------------------------
        // MAIN SPEAKER PRODUCT KO REMOVE
        //
        // sub_category = SPEAKER
        // is page ka model hai, spare part nahi.
        // ---------------------------------------------------

        if (
          normalizeText(
            product?.sub_category
          ) === "speaker"
        ) {
          return false;
        }

        // ---------------------------------------------------
        // MODEL MATCH
        // ---------------------------------------------------

        return matchesSelectedModel(
          product,
          group
        );
      }
    );
  }, [
    allProducts,
    decodedGroup,
  ]);

  // =========================================================
  // SEARCH
  // =========================================================

  const searchText =
    search.trim().toLowerCase();

  const filteredProducts =
    useMemo(() => {

      if (!searchText) {
        return spareParts;
      }

      return spareParts.filter(
        (product) => {

          const searchableText =
            String(
              [
                product?.product_name,
                product?.name,
                product?.sale_name,
                product?.product_type,
                product?.category,
                product?.sub_category,
                product?.description,
              ]
                .filter(Boolean)
                .join(" ")
            ).toLowerCase();

          return searchableText.includes(
            searchText
          );
        }
      );
    }, [
      spareParts,
      searchText,
    ]);

  // =========================================================
  // SORT BY PRICE
  //
  // IMPORTANT:
  // No duplicate removal.
  // =========================================================

  const sortedProducts =
    useMemo(() => {

      return [
        ...filteredProducts,
      ].sort((a, b) => {

        const priceA =
          Number(a?.price) || 0;

        const priceB =
          Number(b?.price) || 0;

        return priceA - priceB;
      });

    }, [
      filteredProducts,
    ]);

  // =========================================================
  // RESET SEARCH
  // =========================================================

  useEffect(() => {
    setSearch("");
  }, [partGroup]);

  // =========================================================
  // SCHEME
  // =========================================================

  const hasScheme = (productId) => {

    return schemes.some(
      (scheme) => {

        if (
          !Array.isArray(
            scheme?.conditions
          )
        ) {
          return false;
        }

        return scheme.conditions.some(
          (condition) =>
            Number(
              condition?.product
            ) === Number(productId)
        );
      }
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">

        <MobilePageHeader
          title={decodedGroup}
        />

        <div
          className="
            pt-[70px]
            sm:pt-5
            flex
            justify-center
            items-center
            h-60
          "
        >
          <p className="text-xs text-gray-500">
            Loading spare parts...
          </p>
        </div>

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
        px-2
        sm:px-4
        pb-20
      "
    >

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <MobilePageHeader
        title={decodedGroup}
      />

      <main
        className="
          mx-auto
          pt-[60px]
          sm:pt-4
        "
      >

        {/* ===================================================
            SEARCH
        =================================================== */}

        {spareParts.length > 0 && (
          <div
            className="
              mb-3
              bg-white
              border
              border-gray-200
              rounded-lg
              px-3
              py-2
              flex
              items-center
              gap-2
            "
          >

            <Search
              size={15}
              className="
                text-gray-400
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
              placeholder="Search spare parts..."
              className="
                w-full
                bg-transparent
                outline-none
                text-xs
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
                  text-[10px]
                  text-gray-400
                  hover:text-gray-600
                  flex-shrink-0
                "
              >
                Clear
              </button>
            )}

          </div>
        )}

        {/* ===================================================
            RESULT INFO
        =================================================== */}

        {spareParts.length > 0 && (
          <div
            className="
              flex
              items-center
              justify-between
              px-1
              mb-2
            "
          >

            <span
              className="
                text-[10px]
                text-gray-400
              "
            >
              {search
                ? `${sortedProducts.length} parts found`
                : `${spareParts.length} spare parts`}
            </span>

            <span
              className="
                text-[10px]
                text-gray-400
              "
            >
              {decodedGroup}
            </span>

          </div>
        )}

        {/* ===================================================
            PRODUCTS
        =================================================== */}

        {sortedProducts.length === 0 ? (

          <div
            className="
              bg-white
              border
              border-gray-200
              rounded-lg
              py-12
              px-4
              text-center
            "
          >

            <PackageOpen
              size={32}
              className="
                mx-auto
                text-gray-300
                mb-2
              "
            />

            <p
              className="
                text-xs
                font-medium
                text-gray-600
              "
            >
              {search
                ? "No matching spare parts"
                : "No spare parts found"}
            </p>

            <p
              className="
                text-[10px]
                text-gray-400
                mt-1
              "
            >
              {search
                ? `No results for "${search}"`
                : `No parts available for ${decodedGroup}`}
            </p>

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="
                  mt-3
                  text-[10px]
                  font-medium
                  text-blue-600
                  hover:text-blue-700
                "
              >
                Clear search
              </button>
            )}

          </div>

        ) : (

          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-5
              gap-2
              sm:gap-3
            "
          >

            {sortedProducts.map(
              (prod, index) => {

                const prodId =
                  prod?.id ??
                  prod?.product_id ??
                  prod?.product_code ??
                  "spare";

                return (
                  <ProductCard
                    key={`${prodId}-${index}`}
                    prod={prod}
                    hasScheme={hasScheme}
                    user={user}
                    selectedProducts={
                      selectedProducts
                    }
                    addProduct={
                      addProduct
                    }
                    updateQuantity={
                      updateQuantity
                    }
                    updateCartoon={
                      updateCartoon
                    }
                    cartoonSelection={
                      cartoonSelection
                    }
                    cardWidth="w-full"
                  />
                );
              }
            )}

          </div>
        )}

      </main>
    </div>
  );
}