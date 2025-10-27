import { useState } from "react";
import useFuseSearch from "../hooks/useFuseSearch";
import { useAdminAllProducts } from "../hooks/useAdminAllProducts";
import { useAddProduct, useDeleteProduct, useUpdateProduct, useToggleProductStatus } from "../hooks/useProducts";
import { toast } from "react-toastify";
import { FiUpload, FiEdit, FiTrash2, FiPlus, FiDownload } from "react-icons/fi";
import makpower_image from "../assets/images/makpower_image.webp"
import "react-toastify/dist/ReactToastify.css";
import { uploadProductImage, uploadProductImage2, downloadProductTemplate, bulkUploadProducts } from "../api/productApi";

const ITEMS_PER_PAGE = 50;

export default function ProductPage() {
  const { data: allProducts = [], isLoading } = useAdminAllProducts();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({
    product_id: "",
    product_name: "",
    sub_category: "",
    cartoon_size: "",
    price: "",
    live_stock: "",
    guarantee: "",
    moq: "",
  });

  const [uploading, setUploading] = useState(false); // 🔹 Upload loader state

  const { mutate: addProduct } = useAddProduct();
  const { mutate: deleteProduct } = useDeleteProduct();
  const { mutate: updateProduct } = useUpdateProduct();
  const { mutate: toggleStatus } = useToggleProductStatus();

  const filteredProducts = useFuseSearch(allProducts, search, {
    keys: ["product_name", "sub_category", "product_id"],
    threshold: 0.3,
  });
  const productsToShow = search ? filteredProducts : allProducts;

  const totalPages = Math.ceil(productsToShow.length / ITEMS_PER_PAGE);
  const paginatedProducts = productsToShow.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Submit handler for add/edit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editData) {
      updateProduct(
        { productId: editData.product_id, updatedData: form },
        {
          onSuccess: () => {
            toast.success("Product updated");
            setShowModal(false);
          },
          onError: () => toast.error("Update failed")
        }
      );
    } else {
      addProduct(form, {
        onSuccess: () => {
          toast.success("Product added");
          setShowModal(false);
        },
        onError: () => toast.error("Add failed")
      });
    }
  };

  // Delete product
  const handleDelete = (id) => {
    if (window.confirm("Delete this product?")) {
      deleteProduct(id, {
        onSuccess: () => toast.success("Product deleted"),
        onError: () => toast.error("Delete failed"),
      });
    }
  };

  
  // Image Upload
  const handleImageUpload = async (productId, file, type = "image") => {
    try {
      let response;
      if (type === "image") {
        response = await uploadProductImage({ productId, imageFile: file });
      } else {
        response = await uploadProductImage2({ productId, imageFile: file });
      }
      toast.success(`${type} uploaded successfully ✅`);
      console.log(`Uploaded ${type} URL:`, response.url);
    } catch (error) {
      toast.error(`${type} upload failed ❌`);
      console.error("Upload error:", error);
    }
  };

  const handleFileChange = (e, productId, type) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(productId, file, type);
    }
  };


  const handleDownloadTemplate = async () => {
    try {
      const res = await downloadProductTemplate();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "product_template.xlsx");
      document.body.appendChild(link);
      link.click();
      toast.success("Template downloaded ✅");
    } catch {
      toast.error("Failed to download template ❌");
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true); // 🔹 Start loader
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await bulkUploadProducts(formData);
      toast.success(`✅ Upload Completed: ${res.data.created} Created, ${res.data.updated} Updated`);
    } catch {
      toast.error("Bulk upload failed ❌");
    } finally {
      setUploading(false); // 🔹 Stop loader
      e.target.value = ""; // Reset file input
    }
  };


  if (isLoading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4">

      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
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


        <div className="flex flex-wrap gap-2">

          <button
            onClick={() => {
              setEditData(null);
              setForm({
                product_id: "",
                product_name: "",
                sub_category: "",
                cartoon_size: "",
                price: "",
                live_stock: "",
                guarantee: prod.guarantee || "",
                moq: prod.moq || "",
              });
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow cursor-pointer"
          >
            <FiPlus className="text-lg" /> Add Product
          </button>


          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow cursor-pointer"
          >
            <FiDownload className="text-lg" /> Download Template
          </button>


          <label
            className={`flex items-center gap-2 ${uploading ? "bg-purple-400" : "bg-purple-500 hover:bg-purple-600"} text-white px-4 py-2 rounded shadow cursor-pointer`}
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 00-8 8h4z"
                  ></path>
                </svg>
                Uploading...
              </span>
            ) : (
              <>
                <FiUpload className="text-lg" /> Upload Sheet
              </>
            )}
            <input
              type="file"
              accept=".xlsx"
              onChange={handleBulkUpload}
              className="hidden"
              disabled={uploading} // 🔹 Prevent multiple uploads at once
            />
          </label>
        </div>

      </div>
{/* ✅ Total Records Count */}
<div className="mb-2 text-sm text-gray-700 font-medium">
  Total Records: {productsToShow.length}
</div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Category</th>
              <th className="px-4 py-2 border">Product Name</th>
              <th className="px-4 py-2 border">Cartoon</th>
              <th className="px-4 py-2 border">Guarantee</th>
              <th className="px-4 py-2 border">Stock</th>
              <th className="px-4 py-2 border">V_Stock</th>
              <th className="px-4 py-2 border">Price</th>
              <th className="px-4 py-2 border">MOQ</th>
              <th className="px-4 py-2 border">Upload</th>
              <th className="px-4 py-2 border">Image</th>
              <th className="px-4 py-2 border">Active</th>
              <th className="px-4 py-2 border">Edit</th>
              <th className="px-4 py-2 border">Delete</th>
              <th className="px-4 py-2 border">Upload2</th>
              <th className="px-4 py-2 border">Image</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((prod) => (
              <tr key={prod.product_id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{prod.product_id}</td>
                <td className="px-4 py-2 border">{prod.sub_category}</td>
                <td className="px-4 py-2 border">{prod.product_name}</td>
                <td className="px-4 py-2 border">{prod.cartoon_size}</td>
                <td className="px-4 py-2 border">{prod.guarantee}</td>
                <td className="px-4 py-2 border">{prod.live_stock || 0}</td>
                <td className="px-4 py-2 border">{prod.virtual_stock || 0}</td>
                <td className="px-4 py-2 border">{prod.price}</td>
                <td className="px-4 py-2 border">{prod.moq}</td>
                {/* Upload for Image1 */}
                <td className="px-4 py-2 border">
                  <label className="cursor-pointer">
                    <FiUpload className="text-blue-600 hover:text-blue-800" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, prod.product_id, "image")}
                      className="hidden"
                    />
                  </label>
                </td>
                 <td className="px-4 py-2 border">
                  <img
                    src={
                      prod?.image
                        ? `https://res.cloudinary.com/djyr368zj/${prod.image}`
                        : makpower_image
                    } className="w-10 h-10 object-contain bg-gray-50 rounded-lg border self-center" />
                </td>

               
                <td className="px-4 py-2 border text-center">


                  <input
                    type="checkbox"
                    checked={prod.is_active}
                    onChange={() =>
                      toggleStatus(
                        { productId: prod.product_id, isActive: !prod.is_active },
                        {
                          onSuccess: () =>
                            toast.success(
                              `Product ${!prod.is_active ? "Activated ✅" : "Deactivated ❌"}`
                            ),
                          onError: () => toast.error("Failed to update status"),
                        }
                      )
                    }
                  />

                </td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => {
                      setEditData(prod);
                      setForm(prod);
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FiEdit />
                  </button>
                </td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleDelete(prod.product_id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 />
                  </button>
                </td>
                 {/* Upload for Image2 */}
                <td className="px-4 py-2 border">
                  <label className="cursor-pointer">
                    <FiUpload className="text-green-600 hover:text-green-800" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, prod.product_id, "image2")}
                      className="hidden"
                    />
                  </label>
                </td>

                <td className="px-4 py-2 border">
                  <img
                    src={
                      prod?.image2
                        ? `https://res.cloudinary.com/djyr368zj/${prod.image2}`
                        : makpower_image
                    } className="w-10 h-10 object-contain bg-gray-50 rounded-lg border self-center" />
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">⬅️ Prev</button>
          <span>Page {currentPage} / {totalPages}</span>
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next ➡️</button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editData ? "Edit Product" : "Add Product"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product ID</label>
                <input
                  name="product_id"
                  value={form.product_id}
                  onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                  placeholder="Enter Product ID"
                  className="border p-2 w-full rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input
                  name="product_name"
                  value={form.product_name}
                  onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                  placeholder="Enter Product Name"
                  className="border p-2 w-full rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  name="sub_category"
                  value={form.sub_category}
                  onChange={(e) => setForm({ ...form, sub_category: e.target.value })}
                  placeholder="Enter Category"
                  className="border p-2 w-full rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cartoon Size</label>
                <input
                  name="cartoon_size"
                  value={form.cartoon_size}
                  onChange={(e) => setForm({ ...form, cartoon_size: e.target.value })}
                  placeholder="Enter Cartoon Size"
                  className="border p-2 w-full rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  name="price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="Enter Price"
                  className="border p-2 w-full rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <input
                  name="live_stock"
                  type="number"
                  value={form.live_stock}
                  onChange={(e) => setForm({ ...form, live_stock: e.target.value })}
                  placeholder="Enter Stock"
                  className="border p-2 w-full rounded"
                />
              </div>
              <div>
  <label className="block text-sm font-medium mb-1">Guarantee</label>
  <input
    name="guarantee"
    value={form.guarantee || ""}
    onChange={(e) => setForm({ ...form, guarantee: e.target.value })}
    placeholder="Enter Guarantee (e.g. 6 Months)"
    className="border p-2 w-full rounded"
  />
</div>

<div>
  <label className="block text-sm font-medium mb-1">MOQ</label>
  <input
    name="moq"
    type="number"
    value={form.moq || ""}
    onChange={(e) => setForm({ ...form, moq: e.target.value })}
    placeholder="Enter Minimum Order Quantity"
    className="border p-2 w-full rounded"
  />
</div>


              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  {editData ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
