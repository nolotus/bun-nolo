import React from "react";

import { useAuth } from "auth/useAuth";
import { nolotusId } from "core/init";
import { Link } from "react-router-dom";
import Sizes from "open-props/src/sizes";

import { USER_PROFILE_ROUTE, EDITOR_CONFIG } from "../routes";

const allowedUserIds = [nolotusId];

const navItems = [
  { path: `/settings/${USER_PROFILE_ROUTE}`, label: "个人资料" },
  { path: `/settings/${EDITOR_CONFIG}`, label: "编辑器设置" },
  { path: "/settings/sync", label: "同步设置" },
  { path: "/settings/account", label: "账号设置" },
  { path: "/settings/website", label: "网站设置" },
  { path: "/settings/customize", label: "个性化设置" },
];
const Sidebar: React.FC = () => {
  const auth = useAuth();

  const couldDisplay = (item) => {
    if (item.label === "服务商设置") {
      if (auth.user) {
        if (allowedUserIds.includes(auth.user?.userId)) {
          return true;
        }
      }
      return false;
    }
    return true;
  };
  return (
    <div style={{ margin: Sizes["--size-fluid-3"] }}>
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: Sizes["--size-1"],
        }}
      >
        {navItems.map((item) => {
          const isDisplay = couldDisplay(item);
          return isDisplay ? (
            <Link key={item.label} to={item.path} className="text-black"
            
            style={{fontWeight:'bold'}}>
              {item.label}
            </Link>
          ) : null;
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
