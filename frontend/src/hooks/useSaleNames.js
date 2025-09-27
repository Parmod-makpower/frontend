import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSaleNames,
  addSaleName,
  deleteSaleName,uploadSaleNameBulk,
} from "../api/saleNameApi";

export function useSaleNames() {
  return useQuery({
    queryKey: ["sale-names"],
    queryFn: fetchSaleNames,
  });
}

export function useAddSaleName() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addSaleName,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sale-names"] });
    },
  });
}

export function useDeleteSaleName() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSaleName,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sale-names"] });
    },
  });
}


export function useUploadBulkSaleName() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadSaleNameBulk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sale-names"] });
    },
  });
}
