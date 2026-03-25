
import API from "../../api/axios";
import { useQuery } from "@tanstack/react-query";

// ✅ API call
const getCargoDetails = async () => {
  const res = await API.get("/cargo/");
  return res.data;
};

// ✅ Cached hook
export const useCargoDetails = () => {
  return useQuery({
    queryKey: ["cargo"],
    queryFn: getCargoDetails,

    staleTime: 1000 * 60 * 5, // 5 hour
    gcTime: 1000 * 60 * 60 * 24,

    refetchOnWindowFocus: true,
    keepPreviousData: true,
  });
};
