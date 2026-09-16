import { FaGift } from "react-icons/fa";
import { Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import useFuseSearch from "../../hooks/useFuseSearch";


export default function OrderItemsTable({
  editedItems,
  allProducts,
  handleEditQuantity,
  setItemToDelete,
  setShowDeleteModal,
  selectedCity,
  manualAvailabilityMap,
  updateManualAvailability,
  searchTerm,
  setSearchTerm,
  highlightIndex,
  setHighlightIndex,
  handleAddProductBySearch,
  getSchemeText,
  setSelectedCity
}) {
  const approvedInputRefs = useRef({});
  const addProductInputRef = useRef(null);

  // -------------------------------------
  // ✅ 1. AUTO AVAILABILITY CHECK
  // -------------------------------------
  const tableScrollRef = useRef(null);
  useEffect(() => {
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollTop =
        tableScrollRef.current.scrollHeight;
    }
  }, [editedItems.length]); // 👈 sirf jab product add/remove ho

  const getAvailability = (product, item, city) => {
    if (!product) return false;
    const qty = Number(item.quantity) || 0;

    if (city === "Mumbai") {
      return (product.mumbai_stock ?? 0) >= qty;
    }
    return (item.ss_virtual_stock ?? 0) >= qty;
  };

  useEffect(() => {
    if (editedItems.length === 0) return;

    const lastItem = editedItems[editedItems.length - 1];

    setTimeout(() => {
      approvedInputRefs.current[lastItem.product]?.focus();
    }, 0);
  }, [editedItems.length]);

  // -------------------------------------
  // ✅ 2. FINAL AVAILABILITY (Manual → Auto)
  // -------------------------------------
  const getFinalAvailability = (item, productData) => {
    if (manualAvailabilityMap[item.product]) {
      return manualAvailabilityMap[item.product];
    }

    return getAvailability(productData, item, selectedCity)
      ? "Available"
      : "Not Available";
  };

  const fuseResults = useFuseSearch(
    allProducts,
    searchTerm,
    {
      keys: ["product_name", "sale_names"],
      threshold: 0.3,
    }
  );

  const filteredProducts = fuseResults;

  const handleKeyDown = (e) => {

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < filteredProducts.length - 1 ? prev + 1 : 0
      );
    }

    else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : filteredProducts.length - 1
      );
    }

    else if (e.key === "Enter") {
      e.preventDefault();

      const selectedProduct = filteredProducts[highlightIndex];

      if (selectedProduct) {
        handleAddProductBySearch(selectedProduct);
      }
    }
  };

  return (
    <div className="border-t border-r border-gray-500">
      <div ref={tableScrollRef} className="max-h-[73vh] overflow-y-auto p-0 m-0 ">
        <table className=" min-w-full border-collapse text-sm">

          {/* ================= HEADER ================= */}
          <thead className="sticky top-0 z-20 bg-gray-100 text-gray-800 text-xs font-semibold uppercase tracking-wide">
            <tr className="border">
              <th className="p-1 border border-gray-500">Product</th>
              <th className="p-1 border border-gray-500">SS Order</th>
              <th className="p-1 border border-gray-500">Approved</th>
              <th className="p-1 border border-gray-500">SS-Stock</th>

              <th className="border border-gray-500">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="Delhi">DELHI</option>
                  <option value="Mumbai">MUMBAI</option>
                </select>
              </th>

              <th className="p-1 border border-gray-500">Availability</th>
              <th className="p-1 border border-gray-500">Carton</th>
              <th className="p-1 border border-gray-500">Price</th>
              <th className="p-1 border border-gray-500">Total</th>
              <th className="p-1 border border-gray-500">Actions</th>
            </tr>
          </thead>

          {/* ================= BODY ================= */}
          <tbody className="text-xs">
            {editedItems.map((item) => {
              const productData = allProducts.find(
                (p) => p.product_id === item.product
              );

              const finalAvail = getFinalAvailability(item, productData);

              return (
                <tr key={item.product} className="hover:bg-gray-50 bg-white text-center">
                  <td className="p-1 ps-3 border-b border-x border-gray-400">
                    <span className="flex items-center gap-1">
                      {item.is_scheme_item && (
                        <FaGift className="text-pink-500" />
                      )}
                      {item.product_name}
                    </span>
                  </td>

                  <td className="p-1 border-b border-x border-gray-400">
                    {item.original_quantity}
                  </td>

                  <td className="p-1 border-b border-x border-gray-400">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      ref={(el) => (approvedInputRefs.current[item.product] = el)}
                      value={item.quantity === "" ? "" : item.quantity}
                      onChange={(e) =>
                        handleEditQuantity(item.product, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addProductInputRef.current?.focus();
                        }
                      }}
                      className="border rounded-lg p-1 w-20 text-center"
                    />

                  </td>

                  <td className="p-1 border-b border-x border-gray-400 bg-red-100">
                    {item.ss_virtual_stock}
                  </td>

                  {selectedCity === "Delhi" && (
                    <td className="p-1 border-b border-x border-gray-400 bg-red-100">
                      {productData?.virtual_stock ?? "-"}
                    </td>
                  )}

                  {selectedCity === "Mumbai" && (
                    <td className="p-1 border-b border-x border-gray-400 bg-purple-300">
                      {productData?.mumbai_stock ?? "-"}
                    </td>
                  )}

                  <td className="p-1 border-b border-x border-gray-400">
                    <select
                      value={finalAvail}
                      onChange={(e) =>
                        updateManualAvailability(item.product, e.target.value)
                      }
                      className={`border rounded p-1 ${finalAvail === "Available"
                        ? "text-green-600"
                        : "text-red-600"
                        }`}
                    >
                      <option value="Available">Available</option>
                      <option value="Not Available">Not Available</option>
                    </select>
                  </td>

                  <td className="p-1 border-b border-x border-gray-400">
                    {productData?.cartoon_size ?? "-"}
                  </td>

                  <td className="p-1 border-b border-x border-gray-400">
                    {productData?.price ? `₹${productData.price}` : ""}
                  </td>

                  <td className="p-1 border-b border-x border-gray-400 bg-blue-100">
                    ₹
                    {finalAvail === "Available"
                      ? (
                        (Number(item.quantity) || 0) *
                        (Number(productData?.price) || 0)
                      ).toFixed(1)
                      : "0"}
                  </td>

                  <td className="p-1 border-b border-x border-gray-400">
                    <button
                      onClick={() => {
                        setItemToDelete(item.product);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:text-red-800 px-3 p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>


        </table>

      </div>
      {/* ================= FOOTER (ADD PRODUCT + TOTAL) ================= */}

      <div className="font-bold text-xs text-gray-800 bg-gray-200 flex ">

        {/* 🆕 ADD PRODUCT (GOOGLE SHEET STYLE) */}
        <div className="px-0 py-0 border border-black relative bg-white w-full" >
          <input
            ref={addProductInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setHighlightIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Add product..."
            className="w-full px-2 py-1 text-xs text-center border border-transparent focus:outline-none rounded-none"
          />


          {searchTerm && (
            <div className="absolute left-0 right-0 top-full bg-white border shadow-lg max-h-24 overflow-y-auto z-[999]">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((prod, index) => {
                  const matchedSaleName = prod.sale_names?.find((name) =>
                    name.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                  const schemeText = getSchemeText(prod.product_id);

                  return (
                    <div key={prod.product_id}>
                      <div
                        onClick={() => handleAddProductBySearch(prod)}
                        className={`px-2 py-1 text-xs cursor-pointer flex justify-between items-center ${highlightIndex === index
                          ? "bg-orange-100"
                          : "hover:bg-gray-100"
                          }`}
                      >
                        <div className="flex flex-col leading-tight">
                          {matchedSaleName && (
                            <span className="truncate text-[10px] text-blue-500 italic">
                              {matchedSaleName}
                            </span>
                          )}
                          <span className="truncate font-semibold text-gray-800">
                            {prod.product_name}
                          </span>
                        </div>
                        {schemeText && (
                          <FaGift className="text-pink-500 text-xs" />
                        )}
                      </div>

                      {schemeText && (
                        <div className="px-2 text-[10px] text-pink-600">
                          {schemeText}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="px-2 py-1 text-gray-400 text-xs">
                  No products found
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-4 py-2 text-right border border-black w-full">
          Grand Total :
        </div>

        <div className="px-5 py-2 border border-black bg-blue-200 w-full">
          ₹
          {editedItems
            .reduce((sum, item) => {
              const productData = allProducts.find(
                (p) => p.product_id === item.product
              );

              const finalAvail =
                manualAvailabilityMap[item.product] ??
                ((selectedCity === "Mumbai"
                  ? (productData?.mumbai_stock ?? 0)
                  : (item.ss_virtual_stock ?? 0)) >=
                  Number(item.quantity || 0)
                  ? "Available"
                  : "Not Available");

              if (finalAvail !== "Available") return sum;

              return (
                sum +
                (Number(item.quantity) || 0) *
                (Number(productData?.price) || 0)
              );
            }, 0)
            .toFixed(1)}
        </div>
      </div>

    </div>
  );
}




// import { FaGift } from "react-icons/fa";
// import {
//   Trash2,
//   Search,
//   Package,
//   MapPin,
//   Check,
//   X,
//   ChevronDown,
//   Boxes,
//   Sparkles,
//   Command,
//   CircleDot,
// } from "lucide-react";
// import { useEffect, useRef } from "react";
// import useFuseSearch from "../../hooks/useFuseSearch";

// export default function OrderItemsTable({
//   editedItems,
//   allProducts,
//   handleEditQuantity,
//   setItemToDelete,
//   setShowDeleteModal,
//   selectedCity,
//   manualAvailabilityMap,
//   updateManualAvailability,
//   searchTerm,
//   setSearchTerm,
//   highlightIndex,
//   setHighlightIndex,
//   handleAddProductBySearch,
//   getSchemeText,
//   setSelectedCity,
// }) {
//   const approvedInputRefs = useRef({});
//   const addProductInputRef = useRef(null);
//   const tableScrollRef = useRef(null);

//   // ============================================================
//   // AUTO SCROLL WHEN PRODUCT IS ADDED / REMOVED
//   // ============================================================
//   useEffect(() => {
//     if (tableScrollRef.current) {
//       tableScrollRef.current.scrollTop =
//         tableScrollRef.current.scrollHeight;
//     }
//   }, [editedItems.length]);

//   // ============================================================
//   // AUTO AVAILABILITY
//   // ============================================================
//   const getAvailability = (product, item, city) => {
//     if (!product) return false;

//     const qty = Number(item.quantity) || 0;

//     if (city === "Mumbai") {
//       return (product.mumbai_stock ?? 0) >= qty;
//     }

//     return (item.ss_virtual_stock ?? 0) >= qty;
//   };

//   // ============================================================
//   // FOCUS LAST ADDED ITEM
//   // ============================================================
//   useEffect(() => {
//     if (editedItems.length === 0) return;

//     const lastItem = editedItems[editedItems.length - 1];

//     setTimeout(() => {
//       approvedInputRefs.current[lastItem.product]?.focus();
//     }, 0);
//   }, [editedItems.length]);

//   // ============================================================
//   // FINAL AVAILABILITY
//   // Manual → Auto
//   // ============================================================
//   const getFinalAvailability = (item, productData) => {
//     if (manualAvailabilityMap[item.product]) {
//       return manualAvailabilityMap[item.product];
//     }

//     return getAvailability(productData, item, selectedCity)
//       ? "Available"
//       : "Not Available";
//   };

//   // ============================================================
//   // SEARCH
//   // ============================================================
//   const fuseResults = useFuseSearch(
//     allProducts,
//     searchTerm,
//     {
//       keys: ["product_name", "sale_names"],
//       threshold: 0.3,
//     }
//   );

//   const filteredProducts = fuseResults;

//   // ============================================================
//   // SEARCH KEYBOARD
//   // ============================================================
//   const handleKeyDown = (e) => {
//     if (e.key === "Escape") {
//       e.preventDefault();

//       setSearchTerm("");
//       setHighlightIndex(0);

//       addProductInputRef.current?.focus();

//       return;
//     }

//     if (e.key === "ArrowDown") {
//       e.preventDefault();

//       setHighlightIndex((prev) =>
//         prev < filteredProducts.length - 1 ? prev + 1 : 0
//       );

//       return;
//     }

//     if (e.key === "ArrowUp") {
//       e.preventDefault();

//       setHighlightIndex((prev) =>
//         prev > 0 ? prev - 1 : filteredProducts.length - 1
//       );

//       return;
//     }

//     if (e.key === "Enter") {
//       e.preventDefault();

//       const selectedProduct =
//         filteredProducts[highlightIndex];

//       if (selectedProduct) {
//         handleAddProductBySearch(selectedProduct);
//       }
//     }
//   };

//   // ============================================================
//   // GRAND TOTAL
//   // ============================================================
//   const grandTotal = editedItems.reduce((sum, item) => {
//     const productData = allProducts.find(
//       (p) => p.product_id === item.product
//     );

//     const finalAvail =
//       manualAvailabilityMap[item.product] ??
//       (
//         (
//           selectedCity === "Mumbai"
//             ? (productData?.mumbai_stock ?? 0)
//             : (item.ss_virtual_stock ?? 0)
//         ) >= Number(item.quantity || 0)
//           ? "Available"
//           : "Not Available"
//       );

//     if (finalAvail !== "Available") {
//       return sum;
//     }

//     return (
//       sum +
//       (Number(item.quantity) || 0) *
//         (Number(productData?.price) || 0)
//     );
//   }, 0);

//   // ============================================================
//   // AVAILABLE ITEM COUNT
//   // ============================================================
//   const availableCount = editedItems.filter((item) => {
//     const productData = allProducts.find(
//       (p) => p.product_id === item.product
//     );

//     return (
//       getFinalAvailability(item, productData) ===
//       "Available"
//     );
//   }).length;

//   const unavailableCount =
//     editedItems.length - availableCount;

//   const availabilityPercent =
//     editedItems.length > 0
//       ? Math.round(
//           (availableCount / editedItems.length) * 100
//         )
//       : 0;

//   return (
//     <>
//       {/* ========================================================
//           LOCAL ANIMATIONS
//       ======================================================== */}
//       <style>
//         {`
//           @keyframes orderItemFadeUp {
//             from {
//               opacity: 0;
//               transform: translateY(5px);
//             }
//             to {
//               opacity: 1;
//               transform: translateY(0);
//             }
//           }

//           @keyframes dropdownIn {
//             from {
//               opacity: 0;
//               transform: translateY(-5px) scale(0.99);
//             }
//             to {
//               opacity: 1;
//               transform: translateY(0) scale(1);
//             }
//           }

//           @keyframes softPulse {
//             0%, 100% {
//               opacity: 1;
//             }
//             50% {
//               opacity: 0.65;
//             }
//           }

//           .order-item-row {
//             animation: orderItemFadeUp 0.24s ease-out both;
//           }

//           .product-search-dropdown {
//             animation: dropdownIn 0.16s ease-out both;
//             transform-origin: top center;
//           }

//           .availability-pulse {
//             animation: softPulse 1.8s ease-in-out infinite;
//           }
//         `}
//       </style>

//       <div
//         className="
//           w-full
//           overflow-hidden
//           rounded-2xl
//           border border-slate-200
//           bg-white
//           shadow-[0_4px_24px_rgba(15,23,42,0.055)]
//           transition-all duration-300
//           hover:shadow-[0_8px_32px_rgba(15,23,42,0.075)]
//         "
//       >
//         {/* ======================================================
//             HEADER
//         ====================================================== */}
//         <div className="border-b border-slate-100 bg-white">

//           <div className="p-3.5 sm:p-4">

//             {/* TITLE */}
//             <div className="mb-3.5 flex items-center justify-between gap-3">

//               <div className="flex min-w-0 items-center gap-2.5">

//                 <div
//                   className="
//                     relative
//                     flex h-9 w-9 shrink-0
//                     items-center justify-center
//                     overflow-hidden
//                     rounded-xl
//                     bg-gradient-to-br
//                     from-blue-50
//                     via-indigo-50
//                     to-white
//                     text-blue-600
//                     ring-1 ring-blue-100
//                     transition-all duration-300
//                     hover:-translate-y-0.5
//                     hover:scale-105
//                     hover:shadow-[0_5px_15px_rgba(37,99,235,0.14)]
//                   "
//                 >
//                   <Package size={17} />

//                   <span
//                     className="
//                       absolute
//                       -right-1
//                       -top-1
//                       h-3
//                       w-3
//                       rounded-full
//                       bg-blue-400/10
//                     "
//                   />

//                   <span
//                     className="
//                       absolute
//                       bottom-1
//                       right-1
//                       h-1
//                       w-1
//                       rounded-full
//                       bg-blue-400/60
//                     "
//                   />
//                 </div>

//                 <div className="min-w-0">

//                   <div className="flex items-center gap-2">

//                     <h3
//                       className="
//                         text-sm
//                         font-bold
//                         tracking-tight
//                         text-slate-800
//                       "
//                     >
//                       Order Items
//                     </h3>

//                     <span
//                       className="
//                         inline-flex
//                         min-w-[22px]
//                         items-center
//                         justify-center
//                         rounded-full
//                         bg-slate-100
//                         px-1.5
//                         py-0.5
//                         text-[8px]
//                         font-bold
//                         text-slate-500
//                         ring-1
//                         ring-slate-200/70
//                       "
//                     >
//                       {editedItems.length}
//                     </span>

//                   </div>

//                   <p
//                     className="
//                       mt-0.5
//                       truncate
//                       text-[10px]
//                       font-medium
//                       text-slate-400
//                     "
//                   >
//                     Add products & adjust approved quantity
//                   </p>

//                 </div>

//               </div>

//               {/* DESKTOP AVAILABILITY */}
//               <div
//                 className="
//                   hidden
//                   shrink-0
//                   items-center
//                   gap-2.5
//                   rounded-xl
//                   border border-slate-100
//                   bg-gradient-to-r
//                   from-slate-50
//                   to-white
//                   px-2.5
//                   py-1.5
//                   shadow-sm
//                   sm:flex
//                 "
//               >

//                 <div className="relative flex h-6 w-6 items-center justify-center">

//                   <svg
//                     className="h-6 w-6 -rotate-90"
//                     viewBox="0 0 36 36"
//                   >
//                     <path
//                       d="
//                         M18 2.0845
//                         a 15.9155 15.9155 0 0 1 0 31.831
//                         a 15.9155 15.9155 0 0 1 0-31.831
//                       "
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="3"
//                       className="text-slate-200"
//                     />

//                     <path
//                       d="
//                         M18 2.0845
//                         a 15.9155 15.9155 0 0 1 0 31.831
//                         a 15.9155 15.9155 0 0 1 0-31.831
//                       "
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="3"
//                       strokeDasharray={`${availabilityPercent}, 100`}
//                       className="
//                         text-emerald-500
//                         transition-all
//                         duration-700
//                         ease-out
//                       "
//                     />
//                   </svg>

//                   <span
//                     className="
//                       absolute
//                       text-[6px]
//                       font-extrabold
//                       text-slate-600
//                     "
//                   >
//                     {availabilityPercent}%
//                   </span>

//                 </div>

//                 <div className="leading-none">

//                   <p className="text-[9px] font-bold text-slate-700">
//                     {availableCount}/{editedItems.length}
//                   </p>

//                   <p className="mt-1 text-[7px] font-medium text-slate-400">
//                     available
//                   </p>

//                 </div>

//                 {unavailableCount > 0 && (
//                   <div
//                     className="
//                       ml-0.5
//                       rounded-md
//                       bg-red-50
//                       px-1.5
//                       py-1
//                       text-[7px]
//                       font-bold
//                       text-red-500
//                     "
//                   >
//                     {unavailableCount} unavailable
//                   </div>
//                 )}

//               </div>

//             </div>


//             {/* ==================================================
//                 SEARCH + CITY
//             ================================================== */}
//             <div className="flex flex-col gap-2 sm:flex-row">

//               {/* SEARCH */}
//               <div className="relative min-w-0 flex-1">

//                 <div
//                   className={`
//                     group/search
//                     flex h-10
//                     items-center
//                     rounded-xl
//                     border
//                     bg-slate-50/70
//                     transition-all duration-200
//                     ${
//                       searchTerm
//                         ? `
//                           border-blue-300
//                           bg-white
//                           shadow-[0_0_0_3px_rgba(59,130,246,0.07)]
//                         `
//                         : `
//                           border-slate-200
//                           hover:border-slate-300
//                           hover:bg-white
//                         `
//                     }
//                   `}
//                 >

//                   <Search
//                     size={15}
//                     className={`
//                       ml-3
//                       shrink-0
//                       transition-all
//                       duration-200
//                       ${
//                         searchTerm
//                           ? "scale-105 text-blue-500"
//                           : "text-slate-400 group-focus-within/search:text-blue-500"
//                       }
//                     `}
//                   />

//                   <input
//                     ref={addProductInputRef}
//                     type="text"
//                     value={searchTerm}
//                     onChange={(e) => {
//                       setSearchTerm(e.target.value);
//                       setHighlightIndex(0);
//                     }}
//                     onKeyDown={handleKeyDown}
//                     placeholder="Search product or sale name..."
//                     className="
//                       min-w-0
//                       flex-1
//                       bg-transparent
//                       px-2.5
//                       text-[11px]
//                       font-medium
//                       text-slate-700
//                       outline-none
//                       placeholder:text-slate-400
//                     "
//                   />

//                   {searchTerm ? (
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setSearchTerm("");
//                         setHighlightIndex(0);
//                         addProductInputRef.current?.focus();
//                       }}
//                       className="
//                         mr-2
//                         flex h-6 w-6
//                         items-center justify-center
//                         rounded-lg
//                         text-slate-400
//                         transition-all
//                         duration-150
//                         hover:bg-slate-100
//                         hover:text-slate-600
//                         active:scale-90
//                       "
//                     >
//                       <X size={12} />
//                     </button>
//                   ) : (
//                     <div
//                       className="
//                         mr-2
//                         hidden
//                         items-center
//                         gap-1
//                         rounded-md
//                         border
//                         border-slate-200
//                         bg-white
//                         px-1.5
//                         py-1
//                         text-[7px]
//                         font-bold
//                         text-slate-400
//                         shadow-sm
//                         sm:flex
//                       "
//                     >
//                       <Command size={8} />
//                       /
//                     </div>
//                   )}

//                 </div>


//                 {/* ==================================================
//                     SEARCH DROPDOWN
//                 ================================================== */}
//                 {searchTerm && (
//                   <div
//                     className="
//                       product-search-dropdown
//                       absolute
//                       left-0
//                       right-0
//                       top-[calc(100%+7px)]
//                       z-[999]
//                       overflow-hidden
//                       rounded-2xl
//                       border
//                       border-slate-200
//                       bg-white
//                       shadow-[0_18px_45px_rgba(15,23,42,0.14)]
//                       ring-1
//                       ring-slate-900/[0.02]
//                     "
//                   >

//                     {/* DROPDOWN TOP */}
//                     <div
//                       className="
//                         flex
//                         items-center
//                         justify-between
//                         border-b
//                         border-slate-100
//                         bg-slate-50/90
//                         px-3
//                         py-2
//                       "
//                     >

//                       <div className="flex items-center gap-1.5">

//                         <span
//                           className="
//                             flex h-5 w-5
//                             items-center justify-center
//                             rounded-md
//                             bg-blue-100
//                             text-blue-500
//                           "
//                         >
//                           <Sparkles size={10} />
//                         </span>

//                         <span
//                           className="
//                             text-[8px]
//                             font-bold
//                             uppercase
//                             tracking-wider
//                             text-slate-500
//                           "
//                         >
//                           Products
//                         </span>

//                       </div>

//                       <span
//                         className="
//                           rounded-md
//                           bg-white
//                           px-1.5
//                           py-1
//                           text-[8px]
//                           font-semibold
//                           text-slate-400
//                           shadow-sm
//                         "
//                       >
//                         {filteredProducts.length} result
//                         {filteredProducts.length !== 1 ? "s" : ""}
//                       </span>

//                     </div>


//                     {/* RESULTS */}
//                     <div className="max-h-64 overflow-y-auto">

//                       {filteredProducts.length > 0 ? (

//                         filteredProducts.map((prod, index) => {

//                           const matchedSaleName =
//                             prod.sale_names?.find((name) =>
//                               name
//                                 .toLowerCase()
//                                 .includes(
//                                   searchTerm.toLowerCase()
//                                 )
//                             );

//                           const schemeText =
//                             getSchemeText(
//                               prod.product_id
//                             );

//                           const isHighlighted =
//                             highlightIndex === index;

//                           return (
//                             <div
//                               key={prod.product_id}
//                               className={`
//                                 border-b
//                                 border-slate-50
//                                 last:border-0
//                                 transition-all
//                                 duration-150
//                                 ${
//                                   isHighlighted
//                                     ? "bg-blue-50/90"
//                                     : "bg-white hover:bg-slate-50/80"
//                                 }
//                               `}
//                             >

//                               <button
//                                 type="button"
//                                 onClick={() =>
//                                   handleAddProductBySearch(
//                                     prod
//                                   )
//                                 }
//                                 className="
//                                   flex
//                                   w-full
//                                   items-center
//                                   justify-between
//                                   gap-3
//                                   px-3
//                                   py-2.5
//                                   text-left
//                                 "
//                               >

//                                 <div className="min-w-0">

//                                   {matchedSaleName && (
//                                     <div
//                                       className="
//                                         mb-1
//                                         flex
//                                         min-w-0
//                                         items-center
//                                         gap-1.5
//                                       "
//                                     >
//                                       <span
//                                         className="
//                                           h-1
//                                           w-1
//                                           shrink-0
//                                           rounded-full
//                                           bg-blue-400
//                                         "
//                                       />

//                                       <p
//                                         className="
//                                           truncate
//                                           text-[9px]
//                                           font-medium
//                                           italic
//                                           text-blue-500
//                                         "
//                                       >
//                                         {matchedSaleName}
//                                       </p>

//                                     </div>
//                                   )}

//                                   <div className="flex items-center gap-2">

//                                     <span
//                                       className="
//                                         truncate
//                                         text-[11px]
//                                         font-semibold
//                                         text-slate-800
//                                       "
//                                     >
//                                       {prod.product_name}
//                                     </span>

//                                     {schemeText && (
//                                       <span
//                                         className="
//                                           flex
//                                           shrink-0
//                                           items-center
//                                           gap-1
//                                           rounded-full
//                                           bg-pink-50
//                                           px-1.5
//                                           py-0.5
//                                           text-[8px]
//                                           font-bold
//                                           text-pink-600
//                                           ring-1
//                                           ring-pink-100
//                                         "
//                                       >
//                                         <FaGift size={8} />
//                                         Scheme
//                                       </span>
//                                     )}

//                                   </div>

//                                 </div>

//                                 <span
//                                   className={`
//                                     flex
//                                     h-7
//                                     w-7
//                                     shrink-0
//                                     items-center
//                                     justify-center
//                                     rounded-lg
//                                     transition-all
//                                     duration-200
//                                     ${
//                                       isHighlighted
//                                         ? `
//                                           bg-blue-600
//                                           text-white
//                                           shadow-[0_3px_10px_rgba(37,99,235,0.25)]
//                                           scale-105
//                                         `
//                                         : `
//                                           bg-slate-100
//                                           text-slate-400
//                                         `
//                                     }
//                                   `}
//                                 >
//                                   <ChevronDown
//                                     size={11}
//                                     className="-rotate-90"
//                                   />
//                                 </span>

//                               </button>

//                               {schemeText && (
//                                 <div
//                                   className="
//                                     mx-3
//                                     mb-2
//                                     rounded-lg
//                                     border
//                                     border-pink-100
//                                     bg-pink-50/70
//                                     px-2
//                                     py-1.5
//                                     text-[9px]
//                                     font-medium
//                                     text-pink-500
//                                   "
//                                 >
//                                   <span className="font-bold">
//                                     Scheme:
//                                   </span>{" "}
//                                   {schemeText}
//                                 </div>
//                               )}

//                             </div>
//                           );
//                         })

//                       ) : (

//                         <div
//                           className="
//                             flex
//                             flex-col
//                             items-center
//                             justify-center
//                             px-4
//                             py-9
//                             text-center
//                           "
//                         >

//                           <div
//                             className="
//                               mb-2.5
//                               flex
//                               h-10
//                               w-10
//                               items-center
//                               justify-center
//                               rounded-xl
//                               bg-slate-100
//                               text-slate-400
//                               ring-1
//                               ring-slate-200
//                             "
//                           >
//                             <Search size={16} />
//                           </div>

//                           <p
//                             className="
//                               text-[11px]
//                               font-bold
//                               text-slate-600
//                             "
//                           >
//                             No products found
//                           </p>

//                           <p
//                             className="
//                               mt-1
//                               text-[9px]
//                               text-slate-400
//                             "
//                           >
//                             Try product name or sale name
//                           </p>

//                         </div>

//                       )}

//                     </div>


//                     {/* KEYBOARD FOOTER */}
//                     {filteredProducts.length > 0 && (
//                       <div
//                         className="
//                           flex
//                           flex-wrap
//                           items-center
//                           gap-2
//                           border-t
//                           border-slate-100
//                           bg-slate-50
//                           px-3
//                           py-2
//                         "
//                       >

//                         <span
//                           className="
//                             rounded
//                             border
//                             border-slate-200
//                             bg-white
//                             px-1.5
//                             py-0.5
//                             text-[7px]
//                             font-bold
//                             text-slate-500
//                             shadow-sm
//                           "
//                         >
//                           ↑ ↓
//                         </span>

//                         <span className="text-[8px] text-slate-400">
//                           Navigate
//                         </span>

//                         <span className="text-[8px] text-slate-300">
//                           •
//                         </span>

//                         <span
//                           className="
//                             rounded
//                             border
//                             border-slate-200
//                             bg-white
//                             px-1.5
//                             py-0.5
//                             text-[7px]
//                             font-bold
//                             text-slate-500
//                             shadow-sm
//                           "
//                         >
//                           Enter
//                         </span>

//                         <span className="text-[8px] text-slate-400">
//                           Add
//                         </span>

//                         <span className="text-[8px] text-slate-300">
//                           •
//                         </span>

//                         <span
//                           className="
//                             rounded
//                             border
//                             border-slate-200
//                             bg-white
//                             px-1.5
//                             py-0.5
//                             text-[7px]
//                             font-bold
//                             text-slate-500
//                             shadow-sm
//                           "
//                         >
//                           Esc
//                         </span>

//                         <span className="text-[8px] text-slate-400">
//                           Clear
//                         </span>

//                       </div>
//                     )}

//                   </div>
//                 )}

//               </div>


//               {/* ==================================================
//                   CITY SWITCH
//               ================================================== */}
//               <div
//                 className="
//                   flex
//                   h-10
//                   w-full
//                   shrink-0
//                   items-center
//                   rounded-xl
//                   border
//                   border-slate-200
//                   bg-slate-50
//                   p-1
//                   shadow-inner
//                   sm:w-[150px]
//                 "
//               >

//                 <button
//                   type="button"
//                   onClick={() => setSelectedCity("Delhi")}
//                   className={`
//                     relative
//                     flex
//                     h-full
//                     flex-1
//                     items-center
//                     justify-center
//                     gap-1.5
//                     rounded-lg
//                     text-[9px]
//                     font-bold
//                     transition-all
//                     duration-200
//                     ${
//                       selectedCity === "Delhi"
//                         ? `
//                           bg-white
//                           text-blue-600
//                           shadow-[0_2px_7px_rgba(15,23,42,0.08)]
//                         `
//                         : `
//                           text-slate-400
//                           hover:text-slate-600
//                         `
//                     }
//                   `}
//                 >

//                   <MapPin
//                     size={10}
//                     className={`
//                       transition-transform
//                       duration-200
//                       ${
//                         selectedCity === "Delhi"
//                           ? "scale-110"
//                           : ""
//                       }
//                     `}
//                   />

//                   Delhi

//                   {selectedCity === "Delhi" && (
//                     <span
//                       className="
//                         absolute
//                         bottom-0.5
//                         h-0.5
//                         w-5
//                         rounded-full
//                         bg-blue-500
//                       "
//                     />
//                   )}

//                 </button>


//                 <button
//                   type="button"
//                   onClick={() => setSelectedCity("Mumbai")}
//                   className={`
//                     relative
//                     flex
//                     h-full
//                     flex-1
//                     items-center
//                     justify-center
//                     gap-1.5
//                     rounded-lg
//                     text-[9px]
//                     font-bold
//                     transition-all
//                     duration-200
//                     ${
//                       selectedCity === "Mumbai"
//                         ? `
//                           bg-white
//                           text-purple-600
//                           shadow-[0_2px_7px_rgba(15,23,42,0.08)]
//                         `
//                         : `
//                           text-slate-400
//                           hover:text-slate-600
//                         `
//                     }
//                   `}
//                 >

//                   <MapPin
//                     size={10}
//                     className={`
//                       transition-transform
//                       duration-200
//                       ${
//                         selectedCity === "Mumbai"
//                           ? "scale-110"
//                           : ""
//                       }
//                     `}
//                   />

//                   Mumbai

//                   {selectedCity === "Mumbai" && (
//                     <span
//                       className="
//                         absolute
//                         bottom-0.5
//                         h-0.5
//                         w-5
//                         rounded-full
//                         bg-purple-500
//                       "
//                     />
//                   )}

//                 </button>

//               </div>

//             </div>

//           </div>

//         </div>


//         {/* ======================================================
//             TABLE
//         ====================================================== */}
//         <div
//           ref={tableScrollRef}
//           className="
//             max-h-[62vh]
//             overflow-auto
//             scrollbar-thin
//             scrollbar-thumb-slate-200
//             scrollbar-track-transparent
//           "
//         >

//           <table className="w-full min-w-[900px] border-collapse">

//             {/* ==================================================
//                 TABLE HEADER
//             ================================================== */}
//             <thead
//               className="
//                 sticky
//                 top-0
//                 z-30
//                 border-b
//                 border-slate-200
//                 bg-slate-50/95
//                 backdrop-blur-md
//               "
//             >

//               <tr>

//                 <th
//                   className="
//                     sticky
//                     left-0
//                     z-40
//                     min-w-[220px]
//                     border-r
//                     border-slate-100
//                     bg-slate-50/95
//                     px-3
//                     py-2.5
//                     text-left
//                     text-[8px]
//                     font-bold
//                     uppercase
//                     tracking-[0.08em]
//                     text-slate-400
//                     backdrop-blur-md
//                   "
//                 >
//                   Product
//                 </th>

//                 {[
//                   ["min-w-[75px]", "SS Order"],
//                   ["min-w-[95px]", "Approved"],
//                   ["min-w-[85px]", "SS Stock"],
//                 ].map(([width, label]) => (
//                   <th
//                     key={label}
//                     className={`
//                       ${width}
//                       px-2
//                       py-2.5
//                       text-center
//                       text-[8px]
//                       font-bold
//                       uppercase
//                       tracking-[0.08em]
//                       text-slate-400
//                     `}
//                   >
//                     {label}
//                   </th>
//                 ))}

//                 <th
//                   className="
//                     min-w-[95px]
//                     px-2
//                     py-2.5
//                     text-center
//                     text-[8px]
//                     font-bold
//                     uppercase
//                     tracking-[0.08em]
//                     text-slate-400
//                   "
//                 >
//                   {selectedCity === "Mumbai"
//                     ? "Mumbai"
//                     : "Delhi"}
//                 </th>

//                 <th
//                   className="
//                     min-w-[58px]
//                     px-2
//                     py-2.5
//                     text-center
//                     text-[8px]
//                     font-bold
//                     uppercase
//                     tracking-[0.08em]
//                     text-slate-400
//                   "
//                 >
//                   Status
//                 </th>

//                 <th
//                   className="
//                     min-w-[70px]
//                     px-2
//                     py-2.5
//                     text-center
//                     text-[8px]
//                     font-bold
//                     uppercase
//                     tracking-[0.08em]
//                     text-slate-400
//                   "
//                 >
//                   Carton
//                 </th>

//                 <th
//                   className="
//                     min-w-[80px]
//                     px-2
//                     py-2.5
//                     text-center
//                     text-[8px]
//                     font-bold
//                     uppercase
//                     tracking-[0.08em]
//                     text-slate-400
//                   "
//                 >
//                   Price
//                 </th>

//                 <th
//                   className="
//                     min-w-[95px]
//                     px-2
//                     py-2.5
//                     text-center
//                     text-[8px]
//                     font-bold
//                     uppercase
//                     tracking-[0.08em]
//                     text-slate-400
//                   "
//                 >
//                   Total
//                 </th>

//                 <th
//                   className="
//                     w-[50px]
//                     px-2
//                     py-2.5
//                     text-center
//                     text-[8px]
//                     font-bold
//                     uppercase
//                     tracking-[0.08em]
//                     text-slate-400
//                   "
//                 >
//                   Action
//                 </th>

//               </tr>

//             </thead>


//             {/* ==================================================
//                 TABLE BODY
//             ================================================== */}
//             <tbody>

//               {editedItems.map((item, index) => {

//                 const productData = allProducts.find(
//                   (p) => p.product_id === item.product
//                 );

//                 const finalAvail =
//                   getFinalAvailability(
//                     item,
//                     productData
//                   );

//                 const isAvailable =
//                   finalAvail === "Available";

//                 const isManual =
//                   Boolean(
//                     manualAvailabilityMap[item.product]
//                   );

//                 const cityStock =
//                   selectedCity === "Mumbai"
//                     ? productData?.mumbai_stock
//                     : productData?.virtual_stock;

//                 const rowTotal = isAvailable
//                   ? (
//                       (Number(item.quantity) || 0) *
//                       (Number(productData?.price) || 0)
//                     ).toFixed(1)
//                   : "0";

//                 return (
//                   <tr
//                     key={item.product}
//                     className="
//                       order-item-row
//                       group
//                       border-b
//                       border-slate-100
//                       bg-white
//                       transition-all
//                       duration-200
//                       hover:bg-blue-50/[0.035]
//                     "
//                     style={{
//                       animationDelay: `${Math.min(
//                         index * 35,
//                         300
//                       )}ms`,
//                     }}
//                   >

//                     {/* ==================================================
//                         PRODUCT
//                     ================================================== */}
//                     <td
//                       className="
//                         sticky
//                         left-0
//                         z-10
//                         border-r
//                         border-slate-100
//                         bg-white
//                         px-3
//                         py-2
//                         transition-all
//                         duration-200
//                         group-hover:bg-blue-50/30
//                       "
//                     >

//                       <div className="flex min-w-0 items-center gap-2">

//                         {/* INDEX */}
//                         <span
//                           className="
//                             flex
//                             h-5
//                             w-5
//                             shrink-0
//                             items-center
//                             justify-center
//                             rounded-md
//                             bg-slate-100
//                             text-[8px]
//                             font-bold
//                             text-slate-400
//                             transition-all
//                             duration-200
//                             group-hover:bg-blue-100
//                             group-hover:text-blue-500
//                           "
//                         >
//                           {index + 1}
//                         </span>


//                         {/* SCHEME */}
//                         {item.is_scheme_item && (
//                           <span
//                             title="Scheme item"
//                             className="
//                               relative
//                               flex
//                               h-6
//                               w-6
//                               shrink-0
//                               items-center
//                               justify-center
//                               rounded-lg
//                               bg-gradient-to-br
//                               from-pink-50
//                               to-rose-50
//                               text-pink-500
//                               ring-1
//                               ring-pink-100
//                               transition-all
//                               duration-200
//                               group-hover:scale-110
//                               group-hover:shadow-[0_3px_10px_rgba(236,72,153,0.12)]
//                             "
//                           >
//                             <FaGift size={10} />

//                             <span
//                               className="
//                                 absolute
//                                 -right-0.5
//                                 -top-0.5
//                                 h-1.5
//                                 w-1.5
//                                 rounded-full
//                                 bg-pink-400
//                               "
//                             />
//                           </span>
//                         )}


//                         {/* NAME */}
//                         <div className="min-w-0">

//                           <p
//                             className="
//                               truncate
//                               text-[10px]
//                               font-semibold
//                               text-slate-700
//                               transition-colors
//                               duration-150
//                               group-hover:text-slate-900
//                             "
//                             title={item.product_name}
//                           >
//                             {item.product_name}
//                           </p>

//                           {item.is_scheme_item && (
//                             <p
//                               className="
//                                 mt-0.5
//                                 flex
//                                 items-center
//                                 gap-1
//                                 text-[7px]
//                                 font-semibold
//                                 text-pink-500
//                               "
//                             >
//                               <FaGift size={6} />
//                               Scheme item
//                             </p>
//                           )}

//                         </div>

//                       </div>

//                     </td>


//                     {/* ==================================================
//                         SS ORDER
//                     ================================================== */}
//                     <td className="px-2 py-2 text-center">

//                       <span
//                         className="
//                           inline-flex
//                           min-w-[34px]
//                           items-center
//                           justify-center
//                           rounded-md
//                           bg-slate-50
//                           px-2
//                           py-1.5
//                           text-[10px]
//                           font-semibold
//                           text-slate-500
//                           ring-1
//                           ring-slate-100
//                           transition-all
//                           duration-150
//                           group-hover:bg-white
//                           group-hover:ring-slate-200
//                         "
//                       >
//                         {item.original_quantity ?? 0}
//                       </span>

//                     </td>


//                     {/* ==================================================
//                         APPROVED
//                     ================================================== */}
//                     <td className="px-2 py-2 text-center">

//                       <div className="relative inline-flex">

//                         <input
//                           type="number"
//                           min="0"
//                           step="1"
//                           ref={(el) => {
//                             approvedInputRefs.current[
//                               item.product
//                             ] = el;
//                           }}
//                           value={
//                             item.quantity === ""
//                               ? ""
//                               : item.quantity
//                           }
//                           onChange={(e) =>
//                             handleEditQuantity(
//                               item.product,
//                               e.target.value
//                             )
//                           }
//                           onKeyDown={(e) => {

//                             if (e.key === "Enter") {
//                               e.preventDefault();

//                               addProductInputRef.current?.focus();
//                             }

//                             if (e.key === "ArrowDown") {
//                               e.preventDefault();

//                               const currentIndex =
//                                 editedItems.findIndex(
//                                   (x) =>
//                                     x.product ===
//                                     item.product
//                                 );

//                               const nextItem =
//                                 editedItems[
//                                   currentIndex + 1
//                                 ];

//                               if (nextItem) {
//                                 approvedInputRefs.current[
//                                   nextItem.product
//                                 ]?.focus();
//                               }
//                             }

//                             if (e.key === "ArrowUp") {
//                               e.preventDefault();

//                               const currentIndex =
//                                 editedItems.findIndex(
//                                   (x) =>
//                                     x.product ===
//                                     item.product
//                                 );

//                               const previousItem =
//                                 editedItems[
//                                   currentIndex - 1
//                                 ];

//                               if (previousItem) {
//                                 approvedInputRefs.current[
//                                   previousItem.product
//                                 ]?.focus();
//                               }
//                             }

//                           }}
//                           className="
//                             h-8
//                             w-[66px]
//                             rounded-lg
//                             border
//                             border-blue-200
//                             bg-blue-50/40
//                             px-1
//                             text-center
//                             text-[11px]
//                             font-bold
//                             text-blue-700
//                             outline-none
//                             transition-all
//                             duration-150
//                             hover:border-blue-300
//                             hover:bg-blue-50
//                             hover:shadow-sm
//                             focus:border-blue-400
//                             focus:bg-white
//                             focus:ring-2
//                             focus:ring-blue-100
//                             focus:shadow-[0_3px_12px_rgba(37,99,235,0.10)]
//                           "
//                         />

//                       </div>

//                     </td>


//                     {/* ==================================================
//                         SS STOCK
//                     ================================================== */}
//                     <td className="px-2 py-2 text-center">

//                       <div
//                         className="
//                           inline-flex
//                           min-w-[52px]
//                           items-center
//                           justify-center
//                           gap-1.5
//                           rounded-lg
//                           border
//                           border-slate-100
//                           bg-slate-50
//                           px-2
//                           py-1.5
//                           transition-all
//                           duration-150
//                           group-hover:border-slate-200
//                           group-hover:bg-white
//                         "
//                       >

//                         <span
//                           className="
//                             text-[7px]
//                             font-bold
//                             uppercase
//                             text-slate-400
//                           "
//                         >
//                           SS
//                         </span>

//                         <span
//                           className="
//                             text-[10px]
//                             font-bold
//                             text-slate-600
//                           "
//                         >
//                           {item.ss_virtual_stock ?? 0}
//                         </span>

//                       </div>

//                     </td>


//                     {/* ==================================================
//                         CITY STOCK
//                     ================================================== */}
//                     <td className="px-2 py-2 text-center">

//                       <div
//                         className={`
//                           inline-flex
//                           min-w-[58px]
//                           items-center
//                           justify-center
//                           gap-1.5
//                           rounded-lg
//                           px-2
//                           py-1.5
//                           ring-1
//                           transition-all
//                           duration-200
//                           ${
//                             selectedCity === "Mumbai"
//                               ? `
//                                 bg-purple-50
//                                 text-purple-700
//                                 ring-purple-100
//                                 group-hover:bg-purple-100/70
//                               `
//                               : `
//                                 bg-blue-50
//                                 text-blue-700
//                                 ring-blue-100
//                                 group-hover:bg-blue-100/70
//                               `
//                           }
//                         `}
//                       >

//                         <span
//                           className={`
//                             h-1.5
//                             w-1.5
//                             rounded-full
//                             transition-transform
//                             duration-200
//                             group-hover:scale-125
//                             ${
//                               selectedCity === "Mumbai"
//                                 ? "bg-purple-500"
//                                 : "bg-blue-500"
//                             }
//                           `}
//                         />

//                         <span className="text-[10px] font-bold">
//                           {cityStock ?? 0}
//                         </span>

//                       </div>

//                     </td>


//                     {/* ==================================================
//                         STATUS
//                     ================================================== */}
//                     <td className="px-2 py-2 text-center">

//                       <div className="flex flex-col items-center justify-center">

//                         <button
//                           type="button"
//                           onClick={() =>
//                             updateManualAvailability(
//                               item.product,
//                               isAvailable
//                                 ? "Not Available"
//                                 : "Available"
//                             )
//                           }
//                           title={
//                             isAvailable
//                               ? "Available — click to change"
//                               : "Not Available — click to change"
//                           }
//                           className="
//                             relative
//                             h-[22px]
//                             w-[40px]
//                             shrink-0
//                             rounded-full
//                             outline-none
//                             transition-all
//                             duration-200
//                             hover:scale-105
//                             active:scale-90
//                             focus:ring-2
//                             focus:ring-blue-100
//                           "
//                         >

//                           {/* TRACK */}
//                           <span
//                             className={`
//                               absolute
//                               inset-0
//                               rounded-full
//                               transition-all
//                               duration-300
//                               ${
//                                 isAvailable
//                                   ? `
//                                     bg-emerald-500
//                                     shadow-[0_2px_8px_rgba(16,185,129,0.25)]
//                                   `
//                                   : `
//                                     bg-slate-300
//                                     hover:bg-slate-400
//                                   `
//                               }
//                             `}
//                           />

//                           {/* LEFT X */}
//                           {!isAvailable && (
//                             <span
//                               className="
//                                 absolute
//                                 left-[5px]
//                                 top-1/2
//                                 -translate-y-1/2
//                                 text-white
//                               "
//                             >
//                               <X
//                                 size={8}
//                                 strokeWidth={3}
//                               />
//                             </span>
//                           )}

//                           {/* KNOB */}
//                           <span
//                             className={`
//                               absolute
//                               top-[3px]
//                               flex
//                               h-4
//                               w-4
//                               items-center
//                               justify-center
//                               rounded-full
//                               bg-white
//                               shadow-[0_1px_4px_rgba(15,23,42,0.18)]
//                               transition-all
//                               duration-300
//                               ${
//                                 isAvailable
//                                   ? "left-[21px]"
//                                   : "left-[3px]"
//                               }
//                             `}
//                           >

//                             {isAvailable ? (
//                               <Check
//                                 size={8}
//                                 strokeWidth={3}
//                                 className="
//                                   text-emerald-600
//                                   transition-transform
//                                   duration-200
//                                 "
//                               />
//                             ) : (
//                               <X
//                                 size={8}
//                                 strokeWidth={3}
//                                 className="text-slate-400"
//                               />
//                             )}

//                           </span>

//                         </button>


//                         {isManual ? (
//                           <span
//                             className="
//                               mt-1
//                               rounded
//                               border
//                               border-orange-100
//                               bg-orange-50
//                               px-1
//                               py-0.5
//                               text-[6px]
//                               font-bold
//                               uppercase
//                               tracking-wide
//                               text-orange-500
//                             "
//                           >
//                             Manual
//                           </span>
//                         ) : (
//                           <span
//                             className={`
//                               mt-1
//                               flex
//                               items-center
//                               gap-0.5
//                               text-[6px]
//                               font-semibold
//                               ${
//                                 isAvailable
//                                   ? "text-emerald-500"
//                                   : "text-slate-400"
//                               }
//                             `}
//                           >
//                             <CircleDot size={5} />
//                             Auto
//                           </span>
//                         )}

//                       </div>

//                     </td>


//                     {/* ==================================================
//                         CARTON
//                     ================================================== */}
//                     <td className="px-2 py-2 text-center">

//                       <span
//                         className="
//                           text-[9px]
//                           font-medium
//                           text-slate-500
//                         "
//                       >
//                         {productData?.cartoon_size ?? "-"}
//                       </span>

//                     </td>


//                     {/* ==================================================
//                         PRICE
//                     ================================================== */}
//                     <td className="px-2 py-2 text-center">

//                       {productData?.price ? (
//                         <span
//                           className="
//                             text-[10px]
//                             font-semibold
//                             text-slate-600
//                           "
//                         >
//                           ₹{productData.price}
//                         </span>
//                       ) : (
//                         <span className="text-[9px] text-slate-300">
//                           —
//                         </span>
//                       )}

//                     </td>


//                     {/* ==================================================
//                         TOTAL
//                     ================================================== */}
//                     <td className="px-2 py-2 text-center">

//                       <span
//                         className={`
//                           inline-flex
//                           min-w-[66px]
//                           items-center
//                           justify-center
//                           rounded-lg
//                           px-2
//                           py-1.5
//                           text-[10px]
//                           font-bold
//                           transition-all
//                           duration-200
//                           ${
//                             isAvailable
//                               ? `
//                                 bg-blue-50
//                                 text-blue-700
//                                 ring-1
//                                 ring-blue-100
//                                 group-hover:bg-blue-100
//                                 group-hover:shadow-sm
//                               `
//                               : `
//                                 bg-slate-50
//                                 text-slate-300
//                                 ring-1
//                                 ring-slate-100
//                               `
//                           }
//                         `}
//                       >
//                         ₹{rowTotal}
//                       </span>

//                     </td>


//                     {/* ==================================================
//                         DELETE
//                     ================================================== */}
//                     <td className="px-2 py-2 text-center">

//                       <button
//                         type="button"
//                         onClick={() => {
//                           setItemToDelete(
//                             item.product
//                           );

//                           setShowDeleteModal(true);
//                         }}
//                         title="Delete product"
//                         className="
//                           inline-flex
//                           h-7
//                           w-7
//                           items-center
//                           justify-center
//                           rounded-lg
//                           text-slate-300
//                           transition-all
//                           duration-200
//                           hover:scale-105
//                           hover:bg-red-50
//                           hover:text-red-500
//                           active:scale-90
//                         "
//                       >
//                         <Trash2 size={13} />
//                       </button>

//                     </td>

//                   </tr>
//                 );
//               })}

//             </tbody>

//           </table>


//           {/* ======================================================
//               EMPTY STATE
//           ====================================================== */}
//           {editedItems.length === 0 && (
//             <div
//               className="
//                 flex
//                 min-h-[250px]
//                 flex-col
//                 items-center
//                 justify-center
//                 px-5
//                 text-center
//               "
//             >

//               <div className="relative mb-3">

//                 <div
//                   className="
//                     flex
//                     h-14
//                     w-14
//                     items-center
//                     justify-center
//                     rounded-2xl
//                     bg-gradient-to-br
//                     from-blue-50
//                     via-indigo-50
//                     to-white
//                     text-blue-500
//                     ring-1
//                     ring-blue-100
//                     shadow-[0_5px_20px_rgba(37,99,235,0.08)]
//                     transition-all
//                     duration-300
//                     hover:-translate-y-1
//                     hover:shadow-[0_8px_25px_rgba(37,99,235,0.12)]
//                   "
//                 >
//                   <Boxes size={22} />
//                 </div>

//                 <span
//                   className="
//                     absolute
//                     -right-1
//                     -top-1
//                     flex
//                     h-5
//                     w-5
//                     items-center
//                     justify-center
//                     rounded-full
//                     bg-white
//                     text-blue-500
//                     shadow-sm
//                     ring-1
//                     ring-slate-100
//                   "
//                 >
//                   <Sparkles size={9} />
//                 </span>

//               </div>

//               <h4
//                 className="
//                   text-sm
//                   font-bold
//                   tracking-tight
//                   text-slate-700
//                 "
//               >
//                 No products added
//               </h4>

//               <p
//                 className="
//                   mt-1
//                   max-w-[280px]
//                   text-[10px]
//                   leading-5
//                   text-slate-400
//                 "
//               >
//                 Search for a product or sale name
//                 above to add items to this order.
//               </p>

//               <button
//                 type="button"
//                 onClick={() =>
//                   addProductInputRef.current?.focus()
//                 }
//                 className="
//                   mt-4
//                   rounded-xl
//                   border
//                   border-blue-100
//                   bg-blue-50
//                   px-3.5
//                   py-2
//                   text-[10px]
//                   font-bold
//                   text-blue-600
//                   shadow-sm
//                   transition-all
//                   duration-200
//                   hover:-translate-y-0.5
//                   hover:bg-blue-100
//                   hover:shadow-[0_4px_12px_rgba(37,99,235,0.10)]
//                   active:translate-y-0
//                   active:scale-95
//                 "
//               >
//                 Start adding products
//               </button>

//             </div>
//           )}

//         </div>


//         {/* ======================================================
//             FOOTER SUMMARY
//         ====================================================== */}
//         <div
//           className="
//             border-t
//             border-slate-200
//             bg-gradient-to-r
//             from-slate-50
//             via-slate-50
//             to-white
//           "
//         >

//           <div
//             className="
//               flex
//               items-center
//               justify-between
//               gap-2
//             "
//           >

//             {/* LEFT SUMMARY */}
//             <div
//               className="
//                 flex
//                 min-w-0
//                 items-center
//                 gap-2.5
//                 px-3
//                 py-2.5
//                 sm:gap-3
//                 sm:px-4
//               "
//             >

//               {/* ITEMS */}
//               <div className="min-w-[30px]">

//                 <p
//                   className="
//                     text-[7px]
//                     font-bold
//                     uppercase
//                     tracking-wider
//                     text-slate-400
//                   "
//                 >
//                   Items
//                 </p>

//                 <p
//                   className="
//                     mt-0.5
//                     text-[11px]
//                     font-bold
//                     text-slate-700
//                   "
//                 >
//                   {editedItems.length}
//                 </p>

//               </div>

//               <div className="h-6 w-px bg-slate-200" />


//               {/* LOCATION */}
//               <div>

//                 <p
//                   className="
//                     text-[7px]
//                     font-bold
//                     uppercase
//                     tracking-wider
//                     text-slate-400
//                   "
//                 >
//                   Location
//                 </p>

//                 <p
//                   className={`
//                     mt-0.5
//                     text-[11px]
//                     font-bold
//                     ${
//                       selectedCity === "Mumbai"
//                         ? "text-purple-600"
//                         : "text-blue-600"
//                     }
//                   `}
//                 >
//                   {selectedCity}
//                 </p>

//               </div>

//               <div className="h-6 w-px bg-slate-200" />


//               {/* AVAILABLE */}
//               <div>

//                 <p
//                   className="
//                     text-[7px]
//                     font-bold
//                     uppercase
//                     tracking-wider
//                     text-slate-400
//                   "
//                 >
//                   Available
//                 </p>

//                 <p
//                   className="
//                     mt-0.5
//                     text-[11px]
//                     font-bold
//                     text-emerald-600
//                   "
//                 >
//                   {availableCount}
//                 </p>

//               </div>

//             </div>


//             {/* GRAND TOTAL */}
//             <div
//               className="
//                 flex
//                 shrink-0
//                 items-center
//                 gap-2
//                 border-l
//                 border-slate-200
//                 bg-white
//                 px-2.5
//                 py-2
//                 shadow-[-4px_0_12px_rgba(15,23,42,0.025)]
//                 sm:min-w-[220px]
//                 sm:gap-3
//                 sm:px-4
//               "
//             >

//               <div className="hidden sm:block">

//                 <p
//                   className="
//                     text-[7px]
//                     font-bold
//                     uppercase
//                     tracking-wider
//                     text-slate-400
//                   "
//                 >
//                   Grand Total
//                 </p>

//                 <p
//                   className="
//                     mt-0.5
//                     text-[8px]
//                     text-slate-400
//                   "
//                 >
//                   Available items only
//                 </p>

//               </div>

//               <div
//                 className="
//                   rounded-xl
//                   bg-gradient-to-br
//                   from-blue-50
//                   via-indigo-50
//                   to-white
//                   px-3
//                   py-2
//                   text-sm
//                   font-extrabold
//                   text-blue-700
//                   ring-1
//                   ring-blue-100
//                   shadow-[0_3px_10px_rgba(37,99,235,0.07)]
//                   transition-all
//                   duration-200
//                   hover:scale-[1.02]
//                   hover:shadow-[0_5px_15px_rgba(37,99,235,0.10)]
//                 "
//               >
//                 ₹{grandTotal.toFixed(1)}
//               </div>

//             </div>

//           </div>

//         </div>

//       </div>
//     </>
//   );
// }