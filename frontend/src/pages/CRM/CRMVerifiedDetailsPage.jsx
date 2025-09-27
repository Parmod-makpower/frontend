import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useState } from "react";
import MobilePageHeader from "../../components/MobilePageHeader";
import { punchOrderToSheet } from "../../api/punchApi"; // ✅ import API

function ConfirmationModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-[90%] max-w-md animate-fadeIn">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Confirm Order Punch
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to punch this order? <br /> This Order will be sent to the Backend.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function Table({ title, items }) {
  return (
    <div className="border rounded shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b font-semibold">
        <span>{title}</span>
      </div>
      <div className="overflow-x-auto select-none">
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);


  const order = location.state?.order;

  const handleOrderPunch = () => {
    if (!order?.items?.length) {
      alert("No items to punch!");
      return;
    }
    setIsModalOpen(true);
  };

 const confirmOrderPunch = async () => {
  setLoading(true);
  setIsModalOpen(false);
  try {
    const data = await punchOrderToSheet(order);
    if (data.success) {
      navigate("/all/orders-history")
    } else {
      alert("Error: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong while punching order");
  } finally {
    setLoading(false);
  }
};


  if (!order) {
    return (
      <div className="p-6 text-red-600">
        No order data provided. Please go back.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4 pb-20">
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmOrderPunch}
      />

      <MobilePageHeader title={order.order_id} />
      <div className="hidden sm:flex items-center justify-between w-full">
        <div className="font-semibold"></div>
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 px-3 py-1 rounded border hover:bg-gray-200 transition cursor-pointer"
          >
            <FiArrowLeft /> Back
          </button>
        </div>
      </div>

      {/* Order Info */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-2 sm:gap-4 sm:pt-0 pt-[60px]">
        <div className="border rounded p-4 bg-white shadow-sm">
          <div className="font-semibold mb-2">SS Order</div>
          <div className="text-sm font-bold text-gray-600">{order.order_id}</div>
          <div className="text-sm text-gray-600">Name: {order.ss_user_name}</div>
          <div className="text-sm text-gray-600">Party: {order.ss_party_name}</div>
        </div>

        <div className="border rounded p-4 bg-white shadow-sm">
          <div className="font-semibold mb-2">CRM Verification</div>
          <div className="text-sm text-gray-600">CRM: {order.crm_name}</div>
          <div className="text-sm text-gray-600">
            {new Date(order.verified_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
          </div>
          <div className="text-sm text-gray-600">
            Status:{" "}
            <span className="px-2 py-1 text-xs font-semibold">{order.status}</span>{" "}
            <span className="px-2 py-1 text-xs font-semibold">({order.notes})</span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="grid grid-cols-1 gap-4">
        <Table title="CRM — Verified Items" items={order.items || []} />
      </div>

      {/* Order Punch Button */}
     <button
  onClick={handleOrderPunch}
  disabled={order.punched || loading}
  className={`px-6 py-2 rounded-lg shadow transition
    ${order.punched || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'}
  `}
>
  {loading && (
    <svg
      className="animate-spin h-5 w-5 mr-2 inline-block text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  )}
  {order.punched ? 'Already Punched' : (loading ? 'Processing...' : 'Order Punch')}
</button>


    </div>
  );
}
