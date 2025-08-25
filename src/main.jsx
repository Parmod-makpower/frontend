// 📁 src/Main.jsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClient, QueryClientProvider, useIsRestoring } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { FaBolt } from "react-icons/fa";
import { getAllProducts } from "./api/productApi";
import { getSchemes } from "./api/schemeApi";
import { AuthProvider, useAuth } from "./context/AuthContext";

// ✅ Create QueryClient
const queryClient = new QueryClient();

// ✅ Setup LocalStorage Persister
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
});

// ✅ Immediately hydrate cache before app renders
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  // No global maxAge; each query controls its own caching
});

function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-orange-600 to-red-500 text-white animate-fadeIn">
      <FaBolt className="text-5xl mb-4 animate-bounce" />
      <h1 className="text-4xl font-bold tracking-widest animate-pulse">
        MakPower
      </h1>
      <p className="mt-2 text-sm opacity-80 animate-fadeIn">
        Powering your products...
      </p>
      <div className="flex space-x-2 mt-6">
        <span className="w-3 h-3 bg-white rounded-full animate-bounce"></span>
        <span className="w-3 h-3 bg-white rounded-full animate-bounce delay-150"></span>
        <span className="w-3 h-3 bg-white rounded-full animate-bounce delay-300"></span>
      </div>
    </div>
  );
}

function Root() {
  const { user } = useAuth();
  const isRestoring = useIsRestoring();

  useEffect(() => {
    const preloadData = async () => {
      if (user) {
        const cachedSchemes = queryClient.getQueryData(["schemes"]);

       if (user.role === "SS") {
        const cachedProducts = queryClient.getQueryData(["all-products"]);
        if (!cachedProducts) {
          await queryClient.fetchQuery({
            queryKey: ["all-products"],
            queryFn: getAllProducts,
            staleTime: 0,
          });
        }
      }

        if (!cachedSchemes) {
          await queryClient.fetchQuery({
            queryKey: ["schemes"],
            queryFn: getSchemes,
            staleTime: 0,
          });
        }
      }
    };

    preloadData();
  }, [user]);

  // ⛔ Show Splash only while hydration is happening AND no cached data exists
  const hasCachedProducts = queryClient.getQueryData(["all-products"]);
  if (isRestoring && !hasCachedProducts) return <SplashScreen />;

  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </React.StrictMode>
);
