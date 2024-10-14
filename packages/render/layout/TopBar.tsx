// render/layout/TopBar.tsx
import React, { ReactNode } from "react";
import { themeStyles } from "render/ui/styles";
import MenuButton from "./MenuButton";
import { GearIcon } from "@primer/octicons-react";
import { CreateMenu } from "create/CreateMenu";
import { useAppSelector } from "app/hooks";
import {
  selectCurrentDialogConfig,
  selectTotalDialogTokens,
} from "chat/dialog/dialogSlice";
import DeleteDialogButton from "chat/dialog/DeleteDialogButton";
import CreateDialogButton from "chat/dialog/CreateDialogButton";
import EditableTitle from "chat/dialog/EditableTitle";
import CybotNameChip from "chat/dialog/CybotNameChip";

interface TopBarProps {
  toggleSidebar: () => void;
  theme: any;
  topbarContent?: ReactNode;
}

const topBarStyles = (theme: any) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.small,
  marginBottom: theme.topBarMargin, // 使用主题中的 topBarMargin
  position: "sticky" as const,
  top: 0,
  zIndex: theme.topBarZIndex, // 使用主题中的 topBarZIndex
  background: "transparent",
  padding: theme.topBarPadding, // 使用主题中的 topBarPadding
  borderBottom: `1px solid ${theme.border}`,
});

const topBarContentStyles = (theme: any) => ({
  marginLeft: theme.spacing.small,
});

const topBarActionsStyles = (theme: any) => ({
  marginLeft: "auto",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.small,
});

const TopBar: React.FC<TopBarProps> = ({
  toggleSidebar,
  theme,
  topbarContent,
}) => {
  const currentDialogTokens = useAppSelector(selectTotalDialogTokens);
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  return (
    <div style={topBarStyles(theme)}>
      <MenuButton onClick={toggleSidebar} theme={theme} />
      {currentDialogConfig && (
        <>
          <EditableTitle currentDialogConfig={currentDialogConfig} />
          {currentDialogConfig.cybots?.map((cybotId) => (
            <CybotNameChip
              key={cybotId}
              cybotId={cybotId}
              source={currentDialogConfig.source}
            />
          ))}
          <div
            style={{
              fontSize: theme.fontSize.small,
              color: theme.text2,
              marginLeft: "auto",
              padding: `${theme.spacing.xsmall} ${theme.spacing.small}`,
              backgroundColor: theme.surface2,
              borderRadius: theme.borderRadius,
            }}
          >
            Tokens: {currentDialogTokens}
          </div>
          <CreateDialogButton dialogConfig={currentDialogConfig} />
          <DeleteDialogButton dialogConfig={currentDialogConfig} />
        </>
      )}

      {topbarContent && (
        <>
          <div style={topBarContentStyles(theme)}>{topbarContent}</div>
        </>
      )}
      <div style={topBarActionsStyles(theme)}>
        <CreateMenu />
      </div>
    </div>
  );
};
export default TopBar;
