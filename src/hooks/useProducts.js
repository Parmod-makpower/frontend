import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProduct,
  addProduct,
  deleteProduct,
  updateProduct,
  uploadProductImage,
} from "../api/productApi";

// ⬇️ Fetch all products
export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProduct,
  });
}

// ⬇️ Add new product
export function useAddProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-products"] }); // ✅ Fix
    },
  });
}

// ⬇️ Delete a product
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-products"] }); // ✅ Fix
    },
  });
}

// ⬇️ Update existing product
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-products"] }); // ✅ Fix
    },
  });
}

// ⬇️ Upload product image
export function useUploadProductImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadProductImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-products"] }); // ✅ Fix
    },
  });
}
