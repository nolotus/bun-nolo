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
  CreditCardIcon,
  PlusIcon,
  GearIcon,
  BookIcon,
  CopilotIcon,
  CommentDiscussionIcon,
} from "@primer/octicons-react";
import { FiDollarSign } from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

// Components
import WelcomeSection from "./WelcomeSection";
import AgentBlock from "ai/llm/web/AgentBlock";

import PubCybots from "ai/cybot/web/PubCybots";

// 骨架屏组件
const SkeletonCard = memo(({ index }: { index: number }) => {
  const theme = useAppSelector(selectTheme);

  return (
    <div
      className="skeleton-card"
      style={{
        animationDelay: `${index * 0.1}s`,
      }}
    />
  );
});

SkeletonCard.displayName = "SkeletonCard";

const LoadingState = memo(() => {
  const theme = useAppSelector(selectTheme);

  return (
    <div className="cybots-grid">
      {Array.from({ length: 6 }, (_, i) => (
        <SkeletonCard key={i} index={i} />
      ))}
    </div>
  );
});

LoadingState.displayName = "LoadingState";

const EmptyState = memo(({ message }: { message: string }) => {
  const theme = useAppSelector(selectTheme);

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

// 主组件
const Home = () => {
  const theme = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const currentUser = useAppSelector(selectCurrentUser);
  const currentUserId = useAppSelector(selectUserId);
  const currentSpaceId = useAppSelector(selectCurrentSpaceId);

  // 立即聊天功能
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

  // 立即聊天功能
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

  // 主要操作配置
  const primaryActions = [
    {
      id: "quick-chat",
      text: "立即聊天",
      icon: <CommentDiscussionIcon size={28} />,
      description: "与AI助手开始对话，获得即时帮助",
      type: "action",
      payload: startQuickChat,
      accent: true,
      gradient: "chat",
    },
    {
      id: "create-ai",
      text: "创建 AI 助手",
      icon: <CopilotIcon size={28} />,
      description: "智能对话，定制专属AI工作伙伴",
      type: "navigate",
      payload: `/${CreateRoutePaths.CREATE_CYBOT}`,
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

  // 次要操作配置
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
          max-width: min(1200px, calc(100vw - ${theme.space[8]}));
          margin: 0 auto;
          padding: ${theme.space[8]} ${theme.space[4]} ${theme.space[12]};
          container-type: inline-size;
        }

        /* ======================
           引导区域样式
           ====================== */
        .guide-section {
          margin: 0 auto ${theme.space[12]};
          opacity: 0;
          animation: sectionFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes sectionFadeIn {
          0% { 
            opacity: 0; 
            transform: translateY(40px) scale(0.95);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1);
          }
        }

        /* 主要操作区 */
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
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 
            0 1px 3px ${theme.shadow1},
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .hero-action[data-gradient="chat"]::before {
          background: linear-gradient(135deg, ${theme.primary}15 0%, ${theme.primary}08 50%, transparent 100%);
        }

        .hero-action[data-gradient="ai"]::before {
          background: linear-gradient(135deg, ${theme.primary}10 0%, ${theme.primary}05 50%, transparent 100%);
        }

        .hero-action[data-gradient="note"]::before {
          background: linear-gradient(135deg, ${theme.primary}08 0%, ${theme.primary}03 50%, transparent 100%);
        }

        .hero-action::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .hero-action::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${theme.primary}08 0%, transparent 60%);
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
          transform: translateY(-6px);
          border-color: ${theme.primary}30;
          box-shadow: 
            0 20px 40px -8px ${theme.shadow2},
            0 0 0 1px ${theme.primary}15,
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        .hero-action:active {
          transform: translateY(-2px);
          transition-duration: 0.1s;
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

        .hero-icon-container {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          background: linear-gradient(135deg, ${theme.primary}15 0%, ${theme.primary}10 100%);
          border: 1px solid ${theme.primary}20;
          color: ${theme.primary};
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }

        .hero-icon-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, ${theme.primary}25 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .hero-action:hover .hero-icon-container {
          background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary}90 100%);
          color: white;
          transform: scale(1.08);
          box-shadow: 
            0 8px 20px -4px ${theme.primary}40,
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }

        .hero-action[disabled]:hover .hero-icon-container {
          transform: none;
          background: linear-gradient(135deg, ${theme.primary}15 0%, ${theme.primary}10 100%);
          color: ${theme.primary};
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
          line-height: 1.3;
          letter-spacing: -0.025em;
        }

        .hero-description {
          font-size: 0.95rem;
          color: ${theme.textSecondary};
          margin: 0;
          line-height: 1.5;
          letter-spacing: -0.01em;
        }

        /* 次要操作区 */
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
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
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
          background: radial-gradient(circle at center, ${theme.primary}10 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .utility-action:hover::before {
          opacity: 1;
        }

        .utility-action:hover {
          background: ${theme.background};
          color: ${theme.primary};
          border-color: ${theme.primary}20;
          transform: translateY(-3px);
          box-shadow: 
            0 12px 24px -6px ${theme.shadow1},
            0 0 0 1px ${theme.primary}10;
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
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .utility-action:hover .utility-icon-wrapper {
          background: ${theme.primary}18;
          transform: scale(1.15);
        }

        .utility-text {
          font-weight: 520;
          transition: color 0.3s ease;
          text-align: center;
        }

        /* ======================
           AI展示区域样式
           ====================== */
        .content-transition {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, ${theme.border} 50%, transparent 100%);
          margin: ${theme.space[10]} 0;
          opacity: 0.7;
        }

        .ai-showcase {
          opacity: 0;
          animation: showcaseEntry 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.4s;
        }

        @keyframes showcaseEntry {
          from {
            opacity: 0;
            transform: translateY(32px);
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
          font-size: 1.875rem;
          font-weight: 700;
          color: ${theme.text};
          margin: 0;
          letter-spacing: -0.03em;
          line-height: 1.2;
        }

        .section-subtitle {
          font-size: 1rem;
          color: ${theme.textSecondary};
          margin: 0;
          line-height: 1.4;
          letter-spacing: -0.01em;
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
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          min-width: 120px;
          justify-content: center;
        }

        .tab-item:hover {
          color: ${theme.primary};
          background: ${theme.background}60;
        }

        .tab-item.active {
          color: ${theme.primary};
          background: ${theme.background};
          font-weight: 600;
          box-shadow: 
            0 2px 8px ${theme.shadow1},
            0 0 0 1px ${theme.primary}12;
        }

        .tab-item.active::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, ${theme.primary}08 0%, transparent 50%);
          border-radius: 12px;
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
          border-radius: 14px;
          border: 1px solid ${theme.borderLight};
          background: ${theme.backgroundSecondary};
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }

        .explore-link::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, ${theme.primary}08 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .explore-link:hover::before {
          opacity: 1;
        }

        .explore-link:hover {
          color: ${theme.primary};
          background: ${theme.background};
          border-color: ${theme.primary}25;
          transform: translateX(2px);
          box-shadow: 0 6px 16px ${theme.shadow1};
        }

        .explore-link-icon {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .explore-link:hover .explore-link-icon {
          transform: translateX(3px);
        }

        .content-container {
          background: ${theme.background};
          border-radius: 24px;
          padding: ${theme.space[8]} ${theme.space[6]};
          min-height: 420px;
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
          background: linear-gradient(90deg, transparent 0%, ${theme.primary}25 50%, transparent 100%);
        }

        .tab-content {
          opacity: 0;
          animation: contentFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.1s;
        }

        @keyframes contentFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ======================
           Cybots 相关样式
           ====================== */
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
          opacity: 0.8;
        }

        .empty-message {
          font-size: 1rem;
          font-weight: 500;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .cybots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: ${theme.space[5]};
          width: 100%;
        }

        /* 骨架屏样式 */
        .skeleton-card {
          background: ${theme.backgroundSecondary};
          border-radius: 16px;
          padding: ${theme.space[5]};
          height: 280px;
          position: relative;
          overflow: hidden;
          opacity: 0;
          animation: skeletonFadeIn 0.6s ease forwards, skeletonPulse 2s ease-in-out infinite;
        }

        @keyframes skeletonFadeIn {
          to {
            opacity: 1;
          }
        }

        @keyframes skeletonPulse {
          0%, 100% {
            opacity: 0.8;
          }
          50% {
            opacity: 0.4;
          }
        }

        .skeleton-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            ${theme.background}60 50%,
            transparent 100%
          );
          animation: skeletonShimmer 2s ease-in-out infinite;
        }

        @keyframes skeletonShimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }

        /* ======================
           响应式设计
           ====================== */
        @container (max-width: 800px) {
          .hero-actions {
            grid-template-columns: 1fr;
            gap: ${theme.space[5]};
            margin-bottom: ${theme.space[8]};
          }

          .content-container {
            padding: ${theme.space[6]} ${theme.space[4]};
          }

          .cybots-grid {
            gap: ${theme.space[4]};
          }
        }

        @media (max-width: 768px) {
          .home-container {
            max-width: calc(100vw - ${theme.space[6]});
            padding: ${theme.space[6]} ${theme.space[3]} ${theme.space[10]};
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

          .cybots-grid {
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: ${theme.space[3]};
          }

          .empty-state {
            min-height: 200px;
            padding: ${theme.space[6]} ${theme.space[3]};
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
            font-size: 0.8rem;
          }

          .explore-link {
            display: none;
          }

          .content-transition {
            margin: ${theme.space[6]} 0;
          }

          .cybots-grid {
            grid-template-columns: 1fr;
            gap: ${theme.space[3]};
          }

          .content-container {
            padding: ${theme.space[5]} ${theme.space[3]};
            min-height: 320px;
          }

          .empty-state {
            min-height: 160px;
            gap: ${theme.space[3]};
          }

          .section-title {
            font-size: 1.5rem;
          }

          .section-subtitle {
            font-size: 0.9rem;
          }
        }

        /* ======================
           性能和可访问性优化
           ====================== */
        @media (prefers-reduced-motion: reduce) {
          .guide-section,
          .ai-showcase,
          .tab-content,
          .hero-action,
          .utility-action,
          .hero-icon-container,
          .utility-icon-wrapper,
          .skeleton-card {
            animation: none !important;
            transition-duration: 0.1s !important;
            opacity: 1 !important;
          }
          
          .hero-action:hover,
          .utility-action:hover,
          .explore-link:hover,
          .hero-icon-container,
          .utility-icon-wrapper {
            transform: none !important;
          }
        }

        @media (prefers-contrast: high) {
          .hero-action,
          .utility-action,
          .content-container {
            border-width: 2px;
          }
          
          .empty-state {
            color: ${theme.text};
          }
        }

        /* 焦点可访问性 */
        .hero-action:focus-visible,
        .utility-action:focus-visible,
        .tab-item:focus-visible,
        .explore-link:focus-visible {
          outline: 2px solid ${theme.primary};
          outline-offset: 2px;
        }
      `}</style>

      <div className="home-layout">
        <main className="home-container">
          {/* 引导区域 */}
          {isLoggedIn && currentUser ? (
            <section
              className="guide-section"
              role="region"
              aria-label="快捷操作"
            >
              {/* 主要操作区 */}
              <div className="hero-actions">
                {primaryActions.map((action) => (
                  <button
                    key={action.id}
                    className={`hero-action ${action.accent ? "accent" : ""}`}
                    data-gradient={action.gradient}
                    onClick={() => handleActionClick(action)}
                    disabled={action.id === "quick-chat" && isChatLoading}
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
                      <h3 className="hero-title">
                        {action.id === "quick-chat" && isChatLoading
                          ? "正在启动..."
                          : action.text}
                      </h3>
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

          {/* 视觉过渡分割线 */}
          <div className="content-transition" aria-hidden="true" />

          {/* AI展示区域 */}
          <section
            className="ai-showcase"
            role="region"
            aria-label="AI助手展示"
          >
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
              <nav
                className="tabs-navigator"
                role="tablist"
                aria-label="AI助手分类"
              >
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
                aria-labelledby={`tab-${activeTab}`}
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
