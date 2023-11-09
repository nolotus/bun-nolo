import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function MessageInput({ onSendMessage, isLoading }) {
  const { t } = useTranslation();
  const [newMessage, setNewMessage] = useState('');

  const handleNewMessageChange = (event) => {
    setNewMessage(event.target.value);
  };

  const handleKeyDown = (event) => {
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
          disabled={isLoading} // 禁用输入框
        />
        <button
          className="absolute right-2 bottom-2 py-1 px-4 bg-blue-500 text-white rounded"
          disabled={isLoading} // 禁用按钮
          onClick={() => {
            onSendMessage(newMessage);
            setNewMessage('');
          }}
        >
          {isLoading ? 'Sending...' : t('sendMessage')}
        </button>
      </div>
    </div>
  );
}

export default MessageInput;
