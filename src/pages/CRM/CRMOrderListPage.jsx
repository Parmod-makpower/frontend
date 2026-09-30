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
    <p className="text-center text-[13px] text-gray-500 mt-1 animate-pulse">
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



// import {
//   memo,
//   useMemo,
//   useState,
//   useEffect,
//   useRef,
// } from "react";
// import { useNavigate } from "react-router-dom";

// import BackButton from "../../Layout/BackButton";

// import {
//   FaCalendarAlt,
//   FaHeadphonesAlt,
//   FaMobileAlt,
//   FaSyncAlt,
//   FaSearch,
//   FaShoppingCart,
//   FaBatteryFull,
//   FaClock,
//   FaPlus,
//   FaTimes,
//   FaChevronDown,
//   FaCheck,
// } from "react-icons/fa";

// import { IoChevronForward } from "react-icons/io5";

// import { useCRMOrders } from "../../hooks/useCRMOrders";
// import { useAuth } from "../../context/AuthContext";
// import { useCachedSSUsers } from "../../auth/useSS";
// import { useCreateSimpleOrder } from "../../hooks/CRM/useCreateSimpleOrder";
// import { useQueryClient } from "@tanstack/react-query";

// /* =========================================================
//    CONSTANTS
// ========================================================= */

// const STORAGE_KEY = "crm_order_filter_status";

// /* =========================================================
//    ORDER BADGE
// ========================================================= */

// const getOrderBadge = (note) => {
//   const n = String(note || "").toLowerCase();

//   if (n.includes("battery")) {
//     return {
//       label: "Battery",
//       icon: <FaBatteryFull />,
//       className: "border-amber-100 bg-amber-50 text-amber-700",
//       iconClass: "text-amber-500",
//     };
//   }

//   if (n.includes("non") || n.includes("accessor")) {
//     return {
//       label: "Accessories",
//       icon: <FaHeadphonesAlt />,
//       className: "border-violet-100 bg-violet-50 text-violet-700",
//       iconClass: "text-violet-500",
//     };
//   }

//   if (n.includes("tempered")) {
//     return {
//       label: "Tempered",
//       icon: <FaMobileAlt />,
//       className: "border-sky-100 bg-sky-50 text-sky-700",
//       iconClass: "text-sky-500",
//     };
//   }

//   return {
//     label: "General",
//     icon: <FaShoppingCart />,
//     className: "border-slate-200 bg-slate-50 text-slate-600",
//     iconClass: "text-slate-400",
//   };
// };

// /* =========================================================
//    SECTION LABEL
// ========================================================= */

// const SectionLabel = memo(({ title, count }) => (
//   <div className="mb-2 mt-5 flex items-center gap-2 px-1 first:mt-0">
//     <span className="h-4 w-[3px] rounded-full bg-red-500" />

//     <p className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-slate-700">
//       {title}
//     </p>

//     {typeof count === "number" && (
//       <span className="rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-[9px] font-bold text-red-600">
//         {count}
//       </span>
//     )}
//   </div>
// ));

// SectionLabel.displayName = "SectionLabel";

// /* =========================================================
//    ORDER CARD
// ========================================================= */

// const OrderCard = memo(({ order, onClick }) => {
//   const badge = getOrderBadge(order.note);

//   const formattedDate = new Date(order.created_at).toLocaleString(
//     "en-IN",
//     {
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//       hour12: true,
//     }
//   );

//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       className="
//         group
//         relative
//         w-full
//         overflow-hidden
//         rounded-xl
//         border
//         border-slate-200
//         bg-white
//         p-4
//         text-left
//         cursor-pointer
//         shadow-[0_2px_8px_rgba(15,23,42,0.035)]

//         transition-all
//         duration-200
//         ease-out

//         hover:-translate-y-[2px]
//         hover:border-red-200
//         hover:shadow-[0_10px_26px_rgba(15,23,42,0.08)]

//         active:scale-[0.995]

//         focus:outline-none
//         focus:ring-2
//         focus:ring-red-100
//       "
//     >
//       {/* LEFT ACCENT */}

//       <span
//         className="
//           absolute
//           left-0
//           top-0
//           h-full
//           w-[3px]
//           bg-gradient-to-b
//           from-red-500
//           to-orange-400
//           transition-all
//           duration-200
//           group-hover:w-[4px]
//         "
//       />

//       {/* TOP */}

//       <div className="flex items-start justify-between gap-3">
//         <div className="min-w-0">
//           <div className="flex items-center gap-2">
//             <h2 className="truncate text-[13px] font-extrabold tracking-tight text-slate-900">
//               {order.order_id}
//             </h2>

//             <span
//               className={`
//                 inline-flex
//                 shrink-0
//                 items-center
//                 gap-1.5
//                 rounded-full
//                 border
//                 px-2
//                 py-1
//                 text-[10px]
//                 font-bold
//                 ${badge.className}
//               `}
//             >
//               <span className={badge.iconClass}>
//                 {badge.icon}
//               </span>

//               {badge.label}
//             </span>
//           </div>

//           <p className="mt-2 truncate text-[13px] font-semibold text-slate-600">
//             {order.ss_party_name}
//           </p>
//         </div>

//         <span
//           className="
//             flex
//             h-7
//             w-7
//             shrink-0
//             items-center
//             justify-center
//             rounded-lg
//             bg-slate-50
//             text-slate-300

//             transition-all
//             duration-200

//             group-hover:bg-red-50
//             group-hover:text-red-500
//             group-hover:translate-x-0.5
//           "
//         >
//           <IoChevronForward size={13} />
//         </span>
//       </div>

//       {/* BOTTOM META */}

//       <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
//         <div className="flex items-center gap-1.5 text-[9px] font-medium text-slate-400">
//           <FaCalendarAlt className="text-[9px] text-slate-300" />

//           <span>{formattedDate}</span>
//         </div>

//         <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-300 transition-colors group-hover:text-red-400">
//           <FaClock className="text-[10px]" />
//           Order
//         </span>
//       </div>
//     </button>
//   );
// });

// OrderCard.displayName = "OrderCard";

// /* =========================================================
//    STATUS FILTER
//    Replaces CRMOrderListFilterMenu
// ========================================================= */

// const StatusFilter = memo(({ filterStatus, setFilterStatus }) => {
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);

//   const options = [
//     {
//       value: "PENDING",
//       label: "Pending",
//       icon: "⏳",
//     },
//     {
//       value: "HOLD",
//       label: "Hold",
//       icon: "⏸",
//     },
//     {
//       value: "REJECTED",
//       label: "Rejected",
//       icon: "×",
//     },
//   ];

//   const selected =
//     options.find((item) => item.value === filterStatus) ||
//     options[0];

//   useEffect(() => {
//     const handleOutside = (event) => {
//       if (!ref.current?.contains(event.target)) {
//         setOpen(false);
//       }
//     };

//     const handleEscape = (event) => {
//       if (event.key === "Escape") {
//         setOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleOutside);
//     document.addEventListener("keydown", handleEscape);

//     return () => {
//       document.removeEventListener("mousedown", handleOutside);
//       document.removeEventListener("keydown", handleEscape);
//     };
//   }, []);

//   const handleSelect = (value) => {
//     setFilterStatus(value);
//     localStorage.setItem(STORAGE_KEY, value);
//     setOpen(false);
//   };

//   return (
//     <div ref={ref} className="relative">
//       <button
//         type="button"
//         onClick={() => setOpen((prev) => !prev)}
//         className="
//           flex
//           h-10
//           min-w-[118px]
//           items-center
//           justify-between
//           gap-2
//           rounded-lg
//           border
//           border-slate-200
//           bg-white
//           px-3

//           text-left

//           transition-all
//           duration-150

//           hover:border-red-200
//           hover:bg-red-50/40

//           focus:outline-none
//         "
//       >
//         <span className="flex items-center gap-2">
//           <span className="text-[12px]">
//             {selected.icon}
//           </span>

//           <span className="text-[10px] font-bold text-slate-700">
//             {selected.label}
//           </span>
//         </span>

//         <FaChevronDown
//           className={`
//             text-[10px]
//             text-slate-400
//             transition-transform
//             duration-150
//             ${open ? "rotate-180" : ""}
//           `}
//         />
//       </button>

//       {open && (
//         <div
//           className="
//             absolute
//             right-0
//             top-[calc(100%+6px)]
//             z-50
//             w-[150px]
//             overflow-hidden
//             rounded-xl
//             border
//             border-slate-200
//             bg-white
//             p-1
//             shadow-[0_12px_30px_rgba(15,23,42,0.12)]
//           "
//         >
//           <div className="px-2.5 pb-1.5 pt-2">
//             <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
//               Order Status
//             </p>
//           </div>

//           {options.map((option) => {
//             const active = option.value === filterStatus;

//             return (
//               <button
//                 key={option.value}
//                 type="button"
//                 onClick={() => handleSelect(option.value)}
//                 className={`
//                   flex
//                   w-full
//                   items-center
//                   justify-between
//                   rounded-lg
//                   px-2.5
//                   py-2
//                   text-left
//                   transition-colors

//                   ${
//                     active
//                       ? "bg-red-50 text-red-600"
//                       : "text-slate-600 hover:bg-slate-50"
//                   }
//                 `}
//               >
//                 <span className="flex items-center gap-2">
//                   <span className="w-4 text-center text-[13px]">
//                     {option.icon}
//                   </span>

//                   <span className="text-[10px] font-semibold">
//                     {option.label}
//                   </span>
//                 </span>

//                 {active && (
//                   <FaCheck className="text-[10px] text-red-500" />
//                 )}
//               </button>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// });

// StatusFilter.displayName = "StatusFilter";

// /* =========================================================
//    CREATE ORDER MODAL
//    Replaces SimpleOrderCreateModal
// ========================================================= */

// const SimpleOrderCreateModal = memo(
//   ({ showModal, setShowModal }) => {
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

//     const inputRef = useRef(null);

//     useEffect(() => {
//       if (!showModal) return;

//       const timer = setTimeout(() => {
//         inputRef.current?.focus();
//       }, 50);

//       return () => clearTimeout(timer);
//     }, [showModal]);

//     useEffect(() => {
//       if (!searchTerm || isSelecting) {
//         setFilteredUsers([]);
//         return;
//       }

//       const term = searchTerm.toLowerCase();

//       const filtered = ssUsers.filter((ss) =>
//         String(ss?.party_name || "")
//           .toLowerCase()
//           .includes(term)
//       );

//       setFilteredUsers(filtered);
//       setHighlightIndex(0);
//     }, [
//       searchTerm,
//       ssUsers,
//       isSelecting,
//     ]);

//     if (!showModal) {
//       return null;
//     }

//     const handleKeyDown = (e) => {
//       if (!filteredUsers.length) {
//         if (e.key === "Escape") {
//           setShowModal(false);
//         }

//         return;
//       }

//       if (e.key === "ArrowDown") {
//         e.preventDefault();

//         setHighlightIndex((prev) =>
//           prev < filteredUsers.length - 1
//             ? prev + 1
//             : prev
//         );
//       }

//       if (e.key === "ArrowUp") {
//         e.preventDefault();

//         setHighlightIndex((prev) =>
//           prev > 0 ? prev - 1 : 0
//         );
//       }

//       if (e.key === "Enter") {
//         e.preventDefault();

//         const ss =
//           filteredUsers[highlightIndex];

//         if (ss) {
//           handleSelectSS(ss);
//         }
//       }

//       if (e.key === "Escape") {
//         setFilteredUsers([]);
//       }
//     };

//     const handleSelectSS = (ss) => {
//       setIsSelecting(true);
//       setSelectedSS(ss);
//       setSearchTerm(ss.party_name);
//       setFilteredUsers([]);
//     };

//     const handleChange = (e) => {
//       setIsSelecting(false);
//       setSelectedSS(null);
//       setSearchTerm(e.target.value);
//     };

//     const handleClose = () => {
//       if (loading) return;

//       setSelectedSS(null);
//       setSearchTerm("");
//       setFilteredUsers([]);
//       setIsSelecting(false);
//       setShowModal(false);
//     };

//     const handleCreate = () => {
//       if (!selectedSS) {
//         alert("Party select kare");
//         inputRef.current?.focus();
//         return;
//       }

//       setLoading(true);

//       createOrder.mutate(
//         {
//           ss_id: selectedSS.id,
//           crm_id: user.id,
//         },
//         {
//           onSuccess: () => {
//             queryClient.invalidateQueries({
//               queryKey: ["crmOrders"],
//               exact: false,
//             });

//             setSelectedSS(null);
//             setSearchTerm("");
//             setFilteredUsers([]);
//             setIsSelecting(false);
//             setShowModal(false);
//             setLoading(false);
//           },

//           onError: () => {
//             alert("Order create failed");
//             setLoading(false);
//           },
//         }
//       );
//     };

//     return (
//       <div
//         className="
//           fixed
//           inset-0
//           z-[100]
//           flex
//           items-center
//           justify-center
//           bg-slate-950/40
//           p-4
//           backdrop-blur-[2px]
//         "
//         onMouseDown={(e) => {
//           if (e.target === e.currentTarget) {
//             handleClose();
//           }
//         }}
//       >
//         <div
//   className="
//     relative
//     w-full
//     max-w-[420px]
//     overflow-visible
//     rounded-2xl
//     border
//     border-slate-200
//     bg-white
//     shadow-[0_24px_70px_rgba(15,23,42,0.20)]
//   "
// >
//           {/* MODAL HEADER */}

//           <div
//             className="
//               flex
//               items-center
//               justify-between
//               border-b
//               border-slate-100
//               bg-gradient-to-r
//               from-red-50
//               via-white
//               to-orange-50
//               px-5
//               py-4
//             "
//           >
//             <div className="flex items-center gap-3">
//               <div
//                 className="
//                   flex
//                   h-9
//                   w-9
//                   items-center
//                   justify-center
//                   rounded-xl
//                   bg-red-500
//                   text-white
//                   shadow-sm
//                 "
//               >
//                 <FaPlus size={12} />
//               </div>

//               <div>
//                 <h2 className="text-[13px] font-extrabold text-slate-800">
//                   Create Empty Order
//                 </h2>

//                 <p className="mt-0.5 text-[9px] font-medium text-slate-400">
//                   Select an SS party to create a new order
//                 </p>
//               </div>
//             </div>

//             <button
//               type="button"
//               onClick={handleClose}
//               disabled={loading}
//               className="
//                 flex
//                 h-8
//                 w-8
//                 items-center
//                 justify-center
//                 rounded-lg
//                 text-slate-400
//                 transition-colors
//                 hover:bg-red-50
//                 hover:text-red-500
//                 disabled:opacity-40
//               "
//             >
//               <FaTimes size={11} />
//             </button>
//           </div>

//           {/* MODAL BODY */}

//           <div className="p-5">
//             <label className="mb-2 block text-[9px] font-extrabold uppercase tracking-wider text-slate-500">
//               Super Stockist
//             </label>

//             <div className="relative">
//               <FaSearch
//                 className="
//                   pointer-events-none
//                   absolute
//                   left-3
//                   top-1/2
//                   -translate-y-1/2
//                   text-[10px]
//                   text-slate-400
//                 "
//               />

//               <input
//                 ref={inputRef}
//                 type="text"
//                 value={searchTerm}
//                 placeholder="Search party name..."
//                 onChange={handleChange}
//                 onKeyDown={handleKeyDown}
//                 className="
//                   h-11
//                   w-full
//                   rounded-xl
//                   border
//                   border-slate-200
//                   bg-slate-50
//                   pl-9
//                   pr-3
//                   text-[13px]
//                   font-medium
//                   text-slate-700
//                   outline-none

//                   transition-all
//                   duration-150

//                   placeholder:text-slate-400

//                   focus:border-red-300
//                   focus:bg-white
//                   focus:ring-4
//                   focus:ring-red-500/[0.06]
//                 "
//               />

//               {selectedSS && (
//                 <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
//                   <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
//                     <FaCheck size={8} />
//                   </span>
//                 </div>
//               )}

//               {filteredUsers.length > 0 &&
//                 !isSelecting && (
//                   <div
//                     className="
//                       absolute
//                       left-0
//                       right-0
//                       top-[calc(100%+6px)]
//                       z-999
//                       max-h-52
//                       overflow-y-auto
//                       rounded-xl
//                       border
//                       border-slate-200
//                       bg-white
//                       p-1
//                       shadow-[0_14px_35px_rgba(15,23,42,0.12)]
//                     "
//                   >
//                     {filteredUsers.map(
//                       (ss, index) => (
//                         <button
//                           key={ss.id}
//                           type="button"
//                           onMouseDown={(e) =>
//                             e.preventDefault()
//                           }
//                           onClick={() =>
//                             handleSelectSS(ss)
//                           }
//                           className={`
//                             flex
//                             w-full
//                             items-center
//                             rounded-lg
//                             px-3
//                             py-2.5
//                             text-left
//                             transition-colors

//                             ${
//                               highlightIndex ===
//                               index
//                                 ? "bg-orange-50"
//                                 : "hover:bg-slate-50"
//                             }
//                           `}
//                         >
//                           <span
//                             className={`
//                               mr-2.5
//                               flex
//                               h-7
//                               w-7
//                               shrink-0
//                               items-center
//                               justify-center
//                               rounded-lg
//                               text-[9px]
//                               font-bold
//                               ${
//                                 highlightIndex ===
//                                 index
//                                   ? "bg-orange-100 text-orange-600"
//                                   : "bg-slate-100 text-slate-400"
//                               }
//                             `}
//                           >
//                             {String(
//                               ss.party_name || "?"
//                             )
//                               .charAt(0)
//                               .toUpperCase()}
//                           </span>

//                           <span className="truncate text-[10px] font-semibold text-slate-700">
//                             {ss.party_name}
//                           </span>
//                         </button>
//                       )
//                     )}
//                   </div>
//                 )}
//             </div>

//             {selectedSS && (
//               <div
//                 className="
//                   mt-3
//                   flex
//                   items-center
//                   gap-2
//                   rounded-xl
//                   border
//                   border-emerald-100
//                   bg-emerald-50/60
//                   px-3
//                   py-2.5
//                 "
//               >
//                 <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
//                   <FaCheck size={8} />
//                 </span>

//                 <div className="min-w-0">
//                   <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
//                     Selected Party
//                   </p>

//                   <p className="truncate text-[10px] font-bold text-slate-700">
//                     {selectedSS.party_name}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* MODAL FOOTER */}

//           <div
//             className="
//               flex
//               items-center
//               justify-end
//               gap-2
//               border-t
//               border-slate-100
//               bg-slate-50/60
//               px-5
//               py-3
//             "
//           >
//             <button
//               type="button"
//               onClick={handleClose}
//               disabled={loading}
//               className="
//                 h-9
//                 rounded-lg
//                 border
//                 border-slate-200
//                 bg-white
//                 px-4
//                 text-[10px]
//                 font-bold
//                 text-slate-500
//                 transition-colors
//                 hover:border-slate-300
//                 hover:bg-slate-50
//                 disabled:opacity-50
//               "
//             >
//               Cancel
//             </button>

//             <button
//               type="button"
//               onClick={handleCreate}
//               disabled={loading}
//               className="
//                 inline-flex
//                 h-9
//                 items-center
//                 gap-2
//                 rounded-lg
//                 bg-red-500
//                 px-4
//                 text-[10px]
//                 font-bold
//                 text-white
//                 shadow-sm

//                 transition-all
//                 duration-150

//                 hover:bg-red-600
//                 active:scale-[0.98]

//                 disabled:cursor-not-allowed
//                 disabled:opacity-60
//               "
//             >
//               {loading ? (
//                 <>
//                   <FaSyncAlt
//                     size={9}
//                     className="animate-spin"
//                   />

//                   Creating...
//                 </>
//               ) : (
//                 <>
//                   <FaPlus size={9} />
//                   Create Order
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }
// );

// SimpleOrderCreateModal.displayName =
//   "SimpleOrderCreateModal";

// /* =========================================================
//    CRM ORDER LIST PAGE
// ========================================================= */

// export default function CRMOrderListPage() {
//   const navigate = useNavigate();

//   const [showModal, setShowModal] = useState(false);

//   const [filterStatus, setFilterStatus] = useState(() => {
//     return (
//       localStorage.getItem(STORAGE_KEY) ||
//       "PENDING"
//     );
//   });

//   const [searchTerm, setSearchTerm] = useState("");

//   const {
//     data: orders = [],
//     isLoading,
//     isFetching,
//     refetch,
//   } = useCRMOrders(filterStatus);

//   /* =======================================================
//      SEARCH
//   ======================================================= */

//   const filteredOrders = useMemo(() => {
//     const term = searchTerm.trim().toLowerCase();

//     if (!term) {
//       return orders;
//     }

//     return orders.filter((order) => {
//       const orderId = String(
//         order?.order_id || ""
//       ).toLowerCase();

//       const partyName = String(
//         order?.ss_party_name || ""
//       ).toLowerCase();

//       return (
//         orderId.includes(term) ||
//         partyName.includes(term)
//       );
//     });
//   }, [orders, searchTerm]);

//   /* =======================================================
//      DATE GROUPING
//   ======================================================= */

//   const groupedOrders = useMemo(() => {
//     const today = [];
//     const yesterday = [];
//     const older = [];

//     const now = new Date();

//     const yesterdayDate = new Date(now);

//     yesterdayDate.setDate(
//       yesterdayDate.getDate() - 1
//     );

//     filteredOrders.forEach((order) => {
//       const orderDate = new Date(
//         order.created_at
//       );

//       const isToday =
//         orderDate.getDate() === now.getDate() &&
//         orderDate.getMonth() === now.getMonth() &&
//         orderDate.getFullYear() ===
//           now.getFullYear();

//       const isYesterday =
//         orderDate.getDate() ===
//           yesterdayDate.getDate() &&
//         orderDate.getMonth() ===
//           yesterdayDate.getMonth() &&
//         orderDate.getFullYear() ===
//           yesterdayDate.getFullYear();

//       if (isToday) {
//         today.push(order);
//       } else if (isYesterday) {
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

//   /* =======================================================
//      LOADING
//   ======================================================= */

//   if (isLoading) {
//     return (
//       <div className="flex min-h-[50vh] items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <div
//             className="
//               flex
//               h-10
//               w-10
//               items-center
//               justify-center
//               rounded-xl
//               border
//               border-red-100
//               bg-red-50
//               text-red-500
//             "
//           >
//             <FaSyncAlt
//               size={14}
//               className="animate-spin"
//             />
//           </div>

//           <p className="text-[13px] font-semibold text-slate-500">
//             Loading orders...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   /* =======================================================
//      GROUP RENDER
//   ======================================================= */

//   const renderGroup = (title, items) => {
//     if (!items.length) {
//       return null;
//     }

//     return (
//       <section>
//         <SectionLabel
//           title={title}
//           count={items.length}
//         />

//         <div
//           className="
//             grid
//             grid-cols-1
//             gap-3
//             md:grid-cols-2
//             xl:grid-cols-3
//             2xl:grid-cols-4
//           "
//         >
//           {items.map((order) => (
//             <OrderCard
//               key={order.id}
//               order={order}
//               onClick={() =>
//                 navigate(
//                   `/crm/orders/${order.id}`,
//                   {
//                     state: { order },
//                   }
//                 )
//               }
//             />
//           ))}
//         </div>
//       </section>
//     );
//   };

//   /* =======================================================
//      FINAL RENDER
//   ======================================================= */

//   return (
//     <div
//       className="
//         min-h-full
//         bg-slate-50/60
//         px-3
//         pb-24
//         pt-3
//       "
//     >
//       <div className="mx-auto w-full max-w-[1500px]">

//         {/* =================================================
//             NEW CRM HEADER
//         ================================================= */}

//         <header
//           className="
            
//             z-40
//             mb-5

//             overflow-visible
//             rounded-xl

//             border
//             border-slate-200

//             bg-white

//             shadow-[0_5px_22px_rgba(15,23,42,0.055)]
//           "
//         >
//           {/* TOP HEADER */}

//           <div
//             className="
//               flex
//               flex-col
//               gap-3
//               p-3

//               lg:flex-row
//               lg:items-center
//             "
//           >
//             {/* LEFT */}

//             <div
//               className="
//                 flex
//                 shrink-0
//                 items-center
//                 gap-3
//               "
//             >
//               <div className="hidden md:block">
//                 <BackButton />
//               </div>

//               <div
//                 className="
//                   hidden
//                   h-10
//                   w-10
//                   items-center
//                   justify-center
//                   rounded-xl
//                   bg-gradient-to-br
//                   from-red-500
//                   to-orange-500
//                   text-white
//                   shadow-sm
//                   md:flex
//                 "
//               >
//                 <FaShoppingCart size={14} />
//               </div>

//               <div className="min-w-0">
//                 <div className="flex items-center gap-2">
//                   <h1 className="text-[13px] font-extrabold tracking-tight text-slate-800">
//                     CRM Orders
//                   </h1>

//                   <span
//                     className="
//                       rounded-full
//                       bg-red-50
//                       px-2
//                       py-0.5
//                       text-[10px]
//                       font-bold
//                       text-red-500
//                     "
//                   >
//                     {filterStatus}
//                   </span>
//                 </div>

//                 <p className="mt-0.5 text-[9px] font-medium text-slate-400">
//                   Manage and track CRM orders
//                 </p>
//               </div>
//             </div>

//             {/* RIGHT CONTROLS */}

//             <div
//               className="
//                 flex
//                 min-w-0
//                 flex-1
//                 flex-col
//                 gap-2

//                 sm:flex-row
//                 sm:items-center

//                 lg:justify-end
//               "
//             >
//               {/* SEARCH */}

//               <div
//                 className="
//                   group
//                   relative
//                   min-w-0
//                   flex-1
//                   sm:max-w-[380px]
//                   lg:max-w-[440px]
//                 "
//               >
//                 <FaSearch
//                   className="
//                     pointer-events-none
//                     absolute
//                     left-3
//                     top-1/2
//                     -translate-y-1/2
//                     text-[10px]
//                     text-slate-400
//                     transition-colors
//                     duration-150
//                     group-focus-within:text-red-500
//                   "
//                 />

//                 <input
//                   type="text"
//                   placeholder="Search order ID or party name..."
//                   value={searchTerm}
//                   onChange={(e) =>
//                     setSearchTerm(
//                       e.target.value
//                     )
//                   }
//                   className="
//                     h-10
//                     w-full
//                     rounded-xl
//                     border
//                     border-slate-200
//                     bg-slate-50
//                     pl-9
//                     pr-9
//                     text-[10px]
//                     font-medium
//                     text-slate-700
//                     outline-none

//                     transition-all
//                     duration-150

//                     placeholder:text-slate-400

//                     hover:border-slate-300

//                     focus:border-red-300
//                     focus:bg-white
//                     focus:ring-4
//                     focus:ring-red-500/[0.05]
//                   "
//                 />

//                 {searchTerm && (
//                   <button
//                     type="button"
//                     onClick={() =>
//                       setSearchTerm("")
//                     }
//                     className="
//                       absolute
//                       right-2.5
//                       top-1/2
//                       flex
//                       h-6
//                       w-6
//                       -translate-y-1/2
//                       items-center
//                       justify-center
//                       rounded-md
//                       text-slate-300
//                       transition-colors
//                       hover:bg-red-50
//                       hover:text-red-500
//                     "
//                   >
//                     <FaTimes size={9} />
//                   </button>
//                 )}
//               </div>

//               {/* ACTIONS */}

//               <div className="flex items-center gap-2">
//                 {/* CREATE */}

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setShowModal(true)
//                   }
//                   className="
//                     inline-flex
//                     h-10
//                     flex-1
//                     items-center
//                     justify-center
//                     gap-2
//                     rounded-xl
//                     bg-red-500
//                     px-3.5

//                     text-[10px]
//                     font-bold
//                     text-white

//                     shadow-[0_3px_10px_rgba(239,68,68,0.18)]

//                     transition-all
//                     duration-150

//                     hover:bg-red-600
//                     hover:shadow-[0_5px_14px_rgba(239,68,68,0.22)]

//                     active:scale-[0.98]

//                     sm:flex-none
//                   "
//                 >
//                   <FaPlus size={9} />

//                   <span className="hidden xs:inline sm:inline">
//                     Create Order
//                   </span>
//                 </button>

//                 {/* STATUS */}

//                 <StatusFilter
//                   filterStatus={filterStatus}
//                   setFilterStatus={
//                     setFilterStatus
//                   }
//                 />

//                 {/* REFRESH */}

//                 <button
//                   type="button"
//                   onClick={() => refetch()}
//                   disabled={isFetching}
//                   title="Refresh orders"
//                   className="
//                     flex
//                     h-10
//                     w-10
//                     shrink-0
//                     items-center
//                     justify-center
//                     rounded-xl
//                     border
//                     border-slate-200
//                     bg-white
//                     text-slate-500

//                     transition-all
//                     duration-150

//                     hover:border-red-200
//                     hover:bg-red-50
//                     hover:text-red-500

//                     active:scale-95

//                     disabled:cursor-not-allowed
//                     disabled:opacity-50
//                   "
//                 >
//                   <FaSyncAlt
//                     className={`
//                       text-[13px]
//                       ${
//                         isFetching
//                           ? "animate-spin"
//                           : ""
//                       }
//                     `}
//                   />
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* BOTTOM INFO STRIP */}

//           <div
//             className="
//               flex
//               min-h-[34px]
//               items-center
//               justify-between
//               gap-3
//               border-t
//               border-slate-100
//               bg-slate-50/50
//               px-4
//               py-2
//             "
//           >
//             <div className="flex items-center gap-2">
//               <span
//                 className="
//                   h-1.5
//                   w-1.5
//                   rounded-full
//                   bg-emerald-500
//                   shadow-[0_0_0_3px_rgba(16,185,129,0.08)]
//                 "
//               />

//               <span className="text-[9px] font-semibold text-slate-400">
//                 <span className="font-extrabold text-slate-600">
//                   {filteredOrders.length}
//                 </span>{" "}
//                 {filteredOrders.length === 1
//                   ? "order"
//                   : "orders"}{" "}
//                 found
//               </span>
//             </div>

//             <div className="flex min-w-0 items-center gap-2">
//               {searchTerm.trim() && (
//                 <span className="hidden truncate text-[9px] text-slate-400 sm:block">
//                   Search:
//                   <span className="ml-1 font-bold text-slate-600">
//                     "{searchTerm}"
//                   </span>
//                 </span>
//               )}

//               {isFetching && (
//                 <span
//                   className="
//                     flex
//                     shrink-0
//                     items-center
//                     gap-1.5
//                     text-[9px]
//                     font-semibold
//                     text-red-500
//                   "
//                 >
//                   <FaSyncAlt
//                     className="animate-spin"
//                   />
//                   Updating...
//                 </span>
//               )}
//             </div>
//           </div>
//         </header>

//         {/* =================================================
//             CREATE ORDER MODAL
//         ================================================= */}

//         <SimpleOrderCreateModal
//           showModal={showModal}
//           setShowModal={setShowModal}
//         />

//         {/* =================================================
//             ORDERS
//         ================================================= */}

//         {filteredOrders.length === 0 ? (
//           <div
//             className="
//               flex
//               min-h-[280px]
//               flex-col
//               items-center
//               justify-center
//               rounded-xl
//               border
//               border-dashed
//               border-slate-200
//               bg-white
//             "
//           >
//             <div
//               className="
//                 mb-3
//                 flex
//                 h-12
//                 w-12
//                 items-center
//                 justify-center
//                 rounded-xl
//                 bg-red-50
//                 text-red-400
//               "
//             >
//               <FaSearch size={15} />
//             </div>

//             <p className="text-[12px] font-bold text-slate-700">
//               No matching orders
//             </p>

//             <p className="mt-1 text-[10px] text-slate-400">
//               Try another order ID or party name.
//             </p>

//             {searchTerm && (
//               <button
//                 type="button"
//                 onClick={() =>
//                   setSearchTerm("")
//                 }
//                 className="
//                   mt-3
//                   rounded-lg
//                   bg-red-50
//                   px-3
//                   py-1.5
//                   text-[9px]
//                   font-bold
//                   text-red-600
//                   transition-colors
//                   hover:bg-red-100
//                 "
//               >
//                 Clear Search
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="space-y-1">
//             {renderGroup(
//               "Today",
//               groupedOrders.today
//             )}

//             {renderGroup(
//               "Yesterday",
//               groupedOrders.yesterday
//             )}

//             {renderGroup(
//               "Older Orders",
//               groupedOrders.older
//             )}
//           </div>
//         )}
//       </div>

//       {/* =====================================================
//           LIGHTWEIGHT MOTION
//       ===================================================== */}

//       <style>
//         {`
//           @media (prefers-reduced-motion: reduce) {
//             *,
//             *::before,
//             *::after {
//               animation-duration: 0.01ms !important;
//               animation-iteration-count: 1 !important;
//               transition-duration: 0.01ms !important;
//               scroll-behavior: auto !important;
//             }
//           }
//         `}
//       </style>
//     </div>
//   );
// }