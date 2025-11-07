
export default function TemperedSummaryPanel({
  totalSSOrderQty,
  totalApprovedQty,
  totalProducts,
  categoryWiseTotals
}) {
    const getShortName = (cat) => {
  if (cat === "UV TEMPERED") return "UV";
  if (cat === "TEMPERED BODYGUARD") return "Bodyguard";
  if (cat === "TEMPERED SUPER X") return "Super X";
  return cat;
};

  return (
    <div className="bg-gray-100 rounded w-full">

      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-600 text-white rounded">
        <h2 className="font-bold">Tempered Order Summary</h2>

        <div className="text-sm font-semibold">
          <span className="text-green-600 bg-white p-1 px-2 rounded">
            {totalProducts}
          </span>
        </div>
      </div>

      {/* Category Table */}
      {categoryWiseTotals && Object.keys(categoryWiseTotals).length > 0 && (
        <div className="mt-1 overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-red-100">
              <tr>
                <th className="p-2 border text-center">Category</th>
                <th className="p-2 border text-center">SS Order Qty</th>
                <th className="p-2 border text-center">Approved Qty</th>
              </tr>
            </thead>

            <tbody>
              {Object.keys(categoryWiseTotals).map((cat) => (
                <tr key={cat}>
                  <td className="p-2 border font-sm text-center">{getShortName(cat)}</td>
                  <td className="p-2 border text-center">
                    {categoryWiseTotals[cat].ssQty}
                  </td>
                  <td className="p-2 border text-center">
                    {categoryWiseTotals[cat].approvedQty}
                  </td>
                </tr>
              ))}

              <tr>
                <td className="p-2 border font-sm text-center">Total</td>
                <td className="p-2 border text-center">{totalSSOrderQty}</td>
                <td className="p-2 border text-center">{totalApprovedQty}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
