// src/auth/useDS.js

import API from "../api/axios";

// ✅ 1. Get all DS
export const fetchDSUsers = async () => {
  const res = await API.get("/accounts/ds-users/");
  return res.data;
};

// ✅ 2. Create new DS (with full form data)
export const createDSUser = async (data) => {
  const res = await API.post("/accounts/ds-users/", data);
  return res.data;
};

// ✅ 3. Update existing DS
export const updateDSUser = async (id, data) => {
  const res = await API.put(`/accounts/ds-users/${id}/`, data);
  return res.data;
};

// ✅ 4. Toggle DS active/inactive
export const toggleDSStatus = async (id, is_active) => {
  const res = await API.patch(`/accounts/ds-users/${id}/`, { is_active });
  return res.data;
};
