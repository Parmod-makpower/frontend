
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

  // Product IDs - Display order will remain exactly the same
  const NEW_LAUNCH_IDS = [
    469,
    1330,
    1326,
    1360,
    1952,
    1953,
    1954,
    1955,
    1956,
    1957,
    1529,
    1950,
    1948,
    1949,
    1519,
    1517,
    1366,
    1312,
    1941,
    1942,
    1308,
    1365,
    1939,
    1940,
    1930,
    1737,
    1273,
  ];

  // Filter active products and maintain NEW_LAUNCH_IDS order
  const products = useMemo(() => {
    return NEW_LAUNCH_IDS
      .map((id) =>
        allProducts.find(
          (p) => Number(p.product_id) === id && p.is_active
        )
      )
      .filter(Boolean);
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
              <div
                key={prod.product_id}
                className="relative"
              >
                {/* NEW Badge */}
                <span className="absolute z-10 top-2 left-2 bg-red-600 text-white text-[10px] px-2 py-[2px] rounded-full">
                  NEW
                </span>

                {/* Product Card */}
                <ProductCard
                  prod={prod}
                  user={user}
                  selectedProducts={selectedProducts}
                  addProduct={addProduct}
                  updateQuantity={updateQuantity}
                  updateCartoon={updateCartoon}
                  cartoonSelection={cartoonSelection}
                  hasScheme={() => false}
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
