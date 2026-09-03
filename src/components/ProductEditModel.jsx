// import React from "react";
// import { useAuth } from "../context/AuthContext";

// export default function ProductEditModel({
//   show,
//   onClose,
//   onSubmit,
//   form,
//   setForm,
//   editData,
// }) {
//   const { user } = useAuth();
//   const isAdmin = user?.role === "ADMIN";

//   if (!show) return null;

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm({ ...form, [name]: value });
//   };

//   return (
//     <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
//       <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-4xl p-6 max-h-[90vh] overflow-y-auto border">

//         {/* ================= HEADER ================= */}
//         <div className="flex justify-between items-center border-b pb-3 mb-4">
//           <h2 className="text-xl font-semibold text-gray-800">
//             {editData ? "Edit Product" : "Add Product"}
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-red-600 text-xl font-bold"
//           >
//             ✕
//           </button>
//         </div>

//         {/* ================= FORM ================= */}
//         <form
//           onSubmit={onSubmit}
//           className="grid grid-cols-1 md:grid-cols-2 gap-4"
//         >

//           {/* Product ID */}
//           <div>
//             <label className="label">Product ID *</label>
//             <input
//               type="number"
//               name="product_id"
//               value={form.product_id || ""}
//               onChange={handleChange}
//               disabled={editData} // 🔒 edit में ID change नहीं
//               required
//               className={`input ${editData ? "bg-gray-100 cursor-not-allowed" : ""}`}
//             />
//           </div>

//           {/* Product Name */}
//           <div>
//             <label className="label">Product Name *</label>
//             <input
//               name="product_name"
//               value={form.product_name || ""}
//               onChange={handleChange}
//               required
//               className="input"
//             />
//           </div>

//           {/* Category */}
//           <div>
//             <label className="label">Category</label>
//             <input
//               name="sub_category"
//               value={form.sub_category || ""}
//               onChange={handleChange}
//               className="input"
//             />
//           </div>

//           {/* Cartoon Size */}
//           <div>
//             <label className="label">Cartoon Size</label>
//             <input
//               name="cartoon_size"
//               value={form.cartoon_size || ""}
//               onChange={handleChange}
//               className="input"
//             />
//           </div>

//           {/* Price */}
//           <div>
//             <label className="label">Price</label>
//             <input
//               name="price"
//               value={form.price || ""}
//               onChange={handleChange}
//               className="input"
//             />
//           </div>

//           {/* DS Price */}
//           <div>
//             <label className="label">DS Price</label>
//             <input
//               name="ds_price"
//               value={form.ds_price || ""}
//               onChange={handleChange}
//               className="input"
//             />
//           </div>

//           {/* MOQ */}
//           <div>
//             <label className="label">MOQ</label>
//             <input
//               type="number"
//               name="moq"
//               value={form.moq || ""}
//               onChange={handleChange}
//               className="input"
//             />
//           </div>

//           {/* Guarantee */}
//           <div>
//             <label className="label">Guarantee</label>
//             <input
//               name="guarantee"
//               value={form.guarantee || ""}
//               onChange={handleChange}
//               className="input"
//             />
//           </div>

//           {/* Quantity Type */}
//           <div>
//             <label className="label">Quantity Type</label>
//             <select
//               name="quantity_type"
//               value={form.quantity_type || "MOQ"}
//               onChange={handleChange}
//               className="input"
//             >
//               <option value="MOQ">MOQ</option>
//               <option value="CARTOON">CARTOON</option>
//             </select>
//           </div>

//           {/* Rack No */}
//           <div>
//             <label className="label">Rack No</label>
//             <input
//               name="rack_no"
//               value={form.rack_no || ""}
//               onChange={handleChange}
//               className="input"
//             />
//           </div>

//           {/* Active Status (only edit mode) */}
//           {editData && isAdmin && (
//             <div className="flex items-center gap-2 mt-2">
//               <input
//                 type="checkbox"
//                 checked={form.is_active}
//                 onChange={(e) =>
//                   setForm({ ...form, is_active: e.target.checked })
//                 }
//               />
//               <span className="text-sm font-medium">Active Product</span>
//             </div>
//           )}

//         </form>

//         {/* ================= FOOTER ================= */}
//         <div className="flex justify-end gap-3 mt-6 border-t pt-4">
//           <button
//             type="button"
//             onClick={onClose}
//             className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
//           >
//             Cancel
//           </button>

//           <button
//             type="submit"
//             onClick={onSubmit}
//             className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
//           >
//             {editData ? "Update Product" : "Add Product"}
//           </button>
//         </div>
//       </div>

//       {/* ================= TAILWIND HELPERS ================= */}
//       <style jsx>{`
//         .label {
//           display: block;
//           font-size: 0.875rem;
//           font-weight: 500;
//           margin-bottom: 0.25rem;
//           color: #374151;
//         }
//         .input {
//           width: 100%;
//           padding: 0.6rem;
//           border-radius: 0.5rem;
//           border: 1px solid #d1d5db;
//         }
//         .input:focus {
//           outline: none;
//           ring: 2px solid #2563eb;
//         }
//       `}</style>
//     </div>
//   );
// }

import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  FiX,
  FiPackage,
  FiTag,
  FiBox,
  FiDollarSign,
  FiHash,
  FiShield,
  FiLayers,
  FiMapPin,
  FiBattery,
  FiCheckCircle,
  FiSave,
} from "react-icons/fi";

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
  );
}

function FieldLabel({ children, required = false }) {
  return (
    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-600">
      {children}

      {required && (
        <span className="ml-1 text-red-500">*</span>
      )}
    </label>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  icon: Icon,
  type = "text",
  required = false,
  disabled = false,
  placeholder = "",
  min,
  step,
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>

      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        )}

        <input
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          min={min}
          step={step}
          className={`h-10 w-full rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 ${
            Icon ? "pl-9 pr-3" : "px-3"
          } ${
            disabled
              ? "cursor-not-allowed bg-gray-100 text-gray-400"
              : ""
          }`}
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  icon: Icon,
  children,
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>

      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        )}

        <select
          name={name}
          value={value || ""}
          onChange={onChange}
          className={`h-10 w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 ${
            Icon ? "pl-9 pr-8" : "px-3 pr-8"
          }`}
        >
          {children}
        </select>

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          ▾
        </span>
      </div>
    </div>
  );
}

export default function ProductEditModel({
  show,
  onClose,
  onSubmit,
  form,
  setForm,
  editData,
  isSaving = false,
}) {
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!show) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSaving) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [show, onClose, isSaving]);

  if (!show) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleActiveChange = (event) => {
    setForm((previousForm) => ({
      ...previousForm,
      is_active: event.target.checked,
    }));
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();

    if (isSaving) return;

    onSubmit(event);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm md:p-6">
      <div
        className="flex max-h-[95vh] w-full max-w-5xl animate-[modalIn_0.2s_ease-out] flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-3 text-white shadow-lg shadow-blue-200">
              <FiPackage size={22} />
            </div>

            <div>
              <h2
                id="product-modal-title"
                className="text-lg font-bold text-gray-900 md:text-xl"
              >
                {editData ? "Edit Product" : "Add New Product"}
              </h2>

              <p className="mt-0.5 text-xs text-gray-500">
                {editData
                  ? "Update product information and pricing"
                  : "Enter the details to create a new product"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            title="Close"
          >
            <FiX size={21} />
          </button>
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleFormSubmit}
          className="overflow-y-auto bg-[#f8fafc] p-4 md:p-6"
        >
          {/* Basic Information */}
          <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
            <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <FiTag size={17} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  Basic Information
                </h3>

                <p className="text-[11px] text-gray-500">
                  Product identification and category details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Product ID"
                name="product_id"
                type="number"
                value={form.product_id}
                onChange={handleChange}
                icon={FiHash}
                required
                disabled={Boolean(editData)}
                placeholder="Enter product ID"
              />

              <InputField
                label="Product Name"
                name="product_name"
                value={form.product_name}
                onChange={handleChange}
                icon={FiPackage}
                required
                placeholder="Enter product name"
              />

              <InputField
                label="Category"
                name="sub_category"
                value={form.sub_category}
                onChange={handleChange}
                icon={FiTag}
                placeholder="Enter category"
              />

              <InputField
                label="Product Type"
                name="product_type"
                value={form.product_type}
                onChange={handleChange}
                icon={FiLayers}
                placeholder="Enter product type"
              />

              <InputField
                label="MAH"
                name="mah"
                value={form.mah}
                onChange={handleChange}
                icon={FiBattery}
                placeholder="Enter MAH"
              />

              <InputField
                label="Guarantee"
                name="guarantee"
                value={form.guarantee}
                onChange={handleChange}
                icon={FiShield}
                placeholder="Enter guarantee"
              />
            </div>
          </div>

          {/* Pricing and Quantity */}
          <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
            <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <FiDollarSign size={17} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  Pricing & Quantity
                </h3>

                <p className="text-[11px] text-gray-500">
                  Set selling price, MOQ and carton configuration
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <InputField
                label="Price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={handleChange}
                icon={FiDollarSign}
                placeholder="0.00"
              />

              <InputField
                label="DS Price"
                name="ds_price"
                type="number"
                step="0.01"
                min="0"
                value={form.ds_price}
                onChange={handleChange}
                icon={FiDollarSign}
                placeholder="0.00"
              />

              <InputField
                label="MOQ"
                name="moq"
                type="number"
                min="1"
                value={form.moq}
                onChange={handleChange}
                icon={FiHash}
                placeholder="Enter MOQ"
              />

              <InputField
                label="Carton Size"
                name="cartoon_size"
                type="number"
                min="1"
                value={form.cartoon_size}
                onChange={handleChange}
                icon={FiBox}
                placeholder="Enter carton size"
              />

              <SelectField
                label="Quantity Type"
                name="quantity_type"
                value={form.quantity_type || "MOQ"}
                onChange={handleChange}
                icon={FiLayers}
              >
                <option value="MOQ">MOQ</option>
                <option value="CARTOON">CARTOON</option>
              </SelectField>

              <InputField
                label="Rack No"
                name="rack_no"
                value={form.rack_no}
                onChange={handleChange}
                icon={FiMapPin}
                placeholder="Enter rack number"
              />
            </div>
          </div>

          {/* Stock Information */}
          <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
            <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
              <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
                <FiBox size={17} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  Stock Information
                </h3>

                <p className="text-[11px] text-gray-500">
                  Current stock quantity
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Live Stock"
                name="live_stock"
                type="number"
                min="0"
                value={form.live_stock}
                onChange={handleChange}
                icon={FiBox}
                placeholder="Enter live stock"
              />
            </div>

            <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Stock values may be automatically managed by the stock and
              order system.
            </div>
          </div>

          {/* Admin Status */}
          {editData && isAdmin && (
            <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg p-2 ${
                      form.is_active
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <FiCheckCircle size={18} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-800">
                      Product Status
                    </h3>

                    <p className="text-[11px] text-gray-500">
                      Control product visibility
                    </p>
                  </div>
                </div>

                <label className="inline-flex cursor-pointer items-center gap-3">
                  <span className="text-xs font-semibold text-gray-600">
                    {form.is_active ? "Active" : "Inactive"}
                  </span>

                  <input
                    type="checkbox"
                    checked={Boolean(form.is_active)}
                    onChange={handleActiveChange}
                    disabled={isSaving}
                    className="peer sr-only"
                  />

                  <span
                    className={`relative h-6 w-11 rounded-full transition ${
                      form.is_active
                        ? "bg-emerald-500"
                        : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                        form.is_active
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="h-10 cursor-pointer rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Spinner />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave size={16} />
                  {editData ? "Update Product" : "Add Product"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}