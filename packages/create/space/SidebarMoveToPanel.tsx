// path: components/sidebar/SidebarMoveToPanel.tsx

import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "app/store";
import toast from "react-hot-toast";
import {
  selectAllMemberSpaces,
  selectCurrentSpaceId,
  moveContentToSpace,
} from "create/space/spaceSlice";

type SidebarMoveToPanelProps = {
  contentKey: string;
  onClose: () => void;
};

const SidebarMoveToPanel: React.FC<SidebarMoveToPanelProps> = ({
  contentKey,
  onClose,
}) => {
  const { t } = useTranslation("space");
  const dispatch = useAppDispatch();
  const memberSpaces = useAppSelector(selectAllMemberSpaces);
  const currentSpaceId = useAppSelector(selectCurrentSpaceId);
  const [movingSpaceId, setMovingSpaceId] = useState<string | null>(null);

  const handleSpaceSelect = useCallback(
    async (targetSpaceId: string) => {
      if (!currentSpaceId || currentSpaceId === targetSpaceId) return;

      setMovingSpaceId(targetSpaceId);
      try {
        await dispatch(
          moveContentToSpace({
            contentKey,
            sourceSpaceId: currentSpaceId,
            targetSpaceId,
            targetCategoryId: undefined,
          })
        ).unwrap();
        toast.success(t("contentMoved"));
        onClose();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t("unknownError");
        toast.error(t("moveFailed", { message }));
      } finally {
        setMovingSpaceId(null);
      }
    },
    [contentKey, currentSpaceId, dispatch, onClose, t]
  );

  const availableSpaces = memberSpaces.filter(
    (space) => space.spaceId !== currentSpaceId
  );

  return (
    <>
      <div className="SidebarItem__move-panel" role="menu">
        {availableSpaces.length > 0 ? (
          availableSpaces.map((space) => (
            <button
              key={space.spaceId}
              className={`SidebarItem__move-panel-item ${
                movingSpaceId === space.spaceId
                  ? "SidebarItem__move-panel-item--loading"
                  : ""
              }`}
              onClick={() => handleSpaceSelect(space.spaceId)}
              disabled={!!movingSpaceId}
              role="menuitem"
            >
              {movingSpaceId === space.spaceId && (
                <span className="SidebarItem__loading-spinner" />
              )}
              <span>{space.spaceName || t("unnamedSpace")}</span>
            </button>
          ))
        ) : (
          <div className="SidebarItem__move-panel-empty">
            {t("noOtherSpaces")}
          </div>
        )}
      </div>

      {/* --- 变更点: 将相关 CSS 提取到此组件内部 --- */}
      <style href="SidebarMoveToPanel-styles" precedence="high">
        {`
          .SidebarItem__move-panel {
            background: var(--background);
            border-radius: 8px;
            padding: var(--space-1);
            min-width: 180px;
            border: 1px solid var(--border);
            box-shadow: 0 8px 24px var(--shadowMedium), 0 2px 8px var(--shadowLight);
          }

          .SidebarItem__move-panel-item {
            display: flex;
            align-items: center;
            width: 100%;
            padding: var(--space-2) var(--space-3);
            color: var(--text);
            background: none;
            border: none;
            cursor: pointer;
            border-radius: 6px;
            text-align: left;
            transition: background-color 0.12s ease;
          }

          .SidebarItem__move-panel-item:hover:not(:disabled) {
            background-color: var(--backgroundHover);
          }
          
          .SidebarItem__move-panel-item--loading {
            cursor: wait;
            background-color: var(--backgroundHover);
            opacity: 0.7;
          }

          .SidebarItem__loading-spinner {
            width: 12px;
            height: 12px;
            border: 1.5px solid var(--textQuaternary);
            border-top-color: var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: var(--space-2);
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .SidebarItem__move-panel-empty {
            padding: var(--space-3);
            color: var(--textTertiary);
            text-align: center;
          }
        `}
      </style>
    </>
  );
};

export default SidebarMoveToPanel;
