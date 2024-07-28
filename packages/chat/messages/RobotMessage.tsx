import React, { useCallback, useState } from "react";
import styled, { ThemeProvider } from "styled-components";
import {
  UnmuteIcon,
  TrashIcon,
  DuplicateIcon,
  SquareIcon,
  SquareFillIcon,
} from "@primer/octicons-react";
import { useAuth } from "auth/useAuth";
import { Avatar } from "render/ui";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { write } from "database/dbSlice";
import * as Ariakit from "@ariakit/react";

import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { deleteMessage } from "./messageSlice";
import { Message } from "./types";
import { MessageContent } from "./MessageContent";
import { messageContentWithAvatarGap } from "./styles";
import { selectTheme } from "app/theme/themeSlice";

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

const RobotMessage: React.FC<Message> = ({
  id,
  content,
  image,
  controller,
}) => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const { audioSrc, handlePlayClick } = useAudioPlayer(content);
  const auth = useAuth();
  const [hovered, setHovered] = useState(false);
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 });
  const menu = Ariakit.useMenuStore();

  const saveContent = async (content: string) => {
    const writeData = {
      data: { content, type: "page" },
      flags: { isJSON: true },
      userId: auth.user?.userId,
    };
    return await dispatch(write(writeData));
  };

  const handleSaveContent = useCallback(async () => {
    if (content) {
      const saveAction = await saveContent(content);
      const response = saveAction.payload;
      toast.success(
        <div>
          保存成功
          <Link
            to={`/${response.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            点击我
          </Link>
          查看详情。
        </div>,
      );
    }
  }, [content, dispatch, auth]);

  const handleDeleteMessage = useCallback(() => {
    dispatch(deleteMessage(id));
  }, [dispatch, id]);

  const handleAbortController = useCallback(() => {
    controller?.abort();
  }, [controller]);

  const handleContextMenu = (event) => {
    event.preventDefault();
    setAnchorRect({ x: event.clientX, y: event.clientY });
    menu.show();
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
              <MessageContent content={content} />
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

        <StyledMenu store={menu} modal getAnchorRect={() => anchorRect}>
          <StyledMenuItem onClick={handlePlayClick}>
            <UnmuteIcon /> Play Audio
          </StyledMenuItem>
          <StyledMenuItem onClick={handleSaveContent}>
            <DuplicateIcon /> Save Content
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

export default RobotMessage;
