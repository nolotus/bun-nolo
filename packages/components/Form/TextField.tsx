import React from "react";

import { FieldProps } from "./type";
import { getInputClassName } from "app/styles/form";
export const TextField: React.FC<FieldProps> = ({
	id,
	register,
	optional,
	readOnly,
	defaultValue,
	icon,
}) => (
	<div className="relative">
		{icon && (
			<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
				{icon}
			</div>
		)}
		<input
			type="text"
			id={id}
			{...register(id, {
				required: !optional,
			})}
			className={getInputClassName(!!icon)}
			readOnly={readOnly}
			defaultValue={defaultValue}
		/>
	</div>
);
