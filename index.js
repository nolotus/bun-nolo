import { AppRegistry } from "react-native";
import App from "./App";
import { isProduction } from "utils/env";

import { name as appName } from "./app.json";

if (!isProduction) {
  require("./ReactotronConfig");
}

AppRegistry.registerComponent(appName, () => App);
