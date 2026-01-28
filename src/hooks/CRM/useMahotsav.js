
import API from "../../api/axios";
import { useQuery } from "@tanstack/react-query";

// ✅ API call
const getMahotsavSheet = async () => {
  const res = await API.get("/mahotsav-data/");
  return res.data;
};

// ✅ Cached hook
export const useMahotsavSheet = () => {
  return useQuery({
    queryKey: ["mahotsav-data"],
    queryFn: getMahotsavSheet,

    staleTime: 1000 * 60 * 7,
    gcTime: 1000 * 60 * 60 * 24,

    refetchOnWindowFocus: true,
    keepPreviousData: true,
  });
};
