import { DependabotIcon } from "@primer/octicons-react";
import Cybots from "ai/cybot/Cybots";
import { nolotusId } from "core/init";
import { motion } from "framer-motion";
import React from "react";
import { NavLink } from "react-router-dom";
import { SpotList } from "render/components/SpotList";
import { defaultTheme } from "render/styles/colors";

const Home = () => {
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
            padding: 1.5rem;
            backdrop-filter: blur(10px);
            background: ${defaultTheme.backgroundSecondary};
            border: 1px solid ${defaultTheme.border};
            border-radius: 16px;
            box-shadow: 0 2px 15px ${defaultTheme.shadowLight};
            transition: all 0.3s ease;
          }

          .welcome-text {
            background: ${defaultTheme.primaryGradient};
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: inline-block;
            letter-spacing: -1px;
          }

          .intro-text {
            font-weight: 400;
            color: ${defaultTheme.textSecondary};
            line-height: 1.6;
          }

          .signup-link {
            display: inline-block;
            padding: 0.8rem 2rem;
            background: ${defaultTheme.primary};
            color: #FFFFFF;
            border-radius: 30px;
            text-decoration: none;
            font-weight: 500;
            margin-top: 1.5rem;
            font-size: 1rem;
            box-shadow: 0 4px 15px ${defaultTheme.primaryGhost};
            transition: all 0.3s ease;
          }

          .signup-link:hover {
            background: ${defaultTheme.primaryLight};
            transform: translateY(-2px);
          }

          .section-title {
            font-size: 2.2rem;
            color: ${defaultTheme.text};
            margin: 3rem 0;
            font-weight: 600;
            letter-spacing: -0.5px;
          }

          .features-grid {
            gap: 2rem;
            padding: 1.5rem;
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
				<motion.section
					className="hero-section"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					style={{
						background: defaultTheme.backgroundSecondary,
						borderRadius: "24px",
						padding: "3rem 1.5rem",
						marginBottom: "3rem",
						boxShadow: `0 4px 20px ${defaultTheme.shadowLight}`,
					}}
				>
					<motion.div
						style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}
					>
						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
							style={{
								fontSize: "3.2rem",
								marginBottom: "1.5rem",
								fontWeight: "700",
								lineHeight: "1.2",
								color: defaultTheme.text,
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
										color: defaultTheme.primary,
									}}
								/>
							</p>
							<p>要不要来试试看？</p>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.6 }}
						>
							<NavLink to="/signup" className="signup-link">
								开始体验
							</NavLink>
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
						marginBottom: "3rem",
					}}
				>
					{features.map((feature, index) => (
						<motion.div
							key={index}
							variants={item}
							whileHover={{
								y: -8,
								background: defaultTheme.background,
								boxShadow: `0 12px 30px ${defaultTheme.shadowMedium}`,
								borderColor: defaultTheme.primary,
							}}
							className="feature-card"
						>
							<div style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>
								{feature.icon}
							</div>
							<h3
								style={{
									fontSize: "1.1rem",
									marginBottom: "0.6rem",
									color: defaultTheme.text,
									fontWeight: "600",
								}}
							>
								{feature.title}
							</h3>
							<p
								style={{
									color: defaultTheme.textSecondary,
									fontSize: "0.95rem",
									lineHeight: "1.5",
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
					style={{ marginBottom: "3rem", textAlign: "center" }}
				>
					<h2 className="section-title">看看其他人都在用 Cybot 做什么</h2>
					<div style={{ marginBottom: "3rem" }}>
						<Cybots queryUserId={nolotusId} limit={8} />
					</div>
				</motion.section>

				<motion.section
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					style={{ marginBottom: "3rem", textAlign: "center" }}
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
						color: defaultTheme.textSecondary,
						fontSize: "0.95rem",
						padding: "2rem 0",
						borderTop: `1px solid ${defaultTheme.border}`,
					}}
				>
					<p style={{ marginBottom: "0.8rem" }}>本站正在测试中，欢迎反馈</p>
					<a
						href="mailto:s@nolotus.com"
						style={{
							color: defaultTheme.primary,
							textDecoration: "none",
							borderBottom: `1px dashed ${defaultTheme.primary}`,
							padding: "0.2rem 0",
							transition: "color 0.3s ease",
						}}
						onMouseEnter={(e) => {
							e.target.style.color = defaultTheme.primaryLight;
						}}
						onMouseLeave={(e) => {
							e.target.style.color = defaultTheme.primary;
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
