// render/elements/List.tsx
import React, { useMemo } from "react";
import { useTheme } from "app/theme";

type ListProps = {
  attributes: any;
  children: React.ReactNode;
  element: any;
};

// 生成简洁的 CSS 样式
const useListCSS = (theme) => {
  return useMemo(
    () => `
    /* 列表基础样式 - 与文本元素对齐 */
    .custom-list {
      margin: ${theme.space[3]} 0;
      padding: 0;
      padding-left: ${theme.space[4]};
      color: ${theme.text};
      line-height: 1.65;
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 65ch;
    }
    
    /* 嵌套列表样式优化 */
    .custom-list .custom-list {
      margin: ${theme.space[1]} 0;
      padding-left: ${theme.space[3]};
    }
    
    /* 列表项基础样式 */
    .custom-list-item {
      margin-bottom: ${theme.space[1]};
      padding-left: ${theme.space[1]};
      line-height: 1.65;
      color: ${theme.text};
    }
    
    /* 最后一个列表项去除下边距 */
    .custom-list-item:last-child {
      margin-bottom: 0;
    }
    
    /* 任务列表项特殊处理 */
    .task-list-item {
      list-style-type: none;
      margin-left: -${theme.space[4]};
      padding-left: ${theme.space[4]};
      display: flex;
      align-items: flex-start;
      gap: ${theme.space[2]};
    }
    
    /* 已完成任务样式 - 使用中性颜色 */
    .task-completed {
      color: ${theme.textTertiary};
      text-decoration: line-through;
      text-decoration-color: ${theme.textQuaternary};
      text-decoration-thickness: 1px;
    }
    
    /* 复选框样式优化 */
    .list-checkbox {
      margin: 0;
      margin-top: 2px;
      width: 14px;
      height: 14px;
      border-radius: 2px;
      border: 1px solid ${theme.border};
      background: ${theme.background};
      cursor: pointer;
      transition: border-color 0.15s ease;
      flex-shrink: 0;
    }
    
    .list-checkbox:hover {
      border-color: ${theme.textSecondary};
    }
    
    .list-checkbox:checked {
      background: ${theme.textSecondary};
      border-color: ${theme.textSecondary};
    }
    
    /* 任务列表项内容 */
    .task-content {
      flex: 1;
      min-width: 0;
    }
    
    /* 减少段落在列表中的额外间距 */
    .custom-list-item p {
      margin: 0;
    }
    
    .custom-list-item p:not(:last-child) {
      margin-bottom: ${theme.space[1]};
    }
  `,
    [theme]
  );
};

export const List: React.FC<ListProps> = ({
  attributes,
  children,
  element,
}) => {
  const theme = useTheme();
  const listCSS = useListCSS(theme);
  const Tag = element.ordered ? "ol" : "ul";

  return (
    <>
      <Tag {...attributes} className="custom-list">
        {children}
      </Tag>
      <style href="list-elements" precedence="medium">
        {listCSS}
      </style>
    </>
  );
};

export const ListItem: React.FC<ListProps> = ({
  attributes,
  children,
  element,
}) => {
  const isTaskItem = element.checked !== undefined;
  const isCompleted = element.checked === true;

  const className = [
    "custom-list-item",
    isTaskItem && "task-list-item",
    isCompleted && "task-completed",
  ]
    .filter(Boolean)
    .join(" ");

  if (isTaskItem) {
    return (
      <li {...attributes} className={className}>
        <input
          type="checkbox"
          checked={element.checked}
          readOnly
          className="list-checkbox"
        />
        <div className="task-content">{children}</div>
      </li>
    );
  }

  return (
    <li {...attributes} className={className}>
      {children}
    </li>
  );
};
