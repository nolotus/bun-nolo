import { CheckIcon, ChevronDownIcon } from "@primer/octicons-react";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import { useCombobox } from "downshift";
import type React from "react";
import { useEffect, useState } from "react";

interface SelectOption {
  name: string;
  hasVision?: boolean;
}

interface SelectProps {
  items: SelectOption[];
  selectedItem: SelectOption | undefined;
  onSelectedItemChange: (item: SelectOption) => void;
  itemToString: (item: SelectOption | null) => string;
  renderOptionContent?: (
    item: SelectOption,
    isHighlighted: boolean,
    isSelected: boolean,
  ) => React.ReactNode;
  placeholder?: string;
  allowInput?: boolean;
  onInputChange?: (value: string) => void;
}

const Select: React.FC<SelectProps> = ({
  items,
  selectedItem,
  onSelectedItemChange,
  itemToString,
  renderOptionContent,
  placeholder,
  allowInput = false,
  onInputChange,
}) => {
  const theme = useAppSelector(selectTheme)
  const [inputValue, setInputValue] = useState<string>("");
  const [filteredItems, setFilteredItems] = useState<SelectOption[]>(items);

  useEffect(() => {
    // 当 items 改变时，重置 filteredItems 为所有 items
    setFilteredItems(items);
  }, [items]);

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    getToggleButtonProps,
    highlightedIndex,
    setInputValue: setDownshiftInputValue,
    closeMenu,
  } = useCombobox({
    items: filteredItems,
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        onSelectedItemChange(selectedItem);
        setInputValue(selectedItem.name);
        setDownshiftInputValue(selectedItem.name);
      }
    },
    itemToString,
    initialSelectedItem: selectedItem,
    defaultIsOpen: false,
    onInputValueChange: ({ inputValue }) => {
      if (allowInput) {
        setInputValue(inputValue);
        setDownshiftInputValue(inputValue);
        if (onInputChange) onInputChange(inputValue);

        let newFilteredItems = items;
        if (inputValue.trim() !== "") {
          newFilteredItems = items.filter((item) =>
            item.name.toLowerCase().includes(inputValue.toLowerCase()),
          );
        }

        // 更新过滤后的列表
        setFilteredItems(newFilteredItems);

        // 如果没有匹配项，则关闭菜单
        if (newFilteredItems.length === 0 && inputValue.trim() !== "") {
          closeMenu();
        }
      }
    },
  });

  const renderDefaultOptionContent = (
    item: SelectOption,
    isHighlighted: boolean,
    isSelected: boolean,
  ) => (
    <div className="model-option">
      <span className="model-name">{item.name}</span>
      <div className="model-indicators">
        {item.hasVision && <span className="vision-badge">支持视觉</span>}
        {isSelected && <CheckIcon size={16} className="check-icon" />}
      </div>
    </div>
  );

  const optionContentRenderer =
    renderOptionContent || renderDefaultOptionContent;

  return (
    <div className="select-container">
      <div className="select-input-container">
        <input
          {...getInputProps({
            onKeyDown: (event) => {
              if (event.key === "Enter") {
                event.preventDefault();
              }
            },
            onChange: (e) => {
              if (!allowInput) {
                e.preventDefault();
              }
            },
          })}
          className="select-input"
          value={
            allowInput
              ? inputValue
              : selectedItem
                ? itemToString(selectedItem)
                : placeholder || ""
          }
          readOnly={!allowInput}
        />
        <button
          type="button"
          {...getToggleButtonProps()}
          className={`select-toggle ${isOpen ? "rotate-arrow" : ""}`}
        >
          <ChevronDownIcon size={16} />
        </button>
      </div>
      <ul
        {...getMenuProps()}
        className="select-menu"
        style={{
          display:
            !isOpen || (inputValue.trim() !== "" && filteredItems.length === 0)
              ? "none"
              : undefined,
        }}
      >
        {isOpen &&
          filteredItems.map((item, index) => (
            <li
              {...getItemProps({
                key: item.name,
                index,
                item,
                className: `select-option ${highlightedIndex === index ? "highlighted" : ""
                  } ${selectedItem === item ? "selected" : ""}`,
              })}
            >
              {optionContentRenderer(
                item,
                highlightedIndex === index,
                selectedItem === item,
              )}
            </li>
          ))}
      </ul>
      <style href="select">
        {`
          .select-container {
            position: relative;
            width: 100%;
          }

          .select-input-container {
            position: relative;
            display: flex;
            align-items: center;
          }

          .select-input {
            width: 100%;
            height: 40px;
            padding: 0 12px;
            border-radius: 8px;
            border: 1px solid ${theme.border};
            font-size: 13px;
            font-weight: 500;
            color: ${theme.text};
            background: ${theme.background};
            cursor: pointer;
            outline: none;
            transition: all 0.15s ease;
          }

          .select-input:focus {
            border-color: ${theme.primary};
            box-shadow: 0 0 0 3.5px ${theme.focus};
          }

          .select-toggle {
            position: absolute;
            right: 8px;
            background: none;
            border: none;
            color: ${theme.placeholder};
            cursor: pointer;
            padding: 4px 8px;
            display: flex;
            align-items: center;
            transition: transform 0.2s ease;
          }

          .select-toggle.rotate-arrow {
            transform: rotate(180deg);
          }

          .select-menu {
            position: absolute;
            width: 100%;
            background: ${theme.background};
            margin-top: 4px;
            border-radius: 8px;
            border: 1px solid ${theme.border};
            box-shadow: 0 4px 8px ${theme.shadowLight};
            z-index: 10;
            padding: 6px;
            list-style: none;
          }

          .select-option {
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            color: ${theme.text};
            transition: background-color 0.15s ease;
            margin: 2px 0;
          }

          .select-option:hover {
            background-color: ${theme.primaryBg};
          }

          .select-option.highlighted {
            background-color: ${theme.primaryBg};
          }

          .select-option.selected {
            background-color: ${theme.primary};
            color: white;
          }

          .select-option.selected:hover {
            background-color: ${theme.hover};
          }
          
          .vision-badge {
            display: inline-flex;
            align-items: center;
            font-size: 12px;
            background: ${theme.primaryBg};
            color: ${theme.primary};
            padding: 2px 8px;
            border-radius: 4px;
            margin-left: 8px;
            border: 1px solid ${theme.primaryLight};
            transition: all 0.15s ease;
          }
          
          .model-option {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .model-indicators {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .model-name {
            font-weight: 500;
            font-size: 13px;
          }
          
          .option-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
          }

          .check-icon {
            color: ${theme.background};
          }

          .select-option:not(.selected) .check-icon {
            color: ${theme.primary};
          }
        `}
      </style>
    </div>
  );
};

export default Select;
