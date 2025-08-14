// ✅ Common hook to manage selectedProducts from localStorage
import { useState, useEffect } from "react";

export function useSelectedProducts() {
  const [selectedProducts, setSelectedProducts] = useState(() => {
    const saved = localStorage.getItem("selectedProducts");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
  }, [selectedProducts]);

  const updateQuantity = (id, quantity) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity } : p))
    );
  };

  const addProduct = (product, quantity = 1) => {
    const exists = selectedProducts.find((p) => p.id === product.id);
    if (!exists) {
      setSelectedProducts([...selectedProducts, { ...product, quantity }]);
    }
  };

  return { selectedProducts, setSelectedProducts, updateQuantity, addProduct };
}