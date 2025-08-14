// src/api/crmOrders.js
import API from "../api/axios"; // Pre-configured axios instance with baseURL, interceptors, etc.

// 📦 Get CRM assigned orders
export const getCRMOrders = async () => {
  const res = await API.get("/crm/orders/");
  return res.data;
};

// ✅ Verify an order
export const verifyCRMOrder = async (orderId, payload) => {
  const res = await API.post(`/crm/orders/${orderId}/verify/`, payload);
  return res.data;
};
