// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//   fetchProduct,
//   addProduct,
//   deleteProduct,
//   updateProduct,
//   uploadProductImage,toggleProductStatus,fetchInactiveProducts
// } from "../api/productApi";

// // ⬇️ Fetch all products
// export function useProducts() {
//   return useQuery({
//     queryKey: ["products"],
//     queryFn: fetchProduct,
//   });
// }

// // ⬇️ Add new product
// export function useAddProduct() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: addProduct,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["products"] });
//     },
//   });
// }

// // ⬇️ Delete a product
// export function useDeleteProduct() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: deleteProduct,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["products"] });
//     },
//   });
// }

// // ⬇️ Update existing product
// export function useUpdateProduct() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: updateProduct,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["products"] });
//     },
//   });
// }

// // ⬇️ Upload product image
// export function useUploadProductImage() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: uploadProductImage,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["products"] });
//     },
//   });
// }

// // hooks/useProducts.js
// export function useUploadProductImage2() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: uploadProductImage2,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["products"] });
//     },
//   });
// }


// // ⬇️ Toggle product active/inactive
// export function useToggleProductStatus() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: toggleProductStatus,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["products"] });
//     },
//   });
// }

// // ⬇️ Inactive products fetch hook
// export function useInactiveProducts() {
//   return useQuery({
//     queryKey: ["inactiveProducts"],
//     queryFn: fetchInactiveProducts,
//   });
// }


import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  fetchProduct,
  addProduct,
  deleteProduct,
  updateProduct,
  uploadProductImage,
  uploadProductImage2,
  toggleProductStatus,
  fetchInactiveProducts,
} from "../api/productApi";


// =====================================================
// HELPER
// =====================================================

const getProductId = (product) => {
  return String(product?.product_id);
};


// =====================================================
// FETCH ACTIVE PRODUCTS
// =====================================================

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProduct,

    staleTime: 1000 * 60 * 60 * 2,
    gcTime: 1000 * 60 * 60 * 24,

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}


// =====================================================
// ADD PRODUCT
// =====================================================

export function useAddProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addProduct,

    onSuccess: async (newProduct) => {
      // Active products cache update
      queryClient.setQueryData(
        ["products"],
        (oldData = []) => {
          if (!newProduct) {
            return oldData;
          }

          const exists = oldData.some(
            (product) =>
              getProductId(product) ===
              getProductId(newProduct)
          );

          if (exists) {
            return oldData;
          }

          return [...oldData, newProduct];
        }
      );

      // All products cache update
      queryClient.setQueryData(
        ["all-products"],
        (oldData = []) => {
          if (!newProduct) {
            return oldData;
          }

          const exists = oldData.some(
            (product) =>
              getProductId(product) ===
              getProductId(newProduct)
          );

          if (exists) {
            return oldData;
          }

          return [...oldData, newProduct];
        }
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["products"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["all-products"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["inactiveProducts"],
        }),
      ]);
    },
  });
}


// =====================================================
// UPDATE PRODUCT
// =====================================================

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,

    onSuccess: async (updatedProduct, variables) => {
      const productId = String(
        variables?.productId
      );


      // Update active products immediately
      queryClient.setQueryData(
        ["products"],
        (oldData = []) => {
          return oldData.map((product) => {
            if (
              String(product.product_id) === productId
            ) {
              return {
                ...product,
                ...(updatedProduct || {}),
              };
            }

            return product;
          });
        }
      );


      // Update all products immediately
      queryClient.setQueryData(
        ["all-products"],
        (oldData = []) => {
          return oldData.map((product) => {
            if (
              String(product.product_id) === productId
            ) {
              return {
                ...product,
                ...(updatedProduct || {}),
              };
            }

            return product;
          });
        }
      );


      // Inactive list bhi refresh hogi
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["products"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["all-products"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["inactiveProducts"],
        }),
      ]);
    },
  });
}


// =====================================================
// TOGGLE ACTIVE / INACTIVE
// =====================================================

export function useToggleProductStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleProductStatus,

    onSuccess: async (updatedProduct, variables) => {
      const productId = String(
        variables?.productId
      );

      const isActive = variables?.isActive;


      // Active products cache se add/remove
      queryClient.setQueryData(
        ["products"],
        (oldData = []) => {
          if (isActive) {
            const exists = oldData.some(
              (product) =>
                String(product.product_id) === productId
            );

            if (exists) {
              return oldData.map((product) =>
                String(product.product_id) === productId
                  ? {
                      ...product,
                      ...(updatedProduct || {}),
                      is_active: true,
                    }
                  : product
              );
            }

            if (updatedProduct) {
              return [
                ...oldData,
                {
                  ...updatedProduct,
                  is_active: true,
                },
              ];
            }

            return oldData;
          }

          return oldData.filter(
            (product) =>
              String(product.product_id) !== productId
          );
        }
      );


      // All products cache update
      queryClient.setQueryData(
        ["all-products"],
        (oldData = []) => {
          return oldData.map((product) =>
            String(product.product_id) === productId
              ? {
                  ...product,
                  ...(updatedProduct || {}),
                  is_active: isActive,
                }
              : product
          );
        }
      );


      // Inactive products cache update
      queryClient.setQueryData(
        ["inactiveProducts"],
        (oldData = []) => {
          if (isActive) {
            return oldData.filter(
              (product) =>
                String(product.product_id) !== productId
            );
          }

          const exists = oldData.some(
            (product) =>
              String(product.product_id) === productId
          );

          if (exists) {
            return oldData.map((product) =>
              String(product.product_id) === productId
                ? {
                    ...product,
                    ...(updatedProduct || {}),
                    is_active: false,
                  }
                : product
            );
          }

          const productFromAll = queryClient
            .getQueryData(["all-products"])
            ?.find(
              (product) =>
                String(product.product_id) === productId
            );

          if (productFromAll) {
            return [
              ...oldData,
              {
                ...productFromAll,
                is_active: false,
              },
            ];
          }

          return oldData;
        }
      );


      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["products"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["all-products"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["inactiveProducts"],
        }),
      ]);
    },
  });
}


// =====================================================
// DELETE PRODUCT
// =====================================================

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,

    onSuccess: async (_, productId) => {
      const id = String(productId);


      queryClient.setQueryData(
        ["inactiveProducts"],
        (oldData = []) => {
          return oldData.filter(
            (product) =>
              String(product.product_id) !== id
          );
        }
      );


      queryClient.setQueryData(
        ["products"],
        (oldData = []) => {
          return oldData.filter(
            (product) =>
              String(product.product_id) !== id
          );
        }
      );


      queryClient.setQueryData(
        ["all-products"],
        (oldData = []) => {
          return oldData.filter(
            (product) =>
              String(product.product_id) !== id
          );
        }
      );


      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["products"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["all-products"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["inactiveProducts"],
        }),
      ]);
    },
  });
}


// =====================================================
// UPLOAD IMAGE 1
// =====================================================

export function useUploadProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadProductImage,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["products"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["all-products"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["inactiveProducts"],
        }),
      ]);
    },
  });
}


// =====================================================
// UPLOAD IMAGE 2
// =====================================================

export function useUploadProductImage2() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadProductImage2,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["products"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["all-products"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["inactiveProducts"],
        }),
      ]);
    },
  });
}


// =====================================================
// INACTIVE PRODUCTS
// =====================================================

export function useInactiveProducts() {
  return useQuery({
    queryKey: ["inactiveProducts"],
    queryFn: fetchInactiveProducts,

    staleTime: 1000 * 60 * 60 * 2,
    gcTime: 1000 * 60 * 60 * 24,

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}