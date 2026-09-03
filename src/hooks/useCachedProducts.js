// import { useQuery } from "@tanstack/react-query";
// import { useMemo } from "react";
// import API from "../api/axios";
// import { useAuth } from "../context/AuthContext";
// import { useVirtualStock } from "./useVirtualStock";
// import { useMumbaiStock } from "./useMumbaiStock";

// const getAllProducts = async () => {
//   const res = await API.get("/all-products/");
//   return res.data;
// };

// export const useCachedProducts = () => {
//   const { user } = useAuth();

//   // ✅ Products cache (1 hour)
//   const {
//     data: allProducts = [],
//     isLoading,
//     isFetching,
//     error,
//   } = useQuery({
//     queryKey: ["all-products"],
//     queryFn: getAllProducts,

//     staleTime: 1000 * 60 * 60 * 2, // 5 hour
//     gcTime: 1000 * 60 * 60 * 24, // 24 hour cache

//     refetchInterval: false,
//     refetchOnWindowFocus: false,
//     refetchOnReconnect: false,

//     keepPreviousData: true,
//   });

//   // ✅ Virtual Stock (auto-refresh every 2 min)
//   const isDS = user?.role === "DS";

//   const { data: virtualStockData = [] } =
//     useVirtualStock(!isDS);

//   const { data: mumbaiStockData = [] } =
//     useMumbaiStock(!isDS);
//   const mergedProducts = useMemo(() => {
//     if (!allProducts?.length) return [];

//     return allProducts.map((prod) => {
//       const vs = virtualStockData.find(
//         (v) => v.product_id === prod.product_id
//       );

//       const ms = mumbaiStockData.find(
//         (m) => m.product_id === prod.product_id
//       );

//       return {
//         ...prod,
//         virtual_stock: vs ? vs.virtual_stock : prod.virtual_stock,
//         mumbai_stock: ms ? ms.mumbai_stock : prod.mumbai_stock,
//       };
//     });
//   }, [allProducts, virtualStockData, mumbaiStockData]);

//   return {
//     data: mergedProducts,
//     isLoading,
//     isFetching,
//     error,
//   };
// };


import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import API from "../api/axios";

import { useAuth } from "../context/AuthContext";
import { useVirtualStock } from "./useVirtualStock";
import { useMumbaiStock } from "./useMumbaiStock";


// =====================================================
// GET ALL PRODUCTS
// =====================================================

const getAllProducts = async () => {
  const res = await API.get("/all-products/");

  return res.data;
};


// =====================================================
// PRICE FORMATTER
// =====================================================
//
// Examples:
//
// 120     -> 12.0
// 23      -> 2.3
// 34.5    -> 3.45
// 2.1     -> 0.21
// 3400.0  -> 340.00
// 18      -> 1.8
// 12      -> 1.2
// 345.6   -> 34.56
// 0.4     -> 0.04
//
// =====================================================

const formatProductPrice = (price) => {
  // Empty/null value ko as it is return karo
  if (price === null || price === undefined || price === "") {
    return price;
  }

  // API se number ya string, dono handle honge
  const priceString = String(price).trim();

  // Invalid price ko change mat karo
  if (!/^\d+(\.\d+)?$/.test(priceString)) {
    return price;
  }

  const [integerPart, decimalPart = ""] = priceString.split(".");

  // Decimal hata kar complete digits
  //
  // 120    -> 120
  // 34.5   -> 345
  // 3400.0 -> 34000
  const allDigits = `${integerPart}${decimalPart}`;

  // Decimal point ko one place left shift karna hai
  const decimalPosition = integerPart.length - 1;

  let resultInteger;
  let resultDecimal;

  if (decimalPosition <= 0) {
    resultInteger = "0";
    resultDecimal = allDigits;
  } else {
    resultInteger = allDigits.slice(0, decimalPosition);
    resultDecimal = allDigits.slice(decimalPosition);
  }

  // ---------------------------------------------------
  // Agar original value mein decimal nahi tha
  //
  // 120 -> 12.0
  // 23  -> 2.3
  // 18  -> 1.8
  // ---------------------------------------------------

  if (!priceString.includes(".")) {
    resultDecimal = resultDecimal.padEnd(1, "0");
  }

  // ---------------------------------------------------
  // Agar original value mein decimal tha
  //
  // 34.5   -> 3.45
  // 2.1    -> 0.21
  // 3400.0 -> 340.00
  // ---------------------------------------------------

  if (priceString.includes(".")) {
    resultDecimal = resultDecimal.padEnd(decimalPart.length + 1, "0");
  }

  return `${resultInteger}.${resultDecimal}`;
};


// =====================================================
// CACHED PRODUCTS HOOK
// =====================================================

export const useCachedProducts = () => {
  const { user } = useAuth();

  // ---------------------------------------------------
  // Products cache
  // ---------------------------------------------------

  const {
    data: allProducts = [],
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["all-products"],

    queryFn: getAllProducts,

    // Products 2 hours tak fresh rahenge
    staleTime: 1000 * 60 * 60 * 2,

    // Cache 24 hours tak available rahega
    gcTime: 1000 * 60 * 60 * 24,

    // Automatic refetch disabled
    refetchInterval: false,

    refetchOnWindowFocus: false,

    refetchOnReconnect: false,

    // Previous data ko screen par rakhega
    keepPreviousData: true,
  });


  // ---------------------------------------------------
  // DS user ke liye stock fetching control
  // ---------------------------------------------------

  const isDS = user?.role === "DS";


  // ---------------------------------------------------
  // Virtual Stock
  // ---------------------------------------------------

  const { data: virtualStockData = [] } =
    useVirtualStock(!isDS);


  // ---------------------------------------------------
  // Mumbai Stock
  // ---------------------------------------------------

  const { data: mumbaiStockData = [] } =
    useMumbaiStock(!isDS);


  // ===================================================
  // MERGE PRODUCTS WITH STOCK
  // ===================================================

  const mergedProducts = useMemo(() => {
    if (!allProducts?.length) {
      return [];
    }

    return allProducts.map((prod) => {
      // ------------------------------------------------
      // Find Virtual Stock
      // ------------------------------------------------

      const vs = virtualStockData.find(
        (v) => v.product_id === prod.product_id
      );


      // ------------------------------------------------
      // Find Mumbai Stock
      // ------------------------------------------------

      const ms = mumbaiStockData.find(
        (m) => m.product_id === prod.product_id
      );


      // ------------------------------------------------
      // Return updated product
      // ------------------------------------------------

      return {
        ...prod,

        // Updated price format
        price: formatProductPrice(prod.price),

        // Virtual stock
        virtual_stock: vs
          ? vs.virtual_stock
          : prod.virtual_stock,

        // Mumbai stock
        mumbai_stock: ms
          ? ms.mumbai_stock
          : prod.mumbai_stock,
      };
    });
  }, [
    allProducts,
    virtualStockData,
    mumbaiStockData,
  ]);


  // ===================================================
  // RETURN DATA
  // ===================================================

  return {
    data: mergedProducts,

    isLoading,

    isFetching,

    error,
  };
};