// 📁 main.jsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { FaBolt } from "react-icons/fa";
import { getAllProducts } from "./api/productApi";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 7, // 7 minutes fresh
      cacheTime: 1000 * 60 * 60 * 24, // 24 hrs keep in cache
    },
  },
});

// Persistor using localStorage
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
});

// Link queryClient with localStorage
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const cached = queryClient.getQueryData(["all-products"]);

    if (cached) {
      // Cache मिला → तुरंत app दिखाओ
      setReady(true);

      // Background refresh करा दो
      queryClient.fetchQuery({
        queryKey: ["all-products"],
        queryFn: getAllProducts,
      });
    } else {
      // पहली बार → splash दिखेगा जब तक data नहीं आता
      queryClient
        .prefetchQuery({
          queryKey: ["all-products"],
          queryFn: getAllProducts,
        })
        .then(() => setReady(true));
    }
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
