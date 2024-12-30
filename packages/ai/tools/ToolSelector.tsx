import type React from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "web/form/Checkbox";
import { FormField } from "web/form/FormField";


export const TOOL_OPTIONS = [
	{ id: "makeAppointment", name: "makeAppointment" },
	{ id: "runCybot", name: "runCybot" },
];


interface ToolSelectorProps {
	register: any;
	label?: string;
}


export const ToolSelector: React.FC<ToolSelectorProps> = ({
	register,
	label,
}) => {
	const { t } = useTranslation();


	return (
		<FormField
			label={label || t("tools")}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "12px",
				}}
			>
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
	);
};


export default ToolSelector;
