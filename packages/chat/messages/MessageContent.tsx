import { BASE_COLORS } from "render/styles/colors";
import { MessageImage } from "./MessageImage";
import { MessageText } from "./MessageText";

export const MessageContent = ({ content, role }) => {
	if (!content) {
		return null; // 如果content不存在或为空，不渲染任何内容
	}

	return (
		<div
			style={{
				padding: "12px 16px",
				display: "flex",
				flexDirection: "column",
				boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
				backdropFilter: "blur(8px)",
				borderRadius: "12px",
				border: "1px solid rgba(0,0,0,0.05)",
				transition: "all 0.3s ease",
				animation: "message-enter 0.3s ease forwards",
				backgroundColor:
					role === "self" ? BASE_COLORS.primary : BASE_COLORS.backgroundGhost,
				color: role === "self" ? BASE_COLORS.background : BASE_COLORS.text,
				whiteSpace: "pre-wrap",
				// maxWidth: "85%",
				minWidth: "100px",
				fontSize: "15px",
				lineHeight: "1.6",
			}}
		>
			{typeof content === "string" ? (
				<MessageText content={content} role={role} />
			) : Array.isArray(content) ? (
				content.map((item, index) => {
					if (!item || typeof item !== "object") {
						return null; // 跳过无效的项
					}

					if (item.type === "text" && item.text) {
						return (
							<MessageText
								key={`${item.text}-${index}`}
								content={item.text}
								role={role}
							/>
						);
					}
					if (
						item.type === "image_url" &&
						item.image_url &&
						item.image_url.url
					) {
						return (
							<MessageImage
								key={`${item.image_url.url}-${index}`}
								url={item.image_url.url}
							/>
						);
					}
					return <div key={`unknown-${index}`}>Unknown message type</div>;
				})
			) : (
				<div>Invalid content format</div>
			)}
		</div>
	);
};
