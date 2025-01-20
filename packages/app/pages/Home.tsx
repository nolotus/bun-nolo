import { DependabotIcon, MailIcon } from "@primer/octicons-react";
import Cybots from "ai/cybot/web/Cybots";
import { nolotusId } from "core/init";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../hooks";
import { selectTheme } from "../theme/themeSlice";
import copyToClipboard from "utils/clipboard";
import toast from "react-hot-toast";

const EMAIL = "s@nolotus.com";

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

  const handleEmailClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      return;
    }

    e.preventDefault();
    copyToClipboard(EMAIL, {
      onSuccess: () => toast.success("邮箱已复制"),
      onError: () => toast.error("复制失败,请重试"),
    });
  };

  return (
    <>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem" }}>
        <section className="hero-section fade-in">
          <div className="hero-content">
            <h1 className="hero-title fade-in fade-in-delay-1">
              <span className="welcome-text">Hey，欢迎使用Cybot</span> 👋
            </h1>

            <div className="intro-text fade-in fade-in-delay-2">
              <p>你可以根据你的需求来定制AI，</p>

              <p>要不要来试试看？</p>
            </div>

            <div className="fade-in fade-in-delay-3">
              <NavLink to="/signup" className="signup-link">
                开始体验
              </NavLink>
            </div>
          </div>
        </section>

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

        <section className="section">
          <h2 className="section-title">看看其他人都在用 Cybot 做什么</h2>
          <div className="cybots-container">
            <Cybots queryUserId={nolotusId} limit={8} />
          </div>
        </section>

        <footer className="footer section delay">
          <p>本站正在测试中，欢迎反馈</p>
          <a
            href={`mailto:${EMAIL}`}
            onClick={handleEmailClick}
            className="email-link"
          >
            <MailIcon size={16} />
            {EMAIL}
            <span className="email-hint">(点击复制 / Ctrl+点击发送邮件)</span>
          </a>
        </footer>
      </div>
      <style href="landing">{`
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(25px);
    }
    to {
      opacity: 1; 
      transform: translateY(0);
    }
  }

  .fade-in {
    opacity: 0;
    animation: fadeInUp 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards;
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

  .hero-section {
    background: ${theme.backgroundSecondary};
    border-radius: 32px;
    padding: 4rem 2rem;
    margin-bottom: 4rem;
    box-shadow: 0 4px 20px ${theme.shadowLight};
    transition: transform 0.3s ease;
  }

  .hero-content {
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
  }

  .hero-title {
    font-size: 3.5rem;
    margin-bottom: 2rem;
    font-weight: 800;
    line-height: 1.1;
    color: ${theme.text};
    letter-spacing: -0.5px;
  }

  .welcome-text {
    background: ${theme.primaryGradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
    letter-spacing: -1px;
  }

  .intro-text {
    font-size: 1.4rem;
    margin-bottom: 2rem;
    font-weight: 400;
    color: ${theme.textSecondary};
    line-height: 1.7;
  }

  .intro-text p {
    margin-bottom: 0.8rem;
  }

  .dependabot-icon {
    margin: 0 6px;
    vertical-align: middle;
    color: ${theme.primary};
  }

  .signup-link {
    display: inline-block;
    padding: 1rem 2.5rem;
    background: ${theme.primary};
    color: #ffffff;
    border-radius: 30px;
    text-decoration: none;
    font-weight: 600;
    margin-top: 1.5rem;
    font-size: 1.1rem;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 15px ${theme.primaryGhost};
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .signup-link:hover {
    background: ${theme.primaryLight};
    transform: translateY(-2px);
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2.5rem;
    padding: 1.5rem;
    margin: 4rem 0;
  }

  .feature-card {
    padding: 2rem;
    backdrop-filter: blur(10px);
    background: ${theme.backgroundSecondary};
    border: 1px solid ${theme.border};
    border-radius: 20px;
    box-shadow: 0 2px 15px ${theme.shadowLight};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0;
    animation: fadeInUp 0.6s ease forwards;
  }

  .feature-card:hover {
    transform: translateY(-6px);
    background: ${theme.background};
    box-shadow: 0 12px 30px ${theme.shadowMedium};
    border-color: ${theme.primary};
  }

  .feature-icon {
    font-size: 2.5rem;
    margin-bottom: 1.2rem;
  }

  .feature-title {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: ${theme.text};
    font-weight: 700;
  }

  .feature-description {
    color: ${theme.textSecondary};
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .section {
    opacity: 0;
    animation: fadeInUp 0.6s ease forwards;
  }

  .section.delay {
    animation-delay: 0.2s;
  }

  .section-title {
    font-size: 2.2rem;
    color: ${theme.text};
    margin: 3rem 0;
    font-weight: 600;
    letter-spacing: -0.5px;
    text-align: center;
  }

  .cybots-container {
    margin-bottom: 3rem;
  }

  .footer {
    text-align: center;
    color: ${theme.textSecondary};
    font-size: 0.95rem;
    padding: 2rem 0;
    border-top: 1px solid ${theme.border};
  }

  .footer p {
    margin-bottom: 0.8rem;
  }

  .email-link {
    color: ${theme.primary};
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .email-link:hover {
    background: ${theme.backgroundLight};
  }

  .email-hint {
    font-size: 0.8rem;
    color: ${theme.textSecondary};
  }

  @media (max-width: 768px) {
    .hero-section {
      padding: 3rem 1.5rem;
    }

    .hero-title {
      font-size: 2.8rem;
    }

    .intro-text {
      font-size: 1.2rem;
      line-height: 1.6;
    }

    .features-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      padding: 1rem;
    }

    .section-title {
      font-size: 2rem;
      margin: 2.5rem 0;
    }
  }

  @media (max-width: 480px) {
    .features-grid {
      grid-template-columns: 1fr;
    }

    .hero-title {
      font-size: 2.4rem;
    }

    .intro-text {
      font-size: 1.1rem;
    }
  }
`}</style>
    </>
  );
};

export default Home;
