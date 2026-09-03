import { useMemo, useState } from "react";
import {
  useInactiveProducts,
  useToggleProductStatus,
  useDeleteProduct,
} from "../hooks/useProducts";

import { toast } from "react-toastify";
import {
  FiTrash2,
  FiSearch,
  FiRefreshCw,
  FiPackage,
  FiAlertCircle,
  FiCheckCircle,
  FiPower,
} from "react-icons/fi";

export default function InactiveProductsPage() {
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

  // Search and filter
  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return products;

    return products.filter((product) => {
      return (
        product.product_name?.toLowerCase().includes(term) ||
        product.sub_category?.toLowerCase().includes(term) ||
        product.product_id?.toString().toLowerCase().includes(term)
      );
    });
  }, [products, searchTerm]);

  // Delete product
  const handleDelete = (product) => {
    setSelectedProduct(product);
  };

  const confirmDelete = () => {
    if (!selectedProduct) return;

    deleteProduct(selectedProduct.product_id, {
      onSuccess: () => {
        toast.success("Product deleted permanently ✅");
        setSelectedProduct(null);
      },
      onError: () => {
        toast.error("Delete failed ❌");
      },
    });
  };

  // Toggle active status
  const handleToggleStatus = (product) => {
    const newStatus = !product.is_active;

    toggleStatus(
      {
        productId: product.product_id,
        isActive: newStatus,
      },
      {
        onSuccess: () => {
          toast.success(
            newStatus
              ? "Product activated successfully ✅"
              : "Product deactivated successfully ❌"
          );
        },
        onError: () => {
          toast.error("Failed to update product status ❌");
        },
      }
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <FiRefreshCw className="mx-auto mb-3 text-2xl text-indigo-500 animate-spin" />
          <p className="text-sm font-medium text-slate-600">
            Loading inactive products...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl border border-red-200 bg-white px-8 py-7 text-center shadow-sm">
          <FiAlertCircle className="mx-auto mb-3 text-3xl text-red-500" />
          <h3 className="text-base font-bold text-slate-800">
            Unable to load products
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Please try again after some time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 px-3 py-4 sm:px-5 lg:px-7">
        {/* Header */}
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-600">
                <FiPackage className="text-xl" />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
                  Inactive Products
                </h1>
                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                  Manage products that are currently inactive
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-center shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Total
              </p>
              <p className="text-lg font-bold text-slate-800">
                {products.length}
              </p>
            </div>

            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-red-400">
                Inactive
              </p>
              <p className="text-lg font-bold text-red-600">
                {filteredProducts.length}
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Search by name, category or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="flex items-center gap-2">
              {isFetching && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <FiRefreshCw className="animate-spin" />
                  Updating...
                </div>
              )}

              <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
                {filteredProducts.length} product
                {filteredProducts.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[850px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    S.No.
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Product ID
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Product Name
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Category
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Price
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-14 text-center">
                      <FiPackage className="mx-auto mb-3 text-4xl text-slate-300" />
                      <p className="text-sm font-semibold text-slate-500">
                        No inactive products found
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Try changing your search term.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, index) => (
                    <tr
                      key={product.product_id}
                      className="border-b border-slate-100 transition hover:bg-indigo-50/30"
                    >
                      <td className="px-4 py-3 text-center text-xs font-medium text-slate-500">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3 text-left">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                          {product.product_id}
                        </span>
                      </td>

                      <td className="max-w-[230px] px-4 py-3">
                        <p className="truncate font-semibold text-slate-800">
                          {product.product_name || "—"}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {product.sub_category || "—"}
                      </td>

                      <td className="px-4 py-3 text-right font-semibold text-slate-700">
                        ₹{Number(product.price || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-slate-700">
                          {product.live_stock ?? 0}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() => handleToggleStatus(product)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FiPower />
                          Inactive
                        </button>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleDelete(product)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          title="Delete product"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 p-3 md:hidden">
            {filteredProducts.length === 0 ? (
              <div className="py-12 text-center">
                <FiPackage className="mx-auto mb-3 text-4xl text-slate-300" />
                <p className="text-sm font-semibold text-slate-500">
                  No inactive products found
                </p>
              </div>
            ) : (
              filteredProducts.map((product, index) => (
                <div
                  key={product.product_id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">
                          #{index + 1}
                        </span>

                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          ID: {product.product_id}
                        </span>
                      </div>

                      <h3 className="truncate text-sm font-bold text-slate-800">
                        {product.product_name || "—"}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {product.sub_category || "No category"}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
                      Inactive
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase text-slate-400">
                        Price
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-700">
                        ₹{Number(product.price || 0).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase text-slate-400">
                        Stock
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-700">
                        {product.live_stock ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      disabled={isToggling}
                      onClick={() => handleToggleStatus(product)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-50"
                    >
                      <FiCheckCircle />
                      Activate
                    </button>

                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => handleDelete(product)}
                      className="flex items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      <FiTrash2 />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <FiTrash2 className="text-xl" />
            </div>

            <h2 className="text-lg font-bold text-slate-800">
              Delete Product?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-slate-700">
                {selectedProduct.product_name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                disabled={isDeleting}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 />
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