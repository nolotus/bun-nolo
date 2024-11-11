import React from "react";

import { useAppDispatch } from "app/hooks";
import { extractAndDecodePrefix, extractCustomId, extractUserId } from "core";
import { omit } from "rambda";

import { write } from "database/dbSlice";
import { DataTable } from "./DataTable";
const DataDisplay = ({ data, type }) => {
  const dispatch = useAppDispatch();

  const pullData = async (id, value) => {
    // Define the logic for pulling data here
    const flags = extractAndDecodePrefix(id);
    const userId = extractUserId(id);
    const customId = extractCustomId(id);
    const formatValue = omit("id", value);
    const writeConfig = {
      data: formatValue,
      flags,
      userId,
      id: customId,
    };
    dispatch(write(writeConfig));
  };

  const pushData = async (id: string, value) => {
    // 先对数据进行格式化
    const formatValue = omit("id", value);
    const customId = extractCustomId(id);
    const flags = extractAndDecodePrefix(id);
    const userId = extractUserId(id);

    const domains = ["https://nolotus.com", "https://cybot.run"];
    await Promise.all(
      domains.map((domain) =>
        write({
          data: formatValue,
          flags,
          userId,
          customId,
          domain,
        }).unwrap(),
      ),
    );
    // refreshData(auth.user?.userId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"></div>
      <div>
        <DataTable dataList={data} type={type} pullData={pullData} />
      </div>
    </div>
  );
};

export default DataDisplay;
