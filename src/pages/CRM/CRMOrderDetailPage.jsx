// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import { useState, useEffect } from "react";
// import { verifyCRMOrder, holdCRMOrder, RejectCRMOrder } from "../../hooks/useCRMOrders";
// import { useCachedProducts } from "../../hooks/useCachedProducts";
// import { Loader2, Trash2 } from "lucide-react";
// import ConfirmModal from "../../components/ConfirmModal";
// import { useSchemes } from "../../hooks/useSchemes";
// import OrderItemsTable from "../../components/orderSheet/OrderItemsTable";
// import MobilePageHeader from "../../components/MobilePageHeader";
// import TemperedSummaryPanel from "../../components/orderSheet/TemperedSummaryPanel";
// import SamplingSheetPanel from "../../components/orderSheet/SamplingSheetPanel";
// import OrderActionMenu from "../../components/orderSheet/OrderActionMenu";
// import { useQueryClient } from "@tanstack/react-query";
// import BackButton from "../../Layout/BackButton";


// export default function CRMOrderDetailPage() {
//   const { orderId } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const queryClient = useQueryClient();

//   const [itemToDelete, setItemToDelete] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const passedOrder = location.state?.order;
//   const [order, setOrder] = useState(passedOrder || null);
//   const [notes, setNotes] = useState(passedOrder?.notes || "");
//   const [loadingApprove, setLoadingApprove] = useState(false);
//   const isTempered = order?.note?.toLowerCase()?.includes("tempered");
//   const [selectedCity, setSelectedCity] = useState("Delhi");
//   const [manualAvailabilityMap, setManualAvailabilityMap] = useState({});



//   // ✅ Edited items (restore from localStorage or backend)
//   const [editedItems, setEditedItems] = useState([]);
//   // ---------------- SCHEME CALCULATION LOGIC ----------------
//   const { data: schemes = [] } = useSchemes();

//   const getSchemeMultiplier = (scheme, items) => {
//     return Math.min(
//       ...scheme.conditions.map((cond) => {
//         const matched = items.find(
//           (p) =>
//             p.product === cond.product ||
//             p.product_name === cond.product_name
//         );
//         if (!matched) return 0;
//         return Math.floor(matched.quantity / cond.min_quantity);
//       })
//     );
//   };

//   const mergeRewards = (eligibleSchemes) => {
//     const rewardMap = {};

//     eligibleSchemes.forEach((scheme) => {
//       const multiplier = scheme.multiplier;

//       scheme.rewards.forEach((r) => {
//         const productName = r.product_name || r.product;
//         const qty = r.quantity * multiplier;

//         if (rewardMap[productName]) {
//           rewardMap[productName].quantity += qty;
//         } else {
//           rewardMap[productName] = {
//             product_name: productName,
//             quantity: qty,
//           };
//         }
//       });
//     });

//     return Object.values(rewardMap);
//   };

//   // CRM Edited Items (order sheet items)
//   const ssItems = editedItems || [];

//   // Apply Scheme Logic
//   const eligibleSchemes = schemes
//     .filter(s => !s.in_box) // ⭐ यहाँ in_box वाली schemes को ignore कर दिया
//     .map((scheme) => ({
//       ...scheme,
//       multiplier: getSchemeMultiplier(scheme, ssItems),
//     }))
//     .filter((s) => s.multiplier > 0);


//   const mergedRewards = mergeRewards(eligibleSchemes);



//   // ✅ Generate reward text for a product
//   const getSchemeText = (productId) => {
//     const scheme = schemes.find((s) =>
//       Array.isArray(s.conditions) &&
//       s.conditions.some((c) => c.product === productId)
//     );

//     if (!scheme) return null;

//     const cond = scheme.conditions[0]; // assuming single condition
//     const reward = scheme.rewards?.[0]; // assuming single reward

//     if (!cond || !reward) return null;

//     return `Buy ${cond.min_quantity} ${cond.product_name} → Get ${reward.quantity} ${reward.product_name}`;
//   };


//   // ✅ Sync localStorage or backend order items
//   useEffect(() => {
//     const saved = localStorage.getItem(`crm_order_items_${orderId}`);

//     if (saved) {
//       try {
//         const parsed = JSON.parse(saved);
//         if (Array.isArray(parsed) && parsed.length > 0) {
//           setEditedItems(parsed);
//           return;
//         }
//       } catch {
//         localStorage.removeItem(`crm_order_items_${orderId}`);
//       }
//     }

//     if (passedOrder?.items) {
//       const mapped = passedOrder.items.map((item) => ({
//         ...item,
//         original_quantity: item.quantity,
//       }));
//       setEditedItems(mapped);
//       localStorage.setItem(`crm_order_items_${orderId}`, JSON.stringify(mapped));
//     }
//   }, [passedOrder, orderId]);

//   // ✅ Auto-save edited items to localStorage
//   useEffect(() => {
//     if (editedItems && editedItems.length > 0) {
//       localStorage.setItem(
//         `crm_order_items_${orderId}`,
//         JSON.stringify(editedItems)
//       );
//     }
//   }, [editedItems, orderId]);

//   // ✅ All cached products
//   const { data: allProducts = [] } = useCachedProducts();

//   // ✅ Product search
//   const [searchTerm, setSearchTerm] = useState("");
//   const [highlightIndex, setHighlightIndex] = useState(-1);

//   useEffect(() => {
//     if (!passedOrder) navigate("/crm/orders");
//   }, [passedOrder, navigate]);

//   // ✅ Edit quantity
//   const handleEditQuantity = (productId, value) => {
//     setEditedItems((prev) =>
//       prev.map((item) =>
//         item.product === productId
//           ? { ...item, quantity: value === "" ? "" : Number(value) }
//           : item
//       )
//     );
//   };

//   // ✅ Delete item
//   const handleDeleteItem = (productId) => {
//     setEditedItems((prev) => prev.filter((item) => item.product !== productId));
//   };

//   // ✅ Add product by search
//   const handleAddProductBySearch = (product) => {
//     if (!product) return;
//     const existing = editedItems.find((i) => i.product === product.product_id);
//     if (existing) {
//       alert("Product already added!");
//       return;
//     }

//     setEditedItems((prev) => [
//       ...prev,
//       {
//         product: product.product_id,
//         product_name: product.product_name,
//         quantity: "",
//         original_quantity: "Added",
//         price: product.price ?? 0,
//         ss_virtual_stock: product.virtual_stock ?? 0,
//       },
//     ]);
//     setSearchTerm("");
//     setHighlightIndex(-1);
//   };



//   // ✅ Approve order
//   const handleVerify = async () => {
//     if (!order) return;
//     setLoadingApprove(true);

//     const payload = {
//       status: "APPROVED",

//       dispatch_location: selectedCity,
//       items: editedItems.map((item) => ({
//         product: item.product,
//         quantity: Number(item.quantity) || 0,
//       })),
//     };

//     try {
//       await verifyCRMOrder(order.id, payload);
//       queryClient.invalidateQueries({
//         queryKey: ["crmOrders"],
//         exact: false,
//       });

//       alert("Order approved successfully");

//       // ✅ Clear localStorage after success
//       localStorage.removeItem(`crm_order_items_${orderId}`);

//       navigate("/all/orders-history");
//     } catch (error) {
//       console.error("❌ Error verifying order:", error);
//       alert("Failed to verify order");
//     } finally {
//       setLoadingApprove(false);
//     }
//   };


//   // ✅ Calculate Totals
//   const totalSSOrderQty = editedItems.reduce(
//     (sum, item) => sum + Number(item.original_quantity || 0),
//     0
//   );

//   const totalApprovedQty = editedItems.reduce(
//     (sum, item) => sum + Number(item.quantity || 0),
//     0
//   );

//   const totalProducts = editedItems.length;

//   // ✅ Category filters (tempered categories only)
//   const temperedKeywords = [
//     "UV TEMPERED",
//     "TEMPERED MEIBO",
//     "TEMPERED SOLDIER",
//     "NEW SOLDIER TEMPERED",
//     "TEMPERED BODYGUARD",
//     "TEMPERED SUPER X"
//   ];

//   // ✅ Category Wise Quantity + Item Count Calculation
//   const categoryWiseTotals = {};

//   editedItems.forEach((item) => {
//     const product = allProducts.find(p => p.product_id === item.product);
//     const subCat = product?.sub_category?.toUpperCase() ?? "";

//     const matchedKeyword = temperedKeywords.find((kw) =>
//       subCat.includes(kw)
//     );

//     if (matchedKeyword) {
//       if (!categoryWiseTotals[matchedKeyword]) {
//         categoryWiseTotals[matchedKeyword] = {
//           ssQty: 0,
//           approvedQty: 0,
//           orderItems: 0,        // 🆕 total models in order
//           availableItems: 0,    // 🆕 available models
//         };
//       }

//       categoryWiseTotals[matchedKeyword].ssQty += Number(item.original_quantity || 0);
//       categoryWiseTotals[matchedKeyword].approvedQty += Number(item.quantity || 0);

//       // 🆕 Count models
//       categoryWiseTotals[matchedKeyword].orderItems += 1;

//       // 🆕 Available logic
//       const manualAvail = manualAvailabilityMap[item.product];
//       const availableStock =
//         manualAvail !== undefined
//           ? Number(manualAvail)
//           : Number(item.ss_virtual_stock || 0);

//       if (availableStock > 0) {
//         categoryWiseTotals[matchedKeyword].availableItems += 1;
//       }
//     }
//   });

//   useEffect(() => {
//     // keep same behaviour as your original code:
//     if (!editedItems || editedItems.length === 0) return;

//     setEditedItems(prev => {
//       // shallow copy of previous items
//       const updated = [...prev];
//       let changed = false;

//       // helper: find index by product id or product_name
//       const findIndex = (prodId, prodName) =>
//         updated.findIndex(
//           i =>
//             (i.product !== undefined && i.product === prodId) ||
//             (i.product_name !== undefined && i.product_name === prodName)
//         );

//       // STEP 1 — Add or Update Scheme Reward Items
//       mergedRewards.forEach(reward => {
//         const product = allProducts.find(
//           p =>
//             p.product_id === reward.product_id ||
//             p.product_name === reward.product_name
//         );
//         if (!product) return;

//         const idx = findIndex(product.product_id, product.product_name);

//         if (idx >= 0) {
//           // update quantity & mark as scheme item (only if different)
//           const prevQty = Number(updated[idx].quantity) || 0;
//           const newQty = Number(reward.quantity) || 0;
//           if (prevQty !== newQty || !updated[idx].is_scheme_item) {
//             updated[idx] = {
//               ...updated[idx],
//               quantity: newQty,
//               is_scheme_item: true,
//               // keep original_quantity as-is (so original Quantity label isn't lost)
//             };
//             changed = true;
//           }
//         } else {
//           // add new scheme reward item
//           updated.push({
//             product: product.product_id,
//             product_name: product.product_name,
//             quantity: Number(reward.quantity) || 0,
//             original_quantity: "Scheme",
//             price: product.price ?? 0,
//             ss_virtual_stock: product.virtual_stock ?? 0,
//             is_scheme_item: true,
//           });
//           changed = true;
//         }
//       });

//       // STEP 2 — Remove reward items that are no longer valid
//       const filtered = updated.filter(item => {
//         if (!item.is_scheme_item) return true;

//         const stillValid = mergedRewards.some(
//           r => r.product_id === item.product || r.product_name === item.product_name
//         );

//         if (!stillValid) {
//           changed = true;
//           return false; // remove it
//         }
//         return true;
//       });

//       // FINAL guard — if nothing actually changed, return prev to avoid re-render
//       if (!changed) return prev;

//       return filtered;
//     });
//   }, [mergedRewards, allProducts]); // note: same deps as your last working variant

//   const updateManualAvailability = (productId, value) => {
//     setManualAvailabilityMap(prev => ({
//       ...prev,
//       [productId]: value,
//     }));
//   };

//   if (!order)
//     return (
//       <div className="flex justify-center items-center h-64">
//         <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
//       </div>
//     );

//   return (
//     <div className="p-4 rounded pb-20 sm:p-0 ">
//       {/* Header */}
//       <MobilePageHeader title={order.order_id} />
//       <div className="pb-4 flex flex-col flex-row items-center justify-between pt-[65px] sm:p-0 mb-2 bg-gray-200 border rounded">
//         <div className="hidden md:block">
//       <BackButton fallback="/crm/orders" />
//     </div>
//         <div>
//           {/* <h2 className="text-xs font-semibold text-gray-800 hidden sm:flex">{order.order_id}</h2> */}
//           <p className="text-xs ps-2 font-semibold">{order.ss_party_name}</p>
//         </div>

//         <div className="flex items-center gap-2">
//           <OrderActionMenu
//             order={order}
//             notes={notes}
//             navigate={navigate}
//             holdCRMOrder={holdCRMOrder}
//             RejectCRMOrder={RejectCRMOrder}
//             manualAvailabilityMap={manualAvailabilityMap}
//             selectedCity={selectedCity}
//             allProducts={allProducts}
//             items={editedItems}
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//         <div className="md:col-span-1">
//           {isTempered ? (
//             <TemperedSummaryPanel
//               totalSSOrderQty={totalSSOrderQty}
//               totalApprovedQty={totalApprovedQty}
//               totalProducts={totalProducts}
//               categoryWiseTotals={categoryWiseTotals}
//             />
//           ) : (
//             <div className="max-h-[69vh] overflow-y-auto border p-0 m-0 rounded">
              
//               <SamplingSheetPanel partyName={order.ss_party_name} />

//             </div>
//           )}
//         </div>
//         <div className="md:col-span-4">
//           <OrderItemsTable
//             editedItems={editedItems}
//             allProducts={allProducts}
//             handleEditQuantity={handleEditQuantity}
//             setItemToDelete={setItemToDelete}
//             setShowDeleteModal={setShowDeleteModal}
//             selectedCity={selectedCity}
//             manualAvailabilityMap={manualAvailabilityMap}
//             updateManualAvailability={updateManualAvailability}
//             searchTerm={searchTerm}
//             setSearchTerm={setSearchTerm}
//             highlightIndex={highlightIndex}
//             setHighlightIndex={setHighlightIndex}
//             handleAddProductBySearch={handleAddProductBySearch}
//             getSchemeText={getSchemeText}
//             setSelectedCity={setSelectedCity}
//           />
//           <div className="flex justify-end mt-2 sm:hidden">
//             <button
//               onClick={() => setShowConfirmModal(true)}
//               disabled={loadingApprove}
//               className={`flex items-center justify-center gap-2 px-6 py-2 text-white shadow-md w-full sm:w-auto ${loadingApprove
//                 ? "bg-blue-400 cursor-not-allowed"
//                 : "bg-blue-600 hover:bg-green-600"
//                 } cursor-pointer`}
//             >
//               {loadingApprove && <Loader2 className="animate-spin w-4 h-4" />}
//               Submit
//             </button>
//           </div>

//         {/* Desktop */}
//           <div
//             className="
//               fixed bottom-0 right-0 z-[10]
//               left-0 
//               flex h-[60px] items-center justify-end
//               border-t border-[#e7edf5]
//               bg-white px-4 md:px-6
//               shadow-[0_-4px_16px_rgba(15,23,42,0.08)]
//               backdrop-blur-sm 
//             "
//           >
//             <button
//               type="button"
//               onClick={() => setShowConfirmModal(true)}
//               disabled={loadingApprove}
//               className={`
//                 flex items-center justify-center gap-2
//                 rounded cursor-pointer px-7 py-2
//                 text-sm font-semibold text-white
//                 shadow-sm transition-all duration-200
//                 ${
//                   loadingApprove
//                     ? "cursor-not-allowed bg-blue-400"
//                     : "bg-[#1769ff] hover:bg-blue-700 active:scale-[0.98]"
//                 }
//               `}
//             >
//               {loadingApprove && (
//                 <Loader2 className="h-4 w-4 animate-spin" />
//               )}
//               Submit
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* ✅ Confirm Submit Modal */}
//       <ConfirmModal
//         isOpen={showConfirmModal}
//         title="Confirm Order Submission"
//         message="Are you sure you want to submit this order?"
//         confirmText="Yes, Submit"
//         confirmColor="bg-green-500 hover:bg-green-600"
//         onCancel={() => setShowConfirmModal(false)}
//         onConfirm={() => {
//           handleVerify();
//           setShowConfirmModal(false);
//         }}
//       />

//       {/* 🧹 Delete Item Modal */}
//       <ConfirmModal
//         isOpen={showDeleteModal}
//         title="Delete Item?"
//         message="Are you sure you want to delete this item?"
//         confirmText="Yes, Delete"
//         confirmColor="bg-red-500 hover:bg-red-600"
//         onCancel={() => setShowDeleteModal(false)}
//         onConfirm={() => {
//           handleDeleteItem(itemToDelete);
//           setShowDeleteModal(false);
//         }}
//         icon={Trash2}
//       />

//     </div>
//   );
// }




import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  verifyCRMOrder,
  holdCRMOrder,
  RejectCRMOrder,
} from "../../hooks/useCRMOrders";
import { useCachedProducts } from "../../hooks/useCachedProducts";
import { Loader2, Trash2 } from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";
import { useSchemes } from "../../hooks/useSchemes";
import OrderItemsTable from "../../components/orderSheet/OrderItemsTable";
import MobilePageHeader from "../../components/MobilePageHeader";
import TemperedSummaryPanel from "../../components/orderSheet/TemperedSummaryPanel";
import SamplingSheetPanel from "../../components/orderSheet/SamplingSheetPanel";
import OrderActionMenu from "../../components/orderSheet/OrderActionMenu";
import MoveItemsModal from "../../components/orderSheet/MoveItemsModal";
import { useQueryClient } from "@tanstack/react-query";
import BackButton from "../../Layout/BackButton";

export default function CRMOrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // MOVE
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const passedOrder = location.state?.order;

  const [order, setOrder] = useState(
    passedOrder || null
  );

  const [notes, setNotes] = useState(
    passedOrder?.notes || ""
  );

  const [loadingApprove, setLoadingApprove] =
    useState(false);

  const isTempered = order?.note
    ?.toLowerCase()
    ?.includes("tempered");

  const [selectedCity, setSelectedCity] =
    useState("Delhi");

  const [manualAvailabilityMap, setManualAvailabilityMap] =
    useState({});

  /* =========================================================
     EDITED ITEMS
  ========================================================= */

  const [editedItems, setEditedItems] = useState([]);

  /*
   * Prevent initial [] from overwriting localStorage.
   */
  const [itemsInitialized, setItemsInitialized] =
    useState(false);

  /* =========================================================
     SCHEMES
  ========================================================= */

  const { data: schemes = [] } = useSchemes();

  const getSchemeMultiplier = (
    scheme,
    items
  ) => {
    return Math.min(
      ...scheme.conditions.map((cond) => {
        const matched = items.find(
          (p) =>
            p.product === cond.product ||
            p.product_name === cond.product_name
        );

        if (!matched) return 0;

        return Math.floor(
          Number(matched.quantity || 0) /
            Number(cond.min_quantity || 1)
        );
      })
    );
  };

  const mergeRewards = (
    eligibleSchemes
  ) => {
    const rewardMap = {};

    eligibleSchemes.forEach((scheme) => {
      const multiplier =
        scheme.multiplier;

      scheme.rewards.forEach((r) => {
        const productName =
          r.product_name || r.product;

        const qty =
          Number(r.quantity || 0) *
          multiplier;

        if (rewardMap[productName]) {
          rewardMap[productName].quantity +=
            qty;
        } else {
          rewardMap[productName] = {
            product_name: productName,
            quantity: qty,
          };
        }
      });
    });

    return Object.values(rewardMap);
  };

  const ssItems = editedItems || [];

  const eligibleSchemes = schemes
    .filter((s) => !s.in_box)
    .map((scheme) => ({
      ...scheme,
      multiplier:
        getSchemeMultiplier(
          scheme,
          ssItems
        ),
    }))
    .filter(
      (s) => s.multiplier > 0
    );

  const mergedRewards =
    mergeRewards(eligibleSchemes);

  const getSchemeText = (
    productId
  ) => {
    const scheme = schemes.find(
      (s) =>
        Array.isArray(
          s.conditions
        ) &&
        s.conditions.some(
          (c) =>
            c.product === productId
        )
    );

    if (!scheme) return null;

    const cond =
      scheme.conditions[0];

    const reward =
      scheme.rewards?.[0];

    if (!cond || !reward) {
      return null;
    }

    return `Buy ${cond.min_quantity} ${cond.product_name} → Get ${reward.quantity} ${reward.product_name}`;
  };

  /* =========================================================
     RESTORE ITEMS
  ========================================================= */

  useEffect(() => {
    if (!orderId) return;

    const key =
      `crm_order_items_${orderId}`;

    try {
      const saved =
        localStorage.getItem(key);

      /*
       * Existing local draft wins.
       *
       * Empty array is also valid because user may have
       * intentionally moved/deleted all items.
       */
      if (saved !== null) {
        const parsed =
          JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setEditedItems(parsed);
          setItemsInitialized(true);
          return;
        }
      }

      /*
       * No local draft -> use original order items.
       */
      if (
        Array.isArray(
          passedOrder?.items
        )
      ) {
        const mapped =
          passedOrder.items.map(
            (item) => ({
              ...item,
              original_quantity:
                item.original_quantity ??
                item.quantity,
            })
          );

        setEditedItems(mapped);

        localStorage.setItem(
          key,
          JSON.stringify(mapped)
        );

        setItemsInitialized(true);
        return;
      }

      setEditedItems([]);
      setItemsInitialized(true);

      localStorage.setItem(
        key,
        JSON.stringify([])
      );
    } catch (error) {
      console.error(
        "CRM order restore error:",
        error
      );

      localStorage.removeItem(key);

      if (
        Array.isArray(
          passedOrder?.items
        )
      ) {
        const mapped =
          passedOrder.items.map(
            (item) => ({
              ...item,
              original_quantity:
                item.original_quantity ??
                item.quantity,
            })
          );

        setEditedItems(mapped);

        localStorage.setItem(
          key,
          JSON.stringify(mapped)
        );
      } else {
        setEditedItems([]);
      }

      setItemsInitialized(true);
    }
  }, [passedOrder, orderId]);

  /* =========================================================
     AUTO SAVE
  ========================================================= */

  useEffect(() => {
    if (!orderId) return;

    /*
     * Don't save initial [] before restore completes.
     */
    if (!itemsInitialized) return;

    localStorage.setItem(
      `crm_order_items_${orderId}`,
      JSON.stringify(
        editedItems || []
      )
    );
  }, [
    editedItems,
    orderId,
    itemsInitialized,
  ]);

  /* =========================================================
     PRODUCTS
  ========================================================= */

  const { data: allProducts = [] } =
    useCachedProducts();

  const [searchTerm, setSearchTerm] =
    useState("");

  const [highlightIndex, setHighlightIndex] =
    useState(-1);

  useEffect(() => {
    if (!passedOrder) {
      navigate("/crm/orders");
    }
  }, [
    passedOrder,
    navigate,
  ]);

  /* =========================================================
     EDIT QUANTITY
  ========================================================= */

  const handleEditQuantity = (
    productId,
    value
  ) => {
    setEditedItems((prev) =>
      prev.map((item) =>
        item.product === productId
          ? {
              ...item,
              quantity:
                value === ""
                  ? ""
                  : Number(value),
            }
          : item
      )
    );
  };

  /* =========================================================
     DELETE ITEM
  ========================================================= */

  const handleDeleteItem = (
    productId
  ) => {
    setEditedItems((prev) =>
      prev.filter(
        (item) =>
          item.product !==
          productId
      )
    );

    setSelectedProducts(
      (prev) =>
        prev.filter(
          (id) =>
            String(id) !==
            String(productId)
        )
    );
  };

  /* =========================================================
     ADD PRODUCT
  ========================================================= */

  const handleAddProductBySearch = (
    product
  ) => {
    if (!product) return;

    const existing =
      editedItems.find(
        (i) =>
          i.product ===
          product.product_id
      );

    if (existing) {
      alert(
        "Product already added!"
      );
      return;
    }

    setEditedItems((prev) => [
      ...prev,
      {
        product:
          product.product_id,
        product_name:
          product.product_name,
        quantity: "",
        original_quantity:
          "Added",
        price:
          product.price ?? 0,
        ss_virtual_stock:
          product.virtual_stock ?? 0,
      },
    ]);

    setSearchTerm("");
    setHighlightIndex(-1);
  };

  /* =========================================================
     MOVE SELECTED ITEMS
     FRONTEND ONLY
  ========================================================= */

  const handleMoveSelectedItems = (
    destinationOrder
  ) => {
    if (
      !destinationOrder ||
      selectedProducts.length === 0
    ) {
      return;
    }

    const selectedSet =
      new Set(
        selectedProducts.map(
          (id) => String(id)
        )
      );

    const itemsToMove =
      editedItems.filter(
        (item) =>
          selectedSet.has(
            String(item.product)
          )
      );

    if (itemsToMove.length === 0) {
      setSelectedProducts([]);
      setShowMoveModal(false);
      return;
    }

    /* -------------------------------------------------------
       DESTINATION
    ------------------------------------------------------- */

    const destinationKey =
      `crm_order_items_${destinationOrder.id}`;

    let destinationItems = [];

    const savedDestination =
      localStorage.getItem(
        destinationKey
      );

    if (savedDestination !== null) {
      try {
        const parsed =
          JSON.parse(
            savedDestination
          );

        if (Array.isArray(parsed)) {
          destinationItems =
            parsed;
        }
      } catch {
        localStorage.removeItem(
          destinationKey
        );
      }
    } else if (
      Array.isArray(
        destinationOrder.items
      )
    ) {
      destinationItems =
        destinationOrder.items.map(
          (item) => ({
            ...item,
            original_quantity:
              item.original_quantity ??
              item.quantity,
          })
        );
    }

    /* -------------------------------------------------------
       MERGE
    ------------------------------------------------------- */

    const mergedItems = [
      ...destinationItems,
    ];

    itemsToMove.forEach(
      (sourceItem) => {
        const existingIndex =
          mergedItems.findIndex(
            (destinationItem) =>
              String(
                destinationItem.product
              ) ===
              String(
                sourceItem.product
              )
          );

        if (existingIndex === -1) {
          mergedItems.push({
            ...sourceItem,
          });

          return;
        }

        const existing =
          mergedItems[
            existingIndex
          ];

        const existingQty =
          Number(
            existing.quantity
          ) || 0;

        const sourceQty =
          Number(
            sourceItem.quantity
          ) || 0;

        const existingOriginal =
          Number(
            existing.original_quantity
          );

        const sourceOriginal =
          Number(
            sourceItem.original_quantity
          );

        let originalQuantity =
          existing.original_quantity;

        if (
          Number.isFinite(
            existingOriginal
          ) &&
          Number.isFinite(
            sourceOriginal
          )
        ) {
          originalQuantity =
            existingOriginal +
            sourceOriginal;
        }

        mergedItems[
          existingIndex
        ] = {
          ...existing,
          quantity:
            existingQty +
            sourceQty,
          original_quantity:
            originalQuantity,
          price:
            existing.price ??
            sourceItem.price ??
            0,
          ss_virtual_stock:
            existing.ss_virtual_stock ??
            sourceItem.ss_virtual_stock ??
            0,
        };
      }
    );

    /* -------------------------------------------------------
       SAVE DESTINATION
    ------------------------------------------------------- */

    localStorage.setItem(
      destinationKey,
      JSON.stringify(
        mergedItems
      )
    );

    /* -------------------------------------------------------
       REMOVE FROM CURRENT ORDER
    ------------------------------------------------------- */

    const remainingItems =
      editedItems.filter(
        (item) =>
          !selectedSet.has(
            String(item.product)
          )
      );

    setEditedItems(
      remainingItems
    );

    /*
     * Save immediately also.
     * This is important when all rows are moved.
     */
    localStorage.setItem(
      `crm_order_items_${orderId}`,
      JSON.stringify(
        remainingItems
      )
    );

    /* -------------------------------------------------------
       CLEAN SELECTION
    ------------------------------------------------------- */

    setSelectedProducts([]);
    setShowMoveModal(false);

    /*
     * Refresh order list only.
     * No move API call.
     */
    queryClient.invalidateQueries({
      queryKey: ["crmOrders"],
      exact: false,
    });

    alert(
      `${itemsToMove.length} ${
        itemsToMove.length === 1
          ? "item"
          : "items"
      } moved successfully.`
    );
  };

  /* =========================================================
     VERIFY
  ========================================================= */

  const handleVerify = async () => {
    if (!order) return;

    setLoadingApprove(true);

    const payload = {
      status: "APPROVED",
      dispatch_location:
        selectedCity,

      items: editedItems.map(
        (item) => ({
          product: item.product,
          quantity:
            Number(
              item.quantity
            ) || 0,
        })
      ),
    };

    try {
      await verifyCRMOrder(
        order.id,
        payload
      );

      queryClient.invalidateQueries({
        queryKey: ["crmOrders"],
        exact: false,
      });

      alert(
        "Order approved successfully"
      );

      localStorage.removeItem(
        `crm_order_items_${orderId}`
      );

      localStorage.removeItem(
        `crm_order_items_initialized_${orderId}`
      );

      navigate(
        "/all/orders-history"
      );
    } catch (error) {
      console.error(
        "❌ Error verifying order:",
        error
      );

      alert(
        "Failed to verify order"
      );
    } finally {
      setLoadingApprove(false);
    }
  };

  /* =========================================================
     TOTALS
  ========================================================= */

  const totalSSOrderQty =
    editedItems.reduce(
      (sum, item) =>
        sum +
        Number(
          item.original_quantity ||
            0
        ),
      0
    );

  const totalApprovedQty =
    editedItems.reduce(
      (sum, item) =>
        sum +
        Number(
          item.quantity || 0
        ),
      0
    );

  const totalProducts =
    editedItems.length;

  /* =========================================================
     TEMPERED
  ========================================================= */

  const temperedKeywords = [
    "UV TEMPERED",
    "TEMPERED MEIBO",
    "TEMPERED SOLDIER",
    "NEW SOLDIER TEMPERED",
    "TEMPERED BODYGUARD",
    "TEMPERED SUPER X",
  ];

  const categoryWiseTotals = {};

  editedItems.forEach((item) => {
    const product =
      allProducts.find(
        (p) =>
          p.product_id ===
          item.product
      );

    const subCat =
      product?.sub_category?.toUpperCase() ??
      "";

    const matchedKeyword =
      temperedKeywords.find(
        (kw) =>
          subCat.includes(kw)
      );

    if (matchedKeyword) {
      if (
        !categoryWiseTotals[
          matchedKeyword
        ]
      ) {
        categoryWiseTotals[
          matchedKeyword
        ] = {
          ssQty: 0,
          approvedQty: 0,
          orderItems: 0,
          availableItems: 0,
        };
      }

      categoryWiseTotals[
        matchedKeyword
      ].ssQty += Number(
        item.original_quantity ||
          0
      );

      categoryWiseTotals[
        matchedKeyword
      ].approvedQty += Number(
        item.quantity || 0
      );

      categoryWiseTotals[
        matchedKeyword
      ].orderItems += 1;

      const manualAvail =
        manualAvailabilityMap[
          item.product
        ];

      const availableStock =
        manualAvail !== undefined
          ? Number(manualAvail)
          : Number(
              item.ss_virtual_stock ||
                0
            );

      if (
        availableStock > 0
      ) {
        categoryWiseTotals[
          matchedKeyword
        ].availableItems += 1;
      }
    }
  });

  /* =========================================================
     SCHEME SYNC
  ========================================================= */

  useEffect(() => {
    if (
      !editedItems ||
      editedItems.length === 0
    ) {
      return;
    }

    setEditedItems((prev) => {
      const updated = [
        ...prev,
      ];

      let changed = false;

      const findIndex = (
        prodId,
        prodName
      ) =>
        updated.findIndex(
          (i) =>
            (i.product !==
              undefined &&
              i.product ===
                prodId) ||
            (i.product_name !==
              undefined &&
              i.product_name ===
                prodName)
        );

      mergedRewards.forEach(
        (reward) => {
          const product =
            allProducts.find(
              (p) =>
                p.product_id ===
                  reward.product_id ||
                p.product_name ===
                  reward.product_name
            );

          if (!product) return;

          const idx =
            findIndex(
              product.product_id,
              product.product_name
            );

          if (idx >= 0) {
            const prevQty =
              Number(
                updated[idx]
                  .quantity
              ) || 0;

            const newQty =
              Number(
                reward.quantity
              ) || 0;

            if (
              prevQty !==
                newQty ||
              !updated[idx]
                .is_scheme_item
            ) {
              updated[idx] = {
                ...updated[idx],
                quantity:
                  newQty,
                is_scheme_item:
                  true,
              };

              changed = true;
            }
          } else {
            updated.push({
              product:
                product.product_id,
              product_name:
                product.product_name,
              quantity:
                Number(
                  reward.quantity
                ) || 0,
              original_quantity:
                "Scheme",
              price:
                product.price ??
                0,
              ss_virtual_stock:
                product.virtual_stock ??
                0,
              is_scheme_item:
                true,
            });

            changed = true;
          }
        }
      );

      const filtered =
        updated.filter(
          (item) => {
            if (
              !item.is_scheme_item
            ) {
              return true;
            }

            const stillValid =
              mergedRewards.some(
                (r) =>
                  r.product_id ===
                    item.product ||
                  r.product_name ===
                    item.product_name
              );

            if (!stillValid) {
              changed = true;
              return false;
            }

            return true;
          }
        );

      if (!changed) {
        return prev;
      }

      return filtered;
    });
  }, [
    mergedRewards,
    allProducts,
  ]);

  /* =========================================================
     MANUAL AVAILABILITY
  ========================================================= */

  const updateManualAvailability = (
    productId,
    value
  ) => {
    setManualAvailabilityMap(
      (prev) => ({
        ...prev,
        [productId]: value,
      })
    );
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (!order) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="rounded p-4 pb-20 sm:p-0">

      <MobilePageHeader
        title={order.order_id}
      />

      <div className="mb-2 flex flex-col items-center justify-between rounded border bg-gray-200 pb-4 pt-[65px] sm:p-0 md:flex-row">

        <div className="hidden md:block">
          <BackButton
            fallback="/crm/orders"
          />
        </div>

        <div>
          <p className="ps-2 text-xs font-semibold">
            {order.ss_party_name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <OrderActionMenu
            order={order}
            notes={notes}
            navigate={navigate}
            holdCRMOrder={
              holdCRMOrder
            }
            RejectCRMOrder={
              RejectCRMOrder
            }
            manualAvailabilityMap={
              manualAvailabilityMap
            }
            selectedCity={
              selectedCity
            }
            allProducts={
              allProducts
            }
            items={
              editedItems
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">

        <div className="md:col-span-1">
          {isTempered ? (
            <TemperedSummaryPanel
              totalSSOrderQty={
                totalSSOrderQty
              }
              totalApprovedQty={
                totalApprovedQty
              }
              totalProducts={
                totalProducts
              }
              categoryWiseTotals={
                categoryWiseTotals
              }
            />
          ) : (
            <div className="m-0 max-h-[69vh] overflow-y-auto rounded border p-0">
              <SamplingSheetPanel
                partyName={
                  order.ss_party_name
                }
              />
            </div>
          )}
        </div>

        <div className="md:col-span-4">

          <OrderItemsTable
            editedItems={
              editedItems
            }
            allProducts={
              allProducts
            }
            handleEditQuantity={
              handleEditQuantity
            }
            setItemToDelete={
              setItemToDelete
            }
            setShowDeleteModal={
              setShowDeleteModal
            }
            selectedCity={
              selectedCity
            }
            manualAvailabilityMap={
              manualAvailabilityMap
            }
            updateManualAvailability={
              updateManualAvailability
            }
            searchTerm={
              searchTerm
            }
            setSearchTerm={
              setSearchTerm
            }
            highlightIndex={
              highlightIndex
            }
            setHighlightIndex={
              setHighlightIndex
            }
            handleAddProductBySearch={
              handleAddProductBySearch
            }
            getSchemeText={
              getSchemeText
            }
            setSelectedCity={
              setSelectedCity
            }

            /* ONLY NEW MOVE PROPS */
            selectedProducts={
              selectedProducts
            }
            setSelectedProducts={
              setSelectedProducts
            }
            onMoveSelected={() =>
              setShowMoveModal(
                true
              )
            }
          />

          <div className="mt-2 flex justify-end sm:hidden">
            <button
              onClick={() =>
                setShowConfirmModal(
                  true
                )
              }
              disabled={
                loadingApprove
              }
              className={`flex w-full cursor-pointer items-center justify-center gap-2 px-6 py-2 text-white shadow-md sm:w-auto ${
                loadingApprove
                  ? "cursor-not-allowed bg-blue-400"
                  : "bg-blue-600 hover:bg-green-600"
              }`}
            >
              {loadingApprove && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              Submit
            </button>
          </div>

          <div
            className="
              fixed
              bottom-0
              left-0
              right-0
              z-[10]
              flex
              h-[60px]
              items-center
              justify-end
              border-t
              border-[#e7edf5]
              bg-white
              px-4
              shadow-[0_-4px_16px_rgba(15,23,42,0.08)]
              backdrop-blur-sm
              md:px-6
            "
          >
            <button
              type="button"
              onClick={() =>
                setShowConfirmModal(
                  true
                )
              }
              disabled={
                loadingApprove
              }
              className={`
                flex
                cursor-pointer
                items-center
                justify-center
                gap-2
                rounded
                px-7
                py-2
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition-all
                duration-200

                ${
                  loadingApprove
                    ? "cursor-not-allowed bg-blue-400"
                    : "bg-[#1769ff] hover:bg-blue-700 active:scale-[0.98]"
                }
              `}
            >
              {loadingApprove && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              Submit
            </button>
          </div>

        </div>
      </div>

      {/* =====================================================
          MOVE ITEMS
      ===================================================== */}

      <MoveItemsModal
        isOpen={
          showMoveModal
        }
        onClose={() =>
          setShowMoveModal(false)
        }
        currentOrderId={
          order.id
        }
        selectedCount={
          selectedProducts.length
        }
        onMove={
          handleMoveSelectedItems
        }
      />

      {/* =====================================================
          SUBMIT
      ===================================================== */}

      <ConfirmModal
        isOpen={
          showConfirmModal
        }
        title="Confirm Order Submission"
        message="Are you sure you want to submit this order?"
        confirmText="Yes, Submit"
        confirmColor="bg-green-500 hover:bg-green-600"
        onCancel={() =>
          setShowConfirmModal(
            false
          )
        }
        onConfirm={() => {
          handleVerify();
          setShowConfirmModal(
            false
          );
        }}
      />

      {/* =====================================================
          DELETE
      ===================================================== */}

      <ConfirmModal
        isOpen={
          showDeleteModal
        }
        title="Delete Item?"
        message="Are you sure you want to delete this item?"
        confirmText="Yes, Delete"
        confirmColor="bg-red-500 hover:bg-red-600"
        onCancel={() =>
          setShowDeleteModal(
            false
          )
        }
        onConfirm={() => {
          handleDeleteItem(
            itemToDelete
          );
          setShowDeleteModal(
            false
          );
        }}
        icon={Trash2}
      />

    </div>
  );
}