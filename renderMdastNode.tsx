import React from 'react';
import List from './blocks/List';
import ListItem from './blocks/ListItem';
import Paragraph from './blocks/Paragraph';
import Strong from './blocks/Strong';
import Link from './blocks/Link';
import Image from './blocks/Image';
import Blockquote from './blocks/Blockquote';
import Code from './blocks/Code';
import Heading from './blocks/Heading';
import Table from './blocks/Table';
import TableRow from './blocks/TableRow';
import TableCell from './blocks/TableCell';
import InlineCode from './blocks/InlineCode';


export const renderMdastNode = (node, index) => {
    switch (node.type) {
      case 'root':
        return <>{node.children.map((child, i) => renderMdastNode(child, i))}</>;
      case 'heading':
        return (
          <Heading key={index} level={node.depth}>
            {node.children.map((child, i) => renderMdastNode(child, i))}
          </Heading>
        );
      case 'text':
        return node.value;
      case 'list':
        return (
          <List key={index} ordered={node.ordered}>
            {node.children.map((child, i) => renderMdastNode(child, i))}
          </List>
        );
      case 'listItem':
        return (
          <ListItem key={index}>
            {node.children.map((child, i) => {
              if (child.type === 'paragraph') {
                return child.children.map((innerChild, innerIndex) => {
                  return renderMdastNode(innerChild, innerIndex);
                });
              }
              return renderMdastNode(child, i);
            })}
          </ListItem>
        );
      case 'paragraph':
        return (
          <Paragraph key={index}>
            {node.children.map((child, i) => renderMdastNode(child, i))}
          </Paragraph>
        );
      case 'strong':
        return (
          <Strong key={index}>
            {node.children.map((child, i) => renderMdastNode(child, i))}
          </Strong>
        );
      case 'link':
        return (
          <Link href={node.url} key={index}>
            {node.children.map((child, i) => renderMdastNode(child, i))}
          </Link>
        );
      case 'image':
        return <Image src={node.url} alt={node.alt} key={index} />;
      case 'blockquote':
        return (
          <Blockquote key={index}>
            {node.children.map((child, i) => renderMdastNode(child, i))}
          </Blockquote>
        );
      case 'code':
        return <Code language={node.lang} value={node.value} key={index} />;
      case 'table':
        return (
          <Table key={index}>
            {node.children.map((child, i) => renderMdastNode(child, i))}
          </Table>
        );
      case 'tableRow':
        return (
          <TableRow key={index}>
            {node.children.map((child, i) => renderMdastNode(child, i))}
          </TableRow>
        );
      case 'tableCell':
        return (
          <TableCell key={index}>
            {node.children.map((child, i) => renderMdastNode(child, i))}
          </TableCell>
        );
      case 'inlineCode':
        return <InlineCode value={node.value} key={index} />;
      default:
        return null;
    }
  };