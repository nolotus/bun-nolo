import React from 'react';
import { Outlet } from 'react-router-dom';

import { Header } from './blocks/Header';

const Layout = () => {
  return (
    <div className="bg-[#e2e1e0] bg-opacity-70 flex flex-col min-h-screen">
      <Header />
      <div className="w-full  flex-grow">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
