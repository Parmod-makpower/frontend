// ✅ Updated ProductDetailPage - Mobile First, Full-Width Image, Modern UI

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSchemes } from "../hooks/useSchemes";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useAuth } from "../context/AuthContext";


export default function ProductDetailPage() {
  const { user } = useAuth();

  const { productId } = useParams();
  const { data: allProductsRaw = [], isLoading: isProductLoading } = useCachedProducts();
  const { data: schemes = [], isLoading: isSchemeLoading } = useSchemes();
  const { selectedProducts, addProduct, updateQuantity } = useSelectedProducts();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // ✅ Find product from cached data
  useEffect(() => {
    if (allProductsRaw.length > 0) {
      const normalized = allProductsRaw.map((p) => ({
        ...p,
        id: p.id ?? p.product_id,
      }));
      const found = normalized.find((p) => p.id === parseInt(productId));
      setProduct(found);
    }
  }, [allProductsRaw, productId]);

  // ✅ Pre-fill quantity if already in cart
  useEffect(() => {
    const already = selectedProducts.find((p) => p.id === parseInt(productId));
    if (already) setQuantity(already.quantity);
  }, [selectedProducts, productId]);

  if (isProductLoading || !product || isSchemeLoading)
    return <div className="p-6 text-center">Loading...</div>;

  // 🔍 Related schemes
  const relatedSchemes = schemes.filter((scheme) =>
    scheme.conditions.some(
      (c) =>
        c.product === product.id || c.product_name === product.product_name
    ) ||
    scheme.rewards.some(
      (r) =>
        r.product === product.id || r.product_name === product.product_name
    )
  );

  const isInCart = selectedProducts.some((p) => p.id === product.id);

  const handleAddToCart = () => {
    addProduct(product, quantity);
  };

  const handleDecrease = () => {
    const newQty = Math.max(1, quantity - 1);
    setQuantity(newQty);
    updateQuantity(product.id, newQty);
  };

  const handleIncrease = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    updateQuantity(product.id, newQty);
  };

  const handleManualInput = (e) => {
    const val = Math.max(1, parseInt(e.target.value) || 1);
    setQuantity(val);
    updateQuantity(product.id, val);
  };

  return (
    <div className="w-full pb-16">
      {/* ✅ Full-width image on mobile */}
      <div className="w-full md:hidden">
        <img
          src={
            product?.image
              ? `https://res.cloudinary.com/djyr368zj/${product.image}`
              : "https://makpowerindia.com/cdn/shop/files/Makpower_45W_PD_Charger.webp?v=1746862914"
          }
          alt={product.product_name}
          className="w-full object-contain bg-white"
        />
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* ✅ Desktop image */}
        <div className="hidden md:block rounded-2xl overflow-hidden bg-white">
          <img
            src={
              product?.image
                ? `https://res.cloudinary.com/djyr368zj/${product.image}`
                : "https://phonokart.com/cdn/shop/files/Matttemp2.jpg?v=1697191459"
            }
            alt={product.product_name}
            className="w-full h-[500px] object-contain"
          />
        </div>

        {/* ✅ Product Info */}
        <div className="flex flex-col space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">
            {product.product_name}
          </h2>
          <p className="text-gray-700 text-lg font-semibold">
            ₹{product.price || "N/A"}
          </p>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-600">Sub Category</p>
              <p className="text-gray-800">{product.sub_category || "N/A"}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Cartoon Size</p>
              <p className="text-gray-800">{product.cartoon_size || "N/A"}</p>
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="mt-3">
  {user?.role === "SS" && (
    isInCart ? (
      <div className="flex items-center justify-center mx-auto space-x-1">
        <button
          onClick={handleDecrease}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-lg"
        >
          −
        </button>
        <input
          type="number"
          value={quantity}
          onChange={handleManualInput}
          className="w-12 text-center border rounded py-1"
          min={1}
        />
        <button
          onClick={handleIncrease}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-lg"
        >
          +
        </button>
      </div>
    ) : (
      <button
        className="w-full mt-2 bg-[var(--primary-color)] hover:bg-gray-500 text-white text-sm font-semibold py-1.5 px-3 rounded transition"
        onClick={handleAddToCart}
      >
        Add to Cart
      </button>
    )
  )}
</div>


          {/* ✅ Schemes */}
          {relatedSchemes.length > 0 && (
            <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded">
              <strong className="font-bold">Available Schemes:</strong>
              <ul className="list-disc ml-6 mt-2 text-sm space-y-1">
                {relatedSchemes.map((scheme) => (
                  <li key={scheme.id}>
                    <span className="font-semibold">{scheme.name}:</span>{" "}
                    {scheme.conditions
                      .map(
                        (c) =>
                          `Buy ${c.min_quantity} ${c.product_name || c.product}`
                      )
                      .join(", ")}{" "}
                    →{" "}
                    {scheme.rewards
                      .map(
                        (r) =>
                          `Get ${r.quantity} ${r.product_name || r.product}`
                      )
                      .join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ✅ Sale Names */}
          {product.sale_names?.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500">
                Available for:
              </label>
              <ul className="flex flex-wrap gap-2 mt-2 overflow-y-auto pr-2">
                {product.sale_names.map((name, index) => (
                  <li
                    key={index}
                    className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
