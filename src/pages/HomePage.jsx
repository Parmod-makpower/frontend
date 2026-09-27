// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaSearch, FaBell, FaGift, FaPlaneDeparture, FaRocket, FaFireAlt, FaFilePdf, FaDownload, FaChevronRight, FaImages } from "react-icons/fa";
// import Slider from "react-slick";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
// import logo from "../assets/images/logo.png";
// import categories from "../data/categoryData";
// import SlidingProductsCards from "../components/SlidingProductsCards";
// import { useStock } from "../context/StockContext";
// import { useCachedProducts } from "../hooks/useCachedProducts";


// export default function HomePage() {
//   const navigate = useNavigate();
//   const { stockType } = useStock();

//   const [searchText, setSearchText] = useState("");
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
//   const stockLetter = stockType === "mumbai" ? "M" : "D";
//   const stockColor =
//     stockType === "mumbai" ? "bg-green-600" : "bg-red-600";
//   const { data: allProducts = [] } = useCachedProducts();
//   const mahotsavProduct = allProducts.find(
//     (p) => p.product_id === 10006
//   );

//   const showMahotsavButton = mahotsavProduct?.moq === 1;


//   // Responsive listener
//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth < 768);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const handleRedirect = () => {
//     navigate(`/search?search=${encodeURIComponent(searchText.trim())}`);
//   };

//   const sliderSettings = {
//     dots: true,
//     infinite: true,
//     speed: 500,
//     autoplay: true,
//     autoplaySpeed: 3000,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     arrows: false,
//   };

//   // यहाँ आप top selling की लिस्ट रखेंगे
//   const trendingIds = [2, 45, 74, 123, 1870, 717, 1120, 111,700, 205];

//   const schemeIds = [1142, 18, 119, 60, 69, 33, 1730, 1653];

//   return (
//     <div className="mx-auto p-4 pb-25">
//       {/* 🔝 Top Bar */}
//       <div className="md:hidden flex justify-between items-center mb-4">
//         <img
//           src={logo}
//           className="w-40"
//           alt="MakPower Logo"
//         />
//         <div className="block sm:hidden text-xl text-[var(--primary-color)]">
//           {/* <FaBell /> */}
//           <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold text-white ${stockColor}`}
//             title={stockType === "mumbai" ? "Mumbai Stock" : "Delhi Stock"} >{stockLetter} </span>
//         </div>
//       </div>

//       {/* 🔍 Search */}
//       <div className="md:hidden relative mb-6 ">
//         <input
//           type="text"
//           value={searchText}
//           onChange={(e) => setSearchText(e.target.value)}
//           onClick={handleRedirect}
//           placeholder="Search for products..."
//           className="w-full p-2.5 sm:p-3 pl-4 pr-10 rounded-full border text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
//         />
//         <button
//           onClick={handleRedirect}
//           className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] hover:text-blue-800"
//         >
//           <FaSearch />
//         </button>
//       </div>


//       {/* 📂 Categories */}
//       <div className="overflow-x-auto no-scrollbar flex gap-2 mb-6 px-1 lg:justify-center">
//         {categories.slice(0, isMobile ? 8 : 9).map((cat) => {
//           const hasSubcategories = cat.subcategories && cat.subcategories.length > 0;

//           return (
//             <div
//               key={cat.label}
//               onClick={() =>
//                 hasSubcategories
//                   ? navigate(`/category/${encodeURIComponent(cat.keyword)}/subcategories`)
//                   : navigate(`/category/${encodeURIComponent(cat.keyword)}`)
//               }
//               className="flex-shrink-0 flex flex-col items-center cursor-pointer w-20 md:w-28 lg:w-32 group "
//             >
//               <div className="overflow-hidden rounded-full shadow transition-all duration-300 group-hover:shadow-lg">
//                 <img
//                   src={cat.image}
//                   alt={cat.label}
//                   className="w-16 h-16 md:w-24 md:h-24 lg:w-22 lg:h-22 object-cover transform group-hover:scale-150 transition duration-300 rounded-full bg-gray-200"
//                 />
//               </div>
//               <span className="mt-1 text-[12px] md:text-sm lg:text-base text-center text-gray-700 font-medium group-hover:text-[var(--primary-color)] transition">
//                 {cat.label}
//               </span>
//             </div>
//           );
//         })}

//         {/* ➕ View All button */}
//         <div
//           onClick={() => navigate("/all-categories")}
//           className="flex-shrink-0 flex flex-col items-center cursor-pointer w-20 md:w-28 lg:w-32"
//         >
//           <div className="w-16 h-16 md:w-24 md:h-24 lg:w-22 lg:h-22 rounded-full border flex items-center justify-center text-sm text-gray-500 hover:bg-gray-200 transition-all duration-300">
//             View All
//           </div>
//           <span className="mt-1 text-[10px] md:text-sm text-center text-gray-500 font-medium">
//             More
//           </span>
//         </div>
//       </div>


//       {/* 🎞️ Image Slider */}
//       <div className="mb-8 rounded-xl overflow-hidden">
//         <Slider {...sliderSettings}>
//           <img
//             src="https://makpowerindia.com/cdn/shop/files/f7arm7foserysccse9fa.webp?v=1742894610&width=2000"
//             alt="banner1"
//             className="w-full h-48 md:h-64 lg:h-100 object-cover"
//           />
//           <img
//             src="https://makpowerindia.com/cdn/shop/files/krxntlvftutoe0p5tsjd.webp?v=1744890344&width=2000"
//             alt="banner2"
//             className="w-full h-48 md:h-64 lg:h-100 object-cover"
//           />
//           <img
//             src="https://makpowerindia.com/cdn/shop/files/irii2fisadlfkmal0hpn.webp?v=1753181679&width=2000"
//             alt="banner3"
//             className="w-full h-48 md:h-64 lg:h-100 object-cover"
//           />
//         </Slider>
//       </div>

//       {/* =========================================================
//     FIXED GOA TRIP BUTTON
// ========================================================= */}

//       {showMahotsavButton && (
//         <button
//           onClick={() => navigate("/goa-couple-trip-schemes")}
//           className="
//       fixed
//       right-2
//       sm:right-4
//       top-1/3
//       -translate-y-1/2
//       z-50

//       w-16
//       sm:w-14

//       py-2.5
//       sm:py-3

//       rounded-2xl

//       bg-gradient-to-b
//       from-cyan-500
//       via-blue-600
//       to-indigo-700

//       text-white

//       flex
//       flex-col
//       items-center
//       justify-center
//       gap-1

//       shadow-[0_8px_25px_rgba(37,99,235,0.35)]

//       border
//       border-white/30

//       hover:scale-105
//       active:scale-95

//       transition-all
//       duration-200
//     "
//         >
//           <FaPlaneDeparture className="text-base sm:text-lg" />

//           <span className="text-[8px] sm:text-[9px] font-extrabold leading-none">
//             GOA
//           </span>

//           <span className="text-[7px] sm:text-[8px] font-medium opacity-90 leading-none">
//             TRIP
//           </span>
//         </button>
//       )}


//       {/* =========================================================
//     QUICK ACTION CARDS
//     PDF + NEW LAUNCHING + NEW TEMPERED,,,,,
// ========================================================= */}

//       <div className="mt-6 mb-7">

//         <div className="
//     grid
//     grid-cols-3
//     gap-2
//     sm:gap-3
//     lg:gap-4
//   ">


//           {/* =====================================================
//         PRODUCT PDF......
//     ===================================================== */}

//           <div
//             onClick={() =>
//               navigate("/product-images-pdf")
//             }
//             className="
//         group
//         relative
//         overflow-hidden
//         cursor-pointer

//         rounded-2xl
//         sm:rounded-3xl

//         border
//         border-indigo-100

//         bg-gradient-to-br
//         from-indigo-50
//         via-white
//         to-purple-50

//         p-2.5
//         sm:p-4
//         lg:p-5
//         shadow-sm
//         hover:shadow-md
//         active:scale-[0.97]
//         transition-all
//         duration-200
//       "
//           >

//             {/* Decorative circle */}

//             <div className="
//         absolute
//         -right-5
//         -top-5
//         w-16
//         h-16
//         sm:w-24
//         sm:h-24
//         rounded-full
//         bg-indigo-100/60
//       " />

//             <div className="
//         relative
//         flex
//         flex-col
//         items-center
//         text-center
//       ">

//               {/* Icon */}

//               <div className="
//           w-9
//           h-9
//           sm:w-11
//           sm:h-11
//           lg:w-12
//           lg:h-12

//           rounded-xl
//           sm:rounded-2xl

//           bg-gradient-to-br
//           from-indigo-600
//           to-purple-600

//           text-white

//           flex
//           items-center
//           justify-center

//           shadow-sm

//           group-hover:scale-105

//           transition-transform
//         ">
//                 <FaFilePdf className="
//             text-base
//             sm:text-lg
//             lg:text-xl
//           " />
//               </div>


//               {/* Title */}

//               <h2 className="
//           mt-2
//           text-[10px]
//           sm:text-xs
//           lg:text-sm

//           font-extrabold

//           text-slate-800

//           leading-tight
//         ">
//                 Product PDF
//               </h2>


//               {/* Description */}

//               <p className="
//           hidden
//           sm:block

//           mt-1

//           text-[9px]
//           lg:text-[10px]

//           text-slate-500

//           leading-tight
//         ">
//                 Download products
//               </p>


//               {/* Action */}

//               <div className="
//           mt-2

//           flex
//           items-center
//           gap-1

//           text-[8px]
//           sm:text-[9px]
//           lg:text-[10px]

//           font-bold

//           text-indigo-600
//         ">
//                 <FaDownload />

//                 <span>
//                   Download
//                 </span>

//                 <span className="
//             group-hover:translate-x-0.5
//             transition-transform
//           ">
//                   →
//                 </span>
//               </div>

//             </div>

//           </div>



//           {/* =====================================================
//         NEW LAUNCHING
//     ===================================================== */}

//           <div
//             onClick={() =>
//               navigate("/new-launching")
//             }
//             className="
//         group
//         relative
//         overflow-hidden
//         cursor-pointer

//         rounded-2xl
//         sm:rounded-3xl

//         border
//         border-orange-100

//         bg-gradient-to-br
//         from-orange-50
//         via-white
//         to-amber-50

//         p-2.5
//         sm:p-4
//         lg:p-5

//         shadow-sm
//         hover:shadow-md

//         active:scale-[0.97]

//         transition-all
//         duration-200
//       "
//           >

//             {/* Decorative circle */}

//             <div className="
//         absolute
//         -right-5
//         -top-5
//         w-16
//         h-16
//         sm:w-24
//         sm:h-24
//         rounded-full
//         bg-orange-100/60
//       " />


//             <div className="
//         relative
//         flex
//         flex-col
//         items-center
//         text-center
//       ">

//               {/* Icon */}

//               <div className="
//           w-9
//           h-9
//           sm:w-11
//           sm:h-11
//           lg:w-12
//           lg:h-12

//           rounded-xl
//           sm:rounded-2xl

//           bg-orange-100
//           text-orange-500

//           flex
//           items-center
//           justify-center

//           group-hover:scale-105

//           transition-transform
//         ">
//                 <FaRocket className="
//             text-base
//             sm:text-lg
//             lg:text-xl
//           " />
//               </div>


//               {/* Title */}

//               <h2 className="
//           mt-2

//           text-[10px]
//           sm:text-xs
//           lg:text-sm

//           font-extrabold

//           text-slate-800

//           leading-tight
//         ">
//                 New Launching
//               </h2>


//               {/* Description */}

//               <p className="
//           hidden
//           sm:block

//           mt-1

//           text-[9px]
//           lg:text-[10px]

//           text-slate-500

//           leading-tight
//         ">
//                 Latest products
//               </p>


//               {/* Action */}

//               <div className="
//           mt-2

//           flex
//           items-center
//           gap-1

//           text-[8px]
//           sm:text-[9px]
//           lg:text-[10px]

//           font-bold

//           text-orange-600
//         ">
//                 <span>
//                   Explore
//                 </span>

//                 <span className="
//             group-hover:translate-x-0.5
//             transition-transform
//           ">
//                   →
//                 </span>
//               </div>

//             </div>

//           </div>



//           {/* =====================================================
//         NEW TEMPERED
//     ===================================================== */}

//           <div
//             onClick={() =>
//               navigate("/tempered/NEW%20SOLDIER%20TEMPERED")
//             }
//             className="
//         group
//         relative
//         overflow-hidden
//         cursor-pointer

//         rounded-2xl
//         sm:rounded-3xl

//         border
//         border-blue-100

//         bg-gradient-to-br
//         from-blue-50
//         via-white
//         to-cyan-50

//         p-2.5
//         sm:p-4
//         lg:p-5

//         shadow-sm
//         hover:shadow-md

//         active:scale-[0.97]

//         transition-all
//         duration-200
//       "
//           >

//             {/* Decorative circle */}

//             <div className="
//         absolute
//         -right-5
//         -top-5
//         w-16
//         h-16
//         sm:w-24
//         sm:h-24
//         rounded-full
//         bg-blue-100/60
//       " />


//             <div className="
//         relative
//         flex
//         flex-col
//         items-center
//         text-center
//       ">

//               {/* Icon */}

//               <div className="
//           w-9
//           h-9
//           sm:w-11
//           sm:h-11
//           lg:w-12
//           lg:h-12

//           rounded-xl
//           sm:rounded-2xl

//           bg-blue-100
//           text-blue-500

//           flex
//           items-center
//           justify-center

//           group-hover:scale-105

//           transition-transform
//         ">
//                 <FaFireAlt className="
//             text-base
//             sm:text-lg
//             lg:text-xl
//           " />
//               </div>


//               {/* Title */}

//               <h2 className="
//           mt-2

//           text-[10px]
//           sm:text-xs
//           lg:text-sm

//           font-extrabold

//           text-slate-800

//           leading-tight
//         ">
//                 New Tempered
//               </h2>

//               {/* Description */}

//               <p className="
//           hidden
//           sm:block

//           mt-1

//           text-[9px]
//           lg:text-[10px]

//           text-slate-500

//           leading-tight
//         ">
//                 Latest tempered
//               </p>


//               {/* Action */}

//               <div className="
//           mt-2

//           flex
//           items-center
//           gap-1

//           text-[8px]
//           sm:text-[9px]
//           lg:text-[10px]

//           font-bold

//           text-blue-600
//         ">
//                 <span>
//                   View Products
//                 </span>

//                 <span className="
//             group-hover:translate-x-0.5
//             transition-transform
//           ">
//                   →
//                 </span>
//               </div>

//             </div>

//           </div>

//         </div>

//       </div>

//       <SlidingProductsCards trendingIds={trendingIds} title={"Top Selling Products"} />
//       {/* <SlidingProductsCards trendingIds={schemeIds} title={"Special Scheme Products"} /> */}

//     </div>
//   );
// }



import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaSearch,
  FaPlaneDeparture,
  FaRocket,
  FaFireAlt,
  FaFilePdf,
  FaDownload,
  FaChevronRight,
  FaImages,
} from "react-icons/fa";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import logo from "../assets/images/logo.png";
import categories from "../data/categoryData";
import SlidingProductsCards from "../components/SlidingProductsCards";

import { useStock } from "../context/StockContext";
import { useCachedProducts } from "../hooks/useCachedProducts";

/* =========================================================
   QUICK ACTION CARD
========================================================= */

function QuickActionCard({
  icon,
  title,
  description,
  action,
  onClick,
  variant = "orange",
}) {
  const variants = {
    orange: {
      wrapper:
        "border-orange-100 bg-gradient-to-br from-orange-50 via-white to-red-50",
      circle: "bg-orange-100/70",
      icon: "bg-[#fff1ee] text-[#fc250c] ring-1 ring-[#ffdcd5]",
      action: "text-[#fc250c]",
    },

    red: {
      wrapper:
        "border-red-100 bg-gradient-to-br from-red-50 via-white to-orange-50",
      circle: "bg-red-100/60",
      icon: "bg-[#fc250c] text-white shadow-[0_5px_14px_rgba(252,37,12,0.20)]",
      action: "text-[#fc250c]",
    },

    warm: {
      wrapper:
        "border-orange-100 bg-gradient-to-br from-amber-50 via-white to-orange-50",
      circle: "bg-orange-100/60",
      icon: "bg-orange-100 text-orange-600 ring-1 ring-orange-200",
      action: "text-orange-600",
    },
  };

  const theme = variants[variant] || variants.orange;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        relative
        min-w-0
        overflow-hidden
        rounded-[19px]
        sm:rounded-[22px]
        border
        ${theme.wrapper}

        p-2.5
        sm:p-4

        text-left

        shadow-[0_3px_14px_rgba(15,23,42,0.045)]

        transition-all
        duration-300
        ease-out

        hover:-translate-y-1
        hover:shadow-[0_10px_25px_rgba(15,23,42,0.09)]

        active:scale-[0.965]
        active:translate-y-0

        focus:outline-none
      `}
    >
      {/* Decorative circle */}

      <div
        className={`
          pointer-events-none
          absolute
          -right-6
          -top-6
          h-16
          w-16
          rounded-full
          sm:h-20
          sm:w-20
          ${theme.circle}

          transition-transform
          duration-500
          group-hover:scale-125
        `}
      />

      {/* Small shine */}

      <div
        className="
          pointer-events-none
          absolute
          right-0
          top-0
          h-full
          w-1/2
          bg-gradient-to-l
          from-white/40
          to-transparent
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-100
        "
      />

      <div className="relative flex flex-col items-center text-center">
        {/* Icon */}

        <div
          className={`
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-[12px]

            sm:h-11
            sm:w-11
            sm:rounded-[14px]

            ${theme.icon}

            transition-all
            duration-300

            group-hover:scale-110
            group-hover:-rotate-2
          `}
        >
          {icon}
        </div>

        {/* Title */}

        <h3
          className="
            mt-2.5
            text-[9px]
            font-extrabold
            leading-tight
            tracking-[-0.1px]
            text-slate-800

            sm:text-[11px]
            md:text-xs
          "
        >
          {title}
        </h3>

        {/* Description */}

        <p
          className="
            mt-1
            hidden
            text-[8px]
            leading-tight
            text-slate-400
            sm:block
            sm:text-[9px]
          "
        >
          {description}
        </p>

        {/* Action */}

        <div
          className={`
            mt-2
            flex
            items-center
            gap-1
            text-[7px]
            font-extrabold
            sm:text-[9px]
            ${theme.action}
          `}
        >
          {action}

          <FaChevronRight
            className="
              text-[7px]
              transition-transform
              duration-200
              group-hover:translate-x-1
            "
          />
        </div>
      </div>
    </button>
  );
}

/* =========================================================
   CATEGORY ITEM
========================================================= */

function CategoryItem({ category, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        flex
        w-[72px]
        shrink-0
        flex-col
        items-center

        sm:w-[82px]
        md:w-[92px]

        focus:outline-none
      "
    >
      {/* Image */}

      <div
        className="
          relative
          flex
          h-[62px]
          w-[62px]
          items-center
          justify-center

          overflow-hidden
          rounded-full

          bg-slate-100

          ring-1
          ring-slate-200/80

          shadow-[0_3px_12px_rgba(15,23,42,0.07)]

          transition-all
          duration-300
          ease-out

          group-hover:-translate-y-1
          group-hover:shadow-[0_8px_18px_rgba(15,23,42,0.12)]

          group-active:scale-90

          sm:h-[70px]
          sm:w-[70px]

          md:h-[76px]
          md:w-[76px]
        "
      >
        <img
          src={category.image}
          alt={category.label}
          loading="lazy"
          decoding="async"
          draggable="false"
          className="
            h-full
            w-full
            rounded-full
            object-cover

            transition-transform
            duration-500
            ease-out

            group-hover:scale-110
          "
        />

        {/* Bottom highlight */}

        <span
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            h-1/3
            bg-gradient-to-t
            from-black/10
            to-transparent
            opacity-0
            transition-opacity
            duration-300
            group-hover:opacity-100
          "
        />
      </div>

      {/* Label */}

      <span
        className="
          mt-2
          line-clamp-2
          w-full
          text-center
          text-[9px]
          font-semibold
          leading-[12px]
          text-slate-600

          transition-colors
          duration-200

          group-hover:text-[#fc250c]

          sm:text-[10px]
          sm:leading-[13px]
        "
      >
        {category.label}
      </span>
    </button>
  );
}

/* =========================================================
   HOME PAGE
========================================================= */

export default function HomePage() {
  const navigate = useNavigate();

  const { stockType } = useStock();

  const [searchText, setSearchText] = useState("");

  const stockLetter = stockType === "mumbai" ? "M" : "D";

  const stockColor =
    stockType === "mumbai" ? "bg-emerald-500" : "bg-[#fc250c]";

  const { data: allProducts = [] } = useCachedProducts();

  /* =======================================================
     MAHOTSAV / GOA BUTTON
  ======================================================= */

  const mahotsavProduct = allProducts.find(
    (product) => product.product_id === 10006
  );

  const showMahotsavButton = mahotsavProduct?.moq === 1;

  /* =======================================================
     SEARCH
  ======================================================= */

  const handleRedirect = () => {
    navigate(
      `/search?search=${encodeURIComponent(searchText.trim())}`
    );
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleRedirect();
    }
  };

  /* =======================================================
     CATEGORY NAVIGATION
  ======================================================= */

  const handleCategoryClick = (category) => {
    const hasSubcategories =
      Array.isArray(category.subcategories) &&
      category.subcategories.length > 0;

    if (hasSubcategories) {
      navigate(
        `/category/${encodeURIComponent(
          category.keyword
        )}/subcategories`
      );

      return;
    }

    navigate(
      `/category/${encodeURIComponent(category.keyword)}`
    );
  };

  /* =======================================================
     SLIDER
  ======================================================= */

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 550,
    autoplay: true,
    autoplaySpeed: 3500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    pauseOnHover: true,
    swipeToSlide: true,
    adaptiveHeight: false,
  };

  /* =======================================================
     PRODUCT IDS
  ======================================================= */

  const trendingIds = [
    2,
    45,
    74,
    123,
    1870,
    717,
    1120,
    111,
    700,
    205,
  ];

  // Kept for existing future use.
  const schemeIds = [
    1142,
    18,
    119,
    60,
    69,
    33,
    1730,
    1653,
  ];

  return (
    <>
      {/* =====================================================
          PAGE STYLE / ANIMATION
      ====================================================== */}

      <style>
        {`
          @keyframes homeFadeUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes homeCategoryIn {
            from {
              opacity: 0;
              transform: translateY(8px) scale(.96);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .home-page-enter {
            animation:
              homeFadeUp
              420ms
              cubic-bezier(.22,1,.36,1)
              both;
          }

          .home-category-item {
            animation:
              homeCategoryIn
              420ms
              cubic-bezier(.22,1,.36,1)
              both;
          }

          .home-slider .slick-dots {
            bottom: 8px;
          }

          .home-slider .slick-dots li {
            margin: 0 2px;
          }

          .home-slider .slick-dots li button:before {
            font-size: 6px;
            color: white;
            opacity: .65;
          }

          .home-slider .slick-dots li.slick-active button:before {
            color: #fc250c;
            opacity: 1;
          }

          @media (max-width: 767px) {
            .home-slider .slick-dots {
              bottom: 7px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .home-page-enter,
            .home-category-item {
              animation: none !important;
            }

            *,
            *::before,
            *::after {
              scroll-behavior: auto !important;
              transition-duration: .01ms !important;
            }
          }
        `}
      </style>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main
        className="
          home-page-enter
          min-h-screen
          bg-[#f5f7f8]
          pb-28
        "
      >
        <div
          className="
            mx-auto
            w-full
          

            px-3
            sm:px-5
            md:px-7
            lg:px-8
          "
        >
          {/* =================================================
              MOBILE / COMMON HEADER
          ================================================= */}
<div className="sm:hidden">
          <header
            className="
              flex
              items-center
              justify-between

              pt-3
              sm:pt-5

              md:pt-6
            "
          >
            {/* Logo */}

            <button
              type="button"
              onClick={() => navigate("/")}
              className="
                shrink-0
                outline-none
                transition-transform
                duration-200
                active:scale-95
              "
            >
              <img
                src={logo}
                alt="MakPower Logo"
                draggable="false"
                className="
                  h-auto
                  w-[142px]
                  object-contain

                  sm:w-[158px]
                  md:w-[175px]
                "
              />
            </button>

            {/* Stock */}

            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <span
                className="
                  hidden
                  text-[9px]
                  font-semibold
                  text-slate-400
                  sm:block
                "
              >
                {stockType === "mumbai"
                  ? "Mumbai Stock"
                  : "Delhi Stock"}
              </span>

              <span
                title={
                  stockType === "mumbai"
                    ? "Mumbai Stock"
                    : "Delhi Stock"
                }
                className={`
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  text-[10px]
                  font-extrabold
                  text-white
                  shadow-sm

                  ${stockColor}
                `}
              >
                {stockLetter}
              </span>
            </div>
          </header>

          {/* =================================================
              SEARCH
          ================================================= */}

          <section
            className="
              mt-4
              sm:mt-5
              md:mt-6
            "
          >
            <div
              className="
                group
                relative
              "
            >
              <input
                type="text"
                value={searchText}
                onChange={(event) =>
                  setSearchText(event.target.value)
                }
                onKeyDown={handleSearchKeyDown}
                onClick={() => {
                  // Preserve existing behavior:
                  // clicking search opens search page.
                  if (!searchText.trim()) {
                    handleRedirect();
                  }
                }}
                placeholder="Search for products..."
                autoComplete="off"
                className="
                  h-[42px]
                  w-full

                  rounded-full

                  border
                  border-slate-200

                  bg-white

                  pl-4
                  pr-12

                  text-[11px]
                  font-medium
                  text-slate-700

                  shadow-[0_3px_14px_rgba(15,23,42,0.045)]

                  outline-none

                  placeholder:text-slate-400

                  transition-all
                  duration-200

                  focus:border-[#ffb7aa]
                  focus:ring-4
                  focus:ring-[#fff1ee]

                  sm:h-[46px]
                  sm:text-xs
                "
              />

              <button
                type="button"
                onClick={handleRedirect}
                aria-label="Search"
                className="
                  absolute
                  right-1.5
                  top-1/2
                  flex
                  h-8
                  w-8
                  -translate-y-1/2
                  items-center
                  justify-center

                  rounded-full

                  bg-[#fff1ee]
                  text-[#fc250c]

                  transition-all
                  duration-200

                  hover:bg-[#fc250c]
                  hover:text-white

                  active:scale-90
                "
              >
                <FaSearch className="text-[12px]" />
              </button>
            </div>
          </section>
</div>
          {/* =================================================
              CATEGORY SHORTCUTS
          ================================================= */}

          <section className="mt-5 sm:mt-6">
            <div
              className="
                flex
                gap-3

                overflow-x-auto
                px-0.5
                pb-2

                no-scrollbar

                md:justify-center
                md:overflow-visible
              "
              style={{
                scrollbarWidth: "none",
              }}
            >
              {categories.slice(0, 8).map((category, index) => (
                <div
                  key={category.label}
                  className="home-category-item"
                  style={{
                    animationDelay: `${index * 35}ms`,
                  }}
                >
                  <CategoryItem
                    category={category}
                    onClick={() =>
                      handleCategoryClick(category)
                    }
                  />
                </div>
              ))}

              {/* View All */}

              <button
                type="button"
                onClick={() => navigate("/all-categories")}
                className="
                  group
                  flex
                  w-[72px]
                  shrink-0
                  flex-col
                  items-center
                  outline-none

                  sm:w-[82px]
                  md:w-[92px]
                "
              >
                <div
                  className="
                    flex
                    h-[62px]
                    w-[62px]
                    items-center
                    justify-center

                    rounded-full

                    border
                    border-dashed
                    border-[#ffb7aa]

                    bg-white

                    text-center

                    shadow-[0_3px_12px_rgba(15,23,42,0.04)]

                    transition-all
                    duration-300

                    group-hover:-translate-y-1
                    group-hover:border-[#fc250c]
                    group-hover:bg-[#fff8f6]

                    group-active:scale-90

                    sm:h-[70px]
                    sm:w-[70px]

                    md:h-[76px]
                    md:w-[76px]
                  "
                >
                  <FaImages
                    className="
                      text-[16px]
                      text-[#fc250c]
                      transition-transform
                      duration-300
                      group-hover:scale-110
                    "
                  />
                </div>

                <span
                  className="
                    mt-2
                    text-[9px]
                    font-semibold
                    text-slate-500
                    transition-colors
                    duration-200
                    group-hover:text-[#fc250c]

                    sm:text-[10px]
                  "
                >
                  View All
                </span>
              </button>
            </div>
          </section>

          {/* =================================================
              HERO BANNER
          ================================================= */}

          <section className="mt-3 sm:mt-5">
            <div
              className="
                home-slider
                overflow-hidden
                rounded-[18px]
                bg-slate-100

                shadow-[0_7px_25px_rgba(15,23,42,0.08)]

                sm:rounded-[22px]
              "
            >
              <Slider {...sliderSettings}>
                <div>
                  <img
                    src="https://makpowerindia.com/cdn/shop/files/f7arm7foserysccse9fa.webp?v=1742894610&width=2000"
                    alt="MAKPOWER Banner 1"
                    className="
                      block
                      h-[180px]
                      w-full
                      object-cover

                      sm:h-[240px]
                      md:h-[300px]
                      lg:h-[390px]
                    "
                  />
                </div>

                <div>
                  <img
                    src="https://makpowerindia.com/cdn/shop/files/krxntlvftutoe0p5tsjd.webp?v=1744890344&width=2000"
                    alt="MAKPOWER Banner 2"
                    className="
                      block
                      h-[180px]
                      w-full
                      object-cover

                      sm:h-[240px]
                      md:h-[300px]
                      lg:h-[390px]
                    "
                  />
                </div>

                <div>
                  <img
                    src="https://makpowerindia.com/cdn/shop/files/irii2fisadlfkmal0hpn.webp?v=1753181679&width=2000"
                    alt="MAKPOWER Banner 3"
                    className="
                      block
                      h-[180px]
                      w-full
                      object-cover

                      sm:h-[240px]
                      md:h-[300px]
                      lg:h-[390px]
                    "
                  />
                </div>
              </Slider>
            </div>
          </section>

          {/* =================================================
              FLOATING GOA BUTTON
          ================================================= */}

          {showMahotsavButton && (
            <button
              type="button"
              onClick={() =>
                navigate("/goa-couple-trip-schemes")
              }
              aria-label="Goa Couple Trip"
              className="
                fixed
                right-2
                top-[31%]
                z-50

                flex
                w-[58px]
                -translate-y-1/2
                flex-col
                items-center
                justify-center
                gap-0.5

                rounded-[17px]

                border
                border-white/30

                bg-gradient-to-b
                from-cyan-500
                via-blue-600
                to-indigo-700

                py-2.5

                text-white

                shadow-[0_8px_25px_rgba(37,99,235,0.30)]

                transition-all
                duration-300

                hover:scale-105
                hover:-translate-y-[52%]

                active:scale-95

                sm:right-4
                sm:w-[62px]
              "
            >
              <FaPlaneDeparture
                className="
                  text-[15px]
                  sm:text-[17px]
                "
              />

              <span
                className="
                  mt-0.5
                  text-[8px]
                  font-extrabold
                  leading-none
                  sm:text-[9px]
                "
              >
                GOA
              </span>

              <span
                className="
                  text-[7px]
                  font-medium
                  leading-none
                  opacity-90
                  sm:text-[8px]
                "
              >
                TRIP
              </span>
            </button>
          )}

          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <section className="mt-6 sm:mt-7">
            <div
              className="
                grid
                grid-cols-3
                gap-2.5

                sm:gap-3
                md:gap-4
              "
            >
              {/* PRODUCT PDF */}

              <QuickActionCard
                variant="orange"
                icon={
                  <FaFilePdf
                    className="
                      text-[15px]
                      sm:text-[18px]
                    "
                  />
                }
                title="Product PDF"
                description="Download products"
                action={
                  <>
                    <FaDownload className="text-[7px]" />
                    Download
                  </>
                }
                onClick={() =>
                  navigate("/product-images-pdf")
                }
              />

              {/* NEW LAUNCHING */}

              <QuickActionCard
                variant="warm"
                icon={
                  <FaRocket
                    className="
                      text-[15px]
                      sm:text-[18px]
                    "
                  />
                }
                title="New Launching"
                description="Latest products"
                action="Explore"
                onClick={() =>
                  navigate("/new-launching")
                }
              />

              {/* NEW TEMPERED */}

              <QuickActionCard
                variant="red"
                icon={
                  <FaFireAlt
                    className="
                      text-[15px]
                      sm:text-[18px]
                    "
                  />
                }
                title="New Tempered"
                description="Latest tempered"
                action="View Products"
                onClick={() =>
                  navigate(
                    "/tempered/NEW%20SOLDIER%20TEMPERED"
                  )
                }
              />
            </div>
          </section>

          {/* =================================================
              TOP SELLING HEADER
          ================================================= */}

          <section className="mt-7 sm:mt-8">
            <div className="mb-3 flex items-end justify-between px-1">
              <div className="flex items-center gap-2">
                <span
                  className="
                    h-[19px]
                    w-[4px]
                    rounded-full
                    bg-[#fc250c]
                    shadow-[0_2px_6px_rgba(252,37,12,0.20)]
                  "
                />

                <div>
                  <h2
                    className="
                      text-[13px]
                      font-extrabold
                      tracking-[-0.2px]
                      text-slate-800

                      sm:text-[15px]
                    "
                  >
                    Top Selling Products
                  </h2>
                </div>
              </div>

              <span
                className="
                  text-[8px]
                  font-medium
                  text-slate-400

                  sm:text-[9px]
                "
              >
                10 products
              </span>
            </div>

            {/* Existing product component */}

            <SlidingProductsCards
              trendingIds={trendingIds}
              title=""
            />
          </section>

          {/* =================================================
              SPECIAL SCHEME PRODUCTS
              EXISTING CODE PRESERVED / DISABLED
          ================================================== */}

          {/*
          <SlidingProductsCards
            trendingIds={schemeIds}
            title="Special Scheme Products"
          />
          */}
        </div>
      </main>
    </>
  );
}