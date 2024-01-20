import {
  ThreeBarsIcon,
  HomeIcon,
  LocationIcon,
  BeakerIcon,
  PeopleIcon,
} from "@primer/octicons-react";
import { useAuth } from "app/hooks";
import clsx from "clsx";
import React, { useState, useEffect, useCallback } from "react";
import { MobileMenu } from "render/layout/blocks/MobileMenu"; // 假设这些是拆分后的组件
import { UserControls } from "user/blocks/UserControls";
import NavListItem from "render/layout/blocks/NavListItem"; // 假设这些是拆分后的组件
import zIndex from "app/styles/z-index";

const nav = [
  { path: "/", label: "首页", icon: <HomeIcon size={24} /> },
  // { path: '/nomadspots', label: '旅居点' },
  {
    path: "/spots",
    label: "兴趣点",
    icon: <LocationIcon size={24} />,
  },

  // { path: '/itineraries', label: '行程' },
  { path: "/people", label: "游民", icon: <PeopleIcon size={24} /> },
  // { path: '/gears', label: '装备' },
  {
    path: "/lab",
    label: "实验室",
    icon: <BeakerIcon size={24} />,
    allow_users: ["UWJFNG1GZUwzLVMzaWhjTzdnWmdrLVJ6d1d6Rm9FTnhYRUNXeFgyc3h6VQ"],
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
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setIsSticky(window.pageYOffset > 0);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen((prevState) => !prevState);
  }, []);

  return (
    <header
      style={{ zIndex: zIndex.header }}
      className={clsx("bg-white", {
        "fixed top-0 left-0 right-0 bg-gray-200 shadow-md": isSticky,
      })}
    >
      <div className="container mx-auto ">
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleMobileMenuToggle}
            className="lg:hidden"
          >
            <ThreeBarsIcon size={24} />
          </button>
          <ul className="hidden lg:flex space-x-4">
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
