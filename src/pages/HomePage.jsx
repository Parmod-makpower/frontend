import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaBell } from "react-icons/fa";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import categories from "../data/categoryData";
import SlidingProductsCards from "../components/SlidingProductsCards";

export default function HomePage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

  // यहाँ आप IDs की लिस्ट रखेंगे
  const trendingIds = [92, 666,98,900];
  const schemeIds = [1,200,92,878];

  return (
    <div className="mx-auto p-4 pb-16">
      {/* 🔝 Top Bar */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <img
          src="https://makpowerindia.com/cdn/shop/files/MakPower_Mobile_Accessories_370x.webp?v=1735378281"
          className="w-40"
          alt="MakPower Logo"
        />
        <div className="block sm:hidden text-xl text-[var(--primary-color)]">
          <FaBell />
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
      <div className="overflow-x-auto no-scrollbar flex gap-4 mb-6 px-1 sm:flex-wrap sm:justify-center">
        {categories.slice(0, isMobile ? 5 : 8).map((cat) => (
          <div
            key={cat.label}
            onClick={() =>
              navigate(`/category/${encodeURIComponent(cat.keyword)}`)
            }
            className="flex-shrink-0 flex flex-col items-center cursor-pointer w-20 md:w-28 lg:w-32 group"
          >
            <div className="overflow-hidden rounded-lg shadow transition-all duration-300 group-hover:shadow-lg">
              <img
                src={cat.image}
                alt={cat.label}
                className="w-16 h-16 md:w-24 md:h-24 lg:w-25 lg:h-25 object-cover transform group-hover:scale-150 transition duration-300"
              />
            </div>
            <span className="mt-1 text-[12px] md:text-sm lg:text-base text-center text-gray-700 font-medium group-hover:text-[var(--primary-color)] transition">
              {cat.label}
            </span>
          </div>
        ))}

        {/* ➕ View All button */}
        <div
          onClick={() => navigate("/all-categories")}
          className="flex-shrink-0 flex flex-col items-center cursor-pointer w-20 md:w-28 lg:w-32"
        >
          <div className="w-16 h-16 md:w-24 md:h-24 lg:w-25 lg:h-25 rounded border flex items-center justify-center text-sm text-gray-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
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
            src="https://makpowerindia.com/cdn/shop/files/jw7nh1jetzzczvz5lev7.webp?v=1748436890&width=2000"
            alt="banner1"
            className="w-full h-48 md:h-64 lg:h-100 object-cover"
          />
          <img
            src="https://makpowerindia.com/cdn/shop/files/Makpower_amazon_Marketplace.webp?v=1731835198&width=2000"
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
Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eaque, delectus autem eius illo blanditiis voluptas suscipit est, optio at minus quod omnis perferendis ea exercitationem, molestias id rerum eligendi sunt.
      {/* ⭐ Trending Products Component */}
      <SlidingProductsCards trendingIds={trendingIds} title={"Trending Products"}/>

      <SlidingProductsCards trendingIds={schemeIds} title={"Special Scheme Products"}/>
    </div>
  );
}
