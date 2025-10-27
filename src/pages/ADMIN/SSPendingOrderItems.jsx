import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useCachedProducts } from "../../hooks/useCachedProducts";


function Table({ title, items }) {
  return (
    <div className="border rounded shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-red-100 border font-semibold">
        <span>{title}</span>
      </div>
      <div className="overflow-x-auto select-none ">
        <table className="min-w-full text-sm text-left text-gray-700 border">
          <thead className="bg-gray-200 text-gray-900 text-sm font-semibold">
            <tr>
              <th className="p-3 border">Product</th>
              <th className="p-3 border">Cartoon</th>
              <th className="p-3 border">Qty</th>
              <th className="p-3 border">SS-Stock</th>
              <th className="p-3 border">Stock</th>
            </tr>
          </thead>
          <tbody>
            {items?.length ? (
              items.map((r, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="p-3 border">{r.product_name}</td>
                  <td className="p-3 border">{r.cartoon_size ?? "-"}</td>
                  <td className="p-3 border">{r.quantity}</td>
                  <td className="p-3 border">{r.ss_virtual_stock}</td>
                  <td className="p-3 border">{r.virtual_stock ?? "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-3 text-gray-500" colSpan={3}>
                  No items
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CRMVerifiedDetailsPage() {
  const location = useLocation();
 
  const order = location.state?.order;

  const { data: allProducts = [] } = useCachedProducts();

  // ✅ Merge order items with virtual stock
  const enrichedItems = useMemo(() => {
    return order.items.map((item) => {
      const found = allProducts.find(p => p.product_id === item.product);
      return {
        ...item,
        virtual_stock: found?.virtual_stock ?? null,
        cartoon_size: found?.cartoon_size ?? "-", // ✅ NEW
      };
    });
  }, [order.items, allProducts]);


  if (!order) {
    return <div className="p-6 text-red-600">No order data provided. Please go back.</div>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4 pb-20">
            
      <div className="grid grid-cols-1 gap-4">
        <Table title="CRM — Verified Items" items={enrichedItems} />
      </div>
     
    </div>
  );
}
