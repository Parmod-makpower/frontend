// CRMCreateOrderPage.jsx
import { useState, useEffect, useRef } from "react";
import { useCachedSSUsers } from "../../auth/useSS";
import { all_active_inactive_product } from "../../hooks/all_active_inactive_product";
import { useSchemes } from "../../hooks/useSchemes";
import { useAuth } from "../../context/AuthContext";
import { usePlaceOrder } from "../../hooks/usePlaceOrder";
import { useSelectedProducts } from "../../hooks/useSelectedProducts";
import MobilePageHeader from "../../components/MobilePageHeader";
import ConfirmModal from "../../components/ConfirmModal";

export default function CRMCreateOrderPage() {
  const { user } = useAuth();
  const { data: ssUsers = [] } = useCachedSSUsers();
  const { data: allProducts = [] } = all_active_inactive_product();
  const { data: schemes = [] } = useSchemes();
  const placeOrderMutation = usePlaceOrder();

  // UI / state
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(null);
  const [ssSearch, setSsSearch] = useState("");
  const [showSSList, setShowSSList] = useState(false);
  const [selectedSS, setSelectedSS] = useState("");
  const [selectedSSName, setSelectedSSName] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const searchInputRef = useRef(null);

  // selectedProducts hook (shared state)
  const {
    selectedProducts,
    addProduct,
    updateQuantity,
    removeProduct,
    setSelectedProducts,
  } = useSelectedProducts();

  // Filtered SS list for suggestions
  const filteredSS = ssUsers.filter((ss) =>
    ss.party_name.toLowerCase().includes(ssSearch.toLowerCase())
  );

  // ---------- LocalStorage load on mount ----------
  useEffect(() => {
    const savedSS = localStorage.getItem("crm_selected_ss");
    const savedSSName = localStorage.getItem("crm_selected_ss_name");
    const savedProducts = localStorage.getItem("crm_selected_products");

    if (savedSS) setSelectedSS(savedSS);
    if (savedSSName) setSelectedSSName(savedSSName);

    if (savedProducts) {
      try {
        const parsedProducts = JSON.parse(savedProducts);
        // keep shape consistent with hook expectations
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

  // ---------- Sync to localStorage ----------
  useEffect(() => {
    localStorage.setItem("crm_selected_ss", selectedSS || "");
    localStorage.setItem("crm_selected_ss_name", selectedSSName || "");
    localStorage.setItem("crm_selected_products", JSON.stringify(selectedProducts || []));
  }, [selectedSS, selectedSSName, selectedProducts]);

  // ---------- Add product ----------
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
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  // ---------- Quantity change ----------
  const handleQuantityChange = (id, value) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    // Prefer updateQuantity if provided by hook
    if (typeof updateQuantity === "function") {
      updateQuantity(id, numericValue === "" ? "" : Number(numericValue));
      return;
    }
    // fallback: mutate selectedProducts directly
    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity: numericValue === "" ? "" : Number(numericValue) } : p))
    );
  };

  // ---------- Remove ----------
  const handleRemove = (id) => {
    if (typeof removeProduct === "function") {
      removeProduct(id);
      return;
    }
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // ---------- Keep virtual_stock in sync with allProducts ----------
  useEffect(() => {
    setSelectedProducts((prev) =>
      prev.map((p) => {
        const updated = allProducts.find((ap) => (ap.id ?? ap.product_id) === p.id);
        return { ...p, virtual_stock: updated?.virtual_stock ?? p.virtual_stock };
      })
    );
  }, [allProducts, setSelectedProducts]);

  // ---------- Scheme helpers ----------
  const getSchemeMultiplier = (scheme) =>
    Math.min(
      ...scheme.conditions.map((cond) => {
        const matched = selectedProducts.find(
          (p) => p.id === cond.product || p.product_name === cond.product_name
        );
        if (!matched) return 0;
        return Math.floor((Number(matched.quantity) || 0) / cond.min_quantity);
      })
    );

  const mergeRewards = (eligibleSchemes) => {
    const rewardMap = {};
    eligibleSchemes.forEach((scheme) => {
      const multiplier = getSchemeMultiplier(scheme);
      scheme.rewards.forEach((r) => {
        const productId = r.product ?? r.product_id;
        const productName = r.product_name || r.product;
        const totalQty = (r.quantity || 0) * (multiplier || 0);

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

  // ---------- Place order ----------
  const handlePlaceOrder = () => {
    if (!selectedSS) return alert("Please select a Super Stockist first!");
    if (!selectedProducts || selectedProducts.length === 0) return alert("Please add at least 1 product!");

    setIsPlacingOrder(true);
    const mergedRewards = mergeRewards(eligibleSchemes);

    const order = {
      user_id: selectedSS,
      crm_id: user?.id,
      items: selectedProducts.map((p) => ({
        id: p.id,
        quantity: p.quantity,
        price: Number(p.price) || 0,
        ss_virtual_stock: p.virtual_stock || 0,
      })),
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

        // show success (some apps expect order id)
        const orderId = data?.order?.order_id || data?.order?.id || null;
        setShowSuccess(orderId ? `Order placed: ${orderId}` : "Order placed successfully");
        setTimeout(() => setShowSuccess(null), 4000);
      },
      onError: (err) => {
        console.error("Place order failed:", err);
        setIsPlacingOrder(false);
        alert("Failed to place order");
      },
    });
  };

  // ---------- Product search helpers ----------
  const filteredProducts = allProducts.filter((p) =>
    p.product_name.toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (!filteredProducts) return;
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

  // ---------- small helpers ----------
  const formatCurrency = (v) => {
    if (v == null || isNaN(v)) return "0.00";
    return Number(v).toFixed(2);
  };

  // ---------- UI ----------
  return (
    <div className="mx-auto px-3 pb-24 max-w-6xl">
      <MobilePageHeader title="CRM Create Order" />

      {/* Success toast */}
      {showSuccess && (
        <div className="fixed top-[70px] left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-600 text-white px-4 py-2 rounded shadow-md">
            {showSuccess}
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-4 pt-[60px] sm:pt-2">
        {/* LEFT: selectors + search */}
        <div className="col-span-12 sm:col-span-4 space-y-6 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
          <div className="relative">
            <label className="block text-sm font-semibold mb-1">Select Super Stockist</label>
            <input
              type="text"
              value={ssSearch}
              onChange={(e) => {
                setSsSearch(e.target.value);
                setShowSSList(true);
              }}
              placeholder="Search Super Stockist..."
              className="border rounded-md px-3 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              autoComplete="off"
            />

            {/* SS suggestion */}
            {showSSList && ssSearch.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-56 overflow-y-auto z-50">
                {filteredSS.length > 0 ? (
                  filteredSS.map((ss) => (
                    <div
                      key={ss.id}
                      className="px-3 py-2 cursor-pointer hover:bg-blue-50"
                      onClick={() => {
                        setSelectedSS(ss.id);
                        setSelectedSSName(ss.party_name);
                        setSsSearch(ss.party_name);
                        setShowSSList(false);
                      }}
                    >
                      {ss.party_name}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500">No match found</div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Search Product</label>
            <input
              type="text"
              ref={searchInputRef}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHighlightIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type product name..."
              className="border rounded-md px-3 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />

            {/* Product suggestions */}
            {searchTerm && (
              <div className="max-h-64 overflow-y-auto border rounded-lg shadow bg-white mt-2">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((prod, index) => (
                    <div
                      key={prod.id ?? prod.product_id}
                      className={`px-3 py-2 cursor-pointer flex justify-between items-center ${highlightIndex === index ? "bg-blue-50" : "hover:bg-gray-100"}`}
                      onClick={() => handleAddProduct(prod)}
                    >
                      <div className="text-sm">{prod.product_name}</div>
                      <div className="text-xs text-gray-500">{prod.virtual_stock ?? "--"}</div>
                    </div>
                  ))
                ) : (
                  <p className="px-3 py-2 text-gray-500">No products found</p>
                )}
              </div>
            )}
          </div>

          {/* optional: quick actions or notes area */}
          <div className="pt-2">
            <p className="text-xs text-gray-500">Tip: Use arrow keys + Enter to add product quickly.</p>
          </div>
        </div>

        {/* RIGHT: table + schemes + totals */}
        <div className="col-span-12 sm:col-span-8 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
          {selectedSSName && (
            <div className="mb-4 p-2 bg-orange-50 rounded text-sm font-semibold">{`Party: ${selectedSSName}`}</div>
          )}

          {/* Table */}
          {selectedProducts && selectedProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left border-collapse">
                <thead className="bg-orange-50">
                  <tr>
                    <th className="p-2 border">Product</th>
                    <th className="p-2 border text-center">Cartoon</th>
                    <th className="p-2 border text-center">Qty</th>
                    <th className="p-2 border text-center">Stock</th>
                    <th className="p-2 border text-center">Price</th>
                    <th className="p-2 border text-center">Total</th>
                    <th className="p-2 border text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.map((p) => (
                    <tr key={p.id} className="odd:bg-white even:bg-gray-50">
                      <td className="p-2 border align-top">{p.product_name}</td>
                      <td className="p-2 border text-center">{p.cartoon_size ?? "--"}</td>

                      {/* quantity cell */}
                      <td className="p-2 border text-center">
                        <div className="inline-flex items-center space-x-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={p.quantity === 0 ? "" : p.quantity}
                            onChange={(e) => handleQuantityChange(p.id, e.target.value)}
                            className="w-16 border rounded px-2 py-1 text-center focus:outline-none"
                          />
                        </div>
                      </td>

                      <td className="p-2 border text-center">{p.virtual_stock ?? "--"}</td>
                      <td className="p-2 border text-center">₹{formatCurrency(p.price)}</td>
                      <td className="p-2 border text-center">₹{formatCurrency((Number(p.price) || 0) * (Number(p.quantity) || 0))}</td>
                      <td className="p-2 border text-center">
                        <button onClick={() => handleRemove(p.id)} className="text-red-600 hover:underline">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">No products added yet.</div>
          )}

          {/* Schemes */}
          {eligibleSchemes && eligibleSchemes.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 border rounded text-sm">
              <h3 className="font-semibold mb-2">Eligible Schemes</h3>
              <ul className="list-disc ml-5">
                {eligibleSchemes.map((scheme) => (
                  <li key={scheme.id}>
                    {scheme.conditions.map((c) => c.product_name || c.product).join(", ")} →{" "}
                    {scheme.rewards
                      .map((r) => `${(r.quantity || 0) * getSchemeMultiplier(scheme)} ${r.product_name || r.product}`)
                      .join(", ")}
                    {scheme.in_box && <span className="text-orange-600 font-semibold ml-2">(contains box)</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* total & submit */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-lg font-semibold">Total: ₹{formatCurrency(selectedProducts.reduce((sum, p) => sum + (Number(p.price) || 0) * (p.quantity || 1), 0))}</div>

            <div className="text-center sm:text-right">
              <button
                onClick={() => setShowConfirm(true)}
                disabled={isPlacingOrder}
                className={`inline-flex items-center gap-2 px-6 py-2 rounded-md text-white shadow-md ${
                  isPlacingOrder ? "bg-green-400 cursor-not-allowed" : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                }`}
              >
                {isPlacingOrder ? "Placing Order..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* confirm modal */}
      <ConfirmModal
        isOpen={showConfirm}
        title="Confirm Order"
        message="Are you sure you want to submit this order?"
        confirmText="Yes, Place Order"
        cancelText="No"
        confirmColor="bg-green-600 hover:bg-green-700"
        loading={isPlacingOrder}
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => {
          setShowConfirm(false);
          handlePlaceOrder();
        }}
      />
    </div>
  );
}
