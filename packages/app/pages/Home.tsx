// file: src/pages/Home.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "app/store";
import {
  selectIsLoggedIn,
  selectCurrentUser,
  selectUserId,
} from "auth/authSlice";
import { selectCurrentSpaceId } from "create/space/spaceSlice";
import { CreateRoutePaths } from "create/routePaths";
import { createPage } from "render/page/pageSlice";
import { DataType } from "create/types";
import { useUserData } from "database/hooks/useUserData";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  LuGlobe,
  LuChevronRight,
  LuBook,
  LuBot,
  LuMessagesSquare,
  LuPencil,
  LuDollarSign,
  LuArrowDown,
} from "react-icons/lu";
import WelcomeSection from "./WelcomeSection";
import Tabs, { TabItem } from "render/web/ui/Tabs";
import PublicAgents from "ai/agent/web/PublicAgents";
import AgentListView from "ai/agent/web/AgentListView";
import StreamingIndicator from "render/web/ui/StreamingIndicator";

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
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const currentUser = useAppSelector(selectCurrentUser);
  const currentUserId = useAppSelector(selectUserId);
  const currentSpaceId = useAppSelector(selectCurrentSpaceId);
  const { isLoading: isChatLoading, createNewDialog } = useCreateDialog();
  const [activeTab, setActiveTab] = useState("communityAI");

  const createNewPage = useCallback(async () => {
    try {
      const pageKey = await dispatch(createPage()).unwrap();
      navigate(`/${pageKey}?edit=true`);
    } catch {
      toast.error("创建失败");
    }
  }, [dispatch, navigate]);

  const startQuickChat = useCallback(async () => {
    if (isChatLoading) return;
    try {
      await createNewDialog({
        agents: ["cybot-pub-01JYRSTM0MPPGQC9S25S3Y9J20"],
      });
    } catch {
      toast.error("启动失败");
    }
  }, [isChatLoading, createNewDialog]);

  const handleScrollToPlaza = () => {
    document.getElementById("ai-plaza-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /**
   * 顶部操作区：
   * - 已移除「创建 AI 助手」，该操作现在只在空状态占位里出现
   */
  const actions = [
    {
      id: "quick-chat",
      text: isChatLoading ? "正在启动..." : "立即聊天",
      icon: <LuMessagesSquare size={22} />,
      desc: "与AI助手开始对话",
      onClick: startQuickChat,
      span: 2,
      primary: true,
    },
    {
      id: "create-note",
      text: "创建笔记",
      icon: <LuPencil size={22} />,
      desc: "记录想法,构建知识",
      onClick: createNewPage,
      span: 1,
    },
    {
      id: "pricing",
      text: "计费详情",
      icon: <LuDollarSign size={22} />,
      desc: "查看价格规则",
      onClick: () => navigate("/pricing"),
      span: 1,
    },
    {
      id: "guide",
      text: "使用指南",
      icon: <LuBook size={22} />,
      desc: "快速上手技巧",
      onClick: () =>
        navigate(
          "/page-0e95801d90-01JRDMA6Q85PQDCEAC7EXHWF67?spaceId=01JRDM39VSNYD1PKS4B53W6BGE"
        ),
      span: 1,
    },
  ];

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

  const tabItems: TabItem[] = tabsConfig.map(({ id, label, icon }) => ({
    id,
    label,
    icon,
  }));

  return (
    <>
      <div className="home-layout">
        <main className="home-main">
          {isLoggedIn && currentUser ? (
            <section className="actions-section">
              <div className="action-grid">
                {actions.map((action) => (
                  <div
                    key={action.id}
                    className={`action-card ${action.primary ? "primary" : ""} ${
                      isChatLoading && action.id === "quick-chat"
                        ? "loading"
                        : ""
                    }`}
                    onClick={action.onClick}
                    style={{ gridColumn: `span ${action.span}` }}
                  >
                    <div className="action-header">
                      <div className="action-icon">{action.icon}</div>
                      <h3 className="action-title">{action.text}</h3>
                    </div>
                    <p className="action-desc">{action.desc}</p>
                  </div>
                ))}
              </div>
            </section>
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
              <Tabs
                items={tabItems}
                activeTab={activeTab}
                onTabChange={setActiveTab}
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
        
        /* 通用 Glass 卡片样式，阴影使用全局 shadow 变量 */
        .action-card,
        .explore-plaza-button,
        .view-all-link {
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          box-shadow:
            0 0 0 0.5px var(--shadowLight),
            0 1px 2px 0 var(--shadowLight),
            0 2px 8px -1px var(--shadowMedium),
            0 4px 16px -2px var(--shadowMedium);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
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

        .actions-section { 
          margin-bottom: var(--space-10); 
          opacity: 0; 
          animation: fadeInUp 0.6s ease forwards; 
        }
        .action-grid { 
          display: grid; 
          grid-template-columns: repeat(3, 1fr); 
          gap: var(--space-4); 
        }
        
        .action-card { 
          background: var(--background); 
          border: none;
          border-radius: 18px; 
          padding: var(--space-4); 
          cursor: pointer; 
          min-height: 90px;
        }
        
        .action-card:hover { 
          transform: translateY(-4px); 
          box-shadow:
            0 0 0 1px var(--primaryGhost),
            0 2px 4px 0 var(--shadowLight),
            0 8px 20px -2px var(--shadowMedium),
            0 16px 40px -4px var(--shadowMedium),
            0 4px 24px -2px var(--primaryGhost);
        }
        
        .action-card.primary { 
          background: linear-gradient(135deg, var(--primaryGhost) 0%, var(--background) 80%); 
          box-shadow: 
            0 0 0 0.5px var(--primaryGhost),
            0 1px 2px 0 var(--primaryGhost),
            0 2px 8px -1px var(--shadowMedium),
            0 4px 16px -2px var(--shadowMedium);
        }
        
        .action-card.primary:hover {
          box-shadow: 
            0 0 0 1px var(--primary),
            0 2px 4px 0 var(--shadowLight),
            0 8px 20px -2px var(--shadowMedium),
            0 16px 40px -4px var(--shadowMedium),
            0 4px 32px -2px var(--primaryGhost);
        }
        
        .action-card.loading { opacity: 0.6; pointer-events: none; }
        
        .action-header { 
          display: flex; 
          align-items: center; 
          gap: var(--space-3); 
          margin-bottom: var(--space-2); 
        }
        
        .action-icon { 
          width: 40px; 
          height: 40px; 
          border-radius: 10px; 
          background: linear-gradient(135deg, var(--primaryGhost), var(--background)); 
          border: 1px solid var(--primaryGhost); 
          color: var(--primary); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          transition: all 0.3s ease;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
        
        .action-card:hover .action-icon { 
          background: var(--primary); 
          color: var(--background); 
          transform: scale(1.05);
          box-shadow: 0 4px 12px 0 var(--primaryGhost);
        }
        
        .action-title { 
          font-size: 1.1rem; 
          font-weight: 600; 
          color: var(--text); 
          margin: 0; 
        }

        .action-desc { 
          font-size: 0.85rem; 
          color: var(--textSecondary); 
          margin: 0; 
          line-height: 1.4; 
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

        @media (max-width: 768px) {
          .action-grid { 
            grid-template-columns: 1fr; 
            gap: var(--space-3); 
          }
          .action-card { 
            grid-column: span 1 !important; 
          }
        }
        
        @media (max-width: 480px) {
          .home-main { 
            padding: var(--space-4) var(--space-2) var(--space-6); 
          }
          .action-icon { 
            width: 32px; 
            height: 32px; 
          }
        }
      `}</style>
    </>
  );
};

export default Home;
