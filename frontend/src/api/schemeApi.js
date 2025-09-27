import API from './axios';

export const getSchemes = async () => {
  const response = await API.get("/schemes/");
  return response.data;
};


export const addScheme = async (schemeData) => {
  const response = await API.post("/schemes/", schemeData);
  return response.data;
};

export const updateScheme = async ({ id, updatedData }) => {
  const response = await API.put(`/schemes/${id}/`, updatedData);
  return response.data;
};


export const deleteScheme = async (id) => {
  const response = await API.delete(`/schemes/${id}/`);
  return response.data;
};
