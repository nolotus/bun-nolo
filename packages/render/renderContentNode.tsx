import React, { ReactNode } from 'react';
import { isDevelopment } from 'utils/env';

import Blockquote from './blocks/Blockquote';
import Card from './blocks/Card';
import Code from './blocks/Code';
import Emphasis from './blocks/Emphasis';
import Heading from './blocks/Heading';
import Image from './blocks/Image';
import InlineCode from './blocks/InlineCode';
import Italics from './blocks/Italics';
import Link from './blocks/Link';
import List from './blocks/List';
import ListItem from './blocks/ListItem';
import Paragraph from './blocks/Paragraph';
import Section from './blocks/Section';
import Strikethrough from './blocks/Strikethrough';
import Strong from './blocks/Strong';
import Table from './blocks/Table';
import TableCell from './blocks/TableCell';
import TableRow from './blocks/TableRow';
import TaskList from './blocks/TaskList';
import TaskListItem from './blocks/TaskListItem';
import Yaml from './blocks/Yaml';
interface ContentNode {
  type: string;
  children?: ContentNode[];
  value?: string;
  className?: string;
  [key: string]: any; // 用于捕获其他所有属性
}
interface RenderOptions {
  enableClassName?: boolean;
  debug?: boolean;
}
export const renderContentNode = (
  node: ContentNode,
  options: RenderOptions = {},
): ReactNode => {
  const { enableClassName = isDevelopment, debug = isDevelopment } = options;

  const classNames = enableClassName ? node.className : undefined;
  const renderChild = (child: ContentNode) => renderContentNode(child);

  switch (node.type) {
    case 'root':
      return <>{node.children?.map(renderChild)}</>;
    case 'card':
      return <Card>{node.children?.map(renderChild)}</Card>;
    case 'heading':
      return (
        <Heading level={node.depth} className={classNames}>
          {node.children?.map(renderChild)}
        </Heading>
      );
    case 'text':
      return node.value;
    case 'list':
      return (
        <List ordered={node.ordered} className={classNames}>
          {node.children?.map(renderChild)}
        </List>
      );
    case 'listItem':
      return (
        <ListItem className={classNames}>
          {node.children?.map((child: ContentNode) => {
            if (child.type === 'paragraph') {
              return (child.children || []).map((innerChild: ContentNode) =>
                renderContentNode(innerChild),
              );
            }
            return renderContentNode(child);
          })}
        </ListItem>
      );

    case 'paragraph':
      return (
        <Paragraph className={classNames}>
          {node.children?.map(renderChild)}
        </Paragraph>
      );
    case 'strong':
      return (
        <Strong className={classNames}>
          {node.children?.map(renderChild)}
        </Strong>
      );
    case 'link':
      return (
        <Link href={node.url} className={classNames}>
          {node.children?.map(renderChild)}
        </Link>
      );
    case 'image':
      return <Image src={node.url} alt={node.alt} className={classNames} />;
    case 'blockquote':
      return (
        <Blockquote className={classNames}>
          {node.children?.map(renderChild)}
        </Blockquote>
      );
    case 'code':
      return (
        <Code className={classNames} language={node.lang} value={node.value} />
      );
    case 'table':
      return (
        <Table className={classNames}>{node.children?.map(renderChild)}</Table>
      );
    case 'tableRow':
      return (
        <TableRow className={classNames}>
          {node.children?.map(renderChild)}
        </TableRow>
      );
    case 'tableCell':
      return (
        <TableCell className={classNames}>
          {node.children?.map(renderChild)}
        </TableCell>
      );
    case 'inlineCode':
      return <InlineCode className={classNames} value={node.value} />;
    case 'section':
      return (
        <Section className={classNames} title={node.title}>
          {node.children?.map(renderChild)}
        </Section>
      );

    case 'emphasis':
      return (
        <Emphasis className={classNames}>
          {node.children?.map(renderChild)}
        </Emphasis>
      );

    case 'italics':
      return (
        <Italics className={classNames}>
          {node.children?.map(renderChild)}
        </Italics>
      );

    case 'taskList':
      return (
        <TaskList className={classNames}>
          {node.children?.map(renderChild)}
        </TaskList>
      );

    case 'taskListItem':
      return (
        <TaskListItem className={classNames} checked={node.checked}>
          {node.children?.map(renderChild)}
        </TaskListItem>
      );
    case 'yaml':
      return <Yaml value={node.value} />;
    // case 'json': {
    //   const str = `{${node.value}}`;
    //   console.log('str', node.value);
    //   const json = JSON.parse(str);
    //   return <div>{JSON.stringify(json)}</div>;
    // }

    case 'strikethrough':
    case 'delete':
      return (
        <Strikethrough className={classNames}>
          {node.children?.map(renderChild)}
        </Strikethrough>
      );

    default:
      if (debug) {
        console.log('Debugging node:', node);
      }
      if (typeof node === 'string') {
        return node;
      } else if (Array.isArray(node)) {
        return <>{node.map(renderChild)}</>;
      } else if (typeof node === 'object' && node !== null) {
        return (
          <div>
            {Object.keys(node).map((key) => (
              <div key={key}>
                <strong>{key}: </strong>
                {renderContentNode(node[key])}
              </div>
            ))}
          </div>
        );
      } else {
        return <span className="text-red-500">Unknown type: {node.type}</span>;
      }
  }
};
