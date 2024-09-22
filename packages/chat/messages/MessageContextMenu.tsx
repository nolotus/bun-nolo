import React from "react";
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
import { useTranslation } from "react-i18next";
import { selectTheme } from "app/theme/themeSlice";

export const MessageContextMenu = ({
  menu,
  anchorRect,
  onPlayAudio,
  content,
  id,
}) => {
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const { t } = useTranslation();
  const theme = useAppSelector(selectTheme);

  const menuStyle = {
    backgroundColor: theme.surface1,
    color: theme.text1,
    border: `1px solid ${theme.surface3}`,
    borderRadius: "8px",
    padding: "0.5rem 0",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  };

  const menuItemStyle = {
    display: "flex",
    alignItems: "center",
    padding: "0.5rem 1rem",
    cursor: "pointer",
    color: theme.text1,
    transition: "background-color 0.2s ease",
  };

  const iconStyle = {
    marginRight: "0.5rem",
    color: theme.text2,
  };

  const separatorStyle = {
    height: "1px",
    backgroundColor: theme.surface3,
    margin: "0.25rem 0",
  };

  const handleSaveContent = async () => {
    if (content) {
      try {
        const writeData = {
          data: { content, type: "page" },
          flags: { isJSON: true },
          userId: auth.user?.userId,
        };
        const saveAction = await dispatch(write(writeData));
        const response = saveAction.payload;
        if (response.error) {
          throw new Error(response.error);
        }
        toast.success(
          <div>
            {t("saveSuccess")}
            <Link
              to={`/${response.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("clickHere")}
            </Link>
            {t("viewDetails")}
          </div>,
        );
      } catch (error) {
        toast.error(`${t("saveFailed")}: ${error.message}`);
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
      onSuccess: () => toast.success(t("copySuccess")),
      onError: (err) => toast.error(`${t("copyFailed")}: ${err.message}`),
    });
  };

  return (
    <Ariakit.Menu
      store={menu}
      modal
      getAnchorRect={() => anchorRect}
      style={menuStyle}
    >
      <Ariakit.MenuItem onClick={handleCopyContent} style={menuItemStyle}>
        <CopyIcon size={16} style={iconStyle} /> {t("copyContent")}
      </Ariakit.MenuItem>
      <Ariakit.MenuItem onClick={handleSaveContent} style={menuItemStyle}>
        <DuplicateIcon size={16} style={iconStyle} /> {t("saveContent")}
      </Ariakit.MenuItem>
      <Ariakit.MenuItem onClick={handleDeleteMessage} style={menuItemStyle}>
        <TrashIcon size={16} style={iconStyle} /> {t("deleteMessage")}
      </Ariakit.MenuItem>
    </Ariakit.Menu>
  );
};
