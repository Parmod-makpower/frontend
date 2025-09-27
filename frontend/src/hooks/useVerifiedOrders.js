import { useQuery } from "@tanstack/react-query";
import API from "../api/axios";

export const useVerifiedOrders = ({ page, pageSize, status, q, start_date, end_date, punched }) => {
  return useQuery({
    queryKey: ["verifiedOrders", page, pageSize, status, q, start_date, end_date, punched],
    queryFn: async () => {
      const params = { page, page_size: pageSize, status, q, start_date, end_date };
      if (punched !== null) params.punched = punched; // 🔹 send punched param
      const { data } = await API.get("/crm/verified/", { params });
      return data;
    },
    keepPreviousData: true,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};
