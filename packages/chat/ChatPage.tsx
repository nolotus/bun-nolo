import i18n from "i18n";
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { chatPageHeight } from "app/styles/height";
import {
  useAppDispatch,
  useAppSelector,
  useAuth,
  useQueryData,
} from "app/hooks";

import { DataType } from "create/types";
import aiTranslations from "ai/aiI18n";

import chatTranslations from "./chatI18n";
import DialogSidebar from "./dialog/DialogSideBar";
import ChatWindow from "./messages/MessageWindow";
import { initDialog, selectCurrentDialogConfig } from "./dialog/dialogSlice";
import { ChatGuide } from "./ChatGuide";
import { selectFilteredDataByUserAndType } from "database/selectors";
import { selectCurrentUserId } from "auth/selectors";

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
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("chatId");

  const dispatch = useAppDispatch();

  if (!auth.user) {
    return (
      <div className="container mx-auto mt-16 text-center text-3xl">
        please login to use AI chat
      </div>
    );
  }

  const fetchTokenUsage = async () => {
    const options = {
      isJSON: true,
      condition: {
        type: DataType.TokenStats,
      },
      limit: 10000,
    };

    // const defaultTokenStatisticsList = await getentries({
    //   userId: nolotusId,
    //   options,
    // }).unwrap();
    // const nolotusTokenStatisticsList = await getentries({
    //   userId: nolotusId,
    //   options,
    //   domain: "https://nolotus.com",
    // }).unwrap();
    // console.log("defaultTokenStatisticsList", defaultTokenStatisticsList);
    // dispatch(updateData({ data: defaultTokenStatisticsList }));
    // console.log("nolotusTokenStatisticsList", nolotusTokenStatisticsList);
    // dispatch(updateData({ data: nolotusTokenStatisticsList }));
  };

  useEffect(() => {
    chatId && dispatch(initDialog(chatId));
  }, [chatId]);

  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const currentUserId = useAppSelector(selectCurrentUserId);
  const queryConfig = {
    queryUserId: currentUserId,
    options: {
      isJSON: true,
      limit: 20,
      condition: {
        type: DataType.Dialog,
      },
    },
  };
  const { isLoading } = useQueryData(queryConfig);
  const dialogList = useAppSelector(
    selectFilteredDataByUserAndType(currentUserId, DataType.Dialog),
  );
  return (
    <div
      className={`flex flex-col lg:flex-row`}
      style={{ height: `${chatPageHeight}` }}
    >
      {dialogList.length > 0 || currentDialogConfig ? (
        <>
          <div className="w-full overflow-y-auto bg-white lg:block lg:w-1/6">
            <DialogSidebar dialogList={dialogList} />
          </div>
          {currentDialogConfig && (
            <ChatWindow currentDialogConfig={currentDialogConfig} />
          )}
        </>
      ) : (
        <ChatGuide />
      )}
    </div>
  );
};

export default ChatPage;
