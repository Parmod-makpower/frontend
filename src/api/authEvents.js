// ======================================================
// AUTH EVENTS
// Used to communicate between Axios and AuthContext
// ======================================================

export const AUTH_FORCE_LOGOUT = "auth:force-logout";

export const dispatchForceLogout = () => {
  window.dispatchEvent(
    new CustomEvent(AUTH_FORCE_LOGOUT)
  );
};