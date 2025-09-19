import { useCachedProducts } from "../hooks/useCachedProducts";

export default function Dumy() {
  const { data: mergedProducts = [], isLoading } = useCachedProducts();

  if (isLoading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Category</th>
              <th className="px-4 py-2 border">Product Name</th>
              <th className="px-4 py-2 border">MOQ</th>
              <th className="px-4 py-2 border">Stock</th>
              <th className="px-4 py-2 border">Price</th>
              <th className="px-4 py-2 border">Cartoon</th>
              <th className="px-4 py-2 border">Virtual Stock</th>
            </tr>
          </thead>
          <tbody>
            {mergedProducts.map((prod) => (
              <tr key={prod.product_id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{prod.product_id}</td>
                <td className="px-4 py-2 border">{prod.sub_category}</td>
                <td className="px-4 py-2 border">{prod.product_name}</td>
                <td className="px-4 py-2 border">{prod.moq || 0}</td>
                <td className="px-4 py-2 border">{prod.live_stock || 0}</td>
                <td className="px-4 py-2 border">{prod.price}</td>
                <td className="px-4 py-2 border">{prod.cartoon_size}</td>
                <td className="px-4 py-2 border">{prod.virtual_stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
