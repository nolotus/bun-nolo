export const languageMap = {
  'en-US': 'English',
  'zh-CN': 'Simplified Chinese',
  'zh-TW': 'Traditional Chinese',
  'ja-JP': 'Japanese',
  // Add more mappings as needed
};

export const mapLanguage = (responseLanguage: string) => {
  return languageMap[responseLanguage] || responseLanguage;
};
