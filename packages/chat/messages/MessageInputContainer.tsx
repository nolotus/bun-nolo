import React from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useTranslation } from "react-i18next";
import { selectTheme } from "app/theme/themeSlice";
import { stylePresets } from "render/styles/stylePresets";

import useCybotConfig from "ai/cybot/useCybotConfig";
// import { selectCostByUserId } from "ai/selectors"; // 暂时注释掉

import MessageInput from "./MessageInput";
import { handleSendMessage } from "./messageSlice";
import { sp } from "render/styles/sp";
import { txt } from "render/styles/txt";

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
    ...txt.size14,
    ...sp.p1,
    backgroundColor: theme.errorBg,
    ...stylePresets.roundedSm,
    ...sp.mt2,
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
