import i18n from "i18n";
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { useAppDispatch, useAppSelector, useQueryData } from "app/hooks";

import { DataType } from "create/types";

import { selectFilteredDataByUserAndType } from "database/selectors";
import { useAuth } from "auth/useAuth";
import { selectCurrentUserId } from "auth/authSlice";
import { PageLoader } from "render/blocks/PageLoader";

import DialogSidebar from "./dialog/DialogSideBar";
import ChatWindow from "./MsgWindow";
import { initDialog, selectCurrentDialogConfig } from "./dialog/dialogSlice";
import { ChatGuide } from "./ChatGuide";
import withTranslations from "i18n/withTranslations";

const ChatPage = () => {
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const dialogId = searchParams.get("dialogId");

  const dispatch = useAppDispatch();
  if (!auth.user) {
    return (
      <div className="container mx-auto mt-16 text-center text-3xl">请登录</div>
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
  };

  useEffect(() => {
    dialogId && dispatch(initDialog({ dialogId }));
  }, [dialogId]);

  const currentUserId = useAppSelector(selectCurrentUserId);
  const queryConfig = {
    queryUserId: currentUserId,
    options: {
      isJSON: true,
      limit: 100,
      condition: {
        type: DataType.Dialog,
      },
    },
  };
  const { isLoading, isSuccess } = useQueryData(queryConfig);
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const dialogList = useAppSelector(
    selectFilteredDataByUserAndType(currentUserId, DataType.Dialog),
  );
  if (isLoading) {
    return <PageLoader />;
  }
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "row" }}>
      {dialogList.length > 0 && <DialogSidebar dialogList={dialogList} />}

      {currentDialogConfig && isSuccess && (
        <ChatWindow currentDialogConfig={currentDialogConfig} />
      )}

      {isSuccess && dialogList.length == 0 && <ChatGuide />}
    </div>
  );
};

export default withTranslations(ChatPage, ["chat"]);
