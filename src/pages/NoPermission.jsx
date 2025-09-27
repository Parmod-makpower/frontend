import { FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function NoPermission() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50 px-4 text-center">
      <FaLock className="text-red-600 text-6xl mb-4" />

      <h1 className="text-3xl sm:text-4xl font-bold text-red-700 mb-2">
        Access Denied
      </h1>

      <p className="text-lg sm:text-xl text-gray-700 mb-6">
        You do not have permission to access this page.
      </p>

      <div className="flex space-x-4">
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
