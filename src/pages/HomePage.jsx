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
  const trendingIds = [1, 45, 74, 123, 1870, 717, 1120, 111, 1708];

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
      top-1/2
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

      <SlidingProductsCards trendingIds={trendingIds} title={"Top Selling Products."} />
      {/* <SlidingProductsCards trendingIds={schemeIds} title={"Special Scheme Products"} /> */}

    </div>
  );
}
