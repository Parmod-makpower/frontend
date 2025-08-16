import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSchemes } from "../hooks/useSchemes";
import useFuseSearch from "../hooks/useFuseSearch";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import categories from "../data/categoryData";
import MobilePageHeader from "../components/MobilePageHeader";
import { useAuth } from "../context/AuthContext";
import { FaGift, FaPlus, FaMinus, FaShoppingCart, FaCheckCircle, FaTimesCircle } from "react-icons/fa";



const ITEMS_PER_PAGE = 15;

export default function CategoryProductListPage() {
  const { user } = useAuth();

  const { categoryKeyword } = useParams();
  const navigate = useNavigate();
  const { data: allProducts = [], isLoading } = useCachedProducts();
  const { data: schemes = [] } = useSchemes();
  const { selectedProducts, addProduct, updateQuantity } = useSelectedProducts();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredByCategory = allProducts.filter((product) =>
    product.sub_category?.toLowerCase().includes(categoryKeyword.toLowerCase())
  );

  const filteredProducts = useFuseSearch(filteredByCategory, search, {
    keys: ["product_name", "sub_category", "product_id"],
    threshold: 0.3,
  });

  const productsToShow = search ? filteredProducts : filteredByCategory;
  const totalPages = Math.ceil(productsToShow.length / ITEMS_PER_PAGE);
  const paginatedProducts = productsToShow.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    setSearch("");
    setCurrentPage(1);
  }, [categoryKeyword]);

  const hasScheme = (productId) =>
    schemes.some(
      (scheme) =>
        Array.isArray(scheme.conditions) &&
        scheme.conditions.some((cond) => cond.product === productId)
    );

  return (
    <div className="p-4 mx-auto grid grid-cols-1 gap-4">
      {/* 🆕 Fixed Sidebar */}
      <aside className="hidden md:block fixed top-[130px] left-0 h-[calc(100vh-130px)] w-56 bg-white shadow-lg p-3 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">All Categories</h2>
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <div
              key={cat.label}
              onClick={() =>
                navigate(`/category/${encodeURIComponent(cat.keyword)}`)
              }
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition
                ${
                  cat.keyword.toLowerCase() === categoryKeyword.toLowerCase()
                    ? "bg-blue-100"
                    : ""
                }`}
            >
              <div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-medium text-gray-700 truncate">
                {cat.label}
              </span>
            </div>
          ))}
        </div>
      </aside>

      <MobilePageHeader title={categoryKeyword} />

      {/* 📦 Products Section */}
      <main className="md:col-span-3 md:ml-60 pt-[60px] sm:pt-0 pb-16">
        {/* 🔍 Search Box */}
        <input
          type="text"
          placeholder={`search ${categoryKeyword} only...`}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-2 w-full mb-4 rounded"
        />

        {/* Product List */}
        {isLoading ? (
          <p>Loading...</p>
        ) : paginatedProducts.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No matching products found.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

            {paginatedProducts.map((prod) => {
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
  {/* Image Section */}
  <div className="relative w-full h-40 md:h-55 overflow-hidden bg-gray-50">
    <img
      src={
        prod?.image
          ? `https://res.cloudinary.com/djyr368zj/${prod.image}`
          : "https://makpowerindia.com/cdn/shop/files/Makpower_45W_PD_Charger.webp?v=1746862914"
      }
      alt={prod.product_name}
      className="w-full h-full object-cover transform group-hover:scale-105 transition duration-300"
    />

    {/* Scheme Icon */}
    {hasScheme(prodId) && (
      <span className="absolute top-2 right-2 bg-pink-100 p-2 rounded-full shadow">
        <FaGift className="text-[#f43f5e] animate-bounce" title="Scheme Available" />
      </span>
    )}
  </div>

  {/* Content Section */}
  <div className="flex flex-col flex-1 p-4">
   <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-800 truncate flex items-center gap-2">
  {prod.product_name}
</h3>


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

    <p className="text-[#2563eb]  text-sm mt-2 flex items-center gap-2">
      {prod.price || 0}
    </p>

    {/* Cart Section */}
    <div className="mt-auto">
      {user?.role === "SS" && (
        isInCart ? (
          <div className="flex items-center justify-center gap-2 mt-3">
           <button
  onClick={(e) => {
    e.stopPropagation();
    handleDecrease();
  }}
  className="p-1 sm:p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition text-xs sm:text-sm"
>
  <FaMinus />
</button>
<input
  type="number"
  value={quantity}
  onChange={handleManualInput}
  className="w-10 sm:w-14 text-center border rounded-md py-1 text-xs sm:text-sm"
  min={1}
/>
<button
onClick={(e) => {
    e.stopPropagation();
    handleIncrease();
  }}
 
  className="p-1 sm:p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition text-xs sm:text-sm"
>
  <FaPlus />
</button>

          </div>
        ) : (
          <button
          
  onClick={(e) => {
    e.stopPropagation();   // Card click रोकेगा
    handleAddToCart();
  }}
  className="w-full mt-2 flex items-center justify-center gap-1 bg-[#2563eb] hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold py-1 sm:py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow"
>
  <FaShoppingCart className="text-xs sm:text-sm" /> Add
</button>

        )
      )}
    </div>
  </div>
</div>



              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              ⬅ Prev
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next ➡
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
