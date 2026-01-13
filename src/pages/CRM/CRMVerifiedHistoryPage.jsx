import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVerifiedOrders } from "../../hooks/useVerifiedOrders";
import { useDebounce } from "../../hooks/useVerifiedOrders";
import MobilePageHeader from "../../components/MobilePageHeader";

export default function CRMVerifiedHistoryPage() {
  const navigate = useNavigate();

  const [punchedFilter, setPunchedFilter] = useState(() => {
    const saved = localStorage.getItem("punchedFilter");
    return saved === "true" ? true : null;
  });


const [q, setQ] = useState("");
const debouncedQ = useDebounce(q, 500);

// minimum 3 character rule
const finalQ = debouncedQ.length >= 3 ? debouncedQ : "";

const { data, isLoading, isError } = useVerifiedOrders({
  q: finalQ,
  punched: punchedFilter,
});


  const results = data || [];

  useEffect(() => {
    if (punchedFilter === true) {
      localStorage.setItem("punchedFilter", "true");
    } else {
      localStorage.removeItem("punchedFilter");
    }
  }, [punchedFilter]);

  const crmMapping = {
    "Ankita Dhingra": "AD-AP",
    "Prince Gupta": "PG-AP",
    "Ajit Mishra": "AM-AP",
    "Harish Sharma": "HS-AP",
    "Simran Khanna": "SK-AP",
    "Rahul Kumar": "RK-AP",
    "Vivek Sharma": "VS-AP",
    "Aarti Singh": "AS-AP",
    "Kanak Maurya": "KM-AP",
  };

  return (
    <div className="p-4 sm:p-0 pb-24">
      <MobilePageHeader title="Orders — History" />

      {/* Filters */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur pt-[60px] sm:pt-0 pb-3 px-2">
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔎 Search Order Code"
            className="border rounded p-2 w-full sm:w-auto"
          />

          <label className="flex items-center gap-2 border rounded p-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={punchedFilter === true}
              onChange={(e) =>
                setPunchedFilter(e.target.checked ? true : null)
              }
            />
            <span>Punched</span>
          </label>
        </div>
      </div>

      {isError && (
        <div className="text-red-600 text-center py-3">
          Loading failed. Try again.
        </div>
      )}

      {/* Table Responsive */}
      <div>
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-200 text-gray-900 text-sm font-semibold">
            <tr>
              <th className="p-3 border">Order ID</th>
              <th className="p-3 border">Order Code</th>
              <th className="p-3 border">Party</th>
              <th className="p-3 border">CRM</th>
              <th className="p-3 border">Order</th>
              <th className="p-3 border">Verified</th>
              <th className="p-3 border">Track</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 text-center">
            {isLoading || !results.length ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="animate-pulse border-t">
                  <td className="p-3" colSpan={7}>
                    <div className="h-5 bg-gray-200 rounded" />
                  </td>
                </tr>
              ))
            ) : (
              results.map((row) => {
                const orderCode = crmMapping[row.crm_name]
                  ? `${crmMapping[row.crm_name]}${row.id}`
                  : `${row.crm_name}-${row.id}`;

                return (
                  <tr
                    key={row.id}
                    onClick={() =>
                      navigate(`/crm/verified/${row.id}`, {
                        state: { order: row },
                      })
                    }
                    className="border-t hover:bg-yellow-100 cursor-pointer"
                  >
                    <td className="p-3 border">{row.order_id}</td>

                    <td className="p-3 border font-semibold">{orderCode}</td>

                    <td className="p-3 border">{row.ss_party_name}</td>

                    <td className="p-3 border">{row.crm_name}</td>

                    <td className="p-3 border">
                      {new Date(row.ss_order_created_at).toLocaleString(
                        "en-IN",
                        { timeZone: "Asia/Kolkata" }
                      )}
                    </td>

                    <td className="p-3 border">
                      {new Date(row.verified_at).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })}
                    </td>

                    {/* FIXED TRACK BUTTON */}
                    <td
                      className="p-3 border text-blue-600 underline hover:bg-blue-400 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation(); // important fix
                        navigate(`/orders-tracking/${row.order_id}`);
                      }}
                    >
                      Track
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
