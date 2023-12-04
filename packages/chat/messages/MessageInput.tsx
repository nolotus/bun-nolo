import { SquareIcon, ArrowUpIcon } from '@primer/octicons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onCancel: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [newMessage, setNewMessage] = useState('');

  const handleNewMessageChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setNewMessage(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="p-4 flex justify-center items-center">
      <div className="relative w-full sm:w-4/5 md:w-3/4 lg:w-3/5 shadow">
        <textarea
          className="w-full h-20 sm:h-24 md:h-28 p-3 pr-16 resize-none text-black"
          placeholder={t('typeMessage')}
          value={newMessage}
          onChange={handleNewMessageChange}
          onKeyDown={handleKeyDown}
        />
        {!isLoading && (
          <button
            className="absolute right-1 bottom-1 py-1 px-3 bg-blue-500 text-white flex items-center"
            onClick={() => {
              onSendMessage(newMessage);
              setNewMessage('');
            }}
          >
            <ArrowUpIcon size={20} />
          </button>
        )}
        {isLoading && (
          <button
            className="absolute right-2 bottom-2 py-1 px-4 bg-red-500 text-white flex items-center"
            onClick={onCancel}
          >
            <SquareIcon size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
