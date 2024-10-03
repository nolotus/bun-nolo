import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import * as Ariakit from "@ariakit/react";
import { selectTheme } from "app/theme/themeSlice";
import { Select } from "render/ui";
import { FileIcon, FileDirectoryIcon } from "@primer/octicons-react";
import { useTranslation } from "react-i18next";

import { DialogList } from "./DialogList";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { ContextMenu, MenuItem } from "render/components/ContextMenu";

const DialogSideBar = ({ dialogList }) => {
  const theme = useSelector(selectTheme);
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspace();
  const { t } = useTranslation();
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 });
  const menu = Ariakit.useMenuStore();

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

  const scrollableContentStyle = {
    flexGrow: 1,
    overflowY: "auto",
    padding: `0 ${theme.sidebarPadding} ${theme.sidebarPadding}`,
  };

  const handleWorkspaceChange = useCallback(
    (event) => {
      const value = event.target.value;
      const selectedWorkspace = workspaces.find((ws) => ws.id === value);
      if (selectedWorkspace) {
        setCurrentWorkspace(selectedWorkspace);
      }
    },
    [workspaces, setCurrentWorkspace],
  );

  const workspaceOptions = workspaces.map((ws) => ({
    value: ws.id,
    label: ws.name,
  }));

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setAnchorRect({ x: event.clientX, y: event.clientY });
    menu.show();
  };

  const menuItems: MenuItem[] = [
    {
      id: "addFile",
      label: t("addFile"),
      icon: <FileIcon size={16} />,
      onClick: () => {
        console.log("Add file");
        menu.hide();
      },
    },
    {
      id: "addProject",
      label: t("addProject"),
      icon: <FileDirectoryIcon size={16} />,
      onClick: () => {
        console.log("Add project");
        menu.hide();
      },
    },
  ];

  return (
    <div style={sidebarContainerStyle} onContextMenu={handleContextMenu}>
      <div style={headerBarStyle}>
        <Select
          options={workspaceOptions}
          value={currentWorkspace ? currentWorkspace.id : ""}
          onChange={handleWorkspaceChange}
          style={workspaceSelectStyle}
          placeholder="Select a workspace"
        />
      </div>

      <div style={scrollableContentStyle}>
        <DialogList dialogList={dialogList} />
      </div>

      <ContextMenu menu={menu} anchorRect={anchorRect} items={menuItems} />
    </div>
  );
};

export default DialogSideBar;
