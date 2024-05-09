import i18n from "i18n";
import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import { baseHeight } from "app/styles/height";
import { useAppDispatch, useAppSelector, useAuth } from "app/hooks";

import { nolotusId } from "core/init";
import {
  updateData,
  makeSelectEntityById,
  upsertOne,
  upsertMany,
} from "database/dbSlice";
import { useLazyGetEntriesQuery } from "database/services";
import { useLazyGetEntryQuery } from "database/services";

import { DataType } from "create/types";
import CreateChatAIButton from "ai/blocks/CreateChatAIButton";
import { chatAIOptions } from "ai/request";
import aiTranslations from "ai/aiI18n";
import ChatAIList from "ai/blocks/ChatAIList";
import { selectCurrentUserChatRobots } from "chat/selectors";

import chatTranslations from "../chatI18n";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";

for (const lang of Object.keys(chatTranslations)) {
  const translations = chatTranslations[lang].translation;
  i18n.addResourceBundle(lang, "translation", translations, true, true);
}

for (const lang of Object.keys(aiTranslations)) {
  const translations = aiTranslations[lang].translation;
  i18n.addResourceBundle(lang, "translation", translations, true, true);
}

const ChatPage = () => {
  const auth = useAuth();

  if (!auth.user) {
    return (
      <div className="container mx-auto mt-16 text-center text-3xl">
        please login to use AI chat
      </div>
    );
  }
  const [getDefaultConfig] = useLazyGetEntryQuery();
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("chatId");
  const [getentries] = useLazyGetEntriesQuery();
  const fetchTokenUsage = async () => {
    const options = {
      isJSON: true,
      condition: {
        type: DataType.TokenStats,
      },
      limit: 10000,
    };

    const defaultTokenStatisticsList = await getentries({
      userId: nolotusId,
      options,
    }).unwrap();
    const nolotusTokenStatisticsList = await getentries({
      userId: nolotusId,
      options,
      domain: "https://nolotus.com",
    }).unwrap();
    console.log("defaultTokenStatisticsList", defaultTokenStatisticsList);
    dispatch(updateData({ data: defaultTokenStatisticsList }));
    console.log("nolotusTokenStatisticsList", nolotusTokenStatisticsList);
    dispatch(updateData({ data: nolotusTokenStatisticsList }));
  };
  const fetchChatList = async (userId) => {
    const userChatList = await getentries({
      userId,
      options: chatAIOptions,
    }).unwrap();
    dispatch(upsertMany(userChatList));
  };
  useEffect(() => {
    if (auth.user?.userId) {
      fetchChatList(auth.user?.userId);
      fetchTokenUsage(auth.user?.userId);
    }
  }, [auth.user?.userId]);

  useEffect(() => {
    const requestDefaultConfig = async () => {
      if (chatId) {
        const chatIdConfig = await getDefaultConfig({
          entryId: chatId,
        }).unwrap();
        console.log("chatIdConfig", chatIdConfig);
        if (chatIdConfig.status === 404) {
          navigate("/chat");
        } else {
          dispatch(upsertOne({ id: chatIdConfig.id, value: chatIdConfig }));
        }
      }
    };
    requestDefaultConfig();
  }, [chatId, dispatch, getDefaultConfig, navigate]);

  const chatItems = useAppSelector((state) =>
    selectCurrentUserChatRobots(state),
  );

  const currentChatConfig = useAppSelector(makeSelectEntityById(chatId));
  console.log("currentChatConfig", currentChatConfig);
  const chatList = currentChatConfig
    ? [...new Set([currentChatConfig, ...chatItems])]
    : chatItems;

  console.log("chatItems", chatItems);
  console.log("chatList", chatList);
  return (
    <div
      className={`flex flex-col lg:flex-row`}
      style={{ height: `calc(100vh - ${baseHeight})` }}
    >
      {chatItems.length > 0 || currentChatConfig ? (
        <>
          <div className="w-full overflow-y-auto bg-gray-200 lg:block lg:w-1/6">
            <ChatSidebar chatList={chatList} />
          </div>
          <ChatWindow currentChatConfig={currentChatConfig} />
        </>
      ) : (
        <div className="container mx-auto mt-16">
          <h2>创建自己的=》</h2>
          <CreateChatAIButton />
          <h2>使用别人的=》</h2>
          <ChatAIList />
        </div>
      )}
    </div>
  );
};

export default ChatPage;
