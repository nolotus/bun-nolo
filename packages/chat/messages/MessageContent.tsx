import { MessageText } from "./MessageText";
import { MessageImage } from "./MessageImage";

export const MessageContent = ({ content }) => {
  return (
    <div
      className="surface1 rounded-lg p-2"
      style={{
        display: "flex",
        flexDirection: "column",
        boxShadow: "var(--shadow-2)",
      }}
    >
      {typeof content === "string" ? (
        <MessageText content={content} />
      ) : (
        content.map((item) => {
          if (item.type === "text") {
            return <MessageText content={item.text} />;
          }
          if (item.type === "image_url") {
            return <MessageImage url={item.image_url.url} />;
          }
          return <div>unknow message type</div>;
        })
      )}
    </div>
  );
};
