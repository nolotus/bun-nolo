// app/i18n/index.ts (修改此文件)

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Language } from "app/i18n/types";
import { i18nConfig } from "./i18n.config"; // <-- 从共享配置导入

i18n.use(initReactI18next).init({
  ...i18nConfig, // <-- 使用共享配置
  lng: Language.ZH_CN, // 客户端可以有一个默认语言
});

export default i18n;
