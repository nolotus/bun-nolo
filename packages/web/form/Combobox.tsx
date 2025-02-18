import React, { useState } from "react";
import { useCombobox } from "downshift";
import { useTheme } from "app/theme";
import { XIcon } from "@primer/octicons-react";

interface ComboboxProps {
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
  onInputChange?: (value: string) => void;
  allowInput?: boolean;
  allowClear?: boolean;
  error?: boolean;
}

export const Combobox: React.FC<ComboboxProps> = ({
  items = [],
  onChange,
  placeholder = "Select...",
  labelField = "label",
  valueField = "value",
  disabled = false,
  selectedItem,
  renderOptionContent,
  onInputChange,
  allowInput = false,
  allowClear = true,
  error = false,
}) => {
  const theme = useTheme();
  const [inputItems, setInputItems] = useState(items);

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
    selectedItem: internalSelectedItem,
    reset,
  } = useCombobox({
    items: inputItems,
    selectedItem,
    onSelectedItemChange: ({ selectedItem }) => {
      onChange?.(selectedItem);
    },
    itemToString: (item) => (item ? item[labelField] : ""),
    onInputValueChange: ({ inputValue }) => {
      if (allowInput) {
        onInputChange?.(inputValue || "");
      }
      const filteredItems = items.filter((item) =>
        item[labelField].toLowerCase().includes(inputValue?.toLowerCase() || "")
      );
      setInputItems(filteredItems);
    },
  });

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    reset();
    onChange?.(null);
  };

  return (
    <>
      <style>
        {`
.combobox-wrapper {
    position: relative;
    width: 100%;
}
.combobox-input {
    width: 100%;
    height: 36px;
    padding: 8px 12px;
    padding-right: ${allowClear ? "32px" : "12px"};
    border: 1px solid ${error ? theme.error : theme.border};
    border-radius: 6px;
    background: ${theme.background};
    color: ${theme.text};
    font-size: 14px;
    outline: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.15s ease-in-out;
}
.combobox-input::placeholder {
    color: ${theme.placeholder};
}
.combobox-input:hover {
    border-color: ${error ? theme.error : theme.borderHover};
}
.combobox-input:focus {
    border-color: ${error ? theme.error : theme.primary};
    box-shadow: 0 0 0 4px ${error ? `${theme.error}12` : `${theme.primary}12`};
}
.combobox-input:disabled {
    background: ${theme.backgroundSecondary};
    cursor: not-allowed;
    opacity: 0.6;
}
.clear-button {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    padding: 4px;
    color: ${theme.textTertiary};
    background: transparent;
    border: none;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}
.clear-button:hover {
    opacity: 1;
}
.combobox-menu {
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
.combobox-item {
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
.combobox-item:hover {
    background: ${theme.backgroundSecondary};
}
.combobox-item[data-highlighted="true"] {
    background: ${theme.primaryGhost};
    color: ${theme.primary};
}
.combobox-selected {
    background: ${theme.primaryGhost};
    color: ${theme.primary};
    font-weight: 500;
    position: relative;
}
.combobox-selected::before {
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
.combobox-empty {
    padding: 12px;
    color: ${theme.textTertiary};
    font-size: 13px;
    text-align: center;
}
.combobox-menu::-webkit-scrollbar {
    width: 6px;
}
.combobox-menu::-webkit-scrollbar-track {
    background: transparent;
}
.combobox-menu::-webkit-scrollbar-thumb {
    background: ${theme.borderHover};
    border-radius: 3px;
    border: 1px solid ${theme.background};
}
.combobox-menu::-webkit-scrollbar-thumb:hover {
    background: ${theme.textTertiary};
}
@media (prefers-reduced-motion: reduce) {
    .combobox-menu {
        animation: none;
    }
    .combobox-input,
    .combobox-item,
    .clear-button {
        transition: none;
    }
}
        `}
      </style>

      <div className="combobox-wrapper">
        <input
          className="combobox-input"
          {...getInputProps()}
          placeholder={placeholder}
          disabled={disabled}
        />

        {allowClear && internalSelectedItem && !disabled && (
          <button
            type="button"
            className="clear-button"
            onClick={handleClear}
            aria-label="Clear selection"
          >
            <XIcon size={16} />
          </button>
        )}

        {/* 始终渲染菜单容器，并根据 isOpen 控制显示 */}
        <ul
          className="combobox-menu"
          {...getMenuProps()}
          style={{ display: isOpen ? "block" : "none" }}
        >
          {isOpen &&
            (inputItems.length > 0 ? (
              inputItems.map((item, index) => (
                <li
                  className={`combobox-item ${internalSelectedItem === item ? "combobox-selected" : ""}`}
                  key={item[valueField] || index}
                  {...getItemProps({ item, index })}
                  data-highlighted={highlightedIndex === index}
                >
                  {renderOptionContent?.(
                    item,
                    highlightedIndex === index,
                    internalSelectedItem === item
                  ) || item[labelField]}
                </li>
              ))
            ) : (
              <li className="combobox-empty">No results found</li>
            ))}
        </ul>
      </div>
    </>
  );
};

export default Combobox;
