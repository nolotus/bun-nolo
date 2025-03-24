import React, { useState, useEffect } from "react";
import { FiEdit, FiClock, FiChevronRight, FiSearch } from "react-icons/fi";
import Pagination from "web/ui/Pagination";
import { useAppDispatch } from "app/hooks";
import { read } from "database/dbSlice";
import { useGroupedContent } from "chat/hooks/useGroupedContent";
import { createSpaceKey } from "create/space/spaceKeys";

const WriteArticle = ({}) => {
  // 假设 spaceKey 作为 prop 传入
  const spaceId = "01JQ3MSPCFXQDAJVPCX0F1ZJY5";
  const spaceKey = createSpaceKey.space(spaceId);

  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [spaceData, setSpaceData] = useState(null); // 用于存储异步获取的 spaceData
  const pageSize = 10;

  const dispatch = useAppDispatch();

  // 异步获取 spaceData
  useEffect(() => {
    const fetchSpaceData = async () => {
      try {
        const result = await dispatch(read(spaceKey)).unwrap();
        setSpaceData(result);
      } catch (error) {
        console.error("Failed to fetch space data:", error);
      }
    };
    fetchSpaceData();
  }, [dispatch, spaceKey]);

  // 使用 useGroupedContent hook
  const { groupedData, sortedCategories } = useGroupedContent(spaceData);

  // 将分类和未分类的内容合并为一个数组用于显示
  const allArticles = React.useMemo(() => {
    if (!groupedData) return [];
    const categorizedItems = Object.values(groupedData.categorized).flat();
    return [...categorizedItems, ...groupedData.uncategorized];
  }, [groupedData]);

  // 当搜索词变化时过滤文章
  const filteredArticles = React.useMemo(() => {
    return allArticles.filter((article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allArticles, searchTerm]);

  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentArticles = filteredArticles.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="article-container">
        <div className="header-section">
          <h1 className="page-title">我的文章</h1>
          <button className="write-button">
            <FiEdit size={18} />
            <span>写文章</span>
          </button>
        </div>

        <div className="search-container">
          <div className="search-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="搜索文章标题..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                className="clear-button"
                onClick={() => setSearchTerm("")}
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="timeline-list">
          {spaceData === null ? (
            <div className="loading-state">
              <p>加载中...</p>
            </div>
          ) : currentArticles.length > 0 ? (
            <div className="articles-wrapper">
              {currentArticles.map((article, index) => (
                <div
                  key={article.contentKey}
                  className={`timeline-item ${hoveredItem === article.contentKey ? "hovered" : ""}`}
                  onMouseEnter={() => setHoveredItem(article.contentKey)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="time-section">
                    <FiClock className="time-icon" />
                    <span className="time">{article.updatedAt}</span>
                  </div>
                  <div className="title-section">
                    <span className="title">{article.title}</span>
                    <div className="arrow-icon">
                      <FiChevronRight />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>没有找到匹配的文章</p>
            </div>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredArticles.length}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          className="custom-pagination"
        />
      </div>

      <style jsx>{`
        /* 原有样式保持不变，添加加载状态样式 */
        .article-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 24px 16px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          animation: fadeIn 0.5s ease-out;
        }
        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #eaeaea;
        }
        .page-title {
          font-size: 24px;
          font-weight: 600;
          color: #333333;
          margin: 0;
        }
        .search-container {
          margin-bottom: 20px;
        }
        .search-wrapper {
          display: flex;
          align-items: center;
          position: relative;
          max-width: 500px;
          margin: 0 auto;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          color: #777;
          font-size: 18px;
        }
        .search-input {
          width: 100%;
          padding: 10px 40px 10px 40px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 15px;
          transition: all 0.2s ease;
        }
        .search-input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.15);
        }
        .clear-button {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          font-size: 18px;
          color: #777;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
        }
        .clear-button:hover {
          background-color: #f0f0f0;
        }
        .write-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 16px;
          height: 38px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .write-button:hover {
          background-color: #0069d9;
          transform: scale(1.05);
        }
        .write-button:active {
          transform: scale(0.95);
        }
        .timeline-list {
          max-width: 700px;
          margin: 0 auto 24px;
          background-color: #ffffff;
          border-radius: 6px;
          overflow: hidden;
        }
        .articles-wrapper {
          animation: slideUp 0.4s ease-out;
        }
        .timeline-item {
          display: flex;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid #eaeaea;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          animation: fadeInUp 0.5s ease-out both;
          transform-origin: center;
        }
        .timeline-item:last-child {
          border-bottom: none;
        }
        .timeline-item:hover {
          background-color: #f8f9fa;
          transform: translateX(5px);
        }
        .timeline-item.hovered {
          background-color: #f8f9fa;
        }
        .time-section {
          display: flex;
          align-items: center;
          flex: 0 0 130px;
          color: #666666;
        }
        .time-icon {
          margin-right: 8px;
          opacity: 0.6;
        }
        .time {
          font-size: 14px;
        }
        .title-section {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-left: 16px;
        }
        .title {
          font-size: 15px;
          color: #333333;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        .timeline-item:hover .title {
          color: #007bff;
        }
        .arrow-icon {
          color: #007bff;
          display: flex;
          align-items: center;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s ease;
        }
        .timeline-item:hover .arrow-icon {
          opacity: 1;
          transform: translateX(0);
        }
        .empty-state {
          padding: 40px 0;
          text-align: center;
          color: #666666;
          font-size: 15px;
        }
        .loading-state {
          padding: 40px 0;
          text-align: center;
          color: #666666;
          font-size: 15px;
        }
        :global(.custom-pagination) {
          margin-top: 16px;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .timeline-item::after {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 0;
          background-color: #007bff;
          opacity: 0.05;
          transition: width 0.3s ease;
        }
        .timeline-item:hover::after {
          width: 4px;
        }
        @media (max-width: 640px) {
          .article-container {
            padding: 16px 12px;
          }
          .header-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .write-button {
            align-self: flex-end;
          }
          .timeline-item {
            flex-direction: column;
            gap: 8px;
          }
          .time-section {
            flex: unset;
          }
          .title-section {
            padding-left: 0;
          }
          .timeline-item:hover {
            transform: none;
          }
          .timeline-item::after {
            width: 0;
            height: 0;
          }
          .timeline-item:hover::after {
            width: 100%;
            height: 4px;
            top: auto;
            bottom: 0;
          }
        }
      `}</style>
    </>
  );
};

export default WriteArticle;
