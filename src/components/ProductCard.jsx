

import {
  FaShoppingCart,
  FaGift,
  FaCheckCircle,
  FaTimesCircle,
  FaBatteryFull,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaBan } from "react-icons/fa6";
import makpower_image from "../assets/images/makpower_image.webp";
import QuantitySelector from "./QuantitySelector";
import { useStock } from "../context/StockContext";
import { FaShieldAlt } from "react-icons/fa";

export default function ProductCard({
  prod,
  hasScheme,
  user,
  selectedProducts,
  addProduct,
  updateQuantity,
  updateCartoon,
  cartoonSelection,
  cardWidth = "w-40",
  fallbackImage = makpower_image,
}) {
  const navigate = useNavigate();

  const prodId = prod.id ?? prod.product_id;

  const isInCart = selectedProducts.some((p) => p.id === prodId);

  const selectedItem = selectedProducts.find((p) => p.id === prodId);

  const { getStockValue } = useStock();

  const currentStock = getStockValue(prod);

  const outOfStock = currentStock <= (prod.moq || 1);

  const [imgSrc, setImgSrc] = useState(
    prod?.image
      ? `https://res.cloudinary.com/djyr368zj/${prod.image}?f_auto,q_auto,w_300`
      : fallbackImage
  );

  const handleAddProduct = () => {
    if (!isInCart) {
      const moq = prod.moq || 1;

      const initialQty =
        prod.cartoon_size && prod.cartoon_size > 1
          ? prod.cartoon_size
          : moq;

      addProduct({
        ...prod,
        id: prodId,
        quantity: initialQty,
      });
    }
  };

  const getDisplayGuarantee = () => {
    if (!prod?.guarantee) return "";

    const g = String(prod.guarantee).toLowerCase();

    // Lifetime case
    if (g.includes("life")) return prod.guarantee;

    // Extract number
    const num = parseInt(g);

    if (isNaN(num)) return prod.guarantee;

    // DS role → minus 3
    if (user?.role === "DS") {
      const updated = Math.max(0, num - 3);
      return `${updated} months`;
    }

    return `${num} months`;
  };

  return (
    <div
      key={prodId}
      className={`
        flex-shrink-0
        ${cardWidth}
        w-full
        max-w-[230px]
        bg-white
        rounded-xl
        border border-gray-100
        shadow-sm
        hover:shadow-lg
        hover:-translate-y-0.5
        transition-all
        duration-300
        overflow-hidden
        flex
        flex-col
        group
        mb-2
        p-1
      `}
    >
      {/* ================= IMAGE ================= */}
      <div
        className="
          relative
          w-full
          aspect-[4/3]
          overflow-hidden
          bg-gray-200
          cursor-pointer
          rounded
        "
        onClick={() => navigate(`/product/${prodId}`)}
      >
        <img
          src={imgSrc}
          alt={prod.product_name}
          loading="lazy"
          className="
            w-full
            h-full
            object-contain
            p-2
            cursor-pointer
            transform
            group-hover:scale-105
            transition-transform
            duration-300
          "
          onError={() => setImgSrc(makpower_image)}
        />

        {/* Scheme Badge */}
        {hasScheme(prodId) && (
          <span
            className="
              absolute
              top-2
              right-2
              w-7
              h-7
              flex
              items-center
              justify-center
              bg-pink-100
              rounded-full
              shadow-sm
            "
          >
            <FaGift className="text-[#f43f5e] text-xs animate-bounce" />
          </span>
        )}
      </div>

      {/* ================= PRODUCT INFO ================= */}
      <div className="flex flex-col flex-1 px-3 py-2.5">
        {/* Product Name */}
        <h3
          className="
            text-[12px]
            sm:text-[13px]
            font-bold
            text-gray-800
            leading-tight
            truncate
          "
          title={prod.product_name}
        >
          {prod.product_name}

          {prod.product_type && (
            <span className="text-gray-500 font-medium">
              {" "}
              / {prod.product_type}
            </span>
          )}
        </h3>

        {/* Stock */}
        
          <div className="flex items-center mt-1.5">
            {!outOfStock ? (
              <span
                className="
                  inline-flex
                  items-center
                  gap-1
                  text-[10px]
                  font-semibold
                  text-green-600
                "
              >
                <FaCheckCircle className="text-[10px]" />
                In Stock
              </span>
            ) : (
              <span
                className="
                  inline-flex
                  items-center
                  gap-1
                  text-[10px]
                  font-semibold
                  text-red-600
                "
              >
                <FaTimesCircle className="text-[10px]" />
                Out
              </span>
            )}
          </div>
       

        {/* Guarantee */}
        {prod?.guarantee && (
          <div
            className="
              flex
              items-center
              gap-1
              mt-1
              text-[10px]
              text-gray-600
              font-medium
            "
          >
            <FaShieldAlt className="text-[10px] text-gray-500 flex-shrink-0" />

            <span className="truncate">
              {getDisplayGuarantee()} guarantee
            </span>
          </div>
        )}

        {/* Battery / mAh */}
        {prod?.mah && (
          <div
            className="
              flex
              items-center
              gap-1
              mt-1
              text-[10px]
              text-gray-600
              font-medium
            "
          >
            <FaBatteryFull className="text-[10px] text-gray-500 flex-shrink-0" />

            <span>{prod.mah} mah</span>
          </div>
        )}

        {/* Price */}
        <div className="mt-1">
          {prod.price ? (
            <p className="text-[14px] sm:text-[15px] font-bold text-gray-900">
              ₹{prod.price}
            </p>
          ) : (
            <span
              className="
                inline-flex
                items-center
                gap-1
                text-red-500
                text-[10px]
                font-semibold
              "
            >
              <FaBan className="text-[10px]" />
              Price
            </span>
          )}
        </div>

        {/* ================= CART ================= */}
        {(user?.role === "SS" ||
          user?.role === "DS" ||
          user?.role === "ASM") && (
          <div className="mt-auto pt-2">
            {!isInCart ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddProduct();
                }}
                className="
                  w-full
                  flex
                  items-center
                  justify-center
                  gap-1.5
                  bg-gradient-to-r
                  from-orange-500
                  via-red-500
                  to-pink-600
                  hover:opacity-90
                  active:scale-[0.98]
                  text-white
                  text-[11px]
                  sm:text-xs
                  font-semibold
                  py-2
                  rounded-lg
                  shadow-sm
                  transition-all
                  duration-200
                "
              >
                <FaShoppingCart className="text-[11px]" />
                Add to Cart
              </button>
            ) : (
              <QuantitySelector
                user={user}
                item={selectedItem}
                prod={prod}
                cartoonSelection={cartoonSelection}
                updateQuantity={updateQuantity}
                updateCartoon={updateCartoon}
                isqty={false}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}