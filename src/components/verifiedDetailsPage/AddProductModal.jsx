import { useState, useMemo } from "react";
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
  const [highlightIndex, setHighlightIndex] = useState(0);

  // 🔍 Optimized filtering
  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) =>
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allProducts, searchTerm]);

  // ✅ Common select handler (DRY)
  const handleSelectProduct = (p) => {
    setNewProduct(p.product_id);
    setNewPrice(p.price || 0);
    setNewQty(p.cartoon_size || 1);
    setSearchTerm(p.product_name);
    setDropdownOpen(false);
  };

  return (
    <div className="p-3 space-y-3">
      
      {/* HEADER */}
      <div className="text-xs font-semibold  flex items-center text-gray-600 mb-2">
          <FaPlus /> Add Product
        </div>
     

      {/* 🔍 Product Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search product..."
          className="w-full border rounded p-1 text-sm"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setHighlightIndex(0); // reset highlight
            setDropdownOpen(true);
          }}
          onFocus={() => setDropdownOpen(true)}
          onKeyDown={(e) => {
            if (!dropdownOpen || filteredProducts.length === 0) return;

            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlightIndex((prev) =>
                prev < filteredProducts.length - 1 ? prev + 1 : 0
              );
            }

            if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlightIndex((prev) =>
                prev > 0 ? prev - 1 : filteredProducts.length - 1
              );
            }

            if (e.key === "Enter") {
              e.preventDefault();
              const selected = filteredProducts[highlightIndex];
              if (selected) handleSelectProduct(selected);
            }

            if (e.key === "Escape") {
              setDropdownOpen(false);
            }
          }}
        />

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute z-50 bg-white border rounded w-full max-h-60 overflow-y-auto shadow-lg">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p, index) => (
                <div
                  key={p.product_id}
                  onClick={() => handleSelectProduct(p)}
                  className={`px-3 py-1 cursor-pointer text-sm ${
                    highlightIndex === index
                      ? "bg-blue-200"
                      : "hover:bg-blue-100"
                  }`}
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
        className="w-full border rounded p-1 text-sm"
        value={newQty}
        onChange={(e) => setNewQty(e.target.value)}
      />

      {/* ➕ Add Button */}
      <button
        onClick={handleAddProduct}
        className="w-full bg-green-600 text-white py-1 rounded hover:bg-green-700 text-sm cursor-pointer"
      >
        Add Product
      </button>
    </div>
  );
}