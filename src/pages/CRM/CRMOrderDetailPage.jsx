import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { verifyCRMOrder, holdCRMOrder, RejectCRMOrder } from "../../hooks/useCRMOrders";
import { all_active_inactive_product } from "../../hooks/all_active_inactive_product";
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
  const { data: allProducts = [] } = all_active_inactive_product();

  // ✅ Product search
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);

  useEffect(() => {
    if (!passedOrder) navigate("/crm/orders");
  }, [passedOrder, navigate]);

  const filteredProducts = allProducts.filter((p) =>
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // ✅ Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % filteredProducts.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev === -1
          ? filteredProducts.length - 1
          : (prev - 1 + filteredProducts.length) % filteredProducts.length
      );
    } else if (e.key === "Enter") {
      if (highlightIndex >= 0 && filteredProducts[highlightIndex]) {
        e.preventDefault();
        handleAddProductBySearch(filteredProducts[highlightIndex]);
      }
    }
  };

  // ✅ Approve order
  const handleVerify = async () => {
    if (!order) return;
    setLoadingApprove(true);

    const payload = {
      status: "APPROVED",
      notes,
      dispatch_location: selectedCity,
      total_amount: editedItems.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        return sum + qty * price;
      }, 0),
      items: editedItems.map((item) => ({
        product: item.product,
        quantity: Number(item.quantity) || 0,
        price: Number(item.price) || 0,
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
    <div className="p-4 sm:border rounded pb-20 sm:pb-7 bg-green-100 sm:sticky sm:top-[50px]">
      {/* Header */}
      <MobilePageHeader title={order.order_id} />
      <div className="pb-4 flex flex-col flex-row items-center justify-between pt-[65px] sm:pt-0 ">
        {/* Left Section — Order Info */}
        <div>
          <h2 className="text-base font-semibold text-gray-800 hidden sm:flex">{order.order_id}</h2>
          <p className="text-sm text-blue-600">{order.ss_party_name}</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="border p-1 px-2 rounded"
          >
            <option value="Delhi">Delhi</option>
            <option value="Mumbai">Mumbai</option>
          </select>

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
            filteredProducts={filteredProducts}
            highlightIndex={highlightIndex}
            setHighlightIndex={setHighlightIndex}
            handleAddProductBySearch={handleAddProductBySearch}
            handleKeyDown={handleKeyDown}
            getSchemeText={getSchemeText}
          />
        </div>
      </div>
      <div className="flex justify-end mt-5">
        <button
          onClick={() => setShowConfirmModal(true)}
          disabled={loadingApprove}
          className={`flex items-center justify-center gap-2 px-6 py-2 rounded text-white shadow-md w-full sm:w-auto ${loadingApprove
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-green-600"
            } cursor-pointer`}
        >
          {loadingApprove && <Loader2 className="animate-spin w-4 h-4" />}
          Submit
        </button>
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
