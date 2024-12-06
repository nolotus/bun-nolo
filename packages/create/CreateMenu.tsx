// CreateMenu.jsx
import React from "react";
import {
  PlusIcon,
  NoteIcon,
  DependabotIcon,
  LocationIcon,
} from "@primer/octicons-react";
import DropDown from "render/ui/DropDown";
import { Tooltip } from "@primer/react/next";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import { themeStyles } from "render/ui/styles";
import { stylePresets } from "render/styles/stylePresets";
import { sp } from "render/styles/sp";

import Button from "render/ui/Button";

import { CreateRoutePaths } from "./routes";

const CircleButton = ({ tooltip, icon, to, onClick }) => {
  const theme = useSelector(selectTheme);

  const buttonStyle = {
    ...stylePresets.flexCenter,
    ...stylePresets.roundedFull,
    padding: theme.spacing.small,
    minWidth: "auto",
    ...themeStyles.surface1(theme),
  };

  const hoverStyle = {
    backgroundColor: theme.surface2,
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
    <Tooltip text={tooltip} direction="n">
      {to ? (
        <Link to={to} onClick={onClick} style={stylePresets.textDecorationNone}>
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
          ...stylePresets.flexColumn,
          ...sp.gap2,
          ...sp.p2,
          ...themeStyles.surface2(theme),
          borderRadius: theme.borderRadius,
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
