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

    // पुराना data 5 मिनट तक fresh माना जाएगा
    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 60 * 24 * 5,    // 5 दिन तक memory + localStorage

    // हर 10 मिनट में background में silently refresh होगा
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,

    // नया आने तक पुराना data दिखाते रहो
    keepPreviousData: true,
  });
};
