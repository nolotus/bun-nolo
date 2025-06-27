// app/i18n/i18n.server.ts (新建文件)

import i18n from "i18next";
import { i18nConfig } from "./i18n.config"; // <-- 从同一个共享配置导入

// 创建一个独立的 i18next 实例供服务器使用
const i18nServer = i18n.createInstance();

// 初始化服务器实例
// 注意：这里不使用 .use(initReactI18next)
i18nServer.init(i18nConfig);

export default i18nServer;
