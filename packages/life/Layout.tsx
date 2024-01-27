import { Outlet } from "react-router-dom";
import { Header } from "render/layout/Header";
import React from "react";

import { Sidebar } from "./blocks/Sidebar";
export const Layout = () => {
  return (
    <div className="flex h-screen flex-col bg-neutral-200">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 transition duration-500 ease-snappy sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
