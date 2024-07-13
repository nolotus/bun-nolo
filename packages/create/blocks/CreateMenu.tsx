import {
  PlusIcon,
  NoteIcon,
  DependabotIcon,
  LocationIcon,
} from "@primer/octicons-react";
import { DropDown } from "render/ui";
import Sizes from "open-props/src/sizes";
import React from "react";
import { useNavigate } from "react-router-dom";

import { CreateRoutePaths } from "../routes";
import { CircleButton } from "render/button/CircleButton";

const buttonItems = [
  {
    tooltip: "添加笔记",
    icon: <NoteIcon size="medium" />,
    path: `/${CreateRoutePaths.CREATE_PAGE}`,
  },
  {
    tooltip: "添加AI",
    icon: <DependabotIcon size="medium" />,
    path: `/${CreateRoutePaths.CREATE_CHAT_ROBOT}`,
  },
  {
    tooltip: "添加地点",
    icon: <LocationIcon size="medium" />,
    path: `/${CreateRoutePaths.CREATE_PAGE}?id=000000100000-UWJFNG1GZUwzLVMzaWhjTzdnWmdrLVJ6d1d6Rm9FTnhYRUNXeFgyc3h6VQ-M0fHLuYH8TACclIi9dsWF`,
  },
];

export const CreateMenu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DropDown
      direction="left"
      trigger={
        <CircleButton
          tooltip="add new"
          icon={<PlusIcon size="medium" />}
          onClick={() => navigate("/create")}
        />
      }
      triggerType="hover"
    >
      <div className="flex w-[200px]" style={{ gap: Sizes["--size-fluid-2"] }}>
        {buttonItems.map((item, index) => (
          <CircleButton
            key={index}
            tooltip={item.tooltip}
            icon={item.icon}
            onClick={() => navigate(item.path)}
          />
        ))}
      </div>
    </DropDown>
  );
};
