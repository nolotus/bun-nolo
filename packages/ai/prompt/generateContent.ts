import { mapLanguage } from "i18n/mapLanuage";

//todo prompt will change to user difine
export const generatePrompt = (
	prompt: string,
	name?: string,
	responseLanguage?: string,
): string => {
	const mappedLanguage = mapLanguage(responseLanguage);

	const nameSection = name ? `Your name is ${name}. ` : "";
	const languageSection = mappedLanguage
		? `Response Language: ${mappedLanguage}. `
		: "";

	const instruction = "Please follow the instructions below ";
	return `${nameSection}${languageSection}${instruction} ${prompt}`;
};
