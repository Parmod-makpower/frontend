// 📁 src/pages/SearchBarPage.jsx

import {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  memo,
} from "react";

import { IoChevronBack } from "react-icons/io5";
import { FaPlus, FaGift } from "react-icons/fa";

import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSchemes } from "../hooks/useSchemes";
import { FixedSizeList as List } from "react-window";
import useFuseSearch from "../hooks/useFuseSearch";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useStock } from "../context/StockContext";

/* =========================================================
   LOADER
========================================================= */

function Loader() {
  return (
    <div className="flex items-center justify-center py-10">
      <div
        className="
          h-6
          w-6
          animate-spin
          rounded-full
          border-4
          border-gray-200
          border-t-[#fc250c]
        "
      />
    </div>
  );
}

/* =========================================================
   NORMALIZE PRODUCT
========================================================= */

const normalizeProduct = (product) => ({
  ...product,
  id: product.id ?? product.product_id,
});

/* =========================================================
   SEARCH ROW
========================================================= */

const SearchRow = memo(function SearchRow({
  product,
  style,
  user,
  selectedItem,
  cartoonSelection,
  hasScheme,
  outOfStock,
  navigate,
  addProduct,
  updateQuantity,
  updateCartoon,
}) {
  const isDS = user?.role === "DS";

  const hasCartoon =
    selectedItem?.quantity_type === "CARTOON" && !isDS;

  const [localQty, setLocalQty] = useState(
    selectedItem?.quantity ?? ""
  );

  /* Sync quantity */

  useEffect(() => {
    setLocalQty(selectedItem?.quantity ?? "");
  }, [selectedItem?.quantity]);

  /* =======================================================
     ADD PRODUCT
  ======================================================= */

  const handleAdd = useCallback(() => {
    if (selectedItem) return;

    const moq = product.moq || 1;

    const initialQty = isDS
      ? 1
      : product.cartoon_size &&
          product.cartoon_size > 1
        ? product.cartoon_size
        : moq;

    addProduct({
      ...product,
      quantity: initialQty,
    });
  }, [
    selectedItem,
    product,
    isDS,
    addProduct,
  ]);

  /* =======================================================
     QUANTITY
  ======================================================= */

  const handleQuantityChange = useCallback(
    (event) => {
      setLocalQty(event.target.value);
    },
    []
  );

  const handleQuantityBlur = useCallback(() => {
    const parsed = parseInt(localQty, 10);

    /* DS */

    if (isDS) {
      if (!Number.isNaN(parsed)) {
        updateQuantity(product.id, parsed);
      }

      return;
    }

    /* SS / ASM */

    const moq = selectedItem?.moq || 1;

    if (
      Number.isNaN(parsed) ||
      parsed < moq
    ) {
      setLocalQty(moq);
      updateQuantity(product.id, moq);
    } else {
      updateQuantity(product.id, parsed);
    }
  }, [
    localQty,
    isDS,
    product.id,
    selectedItem?.moq,
    updateQuantity,
  ]);

  /* =======================================================
     CARTOON
  ======================================================= */

  const handleCartoonChange = useCallback(
    (event) => {
      updateCartoon(
        selectedItem.id,
        parseInt(event.target.value, 10)
      );
    },
    [
      selectedItem?.id,
      updateCartoon,
    ]
  );

  return (
    <div
      style={style}
      className="
        group
        flex
        items-center
        justify-between
        border-b
        border-gray-200
        bg-white
        px-3
        py-2
        transition-colors
        duration-150
        hover:bg-[#fffaf8]
      "
    >
      {/* =================================================
          LEFT SIDE
      ================================================= */}

      <div
        onClick={() =>
          navigate(`/product/${product.id}`)
        }
        className="
          flex
          min-w-0
          flex-grow
          cursor-pointer
          flex-col
          gap-1
          text-xs
          text-gray-700
          sm:text-sm
        "
      >
        {/* Product / Sale Name */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-2
            font-medium
            text-gray-800
          "
        >
          <span
            className="
              min-w-0
              truncate
              transition-colors
              duration-150
              group-hover:text-[#fc250c]
            "
          >
            {product._displayName}
          </span>

          {/* Stock */}

          {!outOfStock ? (
            <span
              className="
                shrink-0
                rounded
                bg-emerald-50
                px-1.5
                py-[2px]
                text-[9px]
                font-semibold
                text-emerald-600
              "
            >
              In Stock
            </span>
          ) : (
            <span
              className="
                shrink-0
                rounded
                bg-red-50
                px-1.5
                py-[2px]
                text-[9px]
                font-semibold
                text-red-500
              "
            >
              Out of Stock
            </span>
          )}

          {/* Scheme */}

          {hasScheme && (
            <span
              className="
                flex
                h-5
                w-5
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#fff1ee]
              "
            >
              <FaGift
                className="
                  text-[9px]
                  text-[#fc250c]
                  animate-pulse
                "
              />
            </span>
          )}
        </div>

        {/* Product */}

        <div
          className="
            truncate
            text-[11px]
            text-gray-500
            sm:text-xs
          "
        >
          Product: {product.product_name}
        </div>

        {/* Category */}

        <div
          className="
            truncate
            text-[11px]
            text-gray-400
            sm:text-xs
          "
        >
          {product.sub_category}
        </div>
      </div>

      {/* =================================================
          RIGHT SIDE
      ================================================= */}

      {(user?.role === "SS" ||
        user?.role === "DS" ||
        user?.role === "ASM") && (
        <div className="ml-3 shrink-0">
          {selectedItem ? (
            hasCartoon ? (
              <select
                value={
                  cartoonSelection[
                    selectedItem.id
                  ] || 1
                }
                onChange={handleCartoonChange}
                className="
                  h-8
                  rounded-lg
                  border
                  border-gray-200
                  bg-gray-50
                  px-2
                  text-[11px]
                  font-medium
                  text-gray-700
                  outline-none
                  transition-all
                  duration-200
                  focus:border-[#fc250c]
                  focus:ring-2
                  focus:ring-[#fc250c]/10
                  sm:h-9
                  sm:text-xs
                "
              >
                {Array.from(
                  { length: 100 },
                  (_, index) => index + 1
                ).map((number) => (
                  <option
                    key={number}
                    value={number}
                  >
                    {number} CTN
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                min={1}
                value={localQty}
                onChange={handleQuantityChange}
                onBlur={handleQuantityBlur}
                className="
                  h-8
                  w-20
                  rounded-lg
                  border
                  border-gray-200
                  bg-gray-50
                  px-2
                  py-1
                  text-center
                  text-sm
                  font-semibold
                  text-gray-700
                  outline-none
                  transition-all
                  duration-200
                  focus:border-[#fc250c]
                  focus:bg-white
                  focus:ring-2
                  focus:ring-[#fc250c]/10
                "
              />
            )
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-gradient-to-br
                from-[#ff7a00]
                to-[#fc250c]
                text-white
                shadow-[0_3px_10px_rgba(252,37,12,0.18)]
                transition-all
                duration-200
                hover:scale-105
                hover:shadow-[0_5px_14px_rgba(252,37,12,0.25)]
                active:scale-90
              "
            >
              <FaPlus className="text-xs" />
            </button>
          )}
        </div>
      )}
    </div>
  );
});

/* =========================================================
   PAGE
========================================================= */

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

  const searchRef = useRef(null);

  const navigate = useNavigate();

  const { getStockValue } = useStock();

  /* =======================================================
     PRODUCTS
  ======================================================= */

  const {
    data: allProductsRaw = [],
    isLoading,
  } = useCachedProducts();

  const { data: schemes = [] } = useSchemes();

  /* =======================================================
     AUTO FOCUS
  ======================================================= */

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  /* =======================================================
     EXCLUDED CATEGORIES
  ======================================================= */

  const excludedCategories = useMemo(
    () =>
      new Set([
        "speaker packing",
        "speaker pcb",
        "speaker housing",
      ]),
    []
  );

  /* =======================================================
     ACTIVE PRODUCTS
  ======================================================= */

  const allProducts = useMemo(() => {
    return allProductsRaw
      .map(normalizeProduct)
      .filter(
        (product) =>
          product.is_active === true
      )
      .filter((product) => {
        const category = String(
          product.sub_category || ""
        )
          .trim()
          .toLowerCase();

        return !excludedCategories.has(
          category
        );
      });
  }, [
    allProductsRaw,
    excludedCategories,
  ]);

  /* =======================================================
     FUSE SEARCH
  ======================================================= */

  const fuseResults = useFuseSearch(
    allProducts,
    searchTerm,
    {
      keys: [
        "sub_category",
        "product_name",
        "sale_names",
      ],
      threshold: 0.3,
    }
  );

  /* =======================================================
     SEARCH RESULTS
  ======================================================= */

  const searchResults = useMemo(() => {
    const unique = new Map();

    const lower = searchTerm
      .trim()
      .toLowerCase();

    fuseResults.forEach((product) => {
      const category = String(
        product.sub_category || ""
      )
        .trim()
        .toLowerCase();

      if (excludedCategories.has(category)) {
        return;
      }

      const matchedSale =
        Array.isArray(product.sale_names)
          ? product.sale_names.find((name) =>
              String(name)
                .toLowerCase()
                .includes(lower)
            )
          : null;

      const productName = String(
        product.product_name || ""
      ).toLowerCase();

      const subCategory = String(
        product.sub_category || ""
      ).toLowerCase();

      const match =
        productName.includes(lower) ||
        subCategory.includes(lower) ||
        Boolean(matchedSale);

      if (match) {
        unique.set(product.id, {
          ...product,
          _displayName:
            matchedSale ||
            product.product_name,
        });
      }
    });

    return Array.from(unique.values());
  }, [
    fuseResults,
    searchTerm,
    excludedCategories,
  ]);

  /* =======================================================
     SCHEME SET
  ======================================================= */

  const schemeProductIds = useMemo(() => {
    const ids = new Set();

    schemes.forEach((scheme) => {
      if (
        !Array.isArray(scheme.conditions)
      ) {
        return;
      }

      scheme.conditions.forEach(
        (condition) => {
          if (
            condition?.product != null
          ) {
            ids.add(condition.product);
          }
        }
      );
    });

    return ids;
  }, [schemes]);

  /* =======================================================
     SELECTED PRODUCT MAP
  ======================================================= */

  const selectedProductMap = useMemo(() => {
    const map = new Map();

    selectedProducts.forEach((product) => {
      map.set(product.id, product);
    });

    return map;
  }, [selectedProducts]);

  /* =======================================================
     ROW
  ======================================================= */

  const Row = useCallback(
    ({ index, style }) => {
      const product =
        searchResults[index];

      if (!product) return null;

      const normalizedProduct =
        normalizeProduct(product);

      const selectedItem =
        selectedProductMap.get(
          normalizedProduct.id
        );

      const currentStock =
        getStockValue(
          normalizedProduct
        );

      const outOfStock =
        currentStock <=
        (normalizedProduct.moq || 1);

      return (
        <SearchRow
          product={normalizedProduct}
          style={style}
          user={user}
          selectedItem={selectedItem}
          cartoonSelection={
            cartoonSelection
          }
          hasScheme={schemeProductIds.has(
            normalizedProduct.id
          )}
          outOfStock={outOfStock}
          navigate={navigate}
          addProduct={addProduct}
          updateQuantity={updateQuantity}
          updateCartoon={updateCartoon}
        />
      );
    },
    [
      searchResults,
      selectedProductMap,
      user,
      cartoonSelection,
      schemeProductIds,
      getStockValue,
      navigate,
      addProduct,
      updateQuantity,
      updateCartoon,
    ]
  );

  /* =======================================================
     SEARCH CHANGE
  ======================================================= */

  const handleSearchChange = useCallback(
    (event) => {
      setSearchTerm(event.target.value);
    },
    []
  );

  /* =======================================================
     BACK
  ======================================================= */

  const handleBack = useCallback(() => {
    window.history.back();
  }, []);

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div
      className="
        flex
        h-screen
        max-h-screen
        flex-col
        bg-white
      "
    >
      {/* =================================================
          TOP BAR
      ================================================= */}

      <div
        className="
          fixed
          left-0
          right-0
          top-0
          z-50
          flex
          items-center
          gap-2
          overflow-hidden
          border-b
          border-gray-200
          bg-white
          p-3
          shadow-sm
        "
      >
        {/* Back */}

        <button
          type="button"
          onClick={handleBack}
          className="
            flex
            h-9
            w-9
            flex-shrink-0
            items-center
            justify-center
            rounded-full
            text-2xl
            font-bold
            text-gray-700
            transition-all
            duration-200
            hover:bg-[#fff1ee]
            hover:text-[#fc250c]
            active:scale-90
          "
        >
          <IoChevronBack />
        </button>

        {/* Search */}

        <div
          className="
            flex
            min-w-0
            flex-1
            items-center
            rounded-lg
            border
            border-transparent
            bg-gray-50
            px-2
            transition-all
            duration-200
            focus-within:border-[#fc250c]/30
            focus-within:bg-white
            focus-within:ring-2
            focus-within:ring-[#fc250c]/10
          "
        >
          <input
            ref={searchRef}
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            maxLength={25}
            placeholder="Search by product, sale name, or category..."
            className="
              h-9
              w-full
              min-w-0
              flex-1
              bg-transparent
              text-base
              text-gray-700
              outline-none
              placeholder:text-gray-400
            "
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() =>
                setSearchTerm("")
              }
              className="
                flex
                h-6
                w-6
                flex-shrink-0
                items-center
                justify-center
                rounded-full
                bg-gray-200
                text-xs
                text-gray-500
                transition
                hover:bg-gray-300
                active:scale-90
              "
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* =================================================
          LIST
      ================================================= */}

      <div
        className="
          flex-1
          overflow-y-auto
          px-1
          pt-[60px]
          sm:px-2
        "
      >
        {isLoading ? (
          <Loader />
        ) : searchTerm.trim().length === 0 ? (
          <div
            className="
              py-10
              text-center
              text-gray-500
            "
          >
            <p className="text-sm font-medium">
              Search to see results
            </p>

            <p className="mt-1 text-[10px] text-gray-400">
              Product, sale name or category
            </p>
          </div>
        ) : searchResults.length === 0 ? (
          <div
            className="
              py-10
              text-center
              text-gray-500
            "
          >
            <p className="text-sm font-medium">
              No matching products found.
            </p>

            <p className="mt-1 text-[10px] text-gray-400">
              Try another search
            </p>
          </div>
        ) : (
          <List
            height={
              typeof window !==
              "undefined"
                ? window.innerHeight - 60
                : 500
            }
            itemCount={
              searchResults.length
            }
            itemSize={90}
            width="100%"
            itemKey={(index) =>
              searchResults[index]?.id ??
              index
            }
            overscanCount={5}
          >
            {Row}
          </List>
        )}
      </div>

      {/* =================================================
          SMOOTH ANIMATION
      ================================================= */}

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}