import React from "react";
import { NavLink } from "react-router-dom";
import { Avatar } from "ui";

import { baseCard } from "../styles";
export const SpotCard = ({ data }) => (
	<NavLink
		to={`/${data.id}`}
		className={`${baseCard} block p-4 m-2 bg-white shadow-md  transform transition duration-500 hover:scale-105`}
	>
		<div className="flex">
			{data.image ? (
				<img
					src={data.image}
					alt={data.title}
					className="w-full h-48 object-cover rounded-md mb-3"
				/>
			) : (
				<div className="flex items-center justify-center w-full h-48 bg-gray-100 rounded-md mb-3" />
			)}
		</div>
		<div className="flex justify-between items-center mb-1">
			<h3 className="text-lg font-semibold text-gray-800 truncate">
				{data.title}
			</h3>
			<Avatar name={data.creator ? data.creator : "user"} size={24} />
		</div>
		<p className="text-xs text-gray-500 truncate">
			{data.creator ? data.creator : "未知"}
		</p>
	</NavLink>
);
