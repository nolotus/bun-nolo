import i18n from "i18n";
import React, { useEffect } from "react";

import { baseHeight } from "app/styles/height";
import { useAppDispatch, useAppSelector, useAuth } from "app/hooks";

import { nolotusId } from "core/init";
import { updateData } from "database/dbSlice";
import { useLazyGetEntriesQuery } from "database/services";
import { useSearchParams, useNavigate } from "react-router-dom";

import { DataType } from "create/types";
import CreateChatAIButton from "ai/blocks/CreateChatAIButton";
import { chatAIOptions } from "ai/request";
import aiTranslations from "ai/aiI18n";
import ChatAIList from "ai/blocks/ChatAIList";

import chatTranslations from "../chatI18n";
import { fetchChatListSuccess } from "../chatSlice";
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
  console.log("auth", auth);
  if (!auth.user) {
    return (
      <div className="container mx-auto mt-16 text-center text-3xl">
        please login to use AI chat
      </div>
    );
  }
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("chatId");
  const [getentries, { isLoading, isSuccess }] = useLazyGetEntriesQuery();
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
  const fetchChatList = async () => {
    if (auth.user?.userId) {
      const userChatList = await getentries({
        userId: auth.user?.userId,
        options: chatAIOptions,
      }).unwrap();
      isSuccess && dispatch(fetchChatListSuccess(userChatList));
    }
  };
  useEffect(() => {
    fetchChatList();
    fetchTokenUsage();
  }, []);
  const chatList = useAppSelector((state) => state.chat.chatList);
  console.log("chatList", chatList.ids.length);

  return (
    <div
      className={`flex flex-col lg:flex-row`}
      style={{ height: `calc(100vh - ${baseHeight})` }}
    >
      {chatList.ids.length > 0 || chatId ? (
        <>
          <div className="w-full overflow-y-auto bg-gray-200 lg:block lg:w-1/6">
            <ChatSidebar />
          </div>
          <ChatWindow />
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
