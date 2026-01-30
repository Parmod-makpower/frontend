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

  const crmSheetLinks = [
    {
      key: "ankita",
      url: "https://docs.google.com/spreadsheets/d/1ffxuFoXiDj5SewSNOj804PMNSkFwS9G8kF-Sf_CuwfQ/edit?gid=2115773395#gid=2115773395",
    },
    {
      key: "ajit",
      url: "https://docs.google.com/spreadsheets/d/1FD7Uhslzfw9fNCkc9RaXGetUYFDwbJN3bPjC0ht6suA/edit?gid=191365798#gid=191365798",
    },
    {
      key: "simran",
      url: "https://docs.google.com/spreadsheets/d/1p8ViqswWQ6Cc5WRiwgYC0xJ3shd7jHFpQyMLZO9dpoM/edit?gid=352048079#gid=352048079",
    },
    {
      key: "prince",
      url: "https://docs.google.com/spreadsheets/d/1SZgx4sb_Vf1bBLnsbc8Ta8JaTThtPkx8MSeEn4T2qoQ/edit?gid=352048079#gid=352048079",
    },
    {
      key: "harish",
      url: "https://docs.google.com/spreadsheets/d/1beGiqxt0oxkVDdfbY0z9LJn7FPr9xa0jvbVSgmskU8k/edit?gid=352048079#gid=352048079",
    },
  ];

  const getCrmSheetLink = (crmName = "") => {
    const name = crmName.toLowerCase();

    const match = crmSheetLinks.find((crm) =>
      name.includes(crm.key)
    );

    return match?.url || null;
  };


  if (isLoading) {
    return <p className="p-3 text-xs">Loading sheet data...</p>;
  }

  if (error) {
    return <p className="p-3 text-xs text-red-500">Failed to load data</p>;
  }

  return (
    <div className="p-1 max-w-5xl mx-auto">
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
                <th className="border px-3 py-2 text-center font-semibold">Gift</th>
                <th className="border px-3 py-2 text-center font-semibold">Gas Stove 4 Burner</th>
                <th className="border px-3 py-2 text-center font-semibold">Cookware Set</th>
                <th className="border px-3 py-2 text-center font-semibold">Dinner Set</th>
                <th className="border px-3 py-2 text-center font-semibold">Balance</th>
                <th className="border px-3 py-2 text-center font-semibold">Details</th>
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
                    Number(row.mahotsav_dispatch_quantity || 0) / 300
                  );

                  const gas = Number(row.gas_stove) || 0;
                  const cookware = Number(row.kitchen_cookware) || 0;
                  const dinner = Number(row.dinner_set) || 0;

                  const balance = combo - (gas + cookware + dinner);

                  return (
                    <tr
                      key={row.id}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-green-50 transition`}>
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
                      <td className={`border px-3 py-2 text-center font-semibold  ${balance < 0 ? "text-red-600" : "text-green-700"} `}> {balance} </td>
                      <td className="border px-3 py-2 text-center">
                        {getCrmSheetLink(row.crm_name) ? (
                          <a
                            href={getCrmSheetLink(row.crm_name)}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-block px-2 py-1 text-[10px] font-semibold text-white bg-blue-600 rounded hover:bg-blue-700">
                            More Details
                          </a>
                        ) : (
                          <span className="text-[10px] text-gray-400">N/A</span>
                        )}
                      </td>
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
