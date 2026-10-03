import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useInactiveProducts,
  useToggleProductStatus,
  useDeleteProduct,
} from "../hooks/useProducts";

import { toast } from "react-toastify";

import {
  FiArrowLeft,
  FiTrash2,
  FiSearch,
  FiRefreshCw,
  FiPackage,
  FiAlertCircle,
  FiCheckCircle,
  FiPower,
} from "react-icons/fi";

export default function InactiveProductsPage() {
  const navigate = useNavigate();

  const {
    data: products = [],
    isLoading,
    isError,
    isFetching,
  } = useInactiveProducts();

  const { mutate: toggleStatus, isPending: isToggling } =
    useToggleProductStatus();

  const { mutate: deleteProduct, isPending: isDeleting } =
    useDeleteProduct();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return products;

    return products.filter((product) =>
      [
        product.product_name,
        product.sub_category,
        product.product_id,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(term)
      )
    );
  }, [products, searchTerm]);

  /* =========================================================
     ACTIONS
  ========================================================= */

  const handleToggleStatus = (product) => {
    const newStatus = !product.is_active;

    toggleStatus(
      {
        productId: product.product_id,
        isActive: newStatus,
      },
      {
        onSuccess: () =>
          toast.success(
            newStatus
              ? "Product activated successfully ✅"
              : "Product deactivated successfully ❌"
          ),
        onError: () =>
          toast.error("Failed to update product status ❌"),
      }
    );
  };

  const confirmDelete = () => {
    if (!selectedProduct) return;

    deleteProduct(selectedProduct.product_id, {
      onSuccess: () => {
        toast.success("Product deleted permanently ✅");
        setSelectedProduct(null);
      },
      onError: () => toast.error("Delete failed ❌"),
    });
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center bg-slate-50">
        <div className="text-center text-slate-600">
          <FiRefreshCw className="mx-auto mb-2 animate-spin text-xl text-red-500" />
          <p className="text-[12px] font-medium">
            Loading inactive products...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (isError) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center bg-slate-50 px-4">
        <div className="rounded-lg border border-red-200 bg-white px-6 py-5 text-center shadow-sm">
          <FiAlertCircle className="mx-auto mb-2 text-2xl text-red-500" />
          <h3 className="text-sm font-bold text-slate-800">
            Unable to load products
          </h3>
          <p className="mt-1 text-[11px] text-slate-500">
            Please try again after some time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes inactiveRowIn {
          from {
            opacity: 0;
            transform: translateY(3px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .inactive-row {
          animation: inactiveRowIn 180ms ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .inactive-row {
            animation: none;
          }
        }
      `}</style>

      <div className="flex h-full min-h-0 flex-col bg-slate-50 p-2 sm:p-3">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-1.5 flex shrink-0 items-center justify-between gap-2">

          <div className="flex min-w-0 items-center gap-2">

            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-red-500 to-orange-500 text-white">
              <FiPackage size={14} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-[15px] font-bold text-slate-800">
                  Inactive Products
                </h1>

                <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                  {products.length.toLocaleString()} Inactive
                </span>
              </div>

              <p className="truncate text-[11px] text-slate-500">
                Manage inactive products
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={() => navigate("/products")}
            className="
              inline-flex h-7 shrink-0 cursor-pointer items-center gap-1
              rounded border border-slate-300 bg-white px-2
              text-[11px] font-semibold text-slate-700
              shadow-sm transition
              hover:border-red-400 hover:bg-red-50 hover:text-red-600
            "
          >
            <FiArrowLeft size={12} />
            <span className="hidden sm:inline">Back to Products</span>
            <span className="sm:hidden">Products</span>
          </button>

        </div>

        {/* =====================================================
            MAIN CARD
        ===================================================== */}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">

          {/* ===================================================
              TOOLBAR
          =================================================== */}

          <div
            className="
              flex shrink-0 flex-col gap-1 border-b border-slate-300
              bg-white p-1 lg:flex-row lg:items-center lg:justify-between
            "
          >

            <div className="relative min-w-0 lg:w-[350px]">

              <FiSearch
                size={13}
                className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={searchTerm}
                placeholder="Search product, category or ID..."
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  h-7 w-full cursor-text rounded border border-slate-300
                  bg-white pl-7 pr-2 text-[12px] font-medium text-slate-800
                  outline-none placeholder:text-slate-400
                  focus:border-red-400 focus:ring-1 focus:ring-red-100
                "
              />

            </div>

            <div className="flex items-center justify-between gap-1">

              {isFetching && (
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <FiRefreshCw size={11} className="animate-spin" />
                  Updating...
                </div>
              )}

              <div className="rounded border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                {filteredProducts.length} product
                {filteredProducts.length !== 1 ? "s" : ""}
              </div>

            </div>

          </div>

          {/* ===================================================
              TABLE BAR
          =================================================== */}

          <div className="flex h-7 shrink-0 items-center justify-between border-b border-slate-300 bg-slate-100 px-2">

            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

              <span className="text-[11px] font-bold text-slate-800">
                Inactive Product List
              </span>
            </div>

            <span className="text-[10px] font-semibold text-slate-600">
              {filteredProducts.length} Records
            </span>

          </div>

          {/* ===================================================
              DESKTOP TABLE
              HEADER FIXED / ONLY ROW AREA SCROLLS
          =================================================== */}

          <div className="hidden min-h-0 flex-1 overflow-x-auto md:block">

            <div className="h-full min-w-[1100px] overflow-y-auto [scrollbar-width:thin]">

              <table className="w-full border-collapse text-[12px] text-slate-800">

                <thead className="sticky top-0 z-30">

                  <tr className="h-6 bg-slate-200">

                    <th
                      colSpan={4}
                      className="border border-slate-400 bg-slate-200 px-1 text-center text-[11px] font-extrabold uppercase tracking-wide text-slate-700"
                    >
                      Product
                    </th>

                    <th
                      colSpan={3}
                      className="border border-red-200 bg-red-50 px-1 text-center text-[11px] font-extrabold uppercase tracking-wide text-red-700"
                    >
                      Stock
                    </th>

                    <th
                      colSpan={4}
                      className="border border-blue-200 bg-blue-50 px-1 text-center text-[11px] font-extrabold uppercase tracking-wide text-blue-700"
                    >
                      Price
                    </th>

                    <th
                      colSpan={2}
                      className="border border-slate-400 bg-slate-200 px-1 text-center text-[11px] font-extrabold uppercase tracking-wide text-slate-700"
                    >
                      Actions
                    </th>

                  </tr>

                  <tr className="h-6 bg-white">

                    {[
                      "#",
                      "Product ID",
                      "Category",
                      "Name",
                      "Delhi",
                      "Mumbai",
                      "Virtual",
                      "SS",
                      "DS",
                      "DLR",
                      "MOQ",
                      "Status",
                      "Delete",
                    ].map((title, i) => (
                      <th
                        key={title}
                        className={`
                          border border-slate-300 px-1 text-center
                          text-[10px] font-bold text-slate-800
                          ${i >= 4 && i <= 6 ? "bg-red-50 text-red-700" : ""}
                          ${i >= 7 && i <= 10 ? "bg-blue-50 text-blue-700" : ""}
                        `}
                      >
                        {title}
                      </th>
                    ))}

                  </tr>

                </thead>

                <tbody>

                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={13}
                        className="h-32 border border-slate-300 text-center text-[12px] font-medium text-slate-500"
                      >
                        <FiPackage className="mx-auto mb-2 text-3xl text-slate-300" />
                        No inactive products found
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product, index) => (
                      <tr
                        key={product.product_id}
                        className="
                          inactive-row group h-7
                          border-b border-slate-300
                          transition-colors duration-100
                          hover:bg-slate-50
                        "
                      >

                        <td className="border border-slate-300 bg-slate-100 px-1 text-center font-semibold text-slate-700 group-hover:bg-slate-200">
                          {index + 1}
                        </td>

                        <td className="border border-slate-300 px-1 text-center font-bold text-slate-800">
                          {product.product_id}
                        </td>

                        <td
                          className="max-w-[120px] truncate border border-slate-300 px-1 text-center font-medium text-slate-700"
                          title={product.sub_category}
                        >
                          {product.sub_category || "—"}
                        </td>

                        <td
                          className="max-w-[180px] truncate border border-slate-300 px-1 text-center font-semibold text-slate-800"
                          title={product.product_name}
                        >
                          {product.product_name || "—"}
                        </td>

                        {/* DELHI */}

                        <td className="border border-red-200 bg-red-50 px-1 text-center font-bold text-red-700">
                          {product.live_stock ?? 0}
                        </td>

                        {/* MUMBAI */}

                        <td className="border border-red-200 bg-red-50 px-1 text-center font-bold text-red-700">
                          {product.mumbai_stock ?? 0}
                        </td>

                        {/* VIRTUAL */}

                        <td className="border border-red-200 bg-red-50 px-1 text-center font-extrabold text-red-700">
                          {product.virtual_stock ?? 0}
                        </td>

                        {/* SS */}

                        <td className="border border-blue-200 bg-blue-50 px-1 text-center font-bold text-blue-700">
                          {product.price ?? "—"}
                        </td>

                        {/* DS */}

                        <td className="border border-blue-200 bg-blue-50 px-1 text-center font-bold text-blue-700">
                          {product.ds_price ?? "—"}
                        </td>

                        {/* DLR */}

                        <td className="border border-blue-200 bg-blue-50 px-1 text-center font-bold text-blue-700">
                          {product.dlr_price ?? "—"}
                        </td>

                        {/* MOQ */}

                        <td className="border border-blue-200 bg-blue-50 px-1 text-center font-semibold text-slate-800">
                          {product.moq ?? "—"}
                        </td>

                        {/* STATUS */}

                        <td className="border border-slate-300 px-1 text-center">

                          <button
                            type="button"
                            disabled={isToggling}
                            onClick={() => handleToggleStatus(product)}
                            title="Activate product"
                            className="
                              inline-flex h-5 cursor-pointer items-center gap-1
                              rounded-full bg-red-50 px-2
                              text-[10px] font-bold text-red-600
                              transition hover:bg-emerald-50
                              hover:text-emerald-600
                              disabled:pointer-events-none disabled:opacity-40
                            "
                          >
                            <FiPower size={11} />
                            Inactive
                          </button>

                        </td>

                        {/* DELETE */}

                        <td className="border border-slate-300 px-1 text-center">

                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => setSelectedProduct(product)}
                            title="Delete product"
                            className="
                              inline-flex h-5 w-5 cursor-pointer
                              items-center justify-center rounded
                              text-red-600 transition
                              hover:bg-red-50 hover:text-red-700
                              disabled:pointer-events-none disabled:opacity-40
                            "
                          >
                            <FiTrash2 size={12} />
                          </button>

                        </td>

                      </tr>
                    ))
                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* ===================================================
              MOBILE
          =================================================== */}

          <div className="min-h-0 flex-1 overflow-y-auto p-1.5 md:hidden">

            {filteredProducts.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-center">
                <div>
                  <FiPackage className="mx-auto mb-2 text-3xl text-slate-300" />
                  <p className="text-[12px] font-semibold text-slate-500">
                    No inactive products found
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">

                {filteredProducts.map((product, index) => (
                  <div
                    key={product.product_id}
                    className="
                      inactive-row rounded-md border border-slate-300
                      bg-white p-2 shadow-sm
                      transition hover:border-slate-400
                    "
                  >

                    <div className="flex items-start justify-between gap-2">

                      <div className="min-w-0">

                        <div className="mb-0.5 flex items-center gap-1.5">

                          <span className="text-[9px] font-bold text-slate-400">
                            #{index + 1}
                          </span>

                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                            ID: {product.product_id}
                          </span>

                        </div>

                        <h3 className="truncate text-[12px] font-bold text-slate-800">
                          {product.product_name || "—"}
                        </h3>

                        <p className="truncate text-[10px] text-slate-500">
                          {product.sub_category || "No category"}
                        </p>

                      </div>

                      <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-bold text-red-600">
                        Inactive
                      </span>

                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-1 border-t border-slate-200 pt-2">

                      <div className="rounded border border-red-100 bg-red-50 p-1.5">
                        <p className="text-[8px] font-bold uppercase text-red-400">
                          Delhi
                        </p>
                        <p className="text-[11px] font-bold text-red-700">
                          {product.live_stock ?? 0}
                        </p>
                      </div>

                      <div className="rounded border border-red-100 bg-red-50 p-1.5">
                        <p className="text-[8px] font-bold uppercase text-red-400">
                          Mumbai
                        </p>
                        <p className="text-[11px] font-bold text-red-700">
                          {product.mumbai_stock ?? 0}
                        </p>
                      </div>

                      <div className="rounded border border-red-100 bg-red-50 p-1.5">
                        <p className="text-[8px] font-bold uppercase text-red-400">
                          Virtual
                        </p>
                        <p className="text-[11px] font-bold text-red-700">
                          {product.virtual_stock ?? 0}
                        </p>
                      </div>

                      <div className="rounded border border-blue-100 bg-blue-50 p-1.5">
                        <p className="text-[8px] font-bold uppercase text-blue-400">
                          SS
                        </p>
                        <p className="text-[11px] font-bold text-blue-700">
                          ₹{product.price ?? "—"}
                        </p>
                      </div>

                      <div className="rounded border border-blue-100 bg-blue-50 p-1.5">
                        <p className="text-[8px] font-bold uppercase text-blue-400">
                          DS
                        </p>
                        <p className="text-[11px] font-bold text-blue-700">
                          ₹{product.ds_price ?? "—"}
                        </p>
                      </div>

                      <div className="rounded border border-blue-100 bg-blue-50 p-1.5">
                        <p className="text-[8px] font-bold uppercase text-blue-400">
                          DLR
                        </p>
                        <p className="text-[11px] font-bold text-blue-700">
                          ₹{product.dlr_price ?? "—"}
                        </p>
                      </div>

                    </div>

                    <div className="mt-2 flex gap-1.5">

                      <button
                        type="button"
                        disabled={isToggling}
                        onClick={() => handleToggleStatus(product)}
                        className="
                          flex h-7 flex-1 cursor-pointer
                          items-center justify-center gap-1
                          rounded border border-emerald-200
                          bg-emerald-50 text-[10px] font-bold
                          text-emerald-700 transition
                          hover:bg-emerald-100
                          disabled:pointer-events-none disabled:opacity-40
                        "
                      >
                        <FiCheckCircle size={12} />
                        Activate
                      </button>

                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => setSelectedProduct(product)}
                        className="
                          flex h-7 cursor-pointer items-center
                          justify-center gap-1 rounded
                          border border-red-200 bg-red-50 px-3
                          text-[10px] font-bold text-red-600
                          transition hover:bg-red-100
                          disabled:pointer-events-none disabled:opacity-40
                        "
                      >
                        <FiTrash2 size={12} />
                        Delete
                      </button>

                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>

          {/* ===================================================
              FOOTER
          =================================================== */}

          <div className="flex h-7 shrink-0 items-center justify-between border-t border-slate-300 bg-slate-100 px-2">

            <span className="text-[10px] font-medium text-slate-600">
              Showing {filteredProducts.length} of {products.length}
            </span>

            <button
              type="button"
              onClick={() => navigate("/products")}
              className="
                inline-flex cursor-pointer items-center gap-1
                text-[10px] font-semibold text-slate-600
                transition hover:text-red-600
              "
            >
              <FiArrowLeft size={11} />
              Products
            </button>

          </div>

        </div>
      </div>

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">

          <div className="w-full max-w-sm rounded-lg border border-slate-300 bg-white p-4 shadow-2xl">

            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600">
              <FiTrash2 size={17} />
            </div>

            <h2 className="text-sm font-bold text-slate-800">
              Delete Product?
            </h2>

            <p className="mt-1.5 text-[12px] leading-5 text-slate-500">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-slate-700">
                {selectedProduct.product_name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-4 flex justify-end gap-1.5">

              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                disabled={isDeleting}
                className="
                  cursor-pointer rounded border border-slate-300
                  bg-white px-3 py-1.5 text-[11px] font-semibold
                  text-slate-600 transition hover:bg-slate-50
                  disabled:pointer-events-none disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="
                  inline-flex cursor-pointer items-center gap-1.5
                  rounded bg-red-600 px-3 py-1.5
                  text-[11px] font-semibold text-white
                  transition hover:bg-red-700
                  disabled:pointer-events-none disabled:opacity-60
                "
              >
                {isDeleting ? (
                  <>
                    <FiRefreshCw size={12} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 size={12} />
                    Delete Permanently
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}