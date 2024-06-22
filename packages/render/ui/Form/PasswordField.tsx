import React from "react";

import { FieldProps } from "./type";
import { getInputClassName } from "app/styles/form";

export const PasswordField: React.FC<FieldProps> = ({ id, register, icon }) => (
	<div className="relative">
		{icon && (
			<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
				{icon}
			</div>
		)}
		<input
			type="password"
			id={id}
			{...register(id)}
			className={getInputClassName(!!icon)}
			required
		/>
	</div>
);
