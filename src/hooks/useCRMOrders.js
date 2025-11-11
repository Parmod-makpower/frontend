import { useQuery } from "@tanstack/react-query";
import API from "../api/axios";

// 📦 Get CRM assigned orders (with dynamic status)
const getCRMOrders = async (status) => {
  const res = await API.get(`/crm/orders/?status=${status}`);
  return res.data;
};

export const useCRMOrders = (status = "PENDING") => {
  return useQuery({
    queryKey: ["crmOrders", status],   // ✅ status ke hisaab se caching
    queryFn: () => getCRMOrders(status),
    keepPreviousData: true,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};

// ✅ Hold an order
export const holdCRMOrder = async (orderId, payload) => {
  const res = await API.post(`/crm/orders/${orderId}/hold/`, payload);
  return res.data;
};


// ✅ Verify an order
export const verifyCRMOrder = async (orderId, payload) => {
  const res = await API.post(`/crm/orders/${orderId}/verify/`, payload);
  return res.data;
};


// ✅ Reject an order
export const RejectCRMOrder = async (orderId, payload) => {
  const res = await API.post(`/crm/orders/${orderId}/reject/`, payload);
  return res.data;
};

// ✅ Delete order
export const deleteCRMOrder = async (orderId) => {
  const res = await API.delete(`/crm/orders/${orderId}/delete/`);
  return res.data;
};
