// file: src/pages/Home.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "app/store";
import { selectTheme } from "app/settings/settingSlice";
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

// Icons
import {
  GlobeIcon,
  ChevronRightIcon,
  PlusIcon,
  BookIcon,
  CopilotIcon,
  CommentDiscussionIcon,
  PencilIcon,
} from "@primer/octicons-react";
import { FiDollarSign } from "react-icons/fi";

// Components
import WelcomeSection from "./WelcomeSection";
import AgentBlock from "ai/llm/web/AgentBlock";
import PubCybots from "ai/cybot/web/PubCybots";
import Tabs, { TabItem } from "render/web/ui/Tabs"; // 导入新组件

const LoadingState = ({}) => {
  return (
    <>
      <div className="cybots-grid">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="skeleton-card"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      <style href="loading-state" precedence="low">{`
        .skeleton-card {
          background: var(--backgroundSecondary);
          border-radius: 16px;
          height: 280px;
          animation: skeletonPulse 2s ease-in-out infinite;
        }
        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
};
LoadingState.displayName = "LoadingState";

const EmptyState = ({ message }: { message: string }) => {
  return (
    <>
      <div className="empty-state">
        <div className="empty-icon">
          <CopilotIcon size={48} />
        </div>
        <p className="empty-message">{message}</p>
      </div>
      <style href="empty-state" precedence="low">{`
        .empty-state {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: var(--space-4); min-height: 280px; color: var(--textTertiary); text-align: center;
        }
        .empty-icon {
          width: 80px; height: 80px; border-radius: 24px;
          background: linear-gradient(135deg, var(--primaryGhost) 0%, rgba(255, 255, 255, 0.06) 100%);
          border: 1px solid var(--primaryGhost); color: var(--primary); opacity: 0.7;
          display: flex; align-items: center; justify-content: center;
        }
        .empty-message { font-size: 1rem; font-weight: 500; margin: 0; }
      `}</style>
    </>
  );
};
EmptyState.displayName = "EmptyState";

const Cybots = ({
  queryUserId,
  limit = 6,
}: {
  queryUserId: string | null;
  limit?: number;
}) => {
  const {
    loading,
    data: cybots = [],
    error,
    reload,
    clearCache,
  } = useUserData(DataType.CYBOT, queryUserId, limit);
  const [items, setItems] = useState(cybots);

  useEffect(() => {
    setItems(cybots);
  }, [cybots]);

  const handleReload = useCallback(async () => {
    clearCache();
    await reload();
  }, [clearCache, reload]);

  useEffect(() => {
    if (error) toast.error("加载 AI 助手失败，请稍后重试");
  }, [error]);

  if (loading && !items.length) return <LoadingState />;
  if (!loading && !items.length)
    return <EmptyState message="还没有创建任何 AI 助手" />;

  return (
    <div className="cybots-grid">
      {items.map((item) => (
        <AgentBlock key={item.id} item={item} reload={handleReload} />
      ))}
    </div>
  );
};
Cybots.displayName = "Cybots";

const Home = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const currentUser = useAppSelector(selectCurrentUser);
  const currentUserId = useAppSelector(selectUserId);
  const currentSpaceId = useAppSelector(selectCurrentSpaceId);
  const { isLoading: isChatLoading, createNewDialog } = useCreateDialog();
  const [activeTab, setActiveTab] = useState(
    isLoggedIn ? "myAI" : "communityAI"
  );

  useEffect(() => {
    setActiveTab(isLoggedIn ? "myAI" : "communityAI");
  }, [isLoggedIn]);

  const handleActionClick = useCallback(
    (action) => {
      if (action.type === "action") action.payload();
      else if (action.type === "navigate") navigate(action.payload);
    },
    [navigate]
  );

  const createNewPage = useCallback(async () => {
    try {
      const pageKey = await dispatch(createPage()).unwrap();
      navigate(`/${pageKey}?edit=true`);
    } catch (error) {
      console.error("Failed to create page:", error);
      toast.error("创建笔记失败，请重试");
    }
  }, [dispatch, navigate]);

  const startQuickChat = useCallback(async () => {
    if (isChatLoading) return;
    try {
      await createNewDialog({
        agents: ["cybot-pub-01JYRSTM0MPPGQC9S25S3Y9J20"],
      });
    } catch (error) {
      toast.error("创建聊天失败，请重试");
    }
  }, [isChatLoading, createNewDialog]);

  const actions = [
    {
      id: "quick-chat",
      text: "立即聊天",
      icon: <CommentDiscussionIcon size={24} />,
      description: "与AI助手开始对话，获得即时帮助",
      type: "action",
      payload: startQuickChat,
      accent: true,
    },
    {
      id: "create-ai",
      text: "创建 AI 助手",
      icon: <CopilotIcon size={24} />,
      description: "智能对话，定制专属AI工作伙伴",
      type: "navigate",
      payload: `/${CreateRoutePaths.CREATE_CYBOT}`,
    },
    {
      id: "create-note",
      text: "创建笔记",
      icon: <PencilIcon size={24} />,
      description: "记录想法，构建知识体系",
      type: "action",
      payload: createNewPage,
    },
    {
      id: "pricing-help",
      text: "价格与帮助",
      icon: <BookIcon size={24} />,
      description: "查看计费详情和使用指南",
      type: "mixed",
      subActions: [
        {
          text: "计费详情",
          icon: <FiDollarSign size={14} />,
          type: "navigate",
          payload: "/pricing",
        },
        {
          text: "使用指南",
          icon: <BookIcon size={14} />,
          type: "navigate",
          payload:
            "/page-0e95801d90-01JRDMA6Q85PQDCEAC7EXHWF67?spaceId=01JRDM39VSNYD1PKS4B53W6BGE",
        },
      ],
    },
  ];

  const tabsConfig = [
    ...(isLoggedIn
      ? [
          {
            id: "myAI",
            label: "我的工作台",
            icon: <CopilotIcon size={20} />,
            component: <Cybots queryUserId={currentUserId} limit={6} />,
          },
        ]
      : []),
    {
      id: "communityAI",
      label: "AI 广场",
      icon: <GlobeIcon size={20} />,
      component: <PubCybots limit={6} />,
    },
  ];

  const tabItemsForNav: TabItem[] = tabsConfig.map(({ id, label, icon }) => ({
    id,
    label,
    icon,
  }));
  const currentTabContent = tabsConfig.find(
    (tab) => tab.id === activeTab
  )?.component;

  return (
    <>
      <div className="home-layout">
        <main className="home-container">
          {isLoggedIn && currentUser ? (
            <section className="guide-section">
              <div className="hero-actions">
                {actions.map((action) => (
                  <div
                    key={action.id}
                    className={`hero-action ${action.accent ? "accent" : ""}`}
                    onClick={
                      action.type === "mixed"
                        ? undefined
                        : () => handleActionClick(action)
                    }
                    style={{
                      cursor: action.type === "mixed" ? "default" : "pointer",
                    }}
                  >
                    <div className="hero-header">
                      <div className="hero-icon-container">{action.icon}</div>
                      <h3 className="hero-title">
                        {action.id === "quick-chat" && isChatLoading
                          ? "正在启动..."
                          : action.text}
                      </h3>
                    </div>
                    <div className="hero-content">
                      <p className="hero-description">{action.description}</p>
                      {action.type === "mixed" && action.subActions && (
                        <div className="sub-actions">
                          {action.subActions.map((subAction, index) => (
                            <NavLink
                              key={index}
                              to={subAction.payload}
                              className="sub-action"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {subAction.icon}
                              <span>{subAction.text}</span>
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <WelcomeSection />
          )}

          <section className="ai-showcase">
            <header className="section-header">
              <Tabs
                items={tabItemsForNav}
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
                  className="explore-link"
                >
                  <span>查看全部</span>
                  <ChevronRightIcon size={16} />
                </NavLink>
              )}
            </header>
            <div className="ai-content">{currentTabContent}</div>
          </section>
        </main>
      </div>

      <style href="home" precedence="high">{`
        .home-layout { min-height: 100vh; background: linear-gradient(180deg, var(--backgroundSecondary) 0%, var(--background) 40%); }
        .home-container { max-width: min(1200px, calc(100vw - var(--space-8))); margin: 0 auto; padding: var(--space-8) var(--space-4) var(--space-12); }
        .guide-section { margin-bottom: var(--space-10); opacity: 0; animation: sectionFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes sectionFadeIn { 0% { opacity: 0; transform: translateY(32px); } 100% { opacity: 1; transform: translateY(0); } }
        .hero-actions { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4); margin-bottom: var(--space-8); }
        .hero-action {
          background: var(--background); border: 1px solid var(--border); border-radius: 20px; padding: var(--space-5) var(--space-4);
          display: flex; flex-direction: column; gap: var(--space-3); text-align: left; cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); position: relative; overflow: hidden;
          box-shadow: 0 1px 3px var(--shadowLight); min-height: 120px;
        }
        .hero-action:hover { transform: translateY(-4px); border-color: var(--primaryGhost); box-shadow: 0 12px 24px -6px var(--shadowMedium); }
        .hero-action.accent { background: linear-gradient(135deg, var(--primaryGhost) 0%, var(--background) 70%); border-color: var(--primaryGhost); }
        .hero-action[disabled] { opacity: 0.7; cursor: not-allowed; transform: none !important; }
        .hero-header { display: flex; align-items: center; gap: var(--space-3); }
        .hero-icon-container {
          width: 44px; height: 44px; border-radius: 14px;
          background: linear-gradient(135deg, var(--primaryGhost) 0%, rgba(255, 255, 255, 0.1) 100%);
          border: 1px solid var(--primaryGhost); color: var(--primary); flex-shrink: 0; display: flex;
          align-items: center; justify-content: center; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hero-action:hover .hero-icon-container { background: var(--primary); color: var(--background); transform: scale(1.05); }
        .hero-action[disabled]:hover .hero-icon-container { transform: none; background: linear-gradient(135deg, var(--primaryGhost) 0%, rgba(255, 255, 255, 0.1) 100%); color: var(--primary); }
        .hero-title { font-size: 1.125rem; font-weight: 650; color: var(--text); margin: 0; line-height: 1.2; flex: 1; }
        .hero-content { display: flex; flex-direction: column; gap: var(--space-2); flex: 1; }
        .hero-description { font-size: 0.85rem; color: var(--textSecondary); margin: 0; line-height: 1.4; flex: 1; }
        .sub-actions { display: flex; gap: var(--space-2); margin-top: auto; }
        .sub-action {
          display: inline-flex; align-items: center; gap: var(--space-1); padding: var(--space-2) var(--space-3);
          background: var(--backgroundSecondary); border: 1px solid var(--borderLight); border-radius: 10px;
          font-size: 0.75rem; font-weight: 520; color: var(--textSecondary); text-decoration: none;
          transition: all 0.25s ease; cursor: pointer; flex: 1; justify-content: center;
        }
        .sub-action:hover { color: var(--primary); background: var(--background); border-color: var(--primaryGhost); }
        .ai-showcase { opacity: 0; animation: showcaseEntry 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 0.4s; }
        @keyframes showcaseEntry { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); flex-wrap: wrap; gap: var(--space-4); }
        .explore-link {
          display: inline-flex; align-items: center; gap: var(--space-2); color: var(--textSecondary); text-decoration: none;
          font-weight: 520; font-size: 0.875rem; padding: var(--space-2) var(--space-3); border-radius: 12px;
          border: 1px solid var(--borderLight); background: var(--backgroundSecondary); transition: all 0.3s ease; white-space: nowrap;
        }
        .explore-link:hover { color: var(--primary); background: var(--backgroundHover); border-color: var(--primaryGhost); transform: translateX(2px); }
        .ai-content { padding: var(--space-6) 0; }
        .cybots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-5); width: 100%; }
        
        @media (max-width: 768px) {
          .home-container { max-width: calc(100vw - var(--space-4)); padding: var(--space-5) var(--space-3) var(--space-8); }
          .hero-actions { grid-template-columns: 1fr; gap: var(--space-3); margin-bottom: var(--space-6); }
          .hero-action { padding: var(--space-4) var(--space-3); border-radius: 18px; min-height: auto; }
          .hero-icon-container { width: 40px; height: 40px; border-radius: 12px; }
          .hero-title { font-size: 1rem; }
          .hero-description { font-size: 0.8rem; }
          .sub-action { font-size: 0.7rem; padding: var(--space-1) var(--space-2); }
          .section-header { flex-direction: column; align-items: stretch; gap: var(--space-3); margin-bottom: var(--space-5); }
          .explore-link { align-self: center; font-size: 0.8rem; padding: var(--space-2) var(--space-4); }
          .cybots-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: var(--space-3); }
        }
        @media (max-width: 480px) {
          .home-container { padding: var(--space-4) var(--space-2) var(--space-6); }
          .hero-actions { gap: var(--space-2); }
          .hero-action { padding: var(--space-3); gap: var(--space-2); min-height: 100px; }
          .hero-header { gap: var(--space-2); }
          .hero-icon-container { width: 36px; height: 36px; border-radius: 10px; }
          .hero-title { font-size: 0.95rem; font-weight: 600; }
          .hero-description { font-size: 0.75rem; }
          .sub-actions { gap: var(--space-1); }
          .sub-action { font-size: 0.65rem; padding: var(--space-1) var(--space-2); gap: 2px; }
          .cybots-grid { grid-template-columns: 1fr; gap: var(--space-2); }
        }
      `}</style>
    </>
  );
};

export default Home;
