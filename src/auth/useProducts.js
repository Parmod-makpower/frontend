// auth/useProducts.js

import API from "../api/axios";

export const fetchProducts = async () => {
  const res = await API.get("/products/");
  return res.data;
};

export const fetchFilteredProducts = async (searchTerm = "", page = 1, limit = 20) => {
  try {
    const res = await API.get(`/products/?search=${searchTerm}&page=${page}&limit=${limit}`);
    return res.data; // { results, count, next, previous }
  } catch (err) {
    if (err.response?.status === 404) {
      // ✅ If page not found, return empty results
      return { results: [], count: 0, next: null, previous: null };
    }
    throw err; // for other errors, throw as-is
  }
};
