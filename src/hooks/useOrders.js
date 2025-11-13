import { useQuery } from "@tanstack/react-query";
import { fetchOrdersByRole } from "../api/ordersApi";

export const useOrders = () => {
  return useQuery({
    queryKey: ["ordersByRole"],
    queryFn: fetchOrdersByRole,
    keepPreviousData: true,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};
