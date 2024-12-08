import React from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useTranslation } from "react-i18next";
import { selectTheme } from "app/theme/themeSlice";
import { radii } from "render/styles/stylePresets";

import useCybotConfig from "ai/cybot/useCybotConfig";
// import { selectCostByUserId } from "ai/selectors"; // 暂时注释掉

import MessageInput from "./MessageInput";
import { handleSendMessage } from "./messageSlice";
import { sizes } from "render/styles/sizes";

const MessageInputContainer: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);

  // 使用 cybot 配置来判断是否允许发送消息
  const cybotConfig = useCybotConfig();
  const allowSend = !!cybotConfig; // convert to boolean for check

  // const userCost = useAppSelector(selectCostByUserId); // 暂时注释掉
  // 可以在未来根据 userCost 的值显示费用相关的消息

  const onSendMessage = (content: string) => {
    dispatch(handleSendMessage({ content }));
  };

  const inputContainerStyle = {
    backgroundColor: theme.surface1,
  };

  const errorMessageStyle = {
    color: theme.error,
    fontSize: "14px",
    padding: sizes.size1,
    backgroundColor: theme.errorBg,
    borderRadius: radii.radius1,
    marginTop: "16px",
  };
  return (
    <div style={inputContainerStyle}>
      {allowSend ? (
        <MessageInput onSendMessage={onSendMessage} />
      ) : (
        <div style={errorMessageStyle}>{t("noAvailableCybotMessage")}</div>
        // 在翻译文件中添加 noAvailableCybotMessage 项目
      )}
    </div>
  );
};

export default MessageInputContainer;
