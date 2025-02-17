import React, { useState } from 'react';
import { useAppSelector } from "../hooks";
import { selectTheme } from "../theme/themeSlice";
import { MailIcon, GearIcon, InfoIcon, CommentDiscussionIcon, LightBulbIcon, MegaphoneIcon } from "@primer/octicons-react";
import toast from "react-hot-toast";

const GuideSection = () => {
  const theme = useAppSelector(selectTheme);
  const [feedback, setFeedback] = useState('');

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (feedback.trim() === '') {
      toast.error("反馈内容不能为空");
      return;
    }
    // 这里可以添加提交反馈的逻辑，例如调用 API 将反馈内容发送到服务器
    toast.success("反馈已提交，感谢您的反馈！");
    setFeedback('');
  };

  return (
    <section className="guide-section fade-in">
      <div className="guide-content">
        <h2 className="guide-title">
          <LightBulbIcon size={24} className="guide-title-icon" />
          使用指南
        </h2>
        <p className="guide-subtitle">
          在下方查看有用的信息，或向我们提交您的反馈。
        </p>
        <div className="guides-grid">
          <div className="guide-item">
            <h3>
              <GearIcon size={16} className="guide-item-icon" />
              帮助手册
            </h3>
            <ul>
              <li>
                <GearIcon size={16} /> 忘记密码请到设置中添加密保问题
              </li>
              <li>
                <MailIcon size={16} /> 账户充值联系邮箱
              </li>
              <li>
                <InfoIcon size={16} /> 点击按钮进入X功能
              </li>
            </ul>
          </div>
          <div className="guide-item">
            <h3>
              <MegaphoneIcon size={16} className="guide-item-icon" />
              最新动态
            </h3>
            <ul>
              <li>2025-02-15: 添加了新的功能X</li>
              <li>2025-02-14: 修复了已知的bug</li>
              <li>2025-02-13: 优化了用户界面</li>
            </ul>
          </div>
          <div className="guide-item">
            <h3>
              <CommentDiscussionIcon size={16} className="guide-item-icon" />
              反馈留言
            </h3>
            <form onSubmit={handleFeedbackSubmit}>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="请输入您的反馈..."
                className="feedback-textarea"
              />
              <button type="submit" className="feedback-button">
                <CommentDiscussionIcon size={16} /> 提交反馈
              </button>
            </form>
          </div>
        </div>
      </div>
      <style jsx>{`
        .fade-in {
          opacity: 0;
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .guide-section {
          background: ${theme.backgroundSecondary};
          border-radius: 24px;
          padding: 2rem;
          margin: 1.5rem auto;
          max-width: 1200px;
          box-shadow: 0 8px 30px ${theme.shadowLight};
        }

        .guide-content {
          text-align: center;
          margin: 0 auto 3rem;
        }

        .guide-title {
          font-size: 2rem;
          color: ${theme.text};
          margin-bottom: 0.5rem;
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
          font-size: 1rem;
          color: ${theme.textSecondary};
          margin-bottom: 2rem;
          text-align: center;
        }

        .guides-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          padding: 0.5rem;
          margin: 1rem auto;
          max-width: 1100px;
        }

        .guide-item {
          background: ${theme.backgroundSecondary};
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid ${theme.border};
          box-shadow: 0 2px 12px ${theme.shadowLight};
          transition: all 0.25s ease;
          text-align: left; /* 将 guide-item 内部的文字对齐方式设置为左对齐 */
        }

        .guide-item:hover {
          transform: translateY(-4px);
          background: ${theme.background};
          box-shadow: 0 8px 24px ${theme.shadowMedium};
          border-color: ${theme.primary}40;
        }

        .guide-item h3 {
          font-size: 1.25rem;
          color: ${theme.text};
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .guide-item-icon {
          color: ${theme.primary};
        }

        .guide-item ul {
          list-style-type: none;
          padding: 0;
        }

        .guide-item li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          color: ${theme.textSecondary};
        }

        .guide-item li svg {
          color: ${theme.primary};
        }

        .feedback-textarea {
          width: 100%;
          height: 100px;
          padding: 0.75rem;
          border: 1px solid ${theme.border};
          border-radius: 8px;
          resize: vertical;
          margin-bottom: 1rem;
          background: ${theme.background};
          color: ${theme.text};
        }

        .feedback-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.625rem 1.5rem;
          border: none;
          border-radius: 16px;
          background: ${theme.primary};
          color: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 1rem;
          font-weight: 500;
          box-shadow: 0 4px 12px ${theme.primaryGhost};
        }

        .feedback-button:hover {
          background: ${theme.primaryLight};
          transform: translateY(-2px);
          box-shadow: 0 6px 20px ${theme.primaryGhost};
        }

        .feedback-button svg {
          color: #ffffff;
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

        @media (max-width: 1024px) {
          .guide-section {
            padding: 3.5rem 2rem;
            margin: 1rem;
          }

          .guides-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem;
          }
        }

        @media (max-width: 768px) {
          .guide-section {
            padding: 3rem 1.5rem;
          }

          .guide-title {
            font-size: 1.75rem;
          }

          .guides-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }

          .guide-item {
            padding: 1.25rem;
          }

          .guide-item h3 {
            font-size: 1.125rem;
          }
        }

        @media (max-width: 480px) {
          .guide-section {
            padding: 2.5rem 1.25rem;
            border-radius: 20px;
          }

          .guide-title {
            font-size: 1.5rem;
          }

          .guides-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .guide-item {
            padding: 1rem;
          }

          .feedback-textarea {
            padding: 0.625rem;
            font-size: 0.875rem;
          }

          .feedback-button {
            padding: 0.5rem 1.25rem;
            font-size: 0.9375rem;
          }
        }
      `}</style>
    </section>
  );
};

export default GuideSection;
