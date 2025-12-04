// ./theme/prism/index.ts

import { defaultCss } from "./default";
import { okaidia } from "./okaidia";
import { githubLight } from "./githubLight";
import { githubDark } from "./githubDark";

// 主题映射表
export const PRISM_CODE_THEMES: Record<string, string> = {
  default: defaultCss,
  okaidia,
  "github-light": githubLight,
  "github-dark": githubDark,

  // 如果之前老代码里已经使用 "github-dark" 映射到 okaidia，
  // 你也可以保留一条兼容映射：
  //
  // "legacy-github-dark": okaidia,
};

// 根据名称获取 CSS（带默认回退）
export const getPrismThemeCss = (name?: string): string =>
  PRISM_CODE_THEMES[name ?? "default"] ?? PRISM_CODE_THEMES["default"];
