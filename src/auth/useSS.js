import API from "../api/axios";

export const fetchSSUsers = async () => {
  const res = await API.get("/accounts/ss-users/");
  return res.data;
};

export const createSSUser = async (data) => {
  const res = await API.post("/accounts/ss-users/", data);
  return res.data;
};

export const updateSSUser = async (id, data) => {
  const res = await API.put(`/accounts/ss-users/${id}/`, data);
  return res.data;
};

export const toggleSSStatus = async (id, is_active) => {
  const res = await API.patch(`/accounts/ss-users/${id}/`, { is_active });
  return res.data;
};
