// hooks/useUpdateOrderStatus.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../api/axios";

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, notes }) => {
      const payload = { status };
      if (notes !== undefined) payload.notes = notes; // ✅ send only if available

      const { data } = await API.patch(`/crm/verified/${id}/status/`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["verifiedOrders"]);
    }
  });
};
