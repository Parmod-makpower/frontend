import { FaGift } from "react-icons/fa";
import { Trash2 } from "lucide-react";

export default function OrderItemsTable({
  editedItems,
  allProducts,
  handleEditQuantity,
  setItemToDelete,
  setShowDeleteModal,
  selectedCity,
  manualAvailabilityMap,
  updateManualAvailability,

  searchTerm,
  setSearchTerm,
  filteredProducts,
  highlightIndex,
  setHighlightIndex,
  handleAddProductBySearch,
  handleKeyDown,
  getSchemeText
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
    return (item.ss_virtual_stock ?? 0) >= qty;
  };

  // -------------------------------------
  // ✅ 2. FINAL AVAILABILITY (Manual → Auto)
  // -------------------------------------
  const getFinalAvailability = (item, productData) => {
    if (manualAvailabilityMap[item.product]) {
      return manualAvailabilityMap[item.product];
    }

    return getAvailability(productData, item, selectedCity)
      ? "Available"
      : "Not Available";
  };

  return (
    <div>
    <div className="max-h-[73vh] overflow-y-auto border p-0 m-0 rounded-t rounded-b-none">
      <table className="w-full text-sm text-left sm:table-fix">

        {/* ================= HEADER ================= */}
        <thead className="bg-gray-600 border text-white sticky top-0 z-10 text-center">
          <tr>
            <th className="py-2 border border-black">Product</th>
            <th className="py-2 border border-black">SS Order</th>
            <th className="py-2 border border-black">Approved</th>
            <th className="py-2 border border-black">SS-Stock</th>

            {selectedCity === "Delhi" && (
              <th className="py-2 border border-black">Delhi</th>
            )}
            {selectedCity === "Mumbai" && (
              <th className="py-2 border border-black">Mumbai</th>
            )}

            <th className="py-2 border border-black">Availability</th>
            <th className="py-2 border border-black">Carton</th>
            <th className="py-2 border border-black">Price</th>
            <th className="py-2 border border-black">Total</th>
            <th className="py-2 border border-black">Actions</th>
          </tr>
        </thead>

        {/* ================= BODY ================= */}
        <tbody className="text-xs">
          {editedItems.map((item) => {
            const productData = allProducts.find(
              (p) => p.product_id === item.product
            );

            const finalAvail = getFinalAvailability(item, productData);

            return (
              <tr key={item.product} className="hover:bg-gray-50 bg-white">
                <td className="px-4 py-1 border">
                  <span className="flex items-center gap-1">
                    {item.is_scheme_item && (
                      <FaGift className="text-pink-500" />
                    )}
                    {item.product_name}
                  </span>
                </td>

                <td className="px-4 py-1 border text-center">
                  {item.original_quantity}
                </td>

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

                <td className="px-4 py-1 border text-center bg-red-300">
                  {item.ss_virtual_stock}
                </td>

                {selectedCity === "Delhi" && (
                  <td className="px-4 py-1 border text-center bg-red-300">
                    {productData?.virtual_stock ?? "-"}
                  </td>
                )}

                {selectedCity === "Mumbai" && (
                  <td className="px-4 py-1 border text-center bg-purple-300">
                    {productData?.mumbai_stock ?? "-"}
                  </td>
                )}

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

                <td className="px-4 py-1 border text-center">
                  {productData?.cartoon_size ?? "-"}
                </td>

                <td className="px-4 py-1 border text-center">
                  {productData?.price ? `₹${productData.price}` : ""}
                </td>

                <td className="px-4 py-1 border text-center bg-blue-100">
                  ₹
                  {finalAvail === "Available"
                    ? (
                        (Number(item.quantity) || 0) *
                        (Number(productData?.price) || 0)
                      ).toFixed(1)
                    : "0"}
                </td>

                <td className="px-4 py-1 border text-center">
                  <button
                    onClick={() => {
                      setItemToDelete(item.product);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-600 hover:text-red-800 px-3 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>

      
      </table>
       
    </div>
 {/* ================= FOOTER (ADD PRODUCT + TOTAL) ================= */}
       
          <div className="font-bold text-xs text-gray-800 bg-gray-200 flex ">

            {/* 🆕 ADD PRODUCT (GOOGLE SHEET STYLE) */}
            <div className="px-0 py-0 border border-black relative bg-white w-full" >
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Add product..."
                className="
                  w-full
                  px-2 py-1
                  text-xs
                  text-center
                  border border-transparent
                  focus:outline-none
                  rounded-none
                "
              />

              {searchTerm && (
                <div className="absolute left-0 right-0 top-full bg-white border shadow-lg max-h-24 overflow-y-auto z-[999]">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((prod, index) => {
                      const schemeText = getSchemeText(prod.product_id);

                      return (
                        <div key={prod.product_id}>
                          <div
                            onClick={() => handleAddProductBySearch(prod)}
                            className={`px-2 py-1 text-xs cursor-pointer flex justify-between items-center ${
                              highlightIndex === index
                                ? "bg-orange-100"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            <span className="truncate">
                              {prod.product_name}
                            </span>
                            {schemeText && (
                              <FaGift className="text-pink-500 text-xs" />
                            )}
                          </div>

                          {schemeText && (
                            <div className="px-2 text-[10px] text-pink-600">
                              {schemeText}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-2 py-1 text-gray-400 text-xs">
                      No products found
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-4 py-2 text-right border border-black w-full">
              Grand Total :
            </div>

            <div className="px-5 py-2 border border-black bg-blue-200 w-full">
              ₹
              {editedItems
                .reduce((sum, item) => {
                  const productData = allProducts.find(
                    (p) => p.product_id === item.product
                  );

                  const finalAvail =
                    manualAvailabilityMap[item.product] ??
                    ((selectedCity === "Mumbai"
                      ? (productData?.mumbai_stock ?? 0)
                      : (item.ss_virtual_stock ?? 0)) >=
                    Number(item.quantity || 0)
                      ? "Available"
                      : "Not Available");

                  if (finalAvail !== "Available") return sum;

                  return (
                    sum +
                    (Number(item.quantity) || 0) *
                      (Number(productData?.price) || 0)
                  );
                }, 0)
                .toFixed(1)}
            </div>
          </div>
        
    </div>
  );
}
