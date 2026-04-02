
import API from "../../api/axios";
import { useQuery } from "@tanstack/react-query";

// ✅ API call
const getGSTDetails = async () => {
  const res = await API.get("/gst/");
  return res.data;
};

// ✅ Cached hook
export const useGSTDetails = () => {
  return useQuery({
    queryKey: ["gst"],
    queryFn: getGSTDetails,

    staleTime: 1000 * 60 * 5 * 7, 
    gcTime: 1000 * 60 * 60 * 24,

    refetchOnWindowFocus: true,
    keepPreviousData: true,
  });
};
