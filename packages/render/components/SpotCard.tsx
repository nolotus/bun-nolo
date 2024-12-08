import React from "react";
import { NavLink } from "react-router-dom";
import { Avatar } from "render/ui";
import OpenProps from "open-props";
import { themeStyles } from "../ui/styles";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";

export const SpotCard = ({ data }) => {
  const theme = useAppSelector(selectTheme);
  return (
    <NavLink
      to={`/${data.id}`}
      className={`block  `}
      style={{ boxShadow: OpenProps.shadow3, width: OpenProps.sizeContent2 }}
    >
      <div className="flex">
        {data.image ? (
          <img
            src={data.image}
            alt={data.title}
            className="h-48 w-full object-cover"
          />
        ) : (
          <div
            className="flex h-48  items-center justify-center"
            style={{
              width: OpenProps.sizeContent2,
              ...themeStyles.surface1(theme),
            }}
          />
        )}
      </div>
      <div className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="truncate text-lg">{data.title}</h3>
          <div className="flex items-center space-x-2">
            <Avatar name={data.creator || "user"} />
            <p className="max-w-[120px] truncate text-xs ">
              {data.creator ? data.creator : "未知"}
            </p>
          </div>
        </div>
      </div>
    </NavLink>
  );
};
