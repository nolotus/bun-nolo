import {
  DesktopDownloadIcon,
  UnmuteIcon,
  TrashIcon,
} from '@primer/octicons-react';
import { useAppDispatch, useAuth } from 'app/hooks';
import { useWriteHashMutation } from 'database/services';
import { WriteHashDataType } from 'database/types';
import React from 'react';
import { Avatar } from 'ui';
import IconButton from 'ui/IconButton';

import { deleteMessage } from '../chatSlice';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

import { MessageContent } from './MessageContent';
import { MessageImage } from './MessageImage';
import { Message } from './types';
// 机器人消息组件
const RobotMessage: React.FC<Message> = ({ id, content, image }) => {
  const dispatch = useAppDispatch();

  const { audioSrc, handlePlayClick } = useAudioPlayer(content);
  const [writeHash] = useWriteHashMutation();
  const auth = useAuth();
  const handleSaveContent = () => {
    if (content) {
      const writeData: WriteHashDataType = {
        data: { content, type: 'page' },
        flags: { isJSON: true },
        userId: auth.user?.userId,
      };

      writeHash(writeData).then((response) => {
        console.log('response', response);
      });
    }
  };
  const handleDeleteMessage = () => {
    dispatch(deleteMessage(id));
  };
  return (
    <div className="flex justify-start mb-2 space-x-2">
      <div className="flex items-start space-x-2">
        <div className="flex-shrink-0">
          <Avatar role="robot" />
        </div>
        {image ? (
          <MessageImage image={image} />
        ) : (
          <MessageContent role="robot" content={content} />
        )}
        <div className="flex flex-col space-y-1 ml-2">
          <IconButton icon={UnmuteIcon} onClick={handlePlayClick} />
          <IconButton icon={DesktopDownloadIcon} onClick={handleSaveContent} />
          <IconButton icon={TrashIcon} onClick={handleDeleteMessage} />
        </div>
      </div>
      {audioSrc && <audio src={audioSrc} controls />}
    </div>
  );
};
export default RobotMessage;
