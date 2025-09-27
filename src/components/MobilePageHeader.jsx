import { FaSearch,FaArrowLeft  } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function MobilePageHeader({ title, onBack, searchText = "" }) {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate(`/search?search=${encodeURIComponent(searchText.trim())}`);
  };

  return (
    <div className="sm:hidden fixed top-0 left-0 right-0 z-50 bg-white p-3  shadow-[0_4px_6px_rgba(0,0,0,0.05)] ">
      <div className="flex items-center justify-between">
        {/* 🔙 Back button + title */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBack || (() => window.history.back())}
            className="text-gray-700 hover:text-blue-600 text-xl px-1 transition-transform hover:scale-105"
            aria-label="Back"
          >
            <FaArrowLeft  />
          </button>
          <span className="text-lg  font-semibold">
            {title}
          </span>
        </div>

        {/* 🔍 Search button */}
        <button
          onClick={handleRedirect}
          className="text-gray-600 hover:text-blue-600 text-xl p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Search"
        >
          <FaSearch />
        </button>
      </div>
    </div>
  );
}
