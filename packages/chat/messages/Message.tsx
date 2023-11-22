import { UnmuteIcon } from '@primer/octicons-react';
import React from 'react';
import { Avatar } from 'ui';

import { useAudioPlayer } from '../hooks/useAudioPlayer';

import { MessageContent } from './MessageContent';
import { MessageImage } from './MessageImage';
import RobotMessage from './RobotMessage';
import { MessageProps } from './types';

const UserMessage: React.FC<MessageProps> = ({ content, image }) => {
  const { audioSrc, handlePlayClick } = useAudioPlayer(content);

  return (
    <div className="flex justify-end mb-2">
      <div className="flex items-start">
        <div onClick={handlePlayClick}>
          <UnmuteIcon className="mr-2 self-center cursor-pointer" />
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

// 总的消息组件，根据role决定渲染哪个子组件
export const Message: React.FC<MessageProps> = (props) => {
  if (!props.content && !props.image) {
    return null;
  }

  return props.role === 'user' ? (
    <UserMessage {...props} />
  ) : (
    <RobotMessage {...props} />
  );
};
