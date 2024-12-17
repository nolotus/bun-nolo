import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCombobox } from "downshift";
import { FormField } from "render/CommonFormComponents";
import { Label } from "render/form/Label";
import { providerOptions, getModelsByProvider } from "../llm/providers";
import { Model } from "../llm/types";
import { themes, defaultTheme } from "./themes";

interface ModelSelectorProps {
  register: any;
  setValue: any;
  watch: any;
  theme?: keyof typeof themes;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  register,
  setValue,
  watch,
  theme = "blue",
}) => {
  const { t } = useTranslation();
  const provider = watch("provider");
  const [models, setModels] = useState<Model[]>([]);
  const currentTheme = themes[theme] || defaultTheme;

  useEffect(() => {
    const modelsList = getModelsByProvider(provider);
    setModels(modelsList);
    if (modelsList.length > 0) {
      setValue("model", modelsList[0].name);
    }
  }, [provider, setValue]);

  const ProviderSelect = () => {
    const {
      isOpen,
      getMenuProps,
      getInputProps,
      getItemProps,
      getToggleButtonProps,
      selectedItem,
      highlightedIndex,
    } = useCombobox({
      items: providerOptions,
      onSelectedItemChange: ({ selectedItem }) =>
        selectedItem && setValue("provider", selectedItem),
      initialSelectedItem: provider,
      defaultIsOpen: false,
    });

    return (
      <div className="select-container">
        <div className="select-input-container">
          <input
            {...getInputProps()}
            className="select-input"
            readOnly
            value={selectedItem || ""}
          />
          <button
            {...getToggleButtonProps()}
            className={`select-toggle ${isOpen ? "rotate-arrow" : ""}`}
          >
            ▼
          </button>
        </div>
        <ul
          {...getMenuProps()}
          className="select-menu"
          style={{ display: !isOpen ? "none" : undefined }}
        >
          {isOpen &&
            providerOptions.map((item, index) => (
              <li
                {...getItemProps({
                  key: item,
                  index,
                  item,
                  className: `select-option ${
                    highlightedIndex === index ? "highlighted" : ""
                  } ${selectedItem === item ? "selected" : ""}`,
                })}
              >
                {item}
              </li>
            ))}
        </ul>
      </div>
    );
  };

  const ModelSelect = () => {
    const {
      isOpen,
      getMenuProps,
      getInputProps,
      getItemProps,
      getToggleButtonProps,
      selectedItem,
      highlightedIndex,
    } = useCombobox({
      items: models,
      onSelectedItemChange: ({ selectedItem }) =>
        selectedItem && setValue("model", selectedItem.name),
      itemToString: (item) => (item ? item.name : ""),
      defaultIsOpen: false,
    });

    return (
      <div className="select-container">
        <div className="select-input-container">
          <input
            {...getInputProps()}
            className="select-input"
            readOnly
            value={selectedItem ? selectedItem.name : ""}
          />
          <button
            {...getToggleButtonProps()}
            className={`select-toggle ${isOpen ? "rotate-arrow" : ""}`}
          >
            ▼
          </button>
        </div>
        <ul
          {...getMenuProps()}
          className="select-menu"
          style={{ display: !isOpen ? "none" : undefined }}
        >
          {isOpen &&
            models.map((model, index) => (
              <li
                {...getItemProps({
                  key: model.name,
                  index,
                  item: model,
                  className: `select-option ${
                    highlightedIndex === index ? "highlighted" : ""
                  } ${selectedItem === model ? "selected" : ""}`,
                })}
              >
                <div className="model-option">
                  <span className="model-name">{model.name}</span>
                  {model.hasVision && (
                    <span className="vision-badge">{t("supportsVision")}</span>
                  )}
                </div>
              </li>
            ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          .model-selector-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 16px;
          }

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
            border: 1px solid #e2e8f0;
            font-size: 13px;
            font-weight: 500;
            color: #374151;
            background: white;
            cursor: pointer;
            outline: none;
            transition: all 0.15s ease;
          }

          .select-input:focus {
            border-color: ${currentTheme.primary};
            box-shadow: 0 0 0 3.5px ${currentTheme.focus};
          }

          .select-toggle {
            position: absolute;
            right: 8px;
            background: none;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            padding: 4px 8px;
            font-size: 10px;
            transition: transform 0.2s ease;
          }

          .select-toggle.rotate-arrow {
            transform: rotate(180deg);
          }

          .select-menu {
            position: absolute;
            width: 100%;
            background: white;
            margin-top: 4px;
            border-radius: 8px;
            border: 1px solid #f1f5f9;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
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
            color: #374151;
            transition: background-color 0.15s ease;
            margin: 2px 0;
          }

          .select-option:hover {
            background-color: ${currentTheme.primaryBg};
          }

          .select-option.highlighted {
            background-color: ${currentTheme.primaryBg};
          }

          .select-option.selected {
            background-color: ${currentTheme.primary};
            color: white;
          }

          .select-option.selected:hover {
            background-color: ${currentTheme.hover};
          }
          
          .vision-badge {
            display: inline-flex;
            align-items: center;
            font-size: 12px;
            background: ${currentTheme.primaryBg};
            color: ${currentTheme.primary};
            padding: 2px 8px;
            border-radius: 4px;
            margin-left: 8px;
            border: 1px solid ${currentTheme.primaryLight};
            transition: all 0.15s ease;
          }
          
          .model-option {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .model-name {
            font-weight: 500;
            font-size: 13px;
          }
          
          .form-label {
            display: block;
            margin-bottom: 6px;
            font-size: 13px;
            font-weight: 500;
            color: #4b5563;
            letter-spacing: 0.01em;
          }
        `}
      </style>

      <div className="model-selector-container">
        <FormField>
          <Label className="form-label">{t("provider")}</Label>
          <ProviderSelect />
        </FormField>

        <FormField>
          <Label className="form-label">{t("model")}</Label>
          <ModelSelect />
        </FormField>
      </div>
    </>
  );
};

export default ModelSelector;
