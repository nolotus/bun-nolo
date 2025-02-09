// WelcomeSection.js
import React from "react";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../hooks";
import { selectTheme } from "../theme/themeSlice";

const WelcomeSection = () => {
  const theme = useAppSelector(selectTheme);
  const features = [
    {
      icon: "🤖",
      title: "AI 定制",
      description: "为你的每个需求打造专属AI助手",
    },
    {
      icon: "🔒",
      title: "数据安全",
      description: "端到端加密 + 本地LLM支持",
    },
    {
      icon: "💻",
      title: "全平台",
      description: "多端同步(移动端开发中)",
    },
    {
      icon: "🌐",
      title: "开源开放",
      description: "去中心化数据 + 自由部署",
    },
  ];

  return (
    <>
      <section className="hero-section fade-in">
        <div className="hero-content">
          <h1 className="hero-title fade-in fade-in-delay-1">
            <span className="welcome-text">Hey，欢迎使用Cybot</span> 👋
          </h1>
          <div className="intro-text fade-in fade-in-delay-2">
            <p>你可以根据你的需求来定制AI，要不要来试试看？</p>
          </div>
          <div className="fade-in fade-in-delay-3">
            <NavLink to="/signup" className="signup-link">
              开始体验
            </NavLink>
          </div>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
      <style jsx>{`
        .fade-in {
          opacity: 0;
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .fade-in-delay-1 {
          animation-delay: 0.15s;
        }

        .fade-in-delay-2 {
          animation-delay: 0.3s;
        }

        .fade-in-delay-3 {
          animation-delay: 0.45s;
        }

        .hero-section {
          background: ${theme.backgroundSecondary};
          border-radius: 24px;
          padding: 4rem 2.5rem;
          margin: 1.5rem auto;
          max-width: 1200px;
          box-shadow: 0 8px 30px ${theme.shadowLight};
        }

        .hero-content {
          text-align: center;
          max-width: 720px;
          margin: 0 auto 3rem;
        }

        .hero-title {
          font-size: 2.75rem;
          margin-bottom: 1.25rem;
          font-weight: 700;
          line-height: 1.2;
          color: ${theme.text};
          letter-spacing: -0.02em;
        }

        .welcome-text {
          background: ${theme.primaryGradient};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
        }

        .intro-text {
          font-size: 1.125rem;
          margin-bottom: 2rem;
          font-weight: 400;
          color: ${theme.textSecondary};
          line-height: 1.6;
        }

        .signup-link {
          display: inline-block;
          padding: 0.875rem 2.25rem;
          background: ${theme.primary};
          color: #ffffff;
          border-radius: 16px;
          text-decoration: none;
          font-weight: 500;
          font-size: 1.0625rem;
          letter-spacing: 0.01em;
          box-shadow: 0 4px 12px ${theme.primaryGhost};
          transition: all 0.2s ease;
        }

        .signup-link:hover {
          background: ${theme.primaryLight};
          transform: translateY(-2px);
          box-shadow: 0 6px 20px ${theme.primaryGhost};
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          padding: 0.5rem;
          margin: 1rem auto;
          max-width: 1100px;
        }

        .feature-card {
          padding: 1.75rem;
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.border};
          border-radius: 16px;
          box-shadow: 0 2px 12px ${theme.shadowLight};
          transition: all 0.25s ease;
          opacity: 0;
          animation: fadeInUp 0.5s ease forwards;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          background: ${theme.background};
          box-shadow: 0 8px 24px ${theme.shadowMedium};
          border-color: ${theme.primary}40;
        }

        .feature-icon {
          font-size: 2rem;
          margin-bottom: 0.875rem;
        }

        .feature-title {
          font-size: 1.0625rem;
          margin-bottom: 0.625rem;
          color: ${theme.text};
          font-weight: 600;
        }

        .feature-description {
          color: ${theme.textSecondary};
          font-size: 0.9375rem;
          line-height: 1.5;
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
          .hero-section {
            padding: 3.5rem 2rem;
            margin: 1rem;
          }

          .features-grid {
            gap: 1.25rem;
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 3rem 1.5rem;
          }

          .hero-title {
            font-size: 2.25rem;
          }

          .intro-text {
            font-size: 1.0625rem;
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem;
          }

          .feature-card {
            padding: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .hero-section {
            padding: 2.5rem 1.25rem;
            border-radius: 20px;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .hero-title {
            font-size: 2rem;
          }

          .intro-text {
            font-size: 1rem;
          }

          .signup-link {
            padding: 0.75rem 2rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default WelcomeSection;
