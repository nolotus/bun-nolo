import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useMemo,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
import { LuChevronDown, LuCheck, LuX } from "react-icons/lu";
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
} from "@floating-ui/react";

interface DropdownProps {
  items: any[];
  onChange?: (selectedItem: any) => void;
  placeholder?: string;
  labelField?: string;
  valueField?: string;
  disabled?: boolean;
  selectedItem?: any;
  renderOptionContent?: (
    item: any,
    isHighlighted: boolean,
    isSelected: boolean
  ) => React.ReactNode;
  error?: boolean;
  helperText?: string;
  label?: string;
  size?: "small" | "medium" | "large";
  variant?: "default" | "filled" | "ghost";
  icon?: React.ReactNode;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
}

export const Dropdown = forwardRef<HTMLButtonElement, DropdownProps>(
  (
    {
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
      size = "medium",
      variant = "default",
      icon,
      searchable = false,
      clearable = false,
      loading = false,
    },
    ref
  ) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownListRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const inputId = useMemo(
      () => `dropdown-${Math.random().toString(36).substring(2, 9)}`,
      []
    );
    const helperTextId = helperText ? `${inputId}-helper` : undefined;

    useEffect(() => {
      if (open && searchable) {
        setTimeout(() => searchInputRef.current?.focus(), 50); // Small delay for transition
      }
      if (!open) {
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    }, [open, searchable]);

    const filteredItems = useMemo(
      () =>
        searchable && searchTerm
          ? items.filter((item) =>
              String(item[labelField])
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            )
          : items,
      [items, searchTerm, labelField, searchable]
    );

    const { x, y, strategy, context, refs } = useFloating({
      open,
      onOpenChange: setOpen,
      placement: "bottom-start",
      middleware: [offset(4), flip(), shift()],
      whileElementsMounted: autoUpdate,
    });

    const { getReferenceProps, getFloatingProps, getItemProps } =
      useInteractions([
        useClick(context),
        useDismiss(context),
        useRole(context, { role: "listbox" }),
        useListNavigation(context, {
          listRef: dropdownListRef,
          activeIndex: highlightedIndex,
          onNavigate: setHighlightedIndex,
        }),
      ]);

    const handleSelect = useCallback(
      (item: any) => {
        onChange?.(item);
        setOpen(false);
      },
      [onChange]
    );

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange?.(null);
      },
      [onChange]
    );

    const displayValue = selectedItem
      ? selectedItem[labelField]
      : placeholder || t("dropdown.placeholder", "选择...");

    return (
      <>
        <style href="dropdown" precedence="medium">{`
        .dropdown-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          width: 100%;
        }

        .dropdown-label {
          font-size: 0.875rem;
          font-weight: 550;
          color: var(--text);
          margin-bottom: var(--space-1);
          letter-spacing: -0.01em;
          line-height: 1.4;
        }
        .dropdown-label.error { color: var(--error); }

        .dropdown-wrapper { position: relative; width: 100%; }

        .dropdown-toggle {
          width: 100%;
          border-radius: var(--space-3);
          border: 1px solid var(--border);
          background: var(--background);
          color: var(--placeholder);
          font-size: 0.925rem;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          user-select: none;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: inherit;
          letter-spacing: -0.01em;
          box-shadow: 0 1px 3px var(--shadowLight), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          outline: none;
        }
        .dropdown-toggle.has-selection { color: var(--text); }
        .dropdown-toggle.error { border-color: var(--error); }

        /* --- 尺寸系统 --- */
        .dropdown-toggle.size-small { height: 36px; border-radius: var(--space-2); font-size: 0.875rem; }
        .dropdown-toggle.size-small.has-icon { padding: 0 32px 0 40px; }
        .dropdown-toggle.size-small.has-none { padding: 0 32px 0 var(--space-3); }
        .dropdown-toggle.size-medium { height: 42px; font-size: 0.925rem; }
        .dropdown-toggle.size-medium.has-icon { padding: 0 36px 0 44px; }
        .dropdown-toggle.size-medium.has-none { padding: 0 36px 0 var(--space-4); }
        .dropdown-toggle.size-large { height: 48px; font-size: 1rem; border-radius: var(--space-4); }
        .dropdown-toggle.size-large.has-icon { padding: 0 40px 0 48px; }
        .dropdown-toggle.size-large.has-none { padding: 0 40px 0 var(--space-5); }
        
        /* --- 变体样式 --- */
        .dropdown-toggle.variant-filled { background: var(--backgroundSecondary); border-color: var(--borderLight); }
        .dropdown-toggle.variant-ghost { background: transparent; border-color: transparent; box-shadow: none; }
        .dropdown-toggle.variant-filled.error, .dropdown-toggle.variant-ghost.error { border-color: var(--error); }
        
        /* --- 交互状态 --- */
        .dropdown-toggle:hover:not(:disabled) { border-color: var(--primary); }
        .dropdown-toggle.error:hover:not(:disabled) { border-color: var(--error); }

        .dropdown-toggle:focus:not(:disabled), .dropdown-toggle.open {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--focus), 0 2px 8px var(--shadowMedium), inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }
        .dropdown-toggle.error:focus:not(:disabled), .dropdown-toggle.error.open {
          border-color: var(--error);
          box-shadow: 0 0 0 3px var(--error-focus, rgba(239, 68, 68, 0.25)); /* Fallback for --error-focus */
        }

        .dropdown-toggle:disabled {
          background: var(--backgroundTertiary);
          color: var(--textQuaternary);
          cursor: not-allowed;
          opacity: 0.6;
          box-shadow: none;
        }

        /* --- 图标 & 控件 --- */
        .dropdown-icon {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          color: var(--textSecondary);
          display: flex;
          pointer-events: none;
          z-index: 1;
        }
        .dropdown-icon.size-small { left: var(--space-3); font-size: 16px; }
        .dropdown-icon.size-medium { left: var(--space-4); font-size: 18px; }
        .dropdown-icon.size-large { left: var(--space-5); font-size: 20px; }
        .dropdown-icon.error { color: var(--error); }

        .dropdown-controls {
          position: absolute;
          top: 50%;
          right: var(--space-2);
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: var(--space-1);
          z-index: 2;
        }

        .dropdown-clear {
          background: none; border: none; color: var(--textTertiary);
          cursor: pointer; padding: var(--space-1); border-radius: var(--space-1);
          transition: all 0.3s ease; display: flex;
        }
        .dropdown-clear:hover { color: var(--text); background: var(--backgroundHover); }

        .dropdown-chevron {
          color: var(--textTertiary);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dropdown-toggle.open .dropdown-chevron { transform: rotate(180deg); }
        
        /* --- 下拉菜单 --- */
        .dropdown-menu {
          z-index: 1000;
          padding: var(--space-2);
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--space-3);
          box-shadow: 0 8px 32px -4px var(--shadowMedium), 0 4px 16px -8px var(--shadowHeavy);
          overflow: hidden;
          animation: dropdownSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes dropdownSlideIn { from { opacity: 0; transform: translateY(-12px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        
        .dropdown-search {
          width: 100%; height: 32px; padding: 0 var(--space-3);
          border: 1px solid var(--borderLight); border-radius: var(--space-2);
          background: var(--backgroundSecondary); color: var(--text);
          font-size: 0.875rem; outline: none; margin-bottom: var(--space-2);
          transition: all 0.3s ease;
        }
        .dropdown-search:focus {
          border-color: var(--primary);
          background: var(--background);
          box-shadow: 0 0 0 2px var(--focus);
        }

        .dropdown-list { max-height: 240px; overflow-y: auto; padding-right: 4px; }
        .dropdown-item {
          padding: var(--space-2) var(--space-3); margin: var(--space-1) 0;
          border-radius: var(--space-2); cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
          font-size: 0.9rem; color: var(--text); display: flex;
          align-items: center; justify-content: space-between;
        }
        .dropdown-item:hover, .dropdown-item.highlighted { background: var(--backgroundHover); }
        .dropdown-item.highlighted { color: var(--primary); }
        .dropdown-item.selected { background: var(--primaryHover); color: var(--primary); font-weight: 550; }
        
        .dropdown-item-check { opacity: 0; color: var(--primary); transition: opacity 0.2s ease; }
        .dropdown-item.selected .dropdown-item-check { opacity: 1; }

        .dropdown-empty, .dropdown-loading {
          padding: var(--space-4); color: var(--textTertiary);
          font-size: 0.875rem; text-align: center;
        }
        
        .dropdown-helper {
          font-size: 0.8125rem; line-height: 1.4;
          margin-top: var(--space-1); color: var(--textTertiary);
        }
        .dropdown-helper.error { color: var(--error); }

        /* --- 滚动条 --- */
        .dropdown-list::-webkit-scrollbar { width: 6px; }
        .dropdown-list::-webkit-scrollbar-track { background: transparent; }
        .dropdown-list::-webkit-scrollbar-thumb { background: var(--borderHover); border-radius: 3px; }
        .dropdown-list::-webkit-scrollbar-thumb:hover { background: var(--textTertiary); }

        @media (prefers-reduced-motion: reduce) {
          .dropdown-menu, .dropdown-toggle, .dropdown-chevron { animation: none; transition: none; }
        }
      `}</style>

        <div className="dropdown-container">
          {label && (
            <label
              htmlFor={inputId}
              className={`dropdown-label ${error ? "error" : ""}`}
            >
              {label}
            </label>
          )}

          <div className="dropdown-wrapper">
            {icon && (
              <div
                className={`dropdown-icon size-${size} ${error ? "error" : ""}`}
              >
                {icon}
              </div>
            )}

            <button
              {...getReferenceProps({
                ref(node) {
                  refs.setReference(node);
                  if (typeof ref === "function") ref(node);
                  else if (ref) (ref as any).current = node;
                },
                id: inputId,
                type: "button",
                className: `dropdown-toggle size-${size} variant-${variant} ${
                  icon ? "has-icon" : "has-none"
                } ${open ? "open" : ""} ${error ? "error" : ""} ${
                  selectedItem ? "has-selection" : ""
                }`,
                disabled: disabled || loading,
                "aria-haspopup": "listbox",
                "aria-expanded": open,
                "aria-describedby": helperTextId,
                "aria-invalid": error,
              })}
            >
              <span className="dropdown-text">{displayValue}</span>
              <div className="dropdown-controls">
                {clearable && selectedItem && !disabled && (
                  <button
                    type="button"
                    className="dropdown-clear"
                    onClick={handleClear}
                    aria-label={t("dropdown.clear", "清除选择")}
                  >
                    <LuX size={14} />
                  </button>
                )}
                <LuChevronDown
                  size={size === "small" ? 14 : 16}
                  className="dropdown-chevron"
                />
              </div>
            </button>

            <FloatingPortal>
              {open && (
                <div
                  {...getFloatingProps({
                    ref: refs.setFloating,
                    className: "dropdown-menu",
                    style: {
                      position: strategy,
                      top: y ?? 0,
                      left: x ?? 0,
                      width:
                        refs.reference.current?.getBoundingClientRect().width,
                    },
                    onKeyDown(e: React.KeyboardEvent) {
                      if (e.key === "Enter" && highlightedIndex !== -1) {
                        e.preventDefault();
                        handleSelect(filteredItems[highlightedIndex]);
                      }
                    },
                  })}
                >
                  {searchable && (
                    <input
                      ref={searchInputRef}
                      type="text"
                      className="dropdown-search"
                      placeholder={t("dropdown.search", "搜索...")}
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setHighlightedIndex(0);
                      }}
                    />
                  )}

                  <div
                    ref={dropdownListRef}
                    className="dropdown-list"
                    role="listbox"
                  >
                    {loading ? (
                      <div className="dropdown-loading">
                        {t("dropdown.loading", "加载中...")}
                      </div>
                    ) : filteredItems.length > 0 ? (
                      filteredItems.map((item, index) => {
                        const isSelected = selectedItem === item;
                        const isHighlighted = highlightedIndex === index;
                        return (
                          <div
                            key={item[valueField] ?? index}
                            {...getItemProps({
                              role: "option",
                              className: `dropdown-item ${
                                isHighlighted ? "highlighted" : ""
                              } ${isSelected ? "selected" : ""}`,
                              "aria-selected": isSelected,
                              onClick: () => handleSelect(item),
                            })}
                          >
                            {renderOptionContent ? (
                              renderOptionContent(
                                item,
                                isHighlighted,
                                isSelected
                              )
                            ) : (
                              <>
                                <span>{item[labelField]}</span>
                                <LuCheck
                                  size={14}
                                  className="dropdown-item-check"
                                />
                              </>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="dropdown-empty">
                        {searchTerm
                          ? t("dropdown.noResults", "没有匹配的选项")
                          : t("dropdown.noOptions", "没有可用选项")}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </FloatingPortal>
          </div>

          {helperText && (
            <div
              id={helperTextId}
              className={`dropdown-helper ${error ? "error" : ""}`}
              role={error ? "alert" : undefined}
            >
              {helperText}
            </div>
          )}
        </div>
      </>
    );
  }
);

Dropdown.displayName = "Dropdown";
export default Dropdown;
