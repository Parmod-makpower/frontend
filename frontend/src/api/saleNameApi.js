import API from "./axios";

export const fetchSaleNames = async ({ page = 1, pageSize = 10, productId = "" }) => {
  let url = `/sale-names/?page=${page}&page_size=${pageSize}`;
  if (productId) url += `&product_id=${productId}`;
  const res = await API.get(url);
  return res.data;
};

export const addSaleName = async (data) => {
  const res = await API.post("/sale-names/", data);
  return res.data;
};

export const deleteSaleNameById = async (id) => {
  const res = await API.delete(`/sale-names/${id}/`);
  return res.data;
};

export const deleteAllSaleNames = async () => {
  const res = await API.delete("/sale-names/delete-all/");
  return res.data;
};

export const deleteSaleNamesByProduct = async (productId) => {
  const res = await API.delete(`/sale-names/delete-by-product/${productId}/`);
  return res.data;
};

export const uploadSaleNameBulk = async (formData) => {
  const res = await API.post("/sale-names/bulk-upload/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
