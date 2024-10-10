// CreateMenu.jsx
import React from "react";
import {
  PlusIcon,
  NoteIcon,
  DependabotIcon,
  LocationIcon,
} from "@primer/octicons-react";
import DropDown from "render/ui/DropDown";
import Sizes from "open-props/src/sizes";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "@primer/react/next";
import { Link } from "react-router-dom";
import OpenProps from "open-props";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";

import { CreateRoutePaths } from "./routes";

const buttonStyle = (theme: any): React.CSSProperties => ({
  padding: "6px",
  borderRadius: OpenProps.radiusRound,
  cursor: "pointer",
  color: "inherit",
  backgroundColor: theme.backgroundColor,
  border: `1px solid ${theme.surface2}`,
  transition: "background-color 0.2s",
});

const handleMouseEnter = (
  e: React.MouseEvent<HTMLButtonElement>,
  theme: any,
) => {
  e.currentTarget.style.backgroundColor =
    theme.themeName === "dark" ? theme.surface4 : theme.surface2;
};

const handleMouseLeave = (
  e: React.MouseEvent<HTMLButtonElement>,
  theme: any,
) => {
  e.currentTarget.style.backgroundColor =
    theme.themeName === "dark" ? theme.surface3 : theme.backgroundColor;
};

export const CircleButton = ({ tooltip, icon, to, onClick }) => {
  const theme = useSelector(selectTheme);

  const ButtonContent = (
    <button
      style={buttonStyle(theme)}
      onMouseEnter={(e) => handleMouseEnter(e, theme)}
      onMouseLeave={(e) => handleMouseLeave(e, theme)}
    >
      {icon}
    </button>
  );

  return (
    <Tooltip text={tooltip} direction="n">
      {to ? (
        <Link to={to} onClick={onClick} style={{ color: "inherit" }}>
          {ButtonContent}
        </Link>
      ) : (
        <div onClick={onClick}>{ButtonContent}</div>
      )}
    </Tooltip>
  );
};

const buttonItems = [
  {
    tooltip: "添加页面",
    icon: <NoteIcon size={24} />,
    path: `/${CreateRoutePaths.CREATE_PAGE}`,
  },
  {
    tooltip: "添加Cybot",
    icon: <DependabotIcon size={24} />,
    path: `/${CreateRoutePaths.CREATE_CYBOT}`,
  },
  {
    tooltip: "添加地点",
    icon: <LocationIcon size={24} />,
    path: `/${CreateRoutePaths.CREATE_PAGE}?id=000000100000-UWJFNG1GZUwzLVMzaWhjTzdnWmdrLVJ6d1d6Rm9FTnhYRUNXeFgyc3h6VQ-M0fHLuYH8TACclIi9dsWF`,
  },
];

export const CreateMenu = () => {
  const navigate = useNavigate();

  return (
    <DropDown
      direction="bottom"
      trigger={
        <CircleButton
          tooltip="add new"
          icon={<PlusIcon size={24} />}
          to="/create"
        />
      }
      triggerType="hover"
    >
      <div style={{ gap: Sizes["--size-fluid-1"] }}>
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
