import { useState, useMemo } from "react";
import { useSamplingSheet } from "../../hooks/SS/useSamplingSheet";
import { useCachedProducts } from "../../hooks/useCachedProducts";

export default function SamplingSheetPanel({ partyName }) {
  const { data = [], isLoading, error } = useSamplingSheet();
  const { data: products = [] } = useCachedProducts();

  const [search, setSearch] = useState("");

  // ✅ NEW → toggle mode
  const [selectedType, setSelectedType] = useState("sampling");

  // 🔹 Party match
  const partyData = useMemo(() => {
    return data.find(
      (row) =>
        row.party_name?.toLowerCase() ===
        partyName?.toLowerCase()
    );
  }, [data, partyName]);

  // 🔹 Product → Stock map
  const productStockMap = useMemo(() => {
    const map = {};

    products.forEach((p) => {
      if (p.product_name) {
        map[p.product_name.trim().toLowerCase()] =
          p.virtual_stock ?? 0;
      }
    });

    return map;
  }, [products]);

  // ✅ Current items based on toggle
  const currentItems = useMemo(() => {
    if (!partyData) return "";

    return selectedType === "sampling"
      ? partyData.sampling_Items || ""
      : partyData.sixty_days_Items || "";
  }, [partyData, selectedType]);

  // 🔹 Split & Filter Items
  const filteredItems = useMemo(() => {
    if (!currentItems) return [];

    return currentItems
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean)
      .filter((item) =>
        item.toLowerCase().includes(search.toLowerCase())
      );
  }, [currentItems, search]);

  return (
    <div className="bg-blue-50 rounded p-2 overflow-x-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-2 gap-2">
        <h3 className="font-semibold text-xs text-blue-800">
          📋 Sampling Sheet
        </h3>

        {/* ✅ TOGGLE BUTTONS */}
        <div className="flex border rounded overflow-hidden text-[10px]">

          <button
            onClick={() => setSelectedType("sampling")}
            className={`px-2 py-1 transition ${
              selectedType === "sampling"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Sampling
          </button>

          <button
            onClick={() => setSelectedType("sixty")}
            className={`px-2 py-1 transition ${
              selectedType === "sixty"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            60 Days
          </button>

        </div>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={`Search ${
          selectedType === "sampling"
            ? "sampling"
            : "60 days"
        } item...`}
        className="mb-3 w-full px-3 py-1 text-sm border rounded"
      />

      {/* STATES */}
      {isLoading && (
        <p className="text-sm text-gray-500">
          Loading...
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500">
          Failed to load data
        </p>
      )}

      {!isLoading && !partyData && (
        <p className="text-sm text-gray-500">
          No data found for this party
        </p>
      )}

      {/* TABLE */}
      {partyData && filteredItems.length > 0 && (
        <table className="w-full border border-blue-200 text-xs">

          <thead className="bg-blue-100 text-blue-800">
            <tr>
              <th className="px-2 py-1 border text-center">
                #
              </th>

              <th className="px-2 py-1 border text-center">
                Item Name
              </th>

              <th className="px-2 py-1 border text-center bg-red-200">
                Stock
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.map((item, index) => {

              const stock =
                productStockMap[item.trim().toLowerCase()] ?? 0;

              return (
                <tr
                  key={index}
                  className="hover:bg-blue-50 text-center"
                >
                  <td className="border">
                    {index + 1}
                  </td>

                  <td className="border font-medium">
                    {item}
                  </td>

                  <td
                    className={`border text-center font-semibold ${
                      stock > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stock}
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      )}

      {/* EMPTY */}
      {partyData && filteredItems.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          No matching items found
        </p>
      )}
    </div>
  );
}



// import { useState, useMemo } from "react";
// import { useSamplingSheet } from "../../hooks/SS/useSamplingSheet";
// import { useCachedProducts } from "../../hooks/useCachedProducts";

// import {
//   ClipboardList,
//   Search,
//   Package,
//   CheckCircle2,
//   AlertCircle,
//   CalendarDays,
//   X,
//   ChevronRight,
//   CircleDot,
// } from "lucide-react";

// export default function SamplingSheetPanel({ partyName }) {
//   const { data = [], isLoading, error } = useSamplingSheet();
//   const { data: products = [] } = useCachedProducts();

//   const [search, setSearch] = useState("");
//   const [selectedType, setSelectedType] = useState("sampling");

//   // ============================================================
//   // PARTY MATCH
//   // ============================================================
//   const partyData = useMemo(() => {
//     const normalizedParty = partyName?.trim().toLowerCase();

//     if (!normalizedParty) return null;

//     return data.find(
//       (row) =>
//         row.party_name?.trim().toLowerCase() === normalizedParty
//     );
//   }, [data, partyName]);

//   // ============================================================
//   // PRODUCT → STOCK MAP
//   // ============================================================
//   const productStockMap = useMemo(() => {
//     const map = {};

//     products.forEach((product) => {
//       if (!product.product_name) return;

//       const productName = product.product_name
//         .trim()
//         .toLowerCase();

//       map[productName] = Number(product.virtual_stock ?? 0);
//     });

//     return map;
//   }, [products]);

//   // ============================================================
//   // CURRENT ITEMS
//   // ============================================================
//   const currentItems = useMemo(() => {
//     if (!partyData) return "";

//     return selectedType === "sampling"
//       ? partyData.sampling_Items || ""
//       : partyData.sixty_days_Items || "";
//   }, [partyData, selectedType]);

//   // ============================================================
//   // PARSED ITEMS
//   // ============================================================
//   const allItems = useMemo(() => {
//     if (!currentItems) return [];

//     return currentItems
//       .split(",")
//       .map((item) => item.trim())
//       .filter(Boolean);
//   }, [currentItems]);

//   // ============================================================
//   // FILTER ITEMS
//   // ============================================================
//   const filteredItems = useMemo(() => {
//     const searchValue = search.trim().toLowerCase();

//     if (!searchValue) return allItems;

//     return allItems.filter((item) =>
//       item.toLowerCase().includes(searchValue)
//     );
//   }, [allItems, search]);

//   // ============================================================
//   // STOCK STATS
//   // ============================================================
//   const availableCount = useMemo(() => {
//     return filteredItems.filter((item) => {
//       const stock =
//         productStockMap[item.trim().toLowerCase()] ?? 0;

//       return Number(stock) > 0;
//     }).length;
//   }, [filteredItems, productStockMap]);

//   const unavailableCount = Math.max(
//     filteredItems.length - availableCount,
//     0
//   );

//   const availabilityPercent =
//     filteredItems.length > 0
//       ? Math.round(
//           (availableCount / filteredItems.length) * 100
//         )
//       : 0;

//   const isSampling = selectedType === "sampling";

//   // ============================================================
//   // TYPE TOGGLE
//   // ============================================================
//   const handleTypeChange = (type) => {
//     setSelectedType(type);
//     setSearch("");
//   };

//   // ============================================================
//   // CLEAR SEARCH
//   // ============================================================
//   const handleClearSearch = () => {
//     setSearch("");
//   };

//   return (
//     <section className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

//       {/* ========================================================
//           HEADER
//       ======================================================== */}
//       <div className="relative border-b border-gray-100 bg-white px-3 py-3">

//         {/* Accent */}
//         <div
//           className={`absolute inset-x-0 top-0 h-[2px] ${
//             isSampling ? "bg-blue-500" : "bg-rose-500"
//           }`}
//         />

//         <div className="flex items-start justify-between gap-3">

//           {/* TITLE */}
//           <div className="flex min-w-0 items-center gap-2">

//             <div
//               className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
//                 isSampling
//                   ? "bg-blue-50 text-blue-600"
//                   : "bg-rose-50 text-rose-600"
//               }`}
//             >
//               {isSampling ? (
//                 <ClipboardList size={15} />
//               ) : (
//                 <CalendarDays size={15} />
//               )}
//             </div>

//             <div className="min-w-0">

//               <div className="flex items-center gap-1.5">

//                 <h2 className="truncate text-[12px] font-bold tracking-tight text-gray-900">
//                   Sampling Sheet
//                 </h2>

//                 <span
//                   className={`shrink-0 rounded-full px-1.5 py-0.5 text-[7px] font-bold ${
//                     isSampling
//                       ? "bg-blue-50 text-blue-600"
//                       : "bg-rose-50 text-rose-600"
//                   }`}
//                 >
//                   {isSampling ? "Sampling" : "60 Days"}
//                 </span>

//               </div>

//               <p className="mt-0.5 truncate text-[8px] font-medium text-gray-400">
//                 {partyName || "Party item requirements"}
//               </p>

//             </div>
//           </div>

//           {/* ITEM COUNT */}
//           {!isLoading && !error && partyData && (
//             <div className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5">

//               <Package
//                 size={10}
//                 className="text-gray-400"
//               />

//               <span className="text-[9px] font-bold text-gray-700">
//                 {filteredItems.length}
//               </span>

//               <span className="text-[8px] text-gray-400">
//                 items
//               </span>

//             </div>
//           )}

//         </div>

//         {/* ========================================================
//             TYPE TOGGLE
//         ======================================================== */}
//         <div className="mt-3 flex rounded-xl border border-gray-200 bg-gray-50 p-0.5">

//           <button
//             type="button"
//             onClick={() => handleTypeChange("sampling")}
//             className={`group flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[9px] font-bold transition-all duration-200 ${
//               isSampling
//                 ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-100"
//                 : "text-gray-400 hover:text-gray-600"
//             }`}
//           >
//             <ClipboardList
//               size={11}
//               className="transition-transform duration-200 group-hover:scale-105"
//             />

//             Sampling

//             {isSampling && (
//               <ChevronRight
//                 size={9}
//                 className="text-blue-400"
//               />
//             )}
//           </button>

//           <button
//             type="button"
//             onClick={() => handleTypeChange("sixty")}
//             className={`group flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[9px] font-bold transition-all duration-200 ${
//               !isSampling
//                 ? "bg-white text-rose-600 shadow-sm ring-1 ring-gray-100"
//                 : "text-gray-400 hover:text-gray-600"
//             }`}
//           >
//             <CalendarDays
//               size={11}
//               className="transition-transform duration-200 group-hover:scale-105"
//             />

//             60 Days

//             {!isSampling && (
//               <ChevronRight
//                 size={9}
//                 className="text-rose-400"
//               />
//             )}
//           </button>

//         </div>
//       </div>

//       {/* ========================================================
//           QUICK STATS
//       ======================================================== */}
//       {!isLoading && !error && partyData && (
//         <div className="grid grid-cols-3 border-b border-gray-100">

//           {/* REQUIRED */}
//           <div className="px-3 py-2.5">

//             <div className="flex items-center gap-1">

//               <ClipboardList
//                 size={9}
//                 className="text-gray-400"
//               />

//               <p className="text-[7px] font-bold uppercase tracking-wider text-gray-400">
//                 Required
//               </p>

//             </div>

//             <p className="mt-1 text-sm font-bold text-gray-900">
//               {filteredItems.length}
//             </p>

//           </div>

//           {/* AVAILABLE */}
//           <div className="border-x border-gray-100 px-3 py-2.5">

//             <div className="flex items-center gap-1">

//               <CheckCircle2
//                 size={9}
//                 className="text-emerald-500"
//               />

//               <p className="text-[7px] font-bold uppercase tracking-wider text-emerald-500">
//                 In Stock
//               </p>

//             </div>

//             <p className="mt-1 text-sm font-bold text-emerald-600">
//               {availableCount}
//             </p>

//           </div>

//           {/* MISSING */}
//           <div className="px-3 py-2.5">

//             <div className="flex items-center gap-1">

//               <AlertCircle
//                 size={9}
//                 className={
//                   unavailableCount > 0
//                     ? "text-red-500"
//                     : "text-gray-300"
//                 }
//               />

//               <p
//                 className={`text-[7px] font-bold uppercase tracking-wider ${
//                   unavailableCount > 0
//                     ? "text-red-500"
//                     : "text-gray-400"
//                 }`}
//               >
//                 Missing
//               </p>

//             </div>

//             <p
//               className={`mt-1 text-sm font-bold ${
//                 unavailableCount > 0
//                   ? "text-red-600"
//                   : "text-gray-400"
//               }`}
//             >
//               {unavailableCount}
//             </p>

//           </div>

//         </div>
//       )}

//       {/* ========================================================
//           SEARCH
//       ======================================================== */}
//       {!isLoading && !error && partyData && (
//         <div className="border-b border-gray-100 px-3 py-2.5">

//           <div className="relative">

//             <Search
//               size={12}
//               className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
//             />

//             <input
//               type="text"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder={
//                 isSampling
//                   ? "Search sampling item..."
//                   : "Search 60 days item..."
//               }
//               className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-8 pr-8 text-[9px] font-medium text-gray-700 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-50"
//             />

//             {search && (
//               <button
//                 type="button"
//                 onClick={handleClearSearch}
//                 className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition-all duration-150 hover:bg-gray-100 hover:text-gray-600 active:scale-90"
//                 aria-label="Clear search"
//               >
//                 <X size={10} />
//               </button>
//             )}

//           </div>

//           {/* SEARCH RESULT INFO */}
//           {search && (
//             <div className="mt-1.5 flex items-center justify-between px-0.5">

//               <span className="text-[7px] text-gray-400">
//                 Search results
//               </span>

//               <span className="text-[7px] font-semibold text-gray-500">
//                 {filteredItems.length} found
//               </span>

//             </div>
//           )}

//         </div>
//       )}

//       {/* ========================================================
//           LOADING
//       ======================================================== */}
//       {isLoading && (
//         <div className="px-4 py-12 text-center">

//           <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
//             <ClipboardList
//               size={16}
//               className="animate-pulse text-blue-500"
//             />
//           </div>

//           <p className="text-[11px] font-bold text-gray-700">
//             Loading sheet
//           </p>

//           <p className="mt-1 text-[8px] text-gray-400">
//             Fetching party requirements...
//           </p>

//         </div>
//       )}

//       {/* ========================================================
//           ERROR
//       ======================================================== */}
//       {error && !isLoading && (
//         <div className="px-4 py-12 text-center">

//           <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
//             <AlertCircle
//               size={16}
//               className="text-red-500"
//             />
//           </div>

//           <p className="text-[11px] font-bold text-red-600">
//             Unable to load sheet
//           </p>

//           <p className="mx-auto mt-1 max-w-[220px] text-[8px] leading-relaxed text-gray-400">
//             Sampling sheet data could not be loaded.
//             Please try again.
//           </p>

//         </div>
//       )}

//       {/* ========================================================
//           NO PARTY
//       ======================================================== */}
//       {!isLoading && !error && !partyData && (
//         <div className="px-4 py-12 text-center">

//           <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
//             <Package
//               size={16}
//               className="text-gray-400"
//             />
//           </div>

//           <p className="text-[11px] font-bold text-gray-700">
//             No party data
//           </p>

//           <p className="mx-auto mt-1 max-w-[220px] text-[8px] leading-relaxed text-gray-400">
//             No sampling information is available
//             for this party.
//           </p>

//         </div>
//       )}

//       {/* ========================================================
//           TABLE
//       ======================================================== */}
//       {!isLoading &&
//         !error &&
//         partyData &&
//         filteredItems.length > 0 && (
//           <div className="max-h-[390px] overflow-auto scrollbar-thin">

//             <table className="w-full border-collapse">

//               <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm">

//                 <tr className="border-b border-gray-100">

//                   <th className="w-9 px-2 py-2 text-center text-[7px] font-bold uppercase tracking-wider text-gray-400">
//                     #
//                   </th>

//                   <th className="px-3 py-2 text-left text-[7px] font-bold uppercase tracking-wider text-gray-400">
//                     Item
//                   </th>

//                   <th className="w-[76px] px-2 py-2 text-center text-[7px] font-bold uppercase tracking-wider text-gray-400">
//                     Stock
//                   </th>

//                 </tr>

//               </thead>

//               <tbody>
//                 {filteredItems.map((item, index) => {
//                   const stock =
//                     productStockMap[
//                       item.trim().toLowerCase()
//                     ] ?? 0;

//                   const numericStock = Number(stock) || 0;
//                   const isAvailable = numericStock > 0;

//                   return (
//                     <tr
//                       key={`${item}-${index}`}
//                       className="group border-b border-gray-50 transition-all duration-150 hover:bg-blue-50/30"
//                     >

//                       {/* NUMBER */}
//                       <td className="px-2 py-2.5 text-center">

//                         <span className="text-[8px] font-semibold text-gray-300 transition-colors group-hover:text-blue-400">
//                           {index + 1}
//                         </span>

//                       </td>

//                       {/* ITEM */}
//                       <td className="px-3 py-2.5">

//                         <div className="flex min-w-0 items-center gap-2">

//                           <div
//                             className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-all duration-150 ${
//                               isAvailable
//                                 ? "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100"
//                                 : "bg-gray-100 text-gray-400 group-hover:bg-red-50 group-hover:text-red-400"
//                             }`}
//                           >
//                             <Package size={10} />
//                           </div>

//                           <div className="min-w-0">

//                             <p className="truncate text-[9px] font-semibold text-gray-700">
//                               {item}
//                             </p>

//                             <div className="mt-0.5 flex items-center gap-1">

//                               <CircleDot
//                                 size={6}
//                                 className={
//                                   isAvailable
//                                     ? "text-emerald-500"
//                                     : "text-red-400"
//                                 }
//                               />

//                               <span
//                                 className={`text-[6px] font-medium ${
//                                   isAvailable
//                                     ? "text-emerald-500"
//                                     : "text-red-400"
//                                 }`}
//                               >
//                                 {isAvailable
//                                   ? "Available"
//                                   : "Out of stock"}
//                               </span>

//                             </div>

//                           </div>

//                         </div>

//                       </td>

//                       {/* STOCK */}
//                       <td className="px-2 py-2.5 text-center">

//                         <span
//                           className={`inline-flex min-w-[42px] items-center justify-center gap-1 rounded-lg border px-1.5 py-1 text-[8px] font-bold transition-all duration-150 ${
//                             isAvailable
//                               ? "border-emerald-100 bg-emerald-50 text-emerald-700 group-hover:border-emerald-200 group-hover:bg-emerald-100"
//                               : "border-red-100 bg-red-50 text-red-600 group-hover:border-red-200 group-hover:bg-red-100"
//                           }`}
//                         >
//                           {isAvailable ? (
//                             <CheckCircle2 size={9} />
//                           ) : (
//                             <AlertCircle size={9} />
//                           )}

//                           {numericStock}

//                         </span>

//                       </td>

//                     </tr>
//                   );
//                 })}
//               </tbody>

//             </table>

//           </div>
//         )}

//       {/* ========================================================
//           EMPTY SEARCH
//       ======================================================== */}
//       {!isLoading &&
//         !error &&
//         partyData &&
//         filteredItems.length === 0 && (
//           <div className="px-4 py-12 text-center">

//             <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
//               <Search
//                 size={16}
//                 className="text-gray-400"
//               />
//             </div>

//             <p className="text-[11px] font-bold text-gray-700">
//               No matching items
//             </p>

//             <p className="mt-1 text-[8px] text-gray-400">
//               {search
//                 ? "Try another item name or clear search."
//                 : "No items are listed for this category."}
//             </p>

//             {search && (
//               <button
//                 type="button"
//                 onClick={handleClearSearch}
//                 className="mt-3 rounded-lg bg-blue-50 px-3 py-1.5 text-[8px] font-bold text-blue-600 transition-all duration-150 hover:bg-blue-100 active:scale-95"
//               >
//                 Clear Search
//               </button>
//             )}

//           </div>
//         )}

//       {/* ========================================================
//           FOOTER / PROGRESS
//       ======================================================== */}
//       {!isLoading &&
//         !error &&
//         partyData &&
//         filteredItems.length > 0 && (
//           <div className="border-t border-gray-100 bg-gray-50/80">

//             {/* PROGRESS BAR */}
//             <div className="h-0.5 w-full bg-gray-100">

//               <div
//                 className={`h-full transition-all duration-500 ${
//                   isSampling
//                     ? "bg-blue-500"
//                     : "bg-rose-500"
//                 }`}
//                 style={{
//                   width: `${availabilityPercent}%`,
//                 }}
//               />

//             </div>

//             <div className="flex items-center justify-between gap-2 px-3 py-2">

//               {/* STATUS */}
//               <div className="flex min-w-0 items-center gap-1.5">

//                 <div
//                   className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
//                     availabilityPercent === 100
//                       ? "bg-emerald-50 text-emerald-600"
//                       : "bg-amber-50 text-amber-600"
//                   }`}
//                 >
//                   {availabilityPercent === 100 ? (
//                     <CheckCircle2 size={10} />
//                   ) : (
//                     <AlertCircle size={10} />
//                   )}
//                 </div>

//                 <div className="min-w-0">

//                   <p className="truncate text-[7px] font-bold text-gray-600">
//                     {availabilityPercent === 100
//                       ? "All items available"
//                       : "Stock check"}
//                   </p>

//                   <p className="text-[6px] text-gray-400">
//                     {availableCount} of{" "}
//                     {filteredItems.length} in stock
//                   </p>

//                 </div>

//               </div>

//               {/* PERCENTAGE */}
//               <div className="shrink-0 text-right">

//                 <p
//                   className={`text-[10px] font-bold ${
//                     availabilityPercent === 100
//                       ? "text-emerald-600"
//                       : "text-gray-700"
//                   }`}
//                 >
//                   {availabilityPercent}%
//                 </p>

//                 <p className="text-[6px] font-medium uppercase tracking-wide text-gray-400">
//                   Available
//                 </p>

//               </div>

//             </div>

//           </div>
//         )}

//     </section>
//   );
// }