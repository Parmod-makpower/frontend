import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { verifyCRMOrder, deleteCRMOrder } from "../../hooks/useCRMOrders";
import { useCachedProducts } from "../../hooks/useCachedProducts";
import { Loader2, Trash2 } from "lucide-react";
import { FaGift } from "react-icons/fa";
import ConfirmModal from "../../components/ConfirmModal";
import PDFDownloadButton from "../../components/PDFDownloadButton";


export default function CRMOrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const passedOrder = location.state?.order;
  const [order, setOrder] = useState(passedOrder || null);
  const [notes, setNotes] = useState(passedOrder?.notes || "");
  const [loadingApprove, setLoadingApprove] = useState(false);

  // ✅ Edited items (restore from localStorage or backend)
  const [editedItems, setEditedItems] = useState([]);

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
      <div className="mb-6 border-b pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left Section — Order Info */}
        <div>
          <h2 className="text-base font-semibold text-gray-800">{order.order_id}</h2>
          <p className="text-sm text-gray-600">{order.ss_party_name}</p>
        </div>

        {/* Right Section — PDF Button */}
        <div>
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

        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Reminder Table */}
        <div className="md:col-span-1 bg-yellow-50 rounded p-3 overflow-x-auto">
          <h3 className="font-semibold text-yellow-800 mb-2">
            ⚠️ Previous Reminders
          </h3>
          {order?.recent_rejected_items?.length > 0 ? (
            <table className="w-full border border-yellow-200 text-sm">
              <thead className="bg-yellow-100 text-yellow-800">
                <tr>
                  <th className="px-2 py-2 border">Product</th>
                  <th className="px-2 py-2 border">Qty</th>
                  <th className="px-2 py-2 border">Last Rejected</th>
                </tr>
              </thead>
              <tbody>
                {order.recent_rejected_items.map((r) => (
                  <tr key={r.product} className="hover:bg-yellow-50">
                    <td className="px-2 py-1 border">{r.product_name}</td>
                    <td className="px-2 py-1 border text-center">{r.quantity}</td>
                    <td className="px-2 py-1 border text-xs text-gray-600">
                      {new Date(r.last_rejected_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-gray-500 italic text-sm">
              No previous rejections
            </div>
          )}
        </div>

        {/* Main Table */}
        <div className="md:col-span-3 overflow-x-auto shadow rounded p-3">
          <table className="w-full border text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase">
              <tr>
                <th className="px-4 py-3 border">Product</th>
                <th className="px-4 py-3 text-center border">SS Order</th>
                <th className="px-4 py-3 text-center border">Approved</th>
                <th className="px-4 py-3 text-center border">ss-Stock</th>
                <th className="px-4 py-3 text-center border">Stock</th>
                <th className="px-4 py-3 text-center border">Carton</th>
                <th className="px-4 py-3 text-center border">Price</th>
                <th className="px-4 py-3 text-center border">Total</th>
                <th className="px-4 py-3 text-center border">Actions</th>
              </tr>
            </thead>

            <tbody>
              {editedItems.map((item) => {
                const productData = allProducts.find(
                  (p) => p.product_id === item.product
                );
                return (
                  <tr key={item.product} className="hover:bg-gray-50 bg-white">
                    <td className="px-4 py-2 border gap-2">
                      {item.product_name}
                      {item.is_scheme_item && (
                        <FaGift className="text-orange-500" />
                      )}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {item.original_quantity}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.quantity === "" ? "" : item.quantity}
                        onChange={(e) =>
                          handleEditQuantity(item.product, e.target.value)
                        }
                        className="border rounded-lg p-1 w-20 text-center"
                      />
                    </td>
                    <td className="px-4 py-2 border text-center bg-red-300">
                      {item.ss_virtual_stock}
                    </td>
                    <td className="px-4 py-2 border text-center bg-red-300">
                      {productData?.virtual_stock ?? "-"}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {productData?.cartoon_size ?? "-"}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {productData.price ? `₹${productData.price}` : ""}
                    </td>
                    <td className="px-4 py-2 border text-center bg-blue-100">
                      ₹
                      {(item.ss_virtual_stock > 0 || (item.ss_virtual_stock <= 0 && (productData?.virtual_stock ?? 0) > 0))
                        ? (
                          (Number(item.quantity) || 0) *
                          (Number(productData?.price) || 0)
                        ).toFixed(1)
                        : 0}
                    </td>


                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => {
                          setItemToDelete(item.product);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-800 cursor-pointer px-3 p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {/* Grand Total */}
              <tr className="bg-gray-100 font-bold text-gray-800">
                <td colSpan="7" className="px-4 py-2 text-right border">
                  Estimate Total:
                </td>
                <td colSpan="2" className="px-4 py-2 border">
                  ₹

                  {editedItems
                    .reduce((sum, item) => {
                      const productData = allProducts.find(
                        (p) => p.product_id === item.product
                      );
                      const rawPrice = productData?.price;

                      // 🧠 अगर SS stock 0 है तो इस item को skip करो
                      const virtualStock = productData?.virtual_stock ?? 0;

                      // अगर दोनों stock 0 या negative हैं तभी skip करो
                      if (
                        (item.ss_virtual_stock <= 0 && virtualStock <= 0) ||
                        rawPrice === null ||
                        rawPrice === undefined ||
                        rawPrice === "" ||
                        isNaN(Number(rawPrice))
                      ) {
                        return sum;
                      }


                      const price = Number(rawPrice);
                      const qty = Number(item.quantity) || 0;
                      return sum + price * qty;
                    }, 0)
                    .toFixed(1)}

                </td>

              </tr>
            </tbody>
          </table>

          {/* 🔍 Add Product */}
          <div className="mt-6 border-t pt-4">
            <label className="block text-sm font-medium mb-2">
              Add Product
            </label>
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

            {searchTerm && (
              <div className="max-h-60 overflow-y-auto border rounded shadow bg-white">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((prod, index) => (
                    <div
                      key={prod.product_id}
                      className={`px-3 py-2 cursor-pointer ${highlightIndex === index
                        ? "bg-blue-100"
                        : "hover:bg-gray-100"
                        }`}
                      onClick={() => handleAddProductBySearch(prod)}
                    >
                      {prod.product_name}
                    </div>
                  ))
                ) : (
                  <p className="px-3 py-2 text-gray-500">No products found</p>
                )}
              </div>
            )}
          </div>

          {/* ✅ Submit */}
          <div className="mt-6 p-4 flex justify-end gap-6">

            {/* <button
              onClick={() => setShowDeleteOrderModal(true)}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md cursor-pointer"
            >Delete Order
            </button> */}

            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={loadingApprove}
              className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-white shadow-md ${loadingApprove
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-green-600"
                } cursor-pointer`}
            >
              {loadingApprove && <Loader2 className="animate-spin w-4 h-4" />}
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

      {/* 🗑️ Delete Order Modal */}
      <ConfirmModal
        isOpen={showDeleteOrderModal}
        title="Delete Order?"
        message="Are you sure you want to delete this entire order?"
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
