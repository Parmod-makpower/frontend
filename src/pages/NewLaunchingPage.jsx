// 📁 src/pages/NewLaunchingPage.jsx
import { useMemo } from "react";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useAuth } from "../context/AuthContext";
import MobilePageHeader from "../components/MobilePageHeader";
import ProductCard from "../components/ProductCard";

export default function NewLaunchingPage() {
  const { data: allProducts = [], isLoading } = useCachedProducts();
  const {
    selectedProducts,
    addProduct,
    updateQuantity,
    updateCartoon,
    cartoonSelection,
  } = useSelectedProducts();

  const { user } = useAuth();

  // ✅ New Launch Product IDs
  const NEW_LAUNCH_IDS = [
    460, 186, 267, 239, 6, 1873, 1872, 1867, 1868, 1869,
    1870, 1335, 1871, 1332, 1336, 1865, 1215, 1300, 1866, 99, 12
  ];

  // ✅ Filter + Sort
  const products = useMemo(() => {
    return allProducts
      .filter((p) => p.is_active)
      .filter((p) => NEW_LAUNCH_IDS.includes(p.product_id))
      .sort((a, b) => {
        const subCompare = (a.sub_category || "")
          .localeCompare(b.sub_category || "");
        if (subCompare !== 0) return subCompare;

        return (a.product_name || "")
          .localeCompare(b.product_name || "");
      });
  }, [allProducts]);

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading Products...
      </div>
    );
  }

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <MobilePageHeader title="New Launch" />

      <div className="px-3 mt-6 pt-[60px] sm:pt-0">
        {products.length === 0 ? (
          <p className="text-center text-gray-500">
            No products found.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
            {products.map((prod) => (
              
              // ✅ Wrapper for NEW badge
              <div key={prod.product_id} className="relative">

                {/* 🔴 NEW Badge */}
                <span className="absolute z-10 top-2 left-2 bg-red-600 text-white text-[10px] px-2 py-[2px] rounded-full">
                  NEW
                </span>

                {/* ✅ Reusable Product Card */}
                <ProductCard
                  prod={prod}
                  user={user}
                  selectedProducts={selectedProducts}
                  addProduct={addProduct}
                  updateQuantity={updateQuantity}
                  updateCartoon={updateCartoon}
                  cartoonSelection={cartoonSelection}
                  hasScheme={() => false} // yaha schemes nahi use ho rahi
                  cardWidth="w-full"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}