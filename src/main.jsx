// 📁 main.jsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getAllProducts } from "./api/productApi";

const queryClient = new QueryClient();

function Root() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // पहले products preload कर लो
    queryClient
      .prefetchQuery({
        queryKey: ["all-products"],
        queryFn: getAllProducts,
      })
      .then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading products...</p>
      </div>
    );
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
