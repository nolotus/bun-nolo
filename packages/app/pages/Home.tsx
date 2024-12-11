import { nolotusId } from "core/init";
import Cybots from "ai/cybot/Cybots";
import { useAppSelector } from "app/hooks";
import { DependabotIcon } from "@primer/octicons-react";
import React from "react";
import { selectCurrentUserId } from "auth/authSlice";
import { SpotList } from "render/components/SpotList";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

interface LinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  target?: "_blank" | "_self" | "_parent" | "_top";
}

const Link: React.FC<LinkProps> = ({
  to,
  children,
  className = "",
  style = {},
  target = "_self",
}) => {
  return (
    <NavLink to={to} style={style} target={target} className={className}>
      {children}
    </NavLink>
  );
};

const Home = () => {
  const userId = useAppSelector(selectCurrentUserId);

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <>
      <style>
        {`
          .feature-card {
            padding: 2rem;
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 16px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.06);
          }

          .welcome-text {
            background: linear-gradient(45deg, #0062ff, #33ccff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: inline-block;
            letter-spacing: -1px;
          }

          .intro-text {
            font-weight: 300;
            color: #445;
          }

          .signup-link {
            display: inline-block;
            padding: 1rem 2.5rem;
            background: linear-gradient(45deg, #0062ff, #33ccff);
            color: white;
            border-radius: 30px;
            text-decoration: none;
            font-weight: 500;
            margin-top: 2rem;
            font-size: 1.1rem;
            box-shadow: 0 4px 15px rgba(0, 98, 255, 0.2);
          }

          .section-title {
            font-size: 2.5rem;
            color: #2a2a2a;
            margin: 4rem 0;
            font-weight: 600;
            letter-spacing: -0.5px;
          }

          .features-grid {
            gap: 2.5rem;
            padding: 2rem;
          }

          @media (max-width: 768px) {
            .features-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            
            .section-title {
              font-size: 2rem;
              margin: 3rem 0;
            }
          }
        `}
      </style>

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "2rem",
        }}
      >
        <motion.section
          className="hero-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            background: "linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%)",
            borderRadius: "24px",
            padding: "4rem 2rem",
            marginBottom: "4rem",
          }}
        >
          <motion.div
            style={{
              textAlign: "center",
              maxWidth: "900px",
              margin: "0 auto",
            }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: "3.8rem",
                marginBottom: "2rem",
                fontWeight: "700",
                lineHeight: "1.2",
              }}
            >
              <span className="welcome-text">Hey，我是 Nolotus</span> 👋
            </motion.h1>

            <motion.div
              className="intro-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                fontSize: "1.5rem",
                lineHeight: "1.8",
                marginBottom: "2rem",
              }}
            >
              <p style={{ marginBottom: "1rem" }}>
                作为程序员，我一直在寻找更智能的方式来管理数字生活
              </p>
              <p style={{ marginBottom: "1rem" }}>
                所以我打造了这个AI助手，它能帮你整理笔记、规划日程、分析数据
                <DependabotIcon
                  size={24}
                  style={{ margin: "0 8px", verticalAlign: "middle" }}
                />
              </p>
              <p>要不要来试试看？</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link to="/signup" className="signup-link">
                开始体验
              </Link>
            </motion.div>
          </motion.div>
        </motion.section>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="features-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            marginBottom: "5rem",
          }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{
                y: -8,
                boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
                borderColor: "rgba(0, 98, 255, 0.1)",
              }}
              className="feature-card"
            >
              <div
                style={{
                  fontSize: "2.2rem",
                  marginBottom: "1rem",
                }}
              >
                {feature.icon}
              </div>
              <h3
                style={{
                  fontSize: "1.2rem",
                  marginBottom: "0.8rem",
                  color: "#2a2a2a",
                  fontWeight: "600",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  color: "#666",
                  fontSize: "1rem",
                  lineHeight: "1.6",
                }}
              >
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            marginBottom: "5rem",
            textAlign: "center",
          }}
        >
          <h2 className="section-title">看看其他人都在用 Cybot 做什么</h2>
          <div style={{ marginBottom: "4rem" }}>
            <Cybots queryUserId={userId ? userId : nolotusId} limit={6} />
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            marginBottom: "5rem",
            textAlign: "center",
          }}
        >
          <h2 className="section-title">我用 Cybot 记录的一些地方</h2>
          <SpotList userId={nolotusId} />
        </motion.section>

        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            textAlign: "center",
            color: "#888",
            fontSize: "1rem",
            padding: "3rem 0",
            borderTop: "1px solid #eee",
          }}
        >
          <p style={{ marginBottom: "1rem" }}>本站正在测试中，欢迎反馈</p>
          <a
            href="mailto:s@nolotus.com"
            style={{
              color: "#666",
              textDecoration: "none",
              borderBottom: "1px dashed #666",
              padding: "0.2rem 0",
            }}
          >
            s@nolotus.com
          </a>
        </motion.footer>
      </div>
    </>
  );
};

export default Home;
