import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { verifyCRMOrder, deleteCRMOrder } from "../../hooks/useCRMOrders";
import { useCachedProducts } from "../../hooks/useCachedProducts";
import { Loader2, Trash2 } from "lucide-react";
import { FaGift, FaTrashAlt } from "react-icons/fa";
import ConfirmModal from "../../components/ConfirmModal";
import PDFDownloadButton from "../../components/PDFDownloadButton";
import { useSchemes } from "../../hooks/useSchemes";
import ReminderTable from "../../components/orderSheet/ReminderTable";
import OrderItemsTable from "../../components/orderSheet/OrderItemsTable";
import MobilePageHeader from "../../components/MobilePageHeader";
import { FaEllipsisV } from "react-icons/fa";

export default function CRMOrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const passedOrder = location.state?.order;
  const [order, setOrder] = useState(passedOrder || null);
  const [notes, setNotes] = useState(passedOrder?.notes || "");
  const [loadingApprove, setLoadingApprove] = useState(false);

  // ✅ Edited items (restore from localStorage or backend)
  const [editedItems, setEditedItems] = useState([]);
  const { data: schemes = [] } = useSchemes();

  const hasScheme = (productId) =>
    schemes.some(
      (scheme) =>
        Array.isArray(scheme.conditions) &&
        scheme.conditions.some((cond) => cond.product === productId)
    );
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


  const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleDeleteOrder = async () => {
    if (!order) return;
    setLoadingDelete(true);
    try {
      await deleteCRMOrder(order.id);
      alert("✅ Order deleted and stock restored!");
      navigate("/crm/orders"); // back to list
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("Failed to delete order");
    } finally {
      setLoadingDelete(false);
      setShowDeleteOrderModal(false);
    }
  };


  if (!order)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );

  return (
    <div className="p-4 mx-auto sm:border rounded pb-20">
      {/* Header */}
      <MobilePageHeader title={order.order_id} />
      <div className="mb-6 border-b pb-4 flex flex-col flex-row items-center justify-between pt-[65px] sm:pt-0">
        {/* Left Section — Order Info */}
        <div>
          <h2 className="text-base font-semibold text-gray-800 hidden sm:flex">{order.order_id}</h2>
          <p className="text-sm text-gray-600">{order.ss_party_name}</p>
        </div>

        {/* Right Section — PDF Button */}
        <div className="relative">
          {/* 3-dot button */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-2 rounded hover:bg-gray-200 cursor-pointer"
          >
            <FaEllipsisV size={18} />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg  border z-50">

              {/* ✅ PDF Download */}
              <ul>
                <li className="p-2"><button
                  onClick={() => {
                    setMenuOpen(false);
                  }}
                >
                  <PDFDownloadButton
                    order={order}
                    items={editedItems.map((item) => {
                      const productData = allProducts.find(
                        (p) => p.product_id === item.product
                      );
                      return {
                        ...item,
                        virtual_stock: productData?.virtual_stock ?? 0,
                        price: productData?.price ?? item.price ?? 0,
                      };
                    })}
                  />
                </button></li>
                <li className="border-t p-2"> <button
                  onClick={() => {
                    setMenuOpen(false);
                    setShowDeleteOrderModal(true);
                  }}
                  className="flex gap-2 justify-center items-center cursor-pointer"
                ><FaTrashAlt size={15} className="text-red-500" />
                  Delete Order
                </button></li>
              </ul>
            </div>
          )}
        </div>

      </div>


      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="md:col-span-1">
          <ReminderTable recentRejectedItems={order.recent_rejected_items} />
        </div>

        <div className="md:col-span-3 overflow-x-auto rounded p-3">
          <OrderItemsTable
            editedItems={editedItems}
            allProducts={allProducts}
            handleEditQuantity={handleEditQuantity}
            setItemToDelete={setItemToDelete}
            setShowDeleteModal={setShowDeleteModal}
          />


        </div>
        <div></div>
        <div className="">

          {/* Label */}
          <label className="block text-sm font-medium mb-2">
            Add Product
          </label>

          {/* Search Input */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setHighlightIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search product and press Enter..."
            className="border rounded px-3 py-2 w-full mb-2"
          />

          {/* Dropdown List */}
          {searchTerm && (
            <div className="max-h-60 overflow-y-auto border rounded shadow bg-white w-full">

              {filteredProducts.length > 0 ? (
                filteredProducts.map((prod, index) => {
                  const schemeText = getSchemeText(prod.product_id);

                  return (
                    <div
                      key={prod.product_id}
                      className={`px-3 py-2 cursor-pointer ${highlightIndex === index ? "bg-blue-100" : "hover:bg-gray-100"
                        }`}
                      onClick={() => handleAddProductBySearch(prod)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{prod.product_name}</span>

                        {schemeText && (
                          <FaGift className="text-pink-500 text-sm animate-pulse ml-2" />
                        )}
                      </div>

                      {/* Scheme reward text */}
                      {schemeText && (
                        <p className="text-[11px] text-pink-600 mt-1 font-semibold">
                          {schemeText}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="px-3 py-2 text-gray-500 text-sm">No products found</p>
              )}

            </div>
          )}

          {/* Submit Button */}


        </div>

      </div>
      <div className="flex justify-end">
        <button
          onClick={() => setShowConfirmModal(true)}
          disabled={loadingApprove}
          className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-white shadow-md w-full sm:w-auto ${loadingApprove
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-green-600"
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

      {/* 🗑️ Delete Order Modal */}
      <ConfirmModal
        isOpen={showDeleteOrderModal}
        title="Delete Order?"
        message="Are you sure you want to delete this order?"
        confirmText="Yes, Delete"
        confirmColor="bg-red-500 hover:bg-red-600"
        loading={loadingDelete}
        onCancel={() => setShowDeleteOrderModal(false)}
        onConfirm={handleDeleteOrder}
        icon={Trash2}
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
