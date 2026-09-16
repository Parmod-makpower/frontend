import { FaFilter } from "react-icons/fa";
import PartySearchInput from "../PartySearchInput";

export default function VerifiedOrdersFilter({
    open,
    setOpen,
    filters,
    setFilters,
    onApply,
    inline = false,
}) {
    const handleChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleClear = () => {
        const cleared = {
            q: "",
            party: "",
            fromDate: "",
            toDate: "",
            punched: filters.punched, // preserve
        };

        setFilters(cleared);
        onApply(cleared); // 🔥 direct apply
    };

    return (
        <div
            className={`${inline
                ? "bg-white border shadow p-1"
                : `fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-lg z-50 transform ${open ? "translate-x-0" : "translate-x-full"
                } transition-transform`
                }`}
        >
            {!inline && (
                <div className="flex justify-between items-center p-3 border-b">
                    <h2 className="font-semibold flex items-center gap-2">
                        Filters
                    </h2>
                    <button onClick={() => setOpen(false)}>✕</button>
                </div>
            )}

            <div className="p-3 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                    <h2 className="font-semibold text-sm flex items-center gap-1 ">
                        <FaFilter /> Filters
                    </h2>

                </div>
                {/* 🔎 Order */}
                <label className="text-xs">Order ID</label>
                <input
                    value={filters.q}
                    onChange={(e) => handleChange("q", e.target.value)}
                    placeholder=" Order ID / Code"
                    className="w-full border px-2 py-1 text-sm rounded"
                />


                {/* 🏢 Party */}
                <label className="text-xs">Party name</label>

                <PartySearchInput
                    value={filters.party}
                    setValue={(val) => handleChange("party", val)}
                    onSelect={(user) => {
                        handleChange("party", user.party_name); // 🔥 filter apply
                    }}
                    placeholder="Search Party"
                />

                {/* 📅 Date */}
                <label className="text-xs">From Date</label>
                <input
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) => handleChange("fromDate", e.target.value)}
                    className="w-full border px-2 py-1 text-sm rounded"
                />

                <label className="text-xs">To Date</label>
                <input
                    type="date"
                    value={filters.toDate}
                    onChange={(e) => handleChange("toDate", e.target.value)}
                    className="w-full border px-2 py-1 text-sm rounded"
                />

                <div className="pt-4 border-t flex gap-2">
                    <button
                        onClick={handleClear}
                        className="w-full bg-gray-500 text-white text-sm py-1 rounded"
                    >
                        Clear
                    </button>

                    <button
                        onClick={() => {
                            onApply();
                            setOpen(false);
                        }}
                        className="w-full bg-red-500 text-white text-sm py-1 rounded"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}


// import { FaFilter, FaSearch, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
// import PartySearchInput from "../PartySearchInput";

// export default function VerifiedOrdersFilter({
//   open,
//   setOpen,
//   filters,
//   setFilters,
//   onApply,
//   inline = false,
// }) {
//   const handleChange = (key, value) => {
//     setFilters((prev) => ({
//       ...prev,
//       [key]: value,
//     }));
//   };

//   const handleClear = () => {
//     const cleared = {
//       q: "",
//       party: "",
//       fromDate: "",
//       toDate: "",
//       punched: filters.punched,
//     };

//     setFilters(cleared);
//     onApply(cleared);

//     if (!inline) {
//       setOpen(false);
//     }
//   };

//   const handleApply = () => {
//     onApply(filters);

//     if (!inline) {
//       setOpen(false);
//     }
//   };

//   const hasFilters =
//     Boolean(filters.q) ||
//     Boolean(filters.party) ||
//     Boolean(filters.fromDate) ||
//     Boolean(filters.toDate) ||
//     filters.punched === true;

//   // =========================================================
//   // DESKTOP INLINE FILTER
//   // =========================================================

//   if (inline) {
//     return (
//       <div className="w-full px-4 py-4 sm:px-5 lg:px-6">
//         {/* HEADER */}
//         <div className="mb-3 flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
//               <FaFilter size={11} />
//             </div>

//             <div>
//               <h3 className="text-[11px] font-bold text-gray-800">
//                 Filter Orders
//               </h3>

//               <p className="text-[8px] text-gray-400">
//                 Refine your verified order history
//               </p>
//             </div>
//           </div>

//           {hasFilters && (
//             <span className="animate-[pulse_2s_ease-in-out_infinite] rounded-full bg-blue-50 px-2 py-1 text-[8px] font-bold text-blue-600">
//               Filters active
//             </span>
//           )}
//         </div>

//         {/* FILTER GRID */}
//         <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-5">
//           {/* ORDER */}
//           <div className="min-w-0">
//             <label className="mb-1 block text-[8px] font-bold uppercase tracking-wide text-gray-400">
//               Order ID / Code
//             </label>

//             <div className="relative">
//               <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] text-gray-400" />

//               <input
//                 value={filters.q}
//                 onChange={(e) =>
//                   handleChange("q", e.target.value)
//                 }
//                 placeholder="Search order..."
//                 className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-8 pr-3 text-[10px] text-gray-800 outline-none transition-all duration-200 hover:border-gray-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
//               />
//             </div>
//           </div>

//           {/* PARTY */}
//           <div className="min-w-0">
//             <label className="mb-1 block text-[8px] font-bold uppercase tracking-wide text-gray-400">
//               Party Name
//             </label>

//             <PartySearchInput
//               value={filters.party}
//               setValue={(val) =>
//                 handleChange("party", val)
//               }
//               onSelect={(user) => {
//                 handleChange(
//                   "party",
//                   user.party_name
//                 );
//               }}
//               placeholder="Search party..."
//             />
//           </div>

//           {/* FROM */}
//           <div className="min-w-0">
//             <label className="mb-1 block text-[8px] font-bold uppercase tracking-wide text-gray-400">
//               From Date
//             </label>

//             <div className="relative">
//               <FaCalendarAlt className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[9px] text-gray-400" />

//               <input
//                 type="date"
//                 value={filters.fromDate}
//                 onChange={(e) =>
//                   handleChange(
//                     "fromDate",
//                     e.target.value
//                   )
//                 }
//                 className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-8 pr-2 text-[10px] text-gray-700 outline-none transition-all duration-200 hover:border-gray-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
//               />
//             </div>
//           </div>

//           {/* TO */}
//           <div className="min-w-0">
//             <label className="mb-1 block text-[8px] font-bold uppercase tracking-wide text-gray-400">
//               To Date
//             </label>

//             <div className="relative">
//               <FaCalendarAlt className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[9px] text-gray-400" />

//               <input
//                 type="date"
//                 value={filters.toDate}
//                 onChange={(e) =>
//                   handleChange(
//                     "toDate",
//                     e.target.value
//                   )
//                 }
//                 className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-8 pr-2 text-[10px] text-gray-700 outline-none transition-all duration-200 hover:border-gray-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
//               />
//             </div>
//           </div>

//           {/* ACTIONS */}
//           <div className="col-span-2 flex items-end gap-2 lg:col-span-1">
//             {/* PUNCHED */}
//             <button
//               type="button"
//               onClick={() =>
//                 handleChange(
//                   "punched",
//                   !filters.punched
//                 )
//               }
//               className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border px-2 text-[9px] font-semibold transition-all duration-200 active:scale-95 ${
//                 filters.punched
//                   ? "border-green-200 bg-green-50 text-green-700 shadow-sm"
//                   : "border-gray-200 bg-white text-gray-500 hover:border-green-200 hover:bg-green-50 hover:text-green-700"
//               }`}
//             >
//               <FaCheckCircle size={9} />

//               {filters.punched
//                 ? "Punched"
//                 : "All Status"}
//             </button>

//             {/* CLEAR */}
//             <button
//               type="button"
//               onClick={handleClear}
//               className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-[9px] font-semibold text-gray-500 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95"
//             >
//               Clear
//             </button>

//             {/* APPLY */}
//             <button
//               type="button"
//               onClick={handleApply}
//               className="h-9 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-[9px] font-bold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 active:translate-y-0 active:scale-95"
//             >
//               Apply
//             </button>
//           </div>
//         </div>

//         {/* SHORTCUT */}
//         <div className="mt-2 flex items-center gap-2 text-[8px] text-gray-400">
//           <span className="rounded bg-white px-1.5 py-0.5 font-mono shadow-sm ring-1 ring-gray-200">
//             Enter
//           </span>
//           Apply filters
//           <span className="mx-1 text-gray-200">•</span>
//           <span className="rounded bg-white px-1.5 py-0.5 font-mono shadow-sm ring-1 ring-gray-200">
//             Clear
//           </span>
//           Reset fields
//         </div>
//       </div>
//     );
//   }

//   // =========================================================
//   // MOBILE DRAWER
//   // =========================================================

//   return (
//     <>
//       {/* BACKDROP */}
//       <div
//         onClick={() => setOpen(false)}
//         className={`fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-[2px] transition-all duration-300 md:hidden ${
//           open
//             ? "pointer-events-auto opacity-100"
//             : "pointer-events-none opacity-0"
//         }`}
//       />

//       {/* DRAWER */}
//       <div
//         className={`fixed right-0 top-0 z-[70] flex h-full w-[88%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden ${
//           open
//             ? "translate-x-0"
//             : "translate-x-full"
//         }`}
//       >
//         {/* DRAWER HEADER */}
//         <div className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-blue-600 to-indigo-700 px-4 py-4 text-white">
//           <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-xl" />

//           <div className="relative flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
//                 <FaFilter size={13} />
//               </div>

//               <div>
//                 <h2 className="text-sm font-bold">
//                   Filters
//                 </h2>

//                 <p className="mt-0.5 text-[9px] text-blue-100">
//                   Find orders quickly
//                 </p>
//               </div>
//             </div>

//             <button
//               type="button"
//               onClick={() => setOpen(false)}
//               className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition-all duration-200 hover:bg-white/20 active:scale-90"
//             >
//               ✕
//             </button>
//           </div>
//         </div>

//         {/* DRAWER BODY */}
//         <div className="flex-1 overflow-y-auto p-4">
//           <div className="space-y-4">
//             {/* ORDER */}
//             <div>
//               <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wider text-gray-400">
//                 Order ID / Code
//               </label>

//               <div className="relative">
//                 <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400" />

//                 <input
//                   autoFocus={open}
//                   value={filters.q}
//                   onChange={(e) =>
//                     handleChange(
//                       "q",
//                       e.target.value
//                     )
//                   }
//                   placeholder="Search order..."
//                   className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-xs text-gray-800 outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
//                 />
//               </div>
//             </div>

//             {/* PARTY */}
//             <div>
//               <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wider text-gray-400">
//                 Party Name
//               </label>

//               <PartySearchInput
//                 value={filters.party}
//                 setValue={(val) =>
//                   handleChange(
//                     "party",
//                     val
//                   )
//                 }
//                 onSelect={(user) => {
//                   handleChange(
//                     "party",
//                     user.party_name
//                   );
//                 }}
//                 placeholder="Search party..."
//               />
//             </div>

//             {/* DATES */}
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wider text-gray-400">
//                   From Date
//                 </label>

//                 <input
//                   type="date"
//                   value={filters.fromDate}
//                   onChange={(e) =>
//                     handleChange(
//                       "fromDate",
//                       e.target.value
//                     )
//                   }
//                   className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-2 text-[10px] text-gray-700 outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
//                 />
//               </div>

//               <div>
//                 <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wider text-gray-400">
//                   To Date
//                 </label>

//                 <input
//                   type="date"
//                   value={filters.toDate}
//                   onChange={(e) =>
//                     handleChange(
//                       "toDate",
//                       e.target.value
//                     )
//                   }
//                   className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-2 text-[10px] text-gray-700 outline-none transition-all duration-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
//                 />
//               </div>
//             </div>

//             {/* PUNCHED */}
//             <button
//               type="button"
//               onClick={() =>
//                 handleChange(
//                   "punched",
//                   !filters.punched
//                 )
//               }
//               className={`flex w-full items-center justify-between rounded-xl border p-3 transition-all duration-200 active:scale-[0.98] ${
//                 filters.punched
//                   ? "border-green-200 bg-green-50"
//                   : "border-gray-200 bg-gray-50 hover:bg-white"
//               }`}
//             >
//               <div className="flex items-center gap-3">
//                 <div
//                   className={`flex h-8 w-8 items-center justify-center rounded-lg ${
//                     filters.punched
//                       ? "bg-green-100 text-green-600"
//                       : "bg-white text-gray-400"
//                   }`}
//                 >
//                   <FaCheckCircle size={13} />
//                 </div>

//                 <div className="text-left">
//                   <p className="text-[10px] font-bold text-gray-700">
//                     Punched Orders Only
//                   </p>

//                   <p className="mt-0.5 text-[8px] text-gray-400">
//                     Show only punched orders
//                   </p>
//                 </div>
//               </div>

//               <div
//                 className={`relative h-5 w-9 rounded-full transition-all duration-200 ${
//                   filters.punched
//                     ? "bg-green-500"
//                     : "bg-gray-300"
//                 }`}
//               >
//                 <span
//                   className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
//                     filters.punched
//                       ? "translate-x-4"
//                       : "translate-x-0.5"
//                   }`}
//                 />
//               </div>
//             </button>
//           </div>
//         </div>

//         {/* DRAWER FOOTER */}
//         <div className="border-t border-gray-100 bg-gray-50 p-3">
//           <div className="flex gap-2">
//             <button
//               type="button"
//               onClick={handleClear}
//               className="h-11 flex-1 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-500 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95"
//             >
//               Clear
//             </button>

//             <button
//               type="button"
//               onClick={handleApply}
//               className="h-11 flex-[1.5] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-95"
//             >
//               Apply Filters
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }