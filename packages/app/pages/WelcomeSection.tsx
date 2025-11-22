import React from "react";
import { NavLink } from "react-router-dom";
import { LuBrainCircuit, LuPalette, LuStore } from "react-icons/lu";
import { useTranslation } from "react-i18next";

const WelcomeSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <LuBrainCircuit size={24} />,
      title: t("welcomeSection.feature1.title"),
      description: t("welcomeSection.feature1.description"),
      highlights: [
        t("welcomeSection.feature1.highlights.0"),
        t("welcomeSection.feature1.highlights.1"),
        t("welcomeSection.feature1.highlights.2"),
      ],
    },
    {
      icon: <LuPalette size={24} />,
      title: t("welcomeSection.feature2.title"),
      description: t("welcomeSection.feature2.description"),
      highlights: [
        t("welcomeSection.feature2.highlights.0"),
        t("welcomeSection.feature2.highlights.1"),
        t("welcomeSection.feature2.highlights.2"),
      ],
    },
    {
      icon: <LuStore size={24} />,
      title: t("welcomeSection.feature3.title"),
      description: t("welcomeSection.feature3.description"),
      highlights: [
        t("welcomeSection.feature3.highlights.0"),
        t("welcomeSection.feature3.highlights.1"),
        t("welcomeSection.feature3.highlights.2"),
      ],
    },
  ];

  const gradients = [
    "linear-gradient(135deg, #2dd4bf, #06b6d4)",
    "linear-gradient(135deg, #a78bfa, #8b5cf6)",
    "linear-gradient(135deg, #fb923c, #f97316)",
  ];

  const highlightStyles = [
    {
      bg: "rgba(45, 212, 191, 0.08)",
      color: "#14b8a6",
      border: "rgba(45, 212, 191, 0.12)",
    },
    {
      bg: "rgba(139, 92, 246, 0.08)",
      color: "#8b5cf6",
      border: "rgba(139, 92, 246, 0.12)",
    },
    {
      bg: "rgba(251, 146, 60, 0.08)",
      color: "#f97316",
      border: "rgba(251, 146, 60, 0.12)",
    },
  ];

  return (
    <section className="welcome-section">
      <div className="ambient-light"></div>

      <div className="hero-content">
        <h1 className="hero-title fade-up" style={{ animationDelay: "0.2s" }}>
          <span className="gradient-text">{t("welcomeSection.heroTitle")}</span>
        </h1>

        <p
          className="hero-description fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          {t("welcomeSection.heroDescription")}
        </p>

        <div
          className="cta-container fade-up"
          style={{ animationDelay: "0.6s" }}
        >
          <NavLink to="/signup" className="cta-button">
            {t("welcomeSection.ctaButton")}
          </NavLink>
        </div>
      </div>

      <div className="features-container">
        {features.map((feature, index) => (
          <div
            key={index}
            className="feature-card fade-up"
            style={{ animationDelay: `${0.5 + index * 0.15}s` }}
          >
            <div className="feature-header">
              <div
                className="feature-icon-container"
                style={{ background: gradients[index] }}
              >
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
            </div>

            <div className="feature-content">
              <p className="feature-description">{feature.description}</p>

              <div className="feature-highlights">
                {feature.highlights.map((highlight, hIndex) => {
                  const s = highlightStyles[index];
                  return (
                    <span
                      key={hIndex}
                      className="highlight-tag"
                      style={{
                        background: s.bg,
                        color: s.color,
                        borderColor: s.border,
                      }}
                    >
                      {highlight}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .welcome-section {
          padding: var(--space-16) var(--space-12);
          max-width: 1200px;
          margin: 0 auto;
          overflow: hidden;
          position: relative;
        }

        .ambient-light {
          position: absolute;
          inset: -50%;
          background: radial-gradient(
            circle at 50% 50%,
            var(--primaryGhost) 0%,
            transparent 50%
          );
          animation: ambientPulse 4s ease-in-out infinite;
          pointer-events: none;
        }

        .hero-content {
          text-align: center;
          max-width: 760px;
          margin: 0 auto var(--space-16);
          position: relative;
          z-index: 2;
        }

        .fade-up {
          opacity: 0;
          animation: slideUpFadeIn 0.8s ease-out forwards;
        }

        .hero-title {
          font-size: 3.2rem;
          font-weight: 800;
          line-height: 1.1;
          margin: var(--space-6) 0 var(--space-8);
          color: var(--text);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-4);
        }

        .gradient-text {
          background: linear-gradient(
            135deg,
            var(--primary) 0%,
            var(--primaryDark) 50%,
            #8b5cf6 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-description {
          font-size: 1.35rem;
          line-height: 1.65;
          color: var(--textSecondary);
          margin: 0 auto var(--space-10);
          max-width: 680px;
          font-weight: 400;
        }

        .cta-button {
          position: relative;
          display: inline-block;
          padding: var(--space-3) var(--space-10);
          background: var(--primaryGradient);
          color: white;
          text-decoration: none;
          border-radius: 9999px;
          font-weight: 500;
          font-size: 1.05rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          box-shadow: 0 4px 15px var(--focus);
        }

        .cta-button::after {
          content: "";
          position: absolute;
          inset: 0;
          left: -100%;
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
          box-shadow: 0 7px 20px var(--primaryGhost);
        }
        .cta-button:hover::after { left: 100%; }

        .features-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: var(--space-8);
          position: relative;
          z-index: 1;
        }

        .feature-card {
          background: var(--background);
          border-radius: 20px;
          padding: var(--space-8);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border);
          position: relative;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px var(--shadowMedium), 0 0 0 1px var(--primary);
          border-color: var(--primary);
        }

        .feature-header {
          display: flex;
          align-items: center;
          gap: var(--space-5);
          margin-bottom: var(--space-6);
        }

        .feature-icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 16px;
          color: white;
        }

        .feature-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
          flex-grow: 1;
        }

        .feature-title {
          font-size: 1.3rem;
          font-weight: 700;
          margin: 0;
          color: var(--text);
        }

        .feature-description {
          color: var(--textSecondary);
          font-size: 1rem;
          line-height: 1.7;
          margin: 0;
          flex-grow: 1;
        }

        .feature-highlights {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-3);
        }

        .highlight-tag {
          padding: var(--space-2) var(--space-4);
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 500;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid;
        }

        .highlight-tag:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px var(--shadowLight);
        }

        @keyframes slideUpFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes ambientPulse {
          50% { transform: scale(1.1); opacity: 0.5; }
          0%, 100% { transform: scale(1); opacity: 0.3; }
        }

        @media (max-width: 768px) {
          .welcome-section { padding: var(--space-10) var(--space-6); }
          .hero-title {
            font-size: 2.4rem;
            flex-direction: column;
            gap: var(--space-3);
          }
          .hero-description { font-size: 1.2rem; }
          .feature-card { padding: var(--space-6); }
          .cta-button { width: 100%; padding: var(--space-4) var(--space-8); }
        }
      `}</style>
    </section>
  );
};

export default React.memo(WelcomeSection);
