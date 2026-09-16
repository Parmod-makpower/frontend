
export default function TemperedSummaryPanel({
  totalSSOrderQty,
  totalApprovedQty,
  totalProducts,
  categoryWiseTotals
}) {
  const getShortName = (cat) => {
    if (cat === "UV TEMPERED") return "UV";
    if (cat === "TEMPERED MEIBO") return "MEIBO";
    if (cat === "TEMPERED SOLDIER") return "SOLDIER";
    if (cat === "NEW SOLDIER TEMPERED") return "NEW SOLDIER";
    if (cat === "TEMPERED BODYGUARD") return "Bodyguard";
    if (cat === "TEMPERED SUPER X") return "Super X";
    return cat;
  };

  return (
    <div className="bg-gray-100 rounded w-full">

      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 border-b bg-gray-600 text-white rounded">
        <h2 className=" text-sm">Tempered Order Summary</h2>

        <div className="text-xs font-semibold">
          <span className="text-green-600 bg-white p-1 px-2 rounded">
            {totalProducts}
          </span>
        </div>
      </div>

      {/* Category Table */}
      {categoryWiseTotals && Object.keys(categoryWiseTotals).length > 0 && (
        <div className="mt-1 overflow-x-auto">
          <table className="w-full text-xs border">
            <thead className="bg-red-100">
              <tr>
                <th className="p-2 border text-center">Category</th>
                <th className="p-2 border text-center">quantity</th>
                <th className="p-2 border text-center">Items</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(categoryWiseTotals).map((cat) => (
                <tr key={cat}>
                  <td className="p-2 border text-center font-medium">
                    {getShortName(cat)}
                  </td>

                  {/* 🆕 Order Items */}
                  <td className="p-2 border text-center">
                    {categoryWiseTotals[cat].orderItems} / {categoryWiseTotals[cat].approvedQty}
                  </td>

                  {/* 🆕 Available Items */}
                  <td className="p-2 border text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${categoryWiseTotals[cat].availableItems <
                          categoryWiseTotals[cat].orderItems
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-700"
                        }`}
                    >
                      {categoryWiseTotals[cat].orderItems} / {categoryWiseTotals[cat].availableItems} 
                    </span>
                  </td>


                </tr>
              ))}
              <tr>
                <td className="p-2 border font-sm text-center">Total</td>
                <td className="p-2 border text-center"> {totalApprovedQty}</td>
                <td className="p-2 border text-center"></td>
              </tr>
            </tbody>

          </table>
        </div>
      )}

    </div>
  );
}




// import {
//   Package,
//   CheckCircle2,
//   AlertCircle,
//   Layers3,
// } from "lucide-react";

// export default function TemperedSummaryPanel({
//   totalSSOrderQty,
//   totalApprovedQty,
//   totalProducts,
//   categoryWiseTotals,
// }) {
//   const getShortName = (cat) => {
//     if (cat === "UV TEMPERED") return "UV";
//     if (cat === "TEMPERED MEIBO") return "MEIBO";
//     if (cat === "TEMPERED SOLDIER") return "SOLDIER";
//     if (cat === "NEW SOLDIER TEMPERED") return "NEW SOLDIER";
//     if (cat === "TEMPERED BODYGUARD") return "BODYGUARD";
//     if (cat === "TEMPERED SUPER X") return "SUPER X";

//     return cat;
//   };

//   const categories = Object.keys(
//     categoryWiseTotals || {}
//   );

//   const totalCategoryItems = categories.reduce(
//     (sum, cat) =>
//       sum +
//       Number(
//         categoryWiseTotals?.[cat]?.orderItems || 0
//       ),
//     0
//   );

//   const totalAvailableItems = categories.reduce(
//     (sum, cat) =>
//       sum +
//       Number(
//         categoryWiseTotals?.[cat]?.availableItems || 0
//       ),
//     0
//   );

//   return (
//     <div className="w-full bg-white">

//       {/* =================================================
//           HEADER
//       ================================================= */}

//       <div className="border-b border-gray-100 bg-gray-50 px-3 py-3">

//         <div className="flex items-center justify-between gap-2">

//           <div className="flex min-w-0 items-center gap-2">

//             <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
//               <Layers3 size={15} />
//             </div>

//             <div className="min-w-0">

//               <h2 className="truncate text-xs font-bold text-gray-800">
//                 Tempered Summary
//               </h2>

//               <p className="mt-0.5 text-[9px] text-gray-400">
//                 Category-wise order overview
//               </p>

//             </div>

//           </div>

//           <div className="flex shrink-0 items-center gap-1.5">

//             <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600">
//               {totalProducts}
//             </span>

//             <span className="text-[9px] text-gray-400">
//               Models
//             </span>

//           </div>

//         </div>

//       </div>

//       {/* =================================================
//           QUICK SUMMARY
//       ================================================= */}

//       <div className="grid grid-cols-3 border-b border-gray-100">

//         <div className="border-r border-gray-100 px-2 py-3 text-center">

//           <p className="text-[8px] font-semibold uppercase tracking-wide text-gray-400">
//             SS Qty
//           </p>

//           <p className="mt-1 text-sm font-bold text-gray-800">
//             {totalSSOrderQty}
//           </p>

//         </div>

//         <div className="border-r border-gray-100 px-2 py-3 text-center">

//           <p className="text-[8px] font-semibold uppercase tracking-wide text-gray-400">
//             Approved
//           </p>

//           <p className="mt-1 text-sm font-bold text-blue-600">
//             {totalApprovedQty}
//           </p>

//         </div>

//         <div className="px-2 py-3 text-center">

//           <p className="text-[8px] font-semibold uppercase tracking-wide text-gray-400">
//             Available
//           </p>

//           <p className="mt-1 text-sm font-bold text-green-600">
//             {totalAvailableItems}
//           </p>

//         </div>

//       </div>

//       {/* =================================================
//           CATEGORY LIST
//       ================================================= */}

//       {categories.length > 0 ? (

//         <div className="overflow-x-auto">

//           <table className="w-full border-collapse">

//             <thead>

//               <tr className="border-b border-gray-100 bg-white">

//                 <th className="px-3 py-2 text-left text-[8px] font-bold uppercase tracking-wide text-gray-400">
//                   Category
//                 </th>

//                 <th className="px-2 py-2 text-center text-[8px] font-bold uppercase tracking-wide text-gray-400">
//                   Qty
//                 </th>

//                 <th className="px-3 py-2 text-center text-[8px] font-bold uppercase tracking-wide text-gray-400">
//                   Stock
//                 </th>

//               </tr>

//             </thead>

//             <tbody>

//               {categories.map((cat) => {

//                 const data =
//                   categoryWiseTotals[cat];

//                 const orderItems =
//                   Number(
//                     data?.orderItems || 0
//                   );

//                 const approvedQty =
//                   Number(
//                     data?.approvedQty || 0
//                   );

//                 const availableItems =
//                   Number(
//                     data?.availableItems || 0
//                   );

//                 const allAvailable =
//                   availableItems >=
//                   orderItems;

//                 return (
//                   <tr
//                     key={cat}
//                     className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50"
//                   >

//                     {/* CATEGORY */}

//                     <td className="px-3 py-2.5">

//                       <div className="flex min-w-0 items-center gap-2">

//                         <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gray-100">
//                           <Package
//                             size={11}
//                             className="text-gray-500"
//                           />
//                         </div>

//                         <div className="min-w-0">

//                           <p className="truncate text-[10px] font-bold text-gray-700">
//                             {getShortName(cat)}
//                           </p>

//                           <p className="mt-0.5 text-[8px] text-gray-400">
//                             {orderItems} models
//                           </p>

//                         </div>

//                       </div>

//                     </td>

//                     {/* QUANTITY */}

//                     <td className="px-2 py-2.5 text-center">

//                       <div className="inline-flex items-center gap-1">

//                         <span className="text-[11px] font-bold text-gray-800">
//                           {approvedQty}
//                         </span>

//                         <span className="text-[9px] text-gray-400">
//                           qty
//                         </span>

//                       </div>

//                     </td>

//                     {/* AVAILABILITY */}

//                     <td className="px-3 py-2.5 text-center">

//                       <span
//                         className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[9px] font-bold ${
//                           allAvailable
//                             ? "bg-green-50 text-green-700"
//                             : "bg-red-50 text-red-600"
//                         }`}
//                       >

//                         {allAvailable ? (
//                           <CheckCircle2
//                             size={10}
//                           />
//                         ) : (
//                           <AlertCircle
//                             size={10}
//                           />
//                         )}

//                         {availableItems}/
//                         {orderItems}

//                       </span>

//                     </td>

//                   </tr>
//                 );
//               })}

//             </tbody>

//             {/* =================================================
//                 TOTAL
//             ================================================= */}

//             <tfoot>

//               <tr className="border-t border-gray-200 bg-gray-50">

//                 <td className="px-3 py-2.5">

//                   <span className="text-[9px] font-bold uppercase tracking-wide text-gray-600">
//                     Total
//                   </span>

//                 </td>

//                 <td className="px-2 py-2.5 text-center">

//                   <span className="text-xs font-bold text-gray-900">
//                     {totalApprovedQty}
//                   </span>

//                 </td>

//                 <td className="px-3 py-2.5 text-center">

//                   <span
//                     className={`inline-flex items-center rounded-md px-2 py-1 text-[9px] font-bold ${
//                       totalAvailableItems >=
//                       totalCategoryItems
//                         ? "bg-green-50 text-green-700"
//                         : "bg-red-50 text-red-600"
//                     }`}
//                   >
//                     {totalAvailableItems}/
//                     {totalCategoryItems}
//                   </span>

//                 </td>

//               </tr>

//             </tfoot>

//           </table>

//         </div>

//       ) : (

//         /* =================================================
//             EMPTY STATE
//         ================================================= */

//         <div className="px-4 py-10 text-center">

//           <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
//             <Package
//               size={15}
//               className="text-gray-400"
//             />
//           </div>

//           <p className="text-xs font-semibold text-gray-600">
//             No tempered categories
//           </p>

//           <p className="mt-1 text-[9px] text-gray-400">
//             Category summary will appear here.
//           </p>

//         </div>

//       )}

//     </div>
//   );
// }