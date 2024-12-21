import { defaultTheme } from "render/styles/colors";
import { MessageText } from "./MessageText";

export const MessageContent = ({ content, role }) => {
	if (!content) return null;

	const isSelf = role === "self";

	return (
		<>
			<style>
				{`
          @keyframes message-enter {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .message-content {
            padding: 12px 16px;
            display: flex;
            flex-direction: column;
            border-radius: 12px;
            transition: all 0.2s ease-out;
            animation: message-enter 0.3s ease-out forwards;
            white-space: pre-wrap;
            min-width: 100px;
            font-size: 15px;
            line-height: 1.6;
            gap: 8px;
            position: relative;
          }

          .message-self {
            background-color: ${defaultTheme.primary};
            color: ${defaultTheme.background};
            border: 1px solid ${defaultTheme.primaryLight}20;
          }

          .message-other {
            background-color: ${defaultTheme.backgroundSecondary};
            color: ${defaultTheme.text};
            border: 1px solid ${defaultTheme.border};
          }
        `}
			</style>

			<div
				className={`message-content ${isSelf ? "message-self" : "message-other"}`}
			>
				{typeof content === "string" ? (
					<MessageText content={content} role={role} />
				) : Array.isArray(content) ? (
					content.map((item, index) => {
						if (!item || typeof item !== "object") return null;

						if (item.type === "text" && item.text) {
							return (
								<MessageText
									key={`text-${index}`}
									content={item.text}
									role={role}
								/>
							);
						}

						if (item.type === "image_url" && item.image_url?.url) {
							return (
								<picture>
									<source srcSet={item.image_url?.url} />
									<img
										src={item.image_url?.url}
										alt="Message"
										className="h-auto max-w-full"
										style={{
											blockSize: "480px",
											aspectRatio: "var(--ratio-landscape)",
										}}
									/>
								</picture>
							);
						}

						return (
							<div key={`unknown-${index}`} className="message-unknown">
								Unknown message type
							</div>
						);
					})
				) : (
					<div className="message-invalid">Invalid content format</div>
				)}
			</div>
		</>
	);
};
