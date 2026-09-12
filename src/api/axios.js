// import axios from 'axios';

// const API = axios.create({
//   baseURL: 'https://makpower-sw.onrender.com/api/', 
//   // baseURL: 'http://127.0.0.1:8000/api/',
// });

// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem('accessToken');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });


// API.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       // ✅ Token expire ho gaya — logout
//       localStorage.clear();
//       window.location.href = "/login"; // ya jis route par login hai
//     }
//     return Promise.reject(error);
//   }
// );

// export default API;



import axios from "axios";
import {
  dispatchForceLogout,
} from "./authEvents";

const API = axios.create({
  // baseURL: "https://makpower-sw.onrender.com/api/",
  baseURL: "http://127.0.0.1:8000/api/",
});


// ======================================================
// REQUEST INTERCEPTOR
// ======================================================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// ======================================================
// REFRESH CONTROL
// ======================================================

// Prevent multiple API calls from refreshing at the same time
let isRefreshing = false;
let refreshSubscribers = [];


// Add failed requests to queue
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};


// Send new token to all waiting requests
const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => {
    callback(newToken);
  });

  refreshSubscribers = [];
};


// If refresh fails, reject all waiting requests
const onRefreshFailed = (error) => {
  refreshSubscribers.forEach((callback) => {
    callback(null, error);
  });

  refreshSubscribers = [];
};


// ======================================================
// LOGOUT
// ======================================================
const forceLogout = () => {

  // Remove authentication data
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  // Clear React Query cache
  if (window.__queryClient) {
    window.__queryClient.clear();
  }

  // Clear persisted React Query cache
  localStorage.removeItem(
    "makpower-react-query-cache"
  );

  // Tell AuthContext
  dispatchForceLogout();

  // Go to login
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================

API.interceptors.response.use(
  (response) => response,

  async (error) => {

    const originalRequest = error.config;

    // No response from server
    if (!error.response) {
      return Promise.reject(error);
    }

    // Only handle 401
    if (error.response.status !== 401) {
      return Promise.reject(error);
    }


    // ==================================================
    // DO NOT REFRESH LOGIN REQUEST
    // ==================================================

    if (
      originalRequest?.url?.includes("/accounts/login/")
    ) {
      return Promise.reject(error);
    }


    // ==================================================
    // DO NOT REFRESH REFRESH REQUEST
    // ==================================================

    if (
      originalRequest?.url?.includes("/accounts/refresh/")
    ) {
      forceLogout();
      return Promise.reject(error);
    }


    // Prevent infinite retry
    if (originalRequest._retry) {
      forceLogout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;


    const refreshToken = localStorage.getItem("refreshToken");

    // No refresh token → logout
    if (!refreshToken) {
      forceLogout();
      return Promise.reject(error);
    }


    // ==================================================
    // ANOTHER REQUEST IS ALREADY REFRESHING
    // ==================================================

    if (isRefreshing) {

      return new Promise((resolve, reject) => {

        subscribeTokenRefresh((newToken, refreshError) => {

          if (refreshError || !newToken) {
            reject(refreshError || error);
            return;
          }

          originalRequest.headers.Authorization =
            `Bearer ${newToken}`;

          resolve(API(originalRequest));
        });

      });
    }


    // ==================================================
    // START TOKEN REFRESH
    // ==================================================

    isRefreshing = true;


    try {

      const refreshResponse = await axios.post(
        `${API.defaults.baseURL}accounts/refresh/`,
        {
          refresh: refreshToken,
        }
      );


      const newAccessToken =
        refreshResponse.data.access;


      if (!newAccessToken) {
        throw new Error("No access token received.");
      }


      // Save new access token
      localStorage.setItem(
        "accessToken",
        newAccessToken
      );


      // If refresh rotation is ever enabled,
      // save the new refresh token too.
      if (refreshResponse.data.refresh) {
        localStorage.setItem(
          "refreshToken",
          refreshResponse.data.refresh
        );
      }


      // Notify waiting requests
      onRefreshed(newAccessToken);


      // Retry original request
      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return API(originalRequest);

    } catch (refreshError) {

      onRefreshFailed(refreshError);

      forceLogout();

      return Promise.reject(refreshError);

    } finally {

      isRefreshing = false;
    }
  }
);


export default API;