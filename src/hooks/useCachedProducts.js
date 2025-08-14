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

    // पुराना data 6 मिनट तक valid रहेगा
    staleTime: 1000 * 60 * 6,

    // हर 5 मिनट में background fetch होगा
    refetchInterval: 1000 * 60 * 5,
    refetchIntervalInBackground: true,

    // Slow network में भी पुराना data दिखाने के लिए
    keepPreviousData: true,
  });
};
