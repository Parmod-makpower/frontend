// 📁 src/pages/SaleNamePage.jsx
import { useState, useEffect } from "react";
import {
  fetchSaleNames,
  addSaleName,
  deleteSaleNameById,
  deleteSaleNamesByProduct,
  uploadSaleNameBulk,
} from "../api/saleNameApi";
import { useProducts } from "../hooks/useProducts";
import { FiTrash2, FiUpload, FiDownload, FiLoader } from "react-icons/fi";

export default function SaleNamePage() {
  const { data: products = [] } = useProducts();

  const [saleNames, setSaleNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ product: "", sale_name: "" });
  const [uploadFile, setUploadFile] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Search
  const [searchProductId, setSearchProductId] = useState("");

  const loadSaleNames = async () => {
    setLoading(true);
    try {
      const data = await fetchSaleNames(page, pageSize, searchProductId);
      setSaleNames(data.results);
      setTotalPages(Math.ceil(data.count / pageSize));
    } catch {
      alert("Failed to load sale names");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaleNames();
  }, [page, searchProductId]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addSaleName(formData);
      setFormData({ product: "", sale_name: "" });
      loadSaleNames();
    } catch {
      alert("Failed to add sale name");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sale name?")) return;
    await deleteSaleNameById(id);
    loadSaleNames();
  };

  const handleBulkDelete = async () => {
    if (!searchProductId) return alert("Select a product first");
    if (!window.confirm("Delete all sale names for this product?")) return;
    await deleteSaleNamesByProduct(searchProductId);
    loadSaleNames();
  };

  const handleBulkUpload = async () => {
    if (!uploadFile) return;
    const fd = new FormData();
    fd.append("file", uploadFile);
    try {
      const res = await uploadSaleNameBulk(fd);
      alert(res.message + (res.skipped_ids?.length ? `\nSkipped: ${res.skipped_ids.join(", ")}` : ""));
      setUploadFile(null);
      loadSaleNames();
    } catch (err) {
      alert("Upload failed");
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,product_id,sale_name\n101,CH88 Sale";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "sale_name_template.csv";
    link.click();
  };

  return (
    <div className="p-6  mx-auto">
      
<form
  onSubmit={handleSubmit}
  className="flex flex-wrap gap-4 mb-6"
>
  <select
    name="product"
    value={formData.product}
    onChange={handleChange}
    required
    className="border p-2 rounded flex-1 min-w-[200px]"
  >
    <option value="">Select Product</option>
    {products.map((p) => (
      <option key={p.product_id} value={p.product_id}>
        {p.product_name}
      </option>
    ))}
  </select>

  <input
    name="sale_name"
    value={formData.sale_name}
    onChange={handleChange}
    placeholder="Sale Name"
    required
    className="border p-2 rounded flex-1 min-w-[200px]"
  />

  <button
    type="submit"
    className="bg-green-600 text-white p-2 rounded px-6"
  >
    Add
  </button>
</form>

{/* Search + Bulk Delete */}
<div className="flex flex-wrap gap-4 mb-6">
  <select
    value={searchProductId}
    onChange={(e) => {
      setSearchProductId(e.target.value);
      setPage(1);
    }}
    className="border p-2 rounded flex-1 min-w-[200px]"
  >
    <option value="">All Products</option>
    {products.map((p) => (
      <option key={p.product_id} value={p.product_id}>
        {p.product_name}
      </option>
    ))}
  </select>

  <button
    onClick={handleBulkDelete}
    className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-1"
  >
    <FiTrash2 /> Bulk Delete
  </button>
</div>

{/* Bulk Upload */}
<div className="mb-10">
  <h2 className="text-xl font-semibold mb-2">📦 Bulk Upload</h2>
  <div className="flex flex-wrap gap-4">
    <input
      type="file"
      accept=".csv,.xlsx"
      onChange={(e) => setUploadFile(e.target.files[0])}
      className="border p-2 rounded flex-1 min-w-[200px]"
    />

    <button
      onClick={handleBulkUpload}
      className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
    >
      {loading ? <FiLoader className="animate-spin" /> : <FiUpload />} Upload
    </button>

    <button
      onClick={downloadTemplate}
      className="bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-2"
    >
      <FiDownload /> Download Template
    </button>
  </div>
</div>



      {/* Table */}
      {loading ? <p>Loading...</p> : (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">ID</th>
              <th className="border p-2">Product</th>
              <th className="border p-2">Sale Name</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {saleNames.map((sn) => (
              <tr key={sn.id}>
                <td className="border p-2">{sn.product_id}</td>
                <td className="border p-2">{sn.product_name}</td>
                <td className="border p-2">{sn.sale_name}</td>
                <td className="border p-2">
                  <button onClick={() => handleDelete(sn.id)} className="text-red-600 flex items-center gap-1"><FiTrash2 /> Delete</button>
                </td>
              </tr>
            ))}
            {saleNames.length === 0 && (
              <tr><td colSpan="4" className="text-center text-gray-500 py-4">No Sale Names found.</td></tr>
            )}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-4 gap-2">
        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded">Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded">Next</button>
      </div>
    </div>
  );
}
