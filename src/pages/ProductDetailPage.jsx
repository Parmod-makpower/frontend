import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSchemes } from "../hooks/useSchemes";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useAuth } from "../context/AuthContext";
import { FaGift, FaCheckCircle, FaTimesCircle, FaMinus, FaPlus, FaShoppingCart } from "react-icons/fa";

export default function ProductDetailPage() {
  const { user } = useAuth();
  const { productId } = useParams();

  const { data: allProductsRaw = [], isLoading: isProductLoading } = useCachedProducts();
  const { data: schemes = [], isLoading: isSchemeLoading } = useSchemes();
  const { selectedProducts, addProduct, updateQuantity } = useSelectedProducts();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (allProductsRaw.length > 0) {
      const normalized = allProductsRaw.map((p) => ({ ...p, id: p.id ?? p.product_id }));
      const found = normalized.find((p) => p.id === parseInt(productId));
      setProduct(found);
    }
  }, [allProductsRaw, productId]);

  useEffect(() => {
    const already = selectedProducts.find((p) => p.id === parseInt(productId));
    if (already) setQuantity(already.quantity);
  }, [selectedProducts, productId]);

  if (isProductLoading || !product || isSchemeLoading)
    return <div className="p-6 text-center">Loading...</div>;

  const relatedSchemes = schemes.filter(
    (scheme) =>
      scheme.conditions.some((c) => c.product === product.id || c.product_name === product.product_name) ||
      scheme.rewards.some((r) => r.product === product.id || r.product_name === product.product_name)
  );

  const isInCart = selectedProducts.some((p) => p.id === product.id);

  const handleAddToCart = () => addProduct(product, quantity);
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
    <div className="max-w-3xl mx-auto pb-16 h-full">
      <div className=" transition-all duration-300 overflow-hidden">
        {/* Image Section */}
        <div className="relative w-full  overflow-hidden bg-gray-50">
          <img
            src={
              product?.image
                ? `https://res.cloudinary.com/djyr368zj/${product.image}`
                : "https://makpowerindia.com/cdn/shop/files/Makpower_45W_PD_Charger.webp?v=1746862914"
            }
            alt={product.product_name}
            className="w-full  object-contain transform hover:scale-105 transition duration-300"
          />
          {relatedSchemes.length > 0 && (
            <span className="absolute top-2 right-2 bg-pink-100 p-2 rounded-full shadow">
              <FaGift className="text-[#f43f5e] animate-bounce" title="Scheme Available" />
            </span>
          )}
        </div>

        {/* Content Section */}
        <div className="p-5 flex flex-col gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{product.product_name}</h2>

          <div className="flex items-center gap-3">
            {product.live_stock > 1 ? (
              <span className="flex items-center gap-1 text-[#16a34a] text-sm font-semibold">
                <FaCheckCircle /> In Stock
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#dc2626] text-sm font-semibold">
                <FaTimesCircle /> Out of Stock
              </span>
            )}
          </div>
            <p className="text-[#2563eb] text-lg font-semibold">₹{product.price || "N/A"}</p>

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

          {/* Cart Section */}
          {user?.role === "SS" && (
            <div className="mt-2">
              {isInCart ? (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <button
                    onClick={handleDecrease}
                    className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition text-sm"
                  >
                    <FaMinus />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleManualInput}
                    className="w-14 text-center border rounded-md py-1 text-sm"
                    min={1}
                  />
                  <button
                    onClick={handleIncrease}
                    className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition text-sm"
                  >
                    <FaPlus />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full mt-2 flex items-center justify-center gap-1 bg-[#2563eb] hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow"
                >
                  <FaShoppingCart /> Add to Cart
                </button>
              )}
            </div>
          )}

          {/* Schemes Section */}
          {relatedSchemes.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="flex items-center gap-2 text-green-800 font-semibold text-sm">
                <FaGift className="text-pink-500" /> Available Schemes
              </h3>
              <ul className="list-disc ml-6 mt-2 text-sm space-y-1 text-gray-700">
                {relatedSchemes.map((scheme) => (
                  <li key={scheme.id}>
                    <span className="font-semibold">{scheme.name}:</span>{" "}
                    {scheme.conditions.map((c) => `Buy ${c.min_quantity} ${c.product_name || c.product}`).join(", ")} →{" "}
                    {scheme.rewards.map((r) => `Get ${r.quantity} ${r.product_name || r.product}`).join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sale Names */}
          {product.sale_names?.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500">Available for:</label>
              <ul className="flex flex-wrap gap-2 mt-2">
                {product.sale_names.map((name, index) => (
                  <li
                    key={index}
                    className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600 shadow-sm"
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
