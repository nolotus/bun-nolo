import React, { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { selectTheme } from "../theme/themeSlice";
import { selectCurrentUserId } from "../../auth/authSlice";
import { CreateRoutePaths } from "create/routePaths";
import { createPage } from "render/page/pageSlice";
import { useNavigate, NavLink } from "react-router-dom";
import Cybots from "ai/cybot/web/Cybots";

// 导入图标
import { FiChevronRight } from "react-icons/fi";
import { HiOutlineLightBulb, HiOutlineDocumentAdd } from "react-icons/hi";
import { BsRobot, BsPlusLg } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";
import { IoDocumentTextOutline } from "react-icons/io5";
import { FiDollarSign } from "react-icons/fi";
import { BiBook } from "react-icons/bi";

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
      icon: <BsRobot size={20} />,
      description: "创建你的 AI 助手，添加提示词并选择合适的模型",
    },
    {
      text: "自定义 Cybot",
      route: `/${CreateRoutePaths.CREATE_CUSTOM_CYBOT}`,
      icon: <MdOutlineSettings size={20} />,
      description: "使用自定义 API 地址创建高级 Cybot",
    },
    {
      text: "新建笔记",
      icon: <HiOutlineDocumentAdd size={20} />,
      description: "创建可与 Cybot 共享的笔记和知识库",
      action: createNewPage,
    },
  ];

  const guideLinks = [
    {
      text: "使用指南",
      icon: <BiBook size={18} />,
      description: "了解如何高效使用 Cybot 功能",
      link: "/page-0e95801d90-01JRDMA6Q85PQDCEAC7EXHWF67?spaceId=01JRDM39VSNYD1PKS4B53W6BGE",
    },
    {
      text: "收费说明",
      icon: <FiDollarSign size={18} />,
      description: "按模型类型和 token 计费，按需付费",
      link: "/pricing",
    },
  ];

  return (
    <section className="guide-section-container">
      <div className="guide-header">
        <h2 className="guide-title">
          <HiOutlineLightBulb size={26} className="guide-title-icon" />
          开始使用 Cybot
        </h2>
        <p className="guide-subtitle">
          探索 AI 助手的强大功能，根据下方选项快速开始您的 Cybot 之旅
        </p>
      </div>

      {/* 优化后的使用指南部分 */}
      <div className="guides-section section-block">
        <div className="guides-container">
          {guideLinks.map((guide) => (
            <NavLink
              key={guide.text}
              to={guide.link}
              className="guide-link-card"
            >
              <div className="guide-link-icon">{guide.icon}</div>
              <div className="guide-link-content">
                <h4 className="guide-link-title">{guide.text}</h4>
                <p className="guide-link-desc">{guide.description}</p>
              </div>
              <FiChevronRight size={16} className="guide-link-arrow" />
            </NavLink>
          ))}
        </div>
      </div>

      <div className="quick-create-section section-block">
        <h3 className="section-subtitle">
          <BsPlusLg size={16} className="subtitle-icon" />
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
            <BsRobot size={16} className="subtitle-icon" />
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

      <style jsx>{`
        .guide-section-container {
          animation: fadeIn 0.4s ease;
          max-width: 1200px;
          margin: 0 auto;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .guide-header {
          text-align: center;
          margin-bottom: 1.75rem;
        }

        .guide-title {
          font-size: 1.75rem;
          color: ${theme.text};
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .guide-title-icon {
          color: ${theme.primary};
        }

        .guide-subtitle {
          color: ${theme.textSecondary};
          margin: 0 auto;
          max-width: 600px;
          line-height: 1.4;
          font-size: 0.95rem;
        }

        .section-block {
          margin-bottom: 2rem;
          padding: 0.6rem 0;
          border-radius: 10px;
          background: transparent;
        }

        .section-block:last-child {
          margin-bottom: 0;
        }

        .section-subtitle {
          font-size: 1.2rem;
          color: ${theme.text};
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .subtitle-icon {
          color: ${theme.primary};
        }

        /* 优化的使用指南样式 */
        .guides-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .guide-link-card {
          display: flex;
          align-items: center;
          padding: 0.85rem 1rem;
          background-color: ${theme.background};
          border: 1px solid ${theme.border};
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s ease;
          color: ${theme.text};
          gap: 0.75rem;
        }

        .guide-link-card:hover {
          border-color: ${theme.primary};
          transform: translateY(-2px);
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
        }

        .guide-link-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 34px;
          height: 34px;
          border-radius: 8px;
          background-color: ${theme.backgroundLight};
          color: ${theme.primary};
        }

        .guide-link-content {
          flex: 1;
          min-width: 0;
        }

        .guide-link-title {
          font-size: 0.95rem;
          font-weight: 600;
          margin: 0 0 0.15rem;
          color: ${theme.text};
        }

        .guide-link-desc {
          font-size: 0.8rem;
          color: ${theme.textSecondary};
          margin: 0;
          line-height: 1.3;
        }

        .guide-link-arrow {
          color: ${theme.textSecondary};
          opacity: 0.7;
          transition: transform 0.2s ease;
        }

        .guide-link-card:hover .guide-link-arrow {
          transform: translateX(3px);
          color: ${theme.primary};
          opacity: 1;
        }

        .button-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

        .grid-button:hover {
          transform: translateY(-3px);
        }

        .grid-button:active {
          transform: translateY(-1px);
        }

        .grid-button:focus-visible {
          outline: 2px solid ${theme.primary};
          outline-offset: 2px;
        }

        .button-content {
          display: flex;
          align-items: center;
          padding: 1.1rem;
          background: ${theme.background};
          border-radius: 10px;
          gap: 1rem;
          height: 100%;
          border: 1px solid ${theme.border};
          transition: all 0.2s ease;
        }

        .button-content:hover {
          border-color: ${theme.primary};
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
        }

        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          height: 40px;
          border-radius: 10px;
          background-color: ${theme.backgroundLight};
          color: ${theme.primary};
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
          gap: 0.25rem;
        }

        .button-title {
          font-size: 1.05rem;
          font-weight: 600;
          color: ${theme.text};
        }

        .button-description {
          font-size: 0.85rem;
          color: ${theme.textSecondary};
          line-height: 1.35;
        }

        .my-cybots-section {
          padding: 0;
        }

        .view-all-container {
          text-align: center;
          margin-top: 1rem;
        }

        .view-all-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: ${theme.primary};
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem;
          padding: 0.4rem 0.9rem;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .view-all-link:hover {
          background-color: ${theme.backgroundLight};
          transform: translateX(3px);
        }

        @media (max-width: 768px) {
          .guide-title {
            font-size: 1.5rem;
          }

          .section-subtitle {
            font-size: 1.1rem;
            margin-bottom: 0.9rem;
          }

          .button-grid,
          .guides-container {
            grid-template-columns: 1fr;
            gap: 0.9rem;
          }

          .button-content {
            padding: 1rem;
          }
        }

        @media (max-width: 480px) {
          .guide-title {
            font-size: 1.35rem;
          }

          .guide-subtitle {
            font-size: 0.85rem;
          }

          .section-subtitle {
            font-size: 1rem;
          }

          .button-title,
          .guide-link-title {
            font-size: 0.95rem;
          }

          .button-content {
            padding: 0.9rem;
          }

          .guide-link-card {
            padding: 0.75rem 0.9rem;
          }

          .icon-container {
            width: 36px;
            height: 36px;
          }

          .guide-link-icon {
            width: 30px;
            height: 30px;
          }
        }
      `}</style>
    </section>
  );
};

export default React.memo(GuideSection);
