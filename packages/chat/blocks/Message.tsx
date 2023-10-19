import React from "react";

import { Avatar } from "ui";
import { MessageContent } from "./MessageContent";
interface MessageProps {
  content: string;
  role: string;
  image?: string;
}

const MessageImage: React.FC<{ image: string }> = ({ image }) => (
  <img src={image} alt="Generated" className="max-w-full h-auto" />
);

export const Message: React.FC<MessageProps> = ({ content, role, image }) => {
  if (!content && !image) return null;

  return (
    <div
      className={`flex ${
        role === "user" ? "justify-end" : "justify-start"
      } mb-2`}
    >
      <div
        className={`flex items-start ${
          role === "user" ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div className="flex-shrink-0">
          <Avatar role={role} />
        </div>
        {image ? (
          <MessageImage image={image} />
        ) : (
          <MessageContent role={role} content={content} />
        )}
      </div>
    </div>
  );
};
