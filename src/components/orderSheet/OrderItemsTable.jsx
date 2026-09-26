// import { FaGift } from "react-icons/fa";
// import { Trash2 } from "lucide-react";
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
//   setSelectedCity
// }) {
//   const approvedInputRefs = useRef({});
//   const addProductInputRef = useRef(null);

//   // -------------------------------------
//   // ✅ 1. AUTO AVAILABILITY CHECK
//   // -------------------------------------
//   const tableScrollRef = useRef(null);
//   useEffect(() => {
//     if (tableScrollRef.current) {
//       tableScrollRef.current.scrollTop =
//         tableScrollRef.current.scrollHeight;
//     }
//   }, [editedItems.length]); // 👈 sirf jab product add/remove ho

//   const getAvailability = (product, item, city) => {
//     if (!product) return false;
//     const qty = Number(item.quantity) || 0;

//     if (city === "Mumbai") {
//       return (product.mumbai_stock ?? 0) >= qty;
//     }
//     return (item.ss_virtual_stock ?? 0) >= qty;
//   };

//   useEffect(() => {
//     if (editedItems.length === 0) return;

//     const lastItem = editedItems[editedItems.length - 1];

//     setTimeout(() => {
//       approvedInputRefs.current[lastItem.product]?.focus();
//     }, 0);
//   }, [editedItems.length]);

//   // -------------------------------------
//   // ✅ 2. FINAL AVAILABILITY (Manual → Auto)
//   // -------------------------------------
//   const getFinalAvailability = (item, productData) => {
//     if (manualAvailabilityMap[item.product]) {
//       return manualAvailabilityMap[item.product];
//     }

//     return getAvailability(productData, item, selectedCity)
//       ? "Available"
//       : "Not Available";
//   };

//   const fuseResults = useFuseSearch(
//     allProducts,
//     searchTerm,
//     {
//       keys: ["product_name", "sale_names"],
//       threshold: 0.3,
//     }
//   );

//   const filteredProducts = fuseResults;

//   const handleKeyDown = (e) => {

//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setHighlightIndex((prev) =>
//         prev < filteredProducts.length - 1 ? prev + 1 : 0
//       );
//     }

//     else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setHighlightIndex((prev) =>
//         prev > 0 ? prev - 1 : filteredProducts.length - 1
//       );
//     }

//     else if (e.key === "Enter") {
//       e.preventDefault();

//       const selectedProduct = filteredProducts[highlightIndex];

//       if (selectedProduct) {
//         handleAddProductBySearch(selectedProduct);
//       }
//     }
//   };

//   return (
//     <div className="border-t border-r border-gray-500">
//       <div ref={tableScrollRef} className="max-h-[70vh] overflow-y-auto p-0 m-0 ">
//         <table className=" min-w-full border-collapse text-sm">

//           {/* ================= HEADER ================= */}
//           <thead className="sticky top-0 z-20 bg-gray-100 text-gray-800 text-xs font-semibold uppercase tracking-wide">
//             <tr className="border">
//               <th className="p-1 border border-gray-500">Product</th>
//               <th className="p-1 border border-gray-500">SS Order</th>
//               <th className="p-1 border border-gray-500">Approved</th>
//               <th className="p-1 border border-gray-500">SS-Stock</th>

//               <th className="border border-gray-500">
//                 <select
//                   value={selectedCity}
//                   onChange={(e) => setSelectedCity(e.target.value)}
//                   className="bg-transparent text-xs font-semibold outline-none cursor-pointer"
//                 >
//                   <option value="Delhi">DELHI</option>
//                   <option value="Mumbai">MUMBAI</option>
//                 </select>
//               </th>

//               <th className="p-1 border border-gray-500">Availability</th>
//               <th className="p-1 border border-gray-500">Carton</th>
//               <th className="p-1 border border-gray-500">Price</th>
//               <th className="p-1 border border-gray-500">Total</th>
//               <th className="p-1 border border-gray-500">Actions</th>
//             </tr>
//           </thead>

//           {/* ================= BODY ================= */}
//           <tbody className="text-xs">
//             {editedItems.map((item) => {
//               const productData = allProducts.find(
//                 (p) => p.product_id === item.product
//               );

//               const finalAvail = getFinalAvailability(item, productData);

//               return (
//                 <tr key={item.product} className="hover:bg-gray-50 bg-white text-center">
//                   <td className="p-1 ps-3 border-b border-x border-gray-400">
//                     <span className="flex items-center gap-1">
//                       {item.is_scheme_item && (
//                         <FaGift className="text-pink-500" />
//                       )}
//                       {item.product_name}
//                     </span>
//                   </td>

//                   <td className="p-1 border-b border-x border-gray-400">
//                     {item.original_quantity}
//                   </td>

//                   <td className="p-1 border-b border-x border-gray-400">
//                     <input
//                       type="number"
//                       min="0"
//                       step="1"
//                       ref={(el) => (approvedInputRefs.current[item.product] = el)}
//                       value={item.quantity === "" ? "" : item.quantity}
//                       onChange={(e) =>
//                         handleEditQuantity(item.product, e.target.value)
//                       }
//                       onKeyDown={(e) => {
//                         if (e.key === "Enter") {
//                           e.preventDefault();
//                           addProductInputRef.current?.focus();
//                         }
//                       }}
//                       className="border rounded-lg p-1 w-20 text-center"
//                     />

//                   </td>

//                   <td className="p-1 border-b border-x border-gray-400 bg-red-100">
//                     {item.ss_virtual_stock}
//                   </td>

//                   {selectedCity === "Delhi" && (
//                     <td className="p-1 border-b border-x border-gray-400 bg-red-100">
//                       {productData?.virtual_stock ?? "-"}
//                     </td>
//                   )}

//                   {selectedCity === "Mumbai" && (
//                     <td className="p-1 border-b border-x border-gray-400 bg-purple-300">
//                       {productData?.mumbai_stock ?? "-"}
//                     </td>
//                   )}

//                   <td className="p-1 border-b border-x border-gray-400">
//                     <select
//                       value={finalAvail}
//                       onChange={(e) =>
//                         updateManualAvailability(item.product, e.target.value)
//                       }
//                       className={`border rounded p-1 ${finalAvail === "Available"
//                         ? "text-green-600"
//                         : "text-red-600"
//                         }`}
//                     >
//                       <option value="Available">Available</option>
//                       <option value="Not Available">Not Available</option>
//                     </select>
//                   </td>

//                   <td className="p-1 border-b border-x border-gray-400">
//                     {productData?.cartoon_size ?? "-"}
//                   </td>

//                   <td className="p-1 border-b border-x border-gray-400">
//                     {productData?.price ? `₹${productData.price}` : ""}
//                   </td>

//                   <td className="p-1 border-b border-x border-gray-400 bg-blue-100">
//                     ₹
//                     {finalAvail === "Available"
//                       ? (
//                         (Number(item.quantity) || 0) *
//                         (Number(productData?.price) || 0)
//                       ).toFixed(1)
//                       : "0"}
//                   </td>

//                   <td className="p-1 border-b border-x border-gray-400">
//                     <button
//                       onClick={() => {
//                         setItemToDelete(item.product);
//                         setShowDeleteModal(true);
//                       }}
//                       className="text-red-600 hover:text-red-800 px-3 p-1"
//                     >
//                       <Trash2 size={18} />
//                     </button>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>


//         </table>

//       </div>
//       {/* ================= FOOTER (ADD PRODUCT + TOTAL) ================= */}

//       <div className="font-bold text-xs text-gray-800 bg-gray-200 flex ">

//         {/* 🆕 ADD PRODUCT (GOOGLE SHEET STYLE) */}
//         <div className="px-0 py-0 border border-black relative bg-white w-full" >
//           <input
//             ref={addProductInputRef}
//             type="text"
//             value={searchTerm}
//             onChange={(e) => {
//               setSearchTerm(e.target.value);
//               setHighlightIndex(0);
//             }}
//             onKeyDown={handleKeyDown}
//             placeholder="Add product..."
//             className="w-full px-2 py-1 text-xs text-center border border-transparent focus:outline-none rounded-none"
//           />


//           {searchTerm && (
//             <div className="absolute left-0 right-0 top-full bg-white border shadow-lg max-h-34 overflow-y-auto z-[999]">
//               {filteredProducts.length > 0 ? (
//                 filteredProducts.map((prod, index) => {
//                   const matchedSaleName = prod.sale_names?.find((name) =>
//                     name.toLowerCase().includes(searchTerm.toLowerCase())
//                   );
//                   const schemeText = getSchemeText(prod.product_id);

//                   return (
//                     <div key={prod.product_id}>
//                       <div
//                         onClick={() => handleAddProductBySearch(prod)}
//                         className={`px-2 py-1 text-xs cursor-pointer flex justify-between items-center ${highlightIndex === index
//                           ? "bg-orange-100"
//                           : "hover:bg-gray-100"
//                           }`}
//                       >
//                         <div className="flex flex-col leading-tight">
//                           {matchedSaleName && (
//                             <span className="truncate text-[10px] text-blue-500 italic">
//                               {matchedSaleName}
//                             </span>
//                           )}
//                           <span className="truncate font-semibold text-gray-800">
//                             {prod.product_name}
//                           </span>
//                         </div>
//                         {schemeText && (
//                           <FaGift className="text-pink-500 text-xs" />
//                         )}
//                       </div>

//                       {schemeText && (
//                         <div className="px-2 text-[10px] text-pink-600">
//                           {schemeText}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })
//               ) : (
//                 <div className="px-2 py-1 text-gray-400 text-xs">
//                   No products found
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         <div className="px-4 py-2 text-right border border-black w-full">
//           Grand Total :
//         </div>

//         <div className="px-5 py-2 border border-black bg-blue-200 w-full">
//           ₹
//           {editedItems
//             .reduce((sum, item) => {
//               const productData = allProducts.find(
//                 (p) => p.product_id === item.product
//               );

//               const finalAvail =
//                 manualAvailabilityMap[item.product] ??
//                 ((selectedCity === "Mumbai"
//                   ? (productData?.mumbai_stock ?? 0)
//                   : (item.ss_virtual_stock ?? 0)) >=
//                   Number(item.quantity || 0)
//                   ? "Available"
//                   : "Not Available");

//               if (finalAvail !== "Available") return sum;

//               return (
//                 sum +
//                 (Number(item.quantity) || 0) *
//                 (Number(productData?.price) || 0)
//               );
//             }, 0)
//             .toFixed(1)}
//         </div>
//       </div>

//     </div>
//   );
// }






import { FaGift } from "react-icons/fa";
import {
  Search,
  Trash2,
  X,
  ChevronDown,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
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
  setSelectedCity,
}) {
  const approvedInputRefs = useRef({});
  const addProductInputRef = useRef(null);
  const tableScrollRef = useRef(null);
  const dropdownRafRef = useRef(null);

  /* =========================================================
     PRODUCT MAP
  ========================================================= */
  const productMap = useMemo(() => {
    const map = new Map();

    for (const product of allProducts || []) {
      if (product?.product_id != null) {
        map.set(product.product_id, product);
      }
    }

    return map;
  }, [allProducts]);

  /* =========================================================
     DROPDOWN POSITION
  ========================================================= */
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 280,
    openAbove: false,
  });

  const updateDropdownPosition = () => {
    if (dropdownRafRef.current) {
      cancelAnimationFrame(
        dropdownRafRef.current
      );
    }

    dropdownRafRef.current =
      requestAnimationFrame(() => {
        const input =
          addProductInputRef.current;

        if (!input) return;

        const rect =
          input.getBoundingClientRect();

        const viewportWidth =
          window.innerWidth;

        const viewportHeight =
          window.innerHeight;

        const gap = 4;

        /*
         * Dropdown is limited to 15 rows.
         * Keep enough room for header/footer.
         */
        const preferredHeight = 300;
        const minimumDropdownHeight = 150;

        const spaceBelow =
          viewportHeight - rect.bottom;

        const spaceAbove = rect.top;

        /*
         * IMPORTANT:
         * If footer is close to / below viewport bottom,
         * dropdown MUST open upward.
         */
        const shouldOpenAbove =
          spaceBelow <
            minimumDropdownHeight &&
          spaceAbove > 120;

        const availableSpace = shouldOpenAbove
          ? spaceAbove - gap
          : spaceBelow - gap;

        const maxHeight = Math.max(
          minimumDropdownHeight,
          Math.min(
            preferredHeight,
            Math.max(
              availableSpace,
              minimumDropdownHeight
            )
          )
        );

        /*
         * Keep dropdown inside viewport horizontally.
         */
        const width = Math.min(
          Math.max(rect.width, 280),
          viewportWidth - 16
        );

        let left = rect.left;

        if (
          left + width >
          viewportWidth - 8
        ) {
          left =
            viewportWidth -
            width -
            8;
        }

        if (left < 8) {
          left = 8;
        }

        let top;

        if (shouldOpenAbove) {
          /*
           * Bottom of dropdown exactly meets
           * top of search input.
           */
          top =
            rect.top -
            maxHeight -
            gap;

          /*
           * Never allow negative top.
           */
          if (top < 8) {
            top = 8;
          }
        } else {
          /*
           * Normal case: open below input.
           */
          top = rect.bottom + gap;

          /*
           * Keep inside viewport.
           */
          if (
            top + maxHeight >
            viewportHeight - 8
          ) {
            top = Math.max(
              8,
              viewportHeight -
                maxHeight -
                8
            );
          }
        }

        setDropdownPosition({
          top,
          left,
          width,
          maxHeight,
          openAbove: shouldOpenAbove,
        });
      });
  };

  /* =========================================================
     DROPDOWN POSITION LISTENERS
  ========================================================= */
  useEffect(() => {
    if (!searchTerm) return;

    updateDropdownPosition();

    const handleViewportChange = () => {
      updateDropdownPosition();
    };

    window.addEventListener(
      "resize",
      handleViewportChange
    );

    /*
     * Capture scrolling from table/page/ancestors.
     */
    window.addEventListener(
      "scroll",
      handleViewportChange,
      true
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleViewportChange
      );

      window.removeEventListener(
        "scroll",
        handleViewportChange,
        true
      );

      if (dropdownRafRef.current) {
        cancelAnimationFrame(
          dropdownRafRef.current
        );
      }
    };
  }, [searchTerm]);

  /* =========================================================
     TABLE AUTO SCROLL
  ========================================================= */
  useEffect(() => {
    const container =
      tableScrollRef.current;

    if (!container) return;

    container.scrollTop =
      container.scrollHeight;
  }, [editedItems.length]);

  /* =========================================================
     APPROVED QUANTITY VALIDATION
  ========================================================= */
  const isValidQuantity = (value) => {
    if (value === "") return false;

    if (!/^\d+$/.test(String(value))) {
      return false;
    }

    return Number(value) > 0;
  };

  const handleApprovedQuantityChange = (
    productId,
    value,
    inputElement
  ) => {
    /*
     * ONLY DIGITS.
     *
     * Examples:
     * "12"  -> "12"
     * "1a2" -> "12"
     * "abc" -> ""
     * "-5"  -> "5"
     * "1.5" -> "15"
     *
     * Since user asked for numeric integer quantity,
     * decimal/sign characters are not allowed.
     */
    const numericValue = String(value)
      .replace(/\D/g, "");

    handleEditQuantity(
      productId,
      numericValue
    );

    /*
     * Native browser validation as an additional layer.
     * Actual API submit validation is also done
     * in parent handleVerify below.
     */
    if (inputElement) {
      if (
        !isValidQuantity(numericValue)
      ) {
        inputElement.setCustomValidity(
          "Approved quantity must be greater than 0."
        );
      } else {
        inputElement.setCustomValidity("");
      }
    }
  };

  /* =========================================================
     KEEP NATIVE VALIDITY IN SYNC
  ========================================================= */
  useEffect(() => {
    for (const item of editedItems) {
      const input =
        approvedInputRefs.current[
          item.product
        ];

      if (!input) continue;

      input.setCustomValidity(
        isValidQuantity(
          item.quantity
        )
          ? ""
          : "Approved quantity must be greater than 0."
      );
    }
  }, [editedItems]);

  /* =========================================================
     AUTO FOCUS APPROVED QUANTITY
  ========================================================= */
  useEffect(() => {
    if (editedItems.length === 0) {
      return;
    }

    const lastItem =
      editedItems[
        editedItems.length - 1
      ];

    const frame =
      requestAnimationFrame(() => {
        approvedInputRefs.current[
          lastItem.product
        ]?.focus();
      });

    return () =>
      cancelAnimationFrame(frame);
  }, [editedItems.length]);

  /* =========================================================
     AVAILABILITY
  ========================================================= */
  const getAvailability = (
    product,
    item,
    city
  ) => {
    if (!product) return false;

    const qty =
      Number(item.quantity) || 0;

    if (city === "Mumbai") {
      return (
        (product.mumbai_stock ??
          0) >= qty
      );
    }

    return (
      (item.ss_virtual_stock ??
        0) >= qty
    );
  };

  const getFinalAvailability = (
    item,
    productData
  ) => {
    if (
      manualAvailabilityMap[
        item.product
      ]
    ) {
      return manualAvailabilityMap[
        item.product
      ];
    }

    return getAvailability(
      productData,
      item,
      selectedCity
    )
      ? "Available"
      : "Not Available";
  };

  /* =========================================================
     FUSE SEARCH
  ========================================================= */
  const fuseResults =
    useFuseSearch(
      allProducts,
      searchTerm,
      {
        keys: [
          "product_name",
          "sale_names",
        ],
        threshold: 0.3,
      }
    );

  const filteredProducts =
    fuseResults || [];

  /* =========================================================
     LIMIT DROPDOWN TO 15 RESULTS
  ========================================================= */
  const dropdownProducts =
    useMemo(
      () =>
        filteredProducts.slice(
          0,
          15
        ),
      [filteredProducts]
    );

  /* =========================================================
     KEYBOARD SEARCH
  ========================================================= */
  const handleKeyDown = (
    event
  ) => {
    if (
      event.key === "Escape"
    ) {
      event.preventDefault();

      setSearchTerm("");
      setHighlightIndex(0);

      return;
    }

    if (
      !dropdownProducts.length
    ) {
      return;
    }

    if (
      event.key === "ArrowDown"
    ) {
      event.preventDefault();

      setHighlightIndex(
        (prev) =>
          prev <
          dropdownProducts.length -
            1
            ? prev + 1
            : 0
      );

      return;
    }

    if (
      event.key === "ArrowUp"
    ) {
      event.preventDefault();

      setHighlightIndex(
        (prev) =>
          prev > 0
            ? prev - 1
            : dropdownProducts.length -
              1
      );

      return;
    }

    if (
      event.key === "Enter"
    ) {
      event.preventDefault();

      const selectedProduct =
        dropdownProducts[
          highlightIndex
        ];

      if (selectedProduct) {
        handleAddProductBySearch(
          selectedProduct
        );
      }
    }
  };

  /* =========================================================
     GRAND TOTAL
  ========================================================= */
  const grandTotal = useMemo(() => {
    return editedItems
      .reduce(
        (sum, item) => {
          const productData =
            productMap.get(
              item.product
            );

          const finalAvail =
            manualAvailabilityMap[
              item.product
            ] ??
            ((selectedCity ===
            "Mumbai"
              ? (productData?.mumbai_stock ??
                  0)
              : (item.ss_virtual_stock ??
                  0)) >=
            Number(
              item.quantity || 0
            )
              ? "Available"
              : "Not Available");

          if (
            finalAvail !==
            "Available"
          ) {
            return sum;
          }

          return (
            sum +
            (Number(
              item.quantity
            ) || 0) *
              (Number(
                productData?.price
              ) || 0)
          );
        },
        0
      )
      .toFixed(1);
  }, [
    editedItems,
    productMap,
    manualAvailabilityMap,
    selectedCity,
  ]);

  /* =========================================================
     DROPDOWN PORTAL
  ========================================================= */
  const productDropdown =
    searchTerm &&
    typeof document !==
      "undefined"
      ? createPortal(
          <div
            className="
              fixed
              z-[99999]
              overflow-hidden
              rounded-lg
              border
              border-slate-200
              bg-white
              shadow-[0_12px_35px_rgba(15,23,42,0.16)]
            "
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              maxHeight:
                dropdownPosition.maxHeight ||
                300,
            }}
          >
            {/* DROPDOWN HEADER */}
            <div
              className="
                sticky
                top-0
                z-10
                flex
                items-center
                justify-between
                border-b
                border-slate-200
                bg-slate-50
                px-3
                py-2
              "
            >
              <div className="flex items-center gap-2">
                <div
                  className="
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-md
                    bg-blue-100
                    text-blue-600
                  "
                >
                  <Search size={13} />
                </div>

                <span
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-slate-600
                  "
                >
                  Products
                </span>
              </div>

              {filteredProducts.length >
                0 && (
                <span
                  className="
                    rounded-full
                    bg-blue-50
                    px-2
                    py-0.5
                    text-[9px]
                    font-semibold
                    text-blue-600
                  "
                >
                  Showing{" "}
                  {Math.min(
                    filteredProducts.length,
                    15
                  )}{" "}
                  of{" "}
                  {filteredProducts.length}
                </span>
              )}
            </div>

            {/* RESULTS */}
            <div
              className="
                overflow-y-auto
                overscroll-contain
              "
              style={{
                maxHeight:
                  Math.max(
                    90,
                    (dropdownPosition.maxHeight ||
                      300) - 70
                  ),
              }}
            >
              {dropdownProducts.length >
              0 ? (
                dropdownProducts.map(
                  (
                    prod,
                    index
                  ) => {
                    const matchedSaleName =
                      prod.sale_names?.find(
                        (name) =>
                          name
                            .toLowerCase()
                            .includes(
                              searchTerm.toLowerCase()
                            )
                      );

                    const schemeText =
                      getSchemeText(
                        prod.product_id
                      );

                    const isHighlighted =
                      highlightIndex ===
                      index;

                    return (
                      <div
                        key={
                          prod.product_id
                        }
                        className="
                          border-b
                          border-slate-100
                          last:border-b-0
                        "
                      >
                        <div
                          onMouseEnter={() =>
                            setHighlightIndex(
                              index
                            )
                          }
                          onMouseDown={(
                            event
                          ) => {
                            event.preventDefault();
                          }}
                          onClick={() =>
                            handleAddProductBySearch(
                              prod
                            )
                          }
                          className={`
                            group
                            flex
                            cursor-pointer
                            items-center
                            justify-between
                            gap-2
                            px-3
                            py-2
                            transition-colors
                            duration-100
                            ${
                              isHighlighted
                                ? "bg-blue-50"
                                : "bg-white hover:bg-slate-50"
                            }
                          `}
                        >
                          {/* PRODUCT INFO */}
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <span
                              className={`
                                flex
                                h-5
                                w-5
                                shrink-0
                                items-center
                                justify-center
                                rounded
                                text-[9px]
                                font-semibold
                                ${
                                  isHighlighted
                                    ? "bg-blue-500 text-white"
                                    : "bg-slate-100 text-slate-400"
                                }
                              `}
                            >
                              {index + 1}
                            </span>

                            <div className="min-w-0 flex-1">
                              {matchedSaleName && (
                                <span
                                  className="
                                    block
                                    truncate
                                    text-[9px]
                                    font-medium
                                    italic
                                    text-blue-500
                                  "
                                >
                                  {
                                    matchedSaleName
                                  }
                                </span>
                              )}

                              <span
                                className="
                                  block
                                  truncate
                                  text-xs
                                  font-semibold
                                  text-slate-700
                                "
                              >
                                {
                                  prod.product_name
                                }
                              </span>
                            </div>
                          </div>

                          {/* SCHEME */}
                          {schemeText && (
                            <span
                              className="
                                flex
                                h-6
                                w-6
                                shrink-0
                                items-center
                                justify-center
                                rounded-md
                                bg-pink-50
                              "
                            >
                              <FaGift className="text-xs text-pink-500" />
                            </span>
                          )}
                        </div>

                        {schemeText && (
                          <div
                            className="
                              bg-pink-50
                              px-10
                              py-1
                              text-[9px]
                              font-medium
                              text-pink-600
                            "
                          >
                            {
                              schemeText
                            }
                          </div>
                        )}
                      </div>
                    );
                  }
                )
              ) : (
                <div
                  className="
                    flex
                    flex-col
                    items-center
                    justify-center
                    gap-1
                    px-4
                    py-6
                    text-center
                  "
                >
                  <Search
                    size={20}
                    className="text-slate-300"
                  />

                  <span
                    className="
                      text-xs
                      font-semibold
                      text-slate-400
                    "
                  >
                    No products found
                  </span>

                  <span
                    className="
                      text-[9px]
                      text-slate-300
                    "
                  >
                    Try product name or
                    sale name
                  </span>
                </div>
              )}
            </div>

            {/* DROPDOWN FOOTER */}
            {dropdownProducts.length >
              0 && (
              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-t
                  border-slate-200
                  bg-slate-50
                  px-3
                  py-1.5
                  text-[9px]
                  text-slate-400
                "
              >
                <span>
                  ↑ ↓ to navigate
                </span>

                <span>
                  Enter to add
                </span>
              </div>
            )}
          </div>,
          document.body
        )
      : null;

  return (
    <div className="w-full min-w-0 border-t border-r border-gray-500">
      {/* =====================================================
          TABLE
      ===================================================== */}
      <div
        ref={tableScrollRef}
        className="
            verified-orders-scroll
          max-h-[65vh]
          w-full
          overflow-x-auto
          overflow-y-auto
          p-0
          m-0
          overscroll-contain
        "
      >
        <table className="w-full min-w-[850px] border-collapse text-sm">
          {/* ================= HEADER ================= */}
          <thead
            className="
              sticky
              top-0
              z-20
              bg-gray-100
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-gray-800
            "
          >
            <tr className="border">
              <th className="whitespace-nowrap border border-gray-500 p-1">
                Product
              </th>

              <th className="whitespace-nowrap border border-gray-500 p-1">
                SS Order
              </th>

              <th className="whitespace-nowrap border border-gray-500 p-1">
                Approved
              </th>

              <th className="whitespace-nowrap border border-gray-500 p-1">
                SS-Stock
              </th>

              <th className="whitespace-nowrap border border-gray-500">
                <select
                  value={selectedCity}
                  onChange={(event) =>
                    setSelectedCity(
                      event.target.value
                    )
                  }
                  className="
                    cursor-pointer
                    bg-transparent
                    px-1
                    py-1
                    text-xs
                    font-semibold
                    outline-none
                  "
                >
                  <option value="Delhi">
                    DELHI
                  </option>

                  <option value="Mumbai">
                    MUMBAI
                  </option>
                </select>
              </th>

              <th className="whitespace-nowrap border border-gray-500 p-1">
                Availability
              </th>

              <th className="whitespace-nowrap border border-gray-500 p-1">
                Carton
              </th>

              <th className="whitespace-nowrap border border-gray-500 p-1">
                Price
              </th>

              <th className="whitespace-nowrap border border-gray-500 p-1">
                Total
              </th>

              <th className="whitespace-nowrap border border-gray-500 p-1">
                Actions
              </th>
            </tr>
          </thead>

          {/* ================= BODY ================= */}
          <tbody className="text-xs">
            {editedItems.map((item) => {
              const productData =
                productMap.get(
                  item.product
                );

              const finalAvail =
                getFinalAvailability(
                  item,
                  productData
                );

              const quantityValid =
                isValidQuantity(
                  item.quantity
                );

              return (
                <tr
                  key={item.product}
                  className="
                    bg-white
                    text-center
                    hover:bg-gray-50
                  "
                >
                  {/* PRODUCT */}
                  <td
                    className="
                      border-x
                      border-b
                      border-gray-400
                      p-1
                      ps-3
                      text-left
                    "
                  >
                    <span className="flex min-w-0 items-center gap-1">
                      {item.is_scheme_item && (
                        <FaGift className="shrink-0 text-pink-500" />
                      )}

                      <span className="truncate">
                        {item.product_name}
                      </span>
                    </span>
                  </td>

                  {/* SS ORDER */}
                  <td className="whitespace-nowrap border-x border-b border-gray-400 p-1">
                    {item.original_quantity}
                  </td>

                  {/* APPROVED QUANTITY */}
                  <td
                    className={`
                      w-30
                      min-w-[70px]
                      border
                      p-0
                      ${
                        quantityValid
                          ? "border-slate-400 bg-white"
                          : "border-red-400 bg-red-50"
                      }
                    `}
                  >
                    <input
                      ref={(element) => {
                        approvedInputRefs.current[
                          item.product
                        ] = element;

                        if (element) {
                          element.setCustomValidity(
                            isValidQuantity(
                              item.quantity
                            )
                              ? ""
                              : "Approved quantity must be greater than 0."
                          );
                        }
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      value={
                        item.quantity === ""
                          ? ""
                          : item.quantity
                      }
                      onChange={(event) =>
                        handleApprovedQuantityChange(
                          item.product,
                          event.target.value,
                          event.target
                        )
                      }
                      onKeyDown={(event) => {
                        /*
                         * Block non-numeric typing
                         * except navigation/edit keys.
                         */
                        const allowedKeys = [
                          "Backspace",
                          "Delete",
                          "Tab",
                          "Enter",
                          "ArrowLeft",
                          "ArrowRight",
                          "Home",
                          "End",
                        ];

                        if (
                          allowedKeys.includes(
                            event.key
                          )
                        ) {
                          if (
                            event.key ===
                            "Enter"
                          ) {
                            event.preventDefault();

                            addProductInputRef.current?.focus();
                          }

                          return;
                        }

                        if (
                          !/^\d$/.test(
                            event.key
                          )
                        ) {
                          event.preventDefault();
                        }
                      }}
                      onPaste={(event) => {
                        event.preventDefault();

                        const pastedText =
                          event.clipboardData.getData(
                            "text"
                          );

                        const numericValue =
                          pastedText.replace(
                            /\D/g,
                            ""
                          );

                        handleApprovedQuantityChange(
                          item.product,
                          numericValue,
                          event.currentTarget
                        );
                      }}
                      onInvalid={(event) => {
                        event.currentTarget.setCustomValidity(
                          "Approved quantity must be greater than 0."
                        );
                      }}
                      autoComplete="off"
                      aria-invalid={
                        !quantityValid
                      }
                      placeholder=""
                      className="
                        h-full
                        min-h-[34px]
                        w-full
                        rounded-none
                        border
                        border-transparent
                        bg-transparent
                        px-2
                        text-center
                        text-xs
                        text-slate-700
                        outline-none
                        focus:border-blue-500
                        focus:ring-1
                        focus:ring-blue-300
                      "
                    />
                  </td>

                  {/* SS STOCK */}
                  <td
                    className="
                      whitespace-nowrap
                      border-x
                      border-b
                      border-gray-400
                      bg-red-100
                      p-1
                    "
                  >
                    {item.ss_virtual_stock}
                  </td>

                  {/* DELHI STOCK */}
                  {selectedCity ===
                    "Delhi" && (
                    <td
                      className="
                        whitespace-nowrap
                        border-x
                        border-b
                        border-gray-400
                        bg-red-100
                        p-1
                      "
                    >
                      {productData?.virtual_stock ??
                        "-"}
                    </td>
                  )}

                  {/* MUMBAI STOCK */}
                  {selectedCity ===
                    "Mumbai" && (
                    <td
                      className="
                        whitespace-nowrap
                        border-x
                        border-b
                        border-gray-400
                        bg-purple-300
                        p-1
                      "
                    >
                      {productData?.mumbai_stock ??
                        "-"}
                    </td>
                  )}

                  {/* AVAILABILITY TOGGLE */}
                  <td
                    className="
                      w-20
                      border-x
                      border-b
                      border-gray-400
                      p-1
                    "
                  >
                    <button
                      type="button"
                      onClick={() =>
                        updateManualAvailability(
                          item.product,
                          finalAvail ===
                            "Available"
                            ? "Not Available"
                            : "Available"
                        )
                      }
                      className={`
                        relative
                        inline-flex
                        h-5
                        w-9
                        items-center
                        rounded-full
                        transition-colors
                        duration-150
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-300
                        ${
                          finalAvail ===
                          "Available"
                            ? "bg-green-500"
                            : "bg-red-400"
                        }
                      `}
                      aria-label={
                        finalAvail ===
                        "Available"
                          ? "Available"
                          : "Not Available"
                      }
                    >
                      <span
                        className={`
                          inline-block
                          h-4
                          w-4
                          transform
                          rounded-full
                          bg-white
                          shadow-sm
                          transition-transform
                          duration-150
                          ${
                            finalAvail ===
                            "Available"
                              ? "translate-x-4"
                              : "translate-x-0.5"
                          }
                        `}
                      />
                    </button>
                  </td>

                  {/* CARTON */}
                  <td className="whitespace-nowrap border-x border-b border-gray-400 p-1">
                    {productData?.cartoon_size ??
                      "-"}
                  </td>

                  {/* PRICE */}
                  <td className="whitespace-nowrap border-x border-b border-gray-400 p-1">
                    {productData?.price
                      ? `₹${productData.price}`
                      : ""}
                  </td>

                  {/* TOTAL */}
                  <td
                    className="
                      whitespace-nowrap
                      border-x
                      border-b
                      border-gray-400
                      bg-blue-100
                      p-1
                    "
                  >
                    ₹
                    {finalAvail ===
                    "Available"
                      ? (
                          (Number(
                            item.quantity
                          ) || 0) *
                          (Number(
                            productData?.price
                          ) || 0)
                        ).toFixed(1)
                      : "0"}
                  </td>

                  {/* DELETE */}
                  <td className="border-x border-b border-gray-400 p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setItemToDelete(
                          item.product
                        );

                        setShowDeleteModal(
                          true
                        );
                      }}
                      className="
                        rounded
                        px-3
                        py-1
                        text-red-600
                        transition
                        hover:bg-red-50
                        hover:text-red-800
                        active:scale-95
                      "
                      aria-label="Delete product"
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

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <div
        className="
          flex
          w-full
          min-w-0
          flex-col
          border
          border-slate-400
          bg-slate-100
          sm:flex-row
        "
      >
        {/* ADD PRODUCT */}
        <div
          className="
            relative
            min-w-0
            flex-1
            border-x
            border-b
            border-slate-300
            bg-white
          "
        >
          <div
            className="
              flex
              h-[42px]
              items-center
              gap-2
              px-2
            "
          >
            <div
              className="
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-md
                bg-blue-50
                text-blue-500
              "
            >
              <Search size={15} />
            </div>

            <input
              ref={addProductInputRef}
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(
                  event.target.value
                );
                setHighlightIndex(0);

                requestAnimationFrame(() => {
                  updateDropdownPosition();
                });
              }}
              onFocus={() => {
                if (searchTerm) {
                  updateDropdownPosition();
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search & add product..."
              autoComplete="off"
              className="
                min-w-0
                flex-1
                bg-transparent
                py-2
                text-xs
                font-medium
                text-slate-700
                outline-none
                placeholder:text-slate-400
              "
            />

            {searchTerm &&
              filteredProducts.length >
                0 && (
                <span
                  className="
                    hidden
                    shrink-0
                    rounded-full
                    bg-slate-100
                    px-2
                    py-1
                    text-[9px]
                    font-semibold
                    text-slate-500
                    sm:inline-flex
                  "
                >
                  {Math.min(
                    filteredProducts.length,
                    15
                  )}
                  {filteredProducts.length >
                  15
                    ? "+"
                    : ""}{" "}
                  results
                </span>
              )}

            {searchTerm && (
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={() => {
                  setSearchTerm("");
                  setHighlightIndex(
                    0
                  );

                  requestAnimationFrame(() => {
                    addProductInputRef.current?.focus();
                  });
                }}
                className="
                  flex
                  h-6
                  w-6
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  text-slate-400
                  transition
                  hover:bg-slate-100
                  hover:text-slate-700
                "
                aria-label="Clear product search"
              >
                <X size={14} />
              </button>
            )}

            {!searchTerm && (
              <span
                className="
                  hidden
                  shrink-0
                  items-center
                  gap-1
                  text-[9px]
                  font-medium
                  text-slate-400
                  md:flex
                "
              >
                ↑↓
                <span>
                  Enter
                </span>
              </span>
            )}
          </div>
        </div>

        {/* GRAND TOTAL LABEL */}
        <div
          className="
            flex
            min-h-[42px]
            w-full
            items-center
            justify-between
            gap-4
            border-x
            border-b
            border-slate-300
            bg-slate-50
            px-4
            sm:w-auto
            sm:min-w-[155px]
            sm:justify-center
          "
        >
          <div className="flex flex-col leading-tight">
            <span
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-wider
                text-slate-400
              "
            >
              Order Summary
            </span>

            <span
              className="
                text-xs
                font-bold
                text-slate-700
              "
            >
              Grand Total
            </span>
          </div>

          <ChevronDown
            size={13}
            className="
              hidden
              rotate-[-90deg]
              text-slate-400
              sm:block
            "
          />
        </div>

        {/* GRAND TOTAL VALUE */}
        <div
          className="
            flex
            min-h-[42px]
            w-full
            items-center
            justify-center
            border-x
            border-b
            border-blue-200
            bg-blue-50
            px-5
            sm:w-auto
            sm:min-w-[130px]
          "
        >
          <div
            className="
              rounded-lg
              border
              border-blue-200
              bg-white
              px-4
              py-1.5
              text-sm
              font-bold
              text-blue-600
              shadow-sm
            "
          >
            ₹{grandTotal}
          </div>
        </div>
      </div>

      {/* =====================================================
          PRODUCT DROPDOWN PORTAL
      ===================================================== */}
      {productDropdown}


      
      <style>{`
        .verified-orders-scroll {
          scrollbar-width: thin;
          scrollbar-color: #94a3b8 transparent;
        }

        .verified-orders-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .verified-orders-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .verified-orders-scroll::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 999px;
        }

        .verified-orders-scroll::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    
    </div>
  );
}


