import { FaCircle } from "react-icons/fa";
import { useState } from "react";
import { updateOrderRemarks } from "../../api/hrOrders";

const statusConfig = {
  PENDING: {
    color: "text-amber-700",
    bg: "bg-amber-100",
    border: "border-amber-200",
  },
  HOLD: {
    color: "text-gray-700",
    bg: "bg-gray-100",
    border: "border-gray-300",
  },
};

export default function HROrderTableRow({
  order,
  onClick,
}) {
  const status =
    statusConfig[order.status] || statusConfig.HOLD;

  const user = JSON.parse(localStorage.getItem("user"));

  const [remarks, setRemarks] = useState(order.notes || "");
  const [saved, setSaved] = useState(!!order.notes);
  const [loading, setLoading] = useState(false);

  const saveRemarks = async (e) => {
    e.stopPropagation();

    if (!remarks.trim()) {
      alert("Please enter remarks.");
      return;
    }

    try {
      setLoading(true);

      await updateOrderRemarks(order.id, remarks);

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
        group border
        border
        border-slate-200
        bg-white
        hover:bg-sky-50/70
        transition-all
        duration-200
        cursor-pointer text-xs border
      "
    >
      {/* Order ID */}
      <td className="text-center font-semibold text-slate-800 whitespace-nowrap">
        {order.order_id}
      </td>

      {/* Party */}
      <td className="ps-5 py-1">
        <div className="max-w-[250px]">
          <p className="font-medium text-slate-800 break-words leading-6">
            {order.ss_party_name}
          </p>
        </div>
      </td>

      {/* CRM */}
      <td className="text-center py-1 whitespace-nowrap">
        <span className="text-slate-700">
          {order.crm_name || "-"}
        </span>
      </td>

      {/* Date */}
      <td className="text-center py-1 whitespace-nowrap">
        <div className="font-medium text-slate-800">
          {new Date(order.created_at).toLocaleDateString("en-IN")}
        </div>

        <div className="text-xs text-slate-500 mt-1">
          {new Date(order.created_at).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </td>

      {/* Status */}
      <td className="text-center py-1 text-center">
        <span
          className={`
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            px-3
            py-1
            text-xs
            font-semibold
            shadow-sm
            ${status.bg}
            ${status.border}
            ${status.color}
          `}
        >
          <FaCircle className="text-[7px]" />
          {order.status}
        </span>
      </td>

      {/* Remarks */}
      <td className="px-5 py-1">
        {user?.role !== "CRM" ? (
          <div className="max-w-[340px] rounded-lg bg-slate-50 p-3 text-slate-700 leading-6 border border-slate-200">
            {order.notes || (
              <span className="italic text-slate-400">
                No Remarks
              </span>
            )}
          </div>
        ) : (
          <>
            {saved ? (
              <div
                className="max-w-[340px] rounded-lg border border-green-200 bg-green-50 p-3"
                title={remarks}
              >
                <p className="text-slate-700 leading-6 break-words">
                  {remarks}
                </p>
              </div>
            ) : (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex gap-3 items-start"
              >
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter remarks..."
                  className="
                    w-72
                    rounded
                    border
                    border-slate-300
                    bg-white
                    px-4
                    py-1
                    text-xs
                    resize-none
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-4
                    focus:ring-blue-100
                  "
                />

                <button
                  onClick={saveRemarks}
                  disabled={loading}
                  className="
                    h-9 mt-1
                    rounded
                    bg-gradient-to-r
                    from-blue-600
                    to-sky-600
                    px-3
                    text-xs
                    font-semibold
                    text-white
                    shadow-md
                    transition
                    hover:shadow-lg
                    hover:scale-105
                    active:scale-95
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </>
        )}
      </td>
    </tr>
  );
}