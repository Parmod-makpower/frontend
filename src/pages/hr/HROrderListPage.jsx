import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useHROrders } from "../../hooks/HR/useHROrders";

import HROrderFilter from "../../components/hr/HROrderFilter";
import HROrderTableRow from "../../components/hr/HROrderTableRow";

export default function HROrderListPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const {
    data: orders = [],
    isLoading,
    isFetching,
    refetch,
  } = useHROrders({
    search,
    status,
    fromDate,
    toDate,
  });

  // -----------------------------
  // Local Search
  // -----------------------------
  const filteredOrders = useMemo(() => {
    if (!search) return orders;

    const term = search.toLowerCase();

    return orders.filter((order) => {
      return (
        order.order_id?.toLowerCase().includes(term) ||
        order.ss_party_name?.toLowerCase().includes(term) ||
        order.crm_name?.toLowerCase().includes(term)
      );
    });
  }, [orders, search]);

  // -----------------------------
  // Group Orders
  // -----------------------------
  const today = [];
  const yesterday = [];
  const older = [];

  filteredOrders.forEach((order) => {
    const orderDate = new Date(order.created_at);
    const now = new Date();

    const isToday =
      orderDate.getDate() === now.getDate() &&
      orderDate.getMonth() === now.getMonth() &&
      orderDate.getFullYear() === now.getFullYear();

    const y = new Date();
    y.setDate(now.getDate() - 1);

    const isYesterday =
      orderDate.getDate() === y.getDate() &&
      orderDate.getMonth() === y.getMonth() &&
      orderDate.getFullYear() === y.getFullYear();

    if (isToday) {
      today.push(order);
    } else if (isYesterday) {
      yesterday.push(order);
    } else {
      older.push(order);
    }
  });

  const Section = ({ title }) => (
    <h2 className="text-sm font-semibold text-gray-700 mt-5 mb-2">
      {title}
    </h2>
  );

  const renderTable = (list) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-[950px] w-full">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-600">
              <th className="px-3 py-2 text-left">Order ID</th>
              <th className="px-3 py-2 text-left">Party</th>
              <th className="px-3 py-2 text-left">CRM</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
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
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-sm animate-pulse">
          Loading Orders...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1700px] mx-auto p-3 pb-20">
      {isFetching && (
        <div className="text-center text-xs text-blue-600 animate-pulse mb-2">
          Updating Orders...
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-4 items-start">
        {/* LEFT SIDE ORDERS */}
        <div>
          {filteredOrders.length === 0 && (
            <div className="text-center py-20">
              <img
                src="https://cdn-icons-png.flaticon.com/512/7486/7486740.png"
                alt="No Orders"
                className="w-24 mx-auto opacity-50"
              />

              <h3 className="text-sm font-semibold mt-4">
                No Orders Found
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Try changing filters.
              </p>
            </div>
          )}

          {today.length > 0 && (
            <>
              <Section title="Today" />
              {renderTable(today)}
            </>
          )}

          {yesterday.length > 0 && (
            <>
              <Section title="Yesterday" />
              {renderTable(yesterday)}
            </>
          )}

          {older.length > 0 && (
            <>
              <Section title="Older Orders" />
              {renderTable(older)}
            </>
          )}
        </div>

        {/* RIGHT FILTER */}
        <div className="xl:sticky xl:top-4">
          <HROrderFilter
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
            onRefresh={refetch}
            isFetching={isFetching}
          />
        </div>
      </div>
    </div>
  );
}