import { selectTotalCosts } from "ai/selectors";
import { useAppSelector } from "app/hooks";
import React from "react";

const TokenStatisticsBlock = () => {
  const costs = useAppSelector(selectTotalCosts);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h2 className="mb-4 text-2xl font-bold">TokenStatisticsBlock</h2>
      {costs && (
        <div className="-m-2 flex flex-wrap">
          {Object.entries(costs.userCosts).map(
            ([userId, { total, modelCosts, username }]) => (
              <div
                key={userId}
                className="flex-grow p-2"
                title={`用户ID：${userId}`}
              >
                <div className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
                  <p className="truncate text-sm font-semibold text-gray-700">
                    用户名 {username}:总成本 {total.toFixed(2)}
                  </p>
                  <div className="space-y-2">
                    {Object.entries(modelCosts).map(
                      ([model, { input, output }]) => (
                        <p
                          key={model}
                          className="truncate text-sm text-gray-500"
                        >
                          - {model}: 输入成本 {input.toFixed(2)}，输出成本{" "}
                          {output.toFixed(2)}
                        </p>
                      ),
                    )}
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
};

export default TokenStatisticsBlock;
