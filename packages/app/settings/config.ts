// setting/config.tsx

/**
 * 定义设置页面的路由路径。
 * 这里的路径是相对于 /setting 的基础路径。
 * 例如，SETTING_APPEARANCE 的完整路径是 /setting/appearance
 */
export const SettingRoutePaths = {
  // --- 建议的分组页面 ---

  // 1. 外观设置 (合并了主题、夜间模式、界面定制)
  SETTING_APPEARANCE: "appearance",

  // 2. 账户设置 (保持独立)
  SETTING_ACCOUNT: "user-profile",

  // 3. 编辑器设置 (独立页面)
  SETTING_EDITOR: "editor-config",

  // 4. 聊天设置 (独立页面)
  SETTING_CHAT: "chat-config",

  // 5. 效率工具 (合并了变量和快捷键)
  SETTING_PRODUCTIVITY: "productivity",

  // SETTING 是基础路径，可以重定向到第一个设置页面，例如 'appearance'
  SETTING: "setting",
};

// 可以在设置的侧边栏导航中这样组织：
export const settingNavItems = [
  { path: SettingRoutePaths.SETTING_APPEARANCE, label: "外观" },
  { path: SettingRoutePaths.SETTING_ACCOUNT, label: "账户" },
  { path: SettingRoutePaths.SETTING_EDITOR, label: "编辑器" },
  { path: SettingRoutePaths.SETTING_CHAT, label: "聊天" },
  { path: SettingRoutePaths.SETTING_PRODUCTIVITY, label: "效率" },
];
