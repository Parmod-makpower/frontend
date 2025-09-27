import {
  FaShoppingCart,
  FaGift,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaBan } from "react-icons/fa6";
import makpower_image from "../assets/images/makpower_image.webp";

export default function ProductCard({
  prod,
  hasScheme,
  user,
  selectedProducts,
  addProduct,
  cardWidth = "w-40",
}) {
  const navigate = useNavigate();
  const prodId = prod.id ?? prod.product_id;

  const isInCart = selectedProducts.some((p) => p.id === prodId);

  const [imgSrc, setImgSrc] = useState(
    prod?.image
      ? `https://res.cloudinary.com/djyr368zj/${prod.image}?f_auto,q_auto,w_300`
      : makpower_image
  );

  const handleAddToCart = () => {
    addProduct({ ...prod, id: prodId }, 1);
  };

  return (
    <div
      key={prodId}
      className={`flex-shrink-0 ${cardWidth} md:w-full bg-white rounded-xl shadow-md transition-all duration-300 overflow-hidden flex flex-col group mb-2`}
    >
      {/* Image */}
      <div
        className="relative w-full overflow-hidden bg-gray-200"
        onClick={() => navigate(`/product/${prodId}`)}
      >
        <img
          src={imgSrc}
          alt={prod.product_name}
          loading="lazy"
          className="w-full md:h-full object-cover cursor-pointer transform group-hover:scale-105 transition duration-300"
          onError={() => setImgSrc(makpower_image)}
        />

        {hasScheme(prodId) && (
          <span className="absolute top-2 right-2 bg-pink-100 p-1.5 md:p-2 rounded-full shadow">
            <FaGift className="text-[#f43f5e] animate-bounce text-xs md:text-sm" />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-2 md:p-4">
        <h3 className="text-xs md:text-sm font-bold text-gray-800 truncate">
          {prod.product_name}
        </h3>

        <div className="flex items-center gap-1 mt-1">
          {prod.virtual_stock > prod.moq ? (
            <span className="flex items-center gap-1 text-[#16a34a] text-[10px] md:text-xs font-semibold">
              <FaCheckCircle /> In Stock
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[#dc2626] text-[10px] md:text-xs font-semibold">
              <FaTimesCircle /> Out
            </span>
          )}
        </div>

        <p className="font-semibold text-sm mt-1">
          {prod.price !== null && prod.price !== undefined && !isNaN(prod.price) ? (
            `₹${prod.price}`
          ) : (
            <span className="flex items-center gap-1 text-red-500 text-xs">
              <FaBan /> Price
            </span>
          )}
        </p>

        {/* ✅ Cart Button - अब हमेशा "Added" दिखेगा जब तक product cart में है */}
        <div className="mt-auto">
          {user?.role === "SS" && (
            <button
              onClick={(e) => {
                if (prod.virtual_stock <= prod.moq || isInCart) return;
                e.stopPropagation();
                handleAddToCart();
              }}
              disabled={prod.virtual_stock <= prod.moq}
              className={`w-full mt-2 flex items-center justify-center gap-2 
                ${isInCart ? "bg-gray-600" : "bg-gradient-to-r from-orange-500 via-red-500 to-pink-600"}
                hover:opacity-90 text-white text-[11px] md:text-sm font-semibold 
                py-2 md:py-3 rounded-xl shadow-lg transition-all duration-300
                ${prod.virtual_stock <= prod.moq ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {prod.virtual_stock <= prod.moq
                ? "Out of Stock"
                : isInCart
                  ? (
                    < >
                      <FaCheckCircle className="text-sm md:text-base " />
                      Added
                    </>
                  )
                  : (
                    <>
                      <FaShoppingCart className="text-sm md:text-base animate-bounce" />
                      Add to Cart
                    </>
                  )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
