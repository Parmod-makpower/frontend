import { FaCircle } from "react-icons/fa";
import { useState } from "react";

import { updateOrderRemarks } from "../../api/hrOrders";

const statusConfig = {
  PENDING: {
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
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
    const user = JSON.parse(localStorage.getItem("user"));

  const [remarks, setRemarks] = useState(
    order.notes || ""
  );
  const [saved, setSaved] = useState(
    !!order.notes
  );
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
        text-xs
        hover:bg-blue-50
      "
    >
      <td className="px-4 py-4 font-semibold whitespace-nowrap align-top">
        {order.order_id}
      </td>

      <td className="px-4 py-4 text-gray-700 align-top">
        <div
          className="
            max-w-[320px]
            break-words
            whitespace-normal
            leading-5
          "
        >
          {order.ss_party_name}
        </div>
      </td>

      <td className="px-4 py-4 whitespace-nowrap align-top">
        {order.crm_name || "-"}
      </td>

      <td className="px-4 py-4 whitespace-nowrap align-top">
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

      <td className="px-4 py-4 text-center align-top">
        <span
          className={`
            inline-flex
            items-center
            gap-1
            rounded-full
            border
            px-2
            py-1
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

     <td className="px-4 py-4 align-top">

  {/* ADMIN / HR */}
  {user?.role !== "CRM" ? (
    <div
      className="
        max-w-[300px]
        break-words
        whitespace-normal
        leading-5
        text-gray-700
      "
    >
      {order.notes || "-"}
    </div>
  ) : (
    <>
      {/* CRM */}
      {saved ? (
        <div
          className="
            max-w-[300px]
            break-words
            whitespace-normal
            leading-5
            text-gray-700
          "
          title={remarks}
        >
          {remarks}
        </div>
      ) : (
        <div
          className="flex items-start gap-2"
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
              w-56
              rounded
              border
              border-gray-300
              px-2
              py-1
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          />

          <button
            onClick={saveRemarks}
            disabled={loading}
            className="
              rounded
              bg-blue-600
              px-3
              py-1
              text-white
              hover:bg-blue-700
              disabled:opacity-50
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