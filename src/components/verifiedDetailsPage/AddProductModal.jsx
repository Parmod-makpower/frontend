import { useState } from "react";
import { FaPlus } from "react-icons/fa";

export default function AddProductPanel({
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

  return (
    <div className="bg-white border shadow p-3 space-y-3">
      
      {/* HEADER */}
      <h2 className="font-semibold text-sm flex items-center gap-2 border-b pb-2">
        <FaPlus /> Add Product
      </h2>

      {/* 🔍 Product Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search product..."
          className="w-full border rounded p-2 text-sm"
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
                  className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm"
                >
                  {p.product_name}
                </div>
              ))
            ) : (
              <div className="p-3 text-gray-400 text-sm">
                No product found
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🔢 Quantity */}
      <input
        type="number"
        placeholder="Quantity"
        className="w-full border rounded p-2 text-sm"
        value={newQty}
        onChange={(e) => setNewQty(e.target.value)}
      />

      {/* 💰 Price */}
      <input
        type="number"
        className="w-full border rounded p-2 bg-gray-100 text-sm"
        value={newPrice}
        readOnly
      />

      {/* ➕ Add Button */}
      <button
        onClick={handleAddProduct}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm"
      >
        Add Product
      </button>
    </div>
  );
}