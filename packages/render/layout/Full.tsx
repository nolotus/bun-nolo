import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";

const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-200">
      <Header />
      <div className="w-full  flex-grow">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
