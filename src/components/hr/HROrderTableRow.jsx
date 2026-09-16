// import { FaCircle } from "react-icons/fa";
// import { useState } from "react";
// import { updateOrderRemarks } from "../../api/hrOrders";

// const statusConfig = {
//   PENDING: {
//     color: "text-amber-700",
//     bg: "bg-amber-100",
//     border: "border-amber-200",
//   },
//   HOLD: {
//     color: "text-gray-700",
//     bg: "bg-gray-100",
//     border: "border-gray-300",
//   },
// };

// export default function HROrderTableRow({
//   order,
//   onClick,
// }) {
//   const status =
//     statusConfig[order.status] || statusConfig.HOLD;

//   const user = JSON.parse(localStorage.getItem("user"));

//   const [remarks, setRemarks] = useState(order.notes || "");
//   const [saved, setSaved] = useState(!!order.notes);
//   const [loading, setLoading] = useState(false);

//   const saveRemarks = async (e) => {
//     e.stopPropagation();

//     if (!remarks.trim()) {
//       alert("Please enter remarks.");
//       return;
//     }

//     try {
//       setLoading(true);

//       await updateOrderRemarks(order.id, remarks);

//       setSaved(true);
//     } catch {
//       alert("Failed to save remarks.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <tr
//       onClick={onClick}
//       className="
//         group border
//         border
//         border-slate-200
//         bg-white
//         hover:bg-sky-50/70
//         transition-all
//         duration-200
//         cursor-pointer text-xs border
//       "
//     >
//       {/* Order ID */}
//       <td className="text-center font-semibold text-slate-800 whitespace-nowrap">
//         {order.order_id}
//       </td>

//       {/* Party */}
//       <td className="ps-5 py-1">
//         <div className="max-w-[250px]">
//           <p className="font-medium text-slate-800 break-words leading-6">
//             {order.ss_party_name}
//           </p>
//         </div>
//       </td>

//       {/* CRM */}
//       <td className="text-center py-1 whitespace-nowrap">
//         <span className="text-slate-700">
//           {order.crm_name || "-"}
//         </span>
//       </td>

//       {/* Date */}
//       <td className="text-center py-1 whitespace-nowrap">
//         <div className="font-medium text-slate-800">
//           {new Date(order.created_at).toLocaleDateString("en-IN")}
//         </div>

//         <div className="text-xs text-slate-500 mt-1">
//           {new Date(order.created_at).toLocaleTimeString("en-IN", {
//             hour: "2-digit",
//             minute: "2-digit",
//           })}
//         </div>
//       </td>

//       {/* Status */}
//       <td className="text-center py-1 text-center">
//         <span
//           className={`
//             inline-flex
//             items-center
//             gap-2
//             rounded-full
//             border
//             px-3
//             py-1
//             text-xs
//             font-semibold
//             shadow-sm
//             ${status.bg}
//             ${status.border}
//             ${status.color}
//           `}
//         >
//           <FaCircle className="text-[7px]" />
//           {order.status}
//         </span>
//       </td>

//       {/* Remarks */}
//       <td className="px-5 py-1">
//         {user?.role !== "CRM" ? (
//           <div className="max-w-[340px] rounded-lg bg-slate-50 p-3 text-slate-700 leading-6 border border-slate-200">
//             {order.notes || (
//               <span className="italic text-slate-400">
//                 No Remarks
//               </span>
//             )}
//           </div>
//         ) : (
//           <>
//             {saved ? (
//               <div
//                 className="max-w-[340px] rounded-lg border border-green-200 bg-green-50 p-3"
//                 title={remarks}
//               >
//                 <p className="text-slate-700 leading-6 break-words">
//                   {remarks}
//                 </p>
//               </div>
//             ) : (
//               <div
//                 onClick={(e) => e.stopPropagation()}
//                 className="flex gap-3 items-start"
//               >
//                 <textarea
//                   rows={2}
//                   value={remarks}
//                   onChange={(e) => setRemarks(e.target.value)}
//                   placeholder="Enter remarks..."
//                   className="
//                     w-72
//                     rounded
//                     border
//                     border-slate-300
//                     bg-white
//                     px-4
//                     py-1
//                     text-xs
//                     resize-none
//                     outline-none
//                     transition
//                     focus:border-blue-500
//                     focus:ring-4
//                     focus:ring-blue-100
//                   "
//                 />

//                 <button
//                   onClick={saveRemarks}
//                   disabled={loading}
//                   className="
//                     h-9 mt-1
//                     rounded
//                     bg-gradient-to-r
//                     from-blue-600
//                     to-sky-600
//                     px-3
//                     text-xs
//                     font-semibold
//                     text-white
//                     shadow-md
//                     transition
//                     hover:shadow-lg
//                     hover:scale-105
//                     active:scale-95
//                     disabled:opacity-50
//                     disabled:cursor-not-allowed
//                   "
//                 >
//                   {loading ? "Saving..." : "Save"}
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </td>
//     </tr>
//   );
// }



import {
  FaCircle,
  FaClock,
  FaUserTie,
  FaBuilding,
  FaSave,
  FaArrowRight,
  FaCheck,
  FaEdit,
} from "react-icons/fa";

import { useState } from "react";

import { updateOrderRemarks } from "../../api/hrOrders";

const statusConfig = {
  PENDING: {
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "text-amber-500",
    label: "Pending",
  },

  HOLD: {
    color: "text-slate-700",
    bg: "bg-slate-100",
    border: "border-slate-200",
    dot: "text-slate-500",
    label: "Hold",
  },
};

/* =========================================================
   HELPERS
========================================================= */

const getInitial = (name = "") => {
  return (
    name
      .trim()
      .charAt(0)
      .toUpperCase() || "?"
  );
};

const formatDate = (dateValue) => {
  if (!dateValue) return "-";

  return new Date(
    dateValue
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dateValue) => {
  if (!dateValue) return "-";

  return new Date(
    dateValue
  ).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =========================================================
   DESKTOP TABLE ROW
========================================================= */

export function HROrderTableRow({
  order,
  onClick,
}) {
  const status =
    statusConfig[order.status] ||
    statusConfig.HOLD;

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [remarks, setRemarks] = useState(
    order.notes || ""
  );

  const [saved, setSaved] = useState(
    !!order.notes
  );

  const [loading, setLoading] =
    useState(false);

  const saveRemarks = async (e) => {
    e.stopPropagation();

    if (!remarks.trim()) {
      alert("Please enter remarks.");
      return;
    }

    try {
      setLoading(true);

      await updateOrderRemarks(
        order.id,
        remarks.trim()
      );

      setSaved(true);
    } catch {
      alert("Failed to save remarks.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr
      onClick={onClick}
      className="
        group
        cursor-pointer
        bg-white
        transition-all
        duration-200
        hover:bg-blue-50/40
      "
    >

      {/* =====================================================
          ORDER
      ===================================================== */}

      <td className="border-b border-slate-100 px-5 py-4 align-middle">

        <div className="flex items-center gap-2.5">

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-extrabold text-slate-500 transition-all group-hover:bg-blue-100 group-hover:text-blue-600">
            #
          </div>

          <div className="min-w-0">

            <p className="truncate text-[11px] font-extrabold tracking-tight text-slate-800">
              {order.order_id}
            </p>

            <p className="mt-0.5 text-[9px] text-slate-400">
              Order
            </p>

          </div>

        </div>

      </td>

      {/* =====================================================
          PARTY
      ===================================================== */}

      <td className="border-b border-slate-100 px-4 py-4 align-middle">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[11px] font-extrabold text-blue-600">
            {getInitial(
              order.ss_party_name
            )}
          </div>

          <div className="min-w-0">

            <p className="max-w-[280px] truncate text-xs font-bold text-slate-800">
              {order.ss_party_name ||
                "Unknown Party"}
            </p>

            <p className="mt-0.5 flex items-center gap-1 text-[9px] font-medium text-slate-400">
              <FaBuilding size={7} />
              Super Stockist
            </p>

          </div>

        </div>

      </td>

      {/* =====================================================
          CRM
      ===================================================== */}

      <td className="border-b border-slate-100 px-4 py-4 align-middle">

        <div className="flex items-center gap-2.5">

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[10px] font-extrabold text-indigo-600">
            {getInitial(
              order.crm_name
            )}
          </div>

          <div className="min-w-0">

            <p className="max-w-[150px] truncate text-[11px] font-semibold text-slate-700">
              {order.crm_name || "-"}
            </p>

            <p className="mt-0.5 flex items-center gap-1 text-[9px] text-slate-400">
              <FaUserTie size={7} />
              CRM
            </p>

          </div>

        </div>

      </td>

      {/* =====================================================
          DATE
      ===================================================== */}

      <td className="border-b border-slate-100 px-4 py-4 align-middle">

        <div className="whitespace-nowrap">

          <p className="text-[11px] font-bold text-slate-700">
            {formatDate(
              order.created_at
            )}
          </p>

          <p className="mt-1 flex items-center gap-1 text-[9px] font-medium text-slate-400">
            <FaClock size={7} />
            {formatTime(
              order.created_at
            )}
          </p>

        </div>

      </td>

      {/* =====================================================
          STATUS
      ===================================================== */}

      <td className="border-b border-slate-100 px-4 py-4 align-middle">

        <span
          className={`
            inline-flex
            items-center
            gap-1.5
            whitespace-nowrap
            rounded-full
            border
            px-2.5
            py-1.5
            text-[9px]
            font-extrabold
            ${status.bg}
            ${status.border}
            ${status.color}
          `}
        >
          <FaCircle
            className={`
              ${status.dot}
              text-[6px]
            `}
          />

          {status.label}
        </span>

      </td>

      {/* =====================================================
          REMARKS
      ===================================================== */}

      <td className="border-b border-slate-100 px-4 py-4 align-middle">

        {user?.role !== "CRM" ? (
          <div
            className="
              max-w-[380px]
              rounded-xl
              border
              border-slate-100
              bg-slate-50/80
              px-3
              py-2.5
            "
            title={order.notes || ""}
          >
            {order.notes ? (
              <p className="line-clamp-2 text-[10px] leading-5 text-slate-600">
                {order.notes}
              </p>
            ) : (
              <p className="text-[10px] italic text-slate-400">
                No remarks added
              </p>
            )}
          </div>
        ) : saved ? (
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            className="
              group/remark
              flex
              max-w-[380px]
              items-start
              gap-2
              rounded-xl
              border
              border-emerald-100
              bg-emerald-50/60
              px-3
              py-2.5
            "
            title={remarks}
          >
            <FaCheck
              size={9}
              className="mt-1 shrink-0 text-emerald-500"
            />

            <p className="line-clamp-2 flex-1 text-[10px] leading-5 text-slate-600">
              {remarks}
            </p>

            <FaEdit
              size={9}
              className="mt-1 shrink-0 text-slate-300 transition-colors group-hover/remark:text-blue-500"
            />
          </div>
        ) : (
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            className="flex max-w-[410px] items-start gap-2"
          >

            <textarea
              rows={2}
              value={remarks}
              onChange={(e) =>
                setRemarks(e.target.value)
              }
              onClick={(e) =>
                e.stopPropagation()
              }
              placeholder="Add a remark..."
              className="
                min-h-[58px]
                flex-1
                resize-none
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                py-2.5
                text-[10px]
                leading-5
                text-slate-700
                outline-none
                transition-all
                placeholder:text-slate-400
                focus:border-blue-400
                focus:bg-white
                focus:ring-4
                focus:ring-blue-50
              "
            />

            <button
              type="button"
              onClick={saveRemarks}
              disabled={loading}
              className="
                mt-0.5
                flex
                h-9
                shrink-0
                items-center
                gap-1.5
                rounded-xl
                bg-blue-600
                px-3
                text-[9px]
                font-bold
                text-white
                shadow-sm
                transition-all
                hover:bg-blue-700
                active:scale-95
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading ? (
                <>
                  <FaCircle
                    size={6}
                    className="animate-pulse"
                  />
                  Saving
                </>
              ) : (
                <>
                  <FaSave size={9} />
                  Save
                </>
              )}
            </button>

          </div>
        )}

      </td>

    </tr>
  );
}

/* =========================================================
   MOBILE ORDER CARD
========================================================= */

export function HROrderMobileCard({
  order,
  onClick,
}) {
  const status =
    statusConfig[order.status] ||
    statusConfig.HOLD;

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [remarks, setRemarks] = useState(
    order.notes || ""
  );

  const [saved, setSaved] = useState(
    !!order.notes
  );

  const [loading, setLoading] =
    useState(false);

  const saveRemarks = async (e) => {
    e.stopPropagation();

    if (!remarks.trim()) {
      alert("Please enter remarks.");
      return;
    }

    try {
      setLoading(true);

      await updateOrderRemarks(
        order.id,
        remarks.trim()
      );

      setSaved(true);
    } catch {
      alert("Failed to save remarks.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClick}
      className="
        group
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-[0_3px_15px_rgba(15,23,42,0.04)]
        transition-all
        duration-200
        active:scale-[0.995]
      "
    >

      {/* =====================================================
          CARD TOP
      ===================================================== */}

      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3.5">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-extrabold text-blue-600">
            {getInitial(
              order.ss_party_name
            )}
          </div>

          <div className="min-w-0">

            <h3 className="truncate text-xs font-extrabold text-slate-800">
              {order.ss_party_name ||
                "Unknown Party"}
            </h3>

            <p className="mt-1 truncate text-[9px] font-medium text-slate-400">
              {order.order_id}
            </p>

          </div>

        </div>

        <span
          className={`
            inline-flex
            shrink-0
            items-center
            gap-1.5
            rounded-full
            border
            px-2.5
            py-1.5
            text-[9px]
            font-extrabold
            ${status.bg}
            ${status.border}
            ${status.color}
          `}
        >
          <FaCircle
            className={`${status.dot} text-[5px]`}
          />

          {status.label}
        </span>

      </div>

      {/* =====================================================
          INFO GRID
      ===================================================== */}

      <div className="grid grid-cols-2 gap-px bg-slate-100">

        <div className="bg-white px-4 py-3">

          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
            CRM
          </p>

          <div className="mt-1.5 flex min-w-0 items-center gap-2">

            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[8px] font-extrabold text-indigo-600">
              {getInitial(
                order.crm_name
              )}
            </div>

            <p className="truncate text-[10px] font-bold text-slate-700">
              {order.crm_name || "-"}
            </p>

          </div>

        </div>

        <div className="bg-white px-4 py-3">

          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
            Created
          </p>

          <div className="mt-1.5">

            <p className="text-[10px] font-bold text-slate-700">
              {formatDate(
                order.created_at
              )}
            </p>

            <p className="mt-0.5 flex items-center gap-1 text-[8px] text-slate-400">
              <FaClock size={6} />
              {formatTime(
                order.created_at
              )}
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          REMARKS
      ===================================================== */}

      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        className="border-t border-slate-100 px-4 py-3"
      >

        <div className="mb-1.5 flex items-center justify-between">

          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
            Remarks
          </p>

          {user?.role === "CRM" &&
            saved && (
              <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-500">
                <FaCheck size={7} />
                Saved
              </span>
            )}

        </div>

        {user?.role !== "CRM" ? (
          <div className="rounded-xl bg-slate-50 px-3 py-2.5">

            {order.notes ? (
              <p className="text-[10px] leading-5 text-slate-600">
                {order.notes}
              </p>
            ) : (
              <p className="text-[10px] italic text-slate-400">
                No remarks added
              </p>
            )}

          </div>
        ) : saved ? (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-2.5">

            <p className="text-[10px] leading-5 text-slate-600">
              {remarks}
            </p>

          </div>
        ) : (
          <div className="flex gap-2">

            <textarea
              rows={2}
              value={remarks}
              onChange={(e) =>
                setRemarks(e.target.value)
              }
              onClick={(e) =>
                e.stopPropagation()
              }
              placeholder="Add a remark..."
              className="
                min-h-[58px]
                flex-1
                resize-none
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                py-2
                text-[10px]
                leading-5
                outline-none
                transition-all
                placeholder:text-slate-400
                focus:border-blue-400
                focus:bg-white
                focus:ring-4
                focus:ring-blue-50
              "
            />

            <button
              type="button"
              onClick={saveRemarks}
              disabled={loading}
              className="
                flex
                h-9
                shrink-0
                items-center
                gap-1.5
                self-start
                rounded-xl
                bg-blue-600
                px-3
                text-[9px]
                font-bold
                text-white
                shadow-sm
                transition-all
                active:scale-95
                disabled:opacity-50
              "
            >
              {loading ? (
                <FaCircle
                  size={6}
                  className="animate-pulse"
                />
              ) : (
                <FaSave size={9} />
              )}

              {loading
                ? "Saving"
                : "Save"}
            </button>

          </div>
        )}

      </div>

      {/* =====================================================
          OPEN ORDER
      ===================================================== */}

      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">

        <span className="text-[8px] font-semibold text-slate-400">
          Tap to view order details
        </span>

        <span className="flex items-center gap-1 text-[9px] font-bold text-blue-600">
          Open
          <FaArrowRight
            size={8}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>

      </div>

    </div>
  );
}