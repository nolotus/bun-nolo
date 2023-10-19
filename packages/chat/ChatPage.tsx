import React, { useState, useRef, useContext, useEffect } from "react";
// import i18n from "i18next";
// import { useTranslation } from "react-i18next";
// import { useParams, useSearchParams } from "react-router-dom";
// import { Icon, Button } from "../../ui/";

// import chatTranslations from "./chatI18n";
// import aiTranslations from "../ai/aiI18n";

// import ChatSidebar from "./blocks/ChatSidebar";
// import MessagesDisplay from "./blocks/MessagesDisplay";
// import MessageInput from "./blocks/MessageInput";
// import { sendRequestToOpenAI } from "../ai/client/request";
// import { getLogger } from "../../utils/logger";
// import { useChatData } from "./useChatData";
// import { useStreamHandler } from "./useStreamHandler";
// import { tokenStatic } from "../ai/client/static";
// import { getUser } from "../auth/client/token";
import { UserContext } from "user/UserContext";
// import { queryData } from "../database/client/query";
// import { calcCurrentUserIdCost } from "../ai/utils/calcCost";
// import { nolotusId } from "../../core/init";

// const chatWindowLogger = getLogger("ChatWindow"); // 初始化日志

// Object.keys(chatTranslations).forEach((lang) => {
//   const translations = chatTranslations[lang].translation;
//   i18n.addResourceBundle(lang, "translation", translations, true, true);
// });
// Object.keys(aiTranslations).forEach((lang) => {
//   const translations = aiTranslations[lang].translation;
//   i18n.addResourceBundle(lang, "translation", translations, true, true);
// });

const ChatPage = () => {
  //   const { t } = useTranslation();
  //   const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useContext(UserContext);
  //   const [cost, setCost] = useState(0);
  //   const allowSend = Number(cost.totalCost) < 2;
  //   console.log("allowSend", allowSend);

  //   const { userId } = currentUser;
  //   useEffect(() => {
  //     const fetchCost = async () => {
  //       const options = {
  //         isJSON: true,
  //         condition: {
  //           $eq: { type: "tokenStatistics" },
  //         },
  //         limit: 1000,
  //       };

  //       const result = await queryData(nolotusId, options);
  //       const currentUserIdCost = calcCurrentUserIdCost(result, userId);
  //       console.log("result", result);
  //       console.log("currentUserIdCost", currentUserIdCost);
  //       setCost(currentUserIdCost);
  //     };

  //     fetchCost();
  //   }, [userId]);
  //   const handleChatSelectWithSearchParamsUpdate = (chat) => {
  //     handleChatSelect(chat);
  //     setSearchParams({ ...searchParams, id: chat.id });
  //   };
  //   const messagesEndRef = useRef<HTMLDivElement | null>(null);
  //   const scrollToBottom = () => {
  //     if (messagesEndRef.current) {
  //       messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
  //     }
  //   };

  //   const [requestFailed, setRequestFailed] = useState(false);

  //   const { configId } = useParams();

  //   const { chatList, config, selectedChat, handleChatSelect, reloadChatList } =
  //     useChatData(configId); // 使用新增的函数

  //   const [isLoading, setIsLoading] = useState(false);

  //   const [messages, setMessages] = useState<{ role: string; content: string }[]>(
  //     []
  //   );

  //   const [mode] = useState<"text" | "image" | "stream">("stream");

  //   const {
  //     tempMessages,
  //     handleStreamMessage,
  //     clearMessages,
  //     isStopped,
  //     setIsStopped,
  //     setTempMessages,
  //   } = useStreamHandler(config, setMessages);
  //   const handleSendMessage = async (newMessage) => {
  //     if (!newMessage.trim()) return;

  //     setRequestFailed(false);
  //     setMessages((prevMessages) => [
  //       ...prevMessages,
  //       { role: "user", content: newMessage },
  //     ]);
  //     setIsLoading(true);
  //     try {
  //       let assistantMessage;
  //       if (mode === "text") {
  //         assistantMessage = await sendRequestToOpenAI(
  //           "text",
  //           {
  //             userMessage: newMessage,
  //             prevMessages: messages,
  //           },
  //           config
  //         );
  //         setMessages((prevMessages) => [
  //           ...prevMessages,
  //           { role: "user", content: newMessage },
  //           { role: "assistant", content: assistantMessage },
  //         ]);
  //       } else if (mode === "image") {
  //         const imageData = await sendRequestToOpenAI(
  //           "image",
  //           {
  //             prompt: newMessage,
  //           },
  //           config
  //         );
  //         const imageUrl = imageData.data[0].url; // 提取图片 URL
  //         setMessages((prevMessages) => [
  //           ...prevMessages,
  //           { role: "user", content: newMessage },
  //           {
  //             role: "assistant",
  //             content: "Here is your generated image:",
  //             image: imageUrl, // 使用提取出的图片 URL
  //           },
  //         ]);
  //       }
  //       if (mode === "stream") {
  //         await handleStreamMessage(newMessage, messages);
  //         const { userId, username } = getUser();
  //         const staticData = {
  //           dialogType: "send",
  //           model: config.model,
  //           length: newMessage.length,
  //           userId,
  //           username,
  //         };
  //         tokenStatic(staticData);
  //       }
  //     } catch (error) {
  //       chatWindowLogger.error({ error }, "Error while sending message");
  //       setRequestFailed(true);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   const handleContinue = async () => {
  //     // 移除第一条消息
  //     const newMessages = messages.slice(1);
  //     setMessages(newMessages);

  //     // 重置 isStopped 状态
  //     setIsStopped(false);

  //     // 发送新的请求
  //     if (newMessages.length > 0) {
  //       const lastUserMessage = newMessages[newMessages.length - 1].content;
  //       if (lastUserMessage) {
  //         await handleStreamMessage(lastUserMessage, newMessages);
  //       }
  //     }
  //   };
  //   const handleRetry = async () => {
  //     // 重置 tempMessages
  //     setTempMessages({ role: "assistant", id: "", content: "" });

  //     // 获取并移除最后一条消息
  //     const lastMessage = messages[messages.length - 1];
  //     const newMessages = messages.slice(0, -1);
  //     setMessages(newMessages);

  //     // 使用 handleSendMessage 重新发送最后一条消息
  //     if (lastMessage && lastMessage.role === "user") {
  //       await handleSendMessage(lastMessage.content);
  //     }
  //   };
  return (
    // <div className="flex flex-col lg:flex-row h-[calc(100vh-60px)]">
    //   {/* Config Panel and Toggle Button */}
    //   <div className="hidden lg:block lg:w-1/6 bg-gray-200 overflow-y-auto">
    //     {selectedChat && (
    //       <ChatSidebar
    //         chatList={chatList}
    //         selectedChat={selectedChat}
    //         handleChatSelect={handleChatSelectWithSearchParamsUpdate}
    //         reloadChatList={reloadChatList}
    //       />
    //     )}
    //   </div>

    //   {/* Chat Window */}
    //   <div className="w-full lg:w-5/6 flex flex-col h-full">
    //     <div className="flex justify-end p-4">
    //       <Button onClick={clearMessages} icon={<Icon name="trash" />}>
    //         {t("clearChat")}
    //         {/* todo 需要发出终止的信号 ，避免一直回复 */}
    //       </Button>
    //     </div>
    //     <MessagesDisplay
    //       messages={messages}
    //       tempMessages={tempMessages}
    //       scrollToBottom={scrollToBottom}
    //     />
    //     {allowSend ? (
    //       <div className="p-4">
    //         <MessageInput
    //           onSendMessage={handleSendMessage}
    //           isLoading={isLoading}
    //         />
    //       </div>
    //     ) : (
    //       <div>欠费大于10元，请在你的个人中心查看付费，点击你的名字</div>
    //     )}

    //     {requestFailed && <Button onClick={handleRetry}>重试</Button>}

    //     {isStopped && <Button onClick={handleContinue}>继续</Button>}
    //   </div>
    // </div>
    <div>chat</div>
  );
};

export default ChatPage;
