import { useMemo } from "react";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import makpower_image from "../assets/images/makpower_image.webp";
import MobilePageHeader from "../components/MobilePageHeader";
import { useStock } from "../context/StockContext";
import { FaShieldAlt } from "react-icons/fa";

export default function NewLaunchingPage() {
  const { data: allProducts = [], isLoading } = useCachedProducts();
  const { selectedProducts, addProduct } = useSelectedProducts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getStockValue } = useStock();

  // ✅ New Launch Product IDs
  const NEW_LAUNCH_IDS = [
    460, 186, 267, 239, 6, 1873, 1872, 1867, 1868, 1869, 1870, 1335, 1871, 1332, 1336, 1865, 1215, 1300, 1866, 99, 12];

  // ✅ Filter + Sort Products
  const products = useMemo(() => {
    return allProducts
      .filter((p) => p.is_active)
      .filter((p) => NEW_LAUNCH_IDS.includes(p.product_id))
      .sort((a, b) => {
        const subCompare = (a.sub_category || "").localeCompare(b.sub_category || "");
        if (subCompare !== 0) return subCompare;

        return (a.product_name || "").localeCompare(b.product_name || "");
      });
  }, [allProducts]);

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading Products...</div>;
  }

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <MobilePageHeader title="New Launch" />

      <div className="px-3 mt-6 pt-[60px] sm:pt-0">
        {products.length === 0 ? (
          <p className="text-center text-gray-500">No products found.</p>
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
                      NEW
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
                    <h3 className="text-xs font-semibold">
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
                    <div className="flex items-center gap-1 mt-1 text-[10px] font-medium">
                      <FaShieldAlt className="text-[11px]" />
                      <span>{prod.guarantee} guarantee</span>
                    </div>
                    {/* Price */}
                    <p className=" font-bold text-sm mt-1">
                      ₹{prod.price || 0}
                    </p>
                    {/* 🛡️ Guarantee */}


                    {/* Cart Button */}
                    {(user?.role === "SS" || user?.role === "DS") && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isInCart) addProduct({ ...prod, id: prodId }, 1);
                        }}
                        disabled={isInCart}
                        className={`w-full mt-3 text-white text-[11px] py-1.5 rounded-full font-semibold transition
                          ${isInCart
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