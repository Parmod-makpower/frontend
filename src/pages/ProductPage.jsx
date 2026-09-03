// import { useState } from "react";
// import useFuseSearch from "../hooks/useFuseSearch";
// import { useAdminAllProducts } from "../hooks/useAdminAllProducts";
// import ProductEditModel from "../components/ProductEditModel";
// import { useAddProduct, useUpdateProduct, useToggleProductStatus } from "../hooks/useProducts";
// import { toast } from "react-toastify";
// import { FiUpload, FiEdit, FiDownload } from "react-icons/fi";
// import makpower_image from "../assets/images/makpower_image.webp"
// import "react-toastify/dist/ReactToastify.css";
// import { uploadProductImage, uploadProductImage2, downloadProductTemplate, bulkUploadProducts, exportProductsExcel } from "../api/productApi";

// const ITEMS_PER_PAGE = 10;

// export default function ProductPage() {
//   const { data: allProducts = [], isLoading } = useAdminAllProducts();
//   const [search, setSearch] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);

//   const [showModal, setShowModal] = useState(false);
//   const [editData, setEditData] = useState(null);
//   const [form, setForm] = useState({
//     product_id: "",
//     product_name: "",
//     sub_category: "",
//     cartoon_size: "",
//     price: "",
//     live_stock: "",
//     guarantee: "",
//     moq: "",
//   });

//   const [uploading, setUploading] = useState(false); // 🔹 Upload loader state

//   const { mutate: addProduct } = useAddProduct();
//   const { mutate: updateProduct } = useUpdateProduct();
//   const { mutate: toggleStatus } = useToggleProductStatus();

//   const activeProducts = allProducts.filter((p) => p.is_active === true);

//   const filteredProducts = useFuseSearch(activeProducts, search, {
//     keys: ["product_name", "sub_category", "product_id"],
//     threshold: 0.3,
//   });

//   const productsToShow = search ? filteredProducts : activeProducts;

//   const paginatedProducts = productsToShow.slice(
//     (currentPage - 1) * ITEMS_PER_PAGE,
//     currentPage * ITEMS_PER_PAGE
//   );


//   // Submit handler for add/edit
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (editData) {
//       updateProduct(
//         { productId: editData.product_id, updatedData: form },
//         {
//           onSuccess: () => {
//             toast.success("Product updated");
//             setShowModal(false);
//           },
//           onError: () => toast.error("Update failed")
//         }
//       );
//     } else {
//       addProduct(form, {
//         onSuccess: () => {
//           toast.success("Product added");
//           setShowModal(false);
//         },
//         onError: () => toast.error("Add failed")
//       });
//     }
//   };

//   // Image Upload
//   const handleImageUpload = async (productId, file, type = "image") => {
//     try {
//       let response;
//       if (type === "image") {
//         response = await uploadProductImage({ productId, imageFile: file });
//       } else {
//         response = await uploadProductImage2({ productId, imageFile: file });
//       }
//       toast.success(`${type} uploaded successfully ✅`);
//       console.log(`Uploaded ${type} URL:`, response.url);
//     } catch (error) {
//       toast.error(`${type} upload failed ❌`);
//       console.error("Upload error:", error);
//     }
//   };

//   const handleFileChange = (e, productId, type) => {
//     const file = e.target.files[0];
//     if (file) {
//       handleImageUpload(productId, file, type);
//     }
//   };


//   const handleDownloadTemplate = async () => {
//     try {
//       const res = await downloadProductTemplate();
//       const url = window.URL.createObjectURL(new Blob([res.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", "product_template.xlsx");
//       document.body.appendChild(link);
//       link.click();
//       toast.success("Template downloaded ✅");
//     } catch {
//       toast.error("Failed to download template ❌");
//     }
//   };

//   const handleBulkUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setUploading(true); // 🔹 Start loader
//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const res = await bulkUploadProducts(formData);
//       toast.success(`✅ Upload Completed: ${res.data.created} Created, ${res.data.updated} Updated`);
//     } catch {
//       toast.error("Bulk upload failed ❌");
//     } finally {
//       setUploading(false); // 🔹 Stop loader
//       e.target.value = ""; // Reset file input
//     }
//   };


//   if (isLoading) return <p className="p-4">Loading...</p>;

//   return (
//     <div className="p-4">

//       <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
//         {/* Search Bar */}
//         <input
//           type="text"
//           placeholder="🔍 Search by name, category, ID..."
//           value={search}
//           onChange={(e) => {
//             setSearch(e.target.value);
//             setCurrentPage(1);
//           }}
//           className="border p-2 rounded flex-1 min-w-[200px] shadow-sm focus:ring-2 focus:ring-blue-400"
//         />

//         <div className="flex flex-wrap gap-2">
//           <button
//             onClick={() => {
//               setEditData(null); // ❌ edit mode बंद
//               setForm({
//                 product_id: "",
//                 product_name: "",
//               });
//               setShowModal(true); // ✅ modal open
//             }}
//             className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 cursor-pointer"
//           >  + Add Product  </button>

//           <button
//             onClick={exportProductsExcel}
//             className="px-3 py-1.5 border rounded bg-white hover:bg-gray-100 text-sm cursor-pointer"
//           >
//             Export Excel
//           </button>

//           <button
//             onClick={handleDownloadTemplate}
//             className="px-3 py-1.5 border rounded bg-white hover:bg-gray-100 text-sm flex items-center gap-1 cursor-pointer"
//           >
//             <FiDownload /> Template
//           </button>

//           <label
//             className={`px-3 py-1.5 border rounded bg-white hover:bg-gray-100 text-sm flex items-center gap-1 cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""
//               }`}
//           >
//             <FiUpload /> Upload
//             <input type="file" accept=".xlsx" onChange={handleBulkUpload} className="hidden" />
//           </label>
//         </div>

//       </div>
//       {/* ✅ Total Records Count */}
//       <div className="mb-2 text-sm text-gray-700 font-medium">
//         Total Records: {productsToShow.length}
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="min-w-full border text-xs">
//           <thead>
//             <tr className="bg-gray-200">
//               <th className="px-4 py-2 border">ID</th>
//               <th className="px-4 py-2 border">Category</th>
//               <th className="px-4 py-2 border">Name</th>
//               <th className="px-4 py-2 border">Carton</th>
//               <th className="px-4 py-2 border">Guarantee</th>
//               <th className="px-4 py-2 border">Type</th>
//               <th className="px-4 py-2 border">Mah</th>
//               <th className="px-4 py-2 border">Mumbai</th>
//               <th className="px-4 py-2 border">Delhi</th>
//               <th className="px-4 py-2 border">V_Stock</th>
//               <th className="px-4 py-2 border">Price</th>
//               <th className="px-4 py-2 border">Ds_Price</th>
//               <th className="px-4 py-2 border">MOQ</th>
//               <th className="px-4 py-2 border">Rack</th>
//               <th className="px-4 py-2 border">Type</th>
//               <th className="px-4 py-2 border">Upd</th>
//               <th className="px-4 py-2 border">Image</th>
//               <th className="px-4 py-2 border">Active</th>
//               <th className="px-4 py-2 border">Edit</th>
//               <th className="px-4 py-2 border">Upd2</th>
//               <th className="px-4 py-2 border">Image</th>
//             </tr>
//           </thead>
//           <tbody className="text-xs">
//             {paginatedProducts.map((prod) => (
//               <tr key={prod.product_id} className="hover:bg-gray-50 ">
//                 <td className="text-center py-1 border bg-gray-200">{prod.product_id}</td>
//                 <td className="text-center py-1 border">{prod.sub_category}</td>
//                 <td className="text-center py-1 border">{prod.product_name}</td>
//                 <td className="text-center py-1 border bg-yellow-200">{prod.cartoon_size}</td>
//                 <td className="text-center py-1 border">{prod.guarantee}</td>
//                 <td className="text-center py-1 border">{prod.product_type}</td>
//                 <td className="text-center py-1 border">{prod.mah}</td>
//                 <td className="text-center py-1 border bg-red-200">{prod.mumbai_stock || 0}</td>
//                 <td className="text-center py-1 border bg-red-200">{prod.live_stock || 0}</td>
//                 <td className="text-center py-1 border bg-red-200">{prod.virtual_stock || 0}</td>
//                 <td className="text-center py-1 border bg-blue-200">{prod.price}</td>
//                 <td className="text-center py-1 border bg-blue-200">{prod.ds_price}</td>
//                 <td className="text-center py-1 border">{prod.moq}</td>
//                 <td className="text-center py-1 border bg-green-300">{prod.rack_no}</td>
//                 <td className="text-center py-1 border">{prod.quantity_type}</td>
//                 {/* Upload for Image1 */}
//                 <td className="px-4 py-1 border">
//                   <label className="cursor-pointer">
//                     <FiUpload className="text-blue-600 hover:text-blue-800" />
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => handleFileChange(e, prod.product_id, "image")}
//                       className="hidden"
//                     />
//                   </label>
//                 </td>
//                 <td className="px-4 py-1 border">
//                   <img
//                     src={
//                       prod?.image
//                         ? `https://res.cloudinary.com/djyr368zj/${prod.image}`
//                         : makpower_image
//                     } className="w-10 h-10 object-contain bg-gray-50 rounded-lg border self-center" />
//                 </td>


//                 <td className="px-4 py-1 border text-center">


//                   <input
//                     type="checkbox"
//                     className="cursor-pointer"
//                     checked={prod.is_active}
//                     onChange={() =>
//                       toggleStatus(
//                         { productId: prod.product_id, isActive: !prod.is_active },
//                         {
//                           onSuccess: () =>
//                             toast.success(
//                               `Product ${!prod.is_active ? "Activated ✅" : "Deactivated ❌"}`
//                             ),
//                           onError: () => toast.error("Failed to update status"),
//                         }
//                       )
//                     }
//                   />

//                 </td>
//                 <td className="text-center py-1 border">
//                   <button
//                     onClick={() => {
//                       setEditData(prod);
//                       setForm(prod);
//                       setShowModal(true);
//                     }}
//                     className="text-blue-600 hover:text-blue-800 cursor-pointer"
//                   >
//                     <FiEdit />
//                   </button>
//                 </td>

//                 {/* Upload for Image2 */}
//                 <td className="px-4 py-2 border">
//                   <label className="cursor-pointer">
//                     <FiUpload className="text-green-600 hover:text-green-800" />
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => handleFileChange(e, prod.product_id, "image2")}
//                       className="hidden"
//                     />
//                   </label>
//                 </td>

//                 <td className="px-4 py-2 border">
//                   <img
//                     src={
//                       prod?.image2
//                         ? `https://res.cloudinary.com/djyr368zj/${prod.image2}`
//                         : makpower_image
//                     } className="w-10 h-10 object-contain bg-gray-50 rounded-lg border self-center" />
//                 </td>
//               </tr>
//             ))}
//           </tbody>

//         </table>
//       </div>

//       {/* Add/Edit Modal */}
//       <ProductEditModel
//         show={showModal}
//         onClose={() => setShowModal(false)}
//         onSubmit={handleSubmit}
//         form={form}
//         setForm={setForm}
//         editData={editData}
//       />
//     </div>
//   );
// }


import { useState } from "react";
import useFuseSearch from "../hooks/useFuseSearch";
import { useAdminAllProducts } from "../hooks/useAdminAllProducts";
import ProductEditModel from "../components/ProductEditModel";
import {
  useAddProduct,
  useUpdateProduct,
  useToggleProductStatus,
} from "../hooks/useProducts";
import { toast } from "react-toastify";
import { FiUpload, FiEdit, FiDownload, FiPlus } from "react-icons/fi";
import makpower_image from "../assets/images/makpower_image.webp";
import "react-toastify/dist/ReactToastify.css";

import {
  uploadProductImage,
  uploadProductImage2,
  downloadProductTemplate,
  bulkUploadProducts,
  exportProductsExcel,
} from "../api/productApi";

const ITEMS_PER_PAGE = 10;

const emptyForm = {
  product_id: "",
  product_name: "",
  sub_category: "",
  cartoon_size: "",
  price: "",
  live_stock: "",
  guarantee: "",
  moq: "",
};

export default function ProductPage() {
  const { data: allProducts = [], isLoading } = useAdminAllProducts();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  const { mutate: addProduct } = useAddProduct();
  const { mutate: updateProduct } = useUpdateProduct();
  const { mutate: toggleStatus } = useToggleProductStatus();

  const activeProducts = allProducts.filter(
    (product) => product.is_active === true
  );

  const filteredProducts = useFuseSearch(activeProducts, search, {
    keys: ["product_name", "sub_category", "product_id"],
    threshold: 0.3,
  });

  const productsToShow = search ? filteredProducts : activeProducts;

  const totalPages = Math.ceil(
    productsToShow.length / ITEMS_PER_PAGE
  );

  const paginatedProducts = productsToShow.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editData) {
      updateProduct(
        {
          productId: editData.product_id,
          updatedData: form,
        },
        {
          onSuccess: () => {
            toast.success("Product updated successfully");
            setShowModal(false);
          },
          onError: () => {
            toast.error("Update failed");
          },
        }
      );
    } else {
      addProduct(form, {
        onSuccess: () => {
          toast.success("Product added successfully");
          setShowModal(false);
        },
        onError: () => {
          toast.error("Add failed");
        },
      });
    }
  };

  const handleImageUpload = async (
    productId,
    file,
    type = "image"
  ) => {
    try {
      let response;

      if (type === "image") {
        response = await uploadProductImage({
          productId,
          imageFile: file,
        });
      } else {
        response = await uploadProductImage2({
          productId,
          imageFile: file,
        });
      }

      toast.success(`${type} uploaded successfully ✅`);
      console.log(`Uploaded ${type} URL:`, response.url);
    } catch (error) {
      toast.error(`${type} upload failed ❌`);
      console.error("Upload error:", error);
    }
  };

  const handleFileChange = (e, productId, type) => {
    const file = e.target.files?.[0];

    if (file) {
      handleImageUpload(productId, file, type);
    }

    e.target.value = "";
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await downloadProductTemplate();

      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "product_template.xlsx");

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Template downloaded ✅");
    } catch (error) {
      toast.error("Failed to download template ❌");
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await bulkUploadProducts(formData);

      toast.success(
        `Upload Completed: ${response.data.created} Created, ${response.data.updated} Updated`
      );
    } catch (error) {
      toast.error("Bulk upload failed ❌");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const getImageUrl = (image) => {
    if (!image) return makpower_image;

    if (image.startsWith("http")) {
      return image;
    }

    return `https://res.cloudinary.com/djyr368zj/${image}`;
  };

  const openAddModal = () => {
    setEditData(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditData(product);
    setForm(product);
    setShowModal(true);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="p-5 text-sm text-gray-600">
        Loading products...
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 p-3 sm:p-4">
      {/* Header */}
      <div className="mb-4 flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="min-w-0 flex-1">
          <input
            type="text"
            placeholder="Search by name, category, ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
          >
            <FiPlus size={14} />
            Add Product
          </button>

          <button
            onClick={exportProductsExcel}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Export Excel
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
          >
            <FiDownload size={14} />
            Template
          </button>

          <label
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100 ${
              uploading
                ? "pointer-events-none opacity-50"
                : ""
            }`}
          >
            <FiUpload size={14} />
            {uploading ? "Uploading..." : "Upload"}

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleBulkUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Records Count */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-gray-600">
          Total Records:{" "}
          <span className="font-semibold text-gray-900">
            {productsToShow.length}
          </span>
        </p>

        <p className="text-xs text-gray-500">
          Page {totalPages === 0 ? 0 : currentPage} of {totalPages}
        </p>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm lg:overflow-x-hidden">
        <table className="w-full table-fixed border-collapse text-left text-[11px]">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="w-[5%] border-b border-gray-200 px-2 py-2 text-center font-semibold">
                ID
              </th>

              <th className="w-[7%] border-b border-gray-200 px-2 py-2 text-center font-semibold">
                Category
              </th>

              <th className="w-[13%] border-b border-gray-200 px-2 py-2 text-center font-semibold">
                Name
              </th>

              <th className="w-[5%] border-b border-gray-200 px-2 py-2 text-center font-semibold">
                Carton
              </th>

              <th className="w-[6%] border-b border-gray-200 px-2 py-2 text-center font-semibold">
                Guarantee
              </th>

              <th className="w-[5%] border-b border-gray-200 px-2 py-2 text-center font-semibold">
                Type
              </th>

              <th className="w-[5%] border-b border-gray-200 px-2 py-2 text-center font-semibold">
                Mah
              </th>

              <th className="w-[5%] border-b border-gray-200 px-2 py-2 text-center font-semibold">
                Mumbai
              </th>

              <th className="w-[5%] border-b border-gray-200 px-2 py-2 text-center font-semibold">
                Delhi
              </th>

              <th className="w-[5%] border-b border-gray-200 px-2 py-2 text-center font-semibold">
                V_Stock
              </th>

              <th className="w-[6%] border-b border-gray-200 px-2 py-2 text-center font-semibold">
                Price
              </th>

              <th className="w-[6%] border-b border-gray-200 px-2 py-2 text-center font-semibold">
                Ds_Price
              </th>

              <th className="w-[5%] border-b border-gray-200 px-2 py-2 text-center font-semibold">
                MOQ
              </th>

              <th className="w-[5%] border-b border-gray-200 px-2 py-2 text-center font-semibold">
                Rack
              </th>

              <th className="w-[5%] border-b border-gray-200 px-2 py-2 text-center font-semibold">
                Q.Type
              </th>

              <th className="w-[4%] border-b border-gray-200 px-2 py-2 text-center font-semibold">
                Upd
              </th>

              <th className="w-[5%] border-b border-gray-200 px-2 py-2 text-center font-semibold">
                Image
              </th>

              <th className="w-[4%] border-b border-gray-200 px-2 py-2 text-center font-semibold">
                Active
              </th>

              <th className="w-[4%] border-b border-gray-200 px-2 py-2 text-center font-semibold">
                Edit
              </th>

              <th className="w-[4%] border-b border-gray-200 px-2 py-2 text-center font-semibold">
                Upd2
              </th>

              <th className="w-[5%] border-b border-gray-200 px-2 py-2 text-center font-semibold">
                Image
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedProducts.length === 0 ? (
              <tr>
                <td
                  colSpan="21"
                  className="py-8 text-center text-sm text-gray-500"
                >
                  No products found
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product) => (
                <tr
                  key={product.product_id}
                  className="transition hover:bg-blue-50"
                >
                  <td className="truncate border-b border-gray-200 bg-gray-100 px-1 py-2 text-center font-medium">
                    {product.product_id}
                  </td>

                  <td className="truncate border-b border-gray-200 px-1 py-2 text-center">
                    {product.sub_category || "-"}
                  </td>

                  <td
                    title={product.product_name}
                    className="truncate border-b border-gray-200 px-1 py-2 text-center font-medium"
                  >
                    {product.product_name || "-"}
                  </td>

                  <td className="border-b border-gray-200 bg-yellow-100 px-1 py-2 text-center">
                    {product.cartoon_size || 0}
                  </td>

                  <td className="truncate border-b border-gray-200 px-1 py-2 text-center">
                    {product.guarantee || "-"}
                  </td>

                  <td className="truncate border-b border-gray-200 px-1 py-2 text-center">
                    {product.product_type || "-"}
                  </td>

                  <td className="border-b border-gray-200 px-1 py-2 text-center">
                    {product.mah || "-"}
                  </td>

                  <td className="border-b border-gray-200 bg-red-100 px-1 py-2 text-center font-medium">
                    {product.mumbai_stock || 0}
                  </td>

                  <td className="border-b border-gray-200 bg-red-100 px-1 py-2 text-center font-medium">
                    {product.live_stock || 0}
                  </td>

                  <td className="border-b border-gray-200 bg-red-100 px-1 py-2 text-center font-medium">
                    {product.virtual_stock || 0}
                  </td>

                  <td className="border-b border-gray-200 bg-blue-100 px-1 py-2 text-center font-medium">
                    {product.price || 0}
                  </td>

                  <td className="border-b border-gray-200 bg-blue-100 px-1 py-2 text-center font-medium">
                    {product.ds_price || 0}
                  </td>

                  <td className="border-b border-gray-200 px-1 py-2 text-center">
                    {product.moq || 0}
                  </td>

                  <td className="border-b border-gray-200 bg-green-100 px-1 py-2 text-center font-medium">
                    {product.rack_no || "-"}
                  </td>

                  <td className="truncate border-b border-gray-200 px-1 py-2 text-center">
                    {product.quantity_type || "-"}
                  </td>

                  {/* Image 1 Upload */}
                  <td className="border-b border-gray-200 px-1 py-2 text-center">
                    <label className="inline-flex cursor-pointer items-center justify-center">
                      <FiUpload
                        size={14}
                        className="text-blue-600 transition hover:text-blue-800"
                      />

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileChange(
                            e,
                            product.product_id,
                            "image"
                          )
                        }
                        className="hidden"
                      />
                    </label>
                  </td>

                  {/* Image 1 Preview */}
                  <td className="border-b border-gray-200 px-1 py-1 text-center">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.product_name || "Product"}
                      className="mx-auto h-9 w-9 rounded-md border bg-gray-50 object-contain"
                    />
                  </td>

                  {/* Active Status */}
                  <td className="border-b border-gray-200 px-1 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={Boolean(product.is_active)}
                      onChange={() =>
                        toggleStatus(
                          {
                            productId: product.product_id,
                            isActive: !product.is_active,
                          },
                          {
                            onSuccess: () =>
                              toast.success(
                                `Product ${
                                  !product.is_active
                                    ? "Activated ✅"
                                    : "Deactivated ❌"
                                }`
                              ),
                            onError: () =>
                              toast.error(
                                "Failed to update status"
                              ),
                          }
                        )
                      }
                      className="h-3.5 w-3.5 cursor-pointer accent-blue-600"
                    />
                  </td>

                  {/* Edit */}
                  <td className="border-b border-gray-200 px-1 py-2 text-center">
                    <button
                      onClick={() => openEditModal(product)}
                      className="inline-flex cursor-pointer items-center justify-center text-blue-600 transition hover:text-blue-800"
                      title="Edit Product"
                    >
                      <FiEdit size={14} />
                    </button>
                  </td>

                  {/* Image 2 Upload */}
                  <td className="border-b border-gray-200 px-1 py-2 text-center">
                    <label className="inline-flex cursor-pointer items-center justify-center">
                      <FiUpload
                        size={14}
                        className="text-green-600 transition hover:text-green-800"
                      />

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileChange(
                            e,
                            product.product_id,
                            "image2"
                          )
                        }
                        className="hidden"
                      />
                    </label>
                  </td>

                  {/* Image 2 Preview */}
                  <td className="border-b border-gray-200 px-1 py-1 text-center">
                    <img
                      src={getImageUrl(product.image2)}
                      alt={`${product.product_name || "Product"} 2`}
                      className="mx-auto h-9 w-9 rounded-md border bg-gray-50 object-contain"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`rounded-md px-3 py-1.5 text-xs ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

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