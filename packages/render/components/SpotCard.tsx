import React from "react";
import { NavLink } from "react-router-dom";
import { Avatar } from "render/ui";
import OpenProps from "open-props";

export const SpotCard = ({ data }) => (
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
          className="surface1 flex h-48  items-center justify-center"
          style={{ width: OpenProps.sizeContent2 }}
        />
      )}
    </div>
    <div className="p-4">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text1 truncate text-lg">{data.title}</h3>
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
