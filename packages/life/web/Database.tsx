import { useAppSelector, useQueryData } from "app/hooks";
import { useSearchParams } from "react-router-dom";
import React, { useState } from "react";

import DataDisplay from "../blocks/DataDisplay";
import { selectFilteredDataByUserAndType } from "database/selectors";
import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";
import { selectTotalCosts } from "ai/selectors";

const typeArray = ["All", ...Object.values(DataType)];

export const Database = () => {
  // const costs = useAppSelector(selectTotalCosts);

  const mainColor = useAppSelector((state) => state.theme.mainColor);

  let [searchParams, setSearchParams] = useSearchParams();

  const [type, setType] = useState(searchParams.get("type"));
  const currentUserId = useAppSelector(selectCurrentUserId);

  const data = useAppSelector(
    selectFilteredDataByUserAndType(currentUserId, type),
  );

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
  const { isLoading } = useQueryData(queryConfig);

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
    <div className="p-4">
      <div className="flex justify-between">
        <div className="flex w-3/5 gap-2 overflow-auto">
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

      <DataDisplay data={data} type={type} />
    </div>
  );
};

export default Database;
