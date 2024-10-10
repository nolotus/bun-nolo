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

import { CreateRoutePaths } from "../routes";

export const CircleButton = ({ tooltip, icon, to, onClick }) => {
  const ButtonContent = (
    <button
      style={{
        padding: "6px",
        borderRadius: OpenProps.radiusRound,
        cursor: "pointer",
        color: "inherit",
      }}
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
