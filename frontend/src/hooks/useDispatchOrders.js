import { useQuery } from "@tanstack/react-query";
import API from "../api/axios";

export const useDispatchOrders = (orderId) => {
  return useQuery({
    queryKey: ["dispatchOrders", orderId],
    queryFn: async () => {
      const { data } = await API.get(`/dispatch-orders/${orderId}/`);
      return data;
    },
    enabled: !!orderId, // only run if orderId exists
    retry: 1,
  });
};
