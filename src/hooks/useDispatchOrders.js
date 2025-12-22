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


import { useMutation, useQueryClient } from "@tanstack/react-query";


// 🔥 Delete ALL dispatch orders
const deleteAllDispatchOrders = async () => {
  const res = await API.delete("/dispatch-orders/delete-all/");
  return res.data;
};

export const useDeleteAllDispatchOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAllDispatchOrders,

    onSuccess: () => {
      // ✅ related cache clear / refetch
      queryClient.invalidateQueries(["dispatchOrders"]);
      queryClient.invalidateQueries(["crmOrders"]);
    },
  });
};

