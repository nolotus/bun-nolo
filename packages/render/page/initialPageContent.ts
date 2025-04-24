import { t } from "i18next";
import { HeadingType, ParagraphType } from "create/editor/type";

/**
 * 新页面创建时的初始化内容 (Slate 编辑器格式)
 * 包含标题和引导文案，旨在帮助用户快速上手。
 */
export const getInitialPageContent = (title: string) => {
  return [
    {
      type: HeadingType.H1,
      children: [{ text: title }],
    },
    {
      type: ParagraphType,
      children: [
        {
          text: t("page:introTextWelcome", {
            defaultValue: "👋 欢迎！在这里记录你的灵感与想法吧！",
          }),
        },
      ],
    },
    {
      type: ParagraphType,
      children: [
        {
          text: t("page:introTextTips", {
            defaultValue: "✨ 试试以下快捷方式，高效编辑你的内容：",
          }),
        },
      ],
    },
    {
      type: ParagraphType,
      children: [
        {
          text: t("page:introShortcutH1", {
            defaultValue: "- `#` + 空格：创建大标题",
          }),
        },
      ],
    },
    {
      type: ParagraphType,
      children: [
        {
          text: t("page:introShortcutH2", {
            defaultValue: "- `##` + 空格：创建中标题",
          }),
        },
      ],
    },
    {
      type: ParagraphType,
      children: [
        {
          text: t("page:introShortcutUl", {
            defaultValue: "- `*` + 空格：创建无序列表",
          }),
        },
      ],
    },
    {
      type: ParagraphType,
      children: [
        {
          text: t("page:introShortcutOl", {
            defaultValue: "- `1.` + 空格：创建有序列表",
          }),
        },
      ],
    },
    {
      type: ParagraphType,
      children: [
        {
          text: t("page:introTextMore", {
            defaultValue: "💡 更多功能等你探索，快开始吧！",
          }),
        },
      ],
    },
  ];
};
