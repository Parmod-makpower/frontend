import { useQuery } from "@tanstack/react-query";
import API from "../api/axios";

const fetchMumbaiStock = async () => {
  const res = await API.get("/mumbai-stock/");
  return res.data;
};

export const useMumbaiStock = () => {
  return useQuery({
    queryKey: ["mumbai-stock"],
    queryFn: fetchMumbaiStock,

    staleTime: 1000 * 60 * 10, // 10 minute

    refetchInterval: 1000 * 60 * 10, // auto refresh
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,

    keepPreviousData: true,
  });
};