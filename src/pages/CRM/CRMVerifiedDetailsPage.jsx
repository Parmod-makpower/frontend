import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useState, useMemo } from "react";
import DispatchPDF from "../../components/DispatchPDF";
import MobilePageHeader from "../../components/MobilePageHeader";
import { punchOrderToSheet } from "../../api/punchApi";
import { useCachedProducts } from "../../hooks/useCachedProducts";
import PDFDownloadButton from "../../components/PDFDownloadButton";

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
      <div className="flex items-center justify-between px-4 py-2 bg-blue-100 border font-semibold">
        <span>{title}</span>
      </div>
      <div className="overflow-x-auto select-none ">
        <table className="min-w-full text-sm text-left text-gray-700 border">
          <thead className="bg-gray-200 text-gray-900 text-sm font-semibold">
            <tr>
              <th className="p-3 border">S.No</th>
              <th className="p-3 border">Category</th>
              <th className="p-3 border">Product</th>
              <th className="p-3 border">Qty</th>
              <th className="p-3 border">Carton</th>
              <th className="p-3 border">Price</th>
              <th className="p-3 border">Total</th>
              <th className="p-3 border">SS-Stock</th>
              <th className="p-3 border">Stock</th>
            </tr>
          </thead>
          <tbody>
            {items?.length ? (
              <>
                {items.map((r, idx) => {
                  const total = Number(r.quantity) * Number(r?.price || 0);
                  return (
                    <tr key={idx} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="p-3 border text-center">{idx + 1}</td>
                      <td className="p-3 border">{r.sub_category}</td>
                      <td className="p-3 border">{r.product_name}</td>
                      <td className="p-3 border bg-yellow-100">{r.quantity}</td>
                      <td className="p-3 border">{r.cartoon_size ?? "-"}</td>
                      {/* ✅ Price 1 decimal tak */}
                      <td className="p-3 border">
                        ₹{Number(r.price || 0).toFixed(1)}
                      </td>
                      {/* ✅ Total 1 decimal tak */}
                      <td className="p-3 border">
                        ₹{total.toFixed(1)}
                      </td>
                      <td className="p-3 border bg-red-100">{r.ss_virtual_stock}</td>
                      <td className="p-3 border bg-red-200">{r.virtual_stock ?? "-"}</td>
                    </tr>
                  );
                })}

                {/* ✅ Grand Total Row */}
                <tr className="bg-blue-100 font-semibold">
                  <td colSpan={6} className="p-3 border text-right">Grand Total</td>
                  <td colSpan={3} className="p-3 border">
                    ₹
                    {items
                      .reduce(
                        (sum, r) => sum + Number(r.quantity) * Number(r?.price || 0),
                        0
                      )
                      .toFixed(1)}
                  </td>

                </tr>
              </>
            ) : (
              <tr>
                <td className="p-3 text-gray-500" colSpan={7}>
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
  const [remarks, setRemarks] = useState("");


  const order = location.state?.order;

  const crmMapping = {
    "Ankita Dhingra": "AD-AP",
    "Prince Gupta": "PG-AP",
    "Ajit Mishra": "AM-AP",
    "Harish Sharma": "HS-AP",
    "Simran Khanna": "SK-AP",
    "Rahul Kumar": "RK-AP",
    "Vivek Sharma": "VS-AP",
    "Aarti Singh": "AS-AP",
    "Kanak Maurya": "KM-AP"
  };

  const orderCode = crmMapping[order?.crm_name]
    ? `${crmMapping[order.crm_name]}${order.id}`
    : `${order?.crm_name} ${order?.id}`;

  // ✅ Get all products with virtual stock
  const { data: allProducts = [] } = useCachedProducts();

  // ✅ Merge order items with virtual stock
  const enrichedItems = useMemo(() => {
    const merged = order.items.map((item) => {
      const found = allProducts.find(p => p.product_id === item.product);
      return {
        ...item,
        virtual_stock: found?.virtual_stock ?? null,
        cartoon_size: found?.cartoon_size ?? "-",
        sub_category: found?.sub_category ?? "-",
      };
    });

    // ✅ Category-wise sorting (alphabetical)
    return merged.sort((a, b) => {
      const catA = (a.sub_category || "").toLowerCase();
      const catB = (b.sub_category || "").toLowerCase();
      return catA.localeCompare(catB);
    });
  }, [order.items, allProducts]);


 const handleDownloadPDF = () => {
  DispatchPDF(order, enrichedItems, remarks, orderCode);
};


  const handleOrderPunch = () => {
    if (!order?.items?.length) {
      alert("No items to punch!");
      return;
    }
    setIsModalOpen(true);
  };

  const confirmOrderPunch = async () => {
    if (!order?.items?.length) return;

    setLoading(true);
    setIsModalOpen(false);

    try {
      const data = await punchOrderToSheet(order);
      if (data.success) {
        // ✅ दोनों PDFs जनरेट करो
        handleDownloadPDF();

        setTimeout(() => {
          navigate("/all/orders-history");
        }, 500);
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
    return <div className="p-6 text-red-600">No order data provided. Please go back.</div>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4 pb-20">
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmOrderPunch}
      />

      <MobilePageHeader title={order.order_id} />
      <div className="hidden sm:flex items-center justify-between w-full ">
        <div className="font-semibold border rounded bg-gray-200 px-4 p-2">{orderCode}</div>
        <div className="flex gap-2">


          {order.punched && (
            <>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1 px-3 py-1 rounded border bg-orange-600 text-white hover:bg-orange-700 transition cursor-pointer"
              >
                Dispatch PDF
              </button>

            </>
          )}

          <PDFDownloadButton order={order} items={enrichedItems} />
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 px-3 py-1 rounded border hover:bg-gray-200 transition cursor-pointer"
          >
            <FiArrowLeft /> Back
          </button>
        </div>
      </div>

      {/* <div className="grid grid-cols-2 md:grid-cols-2 gap-2 sm:gap-4 sm:pt-0 pt-[60px]">
        <div className="border rounded p-4 bg-white shadow-sm">
          <div className="font-semibold mb-2">SS Order</div>
          <div className="text-sm font-bold text-gray-600">{order.order_id}</div>
          <div className="text-sm text-gray-600">Name: {order.ss_user_name}</div>
          <div className="text-sm text-gray-600">Party: {order.ss_party_name}</div>
        </div>

        <div className="border rounded p-4 bg-white shadow-sm">
          <div className="font-semibold mb-2">CRM Verification</div>
          <div className="text-sm font-bold text-gray-600">{orderCode}</div>
          <div className="text-sm text-gray-600">CRM: {order.crm_name}</div>
          <div className="text-sm text-gray-600">
            {new Date(order.verified_at).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            })}
          </div>
        </div>
      </div> */}

      <div className="grid grid-cols-1 gap-4">
        <Table title="CRM — Verified Items" items={enrichedItems} />
      </div>
      <div className="mb-4">
        <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
          Remarks
        </label>
        <textarea
          id="remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
          placeholder="Enter remarks (optional)"
        />
      </div>

      <button
        onClick={handleOrderPunch}
        disabled={order.punched || loading}
        className={`px-6 py-2 rounded-lg shadow transition
          ${order.punched || loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"}`}
      >
        {loading ? (
          <>
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
            Processing...
          </>
        ) : order.punched ? "Already Punched" : "Order Punch"}
      </button>
    </div>
  );
}
