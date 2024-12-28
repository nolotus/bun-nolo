import type React from "react";
import { StatusBar, useColorScheme } from "react-native";

import "intl-pluralrules";

import i18n from "i18n";
import * as RNLocalize from "react-native-localize";
import { Provider } from "react-redux";
import MainNavigation from "./MainNavigation";
import { mobileStore } from "./store";

global._ISRN_ = true;
function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === "dark";
  const systemLanguage = RNLocalize.getLocales()[0].languageCode;

  i18n.changeLanguage(systemLanguage);


  return (
    <Provider store={mobileStore}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={"#fff"}
      />
      <MainNavigation />
    </Provider>
  );
}

export default App;
