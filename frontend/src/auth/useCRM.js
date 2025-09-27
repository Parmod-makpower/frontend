import API from "../api/axios";

export const fetchCRMUsers = async () => {
  const res = await API.get("/accounts/crm-users/");
  return res.data;
};

export const createCRMUser = async (data) => {
  const res = await API.post("/accounts/crm-users/", data);
  return res.data;
};

export const updateCRMUser = async (id, payload) => {
  const res = await API.patch(`/accounts/crm-users/${id}/`, payload);
  return res.data;
};

export const toggleCRMStatus = async (id, is_active) => {
  const res = await API.patch(`/accounts/crm-users/${id}/`, { is_active });
  return res.data;
};
