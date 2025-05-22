import { useAppSelector } from "../hooks";
import { selectTheme } from "../theme/themeSlice";
import { selectIsLoggedIn, selectCurrentUser } from "../../auth/authSlice";
import copyToClipboard from "utils/clipboard";
import toast from "react-hot-toast";
import PubCybots from "ai/cybot/web/PubCybots";
import WelcomeSection from "./WelcomeSection";
import GuideSection from "./GuideSection";
import SectionHeader from "./SectionHeader"; // 引入新组件
import { FiGlobe, FiMail } from "react-icons/fi";

const EMAIL = "s@nolotus.com";

const Home = () => {
  const theme = useAppSelector(selectTheme);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const currentUser = useAppSelector(selectCurrentUser);

  const handleEmailClick = (e) => {
    if (e.ctrlKey || e.metaKey) {
      return;
    }
    e.preventDefault();
    copyToClipboard(EMAIL, {
      onSuccess: () => toast.success("邮箱已复制到剪贴板"),
      onError: () => toast.error("复制失败，请手动复制"),
    });
  };

  return (
    <div className="home-container">
      {isLoggedIn && currentUser ? <GuideSection /> : <WelcomeSection />}

      <section className="community-section">
        <SectionHeader
          title="探索社区 Cybot"
          icon={<FiGlobe />}
          linkText="浏览更多"
          linkTo="/explore"
        />
        <div className="cybots-container">
          <PubCybots limit={9} />
        </div>
      </section>

      <footer className="footer">
        <p>Cybot 平台正在持续优化中，期待您的宝贵反馈</p>
        <a
          href={`mailto:${EMAIL}`}
          onClick={handleEmailClick}
          className="email-link"
          aria-label="联系我们"
        >
          <FiMail size={16} />
          {EMAIL}
          <span className="email-hint">(点击复制 / Ctrl+点击发送邮件)</span>
        </a>
      </footer>

      <style>{`
        .home-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem;
        }

        .community-section {
          opacity: 0;
          animation: fadeIn 0.8s ease forwards;
          animation-delay: 0.2s;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .cybots-container {
          margin-bottom: 3rem;
          min-height: 200px;
        }

        .footer {
          text-align: center;
          color: ${theme.textSecondary};
          font-size: 0.95rem;
          padding: 2rem 0;
          border-top: 1px solid ${theme.border};
          opacity: 0;
          animation: fadeIn 0.8s ease forwards;
          animation-delay: 0.4s;
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
          padding: 0.5rem 1rem;
          border-radius: 6px;
          transition: all 0.2s ease;
          background-color: rgba(0, 0, 0, 0.02);
        }

        .email-link:hover {
          background-color: ${theme.backgroundLight};
          transform: translateY(-2px);
        }

        .email-hint {
          font-size: 0.8rem;
          color: ${theme.textSecondary};
          margin-left: 3px;
        }

        @media (max-width: 768px) {
          .home-container {
            padding: 1rem;
          }

          .footer {
            padding: 1.5rem 0;
          }
        }

        @media (max-width: 480px) {
          .email-link {
            flex-direction: column;
            gap: 0.3rem;
            padding: 0.5rem;
          }

          .email-hint {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
