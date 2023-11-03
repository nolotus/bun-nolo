import { calcCost } from 'ai/utils/calcCost';
import React, { useState, useEffect } from 'react';

const TokenStatisticsBlock = ({ data, onCostCalculated }) => {
  const [costs, setCosts] = useState(null);

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
                          - {model}: 输入成本 {input.toFixed(2)}，输出成本{' '}
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
