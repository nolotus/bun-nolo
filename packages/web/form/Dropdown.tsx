// web/form/Dropdown.tsx
import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "app/theme";
import { ChevronDownIcon } from "@primer/octicons-react";

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
}

export const Dropdown: React.FC<DropdownProps> = ({
  items = [],
  onChange,
  placeholder = "选择...",
  labelField = "label",
  valueField = "value",
  disabled = false,
  selectedItem,
  renderOptionContent,
  error = false,
}) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (item: any) => {
    onChange?.(item);
    setIsOpen(false);
  };

  const handleMouseEnter = (index: number) => {
    setHighlightedIndex(index);
  };

  const displayValue = selectedItem ? selectedItem[labelField] : placeholder;

  return (
    <>
      <style>
        {`
.dropdown-wrapper {
    position: relative;
    width: 100%;
}
.dropdown-toggle {
    width: 100%;
    height: 36px;
    padding: 8px 12px;
    padding-right: 32px;
    border: 1px solid ${error ? theme.error : theme.border};
    border-radius: 6px;
    background: ${theme.background};
    color: ${selectedItem ? theme.text : theme.placeholder};
    font-size: 14px;
    text-align: left;
    cursor: pointer;
    user-select: none;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.dropdown-toggle:hover {
    border-color: ${error ? theme.error : theme.borderHover};
}
.dropdown-toggle:focus {
    outline: none;
    border-color: ${error ? theme.error : theme.primary};
    box-shadow: 0 0 0 4px ${error ? `${theme.error}12` : `${theme.primary}12`};
}
.dropdown-toggle:disabled {
    background: ${theme.backgroundSecondary};
    cursor: not-allowed;
    opacity: 0.6;
}
.dropdown-chevron {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%) ${isOpen ? "rotate(180deg)" : "rotate(0)"};
    transition: transform 0.2s ease;
    color: ${theme.textTertiary};
}
.dropdown-menu {
    position: absolute;
    z-index: 1000;
    width: 100%;
    margin-top: 4px;
    padding: 6px;
    background: ${theme.background};
    border: 1px solid ${theme.border};
    border-radius: 8px;
    box-shadow: 0 4px 12px ${theme.shadowLight}, 
                0 2px 4px ${theme.shadowMedium};
    max-height: 280px;
    overflow-y: auto;
    animation: slideIn 0.2s ease-out;
}
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
.dropdown-item {
    padding: 8px 10px;
    margin: 2px 0;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    font-size: 14px;
    color: ${theme.text};
    display: flex;
    align-items: center;
}
.dropdown-item:hover {
    background: ${theme.backgroundSecondary};
}
.dropdown-item.highlighted {
    background: ${theme.primaryGhost};
    color: ${theme.primary};
}
.dropdown-item.selected {
    background: ${theme.primaryGhost};
    color: ${theme.primary};
    font-weight: 500;
    position: relative;
}
.dropdown-item.selected::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 2px;
    height: 16px;
    background: ${theme.primary};
    border-radius: 1px;
    opacity: 0.8;
}
.dropdown-empty {
    padding: 12px;
    color: ${theme.textTertiary};
    font-size: 13px;
    text-align: center;
}
.dropdown-menu::-webkit-scrollbar {
    width: 6px;
}
.dropdown-menu::-webkit-scrollbar-track {
    background: transparent;
}
.dropdown-menu::-webkit-scrollbar-thumb {
    background: ${theme.borderHover};
    border-radius: 3px;
    border: 1px solid ${theme.background};
}
.dropdown-menu::-webkit-scrollbar-thumb:hover {
    background: ${theme.textTertiary};
}
@media (prefers-reduced-motion: reduce) {
    .dropdown-menu {
        animation: none;
    }
    .dropdown-toggle,
    .dropdown-item,
    .dropdown-chevron {
        transition: none;
    }
}
        `}
      </style>

      <div className="dropdown-wrapper" ref={dropdownRef}>
        <button
          type="button"
          className="dropdown-toggle"
          onClick={handleToggle}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span>{displayValue}</span>
          <ChevronDownIcon size={16} className="dropdown-chevron" />
        </button>

        {isOpen && (
          <ul className="dropdown-menu" role="listbox">
            {items.length > 0 ? (
              items.map((item, index) => {
                const isSelected = selectedItem === item;
                const isHighlighted = highlightedIndex === index;
                return (
                  <li
                    key={item[valueField] || index}
                    className={`dropdown-item ${isHighlighted ? "highlighted" : ""} ${isSelected ? "selected" : ""}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => handleMouseEnter(index)}
                  >
                    {renderOptionContent?.(item, isHighlighted, isSelected) ||
                      item[labelField]}
                  </li>
                );
              })
            ) : (
              <li className="dropdown-empty">没有可用选项</li>
            )}
          </ul>
        )}
      </div>
    </>
  );
};

export default Dropdown;
