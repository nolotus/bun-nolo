import { useAppSelector } from 'app/hooks';
import React, { useEffect, useRef } from 'react';

import { MessageItem } from './Message';
import { selectMessage } from './selector';
import { Message } from './types';

interface MessagesDisplayProps {
  messages: Message[];
  scrollToBottom: () => void; // 新增
}

const MessagesDisplay: React.FC<MessagesDisplayProps> = ({ messages }) => {
  const { tempMessage } = useAppSelector(selectMessage);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, tempMessage]);

  return (
    <div
      className="flex-grow flex flex-col space-y-4 p-3 overflow-y-auto max-w-full break-words"
      ref={messagesEndRef}
    >
      {messages.map((message) => (
        <MessageItem
          id={message.id}
          key={message.id}
          content={message.content}
          role={message.role}
          image={message.image} // 新增代码
        />
      ))}
      <MessageItem {...tempMessage} key={tempMessage.id} id={tempMessage.id} />
    </div>
  );
};

export default MessagesDisplay;
