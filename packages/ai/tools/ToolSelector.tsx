// ai/tools/ToolSelector.tsx
import type React from "react";
import { useTranslation } from "react-i18next";
import { FormField } from "render/form/FormField";

import { Label } from "render/form/Label";

export const TOOL_OPTIONS = [
	{ id: "makeAppointment", name: "makeAppointment" },
	{ id: "runCybot", name: "runCybot" },
];

interface ToolSelectorProps {
	register: any;
	label?: string;
	containerStyle?: React.CSSProperties;
	labelStyle?: React.CSSProperties;
	inputContainerStyle?: React.CSSProperties;
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({
	register,
	label,
	containerStyle,
	labelStyle,
	inputContainerStyle,
}) => {
	const { t } = useTranslation();

	return (
		<FormField style={containerStyle}>
			<Label style={labelStyle}>{label || t("tools")}:</Label>
			<div style={inputContainerStyle}>
				{TOOL_OPTIONS.map((tool) => (
					<div key={tool.id} style={{ marginBottom: "8px" }}>
						<input
							type="checkbox"
							id={`tool-${tool.id}`}
							value={tool.id}
							{...register("tools")}
						/>
						<label htmlFor={`tool-${tool.id}`} style={{ marginLeft: "8px" }}>
							{t(tool.name)}
						</label>
					</div>
				))}
			</div>
		</FormField>
	);
};

export default ToolSelector;
