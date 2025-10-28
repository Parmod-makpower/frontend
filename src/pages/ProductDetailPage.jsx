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
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import makpower_image from "../assets/images/makpower_image.webp";

export default function ProductDetailPage() {
  const { user } = useAuth();
  const { productId } = useParams();
  const navigate = useNavigate();

  const { data: allProductsRaw = [], isLoading: isProductLoading } = useCachedProducts();
  const { data: schemes = [], isLoading: isSchemeLoading } = useSchemes();
  const {
    selectedProducts,
    addProduct,
    updateQuantity,
    updateCartoon,
    cartoonSelection,
  } = useSelectedProducts();

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

  const selectedItem = selectedProducts.find((p) => p.id === product.id);
  const isInCart = !!selectedItem;

  const handleAddToCart = () => {
    if (!isInCart) {
      const moq = product.moq || 1;
      const initialQty =
        product.cartoon_size && product.cartoon_size > 1 ? product.cartoon_size : moq;
      addProduct({ ...product, id: product.id, quantity: initialQty });
    }
  };

  const images = [
    product?.image
      ? `https://res.cloudinary.com/djyr368zj/${product.image}?f_auto,q_auto,w_600,dpr_auto`
      : makpower_image,
    product?.image2
      ? `https://res.cloudinary.com/djyr368zj/${product.image2}?f_auto,q_auto,w_600,dpr_auto`
      : null,
  ].filter(Boolean);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className=" pb-28">
      {/* Product container */}
      <div className="max-w-6xl mx-auto bg-white md:rounded-lg p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
          {/* Left: Product Image Slider with Zoom */}
          <div className="relative flex flex-col items-center border py-2 rounded-md ">
            <Zoom>
              <img
                src={images[currentIndex]}
                alt={product.product_name}
                className="w-full max-h-[400px] md:max-h-[300px] object-contain rounded-lg cursor-zoom-in"
                onError={(e) => (e.target.src = makpower_image)}
              />
            </Zoom>

            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full shadow"
                >
                  ❮
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full shadow"
                >
                  ❯
                </button>
                <div className="flex gap-2 mt-4 overflow-x-auto">
                  {images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`thumb-${index}`}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-16 h-16 object-cover rounded-md cursor-pointer border ${currentIndex === index ? "border-blue-500" : "border-gray-200"
                        }`}
                    />
                  ))}
                </div>
              </>
            )}

            {relatedSchemes.length > 0 && (
              <span className="absolute top-4 right-4 bg-pink-100 p-3 rounded-full shadow">
                <FaGift className="text-[#f43f5e] animate-bounce" title="Scheme Available" />
              </span>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col gap-4 px-1">
            <h2 className="text-xl md:text-3xl font-bold text-gray-800">
              {product.product_name}
            </h2>

            {/* Stock */}
            <div className="flex items-center gap-2">
              {product.virtual_stock > product.moq ? (
                <span className="flex items-center gap-2 text-green-600 font-semibold">
                  <FaCheckCircle /> In Stock
                </span>
              ) : (
                <span className="flex items-center gap-2 text-red-600 font-semibold">
                  <FaTimesCircle /> Out of Stock
                </span>
              )}
            </div>

            {/* Price */}
            <p className="font-semibold text-lg">
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
            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg shadow-sm">
              <div>
                <p className="font-medium text-gray-500">Category</p>
                <p className="text-gray-800">{product.sub_category || "N/A"}</p>
              </div>
              {product.cartoon_size != null && product.cartoon_size !== "" && (
                <div>
                  <p className="font-medium text-gray-500">Cartoon Size</p>
                  <p className="text-gray-800">{product.cartoon_size || "-"}</p>
                </div>
              )}
              {product.guarantee != null && product.guarantee !== "nan" && (
                <div>
                  <p className="font-medium text-gray-500">Guarantee</p>
                  <p className="text-gray-800">{product.guarantee}</p>
                </div>
              )}

            </div>

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

      {/* ✅ Sticky Bottom Add to Cart Bar with Quantity / Cartoon Handling */}
      {user?.role === "SS" && (
        <div className="left-0 w-full bg-white p-3 flex gap-3 z-50">
          {product.sub_category === "GIFT ITEM" || product.sub_category === "Z GIFT ITEM" ? (
           <></>
          ) : !isInCart ? (
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white text-sm font-semibold py-3 rounded-lg shadow-lg transition-all duration-300"
            >
              <FaShoppingCart className="animate-bounce" /> Add to Cart
            </button>
          ) : (
            <div className="flex-1 flex flex-col gap-2">
              {selectedItem.quantity_type == "CARTOON" ? (
                <select
                  value={cartoonSelection[selectedItem.id] || 1}
                  onChange={(e) => updateCartoon(selectedItem.id, parseInt(e.target.value))}
                  className="w-full border rounded py-2 px-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} Cartoon
                    </option>
                  ))}
                </select>

              ) : (
                <input
                  type="number"
                  min={1}
                  value={selectedItem.quantity || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      updateQuantity(selectedItem.id, "");
                      return;
                    }
                    const parsed = parseInt(val);
                    if (!isNaN(parsed)) {
                      updateQuantity(selectedItem.id, parsed);
                    }
                  }}
                  onBlur={(e) => {
                    const val = parseInt(e.target.value);
                    const moq = selectedItem.moq || 1;
                    if (isNaN(val) || val < moq) {
                      updateQuantity(selectedItem.id, moq);
                    }
                  }}
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
