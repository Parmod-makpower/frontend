import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FiArrowLeft, FiCopy, FiCheck } from "react-icons/fi";
import { useState } from "react";
import MobilePageHeader from "../../components/MobilePageHeader";

function Table({ title, items, orderId, showCopy = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = items
      .map((i) => `${i.product_name || ""}\t${i.quantity ?? 0}\t${orderId}`)
      .join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="border rounded-2xl shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b font-semibold">
        <span>{title}</span>
        {showCopy && items?.length > 0 && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs border rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            {copied ? (
              <>
                <FiCheck className="text-green-600" /> Copied
              </>
            ) : (
              <>
                <FiCopy /> Copy
              </>
            )}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">Product</th>
              <th className="p-2 text-right">Qty</th>
            </tr>
          </thead>
          <tbody>
            {items?.length ? (
              items.map((r, idx) => (
                <tr
                  key={idx}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="p-2">{r.product_name}</td>
                  <td className="p-2 text-right">{r.quantity}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-3 text-gray-500" colSpan={2}>
                  No items
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CRMVerifiedDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // 👇 अब state से पूरा order आएगा
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="p-6 text-red-600">
        No order data provided. Please go back.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 pb-20">
      {/* Header */}
      <MobilePageHeader title={order.order_id} />
      <div className="hidden sm:flex items-center justify-between w-full">
        <div className="text-xl font-semibold">Order {order.order_id}</div>
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 px-3 py-1 rounded-xl border hover:bg-gray-200 transition cursor-pointer"
          >
            <FiArrowLeft /> Back
          </button>
        </div>
      </div>

      {/* Order Info */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-2 sm:gap-4">
        <div className="border rounded-2xl p-4 bg-white shadow-sm">
          <div className="font-semibold mb-2">SS Order</div>
          <div className="text-sm text-gray-600">
            Name: {order.ss_user_name}
          </div>
          <div className="text-sm text-gray-600">
            Party: {order.ss_party_name}
          </div>
        </div>

        <div className="border rounded-2xl p-4 bg-white shadow-sm">
          <div className="font-semibold mb-2">CRM Verification</div>
          <div className="text-sm text-gray-600">CRM: {order.crm_name}</div>
          <div className="text-sm text-gray-600">
            {new Date(order.verified_at).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            Status:{" "}
            <span className="px-2 py-1 text-xs font-semibold">{order.status}</span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Table
          title="CRM — Verified Items"
          showCopy
          orderId={order.order_id}
          items={order.items || []}
        />
      </div>
    </div>
  );
}
