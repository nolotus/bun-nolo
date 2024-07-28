import React, { useState } from "react";
import styled, { css } from "styled-components";
import { Avatar } from "render/ui";
import { UnmuteIcon, TrashIcon } from "@primer/octicons-react";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import * as Ariakit from "@ariakit/react";

import { Message } from "./types";
import { MessageContent } from "./MessageContent";
import { useAppDispatch } from "app/hooks";
import { deleteMessage } from "./messageSlice";

const MessageContainer = styled.div`
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: flex-end;
`;

const ContentWrapper = styled.div`
  display: flex;
  align-items: flex-start;
`;

const AvatarWrapper = styled.div`
  flex-shrink: 0;
`;

const AudioPlayer = styled.audio`
  display: ${(props) => (props.src ? "block" : "none")};
`;

const StyledMenu = styled(Ariakit.Menu)`
  position: relative;
  z-index: 50;
  display: flex;
  max-height: var(--popover-available-height);
  min-width: 180px;
  flex-direction: column;
  overflow: auto;
  overscroll-behavior: contain;
  border-radius: 0.5rem;
  border-width: 1px;
  border-style: solid;
  border-color: hsl(204 20% 88%);
  background-color: white;
  padding: 0.5rem;
  color: black;
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1);
  outline: none !important;

  ${(props) =>
    props.theme.dark &&
    css`
      border-color: hsl(204 4% 24%);
      background-color: hsl(204 4% 16%);
      color: white;
      box-shadow:
        0 10px 15px -3px rgb(0 0 0 / 0.25),
        0 4px 6px -4px rgb(0 0 0 / 0.1);
    `}
`;

const StyledMenuItem = styled(Ariakit.MenuItem)`
  display: flex;
  cursor: default;
  scroll-margin: 0.5rem;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.25rem;
  padding: 0.5rem;
  outline: none !important;

  &[aria-disabled="true"] {
    opacity: 0.25;
  }

  &[data-active-item] {
    background-color: hsl(204 100% 40%);
    color: white;
  }

  &:active,
  &[data-active] {
    background-color: hsl(204 100% 32%);
    padding-top: 9px;
    padding-bottom: 7px;
  }
`;

const MenuSeparator = styled(Ariakit.MenuSeparator)`
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  height: 0px;
  width: 100%;
  border-top-width: 1px;
  border-color: hsl(204 20% 88%);

  ${(props) =>
    props.theme.dark &&
    css`
      border-color: hsl(204 4% 28%);
    `}
`;

export const UserMessage: React.FC<Message> = ({ content, id }) => {
  const dispatch = useAppDispatch();
  const { audioSrc, handlePlayClick } = useAudioPlayer(content[0].text);
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 });
  const menu = Ariakit.useMenuStore();

  const handleContextMenu = (event) => {
    event.preventDefault();
    setAnchorRect({ x: event.clientX, y: event.clientY });
    menu.show();
  };

  return (
    <MessageContainer onContextMenu={handleContextMenu}>
      <ContentWrapper>
        <MessageContent content={content} role="other" />
      </ContentWrapper>

      <AvatarWrapper>
        <Avatar name="user" />
      </AvatarWrapper>
      <AudioPlayer src={audioSrc} controls />

      <StyledMenu store={menu} modal getAnchorRect={() => anchorRect}>
        <StyledMenuItem onClick={handlePlayClick}>
          <UnmuteIcon /> Play Audio
        </StyledMenuItem>
        <StyledMenuItem onClick={() => dispatch(deleteMessage(id))}>
          <TrashIcon /> Delete Message
        </StyledMenuItem>
        <MenuSeparator />
        <StyledMenuItem>View Details</StyledMenuItem>
      </StyledMenu>
    </MessageContainer>
  );
};
