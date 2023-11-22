import React from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from './blocks/Sidebar';

const SettingLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen">
      {/* 添加 responsive 左侧边栏 */}
      <div className="w-full sm:w-64 bg-gray-800 overflow-y-auto">
        <Sidebar />
      </div>
      {/* 添加自适应主内容区 */}
      <main className="flex-1 bg-gray-100 overflow-y-auto p-4 md:p-8 lg:p-12">
        <Outlet />
      </main>
    </div>
  );
};

export default SettingLayout;
