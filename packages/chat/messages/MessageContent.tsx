import OpenProps from "open-props";

import { MessageText } from "./MessageText";
import { MessageImage } from "./MessageImage";

export const MessageContent = ({ content, role }) => {
  if (!content) {
    return null; // 如果content不存在或为空，不渲染任何内容
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
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
