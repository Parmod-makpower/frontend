import { useQuery } from "@tanstack/react-query";
import API from "../api/axios";

const fetchSSOrderHistory = async () => {
  const res = await API.get("/ss-orders/history/");
  const data = res.data;

  // Safe fallback
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.orders)) return data.orders;

  throw new Error("Invalid response format from server.");
};

export const useSSOrderHistory = () => {
  return useQuery({
    queryKey: ["ssOrderHistory"],
    queryFn: fetchSSOrderHistory,
  });
};
