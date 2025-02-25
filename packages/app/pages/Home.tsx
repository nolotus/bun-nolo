import { DependabotIcon, MailIcon, PersonAddIcon, ChevronDownIcon, GlobeIcon } from "@primer/octicons-react";
import { useAppSelector } from "../hooks";
import { selectTheme } from "../theme/themeSlice";
import { selectIsLoggedIn } from "../../auth/authSlice";
import { NavLink } from 'react-router-dom'; // 添加路由组件
import copyToClipboard from "utils/clipboard";
import toast from "react-hot-toast";
import PubCybots from "ai/cybot/web/PubCybots";
import WelcomeSection from "./WelcomeSection";
import GuideSection from "./GuideSection";

const EMAIL = "s@nolotus.com";

const Home = () => {
  const theme = useAppSelector(selectTheme);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

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
        {isLoggedIn ? <GuideSection /> : <WelcomeSection />}

        {/* 添加登录/注册区域 */}
        <section className="auth-section fade-in">
          <div className="auth-content">
            <h2 className="auth-title">
              <PersonAddIcon size={24} className="auth-title-icon" />
              多账户管理
            </h2>
            <p className="auth-subtitle">
              本站支持多账户使用，您可以点击
              <NavLink to="/login" className="auth-link">
                登录
              </NavLink>
              /
              <NavLink to="/signup" className="auth-link">
                注册
              </NavLink>
              添加新账户，或在右上角点击
              <ChevronDownIcon size={16} />
              切换账户
            </p>
          </div>
        </section>

        <section className="section">

          <h2 className="section-title">
            <GlobeIcon size={24} className="section-title-icon" />
            社区发布的cybot
          </h2>

          <div className="cybots-container">
            <PubCybots limit={9} />
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
      <style jsx>{`
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

        .section {
          opacity: 0;
          animation: fadeInUp 0.6s ease forwards;
         
        }

        .section.delay {
          animation-delay: 0.2s;
        }

        .section-title {
          font-size: 2rem;
          color: ${theme.text};
          margin: 3rem 0;
          font-weight: 600;
          letter-spacing: -0.5px;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .section-title-icon {
          color: ${theme.primary}; /* 图标颜色 */
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
        
        /* 新增样式 */
        .auth-section {
          background: ${theme.backgroundSecondary};
          border-radius: 24px;
          padding: 1rem;
          padding-bottom: 4rem;
          margin: 1.5rem auto;
          max-width: 1200px;
          box-shadow: 0 8px 30px ${theme.shadowLight};
          opacity: 0;
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          text-align: center; /* 中心对齐 */
        }

        .auth-content {
          margin: 0 auto; /* 使内容居中 */
        }

        .auth-title {
          font-size: 1.5rem;
          color: ${theme.text};
          margin-bottom: 0.5rem;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .auth-title-icon {
          color: ${theme.primary}; /* 图标颜色 */
        }

        .auth-subtitle {
          font-size: 1rem;
          color: ${theme.textSecondary};
          margin-bottom: 0;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-subtitle-icon {
          color: ${theme.primary};
          margin-right: 0.3rem;
        }

        .auth-link {
          color: ${theme.primary};
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
          padding: 0 0.3rem;
        }

        .auth-link:hover {
          color: ${theme.primaryDark};
        }
      `}</style>
    </>
  );
};

export default Home;
