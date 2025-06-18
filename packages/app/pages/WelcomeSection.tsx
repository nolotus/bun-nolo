import React from "react";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../hooks";
import { selectTheme } from "../theme/themeSlice";
import { BsRobot, BsShieldCheck, BsLaptop, BsGlobe } from "react-icons/bs";
import { useTranslation } from "react-i18next";

const WelcomeSection = () => {
  const theme = useAppSelector(selectTheme);
  const { t } = useTranslation();

  const features = [
    {
      icon: <BsRobot size={22} />,
      title: t("welcomeSection.feature1.title"),
      description: t("welcomeSection.feature1.description"),
    },
    {
      icon: <BsShieldCheck size={22} />,
      title: t("welcomeSection.feature2.title"),
      description: t("welcomeSection.feature2.description"),
    },
    {
      icon: <BsLaptop size={22} />,
      title: t("welcomeSection.feature3.title"),
      description: t("welcomeSection.feature3.description"),
    },
    {
      icon: <BsGlobe size={22} />,
      title: t("welcomeSection.feature4.title"),
      description: t("welcomeSection.feature4.description"),
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css?family=Rubik:700&display=swap');
      `}</style>
      <section className="welcome-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">
              {t("welcomeSection.heroTitle")}
            </span>
            <span className="wave-emoji" aria-hidden="true">
              {t("welcomeSection.waveEmoji")}
            </span>
          </h1>

          <p className="hero-description">
            {t("welcomeSection.heroDescription")}
          </p>

          <div className="cta-container">
            <NavLink to="/signup" className="cta-button learn-more">
              {t("welcomeSection.ctaButton")}
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
            padding: ${theme.space[12]} ${theme.space[10]};
            max-width: 1200px;
            margin: 0 auto;
            animation: fadeIn 0.5s ease-out;
            overflow: hidden;
            position: relative;
          }

          .hero-content {
            text-align: center;
            max-width: 680px;
            margin: 0 auto ${theme.space[12]};
            position: relative;
            z-index: 1;
          }

          .hero-title {
            font-size: 2.75rem;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: ${theme.space[6]};
            color: ${theme.text};
            display: flex;
            align-items: center;
            justify-content: center;
            gap: ${theme.space[2]};
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
            margin-bottom: ${theme.space[8]};
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
            position: relative;
            display: inline-block;
            cursor: pointer;
            outline: none;
            border: 0;
            vertical-align: middle;
            text-decoration: none;
            font-size: inherit;
            font-family: "Rubik", sans-serif;
            font-weight: 600;
            color: #382b22;
            text-transform: uppercase;
            padding: 1.25em 2em;
            background: #fff0f0;
            border: 2px solid #b18597;
            border-radius: 0.75em;
            transform-style: preserve-3d;
            transition:
              transform 150ms cubic-bezier(0, 0, 0.58, 1),
              background 150ms cubic-bezier(0, 0, 0.58, 1);
          }

          .cta-button::before {
            position: absolute;
            content: "";
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #f9c4d2;
            border-radius: inherit;
            box-shadow:
              0 0 0 2px #b18597,
              0 0.625em 0 0 #ffe3e2;
            transform: translate3d(0, 0.75em, -1em);
            transition:
              transform 150ms cubic-bezier(0, 0, 0.58, 1),
              box-shadow 150ms cubic-bezier(0, 0, 0.58, 1);
          }

          .cta-button:hover {
            background: #ffe9e9;
            transform: translate(0, 0.25em);
          }

          .cta-button:hover::before {
            box-shadow:
              0 0 0 2px #b18597,
              0 0.5em 0 0 #ffe3e2;
            transform: translate3d(0, 0.5em, -1em);
          }

          .cta-button:active {
            background: #ffe9e9;
            transform: translate(0em, 0.75em);
          }

          .cta-button:active::before {
            box-shadow:
              0 0 0 2px #b18597,
              0 0 #ffe3e2;
            transform: translate3d(0, 0, -1em);
          }

          .features-container {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: ${theme.space[6]};
            margin: 0 auto;
          }

          .feature-card {
            background: ${theme.background};
            border-radius: 14px;
            padding: ${theme.space[6]};
            transition: all 0.25s ease;
            opacity: 0;
            animation: fadeInUp 0.5s ease forwards;
            display: flex;
            flex-direction: column;
            height: 100%;
          }

          .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px ${theme.shadowMedium};
          }

          .feature-icon-container {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            border-radius: 10px;
            margin-bottom: ${theme.space[5]};
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
            margin-bottom: ${theme.space[3]};
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
              padding: ${theme.space[10]} ${theme.space[8]};
              border-radius: 16px;
            }

            .features-container {
              gap: ${theme.space[5]};
            }

            .hero-title {
              font-size: 2.5rem;
            }

            .feature-card {
              padding: ${theme.space[5]};
            }
          }

          @media (max-width: 768px) {
            .welcome-section {
              padding: ${theme.space[8]} ${theme.space[6]};
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
              padding: ${theme.space[6]} ${theme.space[4]};
              border-radius: 14px;
            }

            .hero-title {
              font-size: 1.85rem;
              flex-direction: column;
              gap: ${theme.space[2]};
            }

            .wave-emoji {
              font-size: 1.75rem;
            }

            .hero-description {
              font-size: 1rem;
              margin-bottom: ${theme.space[6]};
            }

            .features-container {
              grid-template-columns: 1fr;
              gap: ${theme.space[4]};
            }

            .feature-card {
              padding: ${theme.space[4]};
            }

            .feature-icon-container {
              margin-bottom: ${theme.space[4]};
            }

            .feature-title {
              font-size: 1.05rem;
              margin-bottom: ${theme.space[2]};
            }

            .cta-button {
              width: 100%;
              text-align: center;
              padding: 0.85rem 1.5rem;
            }
          }
        `}</style>
      </section>
    </>
  );
};

export default React.memo(WelcomeSection);
