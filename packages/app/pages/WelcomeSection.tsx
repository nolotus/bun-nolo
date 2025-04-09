import React from "react";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../hooks";
import { selectTheme } from "../theme/themeSlice";
import { BsRobot, BsShieldCheck, BsLaptop, BsGlobe } from "react-icons/bs";

const WelcomeSection = () => {
  const theme = useAppSelector(selectTheme);

  const features = [
    {
      icon: <BsRobot size={22} />,
      title: "定制 AI 助手",
      description: "为不同需求创建专属智能助手，自定义对话和技能",
    },
    {
      icon: <BsShieldCheck size={22} />,
      title: "隐私与安全",
      description: "端到端加密保护，支持本地模型部署，数据自主可控",
    },
    {
      icon: <BsLaptop size={22} />,
      title: "全平台支持",
      description: "Web、桌面和移动端（即将推出）体验无缝衔接",
    },
    {
      icon: <BsGlobe size={22} />,
      title: "开源生态",
      description: "去中心化架构，支持自由部署和社区定制扩展",
    },
  ];

  return (
    <section className="welcome-section">
      <div className="hero-content">
        <h1 className="hero-title">
          <span className="gradient-text">打造你的 AI 助手</span>
          <span className="wave-emoji" aria-hidden="true">
            👋
          </span>
        </h1>

        <p className="hero-description">
          Cybot 让你能够根据特定需求定制 AI 助手，无需编程知识
        </p>

        <div className="cta-container">
          <NavLink to="/signup" className="cta-button">
            免费开始使用
          </NavLink>
        </div>
      </div>

      <div className="features-container">
        {features.map((feature, index) => (
          <div
            key={index}
            className="feature-card"
            style={{ animationDelay: `${0.1 + index * 0.08}s` }}
          >
            <div className="feature-icon-container">{feature.icon}</div>
            <div className="feature-content">
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .welcome-section {
          background: ${theme.backgroundSecondary};
          border-radius: 20px;
          padding: 3.5rem 2.5rem;
          max-width: 1200px;
          margin: 0 auto;
          animation: fadeIn 0.5s ease-out;
          overflow: hidden;
          position: relative;
          border: 1px solid ${theme.border};
        }

        .hero-content {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 3.5rem;
          position: relative;
          z-index: 1;
        }

        .hero-title {
          font-size: 2.75rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          color: ${theme.text};
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          animation: fadeInUp 0.6s ease forwards;
          animation-delay: 0.1s;
          opacity: 0;
          transform: translateY(15px);
        }

        .gradient-text {
          background: linear-gradient(
            135deg,
            ${theme.primary} 0%,
            ${theme.primaryDark} 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }

        .wave-emoji {
          display: inline-block;
          animation: wave 2.5s infinite;
          transform-origin: 70% 70%;
          font-size: 2.5rem;
        }

        .hero-description {
          font-size: 1.25rem;
          line-height: 1.6;
          color: ${theme.textSecondary};
          margin-bottom: 2.25rem;
          animation: fadeInUp 0.6s ease forwards;
          animation-delay: 0.2s;
          opacity: 0;
          transform: translateY(15px);
          max-width: 580px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-container {
          animation: fadeInUp 0.6s ease forwards;
          animation-delay: 0.3s;
          opacity: 0;
          transform: translateY(15px);
        }

        .cta-button {
          display: inline-block;
          padding: 0.9rem 2.25rem;
          background: ${theme.primary};
          color: white;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1.05rem;
          text-decoration: none;
          transition: all 0.25s ease;
        }

        .cta-button:hover {
          background: ${theme.primaryDark};
          transform: translateY(-3px);
        }

        .cta-button:active {
          transform: translateY(-1px);
        }

        .features-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.75rem;
          margin: 0 auto;
        }

        .feature-card {
          background: ${theme.background};
          border-radius: 14px;
          padding: 1.75rem;
          transition: all 0.25s ease;
          opacity: 0;
          animation: fadeInUp 0.5s ease forwards;
          border: 1px solid ${theme.border};
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          border-color: ${theme.primary}40;
        }

        .feature-icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 10px;
          margin-bottom: 1.25rem;
          background: ${theme.primaryGhost}20;
          color: ${theme.primary};
        }

        .feature-content {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .feature-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: ${theme.text};
        }

        .feature-description {
          color: ${theme.textSecondary};
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0;
          flex-grow: 1;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes wave {
          0% {
            transform: rotate(0deg);
          }
          10% {
            transform: rotate(14deg);
          }
          20% {
            transform: rotate(-8deg);
          }
          30% {
            transform: rotate(14deg);
          }
          40% {
            transform: rotate(-4deg);
          }
          50% {
            transform: rotate(10deg);
          }
          60% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        @media (max-width: 1024px) {
          .welcome-section {
            padding: 3rem 2rem;
            border-radius: 16px;
          }

          .features-container {
            gap: 1.5rem;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .feature-card {
            padding: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .welcome-section {
            padding: 2.5rem 1.75rem;
          }

          .hero-title {
            font-size: 2.25rem;
          }

          .hero-description {
            font-size: 1.1rem;
          }

          .features-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .welcome-section {
            padding: 2rem 1.25rem;
            border-radius: 14px;
          }

          .hero-title {
            font-size: 1.85rem;
            flex-direction: column;
            gap: 0.5rem;
          }

          .wave-emoji {
            font-size: 1.75rem;
          }

          .hero-description {
            font-size: 1rem;
            margin-bottom: 1.75rem;
          }

          .features-container {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .feature-card {
            padding: 1.25rem;
          }

          .feature-icon-container {
            margin-bottom: 1rem;
          }

          .feature-title {
            font-size: 1.05rem;
            margin-bottom: 0.5rem;
          }

          .cta-button {
            width: 100%;
            text-align: center;
            padding: 0.85rem 1.5rem;
          }
        }
      `}</style>
    </section>
  );
};

export default React.memo(WelcomeSection);
