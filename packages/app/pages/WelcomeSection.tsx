import React from "react";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../hooks";
import { selectTheme } from "../theme/themeSlice";
import { BsFileEarmarkText, BsShieldLock, BsLaptop } from "react-icons/bs";
import { useTranslation } from "react-i18next";

const WelcomeSection = () => {
  const theme = useAppSelector(selectTheme);
  const { t } = useTranslation();

  const features = [
    {
      icon: <BsFileEarmarkText size={24} />,
      title: t("welcomeSection.feature1.title"),
      description: t("welcomeSection.feature1.description"),
      highlights: [
        t("welcomeSection.feature1.highlights.0"),
        t("welcomeSection.feature1.highlights.1"),
        t("welcomeSection.feature1.highlights.2"),
      ],
      gradient: "from-blue-500 to-purple-600",
    },
    {
      icon: <BsShieldLock size={24} />,
      title: t("welcomeSection.feature2.title"),
      description: t("welcomeSection.feature2.description"),
      highlights: [
        t("welcomeSection.feature2.highlights.0"),
        t("welcomeSection.feature2.highlights.1"),
        t("welcomeSection.feature2.highlights.2"),
      ],
      gradient: "from-green-500 to-emerald-600",
    },
    {
      icon: <BsLaptop size={24} />,
      title: t("welcomeSection.feature3.title"),
      description: t("welcomeSection.feature3.description"),
      highlights: [
        t("welcomeSection.feature3.highlights.0"),
        t("welcomeSection.feature3.highlights.1"),
        t("welcomeSection.feature3.highlights.2"),
      ],
      gradient: "from-purple-500 to-pink-600",
    },
  ];

  return (
    <section className="welcome-section">
      {/* 幕后光效 */}
      <div className="ambient-light"></div>

      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-text">✨ 私密 • 智能 • 开源</span>
        </div>

        <h1 className="hero-title">
          <span className="gradient-text">{t("welcomeSection.heroTitle")}</span>
          <span className="lock-emoji" aria-hidden="true">
            {t("welcomeSection.waveEmoji")}
          </span>
        </h1>

        <p className="hero-description">
          {t("welcomeSection.heroDescription")}
        </p>

        <div className="cta-container">
          <NavLink to="/signup" className="cta-button">
            <span className="button-text">{t("welcomeSection.ctaButton")}</span>
            <div className="button-shine"></div>
          </NavLink>
        </div>
      </div>

      <div className="features-container">
        {features.map((feature, index) => (
          <div
            key={index}
            className="feature-card"
            style={{ animationDelay: `${0.2 + index * 0.15}s` }}
          >
            <div className="feature-glow"></div>

            <div className="feature-header">
              <div className={`feature-icon-container gradient-${index}`}>
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
            </div>

            <div className="feature-content">
              <p className="feature-description">{feature.description}</p>

              <div className="feature-highlights">
                {feature.highlights.map((highlight, hIndex) => (
                  <span
                    key={hIndex}
                    className={`highlight-tag highlight-${index}`}
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .welcome-section {
          background: ${theme.backgroundSecondary};
          border-radius: 24px;
          padding: ${theme.space[16]} ${theme.space[12]};
          max-width: 1200px;
          margin: 0 auto;
          animation: sectionFadeIn 0.8s ease-out;
          overflow: hidden;
          position: relative;
          border: 1px solid ${theme.borderLight};
          box-shadow: 0 20px 60px ${theme.shadowLight};
        }

        .ambient-light {
          position: absolute;
          top: -50%;
          left: -50%;
          right: -50%;
          bottom: -50%;
          background: radial-gradient(
            circle at 50% 50%,
            ${theme.primary}08 0%,
            transparent 50%
          );
          animation: ambientPulse 4s ease-in-out infinite;
          pointer-events: none;
        }

        .hero-content {
          text-align: center;
          max-width: 760px;
          margin: 0 auto ${theme.space[16]};
          position: relative;
          z-index: 2;
        }

        .hero-badge {
          display: inline-block;
          padding: ${theme.space[2]} ${theme.space[4]};
          background: ${theme.primaryGhost}15;
          border: 1px solid ${theme.primaryLight}30;
          border-radius: 20px;
          margin-bottom: ${theme.space[6]};
          animation: badgeSlideIn 0.8s ease forwards;
          opacity: 0;
          transform: translateY(-10px);
        }

        .badge-text {
          font-size: 0.9rem;
          font-weight: 500;
          background: linear-gradient(
            135deg,
            ${theme.primary},
            ${theme.primaryDark}
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-title {
          font-size: 3.2rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: ${theme.space[8]};
          color: ${theme.text};
          display: flex;
          align-items: center;
          justify-content: center;
          gap: ${theme.space[4]};
          animation: titleSlideIn 1s ease forwards;
          animation-delay: 0.2s;
          opacity: 0;
          transform: translateY(20px);
        }

        .gradient-text {
          background: linear-gradient(
            135deg,
            ${theme.primary} 0%,
            ${theme.primaryDark} 50%,
            #8b5cf6 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
        }

        .lock-emoji {
          display: inline-block;
          animation: lockFloat 3s ease-in-out infinite;
          font-size: 2.8rem;
          filter: drop-shadow(0 4px 12px rgba(139, 92, 246, 0.3));
        }

        .hero-description {
          font-size: 1.35rem;
          line-height: 1.65;
          color: ${theme.textSecondary};
          margin-bottom: ${theme.space[10]};
          animation: descSlideIn 1s ease forwards;
          animation-delay: 0.4s;
          opacity: 0;
          transform: translateY(20px);
          max-width: 680px;
          margin-left: auto;
          margin-right: auto;
          font-weight: 400;
        }

        .cta-container {
          animation: ctaSlideIn 1s ease forwards;
          animation-delay: 0.6s;
          opacity: 0;
          transform: translateY(20px);
        }

        .cta-button {
          position: relative;
          display: inline-block;
          padding: ${theme.space[5]} ${theme.space[10]};
          background: linear-gradient(
            135deg,
            ${theme.primary} 0%,
            ${theme.primaryDark} 100%
          );
          color: white;
          text-decoration: none;
          border-radius: 16px;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid ${theme.primary};
          overflow: hidden;
          box-shadow:
            0 8px 25px ${theme.primary}25,
            0 0 0 1px ${theme.primaryLight}20;
        }

        .button-text {
          position: relative;
          z-index: 2;
        }

        .button-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.6s ease;
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow:
            0 12px 35px ${theme.primary}35,
            0 0 0 1px ${theme.primaryLight}30;
        }

        .cta-button:hover .button-shine {
          left: 100%;
        }

        .features-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: ${theme.space[8]};
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .feature-card {
          background: ${theme.background};
          border-radius: 20px;
          padding: ${theme.space[8]};
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          animation: cardSlideIn 0.8s ease forwards;
          display: flex;
          flex-direction: column;
          height: 100%;
          border: 1px solid ${theme.border};
          position: relative;
          overflow: hidden;
        }

        .feature-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            ${theme.primary}60,
            transparent
          );
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow:
            0 20px 40px ${theme.shadowMedium},
            0 0 0 1px ${theme.primaryLight}20;
          border-color: ${theme.primaryLight}40;
        }

        .feature-card:hover .feature-glow {
          opacity: 1;
        }

        .feature-header {
          display: flex;
          align-items: center;
          gap: ${theme.space[5]};
          margin-bottom: ${theme.space[6]};
        }

        .feature-icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 16px;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .gradient-0 {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        }

        .gradient-1 {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .gradient-2 {
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
        }

        .feature-content {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: ${theme.space[5]};
        }

        .feature-title {
          font-size: 1.3rem;
          font-weight: 700;
          margin: 0;
          color: ${theme.text};
          line-height: 1.3;
        }

        .feature-description {
          color: ${theme.textSecondary};
          font-size: 1rem;
          line-height: 1.7;
          margin: 0;
          flex-grow: 1;
          font-weight: 400;
        }

        .feature-highlights {
          display: flex;
          flex-wrap: wrap;
          gap: ${theme.space[3]};
        }

        .highlight-tag {
          padding: ${theme.space[2]} ${theme.space[4]};
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.3s ease;
          border: 1px solid;
        }

        .highlight-0 {
          background: ${theme.primaryGhost}08;
          color: #3b82f6;
          border-color: #3b82f620;
        }

        .highlight-1 {
          background: #10b98108;
          color: #059669;
          border-color: #10b98120;
        }

        .highlight-2 {
          background: #8b5cf608;
          color: #8b5cf6;
          border-color: #8b5cf620;
        }

        .highlight-tag:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        @keyframes sectionFadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ambientPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.5;
          }
        }

        @keyframes badgeSlideIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes titleSlideIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes descSlideIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ctaSlideIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cardSlideIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes lockFloat {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-5px) rotate(2deg);
          }
          75% {
            transform: translateY(-3px) rotate(-1deg);
          }
        }

        @media (max-width: 1024px) {
          .welcome-section {
            padding: ${theme.space[12]} ${theme.space[8]};
          }

          .hero-title {
            font-size: 2.8rem;
          }

          .features-container {
            gap: ${theme.space[6]};
          }
        }

        @media (max-width: 768px) {
          .welcome-section {
            padding: ${theme.space[10]} ${theme.space[6]};
          }

          .hero-title {
            font-size: 2.4rem;
            flex-direction: column;
            gap: ${theme.space[3]};
          }

          .hero-description {
            font-size: 1.2rem;
          }

          .features-container {
            grid-template-columns: 1fr;
            gap: ${theme.space[5]};
          }

          .feature-card {
            padding: ${theme.space[6]};
          }
        }

        @media (max-width: 480px) {
          .welcome-section {
            padding: ${theme.space[8]} ${theme.space[4]};
            border-radius: 18px;
          }

          .hero-title {
            font-size: 2rem;
          }

          .lock-emoji {
            font-size: 2.2rem;
          }

          .hero-description {
            font-size: 1.1rem;
            margin-bottom: ${theme.space[8]};
          }

          .cta-button {
            width: 100%;
            padding: ${theme.space[4]} ${theme.space[8]};
          }

          .feature-card {
            padding: ${theme.space[5]};
          }

          .feature-header {
            gap: ${theme.space[4]};
          }
        }
      `}</style>
    </section>
  );
};

export default React.memo(WelcomeSection);
