import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useHROrders } from "../../hooks/HR/useHROrders";

import HROrderFilter from "../../components/hr/HROrderFilter";
import HROrderTableRow from "../../components/hr/HROrderTableRow";

export default function HROrderListPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [crm, setCrm] = useState("ALL");

  const {
    data: orders = [],
    isLoading,
    isFetching,
    refetch,
  } = useHROrders();

  const crmList = useMemo(() => {
    return [
      ...new Set(
        orders
          .map((o) => o.crm_name)
          .filter(Boolean)
      ),
    ];
  }, [orders]);

  // -----------------------------
  // Local Search
  // -----------------------------
 const filteredOrders = useMemo(() => {
  return orders
    .filter((order) => {
      const term = search.toLowerCase();

      const matchSearch =
        !search ||
        order.order_id?.toLowerCase().includes(term) ||
        order.ss_party_name?.toLowerCase().includes(term) ||
        order.crm_name?.toLowerCase().includes(term);

      const matchStatus =
        status === "ALL" || order.status === status;

      const matchCRM =
        crm === "ALL" || order.crm_name === crm;

      return matchSearch && matchStatus && matchCRM;
    })
    .sort(
      (a, b) =>
        new Date(b.created_at) -
        new Date(a.created_at)
    );
}, [orders, search, status, crm]);

  

  const Section = ({ title }) => (
    <h2 className="mt-5 mb-2 text-sm font-semibold text-gray-700">
      {title}
    </h2>
  );

  const renderTable = (list) => (
    <div className="overflow-hidden rounded border border-gray-200 ">
    <div className=" overflow-x-auto max-h-[65vh]">
        <table className="w-full min-w-[1200px] border-separate border-spacing-0 ">
          <thead className="sticky top-0 z-10 bg-slate-200 border">
           <tr className="text-xs uppercase tracking-wide text-gray-600">
              <th className="px-4 py-3">Order ID</th>

              <th className="px-4 py-3 text-left">Party Name</th>

              <th className="px-4 py-3">CRM</th>

              <th className="px-4 py-3">Date</th>

              <th className="px-4 py-3">Status</th>

              <th className="px-4 py-3 text-left">Remarks</th>
            </tr>
          </thead>

          <tbody >
            {list.map((order) => (
              <HROrderTableRow
                key={order.id}
                order={order}
                onClick={() =>
                  navigate(`/hr/orders/${order.id}`, {
                    state: {
                      order,
                    },
                  })
                }
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="animate-pulse text-sm text-gray-500">
          Loading Orders...
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        user?.role === "CRM"
          ? "w-full p-3 pb-20"
          : "mx-auto max-w-[1900px] p-3 pb-20"
      }
    >
      {isFetching && (
        <div className="mb-2 animate-pulse text-center text-xs text-blue-600">
          Updating Orders...
        </div>
      )}

      <div
        className={
          user?.role === "CRM"
            ? "grid grid-cols-1"
            : "grid grid-cols-1 gap-4 items-start xl:grid-cols-[minmax(0,1fr)_300px]"
        }
      >
        {/* LEFT SIDE ORDERS */}
        <div>
          {filteredOrders.length === 0 && (
            <div className="py-20 text-center">
              <img
                src="https://cdn-icons-png.flaticon.com/512/7486/7486740.png"
                alt="No Orders"
                className="mx-auto w-24 opacity-50"
              />

              <h3 className="mt-4 text-sm font-semibold">
                No Orders Found
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Try changing filters.
              </p>
            </div>
          )}


         {filteredOrders.length > 0 && renderTable(filteredOrders)}
        </div>

        {/* RIGHT FILTER */}
        {user?.role !== "CRM" && (
          <div className="xl:sticky xl:top-4">
            <HROrderFilter
              search={search}
              setSearch={setSearch}
              status={status}
              setStatus={setStatus}
              crm={crm}
              setCrm={setCrm}
              crmList={crmList}
              onRefresh={refetch}
              isFetching={isFetching}
            />
          </div>
        )}
      </div>
    </div>
  );
}