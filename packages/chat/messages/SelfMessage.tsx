import React, { useState, useCallback } from "react";
import styled, { ThemeProvider } from "styled-components";
import { Avatar } from "render/ui";
import { UnmuteIcon, TrashIcon, CopyIcon } from "@primer/octicons-react";
import * as Ariakit from "@ariakit/react";
import { selectTheme } from "app/theme/themeSlice";
import copyToClipboard from "utils/clipboard";

import { messageContentWithAvatarGap } from "./styles";
import { Message } from "./types";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { deleteMessage } from "./messageSlice";
import { MessageContent } from "./MessageContent";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

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

const MessageContentWrapper = styled.div`
  display: inline-flex;
  flex-direction: column;
  border-radius: 8px;
  padding: 8px;
  box-shadow: var(--shadow-3);
  background-color: ${(props) => props.theme.surface2};
  color: ${(props) => props.theme.text1};
`;

const AvatarWrapper = styled.div`
  flex-shrink: 0;
`;

const AudioPlayer = styled.audio`
  display: ${(props) => (props.src ? "block" : "none")};
`;

const StyledMenu = styled(Ariakit.Menu)`
  background-color: ${(props) => props.theme.surface1};
  color: ${(props) => props.theme.text1};
  border: 1px solid ${(props) => props.theme.surface3};
  border-radius: 4px;
  padding: 0.5rem 0;
  box-shadow: 0 2px 10px ${(props) => props.theme.shadowColor};
`;

const StyledMenuItem = styled(Ariakit.MenuItem)`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.surface2};
  }
  &[aria-disabled="true"] {
    color: ${(props) => props.theme.text2};
    cursor: not-allowed;
  }
`;

const MenuSeparator = styled(Ariakit.MenuSeparator)`
  height: 1px;
  background-color: ${(props) => props.theme.surface3};
  margin: 0.5rem 0;
`;

export const SelfMessage: React.FC<Message> = ({ content, id }) => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const { audioSrc, handlePlayClick } = useAudioPlayer(content[0]?.text);
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 });
  const menu = Ariakit.useMenuStore();

  const handleContextMenu = (event) => {
    event.preventDefault();
    setAnchorRect({ x: event.clientX, y: event.clientY });
    menu.show();
  };

  const handleDeleteMessage = useCallback(() => {
    dispatch(deleteMessage(id));
  }, [dispatch, id]);

  const handleCopyContent = useCallback(() => {
    console.log("Content to be copied:", content);
    let textContent = "";

    if (typeof content === "string") {
      textContent = content;
    } else if (Array.isArray(content)) {
      textContent = content
        .map((item) => {
          console.log("Item in content array:", item);
          if (item.type === "text") {
            return item.text;
          } else if (item.type === "image_url") {
            return `[Image: ${item.image_url.url}]`;
          } else {
            console.log("Unknown item type:", item.type);
            return "";
          }
        })
        .join("\n");
    } else {
      console.log("Unexpected content type:", typeof content);
      textContent = JSON.stringify(content);
    }

    console.log("Text content to be copied:", textContent);

    copyToClipboard(textContent, {
      onSuccess: () => console.log("Copy successful"),
      onError: (err) => console.error("Copy failed", err),
    });
  }, [content]);

  return (
    <ThemeProvider theme={theme}>
      <MessageContainer>
        <ContentWrapper>
          <MessageContentWrapper onContextMenu={handleContextMenu}>
            <MessageContent content={content} />
          </MessageContentWrapper>
        </ContentWrapper>

        <AvatarWrapper>
          <Avatar name="user" />
        </AvatarWrapper>
        <AudioPlayer src={audioSrc} controls />

        <StyledMenu store={menu} modal getAnchorRect={() => anchorRect}>
          <StyledMenuItem onClick={handlePlayClick}>
            <UnmuteIcon /> Play Audio
          </StyledMenuItem>
          <StyledMenuItem onClick={handleCopyContent}>
            <CopyIcon /> Copy Content
          </StyledMenuItem>
          <StyledMenuItem onClick={handleDeleteMessage}>
            <TrashIcon /> Delete Message
          </StyledMenuItem>
          <MenuSeparator />
          <StyledMenuItem>View Details</StyledMenuItem>
        </StyledMenu>
      </MessageContainer>
    </ThemeProvider>
  );
};
