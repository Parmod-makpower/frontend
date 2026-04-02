import { FiEdit, FiTrash2 } from "react-icons/fi";

export default function CRMVerifiedTable({
  items,
  order,
  user,
  setEditingItem,
  setEditQty,
  setShowEditModal,
  handleDeleteItem,
  handleSingleRowPunch,
  estimatedTotal,
}) {
 
  return (
   <div className="">

  {/* ✅ SCROLL CONTAINER */}
  <div className="max-h-[70vh] overflow-y-auto scroll-smooth">

    <table className="min-w-full border-collapse text-sm">

      {/* ✅ STICKY HEADER */}
      <thead className="sticky top-0 z-20 bg-gray-100 text-gray-800 text-xs font-semibold uppercase tracking-wide">
        <tr className="text-center">
              <th className="p-1 border border-gray-500">S.No</th>
              <th className="p-1 border border-gray-500">Category</th>
              <th className="p-1 border border-gray-500">Product</th>
              <th className="p-1 border border-gray-500">Qty</th>
              <th className="p-1 border border-gray-500">Carton</th>
              <th className="p-1 border border-gray-500">Price</th>
              <th className="p-1 border border-gray-500">Total</th>
              <th className="p-1 border border-gray-500">SS-Stock</th>
              <th className="p-1 border border-gray-500">Delhi</th>
              <th className="p-1 border border-gray-500">Mumbai</th>
              {(!order.punched || user?.role === "ADMIN") && <th className="p-1 border border-gray-500">Action</th>}
               {user?.role == "ADMIN" && (<th className="p-1 border border-gray-500">ID</th>)}
               {user?.role == "ADMIN" && (<th className="p-1 border border-gray-500">Punch</th>)}
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
                  const mumbai_stock = Number(r.mumbai_stock) || 0;

                  const total =
                    ssStock > 0 || (ssStock <= 0 && stock > 0)
                      ? (qty * price).toFixed(1)
                      : (0).toFixed(1);

                  return (
                    <tr key={idx} className="border-t hover:bg-gray-50 text-center">
                      <td className="p-1 border-b border-x border-gray-400 text-center">{idx + 1}</td>
                      <td className="p-1 border-b border-r border-gray-400">{r.sub_category}</td>
                      <td className="p-1 border-b border-r border-gray-400">{r.product_name}</td>
                      <td className="p-1 border-b border-r border-gray-400 bg-yellow-100">{r.quantity}</td>
                      <td className="p-1 border-b border-r border-gray-400">{r.cartoon_size ?? "-"}</td>
                      <td className="p-1 border-b border-r border-gray-400">{price.toFixed(1)}</td>
                      <td className="p-1 border-b border-r border-gray-400 bg-blue-100">{total}</td>
                      <td className="p-1 border-b border-r border-gray-400 bg-red-100">{ssStock}</td>
                      <td className="p-1 border-b border-r border-gray-400 bg-red-200">{stock || "0"}</td>
                      <td className="p-1 border-b border-r border-gray-400 bg-purple-200">{mumbai_stock || "0"}</td>

                      {(!order.punched || user?.role === "ADMIN") && (
                        <td className="p-1 border-b border-r border-gray-400 text-center bg-gray-200">
                          <div className="flex justify-around ">
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
                              className="flex items-center gap-2 text-red-600 border border-red-600 rounded-md px-2 hover:bg-red-600 hover:text-white transition-all duration-150 cursor-pointer"
                            >
                              <FiTrash2 /> Delete
                            </button>
                          </div>
                        </td>
                      )}
                      {user?.role == "ADMIN" && (<td className="p-1  border-b border-r border-gray-400 bg-red-200">{r.id}</td>)}
                      {user?.role == "ADMIN" && ( <td
                      className="p-1  border-b border-r border-gray-400 text-blue-600 underline hover:bg-blue-400 hover:text-white cursor-pointer"
                      onClick={() => handleSingleRowPunch(r)}>
                      punch
                    </td>)}
                       
                    </tr>
                  );
                })}

                {/* ✅ Total Row */}
                <tr className="font-semibold border border-gray-400">
                  <td colSpan={6} className="px-3 p-1 text-xs text-red-500 border-b border-x border-gray-400 text-right">
                   Estimated Total (Stock-Based, Priced Items Only)
                  </td>
                  <td  className="p-1 border-b border-r border-gray-400 text-center">
                    ₹ {estimatedTotal.toFixed(1)}
                  </td>
                </tr>
              </>
            ) : (
              <tr>
                <td className="px-3 p-1 text-gray-500 text-center" colSpan={9}>
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
