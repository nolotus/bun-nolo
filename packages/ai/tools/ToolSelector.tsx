import type React from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "render/form/Checkbox";
import { FormField } from "render/form/FormField";
import { Label } from "render/form/Label";
import { defaultTheme } from "render/styles/colors";

export const TOOL_OPTIONS = [
	{ id: "makeAppointment", name: "makeAppointment" },
	{ id: "runCybot", name: "runCybot" },
];

interface ToolSelectorProps {
	register: any;
	label?: string;
	containerClassName?: string;
	labelClassName?: string;
	inputClassName?: string;
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({
	register,
	label,
	containerClassName,
	labelClassName,
	inputClassName,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<style>
				{`
          .checkbox-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .tool-label {
            display: block;
            margin-bottom: 6px;
            font-size: 13px;
            font-weight: 500;
            color: ${defaultTheme.textSecondary};
            letter-spacing: 0.01em;
          }
        `}
			</style>

			<FormField className={containerClassName}>
				<Label className={`tool-label ${labelClassName}`}>
					{label || t("tools")}
				</Label>
				<div className={`checkbox-container ${inputClassName}`}>
					{TOOL_OPTIONS.map((tool) => (
						<Checkbox
							key={tool.id}
							id={`tool-${tool.id}`}
							label={t(tool.name)}
							{...register("tools")}
							value={tool.id}
						/>
					))}
				</div>
			</FormField>
		</>
	);
};

export default ToolSelector;
