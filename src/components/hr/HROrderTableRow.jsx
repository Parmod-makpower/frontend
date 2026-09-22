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

/* =========================================================
   STATUS
========================================================= */

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
    name.trim().charAt(0).toUpperCase() || "?"
  );
};

const formatDate = (dateValue) => {
  if (!dateValue) return "-";

  return new Date(dateValue).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatTime = (dateValue) => {
  if (!dateValue) return "-";

  return new Date(dateValue).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
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

  const hasInitialRemark = Boolean(
    order.notes?.trim()
  );

  const [remarks, setRemarks] = useState(
    order.notes || ""
  );

  const [saved, setSaved] = useState(
    hasInitialRemark
  );

  const [isEditing, setIsEditing] = useState(
    !hasInitialRemark
  );

  const [loading, setLoading] = useState(false);

  /* =======================================================
     SAVE / UPDATE REMARK
  ======================================================= */

  const saveRemarks = async (e) => {
    e.stopPropagation();

    const value = remarks.trim();

    if (!value) {
      alert("Please enter remarks.");
      return;
    }

    try {
      setLoading(true);

      await updateOrderRemarks(
        order.id,
        value
      );

      setRemarks(value);
      setSaved(true);
      setIsEditing(false);
    } catch {
      alert("Failed to save remarks.");
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const editRemarks = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  return (
    <tr
      onClick={onClick}
      className="
        group
        cursor-pointer
        bg-white
        transition-colors
        hover:bg-blue-50/30
      "
    >

      {/* =====================================================
          ORDER
      ===================================================== */}

      <td className="border-b border-slate-100 px-5 py-3.5 align-middle">

        <div className="flex items-center gap-2.5">

          <div className="
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            border
            border-slate-200
            bg-slate-50
            text-[10px]
            font-bold
            text-slate-500
            transition-colors
            group-hover:border-blue-200
            group-hover:bg-blue-50
            group-hover:text-blue-600
          ">
            #
          </div>

          <div className="min-w-0">

            <p className="truncate text-[12px] font-bold text-slate-800">
              {order.order_id}
            </p>

            <p className="mt-0.5 text-[10px] font-medium text-slate-400">
              Order
            </p>

          </div>

        </div>

      </td>

      {/* =====================================================
          PARTY
      ===================================================== */}

      <td className="border-b border-slate-100 px-4 py-3.5 align-middle">

        <div className="flex min-w-0 items-center gap-3">

          <div className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            border
            border-blue-100
            bg-blue-50
            text-[10px]
            font-bold
            text-blue-600
          ">
            {getInitial(order.ss_party_name)}
          </div>

          <div className="min-w-0">

            <p className="max-w-[280px] truncate text-[12px] font-semibold text-slate-800">
              {order.ss_party_name ||
                "Unknown Party"}
            </p>

            <p className="
              mt-0.5
              flex
              items-center
              gap-1
              text-[10px]
              font-medium
              text-slate-400
            ">
              <FaBuilding size={7} />
              Super Stockist
            </p>

          </div>

        </div>

      </td>

      {/* =====================================================
          CRM
      ===================================================== */}

      <td className="border-b border-slate-100 px-4 py-3.5 align-middle">

        <div className="flex items-center gap-2.5">

          <div className="
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            border
            border-indigo-100
            bg-indigo-50
            text-[10px]
            font-bold
            text-indigo-600
          ">
            {getInitial(order.crm_name)}
          </div>

          <div className="min-w-0">

            <p className="max-w-[150px] truncate text-[12px] font-semibold text-slate-700">
              {order.crm_name || "-"}
            </p>

            <p className="
              mt-0.5
              flex
              items-center
              gap-1
              text-[10px]
              font-medium
              text-slate-400
            ">
              <FaUserTie size={7} />
              CRM
            </p>

          </div>

        </div>

      </td>

      {/* =====================================================
          DATE
      ===================================================== */}

      <td className="border-b border-slate-100 px-4 py-3.5 align-middle">

        <div className="whitespace-nowrap">

          <p className="text-[12px] font-semibold text-slate-700">
            {formatDate(order.created_at)}
          </p>

          <p className="
            mt-1
            flex
            items-center
            gap-1
            text-[10px]
            font-medium
            text-slate-400
          ">
            <FaClock size={7} />
            {formatTime(order.created_at)}
          </p>

        </div>

      </td>

      {/* =====================================================
          STATUS
      ===================================================== */}

      <td className="border-b border-slate-100 px-4 py-3.5 align-middle">

        <span
          className={`
            inline-flex
            items-center
            gap-1.5
            whitespace-nowrap
            border
            px-2.5
            py-1.5
            text-[10px]
            font-semibold
            ${status.bg}
            ${status.border}
            ${status.color}
          `}
        >
          <FaCircle
            className={`
              ${status.dot}
              text-[9px]
            `}
          />

          {status.label}
        </span>

      </td>

      {/* =====================================================
          REMARKS
      ===================================================== */}

      <td className="border-b border-slate-100 px-4 py-3.5 align-middle">

        {/* ===================================================
            NON CRM
        =================================================== */}

        {user?.role !== "CRM" ? (
          <div
            className="
              max-w-[400px]
              border
              border-slate-200
              bg-slate-50
              px-3
              py-2.5
            "
            title={order.notes || ""}
          >
            {order.notes ? (
              <p className="
                line-clamp-2
                text-[10px]
                font-medium
                leading-5
                text-slate-600
              ">
                {order.notes}
              </p>
            ) : (
              <p className="
                text-[10px]
                font-medium
                italic
                text-slate-400
              ">
                No remarks added
              </p>
            )}
          </div>
        ) : isEditing ? (

          /* =================================================
             EDIT / ADD MODE
          ================================================= */

          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            className="flex max-w-[430px] items-start gap-2"
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
                min-h-[56px]
                flex-1
                resize-none
                border
                border-slate-200
                bg-white
                px-3
                py-2
                text-[10px]
                font-medium
                leading-5
                text-slate-700
                outline-none
                transition-colors
                placeholder:text-slate-400
                focus:border-blue-400
                focus:ring-2
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
                h-8
                shrink-0
                items-center
                gap-1.5
                bg-[#1769ff]
                px-3
                text-[10px]
                font-semibold
                text-white
                transition-colors
                hover:bg-blue-700
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading ? (
                <>
                  <FaCircle
                    size={5}
                    className="animate-pulse"
                  />
                  Saving
                </>
              ) : (
                <>
                  <FaSave size={8} />
                  {saved ? "Update" : "Save"}
                </>
              )}
            </button>

          </div>

        ) : (

          /* =================================================
             SAVED MODE
          ================================================= */

          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            className="
              group/remark
              flex
              max-w-[400px]
              items-start
              gap-2
              border
              border-emerald-100
              bg-emerald-50/50
              px-3
              py-2.5
            "
            title={remarks}
          >

            <FaCheck
              size={9}
              className="mt-1 shrink-0 text-emerald-500"
            />

            <p className="
              line-clamp-2
              flex-1
              text-[10px]
              font-medium
              leading-5
              text-slate-600
            ">
              {remarks}
            </p>

            <button
              type="button"
              onClick={editRemarks}
              title="Edit remark"
              className="
                mt-0.5
                flex
                shrink-0
                items-center
                gap-1
                border
                border-slate-200
                bg-white
                px-2
                py-1
                text-[8px]
                font-semibold
                text-slate-500
                transition-colors
                hover:border-blue-200
                hover:bg-blue-50
                hover:text-blue-600
              "
            >
              <FaEdit size={8} />
              Edit
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

  const hasInitialRemark = Boolean(
    order.notes?.trim()
  );

  const [remarks, setRemarks] = useState(
    order.notes || ""
  );

  const [saved, setSaved] = useState(
    hasInitialRemark
  );

  const [isEditing, setIsEditing] = useState(
    !hasInitialRemark
  );

  const [loading, setLoading] = useState(false);

  /* =======================================================
     SAVE / UPDATE
  ======================================================= */

  const saveRemarks = async (e) => {
    e.stopPropagation();

    const value = remarks.trim();

    if (!value) {
      alert("Please enter remarks.");
      return;
    }

    try {
      setLoading(true);

      await updateOrderRemarks(
        order.id,
        value
      );

      setRemarks(value);
      setSaved(true);
      setIsEditing(false);
    } catch {
      alert("Failed to save remarks.");
    } finally {
      setLoading(false);
    }
  };

  const editRemarks = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  return (
    <div
      onClick={onClick}
      className="
        group
        overflow-hidden
        border
        border-slate-200
        bg-white
        shadow-[0_2px_10px_rgba(15,23,42,0.035)]
        transition-colors
        active:bg-slate-50
      "
    >

      {/* =====================================================
          CARD HEADER
      ===================================================== */}

      <div className="
        flex
        items-start
        justify-between
        gap-3
        border-b
        border-slate-100
        px-4
        py-3
      ">

        <div className="flex min-w-0 items-center gap-3">

          <div className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            border
            border-blue-100
            bg-blue-50
            text-[12px]
            font-bold
            text-blue-600
          ">
            {getInitial(order.ss_party_name)}
          </div>

          <div className="min-w-0">

            <h3 className="truncate text-xs font-semibold text-slate-800">
              {order.ss_party_name ||
                "Unknown Party"}
            </h3>

            <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400">
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
            border
            px-2
            py-1.5
            text-[10px]
            font-semibold
            ${status.bg}
            ${status.border}
            ${status.color}
          `}
        >
          <FaCircle
            className={`${status.dot} text-[9px]`}
          />

          {status.label}
        </span>

      </div>

      {/* =====================================================
          INFO
      ===================================================== */}

      <div className="grid grid-cols-2 border-b border-slate-100">

        <div className="border-r border-slate-100 px-4 py-3">

          <p className="
            text-[8px]
            font-semibold
            uppercase
            tracking-[0.1em]
            text-slate-400
          ">
            CRM
          </p>

          <div className="mt-1.5 flex min-w-0 items-center gap-2">

            <div className="
              flex
              h-6
              w-6
              shrink-0
              items-center
              justify-center
              border
              border-indigo-100
              bg-indigo-50
              text-[8px]
              font-bold
              text-indigo-600
            ">
              {getInitial(order.crm_name)}
            </div>

            <p className="truncate text-[10px] font-semibold text-slate-700">
              {order.crm_name || "-"}
            </p>

          </div>

        </div>

        <div className="px-4 py-3">

          <p className="
            text-[8px]
            font-semibold
            uppercase
            tracking-[0.1em]
            text-slate-400
          ">
            Created
          </p>

          <div className="mt-1.5">

            <p className="text-[10px] font-semibold text-slate-700">
              {formatDate(order.created_at)}
            </p>

            <p className="
              mt-0.5
              flex
              items-center
              gap-1
              text-[8px]
              font-medium
              text-slate-400
            ">
              <FaClock size={6} />
              {formatTime(order.created_at)}
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
        className="border-b border-slate-100 px-4 py-3"
      >

        <div className="mb-1.5 flex items-center justify-between">

          <p className="
            text-[8px]
            font-semibold
            uppercase
            tracking-[0.1em]
            text-slate-400
          ">
            Remarks
          </p>

          {user?.role === "CRM" &&
            saved &&
            !isEditing && (
              <span className="
                flex
                items-center
                gap-1
                text-[8px]
                font-semibold
                text-emerald-500
              ">
                <FaCheck size={7} />
                Saved
              </span>
            )}

        </div>

        {/* ===================================================
            NON CRM
        =================================================== */}

        {user?.role !== "CRM" ? (
          <div className="
            border
            border-slate-200
            bg-slate-50
            px-3
            py-2.5
          ">

            {order.notes ? (
              <p className="
                text-[10px]
                font-medium
                leading-5
                text-slate-600
              ">
                {order.notes}
              </p>
            ) : (
              <p className="
                text-[10px]
                font-medium
                italic
                text-slate-400
              ">
                No remarks added
              </p>
            )}

          </div>

        ) : isEditing ? (

          /* =================================================
             MOBILE EDIT
          ================================================= */

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
                min-h-[56px]
                flex-1
                resize-none
                border
                border-slate-200
                bg-white
                px-3
                py-2
                text-[10px]
                font-medium
                leading-5
                text-slate-700
                outline-none
                transition-colors
                placeholder:text-slate-400
                focus:border-blue-400
                focus:ring-2
                focus:ring-blue-50
              "
            />

            <button
              type="button"
              onClick={saveRemarks}
              disabled={loading}
              className="
                flex
                h-8
                shrink-0
                items-center
                gap-1.5
                self-start
                bg-[#1769ff]
                px-3
                text-[10px]
                font-semibold
                text-white
                transition-colors
                active:scale-[0.98]
                disabled:opacity-50
              "
            >
              {loading ? (
                <>
                  <FaCircle
                    size={5}
                    className="animate-pulse"
                  />
                  Saving
                </>
              ) : (
                <>
                  <FaSave size={8} />
                  {saved ? "Update" : "Save"}
                </>
              )}
            </button>

          </div>

        ) : (

          /* =================================================
             MOBILE SAVED
          ================================================= */

          <div className="
            border
            border-emerald-100
            bg-emerald-50/50
            px-3
            py-2.5
          ">

            <div className="flex items-start gap-2">

              <FaCheck
                size={8}
                className="mt-1 shrink-0 text-emerald-500"
              />

              <p className="
                flex-1
                text-[10px]
                font-medium
                leading-5
                text-slate-600
              ">
                {remarks}
              </p>

              <button
                type="button"
                onClick={editRemarks}
                className="
                  flex
                  shrink-0
                  items-center
                  gap-1
                  border
                  border-slate-200
                  bg-white
                  px-2
                  py-1
                  text-[8px]
                  font-semibold
                  text-slate-500
                  hover:border-blue-200
                  hover:bg-blue-50
                  hover:text-blue-600
                "
              >
                <FaEdit size={8} />
                Edit
              </button>

            </div>

          </div>
        )}

      </div>

      {/* =====================================================
          OPEN ORDER
      ===================================================== */}

      <div className="
        flex
        items-center
        justify-between
        bg-slate-50/70
        px-4
        py-2.5
      ">

        <span className="
          text-[8px]
          font-medium
          text-slate-400
        ">
          Tap to view order details
        </span>

        <span className="
          flex
          items-center
          gap-1
          text-[10px]
          font-semibold
          text-blue-600
        ">
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