import {
  PlusIcon,
  NoteIcon,
  DependabotIcon,
  LocationIcon,
} from "@primer/octicons-react";
import { DropDown } from "ui";
import Borders from "open-props/src/borders";
import Sizes from "open-props/src/sizes";
import React from "react";

import { useNavigate } from "react-router-dom";

import { CreateRoutePaths } from "../routes";

export const CreateMenu = () => {
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
        <button
          className="p-[10px]"
          style={{
            borderRadius: Borders["--radius-round"],
          }}
          onMouseDown={() => {
            navigate(`/${CreateRoutePaths.CREATE_PAGE}`);
          }}
        >
          <NoteIcon />
        </button>
        <button
          className="p-[10px]"
          style={{
            borderRadius: Borders["--radius-round"],
          }}
          onMouseDown={() => {
            navigate(`/${CreateRoutePaths.CREATE_CHAT_ROBOT}`);
          }}
        >
          <DependabotIcon />
        </button>
        <button
          className="p-[10px]"
          style={{
            borderRadius: Borders["--radius-round"],
          }}
          onMouseDown={() => {
            navigate(
              `/${CreateRoutePaths.CREATE_PAGE}?id=000000100000-UWJFNG1GZUwzLVMzaWhjTzdnWmdrLVJ6d1d6Rm9FTnhYRUNXeFgyc3h6VQ-M0fHLuYH8TACclIi9dsWF`,
            );
          }}
        >
          <LocationIcon />
        </button>
      </div>
    </DropDown>
  );
};
