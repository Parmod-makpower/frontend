import { useQuery } from "@tanstack/react-query";
import API from "../api/axios";

// 📦 Get CRM assigned orders
const getCRMOrders = async () => {
  const res = await API.get("/crm/orders/");
  return res.data;
};

export const useCRMOrders = () => {
  return useQuery({
    queryKey: ["crmOrders"],
    queryFn: getCRMOrders,
    keepPreviousData: true,   // 🔹 नया data आने तक पुराना दिखाओ
    staleTime: 0,             // 🔹 हर बार mount पर fresh मानो
    refetchOnMount: true,     // 🔹 हर बार component mount होने पर backend से लाओ
    refetchOnWindowFocus: false, // (optional) window focus पर auto refresh ना हो
  });
};

// ✅ Verify an order
export const verifyCRMOrder = async (orderId, payload) => {
  const res = await API.post(`/crm/orders/${orderId}/verify/`, payload);
  return res.data;
};


// ✅ Delete order
export const deleteCRMOrder = async (orderId) => {
  const res = await API.delete(`/crm/orders/${orderId}/delete/`);
  return res.data;
};
