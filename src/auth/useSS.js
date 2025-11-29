import API from "../api/axios";
import { useQuery } from "@tanstack/react-query";

// ✅ API call function
const getSSUsers = async () => {
  const res = await API.get("/accounts/ss-users/");
  return res.data;
};

// ✅ Custom hook with caching
export const useCachedSSUsers = () => {
  return useQuery({
    queryKey: ["ss-users"],      // unique key for cache
    queryFn: getSSUsers,

    staleTime: 1000 * 60 * 5,   
    gcTime: 1000 * 60 * 60 * 24, 

    refetchInterval: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,

    keepPreviousData: true,
  });
};



export const createSSUser = async (data) => {
  const res = await API.post("/accounts/ss-users/", data);
  return res.data;
};

export const updateSSUser = async (id, data) => {
  const res = await API.put(`/accounts/ss-users/${id}/`, data);
  return res.data;
};

export const deleteSSUser = async (id) => {
  const res = await API.delete(`/accounts/ss-users/${id}/`);
  return res.data;
};

export const toggleSSStatus = async (id, is_active) => {
  const res = await API.patch(`/accounts/ss-users/${id}/`, { is_active });
  return res.data;
};