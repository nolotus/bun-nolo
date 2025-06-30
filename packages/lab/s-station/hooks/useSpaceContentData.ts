// hooks/useSpaceContentData.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAppDispatch } from "app/store"; // 假设路径
import { read } from "database/dbSlice"; // 假设路径
import { createSpaceKey } from "create/space/spaceKeys"; // 假设路径
import toast from "react-hot-toast";
import { type SpaceData, ContentType } from "app/types"; // 假设路径
import pino from "pino"; // 假设使用 pino

const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
  },
});

// --- 类型定义 ---
interface MergedContentItem {
  id: string;
  dbKey: string;
  title: string;
  type: ContentType;
  createdAt?: number;
  updatedAt?: number;
  tags?: string[];
  images?: string[];
}
type MergedContentsMap = Record<string, MergedContentItem | null>;
interface PageDetailData {
  tags?: string[];
  images?: string[];
}
// --- ---

export const useSpaceContentData = (spaceId: string) => {
  const spaceDbKey = useMemo(() => createSpaceKey.space(spaceId), [spaceId]);
  const dispatch = useAppDispatch();

  const [mergedContents, setMergedContents] =
    useState<MergedContentsMap | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const fetchSpaceData = useCallback(
    async (showLoadingToast = false) => {
      if (isFetching) {
        logger.warn({ spaceId }, "Fetch already in progress, skipping.");
        return;
      }
      logger.info({ spaceId, showLoadingToast }, "Starting fetchSpaceData");
      setIsFetching(true);
      let loadingToastId: string | undefined;

      if (showLoadingToast) {
        await new Promise((resolve) => setTimeout(resolve, 150));
        loadingToastId = toast.loading("正在加载内容列表...");
      }

      try {
        logger.info({ spaceDbKey }, "Fetching base space data");
        const baseDataResult = await dispatch(read(spaceDbKey)).unwrap();
        const spaceData = baseDataResult as SpaceData;
        const baseContents = spaceData?.contents;

        if (!baseContents) {
          logger.warn(
            { spaceDbKey },
            "No contents found in base space data. Setting empty."
          );
          setMergedContents({});
          if (loadingToastId) toast.dismiss(loadingToastId);
          setIsFetching(false);
          return;
        }
        logger.info(
          { spaceDbKey, count: Object.keys(baseContents).length },
          "Base space data fetched."
        );

        const pageKeysToFetchDetails = Object.entries(baseContents)
          .filter(([key, content]) => content?.type === ContentType.PAGE)
          .map(([key]) => key);
        logger.info(
          { count: pageKeysToFetchDetails.length },
          "Identified pages needing detail fetch."
        );

        let pageDetailsResults: { key: string; data: PageDetailData }[] = [];
        if (pageKeysToFetchDetails.length > 0) {
          if (loadingToastId) {
            toast.loading("正在加载页面详情...", { id: loadingToastId });
          } else if (showLoadingToast && !loadingToastId) {
            loadingToastId = toast.loading("正在加载页面详情...");
          }
          logger.info(
            { keys: pageKeysToFetchDetails },
            "Fetching page details..."
          );

          const detailPromises = pageKeysToFetchDetails.map((key) => {
            const itemDbKey = key;
            return dispatch(read(itemDbKey))
              .unwrap()
              .then((detailData) => ({
                key,
                status: "fulfilled",
                value: detailData as PageDetailData,
              }))
              .catch((error) => ({ key, status: "rejected", reason: error }));
          });

          const settledDetails = await Promise.allSettled(detailPromises);
          logger.info("Page detail fetches settled.");

          settledDetails.forEach((result) => {
            if (result.status === "fulfilled" && result.value) {
              if (result.value.key && result.value.value) {
                pageDetailsResults.push({
                  key: result.value.key,
                  data: result.value.value,
                });
              } else {
                logger.error(
                  { value: result.value },
                  "Fulfilled page detail promise missing key or value"
                );
              }
            } else if (result.status === "rejected") {
              const failedKey = (result.reason as any)?.key || "unknown";
              logger.error(
                { key: failedKey, error: result.reason },
                "Failed to fetch page details"
              );
            }
          });
          logger.info(
            { count: pageDetailsResults.length },
            "Successfully fetched page details count."
          );
        }

        logger.info("Merging base contents and page details...");
        const finalMergedContents: MergedContentsMap = {};
        const pageDetailsMap = new Map(
          pageDetailsResults.map((item) => [item.key, item.data])
        );

        for (const key in baseContents) {
          if (Object.prototype.hasOwnProperty.call(baseContents, key)) {
            const baseContent = baseContents[key];
            if (baseContent) {
              const details = pageDetailsMap.get(key);
              finalMergedContents[key] = {
                id: key,
                dbKey: key,
                title: baseContent.title,
                type: baseContent.type,
                createdAt: baseContent.createdAt,
                updatedAt: baseContent.updatedAt,
                tags: details?.tags,
                images: details?.images,
              };
            } else {
              finalMergedContents[key] = null;
            }
          }
        }

        logger.info(
          { count: Object.keys(finalMergedContents).length },
          "Setting merged contents state."
        );
        setMergedContents(finalMergedContents);

        if (loadingToastId) toast.dismiss(loadingToastId);
      } catch (error: any) {
        logger.error(
          { error, spaceId },
          "Error during fetchSpaceData execution"
        );
        if (loadingToastId) toast.dismiss(loadingToastId);
        toast.error(`加载内容失败: ${error.message || "未知错误"}`);
        if (mergedContents === null) {
          logger.warn(
            { spaceId },
            "Setting merged contents to empty object due to initial fetch failure."
          );
          setMergedContents({});
        }
      } finally {
        logger.info({ spaceId }, "fetchSpaceData finished.");
        setIsFetching(false);
      }
    },
    [dispatch, spaceDbKey, isFetching]
  );

  useEffect(() => {
    if (mergedContents === null && !isFetching) {
      logger.info({ spaceId }, "Initial data fetch effect triggered.");
      fetchSpaceData(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceDbKey, mergedContents, isFetching]); // Ensure deps cover initial load condition changes

  const refreshData = useCallback(() => {
    logger.info({ spaceId }, "Manual refreshData triggered.");
    fetchSpaceData(true);
  }, [fetchSpaceData]);

  return { mergedContents, isFetching, refreshData };
};
