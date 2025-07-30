import API from "../api/axios";

// Admin Dashboard
export const fetchAdminDashboard = async () => {
  const res = await API.get("/accounts/admin-dashboard/");
  return res.data;
};

// CRM Dashboard
export const fetchCRMDashboard = async () => {
  const res = await API.get("/accounts/crm-dashboard/");
  return res.data;
};

// SS Dashboard
export const fetchSSDashboard = async () => {
  const res = await API.get("/accounts/ss-dashboard/");
  return res.data;
};
