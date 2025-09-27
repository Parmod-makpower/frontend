// usePlaceOrder.js
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
      // ✅ तुरंत history invalidate करके fresh लाओ
      queryClient.invalidateQueries(["ssOrderHistory"]);

      // ✅ Local cache में तुरंत नया order inject करो
      queryClient.setQueryData(["ssOrderHistory"], (oldData) => {
        if (!oldData?.results) {
          return { results: [newOrder] };
        }
        return {
          ...oldData,
          results: [newOrder, ...oldData.results].slice(0, 20),
        };
      });
    },
  });
};
