import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  updateProductPrices,
  getPriceHistory,
  getSaleNamesByProduct,
  addSaleName,
  updateSaleName,
} from "../api/priceManagementApi";

export const PRICE_HISTORY_QUERY_KEY = ["price-history"];
export const SALE_NAME_QUERY_KEY = ["sale-names"];

// =====================================================
// UPDATE PRODUCT PRICES
// =====================================================

export const useUpdateProductPrices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProductPrices,

    onSuccess: (response) => {
      const updatedProducts =
        response?.updated_products ?? [];

      if (updatedProducts.length > 0) {
        queryClient.setQueryData(
          ["all-products"],
          (oldProducts) => {
            if (!Array.isArray(oldProducts)) {
              return oldProducts;
            }

            const updatedMap = new Map(
              updatedProducts.map((item) => [
                Number(item.product_id),
                item,
              ])
            );

            return oldProducts.map((product) => {
              const updated = updatedMap.get(
                Number(product?.product_id)
              );

              if (!updated) {
                return product;
              }

              return {
                ...product,
                price: updated.new_price,
                ds_price: updated.new_ds_price,
              };
            });
          }
        );
      }

      queryClient.invalidateQueries({
        queryKey: PRICE_HISTORY_QUERY_KEY,
      });
    },
  });
};

// =====================================================
// PRICE HISTORY
// =====================================================

export const usePriceHistory = ({
  product_id = "",
  search = "",
} = {}) => {
  return useQuery({
    queryKey: [
      ...PRICE_HISTORY_QUERY_KEY,
      product_id,
      search,
    ],

    queryFn: () =>
      getPriceHistory({
        product_id,
        search,
      }),

    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,

    retry: 1,
  });
};

// =====================================================
// SALE NAMES BY PRODUCT
// IMPORTANT: PriceManagementPage.jsx imports this
// =====================================================

export const useSaleNamesByProduct = (
  productId,
  enabled = false
) => {
  return useQuery({
    queryKey: [
      ...SALE_NAME_QUERY_KEY,
      Number(productId),
    ],

    queryFn: () =>
      getSaleNamesByProduct(productId),

    enabled:
      enabled &&
      productId !== undefined &&
      productId !== null,

    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,

    retry: 1,
  });
};

// =====================================================
// SAVE / EDIT SALE NAME
// =====================================================

export const useSaveSaleName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mode,
      product_id,
      sale_name_id,
      sale_name,
    }) => {
      if (mode === "edit") {
        return updateSaleName({
          sale_name_id,
          sale_name,
        });
      }

      return addSaleName({
        product_id,
        sale_name,
      });
    },

    onSuccess: async (response, variables) => {
      const productId = Number(
        variables?.product_id
      );

      const savedName = String(
        response?.sale_name ??
          response?.name ??
          variables?.sale_name ??
          ""
      ).trim();

      if (!savedName) {
        return;
      }

      // =================================================
      // 1. UPDATE ALL PRODUCTS CACHE
      // =================================================

      queryClient.setQueryData(
        ["all-products"],
        (oldProducts) => {
          if (!Array.isArray(oldProducts)) {
            return oldProducts;
          }

          return oldProducts.map((product) => {
            if (
              Number(product?.product_id) !== productId
            ) {
              return product;
            }

            const existingSaleNames =
              Array.isArray(product?.sale_names)
                ? product.sale_names
                : [];

            // ---------------------------------------------
            // EDIT
            // ---------------------------------------------

            if (variables?.mode === "edit") {
              if (existingSaleNames.length === 0) {
                return {
                  ...product,
                  sale_names: [savedName],
                };
              }

              const updatedSaleNames =
                existingSaleNames.map((item) => {
                  if (typeof item === "string") {
                    return savedName;
                  }

                  const itemId =
                    item?.id ??
                    item?.sale_name_id;

                  if (
                    itemId !== undefined &&
                    String(itemId) ===
                      String(
                        variables?.sale_name_id
                      )
                  ) {
                    return {
                      ...item,
                      sale_name: savedName,
                    };
                  }

                  return item;
                });

              return {
                ...product,
                sale_names: updatedSaleNames,
              };
            }

            // ---------------------------------------------
            // ADD
            // ---------------------------------------------

            const alreadyExists =
              existingSaleNames.some((item) => {
                const name =
                  typeof item === "string"
                    ? item.trim()
                    : String(
                        item?.sale_name ??
                          item?.name ??
                          ""
                      ).trim();

                return (
                  name.toLowerCase() ===
                  savedName.toLowerCase()
                );
              });

            if (alreadyExists) {
              return product;
            }

            return {
              ...product,
              sale_names: [
                ...existingSaleNames,
                savedName,
              ],
            };
          });
        }
      );

      // =================================================
      // 2. UPDATE SALE-NAMES QUERY CACHE
      // =================================================

      queryClient.setQueryData(
        [
          ...SALE_NAME_QUERY_KEY,
          productId,
        ],
        (oldSaleNames) => {
          const existing =
            Array.isArray(oldSaleNames)
              ? oldSaleNames
              : [];

          // ---------------------------------------------
          // EDIT
          // ---------------------------------------------

          if (variables?.mode === "edit") {
            if (existing.length === 0) {
              return [
                {
                  id: variables?.sale_name_id,
                  sale_name: savedName,
                  product: productId,
                },
              ];
            }

            return existing.map((item) => {
              if (typeof item === "string") {
                return savedName;
              }

              const itemId =
                item?.id ??
                item?.sale_name_id;

              if (
                itemId !== undefined &&
                String(itemId) ===
                  String(
                    variables?.sale_name_id
                  )
              ) {
                return {
                  ...item,
                  sale_name: savedName,
                };
              }

              return item;
            });
          }

          // ---------------------------------------------
          // ADD
          // ---------------------------------------------

          const alreadyExists =
            existing.some((item) => {
              const name =
                typeof item === "string"
                  ? item.trim()
                  : String(
                      item?.sale_name ??
                        item?.name ??
                        ""
                    ).trim();

              return (
                name.toLowerCase() ===
                savedName.toLowerCase()
              );
            });

          if (alreadyExists) {
            return existing;
          }

          return [
            ...existing,
            response?.id
              ? {
                  ...response,
                  sale_name: savedName,
                }
              : {
                  sale_name: savedName,
                  product: productId,
                },
          ];
        }
      );

      // =================================================
      // 3. REFRESH SALE NAME DATA IN BACKGROUND
      // =================================================

      await queryClient.invalidateQueries({
        queryKey: [
          ...SALE_NAME_QUERY_KEY,
          productId,
        ],
      });
    },
  });
};