import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaBoxOpen,
  FaClipboardCheck,
  FaShippingFast,
  FaTimesCircle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import API from "../../api/axios";
import MobilePageHeader from "../../components/MobilePageHeader";
import { useSchemes } from "../../hooks/useSchemes";

export default function PartyOrderTrackPage() {
  const { partyId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const { data: schemes = [] } = useSchemes();

  useEffect(() => {
    if (partyId) fetchOrders();
  }, [partyId]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/party-orders/${partyId}/`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("Could not fetch orders");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const getSchemeMultiplier = (scheme, items) => {
    return Math.min(
      ...scheme.conditions.map((cond) => {
        const matched = items.find(
          (p) => p.product === cond.product_name || p.product_name === cond.product_name
        );
        if (!matched) return 0;
        return Math.floor(matched.quantity / cond.min_quantity);
      })
    );
  };

  const mergeRewards = (eligibleSchemes) => {
    const rewardMap = {};
    eligibleSchemes.forEach((scheme) => {
      const multiplier = scheme.multiplier;
      scheme.rewards.forEach((r) => {
        const productName = r.product_name || r.product;
        const qty = r.quantity * multiplier;
        if (rewardMap[productName]) rewardMap[productName].quantity += qty;
        else rewardMap[productName] = { product_name: productName, quantity: qty };
      });
    });
    return Object.values(rewardMap);
  };

  if (loading) {
    return (
      <div className="p-4">
        <MobilePageHeader title={`Party ${partyId} Orders`} />
        <div className="flex items-center justify-center mt-10">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4">
        <MobilePageHeader title={`Party ${partyId} Orders`} />
        <p className="mt-6 text-center text-gray-600">No data found.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <MobilePageHeader title={`Orders of ${data.party_name || partyId}`} />

      <div className="mt-4 mb-6">
        <p className="text-sm text-gray-600">
          Total orders: <span className="font-semibold">{data.total_orders}</span>
        </p>
      </div>

      <div className="space-y-4">
        {data.orders.map((order) => {
          const ssItems = order.ss_items || [];
          const crmItems = order.crm_data?.items || [];
          const dispatchItems = order.dispatch_data || [];

          const eligibleSchemes = schemes
            .map((scheme) => ({ ...scheme, multiplier: getSchemeMultiplier(scheme, ssItems) }))
            .filter((s) => s.multiplier > 0);

          const mergedRewards = mergeRewards(eligibleSchemes);

          // progress calc (simple)
          const status = order.status?.toUpperCase() || "";
          const dispatchCount = dispatchItems.length;
          const isRejected = status === "REJECTED" && dispatchCount === 0;
          const getStatusStepIndex = (s) => {
            switch (s) {
              case "PLACED":
              case "PENDING":
                return 0;
              case "HOLD":
              case "APPROVED":
                return 1;
              case "DISPATCHED":
                return 2;
              case "REJECTED":
                return 1;
              default:
                return 0;
            }
          };
          const currentStep = dispatchCount > 0 ? 2 : getStatusStepIndex(status);
          const steps =
            isRejected
              ? [
                  { label: "Order Placed", icon: <FaBoxOpen /> },
                  { label: "Order Rejected", icon: <FaTimesCircle />, color: "bg-red-600" },
                ]
              : [
                  { label: "Order Placed", icon: <FaBoxOpen /> },
                  { label: status === "HOLD" ? "Hold" : status === "PENDING" ? "Pending" : "Approved", icon: <FaClipboardCheck /> },
                  { label: "Dispatched", icon: <FaShippingFast /> },
                ];

          const allProductNames = [
            ...new Set([
              ...ssItems.map((i) => i.product_name),
              ...crmItems.map((i) => i.product_name),
              ...dispatchItems.map((i) => i.product),
            ]),
          ];

          return (
            <div key={order.order_id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Order ID</div>
                  <div className="font-semibold text-lg">{order.order_id}</div>
                  <div className="text-xs text-gray-500">Placed: {new Date(order.created_at).toLocaleString()}</div>
                </div>

                <div className="text-right">
                  <div className="text-sm">Amount</div>
                  <div className="font-semibold">₹ {order.total_amount}</div>
                  <div className="text-xs mt-1">{order.status}</div>
                </div>

                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.order_id ? null : order.order_id)}
                  className="ml-4 p-2 rounded hover:bg-gray-100"
                >
                  {expandedOrder === order.order_id ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>

              {/* small progress */}
              <div className="mt-4">
                <div className="flex items-center gap-4">
                  {steps.map((step, idx) => {
                    const isCompleted = idx <= currentStep;
                    const circleColor = isRejected && idx === 1 ? "bg-red-600" : isCompleted ? "bg-blue-600" : "bg-gray-300";
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${circleColor}`}>{step.icon}</div>
                        <div className="text-xs text-gray-600">{step.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {expandedOrder === order.order_id && (
                <div className="mt-4">
                  {/* Comparison table */}
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full text-sm border rounded-lg">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border px-3 py-2 text-left">Product</th>
                          <th className="border px-3 py-2 text-center">SS Qty</th>
                          <th className="border px-3 py-2 text-center">CRM Qty</th>
                          <th className="border px-3 py-2 text-center">Dispatch Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allProductNames.map((name, idx) => {
                          const ssItem = ssItems.find((s) => s.product_name === name);
                          const crmItem = crmItems.find((c) => c.product_name === name);
                          const dispatchItem = dispatchItems.find((d) => d.product === name);

                          const isExtraCRMItem = !ssItem && crmItem;
                          const isExtraDispatchItem = !ssItem && !crmItem && dispatchItem;
                          let rowBg = "";
                          if (isExtraCRMItem) rowBg = "bg-orange-50";
                          if (isExtraDispatchItem) rowBg = "bg-green-100";

                          return (
                            <tr key={idx} className={`${rowBg}`}>
                              <td className="border px-3 py-2 font-medium">{name}</td>
                              <td className="border px-3 py-2 text-center bg-blue-50">{ssItem ? ssItem.quantity : "--"}</td>
                              <td className="border px-3 py-2 text-center bg-yellow-50">
                                {crmItem ? (crmItem.is_rejected ? <span className="text-red-600 font-semibold">REJECTED</span> : crmItem.quantity) : "--"}
                              </td>
                              <td className="border px-3 py-2 text-center bg-green-50">{dispatchItem ? dispatchItem.quantity : "--"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Schemes */}
                  {order.status === "PENDING" && eligibleSchemes.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-pink-500 mb-2">Applied Schemes & Rewards</h3>
                      <table className="min-w-full text-sm border rounded-lg">
                        <thead className="bg-green-100">
                          <tr>
                            <th className="border px-3 py-2 text-left">Scheme Conditions</th>
                            <th className="border px-3 py-2 text-left">Rewards</th>
                          </tr>
                        </thead>
                        <tbody>
                          {eligibleSchemes.map((scheme) => (
                            <tr key={scheme.id} className="hover:bg-green-50">
                              <td className="border px-3 py-2">{scheme.conditions.map((c) => ` ${c.product_name}`).join(", ")}</td>
                              <td className="border px-3 py-2">
                                {scheme.rewards.map((r) => {
                                  const total = r.quantity * scheme.multiplier;
                                  return (
                                    <span key={r.product_name || r.product}>
                                      {total} {r.product_name || r.product} Free {scheme.in_box ? <span className="text-orange-600 font-bold text-xs">(in box)</span> : ""}
                                      {" "}
                                    </span>
                                  );
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* CRM notes */}
                  {order.crm_data && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium">CRM Verification</h4>
                      <div className="text-xs text-gray-700">{order.crm_data.status} — {order.crm_data.notes || "No notes"}</div>
                      <div className="text-xs text-gray-500">Verified at: {order.crm_data.verified_at ? new Date(order.crm_data.verified_at).toLocaleString() : "--"}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
