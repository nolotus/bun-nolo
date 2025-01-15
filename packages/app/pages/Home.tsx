import { DependabotIcon } from "@primer/octicons-react";
import Cybots from "ai/cybot/web/Cybots";
import { nolotusId } from "core/init";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../hooks";
import { selectTheme } from "../theme/themeSlice";

const Home = () => {
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
      <style>
        {`
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

          .fade-in {
            opacity: 0;
            animation: fadeInUp 0.6s ease forwards;
          }

          .fade-in-delay-1 {
            animation-delay: 0.2s;
          }

          .fade-in-delay-2 {
            animation-delay: 0.4s;
          }

          .fade-in-delay-3 {
            animation-delay: 0.6s;
          }

          .feature-card {
            padding: 1.5rem;
            backdrop-filter: blur(10px);
            background: ${theme.backgroundSecondary};
            border: 1px solid ${theme.border};
            border-radius: 16px;
            box-shadow: 0 2px 15px ${theme.shadowLight};
            transition: all 0.3s ease;
            opacity: 0;
            animation: fadeInUp 0.6s ease forwards;
          }

          .feature-card:hover {
            transform: translateY(-8px);
            background: ${theme.background};
            box-shadow: 0 12px 30px ${theme.shadowMedium};
            border-color: ${theme.primary};
          }

          .welcome-text {
            background: ${theme.primaryGradient};
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: inline-block;
            letter-spacing: -1px;
          }

          .intro-text {
            font-weight: 400;
            color: ${theme.textSecondary};
            line-height: 1.6;
          }

          .signup-link {
            display: inline-block;
            padding: 0.8rem 2rem;
            background: ${theme.primary};
            color: #FFFFFF;
            border-radius: 30px;
            text-decoration: none;
            font-weight: 500;
            margin-top: 1.5rem;
            font-size: 1rem;
            box-shadow: 0 4px 15px ${theme.primaryGhost};
            transition: all 0.3s ease;
          }

          .signup-link:hover {
            background: ${theme.primaryLight};
            transform: translateY(-2px);
          }

          .section-title {
            font-size: 2.2rem;
            color: ${theme.text};
            margin: 3rem 0;
            font-weight: 600;
            letter-spacing: -0.5px;
            opacity: 0;
            animation: fadeInUp 0.6s ease forwards;
          }

          .features-grid {
            gap: 2rem;
            padding: 1.5rem;
          }

          .section {
            opacity: 0;
            animation: fadeInUp 0.6s ease forwards;
          }

          .section.delay {
            animation-delay: 0.2s;
          }

          @media (max-width: 768px) {
            .features-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            
            .section-title {
              font-size: 2rem;
              margin: 2.5rem 0;
            }
          }
        `}
      </style>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem" }}>
        <section
          className="hero-section fade-in"
          style={{
            background: theme.backgroundSecondary,
            borderRadius: "24px",
            padding: "3rem 1.5rem",
            marginBottom: "3rem",
            boxShadow: `0 4px 20px ${theme.shadowLight}`,
          }}
        >
          <div
            style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}
          >
            <h1
              className="fade-in fade-in-delay-1"
              style={{
                fontSize: "3.2rem",
                marginBottom: "1.5rem",
                fontWeight: "700",
                lineHeight: "1.2",
                color: theme.text,
              }}
            >
              <span className="welcome-text">Hey，我是 Nolotus</span> 👋
            </h1>

            <div
              className="intro-text fade-in fade-in-delay-2"
              style={{
                fontSize: "1.3rem",
                marginBottom: "1.5rem",
              }}
            >
              <p style={{ marginBottom: "0.8rem" }}>
                作为程序员，我一直在寻找更智能的方式来管理数字生活
              </p>
              <p style={{ marginBottom: "0.8rem" }}>
                所以我打造了这个AI助手，它能帮你整理笔记、规划日程、分析数据
                <DependabotIcon
                  size={20}
                  style={{
                    margin: "0 6px",
                    verticalAlign: "middle",
                    color: theme.primary,
                  }}
                />
              </p>
              <p>要不要来试试看？</p>
            </div>

            <div className="fade-in fade-in-delay-3">
              <NavLink to="/signup" className="signup-link">
                开始体验
              </NavLink>
            </div>
          </div>
        </section>

        <div
          className="features-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            marginBottom: "3rem",
          }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>
                {feature.icon}
              </div>
              <h3
                style={{
                  fontSize: "1.1rem",
                  marginBottom: "0.6rem",
                  color: theme.text,
                  fontWeight: "600",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  color: theme.textSecondary,
                  fontSize: "0.95rem",
                  lineHeight: "1.5",
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <section
          className="section"
          style={{ marginBottom: "3rem", textAlign: "center" }}
        >
          <h2 className="section-title">看看其他人都在用 Cybot 做什么</h2>
          <div style={{ marginBottom: "3rem" }}>
            <Cybots queryUserId={nolotusId} limit={8} />
          </div>
        </section>

        <footer
          className="section delay"
          style={{
            textAlign: "center",
            color: theme.textSecondary,
            fontSize: "0.95rem",
            padding: "2rem 0",
            borderTop: `1px solid ${theme.border}`,
          }}
        >
          <p style={{ marginBottom: "0.8rem" }}>本站正在测试中，欢迎反馈</p>
          <a
            href="mailto:s@nolotus.com"
            style={{
              color: theme.primary,
              textDecoration: "none",
              borderBottom: `1px dashed ${theme.primary}`,
              padding: "0.2rem 0",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.color = theme.primaryLight;
            }}
            onMouseLeave={(e) => {
              e.target.style.color = theme.primary;
            }}
          >
            s@nolotus.com
          </a>
        </footer>
      </div>
    </>
  );
};

export default Home;
