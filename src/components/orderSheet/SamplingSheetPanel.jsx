import { useState, useMemo } from "react";
import { useSamplingSheet } from "../../hooks/SS/useSamplingSheet";
import { useCachedProducts } from "../../hooks/useCachedProducts";

export default function SamplingSheetPanel({ partyName }) {
  const { data = [], isLoading, error } = useSamplingSheet();
  const { data: products = [] } = useCachedProducts();

  const [search, setSearch] = useState("");

  // ✅ NEW → toggle mode
  const [selectedType, setSelectedType] = useState("sampling");

  // 🔹 Party match
  const partyData = useMemo(() => {
    return data.find(
      (row) =>
        row.party_name?.toLowerCase() ===
        partyName?.toLowerCase()
    );
  }, [data, partyName]);

  // 🔹 Product → Stock map
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

  // ✅ Current items based on toggle
  const currentItems = useMemo(() => {
    if (!partyData) return "";

    return selectedType === "sampling"
      ? partyData.sampling_Items || ""
      : partyData.sixty_days_Items || "";
  }, [partyData, selectedType]);

  // 🔹 Split & Filter Items
  const filteredItems = useMemo(() => {
    if (!currentItems) return [];

    return currentItems
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean)
      .filter((item) =>
        item.toLowerCase().includes(search.toLowerCase())
      );
  }, [currentItems, search]);

  return (
    <div className="bg-blue-50 rounded p-2 overflow-x-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-2 gap-2">
        <h3 className="font-semibold text-xs text-blue-800">
          📋 Sampling Sheet
        </h3>

        {/* ✅ TOGGLE BUTTONS */}
        <div className="flex border rounded overflow-hidden text-[10px]">

          <button
            onClick={() => setSelectedType("sampling")}
            className={`px-2 py-1 transition ${
              selectedType === "sampling"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Sampling
          </button>

          <button
            onClick={() => setSelectedType("sixty")}
            className={`px-2 py-1 transition ${
              selectedType === "sixty"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            60 Days
          </button>

        </div>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={`Search ${
          selectedType === "sampling"
            ? "sampling"
            : "60 days"
        } item...`}
        className="mb-3 w-full px-3 py-1 text-sm border rounded"
      />

      {/* STATES */}
      {isLoading && (
        <p className="text-sm text-gray-500">
          Loading...
        </p>
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

      {/* TABLE */}
      {partyData && filteredItems.length > 0 && (
        <table className="w-full border border-blue-200 text-xs">

          <thead className="bg-blue-100 text-blue-800">
            <tr>
              <th className="px-2 py-1 border text-center">
                #
              </th>

              <th className="px-2 py-1 border text-center">
                Item Name
              </th>

              <th className="px-2 py-1 border text-center bg-red-200">
                Stock
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.map((item, index) => {

              const stock =
                productStockMap[item.trim().toLowerCase()] ?? 0;

              return (
                <tr
                  key={index}
                  className="hover:bg-blue-50 text-center"
                >
                  <td className="border">
                    {index + 1}
                  </td>

                  <td className="border font-medium">
                    {item}
                  </td>

                  <td
                    className={`border text-center font-semibold ${
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

      {/* EMPTY */}
      {partyData && filteredItems.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          No matching items found
        </p>
      )}
    </div>
  );
}