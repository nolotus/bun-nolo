import i18n from "i18n";
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { useAppDispatch, useAppSelector, useQueryData } from "app/hooks";

import { DataType } from "create/types";
import aiTranslations from "ai/aiI18n";
import { selectFilteredDataByUserAndType } from "database/selectors";
import { useAuth } from "auth/useAuth";

import chatTranslations from "./chatI18n";
import DialogSidebar from "./dialog/DialogSideBar";
import ChatWindow from "./messages/MessageWindow";
import { initDialog, selectCurrentDialogConfig } from "./dialog/dialogSlice";
import { ChatGuide } from "./ChatGuide";
import { selectCurrentUserId } from "auth/authSlice";

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
  const dialogId = searchParams.get("dialogId");

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
    dialogId && dispatch(initDialog(dialogId));
  }, [dialogId]);
  const currentUserId = useAppSelector(selectCurrentUserId);

  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
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
  const { isLoading, isSuccess } = useQueryData(queryConfig);
  const dialogList = useAppSelector(
    selectFilteredDataByUserAndType(currentUserId, DataType.Dialog),
  );
  return (
    <div className={`flex flex-col lg:flex-row`} style={{ height: "100vh" }}>
      {isLoading && <div>loading</div>}

      {dialogList.length > 0 && (
        <div className="w-full overflow-y-auto  lg:block lg:w-1/5">
          <DialogSidebar dialogList={dialogList} />
        </div>
      )}

      {currentDialogConfig && isSuccess && (
        <div className="lg:w-4/5">
          <ChatWindow currentDialogConfig={currentDialogConfig} />
        </div>
      )}

      {isSuccess && dialogList.length == 0 && <ChatGuide />}
    </div>
  );
};

export default ChatPage;
