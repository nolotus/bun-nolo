import { MessageText } from "./MessageText";
import { useTheme } from "app/theme";

export const MessageContent = ({ content, role }) => {
  const theme = useTheme();
  if (!content) return null;

  const isSelf = role === "self";

  return (
    <>
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
                <picture key={`image-${index}`}>
                  <source srcSet={item.image_url?.url} />
                  <img
                    src={item.image_url?.url}
                    alt="Generated content"
                    className="message-image"
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
      <style jsx global>{`
        @keyframes message-enter {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-content {
          display: flex;
          flex-direction: column;
          transition: all 0.2s ease-out;
          animation: message-enter 0.3s ease-out forwards;
          white-space: pre-wrap;
          min-width: 100px;
          font-size: 15px; /* 增大字体 */
          line-height: 1.6;
          gap: 14px; /* 增加间距 */
          position: relative;
        }

        .message-content p {
          margin: 0;
          margin-bottom: 0.85em;
        }

        .message-content p:last-child {
          margin-bottom: 0;
        }

        .message-content ul,
        .message-content ol {
          margin-top: 0.25em;
          margin-bottom: 0.85em;
          padding-left: 1.5em;
        }

        .message-content li {
          margin-bottom: 0.5em;
        }

        .message-content li:last-child {
          margin-bottom: 0;
        }

        .message-image {
          border-radius: 6px;
          max-width: 100%;
          height: auto;
          max-height: 480px;
          object-fit: contain;
          box-shadow: 0 1px 2px ${theme.shadowLight};
          border: 1px solid ${theme.border};
        }

        .message-self {
          color: ${theme.text};
        }

        .message-other {
          color: ${theme.text};
        }

        .message-unknown,
        .message-invalid {
          padding: 10px 14px;
          background-color: ${theme.backgroundGhost};
          border-radius: 6px;
          color: ${theme.textSecondary};
          font-size: 14px;
          border: 1px solid ${theme.borderLight};
        }
      `}</style>
    </>
  );
};
