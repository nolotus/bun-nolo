// chat/dialog/DialogSideBar.tsx

import React, { useCallback } from "react";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import CustomizeAIButton from "ai/cybot/CustomizeAIButton";
import { Select } from "render/ui";

import NewDialogButton from "./NewDialogButton";
import { DialogList } from "./DialogList";
import { useWorkspace } from "../contexts/WorkspaceContext";

const DialogSideBar = ({ dialogList }) => {
  const theme = useSelector(selectTheme);
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspace();

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

  const handleWorkspaceChange = useCallback(
    (event) => {
      const value = event.target.value;
      console.log("Workspace changed to:", value);
      const selectedWorkspace = workspaces.find((ws) => ws.id === value);
      if (selectedWorkspace) {
        console.log("Setting current workspace to:", selectedWorkspace);
        setCurrentWorkspace(selectedWorkspace);
      }
    },
    [workspaces, setCurrentWorkspace],
  );

  const workspaceOptions = workspaces.map((ws) => ({
    value: ws.id,
    label: ws.name,
  }));

  return (
    <div style={sidebarContainerStyle}>
      <div style={headerBarStyle}>
        <Select
          options={workspaceOptions}
          value={currentWorkspace ? currentWorkspace.id : ""}
          onChange={handleWorkspaceChange}
          style={workspaceSelectStyle}
          placeholder="Select a workspace"
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
