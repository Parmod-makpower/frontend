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
import { useMemo, useState } from "react";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import thailand from "../assets/images/thailand.png";
import malaysia from "../assets/images/malaysia.png";
import singapore from "../assets/images/singapore.png";

import {
  FaArrowLeft,
  FaPlaneDeparture,
  FaGlobeAsia,
  FaTrophy,
  FaGift,
  FaShoppingCart,
  FaSearch,
  FaFilePdf,
  FaDownload,
  FaInfoCircle,
  FaCog,
} from "react-icons/fa";

import MobilePageHeader from "../components/MobilePageHeader";
import ProductCard from "../components/ProductCard";
import BackButton from "../Layout/BackButton";

import exportSchemePricePDF from "../utils/exportSchemePricePDF";

/* =========================================================
   CONSTANTS
========================================================= */

const TARGET_QTY = 3000;

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
   INTERNATIONAL REWARDS
========================================================= */

const TRIP_REWARDS = [
  {
    id: "thailand",
    country: "THAILAND",
    subtitle: "Thailand International Trip",
    target: "2,500",
    nights: "3",
    days: "4",
    discount: "₹42,000",
    image: thailand,
    badge: "STARTER REWARD",
  },
  {
    id: "malaysia",
    country: "MALAYSIA",
    subtitle: "Malaysia International Trip",
    target: "4,000",
    nights: "3",
    days: "4",
    discount: "₹65,000",
    image: malaysia,
    badge: "PREMIUM REWARD",
  },
  {
    id: "singapore",
    country: "SINGAPORE",
    subtitle: "Singapore International Trip",
    target: "4,500",
    nights: "3",
    days: "4",
    discount: "₹75,000",
    image: singapore,
    badge: "ELITE REWARD",
  },
];

/* =========================================================
   HELPERS
========================================================= */

const getProductId = (product) =>
  product?.product_id ?? product?.id ?? "";

const getProductPrice = (product) => {
  const price = Number(product?.price ?? 0);

  return Number.isFinite(price) ? price : 0;
};

/* =========================================================
   DESTINATION CARD
========================================================= */

function TripRewardCard({ trip }) {
  return (
    <article
      className="
        group
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      {/* IMAGE */}

      <div className="relative overflow-hidden bg-slate-100">
        <div
          className="
            relative
            w-full
            aspect-[16/9]
            sm:aspect-[16/9]
            overflow-hidden
          "
        >
          <img
            src={trip.image}
            alt={`${trip.country} International Trip`}
            loading="lazy"
            className="
              absolute
              inset-0
              w-full
              h-full
              object-cover
              object-center
              transition-transform
              duration-500
              ease-out
              group-hover:scale-[1.04]
            "
          />

         

        </div>
      </div>

      {/* CONTENT */}

      <div className="p-3 sm:p-3.5">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-slate-50 px-2 py-2 text-center">
            <p className="text-[8px] uppercase font-bold text-slate-400">
              Target
            </p>

            <p className="mt-0.5 text-xs sm:text-sm font-black text-slate-800">
              {trip.target}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 px-2 py-2 text-center">
            <p className="text-[8px] uppercase font-bold text-slate-400">
              Stay
            </p>

            <p className="mt-0.5 text-xs sm:text-sm font-black text-slate-800">
              {trip.nights}N / {trip.days}D
            </p>
          </div>

          <div className="rounded-lg bg-red-50 px-2 py-2 text-center">
            <p className="text-[8px] uppercase font-bold text-[#fc250c]">
              Value
            </p>

            <p className="mt-0.5 text-xs sm:text-sm font-black text-[#fc250c]">
              {trip.discount}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function InternationalSchemeTemplate() {
  const [search, setSearch] = useState("");
  const [pdfPriceType, setPdfPriceType] = useState("SS");

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
     ROLE
  ========================================================= */

  const role = String(user?.role ?? "").toUpperCase();

  const isAdminOrCRM =
    role === "ADMIN" ||
    role === "CRM";

  const isSS = role === "SS";
  const isDS = role === "DS";

  const activePdfPriceType = isSS
    ? "SS"
    : isDS
    ? "DS"
    : pdfPriceType;

  /* =========================================================
     PARTY DATA
  ========================================================= */

  const partyMahotsavData = useMemo(() => {
    const partyName = String(
      user?.party_name ?? ""
    )
      .trim()
      .toLowerCase();

    if (!partyName) {
      return null;
    }

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

  /* =========================================================
     PROGRESS
  ========================================================= */

  const achievedQty = Number(
    partyMahotsavData
      ?.mahotsav_dispatch_quantity || 0
  );

  const earnedTrips = Math.floor(
    achievedQty / TARGET_QTY
  );

  const progress = Math.min(
    Math.round(
      (achievedQty / TARGET_QTY) * 100
    ),
    100
  );

  const remainingQty = Math.max(
    TARGET_QTY - achievedQty,
    0
  );

  /* =========================================================
     PRODUCTS
  ========================================================= */

  const products = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

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
      .filter((product) => {
        if (!query) {
          return true;
        }

        const productName = String(
          product?.product_name ??
            product?.name ??
            ""
        ).toLowerCase();

        const productId = String(
          getProductId(product)
        ).toLowerCase();

        const category = String(
          product?.sub_category ??
            product?.category ??
            ""
        ).toLowerCase();

        return (
          productName.includes(query) ||
          productId.includes(query) ||
          category.includes(query)
        );
      })
      .sort(
        (a, b) =>
          getProductPrice(a) -
          getProductPrice(b)
      );
  }, [
    allProducts,
    search,
  ]);

  /* =========================================================
     TRIP SEARCH
  ========================================================= */

  const filteredTrips = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return TRIP_REWARDS;
    }

    return TRIP_REWARDS.filter(
      (trip) =>
        trip.country
          .toLowerCase()
          .includes(query) ||
        trip.subtitle
          .toLowerCase()
          .includes(query)
    );
  }, [search]);

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
      <div
        className="
          min-h-screen
          bg-[#f7f8fa]
          flex
          items-center
          justify-center
        "
      >
        <div className="text-center">
          <div
            className="
              w-8
              h-8
              mx-auto
              mb-2
              rounded-full
              border-2
              border-slate-200
              border-t-[#fc250c]
              animate-spin
            "
          />

          <p className="text-xs text-slate-500">
            Loading International Scheme...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] pb-20">

      {/* =====================================================
          MOBILE PAGE HEADER
      ===================================================== */}

      <MobilePageHeader
        title="International Trip"
      />

      {/* =====================================================
          DESKTOP HEADER
      ===================================================== */}

      <header
        className="
          hidden
          md:block
          sticky
          top-0
          z-40
          bg-white
          border-b
          border-slate-200
        "
      >
        <div
          className="
            max-w-[1400px]
            mx-auto
            px-5
            lg:px-8
          "
        >
          <div
            className="
              min-h-[66px]
              flex
              items-center
              justify-between
              gap-4
            "
          >

            {/* LEFT */}

            <div className="flex items-center gap-3 shrink-0">
              <BackButton fallback="/" />

              <div
                className="
                  w-9
                  h-9
                  rounded-xl
                  bg-red-50
                  text-[#fc250c]
                  flex
                  items-center
                  justify-center
                "
              >
                <FaGlobeAsia size={16} />
              </div>

              <div>
                <h1 className="text-sm font-extrabold text-slate-900">
                  International Trip
                </h1>

                <p className="text-[9px] text-slate-400">
                  International Rewards Program
                </p>
              </div>
            </div>

            {/* SEARCH */}

            <div className="flex-1 max-w-[400px]">
              <div className="relative">
                <FaSearch
                  size={12}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search destination or product..."
                  className="
                    w-full
                    h-10
                    pl-9
                    pr-3
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    text-xs
                    text-slate-700
                    outline-none
                    transition
                    focus:bg-white
                    focus:border-[#fc250c]
                    focus:ring-2
                    focus:ring-red-100
                  "
                />
              </div>
            </div>

            {/* RIGHT ACTIONS */}

            <div className="flex items-center gap-2 shrink-0">

              {/* PDF ONLY ADMIN / CRM */}

              {isAdminOrCRM && (
                <>
                  <select
                    value={pdfPriceType}
                    onChange={(e) =>
                      setPdfPriceType(
                        e.target.value
                      )
                    }
                    className="
                      h-10
                      w-[150px]
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-3
                      text-[10px]
                      font-bold
                      text-slate-700
                      outline-none
                      cursor-pointer
                      focus:border-[#fc250c]
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

                  <button
                    type="button"
                    onClick={
                      handleDownloadSchemePDF
                    }
                    disabled={!products.length}
                    className="
                      h-10
                      px-3
                      rounded-xl
                      bg-[#fc250c]
                      hover:bg-[#e51f09]
                      disabled:bg-slate-300
                      text-white
                      text-[10px]
                      font-extrabold
                      flex
                      items-center
                      gap-1.5
                      transition
                      active:scale-[0.98]
                    "
                  >
                    <FaFilePdf size={11} />
                    PDF
                  </button>
                </>
              )}

              {/* SS DIRECT PDF */}

              {isSS && (
                <button
                  type="button"
                  onClick={
                    handleDownloadSchemePDF
                  }
                  disabled={!products.length}
                  className="
                    h-10
                    px-3.5
                    rounded-xl
                    bg-[#fc250c]
                    hover:bg-[#e51f09]
                    disabled:bg-slate-300
                    text-white
                    text-[10px]
                    font-extrabold
                    flex
                    items-center
                    gap-1.5
                    transition
                    active:scale-[0.98]
                  "
                >
                  <FaDownload size={10} />
                  SS PDF
                </button>
              )}

              {/* DS DIRECT PDF */}

              {isDS && (
                <button
                  type="button"
                  onClick={
                    handleDownloadSchemePDF
                  }
                  disabled={!products.length}
                  className="
                    h-10
                    px-3.5
                    rounded-xl
                    bg-[#fc250c]
                    hover:bg-[#e51f09]
                    disabled:bg-slate-300
                    text-white
                    text-[10px]
                    font-extrabold
                    flex
                    items-center
                    gap-1.5
                    transition
                    active:scale-[0.98]
                  "
                >
                  <FaDownload size={10} />
                  DS PDF
                </button>
              )}

              {/* MANAGE */}

              {isAdminOrCRM && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/international-scheme-data"
                    )
                  }
                  className="
                    h-10
                    px-3
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    text-slate-700
                    text-[10px]
                    font-bold
                    flex
                    items-center
                    gap-1.5
                    hover:bg-slate-50
                    transition
                  "
                >
                  <FaCog
                    size={11}
                    className="text-[#fc250c]"
                  />

                  Manage
                </button>
              )}

            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          MOBILE HEADER ACTION BAR
      ===================================================== */}

      <div
        className="
          md:hidden
          sticky
          top-[60px]
          z-30
          bg-white
          border-b
          border-slate-200
        "
      >
        <div className="px-2.5 py-2 flex items-center gap-2">

          {/* BACK */}

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              w-9
              h-9
              shrink-0
              rounded-xl
              border
              border-slate-200
              bg-white
              text-slate-600
              flex
              items-center
              justify-center
              active:scale-95
            "
          >
            <FaArrowLeft size={12} />
          </button>

          {/* SEARCH */}

          <div className="relative flex-1 min-w-0">
            <FaSearch
              size={11}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search..."
              className="
                w-full
                h-9
                pl-8
                pr-2
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                text-[11px]
                text-slate-700
                outline-none
                focus:bg-white
                focus:border-[#fc250c]
              "
            />
          </div>

          {/* ADMIN / CRM PDF */}

          {isAdminOrCRM && (
            <div className="flex items-center gap-1.5 shrink-0">

              <select
                value={pdfPriceType}
                onChange={(e) =>
                  setPdfPriceType(
                    e.target.value
                  )
                }
                className="
                  h-9
                  max-w-[92px]
                  rounded-xl
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
                  SS
                </option>

                <option value="DS">
                  DISTRIBUTOR
                </option>

                <option value="DLR">
                  DEALER
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
                  w-9
                  shrink-0
                  rounded-xl
                  bg-[#fc250c]
                  disabled:bg-slate-300
                  text-white
                  flex
                  items-center
                  justify-center
                  active:scale-95
                "
                title="Download PDF"
              >
                <FaDownload size={11} />
              </button>

            </div>
          )}

          {/* SS PDF */}

          {isSS && (
            <button
              type="button"
              onClick={
                handleDownloadSchemePDF
              }
              disabled={!products.length}
              className="
                h-9
                px-2.5
                shrink-0
                rounded-xl
                bg-[#fc250c]
                disabled:bg-slate-300
                text-white
                text-[9px]
                font-extrabold
                flex
                items-center
                gap-1
              "
            >
              <FaDownload size={9} />
              SS
            </button>
          )}

          {/* DS PDF */}

          {isDS && (
            <button
              type="button"
              onClick={
                handleDownloadSchemePDF
              }
              disabled={!products.length}
              className="
                h-9
                px-2.5
                shrink-0
                rounded-xl
                bg-[#fc250c]
                disabled:bg-slate-300
                text-white
                text-[9px]
                font-extrabold
                flex
                items-center
                gap-1
              "
            >
              <FaDownload size={9} />
              DS
            </button>
          )}

          {/* MANAGE */}

          {isAdminOrCRM && (
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/international-scheme-data"
                )
              }
              className="
                w-9
                h-9
                shrink-0
                rounded-xl
                border
                border-slate-200
                bg-white
                text-[#fc250c]
                flex
                items-center
                justify-center
                active:scale-95
              "
              title="Manage"
            >
              <FaCog size={12} />
            </button>
          )}

        </div>
      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main
        className="
          max-w-[1400px]
          mx-auto
          px-2.5
          sm:px-4
          md:px-6
          lg:px-8
          pt-3
          md:pt-6
        "
      >

        {/* ===================================================
            HERO
        =================================================== */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[22px]
            bg-gradient-to-br
            from-[#071a45]
            via-[#0b57d0]
            to-[#5b25d8]
            text-white
            shadow-lg
          "
        >

          {/* DECORATION */}

          <div
            className="
              absolute
              -right-20
              -top-24
              w-72
              h-72
              rounded-full
              bg-white/5
            "
          />

          <div
            className="
              absolute
              right-10
              -bottom-32
              w-72
              h-72
              rounded-full
              bg-cyan-300/10
            "
          />

          <div
            className="
              absolute
              left-1/2
              -bottom-28
              w-72
              h-72
              rounded-full
              bg-indigo-300/10
            "
          />

          <div
            className="
              relative
              z-10
              p-4
              sm:p-6
              md:p-8
              lg:p-10
            "
          >

            <div
              className="
                grid
                lg:grid-cols-[1.15fr_.85fr]
                gap-6
                lg:gap-10
                items-center
              "
            >

              {/* HERO LEFT */}

              <div>

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-white/10
                    border
                    border-white/10
                    px-3
                    py-1.5
                    mb-4
                  "
                >
                  <FaPlaneDeparture size={11} />

                  <span
                    className="
                      text-[9px]
                      sm:text-xs
                      font-bold
                      tracking-wide
                    "
                  >
                    INTERNATIONAL REWARDS PROGRAM
                  </span>
                </div>

                <h2
                  className="
                    text-[27px]
                    sm:text-[36px]
                    lg:text-[46px]
                    leading-[1.04]
                    font-black
                    tracking-tight
                  "
                >
                  Buy More.
                  <br />

                  <span className="text-cyan-200">
                    Travel International.
                  </span>
                </h2>

                <p
                  className="
                    mt-3
                    sm:mt-4
                    text-xs
                    sm:text-sm
                    lg:text-base
                    leading-relaxed
                    text-white/75
                    max-w-xl
                  "
                >
                  Achieve your purchase target
                  with eligible MAKPOWER products
                  and unlock exciting international
                  destinations.
                </p>

                <div className="flex flex-wrap gap-2.5 mt-5">

                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById(
                          "international-rewards"
                        )
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        })
                    }
                    className="
                      h-10
                      px-4
                      rounded-xl
                      bg-white
                      text-slate-900
                      text-xs
                      font-extrabold
                      flex
                      items-center
                      gap-2
                      shadow-sm
                      active:scale-[0.98]
                      transition
                    "
                  >
                    <FaGift size={12} />
                    Explore Rewards
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById(
                          "eligible-products"
                        )
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        })
                    }
                    className="
                      h-10
                      px-4
                      rounded-xl
                      bg-white/10
                      border
                      border-white/15
                      text-white
                      text-xs
                      font-bold
                      flex
                      items-center
                      gap-2
                      active:scale-[0.98]
                      transition
                    "
                  >
                    <FaInfoCircle size={12} />
                    Scheme Details
                  </button>

                </div>
              </div>

              {/* HERO RIGHT - CLEAN PROGRESS ONLY */}

              <div
                className="
                  rounded-2xl
                  bg-white/10
                  border
                  border-white/15
                  backdrop-blur-md
                  p-4
                  sm:p-5
                "
              >

                <div className="flex items-center justify-between mb-4">

                  <p
                    className="
                      text-[10px]
                      sm:text-xs
                      text-white/70
                      uppercase
                      tracking-[0.12em]
                      font-bold
                    "
                  >
                    Your Progress
                  </p>

                  <div
                    className="
                      w-9
                      h-9
                      rounded-xl
                      bg-white/10
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <FaTrophy size={15} />
                  </div>

                </div>

                <div className="flex items-end justify-between mb-2">

                  <div>
                    <p className="text-[10px] text-white/60">
                      Achieved
                    </p>

                    <p className="text-2xl sm:text-3xl font-black">
                      {achievedQty.toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-white/60">
                      Target
                    </p>

                    <p className="text-lg sm:text-xl font-black">
                      {TARGET_QTY.toLocaleString(
                        "en-IN"
                      )}{" "}
                      PCS
                    </p>
                  </div>

                </div>

                <div
                  className="
                    h-2.5
                    rounded-full
                    bg-white/10
                    overflow-hidden
                  "
                >
                  <div
                    className="
                      h-full
                      rounded-full
                      bg-gradient-to-r
                      from-cyan-300
                      to-white
                      transition-all
                      duration-500
                    "
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <div
                  className="
                    flex
                    justify-between
                    gap-2
                    mt-2
                    text-[9px]
                    sm:text-[10px]
                    text-white/60
                  "
                >
                  <span>
                    {progress}% completed
                  </span>

                  <span className="text-right">
                    {remainingQty.toLocaleString(
                      "en-IN"
                    )}{" "}
                    PCS remaining
                  </span>
                </div>

                <div
                  className="
                    mt-4
                    rounded-xl
                    bg-white/10
                    px-3
                    py-2.5
                    flex
                    items-center
                    justify-between
                  "
                >
                  <span className="text-[10px] text-white/65">
                    Trips Earned
                  </span>

                  <span className="text-lg font-black">
                    {earnedTrips}
                  </span>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            DESTINATIONS
        =================================================== */}

        <section
          id="international-rewards"
          className="mt-6 sm:mt-7"
        >

          <div className="mb-4">

            <div className="flex items-center gap-2 mb-1.5">

              <div
                className="
                  w-7
                  h-7
                  rounded-lg
                  bg-red-50
                  text-[#fc250c]
                  flex
                  items-center
                  justify-center
                "
              >
                <FaGlobeAsia size={13} />
              </div>

              <span
                className="
                  text-[9px]
                  sm:text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-[#fc250c]
                "
              >
                Choose Your Reward
              </span>

            </div>

            <h2
              className="
                text-lg
                sm:text-2xl
                font-black
                text-slate-900
                tracking-tight
              "
            >
              International Destinations
            </h2>

            <p
              className="
                mt-1
                text-[10px]
                sm:text-xs
                text-slate-500
              "
            >
              Complete the applicable purchase target
              and unlock your international reward.
            </p>

          </div>

          {filteredTrips.length ? (
            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                xl:grid-cols-3
                gap-3
                sm:gap-5
              "
            >
              {filteredTrips.map((trip) => (
                <TripRewardCard
                  key={trip.id}
                  trip={trip}
                />
              ))}
            </div>
          ) : (
            <div
              className="
                rounded-2xl
                border
                border-dashed
                border-slate-300
                bg-white
                py-10
                text-center
              "
            >
              <FaSearch
                size={18}
                className="mx-auto text-slate-300"
              />

              <p className="mt-2 text-sm font-bold text-slate-600">
                No destination found
              </p>
            </div>
          )}

        </section>

        {/* ===================================================
            ELIGIBLE PRODUCTS
        =================================================== */}

        <section
          id="eligible-products"
          className="mt-7"
        >

          <div
            className="
              flex
              items-end
              justify-between
              gap-3
              mb-3
            "
          >

            <div>
              <div className="flex items-center gap-2">

                <div
                  className="
                    w-7
                    h-7
                    rounded-lg
                    bg-red-50
                    text-[#fc250c]
                    flex
                    items-center
                    justify-center
                  "
                >
                  <FaShoppingCart size={12} />
                </div>

                <h2
                  className="
                    text-base
                    sm:text-lg
                    font-black
                    text-slate-900
                  "
                >
                  Eligible Products
                </h2>

              </div>

              <p
                className="
                  mt-1
                  text-[9px]
                  sm:text-[10px]
                  text-slate-500
                "
              >
                Products counted towards the international scheme.
              </p>
            </div>

            <span
              className="
                shrink-0
                rounded-full
                bg-slate-100
                px-2.5
                py-1
                text-[9px]
                sm:text-[10px]
                font-bold
                text-slate-600
              "
            >
              {products.length} Products
            </span>

          </div>

          {/* PRODUCT SEARCH - MOBILE */}

          <div className="md:hidden mb-3">
            <div className="relative">

              <FaSearch
                size={12}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search product or category..."
                className="
                  w-full
                  h-10
                  pl-9
                  pr-3
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  text-xs
                  outline-none
                  focus:border-[#fc250c]
                  focus:ring-2
                  focus:ring-red-100
                "
              />

            </div>
          </div>

          {/* PRODUCTS */}

          {products.length ? (
            <div
              className="
                grid
                grid-cols-2
                sm:grid-cols-3
                lg:grid-cols-5
                xl:grid-cols-6
                gap-2.5
                sm:gap-4
              "
            >
              {products.map((prod) => (
                <div
                  key={prod.product_id}
                  className="
                    relative
                    min-w-0
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
          ) : (
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
              <FaSearch
                size={20}
                className="mx-auto text-slate-300"
              />

              <p className="mt-2 text-sm font-bold text-slate-600">
                No products found
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                Try another product name or category.
              </p>
            </div>
          )}

        </section>

      </main>
    </div>
  );
}