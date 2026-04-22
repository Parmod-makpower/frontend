import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useVirtualStock } from "./useVirtualStock";
import { useMumbaiStock } from "./useMumbaiStock";

const getAllProducts = async () => {
  const res = await API.get("/all-products/");
  return res.data;
};

export const useCachedProducts = () => {
  const { user } = useAuth();

  // ✅ Products cache (1 hour)
  const {
    data: allProducts = [],
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["all-products"],
    queryFn: getAllProducts,

    staleTime: 1000 * 60 * 60 * 2, // 5 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hour cache

    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,

    keepPreviousData: true,
  });

  // ✅ Virtual Stock (auto-refresh every 2 min)
  const { data: virtualStockData = [] } = useVirtualStock();
  const { data: mumbaiStockData = [] } = useMumbaiStock();

  const mergedProducts = useMemo(() => {
  if (!allProducts?.length) return [];

  return allProducts.map((prod) => {
    const vs = virtualStockData.find(
      (v) => v.product_id === prod.product_id
    );

    const ms = mumbaiStockData.find(
      (m) => m.product_id === prod.product_id
    );

    return {
      ...prod,
      virtual_stock: vs ? vs.virtual_stock : prod.virtual_stock,
      mumbai_stock: ms ? ms.mumbai_stock : prod.mumbai_stock,
    };
  });
}, [allProducts, virtualStockData, mumbaiStockData]);

  return {
    data: mergedProducts,
    isLoading,
    isFetching,
    error,
  };
};
