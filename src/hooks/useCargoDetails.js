import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../api/axios";

const API_URL = "cargo-details/";

/**
 * 📦 Get all cargo details
 */
export const useCargoDetails = () => {
  return useQuery({
    queryKey: ["cargo-details"],
    queryFn: async () => {
      const res = await API.get(API_URL);
      return res.data;
    },
  });
};

/**
 * ➕ Add new cargo
 */
export const useAddCargo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      // ✅ Remove withCredentials; already handled in axios config
      const res = await API.post(API_URL, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cargo-details"]);
    },
  });
};

/**
 * ✏️ Update existing cargo
 */
export const useUpdateCargo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const res = await API.put(`${API_URL}${id}/`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cargo-details"]);
    },
  });
};

/**
 * ❌ Delete cargo
 */
export const useDeleteCargo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await API.delete(`${API_URL}${id}/`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cargo-details"]);
    },
  });
};
