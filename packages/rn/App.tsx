import type React from "react";
import { StatusBar, useColorScheme } from "react-native";

import "intl-pluralrules";

import i18n from "app/i18n";
import * as RNLocalize from "react-native-localize";
import { Provider } from "react-redux";
import MainNavigation from "./MainNavigation";
import { mobileStore } from "./store";
import { setDarkMode } from "app/theme/themeSlice";
import { rnTokenManager } from "auth/rn/tokenManager";
import { useAppDispatch } from "app/hooks";
import { useEffect } from "react";

global._ISRN_ = true;

function App(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const isDarkMode = useColorScheme() === "dark";

  useEffect(() => {
    const systemLanguage = RNLocalize.getLocales()[0].languageCode;
    i18n.changeLanguage(systemLanguage);
  }, []);

  const init = async () => {
    // dispatch(setTheme(theme));
    const tokens = await rnTokenManager.getTokens();
    dispatch(setDarkMode(isDarkMode)); // if (tokens) {
    //   await dispatch(initAuth(tokens));
    // }
  };
  useEffect(() => {
    init();
  }, []);
  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={"#fff"}
      />
      <MainNavigation />
    </>
  );
}

const AppWrapper = () => (
  <Provider store={mobileStore}>
    <App />
  </Provider>
);

export default AppWrapper;
