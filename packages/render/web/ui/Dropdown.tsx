// Dropdown.tsx
import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useMemo,
  useId,
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

interface DropdownProps<T = any> {
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
  size?: "small" | "medium" | "large";
  variant?: "default" | "filled" | "ghost";
  icon?: React.ReactNode;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
}

const Dropdown = forwardRef<HTMLButtonElement, DropdownProps>((props, ref) => {
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
    size = "medium",
    variant = "default",
    icon,
    searchable = false,
    clearable = false,
    loading = false,
  } = props;

  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<(HTMLElement | null)[]>([]);
  const inputId = useId();
  const helpId = helperText ? `${inputId}-help` : undefined;

  useEffect(() => {
    if (open && searchable) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    } else {
      setSearchTerm("");
      setHighlightedIndex(-1);
    }
  }, [open, searchable]);

  const filteredItems = useMemo(() => {
    if (!searchable || !searchTerm) return items;
    const lf = String(labelField);
    const term = searchTerm.toLowerCase();
    return items.filter((it: any) =>
      String(it?.[lf] ?? "")
        .toLowerCase()
        .includes(term)
    );
  }, [items, searchTerm, labelField, searchable]);

  const { x, y, strategy, context, refs } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    middleware: [offset(4), flip(), shift()],
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

  const displayValue =
    (selectedItem as any)?.[labelField as any] ??
    placeholder ??
    t("dropdown.placeholder", "选择...");

  return (
    <>
      <style>{`
        .dropdown { display:flex; flex-direction:column; gap:var(--space-1); width:100%; }
        .dropdown-label { font-size:.875rem; font-weight:550; color:var(--text); margin-bottom:var(--space-1); letter-spacing:-.01em; }
        .dropdown-label[data-error] { color:var(--error); }
        .dropdown-wrap { position:relative; width:100%; }

        .dropdown-toggle {
          --h: 42px; --fs:.925rem; --pl: var(--space-4); --pr:36px; --radius: var(--space-3);
          width:100%; height:var(--h); padding:0 var(--pr) 0 var(--pl);
          border-radius:var(--radius); border:1px solid var(--border);
          background:var(--background); color:var(--placeholder);
          font-size:var(--fs); font-weight:500; text-align:left; cursor:pointer;
          display:flex; align-items:center; justify-content:space-between;
          transition:all .25s cubic-bezier(.16,1,.3,1);
          box-shadow:0 1px 3px var(--shadowLight), inset 0 1px 0 rgba(255,255,255,.1);
          outline:none; user-select:none; letter-spacing:-.01em; position:relative;
        }
        .dropdown-toggle[data-size="small"] { --h:36px; --fs:.875rem; --pr:32px; --radius: var(--space-2); }
        .dropdown-toggle[data-size="large"] { --h:48px; --fs:1rem; --pr:40px; --radius: var(--space-4); }
        .dropdown-toggle[data-variant="filled"] { background:var(--backgroundSecondary); border-color:var(--borderLight); box-shadow:0 1px 2px var(--shadowLight); }
        .dropdown-toggle[data-variant="ghost"] { background:transparent; border-color:transparent; box-shadow:none; }
        .dropdown-toggle[data-selected] { color:var(--text); }
        .dropdown-toggle:hover:not(:disabled) { border-color:var(--primary); }
        .dropdown-toggle[data-open] { border-color:var(--primary); box-shadow:0 0 0 3px var(--focus), 0 2px 8px var(--shadowMedium); transform:translateY(-1px); }
        .dropdown-toggle[data-error] { border-color:var(--error); }
        .dropdown-toggle[data-error][data-open] { box-shadow:0 0 0 3px var(--error-focus, rgba(239,68,68,.25)); }
        .dropdown-toggle:disabled { background:var(--backgroundTertiary); color:var(--textQuaternary); cursor:not-allowed; opacity:.6; box-shadow:none; }

        .dropdown-icon { position:absolute; top:50%; transform:translateY(-50%); color:var(--textSecondary); display:flex; pointer-events:none; }
        .dropdown-icon[data-size="small"] { left: var(--space-3); font-size:16px; }
        .dropdown-icon[data-size="medium"] { left: var(--space-4); font-size:18px; }
        .dropdown-icon[data-size="large"] { left: var(--space-5); font-size:20px; }
        .dropdown-icon[data-error] { color:var(--error); }

        /* 增加有图标时的左内边距 */
        .dropdown-toggle[data-size="small"][data-has-icon] { --pl: 40px; }
        .dropdown-toggle[data-size="medium"][data-has-icon] { --pl: 44px; }
        .dropdown-toggle[data-size="large"][data-has-icon] { --pl: 48px; }

        .dropdown-ctrl { position:absolute; top:50%; right:var(--space-2); transform:translateY(-50%); display:flex; align-items:center; gap:var(--space-1); }
        .dropdown-clear { background:none; border:none; color:var(--textTertiary); cursor:pointer; padding:var(--space-1); border-radius:var(--space-1); display:flex; }
        .dropdown-clear:hover { color:var(--text); background:var(--backgroundHover); }
        .dropdown-chev { color:var(--textTertiary); transition:transform .25s cubic-bezier(.16,1,.3,1); }
        .dropdown-toggle[data-open] .dropdown-chev { transform:rotate(180deg); }

        .dropdown-menu {
          z-index:1000; padding:var(--space-2); background:var(--background); border:1px solid var(--border);
          border-radius:var(--space-3); box-shadow:0 8px 32px -4px var(--shadowMedium), 0 4px 16px -8px var(--shadowHeavy);
          animation: dd-in .18s cubic-bezier(.16,1,.3,1);
        }
        @keyframes dd-in { from { opacity:0; transform:translateY(-10px) scale(.98); } to { opacity:1; transform:none; } }

        .dropdown-search {
          width:100%; height:32px; padding:0 var(--space-3); border:1px solid var(--borderLight);
          border-radius:var(--space-2); background:var(--backgroundSecondary); color:var(--text);
          font-size:.875rem; outline:none; margin-bottom:var(--space-2); transition:all .2s ease;
        }
        .dropdown-search:focus { border-color:var(--primary); background:var(--background); box-shadow:0 0 0 2px var(--focus); }

        .dropdown-list { max-height:240px; overflow:auto; padding-right:4px; }
        .dropdown-item {
          padding:var(--space-2) var(--space-3); margin:var(--space-1) 0; border-radius:var(--space-2);
          cursor:pointer; transition:background .15s ease, color .15s ease; font-size:.9rem; color:var(--text);
          display:flex; align-items:center; justify-content:space-between;
        }
        .dropdown-item:hover, .dropdown-item[data-highlighted] { background:var(--backgroundHover); }
        .dropdown-item[data-highlighted] { color:var(--primary); }
        .dropdown-item[data-selected] { background:var(--primaryHover); color:var(--primary); font-weight:550; }
        .dropdown-check { opacity:0; color:var(--primary); transition:opacity .15s; }
        .dropdown-item[data-selected] .dropdown-check { opacity:1; }

        .dropdown-empty, .dropdown-loading { padding:var(--space-4); color:var(--textTertiary); font-size:.875rem; text-align:center; }

        .dropdown-list::-webkit-scrollbar { width:6px; }
        .dropdown-list::-webkit-scrollbar-thumb { background:var(--borderHover); border-radius:3px; }
        .dropdown-list::-webkit-scrollbar-thumb:hover { background:var(--textTertiary); }

        @media (prefers-reduced-motion: reduce) {
          .dropdown-menu, .dropdown-toggle, .dropdown-chev { animation:none; transition:none; }
        }
      `}</style>

      <div className="dropdown">
        {label && (
          <label
            htmlFor={inputId}
            className="dropdown-label"
            {...(error ? { "data-error": "" } : {})}
          >
            {label}
          </label>
        )}

        <div className="dropdown-wrap">
          {icon && (
            <div
              className="dropdown-icon"
              data-size={size}
              {...(error ? { "data-error": "" } : {})}
            >
              {icon}
            </div>
          )}

          <button
            {...getReferenceProps({
              ref: (node: HTMLButtonElement | null) => {
                refs.setReference(node);
                if (typeof ref === "function") ref(node);
                else if (ref) (ref as any).current = node;
              },
              id: inputId,
              type: "button",
              className: "dropdown-toggle",
              disabled: disabled || loading,
              "aria-haspopup": "listbox",
              "aria-expanded": open,
              "aria-describedby": helpId,
              "aria-invalid": error || undefined,
              // 用 data-attributes 降维样式分支
              "data-size": size,
              "data-variant": variant,
              ...(open ? { "data-open": "" } : {}),
              ...(error ? { "data-error": "" } : {}),
              ...(icon ? { "data-has-icon": "" } : {}),
              ...(selectedItem ? { "data-selected": "" } : {}),
            })}
          >
            <span>{displayValue}</span>

            <div className="dropdown-ctrl">
              {clearable && selectedItem && !disabled && (
                <button
                  type="button"
                  className="dropdown-clear"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange?.(null);
                  }}
                  aria-label={t("dropdown.clear", "清除选择")}
                >
                  <LuX size={14} />
                </button>
              )}
              <LuChevronDown
                size={size === "small" ? 14 : 16}
                className="dropdown-chev"
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
                  onKeyDown: (e: React.KeyboardEvent) => {
                    if (e.key === "Enter" && highlightedIndex >= 0) {
                      e.preventDefault();
                      onChange?.(filteredItems[highlightedIndex] ?? null);
                      setOpen(false);
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

                <div role="listbox" className="dropdown-list">
                  {loading ? (
                    <div className="dropdown-loading">
                      {t("dropdown.loading", "加载中...")}
                    </div>
                  ) : filteredItems.length ? (
                    filteredItems.map((item: any, index: number) => {
                      const isSelected = selectedItem === item;
                      const isHighlighted = highlightedIndex === index;
                      const key = item?.[valueField as any] ?? index;
                      return (
                        <div
                          key={key}
                          {...getItemProps({
                            ref: (el) => (listRef.current[index] = el),
                            role: "option",
                            className: "dropdown-item",
                            ...(isSelected ? { "data-selected": "" } : {}),
                            ...(isHighlighted
                              ? { "data-highlighted": "" }
                              : {}),
                            "aria-selected": isSelected,
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
                              <span>{item?.[labelField as any]}</span>
                              <LuCheck size={14} className="dropdown-check" />
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
            id={helpId}
            className="dropdown-helper"
            {...(error ? { "data-error": "" } : {})}
            role={error ? "alert" : undefined}
          >
            {helperText}
          </div>
        )}
      </div>
    </>
  );
});

Dropdown.displayName = "Dropdown";
export default Dropdown;
