import { useState, useMemo } from "react";
import { useSamplingSheet } from "../../hooks/SS/useSamplingSheet";
import { useCachedProducts } from "../../hooks/useCachedProducts";

export default function SamplingSheetPanel({ partyName }) {
  const { data = [], isLoading, error } = useSamplingSheet();
  const { data: products = [] } = useCachedProducts();
  const [search, setSearch] = useState("");

  // 🔹 Party match
  const partyData = useMemo(() => {
    return data.find(
      (row) =>
        row.party_name?.toLowerCase() === partyName?.toLowerCase()
    );
  }, [data, partyName]);

  // 🔹 Product → Stock map (SAME AS NOT IN STOCK PAGE)
  const productStockMap = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      if (p.product_name) {
        map[p.product_name.trim().toLowerCase()] =
          p.virtual_stock ?? 0;
      }
    });
    return map;
  }, [products]);

  // 🔹 Split & filter items
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

  return (
    <div className="bg-blue-50 rounded p-2 overflow-x-auto">
      <h3 className="font-semibold text-xs text-blue-800 mb-2">
        📋 Sampling Sheet
      </h3>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search item..."
        className="mb-3 w-full px-3 py-1 text-sm border rounded"
      />

      {/* States */}
      {isLoading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-500">Failed to load data</p>}

      {!isLoading && !partyData && (
        <p className="text-sm text-gray-500">
          No data found for this party
        </p>
      )}

      {/* TABLE */}
      {partyData && filteredItems.length > 0 && (
        <table className="w-full border border-blue-200 text-xs">
          <thead className="bg-blue-100 text-blue-800">
            <tr>
              <th className="px-2 py-2 border text-center">#</th>
              <th className="px-2 py-2 border text-center">Item Name</th>
              <th className="px-2 py-2 border text-center bg-red-200">
                Stock
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, index) => {
              const stock =
                productStockMap[item.trim().toLowerCase()] ?? 0;

              return (
                <tr key={index} className="hover:bg-blue-50 text-center">
                  <td className="px-2 py-1 border">{index + 1}</td>

                  <td className="px-2 py-1 border font-medium">
                    {item}
                  </td>

                  <td
                    className={`px-2 py-1 border text-center font-semibold ${
                      stock > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stock}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {partyData && filteredItems.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          No matching items
        </p>
      )}
    </div>
  );
}
