// 📁 src/hooks/useCachedProducts.js
import { useQuery } from "@tanstack/react-query";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const getAllProducts = async () => {
  const res = await API.get("/all-products/");
  return res.data;
};

export const useCachedProducts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["all-products"],
    queryFn: getAllProducts,

    staleTime: 1000 * 60 * 25,   // 25 minutes        
    gcTime: 1000 * 60 * 60 * 24 ,   

    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,

    keepPreviousData: true,
  });
};
