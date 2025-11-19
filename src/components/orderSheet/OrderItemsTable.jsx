import { FaGift } from "react-icons/fa";
import { Trash2 } from "lucide-react";

export default function OrderItemsTable({
  editedItems,
  allProducts,
  handleEditQuantity,
  setItemToDelete,
  setShowDeleteModal,
}) {
  return (
    <table className="w-full text-sm  text-left sm:table-fix">
      <thead className="bg-gray-600 border text-white sticky top-0 z-10">
        <tr>
          <th className="px-4 py-3 border border-black">Product</th>
          <th className="px-4 py-3 text-center border border-black">SS Order</th>
          <th className="px-4 py-3 text-center border border-black">Approved</th>
          <th className="px-4 py-3 text-center border border-black">SS-Stock</th>
          <th className="px-4 py-3 text-center border border-black">Delhi</th>
          <th className="px-4 py-3 text-center border border-black">Mumbai</th>
          <th className="px-4 py-3 text-center border border-black">Carton</th>
          <th className="px-4 py-3 text-center border border-black">Price</th>
          <th className="px-4 py-3 text-center border border-black">Total</th>
          <th className="px-4 py-3 text-center border border-black">Actions</th>
        </tr>
      </thead>

      <tbody>
        {editedItems.map((item) => {
          const productData = allProducts.find(
            (p) => p.product_id === item.product
          );

          return (
            <tr key={item.product} className="hover:bg-gray-50 bg-white">
              <td className="px-4 py-2 border gap-2">
                {item.product_name}
                {item.is_scheme_item && <FaGift className="text-orange-500" />}
              </td>

              <td className="px-4 py-2 border text-center">
                {item.original_quantity}
              </td>

              <td className="px-4 py-2 border text-center">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={item.quantity === "" ? "" : item.quantity}
                  onChange={(e) =>
                    handleEditQuantity(item.product, e.target.value)
                  }
                  className="border rounded-lg p-1 w-20 text-center"
                />
              </td>

              <td className="px-4 py-2 border text-center bg-red-300">
                {item.ss_virtual_stock}
              </td>

              <td className="px-4 py-2 border text-center bg-red-300">
                {productData?.virtual_stock ?? "-"}
              </td>

              <td className="px-4 py-2 border text-center bg-purple-300">
                {productData?.mumbai_stock ?? "-"}
              </td>
              <td className="px-4 py-2 border text-center">
                {productData?.cartoon_size ?? "-"}
              </td>

              <td className="px-4 py-2 border text-center">
                {productData?.price ? `₹${productData.price}` : ""}
              </td>

              <td className="px-4 py-2 border text-center bg-blue-100">
                ₹
                {(item.ss_virtual_stock > 0 ||
                  (item.ss_virtual_stock <= 0 &&
                    (productData?.virtual_stock ?? 0) > 0))
                  ? (
                      (Number(item.quantity) || 0) *
                      (Number(productData?.price) || 0)
                    ).toFixed(1)
                  : 0}
              </td>

              <td className="px-4 py-2 border text-center">
                <button
                  onClick={() => {
                    setItemToDelete(item.product);
                    setShowDeleteModal(true);
                  }}
                  className="text-red-600 hover:text-red-800 cursor-pointer px-3 p-1"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          );
        })}

        {/* ✅ Grand Total */}
        <tr className="bg-gray-100 font-bold text-gray-800">
          <td colSpan="8" className="px-4 py-2 text-right border">
            Estimate Total:
          </td>
          <td colSpan="2" className="px-4 py-2 border">
            ₹
            {editedItems
              .reduce((sum, item) => {
                const productData = allProducts.find(
                  (p) => p.product_id === item.product
                );

                const rawPrice = productData?.price;
                const virtualStock = productData?.virtual_stock ?? 0;

                if (
                  (item.ss_virtual_stock <= 0 && virtualStock <= 0) ||
                  rawPrice == null ||
                  isNaN(Number(rawPrice))
                ) {
                  return sum;
                }

                const price = Number(rawPrice);
                const qty = Number(item.quantity) || 0;

                return sum + price * qty;
              }, 0)
              .toFixed(1)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
