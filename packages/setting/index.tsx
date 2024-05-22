import React from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./blocks/Sidebar";

const Setting: React.FC = () => {
  return (
    <div className={`flex flex-col lg:flex-row`}>
      {/* 添加 responsive 左侧边栏 */}
      <div className="w-full overflow-y-auto bg-gray-800 sm:w-64">
        <Sidebar />
      </div>

      {/* 添加自适应主内容区 */}
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-8 lg:p-12">
        <Outlet />
      </main>
    </div>
  );
};

export default Setting;
