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

  const passedOrder = location.state?.order;
  const [order, setOrder] = useState(passedOrder || null);

  const [editedItems, setEditedItems] = useState(
    (passedOrder?.items || []).map((item) => ({
      ...item,
      original_quantity: item.quantity,
    }))
  );
  const [notes, setNotes] = useState(passedOrder?.notes || "");
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
    if (!newRow?.product || newRow.quantity <= 0) return;

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
        price: productData.price,
      },
    ]);
    setNewRow(null);
  };

  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);

  const handleVerify = async (status) => {
    if (!order) return;

    if (status === "APPROVED") setLoadingApprove(true);
    if (status === "REJECTED") setLoadingReject(true);

    const payload = {
      status,
      notes,
      total_amount:
        status === "REJECTED"
          ? 0
          : editedItems.reduce(
              (sum, item) => sum + (isNaN(item.price) ? 0 : item.price) * item.quantity,
              0
            ),
      items:
        status === "REJECTED"
          ? []
          : editedItems.map((item) => ({
              product: item.product,
              quantity: item.quantity,
              price: isNaN(item.price) ? 0 : item.price,
            })),
    };

    try {
      await verifyCRMOrder(order.id, payload);
      alert(`Order ${status.toLowerCase()} successfully`);
      navigate("/crm/orders");
    } catch (error) {
      console.error("❌ Error verifying order:", error);
      alert("Failed to verify order");
    } finally {
      setLoadingApprove(false);
      setLoadingReject(false);
    }
  };

  if (!order)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );

  return (
    <div className="p-4 mx-auto sm:border rounded">
      {/* Header */}
      <div className="mb-6 border-b pb-3">
        <h2 className="text-sm font-bold">{order.order_id}</h2>
        <p className="text-gray-600">{order.ss_party_name}</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-2xl">
        <table className="w-full border border-gray-200 text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase">
            <tr>
              <th className="px-4 py-3 border border-gray-300">Product</th>
              <th className="px-4 py-3 text-center border border-gray-300">SS Order</th>
              <th className="px-4 py-3 text-center border border-gray-300">Verify</th>
              <th className="px-4 py-3 text-center border border-gray-300">Price</th>
              <th className="px-4 py-3 text-center border border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {editedItems.map((item) => (
              <tr key={item.product} className="hover:bg-gray-50">
                <td className="px-4 py-2 border border-gray-200">
                  <div className="flex">
                    {item.product_name}
                    {item.is_scheme_item ? (
                      <FaGift className="mx-2 text-orange-500" />
                    ) : (
                      ""
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 border border-gray-200 text-center">
                  {item.original_quantity}
                </td>
                <td className="px-4 py-2 border border-gray-200 text-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={item.quantity === 0 ? "" : item.quantity}
                    onChange={(e) => handleEditQuantity(item.product, e.target.value)}
                    className="border rounded-lg p-1 w-20 text-center"
                  />
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
                    onClick={() => handleDeleteItem(item.product)}
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}

            {/* New Row */}
            {newRow && (
              <tr className="bg-gray-100">
                <td className="px-4 py-2 border border-gray-200 relative overflow-visible z-50">
                  <ProductSearchSelect
                    value={newRow.product}
                    onChange={(id) =>
                      setNewRow((prev) => ({ ...prev, product: id }))
                    }
                  />
                </td>
                <td className="px-4 py-2 border border-gray-200 text-center">—</td>
                <td className="px-4 py-2 border border-gray-200 text-center">
                  <input
                    type="number"
                    min="1"
                    value={newRow.quantity}
                    onChange={(e) =>
                      setNewRow((prev) => ({
                        ...prev,
                        quantity: +e.target.value,
                      }))
                    }
                    className="border rounded-lg p-1 w-20 text-center"
                  />
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
              <td colSpan="5" className="text-center p-4">
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
      </div>

      {/* Notes */}
      <div className="mt-6">
        <label className="block font-semibold mb-1">Notes</label>
        <textarea
          className="border rounded-lg p-3 w-full focus:ring focus:ring-blue-200"
          rows="3"
          placeholder="Notes for this order..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => handleVerify("APPROVED")}
          disabled={loadingApprove}
          className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-white shadow-md transition ${
            loadingApprove
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {loadingApprove && <Loader2 className="animate-spin w-4 h-4" />}
          Approve
        </button>

        <button
          onClick={() => handleVerify("REJECTED")}
          disabled={loadingReject}
          className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-white shadow-md transition ${
            loadingReject
              ? "bg-red-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {loadingReject && <Loader2 className="animate-spin w-4 h-4" />}
          Reject
        </button>
      </div>
    </div>
  );
}
