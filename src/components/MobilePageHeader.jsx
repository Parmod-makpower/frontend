// import { FaSearch,FaArrowLeft  } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";

// export default function MobilePageHeader({ title, onBack, searchText = "" }) {
//   const navigate = useNavigate();

//   const handleRedirect = () => {
//     navigate(`/search?search=${encodeURIComponent(searchText.trim())}`);
//   };

//   return (
//     <div className="sm:hidden fixed top-0 left-0 right-0 z-50 bg-white p-3  shadow-[0_4px_6px_rgba(0,0,0,0.05)] ">
//       <div className="flex items-center justify-between">
//         {/* 🔙 Back button + title */}
//         <div className="flex items-center gap-2">
//           <button
//             onClick={onBack || (() => window.history.back())}
//             className="text-gray-700 hover:text-blue-600 text-xl px-1 transition-transform hover:scale-105"
//             aria-label="Back"
//           >
//             <FaArrowLeft  />
//           </button>
//           <span className="text-lg  font-semibold">
//             {title}
//           </span>
//         </div>

//         {/* 🔍 Search button */}
//         <button
//           onClick={handleRedirect}
//           className="text-gray-600 hover:text-blue-600 text-xl p-2 rounded-full hover:bg-gray-100 transition"
//           aria-label="Search"
//         >
//           <FaSearch />
//         </button>
//       </div>
//     </div>
//   );
// }


import { FaSearch, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function MobilePageHeader({
  title,
  onBack,
  searchText = "",
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    window.history.back();
  };

  const handleSearch = () => {
    navigate(
      `/search?search=${encodeURIComponent(
        searchText.trim()
      )}`
    );
  };

  return (
    <div
      className="
        md:hidden
        fixed inset-x-0 top-0 z-50
        bg-white/95
        backdrop-blur-md
        border-b border-[#e7edf5]
        shadow-[0_2px_12px_rgba(15,23,42,0.06)]
      "
    >
      <div
        className="
          flex h-[64px]
          items-center
          justify-between
          px-3
        "
      >
        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-2">

          {/* BACK */}
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back"
            className="
              flex h-10 w-10
              shrink-0
              items-center justify-center
              rounded-full
              text-[#334155]
              transition-all duration-200
              hover:bg-[#f1f5f9]
              hover:text-[#1769ff]
              active:scale-90
            "
          >
            <FaArrowLeft className="text-[17px]" />
          </button>

          {/* TITLE */}
          <div className="min-w-0">
            <h1
              className="
                max-w-[230px]
                truncate
                text-[14px]
                font-bold
                leading-tight
                text-[#0f172a]
              "
            >
              {title}
            </h1>

            <p
              className="
                mt-0.5
                text-[10px]
                font-medium
                text-[#94a3b8]
              "
            >
              Explore our products
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <button
          type="button"
          onClick={handleSearch}
          aria-label="Search"
          className="
            flex h-10 w-10
            shrink-0
            items-center justify-center
            rounded-full
            border border-[#e7edf5]
            bg-[#f8fafc]
            text-[#334155]
            shadow-sm
            transition-all duration-200
            hover:border-[#cfe0ff]
            hover:bg-[#edf4ff]
            hover:text-[#1769ff]
            active:scale-90
          "
        >
          <FaSearch className="text-[16px]" />
        </button>
      </div>
    </div>
  );
}