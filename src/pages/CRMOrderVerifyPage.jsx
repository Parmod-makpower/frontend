// ✅ FINAL UPDATED CRMOrderVerifyPage.jsx with full scheme condition display and console log on verify

import { useEffect, useState } from "react";
import API from "../api/axios";
import { fetchFilteredProducts } from "../auth/useProducts";
import { FaCheck, FaTrash, FaArrowLeft } from "react-icons/fa";
import { IoChevronBack } from "react-icons/io5";

export default function CRMOrderVerifyPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("APPROVED");
  const [productMap, setProductMap] = useState({});
  const [allProducts, setAllProducts] = useState([]);
  const [cartMap, setCartMap] = useState({});
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [schemeSuggestions, setSchemeSuggestions] = useState([]);
  const [schemeSearch, setSchemeSearch] = useState("");

  useEffect(() => {
    loadPendingOrders();
    loadAllProducts();
  }, []);

  const loadPendingOrders = async () => {
    try {
      const res = await API.get("/orders/crm-orders/pending/");
      setOrders(res.data);
    } catch (err) {
      console.error("Pending orders लोड नहीं हो पाए", err);
    }
  };

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
    setAllProducts(all);
  };

  const handleSelectOrder = (order) => {
    const items = order.items.map((item, index) => ({
      ...item,
      localId: `${item.product_id}-${index}`,
    }));
    const schemes = (order.applied_schemes || []).flatMap((scheme, idx) =>
      scheme.rewards.map((r, i) => ({
        localId: `reward-${r.product_id}-${i}`,
        ...r,
        _conditions: scheme.conditions || [], // ✅ pass conditions for UI display
      }))
    );
    setSelectedOrder({ ...order, items, freeSchemes: schemes });
    setNote("");
    setStatus("APPROVED");
    const cart = {};
    items.forEach((i) => {
      cart[i.product_id] = (cart[i.product_id] || 0) + i.quantity;
    });
    setCartMap(cart);
  };

  const updateQty = (localId, value, type = "main") => {
    const qty = Math.max(1, parseInt(value) || 1);
    setSelectedOrder((prev) => {
      const updatedList = prev[type].map((item) =>
        item.localId === localId ? { ...item, quantity: qty } : item
      );
      const newCartMap = {};
      if (type === "items") {
        updatedList.forEach((i) => {
          newCartMap[i.product_id] = (newCartMap[i.product_id] || 0) + i.quantity;
        });
        setCartMap(newCartMap);
      }
      return { ...prev, [type]: updatedList };
    });
  };

  const removeItem = (localId, type = "items") => {
    setSelectedOrder((prev) => {
      const updatedList = prev[type].filter((item) => item.localId !== localId);
      if (type === "items") {
        const newCartMap = {};
        updatedList.forEach((i) => {
          newCartMap[i.product_id] = (newCartMap[i.product_id] || 0) + i.quantity;
        });
        setCartMap(newCartMap);
      }
      return { ...prev, [type]: updatedList };
    });
  };

  const handleSubmit = async () => {
    const payload = {
      ss_order: selectedOrder.id,
      total_quantity: selectedOrder.items.reduce((sum, i) => sum + i.quantity, 0),
      total_price: selectedOrder.items.reduce((sum, i) => sum + i.quantity * Number(i.price || 0), 0),
      notes: note,
      status,
      items: selectedOrder.items.map(({ product_id, sale_name, price, quantity }) => ({
        product_id,
        sale_name,
        price,
        quantity,
      })),
      verified_schemes: selectedOrder.freeSchemes.map(({ product_id, sale_name, quantity }) => ({
        product_id,
        sale_name,
        quantity,
        is_auto_applied: true,
      })),
    };

    console.log("✅ FINAL ORDER SUBMIT:", JSON.stringify(payload, null, 2));

    try {
      await API.post("/orders/crm-orders/create/", payload);
      alert("✅ Order verified successfully");
      setSelectedOrder(null);
      loadPendingOrders();
    } catch (err) {
      console.error("सत्यापन विफल", err);
      alert("❌ Verification failed");
    }
  };

  const handleSearch = async (text, type = "main") => {
    if (text.length < 1) return type === "main" ? setSuggestions([]) : setSchemeSuggestions([]);
    const res = await fetchFilteredProducts(text);
    type === "main" ? setSuggestions(res.results || []) : setSchemeSuggestions(res.results || []);
  };

  const addProduct = (product, type = "main") => {
    const target = type === "main" ? selectedOrder.items : selectedOrder.freeSchemes;
    const alreadyIn = target.find((i) => i.product_id === product.product_id);
    if (alreadyIn) return alert("Product already added");
    const newItem = {
      ...product,
      localId: `${product.product_id}-${Date.now()}`,
      quantity: 1,
      sale_name: product.product_name,
      price: product.price || 0,
    };
    setSelectedOrder((prev) => ({
      ...prev,
      [type === "main" ? "items" : "freeSchemes"]: [...target, newItem],
    }));
    if (type === "main") {
      setCartMap({ ...cartMap, [product.product_id]: (cartMap[product.product_id] || 0) + 1 });
      setSearch("");
      setSuggestions([]);
    } else {
      setSchemeSearch("");
      setSchemeSuggestions([]);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto text-sm space-y-6 max-w-md mx-auto  px-4 relative">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white p-3 border-b border-gray-200 shadow-sm sm:static sm:mx-4 sm:rounded-md sm:shadow-md sm:border transition-all duration-200 ease-in-out">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.history.back()}
                  className="text-gray-700 hover:text-blue-600 text-xl px-1 transition-transform hover:scale-105"
                  aria-label="Back"
                >
                  <IoChevronBack />
                </button>
                <span className="text-lg sm:text-xl font-semibold text-gray-800">
                  Orders
                </span>
              </div>
            </div>
    <div className="pt-[60px]">
      {!selectedOrder ? (
        orders.length === 0 ? (
          <p className="text-gray-500 text-center">No Order Found!</p>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => (
              <li
                key={order.id}
                onClick={() => handleSelectOrder(order)}
                className="p-4 rounded shadow-sm flex justify-between items-center bg-white hover:bg-gray-50 transition cursor-pointer"
              >
                <div>
                  <div className="font-medium">
                    {order.order_id} - <span className="text-xs text-gray-500">{order.party_name}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Total: {order.total_quantity} items • ₹{order.total_price}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="font-medium">
              {selectedOrder.party_name}
              <p className="text-xs text-gray-500">{selectedOrder.order_id}</p>
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="inline-flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              <FaArrowLeft className="mr-2" /> Back
            </button>
          </div>

          {/* Order Items */}
          {selectedOrder.items.map((item) => (
            <div key={item.localId} className="flex justify-between items-center border rounded p-2 bg-white">
              <div>
                <div className="font-medium">{item.sale_name}</div>
                <div className="text-xs text-gray-500">Item : {item.quantity}</div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateQty(item.localId, e.target.value, "items")}
                  className="w-16 border px-2 py-1 rounded"
                />
                <button onClick={() => removeItem(item.localId, "items")} className="text-red-500">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}

          {/* Search Products */}
          <div>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                handleSearch(e.target.value, "main");
              }}
              placeholder="🔍 Add product..."
              className="w-full border px-3 py-2 rounded"
            />
            {suggestions.length > 0 && (
              <ul className="bg-white border rounded mt-1 max-h-48 overflow-y-auto">
                {suggestions.map((prod) => (
                  <li
                    key={`main-${prod.product_id}-${prod.id || Math.random()}`}
                    onClick={() => addProduct(prod, "main")}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                  >
                    {prod.product_name} ({prod.product_id})
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Free Scheme Products */}
          <div>
            <h4 className="text-sm font-semibold mb-1">🎁 Scheme Products</h4>
            {selectedOrder.freeSchemes.map((item) => (
              <div key={item.localId} className="border rounded p-2 mt-1 bg-white">
                <div className="font-medium">{item.sale_name || productMap[item.product_id]}</div>
                <div className="text-xs text-gray-500">Item : {item.quantity}</div>
                {item._conditions?.length > 0 && (
                  <div className="text-[10px] text-gray-500 mt-1">
                    <strong>Conditions:</strong>
                    {item._conditions.map((cond, i) => (
                      <div key={i}>
                        Buy {cond.quantity} × {productMap[cond.product_id] || cond.product_id}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateQty(item.localId, e.target.value, "freeSchemes")}
                    className="w-16 border px-2 py-1 rounded"
                  />
                  <button onClick={() => removeItem(item.localId, "freeSchemes")} className="text-red-500">
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}

            <input
              type="text"
              value={schemeSearch}
              onChange={(e) => {
                setSchemeSearch(e.target.value);
                handleSearch(e.target.value, "scheme");
              }}
              placeholder="🔍 Add scheme product..."
              className="w-full border px-3 py-2 rounded mt-2"
            />
            {schemeSuggestions.length > 0 && (
              <ul className="bg-white border rounded mt-1 max-h-48 overflow-y-auto">
                {schemeSuggestions.map((prod) => (
                  <li
                     key={`scheme-${prod.product_id}-${prod.id || Math.random()}`}
                    onClick={() => addProduct(prod, "freeSchemes")}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                  >
                    {prod.product_name} ({prod.product_id})
                  </li>
                ))}
              </ul>
            )}
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="🗒️ Notes (optional)"
            className="w-full border rounded px-3 py-2"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="APPROVED">✅ Approve</option>
            <option value="REJECTED">❌ Reject</option>
          </select>

          <div className="text-center">
            <button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow"
            >
              <FaCheck className="inline mr-1" /> Final Verify
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}