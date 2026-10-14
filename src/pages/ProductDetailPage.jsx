// import { useParams, useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { useCachedProducts } from "../hooks/useCachedProducts";
// import { useSchemes } from "../hooks/useSchemes";
// import { useSelectedProducts } from "../hooks/useSelectedProducts";
// import { useAuth } from "../context/AuthContext";
// import { useStock } from "../context/StockContext";
// import {
//   FaGift,
//   FaCheckCircle,
//   FaTimesCircle,
//   FaShoppingCart,
//   FaBan,
// } from "react-icons/fa";
// import { FaIndianRupeeSign } from "react-icons/fa6";
// import Zoom from "react-medium-image-zoom";
// import "react-medium-image-zoom/dist/styles.css";
// import makpower_image from "../assets/images/makpower_image.webp";
// import { PhotoProvider, PhotoView } from "react-photo-view";
// import "react-photo-view/dist/react-photo-view.css";
// import MobilePageHeader from "../components/MobilePageHeader";

// export default function ProductDetailPage() {
//   const { user } = useAuth();
//   const { productId } = useParams();
//   const navigate = useNavigate();
//   const { getStockValue } = useStock();
//   const { data: allProductsRaw = [], isLoading: isProductLoading } = useCachedProducts();
//   const { data: schemes = [], isLoading: isSchemeLoading } = useSchemes();
//   const {
//     selectedProducts,
//     addProduct,
//     updateQuantity,
//     updateCartoon,
//     cartoonSelection,
//   } = useSelectedProducts();

//   const [product, setProduct] = useState(null);
//   const [showAllSales, setShowAllSales] = useState(false);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     if (allProductsRaw.length > 0) {
//       const normalized = allProductsRaw.map((p) => ({ ...p, id: p.id ?? p.product_id }));
//       const found = normalized.find((p) => p.id === parseInt(productId));
//       setProduct(found);
//     }
//   }, [allProductsRaw, productId]);


//   if (isProductLoading || !product || isSchemeLoading)
//     return <div className="p-6 text-center">Loading...</div>;

//   const relatedSchemes = schemes.filter(
//     (scheme) =>
//       scheme.conditions.some(
//         (c) => c.product === product.id || c.product_name === product.product_name
//       ) ||
//       scheme.rewards.some(
//         (r) => r.product === product.id || r.product_name === product.product_name
//       )
//   );

//   const selectedItem = selectedProducts.find((p) => p.id === product.id);
//   const isInCart = !!selectedItem;

//   const handleAddToCart = () => {
//     if (!isInCart) {
//       const moq = product.moq || 1;
//       const initialQty =
//         product.cartoon_size && product.cartoon_size > 1 ? product.cartoon_size : moq;
//       addProduct({ ...product, id: product.id, quantity: initialQty });
//     }
//   };


//   const currentStock = getStockValue(product);
//   const outOfStock = currentStock <= product.moq;


//   const images = [
//     product?.image
//       ? `https://res.cloudinary.com/djyr368zj/${product.image}?f_auto,q_auto,w_600,dpr_auto`
//       : makpower_image,
//     product?.image2
//       ? `https://res.cloudinary.com/djyr368zj/${product.image2}?f_auto,q_auto,w_600,dpr_auto`
//       : null,
//   ].filter(Boolean);


//   const handleNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);
//   const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

//   const formatGuaranteeForRole = (guarantee, role) => {
//     if (!guarantee || guarantee === "nan") return "";

//     // DS ke alawa sab ke liye same
//     if (role !== "DS") return guarantee;

//     // number extract karo (6, 9, 12 etc.)
//     const match = guarantee.match(/\d+/);

//     // agar number hi nahi mila (eg: LIFETIME)
//     if (!match) return guarantee;

//     const originalValue = parseInt(match[0], 10);
//     const updatedValue = Math.max(originalValue - 3, 0);

//     // sirf number replace karo, text same rahe
//     return guarantee.replace(match[0], updatedValue.toString());
//   };


//   return (
//     <div className=" pb-28">
//       <MobilePageHeader title={product.product_name} />
//       {/* Product container */}
//       <div className="max-w-6xl mx-auto bg-white md:rounded-lg p-4 md:p-8 pt-[65px] sm:pt-0 pb-5">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
//           {/* Left: Product Image Slider with Zoom */}
//           <div className="relative flex flex-col items-center border py-2 rounded-md ">
//             <PhotoProvider>
//               <PhotoView src={images[currentIndex]}>
//                 <img
//                   src={images[currentIndex]}
//                   alt={product.product_name}
//                   className="w-full max-h-[400px] md:max-h-[300px] object-contain rounded-lg cursor-zoom-in"
//                   onError={(e) => (e.target.src = makpower_image)}
//                 />
//               </PhotoView>
//             </PhotoProvider>

//             {images.length > 1 && (
//               <>
//                 <button
//                   onClick={handlePrev}
//                   className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full shadow"
//                 >
//                   ❮
//                 </button>
//                 <button
//                   onClick={handleNext}
//                   className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full shadow"
//                 >
//                   ❯
//                 </button>
//                 <div className="flex gap-2 mt-4 overflow-x-auto">
//                   {images.map((img, index) => (
//                     <img
//                       key={index}
//                       src={img}
//                       alt={`thumb-${index}`}
//                       onClick={() => setCurrentIndex(index)}
//                       className={`w-16 h-16 object-cover rounded-md cursor-pointer border ${currentIndex === index ? "border-blue-500" : "border-gray-200"
//                         }`}
//                     />
//                   ))}
//                 </div>
//               </>
//             )}

//             {relatedSchemes.length > 0 && (
//               <span className="absolute top-4 right-4 bg-pink-100 p-3 rounded-full shadow">
//                 <FaGift className="text-[#f43f5e] animate-bounce" title="Scheme Available" />
//               </span>
//             )}
//           </div>

//           {/* Right: Product Details */}
//           <div className="flex flex-col gap-4 px-1">
//             <div className="flex flex-col gap-1">
//               <h1 className="text-lg md:text-2xl font-semibold text-gray-900 leading-snug">
//                 {product.product_name}{product.product_type && (<span> / {product.product_type}</span>)}
//               </h1>

//               <p className="text-xs text-gray-500">
//                 Category: {product.sub_category || "N/A"}
//               </p>
//             </div>
          
//             <div className="flex items-center gap-2">
//               {!outOfStock ? (
//                 <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
//                   <FaCheckCircle /> In Stock
//                 </span>
//               ) : (
//                 <span className="bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
//                   <FaTimesCircle /> Out of Stock
//                 </span>
//               )}
//             </div>
           
//             {/* Price */}
//             <div className="flex items-center gap-3">
//               {!isNaN(product.price) ? (
//                 <>
//                   <span className="text-2xl font-bold text-gray-900 flex items-center">
//                     <FaIndianRupeeSign className="text-lg" />
//                     {product.price}
//                   </span>

//                   <span className="text-green-600 text-sm font-medium">
//                     Best Price
//                   </span>
//                 </>
//               ) : (
//                 <span className="flex items-center gap-1 text-red-500">
//                   <FaBan /> Price not Available
//                 </span>
//               )}
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//               {[
//                 { label: "Carton Size", value: product.cartoon_size },
//                 { label: "Guarantee", value: formatGuaranteeForRole(product.guarantee, user?.role) },
//                 { label: "MAH", value: product.mah ? `${product.mah} mah` : null },
//               ]
//                 .filter(item => item.value)
//                 .map((item, i) => (
//                   <div key={i} className="bg-gray-50 rounded-xl p-3 border hover:shadow-sm transition">
//                     <p className="text-[10px] text-gray-500">{item.label}</p>
//                     <p className="text-sm font-semibold text-gray-800">{item.value}</p>
//                   </div>
//                 ))}
//             </div>

//             {/* Schemes */}
//             {relatedSchemes.length > 0 && (
//               <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                 <h3 className="flex items-center gap-2 text-green-800 font-semibold">
//                   <FaGift className="text-pink-500" /> Available Schemes
//                 </h3>
//                 <ul className="list-disc ml-6 mt-2 space-y-1 text-gray-700">
//                   {relatedSchemes.map((scheme) => (
//                     <li key={scheme.id}>
//                       {scheme.conditions
//                         .map((c) => `Buy ${c.min_quantity} ${c.product_name || c.product}`)
//                         .join(", ")}{" "}
//                       →{" "}
//                       {scheme.rewards
//                         .map((r) => `Get ${r.quantity} ${r.product_name || r.product}`)
//                         .join(", ")}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             {/* Sale Names */}
//             {product.sale_names?.length > 0 && (
//               <div>
//                 <label className="text-sm font-medium text-gray-500">Available for:</label>
//                 <ul className="flex flex-wrap gap-2 mt-2">
//                   {(showAllSales ? product.sale_names : product.sale_names.slice(0, 10)).map(
//                     (name, index) => (
//                       <li
//                         key={index}
//                         className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600 shadow-sm"
//                       >
//                         {name}
//                       </li>
//                     )
//                   )}
//                 </ul>

//                 {product.sale_names.length > 10 && (
//                   <button
//                     onClick={() => setShowAllSales(!showAllSales)}
//                     className="mt-2 text-xs text-blue-600 hover:underline"
//                   >
//                     {showAllSales ? "Show Less" : `+${product.sale_names.length - 10} More`}
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {(user?.role === "SS" || user?.role === "DS" || user?.role === "ASM") && (
//         <div className="left-0 w-full bg-white p-3 flex gap-3 z-50 border-t ">
//           {!isInCart ? (
//             <button
//               onClick={handleAddToCart}
//               className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white text-sm font-semibold py-3 rounded-lg shadow-lg"
//             >
//               <FaShoppingCart /> Add to Cart
//             </button>
//           ) : (
//             <div className="flex-1 flex flex-col gap-2">
//               {(() => {
//                 const isDS = user?.role === "DS";
//                 const moq = selectedItem.moq || 1;

//                 // 🟧 SS ONLY — Cartoon dropdown
//                 if (selectedItem.quantity_type === "CARTOON" && !isDS) {
//                   return (
//                     <select
//                       value={cartoonSelection[selectedItem.id] || 1}
//                       onChange={(e) =>
//                         updateCartoon(selectedItem.id, parseInt(e.target.value))
//                       }
//                       className="w-full border rounded py-2 px-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
//                     >
//                       {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => (
//                         <option key={n} value={n}>
//                           {n} Carton = {n * (product.cartoon_size || 1)} Pcs
//                         </option>
//                       ))}
//                     </select>
//                   );
//                 }

//                 // 🟩 DS + SS — Normal Quantity Input
//                 return (
//                   <input
//                     type="number"
//                     min={1}
//                     value={selectedItem.quantity || ""}
//                     onChange={(e) => {
//                       const val = e.target.value;

//                       // empty typing allowed
//                       if (val === "") {
//                         updateQuantity(selectedItem.id, "");
//                         return;
//                       }

//                       const parsed = parseInt(val);
//                       if (!isNaN(parsed)) {
//                         updateQuantity(selectedItem.id, parsed);
//                       }
//                     }}
//                     onBlur={(e) => {
//                       // 🟢 DS → NO MOQ auto fix
//                       if (isDS) return;

//                       // 🔵 SS → MOQ strict
//                       const parsed = parseInt(e.target.value);
//                       if (isNaN(parsed) || parsed < moq) {
//                         updateQuantity(selectedItem.id, moq);
//                       }
//                     }}
//                     className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
//                   />
//                 );
//               })()}
//             </div>
//           )}
//         </div>
//       )}

//     </div>
//   );
// }




import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

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

import makpower_image from "../assets/images/makpower_image.webp";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

import MobilePageHeader from "../components/MobilePageHeader";

const ECO_IMAGES = [
  "https://res.cloudinary.com/djyr368zj/image/upload/v1791996476/g6ejornafsenhfatpbrq.webp",
  "https://res.cloudinary.com/djyr368zj/image/upload/v1791996482/b0zcbjmwyjdgf9excm6m.webp",
];

const TEMPERED_IMAGE =
  "https://millioncases.in/cdn/shop/files/202409210456232788_1_b62ebb07-fdcd-4ffc-a9b5-b1e58788a94c.webp?v=1726894738&width=1946";

const POLYMER_IMAGES = [
  "https://res.cloudinary.com/djyr368zj/image/upload/v1777007022/veimpnfjfsblvsa2i9z9.webp",
];

function getCloudinaryImage(image) {
  if (!image) return null;

  // Full URLs ko dobara Cloudinary URL ke andar wrap na karein.
  if (/^https?:\/\//i.test(image)) return image;

  return `https://res.cloudinary.com/djyr368zj/${String(image).replace(/^\/+/, "")}?f_auto,q_auto,w_800,dpr_auto`;
}

function getProductImages(product) {
  const category = String(product?.sub_category || "").toLowerCase();

  // Special image rules apply only to matching categories.
  if (category.includes("eco battery")) {
    return ECO_IMAGES;
  }

  if (category.includes("tempered")) {
    return [TEMPERED_IMAGE];
  }

  if (category.includes("polymer")) {
    return POLYMER_IMAGES;
  }

  // All other products retain their own original images.
  const image1 = getCloudinaryImage(product?.image) || makpower_image;
  const image2 = getCloudinaryImage(product?.image2);

  return image2 ? [image1, image2] : [image1];
}

export default function ProductDetailPage() {
  const { user } = useAuth();
  const { productId } = useParams();
  const { getStockValue } = useStock();

  const { data: allProductsRaw = [], isLoading: isProductLoading } =
    useCachedProducts();

  const { data: schemes = [], isLoading: isSchemeLoading } = useSchemes();

  const {
    selectedProducts,
    addProduct,
    updateQuantity,
    updateCartoon,
    cartoonSelection,
  } = useSelectedProducts();

  const [showAllSales, setShowAllSales] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const product = useMemo(() => {
    const id = Number(productId);

    return allProductsRaw.find(
      (item) => Number(item.id ?? item.product_id) === id
    ) || null;
  }, [allProductsRaw, productId]);

  useEffect(() => {
    setCurrentIndex(0);
    setShowAllSales(false);
  }, [productId]);

  const relatedSchemes = useMemo(() => {
    if (!product) return [];

    return schemes.filter(
      (scheme) =>
        scheme.conditions?.some(
          (condition) =>
            Number(condition.product) === Number(product.id ?? product.product_id) ||
            condition.product_name === product.product_name
        ) ||
        scheme.rewards?.some(
          (reward) =>
            Number(
              typeof reward.product === "object"
                ? reward.product?.id
                : reward.product
            ) === Number(product.id ?? product.product_id) ||
            reward.product_name === product.product_name
        )
    );
  }, [schemes, product]);

  const productIdValue = product
    ? Number(product.id ?? product.product_id)
    : null;

  const selectedItem = selectedProducts.find(
    (item) => Number(item.id ?? item.product_id) === productIdValue
  );

  const isInCart = Boolean(selectedItem);

  const images = useMemo(
    () => (product ? getProductImages(product) : [makpower_image]),
    [product]
  );

  useEffect(() => {
    if (currentIndex >= images.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, images.length]);

  if (isProductLoading || isSchemeLoading) {
    return (
      <div className="min-h-[60vh] bg-slate-50 px-4 pt-24 text-center text-sm text-slate-500">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] bg-slate-50 px-4 pt-24 text-center">
        <p className="font-semibold text-slate-800">Product not found</p>
        <p className="mt-1 text-sm text-slate-500">
          This product may no longer be available.
        </p>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (isInCart) return;

    const moq = Number(product.moq) || 1;
    const cartonSize = Number(product.cartoon_size) || 1;

    const initialQty =
      product.quantity_type === "CARTOON" && user?.role !== "DS"
        ? cartonSize
        : cartonSize > 1
          ? cartonSize
          : moq;

    addProduct({
      ...product,
      id: productIdValue,
      quantity: initialQty,
    });
  };

  const currentStock = Number(getStockValue(product)) || 0;
  const outOfStock = currentStock <= (Number(product.moq) || 0);

  const handleNext = () => {
    setCurrentIndex((previous) => (previous + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (previous) => (previous - 1 + images.length) % images.length
    );
  };

  const formatGuaranteeForRole = (guarantee, role) => {
    if (!guarantee || String(guarantee).toLowerCase() === "nan") return "";

    if (role !== "DS") return guarantee;

    const match = String(guarantee).match(/\d+/);
    if (!match) return guarantee;

    const originalValue = parseInt(match[0], 10);
    const updatedValue = Math.max(originalValue - 3, 0);

    return String(guarantee).replace(match[0], updatedValue.toString());
  };

  const details = [
    { label: "Carton Size", value: product.cartoon_size },
    {
      label: "Guarantee",
      value: formatGuaranteeForRole(product.guarantee, user?.role),
    },
    {
      label: "MAH",
      value: product.mah ? `${product.mah} mah` : null,
    },
  ].filter(
    (item) =>
      item.value !== null &&
      item.value !== undefined &&
      String(item.value).trim() !== ""
  );

  const canOrder = ["SS", "DS", "ASM"].includes(user?.role);
  const isDS = user?.role === "DS";

  return (
    <div className="min-h-screen bg-slate-50 pb-8 text-slate-900">
      <MobilePageHeader title={product.product_name} />

      <main className="mx-auto w-full max-w-6xl px-3 pb-6 pt-[68px] sm:px-5 sm:pt-5 md:px-6">
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 md:gap-6">
          {/* Product gallery */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
            <div className="relative flex h-[310px] items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white sm:h-[400px] md:h-[370px]">
              <PhotoProvider>
                <PhotoView src={images[currentIndex]}>
                  <img
                    key={images[currentIndex]}
                    src={images[currentIndex]}
                    alt={product.product_name}
                    loading="eager"
                    onError={(event) => {
                      if (event.currentTarget.src !== makpower_image) {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = makpower_image;
                      }
                    }}
                    className="h-full w-full cursor-zoom-in object-contain p-2 transition-opacity duration-200 sm:p-4"
                  />
                </PhotoView>
              </PhotoProvider>

              <div className="absolute left-3 top-3 rounded-full border border-slate-100 bg-white/95 px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-sm">
                {currentIndex + 1} / {images.length}
              </div>

              <PhotoProvider>
                <PhotoView src={images[currentIndex]}>
                  <button
                    type="button"
                    className="absolute bottom-3 right-3 rounded-full border border-slate-200 bg-white/95 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    View image
                  </button>
                </PhotoView>
              </PhotoProvider>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/60 text-xl text-white shadow-md transition hover:bg-slate-900/80 active:scale-95"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/60 text-xl text-white shadow-md transition hover:bg-slate-900/80 active:scale-95"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex justify-center gap-2 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Show image ${index + 1}`}
                    className={`h-[68px] w-[68px] shrink-0 overflow-hidden rounded-xl border-2 bg-white p-1 transition ${
                      currentIndex === index
                        ? "border-orange-500 shadow-sm"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.product_name} ${index + 1}`}
                      loading="lazy"
                      className="h-full w-full object-contain"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = makpower_image;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {relatedSchemes.length > 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-pink-100 bg-pink-50 px-3 py-2 text-sm font-medium text-pink-700">
                <FaGift />
                Special scheme available for this product
              </div>
            )}
          </section>

          {/* Product information */}
          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-700">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              Product Details
            </div>

            <h1 className="break-words text-xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-2xl">
              {product.product_name}
              {product.product_type && (
                <span className="font-semibold text-slate-600">
                  {" "}
                  / {product.product_type}
                </span>
              )}
            </h1>

            <p className="mt-2 text-xs text-slate-500">
              Category:{" "}
              <span className="font-semibold text-slate-700">
                {product.sub_category || "N/A"}
              </span>
            </p>

            <div className="mt-4">
              {outOfStock ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-red-100">
                  <FaTimesCircle />
                  Out of Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  <FaCheckCircle />
                  In Stock
                </span>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 border-b border-slate-100 pb-5">
              {!isNaN(Number(product.price)) &&
              product.price !== null &&
              product.price !== "" ? (
                <>
                  <span className="flex items-center text-3xl font-extrabold tracking-tight text-slate-900">
                    <FaIndianRupeeSign className="mr-0.5 text-xl" />
                    {product.price}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                    Best Price
                  </span>
                </>
              ) : (
                <span className="flex items-center gap-2 text-sm font-medium text-red-500">
                  <FaBan />
                  Price not available
                </span>
              )}
            </div>

            {details.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {details.map((item) => (
                  <div
                    key={item.label}
                    className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 p-3 transition-colors hover:bg-slate-50"
                  >
                    <p className="text-[10px] font-medium text-slate-500 sm:text-xs">
                      {item.label}
                    </p>
                    <p className="mt-1 break-words text-sm font-bold text-slate-900">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {relatedSchemes.length > 0 && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                <h2 className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                  <FaGift className="text-pink-500" />
                  Available Schemes
                </h2>

                <ul className="mt-3 space-y-2">
                  {relatedSchemes.map((scheme, index) => (
                    <li
                      key={scheme.id ?? index}
                      className="text-xs leading-relaxed text-slate-700"
                    >
                      {scheme.conditions
                        ?.map(
                          (condition) =>
                            `Buy ${condition.min_quantity} ${
                              condition.product_name || condition.product
                            }`
                        )
                        .join(", ")}{" "}
                      <span className="font-bold text-emerald-700">→</span>{" "}
                      {scheme.rewards
                        ?.map(
                          (reward) =>
                            `Get ${reward.quantity} ${
                              reward.product_name || reward.product
                            }`
                        )
                        .join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.sale_names?.length > 0 && (
              <div className="mt-5">
                <h2 className="text-xs font-semibold text-slate-500">
                  Available for
                </h2>

                <ul className="mt-2 flex flex-wrap gap-2">
                  {(showAllSales
                    ? product.sale_names
                    : product.sale_names.slice(0, 10)
                  ).map((name, index) => (
                    <li
                      key={`${name}-${index}`}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-600"
                    >
                      {name}
                    </li>
                  ))}
                </ul>

                {product.sale_names.length > 10 && (
                  <button
                    type="button"
                    onClick={() => setShowAllSales((previous) => !previous)}
                    className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {showAllSales
                      ? "Show less"
                      : `+${product.sale_names.length - 10} more`}
                  </button>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Cart controls remain in normal page flow, not fixed on mobile. */}
        {canOrder && (
          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            {!isInCart ? (
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 px-5 py-3 text-sm font-bold text-white shadow-md transition duration-150 hover:brightness-105 active:scale-[0.99]"
              >
                <FaShoppingCart />
                Add to Cart
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <FaCheckCircle />
                  Added to Cart
                </div>

                {selectedItem.quantity_type === "CARTOON" && !isDS ? (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">
                      Select cartons
                    </label>

                    <select
                      value={cartoonSelection[selectedItem.id] || 1}
                      onChange={(event) =>
                        updateCartoon(
                          selectedItem.id,
                          parseInt(event.target.value, 10)
                        )
                      }
                      className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >
                      {Array.from({ length: 100 }, (_, index) => index + 1).map(
                        (number) => (
                          <option key={number} value={number}>
                            {number} Carton ={" "}
                            {number * (Number(product.cartoon_size) || 1)} Pcs
                          </option>
                        )
                      )}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">
                      Quantity
                    </label>

                    <input
                      type="number"
                      min={1}
                      value={selectedItem.quantity ?? ""}
                      onChange={(event) => {
                        const value = event.target.value;

                        if (value === "") {
                          updateQuantity(selectedItem.id, "");
                          return;
                        }

                        const parsed = parseInt(value, 10);
                        if (!Number.isNaN(parsed)) {
                          updateQuantity(selectedItem.id, parsed);
                        }
                      }}
                      onBlur={(event) => {
                        // Keep the existing DS quantity behavior.
                        if (isDS) return;

                        const parsed = parseInt(event.target.value, 10);
                        const moq = Number(selectedItem.moq) || 1;

                        if (Number.isNaN(parsed) || parsed < moq) {
                          updateQuantity(selectedItem.id, moq);
                        }
                      }}
                      className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
