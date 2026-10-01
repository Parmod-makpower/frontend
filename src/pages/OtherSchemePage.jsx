import { useMahotsavSheet } from "../hooks/CRM/useMahotsav";
import { useMemo, useState } from "react";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import makpower_image from "../assets/images/makpower_image.webp";

import {
  FaPlaneDeparture,
  FaInfoCircle,
  FaGift,
  FaCalendarAlt,
  FaMapMarkedAlt,
  FaHeart,
  FaFilePdf,
  FaDownload,
} from "react-icons/fa";

import MobilePageHeader from "../components/MobilePageHeader";
import ProductCard from "../components/ProductCard";
import BackButton from "../Layout/BackButton";

import exportSchemePricePDF from "../utils/exportSchemePricePDF";

export default function OtherSchemePage() {
  const {
    data: allProducts = [],
    isLoading,
  } = useCachedProducts();

  const {
    selectedProducts,
    addProduct,
    updateQuantity,
    updateCartoon,
    cartoonSelection,
  } = useSelectedProducts();

  const { user } = useAuth();

  const navigate = useNavigate();

  const {
    data: samplingData = [],
  } = useMahotsavSheet();

  /* =========================================================
     PDF PRICE TYPE
  ========================================================= */

  const [pdfPriceType, setPdfPriceType] =
    useState("SS");

  /* =========================================================
     PARTY DATA
  ========================================================= */

  const partyMahotsavData =
    useMemo(() => {
      return samplingData.find(
        (row) =>
          row.party_name?.toLowerCase() ===
          user?.party_name?.toLowerCase()
      );
    }, [samplingData, user]);

  const achievedQty = Number(
    partyMahotsavData?.mahotsav_dispatch_quantity ||
      0
  );

  const TARGET_QTY = 3000;

  const earnedTrips = Math.floor(
    achievedQty / TARGET_QTY
  );

  const progressPercent = Math.min(
    (achievedQty / TARGET_QTY) * 100,
    100
  ).toFixed(0);

  const remainingQty = Math.max(
    TARGET_QTY - achievedQty,
    0
  );

  /* =========================================================
     MAHOTSAV PRODUCT IDS
  ========================================================= */

  const PRODUCT_IDS = [
    1335,
    1871,
    1321,
    1328,
    1327,
    685,
    76,
    73,
    79,
    1729,
    22,
    31,
    1215,
    21,
    16,
    1867,
    1868,
    17,
    239,
    1119,
    1125,
    186,
    1138,
    1140,
    1143,
    1141,
    1144,
    1139,
    1644,
    702,
    729,
    726,
    728,
    1873,
  ];

  /* =========================================================
     PRODUCTS
  ========================================================= */

  const products = useMemo(() => {
    return allProducts
      .filter(
        (p) => p.is_active
      )
      .filter(
        (p) =>
          PRODUCT_IDS.includes(
            p.product_id
          )
      )
      .sort((a, b) => {
        const priceA = Number(
          a.price || 0
        );

        const priceB = Number(
          b.price || 0
        );

        return priceA - priceB;
      });
  }, [allProducts]);

  /* =========================================================
     PDF DOWNLOAD
  ========================================================= */

  const handleDownloadSchemePDF = () => {
    if (!products.length) {
      window.alert(
        "No scheme products available."
      );

      return;
    }

    exportSchemePricePDF({
      products,
      priceType: pdfPriceType,
      filePrefix:
        pdfPriceType === "SS"
          ? "SS SCHEME PRICE"
          : pdfPriceType === "DS"
          ? "DISTRIBUTOR SCHEME PRICE"
          : "DEALER SCHEME PRICE",
    });
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading Mahotsav Products...
      </div>
    );
  }

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <MobilePageHeader title="International Trip" />

      {/* =====================================================
          HEADER
      ===================================================== */}

      {/* <div className="pt-[60px] sm:pt-0 px-2">
        <div className="hidden md:flex items-center gap-3 pb-3">
          <BackButton fallback="/" />

          <div>
            <h1 className="text-sm font-semibold text-slate-700">
              Goa Couple Trip
            </h1>

            <p className="text-[10px] text-slate-400">
              Mahotsav Scheme
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-3 text-white shadow-lg">
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

            {(user?.role === "CRM" ||
              user?.role === "ADMIN") && (
              <button
                onClick={() =>
                  navigate(
                    `/goa-trip-data`
                  )
                }
                className="bg-white/20 px-3 py-1 rounded-full text-[10px]"
              >
                Manage
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 text-[10px] mt-1">
            <FaCalendarAlt />

            <span>
              1 June 2026 – Ongoing
            </span>
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

         

          <div className="mt-4">
            <div className="flex justify-between text-[10px] mb-1">
              <span>
                Progress
              </span>

              <span>
                {progressPercent}%
              </span>
            </div>

            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-300 transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                }}
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
              <span>
                Trips Earned
              </span>

              <b>
                {earnedTrips}
              </b>
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
      </div> */}

      {/* =====================================================
          SCHEME PDF TOOLBAR
      ===================================================== */}

      {/* <div className="px-3 mt-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
           
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <FaFilePdf size={14} />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-700">
                  Scheme Price PDF
                </p>

                <p className="text-[10px] text-slate-400">
                  Download eligible scheme products
                </p>
              </div>
            </div>

           
            <div className="flex items-center gap-2">
            
              <select
                value={pdfPriceType}
                onChange={(e) =>
                  setPdfPriceType(
                    e.target.value
                  )
                }
                className="
                  h-9
                  rounded-lg
                  border
                  border-slate-200
                  bg-slate-50
                  px-3
                  text-[11px]
                  font-semibold
                  text-slate-700
                  outline-none
                  focus:border-red-400
                  focus:ring-2
                  focus:ring-red-100
                  cursor-pointer
                "
              >
                <option value="SS">
                  SS PRICE
                </option>

                <option value="DS">
                  DISTRIBUTOR PRICE
                </option>

                <option value="DLR">
                  DEALER PRICE
                </option>
              </select>

              
              <button
                type="button"
                onClick={
                  handleDownloadSchemePDF
                }
                disabled={!products.length}
                className="
                  h-9
                  px-3
                  rounded-lg
                  bg-[#fc250c]
                  hover:bg-[#e51f09]
                  disabled:bg-slate-300
                  disabled:cursor-not-allowed
                  text-white
                  text-[11px]
                  font-bold
                  flex
                  items-center
                  justify-center
                  gap-2
                  shadow-sm
                  transition-colors
                  active:scale-[0.98]
                "
              >
                <FaDownload size={11} />

                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div> */}

      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      <div className="px-3 mt-6 pt-[60px] sm:pt-0 px-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {products.map(
            (prod) => (
              <div
                key={prod.product_id}
                className="relative"
              >
                <ProductCard
                  prod={prod}
                  user={user}
                  selectedProducts={
                    selectedProducts
                  }
                  addProduct={
                    addProduct
                  }
                  updateQuantity={
                    updateQuantity
                  }
                  updateCartoon={
                    updateCartoon
                  }
                  cartoonSelection={
                    cartoonSelection
                  }
                  hasScheme={() => true}
                  cardWidth="w-full"
                />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}