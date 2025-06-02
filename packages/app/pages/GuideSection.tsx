import React, { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { selectTheme } from "../theme/themeSlice";
import { selectCurrentUserId } from "auth/authSlice";
import { CreateRoutePaths } from "create/routePaths";
import { FiChevronRight, FiDollarSign, FiCreditCard } from "react-icons/fi"; // 导入 FiCreditCard
import { HiOutlineLightBulb, HiOutlineDocumentAdd } from "react-icons/hi";
import { BsRobot, BsPlusLg } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";
import { BiBook } from "react-icons/bi";
import Cybots from "ai/cybot/web/Cybots";
import { useNavigate, NavLink } from "react-router-dom";
import { createPage } from "render/page/pageSlice";
import { selectCurrentSpaceId } from "create/space/spaceSlice";
import SectionHeader from "./SectionHeader";

const GuideSection = () => {
  const theme = useAppSelector(selectTheme);
  const currentUserId = useAppSelector(selectCurrentUserId);
  const currentSpaceId = useAppSelector(selectCurrentSpaceId);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const createNewPage = useCallback(async () => {
    try {
      const pageKey = await dispatch(createPage()).unwrap();
      navigate(`/${pageKey}?edit=true`);
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
    // 添加新的“点此充值”链接
    {
      text: "点此充值", // 链接文本
      icon: <FiCreditCard size={18} />, // 使用 FiCreditCard 图标
      description: "充值您的余额以使用 Cybot 服务", // 描述
      link: "/recharge", // 假设充值页面的路由是 /recharge，请根据您的实际路由调整
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
          <SectionHeader
            title="我的 Cybot 列表"
            icon={<BsRobot size={16} />}
            linkText="查看全部"
            linkTo={`space/${currentSpaceId}`}
          />
          <Cybots queryUserId={currentUserId} limit={6} />
        </div>
      )}

      <style>{`
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
          font-size: 1.4rem; /* 与 SectionHeader 标题大小一致 */
          color: ${theme.text};
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          margin: 0 0 1.2rem 0; /* 调整下边距，与 SectionHeader 一致 */
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

        @media (max-width: 768px) {
          .guide-title {
            font-size: 1.5rem;
          }

          .section-subtitle {
            font-size: 1.3rem; /* 与 SectionHeader 一致 */
            margin: 0 0 1rem 0;
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
            font-size: 1.2rem; /* 与 SectionHeader 一致 */
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
