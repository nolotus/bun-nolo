import React, { useState } from "react";
import styled, { ThemeProvider } from "styled-components";
import { SquareIcon, SquareFillIcon } from "@primer/octicons-react";
import { Avatar } from "render/ui";
import * as Ariakit from "@ariakit/react";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";

import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { Message } from "./types";
import { MessageContent } from "./MessageContent";
import { messageContentWithAvatarGap } from "./styles";
import { MessageContextMenu } from "./MessageContextMenu";

const MessageContainer = styled.div`
  display: flex;
  justify-content: start;
  gap: 0.5rem;
  margin-bottom: ${(props) => props.theme.size3};
`;

const ContentWrapper = styled.div`
  display: flex;
  gap: ${messageContentWithAvatarGap};
  justify-items: start;
`;

const AbortButton = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: ${(props) => props.theme.accentColor};
  border-radius: 50%;
  color: ${(props) => props.theme.surface1};
  font-size: 16px;
  transform: translate(50%, 50%);
`;

const RobotMessage: React.FC<Message> = ({
  id,
  content,
  image,
  controller,
}) => {
  const { audioSrc, handlePlayClick } = useAudioPlayer(content);
  const [hovered, setHovered] = useState(false);
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 });
  const menu = Ariakit.useMenuStore();
  const theme = useAppSelector(selectTheme);

  const handleContextMenu = (event) => {
    event.preventDefault();
    setAnchorRect({ x: event.clientX, y: event.clientY });
    menu.show();
  };

  const handleAbortController = () => {
    controller?.abort();
  };

  return (
    <ThemeProvider theme={theme}>
      <MessageContainer>
        <ContentWrapper>
          <div>
            <Avatar name="robot" />
          </div>
          <div style={{ position: "relative" }}>
            <div onContextMenu={handleContextMenu}>
              <MessageContent content={content} role="other" />
            </div>
            {controller && (
              <AbortButton
                onClick={handleAbortController}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                {hovered ? (
                  <SquareFillIcon size={24} />
                ) : (
                  <SquareIcon size={24} />
                )}
              </AbortButton>
            )}
          </div>
        </ContentWrapper>
        {audioSrc && <audio src={audioSrc} />}
        <MessageContextMenu
          menu={menu}
          anchorRect={anchorRect}
          onPlayAudio={handlePlayClick}
          content={content}
          id={id}
        />
      </MessageContainer>
    </ThemeProvider>
  );
};

export default RobotMessage;
