import { useState } from "react";
import { loginUser } from "../auth/useLogin";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import InstallButtons from "../components/InstallButtons";

export default function LoginPage() {
  const [mobileOrId, setMobileOrId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // 👈 For spinner and disable
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loader
    setError("");

    try {
      const data = await loginUser(mobileOrId, password);
      login(data);
      navigate("/");
    } catch (err) {
      const backendError = err.response?.data?.detail || "Something went wrong!";
      setError(backendError);
    } finally {
      setLoading(false); // Stop loader
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
  <div className=" p-6  w-full max-w-sm">
    
    {/* Install Button - Login के ऊपर */}
    <div className="mb-4 flex justify-center mb-10 sm:hidden">
      <InstallButtons />
    </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg p-6 rounded-xl w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <input
          type="text"
          placeholder="Mobile या ID"
          className="w-full p-2 border mb-4 rounded"
          value={mobileOrId}
          onChange={(e) => setMobileOrId(e.target.value)}
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white flex items-center justify-center transition duration-150 ${
            loading
              ? "bg-[#fc250c] cursor-not-allowed"
              : "bg-[#fc660c] hover:bg-blue-700"
          }`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>
       
      </form>
    </div>
    </div>
  );
}
