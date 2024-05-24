import { XIcon } from "@primer/octicons-react";
import React from "react";
import NavListItem from "./NavListItem";
import zIndex from "app/styles/z-index";
import IconButton from "ui/IconButton";

interface MobileMenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
  navItems: { path: string; label: string; icon?: JSX.Element }[];
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  toggleMenu,
  navItems,
}) => {
  if (!isOpen) {
    return null;
  }

  const overlayStyle = {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: zIndex.mobileMenu,
    backgroundColor: "rgba(0, 0, 0, 0.8)", // 对应 bg-black bg-opacity-80
    display: "block", // 对应 lg:hidden
  };

  const contentStyle = {
    padding: "0.5rem 1rem", // 对应 px-4 py-2
  };

  const buttonStyle = {
    color: "white", // 对应 text-white
    float: "right", // 对应 float-right
  };

  const listStyle = {
    marginTop: "2rem", // 对应 mt-8
  };

  const listItemStyle = {
    marginBottom: "0.5rem", // 对应 space-y-2
    color: "white",
  };

  return (
    <div style={overlayStyle}>
      <div style={contentStyle}>
        <IconButton
          icon={XIcon}
          onClick={toggleMenu}
          style={buttonStyle}
        ></IconButton>

        <div style={listStyle}>
          {navItems.map((item) => (
            <NavListItem {...item} key={item.path} style={listItemStyle} />
          ))}
        </div>
      </div>
    </div>
  );
};
