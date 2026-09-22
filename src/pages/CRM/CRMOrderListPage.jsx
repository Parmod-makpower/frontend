import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../../Layout/BackButton";

import {
  FaCalendarAlt,
  FaHeadphonesAlt,
  FaMobileAlt,
  FaSyncAlt,
} from "react-icons/fa";
import { useCRMOrders } from "../../hooks/useCRMOrders";
import CRMOrderListFilterMenu from "../../components/CRMOrderListFilterMenu";
import { IoChevronBack } from "react-icons/io5";
import SimpleOrderCreateModal from "../../components/orderSheet/SimpleOrderCreatePage";


export default function CRMOrderListPage() {
  const navigate = useNavigate();
  const STORAGE_KEY = "crm_order_filter_status";
  const [showModal, setShowModal] = useState(false);


const [filterStatus, setFilterStatus] = useState(() => {
  return localStorage.getItem(STORAGE_KEY) || "PENDING";
});

  const {
  data: orders = [],
  isLoading,
  isFetching,
  refetch,
} = useCRMOrders(filterStatus);


  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        Loading orders...
      </div>
    );

  // ✅ Badge logic
  const getOrderBadge = (note) => {
    const n = (note || "").toLowerCase();

    if (n.includes("battery"))
      return { label: "Battery", class: "bg-yellow-100 text-yellow-700" };

    if (n.includes("non") || n.includes("accessor"))
      return { label: "Accessories", class: "text-purple-700", icon: <FaHeadphonesAlt className="text-purple-600" />, };

    if (n.includes("tempered"))
      return { label: "Tempered", class: "text-blue-700", icon: <FaMobileAlt className="text-blue-600" />, };

    return { label: "General", class: "bg-gray-100 text-gray-700" };
  };


  // ✅ Search filter
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    return (
      order.order_id.toLowerCase().includes(term) ||
      order.ss_party_name.toLowerCase().includes(term)
    );
  });

  // ✅ GROUPING LOGIC — Today / Yesterday / Older
  const today = [];
  const yesterday = [];
  const older = [];

  filteredOrders.forEach((order) => {
    const orderDate = new Date(order.created_at);
    const now = new Date();

    const isToday =
      orderDate.getDate() === now.getDate() &&
      orderDate.getMonth() === now.getMonth() &&
      orderDate.getFullYear() === now.getFullYear();

    const yesterdayDate = new Date();
    yesterdayDate.setDate(now.getDate() - 1);

    const isYesterday =
      orderDate.getDate() === yesterdayDate.getDate() &&
      orderDate.getMonth() === yesterdayDate.getMonth() &&
      orderDate.getFullYear() === yesterdayDate.getFullYear();

    if (isToday) today.push(order);
    else if (isYesterday) yesterday.push(order);
    else older.push(order);
  });

  // ✅ Section Label Component
  const SectionLabel = ({ title }) => (
    <p className="text-xs font-semibold text-gray-500 ml-1 mt-3 mb-1 ">
      {title}
    </p>
  );

  // ✅ Render Order Card (Reusable)
  const renderOrderCard = (order) => {
    const badge = getOrderBadge(order.note);

    return (
      <div
        key={order.id}
        onClick={() =>
          navigate(`/crm/orders/${order.id}`, { state: { order } })
        }
        className="relative bg-white p-4 rounded-2xl shadow-sm border border-gray-100 
          hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer"
      >
        {/* Top Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
          {/* Order ID + Badge */}
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold"> {order.order_id} </h2>
          </div>
          <span
            className={`flex items-center gap-1 text-xs font-semibold ${badge.class}`}
          >
            {badge.icon}
            {badge.label}
          </span>
          
        </div>

        {/* Party Name */}
        <span className="text-xs">{order.ss_party_name}</span>

        {/* ✅ Bottom Right Time */}
        <div className="absolute bottom-2 right-3 flex items-center gap-1 text-gray-700 opacity-70 text-[10px]">
          <FaCalendarAlt className="text-gray-400 text-[10px]" />
          {new Date(order.created_at).toLocaleString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour12: true,
          })}
        </div>
      </div>
    );
  };

  // ✅ FINAL RENDER
  return (
    <div className="px-3  pb-24">
     
  {/* Updating indicator */}
  {isFetching && (
    <p className="text-center text-[11px] text-gray-500 mt-1 animate-pulse">
      Updating orders...
    </p>
  )}

  {/* ===== HEADER ===== */}
  <div
    className="
      fixed sm:static top-0 left-0 right-0 z-50
      bg-blue-100
      border-b sm:border
      shadow-sm sm:shadow
      px-3 py-2
      rounded-none sm:rounded
    "
  >
    <div className="flex items-center gap-2">
       <div className="hidden md:block shrink-0">
    <BackButton />
  </div>


      {/* Search box */}
      <div
        className="
          flex items-center
          flex-1
          bg-white
          rounded
          px-3 py-2
          focus-within:ring-0 
        "
      >
        <input
          type="text"
          placeholder="Search Order / Party"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="
            w-full
            bg-transparent
            text-xs sm:text-sm
            outline-none
            placeholder-gray-400
          "
        />
      </div>

      <button
  onClick={() => setShowModal(true)}
  className="shrink-0 px-3 py-1 rounded border bg-white text-blue-700 hover:bg-gray-100 cursor-pointer"
>
  Create Order
</button>


      {/* Filter */}
      <div className="shrink-0">
        <CRMOrderListFilterMenu
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />
      </div>

      {/* Refresh */}
      <button
        onClick={() => refetch()}
        disabled={isFetching}
        className="
          shrink-0
          p-2
          rounded
          border
          bg-white
          text-blue-500 cursor-pointer
          hover:bg-gray-100
          transition
          disabled:opacity-50
        "
      >
        <FaSyncAlt
          className={`text-sm ${isFetching ? "animate-spin" : ""}`}
        />
      </button>

    </div>
  </div>

<SimpleOrderCreateModal
  showModal={showModal}
  setShowModal={setShowModal}
/>

      <div className="space-y-4 pt-[60px] sm:pt-5">
        {filteredOrders.length === 0 ? (
          <p className="text-gray-500 text-center text-sm">
            No matching orders found.
          </p>
        ) : (
          <>
            {today.length > 0 && <SectionLabel title="Today" />}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {today.map((order) => renderOrderCard(order))}
            </div>

            {yesterday.length > 0 && <SectionLabel title="Yesterday" />}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {yesterday.map((order) => renderOrderCard(order))}
            </div>

            {older.length > 0 && <SectionLabel title="Older Orders" />}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {older.map((order) => renderOrderCard(order))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}



// import { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//   FaCalendarAlt,
//   FaHeadphonesAlt,
//   FaMobileAlt,
//   FaSyncAlt,
//   FaSearch,
//   FaPlus,
//   FaClock,
//   FaCheckCircle,
//   FaInbox,
//   FaChevronRight,
//   FaKeyboard,
//   FaTimes,
//   FaUsers,
// } from "react-icons/fa";

// import { useCRMOrders } from "../../hooks/useCRMOrders";
// import CRMOrderListFilterMenu from "../../components/CRMOrderListFilterMenu";
// import SimpleOrderCreateModal from "../../components/orderSheet/SimpleOrderCreatePage";

// export default function CRMOrderListPage() {
//   const navigate = useNavigate();

//   const STORAGE_KEY = "crm_order_filter_status";

//   const [showModal, setShowModal] = useState(false);

//   const [filterStatus, setFilterStatus] = useState(() => {
//     return localStorage.getItem(STORAGE_KEY) || "PENDING";
//   });

//   const [searchTerm, setSearchTerm] = useState("");

//   const searchInputRef = useRef(null);

//   const {
//     data: orders = [],
//     isLoading,
//     isFetching,
//     refetch,
//   } = useCRMOrders(filterStatus);

//   /* =========================================================
//      SAVE FILTER
//   ========================================================= */

//   useEffect(() => {
//     localStorage.setItem(STORAGE_KEY, filterStatus);
//   }, [filterStatus]);

//   /* =========================================================
//      KEYBOARD SHORTCUTS
//   ========================================================= */

//   useEffect(() => {
//     const handleKeyboard = (event) => {
//       const target = event.target;

//       const isTyping =
//         target?.tagName === "INPUT" ||
//         target?.tagName === "TEXTAREA" ||
//         target?.tagName === "SELECT" ||
//         target?.isContentEditable;

//       if (
//         event.ctrlKey &&
//         event.key.toLowerCase() === "n"
//       ) {
//         event.preventDefault();
//         setShowModal(true);
//         return;
//       }

//       if (
//         event.key === "/" &&
//         !isTyping &&
//         !event.ctrlKey &&
//         !event.altKey &&
//         !event.metaKey
//       ) {
//         event.preventDefault();
//         searchInputRef.current?.focus();
//         return;
//       }

//       if (event.key === "Escape") {
//         if (document.activeElement === searchInputRef.current) {
//           setSearchTerm("");
//           searchInputRef.current?.blur();
//         }
//       }
//     };

//     window.addEventListener("keydown", handleKeyboard);

//     return () => {
//       window.removeEventListener("keydown", handleKeyboard);
//     };
//   }, []);

//   /* =========================================================
//      ORDER TYPE
//   ========================================================= */

//   const getOrderBadge = (note) => {
//     const n = String(note || "").toLowerCase();

//     if (n.includes("battery")) {
//       return {
//         label: "Battery",
//         className:
//           "bg-amber-50 text-amber-700 border-amber-200",
//         icon: <FaMobileAlt />,
//       };
//     }

//     if (
//       n.includes("non") ||
//       n.includes("accessor")
//     ) {
//       return {
//         label: "Accessories",
//         className:
//           "bg-purple-50 text-purple-700 border-purple-200",
//         icon: <FaHeadphonesAlt />,
//       };
//     }

//     if (n.includes("tempered")) {
//       return {
//         label: "Tempered",
//         className:
//           "bg-blue-50 text-blue-700 border-blue-200",
//         icon: <FaMobileAlt />,
//       };
//     }

//     return {
//       label: "General",
//       className:
//         "bg-gray-50 text-gray-600 border-gray-200",
//       icon: <FaInbox />,
//     };
//   };

//   /* =========================================================
//      SEARCH
//   ========================================================= */

//   const filteredOrders = useMemo(() => {
//     const term = searchTerm.trim().toLowerCase();

//     if (!term) return orders;

//     return orders.filter((order) => {
//       const orderId = String(
//         order?.order_id || ""
//       ).toLowerCase();

//       const partyName = String(
//         order?.ss_party_name || ""
//       ).toLowerCase();

//       const mobile = String(
//         order?.mobile ||
//           order?.phone ||
//           order?.ss_mobile ||
//           ""
//       ).toLowerCase();

//       return (
//         orderId.includes(term) ||
//         partyName.includes(term) ||
//         mobile.includes(term)
//       );
//     });
//   }, [orders, searchTerm]);

//   /* =========================================================
//      DATE GROUPING
//   ========================================================= */

//   const groupedOrders = useMemo(() => {
//     const today = [];
//     const yesterday = [];
//     const older = [];

//     const now = new Date();

//     const todayStart = new Date(
//       now.getFullYear(),
//       now.getMonth(),
//       now.getDate()
//     );

//     const yesterdayStart = new Date(todayStart);

//     yesterdayStart.setDate(
//       yesterdayStart.getDate() - 1
//     );

//     filteredOrders.forEach((order) => {
//       const orderDate = new Date(
//         order.created_at
//       );

//       if (Number.isNaN(orderDate.getTime())) {
//         older.push(order);
//         return;
//       }

//       if (orderDate >= todayStart) {
//         today.push(order);
//       } else if (orderDate >= yesterdayStart) {
//         yesterday.push(order);
//       } else {
//         older.push(order);
//       }
//     });

//     return {
//       today,
//       yesterday,
//       older,
//     };
//   }, [filteredOrders]);

//   /* =========================================================
//      STATS
//   ========================================================= */

//   const stats = useMemo(() => {
//     const categorySet = new Set();

//     orders.forEach((order) => {
//       categorySet.add(
//         getOrderBadge(order?.note).label
//       );
//     });

//     return {
//       total: orders.length,
//       today: groupedOrders.today.length,
//       yesterday: groupedOrders.yesterday.length,
//       categories: categorySet.size,
//     };
//   }, [orders, groupedOrders]);

//   /* =========================================================
//      DATE
//   ========================================================= */

//   const formatDateTime = (date) => {
//     if (!date) return "--";

//     const parsed = new Date(date);

//     if (Number.isNaN(parsed.getTime())) {
//       return "--";
//     }

//     return parsed.toLocaleString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   /* =========================================================
//      STATUS
//   ========================================================= */

//   const getStatusStyle = (status) => {
//     const value = String(
//       status || filterStatus
//     ).toUpperCase();

//     if (value === "APPROVED") {
//       return "bg-emerald-50 text-emerald-700 border-emerald-200";
//     }

//     if (value === "HOLD") {
//       return "bg-amber-50 text-amber-700 border-amber-200";
//     }

//     if (value === "REJECTED") {
//       return "bg-red-50 text-red-700 border-red-200";
//     }

//     return "bg-blue-50 text-blue-700 border-blue-200";
//   };

//   /* =========================================================
//      OPEN ORDER
//   ========================================================= */

//   const openOrder = (order) => {
//     navigate(`/crm/orders/${order.id}`, {
//       state: { order },
//     });
//   };

//   /* =========================================================
//      DESKTOP ROW
//   ========================================================= */

//   const renderDesktopRow = (order, index) => {
//     const badge = getOrderBadge(order.note);

//     return (
//       <div
//         key={order.id}
//         onClick={() => openOrder(order)}
//         className="
//           group
//           grid
//           grid-cols-[50px_minmax(150px,1.1fr)_minmax(180px,1.5fr)_140px_120px_110px_30px]
//           items-center
//           gap-3
//           px-4
//           py-3
//           border-b
//           border-gray-100
//           bg-white
//           cursor-pointer
//           transition-all
//           duration-200
//           hover:bg-blue-50/40
//           hover:shadow-[inset_3px_0_0_var(--primary-color)]
//         "
//       >
//         {/* Number */}

//         <div className="text-[11px] font-semibold text-gray-300">
//           {String(index + 1).padStart(2, "0")}
//         </div>

//         {/* Order */}

//         <div className="min-w-0">
//           <p className="truncate text-xs font-bold text-gray-900">
//             {order.order_id}
//           </p>

//           <p className="mt-0.5 text-[9px] text-gray-400">
//             Order ID
//           </p>
//         </div>

//         {/* Party */}

//         <div className="min-w-0">
//           <div className="flex items-center gap-2">
//             <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
//               <FaUsers size={11} />
//             </div>

//             <div className="min-w-0">
//               <p className="truncate text-xs font-semibold text-gray-800">
//                 {order.ss_party_name ||
//                   "Unknown Party"}
//               </p>

//               <p className="mt-0.5 truncate text-[9px] text-gray-400">
//                 {formatDateTime(order.created_at)}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Type */}

//         <div>
//           <span
//             className={`
//               inline-flex
//               items-center
//               gap-1.5
//               rounded-lg
//               border
//               px-2.5
//               py-1.5
//               text-[9px]
//               font-bold
//               transition-transform
//               duration-200
//               group-hover:scale-[1.03]
//               ${badge.className}
//             `}
//           >
//             {badge.icon}
//             {badge.label}
//           </span>
//         </div>

//         {/* Status */}

//         <div>
//           <span
//             className={`
//               inline-flex
//               items-center
//               rounded-lg
//               border
//               px-2.5
//               py-1.5
//               text-[9px]
//               font-bold
//               ${getStatusStyle(order.status)}
//             `}
//           >
//             {String(
//               order.status || filterStatus
//             ).replaceAll("_", " ")}
//           </span>
//         </div>

//         {/* Created */}

//         <div className="text-right">
//           <p className="text-[10px] font-semibold text-gray-600">
//             {new Date(
//               order.created_at
//             ).toLocaleDateString(
//               "en-IN",
//               {
//                 day: "2-digit",
//                 month: "short",
//               }
//             )}
//           </p>

//           <p className="mt-0.5 text-[9px] text-gray-400">
//             {new Date(
//               order.created_at
//             ).toLocaleTimeString(
//               "en-IN",
//               {
//                 hour: "2-digit",
//                 minute: "2-digit",
//               }
//             )}
//           </p>
//         </div>

//         {/* Arrow */}

//         <div className="flex justify-end">
//           <div className="
//             flex
//             h-6
//             w-6
//             items-center
//             justify-center
//             rounded-full
//             bg-gray-50
//             text-gray-300
//             transition-all
//             duration-200
//             group-hover:bg-blue-100
//             group-hover:text-blue-600
//             group-hover:translate-x-0.5
//           ">
//             <FaChevronRight size={9} />
//           </div>
//         </div>
//       </div>
//     );
//   };

//   /* =========================================================
//      MOBILE CARD
//   ========================================================= */

//   const renderMobileCard = (order) => {
//     const badge = getOrderBadge(order.note);

//     return (
//       <div
//         key={order.id}
//         onClick={() => openOrder(order)}
//         className="
//           group
//           relative
//           overflow-hidden
//           rounded-2xl
//           border
//           border-gray-200
//           bg-white
//           p-4
//           shadow-sm
//           cursor-pointer
//           transition-all
//           duration-300
//           hover:-translate-y-1
//           hover:border-blue-200
//           hover:shadow-lg
//           active:scale-[0.98]
//         "
//       >
//         {/* Accent */}

//         <div className="
//           absolute
//           left-0
//           top-0
//           h-full
//           w-1
//           bg-gradient-to-b
//           from-blue-500
//           to-purple-500
//           opacity-0
//           transition-opacity
//           duration-300
//           group-hover:opacity-100
//         " />

//         {/* Header */}

//         <div className="flex items-start justify-between gap-3">
//           <div className="flex min-w-0 items-center gap-2.5">
//             <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//               <FaInbox size={14} />
//             </div>

//             <div className="min-w-0">
//               <p className="truncate text-sm font-bold text-gray-900">
//                 {order.order_id}
//               </p>

//               <p className="mt-0.5 truncate text-[10px] text-gray-500">
//                 {order.ss_party_name ||
//                   "Unknown Party"}
//               </p>
//             </div>
//           </div>

//           <div className="
//             flex
//             h-7
//             w-7
//             shrink-0
//             items-center
//             justify-center
//             rounded-full
//             bg-gray-50
//             text-gray-300
//             transition-all
//             duration-200
//             group-hover:bg-blue-50
//             group-hover:text-blue-600
//           ">
//             <FaChevronRight size={10} />
//           </div>
//         </div>

//         {/* Badges */}

//         <div className="mt-4 flex items-center justify-between gap-2">
//           <span
//             className={`
//               inline-flex
//               items-center
//               gap-1.5
//               rounded-lg
//               border
//               px-2.5
//               py-1.5
//               text-[9px]
//               font-bold
//               ${badge.className}
//             `}
//           >
//             {badge.icon}
//             {badge.label}
//           </span>

//           <span
//             className={`
//               rounded-lg
//               border
//               px-2.5
//               py-1.5
//               text-[9px]
//               font-bold
//               ${getStatusStyle(order.status)}
//             `}
//           >
//             {String(
//               order.status || filterStatus
//             ).replaceAll("_", " ")}
//           </span>
//         </div>

//         {/* Footer */}

//         <div className="
//           mt-4
//           flex
//           items-center
//           justify-between
//           border-t
//           border-gray-100
//           pt-3
//         ">
//           <div className="flex items-center gap-1.5 text-[9px] text-gray-400">
//             <FaCalendarAlt />

//             <span>
//               {formatDateTime(
//                 order.created_at
//               )}
//             </span>
//           </div>

//           <span className="
//             text-[9px]
//             font-semibold
//             text-blue-500
//             opacity-0
//             transition-opacity
//             duration-200
//             group-hover:opacity-100
//           ">
//             Open →
//           </span>
//         </div>
//       </div>
//     );
//   };

//   /* =========================================================
//      SECTION
//   ========================================================= */

//   const renderSection = (
//     title,
//     ordersList,
//     showCount = true
//   ) => {
//     if (!ordersList.length) return null;

//     return (
//       <section className="mb-7 animate-[fadeIn_0.35s_ease-out]">
//         <div className="
//           mb-3
//           flex
//           items-center
//           justify-between
//           px-0.5
//         ">
//           <div className="flex items-center gap-2">
//             <div className="
//               h-5
//               w-1
//               rounded-full
//               bg-gradient-to-b
//               from-blue-500
//               to-purple-500
//             " />

//             <h2 className="text-sm font-bold text-gray-800">
//               {title}
//             </h2>

//             {showCount && (
//               <span className="
//                 flex
//                 h-5
//                 min-w-[22px]
//                 items-center
//                 justify-center
//                 rounded-full
//                 bg-white
//                 px-1.5
//                 text-[9px]
//                 font-bold
//                 text-gray-500
//                 shadow-sm
//                 ring-1
//                 ring-gray-100
//               ">
//                 {ordersList.length}
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Desktop */}

//         <div className="
//           hidden
//           overflow-hidden
//           rounded-2xl
//           border
//           border-gray-200
//           bg-white
//           shadow-sm
//           lg:block
//         ">
//           <div className="
//             grid
//             grid-cols-[50px_minmax(150px,1.1fr)_minmax(180px,1.5fr)_140px_120px_110px_30px]
//             items-center
//             gap-3
//             border-b
//             border-gray-200
//             bg-gray-50/80
//             px-4
//             py-2.5
//             text-[9px]
//             font-bold
//             uppercase
//             tracking-wider
//             text-gray-400
//           ">
//             <div>#</div>
//             <div>Order ID</div>
//             <div>Party</div>
//             <div>Type</div>
//             <div>Status</div>
//             <div className="text-right">
//               Created
//             </div>
//             <div />
//           </div>

//           {ordersList.map((order, index) =>
//             renderDesktopRow(
//               order,
//               index
//             )
//           )}
//         </div>

//         {/* Mobile */}

//         <div className="
//           grid
//           grid-cols-1
//           gap-3
//           sm:grid-cols-2
//           lg:hidden
//         ">
//           {ordersList.map((order) =>
//             renderMobileCard(order)
//           )}
//         </div>
//       </section>
//     );
//   };

//   /* =========================================================
//      LOADING
//   ========================================================= */

//   if (isLoading) {
//     return (
//       <div className="
//         flex
//         min-h-[60vh]
//         items-center
//         justify-center
//         bg-gray-50
//       ">
//         <div className="flex flex-col items-center gap-3">
//           <div className="
//             flex
//             h-12
//             w-12
//             items-center
//             justify-center
//             rounded-2xl
//             bg-blue-50
//             text-blue-600
//           ">
//             <FaSyncAlt
//               className="animate-spin"
//               size={18}
//             />
//           </div>

//           <div className="text-center">
//             <p className="text-sm font-semibold text-gray-700">
//               Loading orders
//             </p>

//             <p className="mt-1 text-[10px] text-gray-400">
//               Please wait...
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   /* =========================================================
//      FINAL UI
//   ========================================================= */

//   return (
//     <div className="
//       min-h-full
//       bg-gray-50
//       px-3
//       py-4
//       pb-24
//       sm:px-5
//       lg:px-6
//       lg:py-5
//     ">
//       <div className="mx-auto max-w-[1600px]">

//         {/* =================================================
//             HEADER
//         ================================================= */}

//         <div className="
//           mb-5
//           flex
//           flex-col
//           gap-4
//           lg:flex-row
//           lg:items-center
//           lg:justify-between
//         ">
//           <div>
//             <div className="flex items-center gap-2">
//               <div className="
//                 flex
//                 h-9
//                 w-9
//                 items-center
//                 justify-center
//                 rounded-xl
//                 bg-blue-50
//                 text-blue-600
//                 shadow-sm
//               ">
//                 <FaInbox size={15} />
//               </div>

//               <div>
//                 <div className="flex items-center gap-2">
//                   <h1 className="
//                     text-xl
//                     font-bold
//                     tracking-tight
//                     text-gray-900
//                     sm:text-2xl
//                   ">
//                     Orders
//                   </h1>

//                   {isFetching && (
//                     <span className="
//                       inline-flex
//                       items-center
//                       gap-1
//                       rounded-full
//                       bg-blue-50
//                       px-2
//                       py-1
//                       text-[8px]
//                       font-bold
//                       text-blue-600
//                     ">
//                       <FaSyncAlt className="animate-spin" />
//                       Updating
//                     </span>
//                   )}
//                 </div>

//                 <p className="
//                   mt-0.5
//                   text-[10px]
//                   text-gray-400
//                   sm:text-xs
//                 ">
//                   Manage and verify customer orders
//                   quickly.
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Actions */}

//           <div className="flex items-center gap-2">
//             <div className="
//               hidden
//               items-center
//               gap-1.5
//               rounded-xl
//               border
//               border-gray-200
//               bg-white
//               px-3
//               py-2
//               text-[9px]
//               text-gray-400
//               shadow-sm
//               xl:flex
//             ">
//               <FaKeyboard />

//               <span>
//                 <b className="text-gray-600">
//                   Ctrl + N
//                 </b>{" "}
//                 Create
//               </span>
//             </div>

//             <button
//               type="button"
//               onClick={() => refetch()}
//               disabled={isFetching}
//               title="Refresh orders"
//               className="
//                 flex
//                 h-10
//                 w-10
//                 items-center
//                 justify-center
//                 rounded-xl
//                 border
//                 border-gray-200
//                 bg-white
//                 text-gray-500
//                 shadow-sm
//                 transition-all
//                 duration-200
//                 hover:-translate-y-0.5
//                 hover:border-blue-200
//                 hover:bg-blue-50
//                 hover:text-blue-600
//                 hover:shadow-md
//                 disabled:cursor-not-allowed
//                 disabled:opacity-50
//               "
//             >
//               <FaSyncAlt
//                 className={
//                   isFetching
//                     ? "animate-spin"
//                     : ""
//                 }
//                 size={13}
//               />
//             </button>

//             <button
//               type="button"
//               onClick={() => setShowModal(true)}
//               className="
//                 flex
//                 h-10
//                 items-center
//                 justify-center
//                 gap-2
//                 rounded-xl
//                 bg-gradient-to-r
//                 from-blue-600
//                 to-blue-500
//                 px-4
//                 text-xs
//                 font-bold
//                 text-white
//                 shadow-sm
//                 transition-all
//                 duration-200
//                 hover:-translate-y-0.5
//                 hover:from-blue-700
//                 hover:to-blue-600
//                 hover:shadow-lg
//                 active:scale-[0.98]
//                 sm:px-5
//                 sm:text-sm
//               "
//             >
//               <FaPlus size={11} />

//               <span>
//                 Create Order
//               </span>
//             </button>
//           </div>
//         </div>

//         {/* =================================================
//             STATS
//         ================================================= */}

//         <div className="
//           mb-5
//           grid
//           grid-cols-2
//           gap-3
//           lg:grid-cols-4
//         ">
//           {/* Total */}

//           <div className="
//             group
//             rounded-2xl
//             border
//             border-gray-200
//             bg-white
//             p-4
//             shadow-sm
//             transition-all
//             duration-300
//             hover:-translate-y-1
//             hover:border-blue-200
//             hover:shadow-md
//           ">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="
//                   text-[9px]
//                   font-bold
//                   uppercase
//                   tracking-wider
//                   text-gray-400
//                 ">
//                   Orders in View
//                 </p>

//                 <p className="
//                   mt-1
//                   text-2xl
//                   font-bold
//                   text-gray-900
//                 ">
//                   {stats.total}
//                 </p>
//               </div>

//               <div className="
//                 flex
//                 h-10
//                 w-10
//                 items-center
//                 justify-center
//                 rounded-xl
//                 bg-blue-50
//                 text-blue-600
//                 transition-transform
//                 duration-300
//                 group-hover:scale-110
//               ">
//                 <FaInbox size={15} />
//               </div>
//             </div>
//           </div>

//           {/* Today */}

//           <div className="
//             group
//             rounded-2xl
//             border
//             border-gray-200
//             bg-white
//             p-4
//             shadow-sm
//             transition-all
//             duration-300
//             hover:-translate-y-1
//             hover:border-emerald-200
//             hover:shadow-md
//           ">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="
//                   text-[9px]
//                   font-bold
//                   uppercase
//                   tracking-wider
//                   text-gray-400
//                 ">
//                   Today
//                 </p>

//                 <p className="
//                   mt-1
//                   text-2xl
//                   font-bold
//                   text-gray-900
//                 ">
//                   {stats.today}
//                 </p>
//               </div>

//               <div className="
//                 flex
//                 h-10
//                 w-10
//                 items-center
//                 justify-center
//                 rounded-xl
//                 bg-emerald-50
//                 text-emerald-600
//                 transition-transform
//                 duration-300
//                 group-hover:scale-110
//               ">
//                 <FaCheckCircle size={15} />
//               </div>
//             </div>
//           </div>

//           {/* Yesterday */}

//           <div className="
//             group
//             rounded-2xl
//             border
//             border-gray-200
//             bg-white
//             p-4
//             shadow-sm
//             transition-all
//             duration-300
//             hover:-translate-y-1
//             hover:border-amber-200
//             hover:shadow-md
//           ">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="
//                   text-[9px]
//                   font-bold
//                   uppercase
//                   tracking-wider
//                   text-gray-400
//                 ">
//                   Yesterday
//                 </p>

//                 <p className="
//                   mt-1
//                   text-2xl
//                   font-bold
//                   text-gray-900
//                 ">
//                   {stats.yesterday}
//                 </p>
//               </div>

//               <div className="
//                 flex
//                 h-10
//                 w-10
//                 items-center
//                 justify-center
//                 rounded-xl
//                 bg-amber-50
//                 text-amber-600
//                 transition-transform
//                 duration-300
//                 group-hover:scale-110
//               ">
//                 <FaClock size={15} />
//               </div>
//             </div>
//           </div>

//           {/* Types */}

//           <div className="
//             group
//             rounded-2xl
//             border
//             border-gray-200
//             bg-white
//             p-4
//             shadow-sm
//             transition-all
//             duration-300
//             hover:-translate-y-1
//             hover:border-purple-200
//             hover:shadow-md
//           ">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="
//                   text-[9px]
//                   font-bold
//                   uppercase
//                   tracking-wider
//                   text-gray-400
//                 ">
//                   Order Types
//                 </p>

//                 <p className="
//                   mt-1
//                   text-2xl
//                   font-bold
//                   text-gray-900
//                 ">
//                   {stats.categories}
//                 </p>
//               </div>

//               <div className="
//                 flex
//                 h-10
//                 w-10
//                 items-center
//                 justify-center
//                 rounded-xl
//                 bg-purple-50
//                 text-purple-600
//                 transition-transform
//                 duration-300
//                 group-hover:scale-110
//               ">
//                 <FaMobileAlt size={15} />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* =================================================
//             SEARCH / FILTER
//         ================================================= */}

//         <div className="
//           mb-5
//           rounded-2xl
//           border
//           border-gray-200
//           bg-white
//           p-2
//           shadow-sm
//           transition-shadow
//           duration-300
//           focus-within:shadow-md
//         ">
//           <div className="
//             flex
//             flex-col
//             gap-2
//             lg:flex-row
//           ">
//             <div className="relative flex-1">
//               <FaSearch
//                 className="
//                   pointer-events-none
//                   absolute
//                   left-3
//                   top-1/2
//                   -translate-y-1/2
//                   text-[11px]
//                   text-gray-400
//                 "
//               />

//               <input
//                 ref={searchInputRef}
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) =>
//                   setSearchTerm(e.target.value)
//                 }
//                 placeholder="Search order ID, party or mobile..."
//                 className="
//                   h-10
//                   w-full
//                   rounded-xl
//                   border
//                   border-gray-200
//                   bg-gray-50
//                   pl-9
//                   pr-10
//                   text-xs
//                   text-gray-800
//                   outline-none
//                   transition-all
//                   duration-200
//                   focus:border-blue-300
//                   focus:bg-white
//                   focus:ring-4
//                   focus:ring-blue-50
//                   sm:text-sm
//                 "
//               />

//               {!searchTerm && (
//                 <span className="
//                   absolute
//                   right-3
//                   top-1/2
//                   hidden
//                   h-6
//                   w-6
//                   -translate-y-1/2
//                   items-center
//                   justify-center
//                   rounded-md
//                   border
//                   border-gray-200
//                   bg-white
//                   text-[9px]
//                   font-bold
//                   text-gray-400
//                   sm:flex
//                 ">
//                   /
//                 </span>
//               )}

//               {searchTerm && (
//                 <button
//                   type="button"
//                   onClick={() =>
//                     setSearchTerm("")
//                   }
//                   className="
//                     absolute
//                     right-3
//                     top-1/2
//                     flex
//                     h-6
//                     w-6
//                     -translate-y-1/2
//                     items-center
//                     justify-center
//                     rounded-md
//                     text-gray-400
//                     transition
//                     hover:bg-gray-100
//                     hover:text-gray-700
//                   "
//                 >
//                   <FaTimes size={10} />
//                 </button>
//               )}
//             </div>

//             <div className="flex items-center">
//               <CRMOrderListFilterMenu
//                 filterStatus={filterStatus}
//                 setFilterStatus={setFilterStatus}
//               />
//             </div>
//           </div>
//         </div>

//         {/* =================================================
//             FILTER INDICATOR
//         ================================================= */}

//         <div className="
//           mb-4
//           flex
//           items-center
//           justify-between
//         ">
//           <div className="flex items-center gap-2">
//             <span className="
//               text-[10px]
//               font-medium
//               text-gray-400
//             ">
//               Showing
//             </span>

//             <span
//               className={`
//                 rounded-lg
//                 border
//                 px-2.5
//                 py-1
//                 text-[9px]
//                 font-bold
//                 ${getStatusStyle(
//                   filterStatus
//                 )}
//               `}
//             >
//               {String(
//                 filterStatus
//               ).replaceAll("_", " ")}
//             </span>

//             <span className="
//               text-[10px]
//               text-gray-400
//             ">
//               • {filteredOrders.length} orders
//             </span>
//           </div>
//         </div>

//         {/* =================================================
//             ORDERS
//         ================================================= */}

//         {filteredOrders.length === 0 ? (
//           <div className="
//             flex
//             min-h-[300px]
//             flex-col
//             items-center
//             justify-center
//             rounded-2xl
//             border
//             border-gray-200
//             bg-white
//             px-5
//             text-center
//             shadow-sm
//           ">
//             <div className="
//               mb-3
//               flex
//               h-14
//               w-14
//               items-center
//               justify-center
//               rounded-2xl
//               bg-gray-50
//               text-gray-300
//             ">
//               <FaInbox size={20} />
//             </div>

//             <h3 className="
//               text-sm
//               font-bold
//               text-gray-700
//             ">
//               No orders found
//             </h3>

//             <p className="
//               mt-1
//               max-w-sm
//               text-[10px]
//               text-gray-400
//             ">
//               {searchTerm
//                 ? "Try another order ID, party name or mobile number."
//                 : `There are no ${String(
//                     filterStatus
//                   ).toLowerCase()} orders right now.`}
//             </p>

//             {searchTerm && (
//               <button
//                 type="button"
//                 onClick={() =>
//                   setSearchTerm("")
//                 }
//                 className="
//                   mt-4
//                   rounded-lg
//                   bg-blue-50
//                   px-3
//                   py-1.5
//                   text-[10px]
//                   font-bold
//                   text-blue-600
//                   transition
//                   hover:bg-blue-100
//                 "
//               >
//                 Clear Search
//               </button>
//             )}
//           </div>
//         ) : (
//           <>
//             {renderSection(
//               "Today",
//               groupedOrders.today
//             )}

//             {renderSection(
//               "Yesterday",
//               groupedOrders.yesterday
//             )}

//             {renderSection(
//               "Older Orders",
//               groupedOrders.older
//             )}
//           </>
//         )}
//       </div>

//       {/* =====================================================
//           CREATE ORDER MODAL
//       ===================================================== */}

//       <SimpleOrderCreateModal
//         showModal={showModal}
//         setShowModal={setShowModal}
//       />

//       {/* =====================================================
//           SMALL ANIMATION
//       ===================================================== */}

//       <style>
//         {`
//           @keyframes fadeIn {
//             from {
//               opacity: 0;
//               transform: translateY(6px);
//             }
//             to {
//               opacity: 1;
//               transform: translateY(0);
//             }
//           }
//         `}
//       </style>
//     </div>
//   );
// }