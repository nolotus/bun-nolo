// render/layout/TopBar.tsx

import React, { ReactNode } from "react";
import { stylePresets } from "render/styles/stylePresets";

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
import { HomeIcon } from "@primer/octicons-react";

import { motion } from "framer-motion";
import useMediaQuery from "react-responsive";
import MenuButton from "./MenuButton";
import { layout } from "../styles/layout";
import NavIconItem from "./blocks/NavIconItem";

interface TopBarProps {
  toggleSidebar?: () => void;
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
        ...layout.flex,
        ...layout.flexBetween,
        backgroundColor: "transparent",
        position: "sticky",
        top: 0,
        right: 0,
        width: "100%",
        padding: "12px 16px",
        zIndex: 2,
        height: "60px",
      }}
    >
      {toggleSidebar && (
        <MenuButton
          onClick={toggleSidebar}
          theme={theme}
          isExpanded={isExpanded}
        />
      )}
      <NavIconItem path="/" icon={<HomeIcon size={24} />} />

      <div
        style={{
          flex: 1,
          ...layout.flexCenter,
          ...layout.flexWrap,
          marginLeft: toggleSidebar ? undefined : "16px",
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
                    ...stylePresets.flexEnd,
                    fontSize: "14px",
                    color: theme.text2,
                    padding: "0 16px",
                    borderRadius: "8px",
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
        {topbarContent}
      </div>

      <div style={stylePresets.flexEnd}>
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
