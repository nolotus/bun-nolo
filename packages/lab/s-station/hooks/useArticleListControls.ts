// hooks/useArticleListControls.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAppDispatch } from "app/hooks"; // 假设路径
import { createPage } from "render/page/pageSlice"; // 假设路径
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ContentType } from "create/space/types"; // 假设路径
import { useSpaceContentData } from "./useSpaceContentData"; // 导入数据 hook
import { deleteContentFromSpace } from "create/space/spaceSlice"; // 导入 space action, 假设路径

// --- Types ---
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
// --- ---

export const useArticleListControls = (spaceId: string) => {
  const {
    mergedContents,
    isFetching: isLoadingData,
    refreshData,
  } = useSpaceContentData(spaceId);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // --- UI State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState<"pages" | "moments" | "dialogs">(
    "moments"
  );
  const pageSize = 10;

  // --- Effects ---
  useEffect(() => {
    setCurrentPage(1);
  }, [activeView, searchTerm]);

  // --- Data Processing Memos ---
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
  const mappedMoments = useMemo(
    (): MoodNoteForList[] =>
      processedData.moments.map((item) => ({
        id: item.id,
        content: item.title,
        createdAt: item.createdAt || item.updatedAt || Date.now(),
        images: item.images,
      })),
    [processedData.moments]
  );
  const filteredData = useMemo(() => {
    let sourceData: MergedContentItem[] = [];
    if (activeView === "pages") sourceData = processedData.pages;
    else if (activeView === "dialogs") sourceData = processedData.dialogs;
    else return [];
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

  // --- Actions ---
  const createNewPage = useCallback(async () => {
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
      refreshData();
      navigate(`/${contentKey}?edit=true`);
    } catch (error: any) {
      console.error("Failed to create default page:", error);
      toast.dismiss(loadingToastId);
      toast.error(`创建页面失败: ${error.message || "请稍后重试"}`);
    }
  }, [dispatch, spaceId, navigate, refreshData]);

  const handleSendMoodNote = useCallback(
    async (content: string) => {
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
        refreshData();
      } catch (error: any) {
        console.error("Failed to create page from mood note:", error);
        toast.dismiss(loadingToastId);
        toast.error(
          `创建 Moment 失败: ${error.message || "请检查网络或稍后重试"}`
        );
      }
    },
    [dispatch, spaceId, refreshData]
  );

  // --- Simplified Delete Handlers ---
  const handleDeleteMoment = useCallback(
    async (momentId: string) => {
      if (!momentId) {
        toast.error("无法删除：缺少 Moment ID。");
        return;
      }
      const loadingToastId = toast.loading("正在删除 Moment...");
      try {
        // 只 dispatch deleteContentFromSpace (它内部会调用 remove)
        await dispatch(
          deleteContentFromSpace({ contentKey: momentId, spaceId })
        ).unwrap();
        toast.dismiss(loadingToastId);
        toast.success("Moment 删除成功！");
      } catch (error: any) {
        console.error("Failed during moment deletion process:", error);
        toast.dismiss(loadingToastId);
        toast.error(`删除 Moment 失败: ${error.message || "请稍后重试"}`);
      } finally {
        refreshData(); // 确保刷新 UI
      }
    },
    [dispatch, spaceId, refreshData]
  );

  const handleDeletePage = useCallback(
    async (pageId: string) => {
      if (!pageId) {
        toast.error("无法删除：缺少页面 ID。");
        return;
      }
      const loadingToastId = toast.loading("正在删除页面...");
      try {
        // 只 dispatch deleteContentFromSpace (它内部会调用 remove)
        await dispatch(
          deleteContentFromSpace({ contentKey: pageId, spaceId })
        ).unwrap();
        toast.dismiss(loadingToastId);
        toast.success("页面删除成功！");
      } catch (error: any) {
        console.error("Failed during page deletion process:", error);
        toast.dismiss(loadingToastId);
        toast.error(`删除页面失败: ${error.message || "请稍后重试"}`);
      } finally {
        refreshData(); // 确保刷新 UI
      }
    },
    [dispatch, spaceId, refreshData]
  );
  // --- ---

  // --- UI Control Handlers ---
  const handleArticleClick = useCallback(
    (contentKey: string | undefined, itemType: ContentType) => {
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
    },
    [navigate]
  );
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const handleRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  // --- Utility Function ---
  const formatDate = useCallback(
    (timestamp: string | number | undefined): string => {
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
    },
    []
  );

  // --- Return values ---
  return {
    isLoadingData,
    activeView,
    setActiveView,
    currentPage,
    pageSize,
    searchTerm,
    setSearchTerm,
    handlePageChange,
    processedData,
    mappedMoments,
    filteredData,
    currentItems,
    createNewPage,
    handleSendMoodNote,
    handleDeleteMoment,
    handleDeletePage,
    handleRefresh,
    handleArticleClick,
    formatDate,
  };
};
