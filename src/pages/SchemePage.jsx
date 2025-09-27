import { useSchemes, useDeleteScheme } from "../hooks/useSchemes";
import { useNavigate } from "react-router-dom";
import MobilePageHeader from "../components/MobilePageHeader";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

export default function SchemePage() {
  const { data: schemes = [], isLoading } = useSchemes();
  const deleteScheme = useDeleteScheme();
  const navigate = useNavigate();

  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 pb-16">
      <MobilePageHeader title="Schemes" />

      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6 pt-[60px] sm:pt-0">
        <button
          onClick={() => navigate("/schemes/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 shadow"
        >
          <FaPlus /> New Scheme
        </button>
      </div>

      {/* No Schemes */}
      {schemes.length === 0 ? (
        <p className="text-gray-500">No schemes available.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {schemes.map((scheme) => (
            <div
              key={scheme.id}
              className="border rounded-lg shadow hover:shadow-lg transition bg-white p-5 flex flex-col justify-between"
            >
              {/* Created By */}
              <p className="text-xs text-gray-500 mb-3">
                Created by: <span className="font-medium">{scheme.created_by}</span>
              </p>

              {/* Conditions */}
              <div className="mb-3">
                <p className="font-medium text-gray-700 mb-1">📌 Conditions:</p>
                <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
                  {scheme.conditions.map((c) => (
                    <li key={c.id}>
                      Buy {c.min_quantity} of{" "}
                      {c.product_name || `Product #${c.product}`}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rewards */}
              <div className="mb-3">
                <p className="font-medium text-gray-700 mb-1">🎁 Rewards:</p>
                <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
                  {scheme.rewards.map((r) => (
                    <li key={r.id}>
                      Get {r.quantity} of{" "}
                      {r.product_name || `Product #${r.product}`}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 justify-end">
                <button
                  onClick={() => navigate(`/schemes/edit/${scheme.id}`)}
                  className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 rounded text-sm text-white flex items-center gap-1"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => deleteScheme.mutate(scheme.id)}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm flex items-center gap-1"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
