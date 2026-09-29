


import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useQueryClient } from "@tanstack/react-query";

import {
  AUTH_FORCE_LOGOUT,
} from "../api/authEvents";


const AuthContext = createContext();


// ======================================================
// AUTH STORAGE CLEANUP
// ======================================================

const clearAuthStorage = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  // React Query persisted cache
  localStorage.removeItem(
    "makpower-react-query-cache"
  );
};


// ======================================================
// AUTH PROVIDER
// ======================================================

export const AuthProvider = ({ children }) => {

  const storedUser = localStorage.getItem("user");

  const [user, setUser] = useState(() => {
    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  const queryClient = useQueryClient();


  // ====================================================
  // FORCE LOGOUT FROM AXIOS
  // ====================================================

  useEffect(() => {

    const handleForceLogout = () => {

      // Clear React Query memory cache
      queryClient.clear();

      // Clear authentication state
      setUser(null);
    };


    window.addEventListener(
      AUTH_FORCE_LOGOUT,
      handleForceLogout
    );


    return () => {
      window.removeEventListener(
        AUTH_FORCE_LOGOUT,
        handleForceLogout
      );
    };

  }, [queryClient]);


  // ====================================================
  // LOGIN
  // ====================================================

  const login = ({
    user,
    access,
    refresh,
  }) => {

    localStorage.setItem(
      "accessToken",
      access
    );

    localStorage.setItem(
      "refreshToken",
      refresh
    );

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    setUser(user);
  };


  // ====================================================
  // NORMAL LOGOUT
  // ====================================================

  const logout = async (callback) => {

    // 1. Clear React Query memory cache
    queryClient.clear();

    // 2. Clear auth + persisted cache
    clearAuthStorage();

    // 3. Reset React auth state
    setUser(null);

    // 4. Optional callback
    if (callback) {
      callback();
    }
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


// ======================================================
// HOOK
// ======================================================

export const useAuth = () => useContext(AuthContext);