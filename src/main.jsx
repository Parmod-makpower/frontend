import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

import { getAllProducts } from "./api/productApi";
import { getSchemes } from "./api/schemeApi";
import { AuthProvider, useAuth } from "./context/AuthContext";

// ✅ QueryClient Setup
export const queryClient = new QueryClient();

// ✅ Persister (EXPORT)
export const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
});

// ✅ Persist cache
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
});

function Root() {
  const { user } = useAuth();

  useEffect(() => {
    const preloadData = async () => {
      if (user) {
        const cachedSchemes = queryClient.getQueryData(["schemes"]);
        const cachedProducts = queryClient.getQueryData(["all-products"]);

        if (!cachedProducts) {
          await queryClient.fetchQuery({
            queryKey: ["all-products"],
            queryFn: getAllProducts,
            staleTime: 0,
          });
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

  return <App />;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* ✅ QueryClientProvider सबसे ऊपर */}
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
