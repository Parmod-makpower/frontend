// auth/useSchemes.js

import API from "../api/axios";

export const fetchSchemes = async () => {
  const res = await API.get("/schemes/");
  return res.data;
};

export const addScheme = async (newScheme) => {
  const res = await API.post("/schemes/", newScheme);
  return res.data;
};

export const updateScheme = async (id, updatedScheme) => {
  const res = await API.put(`/schemes/${id}/`, updatedScheme);
  return res.data;
};

export const deleteScheme = async (id) => {
  const res = await API.delete(`/schemes/${id}/`);
  return res.data;
};
