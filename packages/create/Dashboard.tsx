import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import { selectCurrentUserId } from "auth/authSlice";
import { CreateRoutePaths } from "create/routePaths";
import PubCybots from "ai/cybot/web/PubCybots";

import React from "react";

//web
import { createPage } from "render/page/pageSlice";

import { useNavigate } from "react-router-dom";
import Cybots from "ai/cybot/web/Cybots";
import {
  DependabotIcon,
  FileAddedIcon,
  PlusIcon,
  SearchIcon,
} from "@primer/octicons-react";

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useAppSelector(selectTheme);
  const userId = useAppSelector(selectCurrentUserId);

  const createNewPage = async () => {
    const id = await dispatch(createPage()).unwrap();
    console.log("id", id);
    navigate(`/${id}?edit=true`);
  };

  const handleButtonClick = (button) => {
    if (button.action) {
      button.action();
    } else if (button.route) {
      navigate(button.route);
    }
  };

  const buttonsInfo = [
    {
      text: "Cybot",
      route: `/${CreateRoutePaths.CREATE_CYBOT}`,
      icon: <DependabotIcon size={20} />,
      description: "创建智能对话机器人",
    },
    {
      text: "空白页面",
      icon: <FileAddedIcon size={20} />,
      description: "从空白页面开始创作",
      action: createNewPage,
    },
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="header-title">开始创建</h1>
        <p className="header-subtitle">选择合适的工具开始你的创作之旅</p>
      </header>

      <section className="dashboard-section">
        <h2 className="section-title">
          <PlusIcon size={20} className="section-icon" />
          快速创建
        </h2>
        <div className="button-grid">
          {buttonsInfo.map((button) => (
            <button
              key={button.text}
              className="grid-button"
              onClick={() => handleButtonClick(button)}
            >
              <div className="button-content">
                <div className="icon-container">
                  {React.cloneElement(button.icon as React.ReactElement, {
                    className: "button-icon",
                  })}
                </div>
                <div className="button-text">
                  <div className="button-title">{button.text}</div>
                  <div className="button-description">{button.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="section-title">
          <DependabotIcon size={20} className="section-icon" />
          我的机器人
        </h2>
        <div className="section-content">
          {userId && <Cybots queryUserId={userId} limit={48} />}
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="section-title">
          <SearchIcon size={20} className="section-icon" />
          探索社区
        </h2>
        <div className="section-content">
          <PubCybots limit={18} />
        </div>
      </section>

      <style jsx>{`
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .header-title {
          font-size: 32px;
          font-weight: 600;
          color: ${theme.text};
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }

        .header-subtitle {
          font-size: 16px;
          color: ${theme.textSecondary};
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.5;
        }

        .dashboard-section {
          margin-bottom: 2.5rem;
        }

        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: ${theme.text};
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid ${theme.borderLight};
        }

        .section-icon {
          color: ${theme.primary};
        }

        .button-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }

        .grid-button {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: transform 0.2s ease;
        }

        .button-content {
          display: flex;
          align-items: flex-start;
          padding: clamp(0.875rem, 2vw, 1.25rem);
          background: ${theme.background};
          border-radius: 12px;
          gap: 0.75rem;
          height: 100%;
          border: 1px solid ${theme.border};
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all 0.2s ease;
        }

        .button-content:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: ${theme.backgroundTertiary};
          color: ${theme.text};
          flex-shrink: 0;
        }

        .button-text {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .button-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: ${theme.text};
        }

        .button-description {
          font-size: 0.85rem;
          color: ${theme.textTertiary};
          line-height: 1.5;
        }

        .section-content {
          /* 不添加额外的样式，让内部组件保持原有的样式 */
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1.5rem;
          }

          .header-title {
            font-size: 28px;
          }

          .dashboard-section {
            margin-bottom: 2rem;
          }

          .button-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
