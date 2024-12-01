import { markdownToMdast } from "./markdownToMdast";
import { mdastToSlate } from "./mdastToSlate";

export function markdownToSlate(markdown: string) {
  const mdastTree = markdownToMdast(markdown);
  return mdastToSlate(mdastTree);
}
