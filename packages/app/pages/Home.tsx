// file: src/pages/Home.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "app/store";
import {
  selectIsLoggedIn,
  selectCurrentUser,
  selectUserId,
} from "auth/authSlice";
import { selectCurrentSpaceId } from "create/space/spaceSlice";
import { CreateRoutePaths } from "create/routePaths";
import { DataType } from "create/types";
import { useUserData } from "database/hooks/useUserData";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { LuGlobe, LuChevronRight, LuBot, LuArrowDown } from "react-icons/lu";
import WelcomeSection from "./WelcomeSection";
// ✅ 使用新的 TabsNav
import TabsNav from "render/web/ui/TabsNav";
import PublicAgents from "ai/agent/web/PublicAgents";
import AgentListView from "ai/agent/web/AgentListView";
import StreamingIndicator from "render/web/ui/StreamingIndicator";
import HomeActions from "./HomeActions";

/**
 * 空状态：支持可选的操作按钮（如「创建 AI 助手」）
 */
const EmptyPlaceholder = ({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <div className="empty-container">
    <div className="empty-icon">
      <LuBot size={48} />
    </div>
    <p className="empty-text">{message}</p>

    {actionLabel && onAction && (
      <button className="empty-action-button" onClick={onAction}>
        <LuBot size={18} />
        <span>{actionLabel}</span>
      </button>
    )}
  </div>
);

/**
 * 我的助手列表
 * 空列表时展示 EmptyPlaceholder，并在其中提供「创建 AI 助手」按钮
 */
const CybotList = ({
  queryUserId,
  limit = 9,
}: {
  queryUserId: string | null;
  limit?: number;
}) => {
  const navigate = useNavigate();

  const {
    loading,
    data: cybots = [],
    error,
    reload,
    clearCache,
  } = useUserData(DataType.CYBOT, queryUserId, limit);

  const [items, setItems] = useState(cybots);

  useEffect(() => setItems(cybots), [cybots]);

  useEffect(() => {
    if (error) toast.error("加载失败");
  }, [error]);

  const handleReload = useCallback(async () => {
    clearCache();
    await reload();
  }, [clearCache, reload]);

  // 加载中（首次无数据）使用 StreamingIndicator
  if (loading && !items.length) {
    return (
      <div className="loading-indicator-container">
        <StreamingIndicator />
      </div>
    );
  }

  // 空状态：在占位中提供「创建 AI 助手」
  if (!items.length) {
    return (
      <EmptyPlaceholder
        message="还没有创建 AI 助手"
        actionLabel="创建 AI 助手"
        onAction={() => navigate(`/${CreateRoutePaths.CREATE_CYBOT}`)}
      />
    );
  }

  // 有数据时渲染列表
  return <AgentListView items={items} onReload={handleReload} />;
};

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const currentUser = useAppSelector(selectCurrentUser);
  const currentUserId = useAppSelector(selectUserId);
  const currentSpaceId = useAppSelector(selectCurrentSpaceId);
  const [activeTab, setActiveTab] = useState("communityAI");

  const handleScrollToPlaza = () => {
    document.getElementById("ai-plaza-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // tab 配置：带 icon + label + 对应内容 component
  const tabsConfig = [
    ...(isLoggedIn
      ? [
          {
            id: "myAI",
            label: "我的工作台",
            icon: <LuBot size={20} />,
            component: <CybotList queryUserId={currentUserId} limit={6} />,
          },
        ]
      : []),
    {
      id: "communityAI",
      label: "AI 广场",
      icon: <LuGlobe size={20} />,
      component: <PublicAgents limit={9} />,
    },
  ];

  // 映射成 TabsNav 需要的 tabs（label 里放 icon + 文本）
  const tabs = tabsConfig.map(({ id, label, icon }) => ({
    id,
    label: (
      <span className="tab-label-with-icon">
        {icon}
        <span>{label}</span>
      </span>
    ),
  }));

  return (
    <>
      <div className="home-layout">
        <main className="home-main">
          {isLoggedIn && currentUser ? (
            <HomeActions />
          ) : (
            <>
              <WelcomeSection />
              <div className="explore-plaza-container">
                <button
                  className="explore-plaza-button"
                  onClick={handleScrollToPlaza}
                >
                  <LuArrowDown size={20} />
                  <span>{t("explorePlaza")}</span>
                </button>
              </div>
            </>
          )}

          <section id="ai-plaza-section" className="content-section">
            <header className="content-header">
              {/* ✅ 使用新的 TabsNav */}
              <TabsNav
                tabs={tabs}
                activeTab={activeTab}
                onChange={(id) => setActiveTab(id as string)}
              />

              {isLoggedIn && (
                <NavLink
                  to={
                    activeTab === "myAI"
                      ? `space/${currentSpaceId}`
                      : "/explore"
                  }
                  className="view-all-link"
                >
                  <span>查看全部</span>
                  <LuChevronRight size={16} />
                </NavLink>
              )}
            </header>
            <div className="content-body">
              {tabsConfig.find((tab) => tab.id === activeTab)?.component}
            </div>
          </section>
        </main>
      </div>

      <style href="home-compact" precedence="high">{`
        /* 基础布局：使用全局背景变量 */
        .home-layout {
          min-height: 100vh;
          background: var(--background);
          /* 玻璃化模糊，可按需调整强度 */
          --glass-blur: blur(10px) saturate(1.25);
        }

        .home-main { 
          max-width: min(1200px, calc(100vw - var(--space-8))); 
          margin: 0 auto; 
          padding: var(--space-8) var(--space-4) var(--space-12); 
        }

        .explore-plaza-container { 
          text-align: center; 
          margin: calc(var(--space-2) * -1) 0 var(--space-10); 
          opacity: 0; 
          animation: fadeInUp 0.6s ease 1s forwards; 
        }
        
        .explore-plaza-button { 
          display: inline-flex; 
          align-items: center; 
          gap: var(--space-3); 
          padding: var(--space-3) var(--space-6); 
          background: var(--backgroundSecondary); 
          color: var(--textSecondary); 
          border: none;
          border-radius: 9999px; 
          font-size: 0.9rem; 
          font-weight: 500; 
          cursor: pointer; 
          animation: bounce 2s ease-in-out infinite;
        }
        
        .explore-plaza-button:hover { 
          color: var(--primary); 
          background: var(--background); 
          transform: translateY(-3px); 
          animation-play-state: paused;
          box-shadow:
            0 0 0 1px var(--primaryGhost),
            0 2px 4px 0 var(--shadowLight),
            0 8px 20px -2px var(--shadowMedium),
            0 16px 40px -4px var(--shadowMedium),
            0 4px 24px -2px var(--primaryGhost);
        }
        
        @keyframes bounce { 
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 
          40% { transform: translateY(-8px); } 
          60% { transform: translateY(-4px); } 
        }
        @keyframes fadeInUp { 
          from { opacity: 0; transform: translateY(24px); } 
          to { opacity: 1; transform: translateY(0); } 
        }

        .content-section { 
          opacity: 0; 
          animation: fadeInUp 0.6s ease 0.2s forwards; 
        }

        .content-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: var(--space-6); 
          flex-wrap: wrap; 
          gap: var(--space-4); 
        }
        
        .view-all-link { 
          display: flex; 
          align-items: center; 
          gap: var(--space-2); 
          color: var(--textSecondary); 
          text-decoration: none; 
          font-weight: 500; 
          font-size: 0.875rem; 
          padding: var(--space-2) var(--space-4); 
          border-radius: 10px; 
          border: none;
          background: var(--backgroundSecondary); 
        }
        
        .view-all-link:hover { 
          color: var(--primary); 
          transform: translateX(2px);
          box-shadow:
            0 0 0 1px var(--primaryGhost),
            0 2px 4px 0 var(--shadowLight),
            0 8px 20px -2px var(--shadowMedium),
            0 16px 40px -4px var(--shadowMedium),
            0 4px 24px -2px var(--primaryGhost);
        }
        
        .content-body { padding: var(--space-6) 0; }

        /* 加载指示器容器：让 StreamingIndicator 居中显示 */
        .loading-indicator-container {
          position: relative;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .empty-container { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          gap: var(--space-4); 
          min-height: 280px; 
          color: var(--textTertiary); 
          text-align: center; 
        }
        
        .empty-icon { 
          width: 80px; 
          height: 80px; 
          border-radius: 20px; 
          background: linear-gradient(135deg, var(--primary), var(--primaryLight)); 
          color: var(--background); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          box-shadow: 
            0 4px 12px 0 var(--shadowMedium),
            0 8px 24px -2px var(--shadowHeavy);
        }
        
        .empty-text { 
          font-size: 1rem; 
          font-weight: 500; 
          margin: 0; 
        }

        /* 空状态中的操作按钮：使用主题主色 + 语义阴影 */
        .empty-action-button {
          margin-top: var(--space-2);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-5);
          border-radius: 9999px;
          border: 1px solid var(--primaryGhost);
          background: var(--primary);
          color: var(--background);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow:
            0 1px 2px 0 var(--shadowLight),
            0 4px 12px -2px var(--primaryGhost);
        }

        .empty-action-button:hover {
          background: var(--hover);
          transform: translateY(-1px);
          box-shadow:
            0 2px 4px 0 var(--shadowLight),
            0 8px 20px -4px var(--primaryGhost);
        }

        .empty-action-button:focus-visible {
          outline: 2px solid var(--focus);
          outline-offset: 2px;
        }

        /* ⭐ TabsNav 里 label 的 icon + 文本 布局 */
        .tab-label-with-icon {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
        }

        @media (max-width: 480px) {
          .home-main { 
            padding: var(--space-4) var(--space-2) var(--space-6); 
          }
        }
      `}</style>
    </>
  );
};

export default Home;
