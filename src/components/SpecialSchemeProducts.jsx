// 📁 src/pages/TrendingProducts.jsx
import { FaShoppingCart, FaGift, FaCheckCircle, FaTimesCircle, FaPlus, FaMinus } from "react-icons/fa";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSchemes } from "../hooks/useSchemes";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function TrendingProducts({ trendingIds = [] }) {
  const { data: allProducts = [], isLoading } = useCachedProducts();
  const { data: schemes = [] } = useSchemes();
  const { selectedProducts, addProduct, updateQuantity } = useSelectedProducts();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return <p className="text-gray-500 text-sm">Loading trending products...</p>;
  }

  // Filter products by IDs
  const trendingProducts = allProducts.filter((prod) =>
    trendingIds.includes(prod.product_id)
  );

  if (!trendingProducts.length) {
    return <p className="text-gray-500 text-sm">No Scheme products found.</p>;
  }

  const hasScheme = (productId) =>
    schemes.some(
      (scheme) =>
        Array.isArray(scheme.conditions) &&
        scheme.conditions.some((cond) => cond.product === productId)
    );

  return (
    <div>
     <h2 className="text-lg font-semibold text-gray-800 mt-7 mb-4  flex items-center space-x-2">
  <FaGift className="text-pink-500" />
  <span>Special Scheme Products</span>
</h2>


      {/* 📱 Mobile Horizontal Scroll */}
      <div className="block md:hidden overflow-x-auto no-scrollbar -mx-2 px-2">
        <div className="flex gap-4">
          {trendingProducts.map((prod) => {
            const prodId = prod.id ?? prod.product_id;
            const isInCart = selectedProducts.some((p) => p.id === prodId);
            const existing = selectedProducts.find((p) => p.id === prodId);
            const quantity = existing?.quantity || 1;

            const handleAddToCart = () => {
              addProduct({ ...prod, id: prodId }, 1);
            };

            const handleDecrease = () => {
              const newQty = Math.max(1, quantity - 1);
              updateQuantity(prodId, newQty);
            };

            const handleIncrease = () => {
              const newQty = quantity + 1;
              updateQuantity(prodId, newQty);
            };

            const handleManualInput = (e) => {
              const val = Math.max(1, parseInt(e.target.value) || 1);
              updateQuantity(prodId, val);
            };

            return (
              <div
                key={prodId}
                onClick={() => navigate(`/product/${prodId}`)}
                className="flex-shrink-0 w-40 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group mb-2"
              >
                {/* Image */}
                <div className="relative w-full overflow-hidden bg-gray-50">
                  <img
                    src={
                      prod?.image
                        ? `https://res.cloudinary.com/djyr368zj/${prod.image}`
                        : "https://makpowerindia.com/cdn/shop/files/hh6qjrqeertq9tqw4a97.webp?v=1755496529"
                    }
                    alt={prod.product_name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition duration-300"
                  />

                  {/* Scheme Badge */}
                  {hasScheme(prodId) && (
                    <span className="absolute top-2 right-2 bg-pink-100 p-1.5 rounded-full shadow">
                      <FaGift className="text-[#f43f5e] animate-bounce text-xs" />
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-2">
                  <h3 className="text-xs font-bold text-gray-800 truncate">{prod.product_name}</h3>

                  {/* Stock */}
                  <div className="flex items-center gap-1 mt-1">
                    {prod.live_stock > 1 ? (
                      <span className="flex items-center gap-1 text-[#16a34a] text-[10px] font-semibold">
                        <FaCheckCircle /> In Stock
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[#dc2626] text-[10px] font-semibold">
                        <FaTimesCircle /> Out
                      </span>
                    )}
                  </div>

                  <p className="text-[#2563eb] font-semibold text-sm mt-1">
                    ₹{prod.price || 0}
                  </p>

                  {/* Cart */}
                  <div className="mt-auto">
                    {user?.role === "SS" && (
                      isInCart ? (
                        <div className="flex items-center justify-center gap-1 mt-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDecrease(); }}
                            className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 text-[10px]"
                          >
                            <FaMinus />
                          </button>
                          <input
                            type="number"
                            value={quantity}
                            onChange={handleManualInput}
                            className="w-8 text-center border rounded-md text-[10px] py-0.5"
                            min={1}
                          />
                          <button
                            onClick={(e) => { e.stopPropagation(); handleIncrease(); }}
                            className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 text-[10px]"
                          >
                            <FaPlus />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
                          className="w-full mt-2 flex items-center justify-center gap-1 bg-[#2563eb] hover:bg-blue-700 text-white text-[10px] font-semibold py-1 rounded-lg transition-all duration-300 hover:scale-105 shadow"
                        >
                          <FaShoppingCart /> Add
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🖥 Desktop Grid */}
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {trendingProducts.map((prod) => {
          const prodId = prod.id ?? prod.product_id;
          const isInCart = selectedProducts.some((p) => p.id === prodId);
          const existing = selectedProducts.find((p) => p.id === prodId);
          const quantity = existing?.quantity || 1;

          const handleAddToCart = () => {
            addProduct({ ...prod, id: prodId }, 1);
          };

          const handleDecrease = () => {
            const newQty = Math.max(1, quantity - 1);
            updateQuantity(prodId, newQty);
          };

          const handleIncrease = () => {
            const newQty = quantity + 1;
            updateQuantity(prodId, newQty);
          };

          const handleManualInput = (e) => {
            const val = Math.max(1, parseInt(e.target.value) || 1);
            updateQuantity(prodId, val);
          };

          return (
            <div
              key={prodId}
              onClick={() => navigate(`/product/${prodId}`)}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
            >
              {/* Image */}
              <div className="relative w-full h-48 overflow-hidden bg-gray-50">
                <img
                  src={
                    prod?.image
                      ? `https://res.cloudinary.com/djyr368zj/${prod.image}`
                      : "https://makpowerindia.com/cdn/shop/files/Makpower_45W_PD_Charger.webp?v=1746862914"
                  }
                  alt={prod.product_name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition duration-300"
                />
                {hasScheme(prodId) && (
                  <span className="absolute top-2 right-2 bg-pink-100 p-2 rounded-full shadow">
                    <FaGift className="text-[#f43f5e] animate-bounce" />
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-4">
                <h3 className="text-sm font-bold text-gray-800 truncate">{prod.product_name}</h3>

                <div className="flex items-center gap-2 mt-1">
                  {prod.live_stock > 1 ? (
                    <span className="flex items-center gap-1 text-[#16a34a] text-xs font-semibold">
                      <FaCheckCircle /> In Stock
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[#dc2626] text-xs font-semibold">
                      <FaTimesCircle /> Out of Stock
                    </span>
                  )}
                </div>

                <p className="text-[#2563eb] font-semibold text-sm mt-2">
                  ₹{prod.price || 0}
                </p>

                <div className="mt-auto">
                  {user?.role === "SS" && (
                    isInCart ? (
                      <div className="flex items-center justify-center gap-2 mt-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDecrease(); }}
                          className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 text-xs"
                        >
                          <FaMinus />
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={handleManualInput}
                          className="w-12 text-center border rounded-md py-1 text-xs"
                          min={1}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); handleIncrease(); }}
                          className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 text-xs"
                        >
                          <FaPlus />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
                        className="w-full mt-2 flex items-center justify-center gap-1 bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow"
                      >
                        <FaShoppingCart /> Add to Cart
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
