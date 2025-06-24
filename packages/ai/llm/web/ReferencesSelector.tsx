import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import { useAppSelector, useAppDispatch } from "app/hooks";
import {
  selectCurrentSpace,
  selectAllMemberSpaces,
  fetchSpace,
} from "create/space/spaceSlice";
import { ReferenceItemType } from "ai/cybot/types";
import { PiLightbulb, PiBrain } from "react-icons/pi";
import { ChevronDownIcon } from "@primer/octicons-react";
import { Tooltip } from "render/web/ui/Tooltip";

interface ReferencesSelectorProps {
  references: ReferenceItemType[];
  onChange: (references: ReferenceItemType[]) => void;
}

const ReferencesSelector: React.FC<ReferencesSelectorProps> = ({
  references,
  onChange,
}) => {
  const { t } = useTranslation("ai");
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const currentSpace = useAppSelector(selectCurrentSpace);
  const allMemberSpaces = useAppSelector(selectAllMemberSpaces);

  const [selectedSpaceId, setSelectedSpaceId] = useState<string>("");
  const [isSpaceDropdownOpen, setIsSpaceDropdownOpen] = useState(false);
  const [availableContents, setAvailableContents] = useState<
    { dbKey: string; title?: string; spaceId?: string; spaceName?: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // 优化 1: 使用 useMemo 创建一个统一、有序的空间列表，简化渲染和查找
  const selectableSpaces = useMemo(() => {
    if (!currentSpace) return allMemberSpaces;

    const otherSpaces = allMemberSpaces.filter(
      (s) => s.spaceId !== currentSpace.id
    );
    // 将当前空间置顶
    return [
      {
        spaceId: currentSpace.id,
        spaceName: currentSpace.name,
        isCurrent: true,
      },
      ...otherSpaces,
    ];
  }, [currentSpace, allMemberSpaces]);

  // 初始化：默认选择当前空间
  useEffect(() => {
    if (currentSpace?.id && !selectedSpaceId) {
      setSelectedSpaceId(currentSpace.id);
    }
  }, [currentSpace?.id, selectedSpaceId]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSpaceDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 核心数据获取逻辑 (无缓存)
  useEffect(() => {
    if (!selectedSpaceId) {
      setAvailableContents([]);
      return;
    }

    let isMounted = true;

    const processAndSetContents = (
      contents: Record<string, any>,
      spaceId: string,
      spaceName?: string
    ) => {
      const processed = Object.entries(contents)
        .filter(([key]) => !key.startsWith("dialog-"))
        .map(([key, value]) => ({
          dbKey: key,
          title: value?.title,
          spaceId,
          spaceName: spaceName || "Unknown Space",
        }));
      if (isMounted) {
        setAvailableContents(processed);
      }
    };

    // Case 1: 选中的是当前空间
    if (selectedSpaceId === currentSpace?.id) {
      processAndSetContents(
        currentSpace.contents || {},
        currentSpace.id,
        currentSpace.name
      );
      return;
    }

    // Case 2: 选中的是其他空间，发起请求
    const fetchOtherSpace = async () => {
      setIsLoading(true);
      setAvailableContents([]); // 立即清空旧列表
      try {
        // 根据您提供的数据结构，unwrap() 的结果是 { spaceData: { ... } }
        console.log(`Fetching space data for ID: ${selectedSpaceId}`);
        const result = await dispatch(
          fetchSpace({ spaceId: selectedSpaceId })
        ).unwrap();
        const fetchedSpace = result;
        console.log(`Fetched space data:`, fetchedSpace);
        if (isMounted && fetchedSpace?.contents) {
          processAndSetContents(
            fetchedSpace.contents,
            fetchedSpace.id,
            fetchedSpace.name
          );
        }
      } catch (error) {
        console.error(`Failed to load space ${selectedSpaceId}:`, error);
        if (isMounted) setAvailableContents([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchOtherSpace();

    return () => {
      isMounted = false;
    };
  }, [selectedSpaceId, currentSpace, dispatch]);

  const handleSpaceSelect = (spaceId: string) => {
    setSelectedSpaceId(spaceId);
    setIsSpaceDropdownOpen(false);
  };

  const handleToggleReference = (content: {
    dbKey: string;
    title?: string;
    spaceId?: string;
    spaceName?: string;
  }) => {
    const isSelected = references.some((ref) => ref.dbKey === content.dbKey);
    const newReferences = isSelected
      ? references.filter((ref) => ref.dbKey !== content.dbKey)
      : [
          ...references,
          { ...content, title: content.title || "Untitled", type: "knowledge" },
        ];
    onChange(newReferences);
  };

  const handleToggleType = (dbKey: string) => {
    const newReferences = references.map((ref) =>
      ref.dbKey === dbKey
        ? {
            ...ref,
            type: ref.type === "instruction" ? "knowledge" : "instruction",
          }
        : ref
    );
    onChange(newReferences);
  };

  // 优化 2: 直接从派生出的 selectableSpaces 列表中查找，逻辑更单一
  const selectedSpaceName =
    selectableSpaces.find((s) => s.spaceId === selectedSpaceId)?.spaceName ||
    t("selectSpace");

  return (
    <div className="references-selector">
      <div className="space-selector" ref={dropdownRef}>
        <div
          className={`space-selector__trigger ${isSpaceDropdownOpen ? "open" : ""}`}
          onClick={() => setIsSpaceDropdownOpen(!isSpaceDropdownOpen)}
        >
          <span className="space-selector__name">{selectedSpaceName}</span>
          <ChevronDownIcon
            size={16}
            className={`space-selector__icon ${isSpaceDropdownOpen ? "rotated" : ""}`}
          />
        </div>

        {isSpaceDropdownOpen && (
          <div className="space-selector__dropdown">
            {/* 优化 3: 使用统一列表进行渲染，代码更简洁 */}
            {selectableSpaces.map((space) => (
              <div
                key={space.spaceId}
                className={`space-option ${selectedSpaceId === space.spaceId ? "selected" : ""}`}
                onClick={() => handleSpaceSelect(space.spaceId)}
              >
                <span className="space-option__name">{space.spaceName}</span>
                {space.isCurrent && (
                  <span className="space-option__badge">{t("current")}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="references-list">
        {isLoading ? (
          <div className="empty-state">
            <p className="loading-message">{t("loadingSpaceContent")}</p>
          </div>
        ) : availableContents.length === 0 ? (
          <div className="empty-state">
            <p className="empty-message">{t("noPagesAvailable")}</p>
          </div>
        ) : (
          availableContents.map((content) => {
            const selectedRef = references.find(
              (ref) => ref.dbKey === content.dbKey
            );
            const isSelected = !!selectedRef;

            return (
              <div
                key={content.dbKey}
                className={`reference-item ${isSelected ? "selected" : ""}`}
              >
                <label className="reference-label">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleReference(content)}
                  />
                  <span className="reference-title">
                    {content.title || "Untitled"}
                  </span>
                </label>

                {isSelected && (
                  <div className="type-toggle-wrapper">
                    <Tooltip
                      content={
                        selectedRef.type === "knowledge"
                          ? t("markAsInstruction")
                          : t("markAsKnowledge")
                      }
                    >
                      <button
                        type="button"
                        className={`type-toggle-btn ${selectedRef.type}`}
                        onClick={() => handleToggleType(content.dbKey)}
                      >
                        {selectedRef.type === "knowledge" ? (
                          <PiBrain size={16} />
                        ) : (
                          <PiLightbulb size={16} />
                        )}
                      </button>
                    </Tooltip>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .references-selector {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[3]};
        }
        .space-selector {
          position: relative;
        }
        .space-selector__trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: ${theme.space[2]} ${theme.space[3]};
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.border};
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.12s;
        }
        .space-selector__trigger:hover {
          border-color: ${theme.primary};
          background: ${theme.backgroundHover};
        }
        .space-selector__trigger.open {
          border-color: ${theme.primary};
          box-shadow: 0 0 0 2px ${theme.primaryAlpha}15;
        }
        .space-selector__name {
          font-size: 13px;
          font-weight: 500;
          color: ${theme.text};
        }
        .space-selector__icon {
          color: ${theme.textSecondary};
          transition: transform 0.12s;
        }
        .space-selector__icon.rotated {
          transform: rotate(180deg);
        }
        .space-selector__dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: ${theme.background};
          border: 1px solid ${theme.border};
          border-radius: 6px;
          box-shadow: ${theme.shadow2} 0 8px 24px;
          z-index: 1000;
          max-height: 200px;
          overflow-y: auto;
        }
        .space-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: ${theme.space[2]} ${theme.space[3]};
          cursor: pointer;
          transition: background 0.12s;
        }
        .space-option:hover {
          background: ${theme.backgroundHover};
        }
        .space-option.selected {
          background: ${theme.primaryAlpha}15;
        }
        .space-option__name {
          font-size: 13px;
          color: ${theme.text};
          font-weight: 500;
          flex: 1;
        }
        .space-option__badge {
          font-size: 11px;
          color: ${theme.primary};
          font-weight: 600;
          background: ${theme.primaryAlpha}20;
          padding: 2px 6px;
          border-radius: 10px;
        }
        .references-list {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid ${theme.border};
          border-radius: 6px;
          padding: ${theme.space[2]};
          background: ${theme.backgroundSecondary};
        }
        .empty-state {
          padding: ${theme.space[4]};
          text-align: center;
          min-height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .loading-message {
          color: ${theme.textSecondary};
          font-size: 13px;
          font-style: italic;
        }
        .empty-message {
          color: ${theme.textTertiary};
          font-style: italic;
          font-size: 13px;
        }
        .reference-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: ${theme.space[2]} ${theme.space[3]};
          border-radius: 4px;
          transition: background 0.12s;
          min-height: 38px;
        }
        .reference-item:hover {
          background: ${theme.backgroundTertiary};
        }
        .reference-item.selected {
          background: ${theme.primaryAlpha}10;
        }
        .reference-label {
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
          cursor: pointer;
          flex-grow: 1;
          overflow: hidden;
        }
        .reference-title {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: ${theme.text};
          font-size: 13px;
        }
        .type-toggle-wrapper {
          flex-shrink: 0;
          margin-left: ${theme.space[3]};
        }
        .type-toggle-btn {
          background: transparent;
          border: 1px solid transparent;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s;
          color: ${theme.textTertiary};
        }
        .type-toggle-btn:hover {
          background: ${theme.border};
          color: ${theme.text};
        }
        .type-toggle-btn.instruction {
          color: ${theme.primary};
          background: ${theme.primaryAlpha}15;
        }
        .type-toggle-btn.knowledge {
          color: ${theme.textSecondary};
        }
      `}</style>
    </div>
  );
};

export default ReferencesSelector;
