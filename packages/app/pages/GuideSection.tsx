import React, { useState } from 'react';
import { useAppSelector } from "../hooks";
import { selectTheme } from "../theme/themeSlice";
import { LightBulbIcon, MegaphoneIcon } from "@primer/octicons-react";
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
            <h3>帮助手册</h3>
            <ul>
              <li>1. 点击页面右侧悬浮+号，新建cybot创建自己的对话机器人，新建对话从机器人列表选择开始对话，新建页面创建新的笔记页面。</li>
              <li>2. 点击右上角的用户名跳转到使用统计页面，可查看token使用情况。</li>
              <li>3. 不同模型的价格可在首页侧边栏价格页面查看或创建机器人后查看。</li>
              <li>4. 个人数据属于用户，网站目前暂不提供找回密码功能。</li>
              <li>5. 充值和反馈请联系邮箱s@nolotus.com</li>
            </ul>
          </div>
          <div className="guide-item">
            <h3>最新动态</h3>
            <ul>
              <li>2025-02-15: 新增工作空间功能</li>
            </ul>
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
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 0.5rem;
          margin: 1rem auto;
          max-width: 1100px;
        }

        .guide-item {
          background: transparent; /* 将背景颜色设置为透明 */
          padding: 1.5rem;
          border: none; /* 移除边框 */
          box-shadow: none; /* 移除阴影 */
          transition: all 0.25s ease;
          text-align: left; /* 将 guide-item 内部的文字对齐方式设置为左对齐 */
        }

        .guide-item:hover {
          transform: translateY(-4px);
          background: ${theme.background}; /* 保持背景颜色一致 */
          box-shadow: 0 8px 24px ${theme.shadowMedium}; /* 保持阴影效果 */
          border-color: ${theme.primary}40;
        }

        .guide-item h3 {
          font-size: 1.25rem;
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
          color: ${theme.textSecondary};
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
            gap: 1rem;
          }

          .guide-item {
            padding: 1rem;
          }
        }
      `}</style>
    </section>
  );
};

export default GuideSection;
