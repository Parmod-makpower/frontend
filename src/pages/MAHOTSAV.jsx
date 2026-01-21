// 📁 src/pages/MAHOTSAV.jsx
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaFire } from "react-icons/fa";
import makpower_image from "../assets/images/makpower_image.webp";
import MobilePageHeader from "../components/MobilePageHeader";
import { useStock } from "../context/StockContext";


export default function MAHOTSAV() {
  const { data: allProducts = [], isLoading } = useCachedProducts();
  const { selectedProducts, addProduct } = useSelectedProducts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getStockValue } = useStock();

  // ✅ Mahotsav Products
  const PRODUCT_IDS = [
    101, 143, 141, 123, 74, 67, 73, 79, 76, 1215,
    31, 17, 28, 27, 14, 21, 16,
    1119, 1132, 1120, 1131, 1125, 1121, 1128, 1139,
    1644, 1144, 1729,
  ];

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading Mahotsav Products...</div>;
  }

  const products = allProducts.filter((p) =>
    PRODUCT_IDS.includes(p.product_id)
  );

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <MobilePageHeader title="Makpower Mahotsav" />

      {/* 🎉 Banner */}
      {/* 🎉 Mahotsav Banner */}
<div className="pt-[65px] sm:pt-0 px-3">
  <div className="
    rounded-2xl 
    bg-gradient-to-br from-pink-500 via-fuchsia-500 to-rose-600
    p-5 
    text-white 
    shadow-xl 
    relative 
    overflow-hidden
  ">

    {/* Decorative circles */}
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
    <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/10 rounded-full" />

    {/* Header */}
    <h1 className="text-xl font-extrabold flex items-center gap-2">
      <FaFire className="animate-pulse text-yellow-300" />
      Mahotsav Scheme 🎉
    </h1>

    {/* Date */}
    <p className="text-sm mt-1 text-white/90">
      🗓 Valid from <b>1 Jan 2026</b> to <b>31 Mar 2026</b>
    </p>

    {/* Divider */}
    <div className="my-3 h-[1px] bg-white/30" />

    {/* Scheme Info */}
    <div className="
      text-sm 
      bg-white/20 
      backdrop-blur-sm 
      px-4 py-3 
      rounded-xl 
      leading-relaxed
    ">
      🛒 Buy <b className="text-yellow-200">300 Quantity</b> of any  
      <b> Mahotsav Product</b>  
      <br />
      🎁 <span className="font-semibold">Get exciting rewards & offers!</span>
    </div>


  </div>
</div>


      {/* 📦 Product Grid */}
      <div className="px-3 mt-6">
        {products.length === 0 ? (
          <p className="text-center text-gray-500">No Mahotsav products found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
            {products.map((prod) => {
              const prodId = prod.id ?? prod.product_id;
              const isInCart = selectedProducts.some((p) => p.id === prodId);
              const stockValue = getStockValue(prod);
              const outOfStock = stockValue <= (prod.moq || 1);


              return (
                <div
                  key={prodId}
                  onClick={() => navigate(`/product/${prod.product_id}`)}
                  className="bg-white rounded-xl border shadow-sm hover:shadow-lg transition cursor-pointer overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative bg-white">
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-2 py-[2px] rounded-full">
                      Mahotsav
                    </span>

                    <img
                      src={
                        prod.image
                          ? `https://res.cloudinary.com/djyr368zj/${prod.image}`
                          : makpower_image
                      }
                      alt={prod.product_name}
                      className="w-full h-[140px] object-contain p-2"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <h3 className="text-xs font-semibold line-clamp-2 min-h-[32px]">
                      {prod.product_name}
                    </h3>

                    {/* Stock */}
                    <div className="flex items-center gap-1 mt-1">
                      {outOfStock ? (
                        <span className="text-red-600 text-[10px] flex items-center gap-1">
                          <FaTimesCircle /> Out of Stock
                        </span>
                      ) : (
                        <span className="text-green-600 text-[10px] flex items-center gap-1">
                          <FaCheckCircle /> In Stock
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <p className="text-blue-600 font-bold text-sm mt-1">
                      ₹{prod.price || 0}
                    </p>

                    {/* Scheme Hint */}
                    <p className="text-[10px] text-gray-500 mt-1">
                      Buy 300 Qty to achieve scheme
                    </p>

                    {/* Cart Button */}
                    {(user?.role === "SS" || user?.role === "DS") && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isInCart) addProduct({ ...prod, id: prodId }, 1);
                        }}
                        disabled={isInCart}
                        className={`w-full mt-3 text-white text-[11px] py-1.5 rounded-full font-semibold transition
                          ${
                            isInCart
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 hover:opacity-90"
                          }`}
                      >
                        {isInCart ? "Added to Cart" : "Add to Cart"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
