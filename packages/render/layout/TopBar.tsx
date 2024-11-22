// render/layout/TopBar.tsx
import React, { ReactNode } from "react";
import { styles, themeStyles } from "render/ui/styles";
import MenuButton from "./MenuButton";
import { CreateMenu } from "create/CreateMenu";
import { useAppSelector } from "app/hooks";
import CybotNameChip from "ai/cybot/CybotNameChip";
import { useAuth } from "auth/useAuth";
import { IsLoggedInMenu } from "auth/pages/IsLoggedInMenu";
import NavListItem from "render/layout/blocks/NavListItem";
import { useTranslation } from "react-i18next";
import { SignInIcon } from "@primer/octicons-react";
import {
  selectCurrentDialogConfig,
  selectTotalDialogTokens,
} from "chat/dialog/dialogSlice";
import DeleteDialogButton from "chat/dialog/DeleteDialogButton";
import CreateDialogButton from "chat/dialog/CreateDialogButton";
import EditableTitle from "chat/dialog/EditableTitle";
import { RoutePaths } from "auth/client/routes";

import { motion } from "framer-motion";
import useMediaQuery from "react-responsive";

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
  const { t } = useTranslation();

  const { isLoggedIn } = useAuth();

  const currentDialogTokens = useAppSelector(selectTotalDialogTokens);
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  return (
    <div
      style={{
        ...styles.flex,
        ...styles.flexBetween,
        ...styles.p1,
        ...styles.zIndex2,
        backgroundColor: "transparent",
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
          ...styles.flexWrap,
        }}
      >
        {currentDialogConfig && (
          <>
            <EditableTitle currentDialogConfig={currentDialogConfig} />
            {currentDialogConfig.cybots?.map((cybotId) => (
              <CybotNameChip key={cybotId} cybotId={cybotId} />
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
        {isLoggedIn ? (
          <div>
            <IsLoggedInMenu />
          </div>
        ) : (
          <NavListItem
            label={t("login")}
            icon={<SignInIcon size={16} />}
            path={RoutePaths.LOGIN}
          />
        )}
      </div>
    </div>
  );
};

export default TopBar;
