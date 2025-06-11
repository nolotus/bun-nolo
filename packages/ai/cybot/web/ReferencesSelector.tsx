import { useState, useEffect } from "react";
import { useTheme } from "app/theme";
import { ReferenceItemType } from "ai/cybot/types";
// 👇 假设你的图标库是 react-icons，如果没有，可以用SVG或文字代替
import { PiLightbulb, PiBrain } from "react-icons/pi";
import { Tooltip } from "render/web/ui/Tooltip"; // 假设你有一个Tooltip组件来提升用户体验

const ReferencesSelector = ({ space, references, onChange, t }) => {
  const theme = useTheme();
  const [availableContents, setAvailableContents] = useState([]);

  // Load available content from space (修正依赖项)
  useEffect(() => {
    if (space?.contents) {
      const contents = Object.entries(space.contents)
        .filter(([key]) => !key.startsWith("dialog-"))
        .map(([key, value]) => ({
          dbKey: key,
          title: value?.title,
          // 注意：这里不再设置 type，因为 type 是在用户选择后才决定的
        }));
      setAvailableContents(contents);
    }
  }, [space?.contents]); // 修正：使用 space?.contents 而不是 space

  // 👇 --- 核心改动 1: 更新勾选逻辑 ---
  const handleToggleReference = (content) => {
    const exists = references.some((ref) => ref.dbKey === content.dbKey);
    let newReferences;

    if (exists) {
      newReferences = references.filter((ref) => ref.dbKey !== content.dbKey);
    } else {
      // 当新增一个引用时，默认为 'knowledge' 类型
      newReferences = [
        ...references,
        {
          dbKey: content.dbKey,
          title: content.title, // 最好把title也存进去，方便其他地方显示
          type: "knowledge", // 默认类型
        },
      ];
    }
    onChange(newReferences);
  };

  // 👇 --- 核心改动 2: 新增类型切换逻辑 ---
  const handleToggleType = (dbKey) => {
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
            // 👇 --- 核心改动 3: 更新 JSX 结构 ---
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
                        <PiBrain size={16} /> // 大脑图标代表"知识"
                      ) : (
                        <PiLightbulb size={16} /> // 灯泡图标代表"指令"
                      )}
                    </button>
                  </Tooltip>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* 👇 --- 核心改动 4: 增加新的样式 --- */}
      <style>{`
        .references-list {
          max-height: 300px; /* 增加一点高度 */
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
        }
        .reference-item.selected {
          background-color: ${theme.backgroundTertiary || theme.backgroundSecondary};
        }
        .reference-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          flex-grow: 1; /* 让label占据更多空间 */
        }
        .reference-title {
          /* 优化文本显示 */
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
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
        /* 指令状态下的特殊样式 */
        .type-toggle-btn.instruction {
          color: ${theme.primary};
          background-color: ${theme.primaryMuted};
        }
        .type-toggle-btn.instruction:hover {
          background-color: ${theme.primaryMutedHover};
        }
        .empty-message {
          color: ${theme.textTertiary || theme.textSecondary};
          font-style: italic;
          padding: 12px;
        }
      `}</style>
    </div>
  );
};

export default ReferencesSelector;
