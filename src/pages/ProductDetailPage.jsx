import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSchemes } from "../hooks/useSchemes";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useAuth } from "../context/AuthContext";
import {
  FaGift,
  FaCheckCircle,
  FaTimesCircle,
  FaShoppingCart,
  FaBan,
} from "react-icons/fa";
import { FaIndianRupeeSign } from "react-icons/fa6";
import makpower_image from "../assets/images/makpower_image.webp";

export default function ProductDetailPage() {
  const { user } = useAuth();
  const { productId } = useParams();
  const navigate = useNavigate();

  const { data: allProductsRaw = [], isLoading: isProductLoading } = useCachedProducts();
  const { data: schemes = [], isLoading: isSchemeLoading } = useSchemes();
  const { selectedProducts, addProduct, removeProduct } = useSelectedProducts();

  const [product, setProduct] = useState(null);
  const [showAllSales, setShowAllSales] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (allProductsRaw.length > 0) {
      const normalized = allProductsRaw.map((p) => ({ ...p, id: p.id ?? p.product_id }));
      const found = normalized.find((p) => p.id === parseInt(productId));
      setProduct(found);
    }
  }, [allProductsRaw, productId]);

  if (isProductLoading || !product || isSchemeLoading)
    return <div className="p-6 text-center">Loading...</div>;

  const relatedSchemes = schemes.filter(
    (scheme) =>
      scheme.conditions.some(
        (c) => c.product === product.id || c.product_name === product.product_name
      ) ||
      scheme.rewards.some(
        (r) => r.product === product.id || r.product_name === product.product_name
      )
  );

  const isInCart = selectedProducts.some((p) => p.id === product.id);

  const handleAddToCart = () => addProduct(product, 1);

  const images = [
    product?.image
      ? `https://res.cloudinary.com/djyr368zj/${product.image}?f_auto,q_auto,w_500,dpr_auto`
      : makpower_image,
    product?.image2
      ? `https://res.cloudinary.com/djyr368zj/${product.image2}?f_auto,q_auto,w_500,dpr_auto`
      : null,
  ].filter(Boolean);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="max-w-6xl mx-auto pb-20 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Product Image Slider */}
        <div className="relative flex items-center justify-center">
          <img
            src={images[currentIndex]}
            alt={product.product_name}
            className="w-full max-h-[600px] h-[600px] object-contain transform hover:scale-105 transition duration-300"
            onError={(e) => (e.target.src = makpower_image)}
          />

          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-white text-white p-2 rounded-full shadow"
              >
                ❮
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-white text-white p-2 rounded-full shadow"
              >
                ❯
              </button>
              <div className="absolute bottom-3 flex gap-2 bg-white/70 px-2 py-1 rounded-lg">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`thumb-${index}`}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-12 h-12 object-cover rounded-md cursor-pointer border-2 ${
                      currentIndex === index ? "border-blue-500" : "border-transparent"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {relatedSchemes.length > 0 && (
            <span className="absolute top-5 right-5 bg-pink-100 p-3 rounded-full shadow">
              <FaGift className="text-[#f43f5e] animate-bounce" title="Scheme Available" />
            </span>
          )}
        </div>

        {/* Right: Product Details */}
        <div className="flex flex-col sm:gap-5 gap-2 px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            {product.product_name}
          </h2>

          {/* Stock */}
          <div className="flex items-center gap-3">
            {product.virtual_stock > product.moq ? (
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
          <p className="font-semibold">
            {!isNaN(product.price) ? (
              <span className="flex items-center gap-1 text-black">
                <FaIndianRupeeSign /> {product.price}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-500">
                <FaBan /> Price not Available
              </span>
            )}
          </p>

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-6 text-sm md:text-base">
            <div>
              <p className="font-medium text-gray-600">Category</p>
              <p className="text-gray-800">{product.sub_category || "N/A"}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Cartoon Size</p>
              <p className="text-gray-800">{product.cartoon_size || "N/A"}</p>
            </div>
          </div>

          {/* ✅ Add to Cart Section */}
          {user?.role === "SS" && (
            <div className="mt-2">
              <button
                onClick={(e) => {
                  if (product.virtual_stock <= product.moq || isInCart) return;
                  handleAddToCart();
                }}
                disabled={product.virtual_stock <= product.moq}
                className={`w-full mt-2 flex items-center justify-center gap-2 
                  ${isInCart ? "bg-green-500" : "bg-gradient-to-r from-orange-500 via-red-500 to-pink-600"}
                  hover:opacity-90 text-white text-sm font-semibold 
                  py-3 rounded-xl shadow-lg transition-all duration-300
                  ${product.virtual_stock <= product.moq ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                {product.virtual_stock <= product.moq
                  ? "Out of Stock"
                  : isInCart
                  ? "✅ Added"
                  : (
                    <>
                      <FaShoppingCart className="animate-bounce" />
                      Add to Cart
                    </>
                  )}
              </button>
            </div>
          )}

          {/* Schemes */}
          {relatedSchemes.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="flex items-center gap-2 text-green-800 font-semibold">
                <FaGift className="text-pink-500" /> Available Schemes
              </h3>
              <ul className="list-disc ml-6 mt-2 space-y-1 text-gray-700">
                {relatedSchemes.map((scheme) => (
                  <li key={scheme.id}>
                    {scheme.conditions
                      .map((c) => `Buy ${c.min_quantity} ${c.product_name || c.product}`)
                      .join(", ")}{" "}
                    →{" "}
                    {scheme.rewards
                      .map((r) => `Get ${r.quantity} ${r.product_name || r.product}`)
                      .join(", ")}
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
                {(showAllSales ? product.sale_names : product.sale_names.slice(0, 10)).map(
                  (name, index) => (
                    <li
                      key={index}
                      className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600 shadow-sm"
                    >
                      {name}
                    </li>
                  )
                )}
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
