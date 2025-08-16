// 📁 src/components/Loader.jsx
import { FaSpinner } from "react-icons/fa";

export default function Loader({ message = "Loading..." }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4 p-8 rounded-lg shadow-lg bg-white border border-gray-200">
        <FaSpinner className="animate-spin text-5xl text-blue-600" />
        <p className="text-base sm:text-lg md:text-xl text-gray-700 font-semibold text-center">
          {message}
        </p>
      </div>
    </div>
  );
}
