import React, { useEffect } from "react";

import withTranslations from "i18n/withTranslations";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectFilteredDataByUserAndTypeAndWorkspace } from "database/selectors";
import CustomizeAIButton from "ai/cybot/CustomizeAIButton";
import NewDialogButton from "chat/dialog/NewDialogButton";
import DialogSideBar from "chat/dialog/DialogSideBar";
import {
  queryDialogList,
  selectCurrentWorkSpaceId,
} from "create/workspace/workspaceSlice";
import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";

import { layout } from "render/styles/layout";
import { sizes } from "render/styles/sizes";

const ChatSidebar = () => {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector(selectCurrentUserId);
  const workspaceId = useAppSelector(selectCurrentWorkSpaceId);
  const data = useAppSelector(
    selectFilteredDataByUserAndTypeAndWorkspace(
      currentUserId,
      DataType.Dialog,
      workspaceId
    )
  );
  useEffect(() => {
    dispatch(queryDialogList());
  }, []);

  return (
    <nav>
      <div style={{ ...layout.flexBetween, gap: sizes.size2 }}>
        {/* <CustomizeAIButton /> */}
        <NewDialogButton />
      </div>
      {data && <DialogSideBar dialogList={data} />}
    </nav>
  );
};

export default withTranslations(ChatSidebar, ["chat", "ai"]);
