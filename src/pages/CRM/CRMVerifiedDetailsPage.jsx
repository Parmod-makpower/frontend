// // src/pages/CRMVerifiedDetailsPage.jsx
// import { useParams } from "react-router-dom";
// import { useState, useMemo, useEffect } from "react";
// import { useAuth } from "../../context/AuthContext";
// import { useCachedProducts } from "../../hooks/useCachedProducts";
// import { punchOrderToSheet } from "../../api/punchApi";
// import API from "../../api/axios";
// import MobilePageHeader from "../../components/MobilePageHeader";
// import ConfirmModal from "../../components/ConfirmModal";
// import SS_pdf_before_punch from "../../components/pdf/SS_pdf_before_punch";
// import DispatchPDF from "../../components/pdf/DispatchPDF";
// import CRMVerifiedTable from "../../components/verifiedDetailsPage/CRMVerifiedTable";
// import AddProductModal from "../../components/verifiedDetailsPage/AddProductModal";
// import EditQuantityModal from "../../components/verifiedDetailsPage/EditQuantityModal";
// import PDFModal from "../../components/pdf/PDFModal";
// import FullPageLoader from "../../components/FullPageLoader";
// import { useVerifiedOrderDetail } from "../../hooks/useVerifiedOrderDetail";
// import CustomLoader from "../../components/CustomLoader";
// import { useCargoDetails } from "../../hooks/CRM/useCargoDetails";
// import { useGSTDetails } from "../../hooks/CRM/useGSTDetails";
// import BackButton from "../../Layout/BackButton";

// export default function CRMVerifiedDetailsPage() {
//   const { user } = useAuth();
//   const { id } = useParams(); // ✅ URL se id
//   const { order, isLoading, error, refetch } = useVerifiedOrderDetail(id);

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);
//   const [editQty, setEditQty] = useState("");
//   const [newProduct, setNewProduct] = useState("");
//   const [newQty, setNewQty] = useState("");
//   const [newPrice, setNewPrice] = useState("");
//   const [dispatchLocation, setDispatchLocation] = useState("");
//   const [pdfModalOpen, setPdfModalOpen] = useState(false);
//   const [selectedPdfFilter, setSelectedPdfFilter] = useState("");
//   const [pendingAutoPunch, setPendingAutoPunch] = useState(false);
//   const [previousItemIds, setPreviousItemIds] = useState([]);

//   const [cargoDetails, setCargoDetails] = useState({
//     cargoName: "",
//     cargoParcel: "",
//     cargoMobile: "",
//     cargoLocation: "",
//   });


//   const { data: allProducts = [] } = useCachedProducts();
//   const { data: cargoList = [] } = useCargoDetails();
//   const { data: gstList = [] } = useGSTDetails();

//   useEffect(() => {
//     if (!cargoList.length || !order?.ss_party_name) return;

//     const matchedCargo = cargoList.find(
//       (c) =>
//         c.party_name?.toLowerCase().trim() ===
//         order.ss_party_name?.toLowerCase().trim()
//     );

//     if (matchedCargo) {
//       setCargoDetails({
//         cargoName: matchedCargo.cargo_name || "",
//         cargoParcel: matchedCargo.parcel_size || "",
//         cargoMobile: matchedCargo.mobile_number || "",
//         cargoLocation: matchedCargo.cargo_location || "",
//       });
//     }
//   }, [cargoList, order]);


//   const crmMapping = {
//     "Ankita Dhingra": "AD-AP",
//     "Prince Gupta": "PG-AP",
//     "Ajit Mishra": "AM-AP",
//     "Harish Sharma": "HS-AP",
//     "Simran Khanna": "SK-AP",
//     "Rahul Kumar": "RK-AP",
//     "Vivek Sharma": "VS-AP",
//     "Aarti Singh": "AS-AP",
//     "Kanak Maurya": "KM-AP",
//   };

//   const orderCode = crmMapping[order?.crm_name]
//     ? `${crmMapping[order.crm_name]}${order.id}`
//     : `${order?.crm_name} ${order?.id}`;

//   const enrichedItems = useMemo(() => {
//     if (!order?.items) return [];

//     const merged = order.items.map((item) => {
//       const found = allProducts.find((p) => p.product_id === item.product);
//       return {
//         ...item,
//         virtual_stock: found?.virtual_stock ?? null,
//         cartoon_size: found?.cartoon_size ?? "-",
//         price: found?.price ?? "-",
//         sub_category: found?.sub_category ?? "-",
//         rack_no: found?.rack_no ?? "-",
//         product_name: found?.product_name ?? "-", // ✅ ensure available
//         mumbai_stock: found?.mumbai_stock ?? null,
//       };
//     });

//     // ✅ Category + Product sorting
//     return merged.sort((a, b) => {
//       const catA = a.sub_category || "";
//       const catB = b.sub_category || "";

//       const categoryCompare = catA.localeCompare(catB);
//       if (categoryCompare !== 0) return categoryCompare;

//       // ✅ Product name alphabetical sorting only
//       const prodA = a.product_name || "";
//       const prodB = b.product_name || "";
//       return prodA.localeCompare(prodB);
//     });

//   }, [order?.items, allProducts]);

//   const estimatedTotal = useMemo(() => {
//     const location =
//       order?.dispatch_location ||
//       dispatchLocation ||
//       "Delhi";

//     return enrichedItems.reduce((sum, item) => {
//       const orderedQty = Number(item.quantity || 0);

//       // ✅ safe price conversion
//       const price = parseFloat(item.price);

//       // ✅ skip item if price missing / invalid
//       if (isNaN(price) || price <= 0) return sum;

//       // ✅ location based stock
//       const availableStock =
//         location === "Mumbai"
//           ? Number(item.mumbai_stock || 0)
//           : Number(item.virtual_stock || 0);

//       // ✅ skip out of stock
//       if (availableStock <= 0) return sum;

//       // ✅ only available stock qty bill
//       const billableQty = Math.min(orderedQty, availableStock);

//       return sum + billableQty * price;
//     }, 0);
//   }, [enrichedItems, order?.dispatch_location, dispatchLocation]);
//   const currentGST = useMemo(() => {
//     if (!gstList.length || !order?.ss_party_name) return 0;

//     const matchedGST = gstList.find(
//       (g) =>
//         g.party_name?.toLowerCase().trim() ===
//         order.ss_party_name?.toLowerCase().trim()
//     );

//     return Number(matchedGST?.percentage || 0);
//   }, [gstList, order]);

//   const gstAmount = useMemo(() => {
//     return (estimatedTotal * currentGST) / 100;
//   }, [estimatedTotal, currentGST]);

//   const handleOrderPunch = () => {
//     if (!order?.items?.length) {
//       alert("No items to punch!");
//       return;
//     }

//     setDispatchLocation(""); // ✅ RESET EVERY TIME
//     setIsModalOpen(true);
//   };

//   const confirmOrderPunch = async () => {
//     if (!order?.items?.length) return;

//     setLoading(true);
//     setIsModalOpen(false);
//     try {
//       const data = await punchOrderToSheet(order, dispatchLocation);
//       if (data.success) {
//         refetch();
//         setSelectedPdfFilter("");

//         setPdfModalOpen(true);
//       } else {
//         alert("Error: " + data.error);
//       }
//     } catch (err) {
//       alert("Something went wrong while punching order");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddProduct = async () => {
//     if (!newProduct || !newQty) {
//       alert("Please select a product and enter quantity.");
//       return;
//     }

//     try {
//       setLoading(true);

//       // ✅ store existing ids before adding
//       const existingIds = order?.items?.map((item) => item.id) || [];
//       setPreviousItemIds(existingIds);

//       await API.post(`/crm/verified/${order.id}/add-item/`, {
//         product_id: newProduct,
//         quantity: newQty,
//       });

//       if (order.punched) {
//         setPendingAutoPunch(true);
//       }

//       await refetch();

//       setNewProduct("");
//       setNewQty("");
//       setNewPrice("");

//     } catch (err) {
//       alert(err.response?.data?.error || "Failed to add product.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEditQuantity = async (itemId, newQty) => {
//     if (!newQty || isNaN(newQty)) {
//       alert("Invalid quantity!");
//       return;
//     }
//     try {
//       const res = await API.post(`/crm/verified/item/${itemId}/update/`, {
//         quantity: newQty,
//       });
//       alert(res.data.message);
//       await refetch();
//     } catch (err) {
//       alert(err.response?.data?.error || "Failed to update quantity.");
//     }
//   };

//   const handleDeleteItem = async (itemId) => {
//     if (!window.confirm("Are you sure you want to delete this item?")) return;
//     try {
//       const res = await API.delete(`/crm/verified/item/${itemId}/delete/`);
//       alert(res.data.message);
//       await refetch();

//     } catch (err) {
//       alert(err.response?.data?.error || "Failed to delete item.");
//     }
//   };

//   const handleConfirmPDF = () => {
//     setPdfModalOpen(false);

//     let filteredItems = enrichedItems;

//     if (selectedPdfFilter === "ACCESSORIES") {
//       filteredItems = enrichedItems.filter(
//         item =>
//           !(item.sub_category?.toLowerCase().includes("battery") ||
//             item.product_name?.toLowerCase().includes("battery"))
//       );
//     }

//     if (selectedPdfFilter === "BATTERY") {
//       filteredItems = enrichedItems.filter(
//         item =>
//           item.sub_category?.toLowerCase().includes("battery") ||
//           item.product_name?.toLowerCase().includes("battery")
//       );
//     }

//     DispatchPDF(
//       order,
//       filteredItems,
//       orderCode,
//       order.dispatch_location,
//       cargoDetails,  // ✅ MOST IMPORTANT
//       gstAmount,
//       currentGST
//     );

//   };

//   useEffect(() => {
//     if (!pendingAutoPunch || !order?.punched) return;
//     if (!enrichedItems?.length) return;

//     // ✅ find newly added item by new ID
//     const newlyAddedItem = enrichedItems.find(
//       (item) => !previousItemIds.includes(item.id)
//     );

//     if (newlyAddedItem) {
//       handleSingleRowPunch(newlyAddedItem);
//       setPendingAutoPunch(false);
//     }
//   }, [pendingAutoPunch, enrichedItems, previousItemIds]);


//   const handleSingleRowPunch = async (item) => {
//     try {
//       setLoading(true);

//       // ✅ use saved order location first
//       const rowLocation =
//         order.dispatch_location || dispatchLocation || "Delhi";

//       const singleOrder = {
//         id: order.id,
//         order_id: order.order_id,
//         ss_party_name: order.ss_party_name,
//         crm_name: order.crm_name,
//         dispatch_location: rowLocation,
//         is_single_row: true,
//         items: [
//           {
//             product_name: item.product_name,
//             quantity: item.quantity,
//             id: item.id,
//           },
//         ],
//       };

//       const res = await punchOrderToSheet(singleOrder, rowLocation);

//       if (res.success) {
//         alert("Row punched successfully!");
//       } else {
//         alert("Error punching row: " + res.error);
//       }
//     } catch (err) {
//       alert("Something went wrong while punching this row.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (isLoading) return <CustomLoader fullScreen text="Loading order details..." />;
//   if (error) return <div className="p-6 text-red-600">Error loading order</div>;
//   if (!order) return <div className="p-6 text-red-600">No order found</div>;

//   if (!order)
//     return <div className="p-6 text-red-600">No order data provided.</div>;

//   return (
//     <>
//       {loading && <FullPageLoader text="Processing..." />}

//       <div className="p-4 sm:p-0 space-y-4 pb-30">
//         <ConfirmModal
//           isOpen={isModalOpen}
//           title="Select Dispatch Location"
//           message="Please select dispatch location before punching"
//           confirmText="Confirm"
//           cancelText="Cancel"
//           confirmColor="bg-blue-600 hover:bg-blue-700"
//           loading={loading}
//           onCancel={() => setIsModalOpen(false)}
//           onConfirm={confirmOrderPunch}
//           disableConfirm={!dispatchLocation} // ✅ DISABLE UNTIL SELECTED
//         >
//           {/* ✅ CUSTOM UI */}
//           <div className="flex gap-3 mb-4">

//             <button
//               onClick={() => setDispatchLocation("Delhi")}
//               className={`flex-1 py-2 rounded border ${dispatchLocation === "Delhi"
//                 ? "bg-blue-600 text-white"
//                 : "bg-white"
//                 }`}
//             >
//               Delhi
//             </button>

//             <button
//               onClick={() => setDispatchLocation("Mumbai")}
//               className={`flex-1 py-2 rounded border ${dispatchLocation === "Mumbai"
//                 ? "bg-blue-600 text-white"
//                 : "bg-white"
//                 }`}
//             >
//               Mumbai
//             </button>

//           </div>
//         </ConfirmModal>


//         <PDFModal
//           isOpen={pdfModalOpen}
//           onClose={() => setPdfModalOpen(false)}
//           onConfirm={handleConfirmPDF}
//           selectedFilter={selectedPdfFilter}
//           setSelectedFilter={setSelectedPdfFilter}
//           cargoDetails={cargoDetails}              // ✅ NEW
//           setCargoDetails={setCargoDetails}        // ✅ NEW
//           estimatedTotal={estimatedTotal}
//           gstPercentage={currentGST}
//           gstAmount={gstAmount}
//         />

// {/* Desktop Back Button */}
// <div className="hidden md:flex items-center gap-3 mb-2">
//   <BackButton />
// </div>

//         <MobilePageHeader title={orderCode} />

//         <div className="grid grid-cols-12 gap-4">
//           {/* ✅ TABLE */}
//           <div className="col-span-12 md:col-span-10">
//             <CRMVerifiedTable
//               items={enrichedItems}
//               order={order}
//               user={user}
//               setEditingItem={setEditingItem}
//               setEditQty={setEditQty}
//               setShowEditModal={setShowEditModal}
//               handleDeleteItem={handleDeleteItem}
//               handleSingleRowPunch={handleSingleRowPunch}
//               estimatedTotal={estimatedTotal}
//             />

//             <div className="text-end">
//               <button
//                 onClick={handleOrderPunch}
//                 disabled={order.punched || loading}
//                 className={`px-6 py-1 mt-1 rounded shadow transition ${order.punched || loading
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
//                   }`}
//               >
//                 {loading
//                   ? "Processing..."
//                   : order.punched
//                     ? "Already Punched"
//                     : "Order Punch"}
//               </button>
//             </div>
//           </div>

//           {/* ✅ RIGHT SIDE ADD PRODUCT PANEL */}

//           <div className="hidden md:block col-span-2">
//             <div className="bg-white rounde border p-3 space-y-4">

//               {/* 🔷 ORDER HEADER */}
//               <div className="text-center border-b pb-2">
//                 <div className="text-xs text-gray-500">Order Code</div>
//                 <div className="font-semibold text-sm text-gray-800"> {orderCode} </div>
//                 <div className="text-xs text-gray-500">Wharehouse : {order.dispatch_location}</div>
//               </div>

//               {/* ➕ ADD PRODUCT */}

//               <div className="bg-gray-100  p-1 border">
//                 <AddProductModal
//                   allProducts={allProducts}
//                   handleAddProduct={handleAddProduct}
//                   newProduct={newProduct}
//                   setNewProduct={setNewProduct}
//                   newQty={newQty}
//                   setNewQty={setNewQty}
//                   newPrice={newPrice}
//                   setNewPrice={setNewPrice}
//                 />
//               </div>


//               {/* 📄 PDF SECTION */}
//               <div className="space-y-2">

//                 <div className="text-xs font-semibold text-gray-600">
//                   Document
//                 </div>

//                 {/* 🚚 Dispatch PDF */}
//                 {order.punched && (
//                   <button
//                     onClick={() => {
//                       setSelectedPdfFilter("");
//                       setPdfModalOpen(true);
//                     }}
//                     className="w-full py-1 rounded bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition"
//                   >
//                     Dispatch PDF
//                   </button>
//                 )}

//                 {/* 📦 Before Punch PDF */}
//                 {!order.punched && (
//                   <div className="w-full">
//                     <SS_pdf_before_punch
//                       id="verified-order-pdf-btn"
//                       order={order}
//                       items={enrichedItems.map((item) => ({
//                         ...item,
//                         virtual_stock:
//                           allProducts.find((p) => p.product_id === item.product)
//                             ?.virtual_stock ?? 0,
//                         price:
//                           allProducts.find((p) => p.product_id === item.product)
//                             ?.price ?? item.price ?? 0,
//                       }))}
//                     />
//                   </div>
//                 )}

//               </div>

//             </div>
//           </div>
//         </div>

//         <EditQuantityModal
//           show={showEditModal}
//           setShow={setShowEditModal}
//           editingItem={editingItem}
//           editQty={editQty}
//           setEditQty={setEditQty}
//           handleEditQuantity={handleEditQuantity}
//         />

//       </div>
//     </>
//   );
// }





// src/pages/CRMVerifiedDetailsPage.jsx

import { useParams } from "react-router-dom";
import {
  useState,
  useMemo,
  useEffect,
  useRef,
} from "react";

import { useAuth } from "../../context/AuthContext";
import { useCachedProducts } from "../../hooks/useCachedProducts";
import { punchOrderToSheet } from "../../api/punchApi";
import API from "../../api/axios";

import MobilePageHeader from "../../components/MobilePageHeader";
import ConfirmModal from "../../components/ConfirmModal";

import SS_pdf_before_punch from "../../components/pdf/SS_pdf_before_punch";
import DispatchPDF from "../../components/pdf/DispatchPDF";

import CRMVerifiedTable from "../../components/verifiedDetailsPage/CRMVerifiedTable";
import EditQuantityModal from "../../components/verifiedDetailsPage/EditQuantityModal";

import PDFModal from "../../components/pdf/PDFModal";
import FullPageLoader from "../../components/FullPageLoader";

import { useVerifiedOrderDetail } from "../../hooks/useVerifiedOrderDetail";
import CustomLoader from "../../components/CustomLoader";

import { useCargoDetails } from "../../hooks/CRM/useCargoDetails";
import { useGSTDetails } from "../../hooks/CRM/useGSTDetails";

import BackButton from "../../Layout/BackButton";
import useFuseSearch from "../../hooks/useFuseSearch";

import { FaPlus, FaFilePdf } from "react-icons/fa";
import { FileText, Warehouse, Search, X } from "lucide-react";


export default function CRMVerifiedDetailsPage() {
  const { user } = useAuth();
  const { id } = useParams();

  const {
    order,
    isLoading,
    error,
    refetch,
  } = useVerifiedOrderDetail(id);

  /* =========================================================
     BASIC STATE
  ========================================================= */

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editQty, setEditQty] = useState("");

  /* =========================================================
     ADD PRODUCT
  ========================================================= */

  const [newProduct, setNewProduct] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const [productSearch, setProductSearch] = useState("");
  const [productDropdownOpen, setProductDropdownOpen] =
    useState(false);
  const [productHighlightIndex, setProductHighlightIndex] =
    useState(0);

  const addProductInputRef = useRef(null);
  const productDropdownRef = useRef(null);

  /* =========================================================
     DISPATCH / PDF
  ========================================================= */

  const [dispatchLocation, setDispatchLocation] = useState("");

  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdfFilter, setSelectedPdfFilter] =
    useState("");

  /* =========================================================
     AUTO PUNCH
  ========================================================= */

  const [pendingAutoPunch, setPendingAutoPunch] =
    useState(false);

  const [previousItemIds, setPreviousItemIds] =
    useState([]);

  /* =========================================================
     CARGO
  ========================================================= */

  const [cargoDetails, setCargoDetails] = useState({
    cargoName: "",
    cargoParcel: "",
    cargoMobile: "",
    cargoLocation: "",
  });

  /* =========================================================
     DATA
  ========================================================= */

  const { data: allProducts = [] } = useCachedProducts();
  const { data: cargoList = [] } = useCargoDetails();
  const { data: gstList = [] } = useGSTDetails();

  /* =========================================================
     PRODUCT MAP
     Faster lookup than repeated .find()
  ========================================================= */

  const productMap = useMemo(() => {
    const map = new Map();

    for (const product of allProducts) {
      if (product?.product_id != null) {
        map.set(product.product_id, product);
      }
    }

    return map;
  }, [allProducts]);

  /* =========================================================
     CARGO MATCH
  ========================================================= */

  useEffect(() => {
    if (!cargoList.length || !order?.ss_party_name) return;

    const partyName =
      order.ss_party_name.toLowerCase().trim();

    const matchedCargo = cargoList.find(
      (cargo) =>
        cargo.party_name?.toLowerCase().trim() === partyName
    );

    if (matchedCargo) {
      setCargoDetails({
        cargoName: matchedCargo.cargo_name || "",
        cargoParcel: matchedCargo.parcel_size || "",
        cargoMobile: matchedCargo.mobile_number || "",
        cargoLocation: matchedCargo.cargo_location || "",
      });
    }
  }, [cargoList, order?.ss_party_name]);

  /* =========================================================
     CRM CODE
  ========================================================= */

  const crmMapping = {
    "Ankita Dhingra": "AD-AP",
    "Prince Gupta": "PG-AP",
    "Ajit Mishra": "AM-AP",
    "Harish Sharma": "HS-AP",
    "Simran Khanna": "SK-AP",
    "Rahul Kumar": "RK-AP",
    "Vivek Sharma": "VS-AP",
    "Aarti Singh": "AS-AP",
    "Kanak Maurya": "KM-AP",
  };

  const orderCode = crmMapping[order?.crm_name]
    ? `${crmMapping[order.crm_name]}${order.id}`
    : `${order?.crm_name || "-"} ${order?.id || ""}`;

  /* =========================================================
     ENRICH ITEMS
  ========================================================= */

  const enrichedItems = useMemo(() => {
    if (!order?.items?.length) return [];

    const merged = order.items.map((item) => {
      const product = productMap.get(item.product);

      return {
        ...item,

        virtual_stock:
          product?.virtual_stock ?? null,

        cartoon_size:
          product?.cartoon_size ?? "-",

        price:
          product?.price ?? "-",

        sub_category:
          product?.sub_category ?? "-",

        rack_no:
          product?.rack_no ?? "-",

        product_name:
          product?.product_name ??
          item.product_name ??
          "-",

        mumbai_stock:
          product?.mumbai_stock ?? null,
      };
    });

    return merged.sort((a, b) => {
      const categoryCompare =
        (a.sub_category || "").localeCompare(
          b.sub_category || ""
        );

      if (categoryCompare !== 0) {
        return categoryCompare;
      }

      return (a.product_name || "").localeCompare(
        b.product_name || ""
      );
    });
  }, [order?.items, productMap]);

  /* =========================================================
     ESTIMATED TOTAL
  ========================================================= */

  const estimatedTotal = useMemo(() => {
    const location =
      order?.dispatch_location ||
      dispatchLocation ||
      "Delhi";

    return enrichedItems.reduce((sum, item) => {
      const orderedQty = Number(item.quantity || 0);
      const price = parseFloat(item.price);

      if (Number.isNaN(price) || price <= 0) {
        return sum;
      }

      const availableStock =
        location === "Mumbai"
          ? Number(item.mumbai_stock || 0)
          : Number(item.virtual_stock || 0);

      if (availableStock <= 0) {
        return sum;
      }

      const billableQty = Math.min(
        orderedQty,
        availableStock
      );

      return sum + billableQty * price;
    }, 0);
  }, [
    enrichedItems,
    order?.dispatch_location,
    dispatchLocation,
  ]);

  /* =========================================================
     GST
  ========================================================= */

  const currentGST = useMemo(() => {
    if (!gstList.length || !order?.ss_party_name) {
      return 0;
    }

    const partyName =
      order.ss_party_name.toLowerCase().trim();

    const matchedGST = gstList.find(
      (gst) =>
        gst.party_name?.toLowerCase().trim() ===
        partyName
    );

    return Number(matchedGST?.percentage || 0);
  }, [gstList, order?.ss_party_name]);

  const gstAmount = useMemo(() => {
    return (estimatedTotal * currentGST) / 100;
  }, [estimatedTotal, currentGST]);

  /* =========================================================
     PRODUCT SEARCH
     Same lightweight search concept as OrderItemsTable
  ========================================================= */

  const fuseResults = useFuseSearch(
    allProducts,
    productSearch,
    {
      keys: [
        "product_name",
        "sale_names",
      ],
      threshold: 0.3,
    }
  );

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) {
      return [];
    }

    return fuseResults.slice(0, 15);
  }, [fuseResults, productSearch]);

  /* =========================================================
     CLOSE PRODUCT DROPDOWN OUTSIDE
  ========================================================= */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        productDropdownRef.current &&
        !productDropdownRef.current.contains(event.target)
      ) {
        setProductDropdownOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* =========================================================
     SELECT PRODUCT
  ========================================================= */

  const handleSelectProduct = (product) => {
    if (!product) return;

    setNewProduct(product.product_id);
    setNewPrice(product.price || 0);

    /*
      Preserve previous behavior:
      default quantity = carton size
    */
    setNewQty(
      product.cartoon_size != null
        ? String(product.cartoon_size)
        : "1"
    );

    setProductSearch(
      product.product_name || ""
    );

    setProductDropdownOpen(false);
    setProductHighlightIndex(0);
  };

  /* =========================================================
     PRODUCT SEARCH KEYBOARD
  ========================================================= */

  const handleProductSearchKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setProductDropdownOpen(false);
      return;
    }

    if (!productDropdownOpen) {
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp"
      ) {
        setProductDropdownOpen(true);
      }

      return;
    }

    if (!filteredProducts.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setProductHighlightIndex((prev) =>
        prev < filteredProducts.length - 1
          ? prev + 1
          : 0
      );

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setProductHighlightIndex((prev) =>
        prev > 0
          ? prev - 1
          : filteredProducts.length - 1
      );

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      const selected =
        filteredProducts[productHighlightIndex];

      if (selected) {
        handleSelectProduct(selected);
      }
    }
  };

  /* =========================================================
     ADD PRODUCT
  ========================================================= */

  const handleAddProduct = async () => {
    const cleanQty = String(newQty ?? "")
      .replace(/\D/g, "");

    if (!newProduct) {
      alert("Please select a product.");
      addProductInputRef.current?.focus();
      return;
    }

    if (!cleanQty || Number(cleanQty) <= 0) {
      alert("Please enter a valid quantity greater than 0.");
      return;
    }

    try {
      setLoading(true);

      const existingIds =
        order?.items?.map((item) => item.id) || [];

      setPreviousItemIds(existingIds);

      await API.post(
        `/crm/verified/${order.id}/add-item/`,
        {
          product_id: newProduct,
          quantity: cleanQty,
        }
      );

      if (order.punched) {
        setPendingAutoPunch(true);
      }

      await refetch();

      setNewProduct("");
      setNewQty("");
      setNewPrice("");

      setProductSearch("");
      setProductDropdownOpen(false);
      setProductHighlightIndex(0);

    } catch (err) {
      alert(
        err.response?.data?.error ||
        "Failed to add product."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     QUANTITY INPUT
     NUMERIC ONLY
  ========================================================= */

  const handleQuantityInput = (event) => {
    const numericValue = event.target.value.replace(
      /\D/g,
      ""
    );

    setNewQty(numericValue);
  };

  /* =========================================================
     ORDER PUNCH
  ========================================================= */

  const handleOrderPunch = () => {
    if (!order?.items?.length) {
      alert("No items to punch!");
      return;
    }

    setDispatchLocation("");
    setIsModalOpen(true);
  };

  /* =========================================================
     CONFIRM PUNCH
  ========================================================= */

  const confirmOrderPunch = async () => {
    if (!order?.items?.length) return;

    setLoading(true);
    setIsModalOpen(false);

    try {
      const data = await punchOrderToSheet(
        order,
        dispatchLocation
      );

      if (data.success) {
        await refetch();

        setSelectedPdfFilter("");
        setPdfModalOpen(true);
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert(
        "Something went wrong while punching order"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     EDIT QUANTITY
  ========================================================= */

  const handleEditQuantity = async (
    itemId,
    newQty
  ) => {
    if (
      newQty === "" ||
      newQty === null ||
      newQty === undefined ||
      Number(newQty) <= 0 ||
      Number.isNaN(Number(newQty))
    ) {
      alert("Invalid quantity!");
      return;
    }

    try {
      const res = await API.post(
        `/crm/verified/item/${itemId}/update/`,
        {
          quantity: newQty,
        }
      );

      alert(res.data.message);
      await refetch();

    } catch (err) {
      alert(
        err.response?.data?.error ||
        "Failed to update quantity."
      );
    }
  };

  /* =========================================================
     DELETE ITEM
  ========================================================= */

  const handleDeleteItem = async (itemId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this item?"
      )
    ) {
      return;
    }

    try {
      const res = await API.delete(
        `/crm/verified/item/${itemId}/delete/`
      );

      alert(res.data.message);
      await refetch();

    } catch (err) {
      alert(
        err.response?.data?.error ||
        "Failed to delete item."
      );
    }
  };

  /* =========================================================
     PDF CONFIRM
  ========================================================= */

  const handleConfirmPDF = () => {
    setPdfModalOpen(false);

    let filteredItems = enrichedItems;

    if (selectedPdfFilter === "ACCESSORIES") {
      filteredItems = enrichedItems.filter(
        (item) =>
          !(
            item.sub_category
              ?.toLowerCase()
              .includes("battery") ||
            item.product_name
              ?.toLowerCase()
              .includes("battery")
          )
      );
    }

    if (selectedPdfFilter === "BATTERY") {
      filteredItems = enrichedItems.filter(
        (item) =>
          item.sub_category
            ?.toLowerCase()
            .includes("battery") ||
          item.product_name
            ?.toLowerCase()
            .includes("battery")
      );
    }

    DispatchPDF(
      order,
      filteredItems,
      orderCode,
      order.dispatch_location,
      cargoDetails,
      gstAmount,
      currentGST
    );
  };

  /* =========================================================
     AUTO PUNCH NEW ITEM
  ========================================================= */

  useEffect(() => {
    if (!pendingAutoPunch || !order?.punched) {
      return;
    }

    if (!enrichedItems?.length) {
      return;
    }

    const newlyAddedItem =
      enrichedItems.find(
        (item) =>
          !previousItemIds.includes(item.id)
      );

    if (newlyAddedItem) {
      handleSingleRowPunch(newlyAddedItem);
      setPendingAutoPunch(false);
    }
  }, [
    pendingAutoPunch,
    enrichedItems,
    previousItemIds,
  ]);

  /* =========================================================
     SINGLE ROW PUNCH
  ========================================================= */

  const handleSingleRowPunch = async (item) => {
    try {
      setLoading(true);

      const rowLocation =
        order.dispatch_location ||
        dispatchLocation ||
        "Delhi";

      const singleOrder = {
        id: order.id,
        order_id: order.order_id,
        ss_party_name: order.ss_party_name,
        crm_name: order.crm_name,
        dispatch_location: rowLocation,
        is_single_row: true,

        items: [
          {
            product_name: item.product_name,
            quantity: item.quantity,
            id: item.id,
          },
        ],
      };

      const res = await punchOrderToSheet(
        singleOrder,
        rowLocation
      );

      if (res.success) {
        alert("Row punched successfully!");
      } else {
        alert(
          "Error punching row: " + res.error
        );
      }

    } catch (err) {
      alert(
        "Something went wrong while punching this row."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOADING / ERROR
  ========================================================= */

  if (isLoading) {
    return (
      <CustomLoader
        fullScreen
        text="Loading order details..."
      />
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading order
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-red-600">
        No order found
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <>
      {loading && (
        <FullPageLoader text="Processing..." />
      )}

      <div className="p-3 sm:p-0 space-y-3 pb-24">

        {/* =================================================
            DISPATCH LOCATION MODAL
        ================================================= */}

        <ConfirmModal
          isOpen={isModalOpen}
          title="Select Dispatch Location"
          message="Please select dispatch location before punching"
          confirmText="Confirm"
          cancelText="Cancel"
          confirmColor="bg-blue-600 hover:bg-blue-700"
          loading={loading}
          onCancel={() =>
            setIsModalOpen(false)
          }
          onConfirm={confirmOrderPunch}
          disableConfirm={!dispatchLocation}
        >
          <div className="flex gap-3 mb-4">

            <button
              type="button"
              onClick={() =>
                setDispatchLocation("Delhi")
              }
              className={`
                flex-1
                py-2
                rounded
                border
                text-sm
                font-medium
                transition
                ${dispatchLocation === "Delhi"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 hover:bg-gray-50"
                }
              `}
            >
              Delhi
            </button>

            <button
              type="button"
              onClick={() =>
                setDispatchLocation("Mumbai")
              }
              className={`
                flex-1
                py-2
                rounded
                border
                text-sm
                font-medium
                transition
                ${dispatchLocation === "Mumbai"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 hover:bg-gray-50"
                }
              `}
            >
              Mumbai
            </button>

          </div>
        </ConfirmModal>


        {/* =================================================
            PDF MODAL
        ================================================= */}

        <PDFModal
          isOpen={pdfModalOpen}
          onClose={() =>
            setPdfModalOpen(false)
          }
          onConfirm={handleConfirmPDF}
          selectedFilter={selectedPdfFilter}
          setSelectedFilter={
            setSelectedPdfFilter
          }
          cargoDetails={cargoDetails}
          setCargoDetails={
            setCargoDetails
          }
          estimatedTotal={estimatedTotal}
          gstPercentage={currentGST}
          gstAmount={gstAmount}
        />




        {/* =================================================
            MOBILE HEADER
        ================================================= */}

        <MobilePageHeader title={orderCode} />


        {/* =================================================
            MAIN ORDER HEADER
        ================================================= */}
        {/* =========================================================
    ORDER HEADER + ADD PRODUCT
========================================================= */}
        <div
          className="
    relative
    z-30
    mt-15
    sm:mt-0
    bg-white
    border
    border-slate-200
    rounded-xl
    shadow-sm
    overflow-visible
  "
        >
          {/* =======================================================
      TOP ORDER HEADER
  ======================================================= */}
          <div
            className="
      flex
      flex-col
      lg:flex-row
      lg:items-center
      lg:justify-between
      gap-3
      px-3
      sm:px-4
      py-2.5
      border-b
      border-slate-200
      bg-gradient-to-r
      from-slate-300
      via-white
      to-blue-50/30
    "
          >
            {/* LEFT : ORDER DETAILS */}
            <div
              className="
        flex
        items-center
        gap-3
        min-w-0
        flex-1
      "
            >
              {/* BACK */}
              <div className="hidden md:flex shrink-0">
                <BackButton />
              </div>

              {/* ORDER CODE */}
              <div
                className="
          min-w-0
          max-w-[180px]
          sm:max-w-[220px]
        "
              >
                <div
                  className="
            flex
            items-center
            gap-1.5
            text-[9px]
            uppercase
            tracking-wider
            font-semibold
            text-slate-400
          "
                >
                  <span
                    className="
              w-1.5
              h-1.5
              rounded-full
              bg-blue-500
            "
                  />
                  Order Code
                </div>

                <div
                  className="
            mt-0.5
            text-sm
            sm:text-[15px]
            font-bold
            text-slate-800
            truncate
          "
                  title={orderCode}
                >
                  {orderCode}
                </div>
              </div>

              {/* SEPARATOR */}
              <div
                className="
          hidden sm:block
          w-px
          h-8
          bg-slate-200
          shrink-0
        "
              />

              {/* ORDER ID */}
              <div
                className="
          hidden sm:block
          min-w-0
          max-w-[190px]
        "
              >
                <div
                  className="
            text-[9px]
            uppercase
            tracking-wider
            font-semibold
            text-slate-400
          "
                >
                  Order ID
                </div>

                <div
                  className="
            mt-0.5
            text-xs
            font-semibold
            text-slate-700
            truncate
          "
                  title={order.order_id || "-"}
                >
                  {order.order_id || "-"}
                </div>
              </div>

              {/* SEPARATOR */}
              <div
                className="
          hidden sm:block
          w-px
          h-8
          bg-slate-200
          shrink-0
        "
              />

              {/* WAREHOUSE */}
              <div
                className="
          flex
          items-center
          gap-2
          shrink-0
          px-2
          py-1.5
          rounded-lg
          bg-blue-50
          border
          border-blue-100
        "
              >
                <div
                  className="
            flex
            items-center
            justify-center
            w-7
            h-7
            rounded-md
            bg-white
            border
            border-blue-100
          "
                >
                  <Warehouse
                    size={14}
                    className="text-blue-600"
                  />
                </div>

                <div>
                  <div
                    className="
              text-[8px]
              uppercase
              tracking-wider
              font-semibold
              text-slate-400
              leading-none
            "
                  >
                    Warehouse
                  </div>

                  <div
                    className="
              mt-1
              text-[11px]
              font-bold
              text-blue-600
              leading-none
            "
                  >
                    {order.dispatch_location ||
                      dispatchLocation ||
                      "Delhi"}
                  </div>
                </div>
              </div>
            </div>

            {/* =====================================================
        RIGHT : DOCUMENT ACTIONS
    ===================================================== */}
            <div
              className="
        flex
        items-center
        justify-between
        sm:justify-end
        gap-2
        shrink-0
      "
            >
              {/* DOCUMENT LABEL */}
              <div
                className="
          hidden
          xl:flex
          items-center
          gap-1.5
          mr-1
          text-[9px]
          uppercase
          tracking-wider
          font-semibold
          text-slate-400
        "
              >
                <FileText size={12} />
                Documents
              </div>

              {/* DISPATCH PDF */}
              {order.punched && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPdfFilter("");
                    setPdfModalOpen(true);
                  }}
                  className="
            inline-flex
            items-center
            justify-center
            gap-1.5
            px-3
            py-1.5
            rounded-lg
            bg-orange-500
            hover:bg-orange-600
            active:bg-orange-700
            text-white
            text-[11px]
            font-semibold
            shadow-sm
            transition
            duration-150
            cursor-pointer
            whitespace-nowrap
          "
                >
                  <FaFilePdf size={11} />
                  Dispatch PDF
                </button>
              )}

              {/* BEFORE PUNCH PDF */}
              {!order.punched && (
                <div className="shrink-0">
                  <SS_pdf_before_punch
                    id="verified-order-pdf-btn"
                    order={order}
                    items={enrichedItems}
                  />
                </div>
              )}
            </div>
          </div>

          {/* =======================================================
      ADD PRODUCT BAR
  ======================================================= */}
          <div
            className="
      relative
      z-40
      px-3
      sm:px-4
      py-2
      bg-white
      rounded-b-xl
    "
          >
            <div
              className="
        flex
        flex-col
        sm:flex-row
        items-stretch
        sm:items-center
        gap-2
      "
            >
              {/* ADD PRODUCT LABEL */}
              <div
                className="
          flex
          items-center
          gap-2
          shrink-0
          text-[11px]
          font-semibold
          text-slate-600
        "
              >
                <span
                  className="
            flex
            items-center
            justify-center
            w-7
            h-7
            rounded-lg
            bg-blue-50
            border
            border-blue-100
            text-blue-600
          "
                >
                  <FaPlus size={10} />
                </span>

                <span className="whitespace-nowrap">
                  Add Product
                </span>
              </div>

              {/* PRODUCT SEARCH */}
              <div
                ref={productDropdownRef}
                className="
          relative
          flex-1
          min-w-0
        "
              >
                <div
                  className="
            flex
            items-center
            min-h-[36px]
            border
            border-slate-300
            rounded-lg
            bg-white
            overflow-hidden
            transition
            duration-150
            focus-within:border-blue-500
            focus-within:ring-2
            focus-within:ring-blue-100
          "
                >
                  <Search
                    size={14}
                    className="
              ml-2.5
              shrink-0
              text-slate-400
            "
                  />

                  <input
                    ref={addProductInputRef}
                    type="text"
                    value={productSearch}
                    onChange={(event) => {
                      setProductSearch(event.target.value);
                      setProductHighlightIndex(0);
                      setProductDropdownOpen(true);

                      if (
                        event.target.value !== productSearch
                      ) {
                        setNewProduct("");
                        setNewPrice("");
                      }
                    }}
                    onFocus={() => {
                      if (productSearch.trim()) {
                        setProductDropdownOpen(true);
                      }
                    }}
                    onKeyDown={handleProductSearchKeyDown}
                    placeholder="Search product or sale name..."
                    autoComplete="off"
                    className="
              w-full
              min-w-0
              px-2
              py-2
              text-xs
              text-slate-700
              bg-transparent
              outline-none
              placeholder:text-slate-400
            "
                  />

                  {productSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setProductSearch("");
                        setNewProduct("");
                        setNewQty("");
                        setNewPrice("");
                        setProductDropdownOpen(false);
                        setProductHighlightIndex(0);
                        addProductInputRef.current?.focus();
                      }}
                      className="
                mr-1.5
                p-1
                rounded-md
                text-slate-400
                hover:text-slate-700
                hover:bg-slate-100
                transition
                cursor-pointer
              "
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* =================================================
            PRODUCT DROPDOWN
        ================================================= */}
                {productDropdownOpen &&
                  productSearch.trim() && (
                    <div
                      className="
                absolute
                left-0
                right-0
                top-full
                mt-1
                bg-white
                border
                border-slate-200
                rounded-lg
                shadow-xl
                overflow-hidden
                z-[9999]
              "
                    >
                      {filteredProducts.length > 0 ? (
                        <div className="max-h-[280px] overflow-y-auto">
                          {filteredProducts.map(
                            (product, index) => {
                              const saleNames =
                                Array.isArray(
                                  product.sale_names
                                )
                                  ? product.sale_names
                                  : [];

                              const matchedSaleName =
                                saleNames.find(
                                  (name) =>
                                    typeof name === "string" &&
                                    name
                                      .toLowerCase()
                                      .includes(
                                        productSearch.toLowerCase()
                                      )
                                );

                              return (
                                <button
                                  type="button"
                                  key={product.product_id}
                                  onMouseDown={(event) => {
                                    event.preventDefault();
                                  }}
                                  onClick={() =>
                                    handleSelectProduct(product)
                                  }
                                  className={`
                            w-full
                            text-left
                            px-3
                            py-2
                            border-b
                            border-slate-100
                            last:border-b-0
                            flex
                            items-center
                            justify-between
                            gap-3
                            cursor-pointer
                            transition
                            ${productHighlightIndex ===
                                      index
                                      ? "bg-blue-50"
                                      : "bg-white hover:bg-slate-50"
                                    }
                          `}
                                >
                                  <div
                                    className="
                              min-w-0
                              flex
                              flex-col
                              leading-tight
                            "
                                  >
                                    {matchedSaleName && (
                                      <span
                                        className="
                                  text-[9px]
                                  text-blue-600
                                  italic
                                  truncate
                                "
                                      >
                                        {matchedSaleName}
                                      </span>
                                    )}

                                    <span
                                      className="
                                text-xs
                                font-semibold
                                text-slate-700
                                truncate
                              "
                                    >
                                      {product.product_name}
                                    </span>
                                  </div>

                                  {product.cartoon_size && (
                                    <span
                                      className="
                                shrink-0
                                text-[9px]
                                text-slate-400
                              "
                                    >
                                      Carton {product.cartoon_size}
                                    </span>
                                  )}
                                </button>
                              );
                            }
                          )}
                        </div>
                      ) : (
                        <div
                          className="
                    px-3
                    py-4
                    text-center
                    text-xs
                    text-slate-400
                  "
                        >
                          No products found
                        </div>
                      )}
                    </div>
                  )}
              </div>

              {/* QUANTITY */}
              <div
                className="
          w-full
          sm:w-[100px]
          shrink-0
        "
              >
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newQty}
                  onChange={handleQuantityInput}
                  onKeyDown={(event) => {
                    const allowedKeys = [
                      "Backspace",
                      "Delete",
                      "ArrowLeft",
                      "ArrowRight",
                      "Tab",
                      "Home",
                      "End",
                    ];

                    if (allowedKeys.includes(event.key)) {
                      return;
                    }

                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleAddProduct();
                      return;
                    }

                    if (!/^\d$/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                  placeholder="Qty"
                  autoComplete="off"
                  className="
            w-full
            min-h-[36px]
            px-3
            py-2
            text-xs
            text-center
            text-slate-700
            border
            border-slate-300
            rounded-lg
            bg-white
            outline-none
            transition
            duration-150
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-100
          "
                />
              </div>

              {/* ADD BUTTON */}
              <button
                type="button"
                onClick={handleAddProduct}
                disabled={loading}
                className="
          inline-flex
          items-center
          justify-center
          gap-1.5
          min-h-[36px]
          px-6
          rounded-lg
          bg-emerald-600
          hover:bg-emerald-700
          active:bg-emerald-800
          disabled:bg-slate-300
          disabled:cursor-not-allowed
          text-white
          text-xs
          font-semibold
          shadow-sm
          transition
          duration-150
          cursor-pointer
          shrink-0
        "
              >
                <FaPlus size={10} />
                Add
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="grid grid-cols-12 gap-3">

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="col-span-12">

            <CRMVerifiedTable
              items={enrichedItems}
              order={order}
              user={user}
              setEditingItem={setEditingItem}
              setEditQty={setEditQty}
              setShowEditModal={
                setShowEditModal
              }
              handleDeleteItem={
                handleDeleteItem
              }
              handleSingleRowPunch={
                handleSingleRowPunch
              }
              estimatedTotal={estimatedTotal}
            />


            {/* ORDER PUNCH */}

            <div className="flex justify-end mt-2">

              <button
                type="button"
                onClick={handleOrderPunch}
                disabled={
                  order.punched || loading
                }
                className={`
                  px-6
                  py-2
                  rounded
                  shadow-sm
                  text-xs
                  font-semibold
                  transition
                  ${order.punched || loading
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                  }
                `}
              >
                {loading
                  ? "Processing..."
                  : order.punched
                    ? "Already Punched"
                    : "Order Punch"}
              </button>

            </div>

          </div>

        </div>


        {/* =================================================
            EDIT QUANTITY MODAL
        ================================================= */}

        <EditQuantityModal
          show={showEditModal}
          setShow={setShowEditModal}
          editingItem={editingItem}
          editQty={editQty}
          setEditQty={setEditQty}
          handleEditQuantity={
            handleEditQuantity
          }
        />

      </div>
    </>
  );
}