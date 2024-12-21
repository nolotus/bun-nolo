import type React from "react";
import { useState } from "react";
import { RiDeleteBin5Line } from "react-icons/ri";
import useMediaQuery from "react-responsive";
import { layout } from "render/styles/layout";

interface MoodNote {
	content: string;
	createdAt: number;
	images?: string[]; // 添加可选属性 images
}

interface MoodNoteListProps {
	notes: MoodNote[];
	onDelete: (index: number) => void; // 添加删除回调
}

const DeleteMoment = ({ onDelete, index, isHovered }) => {
	console.log(`DeleteMoment: isHovered = ${isHovered}`); // 调试日志
	return (
		<button
			onClick={() => {
				console.log(`Delete button clicked for note ${index}`); // 调试日志
				onDelete(index);
			}}
			style={{
				position: "absolute",
				top: 8, // 适当调整位置
				right: 8, // 适当调整位置
				width: "32px", // 增大按钮尺寸
				height: "32px", // 增大按钮尺寸
				backgroundColor: "transparent", // 背景透明
				borderRadius: "50%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				cursor: "pointer",
				boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
				color: "#888888", // 淡灰色
				fontSize: "14px",
				padding: 0, // 去除内边距
				opacity: isHovered ? 1 : 0, // 根据 isHovered 控制显示
				transition: "opacity 0.3s ease", // 平滑过渡
				zIndex: 10, // 确保按钮在最上层
			}}
		>
			<RiDeleteBin5Line size={18} color="#888888" />
		</button>
	);
};

const MoodNoteList: React.FC<MoodNoteListProps> = ({ notes, onDelete }) => {
	const isMobile = useMediaQuery({ query: "(max-width: 600px)" });
	const isTablet = useMediaQuery({
		query: "(min-width: 601px) and (max-width: 1024px)",
	});
	const isDesktop = useMediaQuery({ query: "(min-width: 1025px)" });

	const [hoveredIndices, setHoveredIndices] = useState<{
		[index: number]: boolean;
	}>({});

	const formatDate = (timestamp: number) => {
		const date = new Date(timestamp);
		return {
			date: date.toLocaleDateString("zh-CN", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			}),
			time: date.toLocaleTimeString("zh-CN", {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			}),
		};
	};

	const handleMouseEnter = (index: number) => {
		console.log(`Mouse entered on note ${index}`);
		setHoveredIndices((prevIndices) => ({ ...prevIndices, [index]: true }));
	};

	const handleMouseLeave = (index: number) => {
		console.log(`Mouse left on note ${index}`);
		setHoveredIndices((prevIndices) => ({ ...prevIndices, [index]: false }));
	};

	return (
		<ul
			style={{
				padding: isMobile ? "20px 10px" : isTablet ? "30px 20px" : "40px 30px",
				listStyle: "none",
				margin: 0,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
			}}
		>
			{notes.map((note, index) => {
				const { date, time } = formatDate(note.createdAt);

				return (
					<li
						key={index}
						style={{
							padding: isMobile ? "15px" : isTablet ? "20px" : "25px",
							marginBottom: isMobile ? "15px" : isTablet ? "20px" : "25px",
							borderBottom: "1px solid #eee",
							display: "flex",
							flexDirection: "row",
							justifyContent: "space-between",
							alignItems: "flex-start",
							minWidth: "90vw",
							position: "relative",
						}}
						onMouseEnter={() => handleMouseEnter(index)}
						onMouseLeave={() => handleMouseLeave(index)}
					>
						{/* 时间显示区域 */}
						<div
							style={{
								minWidth: isMobile ? "80px" : isTablet ? "120px" : "150px",
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
								color: "#999",
							}}
						>
							<div
								style={{
									fontSize: isMobile ? "14px" : isTablet ? "16px" : "18px",
								}}
							>
								{date}
							</div>
							<div
								style={{
									fontSize: isMobile ? "14px" : isTablet ? "16px" : "18px",
									marginTop: "4px",
								}}
							>
								{time}
							</div>
						</div>

						{/* 内容区域 */}
						<div
							style={{
								flex: 1,
								display: "flex",
								flexDirection: "column",
								justifyContent: "flex-start",
								alignItems: "stretch",
								marginLeft: isMobile ? "10px" : isTablet ? "15px" : "20px",
								maxWidth: "100%",
								position: "relative", // 使按钮定位有效
							}}
						>
							{/* 删除按钮 */}
							<DeleteMoment
								onDelete={onDelete}
								index={index}
								isHovered={hoveredIndices[index] || false}
							/>
							<div
								style={{
									fontSize: isMobile ? "14px" : isTablet ? "16px" : "18px",
									color: "#333",
									lineHeight: "1.8",
									textAlign: "justify",
									wordBreak: "break-word",
									padding: isMobile ? "10px 0" : "15px 0",
									letterSpacing: "0.5px",
									fontWeight: 400,
									opacity: 0.9,
								}}
							>
								{note.content}
							</div>

							{/* 图片展示区域 */}
							{note.images?.length > 0 && (
								<div
									style={{
										display: "flex",
										...layout.flexWrap,
										gap: isMobile ? "10px" : isTablet ? "15px" : "20px",
										marginTop: isMobile ? "15px" : isTablet ? "20px" : "25px",
									}}
								>
									{note.images.map((image, imgIndex) => (
										<div
											key={imgIndex}
											style={{
												width: isMobile
													? "100px"
													: isTablet
														? "150px"
														: "200px",
												height: isMobile
													? "100px"
													: isTablet
														? "150px"
														: "200px",
												borderRadius: "4px",
												overflow: "hidden",
											}}
										>
											<img
												src={image}
												alt={`图片 ${imgIndex + 1}`}
												style={{
													width: "100%",
													height: "100%",
													objectFit: "cover",
												}}
											/>
										</div>
									))}
								</div>
							)}
						</div>
					</li>
				);
			})}
		</ul>
	);
};

export default MoodNoteList;
