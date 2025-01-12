import type * as Ariakit from "@ariakit/react";
import {
  CopyIcon,
  DuplicateIcon,
  IterationsIcon,
  TrashIcon,
} from "@primer/octicons-react";

import { useAppDispatch } from "app/hooks";
import { useAuth } from "auth/useAuth";
import { write } from "database/dbSlice";
import type React from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ContextMenu, type MenuItem } from "render/components/ContextMenu";
import copyToClipboard from "utils/clipboard";

import {
  clearCurrentDialog,
  deleteMessage,
  sendWithMessageId,
} from "../messages/messageSlice";

import { runCybotId } from "ai/cybot/cybotSlice";
import { markdownToSlate } from "create/editor/markdownToSlate";
import { isProduction } from "utils/env";
import { DataType } from "create/types";
import { ulid } from "ulid";

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
  const { t } = useTranslation("chat");

  const handleSaveContent = async () => {
    if (content) {
      try {
        const slateData = markdownToSlate(content);
        const cybotId = isProduction
          ? "000000100000-UWJFNG1GZUwzLVMzaWhjTzdnWmdrLVJ6d1d6Rm9FTnhYRUNXeFgyc3h6VQ-01JGTFKJ7TRE78ZB1E1ZSJRAFJ"
          : "cybot-UWJFNG1GZUwzLVMzaWhjTzdnWmdrLVJ6d1d6Rm9FTnhYRUNXeFgyc3h6VQ-01JGV8AB85FP1GC3Z42W9ATSPG";
        const title = await dispatch(
          runCybotId({
            cybotId,
            userInput: content,
          })
        ).unwrap();

        const saveAction = await dispatch(
          write({
            data: { content, slateData, type: DataType.PAGE, title },
            customId: `${DataType.PAGE}-${auth.user.userId}-${ulid()}`,
          })
        );
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
          </div>
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

  const handleResendMessage = () => {
    dispatch(sendWithMessageId(id));
  };

  const handleClearConversation = () => {
    dispatch(clearCurrentDialog());
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
    {
      id: "resend",
      label: t("resend"),
      icon: <IterationsIcon size={16} />,
      onClick: handleResendMessage,
    },
    {
      id: "clear",
      label: t("clearConversation"),
      icon: <TrashIcon size={16} />,
      onClick: handleClearConversation,
    },
  ];

  return <ContextMenu menu={menu} anchorRect={anchorRect} items={menuItems} />;
};
