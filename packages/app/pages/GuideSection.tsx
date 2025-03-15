import React from "react";
import { useAppSelector } from "../hooks";
import { selectTheme } from "../theme/themeSlice";
import {
  LightBulbIcon,
  BookIcon,
  RocketIcon,
  PeopleIcon,
  ChevronDownIcon,
} from "@primer/octicons-react";
import { NavLink } from "react-router-dom";

const GuideSection = () => {
  const theme = useAppSelector(selectTheme);

  return (
    <section className="guide-section fade-in">
      <div className="guide-content">
        <h2 className="guide-title">
          <LightBulbIcon size={24} className="guide-title-icon" />
          欢迎来到您的AI助手空间
        </h2>
        <p className="guide-subtitle">
          这里是您的专属AI助手平台，无论是学习、工作还是兴趣爱好，都能帮您事半功倍
        </p>

        {/* 核心功能展示区 */}
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <RocketIcon size={24} />
            </div>
            <h3>创建AI助手</h3>
            <p>为不同场景创建定制化AI助手，让AI更懂你的需求</p>
            <NavLink to="/create" className="action-button">
              开始创建
            </NavLink>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <BookIcon size={24} />
            </div>
            <h3>知识库管理</h3>
            <p>上传并管理您的专业资料，让AI掌握您需要的专业知识</p>
            <NavLink to="/knowledge-base" className="action-button">
              查看详情
            </NavLink>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <PeopleIcon size={24} />
            </div>
            <h3>多场景应用</h3>
            <p>根据不同场景、学习、工作、生活，创建多个独立空间</p>
            <NavLink to="/scenarios" className="action-button">
              了解更多
            </NavLink>
          </div>
        </div>

        {/* 快速上手指南 */}
        <div className="quick-start">
          <h3>快速上手</h3>
          <div className="steps">
            <div className="step">
              <span className="step-number">1</span>
              <p>创建AI助手，设定任务背景和使用底座模型</p>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <p>上传知识库文档，让AI回复更精准</p>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <p>开始对话，享受AI带来的效率提升</p>
            </div>
            <div className="step">
              <span className="step-number">4</span>
              <p>
                多账户使用，点击
                <NavLink to="/login" className="auth-link">
                  登录
                </NavLink>
                /
                <NavLink to="/signup" className="auth-link">
                  注册
                </NavLink>
                添加新账户
              </p>
            </div>
          </div>
        </div>

        {/* 帮助链接 */}
        <div className="help-links">
          <NavLink to="/tutorial" className="help-link">使用教程</NavLink>
          <NavLink to="/faq" className="help-link">最近更新</NavLink>
          <a href="mailto:s@nolotus.com" className="help-link">联系我们</a>
        </div>
      </div>

      <style >{`
        .fade-in {
          opacity: 0;
          animation: fadeInUp 0.6s ease forwards;
        }

        .guide-section {
          background: ${theme.backgroundSecondary};
          border-radius: 16px;
          padding: 2rem;
          margin: 1.5rem auto;
          max-width: 1200px;
        }

        .guide-title {
          font-size: 1.8rem;
          color: ${theme.text};
          margin-bottom: 1rem;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .guide-title-icon {
          color: ${theme.primary};
        }

        .guide-subtitle {
          color: ${theme.textSecondary};
          text-align: center;
          margin-bottom: 2rem;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin: 2rem 0;
        }

        .feature-card {
          background: ${theme.background};
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid ${theme.border};
        }

        .feature-icon {
          color: ${theme.primary};
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          color: ${theme.text};
          margin-bottom: 0.5rem;
        }

        .feature-card p {
          color: ${theme.textSecondary};
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .action-button {
          display: inline-block;
          background: ${theme.primary};
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          text-decoration: none;
          font-size: 0.9rem;
        }

        .quick-start {
          background: ${theme.background};
          padding: 1.5rem;
          border-radius: 12px;
          margin: 2rem 0;
          border: 1px solid ${theme.border};
        }

        .quick-start h3 {
          color: ${theme.text};
          margin-bottom: 1rem;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .step-number {
          background: ${theme.primary};
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
        }

        .step p {
          color: ${theme.textSecondary};
        }

        .help-links {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 2rem;
        }

        .help-link {
          color: ${theme.primary};
          text-decoration: none;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .feature-grid,
          .steps {
            grid-template-columns: 1fr;
          }

          .help-links {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }
        }

        .auth-link {
          color: ${theme.primary};
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
          padding: 0 0.3rem;
        }

        .auth-link:hover {
          color: ${theme.primaryDark};
        }
      `}</style>
    </section>
  );
};

export default GuideSection;
