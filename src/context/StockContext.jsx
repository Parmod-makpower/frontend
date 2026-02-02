import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const StockContext = createContext();

export const StockProvider = ({ children }) => {
  const { user } = useAuth();
  const [stockType, setStockType] = useState("virtual"); // default Delhi

  // 🔥 AUTO SYNC WHEN APP OPENS / USER CHANGES
  useEffect(() => {
    if (user?.stock_location === "MUMBAI") {
      setStockType("mumbai");
    } else {
      setStockType("virtual"); // DELHI
    }
  }, [user]);

  const getStockValue = (product) => {
    if (!product) return 0;

    return stockType === "mumbai"
      ? Number(product.mumbai_stock ?? 0)
      : Number(product.virtual_stock ?? 0);
  };

  return (
    <StockContext.Provider value={{ stockType, getStockValue }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => useContext(StockContext);
