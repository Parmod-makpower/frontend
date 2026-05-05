// 📁 src/pages/MAHOTSAV.jsx
import { useMahotsavSheet } from "../hooks/CRM/useMahotsav";
import { useMemo } from "react";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import makpower_image from "../assets/images/makpower_image.webp"
import {
  FaFire,
  FaInfoCircle,
  FaConciergeBell,
  FaFireAlt,
  FaUtensils,
  FaGift,
  FaShoppingCart,
  FaCalendarAlt,
} from "react-icons/fa";

import MobilePageHeader from "../components/MobilePageHeader";
import ProductCard from "../components/ProductCard";

export default function MAHOTSAV() {
  const { data: allProducts = [], isLoading } = useCachedProducts();

  const {
    selectedProducts,
    addProduct,
    updateQuantity,
    updateCartoon,
    cartoonSelection,
  } = useSelectedProducts();

  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: samplingData = [] } = useMahotsavSheet();

  // ✅ Party Data
  const partyMahotsavData = useMemo(() => {
    return samplingData.find(
      (row) =>
        row.party_name?.toLowerCase() ===
        user?.party_name?.toLowerCase()
    );
  }, [samplingData, user]);

  const totalQty = partyMahotsavData?.mahotsav_dispatch_quantity || 0;

  const combos = Math.floor(totalQty / 300);
  const gasStove = Number(partyMahotsavData?.gas_stove || 0);
  const cookware = Number(partyMahotsavData?.kitchen_cookware || 0);
  const dinnerSet = Number(partyMahotsavData?.dinner_set || 0);

  // ✅ Product IDs
  const PRODUCT_IDS = [
    101, 143, 141, 123, 74, 67, 73, 79, 76, 1215,
    31, 17, 28, 27, 14, 21, 16, 1335, 1871, 6, 22,
    1119, 1132, 1120, 1131, 1125, 1121, 1128, 1139,
    1644, 1144, 1729, 1726, 1727, 1866, 1864, 1867, 1868, 1321,
  ];

  const GIFT_IDS = [1760, 1757, 1761];

  // ✅ Gift Products
  const giftProducts = useMemo(() => {
    return allProducts.filter((p) =>
      GIFT_IDS.includes(p.product_id)
    );
  }, [allProducts]);

  // ✅ Mahotsav Products
  const products = useMemo(() => {
    return allProducts
      .filter((p) => p.is_active)
      .filter((p) => PRODUCT_IDS.includes(p.product_id))
      .sort((a, b) => {
        const subCompare = (a.sub_category || "").localeCompare(b.sub_category || "");
        if (subCompare !== 0) return subCompare;

        return (a.product_name || "").localeCompare(b.product_name || "");
      });
  }, [allProducts]);

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading Mahotsav Products...</div>;
  }

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <MobilePageHeader title="Makpower Mahotsav" />

      {/* ================= HEADER ================= */}
      <div className="pt-[60px] sm:pt-0 px-2">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-500 via-fuchsia-600 to-rose-600 p-3 text-white shadow-lg">

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaFire className="text-yellow-300 animate-pulse text-sm" />
              <h1 className="text-sm font-bold">Mahotsav Scheme</h1>
            </div>

            {(user?.role === "CRM" || user?.role === "ADMIN") && (
              <button
                onClick={() => navigate(`/mahotsav-data`)}
                className="bg-white/20 px-3 py-1 rounded-full text-[10px]"
              >
                Manage
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 text-[10px] mt-1">
            <FaCalendarAlt />
            <span>1 Jan 2026 – At Present</span>
          </div>

          {/* Stats */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="bg-white/20 rounded p-2 text-center">
              <p className="text-[10px]">Total Qty</p>
              <p className="font-bold">{totalQty}</p>
            </div>

            <div className="bg-white/20 rounded p-2 text-center">
              <p className="text-[10px]">Eligible Gift</p>
              <p className="font-bold">{combos}</p>
            </div>
          </div>

          {/* Rewards */}
          <div className="mt-3 space-y-1 text-[11px]">
            <div className="flex justify-between bg-white/20 p-2 rounded">
              <span>Cookware</span>
              <b>{cookware}</b>
            </div>

            <div className="flex justify-between bg-white/20 p-2 rounded">
              <span>Gas Stove</span>
              <b>{gasStove}</b>
            </div>

            <div className="flex justify-between bg-white/20 p-2 rounded">
              <span>Dinner Set</span>
              <b>{dinnerSet}</b>
            </div>
          </div>

          <p className="mt-2 text-[10px] flex items-center gap-1">
            <FaInfoCircle /> Gift calculated on completed quantity only
          </p>
        </div>
      </div>

      {/* 🎁 Gift Items Section */}
      <div className="px-3 mt-6 sm:mx-100">


        {giftProducts.length === 0 ? (
          <p className="text-gray-500 text-xs">No gift items found.</p>
        ) : (
          <div className="grid grid-cols-3 gap-1 sm:gap-6">
            {giftProducts.map((prod) => (
              <div
                key={prod.product_id}
                className="bg-white rounded-xl border shadow-sm overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={
                      prod.image
                        ? `https://res.cloudinary.com/djyr368zj/${prod.image}`
                        : makpower_image
                    }
                    alt={prod.product_name}
                    className="w-full h-[120px] object-contain p-2"
                  />
                </div>

                <div className="p-2">
                  <h3 className="text-[11px] font-semibold line-clamp-2">
                    {prod.product_name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= PRODUCTS ================= */}
      <div className="px-3 mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
          {products.map((prod) => (
            <div key={prod.product_id} className="relative">

              {/* 🔥 Mahotsav Badge */}
              <span className="absolute z-10 top-2 left-2 bg-red-600 text-white text-[10px] px-2 py-[2px] rounded-full">
                Mahotsav
              </span>

              <ProductCard
                prod={prod}
                user={user}
                selectedProducts={selectedProducts}
                addProduct={addProduct}
                updateQuantity={updateQuantity}
                updateCartoon={updateCartoon}
                cartoonSelection={cartoonSelection}
                hasScheme={() => true} // optional highlight
                cardWidth="w-full"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}