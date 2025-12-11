// components/ProductSearchInput.jsx
import { useState, useRef } from "react";

export default function ProductSearchInput({
  products = [],
  onSelect = () => {},
  label = "Search Product",
}) {
  const [term, setTerm] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef(null);

  const filteredProducts = products.filter((p) =>
    p.product_name.toLowerCase().includes(term.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (!filteredProducts.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % filteredProducts.length);
    }
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex(
        (prev) =>
          prev === -1
            ? filteredProducts.length - 1
            : (prev - 1 + filteredProducts.length) % filteredProducts.length
      );
    }
    else if (e.key === "Enter") {
      if (highlightIndex >= 0 && filteredProducts[highlightIndex]) {
        e.preventDefault();
        onSelect(filteredProducts[highlightIndex]);
        setTerm("");
        setHighlightIndex(-1);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{label}</label>

      <input
        ref={inputRef}
        type="text"
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setHighlightIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Type product name..."
        className="border rounded-md px-3 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
      />

      {term && (
        <div className="max-h-64 overflow-y-auto border rounded-lg shadow bg-white mt-2">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((prod, index) => (
              <div
                key={prod.id ?? prod.product_id}
                className={`px-3 py-2 cursor-pointer flex justify-between items-center ${
                  highlightIndex === index ? "bg-blue-50" : "hover:bg-gray-100"
                }`}
                onClick={() => {
                  onSelect(prod);
                  setTerm("");
                }}
              >
                <div className="text-sm">{prod.product_name}</div>
                <div className="text-xs text-gray-500">
                  {prod.virtual_stock ?? "--"}
                </div>
              </div>
            ))
          ) : (
            <p className="px-3 py-2 text-gray-500">No products found</p>
          )}
        </div>
      )}
    </div>
  );
}
