import { useState, useRef, useEffect } from "react";
import { useCachedSSUsers } from "../auth/useSS";

export default function PartySearchInput({
  value,
  setValue,
  onSelect,
  placeholder = "Search party..."
}) {
  const { data: users = [] } = useCachedSSUsers();

  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const wrapperRef = useRef(null);

  const filteredUsers = users.filter((u) =>
    u.party_name?.toLowerCase().includes(value.toLowerCase())
  );

  const handleSelect = (user) => {
    setValue(user.party_name);
    setIsOpen(false);
    onSelect?.(user);
  };

  // ⌨️ keyboard support
  const handleKeyDown = (e) => {
    if (!isOpen || !filteredUsers.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < filteredUsers.length - 1 ? prev + 1 : 0
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : filteredUsers.length - 1
      );
    }

    if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(filteredUsers[highlightIndex]);
    }
  };

  // click outside close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!wrapperRef.current?.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setIsOpen(true);
          setHighlightIndex(0);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full border px-2 py-1 text-sm rounded"
      />

      {isOpen && value && (
        <div className="absolute z-50 bg-white border shadow w-full max-h-40 overflow-y-auto">
          {filteredUsers.length ? (
            filteredUsers.map((user, i) => (
              <div
                key={user.id}
                onClick={() => handleSelect(user)}
                className={`px-2 py-1 cursor-pointer text-sm ${
                  i === highlightIndex
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
              >
                {user.party_name}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-400 text-sm">
              No results
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// import {
//   useState,
//   useRef,
//   useEffect,
// } from "react";
// import { useCachedSSUsers } from "../auth/useSS";

// import {
//   FaSearch,
//   FaUser,
//   FaCheck,
// } from "react-icons/fa";

// export default function PartySearchInput({
//   value,
//   setValue,
//   onSelect,
//   placeholder = "Search party...",
// }) {
//   const { data: users = [] } = useCachedSSUsers();

//   const [isOpen, setIsOpen] = useState(false);
//   const [highlightIndex, setHighlightIndex] =
//     useState(0);

//   const wrapperRef = useRef(null);
//   const inputRef = useRef(null);

//   // =========================================================
//   // FILTER USERS
//   // =========================================================

//   const searchValue = (
//     value || ""
//   ).toLowerCase().trim();

//   const filteredUsers = users
//     .filter((u) =>
//       u.party_name
//         ?.toLowerCase()
//         .includes(searchValue)
//     )
//     .slice(0, 30);

//   // =========================================================
//   // SELECT
//   // =========================================================

//   const handleSelect = (user) => {
//     if (!user) return;

//     setValue(user.party_name);
//     setIsOpen(false);
//     setHighlightIndex(0);

//     onSelect?.(user);
//   };

//   // =========================================================
//   // KEYBOARD
//   // =========================================================

//   const handleKeyDown = (e) => {
//     if (e.key === "Escape") {
//       e.preventDefault();
//       setIsOpen(false);
//       return;
//     }

//     if (!isOpen || !filteredUsers.length) {
//       return;
//     }

//     if (e.key === "ArrowDown") {
//       e.preventDefault();

//       setHighlightIndex((prev) =>
//         prev < filteredUsers.length - 1
//           ? prev + 1
//           : 0
//       );

//       return;
//     }

//     if (e.key === "ArrowUp") {
//       e.preventDefault();

//       setHighlightIndex((prev) =>
//         prev > 0
//           ? prev - 1
//           : filteredUsers.length - 1
//       );

//       return;
//     }

//     if (e.key === "Enter") {
//       e.preventDefault();

//       handleSelect(
//         filteredUsers[highlightIndex]
//       );
//     }
//   };

//   // =========================================================
//   // CLICK OUTSIDE
//   // =========================================================

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (
//         !wrapperRef.current?.contains(
//           e.target
//         )
//       ) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener(
//       "mousedown",
//       handleClickOutside
//     );

//     return () => {
//       document.removeEventListener(
//         "mousedown",
//         handleClickOutside
//       );
//     };
//   }, []);

//   // =========================================================
//   // KEEP HIGHLIGHT VALID
//   // =========================================================

//   useEffect(() => {
//     if (
//       highlightIndex >= filteredUsers.length
//     ) {
//       setHighlightIndex(0);
//     }
//   }, [
//     filteredUsers.length,
//     highlightIndex,
//   ]);

//   // =========================================================
//   // UI
//   // =========================================================

//   return (
//     <div
//       ref={wrapperRef}
//       className="relative w-full"
//     >
//       {/* INPUT */}
//       <div className="relative">
//         <FaSearch className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[9px] text-gray-400" />

//         <input
//           ref={inputRef}
//           value={value || ""}
//           onChange={(e) => {
//             setValue(e.target.value);
//             setIsOpen(true);
//             setHighlightIndex(0);
//           }}
//           onFocus={() => {
//             if (value) {
//               setIsOpen(true);
//             }
//           }}
//           onKeyDown={handleKeyDown}
//           placeholder={placeholder}
//           autoComplete="off"
//           className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-8 pr-3 text-[10px] text-gray-800 outline-none transition-all duration-200 hover:border-gray-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
//         />
//       </div>

//       {/* =====================================================
//           DROPDOWN
//       ====================================================== */}

//       <div
//         className={`absolute left-0 right-0 top-full z-[100] mt-1 origin-top overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl shadow-slate-900/10 transition-all duration-200 ${
//           isOpen && value
//             ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
//             : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0"
//         }`}
//       >
//         {filteredUsers.length ? (
//           <div className="max-h-56 overflow-y-auto py-1">
//             {filteredUsers.map(
//               (user, i) => {
//                 const selected =
//                   user.party_name === value;

//                 return (
//                   <button
//                     key={user.id}
//                     type="button"
//                     onMouseDown={(e) =>
//                       e.preventDefault()
//                     }
//                     onClick={() =>
//                       handleSelect(user)
//                     }
//                     onMouseEnter={() =>
//                       setHighlightIndex(i)
//                     }
//                     className={`group flex w-full items-center gap-2 px-3 py-2.5 text-left transition-all duration-150 ${
//                       i === highlightIndex
//                         ? "bg-blue-50"
//                         : "bg-white hover:bg-gray-50"
//                     }`}
//                   >
//                     {/* ICON */}
//                     <span
//                       className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-150 ${
//                         i === highlightIndex
//                           ? "bg-blue-100 text-blue-600"
//                           : "bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500"
//                       }`}
//                     >
//                       <FaUser size={9} />
//                     </span>

//                     {/* NAME */}
//                     <span className="min-w-0 flex-1">
//                       <span className="block truncate text-[10px] font-semibold text-gray-700">
//                         {user.party_name}
//                       </span>

//                       {user.mobile && (
//                         <span className="mt-0.5 block text-[8px] text-gray-400">
//                           {user.mobile}
//                         </span>
//                       )}
//                     </span>

//                     {/* SELECT */}
//                     {selected ? (
//                       <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-50 text-green-600">
//                         <FaCheck size={8} />
//                       </span>
//                     ) : (
//                       i === highlightIndex && (
//                         <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[7px] font-bold text-blue-600">
//                           ENTER
//                         </span>
//                       )
//                     )}
//                   </button>
//                 );
//               }
//             )}
//           </div>
//         ) : (
//           <div className="px-4 py-6 text-center">
//             <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400">
//               <FaSearch size={11} />
//             </div>

//             <p className="mt-2 text-[10px] font-semibold text-gray-600">
//               No party found
//             </p>

//             <p className="mt-0.5 text-[8px] text-gray-400">
//               Try another party name
//             </p>
//           </div>
//         )}

//         {/* KEYBOARD HINT */}
//         {filteredUsers.length > 0 && (
//           <div className="flex items-center gap-2 border-t border-gray-100 bg-gray-50 px-3 py-1.5 text-[7px] text-gray-400">
//             <span className="rounded bg-white px-1 py-0.5 font-mono ring-1 ring-gray-200">
//               ↑↓
//             </span>
//             Navigate

//             <span className="rounded bg-white px-1 py-0.5 font-mono ring-1 ring-gray-200">
//               Enter
//             </span>
//             Select

//             <span className="rounded bg-white px-1 py-0.5 font-mono ring-1 ring-gray-200">
//               Esc
//             </span>
//             Close
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }