import {
  ThreeBarsIcon,
  HomeIcon,
  LocationIcon,
  BeakerIcon,
  PeopleIcon,
  DependabotIcon,
} from "@primer/octicons-react";
import { useAuth } from "auth/useAuth";
import clsx from "clsx";
import React, { useState, useEffect, useCallback } from "react";
import { MobileMenu } from "render/layout/blocks/MobileMenu";
import { UserControls } from "user/blocks/UserControls";
import NavListItem from "render/layout/blocks/NavListItem";
import zIndex from "app/styles/z-index";
import { headerHeight } from "app/styles/height";
import { nolotusId } from "core/init";

const nav = [
  { path: "/", label: "首页", icon: <HomeIcon size={24} /> },
  {
    path: "/spots",
    label: "兴趣点",
    icon: <LocationIcon size={24} />,
  },

  // { path: '/itineraries', label: '行程' },
  { path: "/people", label: "游民", icon: <PeopleIcon size={24} /> },
  { path: "/robots", label: "AI", icon: <DependabotIcon size={24} /> },

  // { path: '/gears', label: '装备' },
  {
    path: "/lab",
    label: "实验室",
    icon: <BeakerIcon size={24} />,
    allow_users: [nolotusId],
  },
];

const allowRule = (user, navItems) => {
  return user
    ? navItems.filter((item) => {
        if (!item.allow_users) {
          return true;
        }
        return item.allow_users.includes(user.userId);
      })
    : navItems;
};

export const Header: React.FC = () => {
  const auth = useAuth();
  const isAllowNav = allowRule(auth?.user, nav);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen((prevState) => !prevState);
  }, []);

  return (
    <header
      style={{ zIndex: zIndex.header, boxShadow: "var(--shadow-3)" }}
      className={clsx(headerHeight, "surface1")}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleMobileMenuToggle}
            className="lg:hidden"
          >
            <ThreeBarsIcon size={24} />
          </button>
          <ul className="hidden space-x-4 lg:flex">
            {isAllowNav.map((item) => (
              <NavListItem {...item} key={item.path} />
            ))}
          </ul>
          <UserControls />
        </div>
      </div>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        toggleMenu={handleMobileMenuToggle}
        navItems={isAllowNav}
      />
    </header>
  );
};
