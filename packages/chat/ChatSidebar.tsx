import React from "react";

import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";
import { styles } from "render/ui/styles";
import withTranslations from "i18n/withTranslations";
import { useAppSelector } from "app/hooks";
import { useQueryData } from "app/hooks/useQueryData";

import CustomizeAIButton from "ai/cybot/CustomizeAIButton";
import NewDialogButton from "chat/dialog/NewDialogButton";
import DialogSideBar from "chat/dialog/DialogSideBar";

const ChatSidebar = () => {
  const currentUserId = useAppSelector(selectCurrentUserId);

  const queryConfig = {
    queryUserId: currentUserId,
    options: {
      isJSON: true,
      limit: 200,
      condition: {
        type: DataType.Dialog,
      },
    },
  };
  const { data, isLoading, isSuccess } = useQueryData(queryConfig);
  return (
    <nav>
      <div style={{ ...styles.flexBetween, ...styles.gap2 }}>
        {/* <CustomizeAIButton /> */}
        <NewDialogButton />
      </div>
      {isSuccess && <DialogSideBar />}
    </nav>
  );
};
export default withTranslations(ChatSidebar, ["chat", "ai"]);
