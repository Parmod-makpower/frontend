import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaBell, FaGift, FaPlaneDeparture, FaRocket, FaFireAlt, FaFilePdf, FaDownload, FaChevronRight, FaImages } from "react-icons/fa";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import logo from "../assets/images/logo.png";
import categories from "../data/categoryData";
import SlidingProductsCards from "../components/SlidingProductsCards";
import { useStock } from "../context/StockContext";
import { useCachedProducts } from "../hooks/useCachedProducts";


export default function HomePage() {
  const navigate = useNavigate();
  const { stockType } = useStock();

  const [searchText, setSearchText] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const stockLetter = stockType === "mumbai" ? "M" : "D";
  const stockColor =
    stockType === "mumbai" ? "bg-green-600" : "bg-red-600";
  const { data: allProducts = [] } = useCachedProducts();
  const mahotsavProduct = allProducts.find(
    (p) => p.product_id === 10006
  );

  const showMahotsavButton = mahotsavProduct?.moq === 1;


  // Responsive listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleRedirect = () => {
    navigate(`/search?search=${encodeURIComponent(searchText.trim())}`);
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  // यहाँ आप top selling की लिस्ट रखेंगे
  const trendingIds = [2, 45, 74, 123, 1870, 717, 1120, 111,700, 205];

  const schemeIds = [1142, 18, 119, 60, 69, 33, 1730, 1653];

  return (
    <div className="mx-auto p-4 pb-25">
      {/* 🔝 Top Bar */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <img
          src={logo}
          className="w-40"
          alt="MakPower Logo"
        />
        <div className="block sm:hidden text-xl text-[var(--primary-color)]">
          {/* <FaBell /> */}
          <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold text-white ${stockColor}`}
            title={stockType === "mumbai" ? "Mumbai Stock" : "Delhi Stock"} >{stockLetter} </span>
        </div>
      </div>

      {/* 🔍 Search */}
      <div className="md:hidden relative mb-6 ">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onClick={handleRedirect}
          placeholder="Search for products..."
          className="w-full p-2.5 sm:p-3 pl-4 pr-10 rounded-full border text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleRedirect}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] hover:text-blue-800"
        >
          <FaSearch />
        </button>
      </div>


      {/* 📂 Categories */}
      <div className="overflow-x-auto no-scrollbar flex gap-2 mb-6 px-1 lg:justify-center">
        {categories.slice(0, isMobile ? 8 : 9).map((cat) => {
          const hasSubcategories = cat.subcategories && cat.subcategories.length > 0;

          return (
            <div
              key={cat.label}
              onClick={() =>
                hasSubcategories
                  ? navigate(`/category/${encodeURIComponent(cat.keyword)}/subcategories`)
                  : navigate(`/category/${encodeURIComponent(cat.keyword)}`)
              }
              className="flex-shrink-0 flex flex-col items-center cursor-pointer w-20 md:w-28 lg:w-32 group "
            >
              <div className="overflow-hidden rounded-full shadow transition-all duration-300 group-hover:shadow-lg">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-16 h-16 md:w-24 md:h-24 lg:w-22 lg:h-22 object-cover transform group-hover:scale-150 transition duration-300 rounded-full bg-gray-200"
                />
              </div>
              <span className="mt-1 text-[12px] md:text-sm lg:text-base text-center text-gray-700 font-medium group-hover:text-[var(--primary-color)] transition">
                {cat.label}
              </span>
            </div>
          );
        })}

        {/* ➕ View All button */}
        <div
          onClick={() => navigate("/all-categories")}
          className="flex-shrink-0 flex flex-col items-center cursor-pointer w-20 md:w-28 lg:w-32"
        >
          <div className="w-16 h-16 md:w-24 md:h-24 lg:w-22 lg:h-22 rounded-full border flex items-center justify-center text-sm text-gray-500 hover:bg-gray-200 transition-all duration-300">
            View All
          </div>
          <span className="mt-1 text-[10px] md:text-sm text-center text-gray-500 font-medium">
            More
          </span>
        </div>
      </div>


      {/* 🎞️ Image Slider */}
      <div className="mb-8 rounded-xl overflow-hidden">
        <Slider {...sliderSettings}>
          <img
            src="https://makpowerindia.com/cdn/shop/files/f7arm7foserysccse9fa.webp?v=1742894610&width=2000"
            alt="banner1"
            className="w-full h-48 md:h-64 lg:h-100 object-cover"
          />
          <img
            src="https://makpowerindia.com/cdn/shop/files/krxntlvftutoe0p5tsjd.webp?v=1744890344&width=2000"
            alt="banner2"
            className="w-full h-48 md:h-64 lg:h-100 object-cover"
          />
          <img
            src="https://makpowerindia.com/cdn/shop/files/irii2fisadlfkmal0hpn.webp?v=1753181679&width=2000"
            alt="banner3"
            className="w-full h-48 md:h-64 lg:h-100 object-cover"
          />
        </Slider>
      </div>

      {/* =========================================================
    FIXED GOA TRIP BUTTON
========================================================= */}

      {showMahotsavButton && (
        <button
          onClick={() => navigate("/goa-couple-trip-schemes")}
          className="
      fixed
      right-2
      sm:right-4
      top-1/3
      -translate-y-1/2
      z-50

      w-16
      sm:w-14

      py-2.5
      sm:py-3

      rounded-2xl

      bg-gradient-to-b
      from-cyan-500
      via-blue-600
      to-indigo-700

      text-white

      flex
      flex-col
      items-center
      justify-center
      gap-1

      shadow-[0_8px_25px_rgba(37,99,235,0.35)]

      border
      border-white/30

      hover:scale-105
      active:scale-95

      transition-all
      duration-200
    "
        >
          <FaPlaneDeparture className="text-base sm:text-lg" />

          <span className="text-[8px] sm:text-[9px] font-extrabold leading-none">
            GOA
          </span>

          <span className="text-[7px] sm:text-[8px] font-medium opacity-90 leading-none">
            TRIP
          </span>
        </button>
      )}


      {/* =========================================================
    QUICK ACTION CARDS
    PDF + NEW LAUNCHING + NEW TEMPERED,,,,,
========================================================= */}

      <div className="mt-6 mb-7">

        <div className="
    grid
    grid-cols-3
    gap-2
    sm:gap-3
    lg:gap-4
  ">


          {/* =====================================================
        PRODUCT PDF......
    ===================================================== */}

          <div
            onClick={() =>
              navigate("/product-images-pdf")
            }
            className="
        group
        relative
        overflow-hidden
        cursor-pointer

        rounded-2xl
        sm:rounded-3xl

        border
        border-indigo-100

        bg-gradient-to-br
        from-indigo-50
        via-white
        to-purple-50

        p-2.5
        sm:p-4
        lg:p-5
        shadow-sm
        hover:shadow-md
        active:scale-[0.97]
        transition-all
        duration-200
      "
          >

            {/* Decorative circle */}

            <div className="
        absolute
        -right-5
        -top-5
        w-16
        h-16
        sm:w-24
        sm:h-24
        rounded-full
        bg-indigo-100/60
      " />

            <div className="
        relative
        flex
        flex-col
        items-center
        text-center
      ">

              {/* Icon */}

              <div className="
          w-9
          h-9
          sm:w-11
          sm:h-11
          lg:w-12
          lg:h-12

          rounded-xl
          sm:rounded-2xl

          bg-gradient-to-br
          from-indigo-600
          to-purple-600

          text-white

          flex
          items-center
          justify-center

          shadow-sm

          group-hover:scale-105

          transition-transform
        ">
                <FaFilePdf className="
            text-base
            sm:text-lg
            lg:text-xl
          " />
              </div>


              {/* Title */}

              <h2 className="
          mt-2
          text-[10px]
          sm:text-xs
          lg:text-sm

          font-extrabold

          text-slate-800

          leading-tight
        ">
                Product PDF
              </h2>


              {/* Description */}

              <p className="
          hidden
          sm:block

          mt-1

          text-[9px]
          lg:text-[10px]

          text-slate-500

          leading-tight
        ">
                Download products
              </p>


              {/* Action */}

              <div className="
          mt-2

          flex
          items-center
          gap-1

          text-[8px]
          sm:text-[9px]
          lg:text-[10px]

          font-bold

          text-indigo-600
        ">
                <FaDownload />

                <span>
                  Download
                </span>

                <span className="
            group-hover:translate-x-0.5
            transition-transform
          ">
                  →
                </span>
              </div>

            </div>

          </div>



          {/* =====================================================
        NEW LAUNCHING
    ===================================================== */}

          <div
            onClick={() =>
              navigate("/new-launching")
            }
            className="
        group
        relative
        overflow-hidden
        cursor-pointer

        rounded-2xl
        sm:rounded-3xl

        border
        border-orange-100

        bg-gradient-to-br
        from-orange-50
        via-white
        to-amber-50

        p-2.5
        sm:p-4
        lg:p-5

        shadow-sm
        hover:shadow-md

        active:scale-[0.97]

        transition-all
        duration-200
      "
          >

            {/* Decorative circle */}

            <div className="
        absolute
        -right-5
        -top-5
        w-16
        h-16
        sm:w-24
        sm:h-24
        rounded-full
        bg-orange-100/60
      " />


            <div className="
        relative
        flex
        flex-col
        items-center
        text-center
      ">

              {/* Icon */}

              <div className="
          w-9
          h-9
          sm:w-11
          sm:h-11
          lg:w-12
          lg:h-12

          rounded-xl
          sm:rounded-2xl

          bg-orange-100
          text-orange-500

          flex
          items-center
          justify-center

          group-hover:scale-105

          transition-transform
        ">
                <FaRocket className="
            text-base
            sm:text-lg
            lg:text-xl
          " />
              </div>


              {/* Title */}

              <h2 className="
          mt-2

          text-[10px]
          sm:text-xs
          lg:text-sm

          font-extrabold

          text-slate-800

          leading-tight
        ">
                New Launching
              </h2>


              {/* Description */}

              <p className="
          hidden
          sm:block

          mt-1

          text-[9px]
          lg:text-[10px]

          text-slate-500

          leading-tight
        ">
                Latest products
              </p>


              {/* Action */}

              <div className="
          mt-2

          flex
          items-center
          gap-1

          text-[8px]
          sm:text-[9px]
          lg:text-[10px]

          font-bold

          text-orange-600
        ">
                <span>
                  Explore
                </span>

                <span className="
            group-hover:translate-x-0.5
            transition-transform
          ">
                  →
                </span>
              </div>

            </div>

          </div>



          {/* =====================================================
        NEW TEMPERED
    ===================================================== */}

          <div
            onClick={() =>
              navigate("/tempered/NEW%20SOLDIER%20TEMPERED")
            }
            className="
        group
        relative
        overflow-hidden
        cursor-pointer

        rounded-2xl
        sm:rounded-3xl

        border
        border-blue-100

        bg-gradient-to-br
        from-blue-50
        via-white
        to-cyan-50

        p-2.5
        sm:p-4
        lg:p-5

        shadow-sm
        hover:shadow-md

        active:scale-[0.97]

        transition-all
        duration-200
      "
          >

            {/* Decorative circle */}

            <div className="
        absolute
        -right-5
        -top-5
        w-16
        h-16
        sm:w-24
        sm:h-24
        rounded-full
        bg-blue-100/60
      " />


            <div className="
        relative
        flex
        flex-col
        items-center
        text-center
      ">

              {/* Icon */}

              <div className="
          w-9
          h-9
          sm:w-11
          sm:h-11
          lg:w-12
          lg:h-12

          rounded-xl
          sm:rounded-2xl

          bg-blue-100
          text-blue-500

          flex
          items-center
          justify-center

          group-hover:scale-105

          transition-transform
        ">
                <FaFireAlt className="
            text-base
            sm:text-lg
            lg:text-xl
          " />
              </div>


              {/* Title */}

              <h2 className="
          mt-2

          text-[10px]
          sm:text-xs
          lg:text-sm

          font-extrabold

          text-slate-800

          leading-tight
        ">
                New Tempered
              </h2>

              {/* Description */}

              <p className="
          hidden
          sm:block

          mt-1

          text-[9px]
          lg:text-[10px]

          text-slate-500

          leading-tight
        ">
                Latest tempered
              </p>


              {/* Action */}

              <div className="
          mt-2

          flex
          items-center
          gap-1

          text-[8px]
          sm:text-[9px]
          lg:text-[10px]

          font-bold

          text-blue-600
        ">
                <span>
                  View Products
                </span>

                <span className="
            group-hover:translate-x-0.5
            transition-transform
          ">
                  →
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>

      <SlidingProductsCards trendingIds={trendingIds} title={"Top Selling Products"} />
      {/* <SlidingProductsCards trendingIds={schemeIds} title={"Special Scheme Products"} /> */}

    </div>
  );
}





// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Slider from "react-slick";

// import {
//   FaSearch,
//   FaBell,
//   FaGift,
//   FaPlaneDeparture,
//   FaRocket,
//   FaFireAlt,
//   FaFilePdf,
//   FaChevronRight,
//   FaImages,
//   FaCalendarAlt,
//   FaArrowRight,
// } from "react-icons/fa";

// import categories from "../data/categoryData";
// import SlidingProductsCards from "../components/SlidingProductsCards";
// import { useStock } from "../context/StockContext";
// import { useCachedProducts } from "../hooks/useCachedProducts";
// import { useAuth } from "../context/AuthContext";

// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// /* =========================================================
//    KEEP YOUR EXISTING 3 BANNER URLS HERE
//    ========================================================= */

// const BANNER_IMAGES = [
//   // "YOUR EXISTING BANNER URL 1",
//   // "YOUR EXISTING BANNER URL 2",
//   // "YOUR EXISTING BANNER URL 3",
// ];

// /* =========================================================
//    TRENDING
//    ========================================================= */

// const TRENDING_IDS = [
//   2,
//   45,
//   74,
//   123,
//   1870,
//   717,
//   1120,
//   111,
//   700,
//   205,
// ];

// /* =========================================================
//    SMALL ANIMATION
//    ========================================================= */

// const homeStyles = `
// @keyframes homeFadeUp {
//   from {
//     opacity: 0;
//     transform: translateY(8px);
//   }
//   to {
//     opacity: 1;
//     transform: translateY(0);
//   }
// }

// @keyframes homeScale {
//   from {
//     opacity: 0;
//     transform: scale(.985);
//   }
//   to {
//     opacity: 1;
//     transform: scale(1);
//   }
// }

// @keyframes floatSoft {
//   0%,100% {
//     transform: translateY(0);
//   }
//   50% {
//     transform: translateY(-3px);
//   }
// }

// .home-fade {
//   animation: homeFadeUp .35s ease-out both;
// }

// .home-scale {
//   animation: homeScale .4s ease-out both;
// }

// .home-float {
//   animation: floatSoft 3s ease-in-out infinite;
// }

// @media (prefers-reduced-motion: reduce) {
//   .home-fade,
//   .home-scale,
//   .home-float {
//     animation: none !important;
//   }
// }
// `;

// /* =========================================================
//    CATEGORY ITEM
//    ========================================================= */

// function CategoryItem({ category, onClick }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       className="
//         group
//         flex
//         min-w-[72px]
//         sm:min-w-[82px]
//         flex-col
//         items-center
//         gap-1.5
//         outline-none
//       "
//     >
//       <div
//         className="
//           relative
//           flex
//           h-[62px]
//           w-[62px]
//           sm:h-[70px]
//           sm:w-[70px]
//           items-center
//           justify-center
//           overflow-hidden
//           rounded-full
//           border
//           border-[#e4eaf2]
//           bg-white
//           shadow-[0_2px_8px_rgba(15,23,42,0.04)]
//           transition-all
//           duration-250
//           group-hover:-translate-y-1
//           group-hover:border-[#cfe0ff]
//           group-hover:shadow-[0_7px_18px_rgba(23,105,255,0.12)]
//           group-active:scale-95
//         "
//       >
//         {category.image ? (
//           <img
//             src={category.image}
//             alt={category.label}
//             loading="lazy"
//             className="
//               h-full
//               w-full
//               object-contain
//               p-1.5
//               transition-transform
//               duration-300
//               group-hover:scale-110
//             "
//           />
//         ) : (
//           <div className="text-[#1769ff] text-xl">
//             <FaImages />
//           </div>
//         )}
//       </div>

//       <span
//         className="
//           max-w-[78px]
//           truncate
//           text-[9px]
//           sm:text-[10px]
//           font-semibold
//           text-[#334155]
//           transition-colors
//           group-hover:text-[#1769ff]
//         "
//       >
//         {category.label}
//       </span>
//     </button>
//   );
// }

// /* =========================================================
//    QUICK ACTION
//    ========================================================= */

// function QuickActionCard({
//   icon,
//   title,
//   subtitle,
//   onClick,
//   iconClass,
//   delay = 0,
// }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       style={{ animationDelay: `${delay}ms` }}
//       className="
//         home-fade
//         group
//         relative
//         flex
//         min-h-[76px]
//         w-full
//         items-center
//         gap-3
//         overflow-hidden
//         rounded-2xl
//         border
//         border-[#e5ebf3]
//         bg-white
//         px-3
//         text-left
//         shadow-[0_3px_12px_rgba(15,23,42,0.035)]
//         transition-all
//         duration-250
//         hover:-translate-y-0.5
//         hover:border-[#d4e2ff]
//         hover:shadow-[0_8px_22px_rgba(23,105,255,0.09)]
//         active:scale-[0.99]
//       "
//     >
//       {/* soft corner */}
//       <span
//         className="
//           pointer-events-none
//           absolute
//           -right-7
//           -top-7
//           h-20
//           w-20
//           rounded-full
//           bg-[#f3f7ff]
//         "
//       />

//       <span
//         className={`
//           relative
//           z-10
//           flex
//           h-11
//           w-11
//           shrink-0
//           items-center
//           justify-center
//           rounded-xl
//           ${iconClass}
//           shadow-sm
//           transition-transform
//           duration-250
//           group-hover:scale-105
//         `}
//       >
//         {icon}
//       </span>

//       <span className="relative z-10 min-w-0 flex-1">
//         <span
//           className="
//             block
//             truncate
//             text-[11px]
//             sm:text-xs
//             font-extrabold
//             text-[#0f172a]
//           "
//         >
//           {title}
//         </span>

//         <span
//           className="
//             mt-0.5
//             block
//             truncate
//             text-[8px]
//             sm:text-[9px]
//             font-medium
//             text-[#94a3b8]
//           "
//         >
//           {subtitle}
//         </span>
//       </span>

//       <FaChevronRight
//         className="
//           relative
//           z-10
//           shrink-0
//           text-[10px]
//           text-[#94a3b8]
//           transition-all
//           duration-200
//           group-hover:translate-x-1
//           group-hover:text-[#1769ff]
//         "
//       />
//     </button>
//   );
// }

// /* =========================================================
//    HOME PAGE
//    ========================================================= */

// export default function HomePage() {
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const { getStockValue } = useStock();
//   const { data: allProducts = [] } = useCachedProducts();

//   const [search, setSearch] = useState("");
//   const [isMobile, setIsMobile] = useState(
//     typeof window !== "undefined"
//       ? window.innerWidth < 768
//       : false
//   );

//   /* =======================================================
//      RESPONSIVE
//      ======================================================= */

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth < 768);
//     };

//     window.addEventListener("resize", handleResize);

//     return () =>
//       window.removeEventListener("resize", handleResize);
//   }, []);

//   /* =======================================================
//      SEARCH
//      ======================================================= */

//   const handleSearch = (e) => {
//     e?.preventDefault();

//     const value = search.trim();

//     if (!value) return;

//     navigate(
//       `/search?search=${encodeURIComponent(value)}`
//     );
//   };

//   /* =======================================================
//      GOA PRODUCT
//      ======================================================= */

//   const goaProduct = useMemo(() => {
//     return allProducts.find(
//       (product) =>
//         Number(product?.product_id) === 10006
//     );
//   }, [allProducts]);

//   const showGoaTrip =
//     Number(goaProduct?.moq) === 1;

//   /* =======================================================
//      STOCK
//      ======================================================= */

//   const stockInfo = useMemo(() => {
//     if (!user) return null;

//     const product =
//       allProducts.find(
//         (p) => Number(p?.product_id) === 10006
//       ) || allProducts[0];

//     if (!product) return null;

//     const value = getStockValue(product);

//     return value;
//   }, [allProducts, getStockValue, user]);

//   /* =======================================================
//      CATEGORY NAVIGATION
//      ======================================================= */

//   const handleCategoryClick = (category) => {
//     if (category?.type === "spare-parts") {
//       navigate("/subcategories", {
//         state: {
//           category,
//         },
//       });
//       return;
//     }

//     if (
//       category?.subcategories &&
//       category.subcategories.length > 0
//     ) {
//       navigate("/subcategories", {
//         state: {
//           category,
//         },
//       });
//       return;
//     }

//     navigate(
//       `/category/${encodeURIComponent(
//         category.keyword
//       )}`
//     );
//   };

//   /* =======================================================
//      VISIBLE CATEGORIES
//      ======================================================= */

//   const visibleCategories = isMobile
//     ? categories.slice(0, 5)
//     : categories.slice(0, 9);

//   /* =======================================================
//      SLIDER
//      ======================================================= */

//   const sliderSettings = {
//     dots: true,
//     infinite: BANNER_IMAGES.length > 1,
//     speed: 450,
//     autoplay: BANNER_IMAGES.length > 1,
//     autoplaySpeed: 3500,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     arrows: false,
//     pauseOnHover: true,
//     swipeToSlide: true,
//     adaptiveHeight: false,
//   };

//   /* =======================================================
//      RENDER
//      ======================================================= */

//   return (
//     <>
//       <style>{homeStyles}</style>

//       <div
//         className="
//           min-h-full
//           w-full
//           bg-[#f5f7fb]
//           text-[#0f172a]
//         "
//       >
//         {/* =================================================
//             MOBILE HEADER
//         ================================================= */}

//         <div
//           className="
//             md:hidden
//             sticky
//             top-0
//             z-40
//             border-b
//             border-[#e7edf5]
//             bg-white/95
//             px-3
//             pb-2
//             pt-2.5
//             backdrop-blur-xl
//           "
//         >
//           <div className="flex items-center justify-between">
//             {/* Logo */}
//             <div className="flex items-center gap-2">
//               <div
//                 className="
//                   flex
//                   h-8
//                   w-8
//                   items-center
//                   justify-center
//                   rounded-xl
//                   bg-[#1769ff]
//                   text-xs
//                   font-black
//                   text-white
//                   shadow-[0_4px_12px_rgba(23,105,255,.2)]
//                 "
//               >
//                 M
//               </div>

//               <div>
//                 <div
//                   className="
//                     text-[15px]
//                     font-black
//                     leading-none
//                     tracking-tight
//                     text-[#101f33]
//                   "
//                 >
//                   Mak<span className="text-[#1769ff]">
//                     POWER
//                   </span>
//                 </div>

//                 <div className="mt-0.5 text-[7px] font-semibold text-[#94a3b8]">
//                   SMART SALES
//                 </div>
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               <button
//                 type="button"
//                 className="
//                   relative
//                   flex
//                   h-9
//                   w-9
//                   items-center
//                   justify-center
//                   rounded-xl
//                   border
//                   border-[#e7edf5]
//                   bg-white
//                   text-[#64748b]
//                 "
//               >
//                 <FaBell className="text-xs" />

//                 <span
//                   className="
//                     absolute
//                     right-2
//                     top-2
//                     h-1.5
//                     w-1.5
//                     rounded-full
//                     bg-red-500
//                   "
//                 />
//               </button>

//               <div
//                 className="
//                   flex
//                   h-9
//                   w-9
//                   items-center
//                   justify-center
//                   rounded-xl
//                   bg-[#eef4ff]
//                   text-xs
//                   font-bold
//                   text-[#1769ff]
//                 "
//               >
//                 {(user?.name || "U")
//                   .charAt(0)
//                   .toUpperCase()}
//               </div>
//             </div>
//           </div>

//           {/* Mobile Search */}
//           <form
//             onSubmit={handleSearch}
//             className="
//               mt-2.5
//               flex
//               h-10
//               items-center
//               rounded-xl
//               border
//               border-[#e1e8f1]
//               bg-[#f8fafc]
//               px-3
//               transition-all
//               focus-within:border-[#1769ff]
//               focus-within:bg-white
//               focus-within:ring-2
//               focus-within:ring-[#1769ff]/10
//             "
//           >
//             <FaSearch className="mr-2 text-[11px] text-[#94a3b8]" />

//             <input
//               value={search}
//               onChange={(e) =>
//                 setSearch(e.target.value)
//               }
//               placeholder="Search products..."
//               className="
//                 min-w-0
//                 flex-1
//                 bg-transparent
//                 text-[10px]
//                 font-medium
//                 text-[#334155]
//                 outline-none
//                 placeholder:text-[#94a3b8]
//               "
//             />

//             <button
//               type="submit"
//               className="
//                 flex
//                 h-6
//                 w-6
//                 items-center
//                 justify-center
//                 rounded-lg
//                 bg-[#1769ff]
//                 text-white
//               "
//             >
//               <FaSearch className="text-[8px]" />
//             </button>
//           </form>
//         </div>

//         {/* =================================================
//             CONTENT
//         ================================================= */}

//         <div
//           className="
//             mx-auto
//             w-full
//             max-w-[1500px]
//             px-3
//             py-3
//             sm:px-4
//             sm:py-4
//             lg:px-5
//             lg:py-5
//           "
//         >
//           {/* =================================================
//               DESKTOP WELCOME
//           ================================================= */}

//           <div
//             className="
//               home-fade
//               mb-4
//               hidden
//               items-center
//               justify-between
//               rounded-2xl
//               border
//               border-[#e5ebf3]
//               bg-white
//               px-5
//               py-3.5
//               shadow-[0_2px_10px_rgba(15,23,42,.025)]
//               md:flex
//             "
//           >
//             <div className="flex items-center gap-3">
//               <div
//                 className="
//                   flex
//                   h-10
//                   w-10
//                   items-center
//                   justify-center
//                   rounded-xl
//                   bg-[#eef4ff]
//                   text-lg
//                 "
//               >
//                 👋
//               </div>

//               <div>
//                 <h1
//                   className="
//                     text-base
//                     font-extrabold
//                     text-[#0f172a]
//                     lg:text-lg
//                   "
//                 >
//                   Welcome back,{" "}
//                   {user?.name || "there"}!
//                 </h1>

//                 <p className="mt-0.5 text-[10px] font-medium text-[#94a3b8]">
//                   Here’s your quick access to products,
//                   schemes and latest updates.
//                 </p>
//               </div>
//             </div>

//             <div
//               className="
//                 flex
//                 items-center
//                 gap-2.5
//                 rounded-xl
//                 border
//                 border-[#e5ebf3]
//                 bg-[#f8fafc]
//                 px-3
//                 py-2
//               "
//             >
//               <FaCalendarAlt className="text-[#1769ff]" />

//               <div>
//                 <p className="text-[9px] font-bold text-[#334155]">
//                   {new Date().toLocaleDateString(
//                     "en-IN",
//                     {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                     }
//                   )}
//                 </p>

//                 <p className="text-[8px] text-[#94a3b8]">
//                   {new Date().toLocaleDateString(
//                     "en-IN",
//                     {
//                       weekday: "long",
//                     }
//                   )}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* =================================================
//               MOBILE DATE / WELCOME
//           ================================================= */}

//           <div
//             className="
//               mb-3
//               flex
//               items-center
//               justify-between
//               rounded-xl
//               border
//               border-[#e5ebf3]
//               bg-white
//               px-3
//               py-2.5
//               md:hidden
//             "
//           >
//             <div>
//               <p className="text-[11px] font-extrabold text-[#0f172a]">
//                 Welcome back, {user?.name || "there"}!
//               </p>

//               <p className="mt-0.5 text-[8px] font-medium text-[#94a3b8]">
//                 Explore products & latest updates
//               </p>
//             </div>

//             <div
//               className="
//                 flex
//                 items-center
//                 gap-1.5
//                 rounded-lg
//                 bg-[#eef4ff]
//                 px-2
//                 py-1.5
//                 text-[#1769ff]
//               "
//             >
//               <FaCalendarAlt className="text-[9px]" />

//               <span className="text-[8px] font-bold">
//                 {new Date().toLocaleDateString(
//                   "en-IN",
//                   {
//                     day: "2-digit",
//                     month: "short",
//                   }
//                 )}
//               </span>
//             </div>
//           </div>

//           {/* =================================================
//               CATEGORY SECTION
//           ================================================= */}

//           <section
//             className="
//               home-fade
//               mb-4
//               overflow-hidden
//               rounded-2xl
//               border
//               border-[#e5ebf3]
//               bg-white
//               shadow-[0_2px_10px_rgba(15,23,42,.025)]
//             "
//           >
//             <div
//               className="
//                 flex
//                 items-center
//                 justify-between
//                 border-b
//                 border-[#edf1f6]
//                 px-3
//                 py-2.5
//                 sm:px-4
//               "
//             >
//               <div className="flex items-center gap-2">
//                 <span className="h-4 w-1 rounded-full bg-[#1769ff]" />

//                 <h2 className="text-xs font-extrabold text-[#0f172a] sm:text-sm">
//                   Categories
//                 </h2>
//               </div>

//               <button
//                 type="button"
//                 onClick={() =>
//                   navigate("/all-categories")
//                 }
//                 className="
//                   flex
//                   items-center
//                   gap-1
//                   text-[9px]
//                   font-bold
//                   text-[#1769ff]
//                 "
//               >
//                 View All
//                 <FaArrowRight className="text-[7px]" />
//               </button>
//             </div>

//             <div
//               className="
//                 flex
//                 gap-4
//                 overflow-x-auto
//                 px-3
//                 py-3
//                 scrollbar-hide
//                 sm:justify-between
//                 sm:px-5
//               "
//             >
//               {visibleCategories.map(
//                 (category, index) => (
//                   <CategoryItem
//                     key={`${category.keyword}-${index}`}
//                     category={category}
//                     onClick={() =>
//                       handleCategoryClick(category)
//                     }
//                   />
//                 )
//               )}

//               {/* Desktop More */}
//               <button
//                 type="button"
//                 onClick={() =>
//                   navigate("/all-categories")
//                 }
//                 className="
//                   group
//                   hidden
//                   min-w-[82px]
//                   flex-col
//                   items-center
//                   gap-1.5
//                   outline-none
//                   sm:flex
//                 "
//               >
//                 <div
//                   className="
//                     flex
//                     h-[70px]
//                     w-[70px]
//                     items-center
//                     justify-center
//                     rounded-full
//                     border
//                     border-[#e4eaf2]
//                     bg-[#f8fafc]
//                     text-[#1769ff]
//                     shadow-[0_2px_8px_rgba(15,23,42,.03)]
//                     transition-all
//                     duration-250
//                     group-hover:-translate-y-1
//                     group-hover:border-[#cfe0ff]
//                     group-hover:bg-[#eef4ff]
//                   "
//                 >
//                   <FaChevronRight />
//                 </div>

//                 <span className="text-[10px] font-semibold text-[#64748b]">
//                   More
//                 </span>
//               </button>
//             </div>
//           </section>

//           {/* =================================================
//               HERO + QUICK ACTIONS
//           ================================================= */}

//           <section
//             className="
//               mb-5
//               grid
//               grid-cols-1
//               gap-3
//               lg:grid-cols-[minmax(0,2.2fr)_minmax(270px,.9fr)]
//             "
//           >
//             {/* HERO */}
//             <div
//               className="
//                 home-scale
//                 relative
//                 min-w-0
//                 overflow-hidden
//                 rounded-2xl
//                 border
//                 border-[#e5ebf3]
//                 bg-white
//                 shadow-[0_4px_18px_rgba(15,23,42,.05)]
//               "
//             >
//               {BANNER_IMAGES.length > 0 ? (
//                 <Slider {...sliderSettings}>
//                   {BANNER_IMAGES.map(
//                     (banner, index) => (
//                       <div
//                         key={`${banner}-${index}`}
//                         className="outline-none"
//                       >
//                         <div
//                           className="
//                             relative
//                             aspect-[16/6.5]
//                             w-full
//                             overflow-hidden
//                             bg-[#edf2f7]
//                             sm:aspect-[16/6]
//                           "
//                         >
//                           <img
//                             src={banner}
//                             alt={`MakPOWER banner ${
//                               index + 1
//                             }`}
//                             loading={
//                               index === 0
//                                 ? "eager"
//                                 : "lazy"
//                             }
//                             className="
//                               h-full
//                               w-full
//                               object-cover
//                             "
//                           />
//                         </div>
//                       </div>
//                     )
//                   )}
//                 </Slider>
//               ) : (
//                 <div
//                   className="
//                     flex
//                     aspect-[16/6.5]
//                     items-center
//                     justify-center
//                     bg-gradient-to-br
//                     from-[#0d2340]
//                     via-[#123966]
//                     to-[#1769ff]
//                     sm:aspect-[16/6]
//                   "
//                 >
//                   <div className="text-center">
//                     <p className="text-[9px] font-bold uppercase tracking-[3px] text-blue-200">
//                       MakPOWER
//                     </p>

//                     <h2 className="mt-1 text-xl font-black text-white sm:text-3xl">
//                       Feel the{" "}
//                       <span className="text-[#55a5ff]">
//                         Power
//                       </span>
//                     </h2>

//                     <p className="mt-1 text-[9px] text-blue-100 sm:text-[11px]">
//                       Premium products for your
//                       business
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* QUICK ACTIONS */}

//             <div
//               className="
//                 grid
//                 grid-cols-3
//                 gap-2
//                 lg:grid-cols-1
//                 lg:gap-3
//               "
//             >
//               <QuickActionCard
//                 delay={40}
//                 icon={
//                   <FaFilePdf className="text-base text-white" />
//                 }
//                 title="Product PDF"
//                 subtitle="Download product catalog"
//                 iconClass="bg-[#6738f5]"
//                 onClick={() =>
//                   navigate("/product-images-pdf")
//                 }
//               />

//               <QuickActionCard
//                 delay={80}
//                 icon={
//                   <FaRocket className="text-base text-white" />
//                 }
//                 title="New Launching"
//                 subtitle="Latest products"
//                 iconClass="bg-[#ff9f1c]"
//                 onClick={() =>
//                   navigate("/new-launching")
//                 }
//               />

//               <QuickActionCard
//                 delay={120}
//                 icon={
//                   <FaFireAlt className="text-base text-white" />
//                 }
//                 title="New Tempered"
//                 subtitle="Latest tempered"
//                 iconClass="bg-[#1769ff]"
//                 onClick={() =>
//                   navigate(
//                     "/tempered/NEW%20SOLDIER%20TEMPERED"
//                   )
//                 }
//               />
//             </div>
//           </section>

//           {/* =================================================
//               GOA TRIP
//           ================================================= */}

//           {showGoaTrip && (
//             <button
//               type="button"
//               onClick={() =>
//                 navigate("/goa-couple-trip-schemes")
//               }
//               className="
//                 home-float
//                 fixed
//                 right-3
//                 top-1/2
//                 z-30
//                 flex
//                 h-14
//                 w-12
//                 -translate-y-1/2
//                 flex-col
//                 items-center
//                 justify-center
//                 gap-0.5
//                 rounded-2xl
//                 bg-[#1769ff]
//                 text-white
//                 shadow-[0_8px_25px_rgba(23,105,255,.3)]
//                 transition-transform
//                 duration-200
//                 hover:scale-105
//                 md:right-5
//                 md:h-16
//                 md:w-14
//               "
//             >
//               <FaPlaneDeparture className="text-sm" />

//               <span className="text-[7px] font-black leading-none">
//                 GOA
//               </span>

//               <span className="text-[7px] font-bold leading-none">
//                 TRIP
//               </span>
//             </button>
//           )}

//           {/* =================================================
//               TOP SELLING
//           ================================================= */}

//           <section
//             className="
//               home-fade
//               overflow-hidden
//             "
//           >
//             <div
//               className="
//                 mb-2.5
//                 flex
//                 items-center
//                 justify-between
//               "
//             >
//               <div className="flex items-center gap-2">
//                 <span className="h-5 w-1 rounded-full bg-[#1769ff]" />

//                 <div>
//                   <h2
//                     className="
//                       text-sm
//                       font-extrabold
//                       text-[#0f172a]
//                       sm:text-base
//                     "
//                   >
//                     Top Selling Products
//                   </h2>

//                   <p className="hidden text-[9px] font-medium text-[#94a3b8] sm:block">
//                     Popular products customers are
//                     buying
//                   </p>
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={() =>
//                   navigate("/all-categories")
//                 }
//                 className="
//                   flex
//                   items-center
//                   gap-1
//                   text-[9px]
//                   font-bold
//                   text-[#1769ff]
//                   sm:text-[10px]
//                 "
//               >
//                 View All
//                 <FaArrowRight className="text-[7px]" />
//               </button>
//             </div>

//             <SlidingProductsCards
//               trendingIds={TRENDING_IDS}
//               title=""
//             />
//           </section>
//         </div>
//       </div>
//     </>
//   );
// }