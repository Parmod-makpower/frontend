import { useState } from "react";
import { useInactiveProducts, useToggleProductStatus, useDeleteProduct } from "../hooks/useProducts";
import { toast } from "react-toastify";
import { FiTrash2 } from "react-icons/fi";

export default function InactiveProductsPage() {
  const { data: products = [], isLoading, isError, isFetching } = useInactiveProducts();
  const { mutate: toggleStatus } = useToggleProductStatus();
  const { mutate: deleteProduct } = useDeleteProduct(); // ✅ added

  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading) return <p className="p-4">Loading inactive products...</p>;
  if (isError) return <p className="p-4 text-red-500">Error loading inactive products</p>;

  // 🔍 Filter logic
  const filteredProducts = products.filter((prod) => {
    const term = searchTerm.toLowerCase();
    return (
      prod.product_name?.toLowerCase().includes(term) ||
      prod.sub_category?.toLowerCase().includes(term) ||
      prod.product_id?.toString().includes(term)
    );
  });

  // ✅ Delete Handler
  const handleDelete = (id) => {
    if (window.confirm("Delete this product permanently?")) {
      deleteProduct(id, {
        onSuccess: () => toast.success("Product deleted permanently ✅"),
        onError: () => toast.error("Delete failed ❌"),
      });
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Inactive Products</h2>

      {isFetching && (
        <p className="text-sm text-gray-400 mb-2">🔄 Updating product list...</p>
      )}

      {/* 🔍 Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Name, Category or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full text-sm focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto border rounded shadow-sm">
        <table className="w-full border-collapse text-sm text-gray-700">
          <thead className="bg-gray-100 text-gray-900 font-semibold">
            <tr>
              <th className="border p-2 text-center w-12">S.No.</th>
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Stock</th>
              <th className="border p-2">Active</th>
              <th className="border p-2">Delete</th> {/* ✅ added column */}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center text-gray-500 py-4 italic">
                  No matching inactive products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((prod, index) => (
                <tr key={prod.product_id} className="text-center hover:bg-gray-50">
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">{prod.product_id}</td>
                  <td className="border p-2">{prod.product_name}</td>
                  <td className="border p-2">{prod.sub_category}</td>
                  <td className="border p-2">{prod.price}</td>
                  <td className="border p-2">{prod.live_stock}</td>
                  <td className="border p-2">
                    <input
                      type="checkbox"
                      checked={prod.is_active}
                      onChange={() =>
                        toggleStatus(
                          { productId: prod.product_id, isActive: !prod.is_active },
                          {
                            onSuccess: () =>
                              toast.success(
                                `Product ${
                                  !prod.is_active ? "Activated ✅" : "Deactivated ❌"
                                }`
                              ),
                            onError: () => toast.error("Failed to update status"),
                          }
                        )
                      }
                    />
                  </td>
                  {/* ✅ Delete Button */}
                  <td className="border p-2">
                    <button
                      onClick={() => handleDelete(prod.product_id)}
                      className="text-red-600 hover:text-red-800 cursor-pointer"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
