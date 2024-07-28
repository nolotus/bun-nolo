import React, { useState } from "react";
import styled from "styled-components";
import { Avatar } from "render/ui";
import * as Ariakit from "@ariakit/react";

import { messageContentWithAvatarGap } from "./styles";
import { Message } from "./types";
import { MessageContent } from "./MessageContent";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { MessageContextMenu } from "./MessageContextMenu";

const MessageContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: ${(props) => props.theme.size3};
`;

const ContentWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  margin-right: ${messageContentWithAvatarGap};
`;

const AvatarWrapper = styled.div`
  flex-shrink: 0;
`;

const AudioPlayer = styled.audio`
  display: ${(props) => (props.src ? "block" : "none")};
`;

export const SelfMessage: React.FC<Message> = ({ content, id }) => {
  const { audioSrc, handlePlayClick } = useAudioPlayer(content[0]?.text);
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 });
  const menu = Ariakit.useMenuStore();

  const handleContextMenu = (event) => {
    event.preventDefault();
    setAnchorRect({ x: event.clientX, y: event.clientY });
    menu.show();
  };

  return (
    <MessageContainer>
      <ContentWrapper>
        <div onContextMenu={handleContextMenu}>
          <MessageContent content={content} role="self" />
        </div>
      </ContentWrapper>

      <AvatarWrapper>
        <Avatar name="user" />
      </AvatarWrapper>
      <AudioPlayer src={audioSrc} controls />

      <MessageContextMenu
        menu={menu}
        anchorRect={anchorRect}
        onPlayAudio={handlePlayClick}
        content={content}
        id={id}
      />
    </MessageContainer>
  );
};
