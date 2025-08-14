import { IoChevronBack } from "react-icons/io5";

export default function MobilePageHeader({ title, onBack }) {
  return (
    <div className=" sm:hidden fixed top-0 left-0 right-0 z-50 bg-white p-3 border-b border-gray-200 shadow-sm sm:static sm:mx-4 sm:rounded-md sm:shadow-md sm:border transition-all duration-200 ease-in-out">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack || (() => window.history.back())}
          className="text-gray-700 hover:text-blue-600 text-xl px-1 transition-transform hover:scale-105"
          aria-label="Back"
        >
          <IoChevronBack />
        </button>
        <span className="text-lg sm:text-xl font-semibold text-gray-800">
          {title}
        </span>
      </div>
    </div>
  );
}
