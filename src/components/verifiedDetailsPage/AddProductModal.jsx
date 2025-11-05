import { useState } from "react";

export default function AddProductModal({
  show,
  setShow,
  allProducts,
  handleAddProduct,
  newProduct,
  setNewProduct,
  newQty,
  setNewQty,
  newPrice,
  setNewPrice,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredProducts = allProducts.filter((p) =>
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md">
        <h2 className="text-lg font-bold mb-4">Add Product to Order</h2>
        <div className="mb-3 relative">
          <input
            type="text"
            placeholder="Search product..."
            className="w-full border rounded p-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setDropdownOpen(true)}
          />
          {dropdownOpen && (
            <div className="absolute z-50 bg-white border rounded w-full max-h-60 overflow-y-auto shadow-lg">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <div
                    key={p.product_id}
                    onClick={() => {
                      setNewProduct(p.product_id);
                      setNewPrice(p.price || 0);
                      setSearchTerm(p.product_name);
                      setDropdownOpen(false);
                    }}
                    className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                  >
                    {p.product_name}
                  </div>
                ))
              ) : (
                <div className="p-3 text-gray-400">No product found</div>
              )}
            </div>
          )}
        </div>

        <input
          type="number"
          placeholder="Quantity"
          className="w-full border rounded p-2 mb-3"
          value={newQty}
          onChange={(e) => setNewQty(e.target.value)}
        />

        <input
          type="number"
          placeholder="Price"
          className="w-full border rounded p-2 mb-4 bg-gray-100"
          value={newPrice}
          readOnly
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShow(false)}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleAddProduct}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
