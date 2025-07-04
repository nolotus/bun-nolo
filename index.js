import { AppRegistry, Platform } from "react-native";
import App from "rn/App";
import MacOSApp from "rn/macos/App";
import { isProduction } from "utils/env";

import { name as appName } from "./app.json";

if (!isProduction) {
  require("./ReactotronConfig");
}

const AppComponent = Platform.OS === "macos" ? MacOSApp : App;

AppRegistry.registerComponent(appName, () => AppComponent);
