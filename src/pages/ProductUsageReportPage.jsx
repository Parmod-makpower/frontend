import { useMemo, useState } from "react";
import { FaSearch, FaBoxOpen, FaHistory } from "react-icons/fa";

import API from "../api/axios";
import { useCachedProducts } from "../hooks/useCachedProducts";

export default function ProductUsageReportPage() {
  const [productId, setProductId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const { data: allProducts = [] } = useCachedProducts();

  // ============================================================
  // PRODUCT SEARCH
  // ============================================================

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return allProducts
      .filter((product) =>
        String(product?.product_name || "")
          .toLowerCase()
          .includes(query)
      )
      .slice(0, 20);
  }, [allProducts, searchTerm]);

  // ============================================================
  // FETCH REPORT
  // ============================================================

  const fetchReport = async (id) => {
    const finalId = id || productId;

    if (!finalId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await API.get(`usage/${finalId}/`);

      setReport(response.data);
    } catch (error) {
      setReport(null);
      setError("Product not found or server error.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SELECT PRODUCT
  // ============================================================

  const handleSelectProduct = (product) => {
    if (!product?.product_id) {
      return;
    }

    setProductId(product.product_id);
    setSearchTerm(product.product_name || "");
    setShowDropdown(false);
    setHighlightIndex(-1);

    fetchReport(product.product_id);
  };

  // ============================================================
  // KEYBOARD NAVIGATION
  // ============================================================

  const handleKeyDown = (event) => {
    if (!filteredProducts.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setHighlightIndex((previous) =>
        previous < filteredProducts.length - 1
          ? previous + 1
          : 0
      );

      setShowDropdown(true);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setHighlightIndex((previous) =>
        previous <= 0
          ? filteredProducts.length - 1
          : previous - 1
      );

      setShowDropdown(true);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      const selectedProduct =
        filteredProducts[highlightIndex];

      if (selectedProduct) {
        handleSelectProduct(selectedProduct);
      }

      return;
    }

    if (event.key === "Escape") {
      setShowDropdown(false);
      setHighlightIndex(-1);
    }
  };

  // ============================================================
  // SEARCH CHANGE
  // ============================================================

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearchTerm(value);
    setShowDropdown(Boolean(value.trim()));
    setHighlightIndex(-1);

    if (!value.trim()) {
      setProductId("");
      setReport(null);
      setError(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-5 md:p-7">
      {/* ========================================================
          HEADER
      ======================================================== */}

      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-blue-700">
        <FaBoxOpen className="text-blue-600" />
        Product Details
      </h2>

      {/* ========================================================
          SEARCH
      ======================================================== */}

      <div className="relative mb-6 w-full md:w-96">
        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Search Product
        </label>

        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />

          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (searchTerm.trim()) {
                setShowDropdown(true);
              }
            }}
            placeholder="Type product name..."
            className="w-full rounded-lg border py-2 pl-10 pr-3 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* ======================================================
            PRODUCT DROPDOWN
        ====================================================== */}

        {showDropdown && filteredProducts.length > 0 && (
          <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border bg-white shadow-lg">
            {filteredProducts.map((product, index) => (
              <button
                key={product.product_id}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelectProduct(product);
                }}
                className={`block w-full cursor-pointer px-3 py-2 text-left text-sm transition ${
                  highlightIndex === index
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {product.product_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================
          LOADING
      ======================================================== */}

      {loading && (
        <p className="mt-4 text-sm font-medium text-gray-600">
          Loading...
        </p>
      )}

      {/* ========================================================
          ERROR
      ======================================================== */}

      {error && (
        <p className="mt-4 text-sm font-semibold text-red-500">
          {error}
        </p>
      )}

      {/* ========================================================
          REPORT
      ======================================================== */}

      {report && !loading && (
        <div className="mt-8 space-y-8">
          {/* ======================================================
              PRODUCT SUMMARY
          ====================================================== */}

          <div className="grid grid-cols-1 gap-4 text-sm text-gray-700 sm:grid-cols-3">
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm">
              <p className="text-xs text-green-700">
                Actual Stock
              </p>

              <p className="mt-1 font-bold text-green-700">
                {report.live_stock}
              </p>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
              <p className="text-xs text-red-700">
                Virtual Stock
              </p>

              <p className="mt-1 font-bold text-red-700">
                {report.virtual_stock}
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
              <p className="text-xs text-blue-700">
                Product
              </p>

              <p
                className="mt-1 truncate font-bold text-blue-700"
                title={report.product_name}
              >
                {report.product_name}
              </p>
            </div>
          </div>

          {/* ======================================================
              ALL PENDING ORDERS
          ====================================================== */}

          <TableSection
            icon={<FaHistory className="text-blue-600" />}
            title="Pending Orders"
            data={report.pending_orders}
            headers={[
              "Order ID",
              "Party",
              "Qty",
              "Date",
            ]}
            rows={(item) => [
              item.order_id,
              item.party,
              item.quantity,
              formatDate(item.order_date),
            ]}
          />

          {/* ======================================================
              LATEST 10 CRM HISTORY
          ====================================================== */}

          <TableSection
            icon={<FaHistory className="text-blue-600" />}
            title="Latest 10 CRM Verification History"
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
              formatDate(item.verified_at),
            ]}
          />
        </div>
      )}
    </div>
  );
}

// ================================================================
// DATE FORMATTER
// ================================================================

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
}

// ================================================================
// TABLE SECTION
// ================================================================

function TableSection({
  title,
  icon,
  data = [],
  headers,
  rows,
}) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-blue-700">
        {icon}
        {title}
      </h2>

      {!data.length ? (
        <p className="text-sm text-gray-500">
          No records found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                {headers.map((header) => (
                  <th
                    key={header}
                    className="whitespace-nowrap border-b px-3 py-2 text-center font-medium"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((item, index) => (
                <tr
                  key={`${item.order_id || "row"}-${index}`}
                  className="transition hover:bg-gray-50"
                >
                  {rows(item).map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="whitespace-nowrap border-b px-3 py-2 text-center"
                    >
                      {cell ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}