// ✅ Updated SchemePage.jsx - Better UI + New Page Navigation
import { useSchemes, useDeleteScheme } from "../hooks/useSchemes";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobilePageHeader from "../components/MobilePageHeader";

export default function SchemePage() {
  const { data: schemes = [], isLoading } = useSchemes();
  const deleteScheme = useDeleteScheme();
  const navigate = useNavigate();

  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 pb-16">
       <MobilePageHeader title="Schemes" />
      <div className="flex justify-between items-center mb-6 pt-[60px] sm:pt-0">
       
        <button
          onClick={() => navigate("/schemes/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
        >
          + New Scheme
        </button>
      </div>

      {schemes.length === 0 ? (
        <p className="text-gray-500">No schemes available.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {schemes.map((scheme) => (
            <div
              key={scheme.id}
              className="border rounded-lg shadow hover:shadow-lg transition bg-white p-5"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {scheme.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {scheme.start_date} → {scheme.end_date}
                  </p>
                  <p className="text-xs text-gray-500">
                    By: {scheme.created_by}
                  </p>
                </div>
              </div>

              {/* Conditions */}
              <div className="mt-3">
                <p className="font-medium text-gray-700">📌 Conditions:</p>
                <ul className="list-disc ml-5 text-sm text-gray-600">
                  {scheme.conditions.map((c) => (
                    <li key={c.id}>
                      Buy {c.min_quantity} of{" "}
                      {c.product_name || `Product #${c.product}`}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rewards */}
              <div className="mt-3">
                <p className="font-medium text-gray-700">🎁 Rewards:</p>
                <ul className="list-disc ml-5 text-sm text-gray-600">
                  {scheme.rewards.map((r) => (
                    <li key={r.id}>
                      Get {r.quantity} of{" "}
                      {r.product_name || `Product #${r.product}`}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => navigate(`/schemes/edit/${scheme.id}`)}
                  className="px-4 py-1 bg-yellow-400 hover:bg-yellow-500 rounded text-sm"
                >
                  ✏ Edit
                </button>
                <button
                  onClick={() => deleteScheme.mutate(scheme.id)}
                  className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
