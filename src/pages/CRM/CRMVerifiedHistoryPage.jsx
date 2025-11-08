import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVerifiedOrders } from "../../hooks/useVerifiedOrders";
import { useUpdateOrderStatus } from "../../hooks/useUpdateOrderStatus";
import MobilePageHeader from "../../components/MobilePageHeader";
import { FaEllipsisV } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

export default function CRMVerifiedHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("APPROVED");
  const [q, setQ] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [punchedFilter, setPunchedFilter] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [reason, setReason] = useState("");

  const { mutate: updateStatus } = useUpdateOrderStatus();

  const { data, isLoading, isFetching, isError } = useVerifiedOrders({
    page,
    pageSize: 20,
    status,
    q,
    start_date: start,
    end_date: end,
    punched: punchedFilter,
  });

  const results = data?.results || [];
  const count = data?.count || 0;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(count / 20)),
    [count]
  );

  useEffect(() => {
    setPage(1);
  }, [status, start, end, q, punchedFilter]);

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

  const handleStatusChange = (id, newStatus) => {
    if (newStatus === "HOLD" || newStatus === "REJECTED") {
      setSelectedOrder(id);
      setSelectedStatus(newStatus);
      setReason("");
      setShowModal(true);
    } else {
      updateStatus({ id, status: newStatus, notes: null });
      setDropdownOpen(null);
    }
  };

  const handleConfirm = () => {
    if (!reason.trim()) {
      alert("Please enter a reason before proceeding.");
      return;
    }
    updateStatus({ id: selectedOrder, status: selectedStatus, notes: reason });
    setShowModal(false);
    setDropdownOpen(null);
  };

  return (
    <div className="p-4 sm:p-6 pb-20">
      <MobilePageHeader title="Orders — History" />

      <div className="sticky top-0 z-10 bg-white/70 backdrop-blur pt-[60px] sm:pt-0">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2 pb-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔎 Search Party / Order ID"
            className="border rounded p-2"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded p-2"
          >
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="HOLD">Hold</option>
          </select>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="border rounded p-2"
          />
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="border rounded p-2"
          />
          <label className="flex items-center gap-1 border rounded p-2 cursor-pointer">
            <input
              type="checkbox"
              checked={punchedFilter === true}
              onChange={(e) =>
                setPunchedFilter(e.target.checked ? true : null)
              }
            />
            Punched
          </label>
        </div>
      </div>

      {isError && <div className="text-red-600">Loading failed. Try again.</div>}

      {/* Table */}
      <div className="border rounded shadow-sm">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-gray-900 text-sm font-semibold">
            <tr>
              <th className="p-3 border">Order ID</th>
              <th className="p-3 border">Order Code</th>
              <th className="p-3 border">Party Name</th>
              <th className="p-3 border">CRM</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Order</th>
              <th className="p-3 border">Verified</th>
              {user?.role === "ADMIN" && (
                <th className="p-3 text-right">Action</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {isLoading || !results.length ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="animate-pulse border-t">
                  <td className="p-3" colSpan={10}>
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
                    className="border-t hover:bg-gray-50 relative cursor-pointer hover:bg-yellow-100"
                  >
                    <td className="p-3 border font-medium">{row.order_id}</td>
                    <td className="p-3 border font-semibold">
                      {orderCode}
                    </td>
                    <td className="p-3 border">{row.ss_party_name}</td>
                    <td className="p-3 border">{row.crm_name}</td>
                    <td className="p-3 border">
                      <span
                        className={`px-2 py-1 text-xs font-semibold ${row.status === "APPROVED"
                            ? "text-green-700"
                            : row.status === "REJECTED"
                              ? "text-red-700"
                              : row.status === "DISPATCH"
                                ? "text-blue-700"
                                : "text-purple-700"
                          }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3 border">
                      {new Date(row.ss_order_created_at).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })}
                    </td>
                    <td className="p-3 border">
                      {new Date(row.verified_at).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })}
                    </td>
                   
                    {user?.role === "ADMIN" && (
                      <td className="p-3 text-right relative">
                        <div className="inline-block relative">
                          <FaEllipsisV
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDropdownOpen(
                                dropdownOpen === row.id ? null : row.id
                              );
                            }}
                          />
                          {dropdownOpen === row.id && (
                            <div className="absolute right-0 mt-2 w-32 bg-white border rounded-xl shadow-lg z-20">
                              <button
                                className="block w-full px-4 py-2 text-left hover:bg-gray-100 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(row.id, "HOLD");
                                }}
                              >
                                Hold
                              </button>
                              <button
                                className="block w-full px-4 py-2 text-left hover:bg-gray-100 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(row.id, "APPROVED");
                                }}
                              >
                                Approve
                              </button>
                              <button
                                className="block w-full px-4 py-2 text-left hover:bg-gray-100 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(row.id, "REJECTED");
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md">
            <h2 className="text-lg font-bold mb-4">
              {selectedStatus === "HOLD"
                ? "Hold this Order?"
                : "Reject this Order?"}
            </h2>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason..."
              className="w-full border rounded p-2 h-28 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded-lg text-white cursor-pointer ${selectedStatus === "HOLD"
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-red-500 hover:bg-red-600"
                  }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 gap-2">
        <div className="text-sm text-gray-600">
          Page {page} / {totalPages}{" "}
          {isFetching && <span className="ml-2">(refreshing…)</span>}
        </div>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 rounded-xl border disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded-xl border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
