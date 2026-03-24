// 📁 src/hooks/useVerifiedOrderDetail.js
import { useQuery } from "@tanstack/react-query";
import API from "../api/axios";

export const useVerifiedOrderDetail = (orderId) => {
  const query = useQuery({
    queryKey: ["verifiedOrderDetail", orderId],
    queryFn: async () => {
      if (!orderId) return null;

      const { data } = await API.get(`/final/order-details/${orderId}/`);
      return data;
    },
    enabled: !!orderId,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  return {
    order: query.data,        // ✅ custom name
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};