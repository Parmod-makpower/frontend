import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSchemes } from "../hooks/useSchemes";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useAuth } from "../context/AuthContext";
import { useStock } from "../context/StockContext";
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
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import MobilePageHeader from "../components/MobilePageHeader";

export default function ProductDetailPage() {
  const { user } = useAuth();
  const { productId } = useParams();
  const navigate = useNavigate();
  const { getStockValue } = useStock();
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


  const currentStock = getStockValue(product);
  const outOfStock = currentStock <= product.moq;


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

  const formatGuaranteeForRole = (guarantee, role) => {
    if (!guarantee || guarantee === "nan") return "";

    // DS ke alawa sab ke liye same
    if (role !== "DS") return guarantee;

    // number extract karo (6, 9, 12 etc.)
    const match = guarantee.match(/\d+/);

    // agar number hi nahi mila (eg: LIFETIME)
    if (!match) return guarantee;

    const originalValue = parseInt(match[0], 10);
    const updatedValue = Math.max(originalValue - 3, 0);

    // sirf number replace karo, text same rahe
    return guarantee.replace(match[0], updatedValue.toString());
  };


  return (
    <div className=" pb-28">
      <MobilePageHeader title={product.product_name} />
      {/* Product container */}
      <div className="max-w-6xl mx-auto bg-white md:rounded-lg p-4 md:p-8 pt-[60px] sm:pt-0 pb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
          {/* Left: Product Image Slider with Zoom */}
          <div className="relative flex flex-col items-center border py-2 rounded-md ">
            <PhotoProvider>
              <PhotoView src={images[currentIndex]}>
                <img
                  src={images[currentIndex]}
                  alt={product.product_name}
                  className="w-full max-h-[400px] md:max-h-[300px] object-contain rounded-lg cursor-zoom-in"
                  onError={(e) => (e.target.src = makpower_image)}
                />
              </PhotoView>
            </PhotoProvider>

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
            <div className="flex flex-col gap-1">
              <h1 className="text-lg md:text-2xl font-semibold text-gray-900 leading-snug">
                {product.product_name}{product.product_type && (<span> / {product.product_type}</span>)}
              </h1>

              <p className="text-xs text-gray-500">
                Category: {product.sub_category || "N/A"}
              </p>
            </div>
            {user?.role !== "DS" && (
            
            <div className="flex items-center gap-2">
              {!outOfStock ? (
                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                  <FaCheckCircle /> In Stock
                </span>
              ) : (
                <span className="bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                  <FaTimesCircle /> Out of Stock
                </span>
              )}
            </div>
            )}
            {/* Price */}
            <div className="flex items-center gap-3">
              {!isNaN(product.price) ? (
                <>
                  <span className="text-2xl font-bold text-gray-900 flex items-center">
                    <FaIndianRupeeSign className="text-lg" />
                    {product.price}
                  </span>

                  <span className="text-green-600 text-sm font-medium">
                    Best Price
                  </span>
                </>
              ) : (
                <span className="flex items-center gap-1 text-red-500">
                  <FaBan /> Price not Available
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Carton Size", value: product.cartoon_size },
                { label: "Guarantee", value: formatGuaranteeForRole(product.guarantee, user?.role) },
                { label: "MAH", value: product.mah ? `${product.mah} mah` : null },
              ]
                .filter(item => item.value)
                .map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 border hover:shadow-sm transition">
                    <p className="text-[10px] text-gray-500">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                  </div>
                ))}
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

      {(user?.role === "SS" || user?.role === "DS" || user?.role === "ASM") && (
        <div className="left-0 w-full bg-white p-3 flex gap-3 z-50 border-t ">
          {!isInCart ? (
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white text-sm font-semibold py-3 rounded-lg shadow-lg"
            >
              <FaShoppingCart /> Add to Cart
            </button>
          ) : (
            <div className="flex-1 flex flex-col gap-2">
              {(() => {
                const isDS = user?.role === "DS";
                const moq = selectedItem.moq || 1;

                // 🟧 SS ONLY — Cartoon dropdown
                if (selectedItem.quantity_type === "CARTOON" && !isDS) {
                  return (
                    <select
                      value={cartoonSelection[selectedItem.id] || 1}
                      onChange={(e) =>
                        updateCartoon(selectedItem.id, parseInt(e.target.value))
                      }
                      className="w-full border rounded py-2 px-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    >
                      {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} Carton = {n * (product.cartoon_size || 1)} Pcs
                        </option>
                      ))}
                    </select>
                  );
                }

                // 🟩 DS + SS — Normal Quantity Input
                return (
                  <input
                    type="number"
                    min={1}
                    value={selectedItem.quantity || ""}
                    onChange={(e) => {
                      const val = e.target.value;

                      // empty typing allowed
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
                      // 🟢 DS → NO MOQ auto fix
                      if (isDS) return;

                      // 🔵 SS → MOQ strict
                      const parsed = parseInt(e.target.value);
                      if (isNaN(parsed) || parsed < moq) {
                        updateQuantity(selectedItem.id, moq);
                      }
                    }}
                    className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                );
              })()}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
