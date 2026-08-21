import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { persistQueryClient } from "@tanstack/react-query-persist-client";

import {
  createSyncStoragePersister,
} from "@tanstack/query-sync-storage-persister";

import { getAllProducts } from "./api/productApi";
import { getSchemes } from "./api/schemeApi";

import {
  AuthProvider,
  useAuth,
} from "./context/AuthContext";

import { StockProvider } from "./context/StockContext";


// =========================================================
// QUERY CLIENT SETUP
// =========================================================

export const queryClient = new QueryClient();


// =========================================================
// MAKE QUERY CLIENT AVAILABLE FOR PWA UPDATE
// =========================================================

window.__queryClient = queryClient;


// =========================================================
// PERSISTED LOCAL STORAGE PERSISTER
// =========================================================

export const localStoragePersister =
  createSyncStoragePersister({
    storage: window.localStorage,

    // Custom key so we can clear it safely
    // when a new frontend version is installed.
    key: "makpower-react-query-cache",
  });


// =========================================================
// PERSIST QUERY CACHE
// =========================================================

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
});


// =========================================================
// ROOT COMPONENT
// =========================================================

function Root() {
  const { user } = useAuth();

  useEffect(() => {

    const preloadData = async () => {

      if (user) {

        // =================================================
        // CHECK CACHED SCHEMES
        // =================================================

        const cachedSchemes =
          queryClient.getQueryData([
            "schemes",
          ]);


        // =================================================
        // CHECK CACHED PRODUCTS
        // =================================================

        const cachedProducts =
          queryClient.getQueryData([
            "all-products",
          ]);


        // =================================================
        // PRELOAD PRODUCTS
        // =================================================

        if (!cachedProducts) {

          await queryClient.fetchQuery({

            queryKey: [
              "all-products",
            ],

            queryFn: getAllProducts,

            staleTime: 0,

          });

        }


        // =================================================
        // PRELOAD SCHEMES
        // =================================================

        if (!cachedSchemes) {

          await queryClient.fetchQuery({

            queryKey: [
              "schemes",
            ],

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


// =========================================================
// REACT ROOT
// =========================================================

const root = ReactDOM.createRoot(
  document.getElementById("root")
);


// =========================================================
// APPLICATION PROVIDERS
// =========================================================

root.render(

  <React.StrictMode>

    {/* =====================================================
        QUERY CLIENT PROVIDER
    ===================================================== */}

    <QueryClientProvider
      client={queryClient}
    >

      {/* ===================================================
          AUTH PROVIDER
      =================================================== */}

      <AuthProvider>

        {/* ================================================
            STOCK PROVIDER
        ================================================ */}

        <StockProvider>

          {/* ==============================================
              MAIN APPLICATION
          ============================================== */}

          <Root />

        </StockProvider>

      </AuthProvider>

    </QueryClientProvider>

  </React.StrictMode>

);