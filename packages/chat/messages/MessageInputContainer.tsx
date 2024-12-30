import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import type React from "react";
import { useTranslation } from "react-i18next";

import useCybotConfig from "ai/cybot/hooks/useCybotConfig";

import MessageInput from "./MessageInput";
import { handleSendMessage } from "./messageSlice";

const MessageInputContainer: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);

  // 使用 cybot 配置来判断是否允许发送消息
  const cybotConfig = useCybotConfig();
  const allowSend = !!cybotConfig; // convert to boolean for check


  const onSendMessage = (content: string) => {
    dispatch(handleSendMessage({ content }));
  };

  const errorMessageStyle = {
    color: theme.error,
    fontSize: "14px",
    padding: ".25rem",
    backgroundColor: theme.errorBg,
    borderRadius: "2px",
    marginTop: "16px",
  };
  return (
    <div>
      {allowSend ? (
        <MessageInput onSendMessage={onSendMessage} />
      ) : (
        <div style={errorMessageStyle}>{t("noAvailableCybotMessage")}</div>
      )}
    </div>
  );
};

export default MessageInputContainer;
