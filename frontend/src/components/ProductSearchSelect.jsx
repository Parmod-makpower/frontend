// ✅ ProductSearchSelect.jsx (Portal-based Optimized)
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useCachedProducts } from "../hooks/useCachedProducts";
import useFuseSearch from "../hooks/useFuseSearch";

export default function ProductSearchSelect({ value, onChange }) {
  const { data: products = [] } = useCachedProducts();
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);

  const selectedProduct = products.find(
    (p) => p.product_id.toString() === value?.toString()
  );

  const results = useFuseSearch(products, query, {
    keys: ["product_name", "sub_category"],
    threshold: 0.3,
  });

  useEffect(() => {
    if (selectedProduct && !query) {
      setQuery(selectedProduct.product_name);
    }
  }, [selectedProduct]);

  const handleSelect = (product) => {
    onChange(product.product_id);
    setQuery(product.product_name);
    setShowDropdown(false);
  };

  // --- Dropdown Element (Portal) ---
  const dropdown = (
    <ul
      className="absolute z-50 bg-white border w-64 max-h-48 overflow-auto rounded shadow text-sm"
      style={{
        top: inputRef.current
          ? inputRef.current.getBoundingClientRect().bottom + window.scrollY
          : 0,
        left: inputRef.current
          ? inputRef.current.getBoundingClientRect().left + window.scrollX
          : 0,
        width: inputRef.current ? inputRef.current.offsetWidth : "auto",
      }}
    >
      {results.map((product) => (
        <li
          key={product.product_id}
          onMouseDown={() => handleSelect(product)}
          className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
        >
          {product.product_name}
          <span className="text-gray-400 text-xs">
            {" "}
            – {product.sub_category}
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        className="border p-2 rounded w-full"
        value={query}
        placeholder="Search product..."
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
      />
      {showDropdown && results.length > 0 && createPortal(dropdown, document.body)}
    </div>
  );
}
