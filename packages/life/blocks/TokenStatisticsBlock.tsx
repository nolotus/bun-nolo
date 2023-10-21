import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { calcCost } from "ai/utils/calcCost";

const TokenStatisticsBlock = ({ data, onCostCalculated }) => {
  const [costs, setCosts] = useState(null);
  const truncateContent = (content) => {
    return content.length > 50 ? content.substring(0, 50) + "..." : content;
  };

  useEffect(() => {
    if (data) {
      const values = data.map((item) => ({
        ...item.value,
        userId: item.value.userId,
      }));
      const result = calcCost(values);
      setCosts(result);
      onCostCalculated(result.totalCost);
    }
  }, [data, onCostCalculated]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h2 className="text-2xl font-bold mb-4">TokenStatisticsBlock</h2>
      {costs && (
        <div className="flex flex-wrap -m-2">
          {Object.entries(costs.userCosts).map(
            ([userId, { total, modelCosts, username }]) => (
              <div
                key={userId}
                className="p-2 flex-grow"
                title={`用户ID：${userId}`}
              >
                <div className="p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
                  <p className="text-sm font-semibold text-gray-700 truncate">
                    用户名 {username}:总成本 {total.toFixed(2)}
                  </p>
                  <div className="space-y-2">
                    {Object.entries(modelCosts).map(
                      ([model, { input, output }]) => (
                        <p
                          key={model}
                          className="text-sm text-gray-500 truncate"
                        >
                          - {model}: 输入成本 {input.toFixed(2)}，输出成本{" "}
                          {output.toFixed(2)}
                        </p>
                      )
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
      {data ? (
        <div className="flex flex-wrap -m-2">
          {data.slice(0, 3).map((item) => (
            <Link
              to={`/chat?id=${item.key}`}
              key={item.key}
              className="p-2 w-full sm:w-1/2 lg:w-1/3"
            >
              <div className="p-4 border border-gray-300 bg-white rounded-lg shadow-sm">
                <h3 className="text-md font-semibold text-gray-700">
                  {item.key}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {truncateContent(JSON.stringify(item.value))}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-lg">Loading...</p>
      )}
    </div>
  );
};

export default TokenStatisticsBlock;
