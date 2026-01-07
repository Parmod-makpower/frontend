import { useStock } from "../context/StockContext";

export default function StockSelector() {
  const { stockType, setStockType } = useStock();

  return (
    <select
      value={stockType}
      onChange={(e) => setStockType(e.target.value)}
      className="border border-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      <option value="virtual">Delhi Stock</option>
      <option value="mumbai">Mumbai Stock</option>
    </select>
  );
}
