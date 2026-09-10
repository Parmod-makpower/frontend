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

import { useEffect, useState } from "react";
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
  // DECODE SELECTED SPEAKER / MODEL
  // =========================================================

  const decodedGroup = decodeURIComponent(partGroup || "");

  // =========================================================
  // NORMALIZE TEXT
  // =========================================================

  const normalizeText = (value) => {
    return String(value ?? "")
      .trim()
      .toLowerCase();
  };

  // =========================================================
  // NEW SPEAKER SPARE PART CATEGORIES
  // =========================================================

  const SPEAKER_SPARE_CATEGORIES = [
    "speaker pcb",
    "speaker packing",
    "speaker housing",
  ];

  // =========================================================
  // FILTER SPEAKER SPARE PARTS
  // =========================================================

  const spareParts = allProducts.filter((product) => {

    // -------------------------------------------------------
    // ONLY ACTIVE PRODUCTS
    // -------------------------------------------------------

    if (product.is_active !== true) {
      return false;
    }

    // -------------------------------------------------------
    // PRODUCT NAME
    // -------------------------------------------------------

    const productName = normalizeText(
      product.product_name
    );

    if (!productName) {
      return false;
    }

    // -------------------------------------------------------
    // SELECTED SPEAKER / MODEL
    //
    // Example:
    // DHURANDHAR
    // SHARK SPEAKER
    // AVATAR
    // SP370
    // etc.
    // -------------------------------------------------------

    const group = normalizeText(
      decodedGroup
    );

    if (!group) {
      return false;
    }

    // -------------------------------------------------------
    // NEW CATEGORY
    //
    // Normally this should be:
    //
    // product.category
    //
    // SPEAKER PCB
    // SPEAKER PACKING
    // SPEAKER HOUSING
    // -------------------------------------------------------

    const category = normalizeText(
      product.category
    );

    // -------------------------------------------------------
    // BACKUP FIELDS
    //
    // These are kept only for compatibility with
    // existing API/product structures.
    // -------------------------------------------------------

    const subCategory = normalizeText(
      product.sub_category
    );

    const productType = normalizeText(
      product.product_type
    );

    // -------------------------------------------------------
    // CHECK NEW SPEAKER SPARE CATEGORY
    //
    // Primary:
    // category
    //
    // Backup:
    // sub_category
    // product_type
    // -------------------------------------------------------

    const isSpeakerSparePart =
      SPEAKER_SPARE_CATEGORIES.includes(category) ||
      SPEAKER_SPARE_CATEGORIES.includes(subCategory) ||
      SPEAKER_SPARE_CATEGORIES.includes(productType);

    // -------------------------------------------------------
    // NOT SPEAKER PCB / PACKING / HOUSING
    // -------------------------------------------------------

    if (!isSpeakerSparePart) {
      return false;
    }

    // -------------------------------------------------------
    // MUST BELONG TO SELECTED MODEL
    //
    // Example:
    //
    // URL = /spare-parts/DHURANDHAR
    //
    // Matches:
    //
    // DHURANDHAR PCB
    // DHURANDHAR PACKING
    // DHURANDHAR HOUSING
    //
    // Does NOT match:
    //
    // SHARK SPEAKER PCB
    // AVATAR PCB
    // etc.
    // -------------------------------------------------------

    return productName.includes(group);
  });

  // =========================================================
  // SEARCH
  // =========================================================

  const searchText = search
    .trim()
    .toLowerCase();

  const filteredProducts = searchText
    ? spareParts.filter((product) => {

        const name = normalizeText(
          product.product_name
        );

        const type = normalizeText(
          product.product_type
        );

        return (
          name.includes(searchText) ||
          type.includes(searchText)
        );
      })
    : spareParts;

  // =========================================================
  // SORT BY PRICE
  // =========================================================

  const sortedProducts = [
    ...filteredProducts,
  ].sort((a, b) => {

    const priceA =
      Number(a.price) || 0;

    const priceB =
      Number(b.price) || 0;

    return priceA - priceB;
  });

  // =========================================================
  // RESET SEARCH WHEN GROUP CHANGES
  // =========================================================

  useEffect(() => {
    setSearch("");
  }, [partGroup]);

  // =========================================================
  // CHECK SCHEME
  // =========================================================

  const hasScheme = (productId) => {

    return schemes.some((scheme) => {

      if (
        !Array.isArray(
          scheme.conditions
        )
      ) {
        return false;
      }

      return scheme.conditions.some(
        (condition) =>
          Number(condition.product) ===
          Number(productId)
      );
    });
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
              No spare parts found
            </p>

            <p
              className="
                text-[10px]
                text-gray-400
                mt-1
              "
            >
              No parts available for{" "}
              {decodedGroup}
            </p>

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

            {sortedProducts.map((prod) => {

              const prodId =
                prod.id ??
                prod.product_id;

              return (
                <ProductCard
                  key={prodId}
                  prod={prod}
                  hasScheme={hasScheme}
                  user={user}
                  selectedProducts={
                    selectedProducts
                  }
                  addProduct={addProduct}
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

            })}

          </div>

        )}

      </main>

    </div>
  );
}