// 📁 main.jsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getAllProducts } from "./api/productApi";
import { FaBolt } from "react-icons/fa"; // Icon for branding

const queryClient = new QueryClient();

function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-orange-600 to-red-500 text-white animate-fadeIn">
      {/* Icon with pulse */}
      <FaBolt className="text-5xl mb-4 animate-bounce" />

      {/* Brand name */}
      <h1 className="text-4xl font-bold tracking-widest animate-pulse">
        MakPower
      </h1>

      {/* Sub text */}
      <p className="mt-2 text-sm opacity-80 animate-fadeIn">
        Powering your products...
      </p>

      {/* Loader dots */}
      <div className="flex space-x-2 mt-6">
        <span className="w-3 h-3 bg-white rounded-full animate-bounce"></span>
        <span className="w-3 h-3 bg-white rounded-full animate-bounce delay-150"></span>
        <span className="w-3 h-3 bg-white rounded-full animate-bounce delay-300"></span>
      </div>
    </div>
  );
}

function Root() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queryClient
      .prefetchQuery({
        queryKey: ["all-products"],
        queryFn: getAllProducts,
      })
      .then(() => setReady(true));
  }, []);

  if (!ready) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
