import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaPlus, FaBook } from "react-icons/fa";
import { BsRobot } from "react-icons/bs";
import { HiOutlineDocument } from "react-icons/hi";
import { FiUsers, FiCalendar } from "react-icons/fi";
import { useTheme } from "app/theme";
import { useSpaceData } from "../hooks/useSpaceData";
import EmptyState from "../components/EmptyState";
import Cybots from "ai/cybot/web/Cybots";
import { useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";

// 模拟页面数据
const mockPages = [
  {
    id: 101,
    title: "项目规划",
    icon: <FaBook />,
    lastEdited: "2025-03-24",
    creator: "张三",
  },
  {
    id: 102,
    title: "团队任务分配",
    icon: <FaBook />,
    lastEdited: "2025-03-23",
    creator: "李四",
  },
  {
    id: 103,
    title: "产品原型设计",
    icon: <FaBook />,
    lastEdited: "2025-03-21",
    creator: "王五",
  },
  {
    id: 104,
    title: "市场调研报告",
    icon: <FaBook />,
    lastEdited: "2025-03-20",
    creator: "赵六",
  },
  {
    id: 105,
    title: "竞品分析",
    icon: <FaBook />,
    lastEdited: "2025-03-19",
    creator: "钱七",
  },
  {
    id: 106,
    title: "用户反馈总结",
    icon: <FaBook />,
    lastEdited: "2025-03-17",
    creator: "孙八",
  },
];

const SpaceHome: React.FC = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const [pages] = React.useState(mockPages);
  const theme = useTheme();
  const { spaceData, loading } = useSpaceData(spaceId!);
  const currentUserId = useAppSelector(selectCurrentUserId);

  const handleCreatePage = () => {
    console.log("创建新页面");
    // 实现创建页面的逻辑
  };

  return (
    <div className="space-home">
      {/* 注意：移除了统计信息区域，该信息将移动到SpaceNavigation组件中 */}

      {/* Cybots 部分 */}
      {currentUserId && (
        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-icon robots-icon">
                <BsRobot />
              </span>
              我的 AI 助手
            </h2>
          </div>

          <div className="cybots-container">
            <Cybots queryUserId={currentUserId} limit={100} />
          </div>
        </div>
      )}

      {/* 最新页面区域 */}
      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="title-icon pages-title-icon">
              <HiOutlineDocument />
            </span>
            最新页面
          </h2>
          <div className="header-actions">
            <button
              className="import-button secondary"
              onClick={handleCreatePage}
            >
              <FaPlus />
              <span>新建页面</span>
            </button>
          </div>
        </div>

        <div className="pages-container">
          {pages.length > 0 ? (
            <div className="pages-grid">
              {pages.slice(0, 6).map((page) => (
                <div key={page.id} className="page-card">
                  <div className="page-icon">{page.icon}</div>
                  <div className="page-content">
                    <h3 className="page-title">{page.title}</h3>
                    <div className="page-meta">
                      <span className="page-creator">{page.creator}</span>
                      <span className="page-date">{page.lastEdited}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FaBook />}
              title="创建您的第一个页面"
              description="页面是组织和记录信息的绝佳方式。创建您的第一个页面，开始记录想法和知识。"
              actionText={
                <>
                  <FaPlus style={{ marginRight: theme.space[2] }} />
                  新建页面
                </>
              }
              onAction={handleCreatePage}
              secondaryAction={{
                text: "查看模板",
                onClick: () => console.log("查看模板"),
              }}
            />
          )}
        </div>
      </div>

      <style jsx>{`
        .space-home {
          width: 100%;
        }

        .content-section {
          margin-bottom: ${theme.space[8]};
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: ${theme.space[4]};
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: ${theme.space[4]};
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: ${theme.text};
          margin: 0;
          display: flex;
          align-items: center;
        }

        .title-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: ${theme.space[3]};
          width: ${theme.space[6]};
          height: ${theme.space[6]};
          background: ${theme.backgroundHover};
          color: ${theme.primary};
          border-radius: 6px;
        }

        .robots-icon {
          background: ${theme.primaryLight};
          color: ${theme.primary};
        }

        .pages-title-icon {
          background: ${theme.backgroundTertiary};
          color: ${theme.textSecondary};
        }

        .import-button {
          display: flex;
          align-items: center;
          padding: ${theme.space[2]} ${theme.space[3]};
          border: none;
          background: ${theme.primary};
          color: white;
          font-size: 14px;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .import-button svg {
          margin-right: ${theme.space[2]};
        }

        .import-button:hover {
          background: ${theme.primaryDark};
          transform: translateY(-1px);
        }

        .import-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .import-button.secondary {
          background: ${theme.backgroundHover};
          color: ${theme.text};
        }

        .import-button.secondary:hover {
          background: ${theme.backgroundTertiary};
        }

        .pages-container,
        .cybots-container {
          border-radius: 12px;
          overflow: hidden;
          /* 移除了阴影 */
        }

        .cybots-container {
          padding: ${theme.space[2]} 0;
        }

        .pages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: ${theme.space[4]};
          padding: ${theme.space[5]};
        }

        .page-card {
          background: ${theme.background};
          border-radius: 10px;
          padding: ${theme.space[4]};
          display: flex;
          align-items: center;
          transition: transform 0.2s;
          cursor: pointer;
          /* 调整了卡片的阴影为更轻微的效果 */
          border: 1px solid ${theme.backgroundHover};
        }

        .page-card:hover {
          transform: translateY(-2px);
          /*  hover时添加轻微阴影效果 */
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }

        .page-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(79, 70, 229, 0.1);
          color: rgb(79, 70, 229);
          border-radius: 8px;
          font-size: 16px;
          margin-right: ${theme.space[3]};
          flex-shrink: 0;
        }

        .page-content {
          flex: 1;
          min-width: 0;
        }

        .page-title {
          font-size: 15px;
          font-weight: 500;
          color: ${theme.text};
          margin: 0 0 6px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .page-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: ${theme.textTertiary};
        }

        @media (max-width: 768px) {
          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: ${theme.space[3]};
          }

          .header-actions {
            width: 100%;
          }

          .import-button {
            width: 100%;
            justify-content: center;
          }

          .pages-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .import-button svg {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default SpaceHome;
