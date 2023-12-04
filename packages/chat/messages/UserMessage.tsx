import { UnmuteIcon } from '@primer/octicons-react';
import React from 'react';
import { Avatar } from 'ui';

import { useAudioPlayer } from '../hooks/useAudioPlayer';

import { MessageContent } from './MessageContent';
import { MessageImage } from './MessageImage';
import { Message } from './types';

export const UserMessage: React.FC<Message> = ({ content, image }) => {
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
          <Avatar name="user" />
        </div>
      </div>
      {audioSrc && <audio src={audioSrc} controls />}
    </div>
  );
};
