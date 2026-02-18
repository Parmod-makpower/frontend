// 📁 src/pages/MAHOTSAV.jsx
import { useMahotsavSheet } from "../hooks/CRM/useMahotsav";
import { useMemo } from "react";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaFire, FaInfoCircle, FaConciergeBell, FaFireAlt, FaUtensils, FaGift, FaShoppingCart, FaCalendarAlt } from "react-icons/fa";
import makpower_image from "../assets/images/makpower_image.webp";
import MobilePageHeader from "../components/MobilePageHeader";
import { useStock } from "../context/StockContext";


export default function MAHOTSAV() {
  const { data: allProducts = [], isLoading } = useCachedProducts();
  const { selectedProducts, addProduct } = useSelectedProducts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getStockValue } = useStock();
  const { data: samplingData = [] } = useMahotsavSheet();

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



  // ✅ Mahotsav Products
  const PRODUCT_IDS = [
    101, 143, 141, 123, 74, 67, 73, 79, 76, 1215,
    31, 17, 28, 27, 14, 21, 16,
    1119, 1132, 1120, 1131, 1125, 1121, 1128, 1139,
    1644, 1144, 1729, 1726,1727, 
  ];

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading Mahotsav Products...</div>;
  }

  const products = allProducts.filter((p) =>
    PRODUCT_IDS.includes(p.product_id)
  );

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <MobilePageHeader title="Makpower Mahotsav" />
      {/* 🎉 Mahotsav Banner */}

      <div className="pt-[60px] sm:pt-0 px-2">
        <div className="
    relative overflow-hidden
    rounded-xl
    bg-gradient-to-br from-pink-500 via-fuchsia-600 to-rose-600
    p-3
    text-white
    shadow-lg
  ">
          <div className="absolute inset-0 bg-white/5 pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaFire className="text-yellow-300 animate-pulse text-sm" />
              <h1 className="text-sm font-bold tracking-wide">
                Mahotsav Scheme
              </h1>
            </div>

            {/* 🔐 CRM / ADMIN only button */}
            {(user?.role === "CRM" || user?.role === "ADMIN") && (
              <button
                onClick={() => {
                  navigate(`/mahotsav-data`)
                }}
                className="
        bg-white/20
        hover:bg-white/30
        border border-white/30
        text-white
        text-[10px]
        px-3 py-1
        rounded-full
        font-semibold
        transition
        active:scale-95
        cursor-pointer
      "
              >
                Manage
              </button>
            )}
          </div>

          {/* Date */}
          <div className="flex items-center gap-1 text-[10px] text-white/90 mt-[2px]">
            <FaCalendarAlt className="text-[10px]" />
            <span>1 Jan 2026 – 30 Apr 2026</span>
          </div>

          {/* 🧾 Party Summary */}
          <div className="mt-3 bg-white/15 backdrop-blur rounded-lg p-2.5">
            <p className="text-[11px] font-semibold text-yellow-200 truncate">
              {user?.party_name}
            </p>

            {/* Stats */}
            <div className="mt-2 grid grid-cols-2 gap-2">
              {/* Total Qty */}
              <div className="bg-white/20 rounded-lg px-3 py-2 text-center">
                <p className="text-[10px] text-white/80">
                  Total Purchase Qty
                </p>
                <p className="text-sm font-bold text-yellow-300 leading-tight">
                  {totalQty}
                </p>
                <p className="text-[9px] text-white/70">
                  Purchased from company
                </p>
              </div>

              {/* Combo */}
              <div className="bg-white/20 rounded-lg px-3 py-2 text-center">
                <p className="text-[10px] text-white/80">
                  Eligible Gift
                </p>
                <p className="text-sm font-bold text-green-300 leading-tight">
                  {combos}
                </p>
                <p className="text-[9px] text-white/70">
                  (300 Qty = 1 Gift)
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-3 bg-white/15 backdrop-blur rounded-lg px-2.5 py-2 text-[11px] leading-snug">
            <div className="flex items-start gap-1">
              <FaShoppingCart className="mt-[2px] text-yellow-200 text-xs" />
              <span>
                Buy <b className="text-yellow-200">300 Qty</b> of any Mahotsav Product
              </span>
            </div>

            <div className="flex items-start gap-1 mt-1">
              <FaGift className="mt-[2px] text-yellow-200 text-xs" />
              <span className="font-medium text-yellow-200">
                Get ANY 1 reward per Gift
              </span>
            </div>
          </div>

          {/* 🎁 Rewards */}
          <div className="mt-3 grid gap-2">

            <div className="flex justify-between items-center bg-white/20 rounded-lg px-3 py-2 text-[11px] font-medium backdrop-blur">
              <div className="flex items-center gap-2">
                <FaUtensils className="text-yellow-300 text-sm" />
                <span>Kitchen Cookware Set</span>
              </div>
              <span className="font-bold text-green-600 bg-white px-2 rounded">
                {cookware}
              </span>
            </div>

            <div className="flex justify-between items-center bg-white/20 rounded-lg px-3 py-2 text-[11px] font-medium backdrop-blur">
              <div className="flex items-center gap-2">
                <FaFireAlt className="text-yellow-300 text-sm" />
                <span>Gas Stove 4 Burner</span>
              </div>
              <span className="font-bold text-green-600 bg-white px-2 rounded">
                {gasStove}
              </span>
            </div>

            <div className="flex justify-between items-center bg-white/20 rounded-lg px-3 py-2 text-[11px] font-medium backdrop-blur">
              <div className="flex items-center gap-2">
                <FaConciergeBell className="text-yellow-300 text-sm" />
                <span>Steel Dinner Set (48 Pcs)</span>
              </div>
              <span className="font-bold text-green-600 bg-white px-2 rounded">
                {dinnerSet}
              </span>
            </div>

          </div>


          {/* Footer note */}
          <p className="mt-2 text-[10px] text-white/80 italic flex items-center gap-1">
            <FaInfoCircle className="text-[10px]" />
            Gift calculated on completed quantity only
          </p>
        </div>
      </div>



      {/* 📦 Product Grid */}
      <div className="px-3 mt-6">
        {products.length === 0 ? (
          <p className="text-center text-gray-500">No Mahotsav products found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
            {products.map((prod) => {
              const prodId = prod.id ?? prod.product_id;
              const isInCart = selectedProducts.some((p) => p.id === prodId);
              const stockValue = getStockValue(prod);
              const outOfStock = stockValue <= (prod.moq || 1);


              return (
                <div
                  key={prodId}
                  onClick={() => navigate(`/product/${prod.product_id}`)}
                  className="bg-white rounded-xl border shadow-sm hover:shadow-lg transition cursor-pointer overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative bg-white">
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-2 py-[2px] rounded-full">
                      Mahotsav
                    </span>

                    <img
                      src={
                        prod.image
                          ? `https://res.cloudinary.com/djyr368zj/${prod.image}`
                          : makpower_image
                      }
                      alt={prod.product_name}
                      className="w-full h-[140px] object-contain p-2"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <h3 className="text-xs font-semibold line-clamp-2 min-h-[32px]">
                      {prod.product_name}
                    </h3>

                    {/* Stock */}
                    <div className="flex items-center gap-1 mt-1">
                      {outOfStock ? (
                        <span className="text-red-600 text-[10px] flex items-center gap-1">
                          <FaTimesCircle /> Out of Stock
                        </span>
                      ) : (
                        <span className="text-green-600 text-[10px] flex items-center gap-1">
                          <FaCheckCircle /> In Stock
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <p className="text-blue-600 font-bold text-sm mt-1">
                      ₹{prod.price || 0}
                    </p>

                    {/* Scheme Hint */}
                    <p className="text-[10px] text-gray-500 mt-1">
                      Buy 300 Qty to achieve scheme
                    </p>

                    {/* Cart Button */}
                    {(user?.role === "SS" || user?.role === "DS") && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isInCart) addProduct({ ...prod, id: prodId }, 1);
                        }}
                        disabled={isInCart}
                        className={`w-full mt-3 text-white text-[11px] py-1.5 rounded-full font-semibold transition
                          ${isInCart
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 hover:opacity-90"
                          }`}
                      >
                        {isInCart ? "Added to Cart" : "Add to Cart"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
