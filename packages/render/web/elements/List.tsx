// render/elements/List.tsx
import React from "react";

type ListProps = {
  attributes: any;
  children: React.ReactNode;
  element: any;
};

// 静态 CSS，全部引用全局 CSS 变量
const listStyles = `
  /* 列表基础样式 */
  .custom-list {
    margin: var(--space-3) 0;
    padding: 0;
    padding-left: var(--space-4);
    color: var(--text);
    line-height: 1.65;
    font-family: system-ui, -apple-system, sans-serif;
    max-width: 65ch;
  }

  /* 嵌套列表样式优化 */
  .custom-list .custom-list {
    margin: var(--space-1) 0;
    padding-left: var(--space-3);
  }

  /* 列表项基础样式 */
  .custom-list-item {
    margin-bottom: var(--space-1);
    padding-left: var(--space-1);
    line-height: 1.65;
    color: var(--text);
  }

  /* 最后一个列表项去除下边距 */
  .custom-list-item:last-child {
    margin-bottom: 0;
  }

  /* 任务列表项特殊处理 */
  .task-list-item {
    list-style-type: none;
    margin-left: calc(-1 * var(--space-4));
    padding-left: var(--space-4);
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
  }

  /* 已完成任务样式 */
  .task-completed {
    color: var(--textTertiary);
    text-decoration: line-through;
    text-decoration-color: var(--textQuaternary);
    text-decoration-thickness: 1px;
  }

  /* 复选框样式 */
  .list-checkbox {
    margin: 0;
    margin-top: 2px;
    width: 14px;
    height: 14px;
    border-radius: 2px;
    border: 1px solid var(--border);
    background: var(--background);
    cursor: pointer;
    transition: border-color 0.15s ease;
    flex-shrink: 0;
  }
  .list-checkbox:hover {
    border-color: var(--textSecondary);
  }
  .list-checkbox:checked {
    background: var(--textSecondary);
    border-color: var(--textSecondary);
  }

  /* 任务列表内容区域 */
  .task-content {
    flex: 1;
    min-width: 0;
  }

  /* 减少段落在列表中的额外间距 */
  .custom-list-item p {
    margin: 0;
  }
  .custom-list-item p:not(:last-child) {
    margin-bottom: var(--space-1);
  }
`;

export const List: React.FC<ListProps> = ({
  attributes,
  children,
  element,
}) => {
  const Tag = element.ordered ? "ol" : "ul";
  return (
    <>
      <Tag {...attributes} className="custom-list">
        {children}
      </Tag>
      <style href="list-elements" precedence="medium">
        {listStyles}
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
