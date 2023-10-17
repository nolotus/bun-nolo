import errorMessagesSrc from './errorMessages';
import uiMessagesSrc from './uiMessages';

import {Language} from './types';

const mergeMessages = (errorMessages, uiMessages) => {
  const resources = {};

  for (const key of Object.keys(errorMessages)) {
    resources[key] = {
      ...resources[key],
      translation: {
        ...errorMessages[key]?.translation,
        ...uiMessages[key]?.translation,
      },
    };
  }
  return resources;
};

const mergedResources = mergeMessages(errorMessagesSrc, uiMessagesSrc);

export const resources = {
  [Language.EN]: mergedResources.en,
  [Language.ZH_CN]: mergedResources.zhCN,
  [Language.ZH_HANT]: mergedResources.zhHant,
  [Language.JA]: mergedResources.ja,
};
