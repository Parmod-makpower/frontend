import { useQuery } from "@tanstack/react-query";
import API from "../api/axios";

const getAllProducts = async () => {
  const res = await API.get("/all-products/");
  return res.data;
};

export const useAdminAllProducts = () => {
  
  // ✅ Products cache (1 hour)
  const {
    data: allProducts = [],
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["all-products"],
    queryFn: getAllProducts,

    staleTime: 0, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hour cache

    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,

    keepPreviousData: true,
  });

 

  return {
    data: allProducts,
    isLoading,
    isFetching,
    error,
  };
};
