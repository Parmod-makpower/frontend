import { useState, useMemo } from "react";
import useFuseSearch from "../hooks/useFuseSearch";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { FiDownload } from "react-icons/fi";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import makpower_image from "../assets/images/makpower_image.png";

const ITEMS_PER_PAGE = 50;

export default function AvailableStock() {
  const { data: allProducts = [], isLoading } = useCachedProducts();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [stockFilter, setStockFilter] = useState("in"); // "in" | "out"
  const [selectedCategories, setSelectedCategories] = useState([]);

  // 🔍 Search filter
  const searchedProducts = useFuseSearch(allProducts, search, {
    keys: ["product_name", "sub_category", "product_id"],
    threshold: 0.3,
  });
  const productsToSearch = search ? searchedProducts : allProducts;

// ❌ जिन categories को नहीं दिखाना है
const hiddenCategories = ["BATTERY", "COPY", "GIFT ITEM", "Lamination", "OTHERS","RDX", "RM","TV","STICKER","POWERBANK & TWS","SMART WATCH","MAHAKUMBH","LED LIGHT","LED BULB","GLASS CLEANER","LAMINATION"];

const categories = useMemo(() => {
  return [...new Set(allProducts.map((p) => p.sub_category))]
    .filter(
      (cat) =>
        !hiddenCategories.includes(cat) && // fixed list
        !(cat?.trim().toUpperCase().startsWith("Z")) // Z से शुरू होने वाली categories hide
    );
}, [allProducts]);

  // ✅ Apply filters (stock + categories)
  const filteredProducts = useMemo(() => {
    let result = productsToSearch;

    // Stock filter
    if (stockFilter === "in") {
      result = result.filter((p) => p.live_stock > 0);
    } else if (stockFilter === "out") {
      result = result.filter((p) => p.live_stock <= 0);
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.sub_category));
    }

    return result;
  }, [productsToSearch, stockFilter, selectedCategories]);

  // 📑 Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Category checkbox toggle
  const toggleCategory = (cat) => {
    setCurrentPage(1);
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  if (isLoading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 flex gap-4">
      {/* 📂 Left Side Filters */}
      <div className="w-68 border-r pr-4">
        <h2 className="font-semibold mb-2">Categories</h2>
        {categories.map((cat) => (
          <label key={cat} className="flex items-center gap-2 mb-1 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedCategories.includes(cat)}
              onChange={() => toggleCategory(cat)}
            />
            <span>{cat}</span>
          </label>
        ))}
      </div>

      {/* 📊 Right Side Table */}
      <div className="flex-1">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4 ">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="🔍 Search by name, category, ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="border p-2 rounded flex-1 min-w-[200px] shadow-sm focus:ring-2 focus:ring-blue-400"
          />

          {/* Stock Filter + Download */}
          <div className="flex flex-wrap gap-2">
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border p-2 rounded shadow-sm"
            >
              <option value="in">In Stock</option>
              <option value="out">Out of Stock</option>
              <option value="all">All</option>
            </select>

            <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow cursor-pointer">
              <FiDownload className="text-lg" /> Download PDF
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Category</th>
                <th className="px-4 py-2 border">Product Name</th>
                <th className="px-4 py-2 border">Stock</th>
                <th className="px-4 py-2 border">Price</th>
                <th className="px-4 py-2 border">Cartoon</th>
                <th className="px-4 py-2 border">Image</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((prod) => (
                <tr key={prod.product_id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{prod.product_id}</td>
                  <td className="px-4 py-2 border">{prod.sub_category}</td>
                  <td className="px-4 py-2 border">{prod.product_name}</td>
                  <td className="px-4 py-2 border">
                    {prod.live_stock > 0 ? (
                      <span className="flex items-center gap-1 text-[#16a34a] text-[10px] md:text-xs font-semibold">
                        <FaCheckCircle /> In Stock
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[#dc2626] text-[10px] md:text-xs font-semibold">
                        <FaTimesCircle /> Out
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 border">{prod.price}</td>
                  <td className="px-4 py-2 border">{prod.cartoon_size}</td>
                  <td className="px-4 py-2 border">
                    <img
                      src={
                        prod?.image
                          ? `https://res.cloudinary.com/djyr368zj/${prod.image}`
                          : makpower_image
                      }
                      className="w-10 h-10 object-contain bg-gray-50 rounded-lg border self-center"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              ⬅️ Prev
            </button>
            <span>
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next ➡️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
