import { useQuery } from "@tanstack/react-query";
import API from "../../api/axios";

const getHROrders = async () => {
  const { data } = await API.get("/hr/orders/");
  return data;
};

export const useHROrders = () => {
  return useQuery({
    queryKey: ["hr-orders"],

    queryFn: getHROrders,

    staleTime: 0,

    gcTime: 1000 * 60 * 60,

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,

    keepPreviousData: true,
  });
};