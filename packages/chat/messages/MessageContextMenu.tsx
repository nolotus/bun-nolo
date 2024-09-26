import React from "react";
import * as Ariakit from "@ariakit/react";
import { CopyIcon, DuplicateIcon, TrashIcon } from "@primer/octicons-react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "app/hooks";
import { write } from "database/dbSlice";
import { deleteMessage } from "./messageSlice";
import { useAuth } from "auth/useAuth";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import copyToClipboard from "utils/clipboard";
import { ContextMenu, MenuItem } from "render/components/ContextMenu";

interface MessageContextMenuProps {
  menu: Ariakit.MenuStore;
  anchorRect: { x: number; y: number };
  content: any;
  id: string;
}

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  menu,
  anchorRect,
  content,
  id,
}) => {
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const { t } = useTranslation();

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
    menu.hide();
  };

  const handleDeleteMessage = () => {
    dispatch(deleteMessage(id));
    menu.hide();
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
    menu.hide();
  };

  const menuItems: MenuItem[] = [
    {
      id: "copy",
      label: t("copyContent"),
      icon: <CopyIcon size={16} />,
      onClick: handleCopyContent,
    },
    {
      id: "save",
      label: t("saveContent"),
      icon: <DuplicateIcon size={16} />,
      onClick: handleSaveContent,
    },
    {
      id: "delete",
      label: t("deleteMessage"),
      icon: <TrashIcon size={16} />,
      onClick: handleDeleteMessage,
    },
  ];

  return <ContextMenu menu={menu} anchorRect={anchorRect} items={menuItems} />;
};
