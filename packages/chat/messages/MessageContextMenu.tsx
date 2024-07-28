import React from "react";
import styled, { ThemeProvider } from "styled-components";
import * as Ariakit from "@ariakit/react";
import {
  UnmuteIcon,
  TrashIcon,
  CopyIcon,
  DuplicateIcon,
} from "@primer/octicons-react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { write } from "database/dbSlice";
import { deleteMessage } from "./messageSlice";
import { useAuth } from "auth/useAuth";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import copyToClipboard from "utils/clipboard";
import { selectTheme } from "app/theme/themeSlice";

const StyledMenu = styled(Ariakit.Menu)`
  background-color: ${(props) => props.theme.surface1};
  color: ${(props) => props.theme.text1};
  border: 1px solid ${(props) => props.theme.surface3};
  border-radius: 8px;
  padding: 0.5rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const StyledMenuItem = styled(Ariakit.MenuItem)`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: ${(props) => props.theme.text1};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => props.theme.surface2};
  }

  &[aria-disabled="true"] {
    color: ${(props) => props.theme.text2};
    cursor: not-allowed;
  }

  svg {
    margin-right: 0.5rem;
    color: ${(props) => props.theme.text2};
  }
`;

const MenuSeparator = styled(Ariakit.MenuSeparator)`
  height: 1px;
  background-color: ${(props) => props.theme.surface3};
  margin: 0.25rem 0;
`;

interface MessageContextMenuProps {
  menu: Ariakit.MenuStore;
  anchorRect: { x: number; y: number };
  onPlayAudio: () => void;
  content:
    | string
    | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  id: string;
}

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  menu,
  anchorRect,
  onPlayAudio,
  content,
  id,
}) => {
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const theme = useAppSelector(selectTheme);

  const handleSaveContent = async () => {
    if (content) {
      try {
        const writeData = {
          data: { content, type: "page" },
          flags: { isJSON: true },
          userId: auth.user?.userId,
        };
        const saveAction = await dispatch(write(writeData));
        const response = saveAction.payload as { id: string; error?: string };
        if (response.error) {
          throw new Error(response.error);
        }
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
      } catch (error) {
        toast.error(`保存失败: ${(error as Error).message}`);
      }
    }
  };

  const handleDeleteMessage = () => {
    dispatch(deleteMessage(id));
  };

  const handleCopyContent = () => {
    let textContent = "";
    if (typeof content === "string") {
      textContent = content;
    } else if (Array.isArray(content)) {
      textContent = content
        .map((item) => {
          if (item.type === "text") return item.text;
          if (item.type === "image_url")
            return `[Image: ${item.image_url?.url}]`;
          return "";
        })
        .join("\n");
    } else {
      textContent = JSON.stringify(content);
    }
    copyToClipboard(textContent, {
      onSuccess: () => toast.success("复制成功"),
      onError: (err) => toast.error(`复制失败: ${err.message}`),
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <StyledMenu store={menu} modal getAnchorRect={() => anchorRect}>
        <StyledMenuItem onClick={onPlayAudio}>
          <UnmuteIcon size={16} /> Play Audio
        </StyledMenuItem>
        <StyledMenuItem onClick={handleCopyContent}>
          <CopyIcon size={16} /> Copy Content
        </StyledMenuItem>
        <StyledMenuItem onClick={handleSaveContent}>
          <DuplicateIcon size={16} /> Save Content
        </StyledMenuItem>
        <StyledMenuItem onClick={handleDeleteMessage}>
          <TrashIcon size={16} /> Delete Message
        </StyledMenuItem>
        <MenuSeparator />
        <StyledMenuItem>View Details</StyledMenuItem>
      </StyledMenu>
    </ThemeProvider>
  );
};
