import React from "react";
import { Outlet } from "react-router-dom";
import Sizes from "open-props/src/sizes";

import Sidebar from "./blocks/Sidebar";

const Setting: React.FC = () => {
  return (
    <div className={`flex flex-row justify-between`}>
      <Sidebar />
      <main
        className="flex-1 overflow-y-auto"
        style={{
          marginTop: Sizes["--size-fluid-3"],
          paddingLeft: Sizes["--size-fluid-1"],
          paddingRight: Sizes["--size-fluid-8"],
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default Setting;
