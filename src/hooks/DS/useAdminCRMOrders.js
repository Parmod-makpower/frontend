import { useQuery } from "@tanstack/react-query";
import { fetchOrdersByRole } from "../../api/DS/dsOrderApi";

export const useAdminCRMOrders = (filters) => {
  return useQuery({
    queryKey: ["ordersByRole", filters],
    queryFn: () => fetchOrdersByRole(filters),
    enabled: true,   // 🚀 API auto-call stop
    keepPreviousData: true,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};
