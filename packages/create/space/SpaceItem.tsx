import { useTheme } from "app/theme";
import { useTranslation } from "react-i18next";
import { CheckIcon, GearIcon } from "@primer/octicons-react";

interface SpaceItemProps {
  spaceItem: any;
  isCurrentSpace: boolean;
  index: number;
  listRef: (node: HTMLElement | null) => void;
  getItemProps: any;
  onSelect: (spaceId: string) => void;
  onSettingsClick: (e: React.MouseEvent, spaceMemberpath: string) => void;
}
export const SpaceItem = ({
  spaceItem,
  isCurrentSpace,
  index,
  listRef,
  getItemProps,
  onSelect,
  onSettingsClick,
}: SpaceItemProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <div
      ref={(node) => listRef(node)}
      {...getItemProps({
        onClick: () => onSelect(spaceItem.spaceId),
      })}
      className="space-list-item"
      role="option"
      aria-selected={isCurrentSpace}
    >
      <div
        className={`space-list-item__inner ${isCurrentSpace ? "space-list-item__inner--current" : ""}`}
      >
        <div className="space-list-item__content">
          {isCurrentSpace && (
            <CheckIcon size={12} className="space-list-item__check" />
          )}
          <span className="space-list-item__title" title={spaceItem.spaceName}>
            {spaceItem.spaceName || spaceItem.spaceId}
          </span>
        </div>
        <button
          className="space-list-item__settings"
          onClick={(e) => onSettingsClick(e, spaceItem.spaceId)}
          aria-label={t("空间设置")}
        >
          <GearIcon size={12} />
        </button>
      </div>

      <style jsx>{`
        .space-list-item {
          position: relative;
          padding: 1px 4px;
        }

        .space-list-item:active .space-list-item__inner {
          transform: scale(0.98);
        }

        .space-list-item__inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 8px;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s ease;
          color: ${theme.text};
          font-size: 13px;
          user-select: none;
          min-height: 28px;
        }

        .space-list-item__content {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          min-width: 0;
        }

        .space-list-item__inner:hover {
          background: ${theme.backgroundSecondary};
        }

        .space-list-item__inner--current {
          background: ${theme.backgroundTertiary};
          font-weight: 500;
        }

        .space-list-item__check {
          color: ${theme.primary};
          flex-shrink: 0;
        }

        .space-list-item__title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          min-width: 0;
        }

        .space-list-item__settings {
          opacity: 0;
          padding: 4px;
          margin-left: 4px;
          border-radius: 3px;
          color: ${theme.textSecondary};
          transition: all 0.15s ease;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .space-list-item:hover .space-list-item__settings,
        .space-list-item__inner--current .space-list-item__settings {
          opacity: 1;
        }

        .space-list-item__settings:hover {
          background: ${theme.backgroundTertiary};
          color: ${theme.text};
        }

        .space-list-item__settings:focus-visible {
          opacity: 1;
          outline: 2px solid ${theme.primary};
          outline-offset: -1px;
        }
      `}</style>
    </div>
  );
};
