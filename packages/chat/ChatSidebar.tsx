import React, { useEffect, useState } from "react";
import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";
import { styles } from "render/ui/styles";
import withTranslations from "i18n/withTranslations";
import { useAppSelector } from "app/hooks";
import { useQuery } from "app/hooks/useQuery";
import { useTranslation } from "react-i18next";

import CustomizeAIButton from "ai/cybot/CustomizeAIButton";
import NewDialogButton from "chat/dialog/NewDialogButton";
import DialogSideBar from "chat/dialog/DialogSideBar";
import { selectCurrentWorkSpaceId } from "create/workspace/workspaceSlice";

const ChatSidebar = () => {
  const currentUserId = useAppSelector(selectCurrentUserId);
  const { t } = useTranslation();

  const [data, setData] = useState(null);

  const { fetchData, isLoading, error, isSuccess } = useQuery();

  const workspaceId = useAppSelector(selectCurrentWorkSpaceId);

  useEffect(() => {
    let condition = {};
    if (workspaceId === "all") {
      condition = {
        type: DataType.Dialog,
      };
    } else {
      condition = {
        type: DataType.Dialog,
        workspaceId,
      };
    }
    const queryConfig = {
      queryUserId: currentUserId,
      options: {
        isJSON: true,
        limit: 200,
        condition,
      },
    };

    fetchAndSetData(queryConfig);
  }, [workspaceId]); // 监视 newWorkspaceId 和 fetchData

  const fetchAndSetData = async (queryConfig) => {
    try {
      setData(null);
      const result = await fetchData(queryConfig);
      setData(result);
    } catch (err) {
      // 错误处理
    }
  };

  return (
    <nav>
      <div style={{ ...styles.flexBetween, ...styles.gap2 }}>
        {/* <CustomizeAIButton /> */}
        <NewDialogButton />
      </div>
      {isSuccess && <DialogSideBar dialogList={data} />}
    </nav>
  );
};

export default withTranslations(ChatSidebar, ["chat", "ai"]);
