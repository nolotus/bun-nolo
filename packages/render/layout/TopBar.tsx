// render/layout/TopBar.tsx
import React, { ReactNode } from "react";
import { stylePresets } from "render/ui/stylePresets";

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
import { sp } from "../ui/sp";
import { layout } from "../ui/layout";

interface TopBarProps {
  toggleSidebar?: () => void; // 改为可选
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
        ...sp.p1,
        ...stylePresets.zIndex2,
        backgroundColor: "transparent",
        position: "sticky",
        top: 0,
      }}
    >
      {/* 只在有 toggleSidebar 时显示菜单按钮 */}
      {toggleSidebar && (
        <MenuButton
          onClick={toggleSidebar}
          theme={theme}
          isExpanded={isExpanded}
        />
      )}
      <NavListItem path="/" icon={<HomeIcon size={24} />} />

      <div
        style={{
          flex: 1,
          ...stylePresets.flexCenter,
          ...stylePresets.flexWrap,
          // 当没有菜单按钮时调整左边距
          marginLeft: toggleSidebar ? undefined : theme.spacing.md,
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
                    fontSize: theme.fontSize.small,
                    color: theme.text2,
                    ...sp.px2,
                    ...stylePresets.roundedMd,
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
