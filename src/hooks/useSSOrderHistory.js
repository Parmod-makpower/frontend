// useSSOrderHistory.js
import { useQuery } from "@tanstack/react-query";
import API from "../api/axios";

const fetchSSOrderHistory = async () => {
  const res = await API.get(`/ss-orders/history/?limit=20`); 
  // 🔹 backend में अगर limit param नहीं है तो slice कर देंगे
  return res.data;
};

export const useSSOrderHistory = () => {
  return useQuery({
    queryKey: ["ssOrderHistory"],
    queryFn: fetchSSOrderHistory,
    select: (data) => {
      // 🔹 सिर्फ 20 orders रखें
      return {
        ...data,
        results: data?.results?.slice(0, 20) || [],
      };
    },
    staleTime: 0, // हर बार fresh
    keepPreviousData: true,
    
  });
};

