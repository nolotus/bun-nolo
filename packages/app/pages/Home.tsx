import React, { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { selectTheme } from "../theme/themeSlice";
import {
  selectIsLoggedIn,
  selectCurrentUser,
  selectUserId,
} from "../../auth/authSlice";
import { selectCurrentSpaceId } from "create/space/spaceSlice";
import { CreateRoutePaths } from "create/routePaths";
import PubCybots from "ai/cybot/web/PubCybots";
import Cybots from "ai/cybot/web/Cybots";
import WelcomeSection from "./WelcomeSection";
import { NavLink, useNavigate } from "react-router-dom";
import { createPage } from "render/page/pageSlice";
import {
  GlobeIcon,
  ChevronRightIcon,
  CreditCardIcon,
  PlusIcon,
  GearIcon,
  BookIcon,
  CopilotIcon,
} from "@primer/octicons-react";
import { FiDollarSign } from "react-icons/fi";

const Home = () => {
  const theme = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const currentUser = useAppSelector(selectCurrentUser);
  const currentUserId = useAppSelector(selectUserId);
  const currentSpaceId = useAppSelector(selectCurrentSpaceId);

  const [activeTab, setActiveTab] = useState(
    isLoggedIn ? "myAI" : "communityAI"
  );

  useEffect(() => {
    setActiveTab(isLoggedIn ? "myAI" : "communityAI");
  }, [isLoggedIn]);

  // Guide Section 逻辑
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
    }
  }, [dispatch, navigate]);

  // 主要操作 - 高频核心功能
  const primaryActions = [
    {
      id: "create-ai",
      text: "创建 AI 助手",
      icon: <CopilotIcon size={28} />,
      description: "智能对话，定制专属AI工作伙伴",
      type: "navigate",
      payload: `/${CreateRoutePaths.CREATE_CYBOT}`,
      accent: true,
      gradient: "ai",
    },
    {
      id: "new-note",
      text: "创建笔记",
      icon: <PlusIcon size={28} />,
      description: "记录想法，构建知识体系",
      type: "action",
      payload: createNewPage,
      gradient: "note",
    },
  ];

  // 次要操作 - 支持功能
  const secondaryActions = [
    {
      id: "guide",
      text: "使用指南",
      icon: <BookIcon size={18} />,
      type: "navigate",
      payload:
        "/page-0e95801d90-01JRDMA6Q85PQDCEAC7EXHWF67?spaceId=01JRDM39VSNYD1PKS4B53W6BGE",
      priority: "high",
    },
    {
      id: "custom-ai",
      text: "高级定制",
      icon: <GearIcon size={18} />,
      type: "navigate",
      payload: `/${CreateRoutePaths.CREATE_CUSTOM_CYBOT}`,
      priority: "medium",
    },
    {
      id: "recharge",
      text: "账户充值",
      icon: <CreditCardIcon size={18} />,
      type: "navigate",
      payload: "/recharge",
      priority: "medium",
    },
    {
      id: "pricing",
      text: "计费详情",
      icon: <FiDollarSign size={18} />,
      type: "navigate",
      payload: "/pricing",
      priority: "low",
    },
  ];

  // 标签页配置
  const tabs = [
    ...(isLoggedIn
      ? [
          {
            id: "myAI",
            label: "我的工作台",
            icon: <CopilotIcon size={20} />,
            description: "专属AI助手",
            component: <Cybots queryUserId={currentUserId} limit={6} />,
          },
        ]
      : []),
    {
      id: "communityAI",
      label: "AI 广场",
      icon: <GlobeIcon size={20} />,
      description: "发现优质AI",
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
          max-width: min(1200px, calc(100vw - ${theme.space[6]}));
          margin: 0 auto;
          padding: ${theme.space[6]} ${theme.space[4]} ${theme.space[10]};
        }

        /* ======================
           集成 Guide Section 样式
           ====================== */
        .guide-section {
          margin: 0 auto ${theme.space[10]};
          opacity: 0;
          animation: orchestratedEntry 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }

        @keyframes orchestratedEntry {
          0% { 
            opacity: 0; 
            transform: translateY(32px) scale(0.95);
            filter: blur(4px);
          }
          60% {
            opacity: 0.8;
            transform: translateY(8px) scale(0.98);
            filter: blur(1px);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        /* 主要操作区 - 英雄级操作 */
        .hero-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: ${theme.space[6]};
          margin-bottom: ${theme.space[10]};
        }

        .hero-action {
          background: ${theme.background};
          border: 1px solid ${theme.border};
          border-radius: 24px;
          padding: ${theme.space[8]} ${theme.space[6]};
          display: flex;
          align-items: flex-start;
          gap: ${theme.space[5]};
          text-align: left;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 
            0 1px 3px ${theme.shadow1},
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        /* 渐变背景系统 */
        .hero-action[data-gradient="ai"]::before {
          background: linear-gradient(135deg, ${theme.primary}08 0%, ${theme.primary}04 50%, transparent 100%);
        }

        .hero-action[data-gradient="note"]::before {
          background: linear-gradient(135deg, ${theme.primary}06 0%, ${theme.primary}02 50%, transparent 100%);
        }

        .hero-action::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .hero-action::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${theme.primary}06 0%, transparent 40%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .hero-action:hover::before {
          opacity: 1;
        }

        .hero-action:hover::after {
          opacity: 1;
        }

        .hero-action:hover {
          transform: translateY(-8px) scale(1.015);
          border-color: ${theme.primary}40;
          box-shadow: 
            0 32px 64px -12px ${theme.shadow2},
            0 0 0 1px ${theme.primary}20,
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .hero-action:active {
          transform: translateY(-4px) scale(1.005);
          transition-duration: 0.1s;
        }

        .hero-action.accent {
          background: linear-gradient(135deg, ${theme.primary}05 0%, ${theme.background} 60%);
          border-color: ${theme.primary}20;
        }

        .hero-icon-container {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          background: linear-gradient(135deg, ${theme.primary}15 0%, ${theme.primary}08 100%);
          border: 1px solid ${theme.primary}20;
          color: ${theme.primary};
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          overflow: hidden;
        }

        .hero-icon-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, ${theme.primary}20 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .hero-action:hover .hero-icon-container {
          background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary}85 100%);
          color: white;
          transform: scale(1.1) rotate(3deg);
          box-shadow: 
            0 12px 24px -6px ${theme.primary}50,
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .hero-action:hover .hero-icon-container::before {
          opacity: 1;
        }

        .hero-content {
          flex: 1;
          min-width: 0;
          padding-top: ${theme.space[1]};
        }

        .hero-title {
          font-size: 1.375rem;
          font-weight: 650;
          color: ${theme.text};
          margin: 0 0 ${theme.space[2]};
          line-height: 1.25;
          letter-spacing: -0.02em;
        }

        .hero-description {
          font-size: 0.925rem;
          color: ${theme.textSecondary};
          margin: 0;
          line-height: 1.5;
          letter-spacing: -0.01em;
        }

        /* 次要操作区 - 功能网格 */
        .utility-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: ${theme.space[4]};
        }

        .utility-action {
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.borderLight};
          border-radius: 18px;
          padding: ${theme.space[6]} ${theme.space[4]};
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: ${theme.space[4]};
          font-size: 0.875rem;
          font-weight: 520;
          color: ${theme.textSecondary};
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          overflow: hidden;
        }

        .utility-action[data-priority="high"] {
          order: -2;
          background: ${theme.background};
          border-color: ${theme.border};
        }

        .utility-action[data-priority="medium"] {
          order: -1;
        }

        .utility-action::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, ${theme.primary}08 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .utility-action:hover::before {
          opacity: 1;
        }

        .utility-action:hover {
          background: ${theme.background};
          color: ${theme.primary};
          border-color: ${theme.primary}25;
          transform: translateY(-4px);
          box-shadow: 
            0 16px 32px -8px ${theme.shadow1},
            0 0 0 1px ${theme.primary}15;
        }

        .utility-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: ${theme.primary}12;
          color: ${theme.primary};
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .utility-action:hover .utility-icon-wrapper {
          background: ${theme.primary}20;
          transform: scale(1.2);
        }

        .utility-text {
          font-weight: 520;
          transition: all 0.4s ease;
          text-align: center;
        }

        /* ======================
           AI展示区域样式
           ====================== */
        .content-transition {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, ${theme.border} 50%, transparent 100%);
          margin: ${theme.space[8]} 0;
          opacity: 0.6;
        }

        .ai-showcase {
          opacity: 0;
          animation: showcaseEntry 1s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          animation-delay: 0.5s;
        }

        @keyframes showcaseEntry {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: ${theme.space[8]};
          padding: 0 ${theme.space[2]};
        }

        .section-title-group {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[2]};
        }

        .section-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: ${theme.text};
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .section-subtitle {
          font-size: 0.95rem;
          color: ${theme.textSecondary};
          margin: 0;
          line-height: 1.4;
        }

        .tabs-navigator {
          display: flex;
          align-items: center;
          gap: ${theme.space[1]};
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.borderLight};
          border-radius: 14px;
          padding: ${theme.space[1]};
          box-shadow: 0 1px 3px ${theme.shadow1};
        }

        .tab-item {
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
          padding: ${theme.space[3]} ${theme.space[4]};
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 520;
          color: ${theme.textSecondary};
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          min-width: 120px;
          justify-content: center;
        }

        .tab-item:hover {
          color: ${theme.primary};
          background: ${theme.background}40;
        }

        .tab-item.active {
          color: ${theme.primary};
          background: ${theme.background};
          font-weight: 600;
          box-shadow: 
            0 1px 3px ${theme.shadow1},
            0 0 0 1px ${theme.primary}15;
        }

        .tab-item.active::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, ${theme.primary}08 0%, transparent 50%);
          border-radius: 10px;
        }

        .explore-link {
          display: inline-flex;
          align-items: center;
          gap: ${theme.space[2]};
          color: ${theme.textSecondary};
          text-decoration: none;
          font-weight: 520;
          font-size: 0.9rem;
          padding: ${theme.space[3]} ${theme.space[4]};
          border-radius: 12px;
          border: 1px solid ${theme.borderLight};
          background: ${theme.backgroundSecondary};
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          overflow: hidden;
        }

        .explore-link::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, ${theme.primary}06 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .explore-link:hover::before {
          opacity: 1;
        }

        .explore-link:hover {
          color: ${theme.primary};
          background: ${theme.background};
          border-color: ${theme.primary}30;
          transform: translateX(3px);
          box-shadow: 0 4px 12px ${theme.shadow1};
        }

        .explore-link-icon {
          transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .explore-link:hover .explore-link-icon {
          transform: translateX(2px);
        }

        .content-container {
          background: ${theme.background};
          border: 1px solid ${theme.borderLight};
          border-radius: 20px;
          padding: ${theme.space[8]} ${theme.space[6]};
          box-shadow: 
            0 1px 3px ${theme.shadow1},
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          min-height: 400px;
          position: relative;
          overflow: hidden;
        }

        .content-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, ${theme.primary}20 50%, transparent 100%);
        }

        .tab-content {
          opacity: 0;
          animation: contentFadeIn 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          animation-delay: 0.1s;
        }

        @keyframes contentFadeIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* 响应式设计 */
        @container (max-width: 800px) {
          .hero-actions {
            grid-template-columns: 1fr;
            gap: ${theme.space[5]};
            margin-bottom: ${theme.space[8]};
          }
        }

        @media (max-width: 768px) {
          .home-container {
            padding: ${theme.space[4]} ${theme.space[3]} ${theme.space[8]};
          }
          
          .hero-action {
            padding: ${theme.space[6]} ${theme.space[5]};
          }
          
          .utility-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: ${theme.space[3]};
          }

          .section-header {
            flex-direction: column;
            align-items: stretch;
            gap: ${theme.space[4]};
            margin-bottom: ${theme.space[6]};
          }

          .tabs-navigator {
            order: -1;
          }

          .explore-link {
            align-self: flex-end;
          }

          .content-container {
            padding: ${theme.space[6]} ${theme.space[4]};
          }
        }

        @media (max-width: 480px) {
          .hero-action {
            flex-direction: column;
            text-align: center;
            gap: ${theme.space[5]};
            padding: ${theme.space[6]};
          }

          .hero-content {
            padding-top: 0;
          }
          
          .utility-action {
            padding: ${theme.space[5]} ${theme.space[3]};
          }

          .utility-grid {
            gap: ${theme.space[2]};
          }

          .tab-item {
            min-width: auto;
            flex: 1;
          }

          .explore-link {
            display: none;
          }

          .content-transition {
            margin: ${theme.space[6]} 0;
          }
        }

        /* 性能和可访问性优化 */
        @media (prefers-reduced-motion: reduce) {
          .guide-section,
          .ai-showcase,
          .tab-content,
          .hero-action,
          .utility-action,
          .hero-icon-container,
          .utility-icon-wrapper {
            animation: none !important;
            transition: none !important;
            opacity: 1 !important;
          }
          
          .hero-action:hover,
          .utility-action:hover,
          .explore-link:hover {
            transform: none !important;
          }
        }

        @media (prefers-contrast: high) {
          .hero-action,
          .utility-action,
          .content-container {
            border-width: 2px;
          }
        }
      `}</style>

      <div className="home-layout">
        <main className="home-container">
          {/* 集成的引导区域 */}
          {isLoggedIn && currentUser ? (
            <section className="guide-section">
              {/* 主要操作区 */}
              <div className="hero-actions">
                {primaryActions.map((action) => (
                  <button
                    key={action.id}
                    className={`hero-action ${action.accent ? "accent" : ""}`}
                    data-gradient={action.gradient}
                    onClick={() => handleActionClick(action)}
                    aria-label={`${action.text}: ${action.description}`}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      e.currentTarget.style.setProperty("--mouse-x", `${x}%`);
                      e.currentTarget.style.setProperty("--mouse-y", `${y}%`);
                    }}
                  >
                    <div className="hero-icon-container">{action.icon}</div>
                    <div className="hero-content">
                      <h3 className="hero-title">{action.text}</h3>
                      <p className="hero-description">{action.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* 次要操作区 */}
              <div className="utility-grid">
                {secondaryActions.map((action) => (
                  <button
                    key={action.id}
                    className="utility-action"
                    data-priority={action.priority}
                    onClick={() => handleActionClick(action)}
                    aria-label={action.text}
                  >
                    <div className="utility-icon-wrapper">{action.icon}</div>
                    <span className="utility-text">{action.text}</span>
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <WelcomeSection />
          )}

          {/* 视觉过渡 */}
          <div className="content-transition" aria-hidden="true" />

          {/* AI展示区域 */}
          <section className="ai-showcase">
            <header className="section-header">
              <div className="section-title-group">
                <h2 className="section-title">
                  {isLoggedIn ? "AI 工作空间" : "探索 AI 世界"}
                </h2>
                <p className="section-subtitle">
                  {currentTab?.description || "发现和使用智能助手"}
                </p>
              </div>

              {/* 标签页导航 */}
              <nav className="tabs-navigator" role="tablist">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`tabpanel-${tab.id}`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>

              {/* 查看全部链接 */}
              {isLoggedIn && (
                <NavLink
                  to={
                    activeTab === "myAI"
                      ? `space/${currentSpaceId}`
                      : "/explore"
                  }
                  className="explore-link"
                  aria-label={`查看全部${currentTab?.label}`}
                >
                  <span>查看全部</span>
                  <ChevronRightIcon size={16} className="explore-link-icon" />
                </NavLink>
              )}
            </header>

            {/* 内容区域 */}
            <div className="content-container">
              <div
                className="tab-content"
                role="tabpanel"
                id={`tabpanel-${activeTab}`}
                key={activeTab}
              >
                {currentTab?.component}
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Home;
