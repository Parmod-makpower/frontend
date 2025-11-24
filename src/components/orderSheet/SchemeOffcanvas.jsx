import { FaTimes, FaGift } from "react-icons/fa";

export default function SchemeOffcanvas({ open, onClose, eligibleSchemes }) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      ></div>

      {/* Right Side Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-white shadow-xl p-5 transition-transform duration-300 overflow-y-auto ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-green-700">
            <FaGift /> Scheme Details
          </h2>
          <button onClick={onClose}>
            <FaTimes size={20} className="text-gray-600 hover:text-black" />
          </button>
        </div>

        {/* No schemes fallback */}
        {eligibleSchemes.length === 0 ? (
          <p className="text-gray-500 text-sm">No schemes applied.</p>
        ) : (
          <table className="w-full text-sm border rounded">
            <thead className="bg-green-100">
              <tr>
                <th className="border px-2 py-2 text-left">Scheme Conditions</th>
                <th className="border px-2 py-2 text-left">Rewards</th>
              </tr>
            </thead>
            <tbody>
              {eligibleSchemes.map((scheme) => (
                <tr key={scheme.id} className="hover:bg-green-50">
                  <td className="border px-2 py-2">
                    {scheme.conditions
                      .map((c) => `${c.product_name} (${c.min_quantity})`)
                      .join(", ")}
                  </td>
                  <td className="border px-2 py-2">
                    {scheme.rewards
                      .map((r) => {
                        const total = r.quantity * scheme.multiplier;
                        return `${total} ${r.product_name} Free`;
                      })
                      .join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
