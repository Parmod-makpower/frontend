import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProduct,
  addProduct,
  deleteProduct,
  updateProduct,
  uploadProductImage,toggleProductStatus,fetchInactiveProducts
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
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ⬇️ Delete a product
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ⬇️ Update existing product
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ⬇️ Upload product image
export function useUploadProductImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadProductImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// hooks/useProducts.js
export function useUploadProductImage2() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadProductImage2,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}


// ⬇️ Toggle product active/inactive
export function useToggleProductStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleProductStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ⬇️ Inactive products fetch hook
export function useInactiveProducts() {
  return useQuery({
    queryKey: ["inactiveProducts"],
    queryFn: fetchInactiveProducts,
  });
}
