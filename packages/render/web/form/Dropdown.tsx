// render/web/form/Dropdown.tsx
import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useCallback,
} from "react";
import { useTheme } from "app/theme";
import { ChevronDownIcon, CheckIcon } from "@primer/octicons-react";

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
      placeholder = "选择...",
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
    const theme = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const inputId = `dropdown-${Math.random().toString(36).substr(2, 9)}`;
    const helperTextId = helperText ? `${inputId}-helper` : undefined;

    // 过滤项目
    const filteredItems =
      searchable && searchTerm
        ? items.filter((item) =>
            item[labelField]?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : items;

    // 点击外部关闭
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchTerm("");
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 键盘导航
    useEffect(() => {
      if (isOpen) {
        const handleKeyDown = (e: KeyboardEvent) => {
          switch (e.key) {
            case "ArrowDown":
              e.preventDefault();
              setHighlightedIndex((prev) =>
                prev < filteredItems.length - 1 ? prev + 1 : prev
              );
              break;
            case "ArrowUp":
              e.preventDefault();
              setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
              break;
            case "Enter":
              e.preventDefault();
              if (highlightedIndex >= 0 && filteredItems[highlightedIndex]) {
                handleSelect(filteredItems[highlightedIndex]);
              }
              break;
            case "Escape":
              setIsOpen(false);
              setSearchTerm("");
              break;
          }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
      }
    }, [isOpen, highlightedIndex, filteredItems]);

    const handleToggle = useCallback(() => {
      if (!disabled) {
        setIsOpen((prev) => !prev);
        if (!isOpen && searchable) {
          setTimeout(() => searchInputRef.current?.focus(), 0);
        }
      }
    }, [disabled, isOpen, searchable]);

    const handleSelect = useCallback(
      (item: any) => {
        onChange?.(item);
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
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

    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setHighlightedIndex(-1);
      },
      []
    );

    const displayValue = selectedItem ? selectedItem[labelField] : placeholder;

    return (
      <>
        <style href="dropdown" precedence="medium">{`
        .dropdown-container {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[1]};
          width: 100%;
        }

        .dropdown-label {
          font-size: 0.875rem;
          font-weight: 550;
          color: ${theme.text};
          margin-bottom: ${theme.space[1]};
          letter-spacing: -0.01em;
          line-height: 1.4;
        }

        .dropdown-label.error {
          color: ${theme.error};
        }

        .dropdown-wrapper {
          position: relative;
          width: 100%;
        }

        .dropdown-toggle {
          width: 100%;
          border-radius: ${theme.space[3]};
          border: 1px solid ${error ? theme.error : theme.border};
          background: ${theme.background};
          color: ${selectedItem ? theme.text : theme.placeholder || theme.textQuaternary};
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
          letter-spacing: -0.01em;
          box-shadow: 0 1px 3px ${theme.shadow1}, inset 0 1px 0 rgba(255, 255, 255, 0.1);
          outline: none;
        }

        /* 尺寸系统 */
        .dropdown-toggle.size-small {
          height: 36px;
          border-radius: ${theme.space[2]};
          font-size: 0.875rem;
        }

        .dropdown-toggle.size-small.has-icon {
          padding: 0 32px 0 40px;
        }

        .dropdown-toggle.size-small.has-none {
          padding: 0 32px 0 ${theme.space[3]};
        }

        .dropdown-toggle.size-medium {
          height: 42px;
          font-size: 0.925rem;
        }

        .dropdown-toggle.size-medium.has-icon {
          padding: 0 36px 0 44px;
        }

        .dropdown-toggle.size-medium.has-none {
          padding: 0 36px 0 ${theme.space[4]};
        }

        .dropdown-toggle.size-large {
          height: 48px;
          font-size: 1rem;
          border-radius: ${theme.space[4]};
        }

        .dropdown-toggle.size-large.has-icon {
          padding: 0 40px 0 48px;
        }

        .dropdown-toggle.size-large.has-none {
          padding: 0 40px 0 ${theme.space[5]};
        }

        /* 变体样式 */
        .dropdown-toggle.variant-filled {
          background: ${theme.backgroundSecondary};
          border-color: ${error ? theme.error : theme.borderLight};
        }

        .dropdown-toggle.variant-ghost {
          background: transparent;
          border-color: ${error ? theme.error : theme.borderLight};
          box-shadow: none;
        }

        /* 交互状态 */
        .dropdown-toggle:hover:not(:disabled) {
          border-color: ${error ? theme.error : theme.primary}40;
          box-shadow: 0 2px 6px ${theme.shadow1}, inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        .dropdown-toggle:focus:not(:disabled) {
          border-color: ${error ? theme.error : theme.primary};
          box-shadow: 0 0 0 3px ${error ? `${theme.error}20` : `${theme.primary}20`}, 
                     0 2px 8px ${theme.shadow2}, 
                     inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .dropdown-toggle:disabled {
          background: ${theme.backgroundTertiary};
          color: ${theme.textQuaternary};
          cursor: not-allowed;
          opacity: 0.6;
          box-shadow: none;
        }

        .dropdown-toggle.open {
          border-color: ${theme.primary};
          box-shadow: 0 0 0 3px ${theme.primary}20;
        }

        /* 图标 */
        .dropdown-icon {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          color: ${theme.textSecondary};
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          transition: color 0.3s ease;
          z-index: 1;
        }

        .dropdown-icon.size-small {
          left: ${theme.space[3]};
          width: 16px;
          height: 16px;
        }

        .dropdown-icon.size-medium {
          left: ${theme.space[4]};
          width: 18px;
          height: 18px;
        }

        .dropdown-icon.size-large {
          left: ${theme.space[5]};
          width: 20px;
          height: 20px;
        }

        .dropdown-icon.error {
          color: ${theme.error};
        }

        /* 控制按钮区域 */
        .dropdown-controls {
          position: absolute;
          top: 50%;
          right: ${theme.space[2]};
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: ${theme.space[1]};
          z-index: 2;
        }

        .dropdown-clear {
          background: none;
          border: none;
          color: ${theme.textTertiary};
          cursor: pointer;
          padding: ${theme.space[1]};
          border-radius: ${theme.space[1]};
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dropdown-clear:hover {
          color: ${theme.text};
          background: ${theme.backgroundHover};
        }

        .dropdown-chevron {
          color: ${theme.textTertiary};
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          transform: ${isOpen ? "rotate(180deg)" : "rotate(0)"};
        }

        /* 下拉菜单 */
        .dropdown-menu {
          position: absolute;
          z-index: 1000;
          width: 100%;
          margin-top: ${theme.space[1]};
          padding: ${theme.space[2]};
          background: ${theme.background};
          border: 1px solid ${theme.border};
          border-radius: ${theme.space[3]};
          box-shadow: 0 8px 32px -4px ${theme.shadow2}, 
                     0 4px 16px -8px ${theme.shadow3};
          max-height: 320px;
          overflow: hidden;
          animation: dropdownSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes dropdownSlideIn {
          from {
            opacity: 0;
            transform: translateY(-12px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .dropdown-search {
          width: 100%;
          height: 32px;
          padding: 0 ${theme.space[3]};
          border: 1px solid ${theme.borderLight};
          border-radius: ${theme.space[2]};
          background: ${theme.backgroundSecondary};
          color: ${theme.text};
          font-size: 0.875rem;
          outline: none;
          margin-bottom: ${theme.space[2]};
          transition: all 0.3s ease;
        }

        .dropdown-search:focus {
          border-color: ${theme.primary};
          background: ${theme.background};
          box-shadow: 0 0 0 2px ${theme.primary}20;
        }

        .dropdown-list {
          max-height: 240px;
          overflow-y: auto;
        }

        .dropdown-item {
          padding: ${theme.space[2]} ${theme.space[3]};
          margin: ${theme.space[1]} 0;
          border-radius: ${theme.space[2]};
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          font-size: 0.9rem;
          color: ${theme.text};
          display: flex;
          align-items: center;
          justify-content: space-between;
          letter-spacing: -0.01em;
          position: relative;
        }

        .dropdown-item:hover {
          background: ${theme.backgroundHover};
          color: ${theme.primary};
        }

        .dropdown-item.highlighted {
          background: ${theme.primary}12;
          color: ${theme.primary};
        }

        .dropdown-item.selected {
          background: ${theme.primary}15;
          color: ${theme.primary};
          font-weight: 550;
        }

        .dropdown-item-check {
          opacity: 0;
          color: ${theme.primary};
          transition: opacity 0.2s ease;
        }

        .dropdown-item.selected .dropdown-item-check {
          opacity: 1;
        }

        .dropdown-empty,
        .dropdown-loading {
          padding: ${theme.space[4]};
          color: ${theme.textTertiary};
          font-size: 0.875rem;
          text-align: center;
          font-style: italic;
        }

        .dropdown-helper {
          font-size: 0.8125rem;
          line-height: 1.4;
          margin-top: ${theme.space[1]};
          letter-spacing: -0.01em;
        }

        .dropdown-helper.error {
          color: ${theme.error};
        }

        .dropdown-helper.normal {
          color: ${theme.textTertiary};
        }

        /* 滚动条 */
        .dropdown-list::-webkit-scrollbar {
          width: 6px;
        }

        .dropdown-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .dropdown-list::-webkit-scrollbar-thumb {
          background: ${theme.borderHover || theme.border};
          border-radius: 3px;
        }

        .dropdown-list::-webkit-scrollbar-thumb:hover {
          background: ${theme.textTertiary};
        }

        /* 响应式 */
        @media (max-width: 768px) {
          .dropdown-toggle.size-medium {
            height: 44px;
            font-size: 1rem;
          }

          .dropdown-toggle.size-large {
            height: 50px;
            font-size: 1.0625rem;
          }
        }

        @media (max-width: 480px) {
          .dropdown-toggle {
            border-radius: ${theme.space[2]};
          }

          .dropdown-toggle.size-large {
            border-radius: ${theme.space[3]};
          }

          .dropdown-menu {
            border-radius: ${theme.space[2]};
          }
        }

        /* 减少动画偏好 */
        @media (prefers-reduced-motion: reduce) {
          .dropdown-menu {
            animation: none;
          }
          
          .dropdown-toggle,
          .dropdown-item,
          .dropdown-chevron,
          .dropdown-clear {
            transition: none;
          }
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

          <div className="dropdown-wrapper" ref={dropdownRef}>
            {icon && (
              <div
                className={`dropdown-icon size-${size} ${error ? "error" : ""}`}
              >
                {icon}
              </div>
            )}

            <button
              ref={ref}
              id={inputId}
              type="button"
              className={`dropdown-toggle size-${size} variant-${variant} ${
                icon ? "has-icon" : "has-none"
              } ${isOpen ? "open" : ""}`}
              onClick={handleToggle}
              disabled={disabled || loading}
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              aria-describedby={helperTextId}
              aria-invalid={error}
            >
              <span className="dropdown-text">{displayValue}</span>

              <div className="dropdown-controls">
                {clearable && selectedItem && !disabled && (
                  <button
                    type="button"
                    className="dropdown-clear"
                    onClick={handleClear}
                    aria-label="清除选择"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="currentColor"
                    >
                      <path
                        d="M9 3L3 9M3 3l6 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                )}
                <ChevronDownIcon
                  size={size === "small" ? 14 : 16}
                  className="dropdown-chevron"
                />
              </div>
            </button>

            {isOpen && (
              <div className="dropdown-menu" role="listbox">
                {searchable && (
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="dropdown-search"
                    placeholder="搜索..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                )}

                <div className="dropdown-list">
                  {loading ? (
                    <div className="dropdown-loading">加载中...</div>
                  ) : filteredItems.length > 0 ? (
                    filteredItems.map((item, index) => {
                      const isSelected = selectedItem === item;
                      const isHighlighted = highlightedIndex === index;
                      return (
                        <div
                          key={item[valueField] || index}
                          className={`dropdown-item ${isHighlighted ? "highlighted" : ""} ${isSelected ? "selected" : ""}`}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setHighlightedIndex(index)}
                        >
                          <span>
                            {renderOptionContent?.(
                              item,
                              isHighlighted,
                              isSelected
                            ) || item[labelField]}
                          </span>
                          <CheckIcon
                            size={14}
                            className="dropdown-item-check"
                          />
                        </div>
                      );
                    })
                  ) : (
                    <div className="dropdown-empty">
                      {searchTerm ? "没有匹配的选项" : "没有可用选项"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {helperText && (
            <div
              id={helperTextId}
              className={`dropdown-helper ${error ? "error" : "normal"}`}
              role={error ? "alert" : "note"}
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
