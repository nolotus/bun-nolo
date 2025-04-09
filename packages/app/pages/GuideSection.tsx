import React, { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { selectTheme } from "../theme/themeSlice";
import { selectCurrentUserId } from "../../auth/authSlice";
import { CreateRoutePaths } from "create/routePaths";
import { createPage } from "render/page/pageSlice";
import { useNavigate, NavLink } from "react-router-dom";
import Cybots from "ai/cybot/web/Cybots";

// Importing better icons from React Icons
import { FiChevronRight } from "react-icons/fi"; // Arrow right
import { HiOutlineLightBulb, HiOutlineDocumentAdd } from "react-icons/hi"; // Light bulb and Document
import { BsRobot, BsPlusLg } from "react-icons/bs"; // Robot and Plus
import { MdOutlineSettings } from "react-icons/md"; // Settings gear
import { IoDocumentTextOutline } from "react-icons/io5"; // Document for guide

const GuideSection = () => {
  const theme = useAppSelector(selectTheme);
  const currentUserId = useAppSelector(selectCurrentUserId);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const createNewPage = useCallback(async () => {
    try {
      const id = await dispatch(createPage()).unwrap();
      navigate(`/${id}?edit=true`);
    } catch (error) {
      console.error("Failed to create page:", error);
    }
  }, [dispatch, navigate]);

  const handleButtonClick = useCallback(
    (button) => {
      if (button.action) {
        button.action();
      } else if (button.route) {
        navigate(button.route);
      }
    },
    [navigate]
  );

  const buttonsInfo = [
    {
      text: "创建 Cybot",
      route: `/${CreateRoutePaths.CREATE_CYBOT}`,
      icon: <BsRobot size={22} />,
      description: "创建你的 AI 助手，添加提示词并选择合适的模型",
    },
    {
      text: "自定义 Cybot",
      route: `/${CreateRoutePaths.CREATE_CUSTOM_CYBOT}`,
      icon: <MdOutlineSettings size={22} />,
      description: "使用自定义 API 地址创建高级 Cybot",
    },
    {
      text: "新建笔记",
      icon: <HiOutlineDocumentAdd size={22} />,
      description: "创建可与 Cybot 共享的笔记和知识库",
      action: createNewPage,
    },
  ];

  return (
    <section className="guide-section-container">
      <div className="guide-header">
        <h2 className="guide-title">
          <HiOutlineLightBulb size={28} className="guide-title-icon" />
          开始使用 Cybot
        </h2>
        <p className="guide-subtitle">
          探索 AI 助手的强大功能，根据下方选项快速开始您的 Cybot 之旅
        </p>
      </div>

      <div className="quick-create-section section-block">
        <h3 className="section-subtitle">
          <BsPlusLg size={18} className="subtitle-icon" />
          开始创建
        </h3>
        <div className="button-grid">
          {buttonsInfo.map((button) => (
            <button
              key={button.text}
              className="grid-button"
              onClick={() => handleButtonClick(button)}
              aria-label={button.text}
            >
              <div className="button-content">
                <div className="icon-container">
                  {React.cloneElement(button.icon, {
                    "aria-hidden": true,
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
      </div>

      {currentUserId && (
        <div className="my-cybots-section section-block">
          <h3 className="section-subtitle">
            <BsRobot size={18} className="subtitle-icon" />
            我的 Cybot 列表
          </h3>
          <Cybots queryUserId={currentUserId} limit={6} />
          <div className="view-all-container">
            <NavLink to="/cybots" className="view-all-link">
              <span>查看全部 Cybot</span>
              <FiChevronRight size={16} aria-hidden="true" />
            </NavLink>
          </div>
        </div>
      )}

      <div className="feature-section section-block">
        <h3 className="section-subtitle">
          <IoDocumentTextOutline size={20} className="subtitle-icon" />
          使用指南
        </h3>
        <div className="feature-card">
          <p>
            了解如何更高效地使用 Cybot 的各项功能，包括对话、知识库和自定义设置
          </p>
          <NavLink to="/space/xx" className="action-button">
            查看帮助文档
          </NavLink>
        </div>
      </div>

      <style jsx>{`
        .guide-section-container {
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .guide-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .guide-title {
          font-size: 1.8rem;
          color: ${theme.text};
          margin-bottom: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          font-weight: 600;
        }

        .guide-title-icon {
          color: ${theme.primary};
        }

        .guide-subtitle {
          color: ${theme.textSecondary};
          margin: 0 auto;
          max-width: 600px;
          line-height: 1.5;
          font-size: 1rem;
        }

        .section-block {
          margin-bottom: 2.5rem;
          padding: 1rem 0;
          border-radius: 12px;
          background: transparent;
        }

        .section-block:last-child {
          margin-bottom: 0;
        }

        .section-subtitle {
          font-size: 1.3rem;
          color: ${theme.text};
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 600;
        }

        .subtitle-icon {
          color: ${theme.primary};
        }

        .button-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.25rem;
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

        .grid-button:hover {
          transform: translateY(-3px);
        }

        .grid-button:active {
          transform: translateY(-1px);
        }

        .grid-button:focus {
          outline: 2px solid ${theme.primary};
          outline-offset: 2px;
        }

        .button-content {
          display: flex;
          align-items: center;
          padding: 1.25rem;
          background: ${theme.background};
          border-radius: 12px;
          gap: 1.1rem;
          height: 100%;
          border: 1px solid ${theme.border};
          transition: all 0.2s ease;
        }

        .button-content:hover {
          border-color: ${theme.primary};
        }

        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background-color: ${theme.backgroundLight};
          color: ${theme.primary};
          flex-shrink: 0;
        }

        .button-icon {
          transition: transform 0.2s ease;
        }

        .grid-button:hover .button-icon {
          transform: scale(1.1);
        }

        .button-text {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .button-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: ${theme.text};
        }

        .button-description {
          font-size: 0.875rem;
          color: ${theme.textSecondary};
          line-height: 1.4;
        }

        .feature-card {
          background: ${theme.background};
          padding: 1.5rem;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
          border: 1px solid ${theme.border};
        }

        .feature-card p {
          color: ${theme.textSecondary};
          margin: 0;
          line-height: 1.5;
          font-size: 1rem;
        }

        .action-button {
          display: inline-block;
          background: ${theme.primary};
          color: white;
          padding: 0.5rem 1.25rem;
          border-radius: 6px;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          transition: background-color 0.2s ease;
        }

        .action-button:hover {
          background-color: ${theme.primaryDark};
        }

        .my-cybots-section {
          padding: 0;
        }

        .view-all-container {
          text-align: center;
          margin-top: 1.25rem;
        }

        .view-all-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: ${theme.primary};
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .view-all-link:hover {
          background-color: ${theme.backgroundLight};
          transform: translateX(3px);
        }

        @media (max-width: 768px) {
          .guide-title {
            font-size: 1.6rem;
          }

          .section-subtitle {
            font-size: 1.2rem;
            margin-bottom: 1rem;
          }

          .button-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .button-content {
            padding: 1.1rem;
          }

          .action-button {
            width: 100%;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .guide-title {
            font-size: 1.4rem;
          }

          .guide-subtitle {
            font-size: 0.9rem;
          }

          .section-subtitle {
            font-size: 1.1rem;
          }

          .button-title {
            font-size: 1rem;
          }

          .button-content {
            padding: 1rem;
          }

          .icon-container {
            width: 40px;
            height: 40px;
          }

          .feature-card p {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </section>
  );
};

export default React.memo(GuideSection);
