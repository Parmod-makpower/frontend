

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

            {/* <button
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
            </button> */}
       

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