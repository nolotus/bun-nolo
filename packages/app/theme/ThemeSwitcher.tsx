// components/ThemeSwitcher.tsx

import { selectTheme, setTheme } from "app/theme/themeSlice";
import type React from "react";
import { useDispatch, useSelector } from "react-redux";

const themes = [
	{ name: "light", label: "Light" },
	{ name: "dark", label: "Dark" },
	{ name: "dim", label: "Dim" },
	{ name: "darker", label: "Darker" },
];

const ThemeSwitcher: React.FC = () => {
	const dispatch = useDispatch();
	const currentTheme = useSelector(selectTheme);

	const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		dispatch(setTheme(e.target.value));
	};

	return (
		<div>
			<label htmlFor="theme-select">Choose a theme: </label>
			<select
				id="theme-select"
				value={currentTheme.themeName}
				onChange={handleThemeChange}
			>
				{themes.map((theme) => (
					<option key={theme.name} value={theme.name}>
						{theme.label}
					</option>
				))}
			</select>
		</div>
	);
};

export default ThemeSwitcher;
