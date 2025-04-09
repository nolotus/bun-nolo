// GuideSection.tsx
import React from "react";
import { useAppDispatch, useAppSelector } from "../hooks"; // 确保路径正确
import { selectTheme } from "../theme/themeSlice"; // 确保路径正确
import { selectCurrentUserId } from "../../auth/authSlice"; // 确保路径正确
import { CreateRoutePaths } from "create/routePaths"; // 导入路由路径
import { createPage } from "render/page/pageSlice"; // 导入 createPage action
import { useNavigate } from "react-router-dom"; // 导入 useNavigate
import Cybots from "ai/cybot/web/Cybots"; // 确保路径正确
import {
  // --- Icons for original content ---
  LightBulbIcon,
  BookIcon,
  RocketIcon,
  PeopleIcon,
  // --- Icons for added/shared content ---
  DependabotIcon,
  ArrowRightIcon,
  FileAddedIcon,
  PlusIcon,
  GearIcon,
} from "@primer/octicons-react";
import { NavLink } from "react-router-dom";

const GuideSection = () => {
  const theme = useAppSelector(selectTheme);
  const currentUserId = useAppSelector(selectCurrentUserId);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // --- Quick Create Button Logic ---
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
      icon: <DependabotIcon size={20} />,
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
  // --- End Quick Create Button Logic ---

  return (
    // 使用容器，但不强制背景色
    <section className="guide-section-container fade-in">
      {/* --- 主标题和副标题 --- */}
      <div className="guide-header">
        <h2 className="guide-title">
          <LightBulbIcon size={24} className="guide-title-icon" />
          欢迎回来！
        </h2>
        <p className="guide-subtitle">
          选择一个选项快速开始，探索 Cybot 的功能，或管理你已有的机器人。
        </p>
      </div>

      {/* --- 快速创建按钮区域 --- */}
      <div className="quick-create-section section-block">
        <h3 className="section-subtitle quick-create-title">
          <PlusIcon size={20} className="subtitle-icon" />
          快速开始
        </h3>
        <div className="button-grid">
          {buttonsInfo.map((button) => (
            <button
              key={button.text}
              className="grid-button"
              onClick={() => handleButtonClick(button)}
            >
              <div className="button-content">
                <div className="icon-container">
                  {React.cloneElement(button.icon as React.ReactElement)}
                </div>
                <div className="button-text">
                  <div className="button-title">{button.text}</div>
                  <div className="button-description">{button.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* --- 快速创建按钮区域结束 --- */}

      {/* --- 恢复：核心功能展示区 --- */}
      <div className="feature-section section-block">
        <h3 className="section-subtitle">
          {/* 可以选择性地加个图标 */}
          核心功能
        </h3>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <RocketIcon size={24} />
            </div>
            <h3>创建cybot</h3>
            <p>将你的提示词、大模型、相关工具组合创建为一个 Cybot。</p>
            <NavLink to="/create" className="action-button">
              前往创建
            </NavLink>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <BookIcon size={24} />
            </div>
            <h3>资料管理</h3>
            <p>Cybot 可以根据对话上下文，手动或自动使用相关资料。</p>
            <NavLink to="/knowledge-base" className="action-button">
              管理资料
            </NavLink>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <PeopleIcon size={24} />
            </div>
            <h3>文档中心</h3>
            <p>在这里查看如何更好地使用 Cybot 的各项功能。</p>
            <NavLink to="/space/xx" className="action-button">
              查看文档
            </NavLink>
          </div>
        </div>
      </div>
      {/* --- 核心功能展示区结束 --- */}

      {/* --- 恢复：快速上手指南 --- */}
      <div className="quick-start-section section-block">
        <h3 className="section-subtitle">快速上手</h3>
        <div className="steps">
          <div className="step">
            <span className="step-number">1</span>
            <p>创建 AI 助手，设定任务背景和选择基础模型。</p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <p>上传知识库文档（可选），让 AI 回复更精准。</p>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <p>
              开始对话或分享你的 Cybot！需要切换账户？点击
              <NavLink to="/login" className="auth-link">
                登录
              </NavLink>
              /
              <NavLink to="/signup" className="auth-link">
                注册
              </NavLink>
              。
            </p>
          </div>
        </div>
      </div>
      {/* --- 快速上手指南结束 --- */}

      {/* --- 我的 Cybots 板块 (保持不变) --- */}
      {currentUserId && (
        <div className="my-cybots-section section-block">
          <h3 className="section-subtitle">
            <DependabotIcon size={20} className="subtitle-icon" />
            我的 Cybots
          </h3>
          <Cybots queryUserId={currentUserId} limit={6} />
          <div className="view-all-container">
            <NavLink to="/cybots" className="view-all-link">
              <span>查看全部</span>
              <ArrowRightIcon size={16} />
            </NavLink>
          </div>
        </div>
      )}
      {/* --- 我的 Cybots 板块结束 --- */}

      {/* --- 样式 --- */}
      <style>{`
        /* --- 基础和动画 --- */
        .fade-in {
          opacity: 0;
          animation: fadeInUp 0.6s ease forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .guide-section-container {
          margin: 1.5rem auto;
          max-width: 1200px;
          padding: 0 1rem;
        }

        /* --- 页面头部 --- */
        .guide-header {
             text-align: center;
             margin-bottom: 3rem;
        }
        .guide-title {
          font-size: 2rem;
          color: ${theme.text};
          margin-bottom: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
           font-weight: 600;
        }
        .guide-title-icon { color: ${theme.primary}; }
        .guide-subtitle {
          color: ${theme.textSecondary};
          margin-bottom: 0; /* 由 guide-header 控制底部间距 */
          max-width: 650px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
          font-size: 1rem;
        }

        /* --- 通用 Section 块样式 --- */
         .section-block {
            margin-bottom: 3.5rem; /* 统一块间距 */
            padding: 1.5rem; /* 给每个块一些内边距 */
            background: ${theme.backgroundSecondary}; /* 使用次要背景色 */
            border-radius: 16px; /* 圆角 */
            border: 1px solid ${theme.borderLight};
         }
         .section-block:last-child {
             margin-bottom: 0; /* 最后一个块无下外边距 */
         }


        /* --- 通用 Section 副标题 --- */
        .section-subtitle {
          font-size: 1.5rem;
          color: ${theme.text};
          margin-bottom: 1.5rem;
          text-align: left; /* 副标题居左 */
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 600; /* 加粗副标题 */
          padding-bottom: 0.8rem;
          border-bottom: 1px solid ${theme.borderLight};
        }
        .subtitle-icon {
           color: ${theme.primary};
        }
        /* 特定副标题调整 */
         .quick-create-title {
            /* 可以保持居左或改回居中 */
            /* justify-content: center; */
         }


        /* --- 快速创建按钮样式 (从之前合并) --- */
        .button-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* 响应式网格 */
          gap: 1.5rem;
        }
        .grid-button { background: none; border: none; padding: 0; cursor: pointer; width: 100%; text-align: left; transition: transform 0.2s ease; }
        .grid-button:hover { transform: translateY(-3px); }
        .button-content {
            display: flex; align-items: center; padding: 1.25rem;
            background: ${theme.background}; /* 按钮用主背景色，与块背景区分 */
            border-radius: 12px; gap: 1rem; height: 100%;
            border: 1px solid ${theme.border};
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
            transition: all 0.2s ease;
        }
        .button-content:hover {
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
            border-color: ${theme.primary};
            /* background: ${theme.backgroundLight}; */ /* 可选：hover背景变化 */
        }
        .icon-container {
            display: flex; align-items: center; justify-content: center;
            width: 40px; height: 40px; border-radius: 10px;
            background: ${theme.primary + "20"}; color: ${theme.primary};
            flex-shrink: 0;
        }
        .button-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.2rem; }
        .button-title { font-size: 1rem; font-weight: 600; color: ${theme.text}; }
        .button-description { font-size: 0.875rem; color: ${theme.textSecondary}; line-height: 1.4; }


        /* --- 恢复：核心功能卡片样式 --- */
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          /* margin: 2rem 0; // 由 section-block 控制外边距 */
        }
        .feature-card {
          background: ${theme.background}; /* 卡片用主背景色 */
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid ${theme.border};
          display: flex;
          flex-direction: column;
          transition: all 0.2s ease;
        }
         .feature-card:hover {
             transform: translateY(-3px);
             box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
             border-color: ${theme.primary};
         }
        .feature-icon { color: ${theme.primary}; margin-bottom: 1rem; }
        .feature-card h3 { color: ${theme.text}; margin-bottom: 0.5rem; font-size: 1.1rem; font-weight: 600;}
        .feature-card p { color: ${theme.textSecondary}; margin-bottom: 1rem; line-height: 1.5; flex-grow: 1; font-size: 0.9rem;}
        .action-button {
            display: inline-block; background: ${theme.primary}; color: white;
            padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none;
            font-size: 0.9rem; align-self: flex-start; margin-top: auto;
            transition: background-color 0.2s ease;
        }
        .action-button:hover { background-color: ${theme.primaryDark}; }


        /* --- 恢复：快速上手步骤样式 --- */
        .steps {
          display: flex; /* 改为 flex 布局更适合步骤条 */
          flex-direction: column; /* 垂直排列 */
          gap: 1rem;
          /* 如果想横排： */
          /* display: grid; */
          /* grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); */
          /* gap: 1.5rem; */
        }
        .step {
           display: flex;
           align-items: flex-start; /* 图标和文字顶部对齐 */
           gap: 0.8rem;
           background: ${theme.background}; /* 给每个步骤一点背景 */
           padding: 1rem;
           border-radius: 8px;
           border: 1px solid ${theme.border};
        }
        .step-number {
          background: ${theme.primary}; color: white;
          min-width: 24px; /* 使用 min-width */
          height: 24px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; font-weight: 600;
          flex-shrink: 0;
          margin-top: 1px; /* 微调垂直对齐 */
        }
        .step p { color: ${theme.textSecondary}; line-height: 1.5; margin: 0; font-size: 0.9rem;}
        .auth-link {
            color: ${theme.primary}; text-decoration: none; font-weight: 500;
            transition: color 0.2s ease; padding: 0 0.2rem;
            border-bottom: 1px solid transparent; /* 添加下划线空间 */
        }
        .auth-link:hover { color: ${theme.primaryDark}; border-bottom-color: ${theme.primaryDark}; }


        /* --- "我的 Cybots" 板块样式 (保持或微调) --- */
         .my-cybots-section {
             /* 继承 section-block 样式 */
             /* 可以移除 border-top，因为块本身有边框 */
             /* border-top: 1px solid ${theme.borderLight}; */
         }
        /* section-subtitle 样式已在上面统一定义 */
        .view-all-container { text-align: center; margin-top: 1.5rem; }
        .view-all-link {
            display: inline-flex; align-items: center; gap: 0.4rem;
            color: ${theme.primary}; text-decoration: none; font-weight: 500;
            padding: 0.4rem 0.8rem; border-radius: 6px;
            transition: background-color 0.2s ease, color 0.2s ease;
        }
        .view-all-link:hover { background-color: ${theme.backgroundLight}; }


        /* --- 响应式 --- */
        @media (max-width: 768px) {
           .guide-section-container { margin: 1rem auto; padding: 0 0.5rem; }
           .guide-header { margin-bottom: 2rem; }
           .guide-title { font-size: 1.8rem; }
           .guide-subtitle { font-size: 0.95rem; }
           .section-block { padding: 1rem; margin-bottom: 2rem; }
           .section-subtitle { font-size: 1.3rem; margin-bottom: 1rem; padding-bottom: 0.6rem;}
           .button-grid, .feature-grid, .steps { gap: 1rem; } /* 统一间距 */
           .button-content { padding: 1rem; gap: 0.8rem;}
           .feature-card { padding: 1rem; }
           .step { padding: 0.8rem; gap: 0.6rem; }
        }
      `}</style>
    </section>
  );
};

export default GuideSection;
