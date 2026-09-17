import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { verifyCRMOrder, holdCRMOrder, RejectCRMOrder } from "../../hooks/useCRMOrders";
import { useCachedProducts } from "../../hooks/useCachedProducts";
import { Loader2, Trash2 } from "lucide-react";
import ConfirmModal from "../../components/ConfirmModal";
import { useSchemes } from "../../hooks/useSchemes";
import OrderItemsTable from "../../components/orderSheet/OrderItemsTable";
import MobilePageHeader from "../../components/MobilePageHeader";
import TemperedSummaryPanel from "../../components/orderSheet/TemperedSummaryPanel";
import SamplingSheetPanel from "../../components/orderSheet/SamplingSheetPanel";
import OrderActionMenu from "../../components/orderSheet/OrderActionMenu";
import { useQueryClient } from "@tanstack/react-query";


export default function CRMOrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const passedOrder = location.state?.order;
  const [order, setOrder] = useState(passedOrder || null);
  const [notes, setNotes] = useState(passedOrder?.notes || "");
  const [loadingApprove, setLoadingApprove] = useState(false);
  const isTempered = order?.note?.toLowerCase()?.includes("tempered");
  const [selectedCity, setSelectedCity] = useState("Delhi");
  const [manualAvailabilityMap, setManualAvailabilityMap] = useState({});



  // ✅ Edited items (restore from localStorage or backend)
  const [editedItems, setEditedItems] = useState([]);
  // ---------------- SCHEME CALCULATION LOGIC ----------------
  const { data: schemes = [] } = useSchemes();

  const getSchemeMultiplier = (scheme, items) => {
    return Math.min(
      ...scheme.conditions.map((cond) => {
        const matched = items.find(
          (p) =>
            p.product === cond.product ||
            p.product_name === cond.product_name
        );
        if (!matched) return 0;
        return Math.floor(matched.quantity / cond.min_quantity);
      })
    );
  };

  const mergeRewards = (eligibleSchemes) => {
    const rewardMap = {};

    eligibleSchemes.forEach((scheme) => {
      const multiplier = scheme.multiplier;

      scheme.rewards.forEach((r) => {
        const productName = r.product_name || r.product;
        const qty = r.quantity * multiplier;

        if (rewardMap[productName]) {
          rewardMap[productName].quantity += qty;
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

  // CRM Edited Items (order sheet items)
  const ssItems = editedItems || [];

  // Apply Scheme Logic
  const eligibleSchemes = schemes
    .filter(s => !s.in_box) // ⭐ यहाँ in_box वाली schemes को ignore कर दिया
    .map((scheme) => ({
      ...scheme,
      multiplier: getSchemeMultiplier(scheme, ssItems),
    }))
    .filter((s) => s.multiplier > 0);


  const mergedRewards = mergeRewards(eligibleSchemes);



  // ✅ Generate reward text for a product
  const getSchemeText = (productId) => {
    const scheme = schemes.find((s) =>
      Array.isArray(s.conditions) &&
      s.conditions.some((c) => c.product === productId)
    );

    if (!scheme) return null;

    const cond = scheme.conditions[0]; // assuming single condition
    const reward = scheme.rewards?.[0]; // assuming single reward

    if (!cond || !reward) return null;

    return `Buy ${cond.min_quantity} ${cond.product_name} → Get ${reward.quantity} ${reward.product_name}`;
  };


  // ✅ Sync localStorage or backend order items
  useEffect(() => {
    const saved = localStorage.getItem(`crm_order_items_${orderId}`);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEditedItems(parsed);
          return;
        }
      } catch {
        localStorage.removeItem(`crm_order_items_${orderId}`);
      }
    }

    if (passedOrder?.items) {
      const mapped = passedOrder.items.map((item) => ({
        ...item,
        original_quantity: item.quantity,
      }));
      setEditedItems(mapped);
      localStorage.setItem(`crm_order_items_${orderId}`, JSON.stringify(mapped));
    }
  }, [passedOrder, orderId]);

  // ✅ Auto-save edited items to localStorage
  useEffect(() => {
    if (editedItems && editedItems.length > 0) {
      localStorage.setItem(
        `crm_order_items_${orderId}`,
        JSON.stringify(editedItems)
      );
    }
  }, [editedItems, orderId]);

  // ✅ All cached products
  const { data: allProducts = [] } = useCachedProducts();

  // ✅ Product search
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);

  useEffect(() => {
    if (!passedOrder) navigate("/crm/orders");
  }, [passedOrder, navigate]);

  // ✅ Edit quantity
  const handleEditQuantity = (productId, value) => {
    setEditedItems((prev) =>
      prev.map((item) =>
        item.product === productId
          ? { ...item, quantity: value === "" ? "" : Number(value) }
          : item
      )
    );
  };

  // ✅ Delete item
  const handleDeleteItem = (productId) => {
    setEditedItems((prev) => prev.filter((item) => item.product !== productId));
  };

  // ✅ Add product by search
  const handleAddProductBySearch = (product) => {
    if (!product) return;
    const existing = editedItems.find((i) => i.product === product.product_id);
    if (existing) {
      alert("Product already added!");
      return;
    }

    setEditedItems((prev) => [
      ...prev,
      {
        product: product.product_id,
        product_name: product.product_name,
        quantity: 1,
        original_quantity: "Added",
        price: product.price ?? 0,
        ss_virtual_stock: product.virtual_stock ?? 0,
      },
    ]);
    setSearchTerm("");
    setHighlightIndex(-1);
  };



  // ✅ Approve order
  const handleVerify = async () => {
    if (!order) return;
    setLoadingApprove(true);

    const payload = {
      status: "APPROVED",

      dispatch_location: selectedCity,
      items: editedItems.map((item) => ({
        product: item.product,
        quantity: Number(item.quantity) || 0,
      })),
    };

    try {
      await verifyCRMOrder(order.id, payload);
      queryClient.invalidateQueries({
        queryKey: ["crmOrders"],
        exact: false,
      });

      alert("Order approved successfully");

      // ✅ Clear localStorage after success
      localStorage.removeItem(`crm_order_items_${orderId}`);

      navigate("/all/orders-history");
    } catch (error) {
      console.error("❌ Error verifying order:", error);
      alert("Failed to verify order");
    } finally {
      setLoadingApprove(false);
    }
  };


  // ✅ Calculate Totals
  const totalSSOrderQty = editedItems.reduce(
    (sum, item) => sum + Number(item.original_quantity || 0),
    0
  );

  const totalApprovedQty = editedItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const totalProducts = editedItems.length;

  // ✅ Category filters (tempered categories only)
  const temperedKeywords = [
    "UV TEMPERED",
    "TEMPERED MEIBO",
    "TEMPERED SOLDIER",
    "NEW SOLDIER TEMPERED",
    "TEMPERED BODYGUARD",
    "TEMPERED SUPER X"
  ];

  // ✅ Category Wise Quantity + Item Count Calculation
  const categoryWiseTotals = {};

  editedItems.forEach((item) => {
    const product = allProducts.find(p => p.product_id === item.product);
    const subCat = product?.sub_category?.toUpperCase() ?? "";

    const matchedKeyword = temperedKeywords.find((kw) =>
      subCat.includes(kw)
    );

    if (matchedKeyword) {
      if (!categoryWiseTotals[matchedKeyword]) {
        categoryWiseTotals[matchedKeyword] = {
          ssQty: 0,
          approvedQty: 0,
          orderItems: 0,        // 🆕 total models in order
          availableItems: 0,    // 🆕 available models
        };
      }

      categoryWiseTotals[matchedKeyword].ssQty += Number(item.original_quantity || 0);
      categoryWiseTotals[matchedKeyword].approvedQty += Number(item.quantity || 0);

      // 🆕 Count models
      categoryWiseTotals[matchedKeyword].orderItems += 1;

      // 🆕 Available logic
      const manualAvail = manualAvailabilityMap[item.product];
      const availableStock =
        manualAvail !== undefined
          ? Number(manualAvail)
          : Number(item.ss_virtual_stock || 0);

      if (availableStock > 0) {
        categoryWiseTotals[matchedKeyword].availableItems += 1;
      }
    }
  });

  useEffect(() => {
    // keep same behaviour as your original code:
    if (!editedItems || editedItems.length === 0) return;

    setEditedItems(prev => {
      // shallow copy of previous items
      const updated = [...prev];
      let changed = false;

      // helper: find index by product id or product_name
      const findIndex = (prodId, prodName) =>
        updated.findIndex(
          i =>
            (i.product !== undefined && i.product === prodId) ||
            (i.product_name !== undefined && i.product_name === prodName)
        );

      // STEP 1 — Add or Update Scheme Reward Items
      mergedRewards.forEach(reward => {
        const product = allProducts.find(
          p =>
            p.product_id === reward.product_id ||
            p.product_name === reward.product_name
        );
        if (!product) return;

        const idx = findIndex(product.product_id, product.product_name);

        if (idx >= 0) {
          // update quantity & mark as scheme item (only if different)
          const prevQty = Number(updated[idx].quantity) || 0;
          const newQty = Number(reward.quantity) || 0;
          if (prevQty !== newQty || !updated[idx].is_scheme_item) {
            updated[idx] = {
              ...updated[idx],
              quantity: newQty,
              is_scheme_item: true,
              // keep original_quantity as-is (so original Quantity label isn't lost)
            };
            changed = true;
          }
        } else {
          // add new scheme reward item
          updated.push({
            product: product.product_id,
            product_name: product.product_name,
            quantity: Number(reward.quantity) || 0,
            original_quantity: "Scheme",
            price: product.price ?? 0,
            ss_virtual_stock: product.virtual_stock ?? 0,
            is_scheme_item: true,
          });
          changed = true;
        }
      });

      // STEP 2 — Remove reward items that are no longer valid
      const filtered = updated.filter(item => {
        if (!item.is_scheme_item) return true;

        const stillValid = mergedRewards.some(
          r => r.product_id === item.product || r.product_name === item.product_name
        );

        if (!stillValid) {
          changed = true;
          return false; // remove it
        }
        return true;
      });

      // FINAL guard — if nothing actually changed, return prev to avoid re-render
      if (!changed) return prev;

      return filtered;
    });
  }, [mergedRewards, allProducts]); // note: same deps as your last working variant

  const updateManualAvailability = (productId, value) => {
    setManualAvailabilityMap(prev => ({
      ...prev,
      [productId]: value,
    }));
  };

  if (!order)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );

  return (
    <div className="p-4 rounded pb-20 sm:p-0 sm:pb-25">
      {/* Header */}
      <MobilePageHeader title={order.order_id} />
      <div className="pb-4 flex flex-col flex-row items-center justify-between pt-[65px] sm:p-0 mb-2 bg-gray-200 border rounded">
        {/* Left Section — Order Info */}
        <div>
          {/* <h2 className="text-xs font-semibold text-gray-800 hidden sm:flex">{order.order_id}</h2> */}
          <p className="text-xs ps-2 font-semibold">{order.ss_party_name}</p>
        </div>

        <div className="flex items-center gap-2">
          <OrderActionMenu
            order={order}
            notes={notes}
            navigate={navigate}
            holdCRMOrder={holdCRMOrder}
            RejectCRMOrder={RejectCRMOrder}
            manualAvailabilityMap={manualAvailabilityMap}
            selectedCity={selectedCity}
            allProducts={allProducts}
            items={editedItems}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-1">
          {isTempered ? (
            <TemperedSummaryPanel
              totalSSOrderQty={totalSSOrderQty}
              totalApprovedQty={totalApprovedQty}
              totalProducts={totalProducts}
              categoryWiseTotals={categoryWiseTotals}
            />
          ) : (
            <div className="max-h-[69vh] overflow-y-auto border p-0 m-0 rounded">
              
              <SamplingSheetPanel partyName={order.ss_party_name} />

            </div>
          )}
        </div>
        <div className="md:col-span-4">
          <OrderItemsTable
            editedItems={editedItems}
            allProducts={allProducts}
            handleEditQuantity={handleEditQuantity}
            setItemToDelete={setItemToDelete}
            setShowDeleteModal={setShowDeleteModal}
            selectedCity={selectedCity}
            manualAvailabilityMap={manualAvailabilityMap}
            updateManualAvailability={updateManualAvailability}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            highlightIndex={highlightIndex}
            setHighlightIndex={setHighlightIndex}
            handleAddProductBySearch={handleAddProductBySearch}
            getSchemeText={getSchemeText}
            setSelectedCity={setSelectedCity}
          />
          <div className="flex justify-end mt-2 sm:hidden">
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={loadingApprove}
              className={`flex items-center justify-center gap-2 px-6 py-2 text-white shadow-md w-full sm:w-auto ${loadingApprove
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-green-600"
                } cursor-pointer`}
            >
              {loadingApprove && <Loader2 className="animate-spin w-4 h-4" />}
              Submit
            </button>
          </div>

        {/* Desktop */}
          <div
            className="
              fixed bottom-0 right-0 z-[90]
              left-0 md:left-[220px]
              flex h-[64px] items-center justify-end
              border-t border-[#e7edf5]
              bg-white/95 px-4 md:px-6
              shadow-[0_-4px_16px_rgba(15,23,42,0.08)]
              backdrop-blur-sm
            "
          >
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={loadingApprove}
              className={`
                flex items-center justify-center gap-2
                rounded cursor-pointer px-7 py-2.5
                text-sm font-semibold text-white
                shadow-sm transition-all duration-200
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

      {/* ✅ Confirm Submit Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirm Order Submission"
        message="Are you sure you want to submit this order?"
        confirmText="Yes, Submit"
        confirmColor="bg-green-500 hover:bg-green-600"
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={() => {
          handleVerify();
          setShowConfirmModal(false);
        }}
      />

      {/* 🧹 Delete Item Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Item?"
        message="Are you sure you want to delete this item?"
        confirmText="Yes, Delete"
        confirmColor="bg-red-500 hover:bg-red-600"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          handleDeleteItem(itemToDelete);
          setShowDeleteModal(false);
        }}
        icon={Trash2}
      />

    </div>
  );
}



// import {
//   useState,
//   useEffect,
//   useMemo,
// } from "react";

// import {
//   useParams,
//   useNavigate,
//   useLocation,
// } from "react-router-dom";

// import {
//   verifyCRMOrder,
//   holdCRMOrder,
//   RejectCRMOrder,
// } from "../../hooks/useCRMOrders";

// import { useCachedProducts } from "../../hooks/useCachedProducts";
// import { useSchemes } from "../../hooks/useSchemes";

// import {
//   Loader2,
//   Trash2,
//   ArrowLeft,
//   Package,
//   CheckCircle2,
//   Boxes,
//   ClipboardList,
//   MapPin,
//   Clock3,
//   UserRound,
//   FileText,
//   Sparkles,
//   ShieldCheck,
//   AlertCircle,
//   ChevronRight,
// } from "lucide-react";

// import ConfirmModal from "../../components/ConfirmModal";

// import OrderItemsTable from "../../components/orderSheet/OrderItemsTable";
// import MobilePageHeader from "../../components/MobilePageHeader";
// import TemperedSummaryPanel from "../../components/orderSheet/TemperedSummaryPanel";
// import SamplingSheetPanel from "../../components/orderSheet/SamplingSheetPanel";
// import OrderActionMenu from "../../components/orderSheet/OrderActionMenu";

// import { useQueryClient } from "@tanstack/react-query";

// export default function CRMOrderDetailPage() {
//   const { orderId } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const queryClient = useQueryClient();

//   const passedOrder = location.state?.order;

//   const [order] = useState(
//     passedOrder || null
//   );

//   const [itemToDelete, setItemToDelete] =
//     useState(null);

//   const [showDeleteModal, setShowDeleteModal] =
//     useState(false);

//   const [showConfirmModal, setShowConfirmModal] =
//     useState(false);

//   /* =========================================================
//      ORDER NOTE
//      Supports BOTH old `note` and new `notes`
//   ========================================================= */

//   const orderNote =
//     order?.notes ||
//     order?.note ||
//     "";

//   const [notes] = useState(
//     orderNote
//   );

//   const [loadingApprove, setLoadingApprove] =
//     useState(false);

//   const [selectedCity, setSelectedCity] =
//     useState("Delhi");

//   const [
//     manualAvailabilityMap,
//     setManualAvailabilityMap,
//   ] = useState({});

//   const [editedItems, setEditedItems] =
//     useState([]);

//   const [searchTerm, setSearchTerm] =
//     useState("");

//   const [highlightIndex, setHighlightIndex] =
//     useState(-1);

//   const { data: schemes = [] } =
//     useSchemes();

//   const { data: allProducts = [] } =
//     useCachedProducts();

//   /* =========================================================
//      ORDER TYPE

//      IMPORTANT:
//      Old code used order.note
//      New code used order.notes

//      Support both so Tempered Summary never disappears.
//   ========================================================= */

//   const isTempered =
//     String(orderNote)
//       .toLowerCase()
//       .includes("tempered");

//   /* =========================================================
//      REDIRECT
//   ========================================================= */

//   useEffect(() => {
//     if (!passedOrder) {
//       navigate("/crm/orders");
//     }
//   }, [
//     passedOrder,
//     navigate,
//   ]);

//   /* =========================================================
//      LOAD ORDER ITEMS
//   ========================================================= */

//   useEffect(() => {
//     const storageKey =
//       `crm_order_items_${orderId}`;

//     const saved =
//       localStorage.getItem(
//         storageKey
//       );

//     if (saved) {
//       try {
//         const parsed =
//           JSON.parse(saved);

//         if (
//           Array.isArray(parsed) &&
//           parsed.length > 0
//         ) {
//           setEditedItems(
//             parsed
//           );

//           return;
//         }
//       } catch {
//         localStorage.removeItem(
//           storageKey
//         );
//       }
//     }

//     if (passedOrder?.items) {
//       const mapped =
//         passedOrder.items.map(
//           (item) => ({
//             ...item,
//             original_quantity:
//               item.quantity,
//           })
//         );

//       setEditedItems(
//         mapped
//       );

//       localStorage.setItem(
//         storageKey,
//         JSON.stringify(mapped)
//       );
//     }
//   }, [
//     passedOrder,
//     orderId,
//   ]);

//   /* =========================================================
//      AUTO SAVE
//   ========================================================= */

//   useEffect(() => {
//     if (
//       editedItems.length > 0
//     ) {
//       localStorage.setItem(
//         `crm_order_items_${orderId}`,
//         JSON.stringify(
//           editedItems
//         )
//       );
//     }
//   }, [
//     editedItems,
//     orderId,
//   ]);

//   /* =========================================================
//      PRODUCT ID HELPER
//   ========================================================= */

//   const getProductId = (
//     product
//   ) => {
//     return (
//       product?.product_id ??
//       product?.id
//     );
//   };

//   /* =========================================================
//      SCHEME MULTIPLIER
//   ========================================================= */

//   const getSchemeMultiplier = (
//     scheme,
//     items
//   ) => {
//     if (
//       !Array.isArray(
//         scheme.conditions
//       ) ||
//       scheme.conditions.length === 0
//     ) {
//       return 0;
//     }

//     return Math.min(
//       ...scheme.conditions.map(
//         (condition) => {
//           const matched =
//             items.find(
//               (item) =>
//                 String(
//                   item.product
//                 ) ===
//                   String(
//                     condition.product
//                   ) ||
//                 String(
//                   item.product_name ||
//                     ""
//                 ).toLowerCase() ===
//                   String(
//                     condition.product_name ||
//                       ""
//                   ).toLowerCase()
//             );

//           if (!matched) {
//             return 0;
//           }

//           return Math.floor(
//             Number(
//               matched.quantity || 0
//             ) /
//               Number(
//                 condition.min_quantity ||
//                   1
//               )
//           );
//         }
//       )
//     );
//   };

//   /* =========================================================
//      MERGE REWARDS
//   ========================================================= */

//   const mergeRewards = (
//     eligibleSchemes
//   ) => {
//     const rewardMap = {};

//     eligibleSchemes.forEach(
//       (scheme) => {
//         const multiplier =
//           Number(
//             scheme.multiplier || 0
//           );

//         if (
//           !Array.isArray(
//             scheme.rewards
//           )
//         ) {
//           return;
//         }

//         scheme.rewards.forEach(
//           (reward) => {
//             const productName =
//               reward.product_name ||
//               reward.product;

//             if (!productName) {
//               return;
//             }

//             const qty =
//               Number(
//                 reward.quantity || 0
//               ) * multiplier;

//             if (
//               rewardMap[
//                 productName
//               ]
//             ) {
//               rewardMap[
//                 productName
//               ].quantity += qty;
//             } else {
//               rewardMap[
//                 productName
//               ] = {
//                 product_name:
//                   productName,
//                 quantity: qty,
//               };
//             }
//           }
//         );
//       }
//     );

//     return Object.values(
//       rewardMap
//     );
//   };

//   /* =========================================================
//      ELIGIBLE SCHEMES
//   ========================================================= */

//   const eligibleSchemes =
//     useMemo(() => {
//       return schemes
//         .filter(
//           (scheme) =>
//             !scheme.in_box
//         )
//         .map(
//           (scheme) => ({
//             ...scheme,
//             multiplier:
//               getSchemeMultiplier(
//                 scheme,
//                 editedItems
//               ),
//           })
//         )
//         .filter(
//           (scheme) =>
//             scheme.multiplier > 0
//         );
//     }, [
//       schemes,
//       editedItems,
//     ]);

//   /* =========================================================
//      MERGED REWARDS
//   ========================================================= */

//   const mergedRewards =
//     useMemo(
//       () =>
//         mergeRewards(
//           eligibleSchemes
//         ),
//       [eligibleSchemes]
//     );

//   /* =========================================================
//      SCHEME TEXT
//   ========================================================= */

//   const getSchemeText = (
//     productId
//   ) => {
//     const scheme =
//       schemes.find(
//         (s) =>
//           Array.isArray(
//             s.conditions
//           ) &&
//           s.conditions.some(
//             (condition) =>
//               String(
//                 condition.product
//               ) ===
//               String(
//                 productId
//               )
//           )
//       );

//     if (!scheme) {
//       return null;
//     }

//     const condition =
//       scheme.conditions?.[0];

//     const reward =
//       scheme.rewards?.[0];

//     if (
//       !condition ||
//       !reward
//     ) {
//       return null;
//     }

//     return `Buy ${condition.min_quantity} ${condition.product_name} → Get ${reward.quantity} ${reward.product_name}`;
//   };

//   /* =========================================================
//      ADD / UPDATE SCHEME ITEMS
//   ========================================================= */

//   useEffect(() => {
//     if (
//       !editedItems.length ||
//       !mergedRewards.length
//     ) {
//       return;
//     }

//     setEditedItems(
//       (prev) => {
//         const updated = [
//           ...prev,
//         ];

//         let changed =
//           false;

//         const findIndex = (
//           productId,
//           productName
//         ) => {
//           return updated.findIndex(
//             (item) =>
//               String(
//                 item.product
//               ) ===
//                 String(
//                   productId
//                 ) ||
//               String(
//                 item.product_name ||
//                   ""
//               ).toLowerCase() ===
//                 String(
//                   productName ||
//                     ""
//                 ).toLowerCase()
//           );
//         };

//         mergedRewards.forEach(
//           (reward) => {
//             const product =
//               allProducts.find(
//                 (productItem) =>
//                   String(
//                     productItem.product_name ||
//                       ""
//                   ).toLowerCase() ===
//                   String(
//                     reward.product_name ||
//                       ""
//                   ).toLowerCase()
//               );

//             if (!product) {
//               return;
//             }

//             const productId =
//               getProductId(
//                 product
//               );

//             const index =
//               findIndex(
//                 productId,
//                 product.product_name
//               );

//             const newQty =
//               Number(
//                 reward.quantity
//               ) || 0;

//             if (
//               index >= 0
//             ) {
//               const oldQty =
//                 Number(
//                   updated[index]
//                     .quantity
//                 ) || 0;

//               if (
//                 oldQty !==
//                   newQty ||
//                 !updated[index]
//                   .is_scheme_item
//               ) {
//                 updated[index] =
//                   {
//                     ...updated[
//                       index
//                     ],
//                     quantity:
//                       newQty,
//                     is_scheme_item:
//                       true,
//                   };

//                 changed =
//                   true;
//               }
//             } else {
//               updated.push({
//                 product:
//                   productId,

//                 product_name:
//                   product.product_name,

//                 quantity:
//                   newQty,

//                 original_quantity:
//                   "Scheme",

//                 price:
//                   product.price ??
//                   0,

//                 ss_virtual_stock:
//                   product.virtual_stock ??
//                   0,

//                 is_scheme_item:
//                   true,
//               });

//               changed =
//                 true;
//             }
//           }
//         );

//         if (!changed) {
//           return prev;
//         }

//         return updated;
//       }
//     );
//   }, [
//     mergedRewards,
//     allProducts,
//   ]);

//   /* =========================================================
//      REMOVE INVALID SCHEME ITEMS
//   ========================================================= */

//   useEffect(() => {
//     if (
//       !editedItems.length
//     ) {
//       return;
//     }

//     setEditedItems(
//       (prev) => {
//         const filtered =
//           prev.filter(
//             (item) => {
//               if (
//                 !item.is_scheme_item
//               ) {
//                 return true;
//               }

//               return mergedRewards.some(
//                 (reward) =>
//                   String(
//                     reward.product_name ||
//                       ""
//                   ).toLowerCase() ===
//                   String(
//                     item.product_name ||
//                       ""
//                   ).toLowerCase()
//               );
//             }
//           );

//         if (
//           filtered.length ===
//           prev.length
//         ) {
//           return prev;
//         }

//         return filtered;
//       }
//     );
//   }, [
//     mergedRewards,
//   ]);

//   /* =========================================================
//      EDIT QUANTITY
//   ========================================================= */

//   const handleEditQuantity = (
//     productId,
//     value
//   ) => {
//     setEditedItems(
//       (prev) =>
//         prev.map(
//           (item) =>
//             String(
//               item.product
//             ) ===
//             String(
//               productId
//             )
//               ? {
//                   ...item,
//                   quantity:
//                     value === ""
//                       ? ""
//                       : Number(
//                           value
//                         ),
//                 }
//               : item
//         )
//     );
//   };

//   /* =========================================================
//      DELETE ITEM
//   ========================================================= */

//   const handleDeleteItem = (
//     productId
//   ) => {
//     setEditedItems(
//       (prev) =>
//         prev.filter(
//           (item) =>
//             String(
//               item.product
//             ) !==
//             String(
//               productId
//             )
//         )
//     );
//   };

//   /* =========================================================
//      ADD PRODUCT
//   ========================================================= */

//   const handleAddProductBySearch = (
//     product
//   ) => {
//     if (!product) {
//       return;
//     }

//     const productId =
//       getProductId(
//         product
//       );

//     const existing =
//       editedItems.find(
//         (item) =>
//           String(
//             item.product
//           ) ===
//           String(
//             productId
//           )
//       );

//     if (existing) {
//       alert(
//         "Product already added!"
//       );

//       return;
//     }

//     setEditedItems(
//       (prev) => [
//         ...prev,
//         {
//           product:
//             productId,

//           product_name:
//             product.product_name,

//           quantity: 1,

//           original_quantity:
//             "Added",

//           price:
//             product.price ??
//             0,

//           ss_virtual_stock:
//             product.virtual_stock ??
//             0,
//         },
//       ]
//     );

//     setSearchTerm("");
//     setHighlightIndex(-1);
//   };

//   /* =========================================================
//      MANUAL AVAILABILITY
//   ========================================================= */

//   const updateManualAvailability = (
//     productId,
//     value
//   ) => {
//     setManualAvailabilityMap(
//       (prev) => ({
//         ...prev,
//         [productId]:
//           value,
//       })
//     );
//   };

//   /* =========================================================
//      AVAILABILITY
//   ========================================================= */

//   const getItemAvailability = (
//     item
//   ) => {
//     const product =
//       allProducts.find(
//         (p) =>
//           String(
//             getProductId(
//               p
//             )
//           ) ===
//           String(
//             item.product
//           )
//       );

//     const manual =
//       manualAvailabilityMap[
//         item.product
//       ];

//     if (
//       manual !==
//         undefined &&
//       manual !== ""
//     ) {
//       return (
//         manual ===
//         "Available"
//       );
//     }

//     const qty =
//       Number(
//         item.quantity
//       ) || 0;

//     if (
//       selectedCity ===
//       "Mumbai"
//     ) {
//       return (
//         Number(
//           product?.mumbai_stock ??
//             0
//         ) >= qty
//       );
//     }

//     return (
//       Number(
//         item.ss_virtual_stock ??
//           0
//       ) >= qty
//     );
//   };

//   /* =========================================================
//      SAFE NUMBER
//   ========================================================= */

//   const safeNumber = (
//     value
//   ) => {
//     const number =
//       Number(value);

//     return Number.isFinite(
//       number
//     )
//       ? number
//       : 0;
//   };

//   /* =========================================================
//      TOTALS
//   ========================================================= */

//   const totalSSOrderQty =
//     editedItems.reduce(
//       (sum, item) =>
//         sum +
//         safeNumber(
//           item.original_quantity
//         ),
//       0
//     );

//   const totalApprovedQty =
//     editedItems.reduce(
//       (sum, item) =>
//         sum +
//         safeNumber(
//           item.quantity
//         ),
//       0
//     );

//   const totalProducts =
//     editedItems.length;

//   const totalAvailableProducts =
//     editedItems.filter(
//       (item) =>
//         getItemAvailability(
//           item
//         )
//     ).length;

//   const totalUnavailableProducts =
//     Math.max(
//       totalProducts -
//         totalAvailableProducts,
//       0
//     );

//   /* =========================================================
//      TEMPERED CATEGORY TOTALS
//   ========================================================= */

//   const temperedKeywords = [
//     "UV TEMPERED",
//     "TEMPERED MEIBO",
//     "TEMPERED SOLDIER",
//     "NEW SOLDIER TEMPERED",
//     "TEMPERED BODYGUARD",
//     "TEMPERED SUPER X",
//   ];

//   const categoryWiseTotals =
//     {};

//   editedItems.forEach(
//     (item) => {
//       const product =
//         allProducts.find(
//           (p) =>
//             String(
//               getProductId(
//                 p
//               )
//             ) ===
//             String(
//               item.product
//             )
//         );

//       const subCategory =
//         product?.sub_category
//           ?.toUpperCase() ||
//         "";

//       const matchedKeyword =
//         temperedKeywords.find(
//           (keyword) =>
//             subCategory.includes(
//               keyword
//             )
//         );

//       if (
//         !matchedKeyword
//       ) {
//         return;
//       }

//       if (
//         !categoryWiseTotals[
//           matchedKeyword
//         ]
//       ) {
//         categoryWiseTotals[
//           matchedKeyword
//         ] = {
//           ssQty: 0,
//           approvedQty: 0,
//           orderItems: 0,
//           availableItems: 0,
//         };
//       }

//       const category =
//         categoryWiseTotals[
//           matchedKeyword
//         ];

//       category.ssQty +=
//         safeNumber(
//           item.original_quantity
//         );

//       category.approvedQty +=
//         safeNumber(
//           item.quantity
//         );

//       category.orderItems +=
//         1;

//       if (
//         getItemAvailability(
//           item
//         )
//       ) {
//         category.availableItems +=
//           1;
//       }
//     }
//   );

//   /* =========================================================
//      VERIFY / APPROVE
//   ========================================================= */

//   const handleVerify =
//     async () => {
//       if (!order) {
//         return;
//       }

//       setLoadingApprove(
//         true
//       );

//       const payload = {
//         status: "APPROVED",

//         dispatch_location:
//           selectedCity,

//         items:
//           editedItems.map(
//             (item) => ({
//               product:
//                 item.product,

//               quantity:
//                 Number(
//                   item.quantity
//                 ) || 0,
//             })
//           ),
//       };

//       try {
//         await verifyCRMOrder(
//           order.id,
//           payload
//         );

//         queryClient.invalidateQueries(
//           {
//             queryKey: [
//               "crmOrders",
//             ],
//             exact: false,
//           }
//         );

//         alert(
//           "Order approved successfully"
//         );

//         localStorage.removeItem(
//           `crm_order_items_${orderId}`
//         );

//         navigate(
//           "/all/orders-history"
//         );
//       } catch (error) {
//         console.error(
//           "Error verifying order:",
//           error
//         );

//         alert(
//           "Failed to verify order"
//         );
//       } finally {
//         setLoadingApprove(
//           false
//         );
//       }
//     };

//   /* =========================================================
//      LOADING
//   ========================================================= */

//   if (!order) {
//     return (
//       <div className="flex min-h-[300px] items-center justify-center bg-[#f6f8fb]">
//         <div className="flex flex-col items-center gap-2">
//           <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
//             <Loader2
//               className="h-6 w-6 animate-spin text-blue-600"
//             />
//           </div>

//           <span className="text-[10px] font-semibold text-gray-400">
//             Loading order...
//           </span>
//         </div>
//       </div>
//     );
//   }

//   /* =========================================================
//      PAGE
//   ========================================================= */

//   return (
//     <div
//       className="
//         min-h-full
//         bg-[#f6f8fb]
//         pb-[155px]
//         sm:pb-[92px]
//       "
//     >
//       {/* =====================================================
//           MOBILE TOP HEADER
//       ====================================================== */}

//       <div className="sm:hidden">
//         <MobilePageHeader
//           title={
//             order.order_id
//           }
//         />
//       </div>

//       {/* =====================================================
//           DESKTOP ORDER HEADER
//       ====================================================== */}

//       <div className="hidden px-3 pt-3 sm:block lg:px-0">
//         <div
//           className="
//             relative
//             overflow-visible
//             rounded-2xl
//             border
//             border-gray-200/80
//             bg-white
//             shadow-[0_2px_12px_rgba(15,23,42,0.04)]
//             transition-all
//             duration-300
//             hover:shadow-[0_5px_20px_rgba(15,23,42,0.06)]
//           "
//         >
//           <div className="absolute left-0 right-0 top-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

//           <div className="flex min-h-[72px] items-center justify-between gap-4 px-4 py-3">
//             <div className="flex min-w-0 items-center gap-3">
//               <button
//                 type="button"
//                 onClick={() =>
//                   navigate(
//                     "/crm/orders"
//                   )
//                 }
//                 className="
//                   group
//                   flex
//                   h-9
//                   w-9
//                   shrink-0
//                   items-center
//                   justify-center
//                   rounded-xl
//                   border
//                   border-gray-200
//                   bg-gray-50
//                   text-gray-500
//                   transition-all
//                   duration-200
//                   hover:-translate-y-0.5
//                   hover:border-blue-200
//                   hover:bg-blue-50
//                   hover:text-blue-600
//                   active:scale-95
//                 "
//                 title="Back to Orders"
//               >
//                 <ArrowLeft
//                   size={16}
//                   className="transition-transform duration-200 group-hover:-translate-x-0.5"
//                 />
//               </button>

//               <div className="min-w-0">
//                 <div className="flex items-center gap-2">
//                   <h1 className="truncate text-[16px] font-bold tracking-tight text-gray-900">
//                     {order.order_id}
//                   </h1>

//                   <span
//                     className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-bold ${
//                       isTempered
//                         ? "border-violet-100 bg-violet-50 text-violet-600"
//                         : "border-blue-100 bg-blue-50 text-blue-600"
//                     }`}
//                   >
//                     <Sparkles size={9} />

//                     {isTempered
//                       ? "Tempered"
//                       : "General"}
//                   </span>
//                 </div>

//                 <div className="mt-1 flex items-center gap-2">
//                   <div className="flex min-w-0 items-center gap-1.5">
//                     <UserRound
//                       size={10}
//                       className="shrink-0 text-gray-400"
//                     />

//                     <p className="max-w-[400px] truncate text-[9px] font-medium text-gray-600">
//                       {
//                         order.ss_party_name
//                       }
//                     </p>
//                   </div>

//                   <span className="text-gray-300">
//                     •
//                   </span>

//                   <span className="flex items-center gap-1 text-[8px] text-gray-400">
//                     <Boxes size={9} />

//                     {totalProducts} models
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <div className="flex shrink-0 items-center gap-2">
//               <div className="hidden items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/70 px-3 py-2 lg:flex">
//                 <div className="flex items-center gap-1.5">
//                   <ClipboardList
//                     size={11}
//                     className="text-gray-400"
//                   />

//                   <span className="text-[8px] font-semibold text-gray-400">
//                     SS
//                   </span>

//                   <span className="text-[10px] font-bold text-gray-800">
//                     {
//                       totalSSOrderQty
//                     }
//                   </span>
//                 </div>

//                 <div className="h-4 w-px bg-gray-200" />

//                 <div className="flex items-center gap-1.5">
//                   <CheckCircle2
//                     size={11}
//                     className="text-blue-500"
//                   />

//                   <span className="text-[8px] font-semibold text-gray-400">
//                     Approved
//                   </span>

//                   <span className="text-[10px] font-bold text-blue-600">
//                     {
//                       totalApprovedQty
//                     }
//                   </span>
//                 </div>
//               </div>

//               <div className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 md:flex">
//                 <div
//                   className={`flex h-6 w-6 items-center justify-center rounded-lg ${
//                     selectedCity ===
//                     "Mumbai"
//                       ? "bg-violet-50 text-violet-600"
//                       : "bg-blue-50 text-blue-600"
//                   }`}
//                 >
//                   <MapPin size={11} />
//                 </div>

//                 <div>
//                   <p className="text-[7px] font-bold uppercase tracking-wider text-gray-400">
//                     Dispatch
//                   </p>

//                   <p className="text-[9px] font-bold text-gray-800">
//                     {
//                       selectedCity
//                     }
//                   </p>
//                 </div>
//               </div>

//               <div className="relative z-50">
//                 <OrderActionMenu
//                   order={order}
//                   notes={notes}
//                   navigate={
//                     navigate
//                   }
//                   holdCRMOrder={
//                     holdCRMOrder
//                   }
//                   RejectCRMOrder={
//                     RejectCRMOrder
//                   }
//                   manualAvailabilityMap={
//                     manualAvailabilityMap
//                   }
//                   selectedCity={
//                     selectedCity
//                   }
//                   allProducts={
//                     allProducts
//                   }
//                   items={
//                     editedItems
//                   }
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="hidden items-center justify-between border-t border-gray-100 bg-gray-50/60 px-4 py-2 xl:flex">
//             <div className="flex min-w-0 items-center gap-4">
//               <div className="flex items-center gap-1.5 text-[8px] text-gray-500">
//                 <FileText
//                   size={10}
//                   className="text-gray-400"
//                 />

//                 <span>
//                   Order workspace
//                 </span>
//               </div>

//               {notes && (
//                 <>
//                   <span className="text-gray-300">
//                     •
//                   </span>

//                   <div className="flex max-w-[550px] items-center gap-1.5">
//                     <FileText
//                       size={10}
//                       className="shrink-0 text-gray-400"
//                     />

//                     <span className="truncate text-[8px] text-gray-500">
//                       {notes}
//                     </span>
//                   </div>
//                 </>
//               )}
//             </div>

//             <div className="flex items-center gap-1.5 text-[8px] font-medium text-gray-400">
//               <Clock3 size={10} />

//               Review & verify
//               order
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* =====================================================
//           MOBILE ORDER HEADER
//       ====================================================== */}

//       <div className="mx-3 mb-2.5 mt-2 overflow-visible rounded-2xl border border-gray-200/80 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:hidden">
//         <div className="relative">
//           <div className="absolute left-0 right-0 top-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

//           <div className="flex items-center justify-between gap-3 px-3 py-3">
//             <div className="min-w-0">
//               <div className="flex items-center gap-1.5">
//                 <h1 className="truncate text-[13px] font-bold tracking-tight text-gray-900">
//                   {order.order_id}
//                 </h1>

//                 <span
//                   className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[7px] font-bold ${
//                     isTempered
//                       ? "border-violet-100 bg-violet-50 text-violet-600"
//                       : "border-blue-100 bg-blue-50 text-blue-600"
//                   }`}
//                 >
//                   {isTempered
//                     ? "Tempered"
//                     : "General"}
//                 </span>
//               </div>

//               <div className="mt-1 flex items-center gap-1.5">
//                 <UserRound
//                   size={9}
//                   className="shrink-0 text-gray-400"
//                 />

//                 <p className="truncate text-[8px] font-medium text-gray-500">
//                   {
//                     order.ss_party_name
//                   }
//                 </p>
//               </div>
//             </div>

//             <div className="relative z-50 shrink-0">
//               <OrderActionMenu
//                 order={order}
//                 notes={notes}
//                 navigate={
//                   navigate
//                 }
//                 holdCRMOrder={
//                   holdCRMOrder
//                 }
//                 RejectCRMOrder={
//                   RejectCRMOrder
//                 }
//                 manualAvailabilityMap={
//                   manualAvailabilityMap
//                 }
//                 selectedCity={
//                   selectedCity
//                 }
//                 allProducts={
//                   allProducts
//                 }
//                 items={
//                   editedItems
//                 }
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-3 border-t border-gray-100 bg-gray-50/60">
//             <div className="px-2 py-2 text-center">
//               <p className="text-[7px] font-bold uppercase tracking-wide text-gray-400">
//                 SS Qty
//               </p>

//               <p className="mt-0.5 text-[11px] font-bold text-gray-800">
//                 {
//                   totalSSOrderQty
//                 }
//               </p>
//             </div>

//             <div className="border-x border-gray-100 px-2 py-2 text-center">
//               <p className="text-[7px] font-bold uppercase tracking-wide text-blue-400">
//                 Approved
//               </p>

//               <p className="mt-0.5 text-[11px] font-bold text-blue-600">
//                 {
//                   totalApprovedQty
//                 }
//               </p>
//             </div>

//             <div className="px-2 py-2 text-center">
//               <p className="text-[7px] font-bold uppercase tracking-wide text-gray-400">
//                 Dispatch
//               </p>

//               <p
//                 className={`mt-0.5 text-[10px] font-bold ${
//                   selectedCity ===
//                   "Mumbai"
//                     ? "text-violet-600"
//                     : "text-blue-600"
//                 }`}
//               >
//                 {
//                   selectedCity
//                 }
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>


//       {/* =====================================================
//           MOBILE QUICK SUMMARY
//       ====================================================== */}

//       <div className="mb-2.5 grid grid-cols-4 gap-1.5 px-3 sm:hidden">
//         <div className="rounded-xl border border-gray-200 bg-white px-2 py-2 shadow-sm transition-all duration-200 active:scale-[0.98]">
//           <p className="text-[6px] font-bold uppercase tracking-wide text-gray-400">
//             SS
//           </p>

//           <p className="mt-0.5 text-sm font-bold text-gray-900">
//             {
//               totalSSOrderQty
//             }
//           </p>
//         </div>

//         <div className="rounded-xl border border-blue-100 bg-blue-50/40 px-2 py-2 shadow-sm transition-all duration-200 active:scale-[0.98]">
//           <p className="text-[6px] font-bold uppercase tracking-wide text-blue-400">
//             Approved
//           </p>

//           <p className="mt-0.5 text-sm font-bold text-blue-600">
//             {
//               totalApprovedQty
//             }
//           </p>
//         </div>

//         <div className="rounded-xl border border-gray-200 bg-white px-2 py-2 shadow-sm transition-all duration-200 active:scale-[0.98]">
//           <p className="text-[6px] font-bold uppercase tracking-wide text-gray-400">
//             Models
//           </p>

//           <p className="mt-0.5 text-sm font-bold text-gray-900">
//             {
//               totalProducts
//             }
//           </p>
//         </div>

//         <div
//           className={`rounded-xl border px-2 py-2 shadow-sm transition-all duration-200 active:scale-[0.98] ${
//             totalUnavailableProducts >
//             0
//               ? "border-red-100 bg-red-50/40"
//               : "border-emerald-100 bg-emerald-50/40"
//           }`}
//         >
//           <p
//             className={`text-[6px] font-bold uppercase tracking-wide ${
//               totalUnavailableProducts >
//               0
//                 ? "text-red-400"
//                 : "text-emerald-500"
//             }`}
//           >
//             Stock
//           </p>

//           <p
//             className={`mt-0.5 text-sm font-bold ${
//               totalUnavailableProducts >
//               0
//                 ? "text-red-600"
//                 : "text-emerald-600"
//             }`}
//           >
//             {
//               totalAvailableProducts
//             }

//             <span className="ml-0.5 text-[8px] font-medium text-gray-400">
//               /
//               {
//                 totalProducts
//               }
//             </span>
//           </p>
//         </div>
//       </div>

//       {/* =====================================================
//           MAIN WORKSPACE
//       ====================================================== */}

//       <div className="grid grid-cols-1 gap-2.5 px-3 pt-2.5 lg:grid-cols-5 lg:px-0">
//         {/* ===================================================
//             LEFT PANEL
//         ==================================================== */}

//         <div className="min-w-0 space-y-2.5 lg:col-span-1">
//           {/* =================================================
//               TEMPERED SUMMARY

//               IMPORTANT:
//               This will now show for BOTH:
//               order.notes = "Tempered..."
//               order.note  = "Tempered..."
//           ================================================== */}

//           {isTempered && (
//             <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all duration-300 hover:shadow-md">
//               <TemperedSummaryPanel
//                 totalSSOrderQty={
//                   totalSSOrderQty
//                 }
//                 totalApprovedQty={
//                   totalApprovedQty
//                 }
//                 totalProducts={
//                   totalProducts
//                 }
//                 categoryWiseTotals={
//                   categoryWiseTotals
//                 }
//               />
//             </div>
//           )}

//           {/* =================================================
//               SAMPLING SHEET
//           ================================================== */}

//           <div
//             className={`overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all duration-300 hover:shadow-md ${
//               isTempered
//                 ? ""
//                 : "lg:sticky lg:top-3"
//             }`}
//           >
//             <SamplingSheetPanel
//               partyName={
//                 order.ss_party_name
//               }
//             />
//           </div>
//         </div>

//         {/* ===================================================
//             RIGHT ORDER WORKSPACE
//         ==================================================== */}

//         <div className="min-w-0 lg:col-span-4">
//           <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.05)] transition-all duration-300 hover:shadow-[0_5px_22px_rgba(15,23,42,0.06)]">
          
//             {/* ORDER TABLE */}

//             <OrderItemsTable
//               editedItems={
//                 editedItems
//               }
//               allProducts={
//                 allProducts
//               }
//               handleEditQuantity={
//                 handleEditQuantity
//               }
//               setItemToDelete={
//                 setItemToDelete
//               }
//               setShowDeleteModal={
//                 setShowDeleteModal
//               }
//               selectedCity={
//                 selectedCity
//               }
//               manualAvailabilityMap={
//                 manualAvailabilityMap
//               }
//               updateManualAvailability={
//                 updateManualAvailability
//               }
//               searchTerm={
//                 searchTerm
//               }
//               setSearchTerm={
//                 setSearchTerm
//               }
//               highlightIndex={
//                 highlightIndex
//               }
//               setHighlightIndex={
//                 setHighlightIndex
//               }
//               handleAddProductBySearch={
//                 handleAddProductBySearch
//               }
//               getSchemeText={
//                 getSchemeText
//               }
//               setSelectedCity={
//                 setSelectedCity
//               }
//             />
//           </div>
//         </div>
//       </div>

//       {/* =====================================================
//           FIXED SUBMIT BAR

//           MOBILE:
//           bottom-[64px] = BottomNav ke upar

//           DESKTOP:
//           bottom-0
//       ====================================================== */}

//       <div
//         className="
//           fixed
//           bottom-[64px]
//           left-0
//           right-0
//           z-40
//           border-t
//           border-gray-200/80
//           bg-white/95
//           shadow-[0_-6px_24px_rgba(15,23,42,0.10)]
//           backdrop-blur-xl
//           sm:bottom-0
//         "
//       >
//         <div
//           className="
//             mx-auto
//             flex
//             min-h-[60px]
//             max-w-[1600px]
//             items-center
//             justify-between
//             gap-3
//             px-3
//             py-2
//             sm:min-h-[68px]
//             sm:px-5
//             sm:py-2.5
//             lg:px-6
//           "
//         >
//           {/* DESKTOP SUMMARY */}

//           <div className="hidden min-w-0 items-center gap-4 sm:flex">
//             <div className="flex items-center gap-2">
//               <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100">
//                 <ClipboardList
//                   size={12}
//                   className="text-gray-500"
//                 />
//               </div>

//               <div>
//                 <p className="text-[6px] font-bold uppercase tracking-wide text-gray-400">
//                   SS Qty
//                 </p>

//                 <p className="text-[11px] font-bold text-gray-800">
//                   {
//                     totalSSOrderQty
//                   }
//                 </p>
//               </div>
//             </div>

//             <div className="h-6 w-px bg-gray-200" />

//             <div className="flex items-center gap-2">
//               <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
//                 <CheckCircle2
//                   size={12}
//                   className="text-blue-600"
//                 />
//               </div>

//               <div>
//                 <p className="text-[6px] font-bold uppercase tracking-wide text-gray-400">
//                   Approved
//                 </p>

//                 <p className="text-[11px] font-bold text-blue-600">
//                   {
//                     totalApprovedQty
//                   }
//                 </p>
//               </div>
//             </div>

//             <div className="h-6 w-px bg-gray-200" />

//             <div>
//               <p className="text-[6px] font-bold uppercase tracking-wide text-gray-400">
//                 Models
//               </p>

//               <p className="text-[11px] font-bold text-gray-800">
//                 {
//                   totalProducts
//                 }
//               </p>
//             </div>

//             <div className="h-6 w-px bg-gray-200" />

//             <div>
//               <p className="text-[6px] font-bold uppercase tracking-wide text-gray-400">
//                 Stock
//               </p>

//               <p
//                 className={`text-[11px] font-bold ${
//                   totalUnavailableProducts >
//                   0
//                     ? "text-red-600"
//                     : "text-emerald-600"
//                 }`}
//               >
//                 {
//                   totalAvailableProducts
//                 }

//                 <span className="ml-1 font-medium text-gray-400">
//                   /{" "}
//                   {
//                     totalProducts
//                   }
//                 </span>
//               </p>
//             </div>
//           </div>

//           {/* MOBILE SUMMARY */}

//           <div className="min-w-0 flex-1 sm:hidden">
//             <div className="flex items-center gap-1.5">
//               <span className="text-[7px] font-bold uppercase tracking-wide text-gray-400">
//                 Order
//               </span>

//               <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[7px] font-bold text-blue-600">
//                 {
//                   totalApprovedQty
//                 }{" "}
//                 Qty
//               </span>
//             </div>

//             <p className="mt-0.5 truncate text-[7px] text-gray-400">
//               {
//                 totalProducts
//               }{" "}
//               models
//               {" • "}
//               <span
//                 className={
//                   totalUnavailableProducts >
//                   0
//                     ? "font-semibold text-red-500"
//                     : "font-semibold text-emerald-500"
//                 }
//               >
//                 {
//                   totalAvailableProducts
//                 }{" "}
//                 available
//               </span>
//             </p>
//           </div>

//           {/* SUBMIT BUTTON */}

//           <button
//             type="button"
//             onClick={() =>
//               setShowConfirmModal(
//                 true
//               )
//             }
//             disabled={
//               loadingApprove ||
//               editedItems.length ===
//                 0
//             }
//             className={`
//               group
//               flex
//               shrink-0
//               items-center
//               justify-center
//               gap-1.5
//               rounded-xl
//               px-3.5
//               py-2.5
//               text-[10px]
//               font-bold
//               text-white
//               shadow-sm
//               transition-all
//               duration-200
//               sm:min-w-[165px]
//               sm:px-5
//               sm:text-xs
//               ${
//                 loadingApprove ||
//                 editedItems.length ===
//                   0
//                   ? "cursor-not-allowed bg-gray-300 shadow-none"
//                   : "bg-blue-600 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
//               }
//             `}
//           >
//             {loadingApprove ? (
//               <>
//                 <Loader2
//                   size={14}
//                   className="animate-spin"
//                 />

//                 <span className="hidden sm:inline">
//                   Processing...
//                 </span>

//                 <span className="sm:hidden">
//                   Processing
//                 </span>
//               </>
//             ) : (
//               <>
//                 <CheckCircle2
//                   size={14}
//                   className="transition-transform duration-200 group-hover:scale-110"
//                 />

//                 <span className="hidden sm:inline">
//                   Submit Order
//                 </span>

//                 <span className="sm:hidden">
//                   Submit
//                 </span>

//                 <ChevronRight
//                   size={13}
//                   className="transition-transform duration-200 group-hover:translate-x-0.5"
//                 />
//               </>
//             )}
//           </button>
//         </div>
//       </div>

//       {/* =====================================================
//           SUBMIT CONFIRM
//       ====================================================== */}

//       <ConfirmModal
//         isOpen={
//           showConfirmModal
//         }
//         title="Confirm Order Submission"
//         message="Are you sure you want to submit this order?"
//         confirmText="Yes, Submit"
//         confirmColor="bg-green-500 hover:bg-green-600"
//         onCancel={() =>
//           setShowConfirmModal(
//             false
//           )
//         }
//         onConfirm={() => {
//           handleVerify();

//           setShowConfirmModal(
//             false
//           );
//         }}
//       />

//       {/* =====================================================
//           DELETE CONFIRM
//       ====================================================== */}

//       <ConfirmModal
//         isOpen={
//           showDeleteModal
//         }
//         title="Delete Item?"
//         message="Are you sure you want to delete this item?"
//         confirmText="Yes, Delete"
//         confirmColor="bg-red-500 hover:bg-red-600"
//         onCancel={() =>
//           setShowDeleteModal(
//             false
//           )
//         }
//         onConfirm={() => {
//           handleDeleteItem(
//             itemToDelete
//           );

//           setShowDeleteModal(
//             false
//           );

//           setItemToDelete(
//             null
//           );
//         }}
//         icon={Trash2}
//       />
//     </div>
//   );
// }