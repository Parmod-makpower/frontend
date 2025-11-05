import { FiEdit, FiTrash2 } from "react-icons/fi";

export default function CRMVerifiedTable({
  title,
  items,
  order,
  user,
  setEditingItem,
  setEditQty,
  setShowEditModal,
  handleDeleteItem,
}) {
  const estimateTotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    const ssStock = Number(item.ss_virtual_stock) || 0;
    const stock = Number(item.virtual_stock) || 0;

    if (ssStock > 0 || (ssStock <= 0 && stock > 0)) {
      return sum + qty * price;
    }
    return sum;
  }, 0);

  return (
    <div className="border rounded shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-blue-100 border font-semibold">
        <span>{title}</span>
      </div>

      <div className="overflow-x-auto select-none">
        <table className="min-w-full text-sm text-left text-gray-700 border">
          <thead className="bg-gray-200 text-gray-900 text-sm font-semibold">
            <tr>
              <th className="p-3 border">S.No</th>
              <th className="p-3 border">Category</th>
              <th className="p-3 border">Product</th>
              <th className="p-3 border">Qty</th>
              <th className="p-3 border">Carton</th>
              <th className="p-3 border">Price</th>
              <th className="p-3 border">Total</th>
              <th className="p-3 border">SS-Stock</th>
              <th className="p-3 border">Stock</th>
              {(!order.punched || user?.role === "ADMIN") && <th className="p-3 border">Action</th>}
            </tr>
          </thead>

          <tbody>
            {items?.length ? (
              <>
                {items.map((r, idx) => {
                  const qty = Number(r.quantity) || 0;
                  const price = Number(r.price) || 0;
                  const ssStock = Number(r.ss_virtual_stock) || 0;
                  const stock = Number(r.virtual_stock) || 0;

                  const total =
                    ssStock > 0 || (ssStock <= 0 && stock > 0)
                      ? (qty * price).toFixed(1)
                      : (0).toFixed(1);

                  return (
                    <tr key={idx} className="border-t hover:bg-gray-50">
                      <td className="p-3 border text-center">{idx + 1}</td>
                      <td className="p-3 border">{r.sub_category}</td>
                      <td className="p-3 border">{r.product_name}</td>
                      <td className="p-3 border bg-yellow-100">{r.quantity}</td>
                      <td className="p-3 border">{r.cartoon_size ?? "-"}</td>
                      <td className="p-3 border">₹{price.toFixed(1)}</td>
                      <td className="p-3 border bg-blue-100">₹{total}</td>
                      <td className="p-3 border bg-red-100">{ssStock}</td>
                      <td className="p-3 border bg-red-200">{stock || "0"}</td>

                      {(!order.punched || user?.role === "ADMIN") && (
                        <td className="p-3 border text-center">
                          <div className="flex justify-around">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingItem(r);
                                setEditQty(r.quantity);
                                setShowEditModal(true);
                              }}
                              className="text-blue-600 rounded hover:bg-blue-600 hover:text-white flex items-center border px-2 cursor-pointer"
                            >
                              <FiEdit className="me-2" /> Edit
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteItem(r.id);
                              }}
                              className="flex items-center gap-2 text-red-600 border border-red-600 rounded-md px-2 hover:bg-red-600 hover:text-white transition-all duration-150"
                            >
                              <FiTrash2 /> Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}

                {/* ✅ Total Row */}
                <tr className="bg-blue-100 font-semibold">
                  <td colSpan={6} className="p-3 border text-right">
                    Estimate Total
                  </td>
                  <td colSpan={3} className="p-3 border">
                    ₹{estimateTotal.toFixed(1)}
                  </td>
                </tr>
              </>
            ) : (
              <tr>
                <td className="p-3 text-gray-500 text-center" colSpan={9}>
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
