import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSchemes } from "../hooks/useSchemes";
import useFuseSearch from "../hooks/useFuseSearch";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import categories from "../data/categoryData";
import MobilePageHeader from "../components/MobilePageHeader";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";

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
      {/* Sidebar */}
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
                ${cat.keyword.toLowerCase() === categoryKeyword.toLowerCase()
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

      {/* Products Section */}
      <main className="md:col-span-3 md:ml-60 pt-[60px] sm:pt-0 pb-16">
        {/* Search Box */}
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {paginatedProducts.map((prod) => {
              const prodId = prod.id ?? prod.product_id;
              const isInCart = selectedProducts.some((p) => p.id === prodId);
              const existing = selectedProducts.find((p) => p.id === prodId);
              const quantity = existing?.quantity || 1;

              return (
                <ProductCard
                  key={prodId}
                  prod={prod}
                  hasScheme={hasScheme}
                  user={user}
                  selectedProducts={selectedProducts}
                  addProduct={addProduct}
                  updateQuantity={updateQuantity}
                  cardWidth="w-full"
                />
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
