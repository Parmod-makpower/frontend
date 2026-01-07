import { createContext, useContext, useState, useEffect } from "react";

const StockContext = createContext();

export const StockProvider = ({ children }) => {
  const [stockType, setStockType] = useState(
    localStorage.getItem("stockType") || "virtual"
  );

  useEffect(() => {
    localStorage.setItem("stockType", stockType);
  }, [stockType]);

  const getStockValue = (product) => {
    if (!product) return 0;

    if (stockType === "mumbai") {
      return Number(product.mumbai_stock ?? 0);
    }

    return Number(product.virtual_stock ?? 0);
  };

  return (
    <StockContext.Provider
      value={{ stockType, setStockType, getStockValue }}
    >
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => useContext(StockContext);
