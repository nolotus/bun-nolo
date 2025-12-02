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
  LuSparkles,
} from "react-icons/lu";
import WelcomeSection from "./WelcomeSection";
import AgentBlock from "ai/agent/web/AgentBlock";
import Tabs, { TabItem } from "render/web/ui/Tabs";
import PublicAgents from "ai/agent/web/PublicAgents";

// 优化的加载骨架屏：更圆润，更淡雅
const LoadingShimmer = () => (
  <div className="cybots-grid">
    {Array.from({ length: 6 }, (_, i) => (
      <div key={i} className="loading-card-container">
        <div className="loading-card" />
      </div>
    ))}
  </div>
);

const EmptyPlaceholder = ({ message }: { message: string }) => (
  <div className="empty-container">
    <div className="empty-icon-wrapper">
      <LuBot size={40} />
    </div>
    <p className="empty-text">{message}</p>
  </div>
);

const CybotList = ({
  queryUserId,
  limit = 9,
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

  useEffect(() => setItems(cybots), [cybots]);
  useEffect(() => {
    if (error) toast.error("加载失败");
  }, [error]);

  const handleReload = useCallback(async () => {
    clearCache();
    await reload();
  }, [clearCache, reload]);

  if (loading && !items.length) return <LoadingShimmer />;
  if (!items.length) return <EmptyPlaceholder message="还没有创建 AI 助手" />;

  return (
    <div className="cybots-grid">
      {items.map((item) => (
        <AgentBlock key={item.id} item={item} reload={handleReload} />
      ))}
    </div>
  );
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

  const actions = [
    {
      id: "quick-chat",
      text: isChatLoading ? "正在启动..." : "立即聊天",
      icon: <LuMessagesSquare size={24} />,
      desc: "与 AI 助手开始对话",
      onClick: startQuickChat,
      span: 2,
      primary: true,
      bgIcon: <LuSparkles />, // 装饰性背景图标
    },
    {
      id: "create-ai",
      text: "创建助手",
      icon: <LuBot size={22} />,
      desc: "定制专属 AI 伙伴",
      onClick: () => navigate(`/${CreateRoutePaths.CREATE_CYBOT}`),
      span: 1,
    },
    {
      id: "create-note",
      text: "创建笔记",
      icon: <LuPencil size={22} />,
      desc: "记录想法与知识",
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
            icon: <LuBot size={18} />,
            component: <CybotList queryUserId={currentUserId} limit={6} />,
          },
        ]
      : []),
    {
      id: "communityAI",
      label: "AI 广场",
      icon: <LuGlobe size={18} />,
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
                    {action.primary && action.bgIcon && (
                      <div className="action-card-bg-icon">{action.bgIcon}</div>
                    )}

                    <div className="action-content">
                      <div className="action-header">
                        <div className="action-icon-wrapper">{action.icon}</div>
                        <h3 className="action-title">{action.text}</h3>
                      </div>
                      <p className="action-desc">{action.desc}</p>
                    </div>

                    {/* 添加微弱的光泽效果，增强拟物感 */}
                    <div className="action-gloss" />
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
                  <LuArrowDown size={18} />
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
        :root {
          --ease-out-smooth: cubic-bezier(0.25, 0.8, 0.25, 1);
          --card-shadow-sm: 0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
          --card-shadow-hover: 0 12px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04);
          --card-radius: 20px;
        }

        .home-layout { min-height: 100vh; background: var(--background); }
        .home-main { 
            max-width: 1120px; 
            margin: 0 auto; 
            padding: var(--space-8) var(--space-6) var(--space-16); 
        }
        
        /* === Welcome / Explore Button === */
        .explore-plaza-container { 
            text-align: center; 
            margin: -20px 0 var(--space-12); 
            opacity: 0; 
            animation: fadeInUp 0.8s var(--ease-out-smooth) 0.6s forwards; 
        }
        
        .explore-plaza-button { 
            display: inline-flex; 
            align-items: center; 
            gap: 8px; 
            padding: 10px 24px; 
            background: var(--background);
            color: var(--textSecondary); 
            border: 1px solid var(--border); 
            border-radius: 9999px; 
            font-size: 0.9rem; 
            font-weight: 500; 
            cursor: pointer; 
            transition: all 0.3s var(--ease-out-smooth); 
            box-shadow: var(--card-shadow-sm);
        }
        
        .explore-plaza-button:hover { 
            color: var(--primary); 
            border-color: var(--primary-alpha-20); 
            box-shadow: var(--card-shadow-hover); 
            transform: translateY(-2px); 
        }
        
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        /* === Action Grid === */
        .actions-section { 
            margin-bottom: var(--space-12); 
            opacity: 0; 
            animation: fadeInUp 0.6s var(--ease-out-smooth) forwards; 
        }
        
        .action-grid { 
            display: grid; 
            grid-template-columns: repeat(3, 1fr); 
            gap: 20px; /* 增加间距产生呼吸感 */
        }
        
        .action-card { 
            position: relative;
            background: var(--background); 
            /* 减少边框，使用阴影塑造层次 */
            border: 1px solid rgba(0,0,0,0.04); 
            border-radius: var(--card-radius); 
            padding: 24px; 
            cursor: pointer; 
            transition: all 0.3s var(--ease-out-smooth); 
            min-height: 120px; 
            box-shadow: var(--card-shadow-sm);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .dark .action-card {
             border-color: rgba(255,255,255,0.08);
             background: rgba(255,255,255,0.02);
        }

        .action-card:hover { 
            transform: translateY(-4px); 
            box-shadow: var(--card-shadow-hover);
        }
        
        /* Primary Card (Quick Chat) - 拟物细节：渐变与微光 */
        .action-card.primary { 
            background: linear-gradient(135deg, var(--background) 0%, var(--primaryGhost) 100%);
            border-color: transparent;
        }
        .action-card.primary::before {
            content: ''; position: absolute; inset: 0; padding: 1px; border-radius: inherit; 
            background: linear-gradient(135deg, rgba(255,255,255,0.4), transparent); 
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); 
            mask-composite: exclude; pointer-events: none; opacity: 0.5;
        }
        
        .action-card-bg-icon {
            position: absolute;
            right: -10px;
            bottom: -20px;
            font-size: 120px;
            opacity: 0.05;
            color: var(--primary);
            pointer-events: none;
            transform: rotate(-10deg);
        }

        .action-card.loading { opacity: 0.7; pointer-events: none; filter: grayscale(0.5); }

        .action-content { position: relative; z-index: 1; }

        .action-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
        
        .action-icon-wrapper { 
            width: 44px; 
            height: 44px; 
            border-radius: 14px; /* Squircle 感觉 */
            background: var(--backgroundSecondary); 
            color: var(--textSecondary); 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            transition: all 0.3s var(--ease-out-smooth); 
            /* 细微内阴影增加质感 */
            box-shadow: inset 0 1px 1px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.03);
        }
        
        .action-card:hover .action-icon-wrapper { 
            background: var(--primary); 
            color: white; 
            transform: scale(1.05) rotate(-3deg);
            box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
        }
        
        .primary .action-icon-wrapper {
            background: var(--primary);
            color: white;
            box-shadow: 0 4px 10px rgba(var(--primary-rgb), 0.25);
        }
        
        .primary:hover .action-icon-wrapper {
             transform: scale(1.1);
             box-shadow: 0 6px 16px rgba(var(--primary-rgb), 0.4);
        }

        .action-title { font-size: 1.05rem; font-weight: 600; color: var(--text); margin: 0; letter-spacing: -0.01em; }
        .action-desc { font-size: 0.85rem; color: var(--textTertiary); margin: 0; line-height: 1.5; font-weight: 400; }
        .action-card:hover .action-desc { color: var(--textSecondary); }

        /* === Content Section === */
        .content-section { opacity: 0; animation: fadeInUp 0.6s var(--ease-out-smooth) 0.1s forwards; }
        
        .content-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 24px; 
            flex-wrap: wrap; 
            gap: 16px; 
        }
        
        .view-all-link { 
            display: flex; 
            align-items: center; 
            gap: 4px; 
            color: var(--textTertiary); 
            text-decoration: none; 
            font-weight: 500; 
            font-size: 0.85rem; 
            padding: 6px 12px;
            border-radius: 8px;
            transition: all 0.2s; 
        }
        .view-all-link:hover { color: var(--primary); background: var(--backgroundSecondary); }
        
        .content-body { padding: 4px 0; /* 防止阴影被截断 */ }
        
        .cybots-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* 更宽的卡片 */
            gap: 24px; /* 更多呼吸感 */
        }
        
        .loading-card-container {
            border-radius: 16px;
            height: 200px;
            background: var(--background);
            border: 1px solid var(--borderLight);
            padding: 20px;
        }
        
        .loading-card { 
            width: 100%;
            height: 100%;
            border-radius: 12px; 
            background: linear-gradient(90deg, var(--backgroundSecondary) 25%, var(--background) 50%, var(--backgroundSecondary) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        
        .empty-container { 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            gap: 16px; 
            min-height: 300px; 
            color: var(--textTertiary); 
            text-align: center;
            background: var(--backgroundSecondary);
            border-radius: var(--card-radius);
            border: 1px dashed var(--border);
        }
        
        .empty-icon-wrapper { 
            width: 72px; 
            height: 72px; 
            border-radius: 24px; 
            background: var(--background); 
            color: var(--textQuaternary); 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: var(--card-shadow-sm);
        }
        
        .empty-text { font-size: 0.95rem; font-weight: 500; margin: 0; }

        @media (max-width: 768px) {
          .home-main { padding: var(--space-4); }
          .action-grid { grid-template-columns: 1fr; gap: 12px; }
          .action-card { grid-column: span 1 !important; min-height: auto; padding: 20px; }
          .action-icon-wrapper { width: 36px; height: 36px; }
          .cybots-grid { grid-template-columns: 1fr; gap: 16px; }
        }
        
        @media (prefers-reduced-motion: reduce) {
            * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </>
  );
};

export default Home;
