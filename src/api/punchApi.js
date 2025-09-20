// src/api/punchApi.js
import API from './axios';

// 🔹 Punch order to sheet
export const punchOrderToSheet = async (order) => {
  if (!order?.items?.length) {
    throw new Error("No items to punch");
  }

  // ✅ IST timestamp in proper format
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
    order_id: order.id,
    ss_party_name: order.ss_party_name,
    crm_name: order.crm_name,
    items: order.items.map(i => ({
      product_name: i.product_name,
      quantity: i.quantity,
      id: i.id,
      timestamp: istTimestamp, // include timestamp for each item
    })),
  };

  const response = await API.post("/punch-to-sheet/", payload);
  return response.data;
};
