// render/web/ui/Combobox.tsx
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useId,
  useLayoutEffect,
} from "react";
import { useTranslation } from "react-i18next";
import { LuChevronDown, LuCheck, LuX, LuSearch } from "react-icons/lu";
import {
  FloatingPortal,
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useInteractions,
  useClick,
  useDismiss,
  useRole,
  useListNavigation,
  size as floatingSize,
} from "@floating-ui/react";

const COMBOBOX_STYLES = `
  .cbx-combobox {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    width: 100%;
    font-family: inherit;
  }

  .cbx-combobox__label {
    font-size: .875rem;
    font-weight: 500;
    color: var(--text);
    margin-bottom: 4px;
  }

  /* --- Trigger Base --- */
  .cbx-combobox__trigger {
    position: relative;
    width: 100%;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--background);
    color: var(--text);
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all .2s;
    outline: none;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }

  /* --- Variant Restored --- */
  .cbx-combobox__trigger[data-variant="ghost"] {
    background: transparent;
    border-color: transparent;
    box-shadow: none;
  }
  .cbx-combobox__trigger[data-variant="ghost"]:hover:not([data-open]) {
    background: var(--backgroundHover);
  }

  .cbx-combobox__trigger[data-variant="filled"] {
    background: var(--backgroundSecondary);
    border-color: transparent;
  }

  /* --- Size Restored --- */
  .cbx-combobox__trigger[data-size="small"] {
    min-height: 32px;
    font-size: 0.8125rem;
    padding: 0 30px 0 8px;
  }
  .cbx-combobox__trigger[data-size="medium"] {
    min-height: 40px;
    font-size: 0.875rem;
    padding: 0 36px 0 12px;
  }
  .cbx-combobox__trigger[data-size="large"] {
    min-height: 48px;
    font-size: 1rem;
    padding: 0 40px 0 16px;
  }

  .cbx-combobox__trigger:hover:not(:disabled):not([data-variant="ghost"]) {
    border-color: var(--textTertiary);
  }

  .cbx-combobox__trigger[data-open] {
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary-light, rgba(59, 130, 246, 0.15));
    z-index: 2; /* 确保打开时浮起 */
  }
  
  .cbx-combobox__trigger:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: var(--backgroundSecondary);
  }

  .cbx-combobox__text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }
  .cbx-combobox__text[data-placeholder] {
    color: var(--textTertiary);
  }

  .cbx-combobox__icon-prefix {
    margin-right: 8px;
    color: var(--textSecondary);
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
  
  .cbx-combobox__ctrl {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--textTertiary);
  }
  
  .cbx-combobox__clear {
    display: flex;
    padding: 2px;
    border-radius: 4px;
    cursor: pointer;
    background: transparent;
    border: none;
    color: inherit;
  }
  .cbx-combobox__clear:hover {
    background: var(--backgroundHover);
    color: var(--text);
  }

  .cbx-combobox__panel {
    z-index: 1000;
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden; 
    box-shadow: 
      0 4px 6px -1px rgba(0, 0, 0, 0.1), 
      0 10px 15px -3px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    animation: cbx-fade-in 0.1s ease-out;
  }

  @keyframes cbx-fade-in {
    from { opacity: 0; transform: translateY(-4px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .cbx-combobox__search-wrap {
    position: relative;
    border-bottom: 1px solid var(--borderLight);
    padding: 4px 8px;
    flex-shrink: 0;
  }

  .cbx-combobox__search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--textTertiary);
    pointer-events: none;
  }

  .cbx-combobox__search {
    width: 100%;
    height: 36px;
    padding: 0 8px 0 28px;
    border: none !important;
    outline: none !important;
    background: transparent;
    color: var(--text);
    font-size: .875rem;
  }
  
  .cbx-combobox__list {
    max-height: 300px; /* 稍微加大一点高度 */
    overflow-y: auto;
    padding: 4px;
    scroll-behavior: auto; 
  }

  .cbx-combobox__item {
    padding: 6px 12px 6px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: .875rem;
    color: var(--text);
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: background 0.1s;
    user-select: none;
    scroll-margin: 40px; /* 辅助滚动定位 */
  }

  .cbx-combobox__item[data-highlighted] {
    background: var(--backgroundHover);
  }

  .cbx-combobox__item[data-selected] {
    background: var(--primaryHover, rgba(59, 130, 246, 0.1));
    color: var(--primary);
    font-weight: 500;
  }

  .cbx-combobox__item-check {
    color: var(--primary);
    margin-left: 8px;
  }

  .cbx-combobox__status {
    padding: 12px;
    text-align: center;
    color: var(--textTertiary);
    font-size: 0.875rem;
  }

  .cbx-combobox__list::-webkit-scrollbar { width: 5px; }
  .cbx-combobox__list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  .cbx-combobox__list::-webkit-scrollbar-thumb:hover { background: var(--textTertiary); }
`;

interface ComboboxProps<T = any> {
  items: T[];
  onChange?: (selectedItem: T | null) => void;
  placeholder?: string;
  labelField?: keyof T | string;
  valueField?: keyof T | string;
  disabled?: boolean;
  selectedItem?: T | null;
  renderOptionContent?: (
    item: T,
    isHighlighted: boolean,
    isSelected: boolean
  ) => React.ReactNode;
  error?: boolean;
  helperText?: string;
  label?: string;
  icon?: React.ReactNode;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  size?: "small" | "medium" | "large";
  variant?: "default" | "filled" | "ghost"; // 恢复 variant 定义
  ref?: React.Ref<HTMLButtonElement>;
}

function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): (instance: T | null) => void {
  return (instance) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(instance);
      } else {
        (ref as React.MutableRefObject<T | null>).current = instance;
      }
    });
  };
}

function Combobox<T = any>(props: ComboboxProps<T>) {
  const {
    items = [],
    onChange,
    placeholder,
    labelField = "label",
    valueField = "value",
    disabled = false,
    selectedItem,
    renderOptionContent,
    error = false,
    helperText,
    label,
    icon,
    searchable = false,
    clearable = false,
    loading = false,
    size = "medium",
    variant = "default",
    ref,
  } = props;

  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<(HTMLElement | null)[]>([]);

  const getItemLabel = (item: T | null | undefined): string =>
    item ? String((item as any)?.[labelField as any] ?? "") : "";

  const getItemValue = (item: T | null | undefined): unknown =>
    item ? (item as any)?.[valueField as any] : undefined;

  const isSameItem = (a: T | null | undefined, b: T | null | undefined) => {
    const va = getItemValue(a);
    const vb = getItemValue(b);
    return va !== undefined && vb !== undefined ? va === vb : a === b;
  };

  const filteredItems = useMemo(() => {
    if (!searchable || !searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter((it) => getItemLabel(it).toLowerCase().includes(term));
  }, [items, searchTerm, searchable, labelField]);

  const { x, y, strategy, context, refs } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    middleware: [
      offset(4),
      flip(),
      shift(),
      floatingSize({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [
      useClick(context),
      useDismiss(context),
      useRole(context, { role: "listbox" }),
      useListNavigation(context, {
        listRef,
        activeIndex: highlightedIndex,
        onNavigate: setHighlightedIndex,
        loop: true,
      }),
    ]
  );

  // 1. 关闭重置搜索
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open]);

  // 2. 打开瞬间定位逻辑
  useLayoutEffect(() => {
    if (open) {
      let index = -1;

      if (!searchTerm && selectedItem) {
        index = filteredItems.findIndex((it) => isSameItem(it, selectedItem));
      }

      if (index < 0 && filteredItems.length > 0) {
        index = 0;
      }

      setHighlightedIndex(index);

      requestAnimationFrame(() => {
        // --- 核心改动：block: "center" ---
        // 这样选中项会尽可能出现在列表的正中间
        if (index >= 0 && listRef.current[index]) {
          listRef.current[index]?.scrollIntoView({
            block: "center",
            inline: "nearest",
          });
        }
        if (searchable) {
          searchInputRef.current?.focus();
        }
      });
    }
  }, [open, filteredItems.length, selectedItem]);

  const displayLabel = selectedItem ? getItemLabel(selectedItem) : "";
  const composedRef = mergeRefs(refs.setReference, ref);

  return (
    <>
      <style>{COMBOBOX_STYLES}</style>

      <div className="cbx-combobox">
        {label && <label className="cbx-combobox__label">{label}</label>}

        <button
          ref={composedRef}
          type="button"
          {...getReferenceProps({
            className: "cbx-combobox__trigger",
            disabled,
            "data-open": open ? "" : undefined,
            "data-size": size,
            "data-variant": variant,
            "aria-expanded": open,
            "aria-invalid": error,
            onClick: () => !disabled && setOpen(!open),
          })}
        >
          {icon && <span className="cbx-combobox__icon-prefix">{icon}</span>}

          <span
            className="cbx-combobox__text"
            data-placeholder={!selectedItem ? "" : undefined}
          >
            {displayLabel ||
              placeholder ||
              t("dropdown.placeholder", "Select...")}
          </span>

          <div className="cbx-combobox__ctrl">
            {clearable && selectedItem && !disabled && !loading && (
              <button
                type="button"
                className="cbx-combobox__clear"
                onClick={(e) => {
                  e.stopPropagation();
                  // 顺手优化：清除后不应该打开下拉面板？视情况而定，这里阻止冒泡即可
                  onChange?.(null);
                }}
              >
                <LuX size={14} />
              </button>
            )}
            <LuChevronDown
              size={size === "small" ? 14 : 16}
              style={{
                transform: open ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          </div>
        </button>

        <FloatingPortal>
          {open && (
            <div
              ref={refs.setFloating}
              style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
              }}
              {...getFloatingProps({
                className: "cbx-combobox__panel",
                onKeyDown: (e) => {
                  if (
                    e.key === "Enter" &&
                    highlightedIndex >= 0 &&
                    filteredItems[highlightedIndex]
                  ) {
                    e.preventDefault();
                    onChange?.(filteredItems[highlightedIndex]);
                    setOpen(false);
                  }
                },
              })}
            >
              {searchable && (
                <div className="cbx-combobox__search-wrap">
                  <LuSearch className="cbx-combobox__search-icon" size={16} />
                  <input
                    ref={searchInputRef}
                    className="cbx-combobox__search"
                    placeholder={t("dropdown.search", "Search...")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              <div role="listbox" className="cbx-combobox__list">
                {loading ? (
                  <div className="cbx-combobox__status">
                    {t("dropdown.loading", "Loading...")}
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="cbx-combobox__status">
                    {t("dropdown.noResults", "No results found")}
                  </div>
                ) : (
                  filteredItems.map((item, index) => {
                    const isSelected = isSameItem(selectedItem, item);
                    const isHighlighted = highlightedIndex === index;

                    return (
                      <div
                        key={index}
                        {...getItemProps({
                          ref: (node) => (listRef.current[index] = node),
                          role: "option",
                          className: "cbx-combobox__item",
                          "data-selected": isSelected ? "" : undefined,
                          "data-highlighted": isHighlighted ? "" : undefined,
                          onClick: () => {
                            onChange?.(item);
                            setOpen(false);
                          },
                        })}
                      >
                        {renderOptionContent ? (
                          renderOptionContent(item, isHighlighted, isSelected)
                        ) : (
                          <>
                            <span>{getItemLabel(item)}</span>
                            {isSelected && (
                              <LuCheck
                                size={16}
                                className="cbx-combobox__item-check"
                              />
                            )}
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </FloatingPortal>
      </div>
    </>
  );
}

Combobox.displayName = "Combobox";

export default Combobox;
