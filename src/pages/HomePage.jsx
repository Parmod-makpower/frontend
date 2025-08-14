// HomePage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaBell, FaShoppingCart } from "react-icons/fa";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import categories from "../data/categoryData";

const trendingProducts = [
  {
    id: 1,
    name: "CH88 Fast Charger",
    price: "₹399",
    image:
      "https://makpowerindia.com/cdn/shop/files/10000mAh_power_bank_with_digital_display.webp?v=1753350124",
  },
  {
    id: 2,
    name: "Bass Earbuds",
    price: "₹699",
    image:
      "https://makpowerindia.com/cdn/shop/files/Best_Wireless_Earbuds_Crystal-Clear_Sound_Deep_Bass_amp_Long_Battery_Life.webp?v=1739610452",
  },
  {
    id: 3,
    name: "Tempered Glass Pro",
    price: "₹199",
    image:
      "https://makpowerindia.com/cdn/shop/files/Best_Fast_Dual_USB_Car_Charger_Black.webp?v=1742636246",
  },
  {
    id: 4,
    name: "Charger",
    price: "₹19",
    image:
      "https://makpowerindia.com/cdn/shop/files/Makpower_45W_PD_Charger.webp?v=1746862914",
  },
];

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

  return (
    <div className="mx-auto p-4 pb-16">
      {/* 🔝 Top Bar */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <img
          src="https://makpowerindia.com/cdn/shop/files/MakPower_Mobile_Accessories_370x.webp?v=1735378281"
          className="w-32"
          alt="MakPower Logo"
        />
        <div className="block sm:hidden text-xl text-[#fc250c]">
          <FaBell />
        </div>
      </div>

      {/* 🔍 Search */}
      <div className="md:hidden relative mb-6">
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
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#fc250c] hover:text-blue-800"
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

      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Trending Products
      </h2>

      {/* Mobile Slider */}
      <div className="block md:hidden overflow-x-auto no-scrollbar -mx-2 px-2">
        <div className="flex gap-3">
          {trendingProducts.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-36 bg-white rounded-xl shadow hover:shadow-lg transition-all p-2 flex flex-col"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full aspect-square object-cover rounded-lg mb-1"
              />
              <h3 className="text-[11px] font-semibold text-gray-800 line-clamp-1">
                {product.name}
              </h3>
              <p className="text-blue-600 font-bold text-xs">{product.price}</p>
              <button className="mt-auto bg-[#fc250c] text-white text-[10px] px-2 py-1 rounded-full hover:bg-blue-700 transition-all flex items-center gap-1 justify-center">
                <FaShoppingCart className="text-[10px]" /> Add
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-4">
        {trendingProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition-all p-3 flex flex-col"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full aspect-square object-cover rounded-lg mb-2"
            />
            <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">
              {product.name}
            </h3>
            <p className="text-blue-600 font-bold text-sm mb-2">
              {product.price}
            </p>
            <button className="mt-auto bg-[var(--primary-color)] text-white text-xs px-3 py-1 rounded-full hover:bg-blue-700 transition-all flex items-center gap-1 justify-center">
              <FaShoppingCart className="text-xs" /> Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
