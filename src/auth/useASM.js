// src/auth/useASM.js
import API from "../api/axios";
import { useQuery } from "@tanstack/react-query";

// GET list
const getASMUsers = async () => {
  const res = await API.get("/accounts/asm-users/");
  return res.data;
};

export const useCachedASMUsers = () => {
  return useQuery({
    queryKey: ["asm-users"],
    queryFn: getASMUsers,
    staleTime: 1000 * 60 * 1,
    gcTime: 1000 * 60 * 60 * 24,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    keepPreviousData: true,
  });
};

export const createASMUser = async (data) => {
  const res = await API.post("/accounts/asm-users/", data);
  return res.data;
};

export const updateASMUser = async (id, data) => {
  const res = await API.put(`/accounts/asm-users/${id}/`, data);
  return res.data;
};

export const deleteASMUser = async (id) => {
  const res = await API.delete(`/accounts/asm-users/${id}/`);
  return res.data;
};

export const toggleASMStatus = async (id, is_active) => {
  const res = await API.patch(`/accounts/asm-users/${id}/`, { is_active });
  return res.data;
};
