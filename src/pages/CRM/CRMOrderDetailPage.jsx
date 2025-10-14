import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { verifyCRMOrder } from "../../hooks/useCRMOrders";
import { useCachedProducts } from "../../hooks/useCachedProducts";
import ProductSearchSelect from "../../components/ProductSearchSelect";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { FaGift, FaBan } from "react-icons/fa";
import { FaIndianRupeeSign } from "react-icons/fa6";

export default function CRMOrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const passedOrder = location.state?.order;
  const [order, setOrder] = useState(passedOrder || null);

  const [editedItems, setEditedItems] = useState(
    (passedOrder?.items || []).map((item) => ({
      ...item,
      original_quantity: item.quantity,
    }))
  );
  const [notes, setNotes] = useState(passedOrder?.notes || "");

  // ✅ products with virtual stock merged
  const { data: allProducts = [] } = useCachedProducts();

  const [newRow, setNewRow] = useState(null);

  useEffect(() => {
    if (!passedOrder) {
      navigate("/crm/orders");
    }
  }, [passedOrder, navigate]);

  const handleEditQuantity = (productId, value) => {
    setEditedItems((prev) =>
      prev.map((item) =>
        item.product === productId
          ? { ...item, quantity: value === "" ? "" : Number(value) }
          : item
      )
    );
  };

  const handleDeleteItem = (productId) => {
    setEditedItems((prev) => prev.filter((item) => item.product !== productId));
  };

  const handleAddRow = () => {
    setNewRow({ product: null, quantity: 1 });
  };

  const handleSaveNewRow = () => {
    if (!newRow?.product || newRow.quantity <= 0) {
      alert("Select a product and enter a valid quantity");
      return;
    }

    const existing = editedItems.find((i) => i.product === newRow.product);
    if (existing) {
      alert("Product already in the list.");
      return;
    }

    const productData = allProducts.find((p) => p.product_id === newRow.product);
    if (!productData) return;

    setEditedItems((prev) => [
      ...prev,
      {
        product: productData.product_id,
        product_name: productData.product_name,
        quantity: newRow.quantity,
        original_quantity: "Added",
        price: productData.price ?? 0, // ✅ safe fallback
        ss_virtual_stock: productData.virtual_stock ?? 0,
      },
    ]);

    setNewRow(null);
  };

  const [loadingApprove, setLoadingApprove] = useState(false);

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
      navigate("/all/orders-history");
    } catch (error) {
      console.error("❌ Error verifying order:", error);
      alert("Failed to verify order");
    } finally {
      setLoadingApprove(false);
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
      <div className="mb-6 border-b pb-3">
        <h2 className="text-sm font-bold">{order.order_id}</h2>
        <p className="text-gray-600">{order.ss_party_name}</p>
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
                  <th className="px-2 py-2 border border-yellow-300">Product</th>
                  <th className="px-2 py-2 border border-yellow-300">Qty</th>
                  <th className="px-2 py-2 border border-yellow-300">Last Rejected</th>
                </tr>
              </thead>
              <tbody>
                {order.recent_rejected_items.map((r) => (
                  <tr key={r.product} className="hover:bg-yellow-50">
                    <td className="px-2 py-1 border border-yellow-200">{r.product_name}</td>
                    <td className="px-2 py-1 border border-yellow-200 text-center">{r.quantity}</td>
                    <td className="px-2 py-1 border border-yellow-200 text-xs text-gray-600">
                      {new Date(r.last_rejected_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-gray-500 italic text-sm">No previous rejections</div>
          )}
        </div>

        {/* Main Table */}
        <div className="md:col-span-3 overflow-x-auto shadow rounded">
          <table className="w-full border border-gray-200 text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase">
              <tr>
                <th className="px-4 py-3 border border-gray-300">Product</th>
                <th className="px-4 py-3 text-center border border-gray-300">SS Order</th>
                <th className="px-4 py-3 text-center border border-gray-300">Approved</th>
                <th className="px-4 py-3 text-center border border-gray-300">ss-Stock</th>
                <th className="px-4 py-3 text-center border border-gray-300">Stock</th>
                <th className="px-4 py-3 text-center border border-gray-300">Cartoon</th>
                <th className="px-4 py-3 text-center border border-gray-300">Price</th>
                <th className="px-4 py-3 text-center border border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {editedItems.map((item) => {
                const productData = allProducts.find((p) => p.product_id === item.product);
                return (
                  <tr key={item.product} className="hover:bg-gray-50 bg-white">
                    <td className="px-4 py-2 border border-gray-200">
                      <div className="flex">
                        {item.product_name}
                        {item.is_scheme_item && <FaGift className="mx-2 text-orange-500" />}
                      </div>
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      {item.original_quantity}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.quantity === "" ? "" : item.quantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          // allow empty for backspace
                          if (val === "") {
                            handleEditQuantity(item.product, "");
                            return;
                          }
                          // only allow valid non-negative integers
                          const num = parseInt(val, 10);
                          if (!isNaN(num) && num >= 0) {
                            handleEditQuantity(item.product, num);
                          }
                        }}
                        className="border rounded-lg p-1 w-20 text-center"
                      />
                    </td>

                    <td className="px-4 py-2 border border-gray-200 text-center">
                      {item.ss_virtual_stock}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-center font-medium">
                      {productData?.virtual_stock ?? "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-center font-medium">
                      {productData?.cartoon_size ?? "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 font-medium text-center">
                      {!isNaN(item.price) ? (
                        <span className="flex items-center justify-center gap-1 text-gray-700">
                          <FaIndianRupeeSign className="text-gray-400" /> {item.price}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1 text-red-500 text-xs">
                          <FaBan /> Price
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      <button
                        onClick={() => {
                          setItemToDelete(item.product);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-800 cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {/* New Row */}
              {newRow && (
                <tr className="bg-gray-100">
                  <td className="px-4 py-2 border border-gray-200 relative">
                    <ProductSearchSelect
                      value={newRow.product}
                      onChange={(id) => setNewRow((prev) => ({ ...prev, product: id }))}
                    />
                  </td>
                  <td className="px-4 py-2 border border-gray-200 text-center">—</td>
                  <td className="px-4 py-2 border border-gray-200 text-center">
                    <input
                      type="number"
                      min="1"
                      value={newRow.quantity}
                      onChange={(e) =>
                        setNewRow((prev) => ({ ...prev, quantity: +e.target.value }))
                      }
                      className="border rounded-lg p-1 w-20 text-center"
                    />
                  </td>
                  <td className="px-4 py-2 border border-gray-200 text-center text-gray-400 italic">
                    —
                  </td>
                  <td className="px-4 py-2 border border-gray-200 text-center text-gray-400 italic">
                    —
                  </td>
                  <td className="px-4 py-2 border border-gray-200 text-center">
                    <button
                      onClick={handleSaveNewRow}
                      className="text-green-600 border px-2 rounded p-1 hover:bg-gray-300 mr-2 cursor-pointer"
                    >
                      Save
                    </button>
                  </td>
                </tr>
              )}

              {/* Add Row */}
              <tr>
                <td colSpan="6" className="text-center p-1">
                  <button
                    onClick={handleAddRow}
                    className="flex items-center rounded border p-2 cursor-pointer justify-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Plus size={18} /> Add Item
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Action Button */}
          <div className="mt-6 p-4 flex justify-center">
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={loadingApprove}
              className={`flex items-center justify-center gap-2 px-6 py-2 cursor-pointer rounded-lg text-white shadow-md transition ${loadingApprove
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-green-600"
                }`}
            >
              {loadingApprove && <Loader2 className="animate-spin w-4 h-4" />}
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80 animate-fadeIn">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Confirm Order Submission
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Are you sure you want to submit this order?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleVerify();
                  setShowConfirmModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white cursor-pointer"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80 animate-fadeIn">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Trash2 className="text-red-500" /> Delete Item?
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Are you sure you want to delete this item?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteItem(itemToDelete);
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
