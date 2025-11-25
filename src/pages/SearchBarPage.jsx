// 📁 src/pages/SearchBarPage.jsx
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { IoChevronBack } from "react-icons/io5";
import { FaPlus, FaGift } from "react-icons/fa";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSchemes } from "../hooks/useSchemes";
import { FixedSizeList as List } from "react-window";
import useFuseSearch from "../hooks/useFuseSearch";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSelectedProducts } from "../hooks/useSelectedProducts";

function Loader() {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="w-6 h-6 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
    </div>
  );
}

const normalizeProduct = (product) => ({
  ...product,
  id: product.id ?? product.product_id,
});

export default function SearchBarPage() {
  const { user } = useAuth();
  const {
    selectedProducts,
    addProduct,
    updateQuantity,
    updateCartoon,
    cartoonSelection,
  } = useSelectedProducts();

  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef();
  const navigate = useNavigate();
  const { data: allProductsRaw = [], isLoading } = useCachedProducts();
  const { data: schemes = [] } = useSchemes();

  // ✅ Auto focus searchbox
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const allProducts = useMemo(
    () => allProductsRaw.map(normalizeProduct),
    [allProductsRaw]
  );

  // ✅ Fuse search
  const fuseResults = useFuseSearch(allProducts, searchTerm, {
    keys: ["sub_category", "product_name", "sale_names"],
    threshold: 0.3,
  });

  // ✅ Remove duplicates
  const searchResults = useMemo(() => {
    const unique = new Map();
    const lower = searchTerm.toLowerCase();

    fuseResults.forEach((product) => {
      const matchedSale = product.sale_names?.find((n) =>
        n.toLowerCase().includes(lower)
      );

      const match =
        product.product_name?.toLowerCase().includes(lower) ||
        product.sub_category?.toLowerCase().includes(lower) ||
        !!matchedSale;

      if (match) {
        unique.set(product.id, {
          ...product,
          _displayName: matchedSale || product.product_name,
        });
      }
    });

    return Array.from(unique.values());
  }, [fuseResults, searchTerm]);

  const hasScheme = (productId) =>
    schemes.some(
      (scheme) =>
        Array.isArray(scheme.conditions) &&
        scheme.conditions.some((cond) => cond.product === productId)
    );

  const isAdded = (id) => selectedProducts.some((p) => p.id === id);

  const handleAddProduct = (product) => {
    if (!isAdded(product.id)) {
      const moq = product.moq || 1;
      const initialQty =
        product.cartoon_size && product.cartoon_size > 1
          ? product.cartoon_size
          : moq;

      addProduct({ ...product, quantity: initialQty });
    }
  };

  // ✅ FINAL FOCUS-FIXED ROW COMPONENT
  const Row = useCallback(
    ({ index, style }) => {
      const p = normalizeProduct(searchResults[index]);
      const selectedItem = selectedProducts.find((x) => x.id === p.id);
      const hasCartoon = selectedItem?.quantity_type === "CARTOON";

      // ✅ Local quantity (no global rerender on typing)
      const [localQty, setLocalQty] = useState(
        selectedItem?.quantity ?? ""
      );

      // ✅ Sync global → local
      useEffect(() => {
        setLocalQty(selectedItem?.quantity ?? "");
      }, [selectedItem?.quantity]);

      return (
        <div
          key={p.id}
          style={style}
          className="flex items-center justify-between px-3 py-2 border-b border-gray-300 hover:bg-gray-100 transition-all rounded-md"
        >
          {/* LEFT */}
          <div
            onClick={() => navigate(`/product/${p.id}`)}
            className="flex flex-col flex-grow gap-1 cursor-pointer text-xs sm:text-sm text-gray-700"
          >
            <div className="flex items-center gap-2 font-medium truncate text-gray-800">
              {p._displayName}

              {p.virtual_stock > (p.moq ?? 0) ? (
                <span className="bg-blue-100 text-blue-600 text-[10px] px-1 py-[1px] rounded">
                  In Stock
                </span>
              ) : (
                <span className="bg-red-100 text-red-600 text-[10px] px-1 py-[1px] rounded">
                  Out of Stock
                </span>
              )}

              {hasScheme(p.id) && (
                <FaGift className="text-pink-500 text-xs animate-pulse" />
              )}
            </div>

            <div className="text-gray-500 text-[11px] sm:text-xs">
              Product: {p.product_name}
            </div>
            <div className="text-gray-400 text-[11px] sm:text-xs">
              {p.sub_category}
            </div>
          </div>

          {/* RIGHT */}
          {(user?.role === "SS" || user?.role === "DS") && (
            <div className="ml-3 flex items-center">
              {selectedItem ? (
                hasCartoon ? (
                  <select
                    value={cartoonSelection[selectedItem.id] || 1}
                    onChange={(e) =>
                      updateCartoon(selectedItem.id, parseInt(e.target.value))
                    }
                    className="border rounded py-1 px-2 text-sm"
                  >
                    {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} CTN
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    min={1}
                    value={localQty}
                    onChange={(e) => setLocalQty(e.target.value)}
                    onBlur={() => {
                      const parsed = parseInt(localQty);
                      const moq = selectedItem.moq || 1;

                      if (isNaN(parsed) || parsed < moq) {
                        updateQuantity(p.id, moq);
                        setLocalQty(moq);
                      } else {
                        updateQuantity(p.id, parsed);
                      }
                    }}
                    className="w-20 border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                )
              ) : (
                p.sub_category !== "GIFT ITEM" &&
                p.sub_category !== "Z GIFT ITEM" && (
                  <button
                    onClick={() => handleAddProduct(p)}
                    className="bg-blue-100 p-3 rounded-full text-blue-600 hover:bg-blue-200 transition-all"
                  >
                    <FaPlus className="text-sm" />
                  </button>
                )
              )}
            </div>
          )}
        </div>
      );
    },
    [searchResults, selectedProducts, cartoonSelection]
  );

  return (
    <div className="flex flex-col h-screen max-h-screen bg-white">
      {/* TOP BAR */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white p-3 border-b border-gray-300 shadow flex items-center gap-2">
        <button
          onClick={() => window.history.back()}
          className="text-gray-700 hover:text-blue-600 text-2xl font-bold px-1 transition-transform hover:scale-105"
        >
          <IoChevronBack />
        </button>

        <input
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          maxLength={25}
          placeholder="Search by product, sale name, or category..."
          className="flex-1 bg-transparent text-sm sm:text-base focus:outline-none placeholder-gray-400"
        />
      </div>

      {/* LIST */}
      <div className="flex-1 pt-[60px] overflow-y-auto px-1 sm:px-2">
        {isLoading ? (
          <Loader />
        ) : searchTerm.trim().length === 0 ? (
          <p className="text-center text-gray-500 py-10">Search to see results</p>
        ) : searchResults.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No matching products found.
          </p>
        ) : (
          <List
            height={window.innerHeight - 100}
            itemCount={searchResults.length}
            itemSize={90}
            width={"100%"}
            itemKey={(index) => searchResults[index].id} // ✅ stable key
          >
            {Row}
          </List>
        )}
      </div>
    </div>
  );
}
