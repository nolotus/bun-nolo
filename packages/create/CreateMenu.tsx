// CreateMenu.jsx
import React from "react";
import {
  PlusIcon,
  NoteIcon,
  DependabotIcon,
  LocationIcon,
} from "@primer/octicons-react";
import DropDown from "render/ui/DropDown";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";

import { layout } from "render/styles/layout";
import { txt } from "render/styles/txt";

import Button from "render/ui/Button";
import { TooltipAnchor } from "render/ui/TooltipAnchor";
import { CreateRoutePaths } from "./routes";

const CircleButton = ({ tooltip, icon, to, onClick }) => {
  const buttonStyle = {
    ...layout.flexCenter,
    borderRadius: "9999px",
    padding: "8px",
    minWidth: "auto",
  };

  const hoverStyle = {
    backgroundColor: "#f6f8fa",
  };

  const ButtonContent = (
    <Button
      style={buttonStyle}
      hoverStyle={hoverStyle}
      icon={icon}
      aria-label={tooltip}
    />
  );

  return (
    <>
      <TooltipAnchor
        className="link"
        description={tooltip}
        render={
          to ? (
            <Link to={to} onClick={onClick} style={txt.decorationNone}>
              {ButtonContent}
            </Link>
          ) : (
            <div onClick={onClick}>{ButtonContent}</div>
          )
        }
      >
        Tooltip with Framer Motion
      </TooltipAnchor>
    </>
  );
};

const buttonItems = [
  {
    tooltip: "添加页面",
    icon: <NoteIcon size={16} />,
    path: `/${CreateRoutePaths.CREATE_PAGE}`,
  },
  {
    tooltip: "添加Cybot",
    icon: <DependabotIcon size={16} />,
    path: `/${CreateRoutePaths.CREATE_CYBOT}`,
  },
  {
    tooltip: "添加地点",
    icon: <LocationIcon size={16} />,
    path: `/${CreateRoutePaths.CREATE_PAGE}?id=000000100000-UWJFNG1GZUwzLVMzaWhjTzdnWmdrLVJ6d1d6Rm9FTnhYRUNXeFgyc3h6VQ-M0fHLuYH8TACclIi9dsWF`,
  },
];

export const CreateMenu = () => {
  const theme = useSelector(selectTheme);

  return (
    <DropDown
      direction="bottom"
      trigger={
        <CircleButton
          tooltip="add new"
          icon={<PlusIcon size={16} />}
          to="/create"
        />
      }
      triggerType="hover"
    >
      <div
        style={{
          ...layout.flexColumn,
          gap: "8px",
          padding: "8px",
          borderRadius: "6px",
        }}
      >
        {buttonItems.map((item, index) => (
          <CircleButton
            key={index}
            tooltip={item.tooltip}
            icon={item.icon}
            to={item.path}
          />
        ))}
      </div>
    </DropDown>
  );
};
