import React, { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "app/store";
import {
  selectCurrentSpace,
  selectAllMemberSpaces,
  fetchSpace,
} from "create/space/spaceSlice";
import { SearchIcon, XIcon, ChevronDownIcon } from "@primer/octicons-react";
import { PiLightbulb, PiBrain } from "react-icons/pi";
import { Tooltip } from "render/web/ui/Tooltip";

interface Reference {
  dbKey: string;
  type: "knowledge" | "instruction";
  [key: string]: any;
}

interface ReferencesSelectorProps {
  value?: Reference[];
  onChange: (value: Reference[]) => void;
}

const ReferencesSelector: React.FC<ReferencesSelectorProps> = ({
  value = [],
  onChange,
}) => {
  const { t } = useTranslation("ai");
  const dispatch = useAppDispatch();
  const currentSpace = useAppSelector(selectCurrentSpace);
  const allMemberSpaces = useAppSelector(selectAllMemberSpaces);

  const fetchedSpacesRef = useRef(new Set<string>());
  const [activeSpaceId, setActiveSpaceId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllSpaces, setShowAllSpaces] = useState(false);
  const [spacesData, setSpacesData] = useState<Map<string, any[]>>(new Map());
  const [loading, setLoading] = useState(false);

  // 初始化空间列表
  const { displaySpaces, hiddenSpaces } = useMemo(() => {
    const spaces = [];
    if (currentSpace)
      spaces.push({
        id: currentSpace.id,
        name: currentSpace.name,
        isCurrent: true,
      });

    const others = allMemberSpaces
      .filter((s) => s.spaceId !== currentSpace?.id)
      .sort((a, b) => a.spaceName.localeCompare(b.spaceName))
      .map((s) => ({ id: s.spaceId, name: s.spaceName, isCurrent: false }));

    spaces.push(...others);
    return { displaySpaces: spaces.slice(0, 4), hiddenSpaces: spaces.slice(4) };
  }, [currentSpace, allMemberSpaces]);

  // 设置默认空间
  useEffect(() => {
    if (currentSpace?.id && !activeSpaceId) setActiveSpaceId(currentSpace.id);
  }, [currentSpace?.id, activeSpaceId]);

  // 数据获取逻辑
  useEffect(() => {
    if (!activeSpaceId || fetchedSpacesRef.current.has(activeSpaceId)) return;

    const cacheAndSet = (id: string, contentsObj: any) => {
      const list = Object.entries(contentsObj)
        .filter(([key]) => !key.startsWith("dialog-"))
        .map(([key, v]: any) => ({
          dbKey: key,
          title: v?.title || t("unnamed"),
          spaceId: id,
        }));
      setSpacesData((prev) => new Map(prev).set(id, list));
      fetchedSpacesRef.current.add(id);
    };

    if (activeSpaceId === currentSpace?.id && currentSpace?.contents) {
      cacheAndSet(activeSpaceId, currentSpace.contents);
    } else {
      setLoading(true);
      fetchSpacesData(activeSpaceId, cacheAndSet);
    }
  }, [activeSpaceId, currentSpace]);

  const fetchSpacesData = async (id: string, callback: Function) => {
    fetchedSpacesRef.current.add(id);
    try {
      const res = await dispatch(fetchSpace({ spaceId: id })).unwrap();
      callback(id, res.contents || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredContents = useMemo(() => {
    let raw = spacesData.get(activeSpaceId) || [];
    if (searchQuery) {
      raw = [];
      spacesData.forEach((list) =>
        raw.push(
          ...list.filter((i) =>
            i.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
      );
    }
    return raw;
  }, [spacesData, activeSpaceId, searchQuery]);

  const toggleRef = (item: any) => {
    const exists = value.some((r) => r.dbKey === item.dbKey);
    onChange(
      exists
        ? value.filter((r) => r.dbKey !== item.dbKey)
        : [...value, { ...item, type: "knowledge" }]
    );
  };

  const toggleType = (e: React.MouseEvent, dbKey: string) => {
    e.preventDefault(); // 阻止冒泡触发选中
    onChange(
      value.map((r) =>
        r.dbKey === dbKey
          ? {
              ...r,
              type: r.type === "instruction" ? "knowledge" : "instruction",
            }
          : r
      )
    );
  };

  return (
    <div className="rs-container">
      {/* 搜索栏 */}
      <div className="rs-search">
        <SearchIcon size={16} className="rs-search__icon" />
        <input
          className="rs-search__input"
          placeholder={
            searchQuery
              ? t("references.searchAllSpaces")
              : t("references.searchCurrentSpace")
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="rs-search__clear"
            onClick={() => setSearchQuery("")}
          >
            <XIcon size={14} />
          </button>
        )}
      </div>

      {/* 空间 Tabs (搜索时隐藏) */}
      {!searchQuery && (
        <div className="rs-tabs">
          {displaySpaces.map((s) => (
            <button
              key={s.id}
              className="rs-tab"
              data-active={activeSpaceId === s.id}
              onClick={() => setActiveSpaceId(s.id)}
            >
              {s.name}
              {s.isCurrent && <span className="rs-tab__dot" />}
            </button>
          ))}

          {hiddenSpaces.length > 0 && (
            <div className="rs-dropdown-wrapper">
              <button
                className="rs-tab rs-tab--more"
                data-active={showAllSpaces}
                onClick={() => setShowAllSpaces(!showAllSpaces)}
              >
                +{hiddenSpaces.length} <ChevronDownIcon size={12} />
              </button>
              {showAllSpaces && (
                <div className="rs-dropdown">
                  {hiddenSpaces.map((s) => (
                    <button
                      key={s.id}
                      className="rs-dropdown__item"
                      data-active={activeSpaceId === s.id}
                      onClick={() => {
                        setActiveSpaceId(s.id);
                        setShowAllSpaces(false);
                      }}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 内容列表区 */}
      <div className="rs-list">
        {loading ? (
          <div className="rs-status">
            <div className="rs-spinner" />
            {t("loading")}
          </div>
        ) : filteredContents.length === 0 ? (
          <div className="rs-status">
            {t(searchQuery ? "references.noResults" : "references.noContent")}
          </div>
        ) : (
          filteredContents.map((item) => {
            const selected = value.find((r) => r.dbKey === item.dbKey);
            return (
              <label
                key={item.dbKey}
                className="rs-item"
                data-selected={!!selected}
              >
                <div className="rs-item__check">
                  <input
                    type="checkbox"
                    checked={!!selected}
                    onChange={() => toggleRef(item)}
                  />
                  <div className="rs-checkbox-ui" />
                </div>

                <div className="rs-item__body">
                  <div className="rs-item__title">{item.title}</div>
                  {searchQuery && (
                    <div className="rs-item__meta">
                      {t("references.fromSpace", { spaceName: item.spaceName })}
                    </div>
                  )}
                </div>

                {selected && (
                  <Tooltip
                    content={
                      selected.type === "knowledge"
                        ? t("references.toInstruction")
                        : t("references.toKnowledge")
                    }
                  >
                    <button
                      className="rs-type-btn"
                      data-type={selected.type}
                      onClick={(e) => toggleType(e, item.dbKey)}
                    >
                      {selected.type === "knowledge" ? (
                        <PiBrain size={16} />
                      ) : (
                        <PiLightbulb size={16} />
                      )}
                    </button>
                  </Tooltip>
                )}
              </label>
            );
          })
        )}
      </div>

      {/* 底部统计 */}
      {value.length > 0 && (
        <div className="rs-summary">
          {t("references.selected", { count: value.length })}
          <span className="rs-summary__detail">
            (K: {value.filter((r) => r.type === "knowledge").length}, I:{" "}
            {value.filter((r) => r.type === "instruction").length})
          </span>
        </div>
      )}

      <style href="references-selector" precedence="medium">{`
        .rs-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          height: 100%;
          max-height: 480px;
          min-height: 300px;
        }

        /* 搜索框 */
        .rs-search {
          position: relative;
          flex-shrink: 0;
        }
        .rs-search__input {
          width: 100%;
          height: 40px;
          padding: 0 34px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--background);
          color: var(--text);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .rs-search__input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px var(--focus);
        }
        .rs-search__icon {
          position: absolute;
          left: 10px;
          top: 12px;
          color: var(--textTertiary);
          pointer-events: none;
        }
        .rs-search__clear {
          position: absolute;
          right: 8px;
          top: 8px;
          padding: 4px;
          border: none;
          background: transparent;
          color: var(--textQuaternary);
          cursor: pointer;
          border-radius: 50%;
        }
        .rs-search__clear:hover { background: var(--backgroundHover); color: var(--text); }

        /* 空间 Tabs - 胶囊风格 */
        .rs-tabs {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 2px;
          flex-shrink: 0;
          scrollbar-width: none;
        }
        .rs-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border: 1px solid transparent;
          border-radius: 20px;
          background: var(--backgroundSecondary);
          color: var(--textSecondary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .rs-tab:hover { background: var(--backgroundHover); color: var(--text); }
        .rs-tab[data-active="true"] {
          background: var(--background);
          color: var(--primary);
          border-color: var(--primary);
          box-shadow: 0 2px 5px var(--shadowLight);
        }
        .rs-tab__dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: 0.8; }
        
        /* 下拉菜单 */
        .rs-dropdown-wrapper { position: relative; }
        .rs-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 4px;
          background: var(--background);
          border: 1px solid var(--border);
          box-shadow: 0 4px 12px var(--shadowMedium);
          border-radius: 8px;
          padding: 4px;
          z-index: 10;
          min-width: 160px;
          display: flex;
          flex-direction: column;
        }
        .rs-dropdown__item {
          text-align: left;
          padding: 8px 12px;
          background: transparent;
          border: none;
          color: var(--textSecondary);
          font-size: 13px;
          cursor: pointer;
          border-radius: 4px;
        }
        .rs-dropdown__item:hover { background: var(--backgroundHover); color: var(--text); }
        .rs-dropdown__item[data-active="true"] { color: var(--primary); background: var(--primaryBg); }

        /* 内容列表 */
        .rs-list {
          flex: 1;
          overflow-y: auto;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--backgroundSecondary);
          /* 内阴影增加深度 */
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); 
        }
        .rs-status {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--textTertiary);
          font-size: 13px;
        }
        .rs-spinner { width: 16px; height: 16px; border: 2px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: rs-spin 1s linear infinite; }
        @keyframes rs-spin { to { transform: rotate(360deg); } }

        /* 列表项 */
        .rs-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-bottom: 1px solid var(--borderLight);
          background: var(--background);
          cursor: pointer;
          transition: background 0.15s;
        }
        .rs-item:last-child { border-bottom: none; }
        .rs-item:hover { background: var(--backgroundHover); }
        .rs-item[data-selected="true"] { background: var(--primaryBg); }
        
        /* 隐藏原生 Checkbox，使用自定义样式 */
        .rs-item__check input { display: none; }
        .rs-checkbox-ui {
          width: 18px;
          height: 18px;
          border: 2px solid var(--textQuaternary);
          border-radius: 4px;
          position: relative;
          transition: all 0.2s;
        }
        .rs-item__check input:checked + .rs-checkbox-ui {
          background: var(--primary);
          border-color: var(--primary);
        }
        .rs-item__check input:checked + .rs-checkbox-ui::after {
          content: "";
          position: absolute;
          left: 4px; top: 1px;
          width: 5px; height: 9px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .rs-item__body { flex: 1; min-width: 0; }
        .rs-item__title { font-size: 14px; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .rs-item__meta { font-size: 12px; color: var(--textTertiary); margin-top: 2px; }
        
        .rs-item[data-selected="true"] .rs-item__title { color: var(--primary); font-weight: 500; }

        /* 类型切换按钮 */
        .rs-type-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          background: var(--background);
        }
        .rs-type-btn:hover { transform: scale(1.1); box-shadow: 0 2px 8px var(--shadowLight); }
        .rs-type-btn[data-type="knowledge"] { color: var(--textSecondary); border-color: var(--border); }
        .rs-type-btn[data-type="instruction"] { color: var(--primary); background: var(--primary)15; }

        /* 底部 */
        .rs-summary {
          padding: 10px 14px;
          background: var(--backgroundTertiary);
          border-radius: 8px;
          font-size: 13px;
          color: var(--textSecondary);
          text-align: center;
          border: 1px solid var(--borderLight);
        }
        .rs-summary__detail { opacity: 0.8; font-size: 12px; }
      `}</style>
    </div>
  );
};

export default ReferencesSelector;
