export const getInputClassName = (hasIcon: boolean) =>
	`w-full p-2 border rounded focus:outline-none focus:border-blue-500 ${
		hasIcon ? "pl-10" : "pl-2"
	}`;
