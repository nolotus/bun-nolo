import { mapLanguage } from "i18n/mapLanuage";

export const createPromotMessage = (config) => {
  const { name, responseLanguage, prompt, model } = config;
  console.log("config", config);
  const mappedLanguage = mapLanguage(responseLanguage);

  const nameSection = name ? `Your name is ${name}. ` : "";
  const languageSection = mappedLanguage
    ? `Response Language: ${mappedLanguage}. `
    : "";

  const instruction = "Please follow the instructions below ";
  const content = `${nameSection}${languageSection}${instruction} ${prompt}`;

  const role = model === "o1-mini" ? "user" : "system";

  return {
    role,
    content,
  };
};
