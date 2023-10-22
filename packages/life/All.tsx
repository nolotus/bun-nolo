import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "user/UserContext";
import { useUserData } from "user/hooks/useUserData";
import { getLogger } from "utils/logger";
import ChatBotList from "ai/blocks/ChatBotList";

import { AccountBalance } from "./blocks/AccountBanlance";
import ArticleBlock from "./blocks/ArticleBlock";
import OtherDataBlock from "./blocks/OtherDataBlock";
import fetchReadAllData from "database/client/readAll";
import TokenStatisticsBlock from "./blocks/TokenStatisticsBlock";
const lifeLogger = getLogger("life");

const LifeAll = () => {
  const [data, setData] = useState(null);
  const [articles, setArticles] = useState(null);
  const [chatBots, setChatBots] = useState(null);

  const [aiUsage, setAiUsage] = useState(0);
  const [tokenStatistics, setTokenStatistics] = useState(null);

  const { currentUser } = useContext(UserContext);

  const pluginSettings = useUserData("pluginSettings");
  lifeLogger.info("pluginSettings", pluginSettings);

  const fetchData = async () => {
    const currentDomain = `${window.location.hostname}:${window.location.port}`;
    const nolotusDomain = "nolotus.com";

    if (currentDomain === nolotusDomain) {
      const res = await fetchReadAllData(nolotusDomain, currentUser?.userId);
      if (res) {
        setData(res.map((item) => ({ ...item, source: "both" })));
      } else {
        lifeLogger.error("Failed to fetch data from nolotus.com");
      }
    } else {
      const [localData, nolotusData] = await Promise.all([
        fetchReadAllData(currentDomain, currentUser?.userId),
        fetchReadAllData(nolotusDomain, currentUser?.userId),
      ]);

      if (!localData && !nolotusData) {
        lifeLogger.error("Both requests failed");
        return;
      }

      let mergedData = [];

      if (localData) {
        const nolotusKeys = nolotusData
          ? new Set(nolotusData.map((item) => item.key))
          : new Set();
        mergedData = localData.map((item) => ({
          ...item,
          source: nolotusKeys.has(item.key) ? "both" : "local",
        }));
      }

      if (nolotusData) {
        nolotusData.forEach((item) => {
          if (!mergedData.some((localItem) => localItem.key === item.key)) {
            mergedData.push({ ...item, source: "nolotus" });
          }
        });
      }

      const articleData = mergedData.filter(
        (item) => item.value && item.value.type === "article"
      );
      const chatBotData = mergedData.filter(
        (item) => item.value && item.value.type === "chatRobot"
      );
      const tokenStatisticsData = mergedData.filter(
        (item) => item.value && item.value.type === "tokenStatistics"
      );
      const otherData = mergedData.filter(
        (item) =>
          !item.value ||
          (item.value.type !== "article" &&
            item.value.type !== "chatRobot" &&
            item.value.type !== "tokenStatistics")
      );

      lifeLogger.info("chatBotData", chatBotData);

      setArticles(articleData);
      setChatBots(chatBotData);
      setTokenStatistics(tokenStatisticsData);
      setData(otherData);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser?.userId]);

  return (
    <div className="p-4">
      <ArticleBlock articles={articles} refreshData={fetchData} />
      <AccountBalance aiUsage={aiUsage} />
      {chatBots && <ChatBotList data={chatBots} />}
      {tokenStatistics && (
        <TokenStatisticsBlock
          data={tokenStatistics}
          onCostCalculated={setAiUsage}
        />
      )}
      {/* 渲染 ChatBotBlock 并传递 chatBots 属性 */}
      <h1 className="text-2xl font-bold">
        Your Life Data (Excluding Articles)
      </h1>
      <OtherDataBlock data={data} refreshData={fetchData} />
    </div>
  );
};

export default LifeAll;
