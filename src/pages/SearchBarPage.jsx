// // 📁 src/pages/SearchBarPage.jsx
// import { useEffect, useState, useRef, useMemo, useCallback } from "react";
// import { IoChevronBack } from "react-icons/io5";
// import { FaPlus, FaGift } from "react-icons/fa";
// import { useCachedProducts } from "../hooks/useCachedProducts";
// import { useSchemes } from "../hooks/useSchemes";
// import { FixedSizeList as List } from "react-window";
// import useFuseSearch from "../hooks/useFuseSearch";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { useSelectedProducts } from "../hooks/useSelectedProducts";
// import { useStock } from "../context/StockContext";


// function Loader() {
//   return (
//     <div className="flex justify-center items-center py-10">
//       <div className="w-6 h-6 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
//     </div>
//   );
// }

// const normalizeProduct = (product) => ({
//   ...product,
//   id: product.id ?? product.product_id,
// });

// export default function SearchBarPage() {
//   const { user } = useAuth();
//   const {
//     selectedProducts,
//     addProduct,
//     updateQuantity,
//     updateCartoon,
//     cartoonSelection,
//   } = useSelectedProducts();

//   const [searchTerm, setSearchTerm] = useState("");
//   const searchRef = useRef();
//   const navigate = useNavigate();
//   const { getStockValue } = useStock();
//   const { data: allProductsRaw = [], isLoading } = useCachedProducts();
//   const { data: schemes = [] } = useSchemes();

//   // ✅ Auto focus searchbox
//   useEffect(() => {
//     searchRef.current?.focus();
//   }, []);

//   const allProducts = useMemo(
//     () => allProductsRaw.map(normalizeProduct).filter((p) => p.is_active === true),
//     [allProductsRaw]
//   );

//   // ✅ Fuse search
//   const fuseResults = useFuseSearch(allProducts, searchTerm, {
//     keys: ["sub_category", "product_name", "sale_names"],
//     threshold: 0.3,
//   });

//   // ✅ Remove duplicates
//   const searchResults = useMemo(() => {
//     const unique = new Map();
//     const lower = searchTerm.toLowerCase();

//     fuseResults.forEach((product) => {
//       const matchedSale = product.sale_names?.find((n) =>
//         n.toLowerCase().includes(lower)
//       );

//       const match =
//         product.product_name?.toLowerCase().includes(lower) ||
//         product.sub_category?.toLowerCase().includes(lower) ||
//         !!matchedSale;

//       if (match) {
//         unique.set(product.id, {
//           ...product,
//           _displayName: matchedSale || product.product_name,
//         });
//       }
//     });

//     return Array.from(unique.values());
//   }, [fuseResults, searchTerm]);

//   const hasScheme = (productId) =>
//     schemes.some(
//       (scheme) =>
//         Array.isArray(scheme.conditions) &&
//         scheme.conditions.some((cond) => cond.product === productId)
//     );

//   const isAdded = (id) => selectedProducts.some((p) => p.id === id);
//   const handleAddProduct = (product) => {
//     if (!isAdded(product.id)) {
//       const isDS = user?.role === "DS";
//       const moq = product.moq || 1;

//       const initialQty = isDS
//         ? 1
//         : product.cartoon_size && product.cartoon_size > 1
//           ? product.cartoon_size
//           : moq;

//       addProduct({ ...product, quantity: initialQty });
//     }
//   };



//   // ✅ FINAL FOCUS-FIXED ROW COMPONENT
//   const Row = useCallback(
//     ({ index, style }) => {
//       const p = normalizeProduct(searchResults[index]);
//       const selectedItem = selectedProducts.find((x) => x.id === p.id);

//       const currentStock = getStockValue(p);
//       const outOfStock = currentStock <= (p.moq || 1);

//       // ✅ FIX: Local quantity state
//       const [localQty, setLocalQty] = useState(
//         selectedItem?.quantity ?? ""
//       );

//       // ✅ FIX: Cartoon check
//       const isDS = user?.role === "DS";
//       const hasCartoon =
//         selectedItem?.quantity_type === "CARTOON" && !isDS;


//       // ✅ Sync global → local
//       useEffect(() => {
//         setLocalQty(selectedItem?.quantity ?? "");
//       }, [selectedItem?.quantity]);


//       return (
//         <div
//           key={p.id}
//           style={style}
//           className="flex items-center justify-between px-3 py-2 border-b border-gray-300 hover:bg-gray-100 transition-all rounded-md"
//         >
//           {/* LEFT */}
//           <div
//             onClick={() => navigate(`/product/${p.id}`)}
//             className="flex flex-col flex-grow gap-1 cursor-pointer text-xs sm:text-sm text-gray-700"
//           >
//             <div className="flex items-center gap-2 font-medium truncate text-gray-800">
//               {p._displayName}

//               {user?.role !== "DS" && (<div>
//                 {!outOfStock ? (
//                   <span className="bg-blue-100 text-blue-600 text-[10px] px-1 py-[1px] rounded">
//                     In Stock
//                   </span>
//                 ) : (
//                   <span className="bg-red-100 text-red-600 text-[10px] px-1 py-[1px] rounded">
//                     Out of Stock
//                   </span>
//                 )}
//               </div>)}
//               {hasScheme(p.id) && (
//                 <FaGift className="text-pink-500 text-xs animate-pulse" />
//               )}
//             </div>

//             <div className="text-gray-500 text-[11px] sm:text-xs">
//               Product: {p.product_name}
//             </div>
//             <div className="text-gray-400 text-[11px] sm:text-xs">
//               {p.sub_category}
//             </div>
//           </div>

//           {/* RIGHT */}
//           {(user?.role === "SS" || user?.role === "DS" || user?.role === "ASM") && (
//             <div className="ml-3 flex items-center">
//               {selectedItem ? (
//                 hasCartoon ? (
//                   <select
//                     value={cartoonSelection[selectedItem.id] || 1}
//                     onChange={(e) =>
//                       updateCartoon(selectedItem.id, parseInt(e.target.value))
//                     }
//                     className="border rounded py-1 px-2 text-sm"
//                   >
//                     {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => (
//                       <option key={n} value={n}>
//                         {n} CTN
//                       </option>
//                     ))}
//                   </select>
//                 ) : (
//                   <input
//                     type="number"
//                     min={1}
//                     value={localQty}
//                     onChange={(e) => setLocalQty(e.target.value)}
//                     onBlur={() => {
//                       const parsed = parseInt(localQty);

//                       // 🟢 DS → no MOQ auto-fix
//                       if (isDS) {
//                         if (!isNaN(parsed)) {
//                           updateQuantity(p.id, parsed);
//                         }
//                         return;
//                       }

//                       // 🔵 SS → MOQ strict
//                       const moq = selectedItem.moq || 1;
//                       if (isNaN(parsed) || parsed < moq) {
//                         updateQuantity(p.id, moq);
//                         setLocalQty(moq);
//                       } else {
//                         updateQuantity(p.id, parsed);
//                       }
//                     }}

//                     className="w-20 border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
//                   />
//                 )
//               ) : (

//                 <button
//                   onClick={() => handleAddProduct(p)}
//                   className="bg-blue-100 p-3 rounded-full text-blue-600 hover:bg-blue-200 transition-all"
//                 >
//                   <FaPlus className="text-sm" />
//                 </button>

//               )}
//             </div>
//           )}
//         </div>
//       );
//     },
//     [searchResults, selectedProducts, cartoonSelection]
//   );

//   return (
//     <div className="flex flex-col h-screen max-h-screen bg-white">
//       {/* TOP BAR */}
//       <div className="fixed top-0 left-0 right-0 z-50 bg-white p-3 border-b border-gray-300 shadow flex items-center gap-2 overflow-hidden">
//         <button
//           onClick={() => window.history.back()}
//           className="text-gray-700 hover:text-blue-600 text-2xl font-bold px-1 transition-transform hover:scale-105"
//         >
//           <IoChevronBack />
//         </button>

//         <input
//           ref={searchRef}
//           type="text"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           maxLength={25}
//           placeholder="Search by product, sale name, or category..."
//           className="flex-1 min-w-0 w-full bg-transparent text-base focus:outline-none placeholder-gray-400"
//         />
//       </div>

//       {/* LIST */}
//       <div className="flex-1 pt-[60px] overflow-y-auto px-1 sm:px-2">
//         {isLoading ? (
//           <Loader />
//         ) : searchTerm.trim().length === 0 ? (
//           <p className="text-center text-gray-500 py-10">Search to see results</p>
//         ) : searchResults.length === 0 ? (
//           <p className="text-center text-gray-500 py-10">
//             No matching products found.
//           </p>
//         ) : (
//           <List
//             height={window.innerHeight - 100}
//             itemCount={searchResults.length}
//             itemSize={90}
//             width={"100%"}
//             itemKey={(index) => searchResults[index].id} // ✅ stable key
//           >
//             {Row}
//           </List>
//         )}
//       </div>
//     </div>
//   );
// }

// 📁 src/pages/SearchBarPage.jsx

import {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";

import { IoChevronBack } from "react-icons/io5";
import { FaPlus, FaGift } from "react-icons/fa";

import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSchemes } from "../hooks/useSchemes";
import { FixedSizeList as List } from "react-window";
import useFuseSearch from "../hooks/useFuseSearch";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useStock } from "../context/StockContext";

function Loader() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="h-6 w-6 animate-spin rounded-full border-4 border-dashed border-blue-500"></div>
    </div>
  );
}

const normalizeProduct = (product) => ({
  ...product,
  id: product.id ?? product.product_id,
});

export default function SearchBarPage() {
  const { user } = useAuth();

  const {
    selectedProducts,
    addProduct,
    updateQuantity,
    updateCartoon,
    cartoonSelection,
  } = useSelectedProducts();

  const [searchTerm, setSearchTerm] = useState("");

  const searchRef = useRef();
  const navigate = useNavigate();
  const { getStockValue } = useStock();

  const {
    data: allProductsRaw = [],
    isLoading,
  } = useCachedProducts();

  const { data: schemes = [] } = useSchemes();

  // Auto focus searchbox
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  
  const excludedCategories = useMemo(
    () => new Set(["spare parts", "pcb", "packing"]),
    []
  );

  const allProducts = useMemo(() => {
    return allProductsRaw
      .map(normalizeProduct)
      .filter((product) => product.is_active === true)
      .filter((product) => {
        const category = String(product.sub_category || "")
          .trim()
          .toLowerCase();

        return !excludedCategories.has(category);
      });
  }, [allProductsRaw, excludedCategories]);

  // Fuse search
  const fuseResults = useFuseSearch(allProducts, searchTerm, {
    keys: ["sub_category", "product_name", "sale_names"],
    threshold: 0.3,
  });

  // Remove duplicates and prepare search results
  const searchResults = useMemo(() => {
    const unique = new Map();
    const lower = searchTerm.trim().toLowerCase();

    fuseResults.forEach((product) => {
      
      const category = String(product.sub_category || "")
        .trim()
        .toLowerCase();

      if (excludedCategories.has(category)) {
        return;
      }

      const matchedSale = Array.isArray(product.sale_names)
        ? product.sale_names.find((name) =>
            String(name).toLowerCase().includes(lower)
          )
        : null;

      const productName = String(
        product.product_name || ""
      ).toLowerCase();

      const subCategory = String(
        product.sub_category || ""
      ).toLowerCase();

      const match =
        productName.includes(lower) ||
        subCategory.includes(lower) ||
        Boolean(matchedSale);

      if (match) {
        unique.set(product.id, {
          ...product,
          _displayName:
            matchedSale || product.product_name,
        });
      }
    });

    return Array.from(unique.values());
  }, [fuseResults, searchTerm, excludedCategories]);

  const hasScheme = (productId) =>
    schemes.some(
      (scheme) =>
        Array.isArray(scheme.conditions) &&
        scheme.conditions.some(
          (condition) => condition.product === productId
        )
    );

  const isAdded = (id) =>
    selectedProducts.some((product) => product.id === id);

  const handleAddProduct = (product) => {
    if (!isAdded(product.id)) {
      const isDS = user?.role === "DS";
      const moq = product.moq || 1;

      const initialQty = isDS
        ? 1
        : product.cartoon_size && product.cartoon_size > 1
          ? product.cartoon_size
          : moq;

      addProduct({
        ...product,
        quantity: initialQty,
      });
    }
  };

  const Row = useCallback(
    ({ index, style }) => {
      const product = normalizeProduct(searchResults[index]);

      const selectedItem = selectedProducts.find(
        (item) => item.id === product.id
      );

      const currentStock = getStockValue(product);
      const outOfStock =
        currentStock <= (product.moq || 1);

      const [localQty, setLocalQty] = useState(
        selectedItem?.quantity ?? ""
      );

      const isDS = user?.role === "DS";

      const hasCartoon =
        selectedItem?.quantity_type === "CARTOON" && !isDS;

      // Sync global quantity to local quantity
      useEffect(() => {
        setLocalQty(selectedItem?.quantity ?? "");
      }, [selectedItem?.quantity]);

      return (
        <div
          key={product.id}
          style={style}
          className="flex items-center justify-between rounded-md border-b border-gray-300 px-3 py-2 transition-all hover:bg-gray-100"
        >
          {/* LEFT SIDE */}
          <div
            onClick={() =>
              navigate(`/product/${product.id}`)
            }
            className="flex min-w-0 flex-grow cursor-pointer flex-col gap-1 text-xs text-gray-700 sm:text-sm"
          >
            <div className="flex min-w-0 items-center gap-2 font-medium text-gray-800">
              <span className="truncate">
                {product._displayName}
              </span>

              {user?.role !== "DS" && (
                <div className="shrink-0">
                  {!outOfStock ? (
                    <span className="rounded bg-blue-100 px-1 py-[1px] text-[10px] text-blue-600">
                      In Stock
                    </span>
                  ) : (
                    <span className="rounded bg-red-100 px-1 py-[1px] text-[10px] text-red-600">
                      Out of Stock
                    </span>
                  )}
                </div>
              )}

              {hasScheme(product.id) && (
                <FaGift className="shrink-0 text-xs text-pink-500 animate-pulse" />
              )}
            </div>

            <div className="truncate text-[11px] text-gray-500 sm:text-xs">
              Product: {product.product_name}
            </div>

            <div className="truncate text-[11px] text-gray-400 sm:text-xs">
              {product.sub_category}
            </div>
          </div>

          {/* RIGHT SIDE */}
          {(user?.role === "SS" ||
            user?.role === "DS" ||
            user?.role === "ASM") && (
            <div className="ml-3 shrink-0">
              {selectedItem ? (
                hasCartoon ? (
                  <select
                    value={
                      cartoonSelection[selectedItem.id] || 1
                    }
                    onChange={(e) =>
                      updateCartoon(
                        selectedItem.id,
                        parseInt(e.target.value)
                      )
                    }
                    className="rounded border px-2 py-1 text-sm"
                  >
                    {Array.from(
                      { length: 100 },
                      (_, i) => i + 1
                    ).map((number) => (
                      <option
                        key={number}
                        value={number}
                      >
                        {number} CTN
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    min={1}
                    value={localQty}
                    onChange={(e) =>
                      setLocalQty(e.target.value)
                    }
                    onBlur={() => {
                      const parsed = parseInt(localQty);

                      // DS: no MOQ auto-fix
                      if (isDS) {
                        if (!isNaN(parsed)) {
                          updateQuantity(product.id, parsed);
                        }

                        return;
                      }

                      // SS / ASM: MOQ strict
                      const moq = selectedItem.moq || 1;

                      if (isNaN(parsed) || parsed < moq) {
                        updateQuantity(product.id, moq);
                        setLocalQty(moq);
                      } else {
                        updateQuantity(product.id, parsed);
                      }
                    }}
                    className="w-20 rounded border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                  />
                )
              ) : (
                <button
                  onClick={() => handleAddProduct(product)}
                  className="rounded-full bg-blue-100 p-3 text-blue-600 transition-all hover:bg-blue-200"
                >
                  <FaPlus className="text-sm" />
                </button>
              )}
            </div>
          )}
        </div>
      );
    },
    [
      searchResults,
      selectedProducts,
      cartoonSelection,
      user,
      getStockValue,
      navigate,
    ]
  );

  return (
    <div className="flex h-screen max-h-screen flex-col bg-white">
      {/* TOP BAR */}
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center gap-2 overflow-hidden border-b border-gray-300 bg-white p-3 shadow">
        <button
          onClick={() => window.history.back()}
          className="px-1 text-2xl font-bold text-gray-700 transition-transform hover:scale-105 hover:text-blue-600"
        >
          <IoChevronBack />
        </button>

        <input
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          maxLength={25}
          placeholder="Search by product, sale name, or category..."
          className="w-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-gray-400"
        />
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto px-1 pt-[60px] sm:px-2">
        {isLoading ? (
          <Loader />
        ) : searchTerm.trim().length === 0 ? (
          <p className="py-10 text-center text-gray-500">
            Search to see results
          </p>
        ) : searchResults.length === 0 ? (
          <p className="py-10 text-center text-gray-500">
            No matching products found.
          </p>
        ) : (
          <List
            height={window.innerHeight - 100}
            itemCount={searchResults.length}
            itemSize={90}
            width="100%"
            itemKey={(index) => searchResults[index].id}
          >
            {Row}
          </List>
        )}
      </div>
    </div>
  );
}