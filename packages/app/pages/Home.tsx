// Home.tsx
import {
  DependabotIcon,
  MailIcon,
  PersonAddIcon,
  ChevronDownIcon,
  GlobeIcon,
} from "@primer/octicons-react";
import { useAppSelector } from "../hooks"; // 确保路径正确
import { selectTheme } from "../theme/themeSlice"; // 确保路径正确
// selectCurrentUser 仍然可以保留，用于 Home 组件的条件渲染逻辑
import { selectIsLoggedIn, selectCurrentUser } from "../../auth/authSlice"; // 确保路径正确
import { NavLink } from "react-router-dom";
import copyToClipboard from "utils/clipboard"; // 确保路径正确
import toast from "react-hot-toast";
import PubCybots from "ai/cybot/web/PubCybots"; // 确保路径正确
import WelcomeSection from "./WelcomeSection"; // 确保路径正确
import GuideSection from "./GuideSection"; // GuideSection 不再需要 userId

const EMAIL = "s@nolotus.com";

const Home = () => {
  const theme = useAppSelector(selectTheme);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  // 保留 currentUser 用于判断是否渲染 GuideSection
  const currentUser = useAppSelector(selectCurrentUser);

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
        {/* 条件渲染 GuideSection，不再传递 userId */}
        {isLoggedIn && currentUser ? <GuideSection /> : <WelcomeSection />}

        <section className="section">
          <h2 className="section-title">
            <GlobeIcon size={24} className="section-title-icon" />
            社区发布的 Cybot
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
      {/* Home 组件的样式 (保持不变) */}
      <style jsx>{`
        /* ... 省略与之前相同的样式 ... */
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
      `}</style>
    </>
  );
};

export default Home;
