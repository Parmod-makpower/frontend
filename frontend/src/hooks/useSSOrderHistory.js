import { useQuery, keepPreviousData } from "@tanstack/react-query";
import API from "../api/axios";

const fetchSSOrderHistory = async () => {
  const res = await API.get(`/ss-orders/history/?limit=20`);
  return res.data;
};

export const useSSOrderHistory = () => {
  return useQuery({
    queryKey: ["ssOrderHistory"],
    queryFn: fetchSSOrderHistory,
    select: (data) => {
      return {
        ...data,
        results: data?.results?.slice(0, 20) || [],
      };
    },
    // 🔹 पुराना data दिखाते रहो जब तक नया नहीं आता
    placeholderData: keepPreviousData,
    refetchOnMount: true,  // mount होते ही refetch होगा
    refetchOnWindowFocus: false, // window focus पे बार-बार call avoid करने के लिए
  });
};
