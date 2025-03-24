import React, { useState, useEffect } from "react";
import { FiEdit, FiClock, FiChevronRight, FiSearch } from "react-icons/fi";
import Pagination from "web/ui/Pagination";

const WriteArticle = () => {
  const articles = [
    { id: 1, date: "2025-03-24", title: "React 基础教程" },
    { id: 2, date: "2025-03-23", title: "JavaScript 性能优化" },
    { id: 3, date: "2025-03-22", title: "CSS 现代布局技巧" },
    { id: 4, date: "2025-03-21", title: "前端开发最佳实践" },
    { id: 5, date: "2025-03-20", title: "TypeScript 入门" },
    { id: 6, date: "2025-03-19", title: "Webpack 配置指南" },
    { id: 7, date: "2025-03-18", title: "Node.js 基础" },
    { id: 8, date: "2025-03-17", title: "Vue.js 进阶" },
    { id: 9, date: "2025-03-16", title: "HTML5 新特性" },
    { id: 10, date: "2025-03-15", title: "CSS 动画技巧" },
    { id: 11, date: "2025-03-14", title: "React Hooks 详解" },
    { id: 12, date: "2025-03-13", title: "前端调试技巧" },
    { id: 13, date: "2025-03-12", title: "Git 使用指南" },
    { id: 14, date: "2025-03-11", title: "ES6 核心特性" },
    { id: 15, date: "2025-03-10", title: "Web 性能优化" },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredArticles, setFilteredArticles] = useState(articles);
  const pageSize = 10;

  // 当搜索词变化时过滤文章
  useEffect(() => {
    const results = articles.filter((article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredArticles(results);
    setCurrentPage(1); // 重置到第一页
  }, [searchTerm]);

  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentArticles = filteredArticles.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // 滚动到顶部，提升用户体验
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
          {currentArticles.length > 0 ? (
            <div className="articles-wrapper">
              {currentArticles.map((article, index) => (
                <div
                  key={article.id}
                  className={`timeline-item ${hoveredItem === article.id ? "hovered" : ""}`}
                  onMouseEnter={() => setHoveredItem(article.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="time-section">
                    <FiClock className="time-icon" />
                    <span className="time">{article.date}</span>
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
        /* 容器样式 */
        .article-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 24px 16px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          animation: fadeIn 0.5s ease-out;
        }

        /* 标题区域 */
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

        /* 搜索区域 */
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

        /* 写文章按钮 */
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

        /* 文章列表区域 */
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

        /* 文章列表项 */
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

        /* 时间区域 */
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

        /* 标题区域 */
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

        /* 箭头图标 */
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

        /* 空状态 */
        .empty-state {
          padding: 40px 0;
          text-align: center;
          color: #666666;
          font-size: 15px;
        }

        /* 分页器自定义样式 */
        :global(.custom-pagination) {
          margin-top: 16px;
        }

        /* 动画定义 */
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

        /* 悬停效果 */
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

        /* 响应式样式 */
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

          /* 调整在移动设备上的悬停效果 */
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
