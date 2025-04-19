// WriteArticle.tsx
import React, { useState } from "react";
import {
  FiEdit,
  FiClock,
  FiChevronRight,
  FiBookOpen,
  FiSmile,
  FiMessageSquare,
  FiRefreshCw,
} from "react-icons/fi";
import { RiDeleteBin5Line } from "react-icons/ri";
import Pagination from "render/web/ui/Pagination"; // 假设路径
import MoodNoteInput from "./MoodNoteInput"; // 假设路径
import { useArticleListControls } from "./hooks/useArticleListControls"; // 调整路径
import { ContentType } from "create/space/types"; // 假设路径
import SearchBar from "./SearchBar"; // 假设路径
import MoodNoteList from "./MoodNoteList"; // 假设路径

const WriteArticle = () => {
  const spaceId = "01JQ3MSPCFXQDAJVPCX0F1ZJY5"; // 示例 Space ID

  const {
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
  } = useArticleListControls(spaceId);

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const timelineDeleteButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: "12px",
    right: "12px",
    width: "28px",
    height: "28px",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    border: "1px solid #eee",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
    color: "#e57373",
    padding: 0,
    transition:
      "opacity 0.2s ease, visibility 0.2s ease, background-color 0.2s ease",
    zIndex: 5,
  };

  return (
    <>
      <div className="article-container">
        {/* Search Bar */}
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="搜索我的内容..."
        />

        {/* Header */}
        <div className="header-section">
          <h1 className="page-title">我的内容</h1>
          <div className="header-actions">
            <button
              className={`refresh-button ${isLoadingData ? "loading" : ""}`}
              onClick={handleRefresh}
              disabled={isLoadingData}
              aria-label="刷新列表"
            >
              <FiRefreshCw size={18} className="refresh-icon" />
            </button>
            <button
              className="write-button"
              onClick={createNewPage}
              disabled={isLoadingData}
            >
              <FiEdit size={18} />
              <span>写文章</span>
            </button>
          </div>
        </div>

        {/* Mood Input */}
        <div className="mood-note-section">
          <MoodNoteInput onSend={handleSendMoodNote} />
        </div>

        {/* View Switcher */}
        <div className="view-switcher">
          <button
            className={`view-button ${activeView === "moments" ? "active" : ""}`}
            onClick={() => setActiveView("moments")}
            disabled={isLoadingData}
          >
            <FiSmile size={16} /> Moments ({processedData.moments.length})
          </button>
          <button
            className={`view-button ${activeView === "pages" ? "active" : ""}`}
            onClick={() => setActiveView("pages")}
            disabled={isLoadingData}
          >
            <FiBookOpen size={16} /> Pages ({processedData.pages.length})
          </button>
          <button
            className={`view-button ${activeView === "dialogs" ? "active" : ""}`}
            onClick={() => setActiveView("dialogs")}
            disabled={isLoadingData}
          >
            <FiMessageSquare size={16} /> Dialogs (
            {processedData.dialogs.length})
          </button>
        </div>

        {/* Content Area */}
        {activeView === "moments" ? (
          // Moments List
          isLoadingData && mappedMoments.length === 0 ? (
            <div className="loading-state">
              <p>加载中...</p>
            </div>
          ) : !isLoadingData && mappedMoments.length === 0 ? (
            <div className="empty-state">
              <p>还没有 Moments，记录一个吧！</p>
            </div>
          ) : (
            <MoodNoteList notes={mappedMoments} onDelete={handleDeleteMoment} />
          )
        ) : (
          // Pages/Dialogs Timeline List
          <>
            <div className="timeline-list">
              {isLoadingData && currentItems.length === 0 ? (
                <div className="loading-state">
                  <p>加载中...</p>
                </div>
              ) : !isLoadingData &&
                filteredData.length === 0 &&
                currentItems.length === 0 ? (
                <div className="empty-state">
                  {searchTerm ? (
                    <p>
                      在 {activeView} 中没有找到 "{searchTerm}"
                    </p>
                  ) : activeView === "pages" ? (
                    <p>还没有页面，写一篇吧！</p>
                  ) : activeView === "dialogs" ? (
                    <p>还没有 Dialogs</p>
                  ) : (
                    <p>无内容</p>
                  )}
                </div>
              ) : (
                <div className="articles-wrapper">
                  {currentItems.map((item, index) => {
                    const contentKey = item.id;
                    const itemType = item.type;
                    const isHovered = hoveredItem === contentKey;
                    return (
                      <div
                        key={contentKey}
                        className={`timeline-item ${isHovered ? "hovered" : ""}`}
                        onMouseEnter={() => setHoveredItem(contentKey)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={() => handleArticleClick(contentKey, itemType)}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="time-section">
                          <FiClock className="time-icon" />
                          <span className="time">
                            {formatDate(item.updatedAt || item.createdAt)}
                          </span>
                        </div>
                        <div className="title-section">
                          <span className="title">
                            {item.title || "无标题"}
                          </span>
                          {itemType === ContentType.DIALOG && (
                            <span className="dialog-tag">Dialog</span>
                          )}
                          <div className="arrow-icon">
                            <FiChevronRight />
                          </div>
                        </div>
                        {itemType === ContentType.PAGE && (
                          <button
                            aria-label={`删除页面 ${item.title}`}
                            style={{
                              ...timelineDeleteButtonStyle,
                              opacity: isHovered ? 1 : 0,
                              visibility: isHovered ? "visible" : "hidden",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePage(contentKey);
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "rgba(240, 240, 240, 0.8)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "rgba(255, 255, 255, 0.6)")
                            }
                          >
                            <RiDeleteBin5Line size={16} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Pagination */}
            {activeView !== "moments" && filteredData.length > pageSize && (
              <Pagination
                currentPage={currentPage}
                totalItems={filteredData.length}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                className="custom-pagination"
              />
            )}
          </>
        )}
      </div>

      {/* Styles */}
      <style>
        {`
            /* Styles in previous answers remain the same */
             .article-container { max-width: 800px; margin: 40px auto; padding: 24px 16px; background-color: #f8fbf9; border-radius: 8px; box-shadow: 0 2px 10px rgba(122, 184, 146, 0.1); animation: fadeIn 0.5s ease-out; }
            .header-actions { display: flex; align-items: center; gap: 10px; }
            .refresh-button { display: flex; align-items: center; justify-content: center; padding: 0; width: 36px; height: 36px; background-color: #f0f7f3; color: #5f9475; border: 1px solid #cce2d6; border-radius: 50%; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); }
            .refresh-button:hover:not(:disabled) { background-color: #e6f4ea; border-color: #b8d8c7; transform: translateY(-1px); box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08); }
            .refresh-button:active:not(:disabled) { transform: translateY(0); box-shadow: inset 0 1px 2px rgba(0,0,0,0.1); }
            .refresh-button:disabled { opacity: 0.6; cursor: not-allowed; background-color: #f5f5f5; }
            .refresh-button.loading .refresh-icon { animation: spin 1s linear infinite; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .write-button { display: flex; align-items: center; gap: 8px; padding: 0 16px; height: 38px; background-color: #7ab892; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(122, 184, 146, 0.2); flex-shrink: 0; }
            .write-button:hover:not(:disabled) { background-color: #5f9475; transform: scale(1.05); }
            .write-button:active:not(:disabled) { transform: scale(0.95); }
            .write-button:disabled { opacity: 0.6; cursor: not-allowed; background-color: #a8c9b6; transform: none; box-shadow: none; }
            .search-container { margin-bottom: 24px; }
            .search-wrapper { display: flex; align-items: center; position: relative; max-width: 600px; margin: 0 auto; }
            .search-icon { position: absolute; left: 12px; color: #666666; font-size: 18px; pointer-events: none; }
            .search-input { width: 100%; padding: 10px 40px 10px 40px; border: 2px solid #7ab892; border-radius: 6px; font-size: 15px; background-color: #f8fbf9; transition: all 0.2s ease; }
            .search-input:focus { outline: none; border-color: #5f9475; box-shadow: 0 0 0 2px rgba(122, 184, 146, 0.2); }
            .clear-button { position: absolute; right: 12px; background: none; border: none; font-size: 20px; color: #666666; cursor: pointer; padding: 0; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; line-height: 1; }
            .clear-button:hover { background-color: #e6ece8; color: #333; }
            .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e6ece8; }
            .page-title { font-size: 24px; font-weight: 600; color: #333333; margin: 0; }
            .mood-note-section { max-width: 700px; margin: 0 auto 24px; }
            .view-switcher { max-width: 700px; margin: 0 auto 20px; display: flex; justify-content: center; gap: 10px; padding-bottom: 15px; border-bottom: 1px solid #e6ece8; }
            .view-button { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1px solid #e6ece8; background-color: #fff; color: #555; border-radius: 20px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s ease; white-space: nowrap; }
            .view-button:hover:not(:disabled) { background-color: #f8f9fa; border-color: #d8dde1; }
            .view-button.active { background-color: #7ab892; color: #fff; border-color: #7ab892; box-shadow: 0 2px 4px rgba(122, 184, 146, 0.2); }
            .view-button:disabled { opacity: 0.6; cursor: not-allowed; }
            .timeline-list { max-width: 700px; margin: 0 auto 24px; }
            .articles-wrapper { animation: slideUp 0.4s ease-out; }
            .timeline-item { position: relative; display: flex; justify-content: space-between; align-items: center; padding: 16px; border: 1px solid #e6ece8; transition: all 0.3s ease; cursor: pointer; animation: fadeInUp 0.5s ease-out both; transform-origin: center; border-radius: 6px; margin-bottom: 8px; background-color: #fff; }
            .timeline-item:last-child { margin-bottom: 0; }
            .timeline-item:hover { background-color: #f8fbf9; transform: translateX(3px); border-color: #d8e8df; box-shadow: 0 2px 6px rgba(122, 184, 146, 0.1); }
            .time-section { display: flex; align-items: center; flex: 0 0 130px; color: #666666; margin-right: 10px; }
            .time-icon { margin-right: 8px; opacity: 0.6; }
            .time { font-size: 13px; white-space: nowrap; }
            .title-section { flex: 1; display: flex; justify-content: space-between; align-items: center; padding-left: 16px; min-width: 0; gap: 8px; padding-right: 30px; }
            .title { font-size: 15px; color: #333333; font-weight: 500; transition: color 0.2s ease; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex-grow: 1; min-width: 0; }
            .timeline-item:hover .title { color: #5f9475; }
            .moment-tag { background-color: #e6f4ea; color: #5f9475; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500; white-space: nowrap; flex-shrink: 0; }
            .dialog-tag { background-color: #e7f3fe; color: #4285f4; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500; white-space: nowrap; flex-shrink: 0; }
            .arrow-icon { color: #7ab892; display: flex; align-items: center; opacity: 0; transform: translateX(-10px); transition: all 0.3s ease; flex-shrink: 0; }
            .timeline-item:hover .arrow-icon { opacity: 1; transform: translateX(0); }
            .empty-state, .loading-state { padding: 40px 0; text-align: center; color: #666666; font-size: 15px; background-color: #ffffff; border: 1px solid #e6ece8; border-radius: 6px; max-width: 700px; margin: 0 auto 24px; }
            :global(.custom-pagination), .custom-pagination { margin-top: 16px; display: flex; justify-content: center; }
            .custom-pagination button { margin: 0 4px; padding: 6px 12px; border: 1px solid #7ab892; background-color: #fff; color: #7ab892; border-radius: 4px; cursor: pointer; transition: all 0.2s ease; }
            .custom-pagination button:hover { background-color: #e6f4ea; }
            .custom-pagination button:disabled { opacity: 0.6; cursor: not-allowed; }
            .custom-pagination button.active { background-color: #7ab892; color: #fff; border-color: #7ab892; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @media (max-width: 640px) {
              .article-container { padding: 16px 12px; margin: 20px auto; }
              .search-wrapper { max-width: 100%; }
              .header-section { flex-direction: column; align-items: stretch; gap: 16px; margin-bottom: 16px; padding-bottom: 16px; }
              .page-title { text-align: center; }
              .header-actions { align-self: center; justify-content: center; }
              .refresh-button { width: 38px; height: 38px; }
              .mood-note-section { margin-left: 0; margin-right: 0; margin-bottom: 16px; max-width: 100%; }
              .view-switcher { justify-content: space-around; gap: 5px; max-width: 100%; padding-left: 5px; padding-right: 5px; }
              .view-button { padding: 6px 10px; font-size: 13px; gap: 4px; }
              .timeline-list { max-width: 100%; margin-left: 0; margin-right: 0; }
              .timeline-item { flex-direction: column; gap: 8px; align-items: flex-start; padding: 12px; margin-bottom: 8px; }
              .timeline-item:hover { transform: none; background-color: #f8fbf9; }
              .time-section { flex: unset; width: 100%; margin-right: 0; border-right: none; padding-right: 0; margin-bottom: 8px; }
              .title-section { padding-left: 0; width: 100%; position: relative; min-height: 20px; flex-wrap: wrap; align-items: flex-start; justify-content: flex-start; padding-right: 30px; }
              .title { white-space: normal; overflow: visible; text-overflow: clip; margin-right: 5px; flex-grow: 0; }
              .moment-tag, .dialog-tag { margin-left: 0; margin-top: 4px; order: 2; }
              .arrow-icon { position: absolute; right: 0px; top: 0px; transform: translateY(0); opacity: 0.6; margin-left: auto; order: 3; }
              .timeline-item:hover .arrow-icon { opacity: 1; transform: translateY(0); }
              .timeline-item button[aria-label^="删除页面"] { top: 8px; right: 8px; width: 26px; height: 26px;}
              .timeline-item button[aria-label^="删除页面"] svg { font-size: 14px; }
              .empty-state, .loading-state { padding: 30px 15px; max-width: 100%;}
              .custom-pagination button { padding: 5px 10px; font-size: 13px; }
            }
          `}
      </style>
    </>
  );
};

export default WriteArticle;
