import { useState, useEffect, useMemo, useCallback } from "react";
import { useAppDispatch } from "app/store";
import { read, remove } from "database/dbSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { createPage, PageData as FullPageData } from "render/page/pageSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ContentType, type SpaceData } from "app/types";

// ... (interfaces remain the same) ...
interface MoodNoteForList {
  id: string;
  content: string;
  createdAt: number;
  images?: string[];
}
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

export const useWriteArticleLogic = (spaceId: string) => {
  const spaceDbKey = useMemo(() => createSpaceKey.space(spaceId), [spaceId]);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [mergedContents, setMergedContents] =
    useState<MergedContentsMap | null>(null);
  const pageSize = 10;
  const [isFetching, setIsFetching] = useState(false);
  const [activeView, setActiveView] = useState<"pages" | "moments" | "dialogs">(
    "moments"
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // --- fetchSpaceData remains the same ---
  const fetchSpaceData = useCallback(
    async (showLoadingToast = false) => {
      if (isFetching) return;
      setIsFetching(true);
      let loadingToastId: string | undefined;
      // Add a slight delay for perceived responsiveness on manual refresh
      if (showLoadingToast)
        await new Promise((resolve) => setTimeout(resolve, 150));

      if (showLoadingToast) {
        loadingToastId = toast.loading("正在加载内容列表...");
      }

      try {
        // ... (rest of fetchSpaceData logic is unchanged) ...
        const baseDataResult = await dispatch(read(spaceDbKey)).unwrap();
        const spaceData = baseDataResult as SpaceData;
        const baseContents = spaceData?.contents;

        if (!baseContents) {
          setMergedContents({});
          if (loadingToastId) toast.dismiss(loadingToastId);
          setIsFetching(false);
          return;
        }

        const pageKeysToFetchDetails = Object.entries(baseContents)
          .filter(([key, content]) => content?.type === ContentType.PAGE)
          .map(([key]) => key);

        let pageDetailsResults: { key: string; data: PageDetailData }[] = [];
        if (pageKeysToFetchDetails.length > 0) {
          if (loadingToastId) {
            toast.loading("正在加载页面详情...", { id: loadingToastId });
          } else if (showLoadingToast && !loadingToastId) {
            loadingToastId = toast.loading("正在加载页面详情...");
          }

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

          settledDetails.forEach((result) => {
            if (result.status === "fulfilled" && result.value) {
              const { key, value } = result.value;
              pageDetailsResults.push({ key, data: value });
            } else if (result.status === "rejected") {
              const failedKey = (result.reason as any)?.key || "unknown";
              console.error(
                `Failed to fetch page details for key ${failedKey}:`,
                result.reason
              );
            }
          });
        }

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
        setMergedContents(finalMergedContents);
        if (loadingToastId) toast.dismiss(loadingToastId);
        // Optionally show success toast only on manual refresh?
        // if (showLoadingToast && !loadingToastId) { // Check if it was a manual refresh (no initial toast)
        //     toast.success('列表已刷新');
        // }
      } catch (error) {
        console.error("Failed to fetch space data or page details:", error);
        if (loadingToastId) toast.dismiss(loadingToastId);
        toast.error("加载内容失败");
        setMergedContents(mergedContents || {});
      } finally {
        setIsFetching(false);
      }
    },
    [dispatch, spaceDbKey, isFetching, mergedContents] // Added mergedContents to dependencies to avoid stale state issues within the catch block? Maybe not needed. Keep as before.
    // [dispatch, spaceDbKey, isFetching] // Original dependencies
  );

  useEffect(() => {
    if (mergedContents === null) {
      fetchSpaceData(true);
    }
  }, [fetchSpaceData, mergedContents]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeView, searchTerm]);

  // --- createNewPage, handleSendMoodNote remain the same ---
  const createNewPage = async () => {
    const loadingToastId = toast.loading("正在创建页面...");
    try {
      const newItemResult = await dispatch(createPage({ spaceId })).unwrap();
      const contentKey =
        typeof newItemResult === "string"
          ? newItemResult
          : (newItemResult as any)?.contentKey ||
            (newItemResult as any)?.key ||
            (newItemResult as any)?.id;

      if (!contentKey) throw new Error("创建页面后未返回 Key");

      toast.dismiss(loadingToastId);
      toast.success("新页面创建成功！");
      setActiveView("pages");
      await fetchSpaceData(false);
      navigate(`/${contentKey}?edit=true`);
    } catch (error: any) {
      console.error("Failed to create default page:", error);
      toast.dismiss(loadingToastId);
      toast.error(`创建页面失败: ${error.message || "请稍后重试"}`);
    }
  };

  const handleSendMoodNote = async (content: string) => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      toast.error("请输入内容作为标题！");
      return;
    }
    const loadingToastId = toast.loading("正在创建 Moment...");
    try {
      const newItemResult = await dispatch(
        createPage({ title: trimmedContent, spaceId, addMomentTag: true })
      ).unwrap();
      const newPageKey =
        typeof newItemResult === "string"
          ? newItemResult
          : (newItemResult as any)?.contentKey ||
            (newItemResult as any)?.key ||
            (newItemResult as any)?.id;

      if (!newPageKey) throw new Error("创建 Moment 后未返回 Key");

      toast.dismiss(loadingToastId);
      toast.success(`Moment "${trimmedContent}" 创建成功！`);
      setActiveView("moments");
      await fetchSpaceData(false);
    } catch (error: any) {
      console.error("Failed to create page from mood note:", error);
      toast.dismiss(loadingToastId);
      toast.error(
        `创建 Moment 失败: ${error.message || "请检查网络或稍后重试"}`
      );
    }
  };

  // --- Delete Handlers remain the same ---
  const handleDeleteMoment = useCallback(
    async (momentId: string) => {
      if (!momentId) {
        toast.error("无法删除：缺少 Moment ID。");
        return;
      }
      const loadingToastId = toast.loading("正在删除 Moment...");
      try {
        const itemDbKey = momentId;
        await dispatch(remove(itemDbKey)).unwrap();
        toast.dismiss(loadingToastId);
        toast.success("Moment 删除成功！");
        await fetchSpaceData(false);
      } catch (error: any) {
        console.error("Failed to delete moment:", error);
        toast.dismiss(loadingToastId);
        toast.error(`删除 Moment 失败: ${error.message || "请稍后重试"}`);
      }
    },
    [dispatch, fetchSpaceData]
  );

  const handleDeletePage = useCallback(
    async (pageId: string) => {
      if (!pageId) {
        toast.error("无法删除：缺少页面 ID。");
        return;
      }
      const loadingToastId = toast.loading("正在删除页面...");
      try {
        const itemDbKey = pageId;
        await dispatch(remove(itemDbKey)).unwrap();
        toast.dismiss(loadingToastId);
        toast.success("页面删除成功！");
        await fetchSpaceData(false);
      } catch (error: any) {
        console.error("Failed to delete page:", error);
        toast.dismiss(loadingToastId);
        toast.error(`删除页面失败: ${error.message || "请稍后重试"}`);
      }
    },
    [dispatch, fetchSpaceData]
  );

  // --- handleArticleClick, handlePageChange remain the same ---
  const handleArticleClick = (
    contentKey: string | undefined,
    itemType: ContentType
  ) => {
    if (contentKey) {
      if (itemType === ContentType.DIALOG) {
        console.log("Navigating to Dialog:", contentKey);
        toast("打开 Dialog 功能暂未实现");
      } else {
        navigate(`/${contentKey}`);
      }
    } else {
      console.warn("Attempted to navigate with undefined contentKey");
      toast.error("无法打开内容，缺少关键信息。");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- processedData, mappedMoments, filteredData, currentItems remain the same ---
  const processedData = useMemo(() => {
    const pages: MergedContentItem[] = [];
    const moments: MergedContentItem[] = [];
    const dialogs: MergedContentItem[] = [];
    const contentsMap = mergedContents;
    if (!contentsMap) return { pages, moments, dialogs };
    const allContentItems = Object.values(contentsMap)
      .filter((item): item is MergedContentItem => !!item)
      .sort(
        (a, b) =>
          (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)
      );
    allContentItems.forEach((item) => {
      if (item.type === ContentType.DIALOG) dialogs.push(item);
      else if (item.type === ContentType.PAGE) {
        if (item.tags?.includes("moment")) moments.push(item);
        else pages.push(item);
      }
    });
    return { pages, moments, dialogs };
  }, [mergedContents]);

  const mappedMoments = useMemo((): MoodNoteForList[] => {
    return processedData.moments.map((item) => ({
      id: item.id,
      content: item.title,
      createdAt: item.createdAt || item.updatedAt || Date.now(),
      images: item.images,
    }));
  }, [processedData.moments]);

  const filteredData = useMemo(() => {
    let sourceData: MergedContentItem[] = [];
    if (activeView === "pages") sourceData = processedData.pages;
    else if (activeView === "dialogs") sourceData = processedData.dialogs;
    else return []; // Moments view doesn't use this
    if (!searchTerm) return sourceData;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return sourceData.filter((item) =>
      item.title?.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [activeView, processedData, searchTerm]);

  const currentItems = useMemo(() => {
    if (activeView === "moments") return [];
    const indexOfLastItem = currentPage * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    return filteredData.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredData, currentPage, pageSize, activeView]);

  // --- formatDate remains the same ---
  const formatDate = (timestamp: string | number | undefined): string => {
    if (!timestamp) return "未知时间";
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return "无效时间";
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting date:", timestamp, error);
      return "无效时间";
    }
  };

  // --- Add Refresh Handler ---
  const handleRefresh = useCallback(() => {
    console.log("Manual refresh triggered");
    fetchSpaceData(true); // Call fetch with loading indicator
  }, [fetchSpaceData]); // Dependency on fetchSpaceData

  // --- Return values needed by the view ---
  return {
    currentPage,
    pageSize,
    searchTerm,
    setSearchTerm,
    isFetching, // Needed for disabling refresh button
    activeView,
    setActiveView,
    processedData,
    filteredData,
    currentItems,
    createNewPage,
    handleSendMoodNote,
    handleArticleClick,
    handlePageChange,
    formatDate,
    handleDeleteMoment,
    mappedMoments,
    handleDeletePage,
    handleRefresh, // --- Export refresh handler ---
  };
};
