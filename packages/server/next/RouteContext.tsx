// RouteContext.tsx
import React, { createContext, useState, useContext, useEffect } from "react";

interface RouteContextType {
  currentPath: string;
  navigate: (path: string) => void;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export const RouteProvider: React.FC<{
  children: React.ReactNode;
  initialPath: string;
}> = ({ children, initialPath }) => {
  const [currentPath, setCurrentPath] = useState(initialPath);

  const navigate = (path: string) => {
    window.history.pushState(null, "", path);
    setCurrentPath(path);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <RouteContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouteContext.Provider>
  );
};

export const useRoute = () => {
  const context = useContext(RouteContext);
  if (context === undefined) {
    throw new Error("useRoute must be used within a RouteProvider");
  }
  return context;
};
