import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSchemes,
  addScheme,
  updateScheme,
  deleteScheme,
} from "../api/schemeApi";

// 🔹 सभी स्कीम को fetch करने का hook
export const useSchemes = () => {
  return useQuery({
    queryKey: ["schemes"],
    queryFn: getSchemes,
  });
};

// 🔹 स्कीम जोड़ने का hook
export const useAddScheme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addScheme,
    onSuccess: () => {
      queryClient.invalidateQueries(["schemes"]);
    },
  });
};

// 🔹 स्कीम अपडेट करने का hook
export const useUpdateScheme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateScheme,
    onSuccess: () => {
      queryClient.invalidateQueries(["schemes"]);
    },
  });
};

// 🔹 स्कीम delete करने का hook
export const useDeleteScheme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteScheme,
    onSuccess: () => {
      queryClient.invalidateQueries(["schemes"]);
    },
  });
};
