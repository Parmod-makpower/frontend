import { useState, useMemo, useRef } from "react";
import useFuseSearch from "../hooks/useFuseSearch";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useUpdateProduct } from "../hooks/useProducts";
import ProductEditModel from "../components/ProductEditModel";
import { FiMenu, FiX, FiEdit } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 20;

export default function AvailableStock() {
  const { data: allProducts = [], isLoading } = useCachedProducts();
  const { mutate: updateProduct } = useUpdateProduct();
  const { user } = useAuth();
  const isAnkita = user?.user_id === "AD0001";
  const [priceFilter, setPriceFilter] = useState("all");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [stockFilter, setStockFilter] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const tableRef = useRef();

  // 🧩 Edit Modal States
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({
    guarantee: "",
    price: "",
    quantity_type: "",
    cartoon_size: "",
    moq: "",
  });

  // 🔍 Search filter
  const searchedProducts = useFuseSearch(allProducts, search, {
    keys: ["sub_category", "product_name"],
    threshold: 0.3,
  });
  const productsToSearch = search ? searchedProducts : allProducts;

  const hiddenCategories = [
    "BATTERY", "COPY", "GIFT ITEM", "Lamination", "OTHERS", "RDX", "RM", "TV",
    "STICKER", "POWERBANK & TWS", "SMART WATCH", "MAHAKUMBH", "LED LIGHT",
    "LED BULB", "GLASS CLEANER", "LAMINATION", "HEADPHONE", "PROMOTIONAL ITEM",
  ];

  const categories = useMemo(() => {
    return [...new Set(allProducts.map((p) => p.sub_category))].filter(
      (cat) =>
        !hiddenCategories.includes(cat) &&
        !(cat?.trim().toUpperCase().startsWith("Z"))
    );
  }, [allProducts]);

  // ✅ Apply filters
  const filteredProducts = useMemo(() => {
    let result = productsToSearch;

    if (stockFilter === "in") result = result.filter((p) => p.live_stock > 0);
    else if (stockFilter === "out") result = result.filter((p) => p.live_stock <= 0);

    if (selectedCategories.length > 0)
      result = result.filter((p) => selectedCategories.includes(p.sub_category));

    // ✅ Added Price Filter
    if (priceFilter === "price") {
      result = result.filter((p) => p.price >= 1);
    } else if (priceFilter === "not_price") {
      result = result.filter((p) => p.price < 1);
    }

    return result;
  }, [productsToSearch, stockFilter, selectedCategories, priceFilter]);


  // 📄 Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const toggleCategory = (cat) => {
    setCurrentPage(1);
    if (selectedCategories.includes(cat))
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    else setSelectedCategories([...selectedCategories, cat]);
  };

  // 📝 Handle Update Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    updateProduct(
      { productId: editData.product_id, updatedData: form },
      {
        onSuccess: () => {
          toast.success("Product updated ✅");
          setShowModal(false);
        },
        onError: () => toast.error("Update failed ❌"),
      }
    );
  };

  if (isLoading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4">
      <div className="flex">
        {/* Left Offcanvas */}
        {isOffcanvasOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setIsOffcanvasOpen(false)}
          ></div>
        )}
        <div
          className={`fixed top-0 left-0 h-full w-60 bg-white z-50 shadow-lg transform transition-transform duration-300 ${isOffcanvasOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >

          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="font-semibold">Categories</h2>
            <button onClick={() => setIsOffcanvasOpen(false)}>
              <FiX className="text-xl" />
            </button>
          </div>
          <div className="p-4 flex flex-col gap-2 overflow-y-auto h-[calc(100%-64px)]">
            {categories.map((cat) => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Right Table */}
        <div className="flex-1 ml-0 sm:ml-0">
          {/* Top Controls */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
            <button
              onClick={() => setIsOffcanvasOpen(true)}
              className="p-2 bg-blue-500 cursor-pointer text-white rounded flex items-center gap-2"
            >
              <FiMenu />
            </button>
            <input
              type="text"
              placeholder="🔍 Search ..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="border p-2 rounded flex-1 min-w-[200px] shadow-sm focus:ring-2 focus:ring-blue-400"
            />
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
              <select
                value={priceFilter}
                onChange={(e) => {
                  setPriceFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="border p-2 rounded shadow-sm"
              >
                <option value="all">All</option>
                <option value="price">Price</option>
                <option value="not_price">Not Price</option>
              </select>

            </div>
          </div>
          <div className="mb-3 text-sm font-semibold text-gray-700">
            Total Products: <span className="text-blue-600">{allProducts.length}</span> |
            Filtered: <span className="text-green-600">{filteredProducts.length}</span>
          </div>

          {/* Table */}
          <div ref={tableRef} className="overflow-x-auto rounded">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100 text-gray-900 text-sm font-semibold">
                <tr>
                  <th className="p-3 border">ID</th>
                  <th className="p-3 border">Category</th>
                  <th className="p-3 border">Product Name</th>
                  <th className="p-3 border">Guarantee</th>
                  <th className="p-3 border">Price</th>
                  <th className="p-3 border">Type</th>
                  <th className="p-3 border">Cartoon</th>
                  <th className="p-3 border">MOQ</th>
                  <th className="p-3 border">V-Stock</th>
                  {/* <th className="p-3 border text-center">Edit</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedProducts.map((prod, idx) => (
                  <tr
                    key={prod.product_id}
                    className={
                      idx % 2 === 0
                        ? "bg-white hover:bg-gray-50"
                        : "bg-gray-50 hover:bg-gray-100"
                    }
                  >
                    <td className="p-3 border font-medium">{prod.product_id}</td>
                    <td className="p-3 border">{prod.sub_category}</td>
                    <td className="p-3 border">{prod.product_name}</td>
                    <td className="p-3 border">{prod.guarantee}</td>
                    <td className="p-3 border">₹{prod.price}</td>
                    <td className="p-3 border font-semibold text-green-600">{prod.quantity_type}</td>
                    <td className="p-3 border bg-red-100">{prod.cartoon_size}</td>
                    <td className="p-3 border bg-red-100">{prod.moq}</td>
                    <td className="p-3 border text-blue-600">{prod.virtual_stock}</td>
                    {isAnkita && (
                      <td className="p-3 border text-center">
                        <button
                          onClick={() => {
                            setEditData(prod);
                            setForm({
                              product_id: prod.product_id || "",
                              product_name: prod.product_name || "",
                              sub_category: prod.sub_category || "",
                              guarantee: prod.guarantee || "",
                              price: prod.price || "",
                              quantity_type: prod.quantity_type || "",
                              cartoon_size: prod.cartoon_size || "",
                              moq: prod.moq || "",
                            });
                            setShowModal(true);
                          }}

                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FiEdit />
                        </button>
                      </td>
                    )}

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

      {/* 🧾 Edit Modal (Reuse same as ProductPage) */}
      <ProductEditModel
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        editData={editData}
      />

    </div>
  );
}
