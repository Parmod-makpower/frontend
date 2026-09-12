import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSchemes } from "../hooks/useSchemes";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";

export default function SlidingProductsCards({ trendingIds = [], title }) {
  const { data: allProducts = [], isLoading } = useCachedProducts();
  const { data: schemes = [] } = useSchemes();

  // ✅ अब चार functions ले रहे हैं (BatteryPage जैसा)
  const {
    selectedProducts,
    addProduct,
    updateQuantity,
    updateCartoon,
    cartoonSelection,
  } = useSelectedProducts();

  const { user } = useAuth();

  if (isLoading) {
    return <p className="text-gray-500 text-sm">Loading trending products...</p>;
  }

  // ✅ Filter products by IDs
  const trendingProducts = allProducts.filter((prod) =>
    trendingIds.includes(prod.product_id)
  );

  if (!trendingProducts.length) {
    return <p className="text-gray-500 text-sm">No Scheme products found.</p>;
  }

  const hasScheme = (productId) =>
    schemes.some(
      (scheme) =>
        Array.isArray(scheme.conditions) &&
        scheme.conditions.some((cond) => cond.product === productId)
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="
              w-1
              h-5
              rounded-full
              bg-[var(--primary-color)]
              flex-shrink-0
            "
          />

          <h2
            className="
              text-sm
              sm:text-base
              lg:text-lg
              font-bold
              text-gray-800
              truncate
            "
          >
            {title}
          </h2>
        </div>

        <span
          className="
            text-[9px]
            sm:text-[10px]
            text-gray-400
            whitespace-nowrap
            ml-2
          "
        >
          {trendingProducts.length} products
        </span>
      </div>

      {/* 🔥 Mobile: horizontal scroll (scrollbar hidden) | Desktop: Grid */}
      <div className="overflow-x-auto md:overflow-visible -mx-2 px-2 scrollbar-hide">
        <div className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-4">
          {trendingProducts.map((prod) => {
            const prodId = prod.id ?? prod.product_id;

            return (
              <ProductCard
                key={prodId}
                prod={prod}
                hasScheme={hasScheme}
                user={user}
                selectedProducts={selectedProducts}
                addProduct={addProduct}
                updateQuantity={updateQuantity}
                updateCartoon={updateCartoon}
                cartoonSelection={cartoonSelection}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
