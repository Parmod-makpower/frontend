// 📁 src/hooks/useCachedProducts.js
import { useQuery } from "@tanstack/react-query";
import API from "../api/axios";

const getAllProducts = async () => {
  const res = await API.get("/all-products/");
  return res.data;
};

export const useCachedProducts = () => {
  return useQuery({
    queryKey: ["all-products"],
    queryFn: getAllProducts,
    staleTime: 1000 * 60 * 7,       // 7 minutes तक fresh माना जाएगा
    refetchInterval: 1000 * 60 * 5, // हर 5 min background refresh
    refetchIntervalInBackground: true,
    keepPreviousData: true,
  });
};
