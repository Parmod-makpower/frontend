import { createContext, useContext, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { localStoragePersister } from "../main";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const storedUser = localStorage.getItem("user");
  const [user, setUser] = useState(
    storedUser ? JSON.parse(storedUser) : null
  );

  const queryClient = useQueryClient();

  const login = ({ user, access, refresh }) => {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const logout = async (callback) => {
    // ✅ 1. React Query memory cache clear
    queryClient.clear();

    // ✅ 2. Persisted react-query cache clear (VERSION SAFE)
    await localStoragePersister.removeClient();

    // ✅ 3. localStorage clear
    localStorage.clear();

    // ✅ 4. user reset
    setUser(null);

    if (callback) callback();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
