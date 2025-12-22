import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useVirtualStock } from "./useVirtualStock";

const getAllProducts = async () => {
  const res = await API.get("/all-a_i_products/");
  return res.data;
};

export const all_active_inactive_product = () => {
  const { user } = useAuth();

  // ✅ Products cache (1 hour)
  const {
    data: allProducts = [],
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["all-a_i_products/"],
    queryFn: getAllProducts,

    staleTime: 1000 * 60 * 85, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hour cache

    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,

    keepPreviousData: true,
  });

  // ✅ Virtual Stock (auto-refresh every 2 min)
  const { data: virtualStockData = [] } = useVirtualStock();

  // ✅ Merge logic – memoized for performance
  const mergedProducts = useMemo(() => {
    if (!allProducts?.length) return [];
    return allProducts.map((prod) => {
      const vs = virtualStockData.find(
        (v) => v.product_id === prod.product_id
      );
      return {
        ...prod,
        virtual_stock: vs ? vs.virtual_stock : prod.virtual_stock,
      };
    });
  }, [allProducts, virtualStockData]);

  return {
    data: mergedProducts,
    isLoading,
    isFetching,
    error,
  };
};
