import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { useCachedSSUsers } from "../../auth/useSS";
import { useCreateSimpleOrder } from "../../hooks/CRM/useCreateSimpleOrder";

export default function SimpleOrderCreateModal({ showModal, setShowModal }) {
    const { user } = useAuth();
    const { data: ssUsers = [] } = useCachedSSUsers();
    const createOrder = useCreateSimpleOrder();
    const queryClient = useQueryClient();

    const [searchTerm, setSearchTerm] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [highlightIndex, setHighlightIndex] = useState(0);
    const [selectedSS, setSelectedSS] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false); // ⭐ NEW

    const listRef = useRef(null);

    // 🔍 Filter only when user is typing
    useEffect(() => {
        if (!searchTerm || isSelecting) {
            setFilteredUsers([]);
            return;
        }

        const filtered = ssUsers.filter((ss) =>
            ss.party_name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredUsers(filtered);
        setHighlightIndex(0);
    }, [searchTerm, ssUsers, isSelecting]);

    if (!showModal) return null;

    // ⌨️ Keyboard navigation
    const handleKeyDown = (e) => {
        if (!filteredUsers.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndex((prev) =>
                prev < filteredUsers.length - 1 ? prev + 1 : prev
            );
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndex((prev) => (prev > 0 ? prev - 1 : 0));
        }

        if (e.key === "Enter") {
            e.preventDefault();
            const ss = filteredUsers[highlightIndex];
            handleSelectSS(ss);
        }
    };

    // ✅ Proper select handler
    const handleSelectSS = (ss) => {
        setIsSelecting(true);
        setSelectedSS(ss);
        setSearchTerm(ss.party_name);
        setFilteredUsers([]);
    };

    // ✍️ When user starts typing again
    const handleChange = (e) => {
        setIsSelecting(false);
        setSelectedSS(null);
        setSearchTerm(e.target.value);
    };

    const handleCreate = () => {
        if (!selectedSS) return alert("Party select kare");

        setLoading(true);

        createOrder.mutate(
            {
                ss_id: selectedSS.id,
                crm_id: user.id,
            },
            {
                onSuccess: (data) => {
                    // ✅ SAME API REFRESH AS SUBMIT / HOLD / REJECT
                    queryClient.invalidateQueries({
                        queryKey: ["crmOrders"],
                        exact: false,
                    });

                    alert("Order created successfully");

                    setSelectedSS(null);
                    setSearchTerm("");
                    setShowModal(false);
                    setLoading(false);

                    // (optional) agar direct order detail pe jaana ho:
                    // navigate(`/crm/orders/${data.order.id}`);
                },
                onError: () => {
                    alert("Order create failed");
                    setLoading(false);
                },
            }
        );
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-5">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Create Empty Order</h2>
                    <button
                        onClick={() => setShowModal(false)}
                        className="text-xl text-gray-500"
                    >
                        ×
                    </button>
                </div>

                {/* BODY */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        value={searchTerm}
                        placeholder="Search Party..."
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        className="w-full border px-3 py-2 rounded focus:outline-none"
                    />

                    {filteredUsers.length > 0 && !isSelecting && (
                        <div className="absolute left-0 right-0 top-full bg-white border shadow-lg max-h-48 overflow-y-auto z-50">
                            {filteredUsers.map((ss, index) => (
                                <div
                                    key={ss.id}
                                    onClick={() => handleSelectSS(ss)}
                                    className={`px-3 py-2 text-sm cursor-pointer ${highlightIndex === index
                                            ? "bg-orange-100"
                                            : "hover:bg-gray-100"
                                        }`}
                                >
                                    {ss.party_name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 border rounded cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleCreate}
                        disabled={loading}
                        className={`px-4 py-2 rounded text-white cursor-pointer ${loading
                                ? "bg-green-400"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                    >
                        {loading ? "Creating..." : "Confirm"}
                    </button>
                </div>
            </div>
        </div>
    );
}




// import { useState, useEffect, useRef } from "react";
// import { useQueryClient } from "@tanstack/react-query";
// import { useAuth } from "../../context/AuthContext";
// import { useCachedSSUsers } from "../../auth/useSS";
// import { useCreateSimpleOrder } from "../../hooks/CRM/useCreateSimpleOrder";

// import {
//     FaSearch,
//     FaTimes,
//     FaCheck,
//     FaUser,
//     FaPlus,
//     FaKeyboard,
//     FaArrowUp,
//     FaArrowDown,
//     FaSpinner,
// } from "react-icons/fa";

// export default function SimpleOrderCreateModal({
//     showModal,
//     setShowModal,
// }) {
//     const { user } = useAuth();
//     const { data: ssUsers = [] } = useCachedSSUsers();

//     const createOrder = useCreateSimpleOrder();
//     const queryClient = useQueryClient();

//     const [searchTerm, setSearchTerm] = useState("");
//     const [filteredUsers, setFilteredUsers] = useState([]);
//     const [highlightIndex, setHighlightIndex] = useState(0);
//     const [selectedSS, setSelectedSS] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [isSelecting, setIsSelecting] = useState(false);

//     const searchInputRef = useRef(null);
//     const listRef = useRef(null);

//     /* =====================================================
//        FILTER USERS
//     ===================================================== */

//     useEffect(() => {
//         if (!searchTerm.trim() || isSelecting) {
//             setFilteredUsers([]);
//             return;
//         }

//         const term = searchTerm.trim().toLowerCase();

//         const filtered = ssUsers
//             .filter((ss) =>
//                 String(ss?.party_name || "")
//                     .toLowerCase()
//                     .includes(term)
//             )
//             .slice(0, 8);

//         setFilteredUsers(filtered);
//         setHighlightIndex(0);
//     }, [searchTerm, ssUsers, isSelecting]);

//     /* =====================================================
//        FOCUS SEARCH WHEN MODAL OPENS
//     ===================================================== */

//     useEffect(() => {
//         if (!showModal) return;

//         const timer = setTimeout(() => {
//             searchInputRef.current?.focus();
//         }, 80);

//         return () => clearTimeout(timer);
//     }, [showModal]);

//     /* =====================================================
//        SCROLL HIGHLIGHTED PARTY INTO VIEW
//     ===================================================== */

//     useEffect(() => {
//         if (!listRef.current) return;

//         const activeItem =
//             listRef.current.children[highlightIndex];

//         activeItem?.scrollIntoView({
//             block: "nearest",
//         });
//     }, [highlightIndex]);

//     /* =====================================================
//        RESET MODAL
//     ===================================================== */

//     const resetModal = () => {
//         setSearchTerm("");
//         setFilteredUsers([]);
//         setHighlightIndex(0);
//         setSelectedSS(null);
//         setLoading(false);
//         setIsSelecting(false);
//     };

//     /* =====================================================
//        CLOSE MODAL
//     ===================================================== */

//     const handleClose = () => {
//         if (loading) return;

//         resetModal();
//         setShowModal(false);
//     };

//     /* =====================================================
//        SELECT PARTY
//     ===================================================== */

//     const handleSelectSS = (ss) => {
//         if (!ss) return;

//         setIsSelecting(true);
//         setSelectedSS(ss);
//         setSearchTerm(ss.party_name || "");
//         setFilteredUsers([]);
//         setHighlightIndex(0);
//     };

//     /* =====================================================
//        SEARCH CHANGE
//     ===================================================== */

//     const handleChange = (e) => {
//         setIsSelecting(false);
//         setSelectedSS(null);
//         setSearchTerm(e.target.value);
//     };

//     /* =====================================================
//        KEYBOARD NAVIGATION
//     ===================================================== */

//     const handleKeyDown = (e) => {
//         /* ESC → Close */

//         if (e.key === "Escape") {
//             e.preventDefault();
//             handleClose();
//             return;
//         }

//         /* If no search results */

//         if (!filteredUsers.length) {
//             if (
//                 e.key === "Enter" &&
//                 selectedSS
//             ) {
//                 e.preventDefault();
//                 handleCreate();
//             }

//             return;
//         }

//         /* Arrow Down */

//         if (e.key === "ArrowDown") {
//             e.preventDefault();

//             setHighlightIndex((prev) =>
//                 prev < filteredUsers.length - 1
//                     ? prev + 1
//                     : 0
//             );

//             return;
//         }

//         /* Arrow Up */

//         if (e.key === "ArrowUp") {
//             e.preventDefault();

//             setHighlightIndex((prev) =>
//                 prev > 0
//                     ? prev - 1
//                     : filteredUsers.length - 1
//             );

//             return;
//         }

//         /* Enter */

//         if (e.key === "Enter") {
//             e.preventDefault();

//             const ss =
//                 filteredUsers[highlightIndex];

//             if (ss) {
//                 handleSelectSS(ss);
//             }

//             return;
//         }
//     };

//     /* =====================================================
//        CREATE ORDER
//     ===================================================== */

//     const handleCreate = () => {
//         if (!selectedSS) {
//             searchInputRef.current?.focus();
//             return;
//         }

//         setLoading(true);

//         createOrder.mutate(
//             {
//                 ss_id: selectedSS.id,
//                 crm_id: user.id,
//             },
//             {
//                 onSuccess: () => {
//                     queryClient.invalidateQueries({
//                         queryKey: ["crmOrders"],
//                         exact: false,
//                     });

//                     alert(
//                         "Order created successfully"
//                     );

//                     resetModal();
//                     setShowModal(false);
//                 },

//                 onError: () => {
//                     alert("Order create failed");
//                     setLoading(false);
//                 },
//             }
//         );
//     };

//     if (!showModal) return null;

//     return (
//         <div
//             className="
//                 fixed inset-0
//                 z-[100]
//                 flex items-center justify-center
//                 bg-gray-900/45
//                 backdrop-blur-[2px]
//                 p-3
//                 sm:p-5
//             "
//             onMouseDown={(e) => {
//                 if (e.target === e.currentTarget) {
//                     handleClose();
//                 }
//             }}
//         >
//             {/* =================================================
//                 MODAL
//             ================================================= */}

//             <div
//                 className="
//                     w-full
//                     max-w-lg
//                     bg-white
//                     rounded-2xl
//                     shadow-2xl
//                     border
//                     border-gray-200
//                     overflow-hidden
//                     animate-[fadeIn_.15s_ease-out]
//                 "
//             >
//                 {/* =================================================
//                     HEADER
//                 ================================================= */}

//                 <div
//                     className="
//                         flex
//                         items-center
//                         justify-between
//                         px-4
//                         sm:px-5
//                         py-4
//                         border-b
//                         border-gray-100
//                     "
//                 >
//                     <div className="flex items-center gap-3">
//                         <div
//                             className="
//                                 w-9
//                                 h-9
//                                 rounded-lg
//                                 bg-blue-50
//                                 text-blue-600
//                                 flex
//                                 items-center
//                                 justify-center
//                             "
//                         >
//                             <FaPlus className="text-sm" />
//                         </div>

//                         <div>
//                             <h2
//                                 className="
//                                     text-sm
//                                     sm:text-base
//                                     font-bold
//                                     text-gray-900
//                                 "
//                             >
//                                 Create New Order
//                             </h2>

//                             <p
//                                 className="
//                                     text-[10px]
//                                     sm:text-xs
//                                     text-gray-400
//                                     mt-0.5
//                                 "
//                             >
//                                 Select an SS party to
//                                 create an order
//                             </p>
//                         </div>
//                     </div>

//                     <button
//                         type="button"
//                         onClick={handleClose}
//                         disabled={loading}
//                         className="
//                             w-8
//                             h-8
//                             rounded-lg
//                             flex
//                             items-center
//                             justify-center
//                             text-gray-400
//                             hover:bg-gray-100
//                             hover:text-gray-700
//                             transition
//                             disabled:opacity-40
//                         "
//                     >
//                         <FaTimes />
//                     </button>
//                 </div>

//                 {/* =================================================
//                     BODY
//                 ================================================= */}

//                 <div
//                     className="
//                         px-4
//                         sm:px-5
//                         py-5
//                     "
//                 >
//                     {/* Search Label */}

//                     <div className="flex items-center justify-between mb-2">
//                         <label
//                             className="
//                                 text-xs
//                                 font-semibold
//                                 text-gray-700
//                             "
//                         >
//                             Select Party
//                         </label>

//                         <span
//                             className="
//                                 hidden
//                                 sm:flex
//                                 items-center
//                                 gap-1
//                                 text-[9px]
//                                 text-gray-400
//                             "
//                         >
//                             <FaKeyboard />

//                             <span>
//                                 ↑ ↓ Navigate
//                             </span>

//                             <span className="mx-1">
//                                 •
//                             </span>

//                             <span>
//                                 Enter Select
//                             </span>
//                         </span>
//                     </div>

//                     {/* =================================================
//                         SEARCH BOX
//                     ================================================= */}

//                     <div className="relative">
//                         <div
//                             className={`
//                                 flex
//                                 items-center
//                                 h-11
//                                 rounded-xl
//                                 border
//                                 transition
//                                 ${
//                                     selectedSS
//                                         ? "border-emerald-300 bg-emerald-50/30"
//                                         : "border-gray-200 bg-gray-50 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-3 focus-within:ring-blue-50"
//                                 }
//                             `}
//                         >
//                             <FaSearch
//                                 className="
//                                     ml-3
//                                     text-gray-400
//                                     text-xs
//                                     shrink-0
//                                 "
//                             />

//                             <input
//                                 ref={searchInputRef}
//                                 type="text"
//                                 value={searchTerm}
//                                 placeholder="Search party name..."
//                                 onChange={handleChange}
//                                 onKeyDown={handleKeyDown}
//                                 disabled={loading}
//                                 autoComplete="off"
//                                 className="
//                                     flex-1
//                                     min-w-0
//                                     h-full
//                                     px-3
//                                     bg-transparent
//                                     outline-none
//                                     text-sm
//                                     text-gray-800
//                                     placeholder-gray-400
//                                 "
//                             />

//                             {/* Selected Check */}

//                             {selectedSS && (
//                                 <div
//                                     className="
//                                         mr-2
//                                         w-6
//                                         h-6
//                                         rounded-full
//                                         bg-emerald-100
//                                         text-emerald-600
//                                         flex
//                                         items-center
//                                         justify-center
//                                     "
//                                 >
//                                     <FaCheck className="text-[10px]" />
//                                 </div>
//                             )}

//                             {/* Clear */}

//                             {searchTerm &&
//                                 !selectedSS && (
//                                     <button
//                                         type="button"
//                                         onClick={() => {
//                                             setSearchTerm(
//                                                 ""
//                                             );
//                                             setSelectedSS(
//                                                 null
//                                             );
//                                             setIsSelecting(
//                                                 false
//                                             );
//                                             searchInputRef.current?.focus();
//                                         }}
//                                         className="
//                                             mr-2
//                                             w-6
//                                             h-6
//                                             rounded-full
//                                             text-gray-400
//                                             hover:bg-gray-200
//                                             flex
//                                             items-center
//                                             justify-center
//                                         "
//                                     >
//                                         <FaTimes className="text-[10px]" />
//                                     </button>
//                                 )}
//                         </div>

//                         {/* =================================================
//                             SEARCH RESULTS
//                         ================================================= */}

//                         {filteredUsers.length > 0 &&
//                             !isSelecting && (
//                                 <div
//                                     ref={listRef}
//                                     className="
//                                         absolute
//                                         left-0
//                                         right-0
//                                         top-[calc(100%+6px)]
//                                         bg-white
//                                         border
//                                         border-gray-200
//                                         rounded-xl
//                                         shadow-xl
//                                         overflow-hidden
//                                         z-50
//                                         max-h-64
//                                         overflow-y-auto
//                                     "
//                                 >
//                                     {/* Result Count */}

//                                     <div
//                                         className="
//                                             px-3
//                                             py-2
//                                             bg-gray-50
//                                             border-b
//                                             border-gray-100
//                                             text-[10px]
//                                             font-semibold
//                                             text-gray-400
//                                         "
//                                     >
//                                         {filteredUsers.length}{" "}
//                                         matching parties
//                                     </div>

//                                     {filteredUsers.map(
//                                         (
//                                             ss,
//                                             index
//                                         ) => (
//                                             <button
//                                                 type="button"
//                                                 key={ss.id}
//                                                 onMouseDown={(
//                                                     e
//                                                 ) => {
//                                                     e.preventDefault();
//                                                     handleSelectSS(
//                                                         ss
//                                                     );
//                                                 }}
//                                                 className={`
//                                                     w-full
//                                                     text-left
//                                                     flex
//                                                     items-center
//                                                     gap-3
//                                                     px-3
//                                                     py-3
//                                                     border-b
//                                                     last:border-b-0
//                                                     border-gray-50
//                                                     transition
//                                                     ${
//                                                         highlightIndex ===
//                                                         index
//                                                             ? "bg-blue-50"
//                                                             : "hover:bg-gray-50"
//                                                     }
//                                                 `}
//                                             >
//                                                 {/* Avatar */}

//                                                 <div
//                                                     className={`
//                                                         w-8
//                                                         h-8
//                                                         rounded-lg
//                                                         flex
//                                                         items-center
//                                                         justify-center
//                                                         shrink-0
//                                                         ${
//                                                             highlightIndex ===
//                                                             index
//                                                                 ? "bg-blue-100 text-blue-600"
//                                                                 : "bg-gray-100 text-gray-500"
//                                                         }
//                                                     `}
//                                                 >
//                                                     <FaUser className="text-xs" />
//                                                 </div>

//                                                 {/* Name */}

//                                                 <div className="min-w-0 flex-1">
//                                                     <p
//                                                         className="
//                                                             text-xs
//                                                             sm:text-sm
//                                                             font-semibold
//                                                             text-gray-800
//                                                             truncate
//                                                         "
//                                                     >
//                                                         {
//                                                             ss.party_name
//                                                         }
//                                                     </p>

//                                                     <p
//                                                         className="
//                                                             text-[10px]
//                                                             text-gray-400
//                                                             mt-0.5
//                                                         "
//                                                     >
//                                                         SS Party
//                                                     </p>
//                                                 </div>

//                                                 {/* Keyboard indicator */}

//                                                 {highlightIndex ===
//                                                     index && (
//                                                     <div
//                                                         className="
//                                                             hidden
//                                                             sm:flex
//                                                             items-center
//                                                             gap-1
//                                                             text-[9px]
//                                                             text-blue-500
//                                                             font-semibold
//                                                         "
//                                                     >
//                                                         <FaArrowUp />
//                                                         <FaArrowDown />
//                                                         <span>
//                                                             Enter
//                                                         </span>
//                                                     </div>
//                                                 )}
//                                             </button>
//                                         )
//                                     )}
//                                 </div>
//                             )}

//                         {/* No Result */}

//                         {searchTerm.trim() &&
//                             !selectedSS &&
//                             !isSelecting &&
//                             filteredUsers.length ===
//                                 0 && (
//                                 <div
//                                     className="
//                                         absolute
//                                         left-0
//                                         right-0
//                                         top-[calc(100%+6px)]
//                                         bg-white
//                                         border
//                                         border-gray-200
//                                         rounded-xl
//                                         shadow-lg
//                                         z-50
//                                         px-4
//                                         py-6
//                                         text-center
//                                     "
//                                 >
//                                     <div
//                                         className="
//                                             mx-auto
//                                             w-9
//                                             h-9
//                                             rounded-full
//                                             bg-gray-100
//                                             flex
//                                             items-center
//                                             justify-center
//                                             text-gray-400
//                                             mb-2
//                                         "
//                                     >
//                                         <FaSearch className="text-xs" />
//                                     </div>

//                                     <p className="text-xs font-semibold text-gray-600">
//                                         No party found
//                                     </p>

//                                     <p className="text-[10px] text-gray-400 mt-1">
//                                         Try another party
//                                         name
//                                     </p>
//                                 </div>
//                             )}
//                     </div>

//                     {/* =================================================
//                         SELECTED PARTY
//                     ================================================= */}

//                     {selectedSS && (
//                         <div
//                             className="
//                                 mt-4
//                                 rounded-xl
//                                 border
//                                 border-emerald-200
//                                 bg-emerald-50/60
//                                 p-3
//                             "
//                         >
//                             <div className="flex items-center gap-3">
//                                 <div
//                                     className="
//                                         w-9
//                                         h-9
//                                         rounded-lg
//                                         bg-emerald-100
//                                         text-emerald-600
//                                         flex
//                                         items-center
//                                         justify-center
//                                         shrink-0
//                                     "
//                                 >
//                                     <FaCheck />
//                                 </div>

//                                 <div className="min-w-0 flex-1">
//                                     <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
//                                         Selected Party
//                                     </p>

//                                     <p className="text-sm font-bold text-gray-800 truncate mt-0.5">
//                                         {
//                                             selectedSS.party_name
//                                         }
//                                     </p>
//                                 </div>

//                                 <button
//                                     type="button"
//                                     onClick={() => {
//                                         setSelectedSS(
//                                             null
//                                         );
//                                         setSearchTerm(
//                                             ""
//                                         );
//                                         setIsSelecting(
//                                             false
//                                         );

//                                         setTimeout(
//                                             () => {
//                                                 searchInputRef.current?.focus();
//                                             },
//                                             0
//                                         );
//                                     }}
//                                     disabled={loading}
//                                     className="
//                                         text-[10px]
//                                         font-semibold
//                                         text-gray-400
//                                         hover:text-gray-700
//                                     "
//                                 >
//                                     Change
//                                 </button>
//                             </div>
//                         </div>
//                     )}

//                     {/* =================================================
//                         HELP TEXT
//                     ================================================= */}

//                     {!selectedSS && (
//                         <div
//                             className="
//                                 mt-3
//                                 flex
//                                 items-center
//                                 gap-2
//                                 text-[10px]
//                                 text-gray-400
//                             "
//                         >
//                             <FaKeyboard className="text-gray-300" />

//                             <span>
//                                 Fast mode: type party →
//                                 ↑ ↓ → Enter
//                             </span>
//                         </div>
//                     )}
//                 </div>

//                 {/* =================================================
//                     FOOTER
//                 ================================================= */}

//                 <div
//                     className="
//                         px-4
//                         sm:px-5
//                         py-3
//                         border-t
//                         border-gray-100
//                         bg-gray-50/70
//                         flex
//                         flex-col-reverse
//                         sm:flex-row
//                         sm:items-center
//                         sm:justify-between
//                         gap-2
//                     "
//                 >
//                     {/* ESC */}

//                     <div className="hidden sm:flex items-center gap-1.5 text-[9px] text-gray-400">
//                         <kbd
//                             className="
//                                 px-1.5
//                                 py-0.5
//                                 rounded
//                                 border
//                                 border-gray-200
//                                 bg-white
//                                 text-gray-500
//                                 font-sans
//                             "
//                         >
//                             Esc
//                         </kbd>

//                         <span>
//                             Close
//                         </span>
//                     </div>

//                     {/* Buttons */}

//                     <div
//                         className="
//                             flex
//                             items-center
//                             justify-end
//                             gap-2
//                             w-full
//                             sm:w-auto
//                         "
//                     >
//                         <button
//                             type="button"
//                             onClick={handleClose}
//                             disabled={loading}
//                             className="
//                                 flex-1
//                                 sm:flex-none
//                                 h-10
//                                 px-4
//                                 rounded-lg
//                                 border
//                                 border-gray-200
//                                 bg-white
//                                 text-xs
//                                 font-semibold
//                                 text-gray-600
//                                 hover:bg-gray-100
//                                 transition
//                                 disabled:opacity-50
//                             "
//                         >
//                             Cancel
//                         </button>

//                         <button
//                             type="button"
//                             onClick={handleCreate}
//                             disabled={
//                                 loading ||
//                                 !selectedSS
//                             }
//                             className="
//                                 flex-1
//                                 sm:flex-none
//                                 h-10
//                                 px-4
//                                 rounded-lg
//                                 bg-blue-600
//                                 hover:bg-blue-700
//                                 text-white
//                                 text-xs
//                                 font-semibold
//                                 flex
//                                 items-center
//                                 justify-center
//                                 gap-2
//                                 shadow-sm
//                                 transition
//                                 disabled:bg-gray-300
//                                 disabled:cursor-not-allowed
//                             "
//                         >
//                             {loading ? (
//                                 <>
//                                     <FaSpinner className="animate-spin" />

//                                     Creating...
//                                 </>
//                             ) : (
//                                 <>
//                                     <FaPlus />

//                                     Create Order
//                                 </>
//                             )}
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }