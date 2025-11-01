// create/space/components/SpaceItem.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { LuCheck, LuSettings } from "react-icons/lu";

interface SpaceItemProps {
  spaceItem: {
    spaceId: string;
    spaceName?: string;
    dbKey?: string;
  };
  isCurrentSpace: boolean;
  onSelect: (spaceId: string) => void;
  onSettingsClick: (e: React.MouseEvent, spaceMemberpath: string) => void;
}

export const SpaceItem: React.FC<SpaceItemProps> = ({
  spaceItem,
  isCurrentSpace,
  onSelect,
  onSettingsClick,
}) => {
  const { t } = useTranslation();

  const handleLinkClick = (e: React.MouseEvent) => {
    // 中键/⌘/Ctrl 点击走浏览器默认新开行为
    if (
      (e as React.MouseEvent<HTMLAnchorElement>).button === 1 ||
      e.ctrlKey ||
      e.metaKey
    )
      return;
    e.preventDefault();
    onSelect(spaceItem.spaceId);
  };

  return (
    <div className="space-list-item">
      <NavLink
        to={`/space/${spaceItem.spaceId}`}
        className={({ isActive }) =>
          `space-list-item__link ${isActive ? "space-list-item__link--active" : ""} ${
            isCurrentSpace ? "space-list-item__link--current" : ""
          }`
        }
        onClick={handleLinkClick}
        onAuxClick={handleLinkClick}
      >
        <div className="space-list-item__content">
          {isCurrentSpace && (
            <LuCheck size={14} className="space-list-item__check" />
          )}
          <span className="space-list-item__title" title={spaceItem.spaceName}>
            {spaceItem.spaceName || spaceItem.spaceId}
          </span>
        </div>
      </NavLink>

      <button
        className="space-list-item__settings"
        onClick={(e) => onSettingsClick(e, spaceItem.dbKey || "")}
        aria-label={t("space_settings")}
        type="button"
      >
        <LuSettings size={14} />
      </button>

      <style>{`
        .space-list-item {
          display: flex;
          align-items: center;
          margin: 1px 0;
          border-radius: 6px;
          overflow: hidden;
        }

        .space-list-item__link {
          display: flex;
          align-items: center;
          padding: 6px 8px;
          border-radius: 6px;
          transition: background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
          color: var(--text);
          font-size: 13px;
          font-weight: 400;
          text-decoration: none;
          flex: 1;
          min-height: 28px;
          outline: none;
        }

        .space-list-item__link:hover {
          background: var(--backgroundHover);
        }

        .space-list-item__link:focus-visible {
          background: var(--backgroundHover);
          box-shadow: 0 0 0 1px var(--primary);
        }

        .space-list-item__link--current,
        .space-list-item__link--active {
          background: var(--backgroundSecondary);
          color: var(--primary);
          font-weight: 500;
        }

        .space-list-item__content {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          min-width: 0;
        }

        .space-list-item__check {
          color: var(--primary);
          flex-shrink: 0;
        }

        .space-list-item__title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          min-width: 0;
          line-height: 1.4;
        }

        .space-list-item__settings {
          opacity: 0;
          padding: 4px;
          margin-left: 4px;
          border-radius: 4px;
          color: var(--textSecondary);
          transition: background-color 0.15s ease, color 0.15s ease, opacity 0.15s ease;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 24px;
          height: 24px;
        }

        .space-list-item:hover .space-list-item__settings {
          opacity: 1;
        }

        .space-list-item__link--current + .space-list-item__settings,
        .space-list-item__link--active + .space-list-item__settings {
          opacity: 0.6;
        }

        .space-list-item__settings:hover {
          background: var(--backgroundSecondary);
          color: var(--text);
          opacity: 1;
        }

        .space-list-item__settings:focus-visible {
          opacity: 1;
          outline: 1px solid var(--primary);
          outline-offset: 1px;
        }
      `}</style>
    </div>
  );
};
