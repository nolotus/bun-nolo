import { useAppSelector, useAppDispatch } from "app/hooks";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { selectCurrentUserId } from "auth/authSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { queryServer } from "database/dbSlice";
import { DataType } from "create/types";
import { DataTable } from "../blocks/DataTable";

const EXCLUDED_TYPES = [
  DataType.DIALOG,
  DataType.CYBOT,
  DataType.Space,
  DataType.PAGE,
  DataType.TOKEN,
  DataType.MSG,
];

const typeArray = [
  "All",
  ...Object.values(DataType).filter((type) => !EXCLUDED_TYPES.includes(type)),
];

export const Database = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [type, setType] = useState(searchParams.get("type"));
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentUserId = useAppSelector(selectCurrentUserId);
  const currentServer = useAppSelector(selectCurrentServer);

  // 使用 useMemo 缓存查询配置
  const queryConfig = useMemo(
    () => ({
      queryUserId: currentUserId,
      server: currentServer,
      options: {
        isJSON: true,
        limit: 100,
        condition: type ? { type } : {},
      },
    }),
    [currentUserId, currentServer, type]
  );

  const fetchData = useCallback(async () => {
    if (!currentServer || !currentUserId) return;

    setIsLoading(true);
    setError(null);

    try {
      const action = await dispatch(queryServer(queryConfig));
      const result = action.payload;
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentServer, currentUserId, dispatch, queryConfig]);

  // 只在必要时更新数据
  useEffect(() => {
    fetchData();
  }, [type, currentUserId, currentServer]);

  const handleTypeChange = useCallback(
    (newType) => {
      if (newType === "All") {
        setSearchParams({});
        setType(null);
      } else {
        setType(newType);
        setSearchParams({ type: newType });
      }
    },
    [setSearchParams]
  );

  return (
    <div className="p-4 my-14">
      <div className="flex justify-between">
        <div className="flex gap-2 overflow-auto">
          {typeArray.map((typeItem) => {
            const isActive = type === typeItem || (typeItem === "All" && !type);
            return (
              <div
                key={typeItem}
                onClick={() => handleTypeChange(typeItem)}
                className={`
                  relative flex cursor-pointer items-center justify-center p-2 
                  transition-all duration-200 hover:bg-blue-100
                  ${isActive ? "border-b-3 border-solid border-blue-500" : ""}
                `}
              >
                {typeItem}
              </div>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-4">Loading...</div>
      ) : error ? (
        <div className="mt-4 text-red-500">Error: {error.message}</div>
      ) : (
        <div className="mt-4">
          <DataTable dataList={data} type={type} />
        </div>
      )}
    </div>
  );
};

export default Database;
