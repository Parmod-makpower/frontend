import { useMutation } from "@tanstack/react-query";
import API from "../../api/axios";

export const useCreateSimpleOrder = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const res = await API.post("/ss-orders/simple-create/", payload);
      return res.data;
    },
  });
};
