import { FaSearch, FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className=" p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <FaSearch className="text-red-500 text-6xl" />
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
        <p className="text-xl text-gray-700 mb-4">Page Not Found</p>
        <p className="text-gray-500 mb-6">
          The page you are looking for might have been removed or is temporarily unavailable.
        </p>

       <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition"
        >
          Home
        </button>
      </div>
    </div>
  );
}
