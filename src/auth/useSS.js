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

    staleTime: 1000 * 60 * 60 * 3,   
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

export const updateStockLocation = async (id, stock_location) => {
  const res = await API.patch(`/accounts/ss-users/${id}/`, {
    stock_location,
  });
  return res.data;
};


export const toggleSSStatus = async (id, is_active) => {
  const res = await API.patch(`/accounts/ss-users/${id}/`, { is_active });
  return res.data;
};

// ✅  dealer only form k liyaform k liya
const getSSUsersDealers = async () => {
  const res = await API.get("/accounts/users/ss/");
  return res.data;
};

// ✅  dealer only form k liyaform k liya
export const useCachedSSUsersDealers = () => {
  return useQuery({
    queryKey: ["ss-users-dealer"],      // unique key for cache
    queryFn: getSSUsersDealers,

    staleTime: 1000 * 60 * 60 * 4,   
    gcTime: 1000 * 60 * 60 * 24, 

    refetchInterval: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,

    keepPreviousData: true,
  });
};