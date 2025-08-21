// hooks/useVerifiedOrders.js
import { useQuery } from "@tanstack/react-query";
import API from "../api/axios";

export const useVerifiedOrders = ({ page, pageSize, status, q, start_date, end_date }) => {
  return useQuery({
    queryKey: ["verifiedOrders", page, pageSize, status, q, start_date, end_date],
    queryFn: async () => {
      const params = { page, page_size: pageSize, status, q, start_date, end_date };
      // 🔥 backend urls.py के हिसाब से सही endpoint
      const { data } = await API.get("/crm/verified/", { params });
      return data;
    },
    keepPreviousData: true,
  });
};
