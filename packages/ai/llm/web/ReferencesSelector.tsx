import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import { useAppSelector, useAppDispatch } from "app/hooks";
import {
  selectCurrentSpace,
  selectAllMemberSpaces,
  fetchSpace,
} from "create/space/spaceSlice";
import { SearchIcon, XIcon, ChevronDownIcon } from "@primer/octicons-react";
import { PiLightbulb, PiBrain } from "react-icons/pi";
import { Tooltip } from "render/web/ui/Tooltip";

interface ReferencesSelectorProps {
  references: [];
  onChange: (references: []) => void;
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

  const [activeSpaceId, setActiveSpaceId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllSpaces, setShowAllSpaces] = useState(false);
  const [spacesData, setSpacesData] = useState<Map<string, any[]>>(new Map());
  const [loading, setLoading] = useState(false);

  // 智能空间列表 - 显示策略
  const { displaySpaces, hiddenSpaces } = useMemo(() => {
    const maxDisplay = 4; // 最多显示4个标签
    const spaces = [];

    // 1. 当前空间优先
    if (currentSpace) {
      spaces.push({
        id: currentSpace.id,
        name: currentSpace.name,
        isCurrent: true,
      });
    }

    // 2. 其他空间按使用频率排序（这里简化为字母序）
    const others = allMemberSpaces
      .filter((s) => s.spaceId !== currentSpace?.id)
      .sort((a, b) => a.spaceName.localeCompare(b.spaceName));

    spaces.push(
      ...others.map((s) => ({
        id: s.spaceId,
        name: s.spaceName,
        isCurrent: false,
      }))
    );

    return {
      displaySpaces: spaces.slice(0, maxDisplay),
      hiddenSpaces: spaces.slice(maxDisplay),
    };
  }, [currentSpace, allMemberSpaces]);

  // 初始化
  useEffect(() => {
    if (currentSpace?.id && !activeSpaceId) {
      setActiveSpaceId(currentSpace.id);
    }
  }, [currentSpace?.id, activeSpaceId]);

  // 加载空间数据
  useEffect(() => {
    if (!activeSpaceId) return;

    // 当前空间直接使用
    if (activeSpaceId === currentSpace?.id && currentSpace?.contents) {
      const contents = Object.entries(currentSpace.contents)
        .filter(([key]) => !key.startsWith("dialog-"))
        .map(([key, value]: [string, any]) => ({
          dbKey: key,
          title: value?.title || "Untitled",
          spaceId: currentSpace.id,
          spaceName: currentSpace.name,
        }));
      setSpacesData((prev) => new Map(prev).set(activeSpaceId, contents));
      return;
    }

    // 已加载过的跳过
    if (spacesData.has(activeSpaceId)) return;

    // 加载其他空间
    const loadSpace = async () => {
      setLoading(true);
      try {
        const result = await dispatch(
          fetchSpace({ spaceId: activeSpaceId })
        ).unwrap();
        const contents = Object.entries(result.contents || {})
          .filter(([key]) => !key.startsWith("dialog-"))
          .map(([key, value]: [string, any]) => ({
            dbKey: key,
            title: value?.title || "Untitled",
            spaceId: result.id,
            spaceName: result.name,
          }));
        setSpacesData((prev) => new Map(prev).set(activeSpaceId, contents));
      } catch (error) {
        console.error(`Failed to load space ${activeSpaceId}:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadSpace();
  }, [activeSpaceId, currentSpace, dispatch, spacesData]);

  // 过滤后的内容 - 支持跨空间搜索
  const filteredContents = useMemo(() => {
    if (!searchQuery) {
      // 无搜索时只显示当前空间内容
      return spacesData.get(activeSpaceId) || [];
    }

    // 有搜索时跨空间搜索
    const query = searchQuery.toLowerCase();
    const allResults: any[] = [];

    spacesData.forEach((contents, spaceId) => {
      const matched = contents.filter((item) =>
        item.title.toLowerCase().includes(query)
      );
      allResults.push(...matched);
    });

    return allResults;
  }, [spacesData, activeSpaceId, searchQuery]);

  const handleToggleReference = (content: any) => {
    const isSelected = references.some((ref) => ref.dbKey === content.dbKey);

    if (isSelected) {
      onChange(references.filter((ref) => ref.dbKey !== content.dbKey));
    } else {
      onChange([...references, { ...content, type: "knowledge" }]);
    }
  };

  const handleToggleType = (dbKey: string) => {
    onChange(
      references.map((ref) =>
        ref.dbKey === dbKey
          ? {
              ...ref,
              type: ref.type === "instruction" ? "knowledge" : "instruction",
            }
          : ref
      )
    );
  };

  const handleSpaceSwitch = (spaceId: string) => {
    setActiveSpaceId(spaceId);
    setShowAllSpaces(false); // 选择后关闭展开
  };

  return (
    <>
      <div className="references-selector">
        {/* 搜索框 */}
        <div className="references-selector-search-box">
          <SearchIcon size={16} className="references-selector-search-icon" />
          <input
            type="text"
            placeholder={
              searchQuery ? t("searchingAllSpaces") : t("searchInCurrentSpace")
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="references-selector-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="references-selector-clear-btn"
            >
              <XIcon size={14} />
            </button>
          )}
        </div>

        {/* 搜索提示 */}
        {searchQuery && (
          <div className="references-selector-search-hint">
            🔍 在所有空间中搜索 "{searchQuery}"
          </div>
        )}

        {/* 空间切换器 */}
        {!searchQuery && (
          <div className="references-selector-space-selector">
            {/* 主要空间标签 */}
            <div className="references-selector-space-tabs">
              {displaySpaces.map((space) => (
                <button
                  key={space.id}
                  onClick={() => handleSpaceSwitch(space.id)}
                  className={`references-selector-space-tab ${
                    activeSpaceId === space.id ? "is-active" : ""
                  }`}
                >
                  <span className="references-selector-space-name">
                    {space.name}
                  </span>
                  {space.isCurrent && (
                    <span className="references-selector-current-dot" />
                  )}
                </button>
              ))}

              {/* 更多空间按钮 */}
              {hiddenSpaces.length > 0 && (
                <button
                  onClick={() => setShowAllSpaces(!showAllSpaces)}
                  className={`references-selector-more-btn ${
                    showAllSpaces ? "is-active" : ""
                  }`}
                >
                  +{hiddenSpaces.length}
                  <ChevronDownIcon
                    size={12}
                    className={`references-selector-chevron ${
                      showAllSpaces ? "is-rotated" : ""
                    }`}
                  />
                </button>
              )}
            </div>

            {/* 展开的额外空间 */}
            {showAllSpaces && hiddenSpaces.length > 0 && (
              <div className="references-selector-extended-spaces">
                {hiddenSpaces.map((space) => (
                  <button
                    key={space.id}
                    onClick={() => handleSpaceSwitch(space.id)}
                    className={`references-selector-space-option ${
                      activeSpaceId === space.id ? "is-active" : ""
                    }`}
                  >
                    {space.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 内容列表 */}
        <div className="references-selector-content-area">
          {loading ? (
            <div className="references-selector-loading">
              <div className="references-selector-spinner" />
              <span>{t("loading")}...</span>
            </div>
          ) : filteredContents.length === 0 ? (
            <div className="references-selector-empty">
              <span>
                {searchQuery ? t("noSearchResults") : t("noContentInSpace")}
              </span>
            </div>
          ) : (
            <>
              {/* 搜索状态下显示结果数量 */}
              {searchQuery && (
                <div className="references-selector-results-count">
                  找到 {filteredContents.length} 个结果
                </div>
              )}

              {filteredContents.map((item) => {
                const selectedRef = references.find(
                  (ref) => ref.dbKey === item.dbKey
                );
                const isSelected = !!selectedRef;

                return (
                  <div
                    key={item.dbKey}
                    className={`references-selector-content-item ${
                      isSelected ? "is-selected" : ""
                    }`}
                  >
                    <label className="references-selector-item-label">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleReference(item)}
                      />
                      <div className="references-selector-item-info">
                        <span className="references-selector-item-title">
                          {item.title}
                        </span>
                        {/* 搜索时显示来源空间 */}
                        {searchQuery && (
                          <span className="references-selector-item-source">
                            来自: {item.spaceName}
                          </span>
                        )}
                      </div>
                    </label>

                    {isSelected && (
                      <Tooltip
                        content={
                          selectedRef.type === "knowledge"
                            ? t("toInstruction")
                            : t("toKnowledge")
                        }
                      >
                        <button
                          className={`references-selector-type-btn references-selector-type-btn--${selectedRef.type}`}
                          onClick={() => handleToggleType(item.dbKey)}
                        >
                          {selectedRef.type === "knowledge" ? (
                            <PiBrain size={16} />
                          ) : (
                            <PiLightbulb size={16} />
                          )}
                        </button>
                      </Tooltip>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* 选中统计 */}
        {references.length > 0 && (
          <div className="references-selector-summary">
            已选择 {references.length} 个引用
            {references.length > 1 && (
              <span className="references-selector-summary-detail">
                (知识: {references.filter((r) => r.type === "knowledge").length}
                , 指令:{" "}
                {references.filter((r) => r.type === "instruction").length})
              </span>
            )}
          </div>
        )}
      </div>

      <style href="references-selector" precedence="medium">{`
        .references-selector {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[3]};
          max-height: 450px;
        }

        /* 搜索框 */
        .references-selector-search-box {
          position: relative;
          display: flex;
          align-items: center;
        }
        .references-selector-search-input {
          width: 100%;
          height: 40px;
          padding: 0 36px 0 36px;
          border: 1px solid ${theme.border};
          border-radius: ${theme.space[2]};
          background: ${theme.background};
          color: ${theme.text};
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s ease;
        }
        .references-selector-search-input:focus {
          border-color: ${theme.primary};
        }
        .references-selector-search-input::placeholder {
          color: ${theme.textTertiary};
        }
        .references-selector-search-icon {
          position: absolute;
          left: ${theme.space[3]};
          color: ${theme.textSecondary};
          pointer-events: none;
        }
        .references-selector-clear-btn {
          position: absolute;
          right: ${theme.space[2]};
          background: none;
          border: none;
          color: ${theme.textSecondary};
          cursor: pointer;
          padding: ${theme.space[1]};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .references-selector-clear-btn:hover {
          background: ${theme.backgroundHover};
        }

        /* 搜索提示 */
        .references-selector-search-hint {
          padding: ${theme.space[2]} ${theme.space[3]};
          background: ${theme.primary}08;
          border-radius: ${theme.space[1]};
          font-size: 0.8rem;
          color: ${theme.primary};
        }

        /* 空间选择器 */
        .references-selector-space-selector {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[2]};
        }
        .references-selector-space-tabs {
          display: flex;
          gap: ${theme.space[1]};
          overflow-x: auto;
          padding-bottom: 2px;
        }
        .references-selector-space-tabs::-webkit-scrollbar {
          height: 4px;
        }
        .references-selector-space-tabs::-webkit-scrollbar-thumb {
          background: ${theme.border};
          border-radius: 2px;
        }
        .references-selector-space-tab {
          display: flex;
          align-items: center;
          gap: ${theme.space[1]};
          padding: ${theme.space[2]} ${theme.space[3]};
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.border};
          border-radius: ${theme.space[2]};
          cursor: pointer;
          font-size: 0.875rem;
          color: ${theme.textSecondary};
          transition: all 0.2s ease;
          white-space: nowrap;
          position: relative;
        }
        .references-selector-space-tab:hover {
          background: ${theme.backgroundHover};
          color: ${theme.text};
        }
        .references-selector-space-tab.is-active {
          background: ${theme.primary};
          color: white;
          border-color: ${theme.primary};
        }
        .references-selector-space-name {
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .references-selector-current-dot {
          width: 6px;
          height: 6px;
          background: currentColor;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .references-selector-more-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: ${theme.space[2]} ${theme.space[2]};
          background: ${theme.backgroundTertiary};
          border: 1px solid ${theme.border};
          border-radius: ${theme.space[2]};
          cursor: pointer;
          font-size: 0.8rem;
          color: ${theme.textSecondary};
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .references-selector-more-btn:hover {
          background: ${theme.backgroundHover};
          color: ${theme.text};
        }
        .references-selector-more-btn.is-active {
          background: ${theme.backgroundSelected || theme.backgroundHover};
          color: ${theme.primary};
        }
        .references-selector-chevron {
          transition: transform 0.2s ease;
        }
        .references-selector-chevron.is-rotated {
          transform: rotate(180deg);
        }

        /* 展开空间 */
        .references-selector-extended-spaces {
          display: flex;
          flex-wrap: wrap;
          gap: ${theme.space[1]};
          padding: ${theme.space[2]};
          background: ${theme.backgroundSecondary};
          border-radius: ${theme.space[2]};
          border: 1px solid ${theme.borderLight};
        }
        .references-selector-space-option {
          padding: ${theme.space[1]} ${theme.space[2]};
          background: ${theme.background};
          border: 1px solid ${theme.border};
          border-radius: ${theme.space[1]};
          cursor: pointer;
          font-size: 0.8rem;
          color: ${theme.textSecondary};
          transition: all 0.2s ease;
        }
        .references-selector-space-option:hover {
          background: ${theme.backgroundHover};
          color: ${theme.text};
        }
        .references-selector-space-option.is-active {
          background: ${theme.primary};
          color: white;
          border-color: ${theme.primary};
        }

        /* 内容区域 */
        .references-selector-content-area {
          flex: 1;
          overflow-y: auto;
          border: 1px solid ${theme.border};
          border-radius: ${theme.space[2]};
          background: ${theme.backgroundSecondary};
        }
        .references-selector-results-count {
          padding: ${theme.space[2]} ${theme.space[3]};
          font-size: 0.8rem;
          color: ${theme.textSecondary};
          border-bottom: 1px solid ${theme.borderLight};
          background: ${theme.backgroundTertiary};
        }

        /* 状态组件 */
        .references-selector-loading, .references-selector-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: ${theme.space[2]};
          padding: ${theme.space[6]};
          color: ${theme.textTertiary};
          font-size: 0.875rem;
        }
        .references-selector-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid ${theme.borderLight};
          border-top: 2px solid ${theme.primary};
          border-radius: 50%;
          animation: references-selector-spin 1s linear infinite;
        }
        @keyframes references-selector-spin {
          to { transform: rotate(360deg); }
        }

        /* 内容项 */
        .references-selector-content-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: ${theme.space[2]} ${theme.space[3]};
          border-bottom: 1px solid ${theme.borderLight};
          transition: background 0.2s ease;
        }
        .references-selector-content-item:hover {
          background: ${theme.backgroundHover};
        }
        .references-selector-content-item.is-selected {
          background: ${theme.primary}08;
        }
        .references-selector-item-label {
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
          cursor: pointer;
          flex: 1;
          min-width: 0;
        }
        .references-selector-item-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .references-selector-item-title {
          font-size: 0.875rem;
          color: ${theme.text};
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .references-selector-item-source {
          font-size: 0.75rem;
          color: ${theme.textTertiary};
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .references-selector-type-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .references-selector-type-btn--knowledge {
          background: ${theme.backgroundTertiary};
          color: ${theme.textSecondary};
        }
        .references-selector-type-btn--instruction {
          background: ${theme.primary}15;
          color: ${theme.primary};
        }
        .references-selector-type-btn:hover {
          transform: scale(1.1);
        }

        /* 统计 */
        .references-selector-summary {
          padding: ${theme.space[2]} ${theme.space[3]};
          background: ${theme.primary}08;
          border-radius: ${theme.space[2]};
          font-size: 0.875rem;
          color: ${theme.text};
          text-align: center;
        }
        .references-selector-summary-detail {
          color: ${theme.textSecondary};
          font-size: 0.8rem;
          margin-left: ${theme.space[1]};
        }

        /* 响应式 */
        @media (max-width: 768px) {
          .references-selector {
            max-height: 400px;
          }
          .references-selector-space-tabs {
            gap: 4px;
          }
          .references-selector-space-tab {
            padding: ${theme.space[2]} ${theme.space[2]};
            font-size: 0.8rem;
          }
          .references-selector-space-name {
            max-width: 80px;
          }
          .references-selector-current-dot {
            display: none;
          }
          .references-selector-extended-spaces {
            padding: ${theme.space[1]};
          }
        }
      `}</style>
    </>
  );
};

export default ReferencesSelector;
