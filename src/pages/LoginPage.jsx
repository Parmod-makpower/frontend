import { useState } from "react";
import { loginUser } from "../auth/useLogin";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import InstallButtons from "../components/InstallButtons";
import { motion } from "framer-motion"; // 👈 animation
import { FaUser, FaLock } from "react-icons/fa";
import logo from "../assets/images/logo.png"

export default function LoginPage() {
  const [mobileOrId, setMobileOrId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await loginUser(mobileOrId, password);
      login(data);
      navigate("/");
    } catch (err) {
      const backendError =
        err.response?.data?.detail || "Something went wrong!";
      setError(backendError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">


        {/* Company Title */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 7, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          {/* <h1 className="text-3xl font-extrabold tracking-wide text-[#fc250c]">
            <span className="text-gray-700">Mak</span>power
          </h1> */}
          <h1 className="text-3xl font-extrabold tracking-wide text-center text-[#fc250c]">
            <img
              src={logo}
              alt="Makpower Logo"
              className="w-50 mb-2 mx-auto"
            />
          </h1>

          <p className="text-sm text-gray-500">
            Powering Your Digital Journey
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-gray-50 shado bg-white p-6 rounded-2xl w-full"
        >
          <h2 className="text-lg font-semibold mb-5 text-center text-gray-700">
            Sign in to Continue
          </h2>

          {/* Mobile / ID Input */}
          <div className="relative mb-4">
            <FaUser className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Mobile या ID"
              className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
              value={mobileOrId}
              onChange={(e) => setMobileOrId(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div className="relative mb-4">
            <FaLock className="absolute left-3 top-3 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-red-500 mb-3 text-sm text-center">{error}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white cursor-pointer font-semibold flex items-center justify-center transition duration-200 ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 hover:shadow-lg hover:scale-105"
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
        </motion.form>
        {/* Install Buttons (mobile only) */}
        <div className="mb-4 flex justify-center sm:hidden">
          <InstallButtons />
        </div>

      </div>
    </div>
  );
}
