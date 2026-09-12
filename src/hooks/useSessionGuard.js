import { useEffect } from "react";
import API from "../api/axios";

export default function useSessionGuard(user) {
  useEffect(() => {
    // User logged in nahi hai
    if (!user) {
      return;
    }

    let isMounted = true;

    const checkSession = async () => {
      if (!isMounted) return;

      try {
        await API.get("/accounts/session-check/");
      } catch (error) {
        // Axios interceptor 401 ko handle karega.
        // Yahan manually logout nahi karna hai.
        console.warn("Session check failed:", error);
      }
    };

    // Login / app load ke baad ek immediate check
    checkSession();

    // Uske baad har 60 seconds
    const intervalId = setInterval(() => {
      checkSession();
    }, 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [user]);
}