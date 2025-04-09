import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import { selectCurrentUserId } from "auth/authSlice";
import { CreateRoutePaths } from "create/routePaths";
// import PubCybots from "ai/cybot/web/PubCybots"; // 不再需要

import React from "react";

//web
import { createPage } from "render/page/pageSlice";

import { useNavigate } from "react-router-dom";
// import Cybots from "ai/cybot/web/Cybots"; // 移除 Cybots 组件的导入
import {
  DependabotIcon, // DependabotIcon 仍然用于按钮
  FileAddedIcon,
  PlusIcon,
  // SearchIcon, // 不再需要
  GearIcon,
} from "@primer/octicons-react";

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useAppSelector(selectTheme);
  // userId 仍然可能在其他地方需要，暂时保留，如果确认不再需要也可移除
  const userId = useAppSelector(selectCurrentUserId);

  const createNewPage = async () => {
    const id = await dispatch(createPage()).unwrap();
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
      icon: <DependabotIcon size={20} />, // 仍然使用
      description: "创建智能对话机器人",
    },
    {
      text: "自定义 Cybot",
      route: `/${CreateRoutePaths.CREATE_CUSTOM_CYBOT}`,
      icon: <GearIcon size={20} />,
      description: "创建自定义模型的机器人",
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
        {/* 可以选择性地移除描述 */}
        {/* <p className="header-description">从这里开始你的创作之旅。</p> */}
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
                    className: "button-icon", // 这个类名在CSS中似乎没有定义，可以考虑移除或添加定义
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

      {/* --- 移除 "我的机器人" section --- */}
      {/*
      <section className="dashboard-section">
        <h2 className="section-title">
          <DependabotIcon size={20} className="section-icon" />
          我的机器人
        </h2>
        <div className="section-content">
          {userId && <Cybots queryUserId={userId} limit={48} />}
        </div>
      </section>
      */}

      <style>{`
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
          margin-bottom: 12px; /* 调整底部间距，因为描述可能已移除 */
          letter-spacing: -0.02em;
        }

        /* 移除了 header-description 样式，如果不需要 */

        .dashboard-section {
          margin-bottom: 2.5rem;
          /* 这是最后一个 section 了，可以考虑移除或减少 margin-bottom */
          /* margin-bottom: 0; */
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
          align-items: flex-start; /* 改为 center 可能更好看？ */
          /* align-items: center; */
          padding: clamp(0.875rem, 2vw, 1.25rem);
          background: ${theme.background};
          border-radius: 12px;
          gap: 0.75rem; /* 改为 1rem 试试？ */
          /* gap: 1rem; */
          height: 100%;
          border: 1px solid ${theme.border};
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all 0.2s ease;
        }

        .button-content:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-color: ${theme.borderHover}; /* 添加边框高亮 */
        }

        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px; /* 可以增大到 40px 或 42px */
          /* width: 40px; */
          height: 38px; /* 保持一致或增大 */
          /* height: 40px; */
          border-radius: 8px; /* 可以增大到 10px */
          /* border-radius: 10px; */
          background: ${theme.backgroundTertiary}; /* 或 theme.backgroundSecondary */
          color: ${theme.primary}; /* 让图标颜色更突出 */
          flex-shrink: 0;
          margin-top: 2px; /* 微调垂直对齐 (如果 align-items: flex-start) */
        }

        /* 如果需要定义 .button-icon */
        /*
        .button-icon {
           // 定义图标样式，如果需要的话
        }
        */

        .button-text {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.3rem; /* 减少标题和描述间距 */
        }

        .button-title {
          font-size: 1rem; /* 稍微增大标题字号 */
          font-weight: 600;
          color: ${theme.text};
        }

        .button-description {
          font-size: 0.875rem; /* 稍微增大描述字号 */
          color: ${theme.textSecondary}; /* 使用次要文本颜色 */
          line-height: 1.4; /* 调整行高 */
        }

        /* .section-content 规则不再需要特定样式 */
        /*
        .section-content {
          // 不添加额外的样式，让内部组件保持原有的样式
        }
        */

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
            grid-template-columns: 1fr; /* 小屏幕单列 */
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
