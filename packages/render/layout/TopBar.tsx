import { HomeIcon, SignInIcon } from "@primer/octicons-react";
import CybotNameChip from "ai/cybot/CybotNameChip"; // 确认路径
import { useAppSelector } from "app/hooks";
import { RoutePaths } from "auth/web/routes"; // 确认路径
import { LoggedInMenu } from "auth/web/IsLoggedInMenu"; // 确认路径
import { useAuth } from "auth/hooks/useAuth"; // 确认路径
import CreateDialogButton from "chat/dialog/CreateDialogButton"; // 确认路径
import DeleteDialogButton from "chat/dialog/DeleteDialogButton"; // 确认路径
import EditableTitle from "chat/dialog/EditableTitle"; // 确认路径
import {
  selectCurrentDialogConfig,
  selectTotalDialogTokens,
} from "chat/dialog/dialogSlice"; // 确认路径
import { CreateMenu } from "create/CreateMenu"; // 确认路径
import type React from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom"; // 确保导入 useParams

import NavListItem from "render/layout/blocks/NavListItem"; // 确认路径
import MenuButton from "./MenuButton"; // 确认路径
import NavIconItem from "./blocks/NavIconItem"; // 确认路径
import { selectPageData } from "../page/pageSlice"; // 确认路径
import { extractUserId } from "core/prefix"; // 确认路径
import { CreateTool } from "create/CreateTool"; // 确认路径

interface TopBarProps {
  toggleSidebar?: () => void;
  theme: any; // 或者更具体的 Theme 类型
  topbarContent?: ReactNode;
  isExpanded: boolean;
}

const styles = {
  height: "60px",
  spacing: "8px",
};

const TopBar: React.FC<TopBarProps> = ({
  toggleSidebar,
  theme,
  topbarContent,
  isExpanded,
}) => {
  const { t } = useTranslation();
  const { isLoggedIn, user } = useAuth(); // 直接解构 user
  const currentDialogTokens = useAppSelector(selectTotalDialogTokens);
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const pageData = useAppSelector(selectPageData);

  // *** 修改: 从 useParams 获取 pageKey ***
  const { pageKey } = useParams<{ pageKey?: string }>();

  // *** 修改: 使用 pageKey 提取 dataCreator ***
  const dataCreator = pageKey ? extractUserId(pageKey) : undefined;

  // 判断编辑权限和是否有内容显示编辑工具
  const isCreator = dataCreator === user?.userId;
  // 假设 pageData.creator 字段存在，或者用其他方式判断归属
  const isNotBelongAnyone = !pageData.creator; // 你可能需要调整这个判断逻辑
  const allowEdit = isCreator || isNotBelongAnyone; // 编辑权限逻辑
  // 检查 pageSlice 是否已初始化并有数据
  const hasPageData =
    pageData.isInitialized && (pageData.content || pageData.slateData);

  // 决定是否显示 CreateTool
  // 条件：当前路由是 page 类型 (通过 pageKey 前缀判断)，并且允许编辑，并且页面有数据
  const displayEditTool =
    pageKey?.startsWith("page") && allowEdit && hasPageData;

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          {toggleSidebar && (
            <MenuButton onClick={toggleSidebar} isExpanded={isExpanded} />
          )}
          <NavIconItem path="/" icon={<HomeIcon size={16} />} />
        </div>

        <div className="topbar-center">
          <div className="topbar-content-wrapper">
            {/* Dialog 相关 UI */}
            {currentDialogConfig && (
              <>
                <EditableTitle currentDialogConfig={currentDialogConfig} />
                {currentDialogConfig.cybots?.map((cybotId) => (
                  <CybotNameChip key={cybotId} cybotId={cybotId} />
                ))}
                <div className="token-counter">
                  Tokens: {currentDialogTokens}
                </div>
                <CreateDialogButton dialogConfig={currentDialogConfig} />
                <DeleteDialogButton dialogConfig={currentDialogConfig} />
              </>
            )}
            {/* Page 编辑工具 */}
            {displayEditTool && <CreateTool />}
            {/* 其他可能的内容 */}
            {topbarContent}
          </div>
        </div>

        <div className="topbar-right">
          <CreateMenu />
          {isLoggedIn ? (
            <LoggedInMenu />
          ) : (
            <NavListItem
              label={t("login")}
              icon={<SignInIcon size={16} />}
              path={RoutePaths.LOGIN}
            />
          )}
        </div>
      </div>
      <style>
        {`
          .topbar { display: flex; justify-content: space-between; align-items: center; background-color: transparent; position: sticky; top: 0; right: 0; width: 100%; padding: 12px 16px; z-index: 2; height: ${styles.height}; }
          .topbar-left { display: flex; align-items: center; gap: ${styles.spacing}; min-width: 90px; }
          .topbar-center { flex: 1; display: flex; align-items: center; justify-content: center; gap: ${styles.spacing}; padding: 0 24px; }
          .topbar-content-wrapper { display: flex; align-items: center; justify-content: center; gap: ${styles.spacing}; max-width: 800px; width: 100%; }
          .token-counter { display: inline-flex; align-items: center; justify-content: center; padding: 0 12px; border-radius: 6px; background: ${theme.surface2}; color: ${theme.text2}; font-size: 14px; height: 32px; /* 固定高度以便对齐 */ }
          .topbar-right { display: flex; align-items: center; gap: ${styles.spacing}; min-width: 90px; justify-content: flex-end; }
          @media (max-width: 768px) { .topbar { padding: 8px 12px; } .topbar-center { padding: 0 12px; gap: 4px; } .topbar-right { gap: 4px; } .token-counter { display: none; } }
          /* 可能需要为 CreateTool 和 Dialog 相关工具添加更多响应式样式 */
          @media (max-width: 640px) { .topbar-center .editable-title, .topbar-center .cybot-chip /* 举例 */ { display: none; } }
        `}
      </style>
    </>
  );
};

export default TopBar;
