// src/api/punchApi.js
import API from './axios';

// 🔹 Punch order to sheet
export const punchOrderToSheet = async (order, dispatchLocation) => {
  if (!order?.items?.length) {
    throw new Error("No items to punch");
  }

  const now = new Date();
  const istTimestamp = now.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const payload = {
    id: order.id,
    order_id: order.order_id,
    ss_party_name: order.ss_party_name,
    crm_name: order.crm_name,
    dispatch_location: dispatchLocation,
    is_single_row: order.is_single_row || false, // 🔥 FIX
    items: order.items.map(i => ({
      product_name: i.product_name,
      quantity: i.quantity,
      id: i.id,
      timestamp: istTimestamp,
    })),
  };

  const response = await API.post("/punch-to-sheet/", payload);
  return response.data;
};



export const submitMeetForm = async (formData) => {
  const response = await API.post("/submit-meet-form/", formData);
  return response.data;
};


export const submitDealerList = async (dealers) => {
  const response = await API.post("/submit-dealers/", { dealers });
  return response.data;
};
