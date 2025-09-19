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

    // हर 2 मिनट में refetch
    refetchInterval: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    keepPreviousData: true,
  });
};
