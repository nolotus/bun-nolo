// urlConfig.js
import { isRNEnvironment, isProduction } from "./env";
const addPrefixForEnv = (url: string) => {
  if (isRNEnvironment()) {
    return `https://nolotus.com${url}`;
  }
  return isProduction ? url : `http://localhost${url}`;
};

export default addPrefixForEnv;
