import { FaGift } from "react-icons/fa";
import { Trash2 } from "lucide-react";

export default function OrderItemsTable({
  editedItems,
  allProducts,
  handleEditQuantity,
  setItemToDelete,
  setShowDeleteModal,
  selectedCity,
  manualAvailabilityMap,     // ⬅️ required for manual availability
  updateManualAvailability    // ⬅️ updates manual availability (no localStorage!)
}) {
  // -------------------------------------
  // ✅ 1. AUTO AVAILABILITY CHECK
  // -------------------------------------
  const getAvailability = (product, item, city) => {
    if (!product) return false;

    const qty = Number(item.quantity) || 0;

    if (city === "Mumbai") {
      return (product.mumbai_stock ?? 0) >= qty;
    }

    // Delhi
    return (item.ss_virtual_stock ?? 0) >= qty;
  };

  // -------------------------------------
  // ✅ 2. FINAL AVAILABILITY (Manual → Auto)
  // -------------------------------------
  const getFinalAvailability = (item, productData) => {
    if (manualAvailabilityMap[item.product]) {
      return manualAvailabilityMap[item.product]; // manual override
    }

    return getAvailability(productData, item, selectedCity)
      ? "Available"
      : "Not Available";
  };

  return (
    <table className="w-full text-sm text-left sm:table-fix">
      <thead className="bg-gray-600 border text-white sticky top-0 z-10 text-center">
        <tr>
          <th className="py-2 border border-black">Product</th>
          <th className="py-2 text-center border border-black">SS Order</th>
          <th className="py-2 text-center border border-black">Approved</th>
          <th className="py-2 text-center border border-black">SS-Stock</th>

          {selectedCity === "Delhi" && (
            <th className="py-2 text-center border border-black">Delhi</th>
          )}

          {selectedCity === "Mumbai" && (
            <th className="py-2 text-center border border-black">Mumbai</th>
          )}

          <th className="py-2 text-center border border-black">Availability</th>
          <th className="py-2 text-center border border-black">Carton</th>
          <th className="py-2 text-center border border-black">Price</th>
          <th className="py-2 text-center border border-black">Total</th>
          <th className="py-2 text-center border border-black">Actions</th>
        </tr>
      </thead>

      <tbody className="text-xs">
        {editedItems.map((item) => {
          const productData = allProducts.find(
            (p) => p.product_id === item.product
          );

          const finalAvail = getFinalAvailability(item, productData);

          return (
            <tr key={item.product} className="hover:bg-gray-50 bg-white">
              {/* Product */}
              <td className="px-4 py-1 border gap-2 ">
                <span className="flex items-center gap-1">
                  {item.is_scheme_item && <FaGift className="text-pink-500" />}
                  {item.product_name}
                </span>
              </td>

              {/* SS Order */}
              <td className="px-4 py-1 border text-center">
                {item.original_quantity}
              </td>

              {/* Approved Qty */}
              <td className="py-1 border text-center">
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

              {/* SS Stock */}
              <td className="px-4 py-1 border text-center bg-red-300">
                {item.ss_virtual_stock}
              </td>

              {/* Delhi Stock */}
              {selectedCity === "Delhi" && (
                <td className="px-4 py-1 border text-center bg-red-300">
                  {productData?.virtual_stock ?? "-"}
                </td>
              )}

              {/* Mumbai Stock */}
              {selectedCity === "Mumbai" && (
                <td className="px-4 py-1 border text-center bg-purple-300">
                  {productData?.mumbai_stock ?? "-"}
                </td>
              )}

              {/* MANUAL + AUTO AVAILABILITY */}
              <td className="py-1 border text-center">
                <select
                  value={finalAvail}
                  onChange={(e) =>
                    updateManualAvailability(item.product, e.target.value)
                  }
                  className={`border rounded p-1 ${
                    finalAvail === "Available"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  <option value="Available">Available</option>
                  <option value="Not Available">Not Available</option>
                </select>
              </td>

              {/* Carton */}
              <td className="px-4 py-1 border text-center">
                {productData?.cartoon_size ?? "-"}
              </td>

              {/* Price */}
              <td className="px-4 py-1 border text-center">
                {productData?.price ? `₹${productData.price}` : ""}
              </td>

              {/* Total */}
              <td className="px-4 py-1 border text-center bg-blue-100">
                ₹
                {finalAvail === "Available"
                  ? (
                      (Number(item.quantity) || 0) *
                      (Number(productData?.price) || 0)
                    ).toFixed(1)
                  : "0"}
              </td>

              {/* Delete */}
              <td className="px-4 py-1 border text-center">
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

        {/* --------------------- */}
        {/* GRAND TOTAL */}
        {/* --------------------- */}
        <tr className="bg-gray-100 font-bold text-gray-800">
          <td colSpan="8" className="px-4 py-2 text-right border">
            Estimate Total:
          </td>

          <td colSpan="2" className="px-4 py-1 border ">
            ₹
            {editedItems
              .reduce((sum, item) => {
                const productData = allProducts.find(
                  (p) => p.product_id === item.product
                );

                const finalAvail = getFinalAvailability(item, productData);

                if (finalAvail !== "Available") return sum;

                const price = Number(productData?.price) || 0;
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
