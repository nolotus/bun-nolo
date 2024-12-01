// renderElements.tsx
import React from "react";
import { RenderElementProps } from "slate-react";
import { CodeBlock } from "./elements/Code";
import { Table, TableRow, TableCell } from "./elements/Table";
import { List, ListItem } from "./elements/List";

export const renderElement = (
  props: RenderElementProps & {
    isDarkMode?: boolean;
    theme?;
  },
) => {
  const { element, children, attributes, isDarkMode, theme } = props;

  switch (element.type) {
    case "paragraph":
      return <p {...attributes}>{children}</p>;

    case "heading-1":
      return <h1 {...attributes}>{children}</h1>;

    case "heading-2":
      return <h2 {...attributes}>{children}</h2>;

    case "heading-3":
      return <h3 {...attributes}>{children}</h3>;

    case "quote":
      return <blockquote {...attributes}>{children}</blockquote>;

    case "code-block":
      return (
        <CodeBlock
          attributes={attributes}
          element={element}
          isDarkMode={isDarkMode}
        >
          {children}
        </CodeBlock>
      );

    case "code-inline":
      return <code {...attributes}>{children}</code>;

    case "link":
      return (
        <a href={element.url} {...attributes}>
          {children}
        </a>
      );

    case "image":
      return (
        <img
          src={element.url}
          alt={element.alt || ""}
          title={element.title}
          {...attributes}
        />
      );

    case "list":
      return (
        <List attributes={attributes} element={element} theme={theme}>
          {children}
        </List>
      );

    case "list-item":
      return (
        <ListItem attributes={attributes} element={element} theme={theme}>
          {children}
        </ListItem>
      );

    case "table":
      return (
        <Table attributes={attributes} theme={theme}>
          {children}
        </Table>
      );

    case "table-row":
      return (
        <TableRow attributes={attributes} theme={theme}>
          {children}
        </TableRow>
      );

    case "table-cell":
      return (
        <TableCell attributes={attributes} element={element} theme={theme}>
          {children}
        </TableCell>
      );

    case "thematic-break":
      return <hr {...attributes} />;

    case "html-block":
    case "html-inline":
      return (
        <div
          {...attributes}
          dangerouslySetInnerHTML={{ __html: element.html }}
        />
      );

    default:
      return <p {...attributes}>{children}</p>;
  }
};
