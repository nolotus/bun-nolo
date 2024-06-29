import {
  PlusIcon,
  NoteIcon,
  DependabotIcon,
  LocationIcon,
} from "@primer/octicons-react";
import { DropDown } from "render/ui";
import Borders from "open-props/src/borders";
import Sizes from "open-props/src/sizes";
import React from "react";
import { Tooltip } from "@primer/react/next";
import { useNavigate } from "react-router-dom";
import { circleButtonStyle } from "render/button/style";
import { CreateRoutePaths } from "../routes";

// 按钮组件

const buttonItems = [
  {
    tooltip: "添加笔记",
    icon: <NoteIcon />,
    path: `/${CreateRoutePaths.CREATE_PAGE}`,
  },
  {
    tooltip: "添加AI",
    icon: <DependabotIcon />,
    path: `/${CreateRoutePaths.CREATE_CHAT_ROBOT}`,
  },
  {
    tooltip: "添加地点",
    icon: <LocationIcon />,
    path: `/${CreateRoutePaths.CREATE_PAGE}?id=000000100000-UWJFNG1GZUwzLVMzaWhjTzdnWmdrLVJ6d1d6Rm9FTnhYRUNXeFgyc3h6VQ-M0fHLuYH8TACclIi9dsWF`,
  },
];

export const CreateMenu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DropDown
      direction="left"
      trigger={
        <button
          type="button"
          className="p-[10px]"
          style={{
            borderRadius: Borders["--radius-round"],
          }}
          onMouseDown={() => {
            navigate("/create");
          }}
        >
          <PlusIcon />
        </button>
      }
      triggerType="hover"
    >
      <div className="flex w-[200px]" style={{ gap: Sizes["--size-fluid-2"] }}>
        {buttonItems.map((item, index) => (
          <Tooltip key={index} text={item.tooltip} direction="n">
            <button
              type="button"
              style={circleButtonStyle}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
            </button>
          </Tooltip>
        ))}
      </div>
    </DropDown>
  );
};
