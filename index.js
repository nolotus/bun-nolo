/**
 * @format
 */

import { AppRegistry } from "react-native";
import App from "rn/App";
import { name as appName } from "./app.json";
import { isProduction } from "utils/env";
if (!isProduction) {
  require("./ReactotronConfig");
}
AppRegistry.registerComponent(appName, () => App);
