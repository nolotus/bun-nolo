import React, { useState } from 'react';
import { useAppSelector } from "../hooks";
import { selectTheme } from "../theme/themeSlice";
import { MailIcon, GearIcon, InfoIcon, CommentIcon } from "@primer/octicons-react";
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
    <div className="guide-section">
      <h2 className="guide-title">使用指南</h2>
      <div className="guide-content">
        <div className="guide-item">
          <h3>帮助手册</h3>
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
          <h3>网站最近的更新</h3>
          <ul>
            <li>2025-02-15: 添加了新的功能X</li>
            <li>2025-02-14: 修复了已知的bug</li>
            <li>2025-02-13: 优化了用户界面</li>
          </ul>
        </div>
        <div className="guide-item">
          <h3>反馈留言</h3>
          <form onSubmit={handleFeedbackSubmit}>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="请输入您的反馈..."
              className="feedback-textarea"
            />
            <button type="submit" className="feedback-button">
              <CommentIcon size={16} /> 提交反馈
            </button>
          </form>
        </div>
      </div>
      <style jsx>{`
        .guide-section {
          background: ${theme.backgroundLight};
          padding: 2rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .guide-title {
          font-size: 2rem;
          color: ${theme.text};
          margin-bottom: 1rem;
          text-align: center;
        }

        .guide-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .guide-item {
          background: ${theme.background};
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid ${theme.border};
        }

        .guide-item h3 {
          font-size: 1.5rem;
          color: ${theme.text};
          margin-bottom: 1rem;
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
        }

        .guide-item li svg {
          color: ${theme.primary};
        }

        .feedback-textarea {
          width: 100%;
          height: 100px;
          padding: 1rem;
          border: 1px solid ${theme.border};
          border-radius: 4px;
          resize: vertical;
          margin-bottom: 1rem;
        }

        .feedback-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          background: ${theme.primary};
          color: ${theme.textInverse};
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .feedback-button:hover {
          background: ${theme.primaryHover};
        }

        .feedback-button svg {
          color: ${theme.textInverse};
        }
      `}</style>
    </div>
  );
};

export default GuideSection;
