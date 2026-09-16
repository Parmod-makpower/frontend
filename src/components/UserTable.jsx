import { FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaKey } from "react-icons/fa";

export default function UserTable({
  user,
  list,
  onEdit,
  onToggleStatus,
  onDelete,
  onChangePassword,
  onChangeStock,
}) {
  return (
    <div className="overflow-x-auto mb-25">
      {/* Desktop Table */}
      <table className=" md:table w-full text-left border min-w-full text-xs text-left text-gray-700">
        <thead className="bg-gray-200 text-gray-900 text-sm font-semibold text-xs text-center">
          <tr className="bg-gray-200">
            <th className="p-2 border">#</th>
            <th className="p-2 border">ID</th>
            {user?.role === "ADMIN" && (<th className="p-2 border">CRM</th>)}
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Party Name</th>
            {user?.role === "ADMIN" && (<th className="p-2 border">Created_By</th>)}
            <th className="p-2 border">Mobile</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Wharehouse</th>
            <th className="p-2 border">Action</th>
            <th className="p-2 border">Action</th>
            {(user?.role === "ADMIN" && <th className="p-2 border">Update</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-xs text-center">
          {list.map((item, index) => (
            <tr key={item.id} className="border-t">
              <td className="p-2 border text-center">{index + 1}</td>
              <td className="p-2 border bg-gray-200 font-bold">{item.user_id}</td>
              {user?.role === "ADMIN" && (<td className="p-2 border">{item.crm_name}</td>)}
              <td className="p-2 border">{item.name}</td>
              <td className="p-2 border bg-yellow-100">{item.party_name}</td>
              {user?.role === "ADMIN" && (<td className="p-2 border">{item.created_by}</td>)}
              <td className="p-2 border">{item.mobile}</td>
              <td className="p-2 border text-center">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${item.is_active
                    ? "bg-green-100 text-green-700 border border-green-400"
                    : "bg-red-100 text-red-700 border border-red-400"
                    }`}
                >
                  {item.is_active ? "Active" : "Inactive"}
                </span>
              </td>

              <td className="p-2 border text-center">
                {user?.role === "ADMIN" || user?.role === "CRM" ? (
                  <select
                    value={item.stock_location}
                    onChange={(e) =>
                      onChangeStock(item.id, e.target.value)
                    }
                    className="
        border px-2 py-1 rounded text-xs
        bg-white cursor-pointer
        focus:outline-none focus:ring-1 focus:ring-blue-500
      "
                  >
                    <option value="DELHI">Delhi</option>
                    <option value="MUMBAI">Mumbai</option>
                  </select>
                ) : (
                  <span className="font-medium text-gray-700">
                    {item.stock_location}
                  </span>
                )}
              </td>


              <td className="p-2 border">
                <button onClick={() => onChangePassword(item)} className="cursor-pointer  bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded ms-3">
                  <FaKey />
                </button>
              </td>

              <td className="p-2 border">
                <button
                  onClick={() => onToggleStatus(item.id, item.is_active)}
                  className={`cursor-pointer ms-3 ${item.is_active ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} text-white px-2 py-1 rounded`}
                >
                  {item.is_active ? <FaToggleOff /> : <FaToggleOn />}
                </button>

              </td>
              {!(user?.role === "CRM" && item.role === "SS") && (
                <td className="p-2 border">
                  <button onClick={() => onEdit(item)} className="cursor-pointer ms-3 bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded">
                    <FaEdit />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

     

    </div>
  );
}


// import {
//   FaEdit,
//   FaToggleOn,
//   FaToggleOff,
//   FaKey,
//   FaUser,
//   FaPhone,
//   FaBuilding,
//   FaUserTie,
// } from "react-icons/fa";

// import { MapPin, ShieldCheck, ShieldX } from "lucide-react";

// export default function UserTable({
//   user,
//   list,
//   onEdit,
//   onToggleStatus,
//   onDelete,
//   onChangePassword,
//   onChangeStock,
// }) {
//   return (
//     <div className="w-full">
//       {/* =====================================================
//           DESKTOP TABLE
//       ===================================================== */}
//       <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
//         {/* TABLE HEADER */}
//         <div className="flex items-center justify-between border-b border-gray-100 bg-white px-3 py-2.5">
//           <div className="flex items-center gap-2">
//             <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
//               <FaUser className="text-[10px]" />
//             </div>

//             <div>
//               <h2 className="text-xs font-bold text-gray-800">
//                 User Management
//               </h2>

//               <p className="text-[8px] text-gray-400">
//                 Manage users, access and stock location
//               </p>
//             </div>
//           </div>

//           <span className="rounded-md bg-blue-50 px-2 py-1 text-[9px] font-bold text-blue-600">
//             {list.length} Users
//           </span>
//         </div>

//         {/* TABLE */}
//         <div className="max-h-[68vh] overflow-auto">
//           <table className="w-full min-w-[1050px] border-collapse">
//             <thead className="sticky top-0 z-20 bg-gray-50">
//               <tr className="border-b border-gray-200">
//                 <th className="w-10 px-2 py-2.5 text-center text-[8px] font-bold uppercase tracking-wide text-gray-400">
//                   #
//                 </th>

//                 <th className="px-3 py-2.5 text-left text-[8px] font-bold uppercase tracking-wide text-gray-400">
//                   User ID
//                 </th>

//                 {user?.role === "ADMIN" && (
//                   <th className="px-3 py-2.5 text-left text-[8px] font-bold uppercase tracking-wide text-gray-400">
//                     CRM
//                   </th>
//                 )}

//                 <th className="px-3 py-2.5 text-left text-[8px] font-bold uppercase tracking-wide text-gray-400">
//                   Name
//                 </th>

//                 <th className="px-3 py-2.5 text-left text-[8px] font-bold uppercase tracking-wide text-gray-400">
//                   Party
//                 </th>

//                 {user?.role === "ADMIN" && (
//                   <th className="px-3 py-2.5 text-left text-[8px] font-bold uppercase tracking-wide text-gray-400">
//                     Created By
//                   </th>
//                 )}

//                 <th className="px-3 py-2.5 text-left text-[8px] font-bold uppercase tracking-wide text-gray-400">
//                   Mobile
//                 </th>

//                 <th className="px-3 py-2.5 text-center text-[8px] font-bold uppercase tracking-wide text-gray-400">
//                   Status
//                 </th>

//                 <th className="px-3 py-2.5 text-center text-[8px] font-bold uppercase tracking-wide text-gray-400">
//                   Stock
//                 </th>

//                 <th className="px-3 py-2.5 text-center text-[8px] font-bold uppercase tracking-wide text-gray-400">
//                   Password
//                 </th>

//                 <th className="px-3 py-2.5 text-center text-[8px] font-bold uppercase tracking-wide text-gray-400">
//                   Status
//                 </th>

//                 {user?.role === "ADMIN" && (
//                   <th className="px-3 py-2.5 text-center text-[8px] font-bold uppercase tracking-wide text-gray-400">
//                     Edit
//                   </th>
//                 )}
//               </tr>
//             </thead>

//             <tbody>
//               {list.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan={user?.role === "ADMIN" ? 12 : 10}
//                     className="px-4 py-14 text-center"
//                   >
//                     <div className="mx-auto flex max-w-xs flex-col items-center">
//                       <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
//                         <FaUser className="text-sm" />
//                       </div>

//                       <p className="text-xs font-bold text-gray-700">
//                         No users found
//                       </p>

//                       <p className="mt-1 text-[9px] text-gray-400">
//                         Try another search or select a different role.
//                       </p>
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 list.map((item, index) => {
//                   const canEdit =
//                     !(user?.role === "CRM" && item.role === "SS");

//                   return (
//                     <tr
//                       key={item.id}
//                       className="group border-b border-gray-100 bg-white transition-all duration-200 hover:bg-blue-50/30"
//                     >
//                       {/* # */}
//                       <td className="px-2 py-2.5 text-center text-[9px] text-gray-400">
//                         {index + 1}
//                       </td>

//                       {/* USER ID */}
//                       <td className="px-3 py-2.5">
//                         <span className="inline-flex rounded-md bg-gray-100 px-2 py-1 text-[9px] font-bold text-gray-700 transition-all duration-200 group-hover:bg-blue-50 group-hover:text-blue-600">
//                           {item.user_id || "-"}
//                         </span>
//                       </td>

//                       {/* CRM */}
//                       {user?.role === "ADMIN" && (
//                         <td className="px-3 py-2.5">
//                           <span className="text-[9px] font-medium text-gray-600">
//                             {item.crm_name || "-"}
//                           </span>
//                         </td>
//                       )}

//                       {/* NAME */}
//                       <td className="max-w-[150px] px-3 py-2.5">
//                         <div className="flex min-w-0 items-center gap-2">
//                           <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
//                             <FaUser className="text-[9px]" />
//                           </div>

//                           <div className="min-w-0">
//                             <p className="truncate text-[10px] font-semibold text-gray-800">
//                               {item.name || "-"}
//                             </p>

//                             <p className="mt-0.5 text-[8px] text-gray-400">
//                               {item.role || "-"}
//                             </p>
//                           </div>
//                         </div>
//                       </td>

//                       {/* PARTY */}
//                       <td className="max-w-[210px] px-3 py-2.5">
//                         <div className="flex min-w-0 items-center gap-2">
//                           <FaBuilding className="shrink-0 text-[9px] text-gray-400" />

//                           <p className="truncate text-[10px] font-semibold text-gray-700">
//                             {item.party_name || "-"}
//                           </p>
//                         </div>
//                       </td>

//                       {/* CREATED BY */}
//                       {user?.role === "ADMIN" && (
//                         <td className="max-w-[130px] px-3 py-2.5">
//                           <p className="truncate text-[9px] text-gray-500">
//                             {item.created_by || "-"}
//                           </p>
//                         </td>
//                       )}

//                       {/* MOBILE */}
//                       <td className="px-3 py-2.5">
//                         <div className="flex items-center gap-1.5">
//                           <FaPhone className="text-[8px] text-gray-400" />

//                           <span className="text-[9px] font-medium text-gray-600">
//                             {item.mobile || "-"}
//                           </span>
//                         </div>
//                       </td>

//                       {/* STATUS */}
//                       <td className="px-3 py-2.5 text-center">
//                         {item.is_active ? (
//                           <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-[9px] font-bold text-emerald-700 shadow-sm">
//                             <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
//                             Active
//                           </span>
//                         ) : (
//                           <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-[9px] font-bold text-red-700 shadow-sm">
//                             <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
//                             Inactive
//                           </span>
//                         )}
//                       </td>

//                       {/* STOCK */}
//                       <td className="px-3 py-2.5 text-center">
//                         {user?.role === "ADMIN" ||
//                         user?.role === "CRM" ? (
//                           <select
//                             value={item.stock_location || "DELHI"}
//                             onChange={(e) =>
//                               onChangeStock(
//                                 item.id,
//                                 e.target.value
//                               )
//                             }
//                             className="h-8 rounded-md border border-gray-200 bg-gray-50 px-2 text-[9px] font-semibold text-gray-700 outline-none transition-all duration-200 hover:border-blue-300 hover:bg-white focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50"
//                           >
//                             <option value="DELHI">
//                               Delhi
//                             </option>

//                             <option value="MUMBAI">
//                               Mumbai
//                             </option>
//                           </select>
//                         ) : (
//                           <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-[9px] font-bold text-gray-600">
//                             <MapPin size={9} />
//                             {item.stock_location || "-"}
//                           </span>
//                         )}
//                       </td>

//                       {/* PASSWORD */}
//                       <td className="px-3 py-2.5 text-center">
//                         <button
//                           type="button"
//                           onClick={() =>
//                             onChangePassword(item)
//                           }
//                           title="Change Password"
//                           className="group/key inline-flex h-8 w-8 items-center justify-center rounded-lg border border-purple-200 bg-purple-100 text-purple-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300 hover:bg-purple-600 hover:text-white hover:shadow-md active:translate-y-0 active:scale-95"
//                         >
//                           <FaKey className="text-[11px] transition-transform duration-200 group-hover/key:rotate-[-10deg]" />
//                         </button>
//                       </td>

//                       {/* TOGGLE */}
//                       <td className="px-3 py-2.5 text-center">
//                         <button
//                           type="button"
//                           onClick={() =>
//                             onToggleStatus(
//                               item.id,
//                               item.is_active
//                             )
//                           }
//                           title={
//                             item.is_active
//                               ? "Deactivate User"
//                               : "Activate User"
//                           }
//                           className={`group/status inline-flex h-8 min-w-[82px] items-center justify-center gap-1.5 rounded-lg border px-2.5 text-[9px] font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${
//                             item.is_active
//                               ? "border-red-200 bg-red-100 text-red-700 hover:border-red-300 hover:bg-red-600 hover:text-white hover:shadow-md"
//                               : "border-emerald-200 bg-emerald-100 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-600 hover:text-white hover:shadow-md"
//                           }`}
//                         >
//                           {item.is_active ? (
//                             <>
//                               <FaToggleOff className="text-sm" />
//                               Deactivate
//                             </>
//                           ) : (
//                             <>
//                               <FaToggleOn className="text-sm" />
//                               Activate
//                             </>
//                           )}
//                         </button>
//                       </td>

//                       {/* EDIT */}
//                       {user?.role === "ADMIN" && (
//                         <td className="px-3 py-2.5 text-center">
//                           {canEdit ? (
//                             <button
//                               type="button"
//                               onClick={() => onEdit(item)}
//                               title="Edit User"
//                               className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-100 text-amber-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-500 hover:text-white hover:shadow-md active:translate-y-0 active:scale-95"
//                             >
//                               <FaEdit className="text-[11px]" />
//                             </button>
//                           ) : (
//                             <span className="text-[9px] text-gray-300">
//                               —
//                             </span>
//                           )}
//                         </td>
//                       )}
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* =====================================================
//           MOBILE CARDS
//       ===================================================== */}
//       <div className="space-y-2 md:hidden">
//         {list.length === 0 ? (
//           <div className="rounded-xl border border-gray-200 bg-white px-4 py-12 text-center shadow-sm">
//             <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
//               <FaUser className="text-sm" />
//             </div>

//             <p className="text-xs font-bold text-gray-700">
//               No users found
//             </p>

//             <p className="mt-1 text-[9px] text-gray-400">
//               Try another search or role.
//             </p>
//           </div>
//         ) : (
//           list.map((item, index) => {
//             const canEdit =
//               !(user?.role === "CRM" && item.role === "SS");

//             return (
//               <div
//                 key={item.id}
//                 className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 active:scale-[0.99]"
//               >
//                 {/* CARD TOP */}
//                 <div className="flex items-start justify-between gap-2 border-b border-gray-100 px-3 py-3">
//                   <div className="flex min-w-0 items-center gap-2.5">
//                     <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
//                       <FaUser className="text-xs" />
//                     </div>

//                     <div className="min-w-0">
//                       <div className="flex items-center gap-1.5">
//                         <span className="text-[8px] text-gray-400">
//                           #{index + 1}
//                         </span>

//                         <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[8px] font-bold text-gray-600">
//                           {item.user_id || "-"}
//                         </span>
//                       </div>

//                       <p className="mt-1 truncate text-[11px] font-bold text-gray-800">
//                         {item.name || "-"}
//                       </p>

//                       <p className="mt-0.5 truncate text-[9px] text-gray-400">
//                         {item.role || "-"}
//                       </p>
//                     </div>
//                   </div>

//                   {item.is_active ? (
//                     <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-2 py-1 text-[8px] font-bold text-emerald-700">
//                       <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
//                       Active
//                     </span>
//                   ) : (
//                     <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-red-200 bg-red-100 px-2 py-1 text-[8px] font-bold text-red-700">
//                       <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
//                       Inactive
//                     </span>
//                   )}
//                 </div>

//                 {/* DETAILS */}
//                 <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-3 py-3">
//                   <div className="min-w-0">
//                     <p className="text-[7px] font-bold uppercase tracking-wide text-gray-400">
//                       Party
//                     </p>

//                     <p className="mt-0.5 truncate text-[9px] font-semibold text-gray-700">
//                       {item.party_name || "-"}
//                     </p>
//                   </div>

//                   <div>
//                     <p className="text-[7px] font-bold uppercase tracking-wide text-gray-400">
//                       Mobile
//                     </p>

//                     <p className="mt-0.5 text-[9px] font-medium text-gray-600">
//                       {item.mobile || "-"}
//                     </p>
//                   </div>

//                   {user?.role === "ADMIN" && (
//                     <div>
//                       <p className="text-[7px] font-bold uppercase tracking-wide text-gray-400">
//                         CRM
//                       </p>

//                       <p className="mt-0.5 truncate text-[9px] text-gray-600">
//                         {item.crm_name || "-"}
//                       </p>
//                     </div>
//                   )}

//                   {user?.role === "ADMIN" && (
//                     <div>
//                       <p className="text-[7px] font-bold uppercase tracking-wide text-gray-400">
//                         Created By
//                       </p>

//                       <p className="mt-0.5 truncate text-[9px] text-gray-600">
//                         {item.created_by || "-"}
//                       </p>
//                     </div>
//                   )}

//                   <div>
//                     <p className="text-[7px] font-bold uppercase tracking-wide text-gray-400">
//                       Stock Location
//                     </p>

//                     {user?.role === "ADMIN" ||
//                     user?.role === "CRM" ? (
//                       <select
//                         value={item.stock_location || "DELHI"}
//                         onChange={(e) =>
//                           onChangeStock(
//                             item.id,
//                             e.target.value
//                           )
//                         }
//                         className="mt-1 h-8 w-full rounded-md border border-gray-200 bg-gray-50 px-2 text-[9px] font-semibold text-gray-700 outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50"
//                       >
//                         <option value="DELHI">
//                           Delhi
//                         </option>

//                         <option value="MUMBAI">
//                           Mumbai
//                         </option>
//                       </select>
//                     ) : (
//                       <p className="mt-0.5 text-[9px] font-semibold text-gray-600">
//                         {item.stock_location || "-"}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 {/* ACTIONS */}
//                 <div className="grid grid-cols-2 gap-2 border-t border-gray-100 bg-gray-50 px-3 py-2.5">
//                   <button
//                     type="button"
//                     onClick={() =>
//                       onChangePassword(item)
//                     }
//                     className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-purple-200 bg-purple-100 text-[9px] font-bold text-purple-700 transition-all duration-200 hover:bg-purple-600 hover:text-white active:scale-95"
//                   >
//                     <FaKey className="text-[10px]" />
//                     Change Password
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() =>
//                       onToggleStatus(
//                         item.id,
//                         item.is_active
//                       )
//                     }
//                     className={`flex h-9 items-center justify-center gap-1.5 rounded-lg border text-[9px] font-bold transition-all duration-200 active:scale-95 ${
//                       item.is_active
//                         ? "border-red-200 bg-red-100 text-red-700 hover:bg-red-600 hover:text-white"
//                         : "border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white"
//                     }`}
//                   >
//                     {item.is_active ? (
//                       <>
//                         <FaToggleOff className="text-sm" />
//                         Deactivate
//                       </>
//                     ) : (
//                       <>
//                         <FaToggleOn className="text-sm" />
//                         Activate
//                       </>
//                     )}
//                   </button>

//                   {user?.role === "ADMIN" && canEdit && (
//                     <button
//                       type="button"
//                       onClick={() => onEdit(item)}
//                       className="col-span-2 flex h-9 items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-100 text-[9px] font-bold text-amber-700 transition-all duration-200 hover:bg-amber-500 hover:text-white active:scale-95"
//                     >
//                       <FaEdit className="text-[10px]" />
//                       Edit User
//                     </button>
//                   )}
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// }