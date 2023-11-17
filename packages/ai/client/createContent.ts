import { mapLanguage } from 'i18n/mapLanuage'; // Adjust the import based on your folder structure

export const createContent = (config: any) => {
  const { name, description, replyRule, knowledge, responseLanguage } = config;
  const mappedLanguage = mapLanguage(responseLanguage);

  const nameSection = name ? `Your name is ${name}. ` : '';
  const knowledgeSection = knowledge ? `You have mastered ${knowledge}. ` : '';
  const descriptionSection = description
    ? `For inquiries related to ${description}, `
    : '';
  const replyRuleSection = replyRule
    ? `adhere to these reply guidelines: ${replyRule}. `
    : '';
  const languageSection = mappedLanguage
    ? `Response Language: ${mappedLanguage}`
    : '';

  return `${nameSection}${knowledgeSection}${descriptionSection}${replyRuleSection}${languageSection}`;
};
