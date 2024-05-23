import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";

const Layout = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="w-full  flex-grow">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
