import { useState, useMemo } from "react";
import { FaSearch, FaUsers } from "react-icons/fa";
import { useMahotsavSheet } from "../../hooks/CRM/useMahotsav";
import { useAuth } from "../../context/AuthContext";

export default function PartyItemSheetPage() {
  const { data = [], isLoading, error } = useMahotsavSheet();
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  const filteredData = useMemo(() => {
    const term = search.toLowerCase();

    return data.filter((row) => {
      // 🔍 party name search
      const matchParty = row.party_name?.toLowerCase().includes(term);

      // 🔐 role based access
      const isAdmin = user?.role === "ADMIN";
      const isOwnCRM =
        user?.role === "CRM" &&
        row.crm_name?.toLowerCase() === user?.name?.toLowerCase();

      return matchParty && (isAdmin || isOwnCRM);
    });
  }, [search, data, user]);

  if (isLoading) {
    return <p className="p-3 text-xs">Loading sheet data...</p>;
  }

  if (error) {
    return <p className="p-3 text-xs text-red-500">Failed to load data</p>;
  }

  return (
    <div className="p-1">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <FaUsers className="text-green-600 text-sm" />
        <h2 className="text-sm font-semibold text-gray-800">
          Party Mahotsav Sheet
        </h2>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
        <input
          type="text"
          placeholder="Search Party Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full
            border
            rounded-md
            pl-8 pr-3 py-2
            text-xs
            focus:outline-none
            focus:ring-1
            focus:ring-green-500
          "
        />
      </div>

      {/* 🔒 FIXED HEIGHT TABLE */}
      <div className="border rounded bg-white overflow-hidden">
        <div className="max-h-[460px] overflow-y-auto">
          <table className="w-full text-[11px] border-collapse">
            {/* Sticky Header */}
            <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
              <tr>
                <th className="border px-3 py-2 text-left font-semibold">
                  CRM Name
                </th>
                <th className="border px-3 py-2 text-left font-semibold">
                  Party Name
                </th>
                <th className="border px-3 py-2 text-center font-semibold">
                  Mahotsav Qty
                </th>
                <th className="border px-3 py-2 text-center font-semibold">Combo</th>
                <th className="border px-3 py-2 text-center font-semibold">Gas Stove 4 Burner</th>
                <th className="border px-3 py-2 text-center font-semibold">Kitchen Cookware Set</th>
                <th className="border px-3 py-2 text-center font-semibold">Dinner Set 48 Pcs</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-3 py-4 text-center text-gray-500">
                    No matching party found
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => {
                  const combo = Math.floor(
                    (row.mahotsav_dispatch_quantity || 0) / 300
                  );


                  return (
                    <tr
                      key={row.id}
                      className={`
            ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
            hover:bg-green-50
            transition
          `}
                    >
                      <td className="border px-3 py-2 font-medium text-gray-800">
                        {row.crm_name}
                      </td>
                      <td className="border px-3 py-2 font-medium text-gray-800">
                        {row.party_name}
                      </td>

                      <td className="border px-3 py-2 text-center font-semibold text-green-700">
                        {row.mahotsav_dispatch_quantity}
                      </td>

                      <td className="border px-3 py-2 text-center font-semibold text-blue-700">{combo}</td>
                      <td className="border px-3 py-2 text-center font-semibold bg-orange-200">{row.gas_stove}</td>
                      <td className="border px-3 py-2 text-center font-semibold bg-orange-200">{row.kitchen_cookware}</td>
                      <td className="border px-3 py-2 text-center font-semibold bg-orange-200">{row.dinner_set}</td>
                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* Footer Note */}
      <p className="mt-2 text-[10px] text-gray-400 text-right">
        Showing {filteredData.length} records
      </p>
    </div>
  );
}
