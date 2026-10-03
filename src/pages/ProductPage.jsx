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

// const ITEMS_PER_PAGE = 100;

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
//             className="px-3 .5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 cursor-pointer"
//           >  + Add Product  </button>

//           <button
//             onClick={exportProductsExcel}
//             className="px-3 .5 border rounded bg-white hover:bg-gray-100 text-sm cursor-pointer"
//           >
//             Export Excel
//           </button>

//           <button
//             onClick={handleDownloadTemplate}
//             className="px-3 .5 border rounded bg-white hover:bg-gray-100 text-sm flex items-center gap-1 cursor-pointer"
//           >
//             <FiDownload /> Template
//           </button>

//           <label
//             className={`px-3 .5 border rounded bg-white hover:bg-gray-100 text-sm flex items-center gap-1 cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""
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
//               <th className="px-4 py-2 border">CTN</th>
//               <th className="px-4 py-2 border">Guarantee</th>
//               <th className="px-4 py-2 border">Type</th>
//               <th className="px-4 py-2 border">Mah</th>
//               <th className="px-4 py-2 border">Mumbai</th>
//               <th className="px-4 py-2 border">Delhi</th>
//               <th className="px-4 py-2 border">V_Stock</th>
//               <th className="px-4 py-2 border">SS</th>
//               <th className="px-4 py-2 border">DS</th>
//               <th className="px-4 py-2 border">DLR</th>
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
//                 <td className="text-center  border bg-gray-200">{prod.product_id}</td>
//                 <td className="text-center  border">{prod.sub_category}</td>
//                 <td className="text-center  border">{prod.product_name}</td>
//                 <td className="text-center  border bg-yellow-200">{prod.cartoon_size}</td>
//                 <td className="text-center  border">{prod.guarantee}</td>
//                 <td className="text-center  border">{prod.product_type}</td>
//                 <td className="text-center  border">{prod.mah}</td>
//                 <td className="text-center  border bg-red-200">{prod.mumbai_stock || 0}</td>
//                 <td className="text-center  border bg-red-200">{prod.live_stock || 0}</td>
//                 <td className="text-center  border bg-red-200">{prod.virtual_stock || 0}</td>
//                 <td className="text-center  border bg-blue-200">{prod.price}</td>
//                 <td className="text-center  border bg-blue-200">{prod.ds_price}</td>
//                 <td className="text-center  border bg-blue-200">{prod.dlr_price}</td>
//                 <td className="text-center  border">{prod.moq}</td>
//                 <td className="text-center  border bg-green-300">{prod.rack_no}</td>
//                 <td className="text-center  border">{prod.quantity_type}</td>
//                 {/* Upload for Image1 */}
//                 <td className="px-4  border">
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
//                 <td className="px-4  border">
//                   <img
//                     src={
//                       prod?.image
//                         ? `https://res.cloudinary.com/djyr368zj/${prod.image}`
//                         : makpower_image
//                     } className="w-10 h-6 object-contain bg-gray-50 rounded-lg  self-center" />
//                 </td>


//                 <td className="px-4  border text-center">


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
//                 <td className="text-center  border">
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
//                     } className="w-10 h-6 object-contain bg-gray-50 rounded-lg self-center" />
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




import { useMemo, useState } from "react";

import useFuseSearch from "../hooks/useFuseSearch";
import { useAdminAllProducts } from "../hooks/useAdminAllProducts";
import ProductEditModel from "../components/ProductEditModel";

import {
  useAddProduct,
  useUpdateProduct,
  useToggleProductStatus,
} from "../hooks/useProducts";

import { toast } from "react-toastify";

import {
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiEdit,
  FiFileText,
  FiPackage,
  FiPower,
  FiSearch,
  FiUpload,
} from "react-icons/fi";

import makpower_image from "../assets/images/makpower_image.webp";

import "react-toastify/dist/ReactToastify.css";

import {
  uploadProductImage,
  uploadProductImage2,
  downloadProductTemplate,
  bulkUploadProducts,
  exportProductsExcel,
} from "../api/productApi";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 17;

const EMPTY_FORM = {
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
  const { data: allProducts = [], isLoading } =
    useAdminAllProducts();
     const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [uploading, setUploading] = useState(false);

  /* =========================================================
     MUTATIONS
  ========================================================= */

  const { mutate: addProduct } = useAddProduct();
  const { mutate: updateProduct } = useUpdateProduct();
  const { mutate: toggleStatus } = useToggleProductStatus();

  /* =========================================================
     PRODUCTS
  ========================================================= */

  const activeProducts = useMemo(
    () =>
      allProducts.filter(
        (product) => product?.is_active === true
      ),
    [allProducts]
  );

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredProducts = useFuseSearch(
    activeProducts,
    search,
    {
      keys: [
        "product_name",
        "sub_category",
        "product_id",
      ],
      threshold: 0.3,
    }
  );

  const productsToShow = search
    ? filteredProducts
    : activeProducts;

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      productsToShow.length / ITEMS_PER_PAGE
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safePage - 1) * ITEMS_PER_PAGE;

  const endIndex =
    startIndex + ITEMS_PER_PAGE;

  const paginatedProducts =
    productsToShow.slice(
      startIndex,
      endIndex
    );

  const paginationItems = useMemo(() => {
    if (totalPages <= 6) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    if (safePage <= 3) {
      return [
        1,
        2,
        3,
        4,
        "...",
        totalPages,
      ];
    }

    if (safePage >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      safePage - 1,
      safePage,
      safePage + 1,
      "...",
      totalPages,
    ];
  }, [safePage, totalPages]);

  const goToPage = (page) => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);
  };

  /* =========================================================
     ADD / EDIT
  ========================================================= */

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
            toast.success("Product updated");
            setShowModal(false);
          },
          onError: () =>
            toast.error("Update failed"),
        }
      );
    } else {
      addProduct(form, {
        onSuccess: () => {
          toast.success("Product added");
          setShowModal(false);
        },
        onError: () =>
          toast.error("Add failed"),
      });
    }
  };

  /* =========================================================
     IMAGE UPLOAD
  ========================================================= */

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

      toast.success(
        `${type} uploaded successfully ✅`
      );

      console.log(
        `Uploaded ${type} URL:`,
        response.url
      );
    } catch (error) {
      toast.error(
        `${type} upload failed ❌`
      );

      console.error(
        "Upload error:",
        error
      );
    }
  };

  const handleFileChange = (
    e,
    productId,
    type
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      handleImageUpload(
        productId,
        file,
        type
      );
    }

    e.target.value = "";
  };

  /* =========================================================
     TEMPLATE
  ========================================================= */

  const handleDownloadTemplate = async () => {
    try {
      const res =
        await downloadProductTemplate();

      const url =
        window.URL.createObjectURL(
          new Blob([res.data])
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        "product_template.xlsx"
      );

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success(
        "Template downloaded ✅"
      );
    } catch {
      toast.error(
        "Failed to download template ❌"
      );
    }
  };

  /* =========================================================
     BULK UPLOAD
  ========================================================= */

  const handleBulkUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    const formData = new FormData();

    formData.append(
      "file",
      file
    );

    try {
      const res =
        await bulkUploadProducts(
          formData
        );

      toast.success(
        `✅ Upload Completed: ${res.data.created} Created, ${res.data.updated} Updated`
      );
    } catch {
      toast.error(
        "Bulk upload failed ❌"
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-[12px] text-slate-600">
        Loading products...
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col ">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className=" flex shrink-0 items-center justify-between">

        <div className="flex items-center gap-2">

          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-red-500 to-orange-500 text-white">
            <FiPackage size={14} />
          </div>

          <div>
            <div className="flex items-center gap-2">

              <h1 className="text-[15px] font-bold text-slate-800">
                Products
              </h1>

              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                {activeProducts.length.toLocaleString()} Active
              </span>

            </div>

            <p className="text-[11px] text-slate-500">
              Product catalogue & inventory
            </p>
          </div>

        </div>

        <span className="text-[11px] font-medium text-slate-600">
          {productsToShow.length.toLocaleString()} records
        </span>

      </div>


      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div
        className="
          mb-1.5
          flex shrink-0
          flex-col
          gap-1
          rounded-md
          border border-slate-300
          bg-white
          p-1
          shadow-sm
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >

        {/* SEARCH */}

        <div className="relative min-w-0 lg:w-[350px]">

          <FiSearch
            size={13}
            className="
              pointer-events-none
              absolute
              left-2
              top-1/2
              -translate-y-1/2
              text-slate-500
            "
          />

          <input
            type="text"
            value={search}
            placeholder="Search product, category or ID..."
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="
              h-7
              w-full
              rounded
              border border-slate-300
              bg-white
              pl-7
              pr-2
              text-[12px]
              font-medium
              text-slate-800
              outline-none
              placeholder:text-slate-400
              focus:border-red-400
              focus:ring-1
              focus:ring-red-100
            "
          />

        </div>


        {/* ACTIONS */}

        <div className="flex flex-wrap items-center gap-1">

          <button
            type="button"
            onClick={() => {
              setEditData(null);

              setForm({
                product_id: "",
                product_name: "",
              });

              setShowModal(true);
            }}
            className="
              inline-flex
              h-7
              items-center
              gap-1
              rounded
              bg-gradient-to-r
              from-red-500
              to-orange-500
              px-2
              text-[12px]
              font-semibold
              text-white
              shadow-sm
              hover:from-red-600
              hover:to-orange-600
            "
          >
            <span className="text-xs">+</span>
            Add
          </button>

<button
  type="button"
  onClick={() => navigate("/inactive")}
  className="
    inline-flex
    h-7
    items-center
    gap-1
    rounded
    border
    border-red-200
    bg-red-50
    px-2
    text-[12px]
    font-semibold
    text-red-600
    transition
    hover:border-red-300
    hover:bg-red-100
    hover:text-red-700
  "
  title="View inactive products"
>
  <FiPower size={12} />
  Inactive
</button>
          <button
            type="button"
            onClick={exportProductsExcel}
            className="
              inline-flex
              h-7
              items-center
              gap-1
              rounded
              border border-slate-300
              bg-white
              px-2
              text-[12px]
              font-semibold
              text-slate-700
              hover:border-slate-400
              hover:bg-slate-50
            "
          >
            <FiDownload size={12} />
            Export
          </button>


          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="
              inline-flex
              h-7
              items-center
              gap-1
              rounded
              border border-slate-300
              bg-white
              px-2
              text-[12px]
              font-semibold
              text-slate-700
              hover:border-slate-400
              hover:bg-slate-50
            "
          >
            <FiFileText size={12} />
            Template
          </button>


          <label
            className={`
              inline-flex
              h-7
              items-center
              gap-1
              rounded
              border border-slate-300
              bg-white
              px-2
              text-[12px]
              font-semibold
              text-slate-700
              ${
                uploading
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer hover:border-slate-400 hover:bg-slate-50"
              }
            `}
          >

            {uploading ? (
              <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-slate-300 border-t-red-500" />
            ) : (
              <FiUpload size={12} />
            )}

            {uploading ? "Uploading" : "Upload"}

            <input
              type="file"
              accept=".xlsx"
              onChange={handleBulkUpload}
              className="hidden"
            />

          </label>

        </div>

      </div>


      {/* =====================================================
          TABLE CARD
      ===================================================== */}

      <div
        className="
          flex
          min-h-0
          flex-1
          flex-col
          overflow-hidden
          rounded-md
          border border-slate-300
          bg-white
          shadow-sm
        "
      >

        {/* TABLE BAR */}

        <div
          className="
            flex
            h-7
            shrink-0
            items-center
            justify-between
            border-b border-slate-300
            bg-slate-100
            px-2
          "
        >

          <div className="flex items-center gap-1.5">

            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

            <span className="text-[11px] font-bold text-slate-800">
              Product List
            </span>

          </div>

          <span className="text-[11px] font-semibold text-slate-600">
            Page {safePage} / {totalPages}
          </span>

        </div>


        {/* ===================================================
            TABLE
        =================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-auto
            [scrollbar-width:thin]
          "
        >

          <table
            className="
              min-w-[1500px]
              w-full
              border-collapse
              text-[12px]
              text-slate-800
            "
          >

            <thead className="sticky top-0 z-30">

              {/* GROUP HEADER */}

              <tr className="h-6 bg-slate-200">

                <th
                  colSpan={7}
                  className="
                    border border-slate-400
                    bg-slate-200
                    px-1
                    text-center
                    text-[12px]
                    font-extrabold
                    uppercase
                    tracking-wide
                    text-slate-700
                  "
                >
                  Product
                </th>

                <th
                  colSpan={4}
                  className="
                    border border-red-200
                    bg-red-50
                    px-1
                    text-center
                    text-[12px]
                    font-extrabold
                    uppercase
                    tracking-wide
                    text-red-700
                  "
                >
                  Stock
                </th>

                <th
                  colSpan={4}
                  className="
                    border border-blue-200
                    bg-blue-50
                    px-1
                    text-center
                    text-[12px]
                    font-extrabold
                    uppercase
                    tracking-wide
                    text-blue-700
                  "
                >
                  Price
                </th>

                <th
                  colSpan={8}
                  className="
                    border border-slate-400
                    bg-slate-200
                    px-1
                    text-center
                    text-[12px]
                    font-extrabold
                    uppercase
                    tracking-wide
                    text-slate-700
                  "
                >
                  Details / Actions
                </th>

              </tr>


              {/* COLUMN HEADER */}

              <tr className="h-6 bg-white">

                <th className="sticky left-0 z-40 w-8 min-w-8 border border-slate-400 bg-slate-100 px-1 text-center font-bold text-slate-800">
                  #
                </th>

                <th className="w-9 min-w-9 border border-slate-300 px-1 text-center font-bold text-slate-800">
                  Code
                </th>

                <th className="w-15 min-w-15 border border-slate-300 px-1 text-center font-bold text-slate-800">
                  Category
                </th>

                <th className="w-20 min-w-20 border border-slate-300 px-1 text-center font-bold text-slate-800">
                  Name
                </th>

                <th className="w-9 min-w-9 border border-slate-300 bg-amber-50 px-1 text-center font-bold text-amber-800">
                  CTN
                </th>

                <th className="w-9 min-w-9 border border-slate-300 text-center font-bold text-slate-800">
                  Guarantee
                </th>

                <th className="w-9 min-w-9 border border-slate-400 px-1 text-center font-bold text-slate-800">
                  Type
                </th>


                {/* STOCK */}

                <th className="w-9 min-w-9 border border-red-200 bg-red-50 px-1 text-center font-bold text-red-700">
                  Mah
                </th>

                <th className="w-9 min-w-9 border border-red-200 bg-red-50 px-1 text-center font-bold text-red-700">
                  Mum
                </th>

                <th className="w-9 min-w-9 border border-red-200 bg-red-50 px-1 text-center font-bold text-red-700">
                  Delhi
                </th>

                <th className="w-9 min-w-9 border border-red-200 bg-red-50 px-1 text-center font-bold text-red-700">
                  V
                </th>


                {/* PRICE */}

                <th className="w-9 min-w-9 border border-blue-200 bg-blue-50 px-1 text-center font-bold text-blue-700">
                  SS
                </th>

                <th className="w-9 min-w-9 border border-blue-200 bg-blue-50 px-1 text-center font-bold text-blue-700">
                  DS
                </th>

                <th className="w-9 min-w-9 border border-blue-200 bg-blue-50 px-1 text-center font-bold text-blue-700">
                  DLR
                </th>

                <th className="w-9 min-w-9 border border-blue-200 bg-blue-50 px-1 text-center font-bold text-blue-700">
                  MOQ
                </th>


                {/* DETAILS */}

                <th className="w-9 min-w-9 border border-slate-300 bg-emerald-50 px-1 text-center font-bold text-emerald-700">
                  Rack
                </th>

                <th className="w-9 min-w-9 border border-slate-300 px-1 text-center font-bold text-slate-800">
                  Qty
                </th>

                <th className="w-9 min-w-9 border border-slate-300 px-1 text-center font-bold text-slate-800">
                  Up
                </th>

                <th className="w-9 min-w-9 border border-slate-300 px-1 text-center font-bold text-slate-800">
                  Img
                </th>

                <th className="w-9 min-w-9 border border-slate-300 px-1 text-center font-bold text-slate-800">
                  On
                </th>

                <th className="w-9 min-w-9 border border-slate-300 px-1 text-center font-bold text-slate-800">
                  Edit
                </th>

                <th className="w-9 min-w-9 border border-slate-300 px-1 text-center font-bold text-slate-800">
                  Up2
                </th>

                <th className="w-9 min-w-9 border border-slate-300 px-1 text-center font-bold text-slate-800">
                  Img
                </th>

              </tr>

            </thead>


            {/* ===================================================
                BODY
            =================================================== */}

            <tbody>

              {paginatedProducts.length === 0 ? (

                <tr>

                  <td
                    colSpan={23}
                    className="
                      h-32
                      border border-slate-300
                      text-center
                      text-[12px]
                      font-medium
                      text-slate-500
                    "
                  >
                    No products found
                  </td>

                </tr>

              ) : (

                paginatedProducts.map(
                  (prod, index) => {

                    const rowNumber =
                      startIndex + index + 1;

                    return (
                      <tr
                        key={prod.product_id}
                        className="
                          group
                          h-6
                        "
                      >

                        {/* # */}

                        <td
                          className="
                            sticky
                            left-0
                            z-20
                            border border-slate-300
                            bg-slate-100
                            px-0.5
                            text-center
                            font-semibold
                            text-slate-700
                            group-hover:bg-slate-200
                          "
                        >
                          {rowNumber}
                        </td>


                        {/* CODE */}

                        <td
                          className="
                            truncate
                            border border-slate-300
                            px-1
                            text-center
                            font-bold
                            text-slate-800
                            group-hover:bg-slate-100
                          "
                          title={prod.product_id}
                        >
                          {prod.product_id}
                        </td>


                        {/* CATEGORY */}

                        <td
                          className="
                            max-w-15
                            truncate
                            border border-slate-300
                            px-1
                            text-center
                            font-medium
                            text-slate-700
                            group-hover:bg-slate-100
                          "
                          title={prod.sub_category}
                        >
                          {prod.sub_category || "—"}
                        </td>


                        {/* NAME */}

                        <td
                          className="
                            max-w-20
                            truncate
                            border border-slate-300
                            px-1
                            text-center
                            font-semibold
                            text-slate-800
                            group-hover:bg-slate-100
                          "
                          title={prod.product_name}
                        >
                          {prod.product_name || "—"}
                        </td>


                        {/* CTN */}

                        <td
                          className="
                            border border-amber-200
                            bg-amber-50
                            px-1
                            text-center
                            font-bold
                            text-amber-800
                            group-hover:bg-amber-100
                          "
                        >
                          {prod.cartoon_size || "—"}
                        </td>


                        {/* GUARANTEE */}

                        <td
                          className="
                            max-w-9
                            truncate
                            border border-slate-300
                            px-1
                            text-center
                            font-medium
                            text-slate-700
                            group-hover:bg-slate-100
                          "
                          title={prod.guarantee}
                        >
                          {prod.guarantee || "—"}
                        </td>


                        {/* TYPE */}

                        <td
                          className="
                            max-w-9
                            truncate
                            border border-slate-300
                            px-1
                            text-center
                            font-medium
                            text-slate-700
                            group-hover:bg-slate-100
                          "
                          title={prod.product_type}
                        >
                          {prod.product_type || "—"}
                        </td>


                        {/* MAH */}

                        <td
                          className="
                            border border-red-200
                            bg-red-50
                            px-1
                            text-center
                            font-bold
                            text-red-700
                            group-hover:bg-red-100
                          "
                        >
                          {prod.mah || "—"}
                        </td>


                        {/* MUMBAI */}

                        <td
                          className="
                            border border-red-200
                            bg-red-50
                            px-1
                            text-center
                            font-bold
                            text-red-700
                            group-hover:bg-red-100
                          "
                        >
                          {prod.mumbai_stock || 0}
                        </td>


                        {/* DELHI */}

                        <td
                          className="
                            border border-red-200
                            bg-red-50
                            px-1
                            text-center
                            font-bold
                            text-red-700
                            group-hover:bg-red-100
                          "
                        >
                          {prod.live_stock || 0}
                        </td>


                        {/* V STOCK */}

                        <td
                          className="
                            border border-red-200
                            bg-red-50
                            px-1
                            text-center
                            font-extrabold
                            text-red-700
                            group-hover:bg-red-100
                          "
                        >
                          {prod.virtual_stock || 0}
                        </td>


                        {/* SS */}

                        <td
                          className="
                            border border-blue-200
                            bg-blue-50
                            px-1
                            text-center
                            font-bold
                            text-blue-700
                            group-hover:bg-blue-100
                          "
                        >
                          {prod.price ?? "—"}
                        </td>


                        {/* DS */}

                        <td
                          className="
                            border border-blue-200
                            bg-blue-50
                            px-1
                            text-center
                            font-bold
                            text-blue-700
                            group-hover:bg-blue-100
                          "
                        >
                          {prod.ds_price ?? "—"}
                        </td>


                        {/* DLR */}

                        <td
                          className="
                            border border-blue-200
                            bg-blue-50
                            px-1
                            text-center
                            font-bold
                            text-blue-700
                            group-hover:bg-blue-100
                          "
                        >
                          {prod.dlr_price ?? "—"}
                        </td>


                        {/* MOQ */}

                        <td
                          className="
                            border border-blue-200
                            bg-blue-50
                            px-1
                            text-center
                            font-semibold
                            text-slate-800
                            group-hover:bg-blue-100
                          "
                        >
                          {prod.moq || "—"}
                        </td>


                        {/* RACK */}

                        <td
                          className="
                            border border-slate-300
                            px-1
                            text-center
                            group-hover:bg-slate-100
                          "
                        >

                          {prod.rack_no ? (
                            <span
                              className="
                                rounded
                                bg-emerald-50
                                px-1
                                py-0.5
                                text-[10px]
                                font-bold
                                text-emerald-700
                              "
                            >
                              {prod.rack_no}
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              —
                            </span>
                          )}

                        </td>


                        {/* QUANTITY TYPE */}

                        <td
                          className="
                            max-w-9
                            truncate
                            border border-slate-300
                            px-1
                            text-center
                            font-medium
                            text-slate-700
                            group-hover:bg-slate-100
                          "
                          title={prod.quantity_type}
                        >
                          {prod.quantity_type || "—"}
                        </td>


                        {/* UPLOAD IMAGE */}

                        <td
                          className="
                            border border-slate-300
                            px-0.5
                            text-center
                            group-hover:bg-slate-100
                          "
                        >

                          <label
                            title="Upload image"
                            className="
                              inline-flex
                              h-5 w-5
                              cursor-pointer
                              items-center
                              justify-center
                              rounded
                              text-red-600
                              hover:bg-red-50
                            "
                          >

                            <FiUpload size={12} />

                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileChange(
                                  e,
                                  prod.product_id,
                                  "image"
                                )
                              }
                              className="hidden"
                            />

                          </label>

                        </td>


                        {/* IMAGE */}

                        <td
                          className="
                            border border-slate-300
                            px-0.5
                            text-center
                            group-hover:bg-slate-100
                          "
                        >

                          <div
                            className="
                              mx-auto
                              flex
                              h-5
                              w-8
                              items-center
                              justify-center
                              overflow-hidden
                              rounded
                              border border-slate-300
                              bg-slate-50
                            "
                          >

                            <img
                              src={
                                prod?.image
                                  ? `https://res.cloudinary.com/djyr368zj/${prod.image}`
                                  : makpower_image
                              }
                              alt=""
                              className="
                                h-full
                                w-full
                                object-contain
                              "
                            />

                          </div>

                        </td>


                        {/* ACTIVE */}

                        <td
                          className="
                            border border-slate-300
                            px-0.5
                            text-center
                            group-hover:bg-slate-100
                          "
                        >

                          <label className="relative inline-flex cursor-pointer items-center">

                            <input
                              type="checkbox"
                              checked={prod.is_active}
                              onChange={() =>
                                toggleStatus(
                                  {
                                    productId:
                                      prod.product_id,
                                    isActive:
                                      !prod.is_active,
                                  },
                                  {
                                    onSuccess: () =>
                                      toast.success(
                                        `Product ${
                                          !prod.is_active
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
                              className="peer sr-only"
                            />

                            <span
                              className="
                                h-3
                                w-5.5
                                rounded-full
                                bg-slate-300
                                transition
                                peer-checked:bg-emerald-600
                              "
                            />

                            <span
                              className="
                                absolute
                                left-0.5
                                h-2
                                w-2
                                rounded-full
                                bg-white
                                shadow
                                transition
                                peer-checked:translate-x-2.5
                              "
                            />

                          </label>

                        </td>


                        {/* EDIT */}

                        <td
                          className="
                            border border-slate-300
                            px-0.5
                            text-center
                            group-hover:bg-slate-100
                          "
                        >

                          <button
                            type="button"
                            title="Edit product"
                            onClick={() => {
                              setEditData(prod);
                              setForm(prod);
                              setShowModal(true);
                            }}
                            className="
                              inline-flex
                              h-5 w-5
                              items-center
                              justify-center
                              rounded
                              text-orange-600
                              hover:bg-orange-50
                            "
                          >
                            <FiEdit size={12} />
                          </button>

                        </td>


                        {/* UPLOAD 2 */}

                        <td
                          className="
                            border border-slate-300
                            px-0.5
                            text-center
                            group-hover:bg-slate-100
                          "
                        >

                          <label
                            title="Upload second image"
                            className="
                              inline-flex
                              h-5 w-5
                              cursor-pointer
                              items-center
                              justify-center
                              rounded
                              text-orange-600
                              hover:bg-orange-50
                            "
                          >

                            <FiUpload size={12} />

                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileChange(
                                  e,
                                  prod.product_id,
                                  "image2"
                                )
                              }
                              className="hidden"
                            />

                          </label>

                        </td>


                        {/* IMAGE 2 */}

                        <td
                          className="
                            border border-slate-300
                            px-0.5
                            text-center
                            group-hover:bg-slate-100
                          "
                        >

                          <div
                            className="
                              mx-auto
                              flex
                              h-5
                              w-8
                              items-center
                              justify-center
                              overflow-hidden
                              rounded
                              border border-slate-300
                              bg-slate-50
                            "
                          >

                            <img
                              src={
                                prod?.image2
                                  ? `https://res.cloudinary.com/djyr368zj/${prod.image2}`
                                  : makpower_image
                              }
                              alt=""
                              className="
                                h-full
                                w-full
                                object-contain
                              "
                            />

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>


        {/* =====================================================
            PAGINATION
        ===================================================== */}

        <div
          className="
            flex
            h-8
            shrink-0
            items-center
            justify-between
            border-t border-slate-300
            bg-slate-100
            px-2
          "
        >

          <div className="text-[11px] font-medium text-slate-600">

            {productsToShow.length > 0
              ? `Showing ${startIndex + 1}–${Math.min(
                  endIndex,
                  productsToShow.length
                )} of ${productsToShow.length}`
              : "No products"}

          </div>


          <div className="flex items-center gap-0.5">

            {/* PREVIOUS */}

            <button
              type="button"
              disabled={safePage === 1}
              onClick={() =>
                goToPage(safePage - 1)
              }
              className="
                flex
                h-5 w-5
                items-center
                justify-center
                rounded
                border border-slate-300
                bg-white
                text-slate-700
                hover:border-red-400
                hover:text-red-600
                disabled:pointer-events-none
                disabled:opacity-30
              "
            >
              <FiChevronLeft size={12} />
            </button>


            {/* PAGES */}

            {paginationItems.map(
              (item, index) =>
                item === "..." ? (

                  <span
                    key={`dots-${index}`}
                    className="
                      flex
                      h-5 w-4
                      items-center
                      justify-center
                      text-[12px]
                      font-semibold
                      text-slate-500
                    "
                  >
                    ...
                  </span>

                ) : (

                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      goToPage(item)
                    }
                    className={`
                      flex
                      h-5
                      min-w-5
                      items-center
                      justify-center
                      rounded
                      px-1
                      text-[12px]
                      font-bold
                      ${
                        safePage === item
                          ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
                          : "border border-transparent text-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                      }
                    `}
                  >
                    {item}
                  </button>

                )
            )}


            {/* NEXT */}

            <button
              type="button"
              disabled={
                safePage === totalPages
              }
              onClick={() =>
                goToPage(safePage + 1)
              }
              className="
                flex
                h-5 w-5
                items-center
                justify-center
                rounded
                border border-slate-300
                bg-white
                text-slate-700
                hover:border-red-400
                hover:text-red-600
                disabled:pointer-events-none
                disabled:opacity-30
              "
            >
              <FiChevronRight size={12} />
            </button>

          </div>

        </div>

      </div>


      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      <ProductEditModel
        show={showModal}
        onClose={() =>
          setShowModal(false)
        }
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        editData={editData}
      />

    </div>
  );
}