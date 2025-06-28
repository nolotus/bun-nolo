// 基础元素类型常量
export const ParagraphType = "paragraph";
export const CodeBlockType = "code-block";
export const CodeLineType = "code-line";
export const QuoteType = "quote";
export const ThematicBreakType = "thematic-break";

// 列表相关类型
export const ListType = "list";
export const ListItemType = "list-item";

// 表格相关类型
export const TableType = "table";
export const TableRowType = "table-row";
export const TableCellType = "table-cell";

// 格式化文本类型
type FormattedText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
};

// 标题类型枚举
export enum HeadingType {
  H1 = "heading-one",
  H2 = "heading-two",
  H3 = "heading-three",
  H4 = "heading-four",
  H5 = "heading-five",
  H6 = "heading-six",
}

// 链接元素类型
export type LinkElement = {
  type: "link";
  url: string;
  children: FormattedText[];
};

// 文本块元素类型
export type TextBlockElement = {
  type:
    | HeadingType
    | typeof ParagraphType
    | typeof QuoteType
    | typeof ThematicBreakType;
  align?: "left" | "center" | "right" | "justify";
  isNested?: boolean;
  cite?: string; // 用于引用块
  children: FormattedText[];
};

// 列表元素类型
export type ListElement = {
  type: typeof ListType;
  ordered?: boolean;
  children: ListItemElement[];
};

export type ListItemElement = {
  type: typeof ListItemType;
  checked?: boolean; // 用于任务列表
  children: (FormattedText | TextBlockElement)[];
};

// 表格元素类型
export type TableElement = {
  type: typeof TableType;
  children: TableRowElement[];
};

export type TableRowElement = {
  type: typeof TableRowType;
  children: TableCellElement[];
};

export type TableCellElement = {
  type: typeof TableCellType;
  header?: boolean;
  children: FormattedText[];
};

// 代码块元素类型
export type CodeBlockElement = {
  type: typeof CodeBlockType;
  language?: string;
  children: CodeLineElement[];
};

export type CodeLineElement = {
  type: typeof CodeLineType;
  children: FormattedText[];
};

// 统一的元素类型联合
export type Element =
  | TextBlockElement
  | ListElement
  | ListItemElement
  | TableElement
  | TableRowElement
  | TableCellElement
  | CodeBlockElement
  | CodeLineElement
  | LinkElement;
