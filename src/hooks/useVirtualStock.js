import { useQuery } from "@tanstack/react-query";
import API from "../api/axios";

const fetchVirtualStock = async () => {
  const res = await API.get("/virtual-stock/");
  return res.data;
};

export const useVirtualStock = () => {
  return useQuery({
    queryKey: ["virtual-stock"],
    queryFn: fetchVirtualStock,

    staleTime: 1000 * 50, // 50 seconds

    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    keepPreviousData: true,
  });
};
