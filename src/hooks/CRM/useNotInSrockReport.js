
import API from "../../api/axios";
import { useQuery } from "@tanstack/react-query";

// ✅ API call
const getNotInStock = async () => {
  const res = await API.get("/not-in-stock-report/");
  return res.data;
};

// ✅ Cached hook
export const useNotInStockReport = () => {
  return useQuery({
    queryKey: ["not-in-stock-sheet"],
    queryFn: getNotInStock,

    staleTime: 1000 * 60 * 0, // 5 hour
    gcTime: 1000 * 60 * 60 * 24,

    refetchOnWindowFocus: true,
    keepPreviousData: true,
  });
};
