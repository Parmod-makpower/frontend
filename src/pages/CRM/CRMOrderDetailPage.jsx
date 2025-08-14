import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCRMOrders, verifyCRMOrder } from "../../hooks/useCRMOrders";
import { useCachedProducts } from "../../hooks/useCachedProducts";
import ProductSearchSelect from "../../components/ProductSearchSelect";

export default function CRMOrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [editedItems, setEditedItems] = useState([]);
  const [notes, setNotes] = useState("");
  const { data: allProducts = [] } = useCachedProducts();

  const [newProductId, setNewProductId] = useState(null);
  const [newProductQty, setNewProductQty] = useState(1);

  const fetchOrder = async () => {
    try {
      const data = await getCRMOrders();
      const selected = data.find((o) => o.id === Number(orderId));
      setOrder(selected);
      setEditedItems(selected.items || []);
      setNotes(selected.notes || "");
    } catch (error) {
      console.error("❌ Error fetching order:", error);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

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
      await verifyCRMOrder(order.id, payload);
      alert(`Order ${status.toLowerCase()} successfully`);
      navigate("/crm/orders");
    } catch (error) {
      console.error("❌ Error verifying order:", error);
      alert("Failed to verify order");
    }
  };

  if (!order) return <p className="p-4">Loading order...</p>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">
        {order.order_id}
        <p>{order.ss_party_name}</p>
      </h2>

      {/* Add Product Section */}
      <div className="mb-4 p-4 rounded">
        <h3 className="font-semibold mb-2">Add New Item</h3>
        <div className="flex items-center gap-2">
          <div className="w-1/2">
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
            className="border p-2 w-24"
          />
          <button
            onClick={handleAddItem}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Add
          </button>
        </div>
      </div>

      {/* Edit Items Table */}
      <table className="w-full border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Product</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {editedItems.map((item) => (
            <tr key={item.product}>
              <td className="border p-2">{item.product_name}</td>
              <td className="border p-2">
                <input
                  type="number"
                  value={item.quantity}
                  min="1"
                  onChange={(e) =>
                    handleEditQuantity(item.product, +e.target.value)
                  }
                  className="border p-1 w-20"
                />
              </td>
              <td className="border p-2">{item.price}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleDeleteItem(item.product)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Notes */}
      <textarea
        className="border p-2 w-full mb-4"
        rows="3"
        placeholder="Notes for this order..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      ></textarea>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => handleVerify("APPROVED")}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Approve
        </button>
        <button
          onClick={() => handleVerify("REJECTED")}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
