// import {
//   FaSearch,
//   FaSyncAlt,
//   FaFileExcel,
// } from "react-icons/fa";

// export default function HROrderFilter({
//   search,
//   setSearch,
//   status,
//   setStatus,
//   crm,
//   setCrm,
//   crmList = [],
//   onRefresh,
//   isFetching,
// }) {
//   return (
//     <div
//       className="
//         bg-white
//         border
//         border-gray-200
//         rounded-lg
//         shadow-sm
//         p-4
//         w-full
//       "
//     >
//       <h3
//         className="
//           text-sm
//           font-semibold
//           text-gray-700
//           mb-4
//         "
//       >
//         Filter Orders
//       </h3>

//       {/* Search */}

//       <div className="relative mb-3">
//         <FaSearch
//           className="
//             absolute
//             left-3
//             top-1/2
//             -translate-y-1/2
//             text-gray-400
//             text-xs
//           "
//         />

//         <input
//           type="text"
//           placeholder="Search Order / Party / CRM"
//           value={search}
//           onChange={(e) =>
//             setSearch(e.target.value)
//           }
//           className="
//             w-full
//             h-9
//             border
//             rounded-md
//             pl-8
//             pr-2
//             text-xs
//           "
//         />
//       </div>

//       {/* Status */}

//       <select
//         value={status}
//         onChange={(e) =>
//           setStatus(e.target.value)
//         }
//         className="
//           w-full
//           h-9
//           mb-3
//           text-xs
//           border
//           rounded-md
//           px-2
//         "
//       >
//         <option value="ALL">All Status</option>
//         <option value="PENDING">Pending</option>
//         <option value="HOLD">Hold</option>
//       </select>

//       {/* CRM */}

//       <select
//         value={crm}
//         onChange={(e) =>
//           setCrm(e.target.value)
//         }
//         className="
//           w-full
//           h-9
//           mb-4
//           text-xs
//           border
//           rounded-md
//           px-2
//         "
//       >
//         <option value="ALL">
//           All CRM
//         </option>

//         {crmList.length > 0 &&
//           crmList.map((crmName) => (
//             <option
//               key={crmName}
//               value={crmName}
//             >
//               {crmName}
//             </option>
//           ))}
//       </select>

//       {/* Buttons */}

//       <div className="grid grid-cols-2 gap-2">
//         <button
//           onClick={onRefresh}
//           disabled={isFetching}
//           className="
//             h-9
//             bg-blue-600
//             text-white
//             rounded-md
//             text-xs
//             flex
//             items-center
//             justify-center
//             gap-1
//           "
//         >
//           <FaSyncAlt
//             className={
//               isFetching
//                 ? "animate-spin"
//                 : ""
//             }
//           />

//           Refresh
//         </button>

//         <button
//           className="
//             h-9
//             border
//             rounded-md
//             text-xs
//             flex
//             items-center
//             justify-center
//             gap-1
//           "
//         >
//           <FaFileExcel className="text-green-600" />
//           Export
//         </button>
//       </div>
//     </div>
//   );
// }



// import {
//   FaSearch,
//   FaSyncAlt,
//   FaFileExcel,
//   FaTimes,
//   FaFilter,
// } from "react-icons/fa";

// export default function HROrderFilter({
//   search,
//   setSearch,
//   status,
//   setStatus,
//   crm,
//   setCrm,
//   crmList = [],
//   onRefresh,
//   isFetching,
// }) {
//   const hasFilters =
//     search.trim() !== "" ||
//     status !== "ALL" ||
//     crm !== "ALL";

//   const clearAll = () => {
//     setSearch("");
//     setStatus("ALL");
//     setCrm("ALL");
//   };

//   return (
//     <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.05)]">

//       {/* =====================================================
//           FILTER HEADER
//       ===================================================== */}

//       <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">

//         <div className="flex items-center gap-2.5">

//           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
//             <FaFilter size={12} />
//           </div>

//           <div>
//             <p className="text-xs font-bold text-slate-800">
//               Order Filters
//             </p>

//             <p className="text-[9px] text-slate-400">
//               Find and organize orders quickly
//             </p>
//           </div>

//         </div>

//         {hasFilters && (
//           <button
//             type="button"
//             onClick={clearAll}
//             className="
//               inline-flex
//               w-fit
//               items-center
//               gap-1.5
//               rounded-lg
//               px-2.5
//               py-1.5
//               text-[10px]
//               font-bold
//               text-slate-400
//               transition-all
//               hover:bg-red-50
//               hover:text-red-500
//             "
//           >
//             <FaTimes size={8} />
//             Clear all
//           </button>
//         )}

//       </div>

//       {/* =====================================================
//           FILTER CONTROLS
//       ===================================================== */}

//       <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[minmax(280px,1.8fr)_minmax(180px,0.8fr)_minmax(180px,0.8fr)_auto_auto]">

//         {/* SEARCH */}

//         <div className="relative">

//           <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
//             Search orders
//           </label>

//           <div className="relative">

//             <FaSearch
//               size={11}
//               className="
//                 pointer-events-none
//                 absolute
//                 left-3.5
//                 top-1/2
//                 -translate-y-1/2
//                 text-slate-400
//               "
//             />

//             <input
//               type="text"
//               value={search}
//               onChange={(e) =>
//                 setSearch(e.target.value)
//               }
//               placeholder="Order ID, party or CRM..."
//               className="
//                 h-10
//                 w-full
//                 rounded-xl
//                 border
//                 border-slate-200
//                 bg-slate-50/70
//                 pl-9
//                 pr-3
//                 text-xs
//                 font-medium
//                 text-slate-700
//                 outline-none
//                 transition-all
//                 placeholder:text-slate-400
//                 hover:border-slate-300
//                 focus:border-blue-400
//                 focus:bg-white
//                 focus:ring-4
//                 focus:ring-blue-50
//               "
//             />

//           </div>
//         </div>

//         {/* STATUS */}

//         <div>
//           <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
//             Status
//           </label>

//           <div className="grid h-10 grid-cols-3 rounded-xl border border-slate-200 bg-slate-50/70 p-1">

//             {[
//               {
//                 value: "ALL",
//                 label: "All",
//               },
//               {
//                 value: "PENDING",
//                 label: "Pending",
//               },
//               {
//                 value: "HOLD",
//                 label: "Hold",
//               },
//             ].map((item) => {
//               const active =
//                 status === item.value;

//               return (
//                 <button
//                   key={item.value}
//                   type="button"
//                   onClick={() =>
//                     setStatus(item.value)
//                   }
//                   className={`
//                     rounded-lg
//                     text-[10px]
//                     font-bold
//                     transition-all
//                     ${
//                       active
//                         ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
//                         : "text-slate-400 hover:text-slate-700"
//                     }
//                   `}
//                 >
//                   {item.label}
//                 </button>
//               );
//             })}

//           </div>
//         </div>

//         {/* CRM */}

//         <div>
//           <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
//             CRM
//           </label>

//           <div className="relative">

//             <select
//               value={crm}
//               onChange={(e) =>
//                 setCrm(e.target.value)
//               }
//               className="
//                 h-10
//                 w-full
//                 appearance-none
//                 rounded-xl
//                 border
//                 border-slate-200
//                 bg-slate-50/70
//                 px-3
//                 pr-8
//                 text-xs
//                 font-semibold
//                 text-slate-700
//                 outline-none
//                 transition-all
//                 hover:border-slate-300
//                 focus:border-blue-400
//                 focus:bg-white
//                 focus:ring-4
//                 focus:ring-blue-50
//               "
//             >
//               <option value="ALL">
//                 All CRM
//               </option>

//               {crmList.map((crmName) => (
//                 <option
//                   key={crmName}
//                   value={crmName}
//                 >
//                   {crmName}
//                 </option>
//               ))}
//             </select>

//             <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-slate-400">
//               ▼
//             </span>

//           </div>
//         </div>

//         {/* REFRESH */}

//         <div className="flex flex-col justify-end">

//           <label className="mb-1.5 hidden text-[9px] font-bold uppercase tracking-[0.1em] text-transparent sm:block">
//             Action
//           </label>

//           <button
//             type="button"
//             onClick={onRefresh}
//             disabled={isFetching}
//             className="
//               flex
//               h-10
//               items-center
//               justify-center
//               gap-2
//               rounded-xl
//               bg-blue-600
//               px-5
//               text-xs
//               font-bold
//               text-white
//               shadow-[0_6px_16px_rgba(37,99,235,0.18)]
//               transition-all
//               hover:-translate-y-0.5
//               hover:bg-blue-700
//               hover:shadow-[0_9px_22px_rgba(37,99,235,0.24)]
//               active:translate-y-0
//               disabled:cursor-not-allowed
//               disabled:opacity-60
//             "
//           >
//             <FaSyncAlt
//               size={10}
//               className={
//                 isFetching
//                   ? "animate-spin"
//                   : ""
//               }
//             />

//             Refresh
//           </button>

//         </div>

//         {/* EXPORT */}

//         <div className="flex flex-col justify-end">

//           <label className="mb-1.5 hidden text-[9px] font-bold uppercase tracking-[0.1em] text-transparent sm:block">
//             Action
//           </label>

//           <button
//             type="button"
//             className="
//               flex
//               h-10
//               items-center
//               justify-center
//               gap-2
//               rounded-xl
//               border
//               border-slate-200
//               bg-white
//               px-5
//               text-xs
//               font-bold
//               text-slate-600
//               transition-all
//               hover:border-emerald-200
//               hover:bg-emerald-50
//               hover:text-emerald-600
//               active:scale-[0.98]
//             "
//           >
//             <FaFileExcel
//               size={11}
//               className="text-emerald-600"
//             />

//             Export
//           </button>

//         </div>

//       </div>

//       {/* =====================================================
//           ACTIVE FILTER CHIPS
//       ===================================================== */}

//       {hasFilters && (
//         <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 sm:px-5">

//           <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
//             Active:
//           </span>

//           {search.trim() && (
//             <span className="rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-[9px] font-bold text-blue-600">
//               Search: {search}
//             </span>
//           )}

//           {status !== "ALL" && (
//             <span className="rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-700">
//               Status: {status}
//             </span>
//           )}

//           {crm !== "ALL" && (
//             <span className="rounded-lg border border-purple-100 bg-purple-50 px-2.5 py-1 text-[9px] font-bold text-purple-600">
//               CRM: {crm}
//             </span>
//           )}

//         </div>
//       )}

//     </div>
//   );
// }

import {
  FaSearch,
  FaSyncAlt,
  FaFileExcel,
  FaTimes,
} from "react-icons/fa";

export default function HROrderFilter({
  search,
  setSearch,
  status,
  setStatus,
  crm,
  setCrm,
  crmList = [],
  onRefresh,
  isFetching,
}) {
  const hasFilters =
    search.trim() !== "" ||
    status !== "ALL" ||
    crm !== "ALL";

  const clearAll = () => {
    setSearch("");
    setStatus("ALL");
    setCrm("ALL");
  };

  return (
    <div className="
      overflow-hidden
      rounded-2xl
      border
      border-slate-200
      bg-white
      shadow-[0_3px_16px_rgba(15,23,42,0.04)]
    ">

      {/* =====================================================
          FILTER CONTROLS
      ===================================================== */}

      <div className="
        grid
        gap-2
        p-2.5
        sm:grid-cols-2
        lg:grid-cols-[minmax(260px,1.7fr)_minmax(210px,1fr)_minmax(180px,.9fr)_auto_auto_auto]
      ">

        {/* SEARCH */}

        <div className="relative">

          <FaSearch
            size={10}
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search order, party or CRM..."
            className="
              h-9
              w-full
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              pl-8
              pr-3
              text-[10px]
              font-semibold
              text-slate-700
              outline-none
              transition-all
              placeholder:text-slate-400
              hover:border-slate-300
              focus:border-blue-400
              focus:bg-white
              focus:ring-4
              focus:ring-blue-500/[0.06]
            "
          />

        </div>

        {/* STATUS */}

        <div className="
          grid
          h-9
          grid-cols-3
          rounded-xl
          border
          border-slate-200
          bg-slate-50
          p-1
        ">

          {[
            {
              value: "ALL",
              label: "All",
            },
            {
              value: "PENDING",
              label: "Pending",
            },
            {
              value: "HOLD",
              label: "Hold",
            },
          ].map((item) => {
            const active =
              status === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() =>
                  setStatus(item.value)
                }
                className={`
                  rounded-lg
                  text-[9px]
                  font-extrabold
                  transition-all
                  ${
                    active
                      ? "bg-white text-[#1769ff] shadow-sm ring-1 ring-slate-200"
                      : "text-slate-400 hover:text-slate-700"
                  }
                `}
              >
                {item.label}
              </button>
            );
          })}

        </div>

        {/* CRM */}

        <div className="relative">

          <select
            value={crm}
            onChange={(e) =>
              setCrm(e.target.value)
            }
            className="
              h-9
              w-full
              appearance-none
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-3
              pr-8
              text-[10px]
              font-bold
              text-slate-700
              outline-none
              transition-all
              hover:border-slate-300
              focus:border-blue-400
              focus:bg-white
              focus:ring-4
              focus:ring-blue-500/[0.06]
            "
          >
            <option value="ALL">
              All CRM
            </option>

            {crmList.map((crmName) => (
              <option
                key={crmName}
                value={crmName}
              >
                {crmName}
              </option>
            ))}
          </select>

          <span className="
            pointer-events-none
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-[8px]
            text-slate-400
          ">
            ▼
          </span>

        </div>

        {/* REFRESH */}

        <button
          type="button"
          onClick={onRefresh}
          disabled={isFetching}
          className="
            flex
            h-9
            items-center
            justify-center
            gap-1.5
            rounded-xl
            bg-[#1769ff]
            px-4
            text-[10px]
            font-extrabold
            text-white
            shadow-[0_5px_14px_rgba(23,105,255,0.16)]
            transition-all
            hover:bg-blue-700
            active:scale-95
            disabled:opacity-60
          "
        >
          <FaSyncAlt
            size={9}
            className={
              isFetching
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>

        {/* EXPORT */}

        <button
          type="button"
          className="
            flex
            h-9
            items-center
            justify-center
            gap-1.5
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            text-[10px]
            font-extrabold
            text-slate-600
            transition-all
            hover:border-emerald-200
            hover:bg-emerald-50
            hover:text-emerald-600
            active:scale-95
          "
        >
          <FaFileExcel
            size={10}
            className="text-emerald-600"
          />

          Export
        </button>

        {/* CLEAR */}

        {hasFilters ? (
          <button
            type="button"
            onClick={clearAll}
            className="
              flex
              h-9
              items-center
              justify-center
              gap-1.5
              rounded-xl
              bg-red-50
              px-3
              text-[9px]
              font-extrabold
              text-red-500
              transition-all
              hover:bg-red-100
              active:scale-95
            "
          >
            <FaTimes size={8} />
            Clear
          </button>
        ) : (
          <div className="hidden lg:block" />
        )}

      </div>

      {/* =====================================================
          ACTIVE FILTERS
      ===================================================== */}

      {hasFilters && (
        <div className="
          flex
          flex-wrap
          items-center
          gap-1.5
          border-t
          border-slate-100
          bg-slate-50/60
          px-3
          py-1.5
        ">

          <span className="
            text-[8px]
            font-extrabold
            uppercase
            tracking-[0.1em]
            text-slate-400
          ">
            Active
          </span>

          {search.trim() && (
            <span className="
              max-w-[220px]
              truncate
              rounded-md
              border
              border-blue-100
              bg-blue-50
              px-2
              py-1
              text-[8px]
              font-bold
              text-blue-600
            ">
              Search: {search}
            </span>
          )}

          {status !== "ALL" && (
            <span className="
              rounded-md
              border
              border-amber-100
              bg-amber-50
              px-2
              py-1
              text-[8px]
              font-bold
              text-amber-700
            ">
              Status: {status}
            </span>
          )}

          {crm !== "ALL" && (
            <span className="
              max-w-[160px]
              truncate
              rounded-md
              border
              border-purple-100
              bg-purple-50
              px-2
              py-1
              text-[8px]
              font-bold
              text-purple-600
            ">
              CRM: {crm}
            </span>
          )}

        </div>
      )}

    </div>
  );
}