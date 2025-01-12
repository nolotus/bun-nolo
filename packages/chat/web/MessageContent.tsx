import { MessageText } from "./MessageText";
import { useTheme } from "app/theme";

export const MessageContent = ({ content, role }) => {
  const theme = useTheme();
  if (!content) return null;

  const isSelf = role === "self";

  return (
    <>
      <style href="message" precedence="default">
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
            p{
            margin: 12px 16px;
            }
          }

          .message-self {
            background-color: ${theme.primary};
            color: ${theme.background};
            border: 1px solid ${theme.primaryLight}20;
          }

          .message-other {
            background-color: ${theme.backgroundSecondary};
            color: ${theme.text};
            border: 1px solid ${theme.border};
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
