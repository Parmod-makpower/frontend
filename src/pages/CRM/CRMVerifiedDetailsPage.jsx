import { useParams, useNavigate } from "react-router-dom";
import { useVerifiedOrderDetails } from "../../hooks/useVerifiedOrderDetails";
import { FiArrowLeft, FiCopy, FiCheck } from "react-icons/fi";
import { useState } from "react";
import MobilePageHeader from "../../components/MobilePageHeader";

function Table({ title, items, rightAlignPrice = false, showCopy = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = items
      .map((i) => `${i.product_name || ""}\t${i.quantity ?? 0}`)
      .join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="border rounded-2xl shadow-sm ">
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
                  <td className="p-2 text-right">
                    {r.quantity ?? r.ss_qty ?? r.crm_qty}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-3 text-gray-500" colSpan={3}>
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
  const { data, isLoading, isError } = useVerifiedOrderDetails(id);

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load.</div>;

  const ss = data.ss;
  const crm = data.crm;
  const changes = (data.compare_items || []).filter(
    (x) => x.qty_diff !== 0 || Number(x.price_diff) !== 0
  );

  return (
    <div className="p-4 sm:p-6 space-y-4 pb-20">
      {/* Header */}
      <MobilePageHeader title={data.order_id}/>
         <div className="hidden sm:flex items-center justify-between w-full">
  {/* Left side - Order ID */}
  <div className="text-xl font-semibold">
    Order {data.order_id}
  </div>

  {/* Right side - Back button */}
  <div>
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-1 px-3 py-1 rounded-xl border hover:bg-gray-100 transition"
    >
      <FiArrowLeft /> Back
    </button>
  </div>
</div>

      {/* Order Info */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-2 sm:gap-4 sm:pt-0 sm: pt-[60px]">
        <div className="border rounded-2xl p-4 bg-white shadow-sm">
          <div className="font-semibold mb-2">SS Order</div>
          <div className="text-sm text-gray-600">
            Name : {ss.ss_user_name}
          </div>
          <div className="text-sm text-gray-600">
            Party  : {ss.ss_party_name} 
          </div>
          <div className="text-sm text-gray-600">
             {new Date(ss.created_at).toLocaleString()}
          </div>
          {/* <div className="text-sm font-medium">
            Total: ₹{Number(ss.total_amount).toFixed(2)}
          </div> */}
        </div>
        <div className="border rounded-2xl p-4 bg-white shadow-sm">
          <div className="font-semibold mb-2">CRM Verification</div>
          <div className="text-sm text-gray-600">CRM : {crm.crm_name}</div>
          <div className="text-sm text-gray-600">
             {new Date(crm.verified_at).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            Status : {" "}
            <span className="px-2 py-1  text-xs font-semibold">
              {crm.status}
            </span>
          </div>
          {crm.notes && (
            <div className="text-sm text-gray-600">Notes: {crm.notes}</div>
          )}
          {/* <div className="text-sm font-medium">
            Total: ₹{Number(crm.total_amount).toFixed(2)}
          </div> */}
        </div>
      </div>

      {/* Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Table
          title="SS — Ordered Items"
          items={(ss.items || []).map((i) => ({
            product: i.product,
            product_name: i.product_name,
            quantity: i.quantity,
          }))}
        />
        <Table
          title="CRM — Verified Items"
          showCopy
          items={(crm.items || []).map((i) => ({
            product: i.product,
            product_name: i.product_name,
            quantity: i.quantity,
          }))}
        />
      </div>

      {/* Differences */}
      <div className="border rounded-2xl shadow-sm bg-white">
        <div className="px-4 py-2 bg-gray-50 border-b font-semibold">
          Changes (Only differences)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-right">SS Qty</th>
                <th className="p-2 text-right">CRM Qty</th>
                <th className="p-2 text-right">Δ Qty</th>
                {/* <th className="p-2 text-right">SS Price</th>
                <th className="p-2 text-right">CRM Price</th>
                <th className="p-2 text-right">Δ Price</th> */}
              </tr>
            </thead>
            <tbody>
              {changes.length ? (
                changes.map((r) => (
                  <tr
                    key={r.product}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-2">{r.product_name}</td>
                    <td className="p-2 text-right">{r.ss_qty}</td>
                    <td className="p-2 text-right">{r.crm_qty}</td>
                    <td className="p-2 text-right">{r.qty_diff}</td>
                    {/* <td className="p-2 text-right">
                      {Number(r.ss_price).toFixed(2)}
                    </td>
                    <td className="p-2 text-right">
                      {Number(r.crm_price).toFixed(2)}
                    </td>
                    <td className="p-2 text-right">
                      {Number(r.price_diff).toFixed(2)}
                    </td> */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-gray-500" colSpan={7}>
                    No differences
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-6 p-4 text-sm font-medium">
          <div>SS Total: ₹{Number(data.totals.ss_total).toFixed(2)}</div>
          <div>CRM Total: ₹{Number(data.totals.crm_total).toFixed(2)}</div>
          <div>Δ Amount: ₹{Number(data.totals.amount_diff).toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
