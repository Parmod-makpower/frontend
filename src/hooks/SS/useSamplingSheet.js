
import API from "../../api/axios";
import { useQuery } from "@tanstack/react-query";

// ✅ API call
const getPartyItemSheet = async () => {
  const res = await API.get("/sampling-sheet/");
  return res.data;
};

// ✅ Cached hook
export const useSamplingSheet = () => {
  return useQuery({
    queryKey: ["sampning-sheet"],
    queryFn: getPartyItemSheet,

    staleTime: 1000 * 60 * 0, // 5 hour
    gcTime: 1000 * 60 * 60 * 24,

    refetchOnWindowFocus: true,
    keepPreviousData: true,
  });
};
