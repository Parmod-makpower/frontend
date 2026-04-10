import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce, useVerifiedOrders } from "../../hooks/useVerifiedOrders";
import CustomLoader from "../../components/CustomLoader";
import VerifiedOrdersFilter from "../../components/AfterVerified/VerifiedOrdersFilter";
import { FaCheckCircle, FaClock, FaFilter } from "react-icons/fa";


export default function CRMVerifiedHistoryPage() {
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);

  // ✅ SINGLE SOURCE OF TRUTH
  const STORAGE_KEY = "verified_orders_filters";

  // ✅ INIT from localStorage
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : {
        q: "",
        party: "",
        fromDate: "",
        toDate: "",
        punched: false,
      };
  });

  // 🔥 API ke liye separate state
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const debouncedQ = useDebounce(appliedFilters.q, 500);
  const finalQ = debouncedQ.length >= 3 ? debouncedQ : "";

  const { data, isLoading, isError, isFetching } =
    useVerifiedOrders({
      ...appliedFilters,
      q: finalQ,
    });

  const results = data || [];

  const handleApply = (customFilters) => {
    const finalFilters = customFilters || filters;

    setAppliedFilters(finalFilters);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalFilters));
  };

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  if (isLoading) {
    return <CustomLoader fullScreen text="Loading orders..." />;
  }

  return (
    <div>
      {/* ✅ MOBILE HEADER */}
      <div className="fixed sm:hidden top-0 left-0 right-0 z-50 bg-white p-3 border-b shadow flex justify-between">
        <h2 className="text-sm font-semibold">
          Orders ({results.length})
        </h2>

        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 text-blue-600"
        >
          <FaFilter /> Filter
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4 pt-[60px] sm:pt-0">

        {/* ✅ TABLE */}
        <div className="col-span-12 md:col-span-10">
          <div className="h-[75vh] overflow-y-auto">
            <table className="w-full border-t text-sm text-center">
              <thead className="bg-gray-200 sticky top-0">
                <tr>
                  <th className="border-b border-x border-gray-400 p-2">#</th>
                  <th className="border-b border-x border-gray-400 p-2">Order ID</th>
                  <th className="border-b border-x border-gray-400 p-2">Code</th>
                  <th className="border-b border-x border-gray-400 p-2">Party</th>
                  <th className="border-b border-x border-gray-400 p-2">CRM</th>
                  <th className="border-b border-x border-gray-400 p-2">Order</th>
                  <th className="border-b border-x border-gray-400 p-2">Verified</th>
                  <th className="border-b border-x border-gray-400 p-2">
                    <label className="flex items-center justify-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.punched === true}
                        onChange={(e) => {
                          const updated = {
                            ...filters,
                            punched: e.target.checked ? true : false,
                          };

                          setFilters(updated);
                          setAppliedFilters(updated); // 🔥 instant API call
                        }}
                      />
                    </label>
                  </th>
                  <th className="border-b border-x border-gray-400 p-2">Track</th>
                </tr>
              </thead>

              <tbody>
                {isFetching ? (
                  <tr>
                    <td colSpan={7}>
                      <CustomLoader text="Searching..." />
                    </td>
                  </tr>
                ) : results.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  results.map((row, i) => {
                    const orderCode = crmMapping[row.crm_name]
                      ? `${crmMapping[row.crm_name]}${row.id}`
                      : `${row.crm_name}-${row.id}`;

                    return (
                      <tr
                        key={row.id}
                        onClick={() =>
                          navigate(`/order/${row.id}/details`)
                        }
                        className={`cursor-pointer`}
                      >
                        <td className="border-b border-x border-gray-400 p-2">{i + 1}</td>
                        <td className="border-b border-x border-gray-400 p-2">{row.order_id}</td>
                        <td className="border-b border-x border-gray-400 p-2 font-semibold">
                          {orderCode}
                        </td>
                        <td className="border-b border-x border-gray-400 p-2">
                          {row.ss_party_name}
                        </td>
                        <td className="border-b border-x border-gray-400 p-2">{row.crm_name}</td>

                        <td className="border-b border-x border-gray-400 p-2 text-xs">
                          {new Date(
                            row.ss_order_created_at
                          ).toLocaleString("en-IN")}
                        </td>

                        <td className="border-b border-x border-gray-400 p-2 text-xs">
                          {new Date(row.verified_at).toLocaleString(
                            "en-IN"
                          )}
                        </td>


                        <td className="border-b border-x border-gray-400 p-2 text-center">
                          {row.punched ? (
                            <span className="inline-flex items-center gap-1 px-2 py-[2px] text-xs rounded-full bg-green-50 text-green-600">
                              <FaCheckCircle className="text-xs" />
                              Punched
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-[2px] text-xs rounded-full bg-gray-100 text-gray-500">
                              <FaClock className="text-xs" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td
                          className="border-b border-x border-gray-400 p-2 text-blue-600 underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/orders-tracking/${row.order_id}`
                            );
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

        {/* ✅ DESKTOP FILTER */}
        <div className="hidden md:block col-span-2">
          <VerifiedOrdersFilter
            inline={true}
            filters={filters}
            setFilters={setFilters}
            onApply={handleApply}
          />

        </div>
      </div>

      {/* ✅ MOBILE DRAWER */}
      <VerifiedOrdersFilter
        open={drawerOpen}
        setOpen={setDrawerOpen}
        filters={filters}
        setFilters={setFilters}
        onApply={handleApply}
      />
    </div>
  );
}