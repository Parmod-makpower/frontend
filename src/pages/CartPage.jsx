import { useEffect, useState } from "react";
import { FaTrash, FaTimes, FaGift } from "react-icons/fa";
import { fetchFilteredProducts } from "../auth/useProducts";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios"; // ✅ आपके axios instance का path

export default function CartPage() {
  const { user } = useAuth();

  const [selectedProducts, setSelectedProducts] = useState(() => {
    const saved = localStorage.getItem("selectedProducts");
    return saved ? JSON.parse(saved) : [];
  });

  const [schemes, setSchemes] = useState(() => {
    const saved = localStorage.getItem("activeSchemes");
    return saved ? JSON.parse(saved) : [];
  });

  const [productMap, setProductMap] = useState({});

  // ✅ Load all products (paginated)
  useEffect(() => {
    const loadAllProducts = async () => {
      let page = 1;
      let all = [];
      let hasMore = true;

      while (hasMore) {
        const res = await fetchFilteredProducts("", page, 100);
        all.push(...(res.results || []));
        hasMore = !!res.next;
        page++;
      }

      const map = {};
      all.forEach((p) => {
        map[p.product_id] = p.product_name;
      });
      setProductMap(map);
    };

    loadAllProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
  }, [selectedProducts]);

  const updateQuantity = (id, qty) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, quantity: qty === "" ? "": Math.max(1, Number(qty)) } : p
      )
    );
  };

  const removeProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const totalQuantity = selectedProducts.reduce((acc, p) => acc + p.quantity, 0);
  const totalPrice = selectedProducts.reduce(
    (acc, p) => acc + (p.price || 0) * p.quantity,
    0
  );

  const cartMap = selectedProducts.reduce((acc, item) => {
    acc[item.product_id] = (acc[item.product_id] || 0) + item.quantity;
    return acc;
  }, {});

  const isSchemeFulfilled = (scheme) => {
    return scheme.conditions.every(
      (cond) => cartMap[cond.product_id] >= cond.quantity
    );
  };

  const formatSchemeText = (scheme, currentProductId) => {
    const buyText = scheme.conditions
      .map((c) => {
        const isCurrent = String(c.product_id) === String(currentProductId);
        const name = productMap[c.product_id] || `Product ${c.product_id}`;
        return `${c.quantity} × ${isCurrent ? "this item" : name}`;
      })
      .join(" + ");

    const rewardText = scheme.rewards
      .map(
        (r) =>
          `${r.quantity} ${productMap[r.product_id] || `Product ${r.product_id}`}`
      )
      .join(", ");

    return `Buy ${buyText} → Get ${rewardText}`;
  };

  const getApplicableSchemes = (productId) => {
    return schemes.filter(
      (scheme) =>
        Array.isArray(scheme.conditions) &&
        scheme.conditions.some((cond) => cond.product_id === String(productId))
    );
  };



const handlePlaceOrder = async () => {
  const fulfilledSchemes = schemes.filter(isSchemeFulfilled);
  const orderId = `ORD${Date.now()}`;

  const payload = {
    order_id: orderId,
    total_quantity: totalQuantity || 0,
    total_price: Number(totalPrice.toFixed(2)) || 0,
    applied_schemes: fulfilledSchemes,
    items: selectedProducts.map((item) => ({
      product_id: item.product_id,
      sale_name: item.sale_name,
      price: item.price || 0,
      quantity: item.quantity,
    })),
  };

  try {
    const res = await API.post("/orders/ss-orders/", payload);
    console.log("✅ Order Saved:", res.data);
    alert("✅ Order placed successfully!");

    setSelectedProducts([]);
    localStorage.removeItem("selectedProducts");
  } catch (err) {
    console.error("❌ Order failed", err.response?.data || err.message);
    alert("❌ Failed to place order.");
  }
};


  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 py-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">🛒 Your Cart</h2>
          <button
            onClick={() => window.history.back()}
            className="text-gray-500 hover:text-red-500"
            title="Close"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Empty Cart */}
        {selectedProducts.length === 0 ? (
          <div className="text-center text-gray-500 py-16 text-sm">
            🛍️ Your cart is empty.
          </div>
        ) : (
          <>
            {/* Product List */}
            <div className="space-y-5 text-sm text-gray-800">
              {selectedProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div className="flex-grow">
                    <div className="font-medium text-gray-900 truncate">
                      {p.sale_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {p.category} | ₹{p.price || 0}/unit
                    </div>
                    {/* Scheme block */}
                    {getApplicableSchemes(p.product_id).map((scheme) => {
                      const fulfilled = isSchemeFulfilled(scheme);
                      return (
                        <div
                          key={scheme.id}
                          className={`mt-1 text-xs p-2 rounded-md flex items-start gap-2 ${
                            fulfilled
                              ? "bg-green-50 text-green-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          <FaGift className="mt-0.5 text-[12px]" />
                          <div>
                            {formatSchemeText(scheme, p.product_id)}
                            {!fulfilled && (
                              <div className="text-[10px] text-red-500 mt-0.5">
                                ⚠️ Add more to apply scheme
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col items-end gap-2">
                    <input
                      type="number"
                      min={1}
                      value={p.quantity}
                      onChange={(e) => updateQuantity(p.id, e.target.value)}
                      onBlur={(e) => {
    const val = Number(e.target.value);
    if (!val || val < 1) {
      updateQuantity(p.id, 1); // खाली छोड़ा तो 1 कर दो
    }
  }}
                      className="w-16 px-2 py-1 border rounded text-center text-xs"
                    />
                    <button
                      onClick={() => removeProduct(p.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Remove"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 text-right text-sm text-gray-700 space-y-1">
              <div>Total Items: <strong>{selectedProducts.length}</strong></div>
              <div>Total Quantity: <strong>{totalQuantity}</strong></div>
              <div>Total Price: <strong>₹{totalPrice.toFixed(2)}</strong></div>
            </div>

            {/* Place Order */}
            <div className="mt-6 text-center">
              <button
                onClick={handlePlaceOrder}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2 rounded shadow"
              >
                🚀 Place Order
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
