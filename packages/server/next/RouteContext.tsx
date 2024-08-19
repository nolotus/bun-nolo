// RouteContext.tsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { routes } from "ai/write/routes";

interface RouteContextType {
  currentPath: string;
  navigate: (path: string) => void;
  direction: number;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export const RouteProvider: React.FC<{
  initialPath: string;
  children: React.ReactNode;
}> = ({ initialPath, children }) => {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [direction, setDirection] = useState(0);

  const navigate = (path: string) => {
    const currentIndex = Object.keys(routes).indexOf(currentPath);
    const nextIndex = Object.keys(routes).indexOf(path);
    setDirection(nextIndex > currentIndex ? 1 : -1);
    setCurrentPath(path);
    window.history.pushState(null, "", path);
  };

  useEffect(() => {
    const handlePopState = () => {
      const newPath = window.location.pathname;
      const currentIndex = Object.keys(routes).indexOf(currentPath);
      const newIndex = Object.keys(routes).indexOf(newPath);
      setDirection(newIndex > currentIndex ? 1 : -1);
      setCurrentPath(newPath);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [currentPath]);

  return (
    <RouteContext.Provider value={{ currentPath, navigate, direction }}>
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
