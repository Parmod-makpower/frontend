import API from "./axios";

/* =========================================================
   PRICE UPDATE
========================================================= */

export const updateProductPrices = async ({
  applicable_from,
  reason,
  items,
}) => {
  const response = await API.post(
    "/price-management/update/",
    {
      applicable_from,
      reason,
      items,
    }
  );

  return response.data;
};

/* =========================================================
   PRICE HISTORY
========================================================= */

export const getPriceHistory = async ({
  product_id = "",
  search = "",
} = {}) => {
  const params = {};

  if (
    product_id !== undefined &&
    product_id !== null &&
    product_id !== ""
  ) {
    params.product_id = product_id;
  }

  if (search?.trim()) {
    params.search = search.trim();
  }

  const response = await API.get(
    "/price-history/",
    {
      params,
    }
  );

  return response.data;
};

/* =========================================================
   SALE NAME
========================================================= */

/**
 * Get sale-name records for one product.
 */
export const getSaleNamesByProduct = async (
  product_id
) => {
  const response = await API.get(
    "/sale-names/",
    {
      params: {
        product_id,
      },
    }
  );

  const data = response.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

/**
 * Create Sale Name.
 *
 * IMPORTANT:
 * Backend validation is intentionally not guessed here.
 * If API returns 400, Axios preserves response.data so
 * the actual backend validation error can be inspected.
 */
export const addSaleName = async ({
  product_id,
  sale_name,
}) => {
  const cleanSaleName = String(
    sale_name ?? ""
  ).trim();

  if (!product_id) {
    throw new Error(
      "Product ID is required to add Sale Name."
    );
  }

  if (!cleanSaleName) {
    throw new Error(
      "Sale Name cannot be empty."
    );
  }

  try {
    const response = await API.post(
      "/sale-names/",
      {
        product: product_id,
        sale_name: cleanSaleName,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "❌ Add Sale Name API Error:",
      error?.response?.data || error
    );

    throw error;
  }
};

/**
 * Edit an existing SaleName record.
 */
export const updateSaleName = async ({
  sale_name_id,
  sale_name,
}) => {
  const cleanSaleName = String(
    sale_name ?? ""
  ).trim();

  if (!sale_name_id) {
    throw new Error(
      "Sale Name ID is required."
    );
  }

  if (!cleanSaleName) {
    throw new Error(
      "Sale Name cannot be empty."
    );
  }

  try {
    const response = await API.patch(
      `/sale-names/${sale_name_id}/`,
      {
        sale_name: cleanSaleName,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "❌ Update Sale Name API Error:",
      error?.response?.data || error
    );

    throw error;
  }
};