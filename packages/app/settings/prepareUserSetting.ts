export function prepareUserSettings(locale) {
  return {
    theme: "system",
    language: locale,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
