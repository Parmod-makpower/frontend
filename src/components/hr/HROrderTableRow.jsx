import { FaCircle } from "react-icons/fa";
import { useState } from "react";
import { updateOrderRemarks } from "../../api/hrOrders";

const statusConfig = {
  PENDING: {
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  },

  VERIFIED: {
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },

  REJECTED: {
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
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
    statusConfig[order.status] ||
    statusConfig.HOLD;

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
    } catch (err) {
      alert("Failed to save remarks.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr
      onClick={onClick}
      className="
        border-b
        border-gray-100
        hover:bg-blue-50
        text-xs
      "
    >
      <td className="px-3 py-2 font-semibold text-gray-700">
        {order.order_id}
      </td>

      <td
        className="
          px-3
          py-2
          text-gray-700
          max-w-[220px]
          truncate
        "
      >
        {order.ss_party_name}
      </td>

      <td className="px-3 py-2 text-gray-600">
        {order.crm_name || "-"}
      </td>

      <td className="px-3 py-2 text-gray-600">
        <div>
          {new Date(order.created_at).toLocaleDateString(
            "en-IN"
          )}
        </div>

        <div className="text-[10px] text-gray-400">
          {new Date(order.created_at).toLocaleTimeString(
            "en-IN",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )}
        </div>
      </td>

      <td className="px-3 py-2">
        <span
          className={`
            inline-flex
            items-center
            gap-1
            px-2
            py-1
            rounded-full
            border
            text-[10px]
            font-semibold
            ${status.bg}
            ${status.border}
            ${status.color}
          `}
        >
          <FaCircle className="text-[6px]" />
          {order.status}
        </span>
      </td>

      <td className="px-3 py-2">
        {saved ? (
          <div
            className="max-w-[220px] break-words text-gray-700"
            title={remarks}
          >
            {remarks}
          </div>
        ) : (
          <div
            className="flex gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={remarks}
              onChange={(e) =>
                setRemarks(e.target.value)
              }
              placeholder="Enter Remarks"
              className="
                border
                border-gray-300
                rounded
                px-2
                py-1
                w-44
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />

            <button
              onClick={saveRemarks}
              disabled={loading}
              className="
                bg-blue-600
                hover:bg-blue-700
                text-white
                px-3
                rounded
                disabled:opacity-50
              "
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}