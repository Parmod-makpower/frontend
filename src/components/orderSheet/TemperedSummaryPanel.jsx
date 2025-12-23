
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
      <div className="flex justify-between items-center px-4 py-2 border-b bg-gray-600 text-white rounded">
        <h2 className=" text-sm">Tempered Order Summary</h2>

        <div className="text-xs font-semibold">
          <span className="text-green-600 bg-white p-1 px-2 rounded">
            {totalProducts}
          </span>
        </div>
      </div>

      {/* Category Table */}
      {categoryWiseTotals && Object.keys(categoryWiseTotals).length > 0 && (
        <div className="mt-1 overflow-x-auto">
          <table className="w-full text-xs border">
            <thead className="bg-red-100">
              <tr>
                <th className="p-2 border text-center">Category</th>
                <th className="p-2 border text-center">quantity</th>
                <th className="p-2 border text-center">Items</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(categoryWiseTotals).map((cat) => (
                <tr key={cat}>
                  <td className="p-2 border text-center font-medium">
                    {getShortName(cat)}
                  </td>

                  {/* 🆕 Order Items */}
                  <td className="p-2 border text-center">
                    {categoryWiseTotals[cat].orderItems} / {categoryWiseTotals[cat].approvedQty}
                  </td>

                  {/* 🆕 Available Items */}
                  <td className="p-2 border text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${categoryWiseTotals[cat].availableItems <
                          categoryWiseTotals[cat].orderItems
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-700"
                        }`}
                    >
                      {categoryWiseTotals[cat].orderItems} / {categoryWiseTotals[cat].availableItems} 
                    </span>
                  </td>


                </tr>
              ))}
              <tr>
                <td className="p-2 border font-sm text-center">Total</td>
                <td className="p-2 border text-center">{totalSSOrderQty} / {totalApprovedQty}</td>
                <td className="p-2 border text-center"></td>
              </tr>
            </tbody>

          </table>
        </div>
      )}

    </div>
  );
}
