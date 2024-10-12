import { mapLanguage } from "i18n/mapLanuage";

export const createPromotMessage = (config) => {
  const { name, responseLanguage, prompt } = config;
  const mappedLanguage = mapLanguage(responseLanguage);

  const nameSection = name ? `Your name is ${name}. ` : "";
  const languageSection = mappedLanguage
    ? `Response Language: ${mappedLanguage}. `
    : "";

  const instruction = "Please follow the instructions below ";
  const content = `${nameSection}${languageSection}${instruction} ${prompt}`;

  return {
    role: "system",
    content,
  };
};
