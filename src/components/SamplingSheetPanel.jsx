import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { useSamplingSheet } from "../hooks/SS/useSamplingSheet";

export default function SamplingSheetPanel({
  isOpen,
  onClose,
  partyName,
}) {
  const { data = [], isLoading, error } = useSamplingSheet();
  const [search, setSearch] = useState("");

  const partyData = useMemo(() => {
    return data.find(
      (row) =>
        row.party_name?.toLowerCase() === partyName?.toLowerCase()
    );
  }, [data, partyName]);

  const filteredItems = useMemo(() => {
    if (!partyData?.items) return [];

    return partyData.items
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean)
      .filter((item) =>
        item.toLowerCase().includes(search.toLowerCase())
      );
  }, [partyData, search]);

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed bottom-0 left-0 right-0
        w-full
        h-[40vh]          /* ✅ FIXED HEIGHT */
        bg-white border-t
        shadow-2xl
        z-40
        flex flex-col     /* 🔥 IMPORTANT */
      "
    >
      {/* Header (fixed) */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-100">
        <h2 className="text-sm font-semibold text-gray-800">
          Sampling Sheet – {partyName}
        </h2>
        <button onClick={onClose}>
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Search (fixed) */}
      <div className="p-3 border-b bg-white">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search item..."
          className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      {/* Body (scrollable) */}
      <div className="flex-1 p-4 overflow-y-auto">
        {isLoading && (
          <p className="text-sm text-gray-500">Loading...</p>
        )}

        {error && (
          <p className="text-sm text-red-500">
            Failed to load data
          </p>
        )}

        {!isLoading && !partyData && (
          <p className="text-sm text-gray-500">
            No data found for this party
          </p>
        )}

        {partyData && filteredItems.length === 0 && (
          <p className="text-sm text-gray-500">
            No matching items
          </p>
        )}

        {filteredItems.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filteredItems.map((item, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
