// ✅ Common hook to manage selectedProducts + cartoon selection from localStorage
import { useState, useEffect } from "react";

export function useSelectedProducts() {
  const [selectedProducts, setSelectedProducts] = useState(() => {
    const saved = localStorage.getItem("selectedProducts");
    return saved ? JSON.parse(saved) : [];
  });

  const [cartoonSelection, setCartoonSelection] = useState(() => {
    const saved = localStorage.getItem("cartoonSelection");
    return saved ? JSON.parse(saved) : {};
  });

  // Save to localStorage whenever selectedProducts changes
  useEffect(() => {
    localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
  }, [selectedProducts]);

  // Save to localStorage whenever cartoonSelection changes
  useEffect(() => {
    localStorage.setItem("cartoonSelection", JSON.stringify(cartoonSelection));
  }, [cartoonSelection]);

  const updateQuantity = (id, quantity) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity } : p))
    );
  };

  const addProduct = (product, quantity = 1) => {
    const exists = selectedProducts.find((p) => p.id === product.id);
    if (!exists) {
      setSelectedProducts([...selectedProducts, { ...product, quantity }]);
      // Initialize cartoonSelection if product has cartoon_size > 1
      if (product.cartoon_size && product.cartoon_size > 1) {
        setCartoonSelection((prev) => ({ ...prev, [product.id]: 1 }));
      }
    }
  };

  const updateCartoon = (id, cartoonCount) => {
    setCartoonSelection((prev) => ({ ...prev, [id]: cartoonCount }));
    const product = selectedProducts.find((p) => p.id === id);
    if (product) {
      updateQuantity(id, cartoonCount * (product.cartoon_size || 1));
    }
  };

  return {
    selectedProducts,
    setSelectedProducts,
    updateQuantity,
    addProduct,
    cartoonSelection,
    setCartoonSelection,
    updateCartoon,
  };
}
