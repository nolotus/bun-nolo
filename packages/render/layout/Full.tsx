import React from "react";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="min-h-screen">
      <div className="w-full  flex-grow">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
