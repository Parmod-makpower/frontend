import { useQuery } from "@tanstack/react-query";
import { fetchOrdersByRole } from "../api/ordersApi";

export const useOrders = (filters) => {
  return useQuery({
    queryKey: ["ordersByRole", filters],
    queryFn: () => fetchOrdersByRole(filters),
    enabled: false,   // 🚀 API auto-call stop
    keepPreviousData: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
