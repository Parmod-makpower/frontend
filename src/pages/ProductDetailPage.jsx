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
  const [showAllSales, setShowAllSales] = useState(false); // ✅ नया state

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
    const val = e.target.value;
    const parsed = parseInt(val);
    if (!isNaN(parsed)) {
      setQuantity(parsed);
      updateQuantity(product.id, Math.max(1, parsed));
    } else if (val === "") {
      setQuantity("");
    }
  };

  return (
    <div className="max-w-6xl mx-auto  pb-20">
      {/* Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Product Image */}
       
      <div className="relative  flex items-center justify-center">
          <img
            src={
              product?.image
                ? `https://res.cloudinary.com/djyr368zj/${product.image}`
                : "https://makpowerindia.com/cdn/shop/files/Makpower_45W_PD_Charger.webp?v=1746862914"
            }
            alt={product.product_name}
            className="w-full   object-contain transform hover:scale-105 transition duration-300"
          />
          {relatedSchemes.length > 0 && (
            <span className="absolute top-5 right-5 bg-pink-100 p-3 rounded-full shadow">
              <FaGift className="text-[#f43f5e] animate-bounce" title="Scheme Available" />
            </span>
          )}
        </div>
        {/* Right: Product Details */}
        <div className="flex flex-col gap-5 px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{product.product_name}</h2>

          {/* Stock */}
          <div className="flex items-center gap-3">
            {product.live_stock > 1 ? (
              <span className="flex items-center gap-2 text-[#16a34a] font-semibold">
                <FaCheckCircle /> In Stock
              </span>
            ) : (
              <span className="flex items-center gap-2 text-[#dc2626] font-semibold">
                <FaTimesCircle /> Out of Stock
              </span>
            )}
          </div>

          {/* Price */}
          <p className="text-[#2563eb] text-2xl font-bold">₹{product.price || "N/A"}</p>

          {/* Product Meta Info */}
          <div className="grid grid-cols-2 gap-6 text-sm md:text-base">
            <div>
              <p className="font-medium text-gray-600">Sub Category</p>
              <p className="text-gray-800">{product.sub_category || "N/A"}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Cartoon Size</p>
              <p className="text-gray-800">{product.cartoon_size || "N/A"}</p>
            </div>
          </div>

          {/* Add to Cart Section */}
          {user?.role === "SS" && (
            <div className="mt-2">
              {isInCart ? (
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={handleDecrease}
                    className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
                  >
                    <FaMinus />
                  </button>
                  <input
                    type="number"
                    value={quantity === "" ? "" : Number(quantity)}
                    onChange={handleManualInput}
                    onBlur={() => {
                      if (quantity === "" || isNaN(quantity) || quantity < 1) {
                        setQuantity(1);
                        updateQuantity(product.id, 1);
                      }
                    }}
                    className="w-16 text-center border rounded-md py-2 text-base"
                    min={1}
                  />
                  <button
                    onClick={handleIncrease}
                    className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
                  >
                    <FaPlus />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full md:w-auto px-6 py-3 mt-2 flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow"
                >
                  <FaShoppingCart /> Add to Cart
                </button>
              )}
            </div>
          )}

          {/* Schemes Section */}
          {relatedSchemes.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 ">
              <h3 className="flex items-center gap-2 text-green-800 font-semibold">
                <FaGift className="text-pink-500" /> Available Schemes
              </h3>
              <ul className="list-disc ml-6 mt-2 space-y-1 text-gray-700">
                {relatedSchemes.map((scheme) => (
                  <li key={scheme.id}>
                    
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
                {(showAllSales ? product.sale_names : product.sale_names.slice(0, 10)).map((name, index) => (
                  <li
                    key={index}
                    className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600 shadow-sm"
                  >
                    {name}
                  </li>
                ))}
              </ul>

              {product.sale_names.length > 10 && (
                <button
                  onClick={() => setShowAllSales(!showAllSales)}
                  className="mt-2 text-xs text-blue-600 hover:underline"
                >
                  {showAllSales ? "Show Less" : `+${product.sale_names.length - 10} More`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    
    </div>
  );
}
