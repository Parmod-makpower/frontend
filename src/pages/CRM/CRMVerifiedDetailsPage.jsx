// src/pages/CRMVerifiedDetailsPage.jsx
import { useParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCachedProducts } from "../../hooks/useCachedProducts";
import { punchOrderToSheet } from "../../api/punchApi";
import API from "../../api/axios";
import MobilePageHeader from "../../components/MobilePageHeader";
import ConfirmModal from "../../components/ConfirmModal";
import SS_pdf_before_punch from "../../components/pdf/SS_pdf_before_punch";
import DispatchPDF from "../../components/pdf/DispatchPDF";
import CRMVerifiedTable from "../../components/verifiedDetailsPage/CRMVerifiedTable";
import AddProductModal from "../../components/verifiedDetailsPage/AddProductModal";
import EditQuantityModal from "../../components/verifiedDetailsPage/EditQuantityModal";
import PDFModal from "../../components/pdf/PDFModal";
import FullPageLoader from "../../components/FullPageLoader";
import { useVerifiedOrderDetail } from "../../hooks/useVerifiedOrderDetail";
import CustomLoader from "../../components/CustomLoader";
import { useCargoDetails } from "../../hooks/CRM/useCargoDetails";
import { useGSTDetails } from "../../hooks/CRM/useGSTDetails";

export default function CRMVerifiedDetailsPage() {
  const { user } = useAuth();
  const { id } = useParams(); // ✅ URL se id
  const { order, isLoading, error, refetch } = useVerifiedOrderDetail(id);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editQty, setEditQty] = useState("");
  const [newProduct, setNewProduct] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [dispatchLocation, setDispatchLocation] = useState("");
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdfFilter, setSelectedPdfFilter] = useState("");
  const [pendingAutoPunch, setPendingAutoPunch] = useState(false);
  const [previousItemIds, setPreviousItemIds] = useState([]);

  const [cargoDetails, setCargoDetails] = useState({
    cargoName: "",
    cargoParcel: "",
    cargoMobile: "",
    cargoLocation: "",
  });


  const { data: allProducts = [] } = useCachedProducts();
  const { data: cargoList = [] } = useCargoDetails();
  const { data: gstList = [] } = useGSTDetails();

  useEffect(() => {
    if (!cargoList.length || !order?.ss_party_name) return;

    const matchedCargo = cargoList.find(
      (c) =>
        c.party_name?.toLowerCase().trim() ===
        order.ss_party_name?.toLowerCase().trim()
    );

    if (matchedCargo) {
      setCargoDetails({
        cargoName: matchedCargo.cargo_name || "",
        cargoParcel: matchedCargo.parcel_size || "",
        cargoMobile: matchedCargo.mobile_number || "",
        cargoLocation: matchedCargo.cargo_location || "",
      });
    }
  }, [cargoList, order]);


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
    : `${order?.crm_name} ${order?.id}`;

  const enrichedItems = useMemo(() => {
    if (!order?.items) return [];

    const merged = order.items.map((item) => {
      const found = allProducts.find((p) => p.product_id === item.product);
      return {
        ...item,
        virtual_stock: found?.virtual_stock ?? null,
        cartoon_size: found?.cartoon_size ?? "-",
        price: found?.price ?? "-",
        sub_category: found?.sub_category ?? "-",
        rack_no: found?.rack_no ?? "-",
        product_name: found?.product_name ?? "-", // ✅ ensure available
        mumbai_stock: found?.mumbai_stock ?? null,
      };
    });

    // ✅ Category + Product sorting
    return merged.sort((a, b) => {
      const catA = a.sub_category || "";
      const catB = b.sub_category || "";

      const categoryCompare = catA.localeCompare(catB);
      if (categoryCompare !== 0) return categoryCompare;

      // ✅ Product name alphabetical sorting only
      const prodA = a.product_name || "";
      const prodB = b.product_name || "";
      return prodA.localeCompare(prodB);
    });

  }, [order?.items, allProducts]);

  const estimatedTotal = useMemo(() => {
    const location =
      order?.dispatch_location ||
      dispatchLocation ||
      "Delhi";

    return enrichedItems.reduce((sum, item) => {
      const orderedQty = Number(item.quantity || 0);

      // ✅ safe price conversion
      const price = parseFloat(item.price);

      // ✅ skip item if price missing / invalid
      if (isNaN(price) || price <= 0) return sum;

      // ✅ location based stock
      const availableStock =
        location === "Mumbai"
          ? Number(item.mumbai_stock || 0)
          : Number(item.virtual_stock || 0);

      // ✅ skip out of stock
      if (availableStock <= 0) return sum;

      // ✅ only available stock qty bill
      const billableQty = Math.min(orderedQty, availableStock);

      return sum + billableQty * price;
    }, 0);
  }, [enrichedItems, order?.dispatch_location, dispatchLocation]);
  const currentGST = useMemo(() => {
    if (!gstList.length || !order?.ss_party_name) return 0;

    const matchedGST = gstList.find(
      (g) =>
        g.party_name?.toLowerCase().trim() ===
        order.ss_party_name?.toLowerCase().trim()
    );

    return Number(matchedGST?.percentage || 0);
  }, [gstList, order]);

  const gstAmount = useMemo(() => {
    return (estimatedTotal * currentGST) / 100;
  }, [estimatedTotal, currentGST]);

  const handleOrderPunch = () => {
    if (!order?.items?.length) {
      alert("No items to punch!");
      return;
    }

    setDispatchLocation(""); // ✅ RESET EVERY TIME
    setIsModalOpen(true);
  };

  const confirmOrderPunch = async () => {
    if (!order?.items?.length) return;

    setLoading(true);
    setIsModalOpen(false);
    try {
      const data = await punchOrderToSheet(order, dispatchLocation);
      if (data.success) {
        refetch();
        setSelectedPdfFilter("");

        setPdfModalOpen(true);
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Something went wrong while punching order");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct || !newQty) {
      alert("Please select a product and enter quantity.");
      return;
    }

    try {
      setLoading(true);

      // ✅ store existing ids before adding
      const existingIds = order?.items?.map((item) => item.id) || [];
      setPreviousItemIds(existingIds);

      await API.post(`/crm/verified/${order.id}/add-item/`, {
        product_id: newProduct,
        quantity: newQty,
      });

      if (order.punched) {
        setPendingAutoPunch(true);
      }

      await refetch();

      setNewProduct("");
      setNewQty("");
      setNewPrice("");

    } catch (err) {
      alert(err.response?.data?.error || "Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuantity = async (itemId, newQty) => {
    if (!newQty || isNaN(newQty)) {
      alert("Invalid quantity!");
      return;
    }
    try {
      const res = await API.post(`/crm/verified/item/${itemId}/update/`, {
        quantity: newQty,
      });
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update quantity.");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await API.delete(`/crm/verified/item/${itemId}/delete/`);
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete item.");
    }
  };

  const handleConfirmPDF = () => {
    setPdfModalOpen(false);

    let filteredItems = enrichedItems;

    if (selectedPdfFilter === "ACCESSORIES") {
      filteredItems = enrichedItems.filter(
        item =>
          !(item.sub_category?.toLowerCase().includes("battery") ||
            item.product_name?.toLowerCase().includes("battery"))
      );
    }

    if (selectedPdfFilter === "BATTERY") {
      filteredItems = enrichedItems.filter(
        item =>
          item.sub_category?.toLowerCase().includes("battery") ||
          item.product_name?.toLowerCase().includes("battery")
      );
    }

    DispatchPDF(
      order,
      filteredItems,
      orderCode,
      order.dispatch_location,
      cargoDetails,  // ✅ MOST IMPORTANT
      gstAmount,
      currentGST
    );

  };

  useEffect(() => {
    if (!pendingAutoPunch || !order?.punched) return;
    if (!enrichedItems?.length) return;

    // ✅ find newly added item by new ID
    const newlyAddedItem = enrichedItems.find(
      (item) => !previousItemIds.includes(item.id)
    );

    if (newlyAddedItem) {
      handleSingleRowPunch(newlyAddedItem);
      setPendingAutoPunch(false);
    }
  }, [pendingAutoPunch, enrichedItems, previousItemIds]);


  const handleSingleRowPunch = async (item) => {
    try {
      setLoading(true);

      // ✅ use saved order location first
      const rowLocation =
        order.dispatch_location || dispatchLocation || "Delhi";

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

      const res = await punchOrderToSheet(singleOrder, rowLocation);

      if (res.success) {
        alert("Row punched successfully!");
      } else {
        alert("Error punching row: " + res.error);
      }
    } catch (err) {
      alert("Something went wrong while punching this row.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <CustomLoader fullScreen text="Loading order details..." />;
  if (error) return <div className="p-6 text-red-600">Error loading order</div>;
  if (!order) return <div className="p-6 text-red-600">No order found</div>;

  if (!order)
    return <div className="p-6 text-red-600">No order data provided.</div>;

  return (
    <>
      {loading && <FullPageLoader text="Processing..." />}

      <div className="p-4 sm:p-0 space-y-4 pb-30">
        <ConfirmModal
          isOpen={isModalOpen}
          title="Select Dispatch Location"
          message="Please select dispatch location before punching"
          confirmText="Confirm"
          cancelText="Cancel"
          confirmColor="bg-blue-600 hover:bg-blue-700"
          loading={loading}
          onCancel={() => setIsModalOpen(false)}
          onConfirm={confirmOrderPunch}
          disableConfirm={!dispatchLocation} // ✅ DISABLE UNTIL SELECTED
        >
          {/* ✅ CUSTOM UI */}
          <div className="flex gap-3 mb-4">

            <button
              onClick={() => setDispatchLocation("Delhi")}
              className={`flex-1 py-2 rounded border ${dispatchLocation === "Delhi"
                ? "bg-blue-600 text-white"
                : "bg-white"
                }`}
            >
              Delhi
            </button>

            <button
              onClick={() => setDispatchLocation("Mumbai")}
              className={`flex-1 py-2 rounded border ${dispatchLocation === "Mumbai"
                ? "bg-blue-600 text-white"
                : "bg-white"
                }`}
            >
              Mumbai
            </button>

          </div>
        </ConfirmModal>


        <PDFModal
          isOpen={pdfModalOpen}
          onClose={() => setPdfModalOpen(false)}
          onConfirm={handleConfirmPDF}
          selectedFilter={selectedPdfFilter}
          setSelectedFilter={setSelectedPdfFilter}
          cargoDetails={cargoDetails}              // ✅ NEW
          setCargoDetails={setCargoDetails}        // ✅ NEW
          estimatedTotal={estimatedTotal}
          gstPercentage={currentGST}
          gstAmount={gstAmount}
        />

        <MobilePageHeader title={orderCode} />

        <div className="grid grid-cols-12 gap-4">
          {/* ✅ TABLE */}
          <div className="col-span-12 md:col-span-10">
            <CRMVerifiedTable
              items={enrichedItems}
              order={order}
              user={user}
              setEditingItem={setEditingItem}
              setEditQty={setEditQty}
              setShowEditModal={setShowEditModal}
              handleDeleteItem={handleDeleteItem}
              handleSingleRowPunch={handleSingleRowPunch}
              estimatedTotal={estimatedTotal}
            />

            <div className="text-end">
              <button
                onClick={handleOrderPunch}
                disabled={order.punched || loading}
                className={`px-6 py-1 mt-1 rounded shadow transition ${order.punched || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                  }`}
              >
                {loading
                  ? "Processing..."
                  : order.punched
                    ? "Already Punched"
                    : "Order Punch"}
              </button>
            </div>
          </div>

          {/* ✅ RIGHT SIDE ADD PRODUCT PANEL */}

          <div className="hidden md:block col-span-2">
            <div className="bg-white rounde border p-3 space-y-4">

              {/* 🔷 ORDER HEADER */}
              <div className="text-center border-b pb-2">
                <div className="text-xs text-gray-500">Order Code</div>
                <div className="font-semibold text-sm text-gray-800"> {orderCode} </div>
                <div className="text-xs text-gray-500">Wharehouse : {order.dispatch_location}</div>
              </div>

              {/* ➕ ADD PRODUCT */}

              <div className="bg-gray-100  p-1 border">
                <AddProductModal
                  allProducts={allProducts}
                  handleAddProduct={handleAddProduct}
                  newProduct={newProduct}
                  setNewProduct={setNewProduct}
                  newQty={newQty}
                  setNewQty={setNewQty}
                  newPrice={newPrice}
                  setNewPrice={setNewPrice}
                />
              </div>


              {/* 📄 PDF SECTION */}
              <div className="space-y-2">

                <div className="text-xs font-semibold text-gray-600">
                  Document
                </div>

                {/* 🚚 Dispatch PDF */}
                {order.punched && (
                  <button
                    onClick={() => {
                      setSelectedPdfFilter("");
                      setPdfModalOpen(true);
                    }}
                    className="w-full py-1 rounded bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition"
                  >
                    Dispatch PDF
                  </button>
                )}

                {/* 📦 Before Punch PDF */}
                {!order.punched && (
                  <div className="w-full">
                    <SS_pdf_before_punch
                      id="verified-order-pdf-btn"
                      order={order}
                      items={enrichedItems.map((item) => ({
                        ...item,
                        virtual_stock:
                          allProducts.find((p) => p.product_id === item.product)
                            ?.virtual_stock ?? 0,
                        price:
                          allProducts.find((p) => p.product_id === item.product)
                            ?.price ?? item.price ?? 0,
                      }))}
                    />
                  </div>
                )}

              </div>

            </div>
          </div>
        </div>

        <EditQuantityModal
          show={showEditModal}
          setShow={setShowEditModal}
          editingItem={editingItem}
          editQty={editQty}
          setEditQty={setEditQty}
          handleEditQuantity={handleEditQuantity}
        />

      </div>
    </>
  );
}
