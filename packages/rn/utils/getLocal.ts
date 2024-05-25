import * as RNLocalize from "react-native-localize";

export const getLocal = () => {
  const deviceLanguage = RNLocalize.getLocales()[0].languageCode;
  const deviceCountry = RNLocalize.getCountry(); // 'US', 'CN' 等
  const locale = `${deviceLanguage}-${deviceCountry}`;
  return locale;
};
