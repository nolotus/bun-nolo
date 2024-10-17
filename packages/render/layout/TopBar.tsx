// render/layout/TopBar.tsx
import React, { ReactNode } from "react";
import { styles, themeStyles } from "render/ui/styles";
import MenuButton from "./MenuButton";
import { CreateMenu } from "create/CreateMenu";
import { useAppSelector } from "app/hooks";
import CybotNameChip from "ai/cybot/CybotNameChip";

import {
  selectCurrentDialogConfig,
  selectTotalDialogTokens,
} from "chat/dialog/dialogSlice";
import DeleteDialogButton from "chat/dialog/DeleteDialogButton";
import CreateDialogButton from "chat/dialog/CreateDialogButton";
import EditableTitle from "chat/dialog/EditableTitle";

import { motion } from "framer-motion";
import useMediaQuery from "react-responsive"; // 用于检测移动设备

interface TopBarProps {
  toggleSidebar: () => void;
  theme: any;
  topbarContent?: ReactNode;
  isExpanded: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  toggleSidebar,
  theme,
  topbarContent,
  isExpanded,
}) => {
  const currentDialogTokens = useAppSelector(selectTotalDialogTokens);
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  return (
    <div
      style={{
        ...styles.flex,
        ...styles.flexBetween,
        ...themeStyles.surface1(theme),
        ...styles.p1,
        ...styles.zIndex2,
        position: "sticky",
        top: 0,
      }}
    >
      <MenuButton
        onClick={toggleSidebar}
        theme={theme}
        isExpanded={isExpanded}
      />
      <div
        style={{
          flex: 1,
          ...styles.flexCenter,
          ...styles.flexWrap, // 增加 flexWrap 以适应内容的自适应布局
        }}
      >
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
            {!isMobile && currentDialogTokens > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  style={{
                    ...styles.flexEnd,
                    fontSize: theme.fontSize.small,
                    color: theme.text2,
                    ...styles.px2,
                    ...styles.roundedMd,
                    backgroundColor: theme.surface2,
                  }}
                >
                  Tokens: {currentDialogTokens}
                </div>
              </motion.div>
            )}
            <CreateDialogButton dialogConfig={currentDialogConfig} />
            <DeleteDialogButton dialogConfig={currentDialogConfig} />
          </>
        )}
      </div>
      <div style={styles.flexEnd}>
        <CreateMenu />
      </div>
    </div>
  );
};

export default TopBar;
