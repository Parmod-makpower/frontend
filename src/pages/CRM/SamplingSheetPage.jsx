
import { useSamplingSheet } from "../../hooks/SS/useSamplingSheet";

export default function PartyItemSheetPage() {
  const { data = [], isLoading, error } = useSamplingSheet();

  if (isLoading) {
    return <p className="p-4 text-sm">Loading sheet data...</p>;
  }

  if (error) {
    return <p className="p-4 text-sm text-red-500">Failed to load data</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">
        Party Item Sheet
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">Party Name</th>
              <th className="border px-3 py-2 text-left">Items</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td className="border px-3 py-2 font-medium">
                  {row.party_name}
                </td>
                <td className="border px-3 py-2">
                  {row.items}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
