// render/layout/Sidebar.tsx

import { selectTheme } from "app/theme/themeSlice";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { defaultTheme } from "../styles/colors";
import { layout } from "../styles/layout";
import ResizeHandle from "./ResizeHandle";
import { SidebarTop } from "./SidebarTop";
import TopBar from "./TopBar";

// 修改接口定义,使 sidebarContent 可选
interface SidebarProps {
	children: React.ReactNode;
	sidebarContent?: React.ReactNode; // 改为可选
	topbarContent?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({
	children,
	sidebarContent,
	topbarContent,
}) => {
	// 只在有 sidebarContent 时才初始化和处理侧边栏状态
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const sidebarRef = useRef<HTMLDivElement>(null);
	const theme = useSelector(selectTheme);

	const toggleSidebar = useCallback(() => {
		setIsSidebarOpen((prev) => !prev);
	}, []);

	useEffect(() => {
		// 只在有侧边栏内容时才添加事件监听
		if (!sidebarContent) return;

		const handleResize = () => {
			if (typeof window !== "undefined") {
				setIsSidebarOpen(window.innerWidth >= 768);
			}
		};
		handleResize();
		window.addEventListener("resize", handleResize);

		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key === "b") {
				event.preventDefault();
				toggleSidebar();
			}
		};
		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [toggleSidebar, sidebarContent]);

	return (
		<div
			style={{
				...layout.flex,
				minHeight: "100vh",
			}}
		>
			{/* 只在有 sidebarContent 时渲染侧边栏 */}
			{sidebarContent && (
				<aside
					ref={sidebarRef}
					style={{
						...sidebarStyles(theme, isSidebarOpen, theme.sidebarWidth),
						left: isSidebarOpen ? 0 : `-${theme.sidebarWidth}px`,
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection: "column" as const,
							height: "100%",
							overflow: "hidden",
						}}
					>
						<SidebarTop />
						<div style={scrollableContentStyles}>{sidebarContent}</div>
					</div>
					<ResizeHandle sidebarRef={sidebarRef} theme={theme} />
				</aside>
			)}

			{/* 主要内容区域 - 根据是否有侧边栏调整样式 */}
			<main
				style={contentStyles(
					theme,
					sidebarContent ? isSidebarOpen : false,
					theme.sidebarWidth,
				)}
			>
				{/* 顶部栏 - 只在有侧边栏时显示切换按钮 */}
				<TopBar
					toggleSidebar={sidebarContent ? toggleSidebar : undefined}
					theme={theme}
					topbarContent={topbarContent}
					isExpanded={isSidebarOpen}
				/>

				<div style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}>
					{children}
				</div>
			</main>
		</div>
	);
};

// 样式函数

const sidebarStyles = (theme: any, isSidebarOpen: boolean, width: number) => ({
	width: `${width}px`,
	backgroundColor: defaultTheme.backgroundSecondary,
	height: "100dvh",
	position: "fixed" as const,
	left: 0, // 默认在大屏幕打开
	top: 0,
	transition: "left 0.3s ease-in-out",
	zIndex: 2,
	display: "flex",
	flexDirection: "column" as const,
});

const scrollableContentStyles = {
	flexGrow: 1,
	overflowY: "auto" as const,
	marginBottom: "1.25rem",
};

const contentStyles = (
	theme: any,
	isSidebarOpen: boolean,
	sidebarWidth: number,
) => ({
	...layout.flexGrow1,
	marginLeft: isSidebarOpen ? `${sidebarWidth}px` : 0,
	transition: "margin-left 0.3s ease-in-out",
	width: isSidebarOpen ? `calc(100% - ${sidebarWidth}px)` : "100%",
});

export default Sidebar;
