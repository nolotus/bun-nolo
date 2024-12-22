import { CheckIcon, ChevronDownIcon } from "@primer/octicons-react";
import { useCombobox } from "downshift";
import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FormField } from "render/form/FormField";
import { Label } from "render/form/Label";
import { defaultTheme } from "render/styles/colors";

import { getModelsByProvider, providerOptions } from "../llm/providers";
import type { Model } from "../llm/types";

interface ModelSelectorProps {
	register: any;
	setValue: any;
	watch: any;
	errors: any;
	theme?: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
	register,
	setValue,
	watch,
	errors,
}) => {
	const { t } = useTranslation();
	const provider = watch("provider");
	const [models, setModels] = useState<Model[]>([]);

	useEffect(() => {
		const modelsList = getModelsByProvider(provider);
		setModels(modelsList);
		if (modelsList.length > 0) {
			setValue("model", modelsList[0].name);
		}
	}, [provider, setValue]);

	const renderError = (field: string) => {
		return errors[field] ? (
			<div style={{ color: "red", marginTop: "4px", fontSize: "12px" }}>
				{errors[field].message}
			</div>
		) : null;
	};

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
						{...getInputProps({
							onKeyDown: (event) => {
								if (event.key === "Enter") {
									event.preventDefault(); // 阻止Enter键的默认提交行为
								}
							},
						})}
						className="select-input"
						readOnly
						value={selectedItem || ""}
					/>
					<button
						type="button" // 确保这是一个普通按钮，而不是提交按钮
						{...getToggleButtonProps()}
						className={`select-toggle ${isOpen ? "rotate-arrow" : ""}`}
					>
						<ChevronDownIcon size={16} />
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
									key: `${item}-${index}`,
									index,
									item,
									className: `select-option ${
										highlightedIndex === index ? "highlighted" : ""
									} ${selectedItem === item ? "selected" : ""}`,
								})}
							>
								<span className="option-content">
									{item}
									{selectedItem === item && (
										<CheckIcon size={16} className="check-icon" />
									)}
								</span>
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
						{...getInputProps({
							onKeyDown: (event) => {
								if (event.key === "Enter") {
									event.preventDefault(); // 阻止Enter键的默认提交行为
								}
							},
						})}
						className="select-input"
						readOnly
						value={selectedItem ? selectedItem.name : ""}
					/>
					<button
						type="button" // 确保这是一个普通按钮，而不是提交按钮
						{...getToggleButtonProps()}
						className={`select-toggle ${isOpen ? "rotate-arrow" : ""}`}
					>
						<ChevronDownIcon size={16} />
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
									<div className="model-indicators">
										{model.hasVision && (
											<span className="vision-badge">
												{t("supportsVision")}
											</span>
										)}
										{selectedItem === model && (
											<CheckIcon size={16} className="check-icon" />
										)}
									</div>
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
            border: 1px solid ${defaultTheme.border};
            font-size: 13px;
            font-weight: 500;
            color: ${defaultTheme.text};
            background: ${defaultTheme.background};
            cursor: pointer;
            outline: none;
            transition: all 0.15s ease;
          }

          .select-input:focus {
            border-color: ${defaultTheme.primary};
            box-shadow: 0 0 0 3.5px ${defaultTheme.focus};
          }

          .select-toggle {
            position: absolute;
            right: 8px;
            background: none;
            border: none;
            color: ${defaultTheme.placeholder};
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
            background: ${defaultTheme.background};
            margin-top: 4px;
            border-radius: 8px;
            border: 1px solid ${defaultTheme.border};
            box-shadow: 0 4px 8px ${defaultTheme.shadowLight};
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
            color: ${defaultTheme.text};
            transition: background-color 0.15s ease;
            margin: 2px 0;
          }

          .select-option:hover {
            background-color: ${defaultTheme.primaryBg};
          }

          .select-option.highlighted {
            background-color: ${defaultTheme.primaryBg};
          }

          .select-option.selected {
            background-color: ${defaultTheme.primary};
            color: white;
          }

          .select-option.selected:hover {
            background-color: ${defaultTheme.hover};
          }
          
          .vision-badge {
            display: inline-flex;
            align-items: center;
            font-size: 12px;
            background: ${defaultTheme.primaryBg};
            color: ${defaultTheme.primary};
            padding: 2px 8px;
            border-radius: 4px;
            margin-left: 8px;
            border: 1px solid ${defaultTheme.primaryLight};
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
          
          .form-label {
            display: block;
            margin-bottom: 6px;
            font-size: 13px;
            font-weight: 500;
            color: ${defaultTheme.textSecondary};
            letter-spacing: 0.01em;
          }

          .option-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
          }

          .check-icon {
            color: ${defaultTheme.background};
          }

          .select-option:not(.selected) .check-icon {
            color: ${defaultTheme.primary};
          }
        `}
			</style>

			<div className="model-selector-container">
				<FormField>
					<Label className="form-label">{t("provider")}</Label>
					<ProviderSelect />
					{renderError("provider")}
				</FormField>

				<FormField>
					<Label className="form-label">{t("model")}</Label>
					<ModelSelect />
					{renderError("model")}
				</FormField>
			</div>
		</>
	);
};

export default ModelSelector;
