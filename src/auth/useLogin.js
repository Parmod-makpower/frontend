import API from "../api/axios";
// ✅ FIX THIS
export const loginUser = async (mobileOrId, password) => {
  const response = await API.post("/accounts/login/", {
    mobile_or_id: mobileOrId,  // ✅ backend expects this key exactly
    password: password,
  });
  return response.data;
};
