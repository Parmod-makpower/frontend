import {
  FaShoppingCart,
  FaGift,
  FaCheckCircle,
  FaTimesCircle,
  FaBatteryFull,
} from "react-icons/fa";
import { FaBan } from "react-icons/fa6";
import { FaShieldAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import makpower_image from "../assets/images/makpower_image.webp";
import QuantitySelector from "./QuantitySelector";
import { useStock } from "../context/StockContext";

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

  /* =========================================================
     CART
  ========================================================= */

  const isInCart = selectedProducts.some(
    (item) => item.id === prodId
  );

  const selectedItem = selectedProducts.find(
    (item) => item.id === prodId
  );

  /* =========================================================
     STOCK
  ========================================================= */

  const { getStockValue } = useStock();

  const currentStock = getStockValue(prod);

  const outOfStock =
    currentStock <= (prod.moq || 1);

  /* =========================================================
     IMAGE
  ========================================================= */

  const [imgSrc, setImgSrc] = useState(
    prod?.image
      ? `https://res.cloudinary.com/djyr368zj/${prod.image}?f_auto,q_auto,w_400`
      : fallbackImage
  );

  /* =========================================================
     ADD PRODUCT
  ========================================================= */

  const handleAddProduct = () => {
    if (isInCart) return;

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
  };

  /* =========================================================
     GUARANTEE
  ========================================================= */

  const getDisplayGuarantee = () => {
    if (!prod?.guarantee) return "";

    const guarantee = String(prod.guarantee).toLowerCase();

    if (guarantee.includes("life")) {
      return prod.guarantee;
    }

    const number = parseInt(guarantee);

    if (Number.isNaN(number)) {
      return prod.guarantee;
    }

    if (user?.role === "DS") {
      const updated = Math.max(0, number - 3);
      return `${updated} months`;
    }

    return `${number} months`;
  };

  /* =========================================================
     PRODUCT NAME
  ========================================================= */

  const productName = prod?.product_name || "Product";

  /* =========================================================
     SCHEME
  ========================================================= */

  const productHasScheme =
    typeof hasScheme === "function"
      ? hasScheme(prodId)
      : false;

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <article
      className={`
        group
        relative
        flex
        h-full
        min-h-0
        flex-shrink-0
        flex-col
        overflow-hidden

        ${cardWidth}
        w-full
        max-w-[230px]

        rounded-[18px]

        border
        border-slate-200/80

        bg-white

        shadow-[0_3px_14px_rgba(15,23,42,0.055)]

        transition-all
        duration-200
        ease-out

        hover:-translate-y-1
        hover:border-[#ffd5cc]
        hover:shadow-[0_10px_28px_rgba(252,37,12,0.10)]

        active:scale-[0.985]
      `}
    >
      {/* =====================================================
          PRODUCT IMAGE
      ====================================================== */}

      <div
        onClick={() =>
          navigate(`/product/${prodId}`)
        }
        className="
          relative
          aspect-[1/0.86]
          w-full
          cursor-pointer
          overflow-hidden

          bg-[#eef0f2]

          rounded-t-[17px]
        "
      >
        {/* Soft image background */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-br
            from-white/20
            via-transparent
            to-slate-200/20
          "
        />

        <img
          src={imgSrc}
          alt={productName}
          loading="lazy"
          decoding="async"
          draggable="false"
          className="
            relative
            z-[1]
            h-full
            w-full
            object-contain

            p-2

            transition-transform
            duration-300
            ease-out

            group-hover:scale-[1.07]
          "
          onError={() => {
            if (imgSrc !== fallbackImage) {
              setImgSrc(fallbackImage);
            }
          }}
        />

        {/* ===================================================
            SCHEME BADGE
        ==================================================== */}

        {productHasScheme && (
          <div
            className="
              absolute
              right-2
              top-2
              z-10

              flex
              h-7
              w-7
              items-center
              justify-center

              rounded-full

              border
              border-white/80

              bg-white/95

              text-[#fc250c]

              shadow-[0_3px_10px_rgba(15,23,42,0.12)]

              backdrop-blur-sm

              transition-transform
              duration-200

              group-hover:scale-110
            "
            title="Special Scheme"
          >
            <FaGift className="text-[11px]" />
          </div>
        )}

        {/* ===================================================
            STOCK BADGE
        ==================================================== */}

        <div
          className={`
            absolute
            left-2
            top-2
            z-10

            flex
            items-center
            gap-1

            rounded-full

            border
            border-white/80

            bg-white/90

            px-2
            py-1

            text-[8px]
            font-extrabold

            shadow-sm

            backdrop-blur-sm

            ${
              !outOfStock
                ? "text-emerald-600"
                : "text-red-500"
            }
          `}
        >
          {!outOfStock ? (
            <>
              <FaCheckCircle className="text-[8px]" />
              In Stock
            </>
          ) : (
            <>
              <FaTimesCircle className="text-[8px]" />
              Out
            </>
          )}
        </div>

        {/* ===================================================
            IMAGE BOTTOM FADE
        ==================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            z-[2]
            h-10

            bg-gradient-to-t
            from-black/[0.04]
            to-transparent
          "
        />
      </div>

      {/* =====================================================
          PRODUCT INFORMATION
      ====================================================== */}

      <div
        className="
          flex
          min-h-0
          flex-1
          flex-col

          px-2.5
          pb-2.5
          pt-2
        "
      >
        {/* ===================================================
            PRODUCT NAME
        ==================================================== */}

        <button
          type="button"
          onClick={() =>
            navigate(`/product/${prodId}`)
          }
          className="
            w-full
            cursor-pointer
            text-left
            outline-none
          "
        >
          <h3
            title={productName}
            className="
              line-clamp-2

              min-h-[28px]

              text-[11px]
              font-extrabold
              leading-[14px]

              tracking-[-0.1px]

              text-slate-800

              transition-colors
              duration-200

              group-hover:text-[#fc250c]
            "
          >
            {productName}

            {prod.product_type && (
              <span
                className="
                  font-medium
                  text-slate-400
                "
              >
                {" "}
                / {prod.product_type}
              </span>
            )}
          </h3>
        </button>

        {/* ===================================================
            PRODUCT DETAILS
        ==================================================== */}

        <div className="mt-1.5 space-y-1">
          {/* Guarantee */}

          {prod?.guarantee && (
            <div
              className="
                flex
                min-w-0
                items-center
                gap-1

                text-[8px]
                font-semibold

                text-slate-500
              "
            >
              <FaShieldAlt
                className="
                  shrink-0
                  text-[9px]
                  text-[#fc250c]
                "
              />

              <span className="truncate">
                {getDisplayGuarantee()} guarantee
              </span>
            </div>
          )}

          {/* MAH */}

          {prod?.mah && (
            <div
              className="
                flex
                items-center
                gap-1

                text-[8px]
                font-semibold

                text-slate-500
              "
            >
              <FaBatteryFull
                className="
                  shrink-0
                  text-[9px]
                  text-[#f97316]
                "
              />

              <span>
                {prod.mah} mah
              </span>
            </div>
          )}
        </div>

        {/* ===================================================
            PRICE
        ==================================================== */}

        <div className="mt-1.5">
          {prod.price ? (
            <div className="flex items-baseline gap-1">
              <span
                className="
                  text-[14px]
                  font-black
                  leading-none

                  tracking-[-0.2px]

                  text-slate-900
                "
              >
                ₹{prod.price}
              </span>
            </div>
          ) : (
            <span
              className="
                inline-flex
                items-center
                gap-1

                text-[8px]
                font-bold

                text-red-500
              "
            >
              <FaBan className="text-[8px]" />
              Price unavailable
            </span>
          )}
        </div>

        {/* ===================================================
            CART AREA
        ==================================================== */}

        {(user?.role === "SS" ||
          user?.role === "DS" ||
          user?.role === "ASM") && (
          <div className="mt-auto pt-2">
            {!isInCart ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleAddProduct();
                }}
                className="
                  relative
                  flex
                  min-h-[32px]
                  w-full
                  items-center
                  justify-center
                  gap-1.5

                  overflow-hidden

                  rounded-[10px]

                  bg-gradient-to-r
                  from-[#fc250c]
                  via-[#ff3b1f]
                  to-[#f97316]

                  px-2
                  py-1.5

                  text-[9px]
                  font-extrabold
                  text-white

                  shadow-[0_4px_12px_rgba(252,37,12,0.18)]

                  transition-all
                  duration-200

                  hover:shadow-[0_6px_16px_rgba(252,37,12,0.24)]

                  active:scale-[0.96]
                "
              >
                {/* Shine */}

                <span
                  className="
                    pointer-events-none
                    absolute
                    inset-y-0
                    -left-full
                    w-1/2

                    skew-x-[-20deg]

                    bg-white/20

                    transition-all
                    duration-500

                    group-hover:left-[120%]
                  "
                />

                <FaShoppingCart
                  className="
                    relative
                    z-[1]
                    text-[10px]
                  "
                />

                <span className="relative z-[1]">
                  Add to Cart
                </span>
              </button>
            ) : (
              <div
                className="
                  rounded-[10px]
                  border
                  border-[#ffe0d8]
                  bg-[#fffaf8]
                  px-1.5
                  py-1
                "
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                <QuantitySelector
                  user={user}
                  item={selectedItem}
                  prod={prod}
                  cartoonSelection={cartoonSelection}
                  updateQuantity={updateQuantity}
                  updateCartoon={updateCartoon}
                  isqty={false}
                  isCartPage={true}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          BRAND ACCENT
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          h-[2px]
          w-0

          bg-gradient-to-r
          from-[#fc250c]
          to-[#f97316]

          transition-all
          duration-300

          group-hover:w-full
        "
      />
    </article>
  );
}