import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaBoxOpen, FaShoppingCart } from "react-icons/fa";
import { useCachedSSUsers } from "../../auth/useSS";
import { useCachedProducts } from "../../hooks/useCachedProducts";
import { useSchemes } from "../../hooks/useSchemes";
import { useAuth } from "../../context/AuthContext";
import { usePlaceOrder } from "../../hooks/usePlaceOrder";
import { useSelectedProducts } from "../../hooks/useSelectedProducts"; // ✅ global hook
import MobilePageHeader from "../../components/MobilePageHeader";

export default function CRMCreateOrderPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: ssUsers = [] } = useCachedSSUsers();
  const { data: allProducts = [] } = useCachedProducts();
  const { data: schemes = [] } = useSchemes();
  const placeOrderMutation = usePlaceOrder();

  const {
    selectedProducts,
    addProduct,
    updateQuantity,
    removeProduct,
    setSelectedProducts,
  } = useSelectedProducts(); // ✅ use hook

  const [selectedSS, setSelectedSS] = useState("");
  const [selectedSSName, setSelectedSSName] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const searchInputRef = useRef(null);

  // ✅ Load from localStorage on mount
  useEffect(() => {
    const savedSS = localStorage.getItem("crm_selected_ss");
    const savedSSName = localStorage.getItem("crm_selected_ss_name");
    const savedProducts = localStorage.getItem("crm_selected_products");

    if (savedSS) setSelectedSS(savedSS);
    if (savedSSName) setSelectedSSName(savedSSName);

    if (savedProducts) {
      try {
        const parsedProducts = JSON.parse(savedProducts);
        setSelectedProducts(
          parsedProducts.map((p) => ({
            id: p.id,
            product_name: p.product_name,
            cartoon_size: p.cartoon_size,
            quantity: p.quantity || 1,
            price: p.price || 0,
            virtual_stock: p.virtual_stock || 0,
          }))
        );
      } catch {
        localStorage.removeItem("crm_selected_products");
      }
    }
  }, [setSelectedProducts]);

  // ✅ Sync localStorage whenever selectedProducts or SS change
  useEffect(() => {
    localStorage.setItem("crm_selected_ss", selectedSS);
    localStorage.setItem("crm_selected_ss_name", selectedSSName);
    localStorage.setItem("crm_selected_products", JSON.stringify(selectedProducts));
  }, [selectedSS, selectedSSName, selectedProducts]);

  const handleAddProduct = (product) => {
    if (!product) return;
    addProduct({
      id: product.id ?? product.product_id,
      product_name: product.product_name,
      cartoon_size: product.cartoon_size,
      quantity: 1,
      price: product.price || 0,
      virtual_stock: product.virtual_stock || 0,
    });
    setSearchTerm("");
    setHighlightIndex(-1);
    searchInputRef.current?.focus();
  };

  const handleQuantityChange = (id, value) => {
    // केवल digits की अनुमति (0-9)
    const numericValue = value.replace(/[^0-9]/g, "");

    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, quantity: numericValue === "" ? "" : Number(numericValue) }
          : p
      )
    );
  };


  // ✅ Remove product and auto-sync localStorage
  const handleRemove = (id) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // ✅ Virtual stock auto-update
  useEffect(() => {
    setSelectedProducts((prev) =>
      prev.map((p) => {
        const updated = allProducts.find((ap) => (ap.id ?? ap.product_id) === p.id);
        return { ...p, virtual_stock: updated?.virtual_stock ?? p.virtual_stock };
      })
    );
  }, [allProducts, setSelectedProducts]);

  const getSchemeMultiplier = (scheme) =>
    Math.min(
      ...scheme.conditions.map((cond) => {
        const matched = selectedProducts.find(
          (p) => p.id === cond.product || p.product_name === cond.product_name
        );
        if (!matched) return 0;
        return Math.floor(matched.quantity / cond.min_quantity);
      })
    );

  const mergeRewards = (eligibleSchemes) => {
    const rewardMap = {};
    eligibleSchemes.forEach((scheme) => {
      const multiplier = getSchemeMultiplier(scheme);
      scheme.rewards.forEach((r) => {
        const productId = r.product ?? r.product_id;
        const productName = r.product_name || r.product;
        const totalQty = r.quantity * multiplier;

        if (rewardMap[productId]) {
          rewardMap[productId].quantity += totalQty;
        } else {
          rewardMap[productId] = { product: productId, product_name: productName, quantity: totalQty };
        }
      });
    });
    return Object.values(rewardMap);
  };

  const eligibleSchemes = schemes.filter((scheme) => getSchemeMultiplier(scheme) > 0);

  const handlePlaceOrder = () => {
    if (!selectedSS) return alert("Please select a Super Stockist first!");
    if (selectedProducts.length === 0) return alert("Please add at least 1 product!");

    setIsPlacingOrder(true);
    const mergedRewards = mergeRewards(eligibleSchemes);

    const order = {
      user_id: selectedSS,
      crm_id: user?.id,
      items: selectedProducts.map((p) => ({ id: p.id, quantity: p.quantity, price: Number(p.price) || 0 })),
      eligibleSchemes: mergedRewards,
      total: selectedProducts.reduce((sum, p) => sum + (Number(p.price) || 0) * (p.quantity || 1), 0),
    };

    placeOrderMutation.mutate(order, {
      onSuccess: (data) => {
        setIsPlacingOrder(false);
        setSelectedProducts([]);
        setSelectedSS("");
        setSelectedSSName("");
        localStorage.removeItem("crm_selected_products");
        localStorage.removeItem("crm_selected_ss");
        localStorage.removeItem("crm_selected_ss_name");
        setShowSuccess(data.order.order_id);
      },
      onError: () => {
        setIsPlacingOrder(false);
        alert("Order failed, please try again.");
      },
    });
  };

  const filteredProducts = allProducts.filter((p) =>
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % filteredProducts.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev === -1 ? filteredProducts.length - 1 : (prev - 1 + filteredProducts.length) % filteredProducts.length));
    } else if (e.key === "Enter") {
      if (highlightIndex >= 0 && filteredProducts[highlightIndex]) {
        e.preventDefault();
        handleAddProduct(filteredProducts[highlightIndex]);
      }
    }
  };

  return (
    <div className="mx-auto px-3 pb-20">
      <MobilePageHeader title="CRM Create Order" />
      <div className="grid grid-cols-12 gap-6 pt-[60px] sm:pt-0">
        {/* LEFT */}
        <div className="col-span-4 space-y-6 p-10 bg-gray-100">
          <div>
            <label className="block text-sm font-medium mb-2">Select Super Stockist</label>
            <select
              value={selectedSS}
              onChange={(e) => {
                setSelectedSS(e.target.value);
                const ssObj = ssUsers.find((ss) => ss.id === Number(e.target.value));
                setSelectedSSName(ssObj ? ssObj.party_name || ssObj.name : "");
              }}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">-- Select SS --</option>
              {ssUsers.map((ss) => (
                <option key={ss.id} value={ss.id}>
                  {ss.party_name || ss.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Search Product</label>
            <input
              type="text"
              value={searchTerm}
              ref={searchInputRef}
              onChange={(e) => { setSearchTerm(e.target.value); setHighlightIndex(-1); }}
              onKeyDown={handleKeyDown}
              placeholder="Type to search products..."
              className="border rounded px-3 py-2 w-full mb-2"
            />
            {searchTerm && (
              <div className="max-h-80 overflow-y-auto border rounded shadow bg-white">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((prod, index) => (
                    <div
                      key={prod.id ?? prod.product_id}
                      className={`px-3 py-2 cursor-pointer ${highlightIndex === index ? "bg-blue-100" : "hover:bg-gray-100"}`}
                      onClick={() => handleAddProduct(prod)}
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
        </div>

        {/* RIGHT */}
        <div className="col-span-8 p-4 bg-orange-50">
          {selectedSSName && (
            <div className="mb-4 p-2 bg-orange-100 rounded font-semibold">Party: {selectedSSName}</div>
          )}

          {selectedProducts.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200 text-sm text-left text-gray-700">
              <thead className="bg-orange-100 text-gray-900 text-sm font-semibold">
                <tr>
                  <th className="p-2 border">Product</th>
                  <th className="p-2 border">Cartoon</th>
                  <th className="p-2 border">Quantity</th>
                  <th className="p-2 border">Stock</th>
                  <th className="p-2 border">Price</th>
                  <th className="p-2 border">Total</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedProducts.map((p) => (
                  <tr key={p.id} className="divide-y">
                    <td className="p-2 border">{p.product_name}</td>
                    <td className="p-2 border">{p.cartoon_size}</td>
                    <td className="p-2 border">
                      <td className="border">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={p.quantity === 0 ? "" : p.quantity}
                          onChange={(e) => handleQuantityChange(p.id, e.target.value)}
                          className="w-20 border-none  px-3 text-center outline-none focus:outline-none focus:ring-0
"
                        />
                      </td>

                    </td>
                    <td className="p-2 border">{p.virtual_stock}</td>
                    <td className="p-2 border">{p.price}</td>
                    <td className="p-2 border">{p.price * p.quantity}</td>
                    <td className="p-2 border">
                      <button onClick={() => handleRemove(p.id)} className="text-red-500 hover:underline cursor-pointer">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {eligibleSchemes.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Eligible Schemes</h3>
              <ul className="list-disc ml-6">
                {eligibleSchemes.map((scheme) => (
                  <li key={scheme.id}>
                    {scheme.rewards.map((r) => `${r.quantity * getSchemeMultiplier(scheme)} ${r.product_name || r.product} Free`).join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end my-6">
            <p className="text-lg font-semibold">
              Total: ₹{selectedProducts.reduce((sum, p) => sum + (Number(p.price) || 0) * (p.quantity || 1), 0).toFixed(2)}
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-md cursor-pointer"
            >
              {isPlacingOrder ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center animate-fadeIn">
            <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-green-600 mb-2">Order Placed Successfully!</h3>
            <p className="text-gray-700 mb-2">Order ID: <span className="font-mono">{showSuccess}</span></p>
            <button onClick={() => { setShowSuccess(false); navigate("/crm/orders"); }} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 mx-auto">
              <FaBoxOpen /> Go to Orders
            </button>
          </div>
        </div>
      )}

      {isPlacingOrder && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50">
          <FaShoppingCart className="text-white text-6xl animate-bounce mb-4" />
          <p className="text-white text-lg animate-pulse">Placing your order...</p>
        </div>
      )}
    </div>
  );
}
