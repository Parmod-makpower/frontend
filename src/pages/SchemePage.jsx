import { useSchemes, useDeleteScheme } from "../hooks/useSchemes";
import { useNavigate } from "react-router-dom";
import MobilePageHeader from "../components/MobilePageHeader";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";

export default function SchemePage() {
  const { data: schemes = [], isLoading } = useSchemes();
  const deleteScheme = useDeleteScheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(""); // search state

  if (isLoading) return <div className="p-4">Loading...</div>;

  // Filter schemes based on search query
  const filteredSchemes = schemes.filter((scheme) => {
    const createdBy = scheme.created_by.toLowerCase();
    const conditionsText = scheme.conditions
      .map((c) => c.product_name || `Product #${c.product}`)
      .join(" ")
      .toLowerCase();
    const rewardsText = scheme.rewards
      .map((r) => r.product_name || `Product #${r.product}`)
      .join(" ")
      .toLowerCase();

    const query = searchQuery.toLowerCase();
    return (
      createdBy.includes(query) ||
      conditionsText.includes(query) ||
      rewardsText.includes(query)
    );
  });

  return (
    <div className="p-6 pb-16">
      <MobilePageHeader title="Schemes" />

      {/* Header Actions + Search */}
      <div className="flex justify-between items-center mb-6 pt-[60px] sm:pt-0 gap-4">
        <button
          onClick={() => navigate("/schemes/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 shadow"
        >
          <FaPlus /> New Scheme
        </button>

        <input
          type="text"
          placeholder="Search schemes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border px-3 py-2 rounded shadow focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      {/* No Schemes */}
      {filteredSchemes.length === 0 ? (
        <p className="text-gray-500">No schemes found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 border">#</th>
                <th className="px-4 py-2 border text-left">Conditions</th>
                <th className="px-4 py-2 border text-left">Rewards</th>
                <th className="px-4 py-2 border text-center">In Box</th>
                <th className="px-4 py-2 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchemes.map((scheme, index) => (
                <tr key={scheme.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border text-center">{index + 1}</td>

                  <td className="px-4 py-2 border">
                    <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                      {scheme.conditions.map((c) => (
                        <li key={c.id}>
                          Buy {c.min_quantity} of{" "}
                          {c.product_name || `Product #${c.product}`}
                        </li>
                      ))}
                    </ul>
                  </td>

                  <td className="px-4 py-2 border">
                    <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                      {scheme.rewards.map((r) => (
                        <li key={r.id}>
                          Get {r.quantity} of{" "}
                          {r.product_name || `Product #${r.product}`}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-2 border text-center">
                    <span
                      className={`px-3 py-1 rounded text-white text-sm ${scheme.in_box ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                      {scheme.in_box ? "Yes" : "No"}
                    </span>
                  </td>

                  <td className="px-4 py-2 border text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => navigate(`/schemes/edit/${scheme.id}`)}
                        className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 rounded text-sm text-white flex items-center gap-1 cursor-pointer"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        onClick={() => deleteScheme.mutate(scheme.id)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm flex items-center gap-1 cursor-pointer"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
