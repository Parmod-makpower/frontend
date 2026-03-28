import { FaGift } from "react-icons/fa";
import { Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";


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
  getSchemeText,
  setSelectedCity
}) {
  const approvedInputRefs = useRef({});
  const addProductInputRef = useRef(null);

  // -------------------------------------
  // ✅ 1. AUTO AVAILABILITY CHECK
  // -------------------------------------
  const tableScrollRef = useRef(null);
  useEffect(() => {
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollTop =
        tableScrollRef.current.scrollHeight;
    }
  }, [editedItems.length]); // 👈 sirf jab product add/remove ho

  const getAvailability = (product, item, city) => {
    if (!product) return false;
    const qty = Number(item.quantity) || 0;

    if (city === "Mumbai") {
      return (product.mumbai_stock ?? 0) >= qty;
    }
    return (item.ss_virtual_stock ?? 0) >= qty;
  };

  useEffect(() => {
    if (editedItems.length === 0) return;

    const lastItem = editedItems[editedItems.length - 1];

    setTimeout(() => {
      approvedInputRefs.current[lastItem.product]?.focus();
    }, 0);
  }, [editedItems.length]);

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
    <div className="border-t border-r border-gray-500">
      <div ref={tableScrollRef} className="max-h-[73vh] overflow-y-auto p-0 m-0 ">
        <table className=" min-w-full border-collapse text-sm">

          {/* ================= HEADER ================= */}
          <thead className="sticky top-0 z-20 bg-gray-100 text-gray-800 text-xs font-semibold uppercase tracking-wide">
            <tr className="border">
              <th className="p-1 border border-gray-500">Product</th>
              <th className="p-1 border border-gray-500">SS Order</th>
              <th className="p-1 border border-gray-500">Approved</th>
              <th className="p-1 border border-gray-500">SS-Stock</th>

              <th className="border border-gray-500">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="Delhi">DELHI</option>
                  <option value="Mumbai">MUMBAI</option>
                </select>
              </th>

              <th className="p-1 border border-gray-500">Availability</th>
              <th className="p-1 border border-gray-500">Carton</th>
              <th className="p-1 border border-gray-500">Price</th>
              <th className="p-1 border border-gray-500">Total</th>
              <th className="p-1 border border-gray-500">Actions</th>
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
                <tr key={item.product} className="hover:bg-gray-50 bg-white text-center">
                  <td className="p-1 ps-3 border-b border-x border-gray-400">
                    <span className="flex items-center gap-1">
                      {item.is_scheme_item && (
                        <FaGift className="text-pink-500" />
                      )}
                      {item.product_name}
                    </span>
                  </td>

                  <td className="p-1 border-b border-x border-gray-400">
                    {item.original_quantity}
                  </td>

                  <td className="p-1 border-b border-x border-gray-400">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      ref={(el) => (approvedInputRefs.current[item.product] = el)}
                      value={item.quantity === "" ? "" : item.quantity}
                      onChange={(e) =>
                        handleEditQuantity(item.product, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addProductInputRef.current?.focus();
                        }
                      }}
                      className="border rounded-lg p-1 w-20 text-center"
                    />

                  </td>

                  <td className="p-1 border-b border-x border-gray-400 bg-red-100">
                    {item.ss_virtual_stock}
                  </td>

                  {selectedCity === "Delhi" && (
                    <td className="p-1 border-b border-x border-gray-400 bg-red-100">
                      {productData?.virtual_stock ?? "-"}
                    </td>
                  )}

                  {selectedCity === "Mumbai" && (
                    <td className="p-1 border-b border-x border-gray-400 bg-purple-300">
                      {productData?.mumbai_stock ?? "-"}
                    </td>
                  )}

                  <td className="p-1 border-b border-x border-gray-400">
                    <select
                      value={finalAvail}
                      onChange={(e) =>
                        updateManualAvailability(item.product, e.target.value)
                      }
                      className={`border rounded p-1 ${finalAvail === "Available"
                        ? "text-green-600"
                        : "text-red-600"
                        }`}
                    >
                      <option value="Available">Available</option>
                      <option value="Not Available">Not Available</option>
                    </select>
                  </td>

                  <td className="p-1 border-b border-x border-gray-400">
                    {productData?.cartoon_size ?? "-"}
                  </td>

                  <td className="p-1 border-b border-x border-gray-400">
                    {productData?.price ? `₹${productData.price}` : ""}
                  </td>

                  <td className="p-1 border-b border-x border-gray-400 bg-blue-100">
                    ₹
                    {finalAvail === "Available"
                      ? (
                        (Number(item.quantity) || 0) *
                        (Number(productData?.price) || 0)
                      ).toFixed(1)
                      : "0"}
                  </td>

                  <td className="p-1 border-b border-x border-gray-400">
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
            ref={addProductInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setHighlightIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Add product..."
            className="w-full px-2 py-1 text-xs text-center border border-transparent focus:outline-none rounded-none"
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
                        className={`px-2 py-1 text-xs cursor-pointer flex justify-between items-center ${highlightIndex === index
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

