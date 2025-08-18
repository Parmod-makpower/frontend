// 📁 src/hooks/usePlaceOrder.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from '../api/axios';

export const usePlaceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order) => {
      const res = await API.post("/ss-orders/create/", order);
      return res.data;
    },
    onSuccess: (newOrder) => {
      // ✅ Order history refresh करा दो
      queryClient.invalidateQueries(["order-history"]);

      // ✅ Optional: तुरंत दिखाने के लिए local cache update
      queryClient.setQueryData(["order-history"], (old) => {
        if (!old) return [newOrder];
        return [newOrder, ...old];
      });
    },
  });
};
