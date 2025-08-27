import {
  FaShoppingCart,
  FaGift,
  FaCheckCircle,
  FaTimesCircle,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ProductCard({
  prod,
  hasScheme,
  user,
  selectedProducts,
  addProduct,
  updateQuantity,
  cardWidth = "w-40",
}) {
  const navigate = useNavigate();
  const prodId = prod.id ?? prod.product_id;

  const isInCart = selectedProducts.some((p) => p.id === prodId);
  const existing = selectedProducts.find((p) => p.id === prodId);
  const quantity = existing?.quantity || 0;

  // 👉 Local input state (string type)
  const [localInputValue, setLocalInputValue] = useState(quantity.toString());

  // Sync local value when global quantity changes
  useEffect(() => {
    setLocalInputValue(quantity.toString());
  }, [quantity]);

  const handleAddToCart = () => {
    addProduct({ ...prod, id: prodId }, 1);
  };

  const handleDecrease = () => {
    const newQty = Math.max(0, quantity - 1);
    updateQuantity(prodId, newQty);
  };

  const handleIncrease = () => {
    updateQuantity(prodId, quantity + 1);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    // Only allow digits
    if (/^\d*$/.test(val)) {
      setLocalInputValue(val);
    }
  };

  const handleInputBlur = () => {
    const parsed = parseInt(localInputValue, 10);
    const validQty = isNaN(parsed) ? 0 : parsed;
    updateQuantity(prodId, validQty);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur(); // trigger blur manually
    }
  };

  return (
    <div
      key={prodId}
      className={`flex-shrink-0 ${cardWidth} md:w-full bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group mb-2`}
    >
      {/* Image */}
      <div
        className="relative w-full overflow-hidden bg-gray-50"
        onClick={() => navigate(`/product/${prodId}`)}
      >
        <img
          src={
            prod?.image
              ? `https://res.cloudinary.com/djyr368zj/${prod.image}`
              : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIFcuUSKmRmixJj0-A71Di3ql9H1_CFTA54A&s"
          }
          alt={prod.product_name}
          className="w-full md:h-full object-cover transform group-hover:scale-105 transition duration-300"
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
          {prod.live_stock > 1 ? (
            <span className="flex items-center gap-1 text-[#16a34a] text-[10px] md:text-xs font-semibold">
              <FaCheckCircle /> In Stock
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[#dc2626] text-[10px] md:text-xs font-semibold">
              <FaTimesCircle /> Out
            </span>
          )}
        </div>

        <p className=" font-semibold text-sm mt-1">
          ₹{prod.price || 0}
        </p>

        {/* Cart */}
        <div className="mt-auto">
          {user?.role === "SS" &&
            (isInCart ? (
              <div className="flex items-center justify-center gap-1 md:gap-2 mt-2 md:mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDecrease();
                  }}
                  className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 text-[10px] md:text-xs"
                >
                  <FaMinus />
                </button>

                <input
                  type="text"
                  inputMode="numeric"
                  value={localInputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  className="w-8 md:w-12 text-center border rounded-md text-[10px] md:text-xs py-0.5 md:py-1"
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIncrease();
                  }}
                  className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 text-[10px] md:text-xs"
                >
                  <FaPlus />
                </button>
              </div>
            ) : (
             <button
  onClick={(e) => {
    e.stopPropagation();
    handleAddToCart();
  }}
  className="w-full mt-2 flex items-center justify-center gap-2 
             bg-gradient-to-r from-orange-500 via-red-500 to-pink-600
             hover:from-pink-600 hover:via-red-500 hover:to-orange-500
             text-white text-[11px] md:text-sm font-semibold 
             py-2 md:py-3 rounded-xl shadow-lg 
             transition-all duration-500 ease-in-out 
             transform hover:scale-105 hover:shadow-2xl"
>
  <FaShoppingCart className="text-sm md:text-base animate-bounce" />
  Add to Cart
</button>

            ))}
        </div>
      </div>
    </div>
  );
}
