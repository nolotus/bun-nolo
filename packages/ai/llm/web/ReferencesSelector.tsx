import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import { ReferenceItemType } from "ai/cybot/types";
// 确保您已经安装了 react-icons: npm install react-icons
import { PiLightbulb, PiBrain } from "react-icons/pi";
import { Tooltip } from "render/web/ui/Tooltip"; // 确保您项目中存在 Tooltip 组件

interface ReferencesSelectorProps {
  space: {
    contents?: {
      [key: string]: {
        title?: string;
      };
    };
  } | null;
  references: ReferenceItemType[];
  onChange: (references: ReferenceItemType[]) => void;
}

const ReferencesSelector: React.FC<ReferencesSelectorProps> = ({
  space,
  references,
  onChange,
}) => {
  const { t } = useTranslation("ai"); // 直接在此处使用 hook
  const theme = useTheme();
  const [availableContents, setAvailableContents] = useState<
    { dbKey: string; title?: string }[]
  >([]);

  // 从 space 加载可用的内容
  useEffect(() => {
    if (space?.contents) {
      const contents = Object.entries(space.contents)
        .filter(([key]) => !key.startsWith("dialog-"))
        .map(([key, value]) => ({
          dbKey: key,
          title: value?.title,
        }));
      setAvailableContents(contents);
    }
  }, [space?.contents]);

  // 更新勾选逻辑
  const handleToggleReference = (content: {
    dbKey: string;
    title?: string;
  }) => {
    const exists = references.some((ref) => ref.dbKey === content.dbKey);
    let newReferences;

    if (exists) {
      newReferences = references.filter((ref) => ref.dbKey !== content.dbKey);
    } else {
      // 新增引用时，默认为 'knowledge' 类型
      newReferences = [
        ...references,
        {
          dbKey: content.dbKey,
          title: content.title || "Untitled",
          type: "knowledge", // 默认类型为知识
        },
      ];
    }
    onChange(newReferences);
  };

  // 新增类型切换逻辑
  const handleToggleType = (dbKey: string) => {
    const newReferences = references.map((ref) => {
      if (ref.dbKey === dbKey) {
        return {
          ...ref,
          type: ref.type === "instruction" ? "knowledge" : "instruction",
        };
      }
      return ref;
    });
    onChange(newReferences);
  };

  return (
    <div className="references-list">
      {availableContents.length === 0 ? (
        <p className="empty-message">{t("noPagesAvailable")}</p>
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
                <span className="reference-title">{content.title}</span>
              </label>

              {/* 只有当被选中时，才显示类型切换按钮 */}
              {isSelected && selectedRef && (
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
                      aria-label={
                        selectedRef.type === "knowledge"
                          ? "Switch to instruction"
                          : "Switch to knowledge"
                      }
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

      <style>{`
        .references-list {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid ${theme.border};
          border-radius: 6px;
          padding: 8px;
          background: ${theme.backgroundSecondary || theme.background};
        }
        .reference-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
          min-height: 44px; /* 保证一致的高度 */
        }
        .reference-item:hover {
           background-color: ${theme.backgroundTertiary || "rgba(0,0,0,0.05)"};
        }
        .reference-item.selected {
          background-color: ${theme.primaryMuted};
        }
        .reference-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          flex-grow: 1; /* 让label占据更多空间 */
          overflow: hidden; /* 防止内容溢出 */
        }
        .reference-title {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: ${theme.text};
        }
        .type-toggle-wrapper {
          flex-shrink: 0; /* 防止按钮被压缩 */
          margin-left: 12px;
        }
        .type-toggle-btn {
          background: none;
          border: 1px solid transparent;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: ${theme.textTertiary};
        }
        .type-toggle-btn:hover {
          background-color: ${theme.border};
          color: ${theme.text};
        }
        .type-toggle-btn.instruction {
          color: ${theme.primary};
          background-color: ${theme.primaryMutedHover};
        }
        .type-toggle-btn.instruction:hover {
          opacity: 0.8;
        }
        .type-toggle-btn.knowledge {
           color: ${theme.textSecondary};
        }
        .empty-message {
          color: ${theme.textTertiary || theme.textSecondary};
          font-style: italic;
          padding: 16px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default ReferencesSelector;
