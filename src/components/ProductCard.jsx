import {
  FaShoppingCart,
  FaGift,
  FaCheckCircle,
  FaTimesCircle,
  FaPlus,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaBan } from "react-icons/fa6";
import makpower_image from "../assets/images/makpower_image.webp";

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
}) {
  const navigate = useNavigate();
  const prodId = prod.id ?? prod.product_id;
  const isInCart = selectedProducts.some((p) => p.id === prodId);
  const selectedItem = selectedProducts.find((p) => p.id === prodId);

  const [imgSrc, setImgSrc] = useState(
    prod?.image
      ? `https://res.cloudinary.com/djyr368zj/${prod.image}?f_auto,q_auto,w_300`
      : makpower_image
  );

  const handleAddProduct = () => {
    if (!isInCart) {
      const moq = prod.moq || 1;
      const initialQty =
        prod.cartoon_size && prod.cartoon_size > 1 ? prod.cartoon_size : moq;
      addProduct({ ...prod, id: prodId, quantity: initialQty });
    }
  };

  return (
    <div
      key={prodId}
      className={`flex-shrink-0 ${cardWidth} md:w-full bg-white rounded-xl shadow-md transition-all duration-300 overflow-hidden flex flex-col group mb-2`}
    >
      {/* 🖼️ Image Section */}
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

      {/* 📦 Product Info */}
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
          {prod.price ? `₹${prod.price}` : (
            <span className="flex items-center gap-1 text-red-500 text-xs">
              <FaBan /> Price
            </span>
          )}
        </p>

        {/* 🛒 Add / Quantity Control */}
        {user?.role === "SS" && (
          <div className="mt-auto">
            {!isInCart ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddProduct();
                }}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 hover:opacity-90 text-white text-[11px] md:text-sm font-semibold py-2 md:py-3 rounded-xl shadow-lg transition-all duration-300"
              >
                <FaShoppingCart className="text-sm md:text-base animate-bounce" />
                Add to Cart
              </button>
            ) : (
              <>
                {selectedItem?.cartoon_size && selectedItem.cartoon_size > 1 ? (
                  <select
                    value={cartoonSelection[selectedItem.id] || 1}
                    onChange={(e) =>
                      updateCartoon(selectedItem.id, parseInt(e.target.value))
                    }
                    className="w-full border rounded py-1 px-2 text-sm focus:ring-2 focus:ring-gray-100 outline-none mt-2"
                  >
                    {Array.from(
                      {
                        length: Math.max(
                          1,
                          Math.floor(
                            selectedItem.virtual_stock /
                              selectedItem.cartoon_size
                          )
                        ),
                      },
                      (_, i) => i + 1
                    ).map((n) => (
                      <option key={n} value={n}>
                        {n} Cartoon
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    min={1}
                    value={
                      selectedItem.quantity === "" ? "" : selectedItem.quantity
                    }
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
                    className="w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none mt-2"
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
