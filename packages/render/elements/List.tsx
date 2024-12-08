// elements/List.tsx
import React from "react";
import { RenderElementProps } from "slate-react";

type ListProps = {
  attributes: RenderElementProps["attributes"];
  children: React.ReactNode;
  element: any;
  theme: any;
};

const baseListStyle = {
  margin: "0.3em 0",
  paddingLeft: "1.2em",
} as const;

export const List: React.FC<ListProps> = ({
  attributes,
  children,
  element,
  theme,
}) =>
  element.ordered ? (
    <ol {...attributes} style={{ ...baseListStyle, color: theme.text1 }}>
      {children}
    </ol>
  ) : (
    <ul {...attributes} style={{ ...baseListStyle, color: theme.text1 }}>
      {children}
    </ul>
  );

export const ListItem: React.FC<ListProps> = ({
  attributes,
  children,
  element,
  theme,
}) => (
  <li
    {...attributes}
    style={{
      color: theme.text2,
      lineHeight: 1.3,
      minHeight: "1.3em", // 保证空列表项也有高度
    }}
  >
    {element.checked !== undefined && (
      <input
        type="checkbox"
        checked={element.checked}
        readOnly
        style={{
          marginRight: "0.3em",
          position: "relative",
          top: "1px",
          cursor: "default",
        }}
      />
    )}
    {children}
  </li>
);
