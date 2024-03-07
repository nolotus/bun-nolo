import { selectTotalCosts } from "ai/selectors";
import { useAppSelector } from "app/hooks";
import React from "react";

export const AccountBalance = () => {
  const costs = useAppSelector(selectTotalCosts);
  const aiUsage = costs?.totalCost;

  const exchangeRate = 8;

  return (
    <div className="flex flex-col gap-4 text-xl font-semibold text-gray-800 md:flex-row">
      {/* <span className="flex items-center">
        <span className="mr-2">储值余额:</span>
        <span className="text-green-600">
          {balance !== null
            ? `¥${(balance * exchangeRate).toFixed(2)}`
            : '加载中...'}
        </span>
      </span> */}
      <span className="mt-2 flex items-center md:mt-0">
        <span className="mr-2">AI欠费:</span>
        <span className="text-red-600">
          {aiUsage !== null
            ? `¥${(aiUsage * exchangeRate).toFixed(2)}`
            : "加载中..."}
        </span>
      </span>
    </div>
  );
};
