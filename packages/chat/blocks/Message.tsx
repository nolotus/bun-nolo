import { PlayIcon } from '@primer/octicons-react';
import { useGenerateAudioMutation } from 'ai/services';
import React, { useState, useEffect } from 'react';
import { Avatar } from 'ui';

import { MessageContent } from './MessageContent';

interface MessageProps {
  content: string;
  role: string;
  image?: string;
}

const MessageImage: React.FC<{ image: string }> = ({ image }) => (
  <img src={image} alt="Message" className="max-w-full h-auto" />
);
const useAudioPlayer = (content) => {
  const [audioSrc, setAudioSrc] = useState('');
  const [generateAudio, { isLoading, isError }] = useGenerateAudioMutation();

  useEffect(() => {
    // 清除旧的 audio URL，以避免内存泄漏
    return () => {
      if (audioSrc) {
        URL.revokeObjectURL(audioSrc);
      }
    };
  }, [audioSrc]);

  const handlePlayClick = async () => {
    try {
      const audioUrl = await generateAudio(content).unwrap();
      setAudioSrc(audioUrl);
    } catch (error) {
      console.error('Error fetching audio:', error);
    }
  };

  return { audioSrc, handlePlayClick, isLoading, isError };
};

export default useAudioPlayer;

const UserMessage: React.FC<MessageProps> = ({ content, image }) => {
  const { audioSrc, handlePlayClick } = useAudioPlayer(content);

  return (
    <div className="flex justify-end mb-2">
      <div className="flex items-start">
        <div onClick={handlePlayClick}>
          <PlayIcon className="mr-2 self-center cursor-pointer" />
        </div>
        {image ? (
          <MessageImage image={image} />
        ) : (
          <MessageContent role="user" content={content} />
        )}
        <div className="flex-shrink-0">
          <Avatar role="user" />
        </div>
      </div>
      {audioSrc && <audio src={audioSrc} controls />}
    </div>
  );
};

// 其他角色消息组件
const OtherMessage: React.FC<MessageProps> = ({ content, image }) => {
  const { audioSrc, handlePlayClick } = useAudioPlayer(content);

  return (
    <div className="flex justify-start mb-2">
      <div className="flex items-start flex-row">
        <div className="flex-shrink-0">
          <Avatar role="other" />
        </div>
        {image ? (
          <MessageImage image={image} />
        ) : (
          <MessageContent role="other" content={content} />
        )}
        <div onClick={handlePlayClick}>
          <PlayIcon className="ml-2 self-center cursor-pointer" />
        </div>
      </div>
      {audioSrc && <audio src={audioSrc} controls />}
    </div>
  );
};

// 总的消息组件，根据role决定渲染哪个子组件
export const Message: React.FC<MessageProps> = (props) => {
  if (!props.content && !props.image) {
    return null;
  }

  return props.role === 'user' ? (
    <UserMessage {...props} />
  ) : (
    <OtherMessage {...props} />
  );
};
