import OpenProps from "open-props";
import {
  messageProcessor,
  selfProcessor,
} from "render/processor/messageProcessor";

import { MessageText } from "./MessageText";
import { MessageImage } from "./MessageImage";

export const MessageContent = ({ content, role }) => {
  const processor = role === "self" ? selfProcessor : messageProcessor;
  return (
    <div
      className="rounded-lg"
      style={{
        display: "flex",
        flexDirection: "column",
        boxShadow: OpenProps.shadow3,
        padding: OpenProps.size2,
      }}
    >
      {typeof content === "string" ? (
        <MessageText content={content} processor={processor} />
      ) : (
        content.map((item) => {
          if (item.type === "text") {
            return (
              <MessageText
                key={item.text}
                content={item.text}
                processor={processor}
              />
            );
          }
          if (item.type === "image_url") {
            return (
              <MessageImage key={item.image_url.url} url={item.image_url.url} />
            );
          }
          return <div>unknow message type</div>;
        })
      )}
    </div>
  );
};
