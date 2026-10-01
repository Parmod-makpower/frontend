// import { useMahotsavSheet } from "../hooks/CRM/useMahotsav";
// import { useMemo, useState } from "react";
// import { useCachedProducts } from "../hooks/useCachedProducts";
// import { useSelectedProducts } from "../hooks/useSelectedProducts";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// import makpower_image from "../assets/images/makpower_image.webp";

// import {
//   FaPlaneDeparture,
//   FaInfoCircle,
//   FaGift,
//   FaCalendarAlt,
//   FaMapMarkedAlt,
//   FaHeart,
//   FaFilePdf,
//   FaDownload,
// } from "react-icons/fa";

// import MobilePageHeader from "../components/MobilePageHeader";
// import ProductCard from "../components/ProductCard";
// import BackButton from "../Layout/BackButton";

// import exportSchemePricePDF from "../utils/exportSchemePricePDF";

// export default function OtherSchemePage() {
//   const {
//     data: allProducts = [],
//     isLoading,
//   } = useCachedProducts();

//   const {
//     selectedProducts,
//     addProduct,
//     updateQuantity,
//     updateCartoon,
//     cartoonSelection,
//   } = useSelectedProducts();

//   const { user } = useAuth();

//   const navigate = useNavigate();

//   const {
//     data: samplingData = [],
//   } = useMahotsavSheet();

//   /* =========================================================
//      PDF PRICE TYPE
//   ========================================================= */

//   const [pdfPriceType, setPdfPriceType] =
//     useState("SS");

//   /* =========================================================
//      PARTY DATA
//   ========================================================= */

//   const partyMahotsavData =
//     useMemo(() => {
//       return samplingData.find(
//         (row) =>
//           row.party_name?.toLowerCase() ===
//           user?.party_name?.toLowerCase()
//       );
//     }, [samplingData, user]);

//   const achievedQty = Number(
//     partyMahotsavData?.mahotsav_dispatch_quantity ||
//       0
//   );

//   const TARGET_QTY = 3000;

//   const earnedTrips = Math.floor(
//     achievedQty / TARGET_QTY
//   );

//   const progressPercent = Math.min(
//     (achievedQty / TARGET_QTY) * 100,
//     100
//   ).toFixed(0);

//   const remainingQty = Math.max(
//     TARGET_QTY - achievedQty,
//     0
//   );

//   /* =========================================================
//      MAHOTSAV PRODUCT IDS
//   ========================================================= */

//   const PRODUCT_IDS = [
//     1335,
//     1871,
//     1321,
//     1328,
//     1327,
//     685,
//     76,
//     73,
//     79,
//     1729,
//     22,
//     31,
//     1215,
//     21,
//     16,
//     1867,
//     1868,
//     17,
//     239,
//     1119,
//     1125,
//     186,
//     1138,
//     1140,
//     1143,
//     1141,
//     1144,
//     1139,
//     1644,
//     702,
//     729,
//     726,
//     728,
//     1873,
//   ];

//   /* =========================================================
//      PRODUCTS
//   ========================================================= */

//   const products = useMemo(() => {
//     return allProducts
//       .filter(
//         (p) => p.is_active
//       )
//       .filter(
//         (p) =>
//           PRODUCT_IDS.includes(
//             p.product_id
//           )
//       )
//       .sort((a, b) => {
//         const priceA = Number(
//           a.price || 0
//         );

//         const priceB = Number(
//           b.price || 0
//         );

//         return priceA - priceB;
//       });
//   }, [allProducts]);

//   /* =========================================================
//      PDF DOWNLOAD
//   ========================================================= */

//   const handleDownloadSchemePDF = () => {
//     if (!products.length) {
//       window.alert(
//         "No scheme products available."
//       );

//       return;
//     }

//     exportSchemePricePDF({
//       products,
//       priceType: pdfPriceType,
//       filePrefix:
//         pdfPriceType === "SS"
//           ? "SS SCHEME PRICE"
//           : pdfPriceType === "DS"
//           ? "DISTRIBUTOR SCHEME PRICE"
//           : "DEALER SCHEME PRICE",
//     });
//   };

//   /* =========================================================
//      LOADING
//   ========================================================= */

//   if (isLoading) {
//     return (
//       <div className="p-4 text-center text-gray-500">
//         Loading Mahotsav Products...
//       </div>
//     );
//   }

//   return (
//     <div className="pb-24 bg-gray-50 min-h-screen">
//       <MobilePageHeader title="International Trip" />

//       {/* =====================================================
//           HEADER
//       ===================================================== */}

//       {/* <div className="pt-[60px] sm:pt-0 px-2">
//         <div className="hidden md:flex items-center gap-3 pb-3">
//           <BackButton fallback="/" />

//           <div>
//             <h1 className="text-sm font-semibold text-slate-700">
//               Goa Couple Trip
//             </h1>

//             <p className="text-[10px] text-slate-400">
//               Mahotsav Scheme
//             </p>
//           </div>
//         </div>

//         <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-3 text-white shadow-lg">
//           <div className="absolute top-0 right-0 opacity-10 text-[100px]">
//             <FaMapMarkedAlt />
//           </div>

//           <div className="flex items-center justify-between relative z-10">
//             <div className="flex items-center gap-2">
//               <FaPlaneDeparture className="text-yellow-300 text-sm animate-pulse" />

//               <h1 className="text-sm font-bold">
//                 Goa Couple Trip Scheme
//               </h1>
//             </div>

//             {(user?.role === "CRM" ||
//               user?.role === "ADMIN") && (
//               <button
//                 onClick={() =>
//                   navigate(
//                     `/goa-trip-data`
//                   )
//                 }
//                 className="bg-white/20 px-3 py-1 rounded-full text-[10px]"
//               >
//                 Manage
//               </button>
//             )}
//           </div>

//           <div className="flex items-center gap-1 text-[10px] mt-1">
//             <FaCalendarAlt />

//             <span>
//               1 June 2026 – Ongoing
//             </span>
//           </div>

//           <div className="mt-4 grid grid-cols-2 gap-2">
//             <div className="bg-white/20 rounded-lg p-3 text-center">
//               <p className="text-[10px] uppercase tracking-wide">
//                 Target
//               </p>

//               <p className="font-bold text-lg">
//                 3000
//               </p>
//             </div>

//             <div className="bg-white/20 rounded-lg p-3 text-center">
//               <p className="text-[10px] uppercase tracking-wide">
//                 Achieved
//               </p>

//               <p className="font-bold text-lg">
//                 {achievedQty}
//               </p>
//             </div>
//           </div>

         

//           <div className="mt-4">
//             <div className="flex justify-between text-[10px] mb-1">
//               <span>
//                 Progress
//               </span>

//               <span>
//                 {progressPercent}%
//               </span>
//             </div>

//             <div className="h-3 bg-white/20 rounded-full overflow-hidden">
//               <div
//                 className="h-full bg-yellow-300 transition-all duration-500"
//                 style={{
//                   width: `${progressPercent}%`,
//                 }}
//               />
//             </div>
//           </div>

//           <div className="mt-4 bg-white/20 rounded-lg p-3">
//             <div className="flex items-center gap-2 mb-2">
//               <FaHeart className="text-pink-200" />

//               <span className="font-semibold">
//                 Couple Trip Reward
//               </span>
//             </div>

//             <div className="flex justify-between text-sm">
//               <span>
//                 Trips Earned
//               </span>

//               <b>
//                 {earnedTrips}
//               </b>
//             </div>

//             {remainingQty > 0 && (
//               <div className="mt-2 text-[11px]">
//                 {remainingQty} qty more required
//               </div>
//             )}
//           </div>

//           <p className="mt-3 text-[10px] flex items-center gap-1">
//             <FaInfoCircle />

//             Achieve 3000 combined qty from eligible products and get 1 Goa Couple Trip.
//           </p>
//         </div>
//       </div> */}

//       {/* =====================================================
//           SCHEME PDF TOOLBAR
//       ===================================================== */}

//       {/* <div className="px-3 mt-4">
//         <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-3">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
           
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
//                 <FaFilePdf size={14} />
//               </div>

//               <div>
//                 <p className="text-xs font-bold text-slate-700">
//                   Scheme Price PDF
//                 </p>

//                 <p className="text-[10px] text-slate-400">
//                   Download eligible scheme products
//                 </p>
//               </div>
//             </div>

           
//             <div className="flex items-center gap-2">
            
//               <select
//                 value={pdfPriceType}
//                 onChange={(e) =>
//                   setPdfPriceType(
//                     e.target.value
//                   )
//                 }
//                 className="
//                   h-9
//                   rounded-lg
//                   border
//                   border-slate-200
//                   bg-slate-50
//                   px-3
//                   text-[11px]
//                   font-semibold
//                   text-slate-700
//                   outline-none
//                   focus:border-red-400
//                   focus:ring-2
//                   focus:ring-red-100
//                   cursor-pointer
//                 "
//               >
//                 <option value="SS">
//                   SS PRICE
//                 </option>

//                 <option value="DS">
//                   DISTRIBUTOR PRICE
//                 </option>

//                 <option value="DLR">
//                   DEALER PRICE
//                 </option>
//               </select>

              
//               <button
//                 type="button"
//                 onClick={
//                   handleDownloadSchemePDF
//                 }
//                 disabled={!products.length}
//                 className="
//                   h-9
//                   px-3
//                   rounded-lg
//                   bg-[#fc250c]
//                   hover:bg-[#e51f09]
//                   disabled:bg-slate-300
//                   disabled:cursor-not-allowed
//                   text-white
//                   text-[11px]
//                   font-bold
//                   flex
//                   items-center
//                   justify-center
//                   gap-2
//                   shadow-sm
//                   transition-colors
//                   active:scale-[0.98]
//                 "
//               >
//                 <FaDownload size={11} />

//                 Download PDF
//               </button>
//             </div>
//           </div>
//         </div>
//       </div> */}

//       {/* =====================================================
//           PRODUCTS
//       ===================================================== */}

//       <div className="px-3 mt-6 pt-[60px] sm:pt-0 px-2">
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
//           {products.map(
//             (prod) => (
//               <div
//                 key={prod.product_id}
//                 className="relative"
//               >
//                 <ProductCard
//                   prod={prod}
//                   user={user}
//                   selectedProducts={
//                     selectedProducts
//                   }
//                   addProduct={
//                     addProduct
//                   }
//                   updateQuantity={
//                     updateQuantity
//                   }
//                   updateCartoon={
//                     updateCartoon
//                   }
//                   cartoonSelection={
//                     cartoonSelection
//                   }
//                   hasScheme={() => true}
//                   cardWidth="w-full"
//                 />
//               </div>
//             )
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



import { useMahotsavSheet } from "../hooks/CRM/useMahotsav";
import { useEffect, useMemo, useState } from "react";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  FaPlaneDeparture,
  FaInfoCircle,
  FaGift,
  FaCalendarAlt,
  FaGlobeAsia,
  FaFilePdf,
  FaDownload,
  FaArrowRight,
  FaMoon,
  FaSun,
  FaTrophy,
  FaBullseye,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";

import MobilePageHeader from "../components/MobilePageHeader";
import ProductCard from "../components/ProductCard";
import BackButton from "../Layout/BackButton";
import exportSchemePricePDF from "../utils/exportSchemePricePDF";

/* =========================================================
   CONSTANTS
========================================================= */

const TARGET_QTY = 4500;

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

const DESTINATIONS = [
  {
    id: "thailand",
    name: "THAILAND",
    subtitle: "Thailand International Trip",
    target: "2,500",
    reward: "₹42,000",
    badge: "STARTER REWARD",
    icon: "🇹🇭",
    gradient:
      "from-sky-500 via-blue-600 to-indigo-700",
  },
  {
    id: "malaysia",
    name: "MALAYSIA",
    subtitle: "Malaysia International Trip",
    target: "4,000",
    reward: "₹65,000",
    badge: "PREMIUM REWARD",
    icon: "🇲🇾",
    gradient:
      "from-orange-400 via-orange-500 to-red-600",
  },
  {
    id: "singapore",
    name: "SINGAPORE",
    subtitle: "Singapore International Trip",
    target: "4,500",
    reward: "₹75,000",
    badge: "ELITE REWARD",
    icon: "🇸🇬",
    gradient:
      "from-violet-500 via-indigo-600 to-purple-700",
  },
];

/* =========================================================
   HELPERS
========================================================= */

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN");

/* =========================================================
   PROGRESS CARD
========================================================= */

function ProgressCard({
  achievedQty,
  progressPercent,
  remainingQty,
}) {
  return (
    <div
      className="
        w-full
        rounded-2xl
        border
        border-white/15
        bg-white/10
        p-4
        shadow-sm
        backdrop-blur-sm
        sm:p-5
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.16em]
              text-white/65
            "
          >
            Your Progress
          </p>

          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-white sm:text-3xl">
              {formatNumber(achievedQty)}
            </span>

            <span className="text-sm font-semibold text-white/45">
              / {formatNumber(TARGET_QTY)}
            </span>
          </div>
        </div>

        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-white/15
            text-yellow-200
            transition-transform
            duration-300
            hover:scale-105
          "
        >
          <FaTrophy size={17} />
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[9px] font-semibold text-white/65">
            Target Progress
          </span>

          <span className="text-[10px] font-black text-white">
            {progressPercent}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-black/10">
          <div
            className="
              h-full
              rounded-full
              bg-white
              shadow-[0_0_10px_rgba(255,255,255,0.35)]
              transition-[width]
              duration-700
              ease-out
            "
            style={{
              width: `${progressPercent}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[9px] text-white/60">
        <span>
          {remainingQty > 0
            ? `${formatNumber(remainingQty)} qty remaining`
            : "Target achieved"}
        </span>

        <span className="font-semibold text-white/75">
          1 trip / target
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   DESTINATION CARD
========================================================= */

function DestinationCard({
  destination,
  delay = 0,
}) {
  return (
    <article
      data-scheme-reveal
      style={{
        transitionDelay: `${delay}ms`,
      }}
      className={`
        group
        relative
        overflow-hidden
        rounded-2xl
        bg-gradient-to-br
        ${destination.gradient}
        p-3
        text-white
        shadow-sm
        transition-all
        duration-300
        ease-out
        hover:-translate-y-1
        hover:shadow-xl
        active:scale-[0.985]
        sm:p-3.5
      `}
    >
      <div
        className="
          pointer-events-none
          absolute
          -right-8
          -top-8
          h-24
          w-24
          rounded-full
          bg-white/10
          transition-transform
          duration-500
          group-hover:scale-150
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-10
          left-1/2
          h-20
          w-20
          rounded-full
          bg-white/[0.06]
          transition-transform
          duration-500
          group-hover:scale-125
        "
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span
              className="
                inline-flex
                rounded-full
                bg-white/15
                px-2
                py-1
                text-[7px]
                font-black
                tracking-[0.08em]
                backdrop-blur-sm
                sm:text-[8px]
              "
            >
              {destination.badge}
            </span>

            <h3
              className="
                mt-1.5
                text-lg
                font-black
                tracking-wide
                sm:text-xl
              "
            >
              {destination.name}
            </h3>

            <p className="truncate text-[9px] text-white/75 sm:text-[10px]">
              {destination.subtitle}
            </p>
          </div>

          {/* FLAGS PRESERVED */}
          <span
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-white/15
              text-lg
              backdrop-blur-sm
              transition-transform
              duration-300
              group-hover:rotate-6
              group-hover:scale-110
            "
          >
            {destination.icon}
          </span>
        </div>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <span
            className="
              inline-flex
              items-center
              gap-1
              rounded-full
              bg-black/15
              px-2
              py-1
              text-[8px]
              font-bold
            "
          >
            <FaMoon size={7} />
            3 Nights
          </span>

          <span
            className="
              inline-flex
              items-center
              gap-1
              rounded-full
              bg-black/15
              px-2
              py-1
              text-[8px]
              font-bold
            "
          >
            <FaSun size={7} />
            4 Days
          </span>
        </div>

        <div
          className="
            mt-2.5
            rounded-xl
            bg-white
            p-2.5
            text-slate-800
            shadow-sm
            transition-transform
            duration-300
            group-hover:scale-[1.01]
          "
        >
          <div className="grid grid-cols-2 divide-x divide-slate-200">
            <div className="pr-2">
              <p
                className="
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-400
                "
              >
                Required Purchase
              </p>

              <p className="mt-0.5 text-base font-black text-slate-900 sm:text-lg">
                {destination.target}

                <span className="ml-1 text-[8px] font-bold text-slate-400">
                  PCS
                </span>
              </p>
            </div>

            <div className="pl-2">
              <p
                className="
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-slate-400
                "
              >
                OR GET
              </p>

              <p className="mt-0.5 text-base font-black text-[#fc250c] sm:text-lg">
                {destination.reward}
              </p>

              <p className="text-[7px] text-slate-400">
                Discount
              </p>
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-[8px] font-semibold text-white/70">
            View scheme
          </span>

          <span
            className="
              flex
              h-6
              w-6
              items-center
              justify-center
              rounded-full
              bg-white/15
              transition-all
              duration-300
              group-hover:translate-x-0.5
              group-hover:bg-white/25
            "
          >
            <FaArrowRight size={8} />
          </span>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

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

  const { data: samplingData = [] } =
    useMahotsavSheet();

  const [pdfPriceType, setPdfPriceType] =
    useState("SS");

  /* =========================================================
     LIGHTWEIGHT SCROLL REVEAL
  ========================================================= */

  useEffect(() => {
    const nodes = document.querySelectorAll(
      "[data-scheme-reveal]"
    );

    if (!nodes.length) return;

    if (
      typeof window === "undefined" ||
      !("IntersectionObserver" in window)
    ) {
      nodes.forEach((node) =>
        node.classList.add("scheme-visible")
      );

      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add(
                "scheme-visible"
              );

              observer.unobserve(
                entry.target
              );
            }
          });
        },
        {
          threshold: 0.06,
          rootMargin:
            "0px 0px -24px 0px",
        }
      );

    nodes.forEach((node) =>
      observer.observe(node)
    );

    return () =>
      observer.disconnect();
  }, [allProducts.length]);

  /* =========================================================
     ROLE
  ========================================================= */

  const role = String(
    user?.role ?? ""
  ).toUpperCase();

  const isAdminOrCRM =
    role === "ADMIN" || role === "CRM";

  const isSS = role === "SS";
  const isDS = role === "DS";

  const activePdfPriceType = isSS
    ? "SS"
    : isDS
    ? "DS"
    : pdfPriceType;

  /* =========================================================
     PARTY PROGRESS
  ========================================================= */

  const partyMahotsavData = useMemo(() => {
    const partyName = String(
      user?.party_name ?? ""
    )
      .trim()
      .toLowerCase();

    if (!partyName) return null;

    return samplingData.find(
      (row) =>
        String(row?.party_name ?? "")
          .trim()
          .toLowerCase() === partyName
    );
  }, [
    samplingData,
    user?.party_name,
  ]);

  const achievedQty = Number(
    // partyMahotsavData?.mahotsav_dispatch_quantity ||
    //   0
  );

  const progressPercent = Math.min(
    Math.round(
      (achievedQty / TARGET_QTY) * 100
    ),
    100
  );

  const remainingQty = Math.max(
    TARGET_QTY - achievedQty,
    0
  );

  const earnedTrips = Math.floor(
    achievedQty / TARGET_QTY
  );

  /* =========================================================
     PRODUCTS
  ========================================================= */

  const products = useMemo(() => {
    return allProducts
      .filter(
        (product) =>
          product?.is_active
      )
      .filter((product) =>
        PRODUCT_IDS.includes(
          Number(product?.product_id)
        )
      )
      .sort(
        (a, b) =>
          Number(a?.price || 0) -
          Number(b?.price || 0)
      );
  }, [allProducts]);

  /* =========================================================
     PDF
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
      priceType: activePdfPriceType,
      filePrefix:
        activePdfPriceType === "SS"
          ? "SS INTERNATIONAL SCHEME PRICE"
          : activePdfPriceType === "DS"
          ? "DISTRIBUTOR INTERNATIONAL SCHEME PRICE"
          : "DEALER INTERNATIONAL SCHEME PRICE",
    });
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb]">
        <div className="text-center">
          <div
            className="
              mx-auto
              h-7
              w-7
              animate-spin
              rounded-full
              border-2
              border-slate-200
              border-t-[#d20b25]
            "
          />

          <p className="mt-2 text-xs font-medium text-slate-500">
            Loading scheme...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] pb-20">

      {/* =====================================================
          LIGHTWEIGHT ANIMATION ONLY
      ===================================================== */}

      <style>{`
        [data-scheme-reveal] {
          opacity: 0;
          translate: 0 10px;
          transition:
            opacity 380ms cubic-bezier(.22,1,.36,1),
            translate 380ms cubic-bezier(.22,1,.36,1);
        }

        [data-scheme-reveal].scheme-visible {
          opacity: 1;
          translate: 0 0;
        }

        @media (prefers-reduced-motion: reduce) {
          [data-scheme-reveal] {
            opacity: 1 !important;
            translate: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* =====================================================
          MOBILE PAGE HEADER
      ===================================================== */}

      <MobilePageHeader title="International Scheme" />

      {/* =====================================================
          DESKTOP HEADER
      ===================================================== */}

      <div
        className="
          sticky
          top-0
          z-30
          hidden
          border-b
          border-slate-200/80
          bg-white/95
          backdrop-blur-md
          md:block
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-[1500px]
            items-center
            justify-between
            gap-4
            px-5
            py-3
          "
        >
          <div className="flex items-center gap-3">
            <BackButton fallback="/" />

            <div>
              <h1 className="text-sm font-bold text-slate-800">
                International Rewards
              </h1>

              <p className="text-[10px] text-slate-400">
                Explore your international trip scheme
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">

            {isAdminOrCRM && (
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
                  bg-white
                  px-3
                  text-[10px]
                  font-bold
                  text-slate-700
                  outline-none
                  transition
                  focus:border-[#d20b25]
                  focus:ring-2
                  focus:ring-red-100
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
            )}

            {(isAdminOrCRM ||
              isSS ||
              isDS) && (
              <button
                type="button"
                onClick={
                  handleDownloadSchemePDF
                }
                disabled={!products.length}
                className="
                  flex
                  h-9
                  items-center
                  gap-1.5
                  rounded-lg
                  bg-[#d20b25]
                  px-3
                  text-[10px]
                  font-bold
                  text-white
                  shadow-sm
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:bg-[#b9081f]
                  active:scale-95
                  disabled:cursor-not-allowed
                  disabled:bg-slate-300
                "
              >
                <FaDownload size={10} />
                PDF
              </button>
            )}

            {isAdminOrCRM && (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/goa-trip-data"
                  )
                }
                className="
                  h-9
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  px-3
                  text-[10px]
                  font-bold
                  text-slate-600
                  transition
                  hover:border-red-200
                  hover:text-[#d20b25]
                "
              >
                Manage
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          MOBILE ACTION BAR
      ===================================================== */}

      {/* <div
        className="
          sticky
          top-[60px]
          z-30
          border-b
          border-slate-200
          bg-white/95
          px-3
          py-2
          backdrop-blur-md
          md:hidden
        "
      >
        <div className="flex items-center gap-2">

          {isAdminOrCRM && (
            <select
              value={pdfPriceType}
              onChange={(e) =>
                setPdfPriceType(
                  e.target.value
                )
              }
              className="
                h-9
                min-w-0
                flex-1
                rounded-lg
                border
                border-slate-200
                bg-slate-50
                px-2
                text-[9px]
                font-bold
                text-slate-700
                outline-none
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
          )}

          {(isAdminOrCRM ||
            isSS ||
            isDS) && (
            <button
              type="button"
              onClick={
                handleDownloadSchemePDF
              }
              disabled={!products.length}
              className="
                flex
                h-9
                items-center
                justify-center
                gap-1.5
                rounded-lg
                bg-[#d20b25]
                px-3
                text-[9px]
                font-bold
                text-white
                transition
                active:scale-95
                disabled:bg-slate-300
              "
            >
              <FaFilePdf size={11} />
              PDF
            </button>
          )}

          {isAdminOrCRM && (
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/goa-trip-data"
                )
              }
              className="
                h-9
                rounded-lg
                border
                border-slate-200
                bg-white
                px-3
                text-[9px]
                font-bold
                text-slate-600
                active:scale-95
              "
            >
              Manage
            </button>
          )}
        </div>
      </div> */}

      <main className="mx-auto max-w-[1500px]">

        {/* ===================================================
            HERO
        =================================================== */}

        <section
          data-scheme-reveal
          className="
            relative
            mt-0
            overflow-hidden
            bg-gradient-to-br
            from-[#9e071c]
            via-[#d20b25]
            to-[#f2631f]
            md:mx-auto
            md:mt-5
            md:max-w-[1500px]
            md:rounded-2xl
            md:shadow-[0_16px_45px_rgba(159,7,28,0.18)]
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              h-64
              w-64
              rounded-full
              bg-white/[0.08]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-28
              left-[35%]
              h-72
              w-72
              rounded-full
              bg-orange-200/[0.08]
            "
          />

          <div
            className="
              relative
              grid
              items-center
              gap-7
              px-4
              py-7
              sm:px-6
              sm:py-9
              lg:grid-cols-[1.1fr_0.9fr]
              lg:gap-12
              lg:px-9
              lg:py-10
            "
          >

            {/* HERO CONTENT */}

            <div className="max-w-2xl">

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/15
                  bg-white/10
                  px-3
                  py-1.5
                  backdrop-blur-sm
                "
              >
                <FaPlaneDeparture
                  size={10}
                  className="text-orange-100"
                />

                <span
                  className="
                    text-[8px]
                    font-black
                    uppercase
                    tracking-[0.18em]
                    text-white/80
                    sm:text-[9px]
                  "
                >
                  International Trip Scheme
                </span>
              </div>

              <h2
                className="
                  mt-4
                  max-w-[650px]
                  text-[34px]
                  font-black
                  leading-[1.02]
                  tracking-[-0.045em]
                  text-white
                  sm:text-5xl
                  lg:text-[54px]
                "
              >
                Explore the
                <br />

                <span className="text-orange-100">
                  World.
                </span>
              </h2>

              <p
                className="
                  mt-3
                  max-w-xl
                  text-xs
                  leading-5
                  text-white/70
                  sm:text-sm
                  sm:leading-6
                "
              >
                Turn your eligible purchases into
                unforgettable international travel
                experiences with MAKPOWER.
              </p>

              {/* DATE INSIDE HERO */}

              <div
                className="
                  mt-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/10
                  bg-white/10
                  px-3
                  py-2
                  text-[9px]
                  font-bold
                  text-white
                  backdrop-blur-sm
                "
              >
                <FaCalendarAlt
                  size={9}
                  className="text-orange-100"
                />

                <span>
                  1 October 2026 – 31 December 2026
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">

                <div
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    bg-black/10
                    px-3
                    py-1.5
                    text-[9px]
                    font-bold
                    text-white
                    backdrop-blur-sm
                  "
                >
                  <FaClock size={9} />
                  3 Nights
                </div>

                <div
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    bg-black/10
                    px-3
                    py-1.5
                    text-[9px]
                    font-bold
                    text-white
                    backdrop-blur-sm
                  "
                >
                  <FaSun size={9} />
                  4 Days
                </div>

                <div
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    bg-black/10
                    px-3
                    py-1.5
                    text-[9px]
                    font-bold
                    text-white
                    backdrop-blur-sm
                  "
                >
                  <FaGlobeAsia size={9} />
                  Global Destinations
                </div>
              </div>
            </div>

            {/* PROGRESS */}

            <div className="lg:justify-self-end lg:w-full lg:max-w-[410px]">
              <ProgressCard
                achievedQty={achievedQty}
                progressPercent={progressPercent}
                remainingQty={remainingQty}
              />
            </div>
          </div>
        </section>

        {/* ===================================================
            STATS
        =================================================== */}

        <section
          data-scheme-reveal
          className="
            mx-auto
            max-w-[1500px]
            px-3
            pt-4
            sm:px-5
            lg:px-7
          "
        >
          <div
            className="
              grid
              grid-cols-2
              gap-2
              sm:grid-cols-4
              sm:gap-3
            "
          >

            {/* TARGET */}

            <div
              data-scheme-reveal
              style={{
                transitionDelay: "0ms",
              }}
              className="
                rounded-xl
                border
                border-blue-100
                bg-blue-50/60
                p-3
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:shadow-sm
              "
            >
              <div className="flex items-center gap-2">
                <div
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-white
                    text-blue-600
                    shadow-sm
                  "
                >
                  <FaBullseye size={13} />
                </div>

                <div className="min-w-0">
                  <p
                    className="
                      text-[8px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-blue-500
                    "
                  >
                    Total Target
                  </p>

                  <p
                    className="
                      text-lg
                      font-black
                      text-blue-900
                    "
                  >
                    {formatNumber(
                      TARGET_QTY
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* ACHIEVED */}

            <div
              data-scheme-reveal
              style={{
                transitionDelay: "50ms",
              }}
              className="
                rounded-xl
                border
                border-emerald-100
                bg-emerald-50/60
                p-3
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:shadow-sm
              "
            >
              <div className="flex items-center gap-2">
                <div
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-white
                    text-emerald-600
                    shadow-sm
                  "
                >
                  <FaCheckCircle size={13} />
                </div>

                <div className="min-w-0">
                  <p
                    className="
                      text-[8px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-emerald-500
                    "
                  >
                    Achieved
                  </p>

                  <p
                    className="
                      text-lg
                      font-black
                      text-emerald-900
                    "
                  >
                    {formatNumber(
                      achievedQty
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* TRIPS */}

            <div
              data-scheme-reveal
              style={{
                transitionDelay: "100ms",
              }}
              className="
                rounded-xl
                border
                border-purple-100
                bg-purple-50/60
                p-3
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:shadow-sm
              "
            >
              <div className="flex items-center gap-2">
                <div
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-white
                    text-purple-600
                    shadow-sm
                  "
                >
                  <FaGift size={13} />
                </div>

                <div className="min-w-0">
                  <p
                    className="
                      text-[8px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-purple-500
                    "
                  >
                    Trips Earned
                  </p>

                  <p
                    className="
                      text-lg
                      font-black
                      text-purple-900
                    "
                  >
                    {earnedTrips}
                  </p>
                </div>
              </div>
            </div>

            {/* PROGRESS */}

            <div
              data-scheme-reveal
              style={{
                transitionDelay: "150ms",
              }}
              className="
                rounded-xl
                border
                border-orange-100
                bg-orange-50/60
                p-3
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:shadow-sm
              "
            >
              <div className="flex items-center gap-2">
                <div
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-white
                    text-orange-500
                    shadow-sm
                  "
                >
                  %
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p
                      className="
                        text-[8px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-orange-500
                      "
                    >
                      Progress
                    </p>

                    <p
                      className="
                        text-[9px]
                        font-black
                        text-orange-700
                      "
                    >
                      {progressPercent}%
                    </p>
                  </div>

                  <div
                    className="
                      mt-1.5
                      h-1.5
                      overflow-hidden
                      rounded-full
                      bg-orange-100
                    "
                  >
                    <div
                      className="
                        h-full
                        rounded-full
                        bg-orange-500
                        transition-[width]
                        duration-700
                        ease-out
                      "
                      style={{
                        width: `${progressPercent}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            DESTINATIONS
        =================================================== */}

        <section
          data-scheme-reveal
          className="mt-6 px-3 sm:px-5 lg:px-7"
        >
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.15em]
                  text-[#d20b25]
                "
              >
                Choose Your Destination
              </p>

              <h2 className="mt-0.5 text-base font-black text-slate-800 sm:text-lg">
                International Rewards
              </h2>
            </div>

            <span
              className="
                rounded-full
                bg-slate-100
                px-2.5
                py-1
                text-[8px]
                font-bold
                text-slate-500
              "
            >
              3 Destinations
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {DESTINATIONS.map(
              (destination, index) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  delay={index * 60}
                />
              )
            )}
          </div>
        </section>

        {/* ===================================================
            PDF
        =================================================== */}

        <section
          data-scheme-reveal
          className="mt-6 px-3 sm:px-5 lg:px-7"
          style={{
            transitionDelay: "60ms",
          }}
        >
          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-3.5
              shadow-sm
              sm:p-4
            "
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-red-50
                    text-[#d20b25]
                  "
                >
                  <FaFilePdf size={16} />
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-800">
                    Scheme Price PDF
                  </h3>

                  <p className="mt-0.5 text-[9px] text-slate-400">
                    Download eligible scheme product prices
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">

                {isAdminOrCRM && (
                  <select
                    value={pdfPriceType}
                    onChange={(e) =>
                      setPdfPriceType(
                        e.target.value
                      )
                    }
                    className="
                      h-9
                      flex-1
                      rounded-lg
                      border
                      border-slate-200
                      bg-slate-50
                      px-2
                      text-[9px]
                      font-bold
                      text-slate-600
                      outline-none
                      sm:flex-none
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
                )}

                {(isAdminOrCRM ||
                  isSS ||
                  isDS) && (
                  <button
                    type="button"
                    onClick={
                      handleDownloadSchemePDF
                    }
                    disabled={
                      !products.length
                    }
                    className="
                      flex
                      h-9
                      items-center
                      justify-center
                      gap-1.5
                      rounded-lg
                      bg-[#d20b25]
                      px-3
                      text-[9px]
                      font-bold
                      text-white
                      transition-all
                      hover:bg-[#b9081f]
                      active:scale-95
                      disabled:bg-slate-300
                    "
                  >
                    <FaDownload size={10} />
                    Download PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            PRODUCTS
        =================================================== */}

        <section
          data-scheme-reveal
          className="mt-6 px-3 sm:px-5 lg:px-7"
          style={{
            transitionDelay: "80ms",
          }}
        >
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.15em]
                  text-[#d20b25]
                "
              >
                Eligible Products
              </p>

              <h2 className="mt-0.5 text-base font-black text-slate-800 sm:text-lg">
                Available Products
              </h2>
            </div>

            <span
              className="
                rounded-full
                bg-slate-100
                px-2.5
                py-1
                text-[8px]
                font-bold
                text-slate-500
              "
            >
              {products.length} Products
            </span>
          </div>

          <div
            className="
              grid
              grid-cols-2
              gap-2.5
              sm:grid-cols-3
              sm:gap-3
              lg:grid-cols-5
              xl:grid-cols-6
            "
          >
            {products.map((prod, index) => (
              <div
                key={prod.product_id}
                data-scheme-reveal
                style={{
                  transitionDelay: `${Math.min(
                    index * 25,
                    180
                  )}ms`,
                }}
                className="
                  transition-transform
                  duration-200
                  hover:-translate-y-0.5
                "
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
            ))}
          </div>

          {!products.length && (
            <div
              className="
                rounded-2xl
                border
                border-dashed
                border-slate-300
                bg-white
                py-12
                text-center
              "
            >
              <FaGift
                className="mx-auto text-slate-300"
                size={22}
              />

              <p className="mt-2 text-xs font-semibold text-slate-500">
                No scheme products available
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}