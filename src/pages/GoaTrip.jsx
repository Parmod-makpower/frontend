// 📁 src/pages/MAHOTSAV.jsx
import { useMahotsavSheet } from "../hooks/CRM/useMahotsav";
import { useMemo } from "react";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import makpower_image from "../assets/images/makpower_image.webp"
import {
  FaPlaneDeparture,
  FaInfoCircle,
  FaGift,
  FaCalendarAlt,
  FaMapMarkedAlt,
  FaHeart,
} from "react-icons/fa";

import MobilePageHeader from "../components/MobilePageHeader";
import ProductCard from "../components/ProductCard";

export default function GoaTrip() {
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

  const achievedQty =
    Number(partyMahotsavData?.mahotsav_dispatch_quantity || 0);

  const TARGET_QTY = 3000;

  const earnedTrips = Math.floor(achievedQty / TARGET_QTY);

  const progressPercent = Math.min(
    (achievedQty / TARGET_QTY) * 100,
    100
  ).toFixed(0);

  const remainingQty = Math.max(
    TARGET_QTY - achievedQty,
    0
  );
  // ✅ Product IDs
  const PRODUCT_IDS = [
    685,1335, 1871, 1321, 1328, 1327,];



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
      <MobilePageHeader title="Goa Couple Trip" />

      {/* ================= HEADER ================= */}
      <div className="pt-[60px] sm:pt-0 px-2">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-3 text-white shadow-lg ">

          <div className="absolute top-0 right-0 opacity-10 text-[100px]">
            <FaMapMarkedAlt />
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <FaPlaneDeparture className="text-yellow-300 text-sm animate-pulse" />
              <h1 className="text-sm font-bold">
                Goa Couple Trip Scheme
              </h1>
            </div>

            {(user?.role === "CRM" || user?.role === "ADMIN") && (
              <button
                // onClick={() => navigate(`/goa-trip-data`)}
                className="bg-white/20 px-3 py-1 rounded-full text-[10px]"
              >
                Manage
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 text-[10px] mt-1">
            <FaCalendarAlt />
            <span>1 June 2026 – Ongoing</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">

            <div className="bg-white/20 rounded-lg p-3 text-center">
              <p className="text-[10px] uppercase tracking-wide">
                Target
              </p>
              <p className="font-bold text-lg">
                3000
              </p>
            </div>

            <div className="bg-white/20 rounded-lg p-3 text-center">
              <p className="text-[10px] uppercase tracking-wide">
                Achieved
              </p>
              <p className="font-bold text-lg">
                {achievedQty}
              </p>
            </div>

          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-[10px] mb-1">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>

            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-300 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-4 bg-white/20 rounded-lg p-3">

            <div className="flex items-center gap-2 mb-2">
              <FaHeart className="text-pink-200" />
              <span className="font-semibold">
                Couple Trip Reward
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Trips Earned</span>
              <b>{earnedTrips}</b>
            </div>

            {remainingQty > 0 && (
              <div className="mt-2 text-[11px]">
                {remainingQty} qty more required
              </div>
            )}
          </div>

          <p className="mt-3 text-[10px] flex items-center gap-1">
            <FaInfoCircle />
            Achieve 3000 combined qty from eligible products and get 1 Goa Couple Trip.
          </p>
        </div>
      </div>

      {/* ================= PRODUCTS ================= */}
      <div className="px-3 mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
          {products.map((prod) => (
            <div key={prod.product_id} className="relative">
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