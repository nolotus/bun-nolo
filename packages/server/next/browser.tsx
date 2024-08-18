import React, { useState, useEffect } from "react";
import { hydrateRoot } from "react-dom/client";
import App from "./App";

function BrowserApp() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const onLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", onLocationChange);

    return () => window.removeEventListener("popstate", onLocationChange);
  }, []);

  const handleClick = (event, path) => {
    event.preventDefault();
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  return <App initialPath={currentPath} />;
}

const rootElement = document.getElementById("root");

if (rootElement) {
  hydrateRoot(rootElement, <BrowserApp />);
} else {
  throw new Error(
    "Root element not found. Make sure there is a div with id 'root' in your HTML.",
  );
}
