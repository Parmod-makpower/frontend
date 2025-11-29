// src/pages/CRMVerifiedDetailsPage.jsx
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCachedProducts } from "../../hooks/useCachedProducts";
import { punchOrderToSheet } from "../../api/punchApi";
import API from "../../api/axios";
import MobilePageHeader from "../../components/MobilePageHeader";
import ConfirmModal from "../../components/ConfirmModal";
import PDFDownloadButton from "../../components/pdf/PDFDownloadButton";
import DispatchPDF from "../../components/pdf/DispatchPDF";
import { useCargoDetails } from "../../hooks/useCargoDetails";
// 🧩 Newly modular components
import CRMVerifiedTable from "../../components/verifiedDetailsPage/CRMVerifiedTable";
import AddProductModal from "../../components/verifiedDetailsPage/AddProductModal";
import EditQuantityModal from "../../components/verifiedDetailsPage/EditQuantityModal";
import RemarksSection from "../../components/verifiedDetailsPage/RemarksSection";

export default function CRMVerifiedDetailsPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const order = location.state?.order;
  const { data: cargos, isLoading } = useCargoDetails();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editQty, setEditQty] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [cargoName, setCargoName] = useState("");
  const [cargoMobile, setCargoMobile] = useState("");
  const [cargoLocation, setCargoLocation] = useState("");
  const [cargoParcel, setCargoParcel] = useState("");
  const [dispatchLocation, setDispatchLocation] = useState(order?.dispatch_location || "Delhi");



  const { data: allProducts = [] } = useCachedProducts();

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


  const handleDownloadPDF = () => {
    DispatchPDF(
      order,
      enrichedItems,
      remarks,
      orderCode,
      order.punched ? order.dispatch_location : dispatchLocation   // 🔥 FIX
    );


  };

  const handleOrderPunch = () => {
    if (!order?.items?.length) {
      alert("No items to punch!");
      return;
    }
    setIsModalOpen(true);
  };

  const confirmOrderPunch = async () => {
    if (!order?.items?.length) return;

    setLoading(true);
    setIsModalOpen(false);
    try {
      const data = await punchOrderToSheet(order, dispatchLocation);
      if (data.success) {
        handleDownloadPDF();
        setTimeout(() => navigate("/all/orders-history"), 500);
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
      const res = await API.post(`/crm/verified/${order.id}/add-item/`, {
        product_id: newProduct,
        quantity: newQty,
        price: newPrice || 0,
      });
      alert(res.data.message);
      navigate("/all/orders-history/");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add product.");
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
      navigate("/all/orders-history/");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update quantity.");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await API.delete(`/crm/verified/item/${itemId}/delete/`);
      alert(res.data.message);
      navigate("/all/orders-history/");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete item.");
    }
  };

  const matchedCargo = useMemo(() => {
    if (!cargos || !order?.ss_party_name) return null;

    return cargos.find(
      (c) => c.user_name?.trim().toLowerCase() === order.ss_party_name.trim().toLowerCase()
    );
  }, [cargos, order?.ss_party_name]);

  useMemo(() => {
    if (matchedCargo) {
      setCargoName(matchedCargo.cargo_name || "");
      setCargoMobile(matchedCargo.cargo_mobile_number || "");
      setCargoLocation(matchedCargo.cargo_location || "");
      setCargoParcel(matchedCargo.parcel_size || "");
    }
  }, [matchedCargo]);

  const cargoDetails = {
    cargoName,
    cargoMobile,
    cargoLocation,
    cargoParcel,
  };

 const handleSingleRowPunch = async (item) => {
  try {
    // 🔥 punchOrderToSheet ko ek proper order object dena padega
    const singleOrder = {
      id: order.id,
      order_id: order.order_id,
      ss_party_name: order.ss_party_name,
      crm_name: order.crm_name,
      dispatch_location: order.dispatch_location || dispatchLocation,
      items: [
        {
          product_name: item.product_name,
          quantity: item.quantity,
          id: item.id,
        }
      ]
    };

    const res = await punchOrderToSheet(singleOrder, dispatchLocation);

    if (res.success) {
      alert("Row punched successfully!");
    } else {
      alert("Error punching row: " + res.error);
    }

  } catch (err) {
    console.log(err);
    alert("Something went wrong while punching this row.");
  }
};


  if (!order)
    return <div className="p-6 text-red-600">No order data provided.</div>;

  return (
    <div className="p-4 sm:p-0 space-y-4 pb-30">
      <ConfirmModal
        isOpen={isModalOpen}
        title="Confirm Order Punch"
        message="Are you sure you want to punch this order?"
        confirmText="Confirm"
        cancelText="Cancel"
        confirmColor="bg-blue-600 hover:bg-blue-700"
        loading={loading}
        onCancel={() => setIsModalOpen(false)}
        onConfirm={confirmOrderPunch}
      />

      <MobilePageHeader title={orderCode} />

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-300 p-2 border mt-[60px] sm:mt-0">

        <div className="hidden sm:block font-semibold rounded bg-white px-4 p-1">
          {orderCode}
        </div>

        {/* <input
    className="font-semibold border rounded bg-gray-200 px-4 p-2"
    type="text"
    placeholder="Cargo Name"
    value={cargoName}
    onChange={(e) => setCargoName(e.target.value)}
  />

  <input
    className="font-semibold border rounded bg-gray-200 px-4 p-2"
    type="text"
    placeholder="Mobile"
    value={cargoMobile}
    onChange={(e) => setCargoMobile(e.target.value)}
  />

  <input
    className="font-semibold border rounded bg-gray-200 px-4 p-2"
    type="text"
    placeholder="Location"
    value={cargoLocation}
    onChange={(e) => setCargoLocation(e.target.value)}
  />

  <input
    className="font-semibold border rounded bg-gray-200 px-4 p-2"
    type="text"
    placeholder="Parcel Size"
    value={cargoParcel}
    onChange={(e) => setCargoParcel(e.target.value)}
  /> */}


        <div className="relative">
          <select
            value={order.punched ? order.dispatch_location : dispatchLocation}
            onChange={(e) => setDispatchLocation(e.target.value)}
            disabled={order.punched}   // 🔥 यही main point है
            className={`border rounded me-3 px-3 py-1 bg-white shadow-sm cursor-pointer ${order.punched ? "bg-gray-100 cursor-not-allowed" : "bg-white"
              }`}
          >
            <option value="Delhi">Delhi</option>
            <option value="Mumbai">Mumbai</option>
          </select>
          {order.punched && (
            <button
              onClick={() => {
                setMenuOpen(false);
                handleDownloadPDF();
              }}
              className="px-2 p-1 rounded bg-orange-600 text-white hover:bg-blue-700 cursor-pointer" > 🚚 Dispatch PDF
            </button>
          )}
           <PDFDownloadButton
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
      </div>


      {/* ✅ Verified Table */}
      <CRMVerifiedTable
        items={enrichedItems}
        order={order}
        user={user}
        setEditingItem={setEditingItem}
        setEditQty={setEditQty}
        setShowEditModal={setShowEditModal}
        handleDeleteItem={handleDeleteItem}
        handleSingleRowPunch={handleSingleRowPunch} 
      />

      {/* ✅ Add Product Button */}
      {(!order.punched || user?.role === "ADMIN") && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-1 rounded shadow hover:bg-green-700"
          >
            Add Product
          </button>
        </div>
      )}

      {/* ✅ Modals */}
      <AddProductModal
        show={showAddModal}
        setShow={setShowAddModal}
        allProducts={allProducts}
        order={order}
        handleAddProduct={handleAddProduct}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        newQty={newQty}
        setNewQty={setNewQty}
        newPrice={newPrice}
        setNewPrice={setNewPrice}
      />

      <EditQuantityModal
        show={showEditModal}
        setShow={setShowEditModal}
        editingItem={editingItem}
        editQty={editQty}
        setEditQty={setEditQty}
        handleEditQuantity={handleEditQuantity}
      />

      {/* ✅ Remarks */}
      <RemarksSection remarks={remarks} setRemarks={setRemarks} />

      {/* ✅ Punch Button */}
      <button
        onClick={handleOrderPunch}
        disabled={order.punched || loading}
        className={`px-6 py-2 rounded-lg shadow transition ${order.punched || loading
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
  );
}
