import React from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./blocks/Sidebar";

const Setting: React.FC = () => {
  return (
    <div className={`flex flex-row`}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Setting;
