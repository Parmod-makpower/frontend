import { useQuery } from "@tanstack/react-query";
import API from "../../api/axios";

const fetchMyOrders = async () => {
  const res = await API.get("/ds/orders/my-latest/");
  return res.data;
};

export const useMyLatestOrders = () => {
  return useQuery({
    queryKey: ["ds-latest-orders"],
    queryFn: fetchMyOrders,

    staleTime: Infinity,          // ✅ 1 bar hi fetch
    cacheTime: 1000 * 60 * 60,    // 1 hour
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
