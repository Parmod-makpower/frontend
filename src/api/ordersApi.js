import API from "../api/axios"; // <- आपकी existing axios instance

export const fetchOrdersByRole = async () => {
  const { data } = await API.get("/orders-by-role/");
  return data;
};
