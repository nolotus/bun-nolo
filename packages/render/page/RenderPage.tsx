import React, {
  useMemo,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useSearchParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { formatISO } from "date-fns";
import toast from "react-hot-toast";
// import { FaExclamationCircle } from "react-icons/fa"; // Removed as PageError is removed

import {
  EditorContent,
  extractTitleFromSlate,
  compareSlateContent,
} from "create/editor/utils/slateUtils";

const Editor = React.lazy(() => import("create/editor/Editor"));
import { patchData } from "database/dbSlice";
import {
  initPage,
  selectPageData,
  updateSlate,
  selectPageIsLoading,
  selectPageIsInitialized,
  selectPageError, // Keep selector, might be used elsewhere or for logging
  selectPageDbSpaceId,
  updatePageTitle,
  selectIsReadOnly,
} from "./pageSlice";
import { updateContentTitle } from "create/space/spaceSlice";
import { markdownToSlate } from "create/editor/markdownToSlate";
import { selectTheme } from "app/theme/themeSlice";
import SaveStatusIndicator, { SaveStatus } from "./SaveStatusIndicator";
import useKeyboardSave from "./useKeyboardSave";

interface RenderPageProps {
  pageKey: string;
}

// PageError component and its usage have been removed.

const RenderPage: React.FC<RenderPageProps> = ({ pageKey }) => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const theme = useAppSelector(selectTheme);

  // Redux State
  const isLoading = useAppSelector(selectPageIsLoading);
  const isInitialized = useAppSelector(selectPageIsInitialized);
  const fetchError = useAppSelector(selectPageError); // Still selecting, but not rendering error component
  const pageState = useAppSelector(selectPageData);
  const dbSpaceId = useAppSelector(selectPageDbSpaceId);
  const isReadOnly = useAppSelector(selectIsReadOnly);

  // Refs and Local State
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const lastSaveDateRef = useRef<Date | null>(null);
  const [editorKey] = useState(`editor-instance-${pageKey}`);
  const urlEditMode = searchParams.get("edit") === "true";
  const lastSavedContent = useRef<EditorContent | null>(null);
  const saveTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorFocused = useRef(false);
  const changesPending = useRef(false);
  const mountedRef = useRef(true);
  const isInitialContentSetRef = useRef(false);

  // Format saved time relative to now
  const formatSavedTime = useCallback((date: Date | null): string | null => {
    if (!date) return null;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "刚刚";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}小时前`;
    return date.toLocaleString("zh-CN", {
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }, []);

  // Load page data or initialize state for a new page key
  const loadPage = useCallback(() => {
    if (!pageKey) {
      console.error("RenderPage: pageKey prop is missing");
      return;
    }
    // Reset local state and refs
    setSaveStatus(null);
    setLastSavedTime(null);
    lastSaveDateRef.current = null;
    lastSavedContent.current = null;
    changesPending.current = false;
    if (saveTimeoutId.current) clearTimeout(saveTimeoutId.current);
    if (statusTimeoutId.current) clearTimeout(statusTimeoutId.current);
    saveTimeoutId.current = null;
    statusTimeoutId.current = null;
    isInitialContentSetRef.current = false; // Reset init flag

    // Dispatch action to fetch page data and set initial readOnly status
    dispatch(initPage({ pageId: pageKey, isReadOnly: !urlEditMode }));
  }, [dispatch, pageKey, urlEditMode]);

  // Effect for initial load and pageKey changes
  useEffect(() => {
    loadPage();
    mountedRef.current = true;
    // Cleanup timers on unmount or before next load
    return () => {
      mountedRef.current = false;
      if (saveTimeoutId.current) clearTimeout(saveTimeoutId.current);
      if (statusTimeoutId.current) clearTimeout(statusTimeoutId.current);
    };
  }, [loadPage]); // Reload when loadPage function identity changes (pageKey, urlEditMode)

  // Save page content and title
  const savePage = useCallback(async () => {
    if (saveStatus === "saving" || isReadOnly) return;

    const currentSlateData = pageState?.slateData;
    if (!currentSlateData) return;

    const hasChanged = compareSlateContent(
      currentSlateData,
      lastSavedContent.current
    );

    if (!changesPending.current && !hasChanged) {
      if (saveStatus === "error") setSaveStatus(null); // Clear previous error if no changes
      return;
    }

    if (statusTimeoutId.current) clearTimeout(statusTimeoutId.current);
    statusTimeoutId.current = null;

    setSaveStatus("saving");
    const saveStartTime = new Date();
    lastSaveDateRef.current = saveStartTime;
    const nowISO = formatISO(saveStartTime);

    try {
      const title = extractTitleFromSlate(currentSlateData);
      // Save page data
      await dispatch(
        patchData({
          dbKey: pageKey,
          changes: { updated_at: nowISO, slateData: currentSlateData, title },
        })
      ).unwrap();

      // Update title in space data if applicable
      if (dbSpaceId) {
        try {
          await dispatch(
            updateContentTitle({
              spaceId: dbSpaceId,
              contentKey: pageKey,
              title,
            })
          ).unwrap();
        } catch (spaceError) {
          console.error("更新空间标题失败:", spaceError);
        }
      }

      // Update title in page slice
      dispatch(updatePageTitle(title));
      // Store successfully saved content for comparison
      lastSavedContent.current = JSON.parse(JSON.stringify(currentSlateData));
      changesPending.current = false;
      setLastSavedTime(formatSavedTime(saveStartTime)); // Update displayed time

      // Show 'saved' status briefly
      if (mountedRef.current) {
        setSaveStatus("saved");
        statusTimeoutId.current = setTimeout(() => {
          if (mountedRef.current) setSaveStatus(null);
          statusTimeoutId.current = null;
        }, 3000);
      }
    } catch (error) {
      console.error(`保存失败:`, error);
      if (mountedRef.current) {
        setSaveStatus("error");
        toast.error("内容保存失败", { icon: "⚠️", duration: 4000 });
      }
    }
  }, [
    saveStatus,
    isReadOnly,
    pageState?.slateData,
    dbSpaceId,
    dispatch,
    pageKey,
    formatSavedTime,
  ]);

  // Handle content changes from the editor
  const handleContentChange = useCallback(
    (changeValue: EditorContent) => {
      if (isReadOnly) return;
      // Clear error status on new change
      if (saveStatus === "error") setSaveStatus(null);

      const hasChanged = compareSlateContent(changeValue, pageState?.slateData);

      if (hasChanged) {
        // Update Redux state optimistically
        dispatch(updateSlate(changeValue));
        changesPending.current = true;

        // Debounce save operation
        if (saveTimeoutId.current) clearTimeout(saveTimeoutId.current);
        saveTimeoutId.current = setTimeout(() => {
          if (mountedRef.current && changesPending.current) {
            savePage();
          }
          saveTimeoutId.current = null;
        }, 2000); // Auto-save after 2 seconds of inactivity
      }
    },
    [dispatch, pageState?.slateData, savePage, isReadOnly, saveStatus]
  );

  // Track editor focus state
  const handleEditorFocus = useCallback(() => {
    editorFocused.current = true;
  }, []);
  const handleEditorBlur = useCallback(() => {
    editorFocused.current = false;
  }, []);

  // Enable keyboard shortcut (Ctrl+S / Cmd+S) for saving
  useKeyboardSave({
    isReadOnly,
    editorFocusedRef: editorFocused,
    saveTimeoutRef: saveTimeoutId,
    onSave: savePage,
  });

  // Periodically update the 'last saved' relative time string
  useEffect(() => {
    if (!lastSaveDateRef.current) return; // Only run if there's a save date
    const intervalId = setInterval(() => {
      setLastSavedTime(formatSavedTime(lastSaveDateRef.current));
    }, 60000); // Update every minute
    return () => clearInterval(intervalId);
  }, [lastSavedTime, formatSavedTime]); // Rerun if formatSavedTime changes (unlikely) or lastSavedTime string changes

  // Warn user about unsaved changes before leaving the page
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const hasChanged = compareSlateContent(
        pageState?.slateData,
        lastSavedContent.current
      );

      if (!isReadOnly && changesPending.current && hasChanged) {
        const message = "您有未保存的更改，确定要离开吗？";
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isReadOnly, pageState?.slateData]);

  // Calculate the initial value for the Slate editor
  const initialValue = useMemo(() => {
    if (!isInitialized || !pageState) {
      // Provide a minimal valid Slate structure while loading/uninitialized
      return [{ type: "paragraph", children: [{ text: "" }] }];
    }

    const data = pageState.slateData;
    let valueToUse: EditorContent;

    if (Array.isArray(data) && data.length > 0) {
      valueToUse = data; // Use existing slateData if available
    } else if (pageState.content) {
      // Fallback to converting markdown content
      try {
        valueToUse = markdownToSlate(pageState.content);
      } catch (e) {
        console.error("转换 markdown 失败:", e);
        valueToUse = [
          { type: "heading-one", children: [{ text: "新页面 (转换失败)" }] },
          {
            type: "paragraph",
            children: [{ text: "无法加载原始内容，请在此编辑。" }],
          },
        ];
      }
    } else {
      // Default content for a new, empty page
      valueToUse = [
        { type: "heading-one", children: [{ text: "新页面" }] },
        { type: "paragraph", children: [{ text: "开始编辑..." }] },
      ];
    }
    return valueToUse;
  }, [isInitialized, pageState?.slateData, pageState?.content]);

  // Effect to set initial 'last saved' state after data is loaded
  useEffect(() => {
    // Run only once after initialization and initialValue calculation
    if (
      isInitialized &&
      pageState &&
      initialValue &&
      !isInitialContentSetRef.current
    ) {
      // Avoid setting if initialValue is just the placeholder empty paragraph
      if (
        !(
          initialValue.length === 1 &&
          initialValue[0].type === "paragraph" &&
          initialValue[0].children[0].text === ""
        )
      ) {
        // Set the baseline for change comparison
        lastSavedContent.current = JSON.parse(JSON.stringify(initialValue));

        // Set the initial save time based on fetched data
        if (pageState.updated_at) {
          try {
            const initialSaveDate = new Date(pageState.updated_at);
            lastSaveDateRef.current = initialSaveDate;
            setLastSavedTime(formatSavedTime(initialSaveDate));
          } catch (e) {
            console.error("解析 updated_at 出错:", e);
            lastSaveDateRef.current = null;
            setLastSavedTime(null);
          }
        } else {
          // No initial save time if updated_at is missing
          lastSaveDateRef.current = null;
          setLastSavedTime(null);
        }
        isInitialContentSetRef.current = true; // Mark as initialized
      }
    }
  }, [isInitialized, pageState, initialValue, formatSavedTime]);

  // Removed Error Rendering Block: if (fetchError) ...

  // Render loading indicator
  if (!isInitialized || isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          color: theme.textSecondary,
          fontSize: "14px",
        }}
      >
        加载中...
      </div>
    );
  }

  // Main component render
  return (
    <>
      <div className="render-page-container">
        <main className="render-page-main">
          <div className="render-page-scrollable-area scrollable-editor-area">
            <div className="render-page-editor-wrapper">
              <React.Suspense
                fallback={
                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: theme.textSecondary,
                    }}
                  >
                    加载编辑器...
                  </div>
                }
              >
                {/* Key forces remount when pageKey changes, ensuring correct initialValue */}
                <div key={editorKey}>
                  <Editor
                    placeholder="开始编辑..."
                    initialValue={initialValue}
                    onChange={handleContentChange}
                    onFocus={handleEditorFocus}
                    onBlur={handleEditorBlur}
                    readOnly={isReadOnly}
                  />
                </div>
              </React.Suspense>
            </div>
          </div>
        </main>

        {/* Display save status only when in edit mode */}
        {!isReadOnly && (
          <SaveStatusIndicator
            status={saveStatus}
            lastSaved={lastSavedTime}
            onRetry={savePage} // Allow retrying a failed save
            hasPendingChanges={changesPending.current}
          />
        )}
      </div>

      {/* Inline CSS Styles */}
      <style>{`
        .render-page-container { display: flex; flex-direction: column; height: calc(100dvh - 60px); background-color: ${theme.background}; color: ${theme.text}; overflow: hidden; position: relative; }
        .render-page-main { flex: 1; display: flex; overflow: hidden; }
        .render-page-scrollable-area { flex: 1; overflow-y: auto; scroll-behavior: smooth; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }
        .render-page-editor-wrapper { max-width: 800px; margin: 0 auto; padding: 20px 16px; min-height: 100%; }
        /* Styles for Slate editable area */
        [contenteditable="true"], [data-slate-editor="true"] { outline: none; caret-color: ${theme.primary}; white-space: pre-wrap; word-wrap: break-word; padding: 4px; font-size: 16px; line-height: 1.7; color: ${theme.text}; }
        /* Custom Scrollbar */
        .scrollable-editor-area::-webkit-scrollbar { width: 6px; }
        .scrollable-editor-area::-webkit-scrollbar-track { background: transparent; }
        .scrollable-editor-area::-webkit-scrollbar-thumb { background: ${theme.borderHover}; border-radius: 3px; transition: background 0.2s; }
        .scrollable-editor-area::-webkit-scrollbar-thumb:hover { background: ${theme.textQuaternary}; }
        /* Responsive adjustments */
        @media (max-width: 768px) { .render-page-editor-wrapper { padding: 16px 12px; } }
        /* Print styles */
        @media print {
          .render-page-container { height: auto; overflow: visible; }
          .render-page-scrollable-area { overflow: visible; }
          .page-save-status-indicator, .toolbar-container { display: none !important; }
          .render-page-editor-wrapper { max-width: 100%; padding: 0; margin: 0; }
          body { -webkit-print-color-adjust: exact; color-adjust: exact; }
        }
      `}</style>
    </>
  );
};

export default React.memo(RenderPage);
