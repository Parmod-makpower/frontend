import { useState } from "react";
import useFuseSearch from "../hooks/useFuseSearch";
import { useAdminAllProducts } from "../hooks/useAdminAllProducts";
import ProductEditModel from "../components/ProductEditModel";
import { useAddProduct, useUpdateProduct, useToggleProductStatus } from "../hooks/useProducts";
import { toast } from "react-toastify";
import { FiUpload, FiEdit, FiDownload } from "react-icons/fi";
import makpower_image from "../assets/images/makpower_image.webp"
import "react-toastify/dist/ReactToastify.css";
import { uploadProductImage, uploadProductImage2, downloadProductTemplate, bulkUploadProducts, exportProductsExcel } from "../api/productApi";

const ITEMS_PER_PAGE = 10;

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
  const { mutate: updateProduct } = useUpdateProduct();
  const { mutate: toggleStatus } = useToggleProductStatus();

  const filteredProducts = useFuseSearch(allProducts, search, {
    keys: ["product_name", "sub_category", "product_id"],
    threshold: 0.3,
  });
  const productsToShow = search ? filteredProducts : allProducts;

  const paginatedProducts = productsToShow.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );


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
              setEditData(null); // ❌ edit mode बंद
              setForm({
                product_id: "",
                product_name: "",
              });
              setShowModal(true); // ✅ modal open
            }}
            className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 cursor-pointer"
          >  + Add Product  </button>

          <button
            onClick={exportProductsExcel}
            className="px-3 py-1.5 border rounded bg-white hover:bg-gray-100 text-sm cursor-pointer"
          >
            Export Excel
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="px-3 py-1.5 border rounded bg-white hover:bg-gray-100 text-sm flex items-center gap-1 cursor-pointer"
          >
            <FiDownload /> Template
          </button>

          <label
            className={`px-3 py-1.5 border rounded bg-white hover:bg-gray-100 text-sm flex items-center gap-1 cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""
              }`}
          >
            <FiUpload /> Upload
            <input type="file" accept=".xlsx" onChange={handleBulkUpload} className="hidden" />
          </label>
        </div>

      </div>
      {/* ✅ Total Records Count */}
      <div className="mb-2 text-sm text-gray-700 font-medium">
        Total Records: {productsToShow.length}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Category</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Carton</th>
              <th className="px-4 py-2 border">Guarantee</th>
              <th className="px-4 py-2 border">Mumbai</th>
              <th className="px-4 py-2 border">Delhi</th>
              <th className="px-4 py-2 border">V_Stock</th>
              <th className="px-4 py-2 border">Price</th>
              <th className="px-4 py-2 border">Ds_Price</th>
              <th className="px-4 py-2 border">MOQ</th>
              <th className="px-4 py-2 border">Rack</th>
              <th className="px-4 py-2 border">Type</th>
              <th className="px-4 py-2 border">Upd</th>
              <th className="px-4 py-2 border">Image</th>
              <th className="px-4 py-2 border">Active</th>
              <th className="px-4 py-2 border">Edit</th>
              <th className="px-4 py-2 border">Upd2</th>
              <th className="px-4 py-2 border">Image</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((prod) => (
              <tr key={prod.product_id} className="hover:bg-gray-50">
                <td className="text-center py-1 border bg-gray-200">{prod.product_id}</td>
                <td className="text-center py-1 border">{prod.sub_category}</td>
                <td className="text-center py-1 border">{prod.product_name}</td>
                <td className="text-center py-1 border bg-yellow-200">{prod.cartoon_size}</td>
                <td className="text-center py-1 border">{prod.guarantee}</td>
                <td className="text-center py-1 border bg-red-200">{prod.mumbai_stock || 0}</td>
                <td className="text-center py-1 border bg-red-200">{prod.live_stock || 0}</td>
                <td className="text-center py-1 border bg-red-200">{prod.virtual_stock || 0}</td>
                <td className="text-center py-1 border bg-blue-200">{prod.price}</td>
                <td className="text-center py-1 border bg-blue-200">{prod.ds_price}</td>
                <td className="text-center py-1 border">{prod.moq}</td>
                <td className="text-center py-1 border bg-green-300">{prod.rack_no}</td>
                <td className="text-center py-1 border">{prod.quantity_type}</td>
                {/* Upload for Image1 */}
                <td className="px-4 py-1 border">
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
                <td className="px-4 py-1 border">
                  <img
                    src={
                      prod?.image
                        ? `https://res.cloudinary.com/djyr368zj/${prod.image}`
                        : makpower_image
                    } className="w-10 h-10 object-contain bg-gray-50 rounded-lg border self-center" />
                </td>


                <td className="px-4 py-1 border text-center">


                  <input
                    type="checkbox"
                    className="cursor-pointer"
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
                <td className="text-center py-1 border">
                  <button
                    onClick={() => {
                      setEditData(prod);
                      setForm(prod);
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    <FiEdit />
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

      {/* Add/Edit Modal */}
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
