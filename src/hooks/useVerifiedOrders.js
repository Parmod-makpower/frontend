import { useQuery } from "@tanstack/react-query";
import API from "../api/axios";

export const useVerifiedOrders = ({ q, punched }) => {
  return useQuery({
    queryKey: ["verifiedOrders", q, punched],
    queryFn: async () => {
      const params = {};

      if (q) params.q = q;
      if (punched !== null) params.punched = punched;

      const { data } = await API.get("/crm/verified/", { params });
      return data;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};
