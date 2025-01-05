import { useAppSelector } from "app/hooks";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useQuery } from "app/hooks/useQuery";
import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";
import DataDisplay from "../blocks/DataDisplay";

const typeArray = ["All", ...Object.values(DataType)
	.filter(value => ![DataType.Dialog, DataType.Cybot, DataType.Space, DataType.Page].includes(value))];

export const Database = () => {

	const mainColor = useAppSelector((state) => state.theme.mainColor);

	const [searchParams, setSearchParams] = useSearchParams();

	const [type, setType] = useState(searchParams.get("type"));
	const [data, setData] = useState(null);
	const currentUserId = useAppSelector(selectCurrentUserId);


	const { fetchData } = useQuery();

	const fetchAndSetData = async (queryConfig) => {
		try {
			setData(null);
			const result = await fetchData(queryConfig);
			setData(result);
		} catch (err) {
			// 错误处理
		}
	};

	useEffect(() => {
		const queryConfig = {
			queryUserId: currentUserId,
			options: {
				isJSON: true,
				limit: 100,
				condition: {},
			},
		};
		if (type) {
			queryConfig.options.condition.type = type;
		}
		fetchAndSetData(queryConfig);
	}, [type]);

	const changeType = (type) => {
		if (type === "All") {
			setSearchParams({});
			setType(null);
		} else {
			setType(type);
			setSearchParams({ type });
		}
	};

	return (
		<div className="p-4 my-14">
			<div className="flex justify-between">
				<div className="flex gap-2 overflow-auto">
					{typeArray.map((typeItem) => {
						const isActive = type === typeItem || (typeItem === "All" && !type);
						return (
							<div
								key={typeItem}
								onClick={() => changeType(typeItem)}
								className="relative flex cursor-pointer items-center justify-center p-2 transition-all duration-200 hover:bg-blue-100"
								style={
									isActive
										? {
											borderBottom: "3px solid",
											borderBottomColor: mainColor,
										}
										: undefined
								}
							>
								{typeItem}
							</div>
						);
					})}
				</div>
			</div>
			{data && <DataDisplay datalist={data} type={type} />}
		</div>
	);
};

export default Database;
