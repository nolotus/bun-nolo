// chat/dialog/DialogSideBar.tsx

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Select } from "render/ui";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import CustomizeAIButton from "ai/cybot/CustomizeAIButton";
import NewDialogButton from "./NewDialogButton";
import { DialogList } from "./DialogList";

const DialogSideBar = ({ dialogList }) => {
  const { t } = useTranslation();
  const [selectedWorkspace, setSelectedWorkspace] = useState("default");
  const theme = useSelector(selectTheme);

  const workspaces = [
    { value: "default", label: t("defaultWorkspace") },
    { value: "work", label: t("workWorkspace") },
    { value: "personal", label: t("personalWorkspace") },
  ];

  const sidebarContainerStyle = {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: theme.surface1,
  };

  const headerBarStyle = {
    padding: theme.sidebarPadding,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.medium,
  };

  const workspaceSelectStyle = {
    marginBottom: theme.spacing.medium,
  };

  const buttonContainerStyle = {
    display: "flex",
    justifyContent: "space-between",
    gap: theme.spacing.medium,
  };

  const scrollableContentStyle = {
    flexGrow: 1,
    overflowY: "auto",
    padding: `0 ${theme.sidebarPadding} ${theme.sidebarPadding}`,
  };

  const handleWorkspaceChange = (value) => {
    setSelectedWorkspace(value);
    // 这里可以添加切换工作区的逻辑
  };

  return (
    <div style={sidebarContainerStyle}>
      <div style={headerBarStyle}>
        <Select
          options={workspaces}
          value={selectedWorkspace}
          onChange={handleWorkspaceChange}
          style={workspaceSelectStyle}
        />
        <div style={buttonContainerStyle}>
          <CustomizeAIButton />
          <NewDialogButton />
        </div>
      </div>

      <div style={scrollableContentStyle}>
        <DialogList dialogList={dialogList} />
      </div>
    </div>
  );
};

export default DialogSideBar;
