import { EyeClosedIcon, EyeIcon } from "@primer/octicons-react";
import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	baseInputStyle,
	baseStyles,
	containerStyle,
	iconBaseStyle,
} from "render/styles/input";
import { getLogger } from "utils/logger";
// new style
import { TextField } from "./TextField";

const capitalizeFirstLetter = (string) => {
	return string.charAt(0).toUpperCase() + string.slice(1);
};

const i18nLogger = getLogger("i18n");

export const FormField: React.FC = ({
	id,
	type,
	register,
	errors,
	label,
	options,
	readOnly,
	optional,
	defaultValue,
	className,
	icon,
}) => {
	const { t } = useTranslation();
	const translatedLabel = capitalizeFirstLetter(t(label));
	i18nLogger.info({ label, translatedLabel }, "Translated label");

	const [showPassword, setShowPassword] = useState(false);

	let FieldComponent;
	switch (type) {
		case "string":
			FieldComponent = (
				<TextField
					id={id}
					optional={optional}
					register={register}
					label={translatedLabel}
					readOnly={readOnly}
					defaultValue={defaultValue}
					icon={icon}
				/>
			);
			break;

		case "password":
			FieldComponent = (
				<div style={containerStyle}>
					<style>{baseStyles}</style>

					{icon && <div style={{ ...iconBaseStyle, left: "12px" }}>{icon}</div>}

					<input
						type={showPassword ? "text" : "password"}
						id={id}
						className="input-field"
						placeholder="Enter password"
						{...register(id)}
						style={{
							...baseInputStyle,
							padding: `0 ${icon ? "42px" : "12px"}`,
						}}
						required
					/>

					<div
						onClick={() => setShowPassword(!showPassword)}
						style={{
							...iconBaseStyle,
							right: "12px",
							cursor: "pointer",
							padding: "8px",
						}}
					>
						{showPassword ? <EyeClosedIcon size={20} /> : <EyeIcon size={20} />}
					</div>
				</div>
			);
			break;

		default:
			FieldComponent = null;
	}

	return (
		<div className={className}>
			<div>{FieldComponent}</div>
			{errors && errors[id] && (
				<p className="mt-2 text-xs text-red-500">
					{String(errors[id].message)}
				</p>
			)}
		</div>
	);
};
