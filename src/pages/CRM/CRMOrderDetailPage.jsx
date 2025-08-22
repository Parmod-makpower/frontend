import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { verifyCRMOrder } from "../../hooks/useCRMOrders";
import { useCachedProducts } from "../../hooks/useCachedProducts";
import ProductSearchSelect from "../../components/ProductSearchSelect";
import { Loader2 } from "lucide-react"; // spinner icon

export default function CRMOrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const passedOrder = location.state?.order;
  const [order, setOrder] = useState(passedOrder || null);
  const [editedItems, setEditedItems] = useState(passedOrder?.items || []);
  const [notes, setNotes] = useState(passedOrder?.notes || "");
  const { data: allProducts = [] } = useCachedProducts();

  const [newProductId, setNewProductId] = useState(null);
  const [newProductQty, setNewProductQty] = useState(1);

  const [loading, setLoading] = useState(false); // for button + spinner

  useEffect(() => {
    if (!passedOrder) {
      navigate("/crm/orders");
    }
  }, [passedOrder, navigate]);

  const handleEditQuantity = (productId, qty) => {
    setEditedItems((prev) =>
      prev.map((item) =>
        item.product === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const handleDeleteItem = (productId) => {
    setEditedItems((prev) => prev.filter((item) => item.product !== productId));
  };

  const handleAddItem = () => {
    if (!newProductId || newProductQty <= 0) return;
    const existing = editedItems.find((item) => item.product === newProductId);
    if (existing) {
      alert("Product already in the list.");
      return;
    }
    const productData = allProducts.find(
      (p) => p.product_id === newProductId
    );
    if (!productData) return;
    setEditedItems((prev) => [
      ...prev,
      {
        product: productData.product_id,
        product_name: productData.product_name,
        quantity: newProductQty,
        price: productData.price,
      },
    ]);
    setNewProductId(null);
    setNewProductQty(1);
  };

  const handleVerify = async (status) => {
    if (!order) return;
    const payload = {
      status,
      notes,
      total_amount:
        status === "REJECTED"
          ? 0
          : editedItems.reduce(
              (sum, item) => sum + (item.price || 0) * item.quantity,
              0
            ),
      items:
        status === "REJECTED"
          ? []
          : editedItems.map((item) => ({
              product: item.product,
              quantity: item.quantity,
              price: item.price || 0,
            })),
    };
    try {
      setLoading(true);
      await verifyCRMOrder(order.id, payload);
      alert(`Order ${status.toLowerCase()} successfully`);
      navigate("/crm/orders");
    } catch (error) {
      console.error("❌ Error verifying order:", error);
      alert("Failed to verify order");
    } finally {
      setLoading(false);
    }
  };

  if (!order)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );

  return (
    <div className="p-4 max-w-5xl mx-auto pb-20">
      {/* Order Header */}
      <div className="mb-6 border-b pb-3">
        <h2 className="text-2xl font-bold text-gray-800">{order.order_id}</h2>
        <p className="text-gray-600">{order.ss_party_name}</p>
      </div>

     

      {/* Items Table */}
      <div className="overflow-x-auto mb-6 bg-white shadow rounded-2xl">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-semibold">Product</th>
              <th className="p-3 text-left font-semibold">Quantity</th>
              <th className="p-3 text-left font-semibold">Price</th>
              <th className="p-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {editedItems.map((item) => (
              <tr
                key={item.product}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="p-3">{item.product_name}</td>
                <td className="p-3">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleEditQuantity(item.product, +e.target.value)
                    }
                    className="border rounded-lg p-1 w-20 text-center"
                  />
                </td>
                <td className="p-3 font-medium">₹{item.price}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleDeleteItem(item.product)}
                    className="text-red-600 hover:text-red-800 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {editedItems.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="text-center p-6 text-gray-500 italic"
                >
                  No items added.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
 {/* Add New Item */}
      <div className="mb-6  rounded-2xl p-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
        Add New Item
        </h3>
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="w-full md:w-1/2">
            <ProductSearchSelect
              value={newProductId}
              onChange={(id) => setNewProductId(id)}
            />
          </div>
          <input
            type="number"
            min="1"
            value={newProductQty}
            onChange={(e) => setNewProductQty(+e.target.value)}
            className="border rounded-lg p-2 w-full md:w-28 focus:ring focus:ring-blue-200"
          />
          <button
            onClick={handleAddItem}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-2 rounded-lg shadow-md w-full md:w-auto"
          >
            Add
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
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
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => handleVerify("APPROVED")}
          disabled={loading}
          className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-white shadow-md transition ${
            loading
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {loading && <Loader2 className="animate-spin w-4 h-4" />}
          Approve
        </button>
        <button
          onClick={() => handleVerify("REJECTED")}
          disabled={loading}
          className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-white shadow-md transition ${
            loading
              ? "bg-red-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {loading && <Loader2 className="animate-spin w-4 h-4" />}
          Reject
        </button>
      </div>
    </div>
  );
}
