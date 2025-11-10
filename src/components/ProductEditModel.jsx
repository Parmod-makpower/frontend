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

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-3xl p-6 max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            {editData ? "Edit Product" : "Add Product"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Product ID */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Product ID
            </label>
            <input
              name="product_id"
              value={form.product_id}
              onChange={(e) =>
                setForm({ ...form, product_id: e.target.value })
              }
              placeholder="Enter Product ID"
              className={`border border-gray-300 p-2.5 w-full rounded-lg focus:ring-2 focus:ring-blue-500 ${!isAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              required
              disabled={!isAdmin}
            />
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Product Name
            </label>
            <input
              name="product_name"
              value={form.product_name}
              onChange={(e) =>
                setForm({ ...form, product_name: e.target.value })
              }
              placeholder="Enter Product Name"
              className={`border border-gray-300 p-2.5 w-full rounded-lg focus:ring-2 focus:ring-blue-500 ${!isAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              required
              disabled={!isAdmin}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Category
            </label>
            <input
              name="sub_category"
              value={form.sub_category}
              onChange={(e) =>
                setForm({ ...form, sub_category: e.target.value })
              }
              placeholder="Enter Category"
              className={`border border-gray-300 p-2.5 w-full rounded-lg focus:ring-2 focus:ring-blue-500 ${!isAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              required
              disabled={!isAdmin}
            />
          </div>

          {/* Cartoon Size */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Cartoon Size
            </label>
            <input
              name="cartoon_size"
              value={form.cartoon_size}
              onChange={(e) =>
                setForm({ ...form, cartoon_size: e.target.value })
              }
              placeholder="Enter Cartoon Size"
              className="border border-gray-300 p-2.5 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Price
            </label>
            <input
              name="price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="Enter Price"
              className="border border-gray-300 p-2.5 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* MOQ */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              MOQ
            </label>
            <input
              name="moq"
              type="number"
              value={form.moq || ""}
              onChange={(e) => setForm({ ...form, moq: e.target.value })}
              placeholder="Enter Minimum Order Quantity"
              className="border border-gray-300 p-2.5 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Guarantee */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Guarantee
            </label>
            <input
              name="guarantee"
              value={form.guarantee || ""}
              onChange={(e) => setForm({ ...form, guarantee: e.target.value })}
              placeholder="Enter Guarantee (e.g. 6 Months)"
              className="border border-gray-300 p-2.5 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quantity Type */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Quantity Type
            </label>
            <select
              name="quantity_type"
              value={form.quantity_type || ""}
              onChange={(e) =>
                setForm({ ...form, quantity_type: e.target.value })
              }
              className="border border-gray-300 p-2.5 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Select Type --</option>
              <option value="CARTOON">CARTOON</option>
              <option value="MOQ">MOQ</option>
            </select>
          </div>
          {/* Rack No */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Rack No
            </label>
            <input
              name="rack_no"
              value={form.rack_no || ""}
              onChange={(e) => setForm({ ...form, rack_no: e.target.value })}
              placeholder="Enter Rack Number"
              className="border border-gray-300 p-2.5 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={onSubmit}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition cursor-pointer"
          >
            {editData ? "Update Product" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
