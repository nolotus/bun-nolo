import React from "react";
import { NavLink } from "react-router-dom";
import { Avatar } from "render/ui";

import { baseCard } from "../styles";
export const SpotCard = ({ data }) => (
  <NavLink
    to={`/${data.id}`}
    className={`${baseCard} m-2 block w-full flex-1 transform bg-white shadow-md transition duration-500 ease-in-out`}
  >
    <div className="flex">
      {data.image ? (
        <img
          src={data.image}
          alt={data.title}
          className="h-48 w-full object-cover"
        />
      ) : (
        <div className="flex h-48 w-full items-center justify-center bg-gray-100" />
      )}
    </div>
    <div className="p-4">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="truncate text-lg font-semibold text-gray-800">
          {data.title}
        </h3>
        <div className="flex items-center space-x-2">
          <Avatar name={data.creator || "user"} size={24} />
          <p className="max-w-[120px] truncate text-xs text-gray-500">
            {data.creator ? data.creator : "未知"}
          </p>
        </div>
      </div>
    </div>
  </NavLink>
);
