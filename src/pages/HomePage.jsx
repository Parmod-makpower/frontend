// HomePage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaChargingStation,
  FaHeadphones,
  FaMobileAlt,
  FaMusic,
  FaBatteryThreeQuarters,
  FaBluetooth,
  FaUsb,
  FaAssistiveListeningSystems,
  FaMobile,
  FaGripHorizontal,
  FaBell,
} from "react-icons/fa";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const categories = [
  { label: "Charger", icon: <FaChargingStation />, keyword: "charger" },
  { label: "Earbuds", icon: <FaHeadphones />, keyword: "earbuds" },
  { label: "Tempered", icon: <FaMobileAlt />, keyword: "tempered" },
  { label: "Speaker", icon: <FaMusic />, keyword: "speaker" },
  { label: "Battery", icon: <FaBatteryThreeQuarters />, keyword: "battery" },
  { label: "Bluetooth", icon: <FaBluetooth />, keyword: "bluetooth" },
  { label: "Pendrive", icon: <FaUsb />, keyword: "pendrive" },
  { label: "Handsfree", icon: <FaAssistiveListeningSystems />, keyword: "handsfree" },
  { label: "Mobile Holder", icon: <FaMobile />, keyword: "mobile holder" },
  { label: "Data Cable", icon: <FaGripHorizontal />, keyword: "data cable" },
];

const trendingProducts = [
  { id: 1, name: "CH88 Fast Charger", price: "₹399", image: "https://media.istockphoto.com/id/1156397327/photo/mobile-kit-with-smartphone-headphones-and-chargers.jpg?s=612x612&w=0&k=20&c=t3ohE9UBWLzblm_-IVuMQ1AYXR17NEH9nJJBDu_H67w=" },
  { id: 2, name: "Bass Earbuds", price: "₹699", image: "https://i.ytimg.com/vi/fEClqC6qylU/maxresdefault.jpg" },
  { id: 3, name: "Tempered Glass Pro", price: "₹199", image: "https://media.istockphoto.com/id/1691932804/photo/steel-ball-falls-on-tempered-glass.jpg?s=612x612&w=0&k=20&c=rmmlSaoFz5bimd3oR0joa3nMMV1h4ITylgjUn3mWz2g=" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");

  const handleRedirect = () => {
    navigate(`/products?search=${encodeURIComponent(searchText.trim())}`);
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
    <div className="max-w-7xl mx-auto p-4 pb-16">
      {/* 🔝 Top Bar */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-700"><img src="https://makpowerindia.com/cdn/shop/files/MakPower_Mobile_Accessories_370x.webp?v=1735378281" className="w-35" /></h1>
        <div className="block sm:hidden text-xl text-blue-700">
          <FaBell />
        </div>
      </div>

      {/* 🔍 Search */}
        <div className="relative mb-6">
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
          className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
        >
          <FaSearch />
        </button>
      </div>
      {/* 🎞️ Image Slider */}
      <div className="mb-8 rounded-xl overflow-hidden">
        <Slider {...sliderSettings}>
          <img src="https://static.vecteezy.com/system/resources/thumbnails/048/639/125/small_2x/smartphone-mockup-background-free-photo.jpg" alt="banner1" className="w-full h-48 object-cover" />
          <img src="https://t3.ftcdn.net/jpg/03/19/01/84/360_F_319018422_avRDOC6gp2V3Qk138vXxgKwCIl0FBmQb.jpg" alt="banner2" className="w-full h-48 object-cover" />
          <img src="https://www.planhub.ca/blog/wp-content/uploads/2021/11/Mixing-and-Matching-Mobile-Accessories-1.jpg" alt="banner3" className="w-full h-48 object-cover" />
        </Slider>
      </div>
    
      {/* 📂 Categories */}
   
<div className="grid grid-cols-4 sm:flex sm:flex-wrap justify-center gap-4 mb-10">
  {categories.map((cat) => (
    <div
      key={cat.label}
      onClick={() => navigate(`/category/${encodeURIComponent(cat.keyword)}`)}
      className="flex flex-col items-center cursor-pointer"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-white rounded-full shadow hover:shadow-lg hover:scale-105 transition-all duration-200">
        <div className="text-lg sm:text-xl text-blue-600">{cat.icon}</div>
      </div>
      <span className="mt-1 text-[10px] sm:text-xs text-center text-gray-700 font-medium">
        {cat.label}
      </span>
    </div>
  ))}
</div>


      {/* 🔥 Trending Products */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Trending Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {trendingProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow hover:shadow-lg transition-all p-3">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-40 object-cover rounded-lg mb-2"
            />
            <h3 className="text-sm font-semibold text-gray-800">{product.name}</h3>
            <p className="text-blue-600 font-bold text-sm">{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
