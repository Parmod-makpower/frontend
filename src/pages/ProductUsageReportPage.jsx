// src/pages/ProductUsageReportPage.jsx
import { useState } from "react";
import { FaSearch, FaBoxOpen, FaHistory } from "react-icons/fa";
import API from "../api/axios";
import { useCachedProducts } from "../hooks/useCachedProducts";

export default function ProductUsageReportPage() {
  const [productId, setProductId] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const { data: allProducts = [] } = useCachedProducts();

  const [searchTerm, setSearchTerm] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredProducts = allProducts.filter((p) =>
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % filteredProducts.length);
      setShowDropdown(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev === -1
          ? filteredProducts.length - 1
          : (prev - 1 + filteredProducts.length) % filteredProducts.length
      );
      setShowDropdown(true);
    } else if (e.key === "Enter") {
      if (highlightIndex >= 0 && filteredProducts[highlightIndex]) {
        e.preventDefault();
        handleSelectProduct(filteredProducts[highlightIndex]);
      }
    }
  };

  // AUTO FETCH ON SELECTION
  const handleSelectProduct = async (product) => {
    setProductId(product.product_id);
    setSearchTerm(product.product_name);
    setShowDropdown(false);
    setHighlightIndex(-1);

    // Auto API call
    await fetchReport(product.product_id);
  };

  // Accept optional ID
  const fetchReport = async (id) => {
    const finalId = id || productId;
    if (!finalId) return;

    try {
      setLoading(true);
      setError(null);
      setReport(null);

      const res = await API.get(`usage/${finalId}/`);
      setReport(res.data);
    } catch {
      setError("Product not found or server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 md:p-7 max-w-5xl mx-auto">
         <h2 className="text-xl font-semibold mb-4 text-blue-700 flex items-center gap-2">
    <FaBoxOpen className="text-blue-600" /> Product Details
  </h2>
      {/* Search Box */}
      <div className="mb-6 w-full md:w-96 relative">
        <label className="block text-sm font-semibold mb-1 text-gray-700">
          Search Product
        </label>

        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
              setHighlightIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type product name..."
            className="border rounded-lg pl-10 pr-3 py-2 w-full shadow-sm focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Dropdown */}
        {showDropdown && searchTerm && filteredProducts.length > 0 && (
          <div className="absolute z-50 bg-white border rounded-md shadow-md max-h-56 overflow-y-auto w-full mt-1">
            {filteredProducts.map((prod, index) => (
              <div
                key={prod.product_id}
                className={`px-3 py-2 cursor-pointer transition ${
                  highlightIndex === index
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => handleSelectProduct(prod)}
              >
                {prod.product_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {loading && <p className="text-gray-600 font-medium mt-4">Loading…</p>}
      {error && <p className="text-red-500 font-semibold mt-4">{error}</p>}

      {/* Report Section */}
      {report && (
        <div className="space-y-8 mt-8">

          {/* Product Summary */}
         <div className=" transition-all duration-300">
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-700 text-sm">
    
    <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-200">
      <p className="text-xs text-green-700">Actual Stock</p>
      <p className="font-bold text-green-700 mt-1">{report.live_stock}</p>
    </div>

    <div className="bg-red-50 p-4 rounded-xl shadow-sm border border-red-200">
      <p className="text-xs text-red-700">Virtual Stock</p>
      <p className="font-bold text-red-700 mt-1">{report.virtual_stock}</p>
    </div>
  </div>
</div>


          {/* Pending Orders */}
          <TableSection
            icon={<FaHistory className="text-blue-600" />}
            title="Pending Orders"
            data={report.pending_orders}
            headers={["Order ID", "Party", "Qty", "Date"]}
            rows={(item) => [
              item.order_id,
              item.party,
              item.quantity,
              new Date(item.order_date).toLocaleString(),
            ]}
          />

          {/* CRM History */}
          <TableSection
            icon={<FaHistory className="text-blue-600" />}
            title="CRM Verification History"
            data={report.crm_history}
            headers={[
              "Order ID",
              "Status",
              "Approved Qty",
              "Rejected",
              "Verified By",
              "Verified At",
            ]}
            rows={(item) => [
              item.order_id,
              item.crm_status,
              item.approved_qty,
              item.is_rejected ? "Yes" : "No",
              item.verified_by,
              new Date(item.verified_at).toLocaleString(),
            ]}
          />
        </div>
      )}
    </div>
  );
}

function TableSection({ title, icon, data, headers, rows }) {
  return (
    <div className=" ">
      <h2 className="text-lg font-semibold mb-3 text-blue-700 flex items-center gap-2">
        {icon} {title}
      </h2>

      {data.length === 0 ? (
        <p className="text-gray-500">No records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border mt-2 text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                {headers.map((h, i) => (
                  <th key={i} className="border p-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  {rows(item).map((cell, j) => (
                    <td key={j} className="border p-2 text-center">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
