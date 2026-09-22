// import {
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";

// import { useCachedProducts } from "../../hooks/useCachedProducts";
// import { useSelectedProducts } from "../../hooks/useSelectedProducts";

// const INITIAL_ROWS = 15;
// const PRODUCT_COL = 0;
// const QTY_COL = 1;

// const createEmptyRow = () => ({
//   id: null,
//   product_name: "",
//   cartoon_size: "",
//   quantity: "",
//   price: 0,
//   virtual_stock: 0,
// });

// const createRows = (count = INITIAL_ROWS) =>
//   Array.from({ length: count }, createEmptyRow);

// const getProductId = (product) =>
//   product?.id ?? product?.product_id ?? null;

// const normalize = (value) =>
//   String(value ?? "").trim().toLowerCase();

// const sanitizeQuantity = (value) =>
//   String(value ?? "").replace(/\D/g, "");

// const isFilledRow = (row) =>
//   Boolean(row?.id || String(row?.product_name || "").trim());

// const emptyProductData = () => ({
//   id: null,
//   product_name: "",
//   cartoon_size: "",
//   price: 0,
//   virtual_stock: 0,
// });

// /* =========================================================
//    PRODUCT CELL
// ========================================================= */

// function SheetProductCell({
//   products,
//   value,
//   onSelect,
//   onGridKeyDown,
//   onPaste,
//   inputRef,
//   usedProductIds,
//   currentRowProductId,

//   // ✅ NEW: Last/near-last row dropdown direction
//   dropUp = false,
// }) {
//   const [term, setTerm] = useState(value || "");
//   const [open, setOpen] = useState(false);
//   const [highlight, setHighlight] = useState(0);
//   const wrapperRef = useRef(null);

//   useEffect(() => {
//     setTerm(value || "");
//     setOpen(false);
//     setHighlight(0);
//   }, [value]);

//   const filtered = useMemo(() => {
//     const search = normalize(term);

//     if (!search) return [];

//     return products
//       .filter((product) => {
//         const id = getProductId(product);

//         if (!id) return false;

//         if (
//           usedProductIds.has(String(id)) &&
//           String(id) !== String(currentRowProductId)
//         ) {
//           return false;
//         }

//         return normalize(product.product_name).includes(search);
//       })
//       .slice(0, 10);
//   }, [
//     products,
//     term,
//     usedProductIds,
//     currentRowProductId,
//   ]);

//   useEffect(() => {
//     setHighlight(0);
//   }, [term]);

//   useEffect(() => {
//     const close = (event) => {
//       if (
//         wrapperRef.current &&
//         !wrapperRef.current.contains(event.target)
//       ) {
//         setOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", close);

//     return () =>
//       document.removeEventListener("mousedown", close);
//   }, []);

//   const selectProduct = (product) => {
//     const id = getProductId(product);

//     if (!id) return;

//     if (
//       usedProductIds.has(String(id)) &&
//       String(id) !== String(currentRowProductId)
//     ) {
//       setOpen(false);
//       return;
//     }

//     onSelect(product);
//     setTerm(product.product_name || "");
//     setOpen(false);
//     setHighlight(0);
//   };

//   const handleChange = (event) => {
//     const value = event.target.value;

//     setTerm(value);
//     setOpen(Boolean(value.trim()));
//   };

//   const handleKeyDown = (event) => {
//     if (open && filtered.length) {
//       if (event.key === "ArrowDown") {
//         event.preventDefault();
//         event.stopPropagation();

//         setHighlight((v) =>
//           Math.min(v + 1, filtered.length - 1)
//         );
//         return;
//       }

//       if (event.key === "ArrowUp") {
//         event.preventDefault();
//         event.stopPropagation();

//         setHighlight((v) => Math.max(v - 1, 0));
//         return;
//       }

//       if (event.key === "Enter") {
//         event.preventDefault();
//         event.stopPropagation();

//         if (filtered[highlight]) {
//           selectProduct(filtered[highlight]);
//         }

//         return;
//       }

//       if (event.key === "Escape") {
//         event.preventDefault();
//         event.stopPropagation();

//         setOpen(false);
//         return;
//       }
//     }

//     onGridKeyDown?.(event);
//   };

//   return (
//     <div
//       ref={wrapperRef}
//       className="relative h-full w-full"
//     >
//       <input
//         ref={inputRef}
//         value={term}
//         onChange={handleChange}
//         onFocus={() => setOpen(false)}
//         onKeyDown={handleKeyDown}
//         onPaste={onPaste}
//         data-sheet-product-cell="true"
//         autoComplete="off"
//         className="
//           h-full
//           min-h-[34px]
//           w-full
//           border-0
//           bg-transparent
//           px-2.5
//           text-left
//           text-xs
//           text-slate-700
//           outline-none
//         "
//       />

//       {/* =====================================================
//           PRODUCT DROPDOWN

//           Normal rows  -> opens DOWN
//           Last rows    -> opens UP

//           This prevents the dropdown from getting clipped
//           inside the table/footer area.
//       ===================================================== */}

//       {open && filtered.length > 0 && (
//         <div
//           className={`
//             absolute
//             left-0
//             z-[200]
//             max-h-64
//             min-w-[280px]
//             overflow-y-auto
//             rounded-md
//             border
//             border-slate-300
//             bg-white
//             shadow-xl

//             ${
//               dropUp
//                 ? "bottom-full mb-1"
//                 : "top-full mt-1"
//             }
//           `}
//         >
//           {filtered.map((product, index) => (
//             <button
//               key={
//                 getProductId(product) ??
//                 `${product.product_name}-${index}`
//               }
//               type="button"
//               onMouseDown={(event) => {
//                 event.preventDefault();
//                 selectProduct(product);
//               }}
//               className={`
//                 flex
//                 w-full
//                 items-center
//                 justify-between
//                 border-b
//                 border-slate-100
//                 px-3
//                 py-2
//                 text-left
//                 text-xs
//                 last:border-0
//                 ${
//                   index === highlight
//                     ? "bg-blue-100 text-blue-800"
//                     : "bg-white text-slate-700 hover:bg-slate-50"
//                 }
//               `}
//             >
//               <span className="truncate">
//                 {product.product_name}
//               </span>

//               {index === highlight && (
//                 <span className="ml-2 text-[9px]">
//                   ✓
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>
//       )}

//       {open &&
//         term.trim() &&
//         filtered.length === 0 && (
//           <div
//             className={`
//               absolute
//               left-0
//               z-[200]
//               min-w-[280px]
//               rounded-md
//               border
//               border-slate-300
//               bg-white
//               px-3
//               py-3
//               text-[10px]
//               text-slate-400
//               shadow-xl

//               ${
//                 dropUp
//                   ? "bottom-full mb-1"
//                   : "top-full mt-1"
//               }
//             `}
//           >
//             No product found
//           </div>
//         )}
//     </div>
//   );
// }

// /* =========================================================
//    MAIN
// ========================================================= */

// export default function OrderGoogleSheet() {
//   const { data: allProducts = [] } =
//     useCachedProducts();

//   const {
//     selectedProducts,
//     setSelectedProducts,
//   } = useSelectedProducts();

//   const [selectedSS, setSelectedSS] =
//     useState("");

//   const [selectedSSName, setSelectedSSName] =
//     useState("");

//   const [rows, setRows] = useState(() =>
//     createRows()
//   );

//   /* =======================================================
//      GRID REFS
//   ======================================================= */

//   const gridRef = useRef(null);
//   const cellRefs = useRef({});
//   const initializedFocus = useRef(false);

//   const setCellRef = (
//     rowIndex,
//     colIndex,
//     element
//   ) => {
//     if (!cellRefs.current[rowIndex]) {
//       cellRefs.current[rowIndex] = {};
//     }

//     cellRefs.current[rowIndex][colIndex] =
//       element;
//   };

//   const focusCell = (
//     rowIndex,
//     colIndex,
//     selectText = true
//   ) => {
//     if (
//       rowIndex < 0 ||
//       rowIndex >= rows.length ||
//       colIndex < 0 ||
//       colIndex > QTY_COL
//     ) {
//       return;
//     }

//     const element =
//       cellRefs.current[rowIndex]?.[colIndex];

//     if (!element) return;

//     element.focus();

//     if (
//       selectText &&
//       typeof element.select === "function"
//     ) {
//       element.select();
//     }
//   };

//   /* =======================================================
//      SELECTION
//   ======================================================= */

//   const [selection, setSelection] = useState({
//     startRow: 0,
//     startCol: PRODUCT_COL,
//     endRow: 0,
//     endCol: PRODUCT_COL,
//   });

//   const [isDragging, setIsDragging] =
//     useState(false);

//   const normalizeSelection = (s) => ({
//     minRow: Math.min(s.startRow, s.endRow),
//     maxRow: Math.max(s.startRow, s.endRow),
//     minCol: Math.min(s.startCol, s.endCol),
//     maxCol: Math.max(s.startCol, s.endCol),
//   });

//   const isCellSelected = (
//     rowIndex,
//     colIndex
//   ) => {
//     const s =
//       normalizeSelection(selection);

//     return (
//       rowIndex >= s.minRow &&
//       rowIndex <= s.maxRow &&
//       colIndex >= s.minCol &&
//       colIndex <= s.maxCol
//     );
//   };

//   const isActiveCell = (
//     rowIndex,
//     colIndex
//   ) =>
//     selection.endRow === rowIndex &&
//     selection.endCol === colIndex;

//   const selectSingleCell = (
//     rowIndex,
//     colIndex
//   ) => {
//     setSelection({
//       startRow: rowIndex,
//       startCol: colIndex,
//       endRow: rowIndex,
//       endCol: colIndex,
//     });
//   };

//   const extendSelection = (
//     rowIndex,
//     colIndex
//   ) => {
//     setSelection((current) => ({
//       ...current,
//       endRow: rowIndex,
//       endCol: colIndex,
//     }));
//   };

//   /* =======================================================
//      MOUSE SELECTION
//   ======================================================= */

//   const handleCellMouseDown = (
//     rowIndex,
//     colIndex,
//     event
//   ) => {
//     if (event.shiftKey) {
//       extendSelection(
//         rowIndex,
//         colIndex
//       );
//     } else {
//       selectSingleCell(
//         rowIndex,
//         colIndex
//       );
//     }

//     setIsDragging(true);
//   };

//   const handleCellMouseEnter = (
//     rowIndex,
//     colIndex
//   ) => {
//     if (!isDragging) return;

//     extendSelection(
//       rowIndex,
//       colIndex
//     );
//   };

//   useEffect(() => {
//     const stop = () =>
//       setIsDragging(false);

//     document.addEventListener(
//       "mouseup",
//       stop
//     );

//     return () =>
//       document.removeEventListener(
//         "mouseup",
//         stop
//       );
//   }, []);

//   /* =======================================================
//      USED PRODUCTS
//   ======================================================= */

//   const usedProductIdsByRow =
//     useMemo(
//       () =>
//         rows.map((_, rowIndex) => {
//           const set = new Set();

//           rows.forEach(
//             (row, index) => {
//               if (
//                 index !== rowIndex &&
//                 row?.id != null
//               ) {
//                 set.add(String(row.id));
//               }
//             }
//           );

//           return set;
//         }),
//       [rows]
//     );

//   /* =======================================================
//      CLEAR
//   ======================================================= */

//   const clearSelectedCells = () => {
//     const s =
//       normalizeSelection(selection);

//     setRows((current) =>
//       current.map((row, rowIndex) => {
//         if (
//           rowIndex < s.minRow ||
//           rowIndex > s.maxRow
//         ) {
//           return row;
//         }

//         let updated = {
//           ...row,
//         };

//         for (
//           let col = s.minCol;
//           col <= s.maxCol;
//           col++
//         ) {
//           if (col === PRODUCT_COL) {
//             updated = {
//               ...emptyProductData(),
//               quantity: "",
//             };
//           }

//           if (col === QTY_COL) {
//             updated.quantity = "";
//           }
//         }

//         return updated;
//       })
//     );
//   };

//   /* =======================================================
//      BOUNDARY
//   ======================================================= */

//   const getBoundaryRow = (
//     rowIndex,
//     direction
//   ) => {
//     let target = rowIndex;

//     if (direction === "up") {
//       while (
//         target > 0 &&
//         isFilledRow(rows[target - 1])
//       ) {
//         target--;
//       }
//     }

//     if (direction === "down") {
//       while (
//         target < rows.length - 1 &&
//         isFilledRow(rows[target + 1])
//       ) {
//         target++;
//       }
//     }

//     return target;
//   };

//   /* =======================================================
//      KEYBOARD
//   ======================================================= */

//   const handleGridKeyDown = (
//     rowIndex,
//     colIndex,
//     event
//   ) => {
//     const key = event.key;
//     const ctrl =
//       event.ctrlKey || event.metaKey;

//     /* Ctrl+C / Ctrl+V are handled by grid */
//     if (
//       ctrl &&
//       ["c", "C", "v", "V"].includes(key)
//     ) {
//       return;
//     }

//     /* Ctrl+A */
//     if (ctrl && ["a", "A"].includes(key)) {
//       event.preventDefault();

//       setSelection({
//         startRow: 0,
//         startCol: PRODUCT_COL,
//         endRow: Math.max(
//           rows.length - 1,
//           0
//         ),
//         endCol: QTY_COL,
//       });

//       return;
//     }

//     /* Delete */
//     if (
//       key === "Delete" ||
//       key === "Backspace"
//     ) {
//       const active =
//         document.activeElement;

//       const isProduct =
//         active?.dataset
//           ?.sheetProductCell === "true";

//       const s =
//         normalizeSelection(selection);

//       const range =
//         s.minRow !== s.maxRow ||
//         s.minCol !== s.maxCol;

//       if (
//         key === "Backspace" &&
//         isProduct &&
//         !range
//       ) {
//         return;
//       }

//       event.preventDefault();
//       clearSelectedCells();
//       return;
//     }

//     /* Ctrl + Shift + Arrow */
//     if (ctrl && event.shiftKey) {
//       if (
//         key === "ArrowUp" ||
//         key === "ArrowDown" ||
//         key === "ArrowLeft" ||
//         key === "ArrowRight"
//       ) {
//         event.preventDefault();

//         let nextRow =
//           selection.endRow;

//         let nextCol =
//           selection.endCol;

//         if (key === "ArrowUp") {
//           nextRow = getBoundaryRow(
//             selection.endRow,
//             "up"
//           );
//         }

//         if (key === "ArrowDown") {
//           nextRow = getBoundaryRow(
//             selection.endRow,
//             "down"
//           );
//         }

//         if (key === "ArrowLeft") {
//           nextCol = PRODUCT_COL;
//         }

//         if (key === "ArrowRight") {
//           nextCol = QTY_COL;
//         }

//         extendSelection(
//           nextRow,
//           nextCol
//         );

//         focusCell(
//           nextRow,
//           nextCol,
//           false
//         );

//         return;
//       }
//     }

//     /* Shift + Arrow */
//     if (
//       event.shiftKey &&
//       !ctrl
//     ) {
//       if (
//         key === "ArrowUp" ||
//         key === "ArrowDown" ||
//         key === "ArrowLeft" ||
//         key === "ArrowRight"
//       ) {
//         event.preventDefault();

//         let nextRow =
//           selection.endRow;

//         let nextCol =
//           selection.endCol;

//         if (key === "ArrowUp") {
//           nextRow = Math.max(
//             0,
//             nextRow - 1
//           );
//         }

//         if (key === "ArrowDown") {
//           nextRow = Math.min(
//             rows.length - 1,
//             nextRow + 1
//           );
//         }

//         if (key === "ArrowLeft") {
//           nextCol = Math.max(
//             PRODUCT_COL,
//             nextCol - 1
//           );
//         }

//         if (key === "ArrowRight") {
//           nextCol = Math.min(
//             QTY_COL,
//             nextCol + 1
//           );
//         }

//         extendSelection(
//           nextRow,
//           nextCol
//         );

//         focusCell(
//           nextRow,
//           nextCol,
//           false
//         );

//         return;
//       }
//     }

//     /* Normal arrows */
//     if (
//       key === "ArrowUp" ||
//       key === "ArrowDown" ||
//       key === "ArrowLeft" ||
//       key === "ArrowRight"
//     ) {
//       event.preventDefault();

//       let nextRow = rowIndex;
//       let nextCol = colIndex;

//       if (key === "ArrowUp") {
//         nextRow = Math.max(
//           0,
//           rowIndex - 1
//         );
//       }

//       if (key === "ArrowDown") {
//         nextRow = Math.min(
//           rows.length - 1,
//           rowIndex + 1
//         );
//       }

//       if (key === "ArrowLeft") {
//         nextCol = Math.max(
//           PRODUCT_COL,
//           colIndex - 1
//         );
//       }

//       if (key === "ArrowRight") {
//         nextCol = Math.min(
//           QTY_COL,
//           colIndex + 1
//         );
//       }

//       selectSingleCell(
//         nextRow,
//         nextCol
//       );

//       focusCell(
//         nextRow,
//         nextCol
//       );

//       return;
//     }

//     /* Tab / Enter */
//     if (
//       key === "Tab" ||
//       key === "Enter"
//     ) {
//       event.preventDefault();

//       let nextRow = rowIndex;
//       let nextCol = colIndex + 1;

//       if (nextCol > QTY_COL) {
//         nextCol = PRODUCT_COL;
//         nextRow++;
//       }

//       if (nextRow >= rows.length) {
//         setRows((current) => [
//           ...current,
//           createEmptyRow(),
//         ]);
//       }

//       selectSingleCell(
//         nextRow,
//         nextCol
//       );

//       requestAnimationFrame(() =>
//         focusCell(
//           nextRow,
//           nextCol
//         )
//       );
//     }
//   };

//   /* =======================================================
//      PRODUCT SELECT
//   ======================================================= */

//   const handleRowProductSelect = (
//     index,
//     product
//   ) => {
//     const productId =
//       getProductId(product);

//     if (!productId) return;

//     const duplicate = rows.some(
//       (row, rowIndex) =>
//         rowIndex !== index &&
//         String(row?.id) ===
//           String(productId)
//     );

//     if (duplicate) return;

//     setRows((current) => {
//       const updated = current.map(
//         (row) => ({ ...row })
//       );

//       updated[index] = {
//         id: productId,
//         product_name:
//           product.product_name || "",
//         cartoon_size:
//           product.cartoon_size || "",
//         quantity: "",
//         price: product.price || 0,
//         virtual_stock:
//           product.virtual_stock || 0,
//       };

//       /* One blank row after last row */
//       if (
//         index ===
//         current.length - 1
//       ) {
//         updated.push(
//           createEmptyRow()
//         );
//       }

//       return updated;
//     });

//     /*
//       Product select -> Qty cell.
//     */
//     requestAnimationFrame(() => {
//       selectSingleCell(
//         index,
//         QTY_COL
//       );

//       focusCell(
//         index,
//         QTY_COL
//       );
//     });
//   };

//   /* =======================================================
//      QUANTITY
//   ======================================================= */

//   const handleQtyChange = (
//     index,
//     value
//   ) => {
//     const quantity =
//       sanitizeQuantity(value);

//     setRows((current) => {
//       const updated = current.map(
//         (row) => ({ ...row })
//       );

//       updated[index] = {
//         ...updated[index],
//         quantity,
//       };

//       return updated;
//     });
//   };

//   /* =======================================================
//      CLIPBOARD
//   ======================================================= */

//   const buildSelectedTSV = () => {
//     const s =
//       normalizeSelection(selection);

//     const result = [];

//     for (
//       let row = s.minRow;
//       row <= s.maxRow;
//       row++
//     ) {
//       const values = [];

//       for (
//         let col = s.minCol;
//         col <= s.maxCol;
//         col++
//       ) {
//         values.push(
//           col === PRODUCT_COL
//             ? rows[row]?.product_name || ""
//             : rows[row]?.quantity || ""
//         );
//       }

//       result.push(values.join("\t"));
//     }

//     return result.join("\n");
//   };

//   const handleClipboardPaste = (
//     startRow,
//     startCol,
//     text
//   ) => {
//     if (!text) return;

//     const lines = String(text)
//       .replace(/\r/g, "")
//       .split("\n")
//       .filter(
//         (_, index, arr) =>
//           index !== arr.length - 1 ||
//           _.trim() !== ""
//       );

//     if (!lines.length) return;

//     setRows((current) => {
//       const updated = current.map(
//         (row) => ({ ...row })
//       );

//       const needed =
//         startRow + lines.length;

//       while (
//         updated.length < needed
//       ) {
//         updated.push(
//           createEmptyRow()
//         );
//       }

//       const usedIds = new Set();

//       updated.forEach((row) => {
//         if (row?.id) {
//           usedIds.add(String(row.id));
//         }
//       });

//       const pastedIds = new Set();

//       lines.forEach(
//         (line, rowOffset) => {
//           const rowIndex =
//             startRow + rowOffset;

//           const columns =
//             line.split("\t");

//           columns.forEach(
//             (raw, colOffset) => {
//               const col =
//                 startCol + colOffset;

//               if (col > QTY_COL)
//                 return;

//               const value =
//                 raw.trim();

//               /* Product */
//               if (
//                 col === PRODUCT_COL
//               ) {
//                 if (!value) {
//                   updated[rowIndex] = {
//                     ...emptyProductData(),
//                     quantity:
//                       updated[rowIndex]
//                         ?.quantity || "",
//                   };

//                   return;
//                 }

//                 const product =
//                   allProducts.find(
//                     (p) =>
//                       normalize(
//                         p.product_name
//                       ) ===
//                       normalize(value)
//                   );

//                 if (!product) {
//                   updated[rowIndex] = {
//                     ...updated[rowIndex],
//                     product_name:
//                       value,
//                     id:
//                       updated[rowIndex]
//                         ?.id || null,
//                   };

//                   return;
//                 }

//                 const id =
//                   getProductId(
//                     product
//                   );

//                 if (!id) return;

//                 const idKey =
//                   String(id);

//                 const duplicate =
//                   updated.some(
//                     (
//                       row,
//                       index
//                     ) =>
//                       index !==
//                         rowIndex &&
//                       String(
//                         row?.id
//                       ) === idKey
//                   );

//                 if (
//                   duplicate ||
//                   pastedIds.has(idKey)
//                 ) {
//                   return;
//                 }

//                 updated[rowIndex] = {
//                   id,
//                   product_name:
//                     product.product_name ||
//                     "",
//                   cartoon_size:
//                     product.cartoon_size ||
//                     "",
//                   quantity: "",
//                   price:
//                     product.price || 0,
//                   virtual_stock:
//                     product.virtual_stock ||
//                     0,
//                 };

//                 pastedIds.add(idKey);
//               }

//               /* Quantity */
//               if (
//                 col === QTY_COL
//               ) {
//                 updated[rowIndex] = {
//                   ...updated[rowIndex],
//                   quantity:
//                     sanitizeQuantity(
//                       value
//                     ),
//                 };
//               }
//             }
//           );
//         }
//       );

//       /* Always keep one empty row */
//       let lastFilled = -1;

//       updated.forEach(
//         (row, index) => {
//           if (isFilledRow(row)) {
//             lastFilled = index;
//           }
//         }
//       );

//       if (
//         lastFilled ===
//         updated.length - 1
//       ) {
//         updated.push(
//           createEmptyRow()
//         );
//       }

//       return updated;
//     });

//     const maxColumns = Math.max(
//       ...lines.map(
//         (line) =>
//           line.split("\t").length
//       )
//     );

//     setSelection({
//       startRow,
//       startCol,
//       endRow:
//         startRow +
//         lines.length -
//         1,
//       endCol: Math.min(
//         QTY_COL,
//         startCol +
//           maxColumns -
//           1
//       ),
//     });

//     requestAnimationFrame(() =>
//       focusCell(
//         startRow,
//         startCol
//       )
//     );
//   };

//   const handleProductPaste = (
//     rowIndex,
//     event
//   ) => {
//     event.preventDefault();

//     handleClipboardPaste(
//       rowIndex,
//       PRODUCT_COL,
//       event.clipboardData.getData(
//         "text/plain"
//       )
//     );
//   };

//   /* =======================================================
//      GRID CLIPBOARD
//   ======================================================= */

//   const handleGridCopy = (event) => {
//     const active =
//       document.activeElement;

//     if (
//       !gridRef.current?.contains(
//         active
//       )
//     ) {
//       return;
//     }

//     const text =
//       buildSelectedTSV();

//     if (!text) return;

//     event.preventDefault();

//     event.clipboardData.setData(
//       "text/plain",
//       text
//     );
//   };

//   const handleGridPaste = (event) => {
//     const active =
//       document.activeElement;

//     if (
//       !gridRef.current?.contains(
//         active
//       )
//     ) {
//       return;
//     }

//     if (
//       active?.dataset
//         ?.sheetProductCell === "true"
//     ) {
//       return;
//     }

//     event.preventDefault();

//     handleClipboardPaste(
//       selection.startRow,
//       selection.startCol,
//       event.clipboardData.getData(
//         "text/plain"
//       )
//     );
//   };

//   /* =======================================================
//      LOCAL STORAGE LOAD
//   ======================================================= */

//   useEffect(() => {
//     const savedSS =
//       localStorage.getItem(
//         "crm_selected_ss"
//       );

//     const savedSSName =
//       localStorage.getItem(
//         "crm_selected_ss_name"
//       );

//     const savedProducts =
//       localStorage.getItem(
//         "crm_selected_products"
//       );

//     if (savedSS) {
//       setSelectedSS(savedSS);
//     }

//     if (savedSSName) {
//       setSelectedSSName(
//         savedSSName
//       );
//     }

//     if (!savedProducts) {
//       return;
//     }

//     try {
//       const parsed =
//         JSON.parse(savedProducts);

//       setSelectedProducts(parsed);

//       const unique = [];
//       const ids = new Set();

//       parsed.forEach((product) => {
//         const id =
//           product?.id ??
//           product?.product_id;

//         if (!id) return;

//         const key = String(id);

//         if (ids.has(key)) return;

//         ids.add(key);

//         unique.push({
//           id,
//           product_name:
//             product.product_name || "",
//           cartoon_size:
//             product.cartoon_size || "",
//           quantity:
//             product.quantity == null
//               ? ""
//               : String(
//                   product.quantity
//                 ),
//           price:
//             product.price || 0,
//           virtual_stock:
//             product.virtual_stock ||
//             0,
//         });
//       });

//       const loaded =
//         createRows(
//           Math.max(
//             INITIAL_ROWS,
//             unique.length + 1
//           )
//         );

//       unique.forEach(
//         (product, index) => {
//           loaded[index] =
//             product;
//         }
//       );

//       setRows(loaded);
//     } catch {
//       localStorage.removeItem(
//         "crm_selected_products"
//       );
//     }
//   }, [setSelectedProducts]);

//   /* =======================================================
//      IMPORTANT:
//      INITIAL FOCUS
     
//      Refresh ke baad last cell par focus nahi.
//      Data ke baad first empty Product cell.
//   ======================================================= */

//   useEffect(() => {
//     if (initializedFocus.current)
//       return;

//     if (!rows.length) return;

//     /*
//       Last filled row find karo.
//     */
//     let lastFilled = -1;

//     rows.forEach(
//       (row, index) => {
//         if (isFilledRow(row)) {
//           lastFilled = index;
//         }
//       }
//     );

//     /*
//       Next available row.
//       Agar koi data nahi -> row 0.
//     */
//     const targetRow =
//       lastFilled + 1;

//     /*
//       Safety:
//       Always first available empty Product cell.
//     */
//     const rowIndex =
//       targetRow < rows.length
//         ? targetRow
//         : rows.length - 1;

//     initializedFocus.current = true;

//     setSelection({
//       startRow: rowIndex,
//       startCol: PRODUCT_COL,
//       endRow: rowIndex,
//       endCol: PRODUCT_COL,
//     });

//     /*
//       Wait until DOM is ready.
//     */
//     requestAnimationFrame(() => {
//       requestAnimationFrame(() => {
//         focusCell(
//           rowIndex,
//           PRODUCT_COL,
//           false
//         );
//       });
//     });
//   }, [rows]);

//   /* =======================================================
//      LOCAL STORAGE SYNC
//   ======================================================= */

//   useEffect(() => {
//     localStorage.setItem(
//       "crm_selected_ss",
//       selectedSS || ""
//     );

//     localStorage.setItem(
//       "crm_selected_ss_name",
//       selectedSSName || ""
//     );

//     localStorage.setItem(
//       "crm_selected_products",
//       JSON.stringify(
//         selectedProducts || []
//       )
//     );
//   }, [
//     selectedSS,
//     selectedSSName,
//     selectedProducts,
//   ]);

//   /* =======================================================
//      ROWS -> SELECTED PRODUCTS
//   ======================================================= */

//   useEffect(() => {
//     const validProducts = rows
//       .filter(
//         (row) =>
//           row.id &&
//           Number(row.quantity) > 0
//       )
//       .map((row) => ({
//         id: row.id,
//         product_name:
//           row.product_name,
//         cartoon_size:
//           row.cartoon_size,
//         quantity:
//           Number(row.quantity),
//         price:
//           row.price || 0,
//         virtual_stock:
//           row.virtual_stock || 0,
//       }));

//     setSelectedProducts(
//       validProducts
//     );
//   }, [
//     rows,
//     setSelectedProducts,
//   ]);

//   /* =======================================================
//      TOTALS
//   ======================================================= */

//   const totalQty = useMemo(
//     () =>
//       rows.reduce(
//         (sum, row) =>
//           sum +
//           (Number(row.quantity) ||
//             0),
//         0
//       ),
//     [rows]
//   );

//   const totalAmount = useMemo(
//     () =>
//       rows.reduce(
//         (sum, row) =>
//           sum +
//           (Number(row.quantity) || 0) *
//             (Number(row.price) || 0),
//         0
//       ),
//     [rows]
//   );

//   const selectedCellCount =
//     useMemo(() => {
//       const s =
//         normalizeSelection(
//           selection
//         );

//       return (
//         (s.maxRow - s.minRow + 1) *
//         (s.maxCol - s.minCol + 1)
//       );
//     }, [selection]);

//   const formatCurrency = (value) => {
//     if (
//       value == null ||
//       value === "" ||
//       Number.isNaN(Number(value))
//     ) {
//       return "--";
//     }

//     return Number(value).toFixed(1);
//   };

//   /* =======================================================
//      ADD ROW
//   ======================================================= */

//   const addRow = () => {
//     setRows((current) => [
//       ...current,
//       createEmptyRow(),
//     ]);
//   };

//   /* =======================================================
//      RENDER
//   ======================================================= */

//   return (
//     <div
//       className="
//         min-h-screen
//         bg-slate-50
//         px-2
//         sm:px-3
//         pb-24
//       "
//     >
//       <div
//         ref={gridRef}
//         tabIndex={-1}
//         onCopy={handleGridCopy}
//         onPaste={handleGridPaste}
//         className="
//           w-full
//           overflow-x-auto
//           rounded-lg
//           border
//           border-slate-300
//           bg-white
//           shadow-sm
//           select-none
//         "
//       >
//         <table
//           className="
//             w-full
//             min-w-[850px]
//             border-collapse
//             text-xs
//           "
//         >
//           <thead>
//             <tr>
//               <th
//                 className="
//                   sticky
//                   left-0
//                   z-20
//                   w-10
//                   border
//                   border-slate-300
//                   bg-[#eef2f6]
//                   px-2
//                   py-2
//                   text-center
//                   text-[10px]
//                   font-semibold
//                   text-slate-500
//                 "
//               >
//                 #
//               </th>

//               <th
//                 className="
//                   w-[360px]
//                   border
//                   border-slate-300
//                   bg-[#f7f2e9]
//                   px-2.5
//                   py-2
//                   text-left
//                   text-[10px]
//                   font-semibold
//                   text-slate-700
//                 "
//               >
//                 Product
//               </th>

//               <th
//                 className="
//                   w-24
//                   border
//                   border-slate-300
//                   bg-[#f7f2e9]
//                   px-2
//                   py-2
//                   text-center
//                   text-[10px]
//                   font-semibold
//                   text-slate-700
//                 "
//               >
//                 Qty
//               </th>

//               <th
//                 className="
//                   w-24
//                   border
//                   border-slate-300
//                   bg-[#eef2f6]
//                   px-2
//                   py-2
//                   text-center
//                   text-[10px]
//                   font-semibold
//                   text-slate-600
//                 "
//               >
//                 Carton
//               </th>

//               <th
//                 className="
//                   w-24
//                   border
//                   border-slate-300
//                   bg-[#eef2f6]
//                   px-2
//                   py-2
//                   text-center
//                   text-[10px]
//                   font-semibold
//                   text-slate-600
//                 "
//               >
//                 Stock
//               </th>

//               <th
//                 className="
//                   w-24
//                   border
//                   border-slate-300
//                   bg-[#eef2f6]
//                   px-2
//                   py-2
//                   text-center
//                   text-[10px]
//                   font-semibold
//                   text-slate-600
//                 "
//               >
//                 Price
//               </th>

//               <th
//                 className="
//                   w-28
//                   border
//                   border-slate-300
//                   bg-[#eef2f6]
//                   px-2
//                   py-2
//                   text-center
//                   text-[10px]
//                   font-semibold
//                   text-slate-600
//                 "
//               >
//                 Total
//               </th>
//             </tr>
//           </thead>

//           <tbody>
//             {rows.map(
//               (row, rowIndex) => {
//                 const productSelected =
//                   isCellSelected(
//                     rowIndex,
//                     PRODUCT_COL
//                   );

//                 const qtySelected =
//                   isCellSelected(
//                     rowIndex,
//                     QTY_COL
//                   );

//                 const productActive =
//                   isActiveCell(
//                     rowIndex,
//                     PRODUCT_COL
//                   );

//                 const qtyActive =
//                   isActiveCell(
//                     rowIndex,
//                     QTY_COL
//                   );

//                 return (
//                   <tr
//                     key={rowIndex}
//                     className="
//                       h-[35px]
//                       hover:bg-slate-50
//                     "
//                   >
//                     {/* ROW NUMBER */}

//                     <td
//                       className="
//                         sticky
//                         left-0
//                         z-10
//                         border
//                         border-slate-300
//                         bg-slate-50
//                         text-center
//                         text-[10px]
//                         font-medium
//                         text-slate-400
//                       "
//                     >
//                       {rowIndex + 1}
//                     </td>

//                     {/* PRODUCT */}

//                     <td
//                       className={`
//                         relative
//                         border
//                         border-slate-300
//                         p-0
//                         ${
//                           productSelected
//                             ? "bg-blue-50"
//                             : "bg-white"
//                         }
//                         ${
//                           productActive
//                             ? "ring-2 ring-inset ring-blue-600"
//                             : ""
//                         }
//                       `}
//                       onMouseDown={(event) =>
//                         handleCellMouseDown(
//                           rowIndex,
//                           PRODUCT_COL,
//                           event
//                         )
//                       }
//                       onMouseEnter={() =>
//                         handleCellMouseEnter(
//                           rowIndex,
//                           PRODUCT_COL
//                         )
//                       }
//                     >
//                       <SheetProductCell
//                         products={
//                           allProducts
//                         }
//                         value={
//                           row.product_name
//                         }
//                         currentRowProductId={
//                           row.id
//                         }
//                         usedProductIds={
//                           usedProductIdsByRow[
//                             rowIndex
//                           ] ||
//                           new Set()
//                         }

//                         /*
//                           =================================================
//                           DROPDOWN FIX

//                           Last 2 rows -> dropdown UP
//                           Other rows  -> dropdown DOWN

//                           This prevents clipping by the table/footer.
//                           =================================================
//                         */
//                         dropUp={
//                           rowIndex >=
//                           rows.length - 2
//                         }

//                         onSelect={(product) =>
//                           handleRowProductSelect(
//                             rowIndex,
//                             product
//                           )
//                         }
//                         onGridKeyDown={(
//                           event
//                         ) =>
//                           handleGridKeyDown(
//                             rowIndex,
//                             PRODUCT_COL,
//                             event
//                           )
//                         }
//                         onPaste={(event) =>
//                           handleProductPaste(
//                             rowIndex,
//                             event
//                           )
//                         }
//                         inputRef={(element) =>
//                           setCellRef(
//                             rowIndex,
//                             PRODUCT_COL,
//                             element
//                           )
//                         }
//                       />
//                     </td>

//                     {/* QTY */}

//                     <td
//                       className={`
//                         border
//                         border-slate-300
//                         p-0
//                         ${
//                           qtySelected
//                             ? "bg-blue-50"
//                             : "bg-white"
//                         }
//                         ${
//                           qtyActive
//                             ? "ring-2 ring-inset ring-blue-600"
//                             : ""
//                         }
//                       `}
//                       onMouseDown={(event) =>
//                         handleCellMouseDown(
//                           rowIndex,
//                           QTY_COL,
//                           event
//                         )
//                       }
//                       onMouseEnter={() =>
//                         handleCellMouseEnter(
//                           rowIndex,
//                           QTY_COL
//                         )
//                       }
//                     >
//                       <input
//                         ref={(element) =>
//                           setCellRef(
//                             rowIndex,
//                             QTY_COL,
//                             element
//                           )
//                         }
//                         type="text"
//                         inputMode="numeric"
//                         value={
//                           row.quantity
//                         }
//                         onChange={(event) =>
//                           handleQtyChange(
//                             rowIndex,
//                             event.target.value
//                           )
//                         }
//                         onKeyDown={(event) =>
//                           handleGridKeyDown(
//                             rowIndex,
//                             QTY_COL,
//                             event
//                           )
//                         }
//                         autoComplete="off"
//                         className="
//                           h-full
//                           min-h-[34px]
//                           w-full
//                           border-0
//                           bg-transparent
//                           px-2
//                           text-center
//                           text-xs
//                           text-slate-700
//                           outline-none
//                         "
//                       />
//                     </td>

//                     {/* CARTON */}

//                     <td
//                       className="
//                         border
//                         border-slate-300
//                         px-2
//                         text-center
//                         text-[10px]
//                         text-slate-500
//                       "
//                     >
//                       {row.cartoon_size ||
//                         "--"}
//                     </td>

//                     {/* STOCK */}

//                     <td
//                       className="
//                         border
//                         border-slate-300
//                         px-2
//                         text-center
//                         text-[10px]
//                         text-slate-500
//                       "
//                     >
//                       {row.virtual_stock ||
//                         "--"}
//                     </td>

//                     {/* PRICE */}

//                     <td
//                       className="
//                         border
//                         border-slate-300
//                         px-2
//                         text-center
//                         text-[10px]
//                         text-slate-500
//                       "
//                     >
//                       {formatCurrency(
//                         row.price
//                       )}
//                     </td>

//                     {/* TOTAL */}

//                     <td
//                       className="
//                         border
//                         border-slate-300
//                         px-2
//                         text-center
//                         text-[10px]
//                         font-medium
//                         text-slate-700
//                       "
//                     >
//                       {formatCurrency(
//                         (Number(
//                           row.price
//                         ) || 0) *
//                           (Number(
//                             row.quantity
//                           ) || 0)
//                       )}
//                     </td>
//                   </tr>
//                 );
//               }
//             )}
//           </tbody>

//           {/* FOOTER */}

//           <tfoot>
//             <tr>
//               <td
//                 colSpan={2}
//                 className="
//                   border
//                   border-slate-300
//                   bg-slate-50
//                   px-3
//                   py-2
//                   text-right
//                   text-[10px]
//                   font-semibold
//                   text-slate-600
//                 "
//               >
//                 Total
//               </td>

//               <td
//                 className="
//                   border
//                   border-slate-300
//                   bg-slate-50
//                   px-2
//                   py-2
//                   text-center
//                   text-[10px]
//                   font-bold
//                   text-slate-800
//                 "
//               >
//                 {totalQty}
//               </td>

//               <td
//                 colSpan={3}
//                 className="
//                   border
//                   border-slate-300
//                   bg-slate-50
//                   px-2
//                   py-2
//                   text-right
//                   text-[10px]
//                   font-semibold
//                   text-slate-500
//                 "
//               >
//                 Total Amount
//               </td>

//               <td
//                 className="
//                   border
//                   border-slate-300
//                   bg-slate-50
//                   px-2
//                   py-2
//                   text-center
//                   text-[10px]
//                   font-bold
//                   text-slate-800
//                 "
//               >
//                 ₹{" "}
//                 {formatCurrency(
//                   totalAmount
//                 )}
//               </td>
//             </tr>

//             <tr>
//               <td
//                 colSpan={7}
//                 className="
//                   border
//                   border-slate-300
//                   bg-white
//                   px-3
//                   py-1.5
//                   text-[9px]
//                   text-slate-400
//                 "
//               >
//                 {rows.length} rows ·{" "}
//                 {selectedCellCount} selected
//                 {" · "}
//                 ↑↓←→ Navigate · Tab / Enter
//                 Next · Shift + Arrow Select ·
//                 Ctrl+C / Ctrl+V
//               </td>
//             </tr>
//           </tfoot>
//         </table>
//       </div>

    
//     </div>
//   );
// }




import {
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";

import { useCachedProducts } from "../../hooks/useCachedProducts";
import { useSelectedProducts } from "../../hooks/useSelectedProducts";

import {
  FaSearch,
  FaTimes,
  FaCopy,
  FaPaste,
  FaPlus,
  FaKeyboard,
  FaCheck,
} from "react-icons/fa";

/* =========================================================
   CONSTANTS
========================================================= */

const INITIAL_ROWS = 10;

/*
  Only these two columns are editable/selectable.
*/
const PRODUCT_COL = 0;
const QTY_COL = 1;

const createEmptyRow = () => ({
  id: null,
  product_name: "",
  cartoon_size: "",
  quantity: "",
  price: 0,
  virtual_stock: 0,
});

const createRows = (count = INITIAL_ROWS) =>
  Array.from({ length: count }, () =>
    createEmptyRow()
  );

/* =========================================================
   HELPERS
========================================================= */

const getProductId = (product) =>
  product?.id ??
  product?.product_id ??
  null;

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const normalizeProductName = (value) =>
  normalizeText(value);

const sanitizeQuantity = (value) =>
  String(value ?? "").replace(/\D/g, "");

const isFilledRow = (row) =>
  Boolean(
    row?.id ||
      String(row?.product_name || "").trim()
  );

/* =========================================================
   PRODUCT CELL
========================================================= */

function SheetProductCell({
  products,
  value,
  onSelect,
  onGridKeyDown,
  onPaste,
  inputRef,
  usedProductIds,
  currentRowProductId,
}) {
  const [term, setTerm] = useState(
    value || ""
  );

  const [open, setOpen] =
    useState(false);

  const [highlight, setHighlight] =
    useState(0);

  const [hasTyped, setHasTyped] =
    useState(false);

  const wrapperRef = useRef(null);

  /* -------------------------------------------------------
     Sync parent value
  ------------------------------------------------------- */

  useEffect(() => {
    setTerm(value || "");
    setOpen(false);
    setHasTyped(false);
    setHighlight(0);
  }, [value]);

  /* -------------------------------------------------------
     FAST PRODUCT FILTER

     IMPORTANT:
     - Blank = no dropdown
     - Minimum 1 character
     - Already selected products excluded
     - Current row's existing product remains allowed
  ------------------------------------------------------- */

  const filtered = useMemo(() => {
    const search =
      normalizeText(term);

    if (!search) {
      return [];
    }

    return products
      .filter((product) => {
        const productId =
          getProductId(product);

        if (!productId) {
          return false;
        }

        /*
          Duplicate protection.

          Current row's own product is allowed,
          because user may edit/search the same row.
        */
        if (
          usedProductIds.has(
            String(productId)
          ) &&
          String(productId) !==
            String(currentRowProductId)
        ) {
          return false;
        }

        return normalizeProductName(
          product.product_name
        ).includes(search);
      })
      .slice(0, 10);
  }, [
    products,
    term,
    usedProductIds,
    currentRowProductId,
  ]);

  /* -------------------------------------------------------
     Highlight reset
  ------------------------------------------------------- */

  useEffect(() => {
    setHighlight(0);
  }, [term]);

  /* -------------------------------------------------------
     Outside click
  ------------------------------------------------------- */

  useEffect(() => {
    const closeDropdown = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      closeDropdown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        closeDropdown
      );
    };
  }, []);

  /* -------------------------------------------------------
     SELECT PRODUCT
  ------------------------------------------------------- */

  const selectProduct = (product) => {
    const productId =
      getProductId(product);

    if (!productId) return;

    /*
      Final duplicate safety check.
    */
    if (
      usedProductIds.has(
        String(productId)
      ) &&
      String(productId) !==
        String(currentRowProductId)
    ) {
      setOpen(false);
      setHasTyped(false);
      return;
    }

    onSelect(product);

    setTerm(
      product.product_name || ""
    );

    setOpen(false);
    setHasTyped(false);
    setHighlight(0);
  };

  /* -------------------------------------------------------
     INPUT CHANGE
  ------------------------------------------------------- */

  const handleChange = (event) => {
    const nextValue =
      event.target.value;

    setTerm(nextValue);

    /*
      Dropdown ONLY after typing.
    */
    if (
      nextValue.trim().length >= 1
    ) {
      setHasTyped(true);
      setOpen(true);
    } else {
      setHasTyped(false);
      setOpen(false);
    }
  };

  /* -------------------------------------------------------
     KEYBOARD
  ------------------------------------------------------- */

  const handleKeyDown = (event) => {
    /*
      Product dropdown keyboard navigation
      works ONLY while dropdown is open.
    */

    if (
      open &&
      hasTyped &&
      filtered.length > 0
    ) {
      if (
        event.key === "ArrowDown"
      ) {
        event.preventDefault();
        event.stopPropagation();

        setHighlight((current) =>
          Math.min(
            current + 1,
            filtered.length - 1
          )
        );

        return;
      }

      if (
        event.key === "ArrowUp"
      ) {
        event.preventDefault();
        event.stopPropagation();

        setHighlight((current) =>
          Math.max(
            current - 1,
            0
          )
        );

        return;
      }

      if (
        event.key === "Enter"
      ) {
        event.preventDefault();
        event.stopPropagation();

        const product =
          filtered[highlight];

        if (product) {
          selectProduct(product);
        }

        return;
      }

      if (
        event.key === "Escape"
      ) {
        event.preventDefault();
        event.stopPropagation();

        setOpen(false);
        setHasTyped(false);

        return;
      }
    }

    /*
      Dropdown closed =
      spreadsheet navigation.
    */
    onGridKeyDown?.(event);
  };

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-full"
    >
      <input
        ref={inputRef}
        value={term}
        onChange={handleChange}
        onFocus={() => {
          /*
            Never open dropdown just on focus.
          */
          setOpen(false);
        }}
        onKeyDown={handleKeyDown}
        onPaste={onPaste}
        data-sheet-product-cell="true"
        className="
          w-full
          h-full
          min-h-[34px]
          px-2.5
          text-xs
          text-left
          text-slate-700
          bg-transparent
          border
          border-transparent
          outline-none
          focus:border-blue-500
          focus:ring-1
          focus:ring-blue-300
          rounded-none
        "
      
      />

      {/* =================================================
          OPAQUE PRODUCT DROPDOWN
      ================================================= */}

      {open &&
        hasTyped &&
        term.trim().length >= 1 &&
        filtered.length > 0 && (
          <div
            className="
              absolute
              left-0
              top-full
              z-[100]
              w-full
              min-w-[280px]
              max-h-64
              overflow-y-auto
              bg-white
              border
              border-slate-400
              rounded-md
              shadow-xl
            "
          >
            {filtered.map(
              (product, index) => (
                <button
                  key={
                    getProductId(
                      product
                    ) ??
                    `${product.product_name}-${index}`
                  }
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectProduct(
                      product
                    );
                  }}
                  className={`
                    flex
                    items-center
                    justify-between
                    gap-2
                    w-full
                    px-3
                    py-2
                    text-left
                    text-xs
                    border-b
                    border-slate-100
                    last:border-b-0
                    transition-colors
                    ${
                      index ===
                      highlight
                        ? "bg-orange-100 text-black"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }
                  `}
                >
                  <span className="truncate">
                    {product.product_name}
                  </span>

                  {index ===
                    highlight && (
                    <FaCheck className="text-[9px] flex-shrink-0" />
                  )}
                </button>
              )
            )}
          </div>
        )}

      {/* No result */}

      {open &&
        hasTyped &&
        term.trim().length >= 1 &&
        filtered.length === 0 && (
          <div
            className="
              absolute
              left-0
              top-full
              z-[100]
              w-full
              min-w-[280px]
              bg-white
              border
              border-slate-400
              rounded-md
              shadow-xl
              px-3
              py-3
              text-[10px]
              text-slate-400
            "
          >
            No product found
          </div>
        )}
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function OrderGoogleSheet({ orderId }) {
  const {
    data: allProducts = [],
  } = useCachedProducts();

  const {
    selectedProducts,
    setSelectedProducts,
  } = useSelectedProducts();

  /* =======================================================
     CRM PARTY
  ======================================================= */

  const [selectedSS, setSelectedSS] =
    useState("");

  const [
    selectedSSName,
    setSelectedSSName,
  ] = useState("");

  /* =======================================================
     ROWS
     ALWAYS AT LEAST 25
  ======================================================= */

  const [rows, setRows] = useState(() =>
    createRows(INITIAL_ROWS)
  );

  /* =======================================================
     NEW ORDER INITIALIZATION
     Every newly created CRM order must start clean.
     Existing sheet functionality remains unchanged.
  ======================================================= */

  const [isInitialized, setIsInitialized] =
    useState(false);

  /* =======================================================
     GRID REFS
  ======================================================= */

  const gridRef = useRef(null);

  const cellRefs = useRef({});

  const setCellRef = (
    rowIndex,
    columnIndex,
    element
  ) => {
    if (!cellRefs.current[rowIndex]) {
      cellRefs.current[rowIndex] = {};
    }

    cellRefs.current[rowIndex][
      columnIndex
    ] = element;
  };

  const focusCell = (
    rowIndex,
    columnIndex
  ) => {
    if (rowIndex < 0) return;
    if (columnIndex < 0) return;
    if (rowIndex >= rows.length) return;
    if (columnIndex > 1) return;

    const element =
      cellRefs.current[rowIndex]?.[
        columnIndex
      ];

    if (!element) return;

    element.focus();

    if (
      typeof element.select ===
      "function"
    ) {
      element.select();
    }
  };

  /* =======================================================
     DUPLICATE PRODUCT TRACKING
======================================================= */

  const getUsedProductIds = (
    ignoreRowIndex = null,
    sourceRows = rows
  ) => {
    const used = new Set();

    sourceRows.forEach(
      (row, index) => {
        if (
          index ===
          ignoreRowIndex
        ) {
          return;
        }

        const id =
          row?.id;

        if (id != null) {
          used.add(
            String(id)
          );
        }
      }
    );

    return used;
  };

  /*
    Stable set for ProductCell.
  */
  const usedProductIdsByRow =
    useMemo(() => {
      return rows.map(
        (_, rowIndex) =>
          getUsedProductIds(
            rowIndex
          )
      );
    }, [rows]);

  /* =======================================================
     RANGE SELECTION
======================================================= */

  const [selection, setSelection] =
    useState({
      startRow: 0,
      startCol: 0,
      endRow: 0,
      endCol: 0,
    });

  const [isDragging, setIsDragging] =
    useState(false);

  const normalizeSelection = (
    currentSelection
  ) => ({
    minRow: Math.min(
      currentSelection.startRow,
      currentSelection.endRow
    ),

    maxRow: Math.max(
      currentSelection.startRow,
      currentSelection.endRow
    ),

    minCol: Math.min(
      currentSelection.startCol,
      currentSelection.endCol
    ),

    maxCol: Math.max(
      currentSelection.startCol,
      currentSelection.endCol
    ),
  });

  const isCellSelected = (
    rowIndex,
    columnIndex
  ) => {
    const s =
      normalizeSelection(
        selection
      );

    return (
      rowIndex >= s.minRow &&
      rowIndex <= s.maxRow &&
      columnIndex >= s.minCol &&
      columnIndex <= s.maxCol
    );
  };

  const selectSingleCell = (
    rowIndex,
    columnIndex
  ) => {
    setSelection({
      startRow: rowIndex,
      startCol: columnIndex,
      endRow: rowIndex,
      endCol: columnIndex,
    });
  };

  const extendSelection = (
    rowIndex,
    columnIndex
  ) => {
    setSelection((current) => ({
      ...current,
      endRow: rowIndex,
      endCol: columnIndex,
    }));
  };

  /* =======================================================
     MOUSE RANGE SELECTION
======================================================= */

  const handleCellMouseDown = (
    rowIndex,
    columnIndex,
    event
  ) => {
    if (event.shiftKey) {
      extendSelection(
        rowIndex,
        columnIndex
      );
    } else {
      selectSingleCell(
        rowIndex,
        columnIndex
      );
    }

    setIsDragging(true);
  };

  const handleCellMouseEnter = (
    rowIndex,
    columnIndex
  ) => {
    if (!isDragging) return;

    extendSelection(
      rowIndex,
      columnIndex
    );
  };

  useEffect(() => {
    const stopDragging = () => {
      setIsDragging(false);
    };

    document.addEventListener(
      "mouseup",
      stopDragging
    );

    return () => {
      document.removeEventListener(
        "mouseup",
        stopDragging
      );
    };
  }, []);

  /* =======================================================
     DATA BOUNDARY
======================================================= */

  const getBoundaryRow = (
    rowIndex,
    direction
  ) => {
    if (
      direction === "up"
    ) {
      let target =
        rowIndex;

      while (
        target > 0 &&
        isFilledRow(
          rows[target - 1]
        )
      ) {
        target--;
      }

      return target;
    }

    if (
      direction === "down"
    ) {
      let target =
        rowIndex;

      while (
        target <
          rows.length - 1 &&
        isFilledRow(
          rows[target + 1]
        )
      ) {
        target++;
      }

      return target;
    }

    return rowIndex;
  };

  const getBoundaryCol = (
    columnIndex,
    direction
  ) => {
    if (
      direction === "left"
    ) {
      return PRODUCT_COL;
    }

    if (
      direction === "right"
    ) {
      return QTY_COL;
    }

    return columnIndex;
  };

  /* =======================================================
     CLEAR SELECTED CELLS
======================================================= */

  const clearSelectedCells = () => {
    const s =
      normalizeSelection(
        selection
      );

    setRows((current) => {
      const updated =
        current.map((row) => ({
          ...row,
        }));

      for (
        let rowIndex = s.minRow;
        rowIndex <= s.maxRow;
        rowIndex++
      ) {
        for (
          let colIndex = s.minCol;
          colIndex <= s.maxCol;
          colIndex++
        ) {
          /*
            Product
          */

          if (
            colIndex ===
            PRODUCT_COL
          ) {
            updated[rowIndex] = {
              ...updated[
                rowIndex
              ],

              id: null,

              product_name: "",

              cartoon_size: "",

              quantity: "",

              price: 0,

              virtual_stock: 0,
            };
          }

          /*
            Qty
          */

          if (
            colIndex === QTY_COL
          ) {
            updated[rowIndex] = {
              ...updated[
                rowIndex
              ],

              quantity: "",
            };
          }
        }
      }

      return updated;
    });
  };

  /* =======================================================
     KEYBOARD NAVIGATION
======================================================= */

  const handleGridKeyDown = (
    rowIndex,
    columnIndex,
    event
  ) => {
    const key = event.key;

    /* -----------------------------------------------------
       Ctrl+C / Ctrl+V
    ----------------------------------------------------- */

    if (
      (event.ctrlKey ||
        event.metaKey) &&
      (key === "c" ||
        key === "C" ||
        key === "v" ||
        key === "V")
    ) {
      return;
    }

    /* -----------------------------------------------------
       CTRL + A
       ALL PRODUCT + QTY
    ----------------------------------------------------- */

    if (
      (event.ctrlKey ||
        event.metaKey) &&
      (key === "a" ||
        key === "A")
    ) {
      event.preventDefault();
      event.stopPropagation();

      setSelection({
        startRow: 0,
        startCol: PRODUCT_COL,
        endRow:
          Math.max(
            rows.length - 1,
            0
          ),
        endCol: QTY_COL,
      });

      return;
    }

    /* -----------------------------------------------------
       DELETE / BACKSPACE
    ----------------------------------------------------- */

    if (
      key === "Delete" ||
      key === "Backspace"
    ) {
      const activeElement =
        document.activeElement;

      const isProductInput =
        activeElement?.dataset
          ?.sheetProductCell ===
        "true";

      const s =
        normalizeSelection(
          selection
        );

      const hasRange =
        s.minRow !== s.maxRow ||
        s.minCol !== s.maxCol;

      /*
        Single Product cell:
        allow normal Backspace typing.
      */

      if (
        key === "Backspace" &&
        isProductInput &&
        !hasRange
      ) {
        return;
      }

      event.preventDefault();

      clearSelectedCells();

      return;
    }

    /* -----------------------------------------------------
       CTRL + SHIFT + ARROW
       DATA BOUNDARY
    ----------------------------------------------------- */

    if (
      (event.ctrlKey ||
        event.metaKey) &&
      event.shiftKey
    ) {
      if (
        key === "ArrowUp" ||
        key === "ArrowDown" ||
        key === "ArrowLeft" ||
        key === "ArrowRight"
      ) {
        event.preventDefault();

        let nextRow =
          selection.endRow;

        let nextCol =
          selection.endCol;

        if (
          key === "ArrowUp"
        ) {
          nextRow =
            getBoundaryRow(
              selection.endRow,
              "up"
            );
        }

        if (
          key === "ArrowDown"
        ) {
          nextRow =
            getBoundaryRow(
              selection.endRow,
              "down"
            );
        }

        if (
          key === "ArrowLeft"
        ) {
          nextCol =
            getBoundaryCol(
              selection.endCol,
              "left"
            );
        }

        if (
          key === "ArrowRight"
        ) {
          nextCol =
            getBoundaryCol(
              selection.endCol,
              "right"
            );
        }

        extendSelection(
          nextRow,
          nextCol
        );

        focusCell(
          nextRow,
          nextCol
        );

        return;
      }
    }

    /* -----------------------------------------------------
       SHIFT + ARROW
    ----------------------------------------------------- */

    if (
      event.shiftKey &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      if (
        key === "ArrowUp" ||
        key === "ArrowDown" ||
        key === "ArrowLeft" ||
        key === "ArrowRight"
      ) {
        event.preventDefault();

        let nextRow =
          selection.endRow;

        let nextCol =
          selection.endCol;

        if (
          key === "ArrowUp"
        ) {
          nextRow = Math.max(
            0,
            nextRow - 1
          );
        }

        if (
          key === "ArrowDown"
        ) {
          nextRow = Math.min(
            rows.length - 1,
            nextRow + 1
          );
        }

        if (
          key === "ArrowLeft"
        ) {
          nextCol = Math.max(
            PRODUCT_COL,
            nextCol - 1
          );
        }

        if (
          key === "ArrowRight"
        ) {
          nextCol = Math.min(
            QTY_COL,
            nextCol + 1
          );
        }

        extendSelection(
          nextRow,
          nextCol
        );

        focusCell(
          nextRow,
          nextCol
        );

        return;
      }
    }

    /* -----------------------------------------------------
       NORMAL ARROW
    ----------------------------------------------------- */

    if (
      key === "ArrowUp" ||
      key === "ArrowDown" ||
      key === "ArrowLeft" ||
      key === "ArrowRight"
    ) {
      event.preventDefault();

      let nextRow =
        rowIndex;

      let nextCol =
        columnIndex;

      if (
        key === "ArrowUp"
      ) {
        nextRow = Math.max(
          0,
          rowIndex - 1
        );
      }

      if (
        key === "ArrowDown"
      ) {
        nextRow = Math.min(
          rows.length - 1,
          rowIndex + 1
        );
      }

      if (
        key === "ArrowLeft"
      ) {
        nextCol = Math.max(
          PRODUCT_COL,
          columnIndex - 1
        );
      }

      if (
        key === "ArrowRight"
      ) {
        nextCol = Math.min(
          QTY_COL,
          columnIndex + 1
        );
      }

      selectSingleCell(
        nextRow,
        nextCol
      );

      focusCell(
        nextRow,
        nextCol
      );

      return;
    }

    /* -----------------------------------------------------
       TAB / ENTER = NEXT CELL
    ----------------------------------------------------- */

    if (
      key === "Tab" ||
      key === "Enter"
    ) {
      event.preventDefault();

      let nextRow =
        rowIndex;

      let nextCol =
        columnIndex + 1;

      if (
        nextCol > QTY_COL
      ) {
        nextCol =
          PRODUCT_COL;

        nextRow++;
      }

      if (
        nextRow >= rows.length
      ) {
        setRows((current) => [
          ...current,
          createEmptyRow(),
        ]);
      }

      selectSingleCell(
        nextRow,
        nextCol
      );

      setTimeout(() => {
        focusCell(
          nextRow,
          nextCol
        );
      }, 0);

      return;
    }
  };

  /* =======================================================
     PRODUCT SELECT
======================================================= */

  const handleRowProductSelect = (
    index,
    product
  ) => {
    const productId =
      getProductId(product);

    if (!productId) return;

    /*
      HARD DUPLICATE BLOCK

      Same product kisi doosri row mein
      already hai to enter nahi hoga.
    */

    const duplicateExists =
      rows.some(
        (row, rowIndex) =>
          rowIndex !== index &&
          String(row?.id) ===
            String(productId)
      );

    if (duplicateExists) {
      return;
    }

    setRows((current) => {
      const updated = [
        ...current,
      ];

      updated[index] = {
        id: productId,

        product_name:
          product.product_name ||
          "",

        cartoon_size:
          product.cartoon_size ||
          "",

        /*
          Quantity BLANK.
        */
        quantity: "",

        price:
          product.price || 0,

        virtual_stock:
          product.virtual_stock ||
          0,
      };

      /*
        Last row par product select:
        automatically one blank row.
      */

      if (
        index ===
        current.length - 1
      ) {
        updated.push(
          createEmptyRow()
        );
      }

      return updated;
    });

    /*
      Product select ke baad direct Qty.
    */

    setTimeout(() => {
      selectSingleCell(
        index,
        QTY_COL
      );

      focusCell(
        index,
        QTY_COL
      );
    }, 0);
  };

  /* =======================================================
     QUANTITY
======================================================= */

  const handleQtyChange = (
    index,
    value
  ) => {
    const numeric =
      sanitizeQuantity(value);

    setRows((current) => {
      const updated = [
        ...current,
      ];

      updated[index] = {
        ...updated[index],
        quantity: numeric,
      };

      return updated;
    });
  };

  /* =======================================================
     PRODUCT PASTE
======================================================= */

  const handleProductPaste = (
    startRowIndex,
    event
  ) => {
    event.preventDefault();

    handleClipboardPaste(
      startRowIndex,
      PRODUCT_COL,
      event.clipboardData.getData(
        "text/plain"
      )
    );
  };

  /* =======================================================
     TSV COPY
======================================================= */

  const buildSelectedTSV = () => {
    const s =
      normalizeSelection(
        selection
      );

    const output = [];

    for (
      let rowIndex = s.minRow;
      rowIndex <= s.maxRow;
      rowIndex++
    ) {
      const rowValues = [];

      for (
        let colIndex = s.minCol;
        colIndex <= s.maxCol;
        colIndex++
      ) {
        if (
          colIndex ===
          PRODUCT_COL
        ) {
          rowValues.push(
            rows[rowIndex]
              ?.product_name || ""
          );
        }

        if (
          colIndex === QTY_COL
        ) {
          rowValues.push(
            rows[rowIndex]
              ?.quantity || ""
          );
        }
      }

      output.push(
        rowValues.join("\t")
      );
    }

    return output.join("\n");
  };

  /* =======================================================
     TSV PASTE
======================================================= */

  const handleClipboardPaste = (
    startRowIndex,
    startColIndex,
    text
  ) => {
    if (!text) return;

    const cleanText =
      String(text).replace(
        /\r/g,
        ""
      );

    const lines =
      cleanText.split("\n");

    while (
      lines.length > 0 &&
      lines[
        lines.length - 1
      ] === ""
    ) {
      lines.pop();
    }

    if (!lines.length) return;

    /*
      Track products already used BEFORE paste.
    */

    const usedIds =
      getUsedProductIds(
        null,
        rows
      );

    /*
      Product IDs accepted during THIS paste.
      Prevents duplicate rows inside same TSV.
    */

    const pastedProductIds =
      new Set();

    setRows((current) => {
      const updated =
        current.map((row) => ({
          ...row,
        }));

      const requiredLength =
        startRowIndex +
        lines.length;

      while (
        updated.length <
        requiredLength
      ) {
        updated.push(
          createEmptyRow()
        );
      }

      lines.forEach(
        (line, rowOffset) => {
          const rowIndex =
            startRowIndex +
            rowOffset;

          const columns =
            line.split("\t");

          columns.forEach(
            (
              rawValue,
              colOffset
            ) => {
              const colIndex =
                startColIndex +
                colOffset;

              if (
                colIndex > QTY_COL
              ) {
                return;
              }

              const value =
                rawValue.trim();

              /* -----------------------------------------
                 PRODUCT
              ----------------------------------------- */

              if (
                colIndex ===
                PRODUCT_COL
              ) {
                const exactName =
                  normalizeProductName(
                    value
                  );

                if (!exactName) {
                  updated[rowIndex] =
                    {
                      ...updated[
                        rowIndex
                      ],

                      id: null,

                      product_name:
                        "",

                      cartoon_size:
                        "",

                      price: 0,

                      virtual_stock: 0,
                    };

                  return;
                }

                const product =
                  allProducts.find(
                    (p) =>
                      normalizeProductName(
                        p.product_name
                      ) ===
                      exactName
                  );

                if (!product) {
                  /*
                    Unknown product:
                    name can still be pasted,
                    exactly as before.
                  */

                  updated[rowIndex] =
                    {
                      ...updated[
                        rowIndex
                      ],

                      product_name:
                        value,

                      id:
                        updated[
                          rowIndex
                        ]?.id ||
                        null,
                    };

                  return;
                }

                const productId =
                  getProductId(
                    product
                  );

                if (!productId) {
                  return;
                }

                const idKey =
                  String(
                    productId
                  );

                const existingRowId =
                  updated[
                    rowIndex
                  ]?.id;

                /*
                  DUPLICATE CHECK

                  Existing row itself is allowed.
                */

                const alreadyUsedElsewhere =
                  updated.some(
                    (
                      row,
                      existingIndex
                    ) =>
                      existingIndex !==
                        rowIndex &&
                      String(
                        row?.id
                      ) === idKey
                  );

                const alreadyPasted =
                  pastedProductIds.has(
                    idKey
                  );

                if (
                  alreadyUsedElsewhere ||
                  alreadyPasted
                ) {
                  /*
                    Do NOT enter duplicate.
                    Keep current row as it is.
                  */
                  return;
                }

                updated[rowIndex] =
                  {
                    id:
                      productId,

                    product_name:
                      product.product_name ||
                      "",

                    cartoon_size:
                      product.cartoon_size ||
                      "",

                    quantity: "",

                    price:
                      product.price ||
                      0,

                    virtual_stock:
                      product.virtual_stock ||
                      0,
                  };

                pastedProductIds.add(
                  idKey
                );

                usedIds.add(
                  idKey
                );
              }

              /* -----------------------------------------
                 QTY
              ----------------------------------------- */

              if (
                colIndex ===
                QTY_COL
              ) {
                updated[rowIndex] =
                  {
                    ...updated[
                      rowIndex
                    ],

                    quantity:
                      sanitizeQuantity(
                        value
                      ),
                  };
              }
            }
          );
        }
      );

      /*
        Always keep one blank row after
        the final filled row.
      */

      let lastFilledIndex =
        -1;

      updated.forEach(
        (row, index) => {
          if (
            isFilledRow(row)
          ) {
            lastFilledIndex =
              index;
          }
        }
      );

      if (
        lastFilledIndex ===
        updated.length - 1
      ) {
        updated.push(
          createEmptyRow()
        );
      }

      return updated;
    });

    /* -----------------------------------------------------
       Selection after paste
    ----------------------------------------------------- */

    const pastedRowCount =
      lines.length;

    const maxColumns =
      Math.max(
        ...lines.map(
          (line) =>
            line.split("\t")
              .length
        )
      );

    const maxPastedCol =
      Math.min(
        QTY_COL,
        startColIndex +
          maxColumns -
          1
      );

    const endRow =
      startRowIndex +
      pastedRowCount -
      1;

    setSelection({
      startRow:
        startRowIndex,

      startCol:
        startColIndex,

      endRow,

      endCol:
        maxPastedCol,
    });

    setTimeout(() => {
      focusCell(
        startRowIndex,
        startColIndex
      );
    }, 0);
  };

  /* =======================================================
     GLOBAL CLIPBOARD
======================================================= */

  useEffect(() => {
    const handleCopy = async (
      event
    ) => {
      if (!gridRef.current)
        return;

      const activeElement =
        document.activeElement;

      if (
        !gridRef.current.contains(
          activeElement
        )
      ) {
        return;
      }

      const text =
        buildSelectedTSV();

      if (!text) return;

      event.preventDefault();

      try {
        await navigator.clipboard.writeText(
          text
        );
      } catch {
        try {
          event.clipboardData?.setData(
            "text/plain",
            text
          );
        } catch {
          // Browser fallback unavailable
        }
      }
    };

    const handlePaste = (
      event
    ) => {
      if (!gridRef.current)
        return;

      const activeElement =
        document.activeElement;

      if (
        !gridRef.current.contains(
          activeElement
        )
      ) {
        return;
      }

      /*
        Product cell has its own
        paste handler.
      */

      if (
        activeElement?.dataset
          ?.sheetProductCell ===
        "true"
      ) {
        return;
      }

      event.preventDefault();

      const text =
        event.clipboardData.getData(
          "text/plain"
        );

      if (!text) return;

      handleClipboardPaste(
        selection.startRow,
        selection.startCol,
        text
      );
    };

    document.addEventListener(
      "copy",
      handleCopy
    );

    document.addEventListener(
      "paste",
      handlePaste
    );

    return () => {
      document.removeEventListener(
        "copy",
        handleCopy
      );

      document.removeEventListener(
        "paste",
        handlePaste
      );
    };
  }, [
    rows,
    selection,
    allProducts,
  ]);

  /* =======================================================
     NEW ORDER INITIALIZATION
  ======================================================= */

  useEffect(() => {
    if (!orderId) return;

    /*
      IMPORTANT:
      This is a NEW CRM order, so never restore product rows
      from the previous order. Clear the shared selection first.
    */
    localStorage.removeItem("crm_selected_products");
    setSelectedProducts([]);
    setRows(createRows(INITIAL_ROWS));

    /*
      SS information belongs to the current newly-created order
      and is still restored from the values set by the parent.
    */
    const savedSS =
      localStorage.getItem("crm_selected_ss");

    const savedSSName =
      localStorage.getItem("crm_selected_ss_name");

    setSelectedSS(savedSS || "");
    setSelectedSSName(savedSSName || "");

    /*
      Only after the clean reset do we allow sync effects to run.
    */
    setIsInitialized(true);
  }, [orderId, setSelectedProducts]);

  /* =======================================================
     LOCAL STORAGE SYNC
======================================================= */

  useEffect(() => {
    if (!isInitialized) return;

    localStorage.setItem(
      "crm_selected_ss",
      selectedSS || ""
    );

    localStorage.setItem(
      "crm_selected_ss_name",
      selectedSSName || ""
    );

    localStorage.setItem(
      "crm_selected_products",
      JSON.stringify(
        selectedProducts || []
      )
    );
  }, [
    isInitialized,
    selectedSS,
    selectedSSName,
    selectedProducts,
  ]);

  /* =======================================================
     ROWS → selectedProducts
======================================================= */

  useEffect(() => {
    if (!isInitialized) return;

    const validProducts =
      rows
        .filter(
          (row) =>
            row.id &&
            Number(
              row.quantity
            ) > 0
        )
        .map((row) => ({
          id: row.id,

          product_name:
            row.product_name,

          cartoon_size:
            row.cartoon_size,

          quantity:
            Number(row.quantity),

          price:
            row.price || 0,

          virtual_stock:
            row.virtual_stock || 0,
        }));

    setSelectedProducts(
      validProducts
    );
  }, [
    isInitialized,
    rows,
    setSelectedProducts,
  ]);

  /* =======================================================
     TOTAL QTY
======================================================= */

  const totalQty = useMemo(
    () =>
      rows.reduce(
        (sum, row) =>
          sum +
          (Number(
            row.quantity
          ) || 0),
        0
      ),
    [rows]
  );

  /* =======================================================
     TOTAL AMOUNT
======================================================= */

  const totalAmount = useMemo(
    () =>
      rows.reduce(
        (sum, row) => {
          const qty =
            Number(
              row.quantity
            ) || 0;

          const price =
            Number(
              row.price
            ) || 0;

          return (
            sum +
            qty * price
          );
        },
        0
      ),
    [rows]
  );

  /* =======================================================
     SELECTED CELLS
======================================================= */

  const selectedCellCount =
    useMemo(() => {
      const s =
        normalizeSelection(
          selection
        );

      return (
        (s.maxRow -
          s.minRow +
          1) *
        (s.maxCol -
          s.minCol +
          1)
      );
    }, [selection]);

  /* =======================================================
     CURRENCY
======================================================= */

  const formatCurrency = (
    value
  ) => {
    if (
      value == null ||
      value === "" ||
      Number.isNaN(
        Number(value)
      )
    ) {
      return "--";
    }

    return Number(value).toFixed(
      1
    );
  };

  /* =======================================================
     ADD ROW
======================================================= */

  const addRow = () => {
    setRows((current) => [
      ...current,
      createEmptyRow(),
    ]);
  };

  /* =======================================================
     RENDER
======================================================= */

  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        px-2
        sm:px-3
        pb-24
      "
    >

      {/* =================================================
          TOP TOOLBAR
      ================================================= */}

      <div
        className="
          sticky
          top-0
          z-40
          mb-2
          bg-white
          border
          border-slate-400
          rounded-lg
          shadow-sm
          overflow-hidden
        "
      >
        {/* Main toolbar */}

        <div
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-2
            px-2.5
            py-2
            bg-white
          "
        >
          {/* LEFT */}

          <div
            className="
              flex
              items-center
              gap-1
              sm:gap-1.5
            "
          >
            <button
              type="button"
              onClick={async () => {
                const text =
                  buildSelectedTSV();

                if (!text) return;

                try {
                  await navigator.clipboard.writeText(
                    text
                  );
                } catch {
                  // Browser permission fallback
                }
              }}
              className="
                h-7
                px-2.5
                rounded-md
                border
                border-slate-400
                bg-white
                hover:bg-slate-50
                text-slate-600
                text-[10px]
                font-medium
                flex
                items-center
                gap-1
                transition-colors
              "
              title="Copy selected cells"
            >
              <FaCopy className="text-[9px]" />
              Copy
            </button>

            <button
              type="button"
              onClick={() =>
                focusCell(
                  selection.startRow,
                  selection.startCol
                )
              }
              className="
                h-7
                px-2.5
                rounded-md
                border
                border-slate-400
                bg-white
                hover:bg-slate-50
                text-slate-600
                text-[10px]
                font-medium
                flex
                items-center
                gap-1
                transition-colors
              "
              title="Paste using Ctrl+V"
            >
              <FaPaste className="text-[9px]" />
              Paste
            </button>

            <button
              type="button"
              onClick={
                clearSelectedCells
              }
              className="
                h-7
                px-2.5
                rounded-md
                border
                border-slate-400
                bg-white
                hover:bg-red-50
                hover:border-red-200
                hover:text-red-600
                text-slate-600
                text-[10px]
                font-medium
                flex
                items-center
                gap-1
                transition-colors
              "
              title="Clear selected cells"
            >
              <FaTimes className="text-[9px]" />
              Clear
            </button>

            <button
              type="button"
              onClick={addRow}
              className="
                h-7
                px-2.5
                rounded-md
                bg-[#12233b]
                hover:bg-[#1b3150]
                text-white
                text-[10px]
                font-medium
                flex
                items-center
                gap-1
                transition-colors
              "
              title="Add row"
            >
              <FaPlus className="text-[9px]" />
              Row
            </button>
          </div>

          {/* RIGHT STATS */}

          <div
            className="
              flex
              items-center
              gap-3
              text-[10px]
              text-slate-500
            "
          >
            <span>
              Rows:{" "}
              <b className="text-slate-700">
                {rows.length}
              </b>
            </span>

            <span>
              Selected:{" "}
              <b className="text-blue-600">
                {selectedCellCount}
              </b>
            </span>

            <span>
              Qty:{" "}
              <b className="text-slate-700">
                {totalQty}
              </b>
            </span>

            <span>
              Amount:{" "}
              <b className="text-slate-800">
                ₹{" "}
                {formatCurrency(
                  totalAmount
                )}
              </b>
            </span>
          </div>
        </div>

        {/* Keyboard helper */}

        <div
          className="
            px-2.5
            py-1
            border-t
            border-slate-100
            bg-slate-50
            flex
            items-center
            gap-1.5
            text-[9px]
            text-slate-400
            overflow-x-auto
            whitespace-nowrap
          "
        >
          <FaKeyboard className="text-slate-400" />

          <span>
            ↑↓←→ Navigate
          </span>

          <span>•</span>

          <span>
            Tab / Enter Next
          </span>

          <span>•</span>

          <span>
            Shift + Arrow Select
          </span>

          <span>•</span>

          <span>
            Ctrl + Shift + Arrow Boundary
          </span>

          <span>•</span>

          <span>
            Ctrl+A All
          </span>

          <span>•</span>

          <span>
            Delete Clear
          </span>

          <span>•</span>

          <span>
            Ctrl+C / Ctrl+V
          </span>
        </div>
      </div>

      {/* =================================================
          GOOGLE SHEET GRID
      ================================================= */}

      <div
        ref={gridRef}
        className="
          w-full
          overflow-x-auto
          bg-white
          border
          border-slate-400
          rounded-lg
          shadow-sm
          select-none
        "
      >
        <table
          className="
            min-w-[850px]
            w-full
            border-collapse
            text-xs
          "
        >
          <thead>
            <tr>
              {/* # */}

              <th
                className="
                  sticky
                  left-0
                  z-20
                  w-10
                  border
                  border-slate-400
                  bg-[#eef2f6]
                  px-2
                  py-2
                  text-center
                  text-[10px]
                  font-semibold
                  text-slate-500
                "
              >
                #
              </th>

              {/* PRODUCT */}

              <th
                className="
                  w-[360px]
                  border
                  border-slate-400
                  bg-[#f7f2e9]
                  px-2.5
                  py-2
                  text-left
                  text-[10px]
                  font-semibold
                  text-slate-700
                "
              >
                Product
              </th>

              {/* QTY */}

              <th
                className="
                  w-24
                  border
                  border-slate-400
                  bg-[#f7f2e9]
                  px-2
                  py-2
                  text-center
                  text-[10px]
                  font-semibold
                  text-slate-700
                "
              >
                Qty
              </th>

              {/* CARTON */}

              <th
                className="
                  w-24
                  border
                  border-slate-400
                  bg-[#eef2f6]
                  px-2
                  py-2
                  text-center
                  text-[10px]
                  font-semibold
                  text-slate-600
                "
              >
                Carton
              </th>

              {/* STOCK */}

              <th
                className="
                  w-24
                  border
                  border-slate-400
                  bg-[#eef2f6]
                  px-2
                  py-2
                  text-center
                  text-[10px]
                  font-semibold
                  text-slate-600
                "
              >
                Stock
              </th>

              {/* PRICE */}

              <th
                className="
                  w-24
                  border
                  border-slate-400
                  bg-[#eef2f6]
                  px-2
                  py-2
                  text-center
                  text-[10px]
                  font-semibold
                  text-slate-600
                "
              >
                Price
              </th>

              {/* TOTAL */}

              <th
                className="
                  w-28
                  border
                  border-slate-400
                  bg-[#eef2f6]
                  px-2
                  py-2
                  text-center
                  text-[10px]
                  font-semibold
                  text-slate-600
                "
              >
                Total
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map(
              (row, rowIndex) => {
                const productSelected =
                  isCellSelected(
                    rowIndex,
                    PRODUCT_COL
                  );

                const qtySelected =
                  isCellSelected(
                    rowIndex,
                    QTY_COL
                  );

                return (
                  <tr
                    key={rowIndex}
                    className="
                      h-[35px]
                      hover:bg-slate-50
                    "
                  >
                    {/* ROW NUMBER */}

                    <td
                      className="
                        sticky
                        left-0
                        z-10
                        border
                        border-slate-400
                        bg-slate-50
                        text-center
                        text-[10px]
                        text-slate-400
                        font-medium
                      "
                    >
                      {rowIndex + 1}
                    </td>

                    {/* PRODUCT */}

                    <td
                      className={`
                        relative
                        border
                        border-slate-400
                        p-0
                        ${
                          productSelected
                            ? "bg-blue-50 ring-2 ring-inset ring-blue-500"
                            : "bg-white"
                        }
                      `}
                      onMouseDown={(event) =>
                        handleCellMouseDown(
                          rowIndex,
                          PRODUCT_COL,
                          event
                        )
                      }
                      onMouseEnter={() =>
                        handleCellMouseEnter(
                          rowIndex,
                          PRODUCT_COL
                        )
                      }
                    >
                      <SheetProductCell
                        products={
                          allProducts
                        }
                        value={
                          row.product_name
                        }
                        onSelect={(
                          product
                        ) =>
                          handleRowProductSelect(
                            rowIndex,
                            product
                          )
                        }
                        onGridKeyDown={(
                          event
                        ) =>
                          handleGridKeyDown(
                            rowIndex,
                            PRODUCT_COL,
                            event
                          )
                        }
                        onPaste={(event) =>
                          handleProductPaste(
                            rowIndex,
                            event
                          )
                        }
                        currentRowProductId={
                          row.id
                        }
                        usedProductIds={
                          usedProductIdsByRow[
                            rowIndex
                          ] ||
                          new Set()
                        }
                        inputRef={(
                          element
                        ) => {
                          setCellRef(
                            rowIndex,
                            PRODUCT_COL,
                            element
                          );
                        }}
                      />
                    </td>

                    {/* QTY */}

                    <td
                      className={`
                        border
                        border-slate-400
                        p-0
                        ${
                          qtySelected
                            ? "bg-blue-50 ring-2 ring-inset ring-blue-500"
                            : "bg-white"
                        }
                      `}
                      onMouseDown={(event) =>
                        handleCellMouseDown(
                          rowIndex,
                          QTY_COL,
                          event
                        )
                      }
                      onMouseEnter={() =>
                        handleCellMouseEnter(
                          rowIndex,
                          QTY_COL
                        )
                      }
                    >
                      <input
                        ref={(element) =>
                          setCellRef(
                            rowIndex,
                            QTY_COL,
                            element
                          )
                        }
                        type="text"
                        inputMode="numeric"
                        value={
                          row.quantity
                        }
                        onChange={(event) =>
                          handleQtyChange(
                            rowIndex,
                            event.target.value
                          )
                        }
                        onKeyDown={(event) =>
                          handleGridKeyDown(
                            rowIndex,
                            QTY_COL,
                            event
                          )
                        }
                        className="
                          w-full
                          h-full
                          min-h-[34px]
                          px-2
                          text-center
                          text-xs
                          text-slate-700
                          bg-transparent
                          border
                          border-transparent
                          outline-none
                          focus:border-blue-500
                          focus:ring-1
                          focus:ring-blue-300
                          rounded-none
                        "
                        autoComplete="off"
                      />
                    </td>

                    {/* CARTON */}

                    <td
                      className="
                        border
                        border-slate-400
                        px-2
                        text-center
                        text-[10px]
                        text-slate-500
                      "
                    >
                      {row.cartoon_size ||
                        "--"}
                    </td>

                    {/* STOCK */}

                    <td
                      className="
                        border
                        border-slate-400
                        px-2
                        text-center
                        text-[10px]
                        text-slate-500
                      "
                    >
                      {row.virtual_stock ||
                        "--"}
                    </td>

                    {/* PRICE */}

                    <td
                      className="
                        border
                        border-slate-400
                        px-2
                        text-center
                        text-[10px]
                        text-slate-500
                      "
                    >
                      {formatCurrency(
                        row.price
                      )}
                    </td>

                    {/* TOTAL */}

                    <td
                      className="
                        border
                        border-slate-400
                        px-2
                        text-center
                        text-[10px]
                        font-medium
                        text-slate-700
                      "
                    >
                      {formatCurrency(
                        (Number(
                          row.price
                        ) || 0) *
                          (Number(
                            row.quantity
                          ) || 0)
                      )}
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>

          {/* =================================================
              FOOTER TOTAL
          ================================================= */}

          <tfoot>
            <tr>
              <td
                colSpan={2}
                className="
                  border
                  border-slate-400
                  bg-slate-50
                  px-3
                  py-2
                  text-right
                  text-[10px]
                  font-semibold
                  text-slate-600
                "
              >
                Total
              </td>

              <td
                className="
                  border
                  border-slate-400
                  bg-slate-50
                  px-2
                  py-2
                  text-center
                  text-[10px]
                  font-bold
                  text-slate-800
                "
              >
                {totalQty}
              </td>

              <td
                colSpan={3}
                className="
                  border
                  border-slate-400
                  bg-slate-50
                  px-2
                  py-2
                  text-right
                  text-[10px]
                  font-semibold
                  text-slate-500
                "
              >
                Total Amount
              </td>

              <td
                className="
                  border
                  border-slate-400
                  bg-slate-50
                  px-2
                  py-2
                  text-center
                  text-[10px]
                  font-bold
                  text-slate-800
                "
              >
                ₹{" "}
                {formatCurrency(
                  totalAmount
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
