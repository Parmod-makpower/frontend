import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSchemes } from "../hooks/useSchemes";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";

export default function SlidingProductsCards({ trendingIds = [], title }) {
  const { data: allProducts = [], isLoading } = useCachedProducts();
  const { data: schemes = [] } = useSchemes();
  const { selectedProducts, addProduct, updateQuantity } = useSelectedProducts();
  const { user } = useAuth();

  if (isLoading) {
    return <p className="text-gray-500 text-sm">Loading trending products...</p>;
  }

  // Filter products by IDs
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
      <h2 className="text-lg font-semibold text-gray-800 mt-7 mb-4 flex items-center space-x-2">
        <span>{title}</span>
      </h2>

      {/* 🔥 Mobile: horizontal scroll (scrollbar hidden) | Desktop: Grid */}
      <div className="overflow-x-auto md:overflow-visible -mx-2 px-2 scrollbar-hide">
        <div className="flex md:grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {trendingProducts.map((prod) => {
            const prodId = prod.id ?? prod.product_id;
            const isInCart = selectedProducts.some((p) => p.id === prodId);
            const existing = selectedProducts.find((p) => p.id === prodId);
            const quantity = existing?.quantity || 1;

            return (
              <ProductCard
                key={prodId}
                prod={prod}
                hasScheme={hasScheme}
                user={user}
                selectedProducts={selectedProducts}
                addProduct={addProduct}
                updateQuantity={updateQuantity}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
