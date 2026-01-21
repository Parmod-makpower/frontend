import React from "react";
import { useAuth } from "../context/AuthContext";

export default function ProductEditModel({
  show,
  onClose,
  onSubmit,
  form,
  setForm,
  editData,
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-4xl p-6 max-h-[90vh] overflow-y-auto border">

        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {editData ? "Edit Product" : "Add Product"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* ================= FORM ================= */}
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >

          {/* Product ID */}
          <div>
            <label className="label">Product ID *</label>
            <input
              type="number"
              name="product_id"
              value={form.product_id || ""}
              onChange={handleChange}
              disabled={editData} // 🔒 edit में ID change नहीं
              required
              className={`input ${editData ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
          </div>

          {/* Product Name */}
          <div>
            <label className="label">Product Name *</label>
            <input
              name="product_name"
              value={form.product_name || ""}
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          {/* Category */}
          <div>
            <label className="label">Category</label>
            <input
              name="sub_category"
              value={form.sub_category || ""}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* Cartoon Size */}
          <div>
            <label className="label">Cartoon Size</label>
            <input
              name="cartoon_size"
              value={form.cartoon_size || ""}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* Price */}
          <div>
            <label className="label">Price</label>
            <input
              name="price"
              value={form.price || ""}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* DS Price */}
          <div>
            <label className="label">DS Price</label>
            <input
              name="ds_price"
              value={form.ds_price || ""}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* MOQ */}
          <div>
            <label className="label">MOQ</label>
            <input
              type="number"
              name="moq"
              value={form.moq || ""}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* Guarantee */}
          <div>
            <label className="label">Guarantee</label>
            <input
              name="guarantee"
              value={form.guarantee || ""}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* Quantity Type */}
          <div>
            <label className="label">Quantity Type</label>
            <select
              name="quantity_type"
              value={form.quantity_type || "MOQ"}
              onChange={handleChange}
              className="input"
            >
              <option value="MOQ">MOQ</option>
              <option value="CARTOON">CARTOON</option>
            </select>
          </div>

          {/* Rack No */}
          <div>
            <label className="label">Rack No</label>
            <input
              name="rack_no"
              value={form.rack_no || ""}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* Active Status (only edit mode) */}
          {editData && isAdmin && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
              />
              <span className="text-sm font-medium">Active Product</span>
            </div>
          )}

        </form>

        {/* ================= FOOTER ================= */}
        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            onClick={onSubmit}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
          >
            {editData ? "Update Product" : "Add Product"}
          </button>
        </div>
      </div>

      {/* ================= TAILWIND HELPERS ================= */}
      <style jsx>{`
        .label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
          color: #374151;
        }
        .input {
          width: 100%;
          padding: 0.6rem;
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
        }
        .input:focus {
          outline: none;
          ring: 2px solid #2563eb;
        }
      `}</style>
    </div>
  );
}
