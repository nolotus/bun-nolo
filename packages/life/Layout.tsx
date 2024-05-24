import { Outlet } from "react-router-dom";
import { Header } from "render/layout/Header";
import React from "react";

import { Sidebar } from "./blocks/Sidebar";
export const Layout = () => {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1  p-4 transition duration-500 ease-snappy sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
