import { useState } from "react";
import {
  fetchSaleNames,
  addSaleName,
  deleteAllSaleNames,
  deleteSaleNameById,
  deleteSaleNamesByProduct,
  uploadSaleNameBulk,
} from "../api/saleNameApi";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiTrash2, FiUpload, FiDownload, FiLoader } from "react-icons/fi";

export default function SaleNamePage() {
  const queryClient = useQueryClient();
  const { data: products = [] } = useCachedProducts();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchProductId, setSearchProductId] = useState("");
  const [formData, setFormData] = useState({ product: "", sale_name: "" });
  const [uploadFile, setUploadFile] = useState(null);

  // Fetch Sale Names
  const { data, isLoading, isError } = useQuery({
    queryKey: ["saleNames", page, searchProductId],
    queryFn: () => fetchSaleNames({ page, pageSize, productId: searchProductId }),
    keepPreviousData: true,
    staleTime: 30000, // 30s cache
  });

  const saleNames = data?.results || [];
  const totalPages = data ? Math.ceil(data.count / pageSize) : 1;

  // Mutations
  const addMutation = useMutation({
    mutationFn: addSaleName,
    onSuccess: () => {
      queryClient.invalidateQueries(["saleNames"]);
      setFormData({ product: "", sale_name: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSaleNameById,
    onSuccess: () => queryClient.invalidateQueries(["saleNames"]),
  });

  const deleteAllMutation = useMutation({
    mutationFn: deleteAllSaleNames,
    onSuccess: () => queryClient.invalidateQueries(["saleNames"]),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: deleteSaleNamesByProduct,
    onSuccess: () => queryClient.invalidateQueries(["saleNames"]),
  });

  const uploadMutation = useMutation({
    mutationFn: uploadSaleNameBulk,
    onSuccess: (res) => {
      alert(
        res.message +
          (res.skipped_ids?.length ? `\nSkipped: ${res.skipped_ids.join(", ")}` : "")
      );
      setUploadFile(null);
      queryClient.invalidateQueries(["saleNames"]);
    },
  });

  // Handlers
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this sale name?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm("⚠️ Delete ALL sale names?")) {
      deleteAllMutation.mutate();
    }
  };

  const handleBulkDelete = () => {
    if (!searchProductId) return alert("Select a product first");
    if (window.confirm("Delete all sale names for this product?")) {
      bulkDeleteMutation.mutate(searchProductId);
    }
  };

  const handleBulkUpload = () => {
    if (!uploadFile) return;
    const fd = new FormData();
    fd.append("file", uploadFile);
    uploadMutation.mutate(fd);
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
    <div className="p-6 mx-auto max-w-6xl">
      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap gap-4 mb-6 bg-white shadow p-4 rounded-xl"
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
          className="bg-green-600 hover:bg-green-700 text-white p-2 rounded px-6 transition"
        >
          {addMutation.isLoading ? "Adding..." : "Add"}
        </button>
      </form>

      {/* Search + Bulk Delete */}
      <div className="flex flex-wrap gap-4 mb-6 bg-white shadow p-4 rounded-xl">
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
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-1"
        >
          <FiTrash2 /> Bulk Delete (By Product)
        </button>

        <button
          onClick={handleDeleteAll}
          className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded flex items-center gap-1"
        >
          <FiTrash2 /> Delete All
        </button>
      </div>

      {/* Bulk Upload */}
      <div className="mb-10 bg-white shadow p-4 rounded-xl">
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            {uploadMutation.isLoading ? (
              <FiLoader className="animate-spin" />
            ) : (
              <FiUpload />
            )}{" "}
            Upload
          </button>

          <button
            onClick={downloadTemplate}
            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FiDownload /> Download Template
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : isError ? (
          <div className="p-6 text-center text-red-500">
            Failed to load data
          </div>
        ) : (
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
                <tr key={sn.id} className="hover:bg-gray-50">
                  <td className="border p-2">{sn.product_id}</td>
                  <td className="border p-2">{sn.product_name}</td>
                  <td className="border p-2">{sn.sale_name}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleDelete(sn.id)}
                      className="text-red-600 hover:underline flex items-center gap-1"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {saleNames.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center text-gray-500 py-4"
                  >
                    No Sale Names found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4 gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
