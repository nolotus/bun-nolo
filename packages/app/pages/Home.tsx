import { DependabotIcon, MailIcon } from "@primer/octicons-react";
import { useAppSelector } from "../hooks";
import { selectTheme } from "../theme/themeSlice";
import { selectIsLoggedIn } from "../../auth/authSlice"; // 更新路径
import copyToClipboard from "utils/clipboard";
import toast from "react-hot-toast";
import PubCybots from "ai/cybot/web/PubCybots";
import WelcomeSection from "./WelcomeSection"; // 导入新的 WelcomeSection 组件
import GuideSection from "./GuideSection"; // 导入新的 GuideSection 组件

const EMAIL = "s@nolotus.com";

const Home = () => {
  const theme = useAppSelector(selectTheme);
  const isLoggedIn = useAppSelector(selectIsLoggedIn); // 获取用户的登录状态

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
        {isLoggedIn ? <GuideSection /> : <WelcomeSection />} {/* 根据登录状态显示不同的组件 */}
        <section className="section">
          <h2 className="section-title">看看其他人都建立了什么样的cybot</h2>
          <div className="cybots-container">
            <PubCybots limit={8} />
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
      `}</style>
    </>
  );
};

export default Home;
