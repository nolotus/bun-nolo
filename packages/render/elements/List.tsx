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
    /* 列表基础样式 */
    .custom-list {
      margin: ${theme.space[3]} 0;
      padding-left: ${theme.space[6]};
      color: ${theme.text};
      line-height: 1.6;
    }
    
    /* 嵌套列表更紧凑 */
    .custom-list .custom-list {
      margin: ${theme.space[1]} 0;
      padding-left: ${theme.space[5]};
    }
    
    /* 列表标记用文字颜色 - 保持低调 */
    .custom-list > li::marker {
      color: ${theme.textTertiary};
    }
    
    /* 列表项基础样式 */
    .custom-list-item {
      margin-bottom: ${theme.space[1]};
      line-height: 1.4;
      color: ${theme.text};
    }
    
    /* 任务列表项 */
    .task-list-item {
      list-style-type: none;
      margin-left: -${theme.space[6]};
      padding-left: ${theme.space[6]};
    }
    
    /* 已完成任务 */
    .task-completed {
      opacity: 0.6;
      text-decoration: line-through;
      text-decoration-color: ${theme.textTertiary};
    }
    
    /* 复选框 - 也用文字颜色系 */
    .list-checkbox {
      margin-right: ${theme.space[2]};
      accent-color: ${theme.textSecondary};
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
      <style href="list" precedence="medium">
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

  return (
    <li {...attributes} className={className}>
      {isTaskItem && (
        <input
          type="checkbox"
          checked={element.checked}
          readOnly
          className="list-checkbox"
        />
      )}
      {children}
    </li>
  );
};
