import { useMutation } from "@tanstack/react-query";
import API from '../api/axios';

export const usePlaceOrder = () => {
  return useMutation({
    mutationFn: async (order) => {
      const res = await API.post("/ss-orders/create/", order);
      return res.data;
    },
  });
};
