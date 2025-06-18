import React, { useState, useEffect } from "react";
import { useAppSelector } from "../hooks";
import { selectTheme } from "../theme/themeSlice";
import {
  selectIsLoggedIn,
  selectCurrentUser,
  selectCurrentUserId,
} from "../../auth/authSlice";
import { selectCurrentSpaceId } from "create/space/spaceSlice";
import PubCybots from "ai/cybot/web/PubCybots";
import Cybots from "ai/cybot/web/Cybots";
import WelcomeSection from "./WelcomeSection";
import GuideSection from "./GuideSection";
import { NavLink } from "react-router-dom";
import { FiGlobe, FiChevronRight } from "react-icons/fi";
import { BsRobot } from "react-icons/bs";

const Home = () => {
  const theme = useAppSelector(selectTheme);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const currentUser = useAppSelector(selectCurrentUser);
  const currentUserId = useAppSelector(selectCurrentUserId);
  const currentSpaceId = useAppSelector(selectCurrentSpaceId);

  const [activeTab, setActiveTab] = useState(
    isLoggedIn ? "myAI" : "communityAI"
  );

  useEffect(() => {
    setActiveTab(isLoggedIn ? "myAI" : "communityAI");
  }, [isLoggedIn]);

  return (
    <div className="home-container">
      {isLoggedIn && currentUser ? <GuideSection /> : <WelcomeSection />}

      <section className="cybots-tab-section">
        <div className="tabs-header">
          {/* Tab切换器 */}
          <div className="tab-switcher">
            {isLoggedIn && (
              <button
                className={`tab-button ${activeTab === "myAI" ? "active" : ""}`}
                onClick={() => setActiveTab("myAI")}
              >
                <BsRobot /> 我的 AI
              </button>
            )}
            <button
              className={`tab-button ${activeTab === "communityAI" ? "active" : ""}`}
              onClick={() => setActiveTab("communityAI")}
            >
              <FiGlobe /> 社区 AI
            </button>
          </div>

          {/* 经过优化的“查看全部”链接 */}
          {isLoggedIn && (
            <NavLink
              to={activeTab === "myAI" ? `space/${currentSpaceId}` : "/explore"}
              className="tabs-view-all-link"
            >
              <span>查看全部</span>
              <FiChevronRight size={16} aria-hidden="true" />
            </NavLink>
          )}
        </div>

        {/* Tab内容区 */}
        <div className="tab-content-container" key={activeTab}>
          {activeTab === "myAI" ? (
            <Cybots queryUserId={currentUserId} limit={6} />
          ) : (
            <PubCybots limit={6} />
          )}
        </div>
      </section>

      <style>{`
        .home-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem;
        }

        .cybots-tab-section {
          /* 增加了上边距，提供呼吸感 */
          margin-top: 2rem; 
          opacity: 0;
          animation: fadeIn 0.8s ease forwards;
          animation-delay: 0.1s;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .tabs-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid ${theme.border};
          /* 增加了下边距，让内容区与导航栏有呼吸感 */
          margin-bottom: 1.5rem; 
        }

        .tab-switcher {
          display: flex;
          gap: 0.5rem;
        }

        .tab-button {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem; /* 增加了图标与文字的间距 */
          padding: 0.5rem 0.25rem 0.75rem; /* 调整内边距，使其更像标题 */
          margin: 0 0.75rem; /* 增加了按钮之间的外边距 */
          font-size: 1.1rem; /* 增大字体，更有标题感 */
          font-weight: 500;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: ${theme.textSecondary};
          cursor: pointer;
          transition: all 0.2s ease;
          transform: translateY(1px); 
        }

        .tab-button:first-child {
          margin-left: 0;
        }
        
        .tab-button:hover {
          color: ${theme.text};
        }

        .tab-button.active {
          color: ${theme.primary};
          font-weight: 600; /* 激活时加粗，突出标题地位 */
          border-bottom-color: ${theme.primary};
        }
        
        /* 采用 SectionHeader 链接风格 */
        .tabs-view-all-link {
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
          color: ${theme.textSecondary};
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem;
          padding: 0.4rem 0.9rem;
          border-radius: 8px; /* 圆角更柔和 */
          transition: all 0.2s ease;
        }

        .tabs-view-all-link:hover {
          color: ${theme.primary};
          background-color: ${theme.backgroundLight};
          transform: translateX(2px); /* 借鉴了 SectionHeader 的交互 */
        }
        
        .tabs-view-all-link span {
           transition: color 0.2s ease;
        }

        .tabs-view-all-link:hover span {
          color: ${theme.primary};
        }

        .tab-content-container {
          min-height: 200px;
          animation: tabFadeIn 0.4s ease;
        }

        @keyframes tabFadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
    
        @media (max-width: 768px) {
          .home-container {
            padding: 1rem;
          }
          .cybots-tab-section {
            margin-top: 1.5rem;
          }
          .tab-button {
            font-size: 1rem;
            padding: 0.4rem 0.1rem 0.6rem;
            margin: 0 0.5rem;
          }
          .tabs-view-all-link {
            font-size: 0.85rem;
            padding: 0.3rem 0.7rem;
          }
        }
        
        @media (max-width: 480px) {
          .tabs-view-all-link {
            display: none; /* 在最小屏幕上隐藏，保持界面整洁 */
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
