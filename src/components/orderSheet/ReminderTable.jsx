export default function ReminderTable({ recentRejectedItems }) {
  return (
    <div className="bg-yellow-50 rounded p-3 overflow-x-auto">
      <h3 className="font-semibold text-yellow-800 mb-2">
        ⚠️ Previous Reminders
      </h3>

      {recentRejectedItems?.length > 0 ? (
        <table className="w-full border border-yellow-200 text-sm">
          <thead className="bg-yellow-100 text-yellow-800">
            <tr>
              <th className="px-2 py-2 border">Product</th>
              <th className="px-2 py-2 border">Qty</th>
              <th className="px-2 py-2 border">Last Rejected</th>
            </tr>
          </thead>
          <tbody>
            {recentRejectedItems.map((r) => (
              <tr key={r.product} className="hover:bg-yellow-50">
                <td className="px-2 py-1 border">{r.product_name}</td>
                <td className="px-2 py-1 border text-center">{r.quantity}</td>
                <td className="px-2 py-1 border text-xs text-gray-600">
                  {new Date(r.last_rejected_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-gray-500 italic text-sm">No previous rejections</div>
      )}
    </div>
  );
}
