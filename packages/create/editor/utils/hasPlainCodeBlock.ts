import { Descendant } from "slate";
import { Element as SlateElement } from "slate";
import { CodeBlockType } from "../types";

/**
 * 是否存在需要语法高亮的 code block：
 * - 节点类型为 code block
 * - 且 preview !== "true"
 */
export function hasPlainCodeBlock(nodes: Descendant[]): boolean {
  return nodes.some((node) => {
    if (!SlateElement.isElement(node)) return false;
    if (node.type === CodeBlockType) {
      return (node as any).preview !== "true";
    }
    const children = (node as any).children as Descendant[] | undefined;
    return Array.isArray(children) && hasPlainCodeBlock(children);
  });
}

/**
 * 收集需要高亮的 code block 所使用的语言（小写）。
 * 后续按需加载 Prism 语言包会用到。
 */
export function collectCodeBlockLanguages(nodes: Descendant[]): Set<string> {
  const langs = new Set<string>();
  const walk = (nodeList: Descendant[]) => {
    nodeList.forEach((node) => {
      if (!SlateElement.isElement(node)) return;
      if (node.type === CodeBlockType && (node as any).preview !== "true") {
        langs.add(((node as any).language || "plain").toLowerCase());
      }
      const children = (node as any).children as Descendant[] | undefined;
      if (Array.isArray(children)) walk(children);
    });
  };
  walk(nodes);
  return langs;
}
