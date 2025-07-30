// auth/useLogin.js

import API from "../api/axios";

export const loginUser = async (mobileOrId, password) => {
  const response = await API.post("/accounts/login/", {
    mobile_or_id: mobileOrId,  // ✅ snake_case as backend expects
    password: password,
  });
  return response.data;
};
