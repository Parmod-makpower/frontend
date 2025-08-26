import { useInactiveProducts, useToggleProductStatus } from "../hooks/useProducts";
import { toast } from "react-toastify";

export default function InactiveProductsPage() {
  const { data: products, isLoading, isError } = useInactiveProducts();
  const { mutate: toggleStatus } = useToggleProductStatus();

  if (isLoading) return <p>Loading inactive products...</p>;
  if (isError) return <p>Error loading inactive products</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Inactive Products</h2>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Stock</th>
            <th className="border p-2">Active</th>
          </tr>
        </thead>
        <tbody>
          {products?.map((prod) => (
            <tr key={prod.product_id} className="text-center">
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
                            `Product ${!prod.is_active ? "Activated ✅" : "Deactivated ❌"}`
                          ),
                        onError: () => toast.error("Failed to update status"),
                      }
                    )
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
