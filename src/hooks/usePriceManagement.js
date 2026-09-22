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
export const ALL_PRODUCTS_QUERY_KEY = ["all-products"];

const normalizeProductEnvelope = (cache) => {
  if (Array.isArray(cache)) {
    return {
      type: "array",
      products: cache,
      rebuild: (products) => products,
    };
  }

  if (Array.isArray(cache?.results)) {
    return {
      type: "results",
      products: cache.results,
      rebuild: (products) => ({ ...cache, results: products }),
    };
  }

  if (Array.isArray(cache?.products)) {
    return {
      type: "products",
      products: cache.products,
      rebuild: (products) => ({ ...cache, products }),
    };
  }

  return {
    type: "empty",
    products: [],
    rebuild: () => cache,
  };
};

export const useUpdateProductPrices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProductPrices,
    onSuccess: (response) => {
      const updatedProducts = Array.isArray(response?.updated_products)
        ? response.updated_products
        : [];

      if (updatedProducts.length) {
        queryClient.setQueryData(
          ALL_PRODUCTS_QUERY_KEY,
          (oldCache) => {
            const envelope = normalizeProductEnvelope(oldCache);
            if (!envelope.products.length) return oldCache;

            const updatedMap = new Map(
              updatedProducts.map((item) => [
                Number(item?.product_id),
                item,
              ])
            );

            return envelope.rebuild(
              envelope.products.map((product) => {
                const updated = updatedMap.get(
                  Number(product?.product_id)
                );
                if (!updated) return product;

                return {
                  ...product,
                  price:
                    updated.new_price ??
                    updated.price ??
                    product.price,
                  ds_price:
                    updated.new_ds_price ??
                    updated.ds_price ??
                    product.ds_price,
                  dlr_price:
                    updated.new_dlr_price ??
                    updated.dlr_price ??
                    product.dlr_price,
                };
              })
            );
          }
        );
      }

      queryClient.invalidateQueries({
        queryKey: PRICE_HISTORY_QUERY_KEY,
      });
    },
  });
};

export const usePriceHistory = ({
  product_id = "",
  search = "",
} = {}) =>
  useQuery({
    queryKey: [...PRICE_HISTORY_QUERY_KEY, product_id, search],
    queryFn: () => getPriceHistory({ product_id, search }),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

export const useSaleNamesByProduct = (productId, enabled = false) =>
  useQuery({
    queryKey: [...SALE_NAME_QUERY_KEY, Number(productId)],
    queryFn: () => getSaleNamesByProduct(productId),
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

export const useSaveSaleName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mode,
      product_id,
      sale_name_id,
      sale_name,
    }) => {
      const cleanSaleName = String(
        sale_name ?? ""
      ).trim();

      if (!cleanSaleName) {
        throw new Error("Sale Name cannot be empty.");
      }

      if (mode === "edit") {
        if (
          sale_name_id === undefined ||
          sale_name_id === null ||
          String(sale_name_id).trim() === ""
        ) {
          throw new Error(
            "Sale Name ID is required for edit."
          );
        }

        return updateSaleName({
          sale_name_id,
          sale_name: cleanSaleName,
        });
      }

      if (
        product_id === undefined ||
        product_id === null ||
        String(product_id).trim() === ""
      ) {
        throw new Error(
          "Product ID is required to add Sale Name."
        );
      }

      return addSaleName({
        product_id,
        sale_name: cleanSaleName,
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

      if (!productId || !savedName) {
        return;
      }

      /*
       * =====================================================
       * 1. UPDATE ALL PRODUCTS CACHE
       * =====================================================
       */

      queryClient.setQueryData(
        ALL_PRODUCTS_QUERY_KEY,
        (oldCache) => {
          const envelope =
            normalizeProductEnvelope(oldCache);

          if (!envelope.products.length) {
            return oldCache;
          }

          return envelope.rebuild(
            envelope.products.map((product) => {
              if (
                Number(product?.product_id) !==
                productId
              ) {
                return product;
              }

              const existing = Array.isArray(
                product?.sale_names
              )
                ? product.sale_names
                : [];

              /*
               * -------------------------------
               * EDIT
               * -------------------------------
               */
              if (
                variables?.mode === "edit"
              ) {
                const saleNameId =
                  variables?.sale_name_id;

                /*
                 * Existing record found
                 */
                const updatedExisting =
                  existing.map((item) => {
                    if (
                      typeof item === "string"
                    ) {
                      return item;
                    }

                    const itemId =
                      item?.id ??
                      item?.sale_name_id ??
                      item?.pk;

                    if (
                      itemId !== undefined &&
                      itemId !== null &&
                      String(itemId) ===
                        String(saleNameId)
                    ) {
                      return {
                        ...item,
                        id:
                          item?.id ??
                          saleNameId,
                        sale_name:
                          savedName,
                      };
                    }

                    return item;
                  });

                /*
                 * If matching ID was not found,
                 * keep the product usable by
                 * replacing the first sale-name
                 * record.
                 */
                const found = existing.some(
                  (item) => {
                    if (
                      typeof item ===
                      "string"
                    ) {
                      return false;
                    }

                    const itemId =
                      item?.id ??
                      item?.sale_name_id ??
                      item?.pk;

                    return (
                      itemId !== undefined &&
                      itemId !== null &&
                      String(itemId) ===
                        String(saleNameId)
                    );
                  }
                );

                if (found) {
                  return {
                    ...product,
                    sale_names:
                      updatedExisting,
                  };
                }

                return {
                  ...product,
                  sale_names: [
                    {
                      id: saleNameId,
                      sale_name: savedName,
                    },
                  ],
                };
              }

              /*
               * -------------------------------
               * ADD
               * -------------------------------
               */

              const exists =
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

              if (exists) {
                return product;
              }

              const responseId =
                response?.id ??
                response?.sale_name_id ??
                response?.pk;

              return {
                ...product,
                sale_names: [
                  ...existing,
                  responseId
                    ? {
                        ...response,
                        id: responseId,
                        sale_name:
                          savedName,
                      }
                    : {
                        sale_name:
                          savedName,
                      },
                ],
              };
            })
          );
        }
      );

      /*
       * =====================================================
       * 2. UPDATE SALE-NAME QUERY CACHE
       * =====================================================
       */

      queryClient.setQueryData(
        [
          ...SALE_NAME_QUERY_KEY,
          productId,
        ],
        (oldSaleNames) => {
          const existing = Array.isArray(
            oldSaleNames
          )
            ? oldSaleNames
            : [];

          /*
           * -------------------------------
           * EDIT
           * -------------------------------
           */
          if (
            variables?.mode === "edit"
          ) {
            const saleNameId =
              variables?.sale_name_id;

            let found = false;

            const updated = existing.map(
              (item) => {
                if (
                  typeof item === "string"
                ) {
                  return item;
                }

                const itemId =
                  item?.id ??
                  item?.sale_name_id ??
                  item?.pk;

                if (
                  itemId !== undefined &&
                  itemId !== null &&
                  String(itemId) ===
                    String(saleNameId)
                ) {
                  found = true;

                  return {
                    ...item,
                    id:
                      item?.id ??
                      saleNameId,
                    sale_name:
                      savedName,
                    product:
                      item?.product ??
                      productId,
                  };
                }

                return item;
              }
            );

            if (found) {
              return updated;
            }

            return [
              ...existing,
              {
                id: saleNameId,
                sale_name: savedName,
                product: productId,
              },
            ];
          }

          /*
           * -------------------------------
           * ADD
           * -------------------------------
           */

          const exists =
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

          if (exists) {
            return existing;
          }

          const responseId =
            response?.id ??
            response?.sale_name_id ??
            response?.pk;

          return [
            ...existing,
            responseId
              ? {
                  ...response,
                  id: responseId,
                  sale_name:
                    savedName,
                  product: productId,
                }
              : {
                  sale_name: savedName,
                  product: productId,
                },
          ];
        }
      );

      /*
       * =====================================================
       * 3. REFRESH SALE-NAME QUERY
       * =====================================================
       */

      await queryClient.invalidateQueries({
        queryKey: [
          ...SALE_NAME_QUERY_KEY,
          productId,
        ],
      });
    },
  });
};

export const useAddSaleName = () =>
  useSaveSaleName();

export const useUpdateSaleName = () =>
  useSaveSaleName();
