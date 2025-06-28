import React, { useState, useEffect, useCallback, memo } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { selectTheme } from "../theme/themeSlice";
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
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

// Components
import WelcomeSection from "./WelcomeSection";
import AgentBlock from "ai/llm/web/AgentBlock";
import PubCybots from "ai/cybot/web/PubCybots";

const LoadingState = memo(() => (
  <div className="cybots-grid">
    {Array.from({ length: 6 }, (_, i) => (
      <div
        key={i}
        className="skeleton-card"
        style={{ animationDelay: `${i * 0.1}s` }}
      />
    ))}
  </div>
));
LoadingState.displayName = "LoadingState";

const EmptyState = memo(({ message }: { message: string }) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <CopilotIcon size={48} />
      </div>
      <p className="empty-message">{message}</p>
    </div>
  );
});
EmptyState.displayName = "EmptyState";

interface CybotsProps {
  queryUserId: string;
  limit?: number;
}

const Cybots = memo(({ queryUserId, limit = 6 }: CybotsProps) => {
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
    if (error) {
      toast.error("加载 AI 助手失败，请稍后重试");
    }
  }, [error]);

  if (loading && !items.length) {
    return <LoadingState />;
  }

  if (!loading && !items.length) {
    return <EmptyState message="还没有创建任何 AI 助手" />;
  }

  return (
    <div className="cybots-grid">
      {items.map((item) => (
        <AgentBlock key={item.id} item={item} reload={handleReload} />
      ))}
    </div>
  );
});
Cybots.displayName = "Cybots";

const Home = () => {
  const theme = useAppSelector(selectTheme);
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
      if (action.type === "action") {
        action.payload();
      } else if (action.type === "navigate") {
        navigate(action.payload);
      }
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

  const tabs = [
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

  const currentTab = tabs.find((tab) => tab.id === activeTab);

  return (
    <>
      <style href="unified-home" precedence="high">{`
        .home-layout {
          min-height: 100vh;
          background: linear-gradient(180deg, ${theme.backgroundSecondary} 0%, ${theme.background} 40%);
        }

        .home-container {
          max-width: min(1200px, calc(100vw - ${theme.space[8]}));
          margin: 0 auto;
          padding: ${theme.space[8]} ${theme.space[4]} ${theme.space[12]};
        }

        /* 引导区域 */
        .guide-section {
          margin-bottom: ${theme.space[10]};
          opacity: 0;
          animation: sectionFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes sectionFadeIn {
          0% { opacity: 0; transform: translateY(32px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* 主要操作区 - 2x2 紧凑网格布局 */
        .hero-actions {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: ${theme.space[4]};
          margin-bottom: ${theme.space[8]};
        }

        .hero-action {
          background: ${theme.background};
          border: 1px solid ${theme.border};
          border-radius: 20px;
          padding: ${theme.space[5]} ${theme.space[4]};
          display: flex;
          flex-direction: column;
          gap: ${theme.space[3]};
          text-align: left;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 3px ${theme.shadow1};
          min-height: 120px;
        }

        .hero-action:hover {
          transform: translateY(-4px);
          border-color: ${theme.primary}30;
          box-shadow: 0 12px 24px -6px ${theme.shadow2};
        }

        .hero-action.accent {
          background: linear-gradient(135deg, ${theme.primary}08 0%, ${theme.background} 70%);
          border-color: ${theme.primary}20;
        }

        .hero-action[disabled] {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none !important;
        }

        /* 标题栏 - 图标和标题在同一行 */
        .hero-header {
          display: flex;
          align-items: center;
          gap: ${theme.space[3]};
        }

        .hero-icon-container {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: linear-gradient(135deg, ${theme.primary}15 0%, ${theme.primary}10 100%);
          border: 1px solid ${theme.primary}20;
          color: ${theme.primary};
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hero-action:hover .hero-icon-container {
          background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary}90 100%);
          color: white;
          transform: scale(1.05);
        }

        .hero-action[disabled]:hover .hero-icon-container {
          transform: none;
          background: linear-gradient(135deg, ${theme.primary}15 0%, ${theme.primary}10 100%);
          color: ${theme.primary};
        }

        .hero-title {
          font-size: 1.125rem;
          font-weight: 650;
          color: ${theme.text};
          margin: 0;
          line-height: 1.2;
          flex: 1;
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[2]};
          flex: 1;
        }

        .hero-description {
          font-size: 0.85rem;
          color: ${theme.textSecondary};
          margin: 0;
          line-height: 1.4;
          flex: 1;
        }

        /* 混合类型操作的子按钮 */
        .sub-actions {
          display: flex;
          gap: ${theme.space[2]};
          margin-top: auto;
        }

        .sub-action {
          display: inline-flex;
          align-items: center;
          gap: ${theme.space[1]};
          padding: ${theme.space[2]} ${theme.space[3]};
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.borderLight};
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 520;
          color: ${theme.textSecondary};
          text-decoration: none;
          transition: all 0.25s ease;
          cursor: pointer;
          flex: 1;
          justify-content: center;
        }

        .sub-action:hover {
          color: ${theme.primary};
          background: ${theme.background};
          border-color: ${theme.primary}25;
        }

        /* AI展示区域 */
        .ai-showcase {
          opacity: 0;
          animation: showcaseEntry 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.4s;
        }

        @keyframes showcaseEntry {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: ${theme.space[6]};
        }

        .tabs-container {
          display: flex;
          align-items: center;
          gap: ${theme.space[4]};
        }

        .tabs-navigator {
          display: flex;
          align-items: center;
          gap: ${theme.space[1]};
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.borderLight};
          border-radius: 16px;
          padding: ${theme.space[1]};
          box-shadow: 0 2px 6px ${theme.shadow1};
        }

        .tab-item {
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
          padding: ${theme.space[3]} ${theme.space[4]};
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 520;
          color: ${theme.textSecondary};
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          min-width: 120px;
          justify-content: center;
          white-space: nowrap;
        }

        .tab-item:hover {
          color: ${theme.primary};
          background: ${theme.background}60;
        }

        .tab-item.active {
          color: ${theme.primary};
          background: ${theme.background};
          font-weight: 600;
          box-shadow: 0 2px 8px ${theme.shadow1};
        }

        .explore-link {
          display: inline-flex;
          align-items: center;
          gap: ${theme.space[2]};
          color: ${theme.textSecondary};
          text-decoration: none;
          font-weight: 520;
          font-size: 0.875rem;
          padding: ${theme.space[3]} ${theme.space[4]};
          border-radius: 12px;
          border: 1px solid ${theme.borderLight};
          background: ${theme.backgroundSecondary};
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .explore-link:hover {
          color: ${theme.primary};
          background: ${theme.background};
          border-color: ${theme.primary}25;
          transform: translateX(2px);
        }

        /* 内容区域 */
        .ai-content {
          padding: ${theme.space[6]} 0;
        }

        /* Cybots 网格 */
        .cybots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: ${theme.space[5]};
          width: 100%;
        }

        /* 空状态 */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: ${theme.space[4]};
          min-height: 280px;
          color: ${theme.textTertiary};
          text-align: center;
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          border-radius: 24px;
          background: linear-gradient(135deg, ${theme.primary}12 0%, ${theme.primary}06 100%);
          border: 1px solid ${theme.primary}20;
          color: ${theme.primary}70;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-message {
          font-size: 1rem;
          font-weight: 500;
          margin: 0;
        }

        /* 骨架屏 */
        .skeleton-card {
          background: ${theme.backgroundSecondary};
          border-radius: 16px;
          height: 280px;
          animation: skeletonPulse 2s ease-in-out infinite;
        }

        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .home-container {
            max-width: calc(100vw - ${theme.space[4]});
            padding: ${theme.space[5]} ${theme.space[3]} ${theme.space[8]};
          }
          
          .hero-actions {
            grid-template-columns: 1fr;
            gap: ${theme.space[3]};
            margin-bottom: ${theme.space[6]};
          }

          .hero-action {
            padding: ${theme.space[4]} ${theme.space[3]};
            border-radius: 18px;
            min-height: auto;
          }

          .hero-icon-container {
            width: 40px;
            height: 40px;
            border-radius: 12px;
          }

          .hero-title {
            font-size: 1rem;
          }

          .hero-description {
            font-size: 0.8rem;
          }

          .sub-action {
            font-size: 0.7rem;
            padding: ${theme.space[1]} ${theme.space[2]};
          }

          .section-header {
            flex-direction: column;
            align-items: stretch;
            gap: ${theme.space[3]};
            margin-bottom: ${theme.space[5]};
          }

          .tabs-container {
            flex-direction: column;
            gap: ${theme.space[3]};
          }

          .tabs-navigator {
            width: 100%;
            justify-content: center;
          }

          .tab-item {
            padding: ${theme.space[2]} ${theme.space[3]};
            font-size: 0.8rem;
            min-width: auto;
            flex: 1;
            gap: ${theme.space[1]};
          }

          .explore-link {
            align-self: center;
            font-size: 0.8rem;
            padding: ${theme.space[2]} ${theme.space[4]};
          }

          .cybots-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: ${theme.space[3]};
          }
        }

        @media (max-width: 480px) {
          .home-container {
            padding: ${theme.space[4]} ${theme.space[2]} ${theme.space[6]};
          }

          .hero-actions {
            gap: ${theme.space[2]};
          }

          .hero-action {
            padding: ${theme.space[3]} ${theme.space[3]};
            gap: ${theme.space[2]};
            min-height: 100px;
          }

          .hero-header {
            gap: ${theme.space[2]};
          }

          .hero-icon-container {
            width: 36px;
            height: 36px;
            border-radius: 10px;
          }

          .hero-title {
            font-size: 0.95rem;
            font-weight: 600;
          }

          .hero-description {
            font-size: 0.75rem;
          }

          .sub-actions {
            gap: ${theme.space[1]};
          }

          .sub-action {
            font-size: 0.65rem;
            padding: ${theme.space[1]} ${theme.space[2]};
            gap: 2px;
          }

          .cybots-grid {
            grid-template-columns: 1fr;
            gap: ${theme.space[2]};
          }

          .empty-state {
            min-height: 200px;
            gap: ${theme.space[3]};
          }
        }
      `}</style>

      <div className="home-layout">
        <main className="home-container">
          {/* 引导区域 */}
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

          {/* AI展示区域 */}
          <section className="ai-showcase">
            <header className="section-header">
              <div className="tabs-container">
                <nav className="tabs-navigator">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>

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
              </div>
            </header>

            <div className="ai-content">{currentTab?.component}</div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Home;
