import { mapLanguage } from "i18n/mapLanuage"; // Adjust the import based on your folder structure

export const createPromotMessage = (config: any) => {
  const { name, description, knowledge, responseLanguage } = config;
  const mappedLanguage = mapLanguage(responseLanguage);

  const nameSection = name ? `Your name is ${name}. ` : "";
  const knowledgeSection = knowledge ? `You have mastered ${knowledge}. ` : "";
  const descriptionSection = description
    ? `For inquiries related to ${description}, `
    : "";

  const languageSection = mappedLanguage
    ? `Response Language: ${mappedLanguage}`
    : "";

  const content = `${nameSection}${knowledgeSection}${descriptionSection}${languageSection}`;

  return { role: "system", content };
};
