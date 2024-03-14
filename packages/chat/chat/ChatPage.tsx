import aiTranslations from "ai/aiI18n";
import { useAppDispatch } from "app/hooks";
import { nolotusId } from "core/init";
import { updateData } from "database/dbSlice";
import { useLazyGetEntriesQuery } from "database/services";
import i18n from "i18n";
import React, { useEffect } from "react";

import chatTranslations from "../chatI18n";

import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import { baseHeight } from "app/styles/height";
for (const lang of Object.keys(chatTranslations)) {
  const translations = chatTranslations[lang].translation;
  i18n.addResourceBundle(lang, "translation", translations, true, true);
}

for (const lang of Object.keys(aiTranslations)) {
  const translations = aiTranslations[lang].translation;
  i18n.addResourceBundle(lang, "translation", translations, true, true);
}

const ChatPage = () => {
  const [getentries, { isLoading, isSuccess }] = useLazyGetEntriesQuery();
  const fetchChatList = async () => {
    const options = {
      isJSON: true,
      condition: {
        type: "tokenStatistics",
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
  useEffect(() => {
    fetchChatList();
  }, []);
  const dispatch = useAppDispatch();

  return (
    <div
      className={`flex flex-col lg:flex-row`}
      style={{ height: `calc(100vh - ${baseHeight})` }}
    >
      {/* Config Panel and Toggle Button */}
      <div className="w-full overflow-y-auto bg-gray-200 lg:block lg:w-1/6">
        <ChatSidebar />
      </div>

      {/* Chat Window */}
      <ChatWindow />
    </div>
  );
};

export default ChatPage;
