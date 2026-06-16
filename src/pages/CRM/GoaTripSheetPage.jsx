import { useState, useMemo } from "react";
import {
  FaSearch,
  FaUsers,
  FaExternalLinkAlt,
} from "react-icons/fa";

import { useMahotsavSheet } from "../../hooks/CRM/useMahotsav";
import { useAuth } from "../../context/AuthContext";

export default function PartyItemSheetPage() {
  const { data = [], isLoading, error } = useMahotsavSheet();
  const { user } = useAuth();

  const [search, setSearch] = useState("");

  const crmSheetLinks = {
    ankita:
      "https://docs.google.com/spreadsheets/d/1HJDQoezYWSJRIxjI9Xya4A7CTTpOM8RD9w_wNBnQPX8/edit?gid=352048079#gid=352048079",

    ajit:
      "https://docs.google.com/spreadsheets/d/1FzaxPWQoSnl6L_w8hP-0ACjstGHxM1K1YVI1RhP-WTc/edit?gid=352048079#gid=352048079",

    simran:
      "https://docs.google.com/spreadsheets/d/1pACzKV_LbG9zHWagHDhvNo8WRwBZUevSpk-Ngaj23Cs/edit?gid=352048079#gid=352048079",

    prince:
      "https://docs.google.com/spreadsheets/d/1oiHLhjfC6jYcvlbAipIUh2cNOls6fPN9ZSCSCWbRYfs/edit?gid=352048079#gid=352048079",

    harish:
      "https://docs.google.com/spreadsheets/d/1gAeduXq4Idygzp02jG2k9b2Gkht4qdxUyzPmyR2jrpA/edit?gid=352048079#gid=352048079",
  };

  const getCrmSheetLink = (crmName = "") => {
    const crm = crmName.toLowerCase();

    return (
      Object.entries(crmSheetLinks).find(([key]) =>
        crm.includes(key)
      )?.[1] || null
    );
  };

  const filteredData = useMemo(() => {
    const term = search.toLowerCase();

    return data.filter((row) => {
      const matchParty = row.party_name
        ?.toLowerCase()
        .includes(term);

      const isAdmin = user?.role === "ADMIN";

      const isOwnCRM =
        user?.role === "CRM" &&
        row.crm_name
          ?.toLowerCase()
          .trim() === user?.name?.toLowerCase().trim();

      return matchParty && (isAdmin || isOwnCRM);
    });
  }, [data, search, user]);

  const totalQty = useMemo(() => {
    return filteredData.reduce(
      (sum, row) =>
        sum + Number(row.mahotsav_dispatch_quantity || 0),
      0
    );
  }, [filteredData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-[11px] text-gray-500">
          Loading sheet data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-[11px] text-red-500">
          Failed to load data
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-2">

      {/* Header */}
      <div className="bg-white border rounded shadow-sm p-3 mb-3">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">
            <FaUsers className="text-green-600 text-xs" />

            <div>
              <h1 className="text-xs font-semibold text-gray-800">
                Goa Couple Trip Sheet
              </h1>

              <p className="text-[10px] text-gray-500">
                Party Dispatch Tracking
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[9px] text-gray-500">
              Total Qty
            </p>

            <p className="text-sm font-bold text-green-700">
              {totalQty}
            </p>
          </div>

        </div>

      </div>

      {/* Search */}
      <div className=" py-2 mb-3">

        <div className="relative">

          <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]" />

          <input
            type="text"
            placeholder="Search party..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="
              w-full
              h-8
              pl-7
              pr-3
              text-[11px]
              border
              rounded-md
              outline-none
              focus:ring-1
              focus:ring-green-500
            "
          />
        </div>

      </div>

      {/* Table */}
      <div className="bg-white border rounded shadow-sm overflow-hidden">

        <div className="max-h-[70vh] overflow-auto">

          <table className="w-full border-collapse text-[10px]">

            <thead className="sticky top-0 z-10 bg-gray-50">

              <tr className="text-gray-700">

                <th className="border-b px-2 py-2 text-left font-semibold">
                  CRM
                </th>

                <th className="border-b px-2 py-2 text-left font-semibold">
                  Party Name
                </th>

                <th className="border-b px-2 py-2 text-center font-semibold">
                  Qty
                </th>

                <th className="border-b px-2 py-2 text-center font-semibold">
                  Details
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-gray-500 text-[10px]"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => (
                  <tr
                    key={`${row.party_name}-${index}`}
                    className="
                      border-b
                      hover:bg-green-50
                      transition-colors
                    "
                  >
                    <td className="px-2 py-2 font-medium text-gray-700 whitespace-nowrap">
                      {row.crm_name}
                    </td>

                    <td className="px-2 py-2 text-gray-800">
                      {row.party_name}
                    </td>

                    <td className="px-2 py-2 text-center font-semibold text-green-700">
                      {Number(
                        row.mahotsav_dispatch_quantity || 0
                      ).toLocaleString()}
                    </td>

                    <td className="px-2 py-2 text-center">

                      {getCrmSheetLink(row.crm_name) ? (
                        <a
                          href={getCrmSheetLink(
                            row.crm_name
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            inline-flex
                            items-center
                            gap-1
                            px-2
                            py-1
                            rounded
                            bg-blue-600
                            text-white
                            text-[9px]
                            font-medium
                            hover:bg-blue-700
                          "
                        >
                          <FaExternalLinkAlt size={8} />
                          Open
                        </a>
                      ) : (
                        <span className="text-gray-400">
                          —
                        </span>
                      )}

                    </td>

                  </tr>
                ))
              )}

            </tbody>

            <tfoot>

              <tr className="bg-green-50 font-semibold">

                <td
                  colSpan={2}
                  className="px-2 py-2 text-gray-800"
                >
                  TOTAL
                </td>

                <td className="px-2 py-2 text-center text-green-800">
                  {totalQty.toLocaleString()}
                </td>

                <td />
              </tr>

            </tfoot>

          </table>

        </div>

      </div>

      {/* Footer */}
      <div className="mt-2 flex justify-between text-[9px] text-gray-500">

        <span>
          Records: {filteredData.length}
        </span>

        <span>
          Goa Trip Scheme Dashboard
        </span>

      </div>

    </div>
  );
}