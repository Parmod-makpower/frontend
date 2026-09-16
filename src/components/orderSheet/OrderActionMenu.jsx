import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FaEllipsisV, FaPauseCircle, FaTimesCircle } from "react-icons/fa";
import SSPDF from "../pdf/SSPDF";

export default function OrderActionMenu({
  order,
  notes,
  navigate,
  holdCRMOrder,
  RejectCRMOrder,
  manualAvailabilityMap,
  selectedCity,
  allProducts,
  items,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const queryClient = useQueryClient();

  // ✅ Outside click close
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* 3-dot button */}
      <button
        onClick={() => setMenuOpen((p) => !p)}
        className="p-2 rounded hover:bg-gray-200 cursor-pointer"
      >
        <FaEllipsisV size={18} />
      </button>

      {/* Dropdown */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-xl z-50">
          <ul className=" text-sm">

            {/* PDF */}
            <li className="px-3 py-2 hover:bg-gray-100 border-b">
              <SSPDF
                order={order}
                manualAvailabilityMap={manualAvailabilityMap}
                selectedCity={selectedCity}
                allProducts={allProducts}
                items={items}
              />
            </li>

            {/* Hold */}
            <li  className="border-b">
              <button
                onClick={async () => {
                  setMenuOpen(false);
                  const ok = window.confirm(
                    "Are you sure you want to place this order on HOLD?"
                  );
                  if (!ok) return;

                  await holdCRMOrder(order.id, { notes });
                  queryClient.invalidateQueries({
                    queryKey: ["crmOrders"],
                    exact: false,
                  });
                  navigate("/crm/orders");
                }}
                className="flex w-full items-center gap-2 px-3 py-2 hover:bg-gray-100"
              >
                <FaPauseCircle className="text-yellow-500" />
                Hold Order
              </button>
            </li>

            {/* Reject */}
            <li>
              <button
                onClick={async () => {
                  setMenuOpen(false);
                  const ok = window.confirm(
                    "Are you sure you want to Reject this order?"
                  );
                  if (!ok) return;

                  await RejectCRMOrder(order.id, { notes });
                  queryClient.invalidateQueries({
                    queryKey: ["crmOrders"],
                    exact: false,
                  });
                  navigate("/crm/orders");
                }}
                className="flex w-full items-center gap-2 px-3 py-2 hover:bg-gray-100"
              >
                <FaTimesCircle className="text-red-500" />
                Reject Order
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}



// import { useState, useRef, useEffect } from "react";
// import { useQueryClient } from "@tanstack/react-query";
// import {
//   FaEllipsisV,
//   FaPauseCircle,
//   FaTimesCircle,
//   FaFilePdf,
// } from "react-icons/fa";
// import { X } from "lucide-react";
// import SSPDF from "../pdf/SSPDF";

// export default function OrderActionMenu({
//   order,
//   notes,
//   navigate,
//   holdCRMOrder,
//   RejectCRMOrder,
//   manualAvailabilityMap,
//   selectedCity,
//   allProducts,
//   items,
// }) {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [processing, setProcessing] = useState(false);

//   const menuRef = useRef(null);
//   const queryClient = useQueryClient();

//   // Close menu on outside click
//   useEffect(() => {
//     function handleClickOutside(e) {
//       if (menuRef.current && !menuRef.current.contains(e.target)) {
//         setMenuOpen(false);
//       }
//     }

//     if (menuOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [menuOpen]);

//   // Close with Escape
//   useEffect(() => {
//     function handleEscape(e) {
//       if (e.key === "Escape") {
//         setMenuOpen(false);
//       }
//     }

//     if (menuOpen) {
//       document.addEventListener("keydown", handleEscape);
//     }

//     return () => {
//       document.removeEventListener("keydown", handleEscape);
//     };
//   }, [menuOpen]);

//   const handleHold = async () => {
//     setMenuOpen(false);

//     const ok = window.confirm(
//       "Are you sure you want to place this order on HOLD?"
//     );

//     if (!ok) return;

//     try {
//       setProcessing(true);

//       await holdCRMOrder(order.id, { notes });

//       queryClient.invalidateQueries({
//         queryKey: ["crmOrders"],
//         exact: false,
//       });

//       navigate("/crm/orders");
//     } catch (error) {
//       console.error("Hold order failed:", error);
//       alert("Unable to place order on HOLD. Please try again.");
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleReject = async () => {
//     setMenuOpen(false);

//     const ok = window.confirm(
//       "Are you sure you want to Reject this order?"
//     );

//     if (!ok) return;

//     try {
//       setProcessing(true);

//       await RejectCRMOrder(order.id, { notes });

//       queryClient.invalidateQueries({
//         queryKey: ["crmOrders"],
//         exact: false,
//       });

//       navigate("/crm/orders");
//     } catch (error) {
//       console.error("Reject order failed:", error);
//       alert("Unable to reject order. Please try again.");
//     } finally {
//       setProcessing(false);
//     }
//   };

//   return (
//     <div className="relative" ref={menuRef}>
//       {/* ================================
//           ACTION BUTTON
//       ================================= */}
//       <button
//         type="button"
//         disabled={processing}
//         onClick={() => setMenuOpen((p) => !p)}
//         aria-label="Order actions"
//         aria-expanded={menuOpen}
//         className={`
//           group flex h-9 w-9 items-center justify-center
//           rounded-xl border border-gray-200 bg-white
//           text-gray-500 shadow-sm
//           transition-all duration-200
//           hover:border-gray-300 hover:bg-gray-50
//           hover:text-gray-700 hover:shadow-md
//           active:scale-95
//           disabled:cursor-not-allowed disabled:opacity-50
//           ${menuOpen ? "border-gray-300 bg-gray-50 text-gray-800 shadow-md" : ""}
//         `}
//       >
//         <FaEllipsisV
//           size={15}
//           className="transition-transform duration-200 group-hover:scale-110"
//         />
//       </button>

//       {/* ================================
//           DROPDOWN
//       ================================= */}
//       {menuOpen && (
//         <div
//           className="
//             absolute right-0 top-full z-[100]
//             mt-2 w-[220px]
//             overflow-hidden
//             rounded-2xl
//             border border-gray-200
//             bg-white
//             shadow-[0_12px_35px_rgba(0,0,0,0.12)]
//             animate-[actionMenuIn_150ms_ease-out]
//           "
//         >
//           {/* Header */}
//           <div className="flex items-center justify-between border-b border-gray-100 px-3.5 py-3">
//             <div>
//               <p className="text-[12px] font-bold tracking-wide text-gray-800">
//                 Order Actions
//               </p>

//               {order?.order_id && (
//                 <p className="mt-0.5 max-w-[160px] truncate text-[10px] text-gray-400">
//                   #{order.order_id}
//                 </p>
//               )}
//             </div>

//             <button
//               type="button"
//               onClick={() => setMenuOpen(false)}
//               className="
//                 flex h-6 w-6 items-center justify-center
//                 rounded-lg text-gray-400
//                 transition hover:bg-gray-100 hover:text-gray-700
//               "
//             >
//               <X size={14} />
//             </button>
//           </div>

//           <div className="p-1.5">
//             {/* ================================
//                 PDF
//             ================================= */}
//             <div
//               className="
//                 group flex items-center gap-3
//                 rounded-xl px-2.5 py-2
//                 transition-colors hover:bg-gray-50
//               "
//             >
//               <div
//                 className="
//                   flex h-8 w-8 shrink-0 items-center justify-center
//                   rounded-lg bg-gray-100
//                   text-gray-600
//                   transition group-hover:bg-gray-200
//                 "
//               >
//                 <FaFilePdf size={14} />
//               </div>

             

            
//                 <SSPDF
//                   order={order}
//                   manualAvailabilityMap={manualAvailabilityMap}
//                   selectedCity={selectedCity}
//                   allProducts={allProducts}
//                   items={items}
//                 />
//               </div>
            

//             <div className="my-1.5 h-px bg-gray-100" />

//             {/* ================================
//                 HOLD
//             ================================= */}
//             <button
//               type="button"
//               disabled={processing}
//               onClick={handleHold}
//               className="
//                 group flex w-full items-center gap-3
//                 rounded-xl px-2.5 py-2.5
//                 text-left
//                 transition-all duration-150
//                 hover:bg-yellow-50
//                 disabled:cursor-not-allowed
//                 disabled:opacity-50
//               "
//             >
//               <div
//                 className="
//                   flex h-8 w-8 shrink-0 items-center justify-center
//                   rounded-lg bg-yellow-50
//                   text-yellow-600
//                   transition
//                   group-hover:bg-yellow-100
//                 "
//               >
//                 <FaPauseCircle size={15} />
//               </div>

//               <div className="min-w-0 flex-1">
//                 <p className="text-[12px] font-semibold text-gray-700">
//                   Hold Order
//                 </p>

//                 <p className="text-[10px] text-gray-400">
//                   Temporarily pause this order
//                 </p>
//               </div>
//             </button>

//             {/* ================================
//                 REJECT
//             ================================= */}
//             <button
//               type="button"
//               disabled={processing}
//               onClick={handleReject}
//               className="
//                 group flex w-full items-center gap-3
//                 rounded-xl px-2.5 py-2.5
//                 text-left
//                 transition-all duration-150
//                 hover:bg-red-50
//                 disabled:cursor-not-allowed
//                 disabled:opacity-50
//               "
//             >
//               <div
//                 className="
//                   flex h-8 w-8 shrink-0 items-center justify-center
//                   rounded-lg bg-red-50
//                   text-red-500
//                   transition
//                   group-hover:bg-red-100
//                 "
//               >
//                 <FaTimesCircle size={15} />
//               </div>

//               <div className="min-w-0 flex-1">
//                 <p className="text-[12px] font-semibold text-gray-700">
//                   Reject Order
//                 </p>

//                 <p className="text-[10px] text-gray-400">
//                   Permanently reject this order
//                 </p>
//               </div>
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Animation */}
//       <style>
//         {`
//           @keyframes actionMenuIn {
//             from {
//               opacity: 0;
//               transform: translateY(-5px) scale(0.98);
//             }
//             to {
//               opacity: 1;
//               transform: translateY(0) scale(1);
//             }
//           }
//         `}
//       </style>
//     </div>
//   );
// }